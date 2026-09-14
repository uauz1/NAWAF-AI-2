import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  ArrowUpRight, 
  Plus, 
  BarChart3, 
  TrendingUp,
  ShieldCheck,
  User
} from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { CompanyReport, ReportStatus, ProjectId } from '../../types';
import { ReportModal } from './ReportModal';
import { CreateReportModal } from './CreateReportModal';

export const ReportsView: React.FC = () => {
  const { reports, selectedReport, setSelectedReport } = useCompany();
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filteredReports = reports.filter(rep => {
    const matchesSearch = rep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          rep.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          rep.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = projectFilter === 'all' || rep.projectId === projectFilter;
    const matchesStatus = statusFilter === 'all' || rep.status === statusFilter;

    return matchesSearch && matchesProject && matchesStatus;
  });

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'مكتمل':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'جاهز للمراجعة':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 animate-pulse';
      case 'جاري إعداد التقرير':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'يتم التحليل':
      case 'يتم جمع البيانات':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-white/10';
    }
  };

  const completedCount = reports.filter(r => r.status === 'مكتمل').length;
  const readyForReviewCount = reports.filter(r => r.status === 'جاهز للمراجعة').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="rounded-2xl glass-panel p-6 border border-white/10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                مركز التقارير والمخرجات (Company Intelligence & Reports)
              </h2>
              <span className="text-xs bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono">
                {reports.length} تقارير
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              دراسات الجدوى، تقارير الجاهزية التشغيلية، ومذكرات التوصية المصاغة ذاتياً من موظفي AI إلى الرئيس التنفيذي.
            </p>
          </div>

          {/* Quick Stats & Add Button */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-indigo-400 hover:from-cyan-300 hover:to-indigo-300 shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>تكليف بتقرير جديد</span>
            </button>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ابحث في التقارير والنتائج..."
                className="bg-slate-900 border border-white/10 rounded-xl pr-8 pl-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 w-44 sm:w-56"
              />
            </div>

            <select
              value={projectFilter}
              onChange={e => setProjectFilter(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="all">جميع المشاريع</option>
              <option value="qaddha">قدّها</option>
              <option value="mueen">مُعين</option>
              <option value="hq">Nawaf HQ</option>
            </select>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/5">
          <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
            <span className="text-[10px] text-slate-400 block mb-0.5">إجمالي التقارير</span>
            <span className="text-lg font-black text-white font-mono">{reports.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
            <span className="text-[10px] text-slate-400 block mb-0.5">جاهزة للاعتماد</span>
            <span className="text-lg font-black text-cyan-400 font-mono">{readyForReviewCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
            <span className="text-[10px] text-slate-400 block mb-0.5">تقارير مكتملة</span>
            <span className="text-lg font-black text-emerald-400 font-mono">{completedCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
            <span className="text-[10px] text-slate-400 block mb-0.5">الامتثال المالي الصارم</span>
            <span className="text-lg font-black text-purple-300 font-mono">100% (0.00$)</span>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReports.map(rep => {
          return (
            <div
              key={rep.id}
              id={`report-card-${rep.id}`}
              onClick={() => setSelectedReport(rep)}
              className="rounded-2xl glass-panel p-5 border border-white/10 hover:border-cyan-500/40 hover:shadow-[0_0_25px_-5px_rgba(6,182,212,0.15)] transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Header: Project, Status, Date */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-purple-300 bg-purple-950/50 border border-purple-500/20 px-2.5 py-0.5 rounded-full font-medium">
                      مشروع: {rep.projectName}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {rep.createdAt}
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(rep.status)}`}>
                    {rep.status}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors mb-2 leading-snug">
                  {rep.title}
                </h3>

                {/* Author Info */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>المعد: <strong className="text-slate-200">{rep.authorName}</strong> ({rep.authorRole})</span>
                </div>

                {/* Executive Summary Snippet */}
                <p className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-300 leading-relaxed line-clamp-2 mb-3">
                  {rep.summary}
                </p>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-400">نسبة الاكتمال:</span>
                    <span className="font-mono text-cyan-300 font-bold">{rep.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-white/5">
                    <div 
                      className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-cyan-500 to-indigo-500"
                      style={{ width: `${rep.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Bottom: Counts & Open */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span>{rep.keyFindings.length} نتائج رئيسية</span>
                  <span>•</span>
                  <span>{rep.recommendations.length} توصيات</span>
                </div>

                <div className="text-xs text-cyan-400 font-medium group-hover:translate-x-[-2px] transition-transform flex items-center gap-1">
                  <span>قراءة التقرير الكامل</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Selected Report Modal */}
      <ReportModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />

      {/* Create New Report Modal */}
      <CreateReportModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

    </div>
  );
};
