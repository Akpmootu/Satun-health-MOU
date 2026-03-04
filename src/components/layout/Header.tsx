import { Menu, Bell, User as UserIcon, Search, Calendar, ShieldCheck, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TIMEFRAMES, User } from '../../types';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'warning' | 'info' | 'error';
  action?: () => void;
}

interface HeaderProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  fiscalYear: string;
  setFiscalYear: (year: string) => void;
  timeframe: string;
  setTimeframe: (timeframe: string) => void;
  user: User | null;
  notifications?: NotificationItem[];
}

export function Header({ isOpen, setIsOpen, fiscalYear, setFiscalYear, timeframe, setTimeframe, user, notifications = [] }: HeaderProps) {
  const years = ['2567', '2568', '2569', '2570'];
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu size={24} />
        </button>
        
        <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
          <Search size={16} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="ค้นหาตัวชี้วัด..." 
            className="bg-transparent border-none outline-none text-sm w-48 text-slate-700 placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        {/* Timeframe Selector */}
        <div className="hidden lg:flex items-center gap-2">
          <Calendar size={16} className="text-slate-400" />
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2 transition-colors cursor-pointer font-medium"
            aria-label="เลือกรอบเวลา"
          >
            {TIMEFRAMES.map(tf => (
              <option key={tf} value={tf}>{tf}</option>
            ))}
          </select>
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-500 hidden sm:inline-block">ปีงบฯ:</span>
          <select
            value={fiscalYear}
            onChange={(e) => setFiscalYear(e.target.value)}
            className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2 transition-colors cursor-pointer font-medium"
            aria-label="เลือกปีงบประมาณ"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={cn(
                "p-2 rounded-full transition-colors relative",
                showNotifications ? "bg-slate-100 text-slate-800" : "hover:bg-slate-100 text-slate-500"
              )} 
              aria-label="การแจ้งเตือน"
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 origin-top-right"
                >
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-bold text-slate-800">การแจ้งเตือน</h3>
                    <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{notifications.length}</span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      <div className="divide-y divide-slate-100">
                        {notifications.map(notif => (
                          <div 
                            key={notif.id} 
                            className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                            onClick={() => {
                              if (notif.action) notif.action();
                              setShowNotifications(false);
                            }}
                          >
                            <div className="flex gap-3">
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                                notif.type === 'info' ? "bg-indigo-100 text-indigo-600" : 
                                notif.type === 'warning' ? "bg-orange-100 text-orange-600" : 
                                "bg-rose-100 text-rose-600"
                              )}>
                                {notif.type === 'info' ? <ShieldCheck size={16} /> : <AlertCircle size={16} />}
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-800">{notif.title}</h4>
                                <p className="text-sm text-slate-600 mt-0.5 leading-snug">{notif.message}</p>
                                <span className="text-xs text-slate-400 mt-2 block">{notif.time}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                        <Bell size={32} className="text-slate-300 mb-3" />
                        <p>ไม่มีการแจ้งเตือนใหม่</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>
          
          <button className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all" aria-label="โปรไฟล์ผู้ใช้">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-sm">
              <UserIcon size={16} />
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-sm font-semibold text-slate-700 leading-tight">{user?.username || 'ผู้ใช้งาน'}</span>
              <span className="text-xs text-slate-500 leading-tight">{user?.unit || 'หน่วยงาน'}</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
