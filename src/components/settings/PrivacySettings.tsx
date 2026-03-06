import { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Eye, Bell, Activity, Save } from 'lucide-react';
import Swal from 'sweetalert2';

export function PrivacySettings() {
  const [settings, setSettings] = useState({
    shareData: true,
    activityLog: true,
    emailNotifications: true,
    publicProfile: false
  });

  const handleSave = () => {
    Swal.fire({
      icon: 'success',
      title: 'บันทึกสำเร็จ',
      text: 'การตั้งค่าความเป็นส่วนตัวของคุณถูกบันทึกแล้ว',
      timer: 1500,
      showConfirmButton: false
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
            <Shield size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">การตั้งค่าความเป็นส่วนตัว</h2>
            <p className="text-slate-500 text-sm">จัดการข้อมูลส่วนบุคคลและการแชร์ข้อมูลของคุณ</p>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Section 1: Data Sharing */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Eye size={20} className="text-slate-400" />
              การแชร์ข้อมูล
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <h4 className="font-medium text-slate-800">อนุญาตให้แชร์ข้อมูลสถิติเพื่อการวิจัย</h4>
                  <p className="text-sm text-slate-500 mt-1">ข้อมูลของคุณจะถูกนำไปใช้ในการวิเคราะห์ภาพรวมระดับจังหวัด โดยไม่ระบุตัวตน</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={settings.shareData} 
                    onChange={() => setSettings({...settings, shareData: !settings.shareData})}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <h4 className="font-medium text-slate-800">แสดงโปรไฟล์สาธารณะ</h4>
                  <p className="text-sm text-slate-500 mt-1">อนุญาตให้ผู้ใช้อื่นเห็นชื่อและหน่วยงานของคุณในระบบ</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={settings.publicProfile} 
                    onChange={() => setSettings({...settings, publicProfile: !settings.publicProfile})}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: Activity Log */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Activity size={20} className="text-slate-400" />
              ประวัติการใช้งาน
            </h3>
            <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <h4 className="font-medium text-slate-800">บันทึกกิจกรรมล่าสุด</h4>
                <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">ดูทั้งหมด</button>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { action: 'เข้าสู่ระบบ', time: 'วันนี้, 08:30 น.', device: 'Chrome on Windows' },
                  { action: 'บันทึกผลตัวชี้วัดที่ 3', time: 'เมื่อวาน, 14:20 น.', device: 'Chrome on Windows' },
                  { action: 'แก้ไขข้อมูลส่วนตัว', time: '2 วันที่แล้ว, 10:15 น.', device: 'Safari on iPhone' },
                ].map((log, idx) => (
                  <div key={idx} className="p-4 flex justify-between items-center hover:bg-slate-100/50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{log.action}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{log.device}</p>
                    </div>
                    <span className="text-xs text-slate-500">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Notifications */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Bell size={20} className="text-slate-400" />
              การแจ้งเตือน
            </h3>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <h4 className="font-medium text-slate-800">รับการแจ้งเตือนทางอีเมล</h4>
                <p className="text-sm text-slate-500 mt-1">แจ้งเตือนเมื่อถึงกำหนดส่งข้อมูล หรือมีการเปลี่ยนแปลงสถานะ</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.emailNotifications} 
                  onChange={() => setSettings({...settings, emailNotifications: !settings.emailNotifications})}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
              <Save size={20} />
              บันทึกการตั้งค่า
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
