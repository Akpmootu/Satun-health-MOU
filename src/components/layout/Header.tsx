import { Menu, Bell, User, Search, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TIMEFRAMES } from '../../types';

interface HeaderProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  fiscalYear: string;
  setFiscalYear: (year: string) => void;
  timeframe: string;
  setTimeframe: (timeframe: string) => void;
}

export function Header({ isOpen, setIsOpen, fiscalYear, setFiscalYear, timeframe, setTimeframe }: HeaderProps) {
  const years = ['2567', '2568', '2569', '2570'];

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
          <button className="p-2 rounded-full hover:bg-slate-100 text-slate-500 relative transition-colors" aria-label="การแจ้งเตือน">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>
          
          <button className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all" aria-label="โปรไฟล์ผู้ใช้">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-sm">
              <User size={16} />
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-sm font-semibold text-slate-700 leading-tight">ผู้ดูแลระบบ</span>
              <span className="text-xs text-slate-500 leading-tight">สสจ.สตูล</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
