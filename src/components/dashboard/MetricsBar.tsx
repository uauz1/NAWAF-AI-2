import React from 'react';
import { Users, CheckCircle, Clock, AlertCircle, ArrowUpRight, TrendingUp } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';

export const MetricsBar: React.FC = () => {
  const { metrics, setActiveTab } = useCompany();

  const cards = [
    {
      id: 'metric-productivity',
      label: 'اكتمال المهام المسجلة',
      value: `${metrics.productivityRate}%`,
      change: 'محسوب من المهام الفعلية',
      trend: 'neutral',
      icon: <TrendingUp className="w-5 h-5 text-purple-400" />,
      color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-300',
      actionTab: 'analytics' as const,
    },
    {
      id: 'metric-decisions',
      label: 'قرارات بانتظارك',
      value: metrics.pendingDecisions,
      change: metrics.pendingDecisions > 0 ? 'تتطلب قرارك' : 'لا توجد قرارات معلقة',
      trend: metrics.pendingDecisions > 0 ? 'alert' : 'neutral',
      icon: <AlertCircle className="w-5 h-5 text-rose-400" />,
      color: metrics.pendingDecisions > 0
        ? 'from-rose-500/25 to-red-500/10 border-rose-500/40 text-rose-300 shadow-[0_0_20px_-3px_rgba(244,63,94,0.25)]'
        : 'from-slate-800/40 to-slate-900/40 border-white/10 text-slate-300',
      actionTab: 'decisions' as const,
    },
    {
      id: 'metric-progress',
      label: 'مهام قيد التنفيذ',
      value: metrics.inProgressTasks,
      change: 'من الحالة المسجلة',
      trend: 'neutral',
      icon: <Clock className="w-5 h-5 text-indigo-400" />,
      color: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/30 text-indigo-300',
      actionTab: 'projects' as const,
    },
    {
      id: 'metric-completed',
      label: 'مهام مكتملة',
      value: metrics.completedTasks,
      change: 'تتطلب نتيجة موثقة',
      trend: 'neutral',
      icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300',
      actionTab: 'projects' as const,
    },
    {
      id: 'metric-employees',
      label: 'موظفون بحالة عمل',
      value: metrics.workingEmployees,
      change: 'حسب الحالة الحالية',
      trend: 'neutral',
      icon: <Users className="w-5 h-5 text-cyan-400" />,
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-300',
      actionTab: 'employees' as const,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {cards.map(card => (
        <div
          key={card.id}
          id={card.id}
          onClick={() => setActiveTab(card.actionTab)}
          className={`relative rounded-2xl p-4 bg-gradient-to-br glass-card border transition-all duration-300 cursor-pointer group hover:scale-[1.02] hover:-translate-y-0.5 ${card.color}`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">{card.label}</span>
            <div className="p-1.5 rounded-lg bg-slate-950/60 border border-white/5 transition-transform group-hover:scale-110">
              {card.icon}
            </div>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">{card.value}</span>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[10px]">
            <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full ${
              card.trend === 'alert'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                : 'bg-slate-800/80 text-slate-300 border border-white/5'
            }`}>
              {card.change}
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      ))}
    </div>
  );
};
