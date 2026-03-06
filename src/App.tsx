import { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Dashboard } from './components/dashboard/Dashboard';
import { IndicatorsList } from './components/dashboard/IndicatorsList';
import { IndicatorForm } from './components/dashboard/IndicatorForm';
import { MasterIndicatorForm } from './components/dashboard/MasterIndicatorForm';
import { WelcomePage } from './components/landing/WelcomePage';
import { LoadingScreen } from './components/common/LoadingScreen';
import { LoginScreen } from './components/auth/LoginScreen';
import { UserManagement } from './components/admin/UserManagement';
import { VerifyDataList } from './components/admin/VerifyDataList';
import { NewsManagement } from './components/admin/NewsManagement';
import { NewsAnnouncement } from './components/common/NewsAnnouncement';
import { PrivacyPolicyModal } from './components/common/PrivacyPolicyModal';
import { Calendar } from './components/dashboard/Calendar';
import { PrivacySettings } from './components/settings/PrivacySettings';
import { Profile } from './components/settings/Profile';
import { Indicator, TIMEFRAMES, User } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './lib/supabase';
import Swal from 'sweetalert2';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'landing' | 'login' | 'app'>('landing');
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [fiscalYear, setFiscalYear] = useState('2569');
  const [timeframe, setTimeframe] = useState(TIMEFRAMES[0]); // Default to 'ภาพรวม (สะสม)'
  const [data, setData] = useState<Indicator[]>([]);
  const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(null);
  const [editingMasterIndicator, setEditingMasterIndicator] = useState<Indicator | null>(null);
  const [showNews, setShowNews] = useState(false);
  const [newsContent, setNewsContent] = useState<any>(null);
  const [hasAcknowledgedNews, setHasAcknowledgedNews] = useState(false);

  // Fetch data from Supabase
  const fetchData = async () => {
    try {
      const { data: indicators, error } = await supabase
        .from('indicators')
        .select('*')
        .eq('fiscal_year', fiscalYear)
        .order('order_num', { ascending: true });

      if (error) throw error;

      if (indicators && indicators.length > 0) {
        // Map DB fields to Frontend types
        const formattedData: Indicator[] = indicators.map(item => ({
          ...item,
          order: item.order_num,
          responsible_groups: item.responsible_group ? item.responsible_group.split(',').map((g: string) => g.trim()) : [],
        }));
        setData(formattedData);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถดึงข้อมูลจากฐานข้อมูลได้',
        confirmButtonColor: '#10b981'
      });
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch active news
  const fetchActiveNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        if (error.code === '42P01') {
          // Table doesn't exist, use fallback
          setNewsContent({
            title: 'ระบบ STN Health KPI เปิดให้ใช้งานแล้ว !',
            body: 'กรุณาเข้ามาประเมินตัวชี้วัด MOU ให้เสร็จ !\nระบบจะปิดให้บันทึก ในวันที่ 15 มีนาคม 2569\nหากมีปัญหาการใช้งาน ติดต่อกลุ่มงานสุขภาพดิจิทัล สำนักงานสาธารณสุขจังหวัดสตูลได้เลย',
            date: new Date().toISOString()
          });
          setShowNews(true);
          return;
        }
        throw error;
      }

      if (data && data.length > 0) {
        setNewsContent({
          title: data[0].title,
          body: data[0].body,
          date: data[0].created_at
        });
        setShowNews(true);
      } else {
        setHasAcknowledgedNews(true);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setHasAcknowledgedNews(true);
    }
  };

  useEffect(() => {
    if (view === 'app' && !hasAcknowledgedNews) {
      fetchActiveNews();
    }
  }, [hasAcknowledgedNews, view]);

  useEffect(() => {
    if (view === 'app') {
      setIsLoading(true);
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [fiscalYear, view]);

  // Auto-close sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    // Initial check
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSaveMasterIndicator = async (indicator: Indicator) => {
    try {
      Swal.fire({
        title: 'กำลังบันทึกข้อมูล...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const { order, responsible_groups, ...rest } = indicator;
      const dbData = {
        ...rest,
        responsible_group: responsible_groups && responsible_groups.length > 0 ? responsible_groups.join(',') : rest.responsible_group,
        order_num: String(order),
      };

      if (indicator.id) {
        const { error } = await supabase
          .from('indicators')
          .update(dbData)
          .eq('id', indicator.id);
        if (error) throw error;
      } else {
        const { id, ...insertData } = dbData;
        const { error } = await supabase
          .from('indicators')
          .insert([insertData]);
        if (error) throw error;
      }

      await fetchData();
      setEditingMasterIndicator(null);

      Swal.fire({
        icon: 'success',
        title: 'บันทึกสำเร็จ',
        text: 'ข้อมูลตัวชี้วัดถูกบันทึกเรียบร้อยแล้ว',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error saving master indicator:', error);
      Swal.fire({
        icon: 'error',
        title: 'บันทึกไม่สำเร็จ',
        text: 'เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล',
        confirmButtonColor: '#10b981'
      });
    }
  };

  const handleDeleteMaster = async (id: string) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ',
      text: "คุณต้องการลบตัวชี้วัดนี้ใช่หรือไม่? ข้อมูลผลงานทั้งหมดที่เกี่ยวข้องจะถูกลบด้วย",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'ลบข้อมูล',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: 'กำลังลบข้อมูล...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const { error } = await supabase
          .from('indicators')
          .delete()
          .eq('id', id);

        if (error) throw error;

        await fetchData();

        Swal.fire({
          icon: 'success',
          title: 'ลบสำเร็จ',
          text: 'ข้อมูลตัวชี้วัดถูกลบเรียบร้อยแล้ว',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error deleting indicator:', error);
        Swal.fire({
          icon: 'error',
          title: 'ลบไม่สำเร็จ',
          text: 'เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล',
          confirmButtonColor: '#10b981'
        });
      }
    }
  };

  const handleSaveIndicator = async (updatedIndicator: Indicator) => {
    try {
      // Find the area that was updated to add history
      const currentIndicator = data.find(i => i.id === updatedIndicator.id);
      if (currentIndicator) {
        Object.keys(updatedIndicator.results[timeframe] || {}).forEach(area => {
          const newResult = updatedIndicator.results[timeframe][area];
          const oldResult = currentIndicator.results[timeframe]?.[area];
          
          if (!oldResult || oldResult.result_percentage !== newResult.result_percentage || oldResult.status !== newResult.status) {
            const historyEntry = {
              status: newResult.status,
              timestamp: new Date().toISOString(),
              user: user?.username || 'Unknown',
              score: newResult.score,
              result_percentage: newResult.result_percentage
            };
            newResult.history = [...(newResult.history || []), historyEntry];
          }
        });
      }

      // Show loading state
      Swal.fire({
        title: 'กำลังบันทึกข้อมูล...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Prepare data for DB (map order back to order_num)
      const { order, ...rest } = updatedIndicator;
      const dbData = {
        ...rest,
        order_num: String(order),
      };

      const { error } = await supabase
        .from('indicators')
        .update(dbData)
        .eq('id', updatedIndicator.id);

      if (error) throw error;

      // Update local state
      setData(prevData => 
        prevData.map(item => item.id === updatedIndicator.id ? updatedIndicator : item)
      );

      Swal.fire({
        icon: 'success',
        title: user?.role === 'admin' ? 'บันทึกสำเร็จ' : 'ส่งข้อมูลสำเร็จ! ✅',
        text: user?.role === 'admin' ? 'อัปเดตข้อมูลตัวชี้วัดเรียบร้อยแล้ว' : 'ข้อมูลถูกส่งไปยังผู้ดูแลระบบเพื่อรอการยืนยันแล้ว',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error updating indicator:', error);
      Swal.fire({
        icon: 'error',
        title: 'บันทึกไม่สำเร็จ',
        text: 'เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล',
        confirmButtonColor: '#10b981'
      });
    }
  };

  const handleEnterApp = (tab: string) => {
    setActiveTab(tab);
    if (user) {
      setView('app');
    } else {
      setView('login');
    }
  };

  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    
    // Check privacy policy acceptance
    const acceptedPrivacy = localStorage.getItem(`privacy_accepted_${loggedInUser.id}`);
    if (!acceptedPrivacy) {
      setShowPrivacyPolicy(true);
    } else {
      setView('app');
    }
  };

  const handleAcceptPrivacy = () => {
    if (user) {
      localStorage.setItem(`privacy_accepted_${user.id}`, 'true');
      setShowPrivacyPolicy(false);
      setView('app');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('landing');
  };

  const handleVerifyIndicator = async (indicator: Indicator, area: string, status: 'ผ่าน' | 'ไม่ผ่าน' | 'รอประเมิน' | 'รอยืนยัน' | 'แก้ไข', feedback?: string) => {
    try {
      const updatedIndicator = { ...indicator };
      if (updatedIndicator.results[timeframe] && updatedIndicator.results[timeframe][area]) {
        updatedIndicator.results[timeframe][area].status = status;
        if (feedback !== undefined) {
          updatedIndicator.results[timeframe][area].feedback = feedback;
        } else {
          delete updatedIndicator.results[timeframe][area].feedback;
        }
        
        const historyEntry = {
          status: status,
          timestamp: new Date().toISOString(),
          user: user?.username || 'Admin',
          feedback: feedback,
          score: updatedIndicator.results[timeframe][area].score,
          result_percentage: updatedIndicator.results[timeframe][area].result_percentage
        };
        updatedIndicator.results[timeframe][area].history = [
          ...(updatedIndicator.results[timeframe][area].history || []),
          historyEntry
        ];
      }

      const { error } = await supabase
        .from('indicators')
        .update({ results: updatedIndicator.results })
        .eq('id', indicator.id);

      if (error) throw error;

      setData(prev => prev.map(item => item.id === indicator.id ? updatedIndicator : item));
    } catch (error) {
      console.error('Error verifying indicator:', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถยืนยันข้อมูลได้',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    }
  };

  const pendingCount = data.reduce((count, item) => {
    let pending = 0;
    
    // If user is 'กลุ่มงาน สสจ.', only count their assigned indicators
    if (user?.role === 'กลุ่มงาน สสจ.' && item.responsible_group !== user.unit && !item.responsible_groups?.includes(user.unit)) {
      return count;
    }

    if (item.results[timeframe]) {
      Object.values(item.results[timeframe]).forEach((res: any) => {
        if (res.status === 'รอยืนยัน') pending++;
      });
    }
    return count + pending;
  }, 0);

  const notifications = useMemo(() => {
    const notifs: any[] = [];
    if (user?.role === 'admin' || user?.role === 'กลุ่มงาน สสจ.') {
      if (pendingCount > 0) {
        notifs.push({
          id: 'pending',
          title: 'รอการยืนยัน',
          message: `มีข้อมูลรอการยืนยัน ${pendingCount} รายการ`,
          time: 'เพิ่งกระทำ',
          type: 'info',
          action: () => setActiveTab('verify')
        });
      }
    } else if (user?.role === 'user') {
      let rejectedCount = 0;
      data.forEach(item => {
        if (item.results[timeframe] && item.results[timeframe][user.unit]?.status === 'แก้ไข') {
          rejectedCount++;
        }
      });
      if (rejectedCount > 0) {
        notifs.push({
          id: 'rejected',
          title: 'ส่งกลับแก้ไข',
          message: `มีข้อมูลถูกส่งกลับให้แก้ไข ${rejectedCount} รายการ`,
          time: 'เพิ่งกระทำ',
          type: 'warning',
          action: () => setActiveTab('indicators')
        });
      }
    }

    // Deadline notification
    const deadline = new Date('2026-03-15');
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0 && diffDays <= 15) {
      notifs.push({
        id: 'deadline',
        title: 'แจ้งเตือนกำหนดส่ง',
        message: `เหลือเวลาอีก ${diffDays} วัน จะปิดระบบรับข้อมูล`,
        time: 'วันนี้',
        type: 'deadline',
        action: () => setActiveTab('calendar')
      });
    }

    return notifs;
  }, [data, timeframe, user, pendingCount]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (view === 'landing') {
    return (
      <>
        <WelcomePage onEnterApp={handleEnterApp} />
      </>
    );
  }

  if (view === 'login') {
    return (
      <>
        <LoginScreen 
          onLogin={handleLogin} 
          onGoHome={() => setView('landing')}
        />
        <AnimatePresence>
          {showPrivacyPolicy && (
            <PrivacyPolicyModal onAccept={handleAcceptPrivacy} />
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50/50 font-sans text-slate-900 selection:bg-emerald-200 selection:text-emerald-900">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onGoHome={() => setView('landing')}
        user={user}
        onLogout={handleLogout}
      />
      
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Header 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen} 
          fiscalYear={fiscalYear}
          setFiscalYear={setFiscalYear}
          timeframe={timeframe}
          setTimeframe={setTimeframe}
          user={user}
          notifications={notifications}
        />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <AnimatePresence>
            {showNews && newsContent && (
              <NewsAnnouncement 
                content={newsContent} 
                onAcknowledge={() => {
                  setShowNews(false);
                  setHasAcknowledgedNews(true);
                }} 
              />
            )}
          </AnimatePresence>

          {/* Pending Verification Alert for Admins */}
          {user?.role === 'admin' && pendingCount > 0 && activeTab !== 'indicators' && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-start sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-xl">🔔</span>
                </div>
                <div>
                  <h4 className="font-bold text-indigo-900">มีข้อมูลรอการยืนยัน {pendingCount} รายการ</h4>
                  <p className="text-sm text-indigo-700 mt-0.5">กรุณาตรวจสอบและยืนยันข้อมูลเพื่อให้แสดงผลในแดชบอร์ด</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('verify')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors whitespace-nowrap shadow-sm shadow-indigo-600/20"
              >
                ตรวจสอบข้อมูล
              </button>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Dashboard data={data} fiscalYear={fiscalYear} timeframe={timeframe} />
              </motion.div>
            )}
            
            {activeTab === 'indicators' && !editingIndicator && !editingMasterIndicator && (
              <motion.div
                key="indicators"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <IndicatorsList 
                  data={data} 
                  fiscalYear={fiscalYear} 
                  timeframe={timeframe}
                  onEdit={setEditingIndicator} 
                  onVerify={handleVerifyIndicator}
                  onAddMaster={() => setEditingMasterIndicator({ id: '', name: '', order: data.length + 1, target_criteria: '', weight: 1, responsible_group: '', responsible_groups: [], fiscal_year: fiscalYear, results: {}, score_criteria: { "1": "", "2": "", "3": "", "4": "", "5": "" }, max_score: 5 })}
                  onEditMaster={setEditingMasterIndicator}
                  onDeleteMaster={handleDeleteMaster}
                  user={user}
                />
              </motion.div>
            )}

            {activeTab === 'indicators' && editingIndicator && !editingMasterIndicator && (
              <motion.div
                key="indicator-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <IndicatorForm 
                  indicator={editingIndicator} 
                  timeframe={timeframe}
                  onClose={() => setEditingIndicator(null)} 
                  onSave={handleSaveIndicator} 
                  user={user}
                />
              </motion.div>
            )}

            {activeTab === 'indicators' && editingMasterIndicator && (
              <motion.div
                key="master-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <MasterIndicatorForm 
                  indicator={editingMasterIndicator} 
                  onClose={() => setEditingMasterIndicator(null)} 
                  onSave={handleSaveMasterIndicator} 
                />
              </motion.div>
            )}

            {activeTab === 'verify' && (user?.role === 'admin' || user?.role === 'กลุ่มงาน สสจ.') && (
              <motion.div
                key="verify"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <VerifyDataList 
                  data={data} 
                  timeframe={timeframe}
                  onVerify={handleVerifyIndicator}
                  user={user}
                />
              </motion.div>
            )}

            {activeTab === 'users' && user?.role === 'admin' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <UserManagement />
              </motion.div>
            )}

            {activeTab === 'news' && user?.role === 'admin' && (
              <motion.div
                key="news"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <NewsManagement />
              </motion.div>
            )}

            {activeTab === 'calendar' && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Calendar />
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Profile 
                  user={user}
                  onNavigateToSettings={() => setActiveTab('settings')}
                />
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <PrivacySettings />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}
