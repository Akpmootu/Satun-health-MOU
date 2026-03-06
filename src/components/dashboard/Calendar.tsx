import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CalendarEvent {
  date: Date;
  title: string;
  type: 'deadline' | 'info' | 'warning';
}

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Mock events - in a real app, fetch from DB
  const events: CalendarEvent[] = [
    {
      date: new Date(2026, 2, 15), // March 15, 2026 (2569)
      title: 'ปิดระบบรับข้อมูลตัวชี้วัด MOU',
      type: 'deadline'
    },
    {
      date: new Date(2026, 0, 1), // Jan 1, 2026
      title: 'เริ่มรอบการประเมินใหม่',
      type: 'info'
    }
  ];

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  const getEventsForDay = (day: number) => {
    return events.filter(e => 
      e.date.getDate() === day && 
      e.date.getMonth() === currentDate.getMonth() && 
      e.date.getFullYear() === currentDate.getFullYear()
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <CalendarIcon className="text-indigo-600" />
          ปฏิทินกิจกรรม
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
            <ChevronLeft size={20} />
          </button>
          <span className="text-slate-800 font-semibold min-w-[140px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear() + 543}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-7 gap-2 mb-2 text-center">
          {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(day => (
            <div key={day} className="text-xs font-bold text-slate-400 uppercase py-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEvents = getEventsForDay(day);
            const hasDeadline = dayEvents.some(e => e.type === 'deadline');
            
            return (
              <motion.div
                key={day}
                whileHover={{ scale: 1.05 }}
                className={cn(
                  "aspect-square rounded-xl border flex flex-col items-center justify-start pt-2 relative cursor-pointer transition-colors",
                  isToday(day) ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-100 hover:border-indigo-200",
                  hasDeadline ? "bg-rose-50 border-rose-200" : ""
                )}
              >
                <span className={cn(
                  "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full",
                  isToday(day) ? "bg-indigo-600 text-white" : "text-slate-700",
                  hasDeadline && !isToday(day) ? "text-rose-600 font-bold" : ""
                )}>
                  {day}
                </span>
                
                <div className="mt-1 w-full px-1 space-y-1">
                  {dayEvents.map((event, idx) => (
                    <div 
                      key={idx}
                      className={cn(
                        "text-[10px] truncate px-1 py-0.5 rounded",
                        event.type === 'deadline' ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700"
                      )}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
        
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-bold text-slate-700 mb-2">กิจกรรมสำคัญเดือนนี้</h3>
          {events.filter(e => e.date.getMonth() === currentDate.getMonth() && e.date.getFullYear() === currentDate.getFullYear()).length > 0 ? (
            events
              .filter(e => e.date.getMonth() === currentDate.getMonth() && e.date.getFullYear() === currentDate.getFullYear())
              .map((event, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0",
                    event.type === 'deadline' ? "bg-rose-100 text-rose-600" : "bg-blue-100 text-blue-600"
                  )}>
                    <span className="text-xs font-bold">{event.date.getDate()}</span>
                    <span className="text-[10px] uppercase">{monthNames[event.date.getMonth()].substring(0, 3)}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{event.title}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Clock size={12} />
                      {event.type === 'deadline' ? 'สิ้นสุดเวลา 23:59 น.' : 'ตลอดทั้งวัน'}
                    </p>
                  </div>
                </div>
              ))
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">ไม่มีกิจกรรมในเดือนนี้</p>
          )}
        </div>
      </div>
    </div>
  );
}
