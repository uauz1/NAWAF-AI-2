import React, { useState } from 'react';
import { Lightbulb, Plus, ShieldCheck } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';

export const IdeaLabView: React.FC = () => {
  const { ideas, addNewIdea, promoteIdeaToTask } = useCompany();
  const [filter, setFilter] = useState<'all' | 'promising' | 'rejected' | 'under_review'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [opportunity, setOpportunity] = useState('');
  const [difficulty, setDifficulty] = useState<'سهل' | 'متوسط' | 'معقد'>('متوسط');
  const [potential, setPotential] = useState<'استثنائي' | 'مرتفع' | 'واعد'>('واعد');
  const [devTime, setDevTime] = useState('غير مقدر');
  const [cost, setCost] = useState('غير مقدرة');
  const [category, setCategory] = useState('غير مصنف');

  const filteredIdeas = ideas.filter(idea => filter === 'all' || idea.status === filter);
  const promisingCount = ideas.filter(idea => idea.status === 'promising').length;
  const rejectedCount = ideas.filter(idea => idea.status === 'rejected').length;
  const reviewCount = ideas.filter(idea => idea.status === 'under_review').length;

  const handleAddSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !opportunity.trim()) return;
    addNewIdea({
      title: title.trim(),
      opportunity: opportunity.trim(),
      difficulty,
      potential,
      estimatedDevTime: devTime.trim() || 'غير مقدر',
      expectedCost: cost.trim() || 'غير مقدرة',
      status: 'under_review',
      category: category.trim() || 'غير مصنف',
      notes: 'أضيفت الفكرة وتحتاج تقييماً قبل اعتبارها واعدة أو قابلة للتنفيذ.',
      suggestedBy: 'نواف',
    });
    setTitle('');
    setOpportunity('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl glass-panel p-6 border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white"><Lightbulb className="w-4 h-4" /></div>
              <h2 className="text-xl font-bold text-white">مختبر الأفكار</h2>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">الأفكار هنا سجلات واقتراحات. لا تُعتبر مدروسة أو مجانية أو قابلة للتنفيذ إلا إذا سُجل تقييم يدعم ذلك.</p>
          </div>
          <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400"><Plus className="w-4 h-4" />طرح فكرة</button>
        </div>

        <div className="mt-4 p-3.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-300 flex flex-wrap gap-3">
          <span>الإجمالي: <strong className="text-white">{ideas.length}</strong></span>
          <span>تحت المراجعة: <strong className="text-amber-300">{reviewCount}</strong></span>
          <span>واعدة: <strong className="text-emerald-300">{promisingCount}</strong></span>
          <span>مرفوضة: <strong className="text-rose-300">{rejectedCount}</strong></span>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5 flex-wrap">
          {([
            ['all', `كل الأفكار (${ideas.length})`],
            ['under_review', `تحت المراجعة (${reviewCount})`],
            ['promising', `واعدة (${promisingCount})`],
            ['rejected', `مرفوضة (${rejectedCount})`],
          ] as const).map(([id, label]) => (
            <button key={id} onClick={() => setFilter(id)} className={`px-3 py-1 rounded-xl text-xs ${filter === id ? 'bg-slate-800 text-white border border-white/10' : 'text-slate-400'}`}>{label}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIdeas.map(idea => (
          <div key={idea.id} className="rounded-2xl glass-panel p-5 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-full">{idea.category}</span>
                <span className="text-[10px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full">{idea.status === 'promising' ? 'واعدة' : idea.status === 'rejected' ? 'مرفوضة' : 'تحت المراجعة'}</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-2">{idea.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">{idea.opportunity}</p>
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-900/60 border border-white/5 text-[11px] mb-4">
                <div><span className="text-slate-500 block">الصعوبة</span><span className="text-slate-200">{idea.difficulty}</span></div>
                <div><span className="text-slate-500 block">الإمكانات</span><span className="text-amber-300">{idea.potential}</span></div>
                <div><span className="text-slate-500 block">المدة المقدرة</span><span className="text-slate-200">{idea.estimatedDevTime}</span></div>
                <div><span className="text-slate-500 block">التكلفة المقدرة</span><span className="text-slate-200">{idea.expectedCost}</span></div>
              </div>
              {idea.notes && <p className="text-[10px] text-slate-400 mb-4">ملاحظة: {idea.notes}</p>}
            </div>
            <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
              <span className="text-[10px] text-slate-500">المقترح: {idea.suggestedBy}</span>
              {idea.status === 'promising' && (
                <div className="flex gap-1.5">
                  <button onClick={() => promoteIdeaToTask(idea.id, 'qaddha')} className="text-[10px] px-2.5 py-1 rounded-lg bg-purple-950/60 text-purple-300 border border-purple-500/30">تحويل لمهمة قدّها</button>
                  <button onClick={() => promoteIdeaToTask(idea.id, 'mueen')} className="text-[10px] px-2.5 py-1 rounded-lg bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">تحويل لمهمة مُعين</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {filteredIdeas.length === 0 && <div className="py-12 text-center text-xs text-slate-500">لا توجد أفكار في هذا التصنيف.</div>}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form onSubmit={handleAddSubmit} className="w-full max-w-lg rounded-2xl glass-panel p-6 border border-white/10 space-y-3 text-right">
            <h3 className="text-base font-bold text-white flex items-center gap-2"><Lightbulb className="w-5 h-5 text-amber-400" />إضافة فكرة للمراجعة</h3>
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2"><ShieldCheck className="w-4 h-4 shrink-0" /><span>لن تُصنّف الفكرة تلقائياً كواعدة ولن يُفترض أن تكلفتها صفر.</span></div>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="عنوان الفكرة" required className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white" />
            <textarea value={opportunity} onChange={e => setOpportunity(e.target.value)} placeholder="الفرصة أو الفائدة المتوقعة" required rows={3} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white" />
            <div className="grid grid-cols-2 gap-3">
              <select value={difficulty} onChange={e => setDifficulty(e.target.value as any)} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"><option>سهل</option><option>متوسط</option><option>معقد</option></select>
              <select value={potential} onChange={e => setPotential(e.target.value as any)} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"><option>واعد</option><option>مرتفع</option><option>استثنائي</option></select>
              <input value={devTime} onChange={e => setDevTime(e.target.value)} placeholder="مدة غير مقدرة" className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white" />
              <input value={cost} onChange={e => setCost(e.target.value)} placeholder="تكلفة غير مقدرة" className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white" />
            </div>
            <input value={category} onChange={e => setCategory(e.target.value)} placeholder="التصنيف" className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white" />
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-xs text-slate-400">إلغاء</button><button type="submit" className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold">حفظ للمراجعة</button></div>
          </form>
        </div>
      )}
    </div>
  );
};
