import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'motion/react';
import { Briefcase, Plus, Edit2, Trash2, Palette } from 'lucide-react';
import Swal from 'sweetalert2';
import { WorkGroup } from '../../types';
import { useWorkGroups } from '../../hooks/useWorkGroups';

const AVAILABLE_COLORS = [
  { name: 'Gray', value: 'bg-gray-500 text-white' },
  { name: 'Blue', value: 'bg-blue-500 text-white' },
  { name: 'Green', value: 'bg-green-500 text-white' },
  { name: 'Indigo', value: 'bg-indigo-500 text-white' },
  { name: 'Slate', value: 'bg-slate-700 text-white' },
  { name: 'Pink', value: 'bg-pink-500 text-white' },
  { name: 'Orange', value: 'bg-orange-500 text-white' },
  { name: 'Red', value: 'bg-red-500 text-white' },
  { name: 'Teal', value: 'bg-teal-500 text-white' },
  { name: 'Cyan', value: 'bg-cyan-500 text-white' },
  { name: 'Purple', value: 'bg-purple-500 text-white' },
  { name: 'Lime', value: 'bg-lime-500 text-white' },
  { name: 'Emerald', value: 'bg-emerald-500 text-white' },
  { name: 'Rose', value: 'bg-rose-500 text-white' },
  { name: 'Amber', value: 'bg-amber-500 text-white' },
  { name: 'Fuchsia', value: 'bg-fuchsia-500 text-white' },
  { name: 'Violet', value: 'bg-violet-500 text-white' },
  { name: 'Sky', value: 'bg-sky-500 text-white' }
];

export function WorkGroupManagement() {
  const { workGroups, isLoading, refetch } = useWorkGroups();

  const handleAddGroup = async () => {
    const { value: formValues } = await Swal.fire({
      title: '<h2 class="text-2xl font-bold text-slate-800 flex items-center justify-center gap-3"><i class="fa-solid fa-folder-plus text-emerald-600"></i> เพิ่มกลุ่มงานใหม่</h2>',
      html: `
        <div class="flex flex-col gap-4 text-left">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">ชื่อกลุ่มงาน</label>
            <input id="swal-input1" class="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="ระบุชื่อกลุ่มงาน">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">สีสัญลักษณ์</label>
            <select id="swal-input2" class="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none bg-white">
              ${AVAILABLE_COLORS.map(c => `<option value="${c.value}">${c.name}</option>`).join('')}
            </select>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#94a3b8',
      preConfirm: () => {
        const name = (document.getElementById('swal-input1') as HTMLInputElement).value;
        const color = (document.getElementById('swal-input2') as HTMLSelectElement).value;
        
        if (!name) {
          Swal.showValidationMessage('กรุณากรอกชื่อกลุ่มงาน');
          return false;
        }
        
        return { name, color };
      }
    });

    if (formValues) {
      try {
        Swal.fire({
          title: 'กำลังบันทึกข้อมูล...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const { error } = await supabase
          .from('work_groups')
          .insert([formValues]);

        if (error) throw error;

        await refetch();

        Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          text: 'เพิ่มกลุ่มงานเรียบร้อยแล้ว',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error: any) {
        console.error('Error adding work group:', error);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.code === '23505' ? 'ชื่อกลุ่มงานนี้มีอยู่แล้ว' : 'ไม่สามารถเพิ่มกลุ่มงานได้',
          confirmButtonColor: '#10b981'
        });
      }
    }
  };

  const handleEditGroup = async (group: WorkGroup) => {
    const { value: formValues } = await Swal.fire({
      title: '<h2 class="text-2xl font-bold text-slate-800 flex items-center justify-center gap-3"><i class="fa-solid fa-folder-open text-emerald-600"></i> แก้ไขกลุ่มงาน</h2>',
      html: `
        <div class="flex flex-col gap-4 text-left">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">ชื่อกลุ่มงาน</label>
            <input id="swal-input1" class="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" value="${group.name}">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">สีสัญลักษณ์</label>
            <select id="swal-input2" class="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none bg-white">
              ${AVAILABLE_COLORS.map(c => `<option value="${c.value}" ${group.color === c.value ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#94a3b8',
      preConfirm: () => {
        const name = (document.getElementById('swal-input1') as HTMLInputElement).value;
        const color = (document.getElementById('swal-input2') as HTMLSelectElement).value;
        
        if (!name) {
          Swal.showValidationMessage('กรุณากรอกชื่อกลุ่มงาน');
          return false;
        }
        
        return { name, color };
      }
    });

    if (formValues) {
      try {
        Swal.fire({
          title: 'กำลังบันทึกข้อมูล...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const { error } = await supabase
          .from('work_groups')
          .update(formValues)
          .eq('id', group.id);

        if (error) throw error;

        await refetch();

        Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          text: 'แก้ไขกลุ่มงานเรียบร้อยแล้ว',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error: any) {
        console.error('Error updating work group:', error);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.code === '23505' ? 'ชื่อกลุ่มงานนี้มีอยู่แล้ว' : 'ไม่สามารถแก้ไขกลุ่มงานได้',
          confirmButtonColor: '#10b981'
        });
      }
    }
  };

  const handleDeleteGroup = async (id: string) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ',
      text: "คุณต้องการลบกลุ่มงานนี้ใช่หรือไม่?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'ลบข้อมูล',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: 'กำลังลบข้อมูล...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const { error } = await supabase
          .from('work_groups')
          .delete()
          .eq('id', id);

        if (error) throw error;

        await refetch();

        Swal.fire({
          icon: 'success',
          title: 'ลบสำเร็จ',
          text: 'ลบกลุ่มงานเรียบร้อยแล้ว',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error deleting work group:', error);
        Swal.fire({
          icon: 'error',
          title: 'ลบไม่สำเร็จ',
          text: 'เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล',
          confirmButtonColor: '#10b981'
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <i className="fa-solid fa-briefcase text-emerald-600"></i>
            จัดการกลุ่มงาน
          </h2>
          <p className="text-slate-500 mt-1">เพิ่ม ลบ และแก้ไขกลุ่มงานที่รับผิดชอบตัวชี้วัด</p>
        </div>
        <button
          onClick={handleAddGroup}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-600/20 font-medium"
        >
          <Plus className="w-5 h-5" />
          เพิ่มกลุ่มงาน
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="p-4 font-semibold text-slate-700 w-16 text-center">ลำดับ</th>
                <th className="p-4 font-semibold text-slate-700">ชื่อกลุ่มงาน</th>
                <th className="p-4 font-semibold text-slate-700">สีสัญลักษณ์</th>
                <th className="p-4 font-semibold text-slate-700 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {workGroups.map((group, index) => (
                <motion.tr 
                  key={group.id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="p-4 text-slate-500 text-center">{index + 1}</td>
                  <td className="p-4">
                    <span className="font-medium text-slate-800">{group.name}</span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${group.color}`}>
                      <Palette className="w-3 h-3" />
                      {AVAILABLE_COLORS.find(c => c.value === group.color)?.name || 'Custom'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditGroup(group)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="แก้ไข"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => group.id && handleDeleteGroup(group.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="ลบ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {workGroups.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    ไม่พบข้อมูลกลุ่มงาน
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
