import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings, Save, Calendar, Clock, Shield } from 'lucide-react';
import Swal from 'sweetalert2';
import { supabase } from '../../lib/supabase';

export function SystemSettings() {
  const [isDataEntryEnabled, setIsDataEntryEnabled] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('key, value');
          
        if (!error && data) {
          const enabledSetting = data.find(s => s.key === 'data_entry_enabled');
          const startSetting = data.find(s => s.key === 'start_date');
          const endSetting = data.find(s => s.key === 'end_date');

          if (enabledSetting) setIsDataEntryEnabled(enabledSetting.value === 'true');
          if (startSetting) setStartDate(startSetting.value);
          if (endSetting) setEndDate(endSetting.value);
        }
      } catch (err) {
        console.log('Using default settings');
      }
    };
    
    loadSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Try to save to Supabase
      const now = new Date().toISOString();
      await supabase
        .from('system_settings')
        .upsert([
          { key: 'data_entry_enabled', value: isDataEntryEnabled.toString(), updated_at: now },
          { key: 'start_date', value: startDate, updated_at: now },
          { key: 'end_date', value: endDate, updated_at: now }
        ], { onConflict: 'key' });
        
      Swal.fire({
        icon: 'success',
        title: 'บันทึกสำเร็จ',
        text: 'อัปเดตการตั้งค่าระบบเรียบร้อยแล้ว',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถบันทึกการตั้งค่าได้'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <i className="fa-solid fa-gears text-indigo-600"></i>
            ตั้งค่าระบบ (System Settings)
          </h1>
          <p className="text-slate-500 text-sm mt-1">จัดการการตั้งค่าและสิทธิ์การเข้าถึงระบบ</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={20} />
          <span>บันทึกการตั้งค่า</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <i className="fa-solid fa-calendar-days text-indigo-600"></i>
                ช่วงเวลาบันทึกข้อมูล
              </h3>
              <p className="text-xs text-slate-500">เปิด/ปิด การบันทึกข้อมูลผลงาน</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 p-4 bg-slate-50 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-700">สถานะการบันทึกข้อมูล</p>
                <p className="text-sm text-slate-500">
                  {isDataEntryEnabled ? 'เปิดให้บันทึกข้อมูลได้ตามปกติ' : 'ปิดระบบการบันทึกข้อมูลชั่วคราว'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={isDataEntryEnabled}
                  onChange={(e) => setIsDataEntryEnabled(e.target.checked)}
                />
                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 pt-4 border-t border-slate-200">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">เวลาเปิดรับข้อมูล</label>
                <input 
                  type="datetime-local" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">เวลาปิดรับข้อมูล</label>
                <input 
                  type="datetime-local" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
