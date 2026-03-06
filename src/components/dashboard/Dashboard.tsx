import { useState, useMemo } from 'react';
import { Indicator, AREAS } from '../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { motion } from 'motion/react';
import { Target, CheckCircle2, XCircle, Clock, TrendingUp, Activity, AlertTriangle, Award } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DashboardProps {
  data: Indicator[];
  fiscalYear: string;
  timeframe: string;
}

const COLORS = ['#10b981', '#f43f5e', '#f59e0b', '#3b82f6', '#8b5cf6'];

// Custom Tooltip for PieChart
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-sm">
        <p className="font-semibold text-slate-800 mb-1">{payload[0].name}</p>
        <p className="text-slate-600">จำนวน: <span className="font-bold" style={{ color: payload[0].payload.color }}>{payload[0].value}</span> ตัวชี้วัด</p>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for RadarChart
const CustomRadarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-sm">
        <p className="font-semibold text-slate-800 mb-1">พื้นที่: {label}</p>
        <p className="text-slate-600">คะแนนเฉลี่ย: <span className="font-bold text-emerald-600">{payload[0].value.toFixed(2)}</span> / 5.00</p>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for BarChart
const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-sm min-w-[150px]">
        <p className="font-semibold text-slate-800 mb-2 border-b border-slate-100 pb-1">พื้นที่: {label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex justify-between items-center gap-4 mb-1">
            <span className="text-slate-500" style={{ color: entry.color }}>{entry.name}:</span>
            <span className="font-bold text-slate-700">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function Dashboard({ data, fiscalYear, timeframe }: DashboardProps) {
  const filteredData = useMemo(() => data.filter(d => d.fiscal_year === fiscalYear), [data, fiscalYear]);

  const stats = useMemo(() => {
    let total = 0;
    let passed = 0;
    let failed = 0;
    let pending = 0;
    
    let provTotal = 0;
    let provPassed = 0;
    let provFailed = 0;
    let provTotalScore = 0;
    let provScoredItems = 0;
    const criticalIndicators: Indicator[] = [];

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
      
      const provResult = ind.results[timeframe]?.['จังหวัด'];
      if (provResult) {
        provTotal++;
        if (provResult.status === 'ผ่าน') provPassed++;
        else if (provResult.status === 'ไม่ผ่าน') {
          provFailed++;
          criticalIndicators.push(ind);
        }

        if (provResult.score !== null) {
          provTotalScore += provResult.score;
          provScoredItems++;
        }
      }
    });

    const successRate = provTotal > 0 ? Math.round((provPassed / provTotal) * 100) : 0;
    const avgScore = provScoredItems > 0 ? (provTotalScore / provScoredItems).toFixed(2) : '0.00';

    return { total, passed, failed, pending, successRate, avgScore, criticalIndicators };
  }, [filteredData, timeframe]);

  const pieData = [
    { name: 'ผ่านเกณฑ์', value: stats.passed, color: '#10b981' },
    { name: 'ไม่ผ่านเกณฑ์', value: stats.failed, color: '#f43f5e' },
    { name: 'รอประเมิน', value: stats.pending, color: '#f59e0b' },
  ];
  
  const gaugeData = [
    { name: 'ผ่าน', value: stats.successRate, color: '#10b981' },
    { name: 'ไม่ผ่าน/รอประเมิน', value: 100 - stats.successRate, color: '#f1f5f9' }
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
  
  // Helper to generate trend data for a specific indicator across quarters
  const getTrendData = (indicator: Indicator) => {
    const quarters = ['ไตรมาส 1 (ต.ค.-ธ.ค.)', 'ไตรมาส 2 (ม.ค.-มี.ค.)', 'ไตรมาส 3 (เม.ย.-มิ.ย.)', 'ไตรมาส 4 (ก.ค.-ก.ย.)'];
    return quarters.map(q => {
      const val = indicator.results[q]?.['จังหวัด']?.result_percentage;
      return {
        name: q,
        value: val !== undefined && val !== null ? val : 0
      };
    });
  };

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
      <div className={cn("p-3 rounded-xl", colorClass, "group-hover:scale-110 transition-transform")}>
        <Icon size={24} className="text-white" />
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1">สรุปผลการประเมินตัวชี้วัด MOU ประจำปีงบประมาณ {fiscalYear} | รอบ: <span className="font-semibold text-emerald-600">{timeframe}</span></p>
        </div>
        <div className="flex gap-2">
          <div className="bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm">
            <Award size={16} className="text-amber-400" />
            <span>คะแนนเฉลี่ยจังหวัด: {stats.avgScore} / 5.00</span>
          </div>
          <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium border border-emerald-200 flex items-center gap-2 shadow-sm">
            <Activity size={16} />
            <span>ข้อมูลล่าสุด: วันนี้</span>
          </div>
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
        {/* Success Rate Gauge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 col-span-1 flex flex-col items-center justify-center relative"
        >
          <h3 className="text-lg font-semibold text-slate-800 mb-2 w-full text-left flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-600" />
            อัตราความสำเร็จ (ระดับจังหวัด)
          </h3>
          <div className="h-48 w-full relative mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gaugeData}
                  cx="50%"
                  cy="100%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                >
                  {gaugeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute bottom-0 left-0 w-full text-center pb-2">
              <span className="text-5xl font-bold text-slate-800">{stats.successRate}%</span>
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-6 text-center">
            สัดส่วนตัวชี้วัดที่ผ่านเกณฑ์เทียบกับตัวชี้วัดทั้งหมดในระดับจังหวัด
          </p>
        </motion.div>

        {/* Critical Indicators List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 col-span-1 lg:col-span-2 flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <AlertTriangle size={20} className="text-rose-500" />
              ตัวชี้วัดที่ต้องเฝ้าระวัง (ระดับจังหวัด)
            </h3>
            <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {stats.criticalIndicators.length} รายการ
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[250px]">
            {stats.criticalIndicators.length > 0 ? (
              stats.criticalIndicators.map((ind, idx) => {
                const res = ind.results[timeframe]?.['จังหวัด'];
                const trendData = getTrendData(ind);
                
                return (
                  <div key={ind.id} className="p-4 rounded-xl border border-rose-100 bg-rose-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-rose-50/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold bg-slate-800 text-white px-2 py-0.5 rounded">ลำดับ {ind.order}</span>
                        <span className="text-xs text-slate-500">{ind.responsible_groups?.join(', ') || ind.responsible_group}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-800 line-clamp-2">{ind.name}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 shrink-0">
                      {/* Mini Trend Chart */}
                      <div className="w-24 h-12 bg-white rounded border border-rose-100 p-1 hidden sm:block">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={trendData}>
                            <YAxis domain={[0, 100]} hide />
                            <Line type="monotone" dataKey="value" stroke="#f43f5e" strokeWidth={2} dot={{ r: 2, fill: '#f43f5e' }} isAnimationActive={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg border border-rose-100">
                        <div className="text-center">
                          <p className="text-xs text-slate-500 mb-0.5">เป้าหมาย</p>
                          <p className="text-sm font-semibold text-slate-700">{ind.target_criteria}</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200"></div>
                        <div className="text-center">
                          <p className="text-xs text-slate-500 mb-0.5">ผลงาน</p>
                          <p className="text-sm font-bold text-rose-600">{res?.result_percentage ?? '-'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-8">
                <CheckCircle2 size={48} className="text-emerald-200 mb-3" />
                <p className="font-medium text-slate-600">ยอดเยี่ยม!</p>
                <p className="text-sm">ไม่มีตัวชี้วัดที่ไม่ผ่านเกณฑ์ในรอบประเมินนี้</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
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
                  animationDuration={1000}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity cursor-pointer outline-none" />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomPieTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Radar Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
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
                <Radar name="คะแนนเฉลี่ย" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.3} animationDuration={1000} />
                <RechartsTooltip content={<CustomRadarTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 col-span-1 lg:col-span-3"
        >
          <h3 className="text-lg font-semibold text-slate-800 mb-4">จำนวนตัวชี้วัดที่ผ่าน/ไม่ผ่าน รายพื้นที่</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{ fill: '#f8fafc' }} content={<CustomBarTooltip />} />
                <Legend iconType="circle" />
                <Bar dataKey="ผ่าน" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} animationDuration={1000} className="hover:opacity-80 transition-opacity cursor-pointer" />
                <Bar dataKey="ไม่ผ่าน" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} animationDuration={1000} className="hover:opacity-80 transition-opacity cursor-pointer" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
