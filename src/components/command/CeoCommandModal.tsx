import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Crown, 
  CheckCircle2, 
  Bot, 
  Layers, 
  Flame, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock
} from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { ProjectId } from '../../types';

export const CeoCommandModal: React.FC = () => {
  const { 
    isCeoCommandOpen, 
    setIsCeoCommandOpen, 
    executeCEOCommand, 
    projects, 
    employees,
    startMeeting
  } = useCompany();

  const [inputCommand, setInputCommand] = useState('');
  const [selectedProject, setSelectedProject] = useState<ProjectId | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<'عالي' | 'متوسط' | 'اعتيادي'>('عالي');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    message: string;
    assigneeName: string;
    taskTitle: string;
  } | null>(null);

  if (!isCeoCommandOpen) return null;

  const quickPrompts = [
    {
      title: 'فحص استقرار غرف لعب قدّها',
      text: 'افحص استقرار سيرفرات لعبة قدّها وتأكد من سرعة تجاوب غرف اللعب الجماعي',
      project: 'qaddha' as ProjectId,
      assignee: 'فهد'
    },
    {
      title: 'تدقيق محتوى وتفسير مُعِين',
      text: 'دقق نصوص التفسير الميسر وأوقات الصلاة في تطبيق مُعِين وأكّد سلامتها',
      project: 'mueen' as ProjectId,
      assignee: 'طارق'
    },
    {
      title: 'حملة انتشار فيروسية مجانية',
      text: 'جهّز استراتيجية النشر الفيروسي على تيك توك لمنصة قدّها بتكلفة صفرية $0.00',
      project: 'qaddha' as ProjectId,
      assignee: 'عمر'
    },
    {
      title: 'تصميم مواد ترويجية وهويات جديدة',
      text: 'صممي 3 بطاقات تحدي جديدة وواجهات مبهجة للهواتف الذكية لمشروع قدّها',
      project: 'qaddha' as ProjectId,
      assignee: 'ليان'
    },
    {
      title: 'عقد اجتماع استراتيجي طارئ',
      text: 'عقد اجتماع في قاعة الاجتماعات الكبرى لمناقشة خطة الإطلاق وضبط الجودة',
      project: 'all' as const,
      assignee: 'سارة'
    }
  ];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputCommand.trim() || isProcessing) return;

    const commandText = inputCommand.trim();
    setIsProcessing(true);
    setLastResult(null);

    // Check if it's a meeting request
    if (commandText.includes('اجتماع') || commandText.includes('مجلس') || commandText.includes('جلسة')) {
      setTimeout(() => {
        startMeeting(commandText);
        setIsProcessing(false);
        setIsCeoCommandOpen(false);
      }, 600);
      return;
    }

    try {
      const res = await executeCEOCommand(commandText);
      setLastResult(res);
      setInputCommand('');
    } catch {
      setLastResult({
        success: false,
        message: 'تعذر إرسال التوجيه، يرجى المحاولة مرة أخرى',
        assigneeName: '',
        taskTitle: ''
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#090d19] border border-amber-500/30 p-6 sm:p-8 shadow-2xl shadow-amber-950/30 text-right overflow-hidden">
        
        {/* Subtle executive gold ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/30 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-lg shadow-amber-500/20">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  مركز القيادة والتوجيه التنفيذي
                </h2>
                <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
                  CEO DIRECT ACCESS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                توجيهاتك تتحول تلقائياً إلى مهام تنفيذية وتُسند للوكيل الأنسب فورياً.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCeoCommandOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-white/10 hover:border-white/20 transition-all"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Command Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="relative">
            <textarea
              value={inputCommand}
              onChange={e => setInputCommand(e.target.value)}
              rows={3}
              placeholder="اكتب توجيهك التنفيذي هنا... (مثال: «يا فهد، تحقق من مشاكل سرعة الاستجابة في قدّها» أو «سو اجتماع عاجل لمراجعة إطلاق مُعِين»)"
              className="w-full bg-slate-950/80 border border-white/10 focus:border-amber-500/60 rounded-2xl p-4 text-sm text-white placeholder:text-slate-500 focus:outline-none transition-all resize-none shadow-inner"
              disabled={isProcessing}
            />
          </div>

          {/* Controls: Target Project & Priority */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">المشروع المستهدف:</span>
              <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setSelectedProject('all')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    selectedProject === 'all' 
                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  تلقائي الذكاء
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProject('qaddha')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    selectedProject === 'qaddha' 
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  قدّها
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProject('mueen')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    selectedProject === 'mueen' 
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  مُعِين
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">درجة الأولوية:</span>
              <div className="flex items-center gap-1">
                {(['عالي', 'متوسط', 'اعتيادي'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSelectedPriority(p)}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      selectedPriority === p
                        ? 'bg-white/10 text-white font-bold border border-white/20'
                        : 'text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-amber-300/80">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>التكلفة التشغيلية: 0.00$ (التزام صارم بالقانون رقم 1)</span>
            </div>

            <button
              type="submit"
              disabled={!inputCommand.trim() || isProcessing}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${
                !inputCommand.trim() || isProcessing
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20 active:scale-95'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>جاري معالجة التوجيه...</span>
                </>
              ) : (
                <>
                  <span>إصدار الأمر التنفيذي</span>
                  <Send className="w-3.5 h-3.5 rotate-180" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Feedback Result */}
        {lastResult && (
          <div className="mt-5 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 animate-in fade-in duration-200 relative z-10">
            <div className="flex items-center gap-2 font-bold text-xs mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{lastResult.message}</span>
            </div>
            <p className="text-xs text-emerald-300/80 mr-6">
              تم إسناد المهمة إلى <span className="font-bold text-white">{lastResult.assigneeName}</span> وستنعكس حركتها وتحديثها فورياً في المقر الرئيسي.
            </p>
          </div>
        )}

        {/* Suggested Directives / Quick Prompts */}
        <div className="mt-6 pt-5 border-t border-white/[0.06] relative z-10">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>توجيهات سريعة جاهزة:</span>
            </span>
            <span>اضغط للاختيار الفوري</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInputCommand(q.text)}
                className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 hover:border-amber-500/30 text-right transition-all group flex items-start justify-between gap-2"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                    {q.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    المسؤول: {q.assignee}
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 group-hover:-translate-x-1 transition-all shrink-0 mt-1 rotate-180" />
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
