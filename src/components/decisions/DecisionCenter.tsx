import React, { useMemo, useState } from 'react';
import { CheckCircle2, XCircle, Edit3, Lock, Clock, GitCommitHorizontal, AlertCircle } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { Decision } from '../../types';

const PROPOSAL_KEY_PREFIX = 'nawaf_hq_execution_proposal_';

function proposalKey(id: string) {
  return `${PROPOSAL_KEY_PREFIX}${id}`;
}

function getProposal(id: string) {
  try {
    const raw = localStorage.getItem(proposalKey(id));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const DecisionCenter: React.FC = () => {
  const {
    decisions,
    approveDecision,
    rejectDecision,
    modifyDecision,
    controlLevel,
    setControlLevel,
  } = useCompany();

  const [activeFilter, setActiveFilter] = useState<'all' | 'waiting' | 'approved' | 'rejected'>('waiting');
  const [modalDecision, setModalDecision] = useState<Decision | null>(null);
  const [modifyNote, setModifyNote] = useState('');
  const [rejectNote, setRejectNote] = useState('');
  const [actionType, setActionType] = useState<'modify' | 'reject' | null>(null);
  const [applyingDecisionId, setApplyingDecisionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filteredDecisions = useMemo(() => decisions.filter(d => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'rejected') return d.status === 'rejected' || d.status === 'modified';
    return d.status === activeFilter;
  }), [decisions, activeFilter]);

  const waitingCount = decisions.filter(d => d.status === 'waiting').length;

  const handleOpenActionModal = (decision: Decision, type: 'modify' | 'reject') => {
    setModalDecision(decision);
    setActionType(type);
    setModifyNote('');
    setRejectNote('');
    setActionError(null);
  };

  const handleConfirmAction = () => {
    if (!modalDecision) return;
    if (actionType === 'modify') {
      modifyDecision(modalDecision.id, modifyNote || 'توجيهات تعديل من الرئيس التنفيذي');
      localStorage.removeItem(proposalKey(modalDecision.id));
    } else if (actionType === 'reject') {
      rejectDecision(modalDecision.id, rejectNote || 'مرفوض من الرئيس التنفيذي');
      localStorage.removeItem(proposalKey(modalDecision.id));
    }
    setModalDecision(null);
    setActionType(null);
  };

  const handleApproveDecision = async (decision: Decision) => {
    setActionError(null);
    const proposal = getProposal(decision.id);

    if (!proposal) {
      approveDecision(decision.id, 'تم الاعتماد من نواف');
      return;
    }

    setApplyingDecisionId(decision.id);
    try {
      const response = await fetch('/api/apply-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decisionId: decision.id, proposal }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.ok !== true) {
        const message = data?.error || 'تعذر تطبيق التغيير على GitHub.';
        setActionError(message);
        return;
      }

      const commitSha = String(data.commitSha || '').slice(0, 12);
      approveDecision(decision.id, commitSha ? `تم الاعتماد والتطبيق على GitHub — ${commitSha}` : 'تم الاعتماد والتطبيق على GitHub');
      localStorage.removeItem(proposalKey(decision.id));
    } catch (error: any) {
      setActionError(error?.message || 'فشل الاتصال بمسار تطبيق GitHub.');
    } finally {
      setApplyingDecisionId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl glass-panel p-5 border border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">مركز قرارات نواف</h2>
              {waitingCount > 0 && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {waitingCount} بانتظارك
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-2 max-w-2xl">
              اعتماد تغييرات OpenHands هنا يطبق الـdiff الحقيقي فقط بعد فحص التعارضات والـlint والـbuild. لا يوجد دفع تلقائي قبل موافقتك.
            </p>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/10">
            <div className="text-[10px] text-slate-400 mb-1.5 flex items-center gap-1"><Lock className="w-3 h-3" /> مستوى التفويض</div>
            <div className="flex gap-1.5 flex-wrap">
              {([
                ['requires_approval', 'يحتاج موافقتي'],
                ['limited_autonomous', 'تلقائي محدود'],
                ['fully_autonomous', 'تلقائي'],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setControlLevel(value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${controlLevel === value ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="text-[9px] text-amber-400 mt-1">الصرف المالي يحتاج موافقة صريحة دائماً.</div>
          </div>
        </div>

        <div className="flex gap-2 mt-5 pt-4 border-t border-white/5 flex-wrap">
          {([
            ['waiting', `بانتظارك (${decisions.filter(d => d.status === 'waiting').length})`],
            ['approved', `معتمدة (${decisions.filter(d => d.status === 'approved').length})`],
            ['rejected', 'مرفوضة / معدلة'],
            ['all', `الكل (${decisions.length})`],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setActiveFilter(value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${activeFilter === value ? 'bg-white/10 text-white border border-white/15' : 'text-slate-400 hover:text-white'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {actionError && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 text-rose-200 p-3 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="space-y-3">
        {filteredDecisions.length === 0 ? (
          <div className="rounded-2xl glass-card border border-white/5 p-10 text-center">
            <CheckCircle2 className="w-9 h-9 text-emerald-400 mx-auto mb-2" />
            <div className="text-sm font-bold text-white">ما فيه قرارات هنا حالياً</div>
          </div>
        ) : filteredDecisions.map(decision => {
          const isWaiting = decision.status === 'waiting';
          const proposal = getProposal(decision.id);
          const applying = applyingDecisionId === decision.id;
          return (
            <div key={decision.id} id={`decision-${decision.id}`} className="rounded-2xl glass-panel border border-white/10 p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex gap-2 flex-wrap mb-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-white/10">{decision.department}</span>
                    {decision.projectId && <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950/50 text-purple-300 border border-purple-500/20">{decision.projectId === 'qaddha' ? 'قدّها' : decision.projectId === 'mueen' ? 'مُعين' : 'HQ'}</span>}
                    {proposal && <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/50 text-cyan-300 border border-cyan-500/20 flex items-center gap-1"><GitCommitHorizontal className="w-3 h-3" /> تغيير كود حقيقي</span>}
                  </div>
                  <h3 className="text-base font-bold text-white">{decision.title}</h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">{decision.description}</p>
                  {proposal?.changedFiles?.length > 0 && (
                    <div className="text-[11px] text-slate-400 mt-3">الملفات المتأثرة: {proposal.changedFiles.slice(0, 6).join('، ')}</div>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {decision.timestamp}</div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 text-xs text-slate-400">
                المقترح من: <span className="text-slate-200 font-semibold">{decision.proposer}</span>
              </div>

              {isWaiting ? (
                <div className="mt-4 flex justify-end gap-2 flex-wrap">
                  <button onClick={() => handleOpenActionModal(decision, 'reject')} className="px-3 py-2 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/30 border border-rose-500/20 flex items-center gap-1.5"><XCircle className="w-4 h-4" /> رفض</button>
                  <button onClick={() => handleOpenActionModal(decision, 'modify')} className="px-3 py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-950/30 border border-amber-500/20 flex items-center gap-1.5"><Edit3 className="w-4 h-4" /> طلب تعديل</button>
                  <button
                    disabled={applying}
                    onClick={() => void handleApproveDecision(decision)}
                    className="px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {applying ? 'جاري الفحص والتطبيق...' : proposal ? 'اعتماد وتطبيق على GitHub' : 'اعتماد القرار'}
                  </button>
                </div>
              ) : (
                <div className="mt-4 text-xs">
                  <span className={`px-2.5 py-1 rounded-lg font-bold ${decision.status === 'approved' ? 'bg-emerald-500/15 text-emerald-300' : decision.status === 'modified' ? 'bg-amber-500/15 text-amber-300' : 'bg-rose-500/15 text-rose-300'}`}>
                    {decision.status === 'approved' ? 'تم الاعتماد' : decision.status === 'modified' ? 'تم طلب التعديل' : 'تم الرفض'}
                  </span>
                  {decision.ceoNote && <span className="mr-2 text-slate-400">{decision.ceoNote}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {modalDecision && actionType && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl glass-panel border border-white/10 p-5">
            <h3 className="font-bold text-white mb-2">{actionType === 'modify' ? 'وش التعديل المطلوب؟' : 'سبب الرفض'}</h3>
            <textarea
              value={actionType === 'modify' ? modifyNote : rejectNote}
              onChange={e => actionType === 'modify' ? setModifyNote(e.target.value) : setRejectNote(e.target.value)}
              className="w-full min-h-28 bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-white outline-none"
              placeholder={actionType === 'modify' ? 'اكتب التعديل المطلوب...' : 'اكتب سبب الرفض...'}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => { setModalDecision(null); setActionType(null); }} className="px-3 py-2 rounded-xl text-xs text-slate-300 bg-slate-800">إلغاء</button>
              <button onClick={handleConfirmAction} className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-400 text-slate-950">تأكيد</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
