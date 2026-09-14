import React from 'react';
import { 
  X, 
  Bot, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  Send
} from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';

export const GeneralManagerModal: React.FC = () => {
  const { 
    isGMSummaryOpen, 
    setIsGMSummaryOpen, 
    gmSummary, 
    metrics, 
    decisions, 
    setActiveTab 
  } = useCompany();

  if (!isGMSummaryOpen) return null;

  const pendingDecisions = decisions.filter(d => d.status === 'waiting');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel p-6 sm:p-8 border border-purple-500/30 shadow-[0_0_50px_-10px_rgba(168,85,247,0.25)] text-right">
        
        {/* Close Button */}
        <button
          onClick={() => setIsGMSummaryOpen(false)}
          className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 border border-white/5 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-lg shrink-0">
            <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
              <Bot className="w-7 h-7 text-purple-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                تقرير المدير العام اليومي (AI General Manager Briefing)
              </h2>
            </div>
            <p className="text-xs text-purple-300 font-medium mt-0.5">
              مرفوع خصيصاً للرئيس التنفيذي: نواف
            </p>
          </div>
        </div>

        {/* Greeting block */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900/50 border border-purple-500/20 mb-6">
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
            {gmSummary.greeting}
          </p>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            {gmSummary.headline}
          </p>
        </div>

        {/* Key Metrics Snapshot */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5 text-center">
            <div className="text-xl font-bold text-white font-mono">{metrics.workingEmployees}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">موظفين نشطين</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5 text-center">
            <div className="text-xl font-bold text-emerald-400 font-mono">{metrics.completedTasks}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">مهام مكتملة</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5 text-center">
            <div className="text-xl font-bold text-cyan-400 font-mono">{metrics.productivityRate}%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">معدل الإنتاجية</div>
          </div>
          <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-center">
            <div className="text-xl font-bold text-rose-400 font-mono">{pendingDecisions.length}</div>
            <div className="text-[11px] text-rose-300 mt-0.5 font-bold">قرارات معلقة</div>
          </div>
        </div>

        {/* Detailed Insights */}
        <div className="mb-6 space-y-2.5">
          <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>رصد نشاط الأقسام والتنسيق التلقائي:</span>
          </h3>
          {gmSummary.keyInsights.map((insight, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-900/40 border border-white/5 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0"></span>
              <span>{insight}</span>
            </div>
          ))}
        </div>

        {/* Stalled Tasks / Alert */}
        {gmSummary.stalledTasks.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30">
            <h4 className="text-xs font-bold text-amber-300 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>مهام رُصد فيها بطء أو تتطلب توجيهك:</span>
            </h4>
            <div className="space-y-1.5">
              {gmSummary.stalledTasks.map((task, idx) => (
                <div key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                  <span className="text-amber-400">•</span>
                  <span>{task}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendation & Focus */}
        <div className="mb-6 p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30">
          <div className="text-xs font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>توصية المدير العام ذات الأولوية القصوى:</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            {gmSummary.recommendedFocus}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/5">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>جميع الأنشطة تلتزم بالقانون رقم 1 ومعدل الإنفاق $0.00</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsGMSummaryOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              إغلاق
            </button>
            {pendingDecisions.length > 0 && (
              <button
                onClick={() => {
                  setIsGMSummaryOpen(false);
                  setActiveTab('decisions');
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md transition-all flex items-center gap-1.5"
              >
                <span>الانتقال لاعتماد القرارات ({pendingDecisions.length})</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
