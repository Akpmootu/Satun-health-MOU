import React, { useState } from 'react';
import { Indicator } from '../../types';
import { motion } from 'motion/react';
import { X, Save } from 'lucide-react';

interface MasterIndicatorFormProps {
  indicator: Indicator;
  onClose: () => void;
  onSave: (indicator: Indicator) => void;
}

export function MasterIndicatorForm({ indicator, onClose, onSave }: MasterIndicatorFormProps) {
  const [formData, setFormData] = useState<Indicator>({ ...indicator });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'order' || name === 'weight' ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h2 className="text-xl font-bold text-slate-800">
          {indicator.id ? 'แก้ไขตัวชี้วัด' : 'เพิ่มตัวชี้วัดใหม่'}
        </h2>
        <button 
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">ลำดับที่</label>
            <input 
              type="number" 
              name="order"
              value={formData.order}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">ปีงบประมาณ</label>
            <input 
              type="text" 
              name="fiscal_year"
              value={formData.fiscal_year}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-700">ชื่อตัวชี้วัด</label>
            <textarea 
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-700">เกณฑ์เป้าหมาย</label>
            <input 
              type="text" 
              name="target_criteria"
              value={formData.target_criteria}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">น้ำหนัก (Weight)</label>
            <input 
              type="number" 
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              required
              step="0.01"
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">กลุ่มงานที่รับผิดชอบ</label>
            <input 
              type="text" 
              name="responsible_group"
              value={formData.responsible_group}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-slate-600 font-medium hover:bg-slate-100 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/20 flex items-center gap-2"
          >
            <Save size={18} />
            บันทึกข้อมูล
          </button>
        </div>
      </form>
    </div>
  );
}
