import React from 'react';
import { 
  Bot, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  ArrowRight,
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';

export const GeneralManagerCard: React.FC = () => {
  const { gmSummary, decisions, metrics, setActiveTab, setIsGMSummaryOpen } = useCompany();

  const pendingCount = decisions.filter(d => d.status === 'waiting').length;

  return (
    <div className="relative overflow-hidden rounded-2xl glass-panel border border-purple-500/20 p-5 sm:p-6 shadow-[0_0_35px_-10px_rgba(168,85,247,0.15)]">
      
      {/* Background Accent Glow */}
      <div className="absolute -top-24 -left-24 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-[1px] shadow-lg">
              <div className="w-full h-full rounded-[15px] bg-slate-950 flex items-center justify-center">
                <Bot className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                ملخص المدير العام الذكي (AI General Manager)
              </h3>
              <span className="text-[10px] bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono">
                Daily Intel
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {gmSummary.greeting}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsGMSummaryOpen(true)}
          className="text-xs font-medium text-purple-300 hover:text-purple-200 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all self-start sm:self-auto"
        >
          <span>التقرير الكامل</span>
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Headline briefing */}
      <div className="mb-4 p-3.5 rounded-xl bg-slate-900/70 border border-white/5 text-xs text-slate-300 leading-relaxed">
        <span className="font-semibold text-cyan-300">موجز اليوم: </span>
        {gmSummary.headline}
      </div>

      {/* Snapshot Counters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-4">
        <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/5 text-center">
          <div className="text-lg font-bold text-white font-mono">{metrics.workingEmployees}</div>
          <div className="text-[10px] text-slate-400">موظفين عملوا</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/5 text-center">
          <div className="text-lg font-bold text-emerald-400 font-mono">{metrics.completedTasks}</div>
          <div className="text-[10px] text-slate-400">مهمة اكتملت</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/5 text-center">
          <div className="text-lg font-bold text-amber-400 font-mono">1</div>
          <div className="text-[10px] text-slate-400">مشكلة رُصدت</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/5 text-center">
          <div className="text-lg font-bold text-cyan-400 font-mono">3</div>
          <div className="text-[10px] text-slate-400">أفكار جديدة</div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-center">
          <div className="text-lg font-bold text-rose-400 font-mono">{pendingCount}</div>
          <div className="text-[10px] text-rose-300 font-medium">قرارات تحتاج موافقتك</div>
        </div>
      </div>

      {/* Key Insights List */}
      <div className="space-y-2">
        {gmSummary.keyInsights.slice(0, 2).map((insight, idx) => (
          <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0"></span>
            <p className="leading-relaxed">{insight}</p>
          </div>
        ))}
      </div>

      {/* Recommended Focus Pill */}
      <div className="mt-4 pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="text-xs text-slate-400">
          <span className="text-amber-300 font-semibold">توصية المدير العام: </span>
          <span>{gmSummary.recommendedFocus}</span>
        </div>

        {pendingCount > 0 && (
          <button
            onClick={() => setActiveTab('decisions')}
            className="text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/40 px-3 py-1.5 rounded-xl transition-all self-start sm:self-auto shrink-0"
          >
            الانتقال لمركز القرارات ({pendingCount})
          </button>
        )}
      </div>

    </div>
  );
};
