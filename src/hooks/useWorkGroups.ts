import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { WorkGroup } from '../types';

export function useWorkGroups() {
  const [workGroups, setWorkGroups] = useState<WorkGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkGroups = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('work_groups')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        // Fallback to default if table doesn't exist yet
        if (error.code === '42P01') {
          setWorkGroups([
            { name: 'บริหารทั่วไป', color: 'bg-gray-500 text-white' },
            { name: 'พัฒนายุทธศาสตร์สาธารณสุข', color: 'bg-blue-500 text-white' },
            { name: 'ประกันสุขภาพ', color: 'bg-green-500 text-white' },
            { name: 'สุขภาพดิจิทัล', color: 'bg-indigo-500 text-white' },
            { name: 'นิติการ', color: 'bg-slate-700 text-white' },
            { name: 'ส่งเสริมสุขภาพ', color: 'bg-pink-500 text-white' },
            { name: 'ควบคุมโรคติดต่อ', color: 'bg-orange-500 text-white' },
            { name: 'ควบคุมโรคไม่ติดต่อ สุขภาพจิตและยาเสพติด', color: 'bg-red-500 text-white' },
            { name: 'พัฒนารูปแบบบริการและคุณภาพ', color: 'bg-teal-500 text-white' },
            { name: 'ปฐมภูมิและเครือข่ายสุขภาพ', color: 'bg-cyan-500 text-white' },
            { name: 'ทันตสาธารณสุข', color: 'bg-purple-500 text-white' },
            { name: 'อนามัยสิ่งแวดล้อมและอาชีวอนามัย', color: 'bg-lime-500 text-white' },
            { name: 'แพทย์แผนไทยและการแพทย์ทางเลือก', color: 'bg-emerald-500 text-white' },
            { name: 'คุ้มครองผู้บริโภคและเภสัชสาธารณสุข', color: 'bg-rose-500 text-white' }
          ]);
        } else {
          throw error;
        }
      } else {
        setWorkGroups(data || []);
      }
    } catch (error) {
      console.error('Error fetching work groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkGroups();
  }, []);

  return { workGroups, isLoading, refetch: fetchWorkGroups };
}
