import React from 'react';
import {
  Sparkles,
  Crown,
  Users,
  FolderKanban,
  CheckCircle2,
  Zap,
  ChevronLeft,
  Check,
  X,
} from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { IsometricOffice3D } from '../office/IsometricOffice3D';
import { AdvisorBriefingPanel } from '../advisor/AdvisorBriefingPanel';

export const MainDashboard: React.FC = () => {
  const {
    projects,
    decisions,
    activities,
    setActiveTab,
    setSelectedProject,
    approveDecision,
    rejectDecision,
    setIsCeoCommandOpen,
    setIsMeetingModalOpen,
    setIsAdvisorDrawerOpen,
  } = useCompany();

  const pendingDecisions = decisions.filter(d => d.status === 'waiting');
  const recentActivities = activities.slice(0, 4);

  return (
    <div className="space-y-6 text-right select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] flex items-center gap-2">
            <span>مرحباً بك يا نواف في مقرك التنفيذي</span>
            <span className="text-xl">👑</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
            تعرض هذه الواجهة الحالة والنتائج المسجلة فعلياً فقط؛ لا يُحتسب أي تنفيذ أو تقدم بدون دليل من أداة حقيقية.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAdvisorDrawerOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[var(--accent-primary)]/15 hover:bg-[var(--accent-primary)]/25 text-[var(--accent-primary)] border border-[var(--border-accent)] text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span>المستشار الذكي</span>
          </button>

          <button
            onClick={() => setIsMeetingModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>قاعة الاجتماعات</span>
          </button>

          <button
            onClick={() => setIsCeoCommandOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>مركز التوجيه التنفيذي</span>
          </button>
        </div>
      </div>

      <AdvisorBriefingPanel />

      <div className="w-full">
        <IsometricOffice3D />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Crown className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">القرارات بانتظار اعتمادك</h2>
            </div>
            {pendingDecisions.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                {pendingDecisions.length} معلقة
              </span>
            )}
          </div>

          {pendingDecisions.length === 0 ? (
            <div className="py-8 text-center text-[var(--text-muted)] text-xs flex flex-col items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-400/60" />
              <span>لا توجد قرارات معلقة حالياً.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingDecisions.slice(0, 2).map(dec => (
                <div
                  key={dec.id}
                  className="p-4 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:border-[var(--border-accent)] transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-[var(--text-primary)] leading-snug">{dec.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--text-secondary)] shrink-0 border border-[var(--border-subtle)]">
                      {dec.department}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">{dec.description}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
                    <span className="text-[10px] text-amber-400/90 font-mono">التكلفة: {dec.estimatedCost}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => approveDecision(dec.id)}
                        className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-[11px] border border-emerald-500/30 flex items-center gap-1 transition-all"
                      >
                        <Check className="w-3 h-3" />
                        <span>اعتماد</span>
                      </button>
                      <button
                        onClick={() => rejectDecision(dec.id)}
                        className="p-1 rounded-lg text-[var(--text-muted)] hover:text-rose-400 transition-colors"
                        title="رفض أو إعادة توجيه"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => setActiveTab('decisions')}
                className="w-full py-2 text-center text-xs text-[var(--accent-primary)] hover:underline font-medium flex items-center justify-center gap-1"
              >
                <span>عرض جميع القرارات والاعتمادات</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                <FolderKanban className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">المشاريع الاستراتيجية</h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
              {projects.length} مشروع
            </span>
          </div>

          <div className="space-y-3">
            {projects.map(proj => (
              <div
                key={proj.id}
                onClick={() => setSelectedProject(proj)}
                className="p-3.5 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:border-[var(--border-accent)] cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">{proj.name}</span>
                  <span className="text-[10px] text-[var(--accent-primary)] font-mono font-bold">{proj.progress}%</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] line-clamp-1">{proj.tagline}</p>
                <div className="w-full h-1.5 rounded-full bg-[var(--bg-surface)] overflow-hidden">
                  <div className="h-full bg-[var(--accent-primary)] rounded-full transition-all" style={{ width: `${proj.progress}%` }} />
                </div>
              </div>
            ))}

            <button
              onClick={() => setActiveTab('projects')}
              className="w-full py-2 text-center text-xs text-[var(--accent-primary)] hover:underline font-medium flex items-center justify-center gap-1"
            >
              <span>فتح مساحات عمل المشاريع</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">سجل النشاط الموثق</h2>
            </div>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">{activities.length} حدث</span>
          </div>

          <div className="space-y-3">
            {recentActivities.length === 0 ? (
              <div className="py-8 text-center text-[var(--text-muted)] text-xs">لا يوجد نشاط موثق بعد.</div>
            ) : (
              recentActivities.map((act, idx) => (
                <div
                  key={`${act.id || 'act'}-${idx}`}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)] text-xs"
                >
                  <span className="text-base shrink-0">{act.actorAvatar}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 text-[10px]">
                      <span className="font-bold text-[var(--text-primary)]">{act.actor}</span>
                      <span className="text-[var(--text-muted)] font-mono">{act.timestamp}</span>
                    </div>
                    <p className="text-[var(--text-secondary)] text-[11px] mt-0.5 line-clamp-1 leading-snug">{act.actionText}</p>
                  </div>
                </div>
              ))
            )}

            <button
              onClick={() => setActiveTab('tasks')}
              className="w-full py-2 text-center text-xs text-[var(--accent-primary)] hover:underline font-medium flex items-center justify-center gap-1"
            >
              <span>متابعة جميع الخطط والعمليات</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
