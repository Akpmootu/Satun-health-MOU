import { motion } from 'motion/react';
import { Bell, CheckCircle2 } from 'lucide-react';

interface NewsAnnouncementProps {
  content: {
    title: string;
    body: string;
    date: string;
  };
  onAcknowledge: () => void;
}

export function NewsAnnouncement({ content, onAcknowledge }: NewsAnnouncementProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100"
      >
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white text-center relative">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          </div>
          <Bell size={48} className="mx-auto mb-4 text-emerald-100" />
          <h2 className="text-2xl font-bold relative z-10">{content.title}</h2>
          <p className="text-emerald-100 mt-2 text-sm relative z-10">ประกาศเมื่อ: {new Date(content.date).toLocaleDateString('th-TH')}</p>
        </div>
        
        <div className="p-8">
          <div className="prose prose-slate max-w-none mb-8 whitespace-pre-line text-slate-700 leading-relaxed">
            {content.body.replace(/\\n/g, '\n')}
          </div>
          
          <button
            onClick={onAcknowledge}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-sm shadow-slate-900/20"
          >
            <CheckCircle2 size={20} />
            รับทราบ
          </button>
        </div>
      </motion.div>
    </div>
  );
}
