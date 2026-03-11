import { useState, useEffect, useMemo } from 'react';
import { Indicator, AreaResult, AREAS, User } from '../../types';
import { ActivityTimeline } from './ActivityTimeline';
import { ArrowLeft, Save, ChevronRight, CheckCircle2, AlertCircle, Clock, XCircle, Award, Info, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import Swal from 'sweetalert2';
import { sendTelegramNotification, formatSubmissionMessage, formatProgressSummary } from '../../lib/telegram';

interface IndicatorFormProps {
  indicator: Indicator | null;
  indicators: Indicator[];
  timeframe: string;
  onClose: () => void;
  onSave: (indicator: Indicator) => void;
  user: User | null;
  isDataEntryEnabled?: boolean;
}

const calculateScore = (result: number, criteria: any) => {
  if (!criteria) return null;
  
  const parseCriteria = (val: any) => {
    if (typeof val === 'number') return val;
    if (!val) return NaN;
    // Remove non-numeric chars except dot and minus
    const str = String(val).replace(/[^0-9.-]/g, '');
    return Number(str);
  };

  const c = [
    parseCriteria(criteria["1"]),
    parseCriteria(criteria["2"]),
    parseCriteria(criteria["3"]),
    parseCriteria(criteria["4"]),
    parseCriteria(criteria["5"])
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

export function IndicatorForm({ indicator, indicators, timeframe, onClose, onSave, user, isDataEntryEnabled = true }: IndicatorFormProps) {
  const [formData, setFormData] = useState<Indicator | null>(null);
  const [activeTab, setActiveTab] = useState<string>('จังหวัด');
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [inputMode, setInputMode] = useState<'percentage' | 'fraction'>('percentage');
  const [numerator, setNumerator] = useState<string>('');
  const [denominator, setDenominator] = useState<string>('');
  const [rejectionTimeLeft, setRejectionTimeLeft] = useState<{ hours: number, minutes: number, seconds: number } | null>(null);

  const currentResult = useMemo(() => {
    if (!formData) return { status: 'รอประเมิน', rejection_deadline: null };
    return formData.results[timeframe]?.[activeTab] || { status: 'รอประเมิน', rejection_deadline: null };
  }, [formData, timeframe, activeTab]);

  useEffect(() => {
    if (currentResult.status === 'แก้ไข' && currentResult.rejection_deadline) {
      const timer = setInterval(() => {
        const now = new Date();
        const deadline = new Date(currentResult.rejection_deadline!);
        const diff = deadline.getTime() - now.getTime();

        if (diff > 0) {
          setRejectionTimeLeft({
            hours: Math.floor(diff / (1000 * 60 * 60)),
            minutes: Math.floor((diff / 1000 / 60) % 60),
            seconds: Math.floor((diff / 1000) % 60)
          });
        } else {
          setRejectionTimeLeft(null);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentResult.status, currentResult.rejection_deadline]);

  const overallProgress = useMemo(() => {
    if (!indicators || indicators.length === 0) return 0;
    const completed = indicators.filter(ind => {
      const res = ind.results[timeframe]?.['จังหวัด'];
      return res?.result_percentage !== null && res?.result_percentage !== undefined;
    }).length;
    return Math.round((completed / indicators.length) * 100);
  }, [indicators, timeframe]);

  useEffect(() => {
    if (indicator) {
      setFormData(JSON.parse(JSON.stringify(indicator))); // Deep copy
      const res = indicator.results[timeframe]?.[user?.unit || 'จังหวัด'];
      if (res?.result_count !== null && res?.target !== null) {
        setNumerator(res?.result_count?.toString() || '');
        setDenominator(res?.target?.toString() || '');
        setInputMode('fraction');
      }
    }
  }, [indicator, timeframe, user]);

  useEffect(() => {
    if (user) {
      if (user.role === 'user') {
        setActiveTab(user.unit);
      } else if (user.role === 'admin' || user.role === 'ผู้บริหาร') {
        setActiveTab('ภาพรวม');
      }
    }
  }, [user]);

  if (!formData) return null;

  const handleResultChange = (area: string, value: string, type: 'percentage' | 'numerator' | 'denominator' = 'percentage') => {
    setFormData(prev => {
      if (!prev) return prev;
      const newResults = { ...prev.results };
      if (!newResults[timeframe]) newResults[timeframe] = {};
      
      if (!newResults[timeframe][area]) {
        newResults[timeframe][area] = { area_name: area, target: null, result_count: null, result_percentage: null, score: null, weighted_score: null, status: 'รอประเมิน' };
      }
      
      const currentRes = newResults[timeframe][area];
      let newPercentage = currentRes.result_percentage;
      let newNumerator = currentRes.result_count;
      let newDenominator = currentRes.target;

      if (type === 'percentage') {
        newPercentage = value !== '' ? Number(value) : null;
      } else if (type === 'numerator') {
        newNumerator = value !== '' ? Number(value) : null;
        setNumerator(value);
      } else if (type === 'denominator') {
        newDenominator = value !== '' ? Number(value) : null;
        setDenominator(value);
      }

      // Calculate percentage if fraction mode
      if (inputMode === 'fraction') {
        if (newDenominator === 0) {
          Swal.fire({
            icon: 'warning',
            title: 'ข้อมูลไม่ถูกต้อง',
            text: 'ตัวหารไม่สามารถเป็น 0 ได้',
            confirmButtonColor: '#10b981'
          });
          newPercentage = null;
        } else if (newNumerator !== null && newDenominator !== null) {
          newPercentage = Math.round((newNumerator / newDenominator) * 10000) / 100;
        } else {
          newPercentage = null;
        }
      }

      newResults[timeframe][area] = { 
        ...currentRes, 
        result_percentage: newPercentage,
        result_count: newNumerator,
        target: newDenominator
      };

      if (newPercentage !== null) {
        const calculatedScore = calculateScore(newPercentage, prev.score_criteria);
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

  const handleNoteChange = (area: string, value: string) => {
    setFormData(prev => {
      if (!prev) return prev;
      const newResults = { ...prev.results };
      if (!newResults[timeframe]) newResults[timeframe] = {};
      
      if (!newResults[timeframe][area]) {
        newResults[timeframe][area] = { area_name: area, target: null, result_count: null, result_percentage: null, score: null, weighted_score: null, status: 'รอประเมิน', note: '' };
      }
      
      newResults[timeframe][area] = { ...newResults[timeframe][area], note: value };
      return { ...prev, results: newResults };
    });
  };

  const handleDataAsOfChange = (area: string, value: string) => {
    setFormData(prev => {
      if (!prev) return prev;
      const newResults = { ...prev.results };
      if (!newResults[timeframe]) newResults[timeframe] = {};
      
      if (!newResults[timeframe][area]) {
        newResults[timeframe][area] = { area_name: area, target: null, result_count: null, result_percentage: null, score: null, weighted_score: null, status: 'รอประเมิน', note: '', data_as_of: '' };
      }
      
      newResults[timeframe][area] = { ...newResults[timeframe][area], data_as_of: value };
      return { ...prev, results: newResults };
    });
  };

  const handleNext = () => {
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
    
    // Clear feedback and deadline when resubmitting
    if (finalData.results[timeframe][activeTab].feedback) {
      delete finalData.results[timeframe][activeTab].feedback;
    }
    if (finalData.results[timeframe][activeTab].deadline) {
      delete finalData.results[timeframe][activeTab].deadline;
    }

    // Send Telegram Notification for non-admin submissions
    if (user?.role !== 'admin') {
      try {
        const message = formatSubmissionMessage(
          formData.name,
          activeTab,
          timeframe,
          user?.username || 'Unknown'
        );
        sendTelegramNotification(message);

        // Calculate progress for summary
        const total = indicators.length;
        const completed = indicators.filter(ind => {
          const res = ind.results[timeframe]?.['จังหวัด'];
          return res?.status === 'ผ่าน' || res?.status === 'ไม่ผ่าน';
        }).length;
        
        // Count all pending across all indicators and areas
        let pending = 0;
        indicators.forEach(ind => {
          if (ind.results[timeframe]) {
            Object.values(ind.results[timeframe]).forEach((res: any) => {
              if (res.status === 'รอยืนยัน') pending++;
            });
          }
        });

        const summaryMessage = formatProgressSummary(total, completed, pending + 1);
        sendTelegramNotification(summaryMessage);
      } catch (error) {
        console.error('Error sending telegram notification:', error);
      }
    }

    await new Promise(resolve => setTimeout(resolve, 800));
    
    onSave(finalData);
    setIsSaving(false);
    onClose();
  };

  const isPHOWorkGroup = user?.role === 'กลุ่มงาน สสจ.';
  const isAssignedToPHO = indicator?.responsible_groups?.includes(user?.unit || '');
  const canPHOEdit = isPHOWorkGroup && activeTab === 'จังหวัด' && isAssignedToPHO;
  const canUserEdit = user?.role === 'user' && activeTab === user?.unit && !(currentResult.status === 'ผ่าน' || currentResult.status === 'ไม่ผ่าน' || currentResult.status === 'รอยืนยัน');
  
  const isReadOnly = !isDataEntryEnabled || !(canUserEdit || canPHOEdit || user?.role === 'admin');

  const getExcellenceCategory = (order: string | number) => {
    const num = parseFloat(order.toString());
    if ([1, 2, 3, 4, 6, 9].includes(num)) {
      return { name: 'PP&P Excellence', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', description: 'ส่งเสริมสุขภาพ ป้องกันโรค และคุ้มครองผู้บริโภคเป็นเลิศ', detail: 'เน้นการสร้างเสริมสุขภาพ การคัดกรองโรค และการจัดการปัจจัยเสี่ยง' };
    } else if ([7.1, 7.2, 8, 10, 11, 13, 15].includes(num)) {
      return { name: 'Service Excellence', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', description: 'บริการเป็นเลิศ', detail: 'เน้นคุณภาพการรักษาพยาบาล ระบบส่งต่อ ระบบบริการปฐมภูมิ และการแพทย์ทางเลือก' };
    } else if ([12].includes(num)) {
      return { name: 'People Excellence', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', description: 'บุคลากรเป็นเลิศ', detail: 'เน้นการพัฒนาศักยภาพบุคลากรทางการแพทย์ และเครือข่ายสุขภาพภาคประชาชน' };
    } else if ([5, 14, 16, 17].includes(num)) {
      return { name: 'Governance Excellence', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', description: 'บริหารจัดการเป็นเลิศ', detail: 'เน้นการบริหารจัดการที่ดี ธรรมาภิบาล และการใช้เทคโนโลยีดิจิทัล' };
    } else if (num > 17) { // Assuming indicators > 17 are Health Economy
      return { name: 'Health-Related Economy Excellence', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', description: 'เศรษฐกิจสุขภาพเป็นเลิศ', detail: 'เน้นการสร้างมูลค่าเพิ่มจากระบบสุขภาพ การท่องเที่ยวเชิงสุขภาพ และสมุนไพร' };
    }
    return { name: 'ทั่วไป', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', description: '', detail: '' };
  };

  const excellence = getExcellenceCategory(formData.order);

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
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <i className="fa-solid fa-pen-to-square text-indigo-600"></i> บันทึกผลการดำเนินงาน
          </h2>
          <p className="text-slate-500 mt-2 text-lg">
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
            className="bg-white rounded-3xl shadow-sm border border-slate-200 border-l-4 border-l-indigo-500 overflow-hidden"
          >
            <div className="p-8">
              {/* Responsible Groups Section */}
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <UserIcon size={14} className="text-indigo-500" />
                  กลุ่มงานที่รับผิดชอบ:
                </div>
                <div className="flex flex-wrap gap-2">
                  {indicator.responsible_groups?.map(group => (
                    <span key={group} className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs font-bold shadow-sm">
                      {group}
                    </span>
                  ))}
                  {(!indicator.responsible_groups || indicator.responsible_groups.length === 0) && (
                    <span className="px-3 py-1 bg-slate-50 text-slate-500 border border-slate-100 rounded-full text-xs font-medium">
                      {indicator.responsible_group || 'ไม่ระบุ'}
                    </span>
                  )}
                </div>
              </div>

              {/* Indicator Info Card */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 mb-8 border border-slate-200/60">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center font-bold text-xl text-indigo-600 shrink-0 border border-slate-100">
                    {formData.order}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                       <span className={cn("text-xs font-bold px-2 py-0.5 rounded-md border shadow-sm", excellence.bg, excellence.color, excellence.border)}>
                          {excellence.name}
                       </span>
                    </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                  <i className="fa-solid fa-chart-line text-indigo-600"></i>
                  {formData.name}
                </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-white/80 backdrop-blur-sm px-5 py-4 rounded-2xl border border-slate-200 shadow-sm">
                        <span className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">เกณฑ์เป้าหมาย (Target)</span>
                        <span className="font-bold text-slate-800 text-lg">{formData.target_criteria}</span>
                      </div>
                      <div className="bg-white/80 backdrop-blur-sm px-5 py-4 rounded-2xl border border-slate-200 shadow-sm">
                        <span className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">น้ำหนัก (Weight)</span>
                        <span className="font-bold text-slate-800 text-lg">{formData.weight}</span>
                      </div>
                      <div className="bg-white/80 backdrop-blur-sm px-5 py-4 rounded-2xl border border-slate-200 shadow-sm">
                        <span className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">คะแนนเต็ม (Max Score)</span>
                        <span className="font-bold text-slate-800 text-lg">5.00</span>
                      </div>
                      <div className="bg-white/80 backdrop-blur-sm px-5 py-4 rounded-2xl border border-slate-200 shadow-sm">
                        <span className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">กลุ่มงานรับผิดชอบ</span>
                        <span className="font-bold text-slate-800 text-sm">
                          {formData.responsible_groups && formData.responsible_groups.length > 0 
                            ? formData.responsible_groups.join(', ') 
                            : formData.responsible_group || '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4+1 Excellence Note */}
              <div className="bg-indigo-50/50 rounded-2xl p-6 mb-8 border border-indigo-100">
                <h3 className="text-sm font-bold text-indigo-800 mb-3 flex items-center gap-2">
                  <Info size={18} className="text-indigo-600" />
                  หมายเหตุ: ความหมายของ 4+1 Excellence
                </h3>
                <div className="bg-white/60 rounded-xl p-4 border border-indigo-100/50">
                   <div className="flex items-start gap-3">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0", excellence.bg, excellence.color, excellence.border, "border")}>
                        {excellence.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className={cn("font-bold text-sm mb-1", excellence.color)}>{excellence.name}</h4>
                        <p className="text-slate-700 text-sm font-medium mb-1">{excellence.description}</p>
                        <p className="text-slate-500 text-xs italic">"{excellence.detail}"</p>
                      </div>
                   </div>
                </div>
              </div>

              {/* Scoring Criteria */}
              <div className="bg-white rounded-2xl p-6 mb-8 border border-slate-200 shadow-sm">
                <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                  <i className="fa-solid fa-list-check text-indigo-600"></i>
                  เกณฑ์การให้คะแนน (Scoring Criteria)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                  {[1, 2, 3, 4, 5].map((score) => {
                    const criteriaValue = formData.score_criteria?.[score.toString() as keyof typeof formData.score_criteria];
                    return (
                      <div 
                        key={score}
                        className={cn(
                          "relative p-4 rounded-xl border flex flex-col items-center text-center transition-all hover:shadow-md",
                          score === 1 ? "bg-red-50 border-red-100 text-red-800" :
                          score === 2 ? "bg-orange-50 border-orange-100 text-orange-800" :
                          score === 3 ? "bg-yellow-50 border-yellow-100 text-yellow-800" :
                          score === 4 ? "bg-lime-50 border-lime-100 text-lime-800" :
                          "bg-emerald-50 border-emerald-100 text-emerald-800"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-2 shadow-sm shrink-0",
                          score === 1 ? "bg-red-100 text-red-600" :
                          score === 2 ? "bg-orange-100 text-orange-600" :
                          score === 3 ? "bg-yellow-100 text-yellow-600" :
                          score === 4 ? "bg-lime-100 text-lime-600" :
                          "bg-emerald-100 text-emerald-600"
                        )}>
                          {score}
                        </div>
                        <span className="text-sm font-medium break-words w-full">
                          {criteriaValue || '-'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Overall Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ความก้าวหน้าการบันทึกข้อมูลรอบ {timeframe}</span>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{overallProgress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${overallProgress}%` }}
                    className="h-full bg-indigo-600 rounded-full"
                  />
                </div>
              </div>

              {/* Area Tabs */}
              <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 pb-2 border-b border-slate-100">
                {(user?.role === 'admin' || user?.role === 'ผู้บริหาร') && (
                  <button
                    onClick={() => setActiveTab('ภาพรวม')}
                    className={cn(
                      "px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                      activeTab === 'ภาพรวม' 
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" 
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent"
                    )}
                  >
                    ภาพรวมทั้งหมด
                  </button>
                )}
                {AREAS.map(area => {
                  const isPHO = user?.role === 'กลุ่มงาน สสจ.';
                  const canAccessArea = user?.role === 'admin' || user?.role === 'ผู้บริหาร' || user?.unit === area || (isPHO && area === 'จังหวัด');
                  
                  return (
                    <button
                      key={area}
                      onClick={() => setActiveTab(area)}
                      disabled={!canAccessArea}
                      className={cn(
                        "px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                        activeTab === area 
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" 
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent",
                        !canAccessArea && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {area}
                    </button>
                  );
                })}
              </div>

              {/* Input Area */}
              {activeTab === 'ภาพรวม' ? (
                <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-slate-200">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm font-semibold">
                        <th className="p-4">หน่วยงาน</th>
                        <th className="p-4 text-center">ผลงาน (%)</th>
                        <th className="p-4 text-center">คะแนน</th>
                        <th className="p-4 text-center">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-100">
                      {AREAS.map(area => {
                        const res = formData.results[timeframe]?.[area];
                        return (
                          <tr key={area} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-medium text-slate-800">{area}</td>
                            <td className="p-4 text-center font-bold text-slate-700">
                              {res?.result_percentage !== null && res?.result_percentage !== undefined ? `${res.result_percentage}%` : '-'}
                            </td>
                            <td className="p-4 text-center">
                              <span 
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs"
                                style={res?.score !== null && res?.score !== undefined ? { backgroundColor: `hsl(${Math.max(0, Math.min(120, (Number(res.score) - 1) * 30))}, 80%, 95%)`, color: `hsl(${Math.max(0, Math.min(120, (Number(res.score) - 1) * 30))}, 80%, 35%)` } : {}}
                              >
                                {res?.score !== null && res?.score !== undefined ? Number(res.score).toFixed(2) : '-'}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className={cn(
                                "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                                res?.status === 'ผ่าน' ? 'bg-emerald-100 text-emerald-700' :
                                res?.status === 'ไม่ผ่าน' ? 'bg-rose-100 text-rose-700' :
                                res?.status === 'รอยืนยัน' ? 'bg-indigo-100 text-indigo-700' :
                                res?.status === 'แก้ไข' ? 'bg-orange-100 text-orange-700' :
                                'bg-slate-100 text-slate-700'
                              )}>
                                {res?.status || 'รอประเมิน'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
              <div className="max-w-2xl mx-auto">
                {currentResult.feedback && currentResult.status === 'แก้ไข' && (
                  <div className="mb-6 p-5 bg-gradient-to-br from-orange-50 to-rose-50 border border-orange-200 rounded-3xl shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                        <AlertCircle size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-base font-bold text-orange-900">การส่งข้อมูลถูกปฏิเสธ (โปรดแก้ไข)</h4>
                          {currentResult.rejection_time && (
                            <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-lg border border-slate-100">
                              ปฏิเสธเมื่อ: {new Date(currentResult.rejection_time).toLocaleString('th-TH')}
                            </span>
                          )}
                        </div>
                        <div className="bg-white/60 p-3 rounded-xl border border-orange-100/50 text-sm text-slate-700 mb-4">
                          <span className="font-bold text-orange-800">เหตุผล:</span> {currentResult.feedback}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4">
                          {currentResult.ppho_work_group && (
                            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm">
                              <UserIcon size={14} className="text-indigo-500" />
                              <span className="text-xs font-bold text-slate-600">กลุ่มงานที่ตรวจสอบ:</span>
                              <span className="text-xs font-bold text-indigo-700">{currentResult.ppho_work_group}</span>
                            </div>
                          )}
                          
                          {currentResult.rejection_deadline && (
                            <div className={cn(
                              "flex items-center gap-3 px-4 py-2 rounded-xl border shadow-sm transition-all",
                              rejectionTimeLeft ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-slate-100 border-slate-200 text-slate-500"
                            )}>
                              <Clock size={16} className={cn(rejectionTimeLeft && "animate-pulse")} />
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase leading-none mb-1">เวลาที่เหลือในการแก้ไข</span>
                                <div className="text-sm font-bold leading-none">
                                  {rejectionTimeLeft ? (
                                    `${rejectionTimeLeft.hours.toString().padStart(2, '0')}:${rejectionTimeLeft.minutes.toString().padStart(2, '0')}:${rejectionTimeLeft.seconds.toString().padStart(2, '0')}`
                                  ) : (
                                    'หมดเวลา'
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mb-8">
                  <div className="flex justify-center gap-4 mb-6">
                    <button
                      onClick={() => setInputMode('percentage')}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-bold transition-all border",
                        inputMode === 'percentage' 
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md" 
                          : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      กรอกเป็นร้อยละ
                    </button>
                    <button
                      onClick={() => setInputMode('fraction')}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-bold transition-all border",
                        inputMode === 'fraction' 
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md" 
                          : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      กรอกเป็นตัวตั้ง/ตัวหาร
                    </button>
                  </div>

                  {inputMode === 'percentage' ? (
                    <div className="space-y-4">
                      <label htmlFor="result_percentage" className="block text-center text-lg font-semibold text-slate-700">
                        กรอกผลงาน (ร้อยละ)
                      </label>
                      <div className="relative max-w-xs mx-auto">
                        <input
                          type="number"
                          id="result_percentage"
                          value={currentResult.result_percentage ?? ''}
                          onChange={(e) => handleResultChange(activeTab, e.target.value, 'percentage')}
                          disabled={isReadOnly}
                          className="block w-full text-center text-5xl font-bold text-indigo-600 bg-indigo-50/50 border-2 border-indigo-100 rounded-3xl py-6 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed"
                          placeholder="0.00"
                          step="0.01"
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-indigo-300 pointer-events-none">%</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-md mx-auto">
                        <div className="space-y-2">
                          <label className="block text-sm font-bold text-slate-600 text-center">ตัวตั้ง (Numerator)</label>
                          <input
                            type="number"
                            value={numerator}
                            onChange={(e) => handleResultChange(activeTab, e.target.value, 'numerator')}
                            disabled={isReadOnly}
                            className="block w-full text-center text-3xl font-bold text-indigo-600 bg-indigo-50/50 border-2 border-indigo-100 rounded-2xl py-4 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-bold text-slate-600 text-center">ตัวหาร (Denominator)</label>
                          <input
                            type="number"
                            value={denominator}
                            onChange={(e) => handleResultChange(activeTab, e.target.value, 'denominator')}
                            disabled={isReadOnly}
                            className="block w-full text-center text-3xl font-bold text-indigo-600 bg-indigo-50/50 border-2 border-indigo-100 rounded-2xl py-4 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-slate-600 font-bold text-sm">
                          <span>ผลลัพธ์ที่คำนวณได้:</span>
                          <span className="text-indigo-600 text-lg">{currentResult.result_percentage ?? '0'}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Auto-calculated Results */}
                <div className="grid grid-cols-2 gap-6 mb-8">
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

                {/* Data as of */}
                <div className="mb-6">
                  <label htmlFor="data_as_of" className="block text-sm font-medium text-slate-700 mb-2">
                    ข้อมูล ณ วันที่
                  </label>
                  <input
                    type="date"
                    id="data_as_of"
                    value={currentResult.data_as_of || ''}
                    onChange={(e) => handleDataAsOfChange(activeTab, e.target.value)}
                    disabled={isReadOnly}
                    className="block w-full max-w-xs rounded-xl border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 bg-slate-50 disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Optional Note */}
                <div className="mb-8">
                  <label htmlFor="note" className="block text-sm font-medium text-slate-700 mb-2">
                    คำอธิบายเพิ่มเติม (Optional)
                  </label>
                  <textarea
                    id="note"
                    rows={4}
                    value={currentResult.note || ''}
                    onChange={(e) => handleNoteChange(activeTab, e.target.value)}
                    disabled={isReadOnly}
                    className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-4 bg-slate-50 disabled:opacity-70 disabled:cursor-not-allowed"
                    placeholder="ระบุรายละเอียดเพิ่มเติม..."
                  />
                </div>
              </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl text-slate-600 font-medium hover:bg-slate-200 transition-colors"
              >
                {activeTab === 'ภาพรวม' ? 'ปิด' : 'ยกเลิก'}
              </button>
              {activeTab !== 'ภาพรวม' && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20 flex items-center gap-2 text-lg"
                >
                  <span>ถัดไป</span>
                  <ChevronRight size={20} />
                </button>
              )}
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
                <h3 className="text-3xl font-bold text-slate-800 flex items-center justify-center gap-3">
                  <i className="fa-solid fa-clipboard-check text-emerald-600"></i>
                  ตรวจสอบข้อมูลก่อนส่ง
                </h3>
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
                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                  <span className="text-slate-500">คะแนนถ่วงน้ำหนัก:</span>
                  <span className="font-bold text-emerald-600">{currentResult.weighted_score !== null && currentResult.weighted_score !== undefined ? Number(currentResult.weighted_score).toFixed(4) : '-'}</span>
                </div>
                {currentResult.note && (
                  <div className="flex flex-col gap-2 pt-2">
                    <span className="text-slate-500">คำอธิบายเพิ่มเติม:</span>
                    <p className="text-slate-800 bg-white p-3 rounded-lg border border-slate-200 text-sm">
                      {currentResult.note}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* History Timeline */}
            {currentResult.history && currentResult.history.length > 0 && (
              <div className="px-8 pb-8">
                <h4 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <i className="fa-solid fa-history text-indigo-500"></i>
                  ประวัติการบันทึกและการตรวจสอบ
                </h4>
                <div className="max-w-3xl mx-auto py-6">
                  <ActivityTimeline history={currentResult.history || []} />
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
                  <span>{isSaving ? 'กำลังส่งข้อมูล...' : (currentResult.result_percentage !== null ? 'อัปเดตข้อมูล' : 'ยืนยันการส่งข้อมูล')}</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
