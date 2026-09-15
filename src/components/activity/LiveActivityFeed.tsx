import React from 'react';
import { Activity, Clock } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { ActivityEvent } from '../../types';

interface LiveActivityFeedProps {
  limit?: number;
  showAllLink?: boolean;
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({ limit = 8 }) => {
  const { activities } = useCompany();
  const displayed = activities.slice(0, limit);

  const badge = (type: ActivityEvent['type']) => {
    if (type === 'decision') return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    if (type === 'milestone') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    if (type === 'creation') return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    if (type === 'alert') return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    return 'bg-slate-800 text-slate-300 border-white/5';
  };

  const typeText = (type: ActivityEvent['type']) => ({
    collaboration: 'تعاون مسجل',
    decision: 'قرار',
    milestone: 'إنجاز موثق',
    creation: 'إنشاء',
    alert: 'تنبيه',
    system: 'نظام',
  }[type] || 'حدث');

  return (
    <div className="rounded-2xl glass-panel p-5 sm:p-6 border border-white/10 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400"><Activity className="w-4 h-4" /></div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">سجل النشاط الموثق</h3>
            <p className="text-[11px] text-slate-400">يعرض الأحداث التي أضيفت إلى حالة النظام فقط؛ لا يتم توليد نشاط تجريبي.</p>
          </div>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">{activities.length} حدث</span>
      </div>

      {displayed.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500">لا يوجد نشاط موثق بعد.</div>
      ) : (
        <div className="relative space-y-3 before:absolute before:top-2 before:bottom-2 before:right-4 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500/30 before:to-transparent">
          {displayed.map((activity, index) => (
            <div key={`${activity.id || 'activity'}-${index}`} className="relative pr-9 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-900/40 border border-white/5">
              <div className="absolute right-2.5 top-3.5 w-3 h-3 rounded-full bg-slate-950 border-2 border-cyan-400" />
              <div className="flex items-start gap-2.5">
                <span className="text-xl shrink-0 mt-0.5">{activity.actorAvatar}</span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white">{activity.actor}</span>
                    <span className="text-[10px] text-slate-400">({activity.actorRole})</span>
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${badge(activity.type)}`}>{typeText(activity.type)}</span>
                    {activity.projectId && <span className="text-[9px] font-mono text-purple-300 bg-purple-950/50 px-1.5 py-0.5 rounded">{activity.projectId === 'qaddha' ? 'قدّها' : activity.projectId === 'mueen' ? 'مُعين' : 'HQ'}</span>}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{activity.actionText}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono self-start sm:self-center shrink-0"><Clock className="w-3 h-3" />{activity.timestamp}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
