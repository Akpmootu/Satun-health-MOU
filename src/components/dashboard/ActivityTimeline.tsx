import { motion } from 'motion/react';
import { CheckCircle2, XCircle, Clock, AlertCircle, MessageSquare, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ResultHistory } from '../../types';

interface ActivityTimelineProps {
  history: ResultHistory[];
}

export function ActivityTimeline({ history }: ActivityTimelineProps) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
        <Clock size={40} className="mx-auto text-slate-300 mb-3" />
        <p className="text-slate-500 font-medium">ยังไม่มีประวัติการดำเนินงาน</p>
      </div>
    );
  }

  // Sort history by time descending (newest first)
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ผ่าน':
        return <CheckCircle2 className="text-emerald-500" size={20} />;
      case 'ไม่ผ่าน':
        return <XCircle className="text-rose-500" size={20} />;
      case 'แก้ไข':
        return <AlertCircle className="text-orange-500" size={20} />;
      case 'รอยืนยัน':
        return <Clock className="text-amber-500" size={20} />;
      default:
        return <Clock className="text-slate-400" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ผ่าน':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'ไม่ผ่าน':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'แก้ไข':
        return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'รอยืนยัน':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="relative pl-8 space-y-8 before:absolute before:inset-0 before:left-[15px] before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-slate-200 before:to-transparent">
      {sortedHistory.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative"
        >
          {/* Timeline Dot */}
          <div className={cn(
            "absolute -left-[33px] top-0 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-sm z-10",
            item.status === 'ผ่าน' ? "bg-emerald-500" :
            item.status === 'ไม่ผ่าน' ? "bg-rose-500" :
            item.status === 'แก้ไข' ? "bg-orange-500" :
            "bg-indigo-500"
          )}>
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>

          {/* Content Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold border",
                  getStatusColor(item.status)
                )}>
                  {item.status}
                </div>
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <Clock size={14} />
                  {new Date(item.timestamp).toLocaleString('th-TH', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })} น.
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">
                <User size={14} className="text-indigo-500" />
                {item.user}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">ผลการดำเนินงาน</span>
                <span className="text-lg font-bold text-slate-700">{item.result_percentage}%</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">คะแนนที่ได้</span>
                <span className="text-lg font-bold text-indigo-600">{item.score} คะแนน</span>
              </div>
            </div>

            {(item.note || item.feedback) && (
              <div className="space-y-3">
                {item.note && (
                  <div className="flex items-start gap-3 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50">
                    <MessageSquare size={16} className="text-indigo-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-indigo-400 uppercase block mb-1">บันทึกเพิ่มเติม</span>
                      <p className="text-sm text-slate-700 leading-relaxed">{item.note}</p>
                    </div>
                  </div>
                )}
                {item.feedback && (
                  <div className="flex items-start gap-3 bg-rose-50/50 p-3 rounded-xl border border-rose-100/50">
                    <AlertCircle size={16} className="text-rose-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-rose-400 uppercase block mb-1">ข้อเสนอแนะจากผู้ประเมิน</span>
                      <p className="text-sm text-slate-700 leading-relaxed">{item.feedback}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
