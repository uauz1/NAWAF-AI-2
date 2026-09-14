import React, { useState } from 'react';
import { 
  Lightbulb, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { IdeaItem, ProjectId } from '../../types';

export const IdeaLabView: React.FC = () => {
  const { ideas, addNewIdea, promoteIdeaToTask, setActiveTab } = useCompany();
  const [filter, setFilter] = useState<'all' | 'promising' | 'rejected' | 'under_review'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Idea Form State
  const [title, setTitle] = useState('');
  const [opportunity, setOpportunity] = useState('');
  const [difficulty, setDifficulty] = useState<'سهل' | 'متوسط' | 'معقد'>('سهل');
  const [potential, setPotential] = useState<'استثنائي' | 'مرتفع' | 'واعد'>('مرتفع');
  const [devTime, setDevTime] = useState('3 أيام');
  const [cost, setCost] = useState('0$ — مجاني بالكامل');
  const [category, setCategory] = useState('أدوات مجانية');

  const filteredIdeas = ideas.filter(i => {
    if (filter === 'all') return true;
    return i.status === filter;
  });

  const promisingCount = ideas.filter(i => i.status === 'promising').length;
  const rejectedCount = ideas.filter(i => i.status === 'rejected').length;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !opportunity.trim()) return;

    addNewIdea({
      title,
      opportunity,
      difficulty,
      potential,
      estimatedDevTime: devTime,
      expectedCost: cost,
      status: 'promising',
      category,
      notes: 'فكرة مضافة حديثاً لمختبر الأفكار تلتزم بالتشغيل المجاني',
      suggestedBy: 'نواف (الرئيس التنفيذي)'
    });

    setTitle('');
    setOpportunity('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Stats */}
      <div className="rounded-2xl glass-panel p-6 border border-white/10 relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md">
                <Lightbulb className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                مختبر الأفكار والاستكشاف (Idea Lab)
              </h2>
              <span className="text-xs bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
                البحث والابتكار
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              رصد الفرص التجارية، استكشاف التقنيات مفتوحة المصدر، وفلترة المشاريع الصفرية التكلفة لدعم نمو الشركة.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 transition-all shadow-md self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>طرح فكرة جديدة</span>
          </button>
        </div>

        {/* Prompt Specific Stat Line: "12 ideas researched, 9 rejected, 3 promising" */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>حصيلة الرصد: <strong className="text-white">12 فكرة دُرست بعناية</strong></span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">{promisingCount} أفكار واعدة ومجانية</span>
            <span>•</span>
            <span className="text-rose-400 font-bold">{rejectedCount} أفكار مرفوضة (بسبب التكلفة أو عدم الجدوى)</span>
          </div>

          <div className="text-[11px] text-amber-300/90 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>نفضل دائماً الأفكار القابلة للبناء مجاناً 100%</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              filter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            جميع الأفكار ({ideas.length})
          </button>
          <button
            onClick={() => setFilter('promising')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              filter === 'promising' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            الأفكار الواعدة ({promisingCount})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              filter === 'rejected' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            المرفوضة لالتزام الميزانية ({rejectedCount})
          </button>
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIdeas.map(idea => {
          const isPromising = idea.status === 'promising';

          return (
            <div
              key={idea.id}
              className={`rounded-2xl glass-panel p-5 border transition-all duration-300 flex flex-col justify-between ${
                isPromising 
                  ? 'border-amber-500/30 hover:border-amber-400/50 hover:shadow-[0_0_25px_-5px_rgba(245,158,11,0.15)]' 
                  : 'border-white/5 opacity-75 hover:opacity-100'
              }`}
            >
              <div>
                {/* Status and Category */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/20">
                    {idea.category}
                  </span>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isPromising 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}>
                    {isPromising ? 'فرصة واعدة' : 'مرفوضة بالتكلفة'}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-white mb-2 leading-snug">
                  {idea.title}
                </h3>

                {/* Opportunity */}
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {idea.opportunity}
                </p>

                {/* Meta Specs Grid */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-900/60 border border-white/5 text-[11px] mb-4">
                  <div>
                    <span className="text-slate-500 block">الصعوبة:</span>
                    <span className="font-semibold text-slate-200">{idea.difficulty}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">الإمكانات:</span>
                    <span className="font-semibold text-amber-300">{idea.potential}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">وقت التطوير:</span>
                    <span className="font-semibold text-slate-200">{idea.estimatedDevTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">التكلفة المتوقعة:</span>
                    <span className="font-semibold text-emerald-400">{idea.expectedCost}</span>
                  </div>
                </div>

                {/* Notes */}
                {idea.notes && (
                  <p className="text-[10px] text-slate-400 italic mb-4">
                    ملاحظة التقييم: «{idea.notes}»
                  </p>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500">
                  المقترح: {idea.suggestedBy}
                </span>

                {isPromising && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => promoteIdeaToTask(idea.id, 'qaddha')}
                      className="text-[10px] font-bold text-purple-300 hover:text-white bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/30 px-2.5 py-1 rounded-lg transition-all"
                    >
                      + تحويل لـ «قدّها»
                    </button>
                    <button
                      onClick={() => promoteIdeaToTask(idea.id, 'mueen')}
                      className="text-[10px] font-bold text-cyan-300 hover:text-white bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/30 px-2.5 py-1 rounded-lg transition-all"
                    >
                      + تحويل لـ «مُعين»
                    </button>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Add Idea Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl glass-panel p-6 border border-white/10 shadow-2xl text-right">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <span>طرح فكرة جديدة لمختبر الأفكار</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              سيقوم فريق البحث والابتكار بدراسة جدواها الصفرية وتصنيفها.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">عنوان الفكرة:</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="مثال: أداة توليد ملصقات تفاعلية للعبة قدّها أوفلاين..."
                  required
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">الفرصة والأثر التجاري:</label>
                <textarea
                  value={opportunity}
                  onChange={e => setOpportunity(e.target.value)}
                  placeholder="ما الفائدة التي ستقدمها هذه الفكرة للمستخدمين ولنمو الشركة؟"
                  required
                  rows={3}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">الصعوبة:</label>
                  <select
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value as any)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="سهل">سهل (1-3 أيام)</option>
                    <option value="متوسط">متوسط (4-7 أيام)</option>
                    <option value="معقد">معقد</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">الإمكانات:</label>
                  <select
                    value={potential}
                    onChange={e => setPotential(e.target.value as any)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="استثنائي">استثنائي</option>
                    <option value="مرتفع">مرتفع</option>
                    <option value="واعد">واعد</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">التكلفة (القانون رقم 1):</label>
                <input
                  type="text"
                  value={cost}
                  onChange={e => setCost(e.target.value)}
                  placeholder="يجب أن تكون مجانية 0$"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-emerald-400 font-semibold focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all shadow-md"
                >
                  حفظ الفكرة في المختبر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
