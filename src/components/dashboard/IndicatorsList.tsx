import { useState } from 'react';
import { Indicator, AREAS } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { Edit2, Search, Filter, Plus, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import Swal from 'sweetalert2';

interface IndicatorsListProps {
  data: Indicator[];
  fiscalYear: string;
  timeframe: string;
  onEdit: (indicator: Indicator) => void;
}

export function IndicatorsList({ data, fiscalYear, timeframe, onEdit }: IndicatorsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('ระดับจังหวัด');

  const filteredData = data.filter(d => 
    d.fiscal_year === fiscalYear && 
    (d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.order.toString().includes(searchTerm))
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ผ่าน': return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'ไม่ผ่าน': return <XCircle size={16} className="text-rose-500" />;
      default: return <Clock size={16} className="text-amber-500" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'ผ่าน': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'ไม่ผ่าน': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">จัดการตัวชี้วัด MOU</h2>
          <p className="text-slate-500 mt-1">บันทึกและแก้ไขผลการดำเนินงาน ปีงบประมาณ {fiscalYear} | รอบ: <span className="font-semibold text-emerald-600">{timeframe}</span></p>
        </div>
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
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาตัวชี้วัด..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={18} className="text-slate-400 hidden sm:block" />
            <select 
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all cursor-pointer appearance-none pr-10 relative"
            >
              {AREAS.map(area => (
                <option key={area} value={area}>แสดงผล: {area}</option>
              ))}
            </select>
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
                <th className="p-4 w-32 text-center">สถานะ</th>
                <th className="p-4 w-24 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              <AnimatePresence>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => {
                    const result = item.results[timeframe]?.[selectedArea] || { target: '-', result_percentage: '-', score: '-', status: 'รอประเมิน' };
                    return (
                      <motion.tr 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        key={item.id} 
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        <td className="p-4 text-center font-medium text-slate-500">{item.order}</td>
                        <td className="p-4">
                          <p className="text-slate-800 font-medium line-clamp-2 group-hover:line-clamp-none transition-all">{item.name}</p>
                          <p className="text-xs text-slate-400 mt-1">{item.responsible_group}</p>
                        </td>
                        <td className="p-4 text-center text-slate-600">{result.target ?? '-'}</td>
                        <td className="p-4 text-center font-medium text-slate-700">{result.result_percentage ?? '-'}</td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold">
                            {result.score ?? '-'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium", getStatusClass(result.status))}>
                            {getStatusIcon(result.status)}
                            <span>{result.status}</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => onEdit(item)}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            aria-label="แก้ไขข้อมูล"
                          >
                            <Edit2 size={18} />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      ไม่พบข้อมูลตัวชี้วัด
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
