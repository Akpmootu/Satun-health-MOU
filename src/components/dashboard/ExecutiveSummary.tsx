import { useMemo } from 'react';
import { Indicator } from '../../types';
import { motion } from 'motion/react';
import { AlertTriangle, CheckCircle2, Target, TrendingUp, Activity, Award } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { cn } from '../../lib/utils';

interface ExecutiveSummaryProps {
  data: Indicator[];
  fiscalYear: string;
  timeframe: string;
}

export function ExecutiveSummary({ data, fiscalYear, timeframe }: ExecutiveSummaryProps) {
  const filteredData = useMemo(() => data.filter(d => d.fiscal_year === fiscalYear), [data, fiscalYear]);

  const metrics = useMemo(() => {
    let total = 0;
    let passed = 0;
    let failed = 0;
    let pending = 0;
    let totalScore = 0;
    let scoredItems = 0;
    const criticalIndicators: Indicator[] = [];

    filteredData.forEach(ind => {
      const provResult = ind.results[timeframe]?.['ระดับจังหวัด'];
      if (provResult) {
        total++;
        if (provResult.status === 'ผ่าน') passed++;
        else if (provResult.status === 'ไม่ผ่าน') {
          failed++;
          criticalIndicators.push(ind);
        }
        else pending++;

        if (provResult.score !== null) {
          totalScore += provResult.score;
          scoredItems++;
        }
      }
    });

    const successRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    const avgScore = scoredItems > 0 ? (totalScore / scoredItems).toFixed(2) : '0.00';

    return { total, passed, failed, pending, successRate, avgScore, criticalIndicators };
  }, [filteredData, timeframe]);

  const gaugeData = [
    { name: 'ผ่าน', value: metrics.successRate, color: '#10b981' },
    { name: 'ไม่ผ่าน/รอประเมิน', value: 100 - metrics.successRate, color: '#f1f5f9' }
  ];

  const StatCard = ({ title, value, subtitle, icon: Icon, colorClass, delay }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start justify-between group hover:shadow-md transition-all"
    >
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-2">{subtitle}</p>}
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
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">สรุปสำหรับผู้บริหาร (Executive Summary)</h1>
          <p className="text-slate-500 mt-1">ภาพรวมผลการดำเนินงานระดับจังหวัด ปีงบประมาณ {fiscalYear} | รอบ: <span className="font-semibold text-emerald-600">{timeframe}</span></p>
        </div>
        <div className="bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm">
          <Award size={16} className="text-amber-400" />
          <span>คะแนนเฉลี่ยจังหวัด: {metrics.avgScore} / 5.00</span>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="ตัวชี้วัดทั้งหมด" value={metrics.total} subtitle="รายการที่ประเมินผลแล้ว" icon={Target} colorClass="bg-blue-500 shadow-blue-500/20" delay={0.1} />
        <StatCard title="ผ่านเกณฑ์" value={metrics.passed} subtitle={`คิดเป็น ${metrics.successRate}%`} icon={CheckCircle2} colorClass="bg-emerald-500 shadow-emerald-500/20" delay={0.2} />
        <StatCard title="ไม่ผ่านเกณฑ์" value={metrics.failed} subtitle="ต้องเร่งรัดติดตาม" icon={AlertTriangle} colorClass="bg-rose-500 shadow-rose-500/20" delay={0.3} />
        <StatCard title="รอประเมิน" value={metrics.pending} subtitle="อยู่ระหว่างรวบรวมข้อมูล" icon={Activity} colorClass="bg-amber-500 shadow-amber-500/20" delay={0.4} />
      </div>

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
            อัตราความสำเร็จ (Success Rate)
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
              <span className="text-5xl font-bold text-slate-800">{metrics.successRate}%</span>
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
              {metrics.criticalIndicators.length} รายการ
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {metrics.criticalIndicators.length > 0 ? (
              metrics.criticalIndicators.map((ind, idx) => {
                const res = ind.results[timeframe]?.['ระดับจังหวัด'];
                return (
                  <div key={ind.id} className="p-4 rounded-xl border border-rose-100 bg-rose-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-rose-50/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold bg-slate-800 text-white px-2 py-0.5 rounded">ลำดับ {ind.order}</span>
                        <span className="text-xs text-slate-500">{ind.responsible_group}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-800 line-clamp-2">{ind.name}</p>
                    </div>
                    <div className="flex items-center gap-6 shrink-0 bg-white px-4 py-2 rounded-lg border border-rose-100">
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
      </div>
    </div>
  );
}
