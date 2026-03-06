import { useState, useMemo, useEffect } from 'react';
import { Indicator, AREAS, User, RESPONSIBLE_GROUPS } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { Edit2, Search, Filter, Plus, CheckCircle2, XCircle, Clock, ArrowUpDown, Info, ChevronDown, ChevronUp, ShieldCheck, AlertCircle, History } from 'lucide-react';
import { cn } from '../../lib/utils';
import Swal from 'sweetalert2';

interface IndicatorsListProps {
  data: Indicator[];
  fiscalYear: string;
  timeframe: string;
  onEdit: (indicator: Indicator) => void;
  onVerify?: (indicator: Indicator, area: string, status: 'ผ่าน' | 'ไม่ผ่าน' | 'รอประเมิน' | 'รอยืนยัน' | 'แก้ไข', feedback?: string) => void;
  onAddMaster?: () => void;
  onEditMaster?: (indicator: Indicator) => void;
  onDeleteMaster?: (id: string) => void;
  user: User | null;
}

type SortOption = 'order' | 'name' | 'score';

export function IndicatorsList({ data, fiscalYear, timeframe, onEdit, onVerify, onAddMaster, onEditMaster, onDeleteMaster, user }: IndicatorsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('จังหวัด');
  const [statusFilter, setStatusFilter] = useState<string>('ทั้งหมด');
  const [responsibleGroupFilter, setResponsibleGroupFilter] = useState<string>('ทั้งหมด');
  const [scoreFilter, setScoreFilter] = useState<string>('ทั้งหมด');
  const [sortBy, setSortBy] = useState<SortOption>('order');
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (user && user.role === 'user') {
      setSelectedArea(user.unit);
    }
  }, [user]);

  const filteredAndSortedData = useMemo(() => {
    let result = data.filter(d => d.fiscal_year === fiscalYear);

    // Filter by search term
    if (searchTerm) {
      result = result.filter(d => 
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        d.order.toString().includes(searchTerm)
      );
    }

    // Filter by responsible group
    if (responsibleGroupFilter !== 'ทั้งหมด') {
      result = result.filter(d => 
        d.responsible_group === responsibleGroupFilter || 
        d.responsible_groups?.includes(responsibleGroupFilter)
      );
    }

    // Filter by status and score
    result = result.filter(d => {
      const res = d.results[timeframe]?.[selectedArea];
      const status = res?.status || 'รอประเมิน';
      const score = res?.score ?? 0;

      // Status filter
      if (statusFilter !== 'ทั้งหมด' && status !== statusFilter) {
        return false;
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
        const orderA = parseFloat(a.order.toString()) || 0;
        const orderB = parseFloat(b.order.toString()) || 0;
        return orderA - orderB;
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
  }, [data, fiscalYear, timeframe, selectedArea, searchTerm, statusFilter, responsibleGroupFilter, scoreFilter, sortBy]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ผ่าน': return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'ไม่ผ่าน': return <XCircle size={16} className="text-rose-500" />;
      case 'รอยืนยัน': return <ShieldCheck size={16} className="text-indigo-500" />;
      case 'แก้ไข': return <AlertCircle size={16} className="text-orange-500" />;
      default: return <Clock size={16} className="text-amber-500" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'ผ่าน': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'ไม่ผ่าน': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'รอยืนยัน': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'แก้ไข': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-amber-50 text-amber-700 border-amber-200';
    }
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

  const getExcellenceCategory = (order: string | number) => {
    const num = parseFloat(order.toString());
    if ([1, 2, 3, 4, 6, 9].includes(num)) {
      return { name: 'PP Excellence', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', description: 'ส่งเสริมสุขภาพ ป้องกันโรค และคุ้มครองผู้บริโภคเป็นเลิศ' };
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
        {user?.role === 'admin' && (
          <button 
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm shadow-emerald-600/20"
            onClick={() => {
              Swal.fire({
                title: 'เพิ่มตัวชี้วัดใหม่',
                text: 'ฟังก์ชันนี้กำลังอยู่ระหว่างการพัฒนา',
                icon: 'info',
                confirmButtonText: 'ตกลง',
                confirmButtonColor: '#10b981'
              });
            }}
          >
            <Plus size={18} />
            <span>เพิ่มตัวชี้วัด</span>
          </button>
        )}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* PP Excellence */}
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-emerald-100 hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-emerald-700 mb-1 flex items-center gap-2">
                    <span className="bg-emerald-100 text-emerald-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                    PP Excellence
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
                    "เน้นการบริหารจัดการระบบข้อมูล สุขาภิบาลสิ่งแวดล้อม การเงินการคลัง และธรรมาภิบาล"
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
        <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row gap-4 justify-between bg-slate-50/50">
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาตัวชี้วัด..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5">
              <Filter size={16} className="text-slate-400" />
              <select 
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                disabled={user?.role === 'user'}
                className="bg-transparent text-sm focus:outline-none cursor-pointer appearance-none pr-4 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {AREAS.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5">
              <span className="text-sm text-slate-500">กลุ่มงาน:</span>
              <select 
                value={responsibleGroupFilter}
                onChange={(e) => setResponsibleGroupFilter(e.target.value)}
                className="bg-transparent text-sm focus:outline-none cursor-pointer appearance-none pr-4 font-medium max-w-[150px] truncate"
              >
                <option value="ทั้งหมด">ทั้งหมด</option>
                {RESPONSIBLE_GROUPS.map(group => (
                  <option key={group.name} value={group.name}>{group.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5">
              <span className="text-sm text-slate-500">คะแนน:</span>
              <select 
                value={scoreFilter}
                onChange={(e) => setScoreFilter(e.target.value)}
                className="bg-transparent text-sm focus:outline-none cursor-pointer appearance-none pr-4 font-medium"
              >
                <option value="ทั้งหมด">ทั้งหมด</option>
                <option value="5">5 คะแนน</option>
                <option value="4">4 คะแนน</option>
                <option value="3">3 คะแนน</option>
                <option value="2">2 คะแนน</option>
                <option value="1">1 คะแนน</option>
                <option value=">=3">ผ่านเกณฑ์ (≥3)</option>
                <option value="<3">ต่ำกว่าเกณฑ์ (&lt;3)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5">
              <span className="text-sm text-slate-500">สถานะ:</span>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-sm focus:outline-none cursor-pointer appearance-none pr-4 font-medium"
              >
                <option value="ทั้งหมด">ทั้งหมด</option>
                <option value="ผ่าน" className="text-emerald-600">ผ่าน</option>
                <option value="ไม่ผ่าน" className="text-rose-600">ไม่ผ่าน</option>
                <option value="รอประเมิน" className="text-amber-600">รอประเมิน</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5">
              <ArrowUpDown size={16} className="text-slate-400" />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent text-sm focus:outline-none cursor-pointer appearance-none pr-4"
              >
                <option value="order">เรียงตามลำดับ</option>
                <option value="name">เรียงตามชื่อ (ก-ฮ)</option>
                <option value="score">เรียงตามคะแนน (มากไปน้อย)</option>
              </select>
            </div>

            {user?.role === 'admin' && onAddMaster && (
              <button
                onClick={onAddMaster}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm shadow-emerald-600/20"
              >
                <Plus size={16} />
                <span>เพิ่มตัวชี้วัด</span>
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm font-semibold">
                <th className="p-4 w-16 text-center">ลำดับ</th>
                <th className="p-4 min-w-[300px]">ตัวชี้วัด MOU</th>
                <th className="p-4 w-32 text-center">เป้าหมาย</th>
                <th className="p-4 w-32 text-center">ผลงาน (%)</th>
                <th className="p-4 w-24 text-center">คะแนน</th>
                <th className="p-4 w-32 text-center">ถ่วงน้ำหนัก</th>
                <th className="p-4 w-32 text-center">สถานะ</th>
                <th className="p-4 w-24 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              <AnimatePresence>
                {filteredAndSortedData.length > 0 ? (
                  filteredAndSortedData.map((item, index) => {
                    const result = item.results[timeframe]?.[selectedArea] || { target: '-', result_percentage: '-', score: '-', weighted_score: '-', status: 'รอประเมิน' };
                    return (
                      <motion.tr 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, delay: Math.min(index * 0.05, 0.5) }}
                        key={item.id} 
                        className={cn("transition-colors group", getRowBackground(result.status))}
                      >
                        <td className="p-4 text-center font-medium text-slate-500">{item.order}</td>
                        <td className="p-4">
                          <p className="text-slate-800 font-medium line-clamp-2 group-hover:line-clamp-none transition-all">{item.name}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-md border", getExcellenceCategory(item.order).bg, getExcellenceCategory(item.order).color, getExcellenceCategory(item.order).border)}>
                              {getExcellenceCategory(item.order).name}
                            </span>
                            {item.responsible_groups?.map(group => {
                              const groupInfo = RESPONSIBLE_GROUPS.find(g => g.name === group);
                              return (
                                <span key={group} className={cn("text-xs font-semibold px-2 py-0.5 rounded-md border", groupInfo?.color || "bg-slate-100 text-slate-700 border-slate-200")}>
                                  {group}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="p-4 text-center text-slate-600">{result.target ?? '-'}</td>
                        <td className="p-4 text-center font-medium text-slate-700">{result.result_percentage ?? '-'}</td>
                        <td className="p-4 text-center">
                          <span 
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold border border-transparent"
                            style={getScoreStyle(result.score as number)}
                          >
                            {result.score ?? '-'}
                          </span>
                        </td>
                        <td className="p-4 text-center font-medium text-emerald-600">
                          {result.weighted_score ?? '-'}
                        </td>
                        <td className="p-4 text-center">
                          <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium", getStatusClass(result.status))}>
                            {getStatusIcon(result.status)}
                            <span>{result.status}</span>
                          </div>
                          {result.feedback && (
                            <div className="mt-2 text-xs text-rose-600 bg-rose-50 p-1.5 rounded-md border border-rose-100 text-left line-clamp-2" title={result.feedback}>
                              <strong>ข้อเสนอแนะ:</strong> {result.feedback}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {user?.role === 'user' && !(result.status === 'ผ่าน' || result.status === 'ไม่ผ่าน' || result.status === 'รอยืนยัน') && (
                              <button 
                                onClick={() => onEdit(item)}
                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                aria-label="แก้ไขข้อมูล"
                                title="แก้ไขข้อมูล"
                              >
                                <Edit2 size={18} />
                              </button>
                            )}
                            {(user?.role !== 'user' || (result.status === 'ผ่าน' || result.status === 'ไม่ผ่าน' || result.status === 'รอยืนยัน')) && (
                              <button 
                                onClick={() => onEdit(item)}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                aria-label="ดูข้อมูล"
                                title="ดูข้อมูล"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                              </button>
                            )}
                            <button 
                              onClick={() => handleViewHistory(item)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              aria-label="ดูประวัติ"
                              title="ดูประวัติ"
                            >
                              <History size={18} />
                            </button>
                            {user?.role === 'admin' && onEditMaster && (
                              <button 
                                onClick={() => onEditMaster(item)}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                aria-label="แก้ไขตัวชี้วัด"
                                title="แก้ไขตัวชี้วัด"
                              >
                                <Edit2 size={18} />
                              </button>
                            )}
                            {user?.role === 'admin' && onDeleteMaster && (
                              <button 
                                onClick={() => onDeleteMaster(item.id)}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                aria-label="ลบตัวชี้วัด"
                                title="ลบตัวชี้วัด"
                              >
                                <XCircle size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">
                      ไม่พบข้อมูลตัวชี้วัดที่ตรงกับเงื่อนไข
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
