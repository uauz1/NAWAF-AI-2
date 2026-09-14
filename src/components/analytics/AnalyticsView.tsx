import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Coins, 
  Sparkles, 
  ShieldCheck,
  ArrowUpRight,
  PieChart,
  Activity
} from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';

export const AnalyticsView: React.FC = () => {
  const { metrics, projects, employees, departments } = useCompany();

  // Weekly productivity data points
  const productivityDays = [
    { day: 'السبت', value: 94, tasks: 12 },
    { day: 'الأحد', value: 96, tasks: 15 },
    { day: 'الإثنين', value: 98, tasks: 18 },
    { day: 'الثلاثاء', value: 97, tasks: 14 },
    { day: 'الأربعاء', value: 99, tasks: 20 },
    { day: 'الخميس', value: 98, tasks: 16 },
    { day: 'اليوم', value: 97.4, tasks: 14 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="rounded-2xl glass-panel p-6 border border-white/10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                لوحة التحليلات وأداء الشركة (Company Analytics)
              </h2>
              <span className="text-xs bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono">
                كبيرة المحللين: نورة
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              مؤشرات الأداء اللحظية، توزيع عبء العمل على الموظفين، وضمان الالتزام الصارم بالتكلفة الصفرية $0.00.
            </p>
          </div>

          {/* Zero Cost Badge */}
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-right self-start md:self-auto">
            <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>القانون رقم 1 — المصاريف الإجمالية:</span>
            </div>
            <div className="text-xl font-black text-emerald-300 font-mono mt-0.5">$0.00</div>
            <div className="text-[9px] text-slate-400">وفرت ما يقارب 35,000$ شهرياً</div>
          </div>
        </div>
      </div>

      {/* 4 Metric Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-white/10">
          <div className="text-xs text-slate-400 mb-1">متوسط إنتاجية الفريق</div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">{metrics.productivityRate}%</div>
          <div className="text-[10px] text-emerald-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+2.4% أعلى من الأسبوع الماضي</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/10">
          <div className="text-xs text-slate-400 mb-1">إجمالي المهام المكتملة</div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">{metrics.completedTasks}</div>
          <div className="text-[10px] text-slate-400 mt-2">
            منذ بداية تشغيل نظام Nawaf HQ
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/10">
          <div className="text-xs text-slate-400 mb-1">الوصول العضوي المتوقع</div>
          <div className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">145K+</div>
          <div className="text-[10px] text-purple-300 mt-2">
            مستخدم مستهدف بدون أي إعلان مدفوع
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/10">
          <div className="text-xs text-slate-400 mb-1">معدل التعاون الذاتي</div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">92%</div>
          <div className="text-[10px] text-slate-400 mt-2">
            مهام نُسقت ذاتياً بدون تدخل يدوي
          </div>
        </div>
      </div>

      {/* Productivity Chart & Department Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Productivity Curve */}
        <div className="lg:col-span-2 rounded-2xl glass-panel p-6 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>معدل الإنتاجية الأسبوعي لشركة Nawaf HQ</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                تدرج الكفاءة اليومية مع إتمام المهام
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-500/20">
              Avg: 97.4%
            </span>
          </div>

          {/* Cinematic Bar / Curve Visualizer */}
          <div className="flex items-end justify-between gap-3 h-48 pt-6 pb-2 border-b border-white/10">
            {productivityDays.map((item, idx) => {
              const heightPercent = ((item.value - 80) / 20) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-mono text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.value}%
                  </span>
                  <div className="w-full bg-slate-900 rounded-t-xl h-full flex items-end p-1 overflow-hidden">
                    <div 
                      className="w-full rounded-t-lg bg-gradient-to-t from-cyan-600 via-indigo-500 to-purple-500 transition-all duration-700 group-hover:brightness-125"
                      style={{ height: `${heightPercent}%` }}
                    ></div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">{item.day}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 mt-4">
            <span>النظام يعمل 24/7 بكفاءة مستقرة</span>
            <span className="text-cyan-400">تحديث لحظي تلقائي</span>
          </div>
        </div>

        {/* Right 1 Col: Department Workload Breakdown */}
        <div className="rounded-2xl glass-panel p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-400" />
              <span>توزيع المهام بين الأقسام</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              نسبة الأعمال النشطة في كل قسم
            </p>

            <div className="space-y-3">
              {departments.map(dept => {
                const percentage = Math.round((dept.activeTasks / 33) * 100);
                return (
                  <div key={dept.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">{dept.name}</span>
                      <span className="text-slate-400 font-mono">{dept.activeTasks} مهام ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${dept.color}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-400">
            توازن المهام يضمن عدم وجود اختناقات تشغيلية.
          </div>
        </div>

      </div>

    </div>
  );
};
