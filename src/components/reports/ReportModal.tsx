import React from 'react';
import { 
  X, 
  FileText, 
  CheckCircle, 
  Clock, 
  Sparkles, 
  ArrowUpRight, 
  Printer, 
  Share2,
  FolderKanban,
  User,
  ShieldCheck,
  TrendingUp,
  Check
} from 'lucide-react';
import { CompanyReport, ReportStatus } from '../../types';
import { useCompany } from '../../context/CompanyContext';

interface ReportModalProps {
  report: CompanyReport | null;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ report, onClose }) => {
  const { updateReportProgress } = useCompany();

  if (!report) return null;

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'مكتمل':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'جاهز للمراجعة':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 animate-pulse';
      case 'جاري إعداد التقرير':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-white/10';
    }
  };

  const handleMarkComplete = () => {
    updateReportProgress(report.id, 100, 'مكتمل');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel p-6 sm:p-8 border border-white/10 shadow-2xl text-right">
        
        {/* Top Controls: Close & Print */}
        <div className="absolute top-5 left-5 flex items-center gap-2">
          <button
            onClick={() => window.print()}
            title="طباعة التقرير"
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 border border-white/5 transition-all"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 border border-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Report Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(report.status)}`}>
              {report.status}
            </span>
            <span className="text-xs text-purple-300 bg-purple-950/50 border border-purple-500/20 px-2.5 py-0.5 rounded-full font-medium">
              مشروع: {report.projectName}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              تاريخ الصدور: {report.createdAt}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight mb-2">
            {report.title}
          </h2>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>إعداد وتنسيق: <strong className="text-white">{report.authorName}</strong> ({report.authorRole})</span>
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 mb-6">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-slate-300">نسبة اكتمال التقرير والبيانات:</span>
            <span className="font-mono font-bold text-cyan-300">{report.progress}%</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/10">
            <div 
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400"
              style={{ width: `${report.progress}%` }}
            ></div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-cyan-300 mb-2 flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            <span>الملخص التنفيذي (Executive Summary):</span>
          </h3>
          <div className="p-4 rounded-2xl bg-cyan-950/15 border border-cyan-500/20 text-xs text-slate-200 leading-relaxed font-medium">
            {report.summary}
          </div>
        </div>

        {/* Key Findings Section */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-emerald-300 mb-2 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" />
            <span>أبرز النتائج والاكتشافات المحورية:</span>
          </h3>
          <div className="space-y-2">
            {report.keyFindings.map((finding, index) => (
              <div key={index} className="p-3 rounded-xl bg-slate-900/40 border border-white/5 text-xs text-slate-300 flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                <span className="leading-relaxed">{finding}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic Recommendations Section */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-purple-300 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>التوصيات التنفيذية للرئيس التنفيذي:</span>
          </h3>
          <div className="space-y-2">
            {report.recommendations.map((rec, index) => (
              <div key={index} className="p-3 rounded-xl bg-purple-950/15 border border-purple-500/20 text-xs text-purple-200 flex items-start gap-2.5">
                <span className="text-purple-400 font-bold shrink-0">#{index + 1}</span>
                <span className="leading-relaxed">{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 font-mono">
            Report ID: {report.id} • Rule #1 Verified (0.00$)
          </div>

          <div className="flex items-center gap-2">
            {report.status !== 'مكتمل' && (
              <button
                onClick={handleMarkComplete}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>اعتماد التقرير كمكتمل</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-all"
            >
              إغلاق
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
