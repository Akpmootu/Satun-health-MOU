import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Target, 
  Search, 
  TrendingUp, 
  ArrowRight, 
  Lock, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Calendar,
  FileText,
  Activity
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { User, Indicator } from '../../types';
import { useMemo } from 'react';

interface DashboardProps {
  user: User | null;
  indicators: Indicator[];
  onSelectModule: (moduleId: string) => void;
  timeframe: string;
}

export function Dashboard({ user, indicators, onSelectModule, timeframe }: DashboardProps) {
  // Calculate some overview stats for the dashboard
  const stats = useMemo(() => {
    const currentResults = indicators.map(ind => ind.results[timeframe]?.['จังหวัด']).filter(Boolean);
    const total = currentResults.length;
    const passed = currentResults.filter(r => r?.status === 'ผ่าน').length;
    const completion = indicators.length > 0 ? Math.round((currentResults.length / indicators.length) * 100) : 0;
    
    return { total, passed, completion };
  }, [indicators, timeframe]);

  const modules = [
    {
      id: 'mou',
      title: 'ตัวชี้วัด MOU',
      description: 'ระบบติดตามและประเมินผลตัวชี้วัดตามคำรับรองการปฏิบัติราชการ (MOU) รายปีงบประมาณ',
      icon: Target,
      color: 'emerald',
      status: 'available',
      stats: `${stats.passed}/${stats.total} ผ่านเกณฑ์`,
      progress: stats.completion
    },
    {
      id: 'inspection',
      title: 'ตัวชี้วัดตรวจราชการ',
      description: 'ระบบรายงานผลการดำเนินงานตามประเด็นตรวจราชการและนิเทศงาน กระทรวงสาธารณสุข',
      icon: Search,
      color: 'indigo',
      status: 'development',
      stats: 'รอเปิดใช้งาน',
      progress: 0
    },
    {
      id: 'strategic',
      title: 'ตัวชี้วัดแผนยุทธศาสตร์',
      description: 'ระบบติดตามความก้าวหน้าโครงการและตัวชี้วัดตามแผนยุทธศาสตร์สุขภาพจังหวัด',
      icon: TrendingUp,
      color: 'amber',
      status: 'development',
      stats: 'รอเปิดใช้งาน',
      progress: 0
    }
  ];

  const todoItems = [
    { id: 1, title: 'บันทึกข้อมูล MOU ไตรมาส 2', deadline: '15 มี.ค. 69', priority: 'high' },
    { id: 2, title: 'ตรวจสอบความถูกต้องตัวชี้วัดที่ 1.2', deadline: '20 มี.ค. 69', priority: 'medium' },
    { id: 3, title: 'แนบไฟล์หลักฐานตัวชี้วัดที่ 4.1', deadline: '25 มี.ค. 69', priority: 'low' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-slate-800 tracking-tight"
          >
            สวัสดีคุณ, <span className="text-emerald-600">{user?.username || 'ผู้ใช้งาน'}</span> 👋
          </motion.h1>
          <p className="text-slate-500 mt-1">ยินดีต้อนรับสู่ระบบ STN Health KPI Dashboard | {user?.unit}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2">
            <Calendar size={18} className="text-emerald-500" />
            <span className="text-sm font-bold text-slate-700">รอบ: {timeframe}</span>
          </div>
        </div>
      </div>

      {/* Overview Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 size={20} />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ตัวชี้วัดที่ผ่าน</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-800">{stats.passed}</h3>
            <span className="text-slate-400 text-sm">/ {stats.total}</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Activity size={20} />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ความก้าวหน้าการบันทึก</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-800">{stats.completion}%</h3>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden ml-2">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${stats.completion}%` }}></div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock size={20} />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">วันคงเหลือบันทึกผล</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-800">12</h3>
            <span className="text-slate-400 text-sm">วัน</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <AlertCircle size={20} />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ต้องแก้ไข/เฝ้าระวัง</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-800">3</h3>
            <span className="text-slate-400 text-sm">รายการ</span>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Module Cards */}
        <div className="lg:col-span-8 space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <LayoutDashboard size={24} className="text-indigo-600" />
            โมดูลระบบงาน
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map((mod, idx) => {
              const Icon = mod.icon;
              const isAvailable = mod.status === 'available';
              
              return (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className={cn(
                    "group relative bg-white rounded-[2rem] p-8 border transition-all duration-300 overflow-hidden",
                    isAvailable 
                      ? "border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1" 
                      : "border-slate-50 opacity-75 grayscale-[0.5]"
                  )}
                >
                  {/* Background Decoration */}
                  <div className={cn(
                    "absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-[0.03] transition-transform duration-500 group-hover:scale-150",
                    mod.color === 'emerald' ? "bg-emerald-600" : mod.color === 'indigo' ? "bg-indigo-600" : "bg-amber-600"
                  )} />

                  <div className="relative z-10 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:rotate-6",
                        mod.color === 'emerald' ? "bg-emerald-500 text-white shadow-emerald-200" : 
                        mod.color === 'indigo' ? "bg-indigo-500 text-white shadow-indigo-200" : 
                        "bg-amber-500 text-white shadow-amber-200"
                      )}>
                        <Icon size={28} />
                      </div>
                      {!isAvailable && (
                        <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-slate-200">
                          Under Development
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">{mod.title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                        {mod.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">สถานะปัจจุบัน</span>
                        <span className={cn(
                          "text-sm font-bold",
                          isAvailable ? "text-emerald-600" : "text-slate-500"
                        )}>{mod.stats}</span>
                      </div>
                      <button
                        disabled={!isAvailable}
                        onClick={() => onSelectModule(mod.id)}
                        className={cn(
                          "flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all",
                          isAvailable 
                            ? "bg-slate-900 text-white hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-200" 
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        )}
                      >
                        {isAvailable ? 'Access Module' : <Lock size={16} />}
                        {isAvailable && <ArrowRight size={16} />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Info / To-Do */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-emerald-600" />
              รายการที่ต้องทำ (To-Do)
            </h3>
            <div className="space-y-3">
              {todoItems.map((item) => (
                <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-colors group cursor-pointer">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">{item.title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock size={12} className="text-slate-400" />
                        <span className="text-[10px] font-medium text-slate-500">กำหนดส่ง: {item.deadline}</span>
                      </div>
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                      item.priority === 'high' ? "bg-rose-100 text-rose-600" : 
                      item.priority === 'medium' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                    )}>
                      {item.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-3 text-sm font-bold text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-colors">
              ดูรายการทั้งหมด
            </button>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-lg shadow-emerald-200 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">ต้องการความช่วยเหลือ?</h3>
              <p className="text-emerald-50 text-sm opacity-90 leading-relaxed mb-6">
                หากคุณมีข้อสงสัยเกี่ยวกับการใช้งานระบบ หรือพบปัญหาในการบันทึกข้อมูล สามารถติดต่อทีมงาน IT ได้ทันที
              </p>
              <button className="bg-white text-emerald-700 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors shadow-md">
                ติดต่อเจ้าหน้าที่
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Activity size={120} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
