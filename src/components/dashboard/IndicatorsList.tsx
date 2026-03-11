import { useState, useMemo, useEffect } from 'react';
import { Indicator, AREAS, User, TIMEFRAMES } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { Edit2, Search, Filter, Plus, CheckCircle2, XCircle, Clock, ArrowUpDown, Info, ChevronDown, ChevronUp, ShieldCheck, AlertCircle, History, RotateCcw, ExternalLink, Trash2, Send } from 'lucide-react';
import { cn } from '../../lib/utils';
import Swal from 'sweetalert2';
import { CustomSelect } from '../common/CustomSelect';
import { useWorkGroups } from '../../hooks/useWorkGroups';
import { sendTelegramNotification, formatProgressSummary } from '../../lib/telegram';

interface IndicatorsListProps {
  data: Indicator[];
  fiscalYear: string;
  timeframe: string;
  onEdit: (indicator: Indicator) => void;
  onVerify?: (indicator: Indicator, area: string, status: 'ผ่าน' | 'ไม่ผ่าน' | 'รอประเมิน' | 'รอยืนยัน' | 'แก้ไข', feedback?: string) => void;
  onAddMaster?: () => void;
  onEditMaster?: (indicator: Indicator) => void;
  onDeleteMaster?: (id: string) => void;
  onFiscalYearChange?: (year: string) => void;
  onTimeframeChange?: (timeframe: string) => void;
  user: User | null;
  isDataEntryEnabled?: boolean;
}

type SortOption = 'order' | 'name' | 'score';

const FISCAL_YEARS = ['2567', '2568', '2569'];

