import React from 'react';
import { 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Zap, 
  Bot,
  Layers,
  ChevronLeft
} from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { ActivityEvent } from '../../types';

interface LiveActivityFeedProps {
  limit?: number;
  showAllLink?: boolean;
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({ limit = 8, showAllLink = true }) => {
  const { activities, setActiveTab, triggerSimulatedCollaboration } = useCompany();

  const displayedActivities = activities.slice(0, limit);

  const getTypeBadge = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'collaboration':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'decision':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'milestone':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'creation':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  const getTypeText = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'collaboration': return 'تعاون ذكي';
      case 'decision': return 'قرار رئيس';
      case 'milestone': return 'إنجاز مرحلي';
      case 'creation': return 'إنتاج مواد';
      default: return 'نظام';
    }
  };

  return (
    <div className="rounded-2xl glass-panel p-5 sm:p-6 border border-white/10 relative overflow-hidden">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>النشاط الأخير للشركة (Live Company Stream)</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              متابعة مباشرة لما كان يقوم به فريقك وموظفوك أثناء غيابك.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerSimulatedCollaboration}
            className="text-[11px] font-semibold text-cyan-300 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 px-2.5 py-1 rounded-xl transition-all flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>محاكاة تفاعل جديد</span>
          </button>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="relative space-y-3 before:absolute before:top-2 before:bottom-2 before:right-4 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500/30 before:via-indigo-500/20 before:to-transparent">
        {displayedActivities.map((act, idx) => {
          return (
            <div
              key={`${act.id || 'act'}-${idx}`}
              id={`activity-${act.id || idx}`}
              className="relative pr-9 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-900/40 hover:bg-slate-800/60 border border-white/5 hover:border-cyan-500/20 transition-all group"
            >
              {/* Timeline Pin Node */}
              <div className="absolute right-2.5 top-3.5 w-3 h-3 rounded-full bg-slate-950 border-2 border-cyan-400 group-hover:scale-125 group-hover:border-white transition-all shadow-sm"></div>

              {/* Event Content */}
              <div className="flex items-start gap-2.5">
                <span className="text-xl shrink-0 mt-0.5">{act.actorAvatar}</span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white">{act.actor}</span>
                    <span className="text-[10px] text-slate-400 font-medium">({act.actorRole})</span>
                    <span className={`text-[9px] font-semibold px-2 py-0.2 rounded-full border ${getTypeBadge(act.type)}`}>
                      {getTypeText(act.type)}
                    </span>
                    {act.projectId && (
                      <span className="text-[9px] font-mono text-purple-300 bg-purple-950/50 px-1.5 py-0.2 rounded">
                        {act.projectId === 'qaddha' ? 'قدّها' : act.projectId === 'mueen' ? 'مُعين' : 'HQ'}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {act.actionText}
                  </p>
                </div>
              </div>

              {/* Timestamp */}
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono self-start sm:self-center shrink-0">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>{act.timestamp}</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
