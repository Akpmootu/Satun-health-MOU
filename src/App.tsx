import { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ExecutiveSummary } from './components/dashboard/ExecutiveSummary';
import { Dashboard } from './components/dashboard/Dashboard';
import { IndicatorsList } from './components/dashboard/IndicatorsList';
import { IndicatorForm } from './components/dashboard/IndicatorForm';
import { WelcomePage } from './components/landing/WelcomePage';
import { LoadingScreen } from './components/common/LoadingScreen';
import { MOCK_DATA } from './data/mockData';
import { Indicator, TIMEFRAMES } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './lib/supabase';
import Swal from 'sweetalert2';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'landing' | 'app'>('landing');
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('executive');
  const [fiscalYear, setFiscalYear] = useState('2569');
  const [timeframe, setTimeframe] = useState(TIMEFRAMES[0]); // Default to 'ภาพรวม (สะสม)'
  const [data, setData] = useState<Indicator[]>([]);
  const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(null);

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
        }));
        setData(formattedData);
      } else {
        // If empty, we can optionally seed it with MOCK_DATA for the current fiscal year
        // For now, let's just set it to empty or seed it if it's the first time
        if (fiscalYear === '2569') {
          await seedInitialData();
        } else {
          setData([]);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถดึงข้อมูลจากฐานข้อมูลได้',
        confirmButtonColor: '#10b981'
      });
      // Fallback to mock data on error just so the app doesn't break
      setData(MOCK_DATA.filter(item => item.fiscal_year === fiscalYear));
    } finally {
      setIsLoading(false);
    }
  };

  // Seed initial data if table is empty
  const seedInitialData = async () => {
    try {
      const seedData = MOCK_DATA.map(item => {
        const { id, order, ...rest } = item; // Remove id so Supabase generates UUID
        return {
          ...rest,
          order_num: String(order),
        };
      });

      const { error } = await supabase
        .from('indicators')
        .insert(seedData);

      if (error) throw error;
      
      // Fetch again after seeding
      const { data: newIndicators } = await supabase
        .from('indicators')
        .select('*')
        .eq('fiscal_year', '2569')
        .order('order_num', { ascending: true });
        
      if (newIndicators) {
        setData(newIndicators.map(item => ({ ...item, order: item.order_num })));
      }
    } catch (error) {
      console.error('Error seeding data:', error);
      setData(MOCK_DATA); // Fallback
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchData();
  }, [fiscalYear]);

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

  const handleSaveIndicator = async (updatedIndicator: Indicator) => {
    try {
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
        title: 'บันทึกสำเร็จ',
        text: 'อัปเดตข้อมูลตัวชี้วัดเรียบร้อยแล้ว',
        timer: 1500,
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
    setView('app');
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (view === 'landing') {
    return <WelcomePage onEnterApp={handleEnterApp} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50/50 font-sans text-slate-900 selection:bg-emerald-200 selection:text-emerald-900">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onGoHome={() => setView('landing')}
      />
      
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Header 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen} 
          fiscalYear={fiscalYear}
          setFiscalYear={setFiscalYear}
          timeframe={timeframe}
          setTimeframe={setTimeframe}
        />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            {activeTab === 'executive' && (
              <motion.div
                key="executive"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ExecutiveSummary data={data} fiscalYear={fiscalYear} timeframe={timeframe} />
              </motion.div>
            )}

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
            
            {activeTab === 'indicators' && (
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
                />
              </motion.div>
            )}

            {(activeTab === 'reports' || activeTab === 'settings') && (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center justify-center h-[60vh] text-slate-400"
              >
                <div className="w-24 h-24 mb-6 rounded-full bg-slate-100 flex items-center justify-center">
                  <span className="text-4xl">🚧</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-700 mb-2">กำลังพัฒนาระบบ</h2>
                <p>เมนูนี้อยู่ระหว่างการพัฒนา จะเปิดให้ใช้งานเร็วๆ นี้</p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        
        <Footer />
      </div>

      {/* Modals */}
      {editingIndicator && (
        <IndicatorForm 
          indicator={editingIndicator} 
          timeframe={timeframe}
          onClose={() => setEditingIndicator(null)} 
          onSave={handleSaveIndicator} 
        />
      )}
    </div>
  );
}
