import { useState, useEffect, useRef } from 'react';
import { Indicator, AREAS, User } from '../../types';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { GripVertical, X, Settings2, Plus, Download } from 'lucide-react';
import { cn } from '../../lib/utils';
import Swal from 'sweetalert2';
import { supabase } from '../../lib/supabase';
import { toPng } from 'html-to-image';

interface CustomDashboardProps {
  data: Indicator[];
  timeframe: string;
  user?: User | null;
}

type ChartType = 'bar' | 'line' | 'pie' | 'ranking';

interface DashboardWidget {
  id: string;
  indicatorId: string;
  chartType: ChartType;
}

const COLORS = ['#10b981', '#f43f5e', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

export function CustomDashboard({ data, timeframe, user }: CustomDashboardProps) {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Load saved widgets from Supabase or local storage
  useEffect(() => {
    const loadWidgets = async () => {
      if (user) {
        try {
          // Try to load from Supabase first
          // Note: This requires a 'user_dashboards' table to exist in Supabase
          // Schema: id (uuid), user_id (uuid), widgets (jsonb)
          const { data: dbData, error } = await supabase
            .from('user_dashboards')
            .select('widgets')
            .eq('user_id', user.id)
            .single();
            
          if (!error && dbData && dbData.widgets) {
            setWidgets(dbData.widgets);
            return;
          }
        } catch (err) {
          console.log('Supabase user_dashboards table might not exist yet. Falling back to localStorage.');
        }
      }
      
      // Fallback to localStorage
      const storageKey = user ? `customDashboardWidgets_${user.id}` : 'customDashboardWidgets';
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          setWidgets(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse saved widgets', e);
        }
      }
    };
    
    loadWidgets();
  }, [user]);

  // Save widgets to Supabase and local storage whenever they change
  useEffect(() => {
    const saveWidgets = async () => {
      const storageKey = user ? `customDashboardWidgets_${user.id}` : 'customDashboardWidgets';
      localStorage.setItem(storageKey, JSON.stringify(widgets));
      
      if (user) {
        try {
          // Try to save to Supabase
          // Note: This requires a 'user_dashboards' table to exist in Supabase
          await supabase
            .from('user_dashboards')
            .upsert({ user_id: user.id, widgets: widgets }, { onConflict: 'user_id' });
        } catch (err) {
          // Silently fail if table doesn't exist
        }
      }
    };
    
    // Only save if we have initialized (not empty array on first render if they had saved widgets)
    // Actually, it's fine to save empty array if they deleted everything
    saveWidgets();
  }, [widgets, user]);

  const handleExport = async () => {
    if (!dashboardRef.current) return;
    
    try {
      // Temporarily add a class to improve export rendering
      dashboardRef.current.classList.add('exporting-dashboard');
      
      const dataUrl = await toPng(dashboardRef.current, { 
        quality: 1.0,
        backgroundColor: '#ffffff',
        style: {
          padding: '20px',
          borderRadius: '0px'
        }
      });
      
      dashboardRef.current.classList.remove('exporting-dashboard');
      
      const link = document.createElement('a');
      link.download = `mou-dashboard-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
      
      Swal.fire({
        icon: 'success',
        title: 'ส่งออกสำเร็จ',
        text: 'บันทึกรูปภาพแดชบอร์ดเรียบร้อยแล้ว',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('Export failed', err);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถส่งออกรูปภาพได้ กรุณาลองใหม่อีกครั้ง'
      });
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // Dropped outside a valid droppable
    if (!destination) return;

    // Reordering within the dashboard
    if (source.droppableId === 'dashboard' && destination.droppableId === 'dashboard') {
      const newWidgets = Array.from(widgets);
      const [reorderedItem] = newWidgets.splice(source.index, 1);
      newWidgets.splice(destination.index, 0, reorderedItem);
      setWidgets(newWidgets);
      return;
    }

    // Dragging from available indicators to dashboard
    if (source.droppableId === 'available-indicators' && destination.droppableId === 'dashboard') {
      const indicatorId = result.draggableId;
      
      // Ask for chart type
      Swal.fire({
        title: 'เลือกรูปแบบกราฟ',
        input: 'select',
        inputOptions: {
          'bar': 'กราฟแท่ง (Bar Chart)',
          'line': 'กราฟเส้น (Line Chart)',
          'pie': 'กราฟวงกลม (Pie Chart)',
          'ranking': 'จัดอันดับ (Ranking)'
        },
        inputPlaceholder: 'เลือกรูปแบบกราฟ',
        showCancelButton: true,
        confirmButtonText: 'เพิ่มลงแดชบอร์ด',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#10b981',
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          const newWidget: DashboardWidget = {
            id: `widget-${Date.now()}`,
            indicatorId: indicatorId,
            chartType: result.value as ChartType
          };
          
          const newWidgets = Array.from(widgets);
          newWidgets.splice(destination.index, 0, newWidget);
          setWidgets(newWidgets);
        }
      });
    }
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const renderChart = (widget: DashboardWidget) => {
    const indicator = data.find(d => d.id === widget.indicatorId);
    if (!indicator) return <div className="p-4 text-center text-slate-500">ไม่พบข้อมูลตัวชี้วัด</div>;

    const chartData = AREAS.map(area => ({
      name: area.replace('คปสอ.', ''),
      score: indicator.results[timeframe]?.[area]?.score || 0,
      percentage: indicator.results[timeframe]?.[area]?.result_percentage || 0
    }));

    if (widget.chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Bar dataKey="score" name="คะแนน" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (widget.chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Line type="monotone" dataKey="score" name="คะแนน" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (widget.chartType === 'pie') {
      // For pie chart, let's show distribution of scores
      const scoreDistribution = [
        { name: '5 คะแนน', value: chartData.filter(d => d.score === 5).length },
        { name: '4 คะแนน', value: chartData.filter(d => d.score >= 4 && d.score < 5).length },
        { name: '3 คะแนน', value: chartData.filter(d => d.score >= 3 && d.score < 4).length },
        { name: 'ต่ำกว่า 3', value: chartData.filter(d => d.score < 3).length },
      ].filter(d => d.value > 0);

      return (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={scoreDistribution}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {scoreDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return null;
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mt-8">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Settings2 size={20} className="text-indigo-600" />
            แดชบอร์ดปรับแต่งเอง (Custom Dashboard)
          </h3>
          <p className="text-sm text-slate-500">ลากและวางตัวชี้วัดเพื่อสร้างกราฟตามที่คุณต้องการ</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {!isEditing && widgets.length > 0 && (
            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 flex-1 sm:flex-none"
              title="ส่งออกเป็นรูปภาพ"
            >
              <Download size={16} />
              <span className="hidden sm:inline">ส่งออก</span>
            </button>
          )}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={cn(
              "px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 flex-1 sm:flex-none",
              isEditing 
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" 
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            )}
          >
            {isEditing ? 'เสร็จสิ้น' : 'แก้ไขแดชบอร์ด'}
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className={cn("grid transition-all duration-300", isEditing ? "grid-cols-1 lg:grid-cols-4" : "grid-cols-1")}>
          
          {/* Available Indicators Sidebar (Only visible when editing) */}
          {isEditing && (
            <div className="lg:col-span-1 border-r border-slate-100 bg-slate-50 p-4 max-h-[600px] overflow-y-auto">
              <h4 className="font-bold text-slate-700 mb-4 text-sm flex items-center gap-2">
                <Plus size={16} className="text-emerald-500" />
                ตัวชี้วัดที่สามารถเพิ่มได้
              </h4>
              <Droppable droppableId="available-indicators" isDropDisabled={true}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-2"
                  >
                    {data.map((indicator, index) => (
                      // @ts-ignore - key is required by React but not in DraggableProps
                      <Draggable key={`avail-${indicator.id}`} draggableId={indicator.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn(
                              "p-3 bg-white rounded-xl border border-slate-200 shadow-sm text-sm cursor-grab active:cursor-grabbing flex items-start gap-2 transition-all",
                              snapshot.isDragging && "shadow-lg ring-2 ring-indigo-500 border-transparent rotate-2 scale-105 z-50"
                            )}
                          >
                            <GripVertical size={16} className="text-slate-400 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <p className="font-bold text-slate-700 truncate">{indicator.name}</p>
                              <p className="text-[10px] text-slate-500 mt-1">ลำดับ {indicator.order}</p>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )}

          {/* Dashboard Area */}
          <div className={cn("p-6 bg-slate-50/30", isEditing ? "lg:col-span-3" : "col-span-1")}>
            <Droppable droppableId="dashboard" direction="horizontal">
              {(provided, snapshot) => (
                <div
                  ref={(el) => {
                    provided.innerRef(el);
                    // @ts-ignore - assigning to ref current is fine
                    dashboardRef.current = el;
                  }}
                  {...provided.droppableProps}
                  className={cn(
                    "grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[200px] rounded-2xl transition-colors",
                    isEditing && "p-4 border-2 border-dashed",
                    snapshot.isDraggingOver ? "border-indigo-400 bg-indigo-50/50" : "border-slate-200",
                    !isEditing && widgets.length === 0 && "hidden"
                  )}
                >
                  {widgets.length === 0 && isEditing && (
                    <div className="col-span-full flex flex-col items-center justify-center text-slate-400 py-12">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <Plus size={32} />
                      </div>
                      <p className="font-bold text-slate-600">ลากตัวชี้วัดมาวางที่นี่</p>
                      <p className="text-sm">เพื่อสร้างกราฟในแดชบอร์ดของคุณ</p>
                    </div>
                  )}

                  {widgets.map((widget, index) => {
                    const indicator = data.find(d => d.id === widget.indicatorId);
                    return (
                      // @ts-ignore - key is required by React but not in DraggableProps
                      <Draggable key={widget.id} draggableId={widget.id} index={index} isDragDisabled={!isEditing}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={cn(
                              "bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col",
                              isEditing ? "border-indigo-100" : "border-slate-100",
                              snapshot.isDragging && "shadow-xl ring-2 ring-indigo-500 border-transparent rotate-1 scale-105 z-50"
                            )}
                          >
                            <div className="p-4 border-b border-slate-50 flex justify-between items-start bg-slate-50/50">
                              <div className="flex items-start gap-2 min-w-0 pr-4">
                                {isEditing && (
                                  <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-200 rounded shrink-0">
                                    <GripVertical size={16} className="text-slate-400" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <h4 className="font-bold text-slate-700 text-sm line-clamp-2" title={indicator?.name}>
                                    {indicator?.name || 'ไม่พบข้อมูล'}
                                  </h4>
                                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
                                    {widget.chartType === 'bar' ? 'Bar Chart' : widget.chartType === 'line' ? 'Line Chart' : 'Pie Chart'}
                                  </p>
                                </div>
                              </div>
                              {isEditing && (
                                <button
                                  onClick={() => removeWidget(widget.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                                >
                                  <X size={16} />
                                </button>
                              )}
                            </div>
                            <div className="p-4 flex-1 flex items-center justify-center">
                              {renderChart(widget)}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {!isEditing && widgets.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings2 size={32} />
                </div>
                <h4 className="text-lg font-bold text-slate-700 mb-2">ยังไม่มีกราฟในแดชบอร์ดของคุณ</h4>
                <p className="text-slate-500 mb-6">คลิกปุ่ม "แก้ไขแดชบอร์ด" เพื่อเพิ่มกราฟที่คุณต้องการติดตามเป็นพิเศษ</p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 transition-all"
                >
                  เริ่มสร้างแดชบอร์ด
                </button>
              </div>
            )}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
