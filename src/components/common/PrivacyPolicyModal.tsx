import { motion } from 'motion/react';
import { Shield, Check } from 'lucide-react';

interface PrivacyPolicyModalProps {
  onAccept: () => void;
}

export function PrivacyPolicyModal({ onAccept }: PrivacyPolicyModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
      >
        <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
            <Shield size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">นโยบายความเป็นส่วนตัว (Privacy Policy)</h2>
            <p className="text-slate-500 text-sm">กรุณาอ่านและยอมรับนโยบายก่อนเข้าใช้งานระบบ</p>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 text-slate-600 text-sm leading-relaxed space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 mb-1">1. วัตถุประสงค์ของการเก็บรวบรวมข้อมูล</h3>
            <p>ระบบสารสนเทศเพื่อการบริหาร สำนักงานสาธารณสุขจังหวัดสตูล (STN Health KPI) เก็บรวบรวมข้อมูลส่วนบุคคลของท่าน เพื่อใช้ในการยืนยันตัวตน การกำหนดสิทธิ์การเข้าถึงข้อมูล และการบันทึกประวัติการใช้งานระบบ (Log) เพื่อความปลอดภัยและประสิทธิภาพในการให้บริการ</p>
          </div>
          
          <div>
            <h3 className="font-bold text-slate-800 mb-1">2. ข้อมูลที่เก็บรวบรวม</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>ข้อมูลบัญชีผู้ใช้:</strong> ชื่อ-นามสกุล, ตำแหน่ง, หน่วยงานที่สังกัด, ชื่อผู้ใช้งาน (Username), และรหัสผ่าน (Password)</li>
              <li><strong>ข้อมูลการใช้งาน:</strong> ประวัติการเข้าสู่ระบบ, หมายเลข IP Address, และข้อมูลการทำรายการในระบบ</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 mb-1">3. การใช้และการเปิดเผยข้อมูล</h3>
            <p>ข้อมูลของท่านจะถูกใช้ภายในสำนักงานสาธารณสุขจังหวัดสตูลเท่านั้น เพื่อวัตถุประสงค์ในการบริหารจัดการระบบและติดตามผลการดำเนินงานตามตัวชี้วัด จะไม่มีการเปิดเผยข้อมูลส่วนบุคคลของท่านแก่บุคคลภายนอก เว้นแต่จะได้รับความยินยอมจากท่าน หรือเป็นไปตามที่กฎหมายกำหนด</p>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 mb-1">4. การรักษาความปลอดภัยของข้อมูล</h3>
            <p>ระบบมีมาตรการรักษาความปลอดภัยทางเทคนิคและการบริหารจัดการที่เหมาะสม เพื่อป้องกันการเข้าถึง การใช้ การเปลี่ยนแปลง หรือการเปิดเผยข้อมูลโดยมิชอบ</p>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 mb-1">5. สิทธิของเจ้าของข้อมูล</h3>
            <p>ท่านมีสิทธิในการขอเข้าถึง ขอแก้ไข หรือขอให้ลบข้อมูลส่วนบุคคลของท่านได้ โดยติดต่อผู้ดูแลระบบ (Admin) ของสำนักงานสาธารณสุขจังหวัดสตูล</p>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 mb-1">6. การปรับปรุงนโยบาย</h3>
            <p>สำนักงานสาธารณสุขจังหวัดสตูลอาจมีการปรับปรุงนโยบายความเป็นส่วนตัวนี้เป็นระยะ โดยจะแจ้งให้ทราบผ่านทางหน้าเว็บไซต์ของระบบ</p>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 mb-1">7. ช่องทางการติดต่อ</h3>
            <p>หากมีข้อสงสัยหรือต้องการสอบถามเพิ่มเติมเกี่ยวกับนโยบายความเป็นส่วนตัว สามารถติดต่อได้ที่:<br/>
            <strong>กลุ่มงานสุขภาพดิจิทัล สำนักงานสาธารณสุขจังหวัดสตูล</strong><br/>
            โทรศัพท์: 074-711071 ต่อ 111</p>
          </div>
        </div>
        
        <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0">
          <button
            onClick={onAccept}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Check size={20} />
            ฉันได้อ่านและยอมรับนโยบายความเป็นส่วนตัว
          </button>
        </div>
      </motion.div>
    </div>
  );
}
