import React from 'react';
import { BarChart3, TrendingUp, CheckCircle2, AlertCircle, Users, PieChart } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';

export const AnalyticsView: React.FC = () => {
  const { metrics, tasks, employees, departments, decisions, ideas } = useCompany();

  const totalTasks = tasks.length;
  const blockedTasks = tasks.filter(task => task.status === 'blocked').length;
  const reviewingTasks = tasks.filter(task => task.status === 'reviewing').length;
  const waitingTasks = tasks.filter(task => task.status === 'needs_ceo').length;
  const totalActiveDepartmentTasks = departments.reduce((sum, dept) => sum + Math.max(0, dept.activeTasks || 0), 0);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl glass-panel p-6 border border-white/10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">لوحة التحليلات الفعلية</h2>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              هذه اللوحة تعرض القيم الموجودة حالياً في NAWAF HQ فقط، ولا تنشئ توقعات أو نسباً تاريخية غير موثقة.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/40 border border-white/10 text-right self-start md:self-auto">
            <div className="text-[10px] text-slate-400">إجمالي المهام المسجلة</div>
            <div className="text-xl font-black text-white font-mono mt-0.5">{totalTasks}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-white/10">
          <div className="text-xs text-slate-400 mb-1">اكتمال المهام المسجلة</div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">{metrics.productivityRate}%</div>
          <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>محسوب من المهام المكتملة فعلياً</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/10">
          <div className="text-xs text-slate-400 mb-1">مهام مكتملة</div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">{metrics.completedTasks}</div>
          <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>لا تُحتسب بدون نتيجة موثقة</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/10">
          <div className="text-xs text-slate-400 mb-1">مهام متوقفة أو تنتظر قراراً</div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">{blockedTasks + waitingTasks}</div>
          <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            <span>{blockedTasks} متوقفة، {waitingTasks} تنتظر نواف</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/10">
          <div className="text-xs text-slate-400 mb-1">حالة الشركة المسجلة</div>
          <div className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">{metrics.workingEmployees}</div>
          <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>موظفون بحالة عمل من أصل {employees.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl glass-panel p-6 border border-white/10">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>حالة المهام الحالية</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-slate-950/40 border border-white/5 p-4 text-center">
              <div className="text-2xl font-bold text-indigo-300 font-mono">{metrics.inProgressTasks}</div>
              <div className="text-[11px] text-slate-400 mt-1">قيد التنفيذ/المراجعة</div>
            </div>
            <div className="rounded-xl bg-slate-950/40 border border-white/5 p-4 text-center">
              <div className="text-2xl font-bold text-emerald-300 font-mono">{metrics.completedTasks}</div>
              <div className="text-[11px] text-slate-400 mt-1">مكتملة</div>
            </div>
            <div className="rounded-xl bg-slate-950/40 border border-white/5 p-4 text-center">
              <div className="text-2xl font-bold text-amber-300 font-mono">{reviewingTasks}</div>
              <div className="text-[11px] text-slate-400 mt-1">قيد المراجعة</div>
            </div>
            <div className="rounded-xl bg-slate-950/40 border border-white/5 p-4 text-center">
              <div className="text-2xl font-bold text-rose-300 font-mono">{decisions.filter(d => d.status === 'waiting').length}</div>
              <div className="text-[11px] text-slate-400 mt-1">قرارات معلقة</div>
            </div>
          </div>

          <div className="mt-4 text-xs text-slate-400">
            أفكار مسجلة: <span className="text-cyan-300 font-mono">{ideas.length}</span>. لا توجد بيانات تاريخية أسبوعية ما لم تُسجّل فعلياً في النظام.
          </div>
        </div>

        <div className="rounded-2xl glass-panel p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-400" />
              <span>المهام النشطة المسجلة حسب القسم</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">يعتمد العرض على activeTasks الحالي، وليس على نسبة مفترضة.</p>

            <div className="space-y-3">
              {departments.map(dept => {
                const active = Math.max(0, dept.activeTasks || 0);
                const percentage = totalActiveDepartmentTasks > 0 ? Math.round((active / totalActiveDepartmentTasks) * 100) : 0;
                return (
                  <div key={dept.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">{dept.name}</span>
                      <span className="text-slate-400 font-mono">{active} مهام ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${dept.color}`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-400">
            إذا كانت كل القيم صفراً فهذا يعني أنه لا توجد مهام نشطة موثقة حالياً.
          </div>
        </div>
      </div>
    </div>
  );
};
