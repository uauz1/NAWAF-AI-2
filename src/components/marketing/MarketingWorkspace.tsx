import React, { useState } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Share2, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Users, 
  Eye, 
  Layers, 
  ArrowUpRight,
  Send,
  AlertCircle
} from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { MarketingCampaign } from '../../types';

export const MarketingWorkspace: React.FC = () => {
  const { campaigns, projects, triggerSimulatedCollaboration } = useCompany();
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'qaddha' | 'mueen'>('all');

  const filteredCampaigns = campaigns.filter(c => {
    if (activeTabFilter === 'all') return true;
    return c.projectId === activeTabFilter;
  });

  const columns: {
    status: MarketingCampaign['status'];
    title: string;
    badgeColor: string;
  }[] = [
    { status: 'planned', title: 'مخططة (Planned)', badgeColor: 'bg-slate-800 text-slate-300' },
    { status: 'preparing', title: 'قيد التجهيز (Preparing)', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    { status: 'ready', title: 'جاهزة للمراجعة (Ready)', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
    { status: 'published', title: 'منشورة بنجاح (Published)', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="rounded-2xl glass-panel p-6 border border-white/10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                مساحة التسويق والنمو العضوي (Marketing & Growth)
              </h2>
              <span className="text-xs bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                مدير التسويق: عمر
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              تخطيط الحملات الفيروسية العضوية وتنسيق المواد مع قسم التصميم. مصممة وفق معمارية جاهزة لربط واجهات التواصل الاجتماعي مستقبلاً.
            </p>
          </div>

          {/* Project Filter Pills */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTabFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTabFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              جميع الحملات ({campaigns.length})
            </button>
            <button
              onClick={() => setActiveTabFilter('qaddha')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTabFilter === 'qaddha' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              قدّها
            </button>
            <button
              onClick={() => setActiveTabFilter('mueen')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTabFilter === 'mueen' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              مُعين
            </button>
          </div>
        </div>

        {/* Notice of Clean Architecture */}
        <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>بنية تحتية نظيفة: لا يتم ربط حسابات حقيقية في هذه النسخة التجريبية؛ المعمارية مهيأة للربط المباشر مع API شبكات التواصل لاحقاً.</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400">Zero Paid Ads ($0)</span>
        </div>
      </div>

      {/* Marketing Calendar / Kanban 4-Stage Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map(col => {
          const colCampaigns = filteredCampaigns.filter(c => c.status === col.status);

          return (
            <div 
              key={col.status}
              className="rounded-2xl glass-panel p-4 border border-white/10 flex flex-col justify-between min-h-[420px]"
            >
              <div>
                {/* Column Title */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
                  <span className="text-xs font-bold text-white">{col.title}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${col.badgeColor}`}>
                    {colCampaigns.length}
                  </span>
                </div>

                {/* Column Items */}
                <div className="space-y-3">
                  {colCampaigns.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-500">
                      لا توجد مواد في هذه المرحلة
                    </div>
                  ) : (
                    colCampaigns.map(camp => {
                      return (
                        <div
                          key={camp.id}
                          className="p-3.5 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 border border-white/5 hover:border-cyan-500/30 transition-all text-right group"
                        >
                          {/* Channel and Project */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] font-mono font-semibold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/20">
                              {camp.channel}
                            </span>
                            <span className="text-[10px] font-bold text-purple-300">
                              {camp.projectName}
                            </span>
                          </div>

                          {/* Title */}
                          <h4 className="text-xs font-bold text-white mb-2 leading-snug group-hover:text-cyan-200 transition-colors">
                            {camp.title}
                          </h4>

                          {/* Audience */}
                          <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                            الجمهور: {camp.targetAudience}
                          </p>

                          {/* Visuals count & Lead */}
                          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
                            <span>{camp.keyVisualsCount} مواد بصرية جاهزة</span>
                            <span className="text-slate-300">المسؤول: {camp.leadEmployee}</span>
                          </div>

                          {/* Date info */}
                          <div className="mt-2 text-[9px] text-slate-400 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{camp.scheduledDate}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="pt-3 border-t border-white/5 mt-4">
                <button
                  onClick={triggerSimulatedCollaboration}
                  className="w-full py-1.5 rounded-xl text-[11px] font-semibold text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 transition-all"
                >
                  + تحديث الجدولة
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
