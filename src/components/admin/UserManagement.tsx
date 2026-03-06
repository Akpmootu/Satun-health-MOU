import { useState, useEffect } from 'react';
import { User, AREAS, RESPONSIBLE_GROUPS } from '../../types';
import { supabase } from '../../lib/supabase';
import { motion } from 'motion/react';
import { Users, Plus, Edit2, Trash2, Shield, ShieldAlert, Briefcase } from 'lucide-react';
import Swal from 'sweetalert2';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถโหลดข้อมูลผู้ใช้งานได้',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'เพิ่มผู้ใช้งานใหม่',
      html: `
        <div class="space-y-4 text-left">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้ใช้งาน (Username)</label>
            <input id="swal-input1" class="swal2-input !w-full !m-0 !text-sm" placeholder="ระบุชื่อผู้ใช้งาน">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">รหัสผ่าน (Password)</label>
            <input id="swal-input2" type="password" class="swal2-input !w-full !m-0 !text-sm" placeholder="ระบุรหัสผ่าน">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">สิทธิ์การใช้งาน (Role)</label>
            <select id="swal-input3" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all">
              <option value="user">ผู้ใช้งานทั่วไป (User)</option>
              <option value="admin">ผู้ดูแลระบบ (Admin)</option>
              <option value="กลุ่มงาน สสจ.">กลุ่มงาน สสจ.</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">หน่วยงาน (Unit)</label>
            <select id="swal-input4" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all">
              ${AREAS.map(area => `<option value="${area}">${area}</option>`).join('')}
            </select>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#4f46e5',
      didOpen: () => {
        const roleSelect = document.getElementById('swal-input3') as HTMLSelectElement;
        const unitSelect = document.getElementById('swal-input4') as HTMLSelectElement;
        
        const areasHtml = `${AREAS.map(area => `<option value="${area}">${area}</option>`).join('')}`;
        const groupsHtml = `${RESPONSIBLE_GROUPS.map(group => `<option value="${group.name}">${group.name}</option>`).join('')}`;

        roleSelect.addEventListener('change', (e) => {
          const selectedRole = (e.target as HTMLSelectElement).value;
          if (selectedRole === 'กลุ่มงาน สสจ.') {
            unitSelect.innerHTML = groupsHtml;
          } else {
            unitSelect.innerHTML = areasHtml;
          }
        });
      },
      preConfirm: () => {
        const username = (document.getElementById('swal-input1') as HTMLInputElement).value;
        const password = (document.getElementById('swal-input2') as HTMLInputElement).value;
        const role = (document.getElementById('swal-input3') as HTMLSelectElement).value;
        const unit = (document.getElementById('swal-input4') as HTMLSelectElement).value;
        
        if (!username || !password) {
          Swal.showValidationMessage('กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน');
          return false;
        }
        return { username, password, role, unit };
      }
    });

    if (formValues) {
      try {
        Swal.fire({ title: 'กำลังบันทึก...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        
        // Check if username exists
        const { data: existing } = await supabase.from('users').select('id').eq('username', formValues.username).single();
        if (existing) {
          throw new Error('ชื่อผู้ใช้งานนี้มีในระบบแล้ว');
        }

        const { error } = await supabase.from('users').insert([formValues]);
        if (error) throw error;

        await fetchUsers();
        Swal.fire('สำเร็จ!', 'เพิ่มผู้ใช้งานเรียบร้อยแล้ว', 'success');
      } catch (error: any) {
        Swal.fire('ข้อผิดพลาด', error.message || 'ไม่สามารถเพิ่มผู้ใช้งานได้', 'error');
      }
    }
  };

  const handleEditUser = async (user: User) => {
    const { value: formValues } = await Swal.fire({
      title: 'แก้ไขผู้ใช้งาน',
      html: `
        <div class="space-y-4 text-left">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้ใช้งาน (Username)</label>
            <input id="swal-input1" class="swal2-input !w-full !m-0 !text-sm" value="${user.username}" disabled>
            <p class="text-xs text-slate-500 mt-1">ไม่สามารถเปลี่ยนชื่อผู้ใช้งานได้</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">รหัสผ่านใหม่ (เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยน)</label>
            <input id="swal-input2" type="password" class="swal2-input !w-full !m-0 !text-sm" placeholder="ระบุรหัสผ่านใหม่">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">สิทธิ์การใช้งาน (Role)</label>
            <select id="swal-input3" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all">
              <option value="user" ${user.role === 'user' ? 'selected' : ''}>ผู้ใช้งานทั่วไป (User)</option>
              <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>ผู้ดูแลระบบ (Admin)</option>
              <option value="กลุ่มงาน สสจ." ${user.role === 'กลุ่มงาน สสจ.' ? 'selected' : ''}>กลุ่มงาน สสจ.</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">หน่วยงาน (Unit)</label>
            <select id="swal-input4" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all">
              ${AREAS.map(area => `<option value="${area}" ${user.unit === area ? 'selected' : ''}>${area}</option>`).join('')}
            </select>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#4f46e5',
      didOpen: () => {
        const roleSelect = document.getElementById('swal-input3') as HTMLSelectElement;
        const unitSelect = document.getElementById('swal-input4') as HTMLSelectElement;
        
        const areasHtml = `${AREAS.map(area => `<option value="${area}" ${user.unit === area ? 'selected' : ''}>${area}</option>`).join('')}`;
        const groupsHtml = `${RESPONSIBLE_GROUPS.map(group => `<option value="${group.name}" ${user.unit === group.name ? 'selected' : ''}>${group.name}</option>`).join('')}`;

        // Initialize unit options based on current role
        if (user.role === 'กลุ่มงาน สสจ.') {
          unitSelect.innerHTML = groupsHtml;
        } else {
          unitSelect.innerHTML = areasHtml;
        }

        roleSelect.addEventListener('change', (e) => {
          const selectedRole = (e.target as HTMLSelectElement).value;
          if (selectedRole === 'กลุ่มงาน สสจ.') {
            unitSelect.innerHTML = groupsHtml;
          } else {
            unitSelect.innerHTML = areasHtml;
          }
        });
      },
      preConfirm: () => {
        const password = (document.getElementById('swal-input2') as HTMLInputElement).value;
        const role = (document.getElementById('swal-input3') as HTMLSelectElement).value;
        const unit = (document.getElementById('swal-input4') as HTMLSelectElement).value;
        
        const updateData: any = { role, unit };
        if (password) {
          updateData.password = password;
        }
        return updateData;
      }
    });

    if (formValues) {
      try {
        Swal.fire({ title: 'กำลังบันทึก...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        
        const { error } = await supabase.from('users').update(formValues).eq('id', user.id);
        if (error) throw error;

        await fetchUsers();
        Swal.fire('สำเร็จ!', 'อัปเดตข้อมูลผู้ใช้งานเรียบร้อยแล้ว', 'success');
      } catch (error: any) {
        Swal.fire('ข้อผิดพลาด', error.message || 'ไม่สามารถอัปเดตข้อมูลได้', 'error');
      }
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (user.username === 'admin') {
      Swal.fire('ไม่อนุญาต', 'ไม่สามารถลบผู้ดูแลระบบหลักได้', 'error');
      return;
    }

    const result = await Swal.fire({
      title: 'ยืนยันการลบ?',
      text: `คุณต้องการลบผู้ใช้งาน "${user.username}" ใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({ title: 'กำลังลบ...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        
        const { error } = await supabase.from('users').delete().eq('id', user.id);
        if (error) throw error;

        await fetchUsers();
        Swal.fire('ลบสำเร็จ!', 'ผู้ใช้งานถูกลบออกจากระบบแล้ว', 'success');
      } catch (error: any) {
        Swal.fire('ข้อผิดพลาด', error.message || 'ไม่สามารถลบผู้ใช้งานได้', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Users className="text-indigo-600" />
            จัดการผู้ใช้งาน
          </h2>
          <p className="text-slate-500 mt-1">เพิ่ม ลบ และแก้ไขสิทธิ์การใช้งานของแต่ละหน่วยงาน</p>
        </div>
        <button 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm shadow-indigo-600/20"
          onClick={handleAddUser}
        >
          <Plus size={18} />
          <span>เพิ่มผู้ใช้งาน</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm font-semibold">
                <th className="p-4">ชื่อผู้ใช้งาน</th>
                <th className="p-4">หน่วยงาน</th>
                <th className="p-4">สิทธิ์การใช้งาน</th>
                <th className="p-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                      กำลังโหลดข้อมูล...
                    </div>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((u, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    key={u.id} 
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="p-4 font-medium text-slate-800">{u.username}</td>
                    <td className="p-4 text-slate-600">{u.unit}</td>
                    <td className="p-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${
                        u.role === 'admin' 
                          ? 'bg-purple-50 text-purple-700 border-purple-200' 
                          : u.role === 'กลุ่มงาน สสจ.'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {u.role === 'admin' ? <ShieldAlert size={14} /> : u.role === 'กลุ่มงาน สสจ.' ? <Briefcase size={14} /> : <Shield size={14} />}
                        <span>{u.role === 'admin' ? 'ผู้ดูแลระบบ' : u.role === 'กลุ่มงาน สสจ.' ? 'กลุ่มงาน สสจ.' : 'ผู้ใช้งานทั่วไป'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleEditUser(u)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          aria-label="แก้ไขข้อมูล"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(u)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          aria-label="ลบผู้ใช้งาน"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    ไม่พบข้อมูลผู้ใช้งาน
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
