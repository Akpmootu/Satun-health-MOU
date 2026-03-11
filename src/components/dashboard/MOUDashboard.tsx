import { useState, useMemo } from 'react';
import { Indicator, AREAS, User } from '../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Cell as RechartsCell } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, CheckCircle2, XCircle, Clock, TrendingUp, Activity, 
  AlertTriangle, Award, PieChart as PieChartIcon, ArrowRight, 
  FileText, Users, ChevronDown, ChevronUp, Filter, Search,
  ExternalLink, Info, ArrowLeft
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { CustomDashboard } from './CustomDashboard';
import { ExecutiveDashboard } from './ExecutiveDashboard';

interface MOUDashboardProps {
  data: Indicator[];
  fiscalYear: string;
  timeframe: string;
  user?: User | null;
  onTabChange?: (tab: string) => void;
  onBack?: () => void;
  isDataEntryEnabled?: boolean;
}

const COLORS = ['#10b981', '#f43f5e', '#f59e0b', '#3b82f6', '#8b5cf6'];

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

export function MOUDashboard({ data, fiscalYear, timeframe, user, onTabChange, onBack }: MOUDashboardProps) {
  const [expandedIndicator, setExpandedIndicator] = useState<string | null>(null);
  const [recordingSort, setRecordingSort] = useState<'name' | 'percentage'>('percentage');
  const [recordingOrder, setRecordingOrder] = useState<'asc' | 'desc'>('desc');
  const [dashboardTab, setDashboardTab] = useState<'system' | 'executive' | 'custom'>(
    user?.role === 'ผู้บริหาร' ? 'executive' : 'system'
  );

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

  const recordingStatus = useMemo(() => {
    const status = AREAS.map(area => {
      let completed = 0;
      filteredData.forEach(ind => {
        const res = ind.results[timeframe]?.[area];
        if (res && (res.status === 'ผ่าน' || res.status === 'ไม่ผ่าน' || res.score !== null)) {
          completed++;
        }
      });
      const percentage = filteredData.length > 0 ? Math.round((completed / filteredData.length) * 100) : 0;
      return {
        area,
        name: area.replace('คปสอ.', ''),
        completed,
        total: filteredData.length,
        percentage
      };
    });

    return status.sort((a, b) => {
      const factor = recordingOrder === 'asc' ? 1 : -1;
      if (recordingSort === 'name') return a.name.localeCompare(b.name) * factor;
      return (a.percentage - b.percentage) * factor;
    });
  }, [filteredData, timeframe, recordingSort, recordingOrder]);

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

  const StatCard = ({ title, value, icon: Icon, colorClass, delay, subValue }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-start justify-between group hover:shadow-md transition-all"
    >
      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 tracking-tight truncate">{value}</h3>
        {subValue && <p className="text-xs text-slate-500 mt-1">{subValue}</p>}
      </div>
      <div className={cn("p-3 rounded-xl shrink-0", colorClass, "group-hover:scale-110 transition-transform")}>
        <Icon size={20} className="text-white" />
      </div>
    </motion.div>
  );

  const deadline = new Date('2026-03-15');
  const today = new Date();
  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isNearDeadline = diffDays > 0 && diffDays <= 15;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">MOU Indicators Dashboard</h1>
            <p className="text-slate-500 text-sm">ปีงบประมาณ {fiscalYear} | รอบ: <span className="font-semibold text-emerald-600">{timeframe}</span></p>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setDashboardTab('system')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap",
              dashboardTab === 'system' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            ภาพรวมระบบ
          </button>
          {(user?.role === 'ผู้บริหาร' || user?.role === 'admin') && (
            <button
              onClick={() => setDashboardTab('executive')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap",
                dashboardTab === 'executive' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              แดชบอร์ดผู้บริหาร
            </button>
          )}
          <button
            onClick={() => setDashboardTab('custom')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap",
              dashboardTab === 'custom' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            แดชบอร์ดของฉัน
          </button>
        </div>
      </div>

      {dashboardTab === 'system' && (
        <>
          {/* First Fold: Key Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {isNearDeadline && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg shadow-amber-200 flex items-center justify-between overflow-hidden relative"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={18} className="text-amber-100" />
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-100">Deadline Reminder</span>
                </div>
                <h3 className="text-xl font-bold">เหลือเวลาอีก {diffDays} วัน จะปิดระบบบันทึกข้อมูล</h3>
                <p className="text-amber-50 text-sm mt-1 opacity-90">กรุณาตรวจสอบและบันทึกข้อมูลให้ครบถ้วนภายในวันที่ 15 มีนาคม 2569</p>
              </div>
              <div className="hidden sm:block opacity-20 absolute -right-4 -bottom-4">
                <Clock size={120} />
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard 
              title="คะแนนเฉลี่ยจังหวัด" 
              value={`${stats.avgScore} / 5.00`} 
              icon={Award} 
              colorClass="bg-indigo-600 shadow-indigo-200" 
              delay={0.1}
              subValue="จากตัวชี้วัดที่มีการให้คะแนน"
            />
            <StatCard 
              title="อัตราความสำเร็จ" 
              value={`${stats.successRate}%`} 
              icon={TrendingUp} 
              colorClass="bg-emerald-500 shadow-emerald-200" 
              delay={0.2}
              subValue="ตัวชี้วัดที่ผ่านเกณฑ์ระดับจังหวัด"
            />
            <StatCard 
              title="รายการประเมินทั้งหมด" 
              value={stats.total} 
              icon={Target} 
              colorClass="bg-blue-500 shadow-blue-200" 
              delay={0.3}
              subValue="รวมทุกพื้นที่และทุกตัวชี้วัด"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={() => onTabChange?.('indicators')}
              className="flex items-center justify-between p-4 bg-white hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 rounded-2xl transition-all group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-800">บันทึกข้อมูล MOU</p>
                  <p className="text-xs text-slate-500">ลงข้อมูลผลการดำเนินงาน</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
            </button>

            <button 
              onClick={() => {
                const el = document.getElementById('critical-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center justify-between p-4 bg-white hover:bg-rose-50 border border-slate-100 hover:border-rose-200 rounded-2xl transition-all group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-800">ตัวชี้วัดที่ไม่ผ่าน</p>
                  <p className="text-xs text-slate-500">ตรวจสอบรายการที่ต้องแก้ไข</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-slate-300 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
            </button>

            <button 
              onClick={() => {
                const el = document.getElementById('recording-status-section');
                el?.scrollIntoView({ behavior: 'smooth' });
                setRecordingSort('percentage');
                setRecordingOrder('asc');
              }}
              className="flex items-center justify-between p-4 bg-white hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 rounded-2xl transition-all group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-800">หน่วยงานที่ยังไม่บันทึก</p>
                  <p className="text-xs text-slate-500">ติดตามความก้าวหน้าการบันทึก</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>
      </div>

      {/* Departmental Data Recording Status */}
      <motion.div
        id="recording-status-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Activity size={20} className="text-indigo-600" />
              สถานะการบันทึกข้อมูลรายหน่วยงาน
            </h3>
            <p className="text-sm text-slate-500">ความก้าวหน้าในการบันทึกข้อมูลตัวชี้วัดทั้งหมด {filteredData.length} รายการ</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                setRecordingOrder(recordingOrder === 'asc' ? 'desc' : 'asc');
              }}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Filter size={16} />
              เรียงตาม {recordingSort === 'name' ? 'ชื่อ' : 'ความก้าวหน้า'} ({recordingOrder === 'asc' ? 'น้อย-มาก' : 'มาก-น้อย'})
            </button>
            <select 
              value={recordingSort}
              onChange={(e) => setRecordingSort(e.target.value as any)}
              className="bg-slate-50 border-none text-sm font-medium text-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500"
            >
              <option value="percentage">ความก้าวหน้า</option>
              <option value="name">ชื่อหน่วยงาน</option>
            </select>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {recordingStatus.map((item) => (
              <div key={item.area} className="space-y-2">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <span className="font-bold text-slate-700">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "text-sm font-bold",
                      item.percentage === 100 ? "text-emerald-600" : item.percentage > 50 ? "text-indigo-600" : "text-amber-600"
                    )}>
                      {item.percentage}%
                    </span>
                    <span className="text-xs text-slate-400 ml-2">({item.completed}/{item.total})</span>
                  </div>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={cn(
                      "h-full rounded-full",
                      item.percentage === 100 ? "bg-emerald-500" : item.percentage > 50 ? "bg-indigo-500" : "bg-amber-500"
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <PieChartIcon size={20} className="text-emerald-600" />
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
                <RechartsTooltip content={<CustomPieTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Award size={20} className="text-indigo-600" />
            คะแนนเฉลี่ยรายพื้นที่ (Radar Chart)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#94a3b8' }} />
                <Radar name="คะแนนเฉลี่ย" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.2} />
                <RechartsTooltip content={<CustomRadarTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 lg:col-span-3">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <CheckCircle2 size={20} className="text-emerald-600" />
            จำนวนตัวชี้วัดที่ผ่าน/ไม่ผ่าน รายพื้นที่
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{ fill: '#f8fafc' }} content={<CustomBarTooltip />} />
                <Legend iconType="circle" />
                <Bar dataKey="ผ่าน" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                <Bar dataKey="ไม่ผ่าน" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top 5 Indicators */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Award size={24} className="text-amber-500" />
            Top 5 ตัวชี้วัดสำคัญ
          </h3>
          <p className="text-sm text-slate-500">คลิกเพื่อดูรายละเอียดรายพื้นที่</p>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {filteredData.slice(0, 5).map((indicator, idx) => {
            const isExpanded = expandedIndicator === indicator.id;
            const provRes = indicator.results[timeframe]?.['จังหวัด'];
            const indicatorData = AREAS.map(area => ({
              name: area.replace('คปสอ.', ''),
              score: indicator.results[timeframe]?.[area]?.score || 0,
              status: indicator.results[timeframe]?.[area]?.status || 'รอประเมิน'
            }));

            return (
              <motion.div 
                key={indicator.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "bg-white rounded-2xl border transition-all overflow-hidden",
                  isExpanded ? "border-indigo-200 shadow-lg ring-1 ring-indigo-50" : "border-slate-100 shadow-sm hover:border-slate-200"
                )}
              >
                <button 
                  onClick={() => setExpandedIndicator(isExpanded ? null : indicator.id)}
                  className="w-full p-5 flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0",
                      isExpanded ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                    )}>
                      {indicator.order}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-800 truncate">{indicator.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Users size={12} />
                          {indicator.responsible_groups?.join(', ') || indicator.responsible_group}
                        </span>
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                          provRes?.status === 'ผ่าน' ? "bg-emerald-100 text-emerald-700" : 
                          provRes?.status === 'ไม่ผ่าน' ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-500"
                        )}>
                          {provRes?.status || 'รอประเมิน'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="hidden sm:flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">เป้าหมาย</p>
                        <p className="text-sm font-bold text-slate-700">{indicator.target_criteria}</p>
                      </div>
                      <div className="w-px h-8 bg-slate-100"></div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">ผลงาน</p>
                        <p className="text-sm font-bold text-indigo-600">{provRes?.result_percentage ?? '-'}</p>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp size={20} className="text-indigo-600" /> : <ChevronDown size={20} className="text-slate-300" />}
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-50 bg-slate-50/50"
                    >
                      <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                          <div className="lg:col-span-8">
                            <h5 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                              <PieChartIcon size={16} className="text-indigo-500" />
                              คะแนนรายพื้นที่
                            </h5>
                            <div className="h-64 w-full bg-white rounded-2xl p-4 border border-slate-100">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={indicatorData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                  <YAxis domain={[0, 5]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                  <RechartsTooltip 
                                    cursor={{ fill: '#f8fafc' }}
                                    content={({ active, payload, label }) => {
                                      if (active && payload && payload.length) {
                                        return (
                                          <div className="bg-white p-2 rounded-lg shadow-md border border-slate-100 text-xs">
                                            <p className="font-bold mb-1">{label}</p>
                                            <p>คะแนน: <span className="text-indigo-600 font-bold">{payload[0].value}</span></p>
                                          </div>
                                        );
                                      }
                                      return null;
                                    }}
                                  />
                                  <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={35}>
                                    {indicatorData.map((entry, index) => (
                                      <RechartsCell key={`cell-${index}`} fill={entry.score >= 4 ? '#10b981' : entry.score >= 3 ? '#f59e0b' : '#f43f5e'} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                          <div className="lg:col-span-4 space-y-4">
                            <h5 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                              <Info size={16} className="text-indigo-500" />
                              สรุปรายละเอียด
                            </h5>
                            <div className="bg-white rounded-2xl p-4 border border-slate-100 space-y-4">
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">คำนิยาม</p>
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{indicator.definition || 'ไม่มีข้อมูลคำนิยาม'}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="p-3 bg-slate-50 rounded-xl">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">ตัวตั้ง</p>
                                  <p className="text-sm font-bold text-slate-800 mt-1">{provRes?.numerator ?? '-'}</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">ตัวหาร</p>
                                  <p className="text-sm font-bold text-slate-800 mt-1">{provRes?.denominator ?? '-'}</p>
                                </div>
                              </div>
                              <button className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2">
                                <ExternalLink size={14} />
                                ดูรายละเอียดตัวชี้วัดเต็มรูปแบบ
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Critical Indicators Section */}
      <div id="critical-section" className="pt-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle size={20} className="text-rose-500" />
              ตัวชี้วัดที่ต้องเฝ้าระวัง (ระดับจังหวัด)
            </h3>
            <span className="bg-rose-100 text-rose-700 text-xs font-bold px-3 py-1 rounded-full">
              {stats.criticalIndicators.length} รายการ
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.criticalIndicators.length > 0 ? (
              stats.criticalIndicators.map((ind) => {
                const res = ind.results[timeframe]?.['จังหวัด'];
                const trendData = getTrendData(ind);
                
                return (
                  <div key={ind.id} className="p-4 rounded-2xl border border-rose-100 bg-rose-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-rose-50/50 transition-all group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold bg-slate-800 text-white px-1.5 py-0.5 rounded">ลำดับ {ind.order}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase truncate">{ind.responsible_groups?.join(', ') || ind.responsible_group}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-rose-700 transition-colors">{ind.name}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="w-20 h-10 bg-white rounded-lg border border-rose-100 p-1 hidden sm:block">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={trendData}>
                            <YAxis domain={[0, 100]} hide />
                            <Line type="monotone" dataKey="value" stroke="#f43f5e" strokeWidth={2} dot={false} isAnimationActive={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-rose-100 shadow-sm">
                        <div className="text-center">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">ผลงาน</p>
                          <p className="text-xs font-bold text-rose-600">{res?.result_percentage ?? '-'}</p>
                        </div>
                        <div className="w-px h-6 bg-slate-100"></div>
                        <div className="text-center">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">เป้า</p>
                          <p className="text-xs font-bold text-slate-700">{ind.target_criteria}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <p className="font-bold text-slate-600">ยอดเยี่ยม! ทุกตัวชี้วัดผ่านเกณฑ์</p>
                <p className="text-sm">ไม่มีรายการที่ต้องเฝ้าระวังในขณะนี้</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      </>)}

      {dashboardTab === 'custom' && (
        <CustomDashboard data={filteredData} timeframe={timeframe} user={user} />
      )}
      
      {dashboardTab === 'executive' && (
        <ExecutiveDashboard data={filteredData} timeframe={timeframe} />
      )}
    </div>
  );
}
