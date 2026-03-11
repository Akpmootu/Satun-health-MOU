import { motion } from 'motion/react';
import { Shield, Check, Settings, LogOut, ExternalLink } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface PrivacyPolicyModalProps {
  onAccept: () => void;
  onCancel: () => void;
  onSettings: () => void;
}

export const POLICY_VERSION = '1.0.0';

export function PrivacyPolicyModal({ onAccept, onCancel, onSettings }: PrivacyPolicyModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus management
  useEffect(() => {
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements?.[0] as HTMLElement;
    
    if (firstElement) {
      firstElement.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;
        
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-slate-900/70 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-policy-title"
    >
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white sm:rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-100 flex flex-col h-full sm:h-auto sm:max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 sm:p-8 text-white flex items-center gap-4 sm:gap-6 shrink-0">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white shrink-0 shadow-inner">
            <Shield size={32} />
          </div>
          <div>
            <h2 id="privacy-policy-title" className="text-2xl sm:text-3xl font-bold tracking-tight">
              นโยบายความเป็นส่วนตัว
            </h2>
            <p className="text-indigo-100 text-sm sm:text-base mt-1 opacity-90">
              Privacy Policy for STN Health KPI System
            </p>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 text-slate-600 text-base leading-relaxed space-y-8">
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">1</span>
              วัตถุประสงค์ของการเก็บรวบรวมข้อมูล
            </h3>
            <p className="pl-10">
              ระบบสารสนเทศเพื่อการบริหาร สำนักงานสาธารณสุขจังหวัดสตูล (STN Health KPI) เก็บรวบรวมข้อมูลส่วนบุคคลของท่าน เพื่อใช้ในการยืนยันตัวตน การกำหนดสิทธิ์การเข้าถึงข้อมูล และการบันทึกประวัติการใช้งานระบบ (Log) เพื่อความปลอดภัยและประสิทธิภาพในการให้บริการตามภารกิจของหน่วยงาน
            </p>
          </section>
          
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">2</span>
              ข้อมูลที่เก็บรวบรวม
            </h3>
            <div className="pl-10">
              <p className="mb-2">เรามีการเก็บรวบรวมข้อมูลดังต่อไปนี้:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                  <span><strong className="text-slate-800">ข้อมูลบัญชีผู้ใช้:</strong> ชื่อ-นามสกุล, ตำแหน่ง, หน่วยงานที่สังกัด, ชื่อผู้ใช้งาน (Username), และรหัสผ่าน (Password)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                  <span><strong className="text-slate-800">ข้อมูลการใช้งาน:</strong> ประวัติการเข้าสู่ระบบ, หมายเลข IP Address, และข้อมูลการทำรายการบันทึกผลงานในระบบ</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">3</span>
              การใช้และการเปิดเผยข้อมูล
            </h3>
            <p className="pl-10">
              ข้อมูลของท่านจะถูกใช้ภายในสำนักงานสาธารณสุขจังหวัดสตูลเท่านั้น เพื่อวัตถุประสงค์ในการบริหารจัดการระบบและติดตามผลการดำเนินงานตามตัวชี้วัด (KPI) จะไม่มีการเปิดเผยข้อมูลส่วนบุคคลของท่านแก่บุคคลภายนอก เว้นแต่จะได้รับความยินยอมจากท่าน หรือเป็นไปตามที่กฎหมายกำหนด
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">4</span>
              การรักษาความปลอดภัยของข้อมูล
            </h3>
            <p className="pl-10">
              เรามีมาตรการรักษาความปลอดภัยทางเทคนิคและการบริหารจัดการที่เหมาะสม (Encryption & Access Control) เพื่อป้องกันการเข้าถึง การใช้ การเปลี่ยนแปลง หรือการเปิดเผยข้อมูลโดยมิชอบ
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">5</span>
              สิทธิของเจ้าของข้อมูล
            </h3>
            <p className="pl-10">
              ท่านมีสิทธิในการขอเข้าถึง ขอแก้ไข หรือขอให้ลบข้อมูลส่วนบุคคลของท่านได้ตามกฎหมายคุ้มครองข้อมูลส่วนบุคคล (PDPA) โดยสามารถดำเนินการผ่านเมนูการตั้งค่า หรือติดต่อผู้ดูแลระบบ
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">6</span>
              การปรับปรุงนโยบาย
            </h3>
            <p className="pl-10">
              สำนักงานสาธารณสุขจังหวัดสตูลอาจมีการปรับปรุงนโยบายความเป็นส่วนตัวนี้เป็นระยะเพื่อให้สอดคล้องกับกฎหมายและเทคโนโลยีที่เปลี่ยนไป โดยจะแจ้งให้ทราบผ่านทางหน้าเว็บไซต์ของระบบ (เวอร์ชันปัจจุบัน: {POLICY_VERSION})
            </p>
          </section>

          <section className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">7</span>
              ช่องทางการติดต่อ
            </h3>
            <div className="pl-10 space-y-1">
              <p className="font-bold text-slate-800">กลุ่มงานสุขภาพดิจิทัล สำนักงานสาธารณสุขจังหวัดสตูล</p>
              <p>ที่อยู่: 191 หมู่ 6 ต.คลองขุด อ.เมือง จ.สตูล 91000</p>
              <p>โทรศัพท์: 074-711071 ต่อ 111</p>
            </div>
          </section>
        </div>
        
        {/* Footer Buttons */}
        <div className="p-6 sm:p-8 border-t border-slate-100 bg-white shrink-0">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={onAccept}
              aria-label="ยอมรับและเข้าใช้งานระบบ"
              className="flex-1 order-1 sm:order-3 py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
            >
              <Check size={20} />
              ยอมรับและเข้าใช้งาน
            </button>
            
            <button
              onClick={onSettings}
              aria-label="ตั้งค่าความเป็นส่วนตัว"
              className="flex-1 order-2 py-4 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Settings size={20} />
              ตั้งค่าความเป็นส่วนตัว
            </button>

            <button
              onClick={onCancel}
              aria-label="ยกเลิกและออกจากระบบ"
              className="flex-1 order-3 sm:order-1 py-4 px-6 bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <LogOut size={20} />
              ยกเลิก / ออกจากระบบ
            </button>
          </div>
          <p className="text-center text-xs text-slate-400 mt-4">
            การคลิก "ยอมรับและเข้าใช้งาน" แสดงว่าท่านตกลงตามเงื่อนไขและนโยบายความเป็นส่วนตัวข้างต้น
          </p>
        </div>
      </motion.div>
    </div>
  );
}
