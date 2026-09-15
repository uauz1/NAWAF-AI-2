import React from 'react';
import { Sparkles, ShieldCheck, Play, Bot, CheckCircle2, Crown, Zap, ChevronLeft } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';

const planStatusLabel: Record<string, string> = {
  PLANNING: 'بانتظار اعتمادك',
  APPROVED: 'معتمدة',
  IN_PROGRESS: 'قيد التنفيذ',
  COMPLETED: 'مكتملة',
  BLOCKED: 'متوقفة',
};

export const AdvisorBriefingPanel: React.FC = () => {
  const {
    advisorBriefing,
    setIsAdvisorDrawerOpen,
    plans,
    setSelectedPlan,
    setIsPlanModalOpen,
    approveExecutionPlan,
    setActiveTab,
  } = useCompany();

  const activePlan = plans[0];

  const handlePlanAction = () => {
    if (!activePlan) return;
    setSelectedPlan(activePlan);
    setIsPlanModalOpen(true);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-xl transition-all duration-300 hover:border-[var(--border-accent)] text-right">
      <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-[var(--accent-primary)] opacity-10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-[var(--accent-glow)] opacity-5 blur-3xl" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-glow)] p-[1px] shadow-lg">
            <div className="flex h-full w-full items-center justify-center rounded-[15px] bg-[var(--bg-base)]">
              <Bot className="h-5 w-5 text-[var(--accent-primary)]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[var(--text-primary)]">المستشار التنفيذي العام</h2>
              <span className="rounded-full bg-[var(--bg-card)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--text-secondary)] border border-[var(--border-subtle)]">حالة مسجلة</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">موجز مشتق من بيانات الشركة والخطط والقرارات المسجلة</p>
          </div>
        </div>

        <button
          onClick={() => setIsAdvisorDrawerOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent-primary)]/15 hover:bg-[var(--accent-primary)]/25 px-4 py-2 text-xs font-bold text-[var(--accent-primary)] border border-[var(--border-accent)] transition-all shadow-sm"
        >
          <Sparkles className="h-4 w-4" />
          <span>فتح المستشار التنفيذي</span>
        </button>
      </div>

      <div className="mt-5 space-y-4">
        <p className="text-sm font-medium leading-relaxed text-[var(--text-primary)] bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-subtle)]">
          {advisorBriefing.executiveSummary}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-2xl bg-[var(--bg-card)] p-4 border border-[var(--border-subtle)] flex items-start gap-3">
            <div className="rounded-xl p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[var(--text-secondary)] block">السياسة المالية</span>
              <span className="text-sm font-bold text-emerald-400 mt-0.5 block">موافقتك مطلوبة</span>
              <span className="text-[10px] text-[var(--text-muted)]">لا يتم الالتزام بخدمة مدفوعة دون اعتماد صريح</span>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('decisions')}
            className="rounded-2xl bg-[var(--bg-card)] p-4 border border-[var(--border-subtle)] hover:border-[var(--border-accent)] transition-all cursor-pointer flex items-start gap-3"
          >
            <div className="rounded-xl p-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[var(--text-secondary)] block">قرارات بانتظارك</span>
              <span className="text-sm font-bold text-amber-400 font-mono mt-0.5 block">{advisorBriefing.urgentDecisionsCount} قرار</span>
              <span className="text-[10px] text-[var(--text-muted)]">بحسب مركز القرارات الحالي</span>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('employees')}
            className="rounded-2xl bg-[var(--bg-card)] p-4 border border-[var(--border-subtle)] hover:border-[var(--border-accent)] transition-all cursor-pointer flex items-start gap-3"
          >
            <div className="rounded-xl p-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[var(--text-secondary)] block">موظفون بحالة عمل</span>
              <span className="text-sm font-bold text-cyan-400 font-mono mt-0.5 block">{advisorBriefing.activeEmployeesCount} موظف AI</span>
              <span className="text-[10px] text-[var(--text-muted)]">العدد مأخوذ من الحالة الحالية فقط</span>
            </div>
          </div>
        </div>

        {activePlan && (
          <div className="rounded-2xl bg-gradient-to-r from-[var(--accent-primary)]/10 via-[var(--bg-card)] to-[var(--bg-card)] p-4 border border-[var(--border-accent)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--accent-primary)] flex items-center gap-1">
                  <Play className="h-3.5 w-3.5" />
                  أحدث خطة مسجلة:
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)]">
                  {planStatusLabel[activePlan.status] || activePlan.status}
                </span>
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">{activePlan.title}</h3>
              <p className="text-xs text-[var(--text-secondary)] line-clamp-1">{activePlan.goal}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handlePlanAction}
                className="px-4 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>استعراض خطوات الخطة ({activePlan.steps.length})</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {activePlan.status === 'PLANNING' && (
                <button
                  onClick={() => approveExecutionPlan(activePlan.id)}
                  className="px-4 py-2 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold transition-all shadow-lg flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>اعتماد الخطة</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
