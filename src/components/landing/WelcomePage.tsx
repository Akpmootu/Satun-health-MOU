import { motion } from 'motion/react';
import { Logo } from '../common/Logo';
import { Briefcase, BarChart2, Edit2, ArrowRight, ShieldCheck, Activity, Users, Lock, Target, Map } from 'lucide-react';
import { cn } from '../../lib/utils';

interface WelcomePageProps {
  onEnterApp: (tab: string) => void;
}

export function WelcomePage({ onEnterApp }: WelcomePageProps) {
  const cards = [
    {
      id: 'mou',
      title: 'ตัวชี้วัด MOU',
      description: 'ระบบติดตามและประเมินผลตัวชี้วัดคำรับรองการปฏิบัติราชการ (MOU) ระดับ คปสอ.',
      icon: Target,
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      locked: false
    },
    {
      id: 'inspection',
      title: 'ตัวชี้วัด การตรวจราชการ',
      description: 'ระบบติดตามผลการดำเนินงานตามประเด็นการตรวจราชการกระทรวงสาธารณสุข',
      icon: ShieldCheck,
      color: 'bg-slate-400',
      lightColor: 'bg-slate-50',
      textColor: 'text-slate-400',
      locked: true
    },
    {
      id: 'strategy',
      title: 'ตัวชี้วัดแผนยุทธศาสตร์',
      description: 'ระบบติดตามความก้าวหน้าตามแผนยุทธศาสตร์ด้านสุขภาพจังหวัดสตูล',
      icon: Map,
      color: 'bg-slate-400',
      lightColor: 'bg-slate-50',
      textColor: 'text-slate-400',
      locked: true
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-emerald-600/10 to-transparent -z-10" />
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl -z-10" />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <Logo />
        <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
          <Activity size={16} className="text-emerald-500" />
          ระบบสารสนเทศเพื่อการบริหาร
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 flex flex-col justify-center">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-6 border border-emerald-200">
              ปีงบประมาณ 2569
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 tracking-tight leading-tight mb-6">
              ระบบสนับสนุนการติดตาม<br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                ตัวชี้วัดการดำเนินงาน
              </span>
            </h1>
            <h2 className="text-xl md:text-2xl font-medium text-slate-600 mb-8">
              สำนักงานสาธารณสุขจังหวัดสตูล
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
              ระบบสารสนเทศสำหรับติดตาม ประเมินผล และวิเคราะห์ข้อมูลตัวชี้วัดด้านสาธารณสุข 
              เพื่อยกระดับคุณภาพบริการและสุขภาวะของประชาชนในจังหวัดสตูล
            </p>
          </motion.div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                onClick={() => !card.locked && onEnterApp('executive')} // Always enter app on MOU for now
                disabled={card.locked}
                className={cn(
                  "group bg-white rounded-3xl p-8 text-left shadow-sm border border-slate-100 flex flex-col h-full relative overflow-hidden transition-all duration-300",
                  card.locked ? "opacity-75 cursor-not-allowed" : "hover:shadow-xl hover:border-emerald-200 cursor-pointer"
                )}
              >
                {!card.locked && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-slate-50 to-transparent -z-10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
                
                <div className="flex justify-between items-start mb-6">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform", card.lightColor, !card.locked && "group-hover:scale-110")}>
                    <Icon size={28} className={card.textColor} />
                  </div>
                  {card.locked && (
                    <div className="bg-slate-100 text-slate-500 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                      <Lock size={12} />
                      Coming Soon
                    </div>
                  )}
                </div>
                
                <h3 className={cn("text-xl font-bold mb-3 transition-colors", card.locked ? "text-slate-600" : "text-slate-800 group-hover:text-emerald-600")}>
                  {card.title}
                </h3>
                
                <p className="text-slate-500 leading-relaxed mb-8 flex-1">
                  {card.description}
                </p>
                
                <div className={cn(
                  "flex items-center gap-2 text-sm font-semibold mt-auto transition-colors",
                  card.locked ? "text-slate-400" : "text-emerald-600"
                )}>
                  {card.locked ? (
                    <span>กำลังพัฒนา...</span>
                  ) : (
                    <>
                      <span>เข้าสู่ระบบ</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Quick Stats */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-20 flex flex-wrap justify-center gap-8 text-center border-t border-slate-200 pt-10"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
              <Activity size={20} className="text-emerald-600" />
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold text-slate-800">16</p>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">ตัวชี้วัดหลัก</p>
            </div>
          </div>
          <div className="w-px h-10 bg-slate-200 hidden sm:block"></div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Users size={20} className="text-blue-600" />
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold text-slate-800">7</p>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">คปสอ. พื้นที่</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
