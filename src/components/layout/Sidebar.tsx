import { Menu, X, Home, BarChart2, FileText, Settings, LogOut, Briefcase } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onGoHome: () => void;
}

export function Sidebar({ isOpen, setIsOpen, activeTab, setActiveTab, onGoHome }: SidebarProps) {
  const menuItems = [
    { id: 'executive', label: 'ผู้บริหาร (Executive)', icon: Briefcase },
    { id: 'dashboard', label: 'ภาพรวม (Dashboard)', icon: Home },
    { id: 'indicators', label: 'ตัวชี้วัด MOU', icon: BarChart2 },
    { id: 'reports', label: 'รายงานผล', icon: FileText },
    { id: 'settings', label: 'ตั้งค่าระบบ', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isOpen ? 280 : 80 }}
        className={cn(
          "fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-slate-200 z-50 flex flex-col transition-all duration-300 shadow-xl lg:shadow-none",
          !isOpen && "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between h-20 px-4 border-b border-slate-100">
          <div className={cn("flex items-center gap-3 overflow-hidden", !isOpen && "lg:justify-center")}>
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 shrink-0">
              <rect width="40" height="40" rx="10" fill="url(#logo-grad-sidebar)" />
              <path d="M12 20L18 26L28 14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="logo-grad-sidebar" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#10b981" />
                  <stop offset="1" stopColor="#0d9488" />
                </linearGradient>
              </defs>
            </svg>
            {isOpen && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="flex flex-col whitespace-nowrap"
              >
                <span className="font-bold text-slate-800 text-sm leading-tight">STN Health <span className="text-emerald-600">KPI</span></span>
              </motion.div>
            )}
          </div>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto">
          {/* Home Button */}
          <button
            onClick={onGoHome}
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 mb-4",
              "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
              !isOpen && "lg:justify-center"
            )}
            title="หน้าแรก"
          >
            <Home size={20} className="shrink-0" />
            {isOpen && <span className="font-medium whitespace-nowrap">หน้าแรก</span>}
          </button>

          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">
            {isOpen ? 'เมนูหลัก' : 'เมนู'}
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                  isActive 
                    ? "bg-emerald-50 text-emerald-700" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  !isOpen && "lg:justify-center"
                )}
                aria-label={item.label}
              >
                <Icon size={20} className={cn("shrink-0", isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600")} />
                {isOpen && (
                  <span className="font-medium whitespace-nowrap">{item.label}</span>
                )}
                
                {/* Tooltip for collapsed state */}
                {!isOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 hidden lg:block">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-100">
          <button 
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all w-full",
              !isOpen && "lg:justify-center"
            )}
            aria-label="ออกจากระบบ"
          >
            <LogOut size={20} className="shrink-0" />
            {isOpen && <span className="font-medium whitespace-nowrap">ออกจากระบบ</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