export function IndicatorsList({ 
  data, 
  fiscalYear, 
  timeframe, 
  onEdit, 
  onVerify, 
  onAddMaster, 
  onEditMaster, 
  onDeleteMaster,
  onFiscalYearChange,
  onTimeframeChange,
  user,
  isDataEntryEnabled = true
}: IndicatorsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('จังหวัด');
  const [statusFilter, setStatusFilter] = useState<string>('ทั้งหมด');
  const [responsibleGroupFilter, setResponsibleGroupFilter] = useState<string>('ทั้งหมด');
  const [scoreFilter, setScoreFilter] = useState<string>('ทั้งหมด');
  const [excellenceFilter, setExcellenceFilter] = useState<string>('ทั้งหมด');
  const [sortBy, setSortBy] = useState<SortOption>('order');
  const [showInfo, setShowInfo] = useState(false);
  const { workGroups } = useWorkGroups();

  useEffect(() => {
    if (user?.role === 'user' && user.unit) {
      setSelectedArea(user.unit);
    }
  }, [user]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ทั้งหมด');
    setResponsibleGroupFilter('ทั้งหมด');
    setScoreFilter('ทั้งหมด');
    setExcellenceFilter('ทั้งหมด');
    setSortBy('order');
  };

  const filteredAndSortedData = useMemo(() => {
    let result = data.filter(d => d.fiscal_year === fiscalYear);

    // Filter by search term (Name, Code/Order, Work Group)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(d => 
        d.name.toLowerCase().includes(term) || 
        d.order.toString().includes(term) ||
        d.responsible_group.toLowerCase().includes(term) ||
        d.responsible_groups?.some(g => g.toLowerCase().includes(term))
      );
    }

    // Filter by responsible group
    if (responsibleGroupFilter !== 'ทั้งหมด') {
      result = result.filter(d => 
        d.responsible_group === responsibleGroupFilter || 
        d.responsible_groups?.includes(responsibleGroupFilter)
      );
    }

    // Filter by excellence
    if (excellenceFilter !== 'ทั้งหมด') {
      result = result.filter(d => {
        if (d.excellence_category) {
          return d.excellence_category === excellenceFilter;
        }
        // Fallback to orderNum logic if category is not set
        const orderNum = parseFloat(d.order.toString());
        switch (excellenceFilter) {
          case 'PP&P Excellence': return [1, 2, 3, 4, 6, 9].includes(orderNum);
          case 'Service Excellence': return [7.1, 7.2, 8, 10, 11, 13, 15].includes(orderNum);
          case 'People Excellence': return [12].includes(orderNum);
          case 'Governance Excellence': return [5, 14, 16, 17].includes(orderNum);
          default: return true;
        }
      });
    }

    // Filter by status and score
    result = result.filter(d => {
      const res = d.results[timeframe]?.[selectedArea];
      const status = res?.status || 'รอประเมิน';
      const score = res?.score ?? 0;

      // Status filter
      if (statusFilter !== 'ทั้งหมด') {
        if (statusFilter === 'ยังไม่บันทึก' && status !== 'รอประเมิน') return false;
        if (statusFilter === 'ไม่ผ่านเกณฑ์' && status !== 'ไม่ผ่าน') return false;
        if (statusFilter !== 'ยังไม่บันทึก' && statusFilter !== 'ไม่ผ่านเกณฑ์' && status !== statusFilter) return false;
      }

      // Score filter
      if (scoreFilter !== 'ทั้งหมด') {
        if (scoreFilter === '5' && score !== 5) return false;
        if (scoreFilter === '4' && score !== 4) return false;
        if (scoreFilter === '3' && score !== 3) return false;
        if (scoreFilter === '2' && score !== 2) return false;
        if (scoreFilter === '1' && score !== 1) return false;
        if (scoreFilter === '<3' && score >= 3) return false;
        if (scoreFilter === '>=3' && score < 3) return false;
      }

      return true;
    });

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'order') {
        const orderA = a.order?.toString() || '';
        const orderB = b.order?.toString() || '';
        return orderA.localeCompare(orderB, undefined, { numeric: true, sensitivity: 'base' });
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name, 'th');
      } else if (sortBy === 'score') {
        const scoreA = a.results[timeframe]?.[selectedArea]?.score ?? -1;
        const scoreB = b.results[timeframe]?.[selectedArea]?.score ?? -1;
        return scoreB - scoreA; // Descending score
      }
      return 0;
    });

    return result;
  }, [data, fiscalYear, timeframe, selectedArea, searchTerm, statusFilter, responsibleGroupFilter, scoreFilter, excellenceFilter, sortBy]);

  const progress = useMemo(() => {
    if (filteredAndSortedData.length === 0) return 0;
    const recorded = filteredAndSortedData.filter(d => {
      const res = d.results[timeframe]?.[selectedArea];
      return res && res.status !== 'รอประเมิน';
    }).length;
    return Math.round((recorded / filteredAndSortedData.length) * 100);
  }, [filteredAndSortedData, timeframe, selectedArea]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ผ่าน': return <CheckCircle2 size={14} className="text-emerald-500" />;
      case 'ไม่ผ่าน': return <XCircle size={14} className="text-rose-500" />;
      case 'รอยืนยัน': return <ShieldCheck size={14} className="text-indigo-500" />;
      case 'แก้ไข': return <AlertCircle size={14} className="text-orange-500" />;
      case 'กำลังดำเนินการ': return <Clock size={14} className="text-blue-500" />;
      default: return <Clock size={14} className="text-slate-400" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'ผ่าน': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'ไม่ผ่าน': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'รอยืนยัน': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'แก้ไข': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'กำลังดำเนินการ': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === 'รอประเมิน') return 'รอการประเมิน';
    return status;
  };

  const getRowBackground = (status: string) => {
    switch (status) {
      case 'ผ่าน': return 'bg-emerald-50/30 hover:bg-emerald-50/60';
      case 'ไม่ผ่าน': return 'bg-rose-50/30 hover:bg-rose-50/60';
      case 'รอยืนยัน': return 'bg-indigo-50/30 hover:bg-indigo-50/60';
      case 'แก้ไข': return 'bg-orange-50/30 hover:bg-orange-50/60';
      default: return 'hover:bg-slate-50/80';
    }
  };

  const getExcellenceCategory = (indicator: Indicator) => {
    if (indicator.excellence_category) {
      switch (indicator.excellence_category) {
        case 'PP&P Excellence': return { name: 'PP&P Excellence', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', description: 'ส่งเสริมสุขภาพ ป้องกันโรค และคุ้มครองผู้บริโภคเป็นเลิศ' };
        case 'Service Excellence': return { name: 'Service Excellence', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', description: 'บริการเป็นเลิศ' };
        case 'People Excellence': return { name: 'People Excellence', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', description: 'บุคลากรเป็นเลิศ' };
        case 'Governance Excellence': return { name: 'Governance Excellence', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', description: 'บริหารจัดการเป็นเลิศ' };
        case 'Health-Related Economy Excellence': return { name: 'Health-Related Economy Excellence', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', description: 'เศรษฐกิจสุขภาพเป็นเลิศ' };
        // Backward compatibility
        case 'PP Excellence': return { name: 'PP&P Excellence', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', description: 'ส่งเสริมสุขภาพ ป้องกันโรค และคุ้มครองผู้บริโภคเป็นเลิศ' };
        case 'Special Excellence': return { name: 'Health-Related Economy Excellence', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', description: 'เศรษฐกิจสุขภาพเป็นเลิศ' };
        case 'Health Economy': return { name: 'Health-Related Economy Excellence', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', description: 'เศรษฐกิจสุขภาพเป็นเลิศ' };
        case 'Local Health': return { name: 'Health-Related Economy Excellence', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', description: 'เศรษฐกิจสุขภาพเป็นเลิศ' };
      }
    }
    
    // Fallback
    const num = parseFloat(indicator.order.toString());
    if ([1, 2, 3, 4, 6, 9].includes(num)) {
      return { name: 'PP&P Excellence', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', description: 'ส่งเสริมสุขภาพ ป้องกันโรค และคุ้มครองผู้บริโภคเป็นเลิศ' };
    } else if ([7.1, 7.2, 8, 10, 11, 13, 15].includes(num)) {
      return { name: 'Service Excellence', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', description: 'บริการเป็นเลิศ' };
    } else if ([12].includes(num)) {
      return { name: 'People Excellence', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', description: 'บุคลากรเป็นเลิศ' };
    } else if ([5, 14, 16, 17].includes(num)) {
      return { name: 'Governance Excellence', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', description: 'บริหารจัดการเป็นเลิศ' };
    }
    return { name: 'ทั่วไป', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', description: '' };
  };

  const getScoreStyle = (score: number | null | undefined) => {
    if (score === null || score === undefined || isNaN(score)) return {};
    if (score === 5) return { backgroundColor: '#10b981', color: 'white', borderColor: '#059669' }; // Emerald-500
    if (score === 4) return { backgroundColor: '#34d399', color: 'white', borderColor: '#10b981' }; // Emerald-400
    if (score === 3) return { backgroundColor: '#fbbf24', color: 'white', borderColor: '#f59e0b' }; // Amber-400
    if (score === 2) return { backgroundColor: '#f87171', color: 'white', borderColor: '#ef4444' }; // Red-400
    if (score === 1) return { backgroundColor: '#ef4444', color: 'white', borderColor: '#dc2626' }; // Red-500
    return { backgroundColor: '#f1f5f9', color: '#64748b', borderColor: '#cbd5e1' };
  };

  const handleViewHistory = (item: Indicator) => {
    const history = item.results[timeframe]?.[selectedArea]?.history || [];
    
    if (history.length === 0) {
      Swal.fire({
        title: 'ไม่พบประวัติการแก้ไข',
        icon: 'info',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#10b981'
      });
      return;
    }

    const historyHtml = history.map((h: any) => `
      <div class="text-left border-b border-slate-100 py-3 last:border-0">
        <div class="flex justify-between items-center mb-1">
          <span class="font-semibold text-xs text-slate-500">${new Date(h.timestamp).toLocaleString('th-TH')}</span>
          <span class="text-xs px-2 py-0.5 rounded-full ${
            h.status === 'ผ่าน' ? 'bg-emerald-100 text-emerald-700' :
            h.status === 'ไม่ผ่าน' ? 'bg-rose-100 text-rose-700' :
            h.status === 'รอยืนยัน' ? 'bg-indigo-100 text-indigo-700' :
            h.status === 'แก้ไข' ? 'bg-orange-100 text-orange-700' :
            'bg-slate-100 text-slate-700'
          }">${h.status}</span>
        </div>
        <div class="text-sm text-slate-700">
          <div class="flex items-center gap-2 mb-1">
            <span class="font-medium text-slate-900">ผู้ดำเนินการ:</span> ${h.user}
          </div>
          ${h.score !== undefined && h.score !== null ? `<div class="mb-1"><span class="font-medium text-slate-900">คะแนน:</span> ${h.score}</div>` : ''}
          ${h.result_percentage ? `<div class="mb-1"><span class="font-medium text-slate-900">ผลงาน:</span> ${h.result_percentage}%</div>` : ''}
          ${h.feedback ? `<div class="bg-slate-50 p-2 rounded text-slate-600 mt-1"><span class="font-medium text-slate-900">ข้อเสนอแนะ:</span> ${h.feedback}</div>` : ''}
        </div>
      </div>
    `).join('');

    Swal.fire({
      title: 'ประวัติการดำเนินการ',
      html: `<div class="max-h-[400px] overflow-y-auto px-1">${historyHtml}</div>`,
      confirmButtonText: 'ปิด',
      confirmButtonColor: '#64748b',
      width: '500px'
    });
  };

  const handleSendProgressSummary = async () => {
    try {
      const total = data.length;
      const completed = data.filter(ind => {
        const res = ind.results[timeframe]?.['จังหวัด'];
        return res?.status === 'ผ่าน' || res?.status === 'ไม่ผ่าน';
      }).length;
      
      let pending = 0;
      data.forEach(ind => {
        if (ind.results[timeframe]) {
          Object.values(ind.results[timeframe]).forEach((res: any) => {
            if (res.status === 'รอยืนยัน') pending++;
          });
        }
      });

      const message = formatProgressSummary(total, completed, pending);
      await sendTelegramNotification(message);

      Swal.fire({
        icon: 'success',
        title: 'ส่งสรุปความก้าวหน้าสำเร็จ',
        text: 'ส่งข้อมูลไปยัง Telegram เรียบร้อยแล้ว',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error sending progress summary:', error);
      Swal.fire({
        icon: 'error',
        title: 'ส่งไม่สำเร็จ',
        text: 'เกิดข้อผิดพลาดในการส่งข้อมูลไปยัง Telegram',
        confirmButtonColor: '#10b981'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">จัดการตัวชี้วัด MOU</h2>
            <button 
              onClick={() => setShowInfo(!showInfo)}
              className={cn(
                "flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full transition-all duration-200 border",
                showInfo 
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm" 
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200"
              )}
              aria-label="แสดงความหมายของ 4+1 Excellence"
            >
              <Info size={16} />
              <span className="font-medium">4+1 Excellence</span>
              {showInfo ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
          <p className="text-slate-500 mt-1">บันทึกและแก้ไขผลการดำเนินงาน ปีงบประมาณ {fiscalYear} | รอบ: <span className="font-semibold text-emerald-600">{timeframe}</span></p>
        </div>
        <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex-1 sm:w-48">
              <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                <span>ความก้าวหน้าการบันทึก</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-emerald-500"
                />
              </div>
            </div>
            {user?.role === 'admin' && (
              <div className="flex gap-2">
                <button 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm shadow-emerald-600/20"
                  onClick={() => onAddMaster?.()}
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">เพิ่มตัวชี้วัด</span>
                </button>
                <button 
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm active:scale-95"
                  onClick={handleSendProgressSummary}
                  title="ส่งสรุปความก้าวหน้าไปยัง Telegram"
                >
                  <Send size={18} className="text-indigo-600" />
                  <span className="hidden sm:inline">ส่งสรุป (TG)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100/50 rounded-2xl p-5 shadow-sm">
              <h3 className="text-indigo-800 font-bold mb-4 flex items-center gap-2 text-lg">
                <Info size={20} className="text-indigo-600" />
                หมายเหตุ: ความหมายของ 4+1 Excellence
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* PP&P Excellence */}
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-emerald-100 hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-emerald-700 mb-1 flex items-center gap-2">
                    <span className="bg-emerald-100 text-emerald-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                    PP&P Excellence
                  </h4>
                  <p className="text-emerald-600/80 text-xs mb-2 font-medium">(ส่งเสริมสุขภาพ ป้องกันโรค และคุ้มครองผู้บริโภคเป็นเลิศ)</p>
                  <p className="text-slate-700 text-sm mb-3 italic bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/50">
                    "เน้นการสร้างเสริมสุขภาพ การคัดกรองโรค และการจัดการปัจจัยเสี่ยง"
                  </p>
                </div>
                
                {/* Service Excellence */}
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-blue-700 mb-1 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                    Service Excellence
                  </h4>
                  <p className="text-blue-600/80 text-xs mb-2 font-medium">(บริการเป็นเลิศ)</p>
                  <p className="text-slate-700 text-sm mb-3 italic bg-blue-50/50 p-2 rounded-lg border border-blue-100/50">
                    "เน้นคุณภาพการรักษาพยาบาล ระบบส่งต่อ ระบบบริการปฐมภูมิ และการแพทย์ทางเลือก"
                  </p>
                </div>

                {/* People Excellence */}
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-amber-100 hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-amber-700 mb-1 flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                    People Excellence
                  </h4>
                  <p className="text-amber-600/80 text-xs mb-2 font-medium">(บุคลากรเป็นเลิศ)</p>
                  <p className="text-slate-700 text-sm mb-3 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100/50">
                    "เน้นการพัฒนาศักยภาพบุคลากรทางการแพทย์ และเครือข่ายสุขภาพภาคประชาชน"
                  </p>
                </div>

                {/* Governance Excellence */}
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-purple-100 hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-purple-700 mb-1 flex items-center gap-2">
                    <span className="bg-purple-100 text-purple-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                    Governance Excellence
                  </h4>
                  <p className="text-purple-600/80 text-xs mb-2 font-medium">(บริหารจัดการเป็นเลิศ)</p>
                  <p className="text-slate-700 text-sm mb-3 italic bg-purple-50/50 p-2 rounded-lg border border-purple-100/50">
                    "เน้นการบริหารจัดการที่ดี ธรรมาภิบาล และการใช้เทคโนโลยีดิจิทัล"
                  </p>
                </div>

                {/* Special Excellence */}
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-rose-100 hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-rose-700 mb-1 flex items-center gap-2">
                    <span className="bg-rose-100 text-rose-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">+1</span>
                    Health Economy
                  </h4>
                  <p className="text-rose-600/80 text-xs mb-2 font-medium">(เศรษฐกิจสุขภาพเป็นเลิศ)</p>
                  <p className="text-slate-700 text-sm mb-3 italic bg-rose-50/50 p-2 rounded-lg border border-rose-100/50">
                    "เน้นการสร้างมูลค่าเพิ่มจากระบบสุขภาพ การท่องเที่ยวเชิงสุขภาพ และสมุนไพร"
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-indigo-100">
                <h3 className="text-slate-800 font-bold mb-3 text-sm">เกณฑ์การให้คะแนน (Scoring Criteria)</h3>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">5</span>
                    <span className="text-xs text-slate-600">ดีเยี่ยม (Excellent)</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                    <span className="w-6 h-6 rounded-full bg-emerald-400 text-white flex items-center justify-center text-xs font-bold">4</span>
                    <span className="text-xs text-slate-600">ดีมาก (Very Good)</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                    <span className="w-6 h-6 rounded-full bg-amber-400 text-white flex items-center justify-center text-xs font-bold">3</span>
                    <span className="text-xs text-slate-600">ดี (Good) - ผ่านเกณฑ์</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                    <span className="w-6 h-6 rounded-full bg-red-400 text-white flex items-center justify-center text-xs font-bold">2</span>
                    <span className="text-xs text-slate-600">พอใช้ (Fair) - ต่ำกว่าเกณฑ์</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                    <span className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold">1</span>
                    <span className="text-xs text-slate-600">ปรับปรุง (Poor)</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="ค้นหาชื่อตัวชี้วัด, ลำดับ, หรือกลุ่มงาน..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm"
              />
            </div>
            
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <div className="text-sm font-bold text-slate-500 mr-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
              พบ <span className="text-emerald-600">{filteredAndSortedData.length}</span> รายการ
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStatusFilter('ยังไม่บันทึก')}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl transition-all shadow-sm border",
                  statusFilter === 'ยังไม่บันทึก' 
                    ? "bg-amber-100 text-amber-700 border-amber-200 ring-2 ring-amber-500/20" 
                    : "bg-white text-amber-600 border-amber-100 hover:bg-amber-50"
                )}
              >
                <AlertCircle size={14} />
                <span>ยังไม่บันทึก</span>
              </button>
              <button
                onClick={() => setStatusFilter('ไม่ผ่านเกณฑ์')}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl transition-all shadow-sm border",
                  statusFilter === 'ไม่ผ่านเกณฑ์' 
                    ? "bg-rose-100 text-rose-700 border-rose-200 ring-2 ring-rose-500/20" 
                    : "bg-white text-rose-600 border-rose-100 hover:bg-rose-50"
                )}
              >
                <XCircle size={14} />
                <span>ไม่ผ่านเกณฑ์</span>
              </button>
              
              <div className="h-6 w-px bg-slate-200 mx-1"></div>
              
              <select
                value={excellenceFilter}
                onChange={(e) => setExcellenceFilter(e.target.value)}
                className="px-3 py-2 text-xs font-bold rounded-xl transition-all shadow-sm border bg-white text-slate-600 border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              >
                <option value="ทั้งหมด">4+1 Excellence (ทั้งหมด)</option>
                <option value="PP&P Excellence">PP&P Excellence</option>
                <option value="Service Excellence">Service Excellence</option>
                <option value="People Excellence">People Excellence</option>
                <option value="Governance Excellence">Governance Excellence</option>
                <option value="Health-Related Economy Excellence">Health-Related Economy Excellence (+1)</option>
              </select>
            </div>

            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-sm ml-auto lg:ml-0"
            >
              <RotateCcw size={16} />
              <span>ล้างตัวกรอง</span>
            </button>
          </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
            <div className="col-span-1">
              <CustomSelect
                label="พื้นที่:"
                value={selectedArea}
                onChange={setSelectedArea}
                options={AREAS.map(area => ({ value: area, label: area }))}
                disabled={user?.role === 'user'}
                icon={Filter}
              />
            </div>

            <div className="col-span-1">
              <CustomSelect
                label="กลุ่มงาน:"
                value={responsibleGroupFilter}
                onChange={setResponsibleGroupFilter}
                options={[
                  { value: 'ทั้งหมด', label: 'ทั้งหมด' },
                  ...workGroups.map(group => ({ value: group.name, label: group.name }))
                ]}
              />
            </div>

            <div className="col-span-1">
              <CustomSelect
                label="สถานะ:"
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'ทั้งหมด', label: 'ทั้งหมด' },
                  { value: 'ยังไม่บันทึก', label: 'ยังไม่บันทึก (Unfilled)', className: 'text-amber-600 font-bold' },
                  { value: 'ไม่ผ่านเกณฑ์', label: 'ไม่ผ่านเกณฑ์ (Failed)', className: 'text-rose-600 font-bold' },
                  { value: 'ผ่าน', label: 'ผ่าน', className: 'text-emerald-600' },
                  { value: 'รอยืนยัน', label: 'รอยืนยัน', className: 'text-indigo-600' },
                  { value: 'แก้ไข', label: 'แก้ไข', className: 'text-orange-600' },
                ]}
              />
            </div>

            <div className="col-span-1">
              <CustomSelect
                label="4+1 Excellence:"
                value={excellenceFilter}
                onChange={setExcellenceFilter}
                options={[
                  { value: 'ทั้งหมด', label: 'ทั้งหมด' },
                  { value: 'PP&P Excellence', label: 'PP&P Excellence', className: 'text-emerald-600 font-bold' },
                  { value: 'Service Excellence', label: 'Service Excellence', className: 'text-blue-600 font-bold' },
                  { value: 'People Excellence', label: 'People Excellence', className: 'text-amber-600 font-bold' },
                  { value: 'Governance Excellence', label: 'Governance Excellence', className: 'text-purple-600 font-bold' },
                  { value: 'Health-Related Economy Excellence', label: 'Health-Related Economy Excellence (+1)', className: 'text-rose-600 font-bold' },
                ]}
              />
            </div>

            <div className="col-span-1">
              <CustomSelect
                label="รอบการประเมิน:"
                value={timeframe}
                onChange={(val) => onTimeframeChange?.(val)}
                options={TIMEFRAMES.map(tf => ({ value: tf, label: tf }))}
              />
            </div>

            <div className="col-span-1">
              <CustomSelect
                label="ปีงบประมาณ:"
                value={fiscalYear}
                onChange={(val) => onFiscalYearChange?.(val)}
                options={FISCAL_YEARS.map(year => ({ value: year, label: `ปี ${year}` }))}
              />
            </div>

            <div className="col-span-1">
              <CustomSelect
                label="เรียงลำดับ:"
                value={sortBy}
                onChange={(val) => setSortBy(val as SortOption)}
                options={[
                  { value: 'order', label: 'ตามลำดับ' },
                  { value: 'name', label: 'ตามชื่อ (ก-ฮ)' },
                  { value: 'score', label: 'ตามคะแนน' },
                ]}
                icon={ArrowUpDown}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-[calc(100vh-300px)] overflow-y-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="sticky top-0 z-20">
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm font-semibold shadow-sm">
                <th className="p-4 w-16 text-center bg-slate-50 border-b border-slate-200">ลำดับ</th>
                <th className="p-4 min-w-[300px] bg-slate-50 border-b border-slate-200">รายละเอียดตัวชี้วัด</th>
                <th className="p-4 w-24 text-center bg-slate-50 border-b border-slate-200">น้ำหนัก</th>
                <th className="p-4 w-24 text-center bg-slate-50 border-b border-slate-200">คะแนนเต็ม</th>
                <th className="p-4 w-24 text-center bg-slate-50 border-b border-slate-200">ผลงาน (%)</th>
                <th className="p-4 w-24 text-center bg-slate-50 border-b border-slate-200">คะแนน</th>
                <th className="p-4 w-32 text-center bg-slate-50 border-b border-slate-200">สถานะ</th>
                <th className="p-4 w-32 text-center bg-slate-50 border-b border-slate-200">จัดการ</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <AnimatePresence>
                {filteredAndSortedData.length > 0 ? (
                  filteredAndSortedData.map((item, index) => {
                    const result = item.results[timeframe]?.[selectedArea] || { target: null, result_percentage: null, score: null, weighted_score: null, status: 'รอประเมิน' };
                    const excellence = getExcellenceCategory(item);
                    
                    return (
                      <motion.tr 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
                        key={item.id} 
                        className={cn(
                          "group transition-all duration-200 border-b border-slate-100",
                          index % 2 === 0 ? "bg-white" : "bg-slate-50/30",
                          "hover:bg-indigo-50/40"
                        )}
                      >
                        <td className="p-4 text-center font-bold text-slate-400 align-top pt-6">
                          {item.order}
                        </td>
                        <td className="p-4 align-top">
                          {/* Top Level: Name and Description */}
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span 
                                className={cn("text-[10px] font-bold px-2 py-1 rounded-lg border shadow-sm cursor-help transition-transform hover:scale-105", excellence.bg, excellence.color, excellence.border)}
                                title={excellence.description}
                              >
                                {excellence.name}
                              </span>
                              {item.responsible_groups?.map(group => {
                                const groupInfo = workGroups.find(g => g.name === group);
                                return (
                                  <span 
                                    key={group} 
                                    className={cn(
                                      "text-[10px] font-bold px-2 py-1 rounded-lg border shadow-sm transition-transform hover:scale-105", 
                                      groupInfo?.color ? `bg-${groupInfo.color.split('-')[1]}-50 text-${groupInfo.color.split('-')[1]}-700 border-${groupInfo.color.split('-')[1]}-200` : "bg-slate-50 text-slate-700 border-slate-200"
                                    )}
                                  >
                                    {group}
                                  </span>
                                );
                              })}
                            </div>
                            <div className="relative group/name">
                              <h3 
                                className="text-slate-800 font-bold text-base leading-snug group-hover/name:text-emerald-600 transition-colors cursor-help"
                                title={item.name}
                              >
                                {item.name.length > 80 ? `${item.name.substring(0, 80)}...` : item.name}
                              </h3>
                              {item.target_criteria && (
                                <div className="mt-1 text-xs text-slate-500 line-clamp-1 hover:line-clamp-none transition-all cursor-help flex items-center gap-1" title={item.target_criteria}>
                                  <Info size={12} className="shrink-0" />
                                  <span>เกณฑ์: {item.target_criteria}</span>
                                </div>
                              )}
                              {item.targets && Object.keys(item.targets).length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {item.targets['6_months'] && (
                                    <span className="text-[10px] font-bold px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg">
                                      เป้า 6 เดือน: {item.targets['6_months']}
                                    </span>
                                  )}
                                  {item.targets['9_months'] && (
                                    <span className="text-[10px] font-bold px-2 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg">
                                      เป้า 9 เดือน: {item.targets['9_months']}
                                    </span>
                                  )}
                                  {item.targets['12_months'] && (
                                    <span className="text-[10px] font-bold px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg">
                                      เป้า 12 เดือน: {item.targets['12_months']}
                                    </span>
                                  )}
                                </div>
                              )}
                              {item.data_source && (
                                <a 
                                  href={item.data_source} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-lg transition-colors w-fit"
                                >
                                  <ExternalLink size={12} />
                                  แหล่งข้อมูลอ้างอิง
                                </a>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Bottom Level Numerical Data (using same row but grouped visually) */}
                        <td className="p-4 text-center align-middle">
                          <span className="font-semibold text-slate-600">{item.weight}</span>
                        </td>
                        <td className="p-4 text-center align-middle">
                          <span className="font-semibold text-slate-600">{item.max_score || 5}</span>
                        </td>
                        <td className="p-4 text-center align-middle">
                          <div className="flex flex-col items-center gap-1">
                            <span className={cn(
                              "text-base font-bold",
                              result.result_percentage !== null ? "text-slate-800" : "text-slate-300 italic text-xs font-normal"
                            )}>
                              {result.result_percentage !== null ? `${result.result_percentage}%` : 'ยังไม่มีข้อมูล'}
                            </span>
                            {result.data_as_of && (
                              <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                                ข้อมูล ณ {new Date(result.data_as_of).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-center align-middle">
                          <div 
                            className="inline-flex items-center justify-center w-10 h-10 rounded-xl font-bold border shadow-sm text-sm transition-transform group-hover:scale-110"
                            style={getScoreStyle(result.score as number)}
                          >
                            {result.score !== null && result.score !== undefined ? Number(result.score).toFixed(2) : '-'}
                          </div>
                        </td>
                        <td className="p-4 text-center align-middle">
                          <div className="flex flex-col items-center gap-1">
                            <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold shadow-sm whitespace-nowrap", getStatusClass(result.status))}>
                              {getStatusIcon(result.status)}
                              <span>{getStatusLabel(result.status)}</span>
                            </div>
                            {result.feedback && (
                              <div className="text-[10px] text-rose-600 font-medium flex items-center gap-0.5">
                                <AlertCircle size={10} />
                                <span>มีข้อเสนอแนะ</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-center align-middle">
                          <div className="flex items-center justify-center gap-2">
                            {user?.role === 'admin' ? (
                              <div className="flex flex-col gap-1">
                                <button 
                                  onClick={() => onEditMaster?.(item)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-indigo-600/20 active:scale-95"
                                >
                                  <Edit2 size={14} />
                                  <span>แก้ไขโครงสร้าง</span>
                                </button>
                                <button 
                                  onClick={() => onDeleteMaster?.(item.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition-all border border-rose-100 active:scale-95"
                                >
                                  <Trash2 size={14} />
                                  <span>ลบตัวชี้วัด</span>
                                </button>
                              </div>
                            ) : (
                              <>
                                {(() => {
                                  const isPHOWorkGroup = user?.role === 'กลุ่มงาน สสจ.';
                                  const isAssignedToPHO = item.responsible_groups?.includes(user?.unit || '');
                                  const canPHOEdit = isPHOWorkGroup && selectedArea === 'จังหวัด' && isAssignedToPHO;
                                  const canUserEdit = user?.role === 'user' && !(result.status === 'ผ่าน' || result.status === 'ไม่ผ่าน' || result.status === 'รอยืนยัน');
                                  const canEdit = isDataEntryEnabled && (canUserEdit || canPHOEdit);

                                  return canEdit ? (
                                    <button 
                                      onClick={() => onEdit(item)}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-emerald-600/20 active:scale-95"
                                    >
                                      <Edit2 size={14} />
                                      <span>{result.result_percentage !== null ? 'อัปเดต' : 'บันทึก'}</span>
                                    </button>
                                  ) : (
                                    <button 
                                      onClick={() => onEdit(item)}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold transition-all border border-indigo-100 active:scale-95"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                      <span>ดูข้อมูล</span>
                                    </button>
                                  );
                                })()}
                              </>
                            )}
                            <button 
                              onClick={() => handleViewHistory(item)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                              title="ดูประวัติการแก้ไข"
                            >
                              <History size={18} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="p-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <Search size={48} strokeWidth={1} />
                        <p className="text-lg font-medium">ไม่พบข้อมูลตัวชี้วัดที่ตรงกับเงื่อนไข</p>
                        <p className="text-sm">ลองเปลี่ยนคำค้นหาหรือตัวกรองใหม่อีกครั้ง</p>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
