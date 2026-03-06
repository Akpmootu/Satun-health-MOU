import React, { useState } from 'react';
import { Indicator, RESPONSIBLE_GROUPS } from '../../types';
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

  const handleGroupsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map((opt: HTMLOptionElement) => opt.value);
    setFormData(prev => ({ ...prev, responsible_groups: selectedOptions }));
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
            <label className="text-sm font-medium text-slate-700">กลุ่มงานที่รับผิดชอบ (เลือกได้หลายข้อ)</label>
            <select 
              multiple
              name="responsible_groups"
              value={formData.responsible_groups || []}
              onChange={handleGroupsChange}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all h-32"
            >
              {RESPONSIBLE_GROUPS.map(group => (
                <option key={group.name} value={group.name}>{group.name}</option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">กด Ctrl (หรือ Cmd) ค้างไว้เพื่อเลือกหลายรายการ</p>
          </div>

          <div className="md:col-span-2 space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">เกณฑ์การให้คะแนน (ผลงานร้อยละ)</h3>
            <div className="grid grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map(score => (
                <div key={score} className="space-y-2">
                  <label className="text-xs font-medium text-slate-600 text-center block">คะแนน {score}</label>
                  <input 
                    type="number" 
                    value={formData.score_criteria?.[score.toString() as keyof typeof formData.score_criteria] || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        score_criteria: {
                          ...prev.score_criteria,
                          [score.toString()]: val ? Number(val) : ''
                        }
                      }));
                    }}
                    step="0.01"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-center"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 text-center mt-2">
              * หากเกณฑ์ยิ่งน้อยยิ่งได้คะแนนเยอะ (เช่น ผลงาน ≤ 20% ได้ 5 คะแนน) ให้ใส่ค่าคะแนน 5 ให้น้อยกว่าคะแนน 1
            </p>
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
