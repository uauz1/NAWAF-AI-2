import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  AlertOctagon, 
  ShieldAlert, 
  Clock, 
  Sparkles, 
  DollarSign, 
  ArrowRight, 
  Tag, 
  Lock,
  Layers
} from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { Decision, CEOControlLevel } from '../../types';

export const DecisionCenter: React.FC = () => {
  const { 
    decisions, 
    approveDecision, 
    rejectDecision, 
    modifyDecision, 
    controlLevel, 
    setControlLevel 
  } = useCompany();

  const [activeFilter, setActiveFilter] = useState<'all' | 'waiting' | 'approved' | 'rejected'>('waiting');
  const [modalDecision, setModalDecision] = useState<Decision | null>(null);
  const [modifyNote, setModifyNote] = useState('');
  const [rejectNote, setRejectNote] = useState('');
  const [actionType, setActionType] = useState<'modify' | 'reject' | null>(null);

  const filteredDecisions = decisions.filter(d => {
    if (activeFilter === 'all') return true;
    return d.status === activeFilter;
  });

  const waitingCount = decisions.filter(d => d.status === 'waiting').length;

  const handleOpenActionModal = (decision: Decision, type: 'modify' | 'reject') => {
    setModalDecision(decision);
    setActionType(type);
    setModifyNote('');
    setRejectNote('');
  };

  const handleConfirmAction = () => {
    if (!modalDecision) return;
    if (actionType === 'modify') {
      modifyDecision(modalDecision.id, modifyNote || 'توجيهات تعديل من الرئيس التنفيذي');
    } else if (actionType === 'reject') {
      rejectDecision(modalDecision.id, rejectNote || 'مرفوض لحماية الميزانية والأولويات');
    }
    setModalDecision(null);
    setActionType(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="rounded-2xl glass-panel p-6 border border-white/10 relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                مركز قرارات الرئيس التنفيذي (CEO Approvals)
              </h2>
              {waitingCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white animate-pulse">
                  {waitingCount} قرارات بانتظارك
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              كل الإجراءات الحساسة (إطلاق حملات، اعتماد محتوى إسلامي، أي التزامات مالية، وتغييرات معمارية) تُرفع هنا لتوقيعك المباشر.
            </p>
          </div>

          {/* CEO Control Levels Selector */}
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/10 shrink-0">
            <div className="text-[10px] text-slate-400 font-semibold mb-1.5 flex items-center gap-1">
              <Lock className="w-3 h-3 text-cyan-400" />
              <span>مستوى تفويض الصلاحيات (CEO Control Mode):</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setControlLevel('requires_approval')}
                className={`px-2.5 py-1 rounded-lg transition-all font-medium ${
                  controlLevel === 'requires_approval'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white bg-slate-800/60'
                }`}
              >
                1. يحتاج موافقتي
              </button>
              <button
                onClick={() => setControlLevel('limited_autonomous')}
                className={`px-2.5 py-1 rounded-lg transition-all font-medium ${
                  controlLevel === 'limited_autonomous'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white bg-slate-800/60'
                }`}
              >
                2. تنفيذ تلقائي محدود
              </button>
              <button
                onClick={() => setControlLevel('fully_autonomous')}
                className={`px-2.5 py-1 rounded-lg transition-all font-medium ${
                  controlLevel === 'fully_autonomous'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white bg-slate-800/60'
                }`}
              >
                3. تنفيذ تلقائي
              </button>
            </div>
            <div className="text-[9px] text-amber-400/90 mt-1 font-mono">
              * الصرف المالي لا يصبح تلقائياً أبداً بموجب القانون رقم 1.
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/5">
          <button
            onClick={() => setActiveFilter('waiting')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'waiting'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            بانتظارك الآن ({decisions.filter(d => d.status === 'waiting').length})
          </button>
          <button
            onClick={() => setActiveFilter('approved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'approved'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            تم اعتمادها ({decisions.filter(d => d.status === 'approved').length})
          </button>
          <button
            onClick={() => setActiveFilter('rejected')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'rejected'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            مرفوضة / معدّلة ({decisions.filter(d => d.status === 'rejected' || d.status === 'modified').length})
          </button>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            جميع السجلات ({decisions.length})
          </button>
        </div>
      </div>

      {/* Decision Cards List */}
      <div className="space-y-4">
        {filteredDecisions.length === 0 ? (
          <div className="text-center py-12 rounded-2xl glass-card border border-white/5">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
            <h3 className="text-sm font-bold text-white">لا توجد قرارات في هذا التبويب</h3>
            <p className="text-xs text-slate-400 mt-1">جميع طلبات الموظفين تمت معالجتها بسلاسة.</p>
          </div>
        ) : (
          filteredDecisions.map(decision => {
            const isWaiting = decision.status === 'waiting';

            return (
              <div
                key={decision.id}
                id={`decision-${decision.id}`}
                className={`relative rounded-2xl p-5 sm:p-6 glass-panel border transition-all duration-300 ${
                  isWaiting 
                    ? 'border-rose-500/30 shadow-[0_0_25px_-5px_rgba(244,63,94,0.12)]' 
                    : decision.status === 'approved'
                      ? 'border-emerald-500/20 bg-slate-900/40'
                      : 'border-amber-500/20 bg-slate-900/40'
                }`}
              >
                {/* Status Indicator */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                      {decision.department}
                    </span>

                    {decision.projectId && (
                      <span className="text-xs font-semibold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-500/30">
                        مشروع: {decision.projectId === 'qaddha' ? 'قدّها' : decision.projectId === 'mueen' ? 'مُعين' : 'HQ'}
                      </span>
                    )}

                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      decision.impact === 'حاسم' 
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      الأثر: {decision.impact}
                    </span>

                    <span className="text-[11px] text-emerald-400 font-mono bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      التكلفة: {decision.estimatedCost}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{decision.timestamp}</span>
                  </div>
                </div>

                {/* Title and Description */}
                <h3 className="text-base sm:text-lg font-bold text-white mb-2 leading-snug">
                  {decision.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                  {decision.description}
                </p>

                {/* Proposer & Tags */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="text-slate-500">المقترح من:</span>
                    <span className="font-semibold text-slate-200">{decision.proposer}</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {decision.tags.map((tag, idx) => (
                      <span key={idx} className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-white/5">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CEO Decision Action Buttons or Decision Badge */}
                {isWaiting ? (
                  <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-end gap-2.5">
                    <button
                      id={`btn-reject-${decision.id}`}
                      onClick={() => handleOpenActionModal(decision, 'reject')}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 transition-all flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>رفض المقترح</span>
                    </button>

                    <button
                      id={`btn-modify-${decision.id}`}
                      onClick={() => handleOpenActionModal(decision, 'modify')}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-amber-300 hover:text-white bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30 transition-all flex items-center gap-1.5"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>طلب تعديل</span>
                    </button>

                    <button
                      id={`btn-approve-${decision.id}`}
                      onClick={() => approveDecision(decision.id)}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-[0_0_20px_-3px_rgba(16,185,129,0.5)] transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>اعتماد وتفويض التنفيذ</span>
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 ${
                        decision.status === 'approved' 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                          : decision.status === 'modified'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {decision.status === 'approved' ? '✓ تم الاعتماد' : decision.status === 'modified' ? '✎ تم طلب التعديل' : '✕ تم الرفض'}
                      </span>
                      {decision.ceoNote && (
                        <span className="text-slate-400 italic font-medium">«{decision.ceoNote}»</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Action Modal for Modify or Reject */}
      {modalDecision && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl glass-panel p-6 border border-white/10 shadow-2xl text-right">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              {actionType === 'modify' ? <Edit3 className="w-5 h-5 text-amber-400" /> : <XCircle className="w-5 h-5 text-rose-400" />}
              <span>{actionType === 'modify' ? 'طلب تعديل على المقترح' : 'رفض مقترح الموظف'}</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              الموضوع: <span className="text-white font-medium">{modalDecision.title}</span>
            </p>

            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {actionType === 'modify' ? 'أدخل تعليمات التعديل الموجهة للموظف:' : 'سبب الرفض لحماية المعايير:'}
              </label>
              <textarea
                value={actionType === 'modify' ? modifyNote : rejectNote}
                onChange={e => actionType === 'modify' ? setModifyNote(e.target.value) : setRejectNote(e.target.value)}
                placeholder={actionType === 'modify' ? 'مثال: تقليص مدة الحملة والتركيز على قنوات التفاعل المجانية فقط...' : 'مثال: لا نوافق على هذا المقترح نظراً لعدم جدواه حالياً والالتزام بالقانون رقم 1...'}
                rows={3}
                className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => { setModalDecision(null); setActionType(null); }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-md ${
                  actionType === 'modify' ? 'bg-amber-600 hover:bg-amber-500' : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                تأكيد التوجيه
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
