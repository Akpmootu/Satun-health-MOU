import { useState, useMemo } from 'react';
import { Indicator, AREAS } from '../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { motion } from 'motion/react';
import { Target, CheckCircle2, XCircle, Clock, TrendingUp, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DashboardProps {
  data: Indicator[];
  fiscalYear: string;
  timeframe: string;
}

const COLORS = ['#10b981', '#f43f5e', '#f59e0b', '#3b82f6', '#8b5cf6'];

export function Dashboard({ data, fiscalYear, timeframe }: DashboardProps) {
  const filteredData = useMemo(() => data.filter(d => d.fiscal_year === fiscalYear), [data, fiscalYear]);

  const stats = useMemo(() => {
    let total = 0;
    let passed = 0;
    let failed = 0;
    let pending = 0;

    filteredData.forEach(ind => {
      AREAS.forEach(area => {
        const res = ind.results[timeframe]?.[area];
        if (res) {
          total++;
          if (res.status === 'ผ่าน') passed++;
          else if (res.status === 'ไม่ผ่าน') failed++;
          else pending++;
        }
      });
    });

    return { total, passed, failed, pending };
  }, [filteredData, timeframe]);

  const pieData = [
    { name: 'ผ่านเกณฑ์', value: stats.passed, color: '#10b981' },
    { name: 'ไม่ผ่านเกณฑ์', value: stats.failed, color: '#f43f5e' },
    { name: 'รอประเมิน', value: stats.pending, color: '#f59e0b' },
  ];

  const radarData = useMemo(() => {
    return AREAS.map(area => {
      let score = 0;
      let count = 0;
      filteredData.forEach(ind => {
        const res = ind.results[timeframe]?.[area];
        if (res && res.score !== null) {
          score += res.score as number;
          count++;
        }
      });
      return {
        subject: area.replace('คปสอ.', ''),
        A: count > 0 ? Number((score / count).toFixed(2)) : 0,
        fullMark: 5,
      };
    });
  }, [filteredData, timeframe]);

  const barData = useMemo(() => {
    return AREAS.map(area => {
      let passed = 0;
      let failed = 0;
      filteredData.forEach(ind => {
        const res = ind.results[timeframe]?.[area];
        if (res) {
          if (res.status === 'ผ่าน') passed++;
          if (res.status === 'ไม่ผ่าน') failed++;
        }
      });
      return {
        name: area.replace('คปสอ.', ''),
        'ผ่าน': passed,
        'ไม่ผ่าน': failed,
      };
    });
  }, [filteredData, timeframe]);

  const StatCard = ({ title, value, icon: Icon, colorClass, delay }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start justify-between group hover:shadow-md transition-all"
    >
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
      </div>
      <div className={cn("p-3 rounded-xl", colorClass)}>
        <Icon size={24} className="text-white" />
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">ภาพรวมผลการดำเนินงาน (ทุกพื้นที่)</h1>
          <p className="text-slate-500 mt-1">สรุปผลการประเมินตัวชี้วัด MOU ประจำปีงบประมาณ {fiscalYear} | รอบ: <span className="font-semibold text-emerald-600">{timeframe}</span></p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium border border-emerald-200 flex items-center gap-2 shadow-sm">
          <Activity size={16} />
          <span>ข้อมูลล่าสุด: วันนี้</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="รายการประเมินทั้งหมด" value={stats.total} icon={Target} colorClass="bg-blue-500 shadow-blue-500/20" delay={0.1} />
        <StatCard title="ผ่านเกณฑ์ (รายการ)" value={stats.passed} icon={CheckCircle2} colorClass="bg-emerald-500 shadow-emerald-500/20" delay={0.2} />
        <StatCard title="ไม่ผ่านเกณฑ์ (รายการ)" value={stats.failed} icon={XCircle} colorClass="bg-rose-500 shadow-rose-500/20" delay={0.3} />
        <StatCard title="รอประเมิน (รายการ)" value={stats.pending} icon={Clock} colorClass="bg-amber-500 shadow-amber-500/20" delay={0.4} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 col-span-1"
        >
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <PieChart size={20} className="text-emerald-600" />
            สัดส่วนผลการประเมินรวม
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Radar Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 col-span-1 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-600" />
            คะแนนเฉลี่ยรายพื้นที่
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#94a3b8' }} />
                <Radar name="คะแนนเฉลี่ย" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 col-span-1 lg:col-span-3"
        >
          <h3 className="text-lg font-semibold text-slate-800 mb-4">จำนวนตัวชี้วัดที่ผ่าน/ไม่ผ่าน รายพื้นที่</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                <Legend iconType="circle" />
                <Bar dataKey="ผ่าน" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                <Bar dataKey="ไม่ผ่าน" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
