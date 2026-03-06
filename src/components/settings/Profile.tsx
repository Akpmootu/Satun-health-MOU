import { User, Shield, Briefcase, User as UserIcon, Settings } from 'lucide-react';
import { User as UserType } from '../../types';

interface ProfileProps {
  user: UserType | null;
  onNavigateToSettings: () => void;
}

export function Profile({ user, onNavigateToSettings }: ProfileProps) {
  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-32 relative">
          <div className="absolute -bottom-10 left-8">
            <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
              <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <UserIcon size={48} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-14 px-8 pb-8">
          <h2 className="text-2xl font-bold text-slate-800">{user.username}</h2>
          <p className="text-slate-500 flex items-center gap-2 mt-1">
            <Briefcase size={16} />
            {user.unit}
          </p>
          
          <div className="mt-6 flex flex-col gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Shield size={16} className="text-emerald-600" />
                ข้อมูลบทบาท
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">บทบาทผู้ใช้งาน</p>
                  <p className="font-medium text-slate-800">{user.role}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">สถานะ</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                    ใช้งานปกติ
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onNavigateToSettings}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-medium rounded-xl transition-all shadow-sm"
            >
              <Settings size={18} />
              ไปที่ตั้งค่าความเป็นส่วนตัว
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
