import { useState, useEffect } from 'react';
import { Indicator, AreaResult, AREAS, User } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Save, ChevronRight, CheckCircle2, AlertCircle, Clock, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import Swal from 'sweetalert2';

interface IndicatorFormProps {
  indicator: Indicator | null;
  timeframe: string;
  onClose: () => void;
  onSave: (indicator: Indicator) => void;
  user: User | null;
}

const calculateScore = (result: number, criteria: any) => {
  if (!criteria) return null;
  
  const c = [
    Number(criteria["1"]),
    Number(criteria["2"]),
    Number(criteria["3"]),
    Number(criteria["4"]),
    Number(criteria["5"])
  ];

  if (c.some(isNaN)) return null;

  const isAscending = c[4] > c[0];

  if (isAscending) {
    if (result >= c[4]) return 5;
    if (result <= c[0]) return 1;
    
    for (let i = 3; i >= 0; i--) {
      if (result >= c[i]) {
        return (i + 1) + (result - c[i]) / (c[i+1] - c[i]);
      }
    }
  } else {
    // กรณีเกณฑ์ยิ่งน้อยยิ่งได้คะแนนเยอะ (เช่น <= 20%)
    if (result <= c[4]) return 5;
    if (result >= c[0]) return 1;

    // เทียบเท่ากับสูตร MATCH(L6, F6:J6, -1) + (L6 - INDEX(...)) / (INDEX(...) - INDEX(...))
    let matchIndex = -1;
    for (let i = 4; i >= 0; i--) {
      if (c[i] >= result) {
        matchIndex = i;
        break;
      }
    }
    
    if (matchIndex !== -1 && matchIndex < 4) {
      return (matchIndex + 1) + (result - c[matchIndex]) / (c[matchIndex + 1] - c[matchIndex]);
    }
  }
  return null;
};

