import { useMemo } from 'react';
import { Indicator, AREAS } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { motion } from 'motion/react';
import { TrendingUp, AlertTriangle, CheckCircle2, Target, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ExecutiveDashboardProps {
  data: Indicator[];
  timeframe: string;
}

export function ExecutiveDashboard({ data, timeframe }: ExecutiveDashboardProps) {
  const stats = useMemo(() => {
    let totalScore = 0;
    let maxPossibleScore = 0;
    let passed = 0;
    let failed = 0;
    let pending = 0;
    let criticalIndicators: any[] = [];

    data.forEach(ind => {
      let indScore = 0;
      let indMax = ind.max_score * AREAS.length;
      let indPassed = 0;
      let indFailed = 0;
      let indPending = 0;

      AREAS.forEach(area => {
        const result = ind.results[timeframe]?.[area];
        if (result) {
          if (result.score !== null) {
            indScore += result.score;
          }
          if (result.status === 'ผ่าน') indPassed++;
          else if (result.status === 'ไม่ผ่าน') indFailed++;
          else indPending++;
        } else {
          indPending++;
        }
      });

      totalScore += indScore;
      maxPossibleScore += indMax;

      passed += indPassed;
      failed += indFailed;
      pending += indPending;

      // Identify critical indicators (less than 50% pass rate)
      const totalAreas = AREAS.length;
      if (indPassed / totalAreas < 0.5 && indFailed > 0) {
        criticalIndicators.push({
          ...ind,
          passRate: (indPassed / totalAreas) * 100,
          failedCount: indFailed
        });
      }
    });

    const overallPercentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

    return {
      overallPercentage,
      totalScore,
      maxPossibleScore,
      passed,
      failed,
      pending,
      criticalIndicators: criticalIndicators.sort((a, b) => b.failedCount - a.failedCount).slice(0, 5)
    };
  }, [data, timeframe]);

  const areaPerformance = useMemo(() => {
    return AREAS.map(area => {
      let score = 0;
      let max = 0;
      let passed = 0;
      
      data.forEach(ind => {
        max += ind.max_score;
        const result = ind.results[timeframe]?.[area];
        if (result) {
          if (result.score !== null) score += result.score;
          if (result.status === 'ผ่าน') passed++;
        }
      });

      return {
        name: area.replace('คปสอ.', ''),
        score,
        percentage: max > 0 ? (score / max) * 100 : 0,
        passed,
        total: data.length
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [data, timeframe]);

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
            <Activity size={32} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">ผลการดำเนินงานรวม</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-black text-slate-800 tracking-tight">{stats.overallPercentage.toFixed(1)}%</h3>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
            <CheckCircle2 size={32} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">ผ่านเกณฑ์ (พื้นที่)</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-black text-slate-800 tracking-tight">{stats.passed}</h3>
              <span className="text-sm font-medium text-slate-500">/ {data.length * AREAS.length}</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
            <AlertTriangle size={32} className="text-rose-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">ต้องเฝ้าระวัง (พื้นที่)</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-black text-rose-600 tracking-tight">{stats.failed}</h3>
              <span className="text-sm font-medium text-slate-500">/ {data.length * AREAS.length}</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Performance Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Target size={20} className="text-indigo-600" />
              ผลงานรายพื้นที่ (Benchmarking)
            </h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaPerformance} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100">
                          <p className="font-bold text-slate-800 mb-1">{data.name}</p>
                          <p className="text-sm text-slate-600">คะแนนเฉลี่ย: <span className="font-bold text-indigo-600">{data.percentage.toFixed(1)}%</span></p>
                          <p className="text-sm text-slate-600">ผ่านเกณฑ์: <span className="font-bold text-emerald-600">{data.passed}/{data.total}</span> ตัวชี้วัด</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="percentage" radius={[0, 4, 4, 0]} barSize={24}>
                  {areaPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.percentage >= 80 ? '#10b981' : entry.percentage >= 60 ? '#f59e0b' : '#f43f5e'} />
                  ))}
                </Bar>
                <ReferenceLine x={80} stroke="#10b981" strokeDasharray="3 3" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Critical Indicators */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle size={20} className="text-rose-500" />
              ตัวชี้วัดที่ต้องเร่งรัด (Critical KPIs)
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {stats.criticalIndicators.length > 0 ? (
              stats.criticalIndicators.map((ind, idx) => (
                <div key={ind.id} className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h4 className="font-bold text-slate-800 text-sm line-clamp-2">{ind.order}. {ind.name}</h4>
                    <span className="px-2.5 py-1 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold whitespace-nowrap">
                      ไม่ผ่าน {ind.failedCount} พื้นที่
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mb-1 overflow-hidden">
                    <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${ind.passRate}%` }}></div>
                  </div>
                  <p className="text-xs text-slate-500 text-right">อัตราผ่านเกณฑ์ {ind.passRate.toFixed(0)}%</p>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <CheckCircle2 size={48} className="text-emerald-400 mb-4 opacity-50" />
                <p className="font-bold text-slate-600">ไม่มีตัวชี้วัดวิกฤต</p>
                <p className="text-sm">ทุกตัวชี้วัดมีอัตราผ่านเกณฑ์มากกว่า 50%</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
