import React from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Play, 
  ShieldCheck, 
  Sparkles, 
  Users, 
  AlertCircle,
  FileCheck,
  Check,
  Layers,
  Terminal,
  Bot,
  Cpu
} from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { ExecutionStep } from '../../types';

export const ExecutionPlanModal: React.FC = () => {
  const { 
    isPlanModalOpen, 
    setIsPlanModalOpen, 
    selectedPlan, 
    approveExecutionPlan,
    updateTaskStatus,
    openOpenHandsTerminal,
    runOpenHandsAudit
  } = useCompany();

  if (!isPlanModalOpen || !selectedPlan) return null;

  const completedStepsCount = selectedPlan.steps.filter(s => s.status === 'COMPLETED').length;
  const totalStepsCount = selectedPlan.steps.length;
  const progressPercent = Math.round((completedStepsCount / totalStepsCount) * 100);

  const getStatusBadge = (status: ExecutionStep['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">مكتملة</span>;
      case 'WORKING':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse">قيد العمل</span>;
      case 'WAITING_FOR_NAWAF':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">بانتظار اعتماد نواف</span>;
      default:
        return <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--bg-base)] text-[var(--text-muted)] border border-[var(--border-subtle)]">جاهزة للتنفيذ</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto text-right">
      {/* Backdrop */}
      <div 
        onClick={() => setIsPlanModalOpen(false)}
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
      />

      <div className="min-h-full flex items-center justify-center p-3 sm:p-6">
        <div className="relative w-full max-w-3xl rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden my-8">
          
          {/* Header banner */}
          <div className="p-6 border-b border-[var(--border-subtle)] bg-[var(--bg-card)] relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold text-[var(--accent-primary)] flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    خطة عمل تنفيذية موثقة
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    selectedPlan.status === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : selectedPlan.status === 'IN_PROGRESS'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {selectedPlan.status === 'COMPLETED' ? 'مكتملة بالكامل' : (selectedPlan.status === 'IN_PROGRESS' ? 'قيد التنفيذ الذاتي' : 'مسودة بانتظار الاعتماد')}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
                  {selectedPlan.title}
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  المشروع المستهدف: <span className="font-bold text-[var(--text-primary)]">{selectedPlan.projectName}</span> • تاريخ الإنشاء: {selectedPlan.createdAt}
                </p>
              </div>

              <button
                onClick={() => setIsPlanModalOpen(false)}
                className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Overall Progress Bar */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[var(--text-secondary)]">إنجاز الخطوات التشغيلية ({completedStepsCount} من {totalStepsCount})</span>
                <span className="text-[var(--accent-primary)] font-mono font-bold">{progressPercent}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[var(--bg-base)] overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-emerald-400 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            
            {/* Executive Summary */}
            <div className="rounded-2xl bg-[var(--bg-card)] p-4 border border-[var(--border-subtle)] space-y-2">
              <span className="text-xs font-bold text-[var(--text-primary)] block">الموجز التنفيذي للخطة:</span>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {selectedPlan.summary}
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)]">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  التكلفة: $0.00 (وفق القانون رقم 1)
                </span>
                <span>•</span>
                <span>المتطلب للاعتماد: {selectedPlan.whatRequiresApproval}</span>
              </div>
            </div>

            {/* Steps Timeline */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[var(--text-primary)]">
                تسلسل الخطوات التنفيذية ({selectedPlan.steps.length} خطوات محكمة):
              </h3>

              <div className="space-y-3">
                {selectedPlan.steps.map((step) => {
                  const isCompleted = step.status === 'COMPLETED';
                  const isWorking = step.status === 'WORKING';

                  return (
                    <div 
                      key={step.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isCompleted 
                          ? 'bg-emerald-950/10 border-emerald-500/30' 
                          : isWorking
                          ? 'bg-cyan-950/10 border-cyan-500/40 shadow-sm'
                          : 'bg-[var(--bg-card)] border-[var(--border-subtle)]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isCompleted
                              ? 'bg-emerald-500 text-white'
                              : isWorking
                              ? 'bg-cyan-500 text-white animate-pulse'
                              : 'bg-[var(--bg-base)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'
                          }`}>
                            {isCompleted ? <Check className="w-4 h-4" /> : step.stepNumber}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs font-bold text-[var(--text-primary)]">
                                {step.title}
                              </h4>
                              {getStatusBadge(step.status)}
                            </div>

                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                              {step.objective}
                            </p>

                            <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-[var(--text-muted)]">
                              <span className="flex items-center gap-1 text-[var(--text-secondary)]">
                                <span>المكلف:</span>
                                <span className="font-bold text-[var(--text-primary)] flex items-center gap-1">
                                  <span>{step.assigneeAvatar}</span>
                                  <span>{step.assigneeName} ({step.assigneeRole})</span>
                                </span>
                              </span>

                              <span>•</span>

                              <span className="text-amber-400/90">
                                المخرج المتوقع: {step.expectedResult}
                              </span>

                              {step.isTechnical && (
                                <>
                                  <span>•</span>
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[10px]">
                                    <Terminal className="w-3 h-3 text-cyan-400" />
                                    <span>محرك OpenHands التقني</span>
                                  </span>
                                </>
                              )}
                            </div>

                            {step.result && (
                              <div className="mt-2 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 font-medium">
                                النتيجة المحققة: {step.result}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Step Action Buttons (OpenHands & Complete) */}
                        <div className="flex items-center gap-2 shrink-0">
                          {step.isTechnical && (
                            <button
                              onClick={async () => {
                                if (step.openHandsSession) {
                                  openOpenHandsTerminal(step.openHandsSession);
                                } else {
                                  await runOpenHandsAudit(
                                    step.assigneeId, 
                                    selectedPlan.projectId, 
                                    step.title
                                  );
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-[10px] font-bold border border-cyan-500/30 flex items-center gap-1.5 transition-all shadow-sm"
                              title="فتح سجلات الفحص والبيئة التقنية المنعزلة لـ OpenHands"
                            >
                              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                              <span>{step.openHandsSession ? 'طرفية OpenHands' : 'تشغيل فحص OpenHands'}</span>
                            </button>
                          )}

                          {/* Complete step trigger if active */}
                          {isWorking && (
                            <button
                              onClick={() => updateTaskStatus(`task-${step.id}`, 'completed', step.expectedResult)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 shrink-0 flex items-center gap-1 transition-all"
                              title="تأكيد إنجاز الخطوة واعتماد المخرج"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>إكمال الخطوة</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Participating Team */}
            <div className="rounded-2xl bg-[var(--bg-card)] p-4 border border-[var(--border-subtle)]">
              <span className="text-xs font-bold text-[var(--text-primary)] block mb-3">
                الفريق الذكي المنفذ للخطة:
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedPlan.team.map((member) => (
                  <div 
                    key={member.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)] text-xs"
                  >
                    <span className="text-base">{member.avatar}</span>
                    <div>
                      <div className="font-bold text-[var(--text-primary)] text-[11px]">{member.name}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{member.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Footer controls */}
          <div className="p-4 sm:p-5 border-t border-[var(--border-subtle)] bg-[var(--bg-card)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>لا يتطلب أي اشتراك مدفوع أو مصاريف خفية.</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlanModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-base)] text-[var(--text-secondary)] text-xs font-bold border border-[var(--border-subtle)] transition-colors"
              >
                إغلاق
              </button>

              {selectedPlan.status === 'PLANNING' && (
                <button
                  onClick={() => approveExecutionPlan(selectedPlan.id)}
                  className="px-6 py-2.5 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-xs font-black transition-all shadow-lg flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>اعتماد الخطة وبدء التنفيذ المستقل</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