export function IndicatorForm({ indicator, timeframe, onClose, onSave, user }: IndicatorFormProps) {
  const [formData, setFormData] = useState<Indicator | null>(null);
  const [activeTab, setActiveTab] = useState<string>('จังหวัด');
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  useEffect(() => {
    if (indicator) {
      setFormData(JSON.parse(JSON.stringify(indicator))); // Deep copy
    }
  }, [indicator]);

  useEffect(() => {
    if (user && user.role === 'user') {
      setActiveTab(user.unit);
    }
  }, [user]);

  if (!formData) return null;

  const handleResultChange = (area: string, value: string) => {
    setFormData(prev => {
      if (!prev) return prev;
      const newResults = { ...prev.results };
      if (!newResults[timeframe]) newResults[timeframe] = {};
      
      if (!newResults[timeframe][area]) {
        newResults[timeframe][area] = { area_name: area, target: null, result_count: null, result_percentage: null, score: null, weighted_score: null, status: 'รอประเมิน' };
      }
      
      let parsedValue: number | null = value !== '' ? Number(value) : null;

      newResults[timeframe][area] = { ...newResults[timeframe][area], result_percentage: parsedValue };

      if (parsedValue !== null) {
        const calculatedScore = calculateScore(parsedValue, prev.score_criteria);
        if (calculatedScore !== null) {
          const roundedScore = Math.round(calculatedScore * 10000) / 10000;
          newResults[timeframe][area].score = roundedScore;
          
          const weight = Number(prev.weight) || 0;
          const weightedScore = (roundedScore * weight) / 13;
          newResults[timeframe][area].weighted_score = Math.round(weightedScore * 10000) / 10000;
        } else {
          newResults[timeframe][area].score = null;
          newResults[timeframe][area].weighted_score = null;
        }
      } else {
        newResults[timeframe][area].score = null;
        newResults[timeframe][area].weighted_score = null;
      }

      return { ...prev, results: newResults };
    });
  };

  const handleNext = () => {
    const currentResult = formData.results[timeframe]?.[activeTab];
    if (currentResult?.result_percentage === null || currentResult?.result_percentage === undefined) {
      Swal.fire({
        title: 'กรุณากรอกข้อมูล',
        text: 'โปรดระบุผลงาน (ร้อยละ) ก่อนดำเนินการต่อ',
        icon: 'warning',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    
    // Set status based on role
    const finalData = { ...formData };
    if (!finalData.results[timeframe]) finalData.results[timeframe] = {};
    if (!finalData.results[timeframe][activeTab]) {
      finalData.results[timeframe][activeTab] = { area_name: activeTab, target: null, result_count: null, result_percentage: null, score: null, weighted_score: null, status: 'รอประเมิน' };
    }
    
    if (user?.role === 'admin') {
      const score = finalData.results[timeframe][activeTab].score;
      finalData.results[timeframe][activeTab].status = (score ?? 0) >= 3 ? 'ผ่าน' : 'ไม่ผ่าน';
    } else {
      finalData.results[timeframe][activeTab].status = 'รอยืนยัน';
    }
    
    // Clear feedback when resubmitting
    if (finalData.results[timeframe][activeTab].feedback) {
      delete finalData.results[timeframe][activeTab].feedback;
    }

    await new Promise(resolve => setTimeout(resolve, 800));
    
    onSave(finalData);
    setIsSaving(false);
    onClose();
  };

  const currentResult = formData.results[timeframe]?.[activeTab] || { target: null, result_count: null, result_percentage: null, score: null, weighted_score: null, status: 'รอประเมิน' };
  
  const isReadOnly = user?.role === 'กลุ่มงาน สสจ.' || (user?.role !== 'admin' && (currentResult.status === 'ผ่าน' || currentResult.status === 'ไม่ผ่าน' || currentResult.status === 'รอยืนยัน'));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={step === 1 ? onClose : () => setStep(1)}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">บันทึกผลการดำเนินงาน</h2>
          <p className="text-slate-500 mt-1">
            {step === 1 ? 'กรอกข้อมูลผลงานสำหรับตัวชี้วัดที่เลือก' : 'ตรวจสอบความถูกต้องก่อนส่งข้อมูล'}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center w-full max-w-md">
          <div className={cn("flex flex-col items-center", step >= 1 ? "text-indigo-600" : "text-slate-400")}>
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-colors", step >= 1 ? "bg-indigo-100" : "bg-slate-100")}>1</div>
            <span className="text-xs font-medium">กรอกข้อมูล</span>
          </div>
          <div className={cn("flex-1 h-1 mx-4 rounded-full transition-colors", step >= 2 ? "bg-indigo-600" : "bg-slate-200")} />
          <div className={cn("flex flex-col items-center", step >= 2 ? "text-indigo-600" : "text-slate-400")}>
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-colors", step >= 2 ? "bg-indigo-100" : "bg-slate-100")}>2</div>
            <span className="text-xs font-medium">ยืนยันข้อมูล</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="p-8">
              {/* Indicator Info Card */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 mb-8 border border-slate-200/60">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center font-bold text-xl text-indigo-600 shrink-0 border border-slate-100">
                    {formData.order}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{formData.name}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-lg border border-slate-200">
                        <span className="text-slate-400">เป้าหมาย:</span>
                        <span className="font-semibold text-slate-800">{formData.target_criteria}</span>
                      </span>
                      <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-lg border border-slate-200">
                        <span className="text-slate-400">น้ำหนัก:</span>
                        <span className="font-semibold text-slate-800">{formData.weight}</span>
                      </span>
                      <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-lg border border-slate-200">
                        <span className="text-slate-400">ผู้รับผิดชอบ:</span>
                        <span className="font-semibold text-slate-800">{formData.responsible_group}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Area Tabs */}
              <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 pb-2 border-b border-slate-100">
                {AREAS.map(area => (
                  <button
                    key={area}
                    onClick={() => setActiveTab(area)}
                    disabled={user?.role !== 'admin' && user?.unit !== area}
                    className={cn(
                      "px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                      activeTab === area 
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" 
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent",
                      user?.role !== 'admin' && user?.unit !== area && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {area}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="max-w-2xl mx-auto">
                {currentResult.feedback && currentResult.status === 'แก้ไข' && (
                  <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="text-orange-500 shrink-0 mt-0.5" size={20} />
                    <div>
                      <h4 className="text-sm font-bold text-orange-800 mb-1">ข้อเสนอแนะจากผู้ดูแลระบบ (ให้แก้ไข)</h4>
                      <p className="text-sm text-orange-700">{currentResult.feedback}</p>
                    </div>
                  </div>
                )}
                
                <div className="mb-8">
                  <label htmlFor="result_percentage" className="block text-center text-lg font-semibold text-slate-700 mb-4">
                    กรอกผลงาน (ร้อยละ)
                  </label>
                  <div className="relative max-w-xs mx-auto">
                    <input
                      type="number"
                      id="result_percentage"
                      value={currentResult.result_percentage ?? ''}
                      onChange={(e) => handleResultChange(activeTab, e.target.value)}
                      disabled={isReadOnly}
                      className="block w-full text-center text-5xl font-bold text-indigo-600 bg-indigo-50/50 border-2 border-indigo-100 rounded-3xl py-6 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed"
                      placeholder="0.00"
                      step="0.01"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-indigo-300 pointer-events-none">%</span>
                  </div>
                </div>

                {/* Auto-calculated Results */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center transition-colors duration-300" style={currentResult.score !== null && currentResult.score !== undefined ? { backgroundColor: `hsl(${Math.max(0, Math.min(120, (Number(currentResult.score) - 1) * 30))}, 80%, 95%)`, borderColor: `hsl(${Math.max(0, Math.min(120, (Number(currentResult.score) - 1) * 30))}, 80%, 85%)` } : {}}>
                    <span className="block text-sm font-medium text-slate-500 mb-2">ระดับคะแนนที่ได้</span>
                    <div className="text-4xl font-bold text-slate-800" style={currentResult.score !== null && currentResult.score !== undefined ? { color: `hsl(${Math.max(0, Math.min(120, (Number(currentResult.score) - 1) * 30))}, 80%, 35%)` } : {}}>
                      {currentResult.score !== null && currentResult.score !== undefined ? Number(currentResult.score).toFixed(4) : '-'}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center">
                    <span className="block text-sm font-medium text-slate-500 mb-2">คะแนนถ่วงน้ำหนัก</span>
                    <div className="text-4xl font-bold text-emerald-600">
                      {currentResult.weighted_score !== null && currentResult.weighted_score !== undefined ? Number(currentResult.weighted_score).toFixed(4) : '-'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl text-slate-600 font-medium hover:bg-slate-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20 flex items-center gap-2 text-lg"
              >
                <span>ถัดไป</span>
                <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden max-w-3xl mx-auto"
          >
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">ตรวจสอบข้อมูลก่อนส่ง</h3>
                <p className="text-slate-500 mt-2">ข้อมูลจะถูกส่งไปยังผู้ดูแลระบบเพื่อทำการยืนยัน (สถานะ: รอยืนยัน)</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                  <span className="text-slate-500">ตัวชี้วัด:</span>
                  <span className="font-semibold text-slate-800 text-right max-w-md">{formData.name}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                  <span className="text-slate-500">หน่วยงาน:</span>
                  <span className="font-semibold text-indigo-600">{activeTab}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                  <span className="text-slate-500">ผลงาน (ร้อยละ):</span>
                  <span className="text-2xl font-bold text-slate-800">{currentResult.result_percentage}%</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                  <span className="text-slate-500">ระดับคะแนน:</span>
                  <span 
                    className="font-bold px-3 py-1 rounded-lg"
                    style={currentResult.score !== null && currentResult.score !== undefined ? { backgroundColor: `hsl(${Math.max(0, Math.min(120, (Number(currentResult.score) - 1) * 30))}, 80%, 95%)`, color: `hsl(${Math.max(0, Math.min(120, (Number(currentResult.score) - 1) * 30))}, 80%, 35%)` } : {}}
                  >
                    {currentResult.score !== null && currentResult.score !== undefined ? Number(currentResult.score).toFixed(4) : '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">คะแนนถ่วงน้ำหนัก:</span>
                  <span className="font-bold text-emerald-600">{currentResult.weighted_score !== null && currentResult.weighted_score !== undefined ? Number(currentResult.weighted_score).toFixed(4) : '-'}</span>
                </div>
              </div>
            </div>

            {/* History Timeline */}
            {currentResult.history && currentResult.history.length > 0 && (
              <div className="px-8 pb-8">
                <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Clock size={20} className="text-slate-400" />
                  ประวัติการบันทึก
                </h4>
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  {currentResult.history.map((hist, idx) => (
                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        {hist.status === 'ผ่าน' ? <CheckCircle2 size={16} className="text-emerald-500" /> : 
                         hist.status === 'ไม่ผ่าน' ? <XCircle size={16} className="text-rose-500" /> : 
                         hist.status === 'แก้ไข' ? <AlertCircle size={16} className="text-orange-500" /> : 
                         <Clock size={16} className="text-indigo-500" />}
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className={cn(
                            "text-xs font-bold px-2 py-0.5 rounded-md",
                            hist.status === 'ผ่าน' ? "bg-emerald-50 text-emerald-700" :
                            hist.status === 'ไม่ผ่าน' ? "bg-rose-50 text-rose-700" :
                            hist.status === 'แก้ไข' ? "bg-orange-50 text-orange-700" :
                            "bg-indigo-50 text-indigo-700"
                          )}>{hist.status}</span>
                          <time className="text-xs text-slate-400 font-medium">{new Date(hist.timestamp).toLocaleString('th-TH')}</time>
                        </div>
                        <div className="text-sm text-slate-600 mt-2">
                          <p>ผู้ทำรายการ: <strong>{hist.user}</strong></p>
                          {hist.result_percentage !== undefined && hist.result_percentage !== null && (
                            <p>ผลงาน: <strong>{hist.result_percentage}%</strong> (คะแนน: {hist.score})</p>
                          )}
                          {hist.feedback && (
                            <p className="mt-1 text-orange-600 bg-orange-50 p-2 rounded-lg border border-orange-100 text-xs">
                              <strong>ข้อเสนอแนะ:</strong> {hist.feedback}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-xl text-slate-600 font-medium hover:bg-slate-200 transition-colors flex items-center gap-2"
              >
                <ArrowLeft size={20} />
                <span>ย้อนกลับ</span>
              </button>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20 flex items-center gap-2 text-lg disabled:opacity-70"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 size={20} />
                  )}
                  <span>{isSaving ? 'กำลังส่งข้อมูล...' : 'ยืนยันการส่งข้อมูล'}</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
