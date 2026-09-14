import React from 'react';
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Plus, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  ChevronLeft,
  Users
} from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { ExecutionPlan } from '../../types';

export const ExecutionPlansList: React.FC = () => {
  const { 
    plans, 
    setSelectedPlan, 
    setIsPlanModalOpen, 
    approveExecutionPlan,
    createExecutionPlan,
    setIsCeoCommandOpen
  } = useCompany();

  const handleOpenPlan = (plan: ExecutionPlan) => {
    setSelectedPlan(plan);
    setIsPlanModalOpen(true);
  };

  return (
    <div className="space-y-6 text-right">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <span>الخطط التنفيذية للفرق الذكية</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] font-mono border border-[var(--border-accent)]">
              {plans.length} خطط
            </span>
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            دورة حياة العمل الحقيقي: تخطيط ← اعتماد نواف ← تنفيذ ذاتي محكم ← تسليم النتائج ($0.00)
          </p>
        </div>

        <button
          onClick={() => setIsCeoCommandOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء خطة تنفيذية جديدة</span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((plan) => {
          const completedCount = plan.steps.filter(s => s.status === 'COMPLETED').length;
          const totalCount = plan.steps.length;
          const pct = Math.round((completedCount / totalCount) * 100);

          return (
            <div 
              key={plan.id}
              className="rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-accent)] p-5 transition-all shadow-sm flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    plan.status === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : plan.status === 'IN_PROGRESS'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 animate-pulse'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {plan.status === 'COMPLETED' ? 'مكتملة بنجاح' : (plan.status === 'IN_PROGRESS' ? 'قيد التنفيذ التتابعي' : 'مسودة بانتظار الاعتماد')}
                  </span>

                  <span className="text-[11px] text-[var(--text-muted)] font-mono">
                    المشروع: {plan.projectName}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                    {plan.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed">
                    {plan.summary}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[var(--text-secondary)] font-medium">
                      الخطوات المكتملة ({completedCount} من {totalCount})
                    </span>
                    <span className="font-mono font-bold text-[var(--accent-primary)]">{pct}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[var(--bg-base)] overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-[var(--accent-primary)] transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Team Avatars */}
                <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-[11px]">
                  <div className="flex items-center gap-1">
                    <span className="text-[var(--text-muted)] ml-1">الفريق:</span>
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {plan.team.map(m => (
                        <span 
                          key={m.id} 
                          title={`${m.name} (${m.role})`}
                          className="inline-block h-6 w-6 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center text-xs leading-5"
                        >
                          {m.avatar}
                        </span>
                      ))}
                    </div>
                  </div>

                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    $0.00
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
                <button
                  onClick={() => handleOpenPlan(plan)}
                  className="flex-1 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-base)] text-[var(--text-primary)] border border-[var(--border-subtle)] text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <span>استعراض التفاصيل</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {plan.status === 'PLANNING' && (
                  <button
                    onClick={() => approveExecutionPlan(plan.id)}
                    className="flex-1 py-2 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>اعتماد وبدء</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
