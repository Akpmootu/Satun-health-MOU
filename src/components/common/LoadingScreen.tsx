import { motion } from 'motion/react';
import { Logo } from './Logo';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <motion.div
          animate={{ 
            y: [0, -10, 0],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        >
          <Logo className="scale-150 mb-8" />
        </motion.div>
        
        <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-8">
          <motion.div 
            className="h-full bg-emerald-500 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-slate-400 mt-4 font-medium"
        >
          กำลังโหลดข้อมูลระบบ...
        </motion.p>
      </motion.div>
    </div>
  );
}
