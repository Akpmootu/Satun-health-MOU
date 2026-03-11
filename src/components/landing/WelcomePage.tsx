import { motion } from 'motion/react';
import { Logo } from '../common/Logo';
import { 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  Users, 
  Lock, 
  Target, 
  Map, 
  Home, 
  Info, 
  LogIn,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface WelcomePageProps {
  onEnterApp: (tab: string) => void;
  indicatorCount: number;
}

export function WelcomePage({ onEnterApp, indicatorCount }: WelcomePageProps) {
  const modules = [
    {
      id: 'mou',
      title: 'ตัวชี้วัด MOU',
      description: 'ระบบติดตามและประเมินผลตัวชี้วัดคำรับรองการปฏิบัติราชการ (MOU) ระดับ คปสอ. ประจำปีงบประมาณ',
      icon: Target,
      color: 'emerald',
      status: 'available'
    },
    {
      id: 'inspection',
      title: 'รายงานการตรวจราชการ',
      description: 'ระบบรายงานผลการดำเนินงานตามประเด็นการตรวจราชการและนิเทศงาน กระทรวงสาธารณสุข',
      icon: ShieldCheck,
      color: 'indigo',
      status: 'development'
    },
    {
      id: 'strategy',
      title: 'แผนยุทธศาสตร์สุขภาพ',
      description: 'ระบบติดตามความก้าวหน้าตามแผนยุทธศาสตร์ด้านสุขภาพจังหวัดสตูล และโครงการสำคัญ',
      icon: Map,
      color: 'amber',
      status: 'development'
    }
  ];

  const navLinks = [
    { name: 'หน้าแรก', icon: Home, href: '#' },
    { name: 'เกี่ยวกับระบบ', icon: Info, href: '#' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#ecfdf5,transparent)]" />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-emerald-100/50 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-[10%] -left-[10%] w-[60%] h-[60%] bg-teal-50/50 rounded-full blur-[120px]" 
        />
      </div>

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-8">
              <Logo />
              <div className="hidden md:flex items-center gap-6">
                {navLinks.map((link) => (
                  <a 
                    key={link.name} 
                    href={link.href}
                    className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
                  >
                    <link.icon size={16} />
                    {link.name}
                  </a>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => onEnterApp('dashboard')}
                className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-full font-bold text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-95"
              >
                <LogIn size={18} />
                เข้าสู่ระบบ
              </button>
              <button className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                <Activity size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest mb-8">
                  <Activity size={14} />
                  ปีงบประมาณ 2569
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-8">
                  STN Health <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">KPI System</span>
                </h1>
                <p className="text-xl md:text-2xl font-medium text-slate-600 mb-10 leading-relaxed">
                  ระบบบริหารจัดการและติดตามตัวชี้วัดผลการดำเนินงาน<br className="hidden md:block" />
                  สำนักงานสาธารณสุขจังหวัดสตูล
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button 
                    onClick={() => onEnterApp('dashboard')}
                    className="w-full sm:w-auto px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-emerald-600 shadow-xl shadow-slate-200 hover:shadow-emerald-200 transition-all flex items-center justify-center gap-3 group"
                  >
                    เริ่มต้นใช้งานระบบ
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={() => window.open('https://example.com/manual.pdf', '_blank')}
                    className="w-full sm:w-auto px-10 py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
                  >
                    คู่มือการใช้งาน
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Stats Cards */}
            <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 group hover:shadow-md transition-all"
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <BarChart3 size={32} />
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-900">{indicatorCount || '16'}</p>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">ตัวชี้วัดหลัก (Key Indicators)</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 group hover:shadow-md transition-all"
              >
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Users size={32} />
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-900">7</p>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">คปสอ. พื้นที่ (Regional Centers)</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-widest mb-6">
                  <Info size={12} />
                  เกี่ยวกับระบบ
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-8 leading-tight">
                  ยกระดับการบริหารจัดการ<br />
                  ด้วยข้อมูลตัวชี้วัดที่ <span className="text-emerald-600">แม่นยำ</span>
                </h2>
                <div className="space-y-6 text-slate-600 leading-relaxed">
                  <p>
                    ระบบ STN Health KPI พัฒนาขึ้นโดยกลุ่มงานสุขภาพดิจิทัล สำนักงานสาธารณสุขจังหวัดสตูล 
                    เพื่อเป็นเครื่องมือกลางในการติดตามและประเมินผลการดำเนินงานตามตัวชี้วัดสำคัญในระดับจังหวัดและระดับพื้นที่
                  </p>
                  <p>
                    เรามุ่งเน้นการเปลี่ยนผ่านสู่ระบบดิจิทัล (Digital Transformation) เพื่อให้การรายงานผลมีความรวดเร็ว 
                    ลดความซ้ำซ้อนของข้อมูล และช่วยให้ผู้บริหารสามารถตัดสินใจบนพื้นฐานของข้อมูล (Data-Driven Decision Making) 
                    ได้อย่างมีประสิทธิภาพ
                  </p>
                </div>
                <div className="mt-10 grid grid-cols-2 gap-6">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-sm font-bold text-slate-900 mb-1">ความโปร่งใส</p>
                    <p className="text-xs text-slate-500">ตรวจสอบผลการดำเนินงานได้แบบ Real-time ทุกระดับ</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-sm font-bold text-slate-900 mb-1">ความน่าเชื่อถือ</p>
                    <p className="text-xs text-slate-500">ระบบฐานข้อมูลที่มั่นคงและมีการตรวจสอบความถูกต้อง</p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-emerald-100 to-teal-50 overflow-hidden border-8 border-white shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1000" 
                    alt="Healthcare Data"
                    className="w-full h-full object-cover mix-blend-multiply opacity-60"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 flex items-center justify-center p-12">
                    <div className="w-full h-full border-2 border-dashed border-emerald-200 rounded-[2rem] flex flex-col items-center justify-center text-center">
                      <Activity size={64} className="text-emerald-600 mb-6" />
                      <p className="text-xl font-bold text-emerald-900">STN Health KPI</p>
                      <p className="text-sm text-emerald-700">สำนักงานสาธารณสุขจังหวัดสตูล</p>
                    </div>
                  </div>
                </div>
                {/* Floating Badge */}
                <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">ระบบมีความปลอดภัย</p>
                      <p className="text-xs text-slate-500">SSL Encrypted Data</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Modules Section */}
        <section className="py-24 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">โมดูลการทำงานหลัก</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">เลือกเข้าใช้งานโมดูลที่ต้องการเพื่อติดตามผลการดำเนินงานและบันทึกข้อมูล</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {modules.map((mod, idx) => {
                const Icon = mod.icon;
                const isAvailable = mod.status === 'available';

                return (
                  <motion.div
                    key={mod.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * idx }}
                    className={cn(
                      "group bg-white rounded-[2.5rem] p-10 border transition-all duration-500 flex flex-col h-full relative overflow-hidden",
                      isAvailable 
                        ? "border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2" 
                        : "border-slate-50 opacity-80"
                    )}
                  >
                    {/* Background Decoration */}
                    <div className={cn(
                      "absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-[0.03] transition-transform duration-700 group-hover:scale-150",
                      mod.color === 'emerald' ? "bg-emerald-600" : mod.color === 'indigo' ? "bg-indigo-600" : "bg-amber-600"
                    )} />

                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-8">
                        <div className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 group-hover:rotate-6",
                          mod.color === 'emerald' ? "bg-emerald-500 text-white shadow-emerald-200" : 
                          mod.color === 'indigo' ? "bg-indigo-500 text-white shadow-indigo-200" : 
                          "bg-amber-500 text-white shadow-amber-200"
                        )}>
                          <Icon size={32} />
                        </div>
                        {!isAvailable && (
                          <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-slate-200">
                            Under Development
                          </span>
                        )}
                      </div>

                      <h3 className="text-2xl font-bold text-slate-900 mb-4">{mod.title}</h3>
                      <p className="text-slate-500 leading-relaxed mb-10 flex-1">
                        {mod.description}
                      </p>

                      <button
                        disabled={!isAvailable}
                        onClick={() => onEnterApp('dashboard')}
                        className={cn(
                          "w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all",
                          isAvailable 
                            ? "bg-slate-900 text-white hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-200" 
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        )}
                      >
                        {isAvailable ? (
                          <>
                            เข้าใช้งานโมดูล
                            <ChevronRight size={18} />
                          </>
                        ) : (
                          <>
                            <Lock size={16} />
                            ยังไม่เปิดใช้งาน
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer Credit */}
      <footer className="py-12 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 text-slate-400 mb-4">
            <Activity size={20} />
            <span className="font-bold text-slate-600">STN Health KPI</span>
          </div>
          <p className="text-sm text-slate-400">
            พัฒนาโดย IT SSJ Satun 2569 <span className="mx-2">|</span> 
            <i className="fa-solid fa-code mr-1"></i> Full Stack Development
          </p>
        </div>
      </footer>
    </div>
  );
}
