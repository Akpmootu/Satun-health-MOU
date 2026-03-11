import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'motion/react';
import { Edit3, Trash2, Plus, Save, X, Bell } from 'lucide-react';
import Swal from 'sweetalert2';

export function NewsManagement() {
  const [news, setNews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingNews, setEditingNews] = useState<any | null>(null);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01') { // relation does not exist
          console.warn('News table does not exist yet. Please create it in Supabase.');
          setNews([{
            id: '1',
            title: 'ระบบ STN Health KPI เปิดให้ใช้งานแล้ว !',
            body: 'กรุณาเข้ามาประเมินตัวชี้วัด MOU ให้เสร็จ !\nระบบจะปิดให้บันทึก ในวันที่ 15 มีนาคม 2569\nหากมีปัญหาการใช้งาน ติดต่อกลุ่มงานสุขภาพดิจิทัล สำนักงานสาธารณสุขจังหวัดสตูลได้เลย',
            is_active: true,
            created_at: new Date().toISOString()
          }]);
          return;
        }
        throw error;
      }
      setNews(data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
      // Fallback for demo
      setNews([{
        id: '1',
        title: 'ระบบ STN Health KPI เปิดให้ใช้งานแล้ว !',
        body: 'กรุณาเข้ามาประเมินตัวชี้วัด MOU ให้เสร็จ !\nระบบจะปิดให้บันทึก ในวันที่ 15 มีนาคม 2569\nหากมีปัญหาการใช้งาน ติดต่อกลุ่มงานสุขภาพดิจิทัล สำนักงานสาธารณสุขจังหวัดสตูลได้เลย',
        is_active: true,
        created_at: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      Swal.fire({
        title: 'กำลังบันทึก...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      if (editingNews.id) {
        const { error } = await supabase
          .from('news')
          .update({
            title: editingNews.title,
            body: editingNews.body,
            is_active: editingNews.is_active
          })
          .eq('id', editingNews.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('news')
          .insert([{
            title: editingNews.title,
            body: editingNews.body,
            is_active: editingNews.is_active
          }]);
        if (error) throw error;
      }

      await fetchNews();
      setEditingNews(null);
      Swal.fire({ icon: 'success', title: 'บันทึกสำเร็จ', timer: 1500, showConfirmButton: false });
    } catch (error) {
      console.error('Error saving news:', error);
      Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถบันทึกข่าวได้' });
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ',
      text: "คุณต้องการลบข่าวนี้ใช่หรือไม่?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase.from('news').delete().eq('id', id);
        if (error) throw error;
        await fetchNews();
        Swal.fire({ icon: 'success', title: 'ลบสำเร็จ', timer: 1500, showConfirmButton: false });
      } catch (error) {
        console.error('Error deleting news:', error);
        Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถลบข่าวได้' });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <i className="fa-solid fa-newspaper text-emerald-600"></i>
            จัดการข่าวประชาสัมพันธ์
          </h1>
          <p className="text-slate-500 mt-1">เพิ่ม แก้ไข หรือลบข่าวสารสำหรับผู้ใช้งาน</p>
        </div>
        <button
          onClick={() => setEditingNews({ title: '', body: '', is_active: true })}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={20} />
          เพิ่มข่าวใหม่
        </button>
      </div>

      {editingNews && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
        >
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <i className="fa-solid fa-bullhorn text-emerald-600"></i>
              {editingNews.id ? 'แก้ไขข่าว' : 'เพิ่มข่าวใหม่'}
            </h2>
            <button onClick={() => setEditingNews(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">หัวข้อข่าว</label>
              <input
                type="text"
                required
                value={editingNews.title}
                onChange={e => setEditingNews({ ...editingNews, title: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="เช่น ระบบ STN Health KPI เปิดให้ใช้งานแล้ว !"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">เนื้อหาข่าว</label>
              <textarea
                required
                value={editingNews.body}
                onChange={e => setEditingNews({ ...editingNews, body: e.target.value })}
                rows={5}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                placeholder="รายละเอียดข่าวสาร..."
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={editingNews.is_active}
                onChange={e => setEditingNews({ ...editingNews, is_active: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <label htmlFor="is_active" className="text-sm text-slate-700">เปิดใช้งาน (แสดงให้ผู้ใช้เห็น)</label>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingNews(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
              >
                <Save size={20} />
                บันทึก
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">กำลังโหลดข้อมูล...</div>
        ) : news.length === 0 ? (
          <div className="p-8 text-center text-slate-500">ยังไม่มีข่าวประชาสัมพันธ์</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {news.map((item) => (
              <div key={item.id} className="p-6 flex items-start justify-between hover:bg-slate-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-slate-800 text-lg">{item.title}</h3>
                    {item.is_active ? (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">เปิดใช้งาน</span>
                    ) : (
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">ปิดใช้งาน</span>
                    )}
                  </div>
                  <p className="text-slate-600 text-sm line-clamp-2 mb-3">{item.body.replace(/\\n/g, '\n')}</p>
                  <p className="text-xs text-slate-400">
                    สร้างเมื่อ: {new Date(item.created_at).toLocaleString('th-TH')}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <button
                    onClick={() => setEditingNews(item)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="แก้ไข"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="ลบ"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
