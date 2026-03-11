import React, { useState } from 'react';
import { Indicator, AREAS, TIMEFRAMES } from '../../types';
import { FileDown, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';
import { motion } from 'motion/react';
import { CustomSelect } from '../common/CustomSelect';

interface ExportDataProps {
  indicators: Indicator[];
  fiscalYear: string;
}

export function ExportData({ indicators, fiscalYear }: ExportDataProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('ภาพรวม (สะสม)');

  const handleExport = () => {
    // 1. Prepare data for export
    const exportData = indicators.map(indicator => {
      const result = indicator.results[selectedTimeframe] || {};
      
      const row: any = {
        'ลำดับ': indicator.order,
        'ชื่อตัวชี้วัด': indicator.name,
        'กลุ่มงานรับผิดชอบ': indicator.responsible_groups?.join(', ') || indicator.responsible_group,
        'เกณฑ์ระดับ 5 (Level 5 Criteria)': indicator.target_criteria,
        'น้ำหนัก (Weight)': indicator.weight,
        'คะแนนเต็ม (Max Score)': indicator.max_score || 5,
      };

      // Add data for each area
      AREAS.forEach(area => {
        const areaResult = result[area];
        row[`${area} (ผลงาน)`] = areaResult?.result_percentage !== undefined && areaResult?.result_percentage !== null ? `${areaResult.result_percentage}%` : '-';
        row[`${area} (คะแนน)`] = areaResult?.score !== undefined && areaResult?.score !== null ? areaResult.score : '-';
        row[`${area} (สถานะ)`] = areaResult?.status || 'รอประเมิน';
      });

      return row;
    });

    // 2. Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // 3. Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Progress Report");

    // 4. Generate Excel file
    XLSX.writeFile(wb, `STN_Health_KPI_Report_${fiscalYear}_${selectedTimeframe}.xlsx`);
  };

  // Calculate summary stats
  const totalIndicators = indicators.length;
  const completedCount = indicators.filter(ind => {
    const res = ind.results[selectedTimeframe];
    if (!res) return false;
    // Check if all areas have results (or at least one? Let's assume at least one for "in progress")
    // Or maybe check if status is 'ผ่าน'/'ไม่ผ่าน' for at least one area
    return Object.values(res).some(r => r.status === 'ผ่าน' || r.status === 'ไม่ผ่าน');
  }).length;

  const progressPercentage = totalIndicators > 0 ? (completedCount / totalIndicators) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">ส่งออกข้อมูล (Export Data)</h2>
          <p className="text-slate-500 mt-1">ดาวน์โหลดรายงานความก้าวหน้าตัวชี้วัดในรูปแบบ Excel</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row gap-6 items-end">
          <div className="w-full md:w-1/3 space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Filter size={16} />
              เลือกช่วงเวลาประเมิน
            </label>
            <CustomSelect
              value={selectedTimeframe}
              onChange={setSelectedTimeframe}
              options={TIMEFRAMES.map(tf => ({ value: tf, label: tf }))}
              className="w-full bg-slate-50 border-slate-200"
            />
          </div>

          <div className="w-full md:w-2/3 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="text-sm text-slate-600">
              <span className="block font-semibold text-slate-800 mb-1">สรุปภาพรวม ({selectedTimeframe})</span>
              <span>จำนวนตัวชี้วัดทั้งหมด: <strong>{totalIndicators}</strong> | มีผลการดำเนินงาน: <strong>{completedCount}</strong> ({progressPercentage.toFixed(1)}%)</span>
            </div>
            
            <button
              onClick={handleExport}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl flex items-center gap-2 transition-all shadow-sm shadow-emerald-600/20 whitespace-nowrap"
            >
              <FileDown size={20} />
              ดาวน์โหลด Excel
            </button>
          </div>
        </div>
      </div>

      {/* Preview Table (Optional - showing first 5 items) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">ตัวอย่างข้อมูล (Preview)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">ลำดับ</th>
                <th className="px-6 py-4 min-w-[300px]">ชื่อตัวชี้วัด</th>
                <th className="px-6 py-4 whitespace-nowrap">กลุ่มงาน</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">จังหวัด (สถานะ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {indicators.slice(0, 5).map(indicator => {
                const result = indicator.results[selectedTimeframe]?.['จังหวัด'];
                return (
                  <tr key={indicator.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-center text-slate-500">{indicator.order}</td>
                    <td className="px-6 py-4 text-slate-800">{indicator.name}</td>
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                      {indicator.responsible_groups?.join(', ') || indicator.responsible_group}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        result?.status === 'ผ่าน' ? 'bg-emerald-100 text-emerald-700' :
                        result?.status === 'ไม่ผ่าน' ? 'bg-rose-100 text-rose-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {result?.status || 'รอประเมิน'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {indicators.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                    ไม่พบข้อมูลตัวชี้วัด
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {indicators.length > 5 && (
          <div className="p-4 text-center text-sm text-slate-500 bg-slate-50 border-t border-slate-100">
            และอีก {indicators.length - 5} รายการ...
          </div>
        )}
      </div>
    </div>
  );
}
