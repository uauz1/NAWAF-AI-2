import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Sparkles, 
  Save, 
  FolderKanban, 
  User, 
  Bot,
  Plus
} from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { ProjectId, ReportStatus } from '../../types';

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateReportModal: React.FC<CreateReportModalProps> = ({ isOpen, onClose }) => {
  const { employees, addReport } = useCompany();

  const [title, setTitle] = useState('');
  const [authorId, setAuthorId] = useState(employees[0]?.id || 'ryan');
  const [projectId, setProjectId] = useState<ProjectId>('qaddha');
  const [status, setStatus] = useState<ReportStatus>('جاري إعداد التقرير');
  const [progress, setProgress] = useState(40);
  const [summary, setSummary] = useState('');
  const [findingsStr, setFindingsStr] = useState('');
  const [recommendationsStr, setRecommendationsStr] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) return;

    const author = employees.find(e => e.id === authorId) || employees[0];
    const projectName = projectId === 'mueen' ? 'مُعين' : projectId === 'qaddha' ? 'قدّها' : 'Nawaf HQ';

    const keyFindings = findingsStr
      .split('\n')
      .map(f => f.trim())
      .filter(Boolean);

    const recommendations = recommendationsStr
      .split('\n')
      .map(r => r.trim())
      .filter(Boolean);

    addReport({
      title: title.trim(),
      authorId: author?.id || 'ryan',
      authorName: author?.name || 'ريان',
      authorRole: author?.position || 'مدير مشروع',
      projectId,
      projectName,
      status,
      progress,
      summary: summary.trim(),
      keyFindings: keyFindings.length > 0 ? keyFindings : ['تم جمع البيانات الأولية بنجاح بنسبة 100% مجاناً.'],
      recommendations: recommendations.length > 0 ? recommendations : ['مواصلة تنفيذ خطة العمل المعتمدة.']
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel p-6 sm:p-8 border border-white/10 shadow-2xl text-right">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 border border-white/5 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">تكليف وكيل ذكي بإعداد تقرير جديد</h2>
            <p className="text-xs text-slate-400">
              صياغة تقرير أداء، تحليل فني، أو دراسة جدوى صفرية التكلفة وربطها بالمنظومة.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              عنوان التقرير:
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="مثال: تحليل معدلات الاحتفاظ وتجربة المستخدم..."
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Row: Author & Project */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                الوكيل الذكي المكلف بإعداد التقرير:
              </label>
              <select
                value={authorId}
                onChange={e => setAuthorId(e.target.value)}
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.position})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                المشروع المخصص:
              </label>
              <select
                value={projectId}
                onChange={e => setProjectId(e.target.value as ProjectId)}
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="qaddha">قدّها (Qaddha)</option>
                <option value="mueen">مُعين (Mueen)</option>
                <option value="hq">Nawaf HQ (الشركة العامة)</option>
              </select>
            </div>
          </div>

          {/* Row: Status & Progress */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                حالة التقرير:
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as ReportStatus)}
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="يتم جمع البيانات">يتم جمع البيانات</option>
                <option value="يتم التحليل">يتم التحليل</option>
                <option value="جاري إعداد التقرير">جاري إعداد التقرير</option>
                <option value="جاهز للمراجعة">جاهز للمراجعة</option>
                <option value="مكتمل">مكتمل</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1.5">
                <span>نسبة الإنجاز المبدئية:</span>
                <span className="font-mono text-cyan-300">{progress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={e => setProgress(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              الملخص التنفيذي للتقرير:
            </label>
            <textarea
              required
              rows={3}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="اكتب ملخصاً تنفيذياً مختصراً ومكثفاً لأهم ما توصل إليه التقرير..."
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 leading-relaxed resize-none"
            />
          </div>

          {/* Key Findings */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              النتائج والاكتشافات المحورية (ضع كل نقطة في سطر مستقل):
            </label>
            <textarea
              rows={3}
              value={findingsStr}
              onChange={e => setFindingsStr(e.target.value)}
              placeholder="النتيجة الأولى: تم اختبار الأداء بدون تكلفة...&#10;النتيجة الثانية: تحسن معدل السرعة بنسبة 25%..."
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 leading-relaxed resize-none"
            />
          </div>

          {/* Recommendations */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              التوصيات التنفيذية للرئيس التنفيذي (ضع كل توصية في سطر مستقل):
            </label>
            <textarea
              rows={2}
              value={recommendationsStr}
              onChange={e => setRecommendationsStr(e.target.value)}
              placeholder="التوصية الأولى: اعتماد النموذج الأولي...&#10;التوصية الثانية: النشر الفوري للنسخة التجريبية..."
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 leading-relaxed resize-none"
            />
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-all"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-indigo-400 hover:from-cyan-300 hover:to-indigo-300 shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>إصدار التقرير</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
