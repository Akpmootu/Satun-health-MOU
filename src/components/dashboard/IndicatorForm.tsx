import { useState, useEffect } from 'react';
import { Indicator, AreaResult, AREAS } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save } from 'lucide-react';
import { cn } from '../../lib/utils';
import Swal from 'sweetalert2';

interface IndicatorFormProps {
  indicator: Indicator | null;
  timeframe: string;
  onClose: () => void;
  onSave: (indicator: Indicator) => void;
}

export function IndicatorForm({ indicator, timeframe, onClose, onSave }: IndicatorFormProps) {
  const [formData, setFormData] = useState<Indicator | null>(null);
  const [activeTab, setActiveTab] = useState<string>('ระดับจังหวัด');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (indicator) {
      setFormData(JSON.parse(JSON.stringify(indicator))); // Deep copy
    }
  }, [indicator]);

  if (!formData) return null;

  const handleResultChange = (area: string, field: keyof AreaResult, value: string | number | null) => {
    setFormData(prev => {
      if (!prev) return prev;
      const newResults = { ...prev.results };
      if (!newResults[timeframe]) newResults[timeframe] = {};
      
      if (!newResults[timeframe][area]) {
        newResults[timeframe][area] = { area_name: area, target: null, result_count: null, result_percentage: null, score: null, status: 'รอประเมิน' };
      }
      
      // Handle numeric inputs
      let parsedValue: any = value;
      if (field !== 'status' && value !== '') {
        parsedValue = Number(value);
      } else if (value === '') {
        parsedValue = null;
      }

      newResults[timeframe][area] = { ...newResults[timeframe][area], [field]: parsedValue };

      // Auto-calculate status based on score (mock logic, adjust as needed)
      if (field === 'score' && parsedValue !== null) {
        newResults[timeframe][area].status = parsedValue >= 3 ? 'ผ่าน' : 'ไม่ผ่าน';
      }

      return { ...prev, results: newResults };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call with Exponential Backoff concept (mock delay)
    await new Promise(resolve => setTimeout(resolve, 800));
    
    onSave(formData);
    setIsSaving(false);
    
    Swal.fire({
      title: 'บันทึกสำเร็จ! ✅',
      text: `ข้อมูลตัวชี้วัดถูกอัปเดตเรียบร้อยแล้ว (รอบ: ${timeframe})`,
      icon: 'success',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#10b981',
      timer: 2000,
      timerProgressBar: true,
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    });
    onClose();
  };

  const currentResult = formData.results[timeframe]?.[activeTab] || { target: '', result_count: '', result_percentage: '', score: '', status: 'รอประเมิน' };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg">
                {formData.order}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 tracking-tight line-clamp-1">แก้ไขผลการดำเนินงาน</h3>
                <p className="text-sm text-slate-500">ปีงบประมาณ {formData.fiscal_year} | รอบ: <span className="font-semibold text-emerald-600">{timeframe}</span></p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              aria-label="ปิดหน้าต่าง"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {/* Indicator Details */}
            <div className="bg-slate-50 rounded-xl p-5 mb-6 border border-slate-100">
              <h4 className="font-semibold text-slate-800 mb-2">{formData.name}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 block mb-1">เป้าหมาย</span>
                  <span className="font-medium text-slate-700">{formData.target_criteria}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">น้ำหนัก</span>
                  <span className="font-medium text-slate-700">{formData.weight}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">คะแนนเต็ม</span>
                  <span className="font-medium text-slate-700">{formData.max_score}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">ผู้รับผิดชอบ</span>
                  <span className="font-medium text-slate-700">{formData.responsible_group}</span>
                </div>
              </div>
            </div>

            {/* Area Tabs */}
            <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 pb-2 border-b border-slate-100">
              {AREAS.map(area => (
                <button
                  key={area}
                  onClick={() => setActiveTab(area)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                    activeTab === area 
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" 
                      : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                  )}
                >
                  {area}
                </button>
              ))}
            </div>

            {/* Form Fields */}
            <form id="indicator-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Floating Label Input Pattern */}
                <div className="relative group">
                  <input
                    type="number"
                    id="target"
                    value={currentResult.target ?? ''}
                    onChange={(e) => handleResultChange(activeTab, 'target', e.target.value)}
                    className="block w-full px-4 pt-6 pb-2 text-slate-900 bg-transparent border border-slate-300 rounded-xl appearance-none focus:outline-none focus:ring-0 focus:border-emerald-600 peer transition-colors"
                    placeholder=" "
                  />
                  <label 
                    htmlFor="target" 
                    className="absolute text-sm text-slate-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-emerald-600 bg-white px-1"
                  >
                    เป้าหมาย (จำนวน/ร้อยละ)
                  </label>
                </div>

                <div className="relative group">
                  <input
                    type="number"
                    id="result_count"
                    value={currentResult.result_count ?? ''}
                    onChange={(e) => handleResultChange(activeTab, 'result_count', e.target.value)}
                    className="block w-full px-4 pt-6 pb-2 text-slate-900 bg-transparent border border-slate-300 rounded-xl appearance-none focus:outline-none focus:ring-0 focus:border-emerald-600 peer transition-colors"
                    placeholder=" "
                  />
                  <label 
                    htmlFor="result_count" 
                    className="absolute text-sm text-slate-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-emerald-600 bg-white px-1"
                  >
                    ผลงาน (จำนวน)
                  </label>
                </div>

                <div className="relative group">
                  <input
                    type="number"
                    id="result_percentage"
                    value={currentResult.result_percentage ?? ''}
                    onChange={(e) => handleResultChange(activeTab, 'result_percentage', e.target.value)}
                    className="block w-full px-4 pt-6 pb-2 text-slate-900 bg-transparent border border-slate-300 rounded-xl appearance-none focus:outline-none focus:ring-0 focus:border-emerald-600 peer transition-colors"
                    placeholder=" "
                  />
                  <label 
                    htmlFor="result_percentage" 
                    className="absolute text-sm text-slate-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-emerald-600 bg-white px-1"
                  >
                    ผลงาน (ร้อยละ)
                  </label>
                </div>

                <div className="relative group">
                  <input
                    type="number"
                    id="score"
                    min="0"
                    max="5"
                    step="0.1"
                    value={currentResult.score ?? ''}
                    onChange={(e) => handleResultChange(activeTab, 'score', e.target.value)}
                    className="block w-full px-4 pt-6 pb-2 text-slate-900 bg-transparent border border-slate-300 rounded-xl appearance-none focus:outline-none focus:ring-0 focus:border-emerald-600 peer transition-colors"
                    placeholder=" "
                  />
                  <label 
                    htmlFor="score" 
                    className="absolute text-sm text-slate-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-emerald-600 bg-white px-1"
                  >
                    ระดับคะแนน (0-5)
                  </label>
                </div>

                <div className="relative group sm:col-span-2">
                  <select
                    id="status"
                    value={currentResult.status}
                    onChange={(e) => handleResultChange(activeTab, 'status', e.target.value)}
                    className="block w-full px-4 pt-6 pb-2 text-slate-900 bg-transparent border border-slate-300 rounded-xl appearance-none focus:outline-none focus:ring-0 focus:border-emerald-600 peer transition-colors cursor-pointer"
                  >
                    <option value="รอประเมิน">รอประเมิน</option>
                    <option value="ผ่าน">ผ่าน</option>
                    <option value="ไม่ผ่าน">ไม่ผ่าน</option>
                  </select>
                  <label 
                    htmlFor="status" 
                    className="absolute text-sm text-slate-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-focus:text-emerald-600 bg-white px-1"
                  >
                    สถานะการประเมิน
                  </label>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-slate-600 font-medium hover:bg-slate-200 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              form="indicator-form"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={18} />
              )}
              <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
