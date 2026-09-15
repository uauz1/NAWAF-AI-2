import React, { useState } from 'react';
import { TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { MarketingCampaign } from '../../types';

export const MarketingWorkspace: React.FC = () => {
  const { campaigns } = useCompany();
  const [filter, setFilter] = useState<'all' | 'qaddha' | 'mueen'>('all');
  const filtered = campaigns.filter(campaign => filter === 'all' || campaign.projectId === filter);

  const columns: Array<{ status: MarketingCampaign['status']; title: string }> = [
    { status: 'planned', title: 'مخططة' },
    { status: 'preparing', title: 'قيد التجهيز' },
    { status: 'ready', title: 'جاهزة للمراجعة' },
    { status: 'published', title: 'منشورة' },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl glass-panel p-6 border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white"><TrendingUp className="w-4 h-4" /></div>
              <h2 className="text-xl font-bold text-white">مساحة التسويق والنمو</h2>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">تعرض الحملات المسجلة وحالتها فقط. لا يوجد نشر خارجي تلقائي أو ربط بمنصات التواصل ما لم تتم إضافة تكامل حقيقي لاحقاً.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-xl text-xs ${filter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}>الكل ({campaigns.length})</button>
            <button onClick={() => setFilter('qaddha')} className={`px-3 py-1.5 rounded-xl text-xs ${filter === 'qaddha' ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400'}`}>قدّها</button>
            <button onClick={() => setFilter('mueen')} className={`px-3 py-1.5 rounded-xl text-xs ${filter === 'mueen' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'}`}>مُعين</button>
          </div>
        </div>
        <div className="mt-4 p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 flex items-start gap-2 text-xs text-amber-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>حالة «منشورة» تعني ما هو مسجل في النظام فقط؛ لا تعتبر إثباتاً على نشر خارجي بدون تكامل أو نتيجة موثقة.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map(column => {
          const items = filtered.filter(campaign => campaign.status === column.status);
          return (
            <div key={column.status} className="rounded-2xl glass-panel p-4 border border-white/10 min-h-[320px]">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
                <span className="text-xs font-bold text-white">{column.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">{items.length}</span>
              </div>
              <div className="space-y-3">
                {items.length === 0 ? <div className="text-center py-8 text-xs text-slate-500">لا توجد حملات في هذه الحالة.</div> : items.map(campaign => (
                  <div key={campaign.id} className="p-3.5 rounded-xl bg-slate-900/70 border border-white/5">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono text-cyan-300">{campaign.channel}</span>
                      <span className="text-[10px] font-bold text-purple-300">{campaign.projectName}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white mb-2">{campaign.title}</h4>
                    <p className="text-[11px] text-slate-400">الجمهور المسجل: {campaign.targetAudience || 'غير محدد'}</p>
                    <div className="pt-2 mt-2 border-t border-white/5 text-[10px] text-slate-500 space-y-1">
                      <div>المواد البصرية المسجلة: {campaign.keyVisualsCount}</div>
                      <div>حالة المواد: {campaign.materialsReady ? 'مسجلة كجاهزة' : 'غير جاهزة'}</div>
                      <div>المسؤول: {campaign.leadEmployee}</div>
                    </div>
                    {campaign.scheduledDate && <div className="mt-2 text-[9px] text-slate-400 font-mono flex items-center gap-1"><Clock className="w-3 h-3" />{campaign.scheduledDate}</div>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
