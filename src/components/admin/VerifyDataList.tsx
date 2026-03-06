import { useState, useMemo } from 'react';
import { Indicator, AREAS, User, RESPONSIBLE_GROUPS } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ShieldCheck, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import Swal from 'sweetalert2';

interface VerifyDataListProps {
  data: Indicator[];
  timeframe: string;
  onVerify: (indicator: Indicator, area: string, status: 'ผ่าน' | 'ไม่ผ่าน' | 'รอประเมิน' | 'รอยืนยัน' | 'แก้ไข', feedback?: string) => void;
  user: User | null;
}

export function VerifyDataList({ data, timeframe, onVerify, user }: VerifyDataListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Flatten data to get all pending verifications across all areas
  const pendingItems = useMemo(() => {
    const items: { indicator: Indicator; area: string; result: any }[] = [];
    
    data.forEach(indicator => {
      // If user is 'กลุ่มงาน สสจ.', only show their assigned indicators
      if (user?.role === 'กลุ่มงาน สสจ.' && !user.assigned_indicators?.includes(indicator.id)) {
        return;
      }

      if (indicator.results[timeframe]) {
        Object.keys(indicator.results[timeframe]).forEach(area => {
          const result = indicator.results[timeframe][area];
          if (result.status === 'รอยืนยัน') {
            items.push({ indicator, area, result });
          }
        });
      }
    });

    // Filter by search term
    if (searchTerm) {
      return items.filter(item => 
        item.indicator.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.area.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return items;
  }, [data, timeframe, searchTerm]);

  const handleVerifyClick = async (item: { indicator: Indicator; area: string; result: any }) => {
    const newStatus = (item.result.score ?? 0) >= 3 ? 'ผ่าน' : 'ไม่ผ่าน';
    
    // Generate history HTML
    let historyHtml = '';
    if (item.result.history && item.result.history.length > 0) {
      historyHtml = `
        <div class="mt-4 pt-4 border-t border-slate-100">
          <h5 class="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ประวัติการบันทึก
          </h5>
          <div class="space-y-3 max-h-40 overflow-y-auto pr-2 text-left">
            ${item.result.history.map((hist: any) => `
              <div class="flex gap-3 text-sm">
                <div class="w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                  hist.status === 'ผ่าน' ? 'bg-emerald-500' : 
                  hist.status === 'ไม่ผ่าน' ? 'bg-rose-500' : 
                  hist.status === 'แก้ไข' ? 'bg-orange-500' : 'bg-indigo-500'
                }"></div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-slate-700">${hist.status}</span>
                    <span class="text-xs text-slate-400">${new Date(hist.timestamp).toLocaleString('th-TH')}</span>
                  </div>
                  <div class="text-xs text-slate-500 mt-0.5">โดย: ${hist.user}</div>
                  ${hist.feedback ? `<div class="text-xs text-orange-600 bg-orange-50 p-1.5 mt-1 rounded border border-orange-100">ข้อเสนอแนะ: ${hist.feedback}</div>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    const swalResult = await Swal.fire({
      title: 'ตรวจสอบข้อมูล',
      html: `
        <div class="text-left mb-4">
          <p class="text-sm text-slate-600 mb-2">ตัวชี้วัด: <strong class="text-slate-800">${item.indicator.name}</strong></p>
          <p class="text-sm text-slate-600 mb-2">หน่วยงาน: <strong class="text-indigo-600">${item.area}</strong></p>
          <p class="text-sm text-slate-600 mb-2">ผลงาน: <strong class="text-slate-800">${item.result.result_percentage}%</strong></p>
          <p class="text-sm text-slate-600 mb-2">คะแนน: <strong class="text-slate-800">${item.result.score}</strong></p>
          <p class="text-sm text-slate-600">สถานะหากยืนยัน: <strong class="${newStatus === 'ผ่าน' ? 'text-emerald-600' : 'text-rose-600'}">${newStatus}</strong></p>
        </div>
        ${historyHtml}
      `,
      icon: 'question',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonColor: '#10b981',
      denyButtonColor: '#f59e0b', // Orange for edit
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'ยืนยันข้อมูล',
      denyButtonText: 'ส่งกลับแก้ไข',
      cancelButtonText: 'ยกเลิก'
    });

    if (swalResult.isConfirmed) {
      onVerify(item.indicator, item.area, newStatus);
      Swal.fire('ยืนยันสำเร็จ!', 'ข้อมูลได้รับการยืนยันและนำไปคำนวณในแดชบอร์ดแล้ว', 'success');
    } else if (swalResult.isDenied) {
      const { value: feedback } = await Swal.fire({
        title: 'ระบุเหตุผลการส่งกลับแก้ไข',
        input: 'textarea',
        inputLabel: 'ข้อเสนอแนะ/คำแนะนำสำหรับผู้ลงข้อมูล',
        inputPlaceholder: 'พิมพ์ข้อเสนอแนะที่นี่...',
        inputAttributes: {
          'aria-label': 'ข้อเสนอแนะ'
        },
        showCancelButton: true,
        confirmButtonText: 'ส่งกลับแก้ไข',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#f59e0b',
        inputValidator: (value) => {
          if (!value) {
            return 'กรุณาระบุเหตุผลที่ต้องการให้แก้ไข';
          }
        }
      });

      if (feedback) {
        onVerify(item.indicator, item.area, 'แก้ไข', feedback);
        Swal.fire('ส่งกลับแก้ไขสำเร็จ!', 'ข้อมูลถูกส่งกลับไปยังผู้ลงข้อมูลเพื่อแก้ไขแล้ว', 'success');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">ตรวจสอบข้อมูล</h2>
          <p className="text-slate-500 mt-1">รายการข้อมูลที่รอการยืนยันจากผู้ดูแลระบบ</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาตัวชี้วัด หรือ หน่วยงาน..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm font-semibold">
                <th className="p-4 w-16 text-center">ลำดับ</th>
                <th className="p-4 min-w-[300px]">ตัวชี้วัด MOU</th>
                <th className="p-4 w-40 text-center">หน่วยงาน</th>
                <th className="p-4 w-32 text-center">ผลงาน (%)</th>
                <th className="p-4 w-24 text-center">คะแนน</th>
                <th className="p-4 w-32 text-center">สถานะ</th>
                <th className="p-4 w-24 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              <AnimatePresence>
                {pendingItems.length > 0 ? (
                  pendingItems.map((item, index) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: Math.min(index * 0.05, 0.5) }}
                      key={`${item.indicator.id}-${item.area}`} 
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="p-4 text-center font-medium text-slate-500">{item.indicator.order}</td>
                      <td className="p-4">
                        <p className="text-slate-800 font-medium line-clamp-2 group-hover:line-clamp-none transition-all">{item.indicator.name}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          {item.indicator.responsible_groups?.map(group => {
                            const groupInfo = RESPONSIBLE_GROUPS.find(g => g.name === group);
                            return (
                              <span key={group} className={cn("text-xs font-semibold px-2 py-0.5 rounded-md border", groupInfo?.color || "bg-slate-100 text-slate-700 border-slate-200")}>
                                {group}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="p-4 text-center font-medium text-indigo-600">{item.area}</td>
                      <td className="p-4 text-center font-medium text-slate-700">{item.result.result_percentage ?? '-'}</td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                          {item.result.score ?? '-'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium bg-indigo-50 text-indigo-700 border-indigo-200">
                          <ShieldCheck size={16} />
                          <span>{item.result.status}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleVerifyClick(item)}
                            className="px-3 py-1.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors text-xs font-medium shadow-sm shadow-indigo-600/20 flex items-center gap-1"
                          >
                            <ShieldCheck size={14} />
                            ตรวจสอบ
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                          <CheckCircle2 size={32} className="text-emerald-400" />
                        </div>
                        <p className="text-lg font-medium text-slate-600">ไม่มีข้อมูลรอการยืนยัน</p>
                        <p className="text-sm text-slate-400">ข้อมูลทั้งหมดได้รับการตรวจสอบแล้ว</p>
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
