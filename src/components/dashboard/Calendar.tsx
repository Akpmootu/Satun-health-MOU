import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus, Trash2, Edit2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import Swal from 'sweetalert2';
import { User } from '../../types';

interface CalendarEvent {
  id: string;
  date: string; // ISO string
  title: string;
  type: 'deadline' | 'info' | 'warning';
}

interface CalendarProps {
  user?: User | null;
}

export function Calendar({ user }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'calendar_events')
        .single();
        
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data && data.value) {
        setEvents(JSON.parse(data.value));
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveEvents = async (newEvents: CalendarEvent[]) => {
    try {
      Swal.fire({ title: 'กำลังบันทึก...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      const { error } = await supabase
        .from('system_settings')
        .upsert({ key: 'calendar_events', value: JSON.stringify(newEvents), updated_at: new Date().toISOString() }, { onConflict: 'key' });
        
      if (error) throw error;
      setEvents(newEvents);
      Swal.fire({ icon: 'success', title: 'บันทึกสำเร็จ', timer: 1500, showConfirmButton: false });
    } catch (error) {
      console.error('Error saving events:', error);
      Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถบันทึกกิจกรรมได้' });
    }
  };

  const handleAddEvent = async (day?: number) => {
    const defaultDate = day 
      ? `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
      : new Date().toISOString().split('T')[0];

    const { value: formValues } = await Swal.fire({
      title: '<h2 class="text-2xl font-bold text-slate-800 flex items-center justify-center gap-3"><i class="fa-solid fa-calendar-plus text-emerald-600"></i> เพิ่มกิจกรรมใหม่</h2>',
      html: `
        <div class="space-y-4 text-left">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">ชื่อกิจกรรม <span class="text-red-500">*</span></label>
            <input type="text" id="swal-event-title" class="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="เช่น ปิดระบบรับข้อมูล" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">วันที่ <span class="text-red-500">*</span></label>
            <input type="date" id="swal-event-date" class="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value="${defaultDate}" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">ประเภทกิจกรรม</label>
            <select id="swal-event-type" class="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="info">ทั่วไป (สีฟ้า)</option>
              <option value="deadline">วันครบกำหนด (สีแดง)</option>
              <option value="warning">แจ้งเตือน (สีส้ม)</option>
            </select>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#10b981',
      preConfirm: () => {
        const title = (document.getElementById('swal-event-title') as HTMLInputElement).value;
        const date = (document.getElementById('swal-event-date') as HTMLInputElement).value;
        const type = (document.getElementById('swal-event-type') as HTMLSelectElement).value as any;
        
        if (!title || !date) {
          Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบถ้วน');
          return false;
        }
        return { title, date, type };
      }
    });

    if (formValues) {
      const newEvent: CalendarEvent = {
        id: Math.random().toString(36).substring(2, 9),
        title: formValues.title,
        date: new Date(formValues.date).toISOString(),
        type: formValues.type
      };
      await saveEvents([...events, newEvent]);
    }
  };

  const handleEditEvent = async (event: CalendarEvent) => {
    const { value: formValues } = await Swal.fire({
      title: '<h2 class="text-2xl font-bold text-slate-800 flex items-center justify-center gap-3"><i class="fa-solid fa-calendar-day text-emerald-600"></i> แก้ไขกิจกรรม</h2>',
      html: `
        <div class="space-y-4 text-left">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">ชื่อกิจกรรม <span class="text-red-500">*</span></label>
            <input type="text" id="swal-event-title" class="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="เช่น ปิดระบบรับข้อมูล" value="${event.title}" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">วันที่ <span class="text-red-500">*</span></label>
            <input type="date" id="swal-event-date" class="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value="${new Date(event.date).toISOString().split('T')[0]}" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">ประเภทกิจกรรม</label>
            <select id="swal-event-type" class="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="info" ${event.type === 'info' ? 'selected' : ''}>ทั่วไป (สีฟ้า)</option>
              <option value="deadline" ${event.type === 'deadline' ? 'selected' : ''}>วันครบกำหนด (สีแดง)</option>
              <option value="warning" ${event.type === 'warning' ? 'selected' : ''}>แจ้งเตือน (สีส้ม)</option>
            </select>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#10b981',
      preConfirm: () => {
        const title = (document.getElementById('swal-event-title') as HTMLInputElement).value;
        const date = (document.getElementById('swal-event-date') as HTMLInputElement).value;
        const type = (document.getElementById('swal-event-type') as HTMLSelectElement).value as any;
        
        if (!title || !date) {
          Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบถ้วน');
          return false;
        }
        return { title, date, type };
      }
    });

    if (formValues) {
      const newEvents = events.map(e => e.id === event.id ? {
        ...e,
        title: formValues.title,
        date: new Date(formValues.date).toISOString(),
        type: formValues.type
      } : e);
      await saveEvents(newEvents);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ',
      text: "คุณต้องการลบกิจกรรมนี้ใช่หรือไม่?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      const newEvents = events.filter(e => e.id !== id);
      await saveEvents(newEvents);
    }
  };

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
    return events.filter(e => {
      const d = new Date(e.date);
      return d.getDate() === day && 
             d.getMonth() === currentDate.getMonth() && 
             d.getFullYear() === currentDate.getFullYear();
    });
  };

  const currentMonthEvents = events.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <i className="fa-solid fa-calendar-check text-indigo-600"></i>
          ปฏิทินกิจกรรม
        </h2>
        <div className="flex items-center gap-2">
          {user?.role === 'admin' && (
            <button 
              onClick={handleAddEvent}
              className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors mr-2"
            >
              <Plus size={16} />
              เพิ่มกิจกรรม
            </button>
          )}
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <span className="text-slate-800 font-semibold min-w-[140px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear() + 543}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
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
            const hasWarning = dayEvents.some(e => e.type === 'warning');
            
              return (
                <motion.div
                  key={day}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => user?.role === 'admin' && handleAddEvent(day)}
                  className={cn(
                    "aspect-square rounded-xl border flex flex-col items-center justify-start pt-2 relative cursor-pointer transition-colors",
                    isToday(day) ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-100 hover:border-indigo-200",
                    hasDeadline ? "bg-rose-50 border-rose-200" : hasWarning ? "bg-orange-50 border-orange-200" : ""
                  )}
                >
                  <span className={cn(
                    "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full",
                    isToday(day) ? "bg-indigo-600 text-white" : "text-slate-700",
                    hasDeadline && !isToday(day) ? "text-rose-600 font-bold" : 
                    hasWarning && !isToday(day) ? "text-orange-600 font-bold" : ""
                  )}>
                    {day}
                  </span>
                  
                  <div className="mt-1 w-full px-1 space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((event, idx) => (
                      <div 
                        key={idx}
                        onClick={(e) => {
                          if (user?.role === 'admin') {
                            e.stopPropagation();
                            handleEditEvent(event);
                          }
                        }}
                        className={cn(
                          "text-[10px] truncate px-1 py-0.5 rounded hover:brightness-95 transition-all",
                          event.type === 'deadline' ? "bg-rose-100 text-rose-700" : 
                          event.type === 'warning' ? "bg-orange-100 text-orange-700" : 
                          "bg-blue-100 text-blue-700"
                        )}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[10px] text-slate-400 text-center">+{dayEvents.length - 2}</div>
                    )}
                  </div>
                </motion.div>
              );
          })}
        </div>
        
        <div className="mt-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <h3 className="text-sm font-bold text-slate-700 mb-3 sticky top-0 bg-white py-1">กิจกรรมสำคัญเดือนนี้</h3>
          {loading ? (
            <div className="flex justify-center py-4"><div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
          ) : currentMonthEvents.length > 0 ? (
            <div className="space-y-3">
              {currentMonthEvents.map((event, idx) => {
                const eventDate = new Date(event.date);
                return (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 group relative">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 shadow-sm",
                      event.type === 'deadline' ? "bg-rose-100 text-rose-600 border border-rose-200" : 
                      event.type === 'warning' ? "bg-orange-100 text-orange-600 border border-orange-200" : 
                      "bg-blue-100 text-blue-600 border border-blue-200"
                    )}>
                      <span className="text-sm font-bold leading-none">{eventDate.getDate()}</span>
                      <span className="text-[10px] uppercase font-medium mt-1">{monthNames[eventDate.getMonth()].substring(0, 3)}</span>
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <h4 className="text-sm font-bold text-slate-800 truncate" title={event.title}>{event.title}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Clock size={12} />
                        {event.type === 'deadline' ? 'สิ้นสุดเวลา 23:59 น.' : 'ตลอดทั้งวัน'}
                      </p>
                    </div>
                    {user?.role === 'admin' && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => handleEditEvent(event)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          title="แก้ไขกิจกรรม"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="ลบกิจกรรม"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
              <CalendarIcon size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">ไม่มีกิจกรรมในเดือนนี้</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
