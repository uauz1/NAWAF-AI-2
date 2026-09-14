import React, { useState } from 'react';
import { 
  FolderKanban, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  Send, 
  Plus, 
  ArrowRight,
  Gamepad2,
  Moon,
  ChevronLeft
} from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { Project, ProjectId } from '../../types';

export const ProjectsView: React.FC = () => {
  const { projects, employees, selectedProject, setSelectedProject, setSelectedEmployee, setActiveTab, triggerSimulatedCollaboration } = useCompany();
  const [activeProjectId, setActiveProjectId] = useState<ProjectId>('mueen');
  const [crossDeptHelpOpen, setCrossDeptHelpOpen] = useState(false);
  const [helpTargetDept, setHelpTargetDept] = useState('التصميم والإبداع');
  const [helpRequestText, setHelpRequestText] = useState('');
  const [helpSubmitted, setHelpSubmitted] = useState(false);

  const currentProject = projects.find(p => p.id === activeProjectId) || projects[0];

  const handleSendCrossDeptRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!helpRequestText.trim()) return;
    
    // Simulate cross department collaboration
    triggerSimulatedCollaboration();
    setHelpSubmitted(true);
    setTimeout(() => {
      setHelpSubmitted(false);
      setHelpRequestText('');
      setCrossDeptHelpOpen(false);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Projects Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-cyan-400" />
            <span>مشاريع الشركة النشطة (Active Ventures)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            مساحات عمل مخصصة لكل مشروع مع مدير مشروع AI مستقل وفريق تنفيذي متكامل.
          </p>
        </div>

        {/* Project Selector Pills */}
        <div className="flex items-center gap-2">
          {projects.map(p => {
            const isSelected = p.id === activeProjectId;
            const isMueen = p.id === 'mueen';

            return (
              <button
                key={p.id}
                id={`tab-project-${p.id}`}
                onClick={() => setActiveProjectId(p.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isSelected 
                    ? isMueen 
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]' 
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_15px_-3px_rgba(168,85,247,0.3)]'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {isMueen ? <Moon className="w-4 h-4 text-cyan-400" /> : <Gamepad2 className="w-4 h-4 text-purple-400" />}
                <span>{p.name}</span>
                <span className="font-mono text-[11px] opacity-80">({p.progress}%)</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Project Dashboard Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Main Project Workspace */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Project Hero Header Card */}
          <div className="rounded-2xl glass-panel p-6 border border-white/10 relative overflow-hidden">
            <div 
              className="absolute -top-16 -left-16 w-60 h-60 rounded-full blur-3xl pointer-events-none opacity-20"
              style={{ backgroundColor: currentProject.color }}
            ></div>

            {/* Religious Review Requirement Notice for Mueen */}
            {currentProject.isSensitiveReligiousContent && (
              <div className="mb-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 p-3.5 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-cyan-200">الضابط الشرعي الصارم: </span>
                  <span className="text-cyan-100/90 leading-relaxed">
                    محتوى تطبيق مُعين ديني وحساس. يُمنع منعاً باتاً على أي موظف AI نشر أو تعديل أي نصوص شرعية أو تفاسير دون مراجعة واعتماد شخصي مباشر من نواف (الرئيس التنفيذي).
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl font-black text-white tracking-tight">{currentProject.name}</span>
                  <span className="text-xs font-mono text-slate-400 px-2 py-0.5 bg-slate-900 rounded-md border border-white/5">
                    {currentProject.nameEn}
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    currentProject.health === 'ممتاز'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    الحالة: {currentProject.health}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium">{currentProject.tagline}</p>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-xl">{currentProject.description}</p>
              </div>

              {/* Progress Circle & Manager */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-3 rounded-xl bg-slate-900/60 border border-white/5 shrink-0">
                <div className="text-right sm:text-left mb-1">
                  <span className="text-3xl font-extrabold text-white font-mono">{currentProject.progress}%</span>
                  <span className="text-[10px] text-slate-400 block">نسبة الإنجاز الكلية</span>
                </div>
                <div className="text-[11px] text-cyan-300 font-medium">
                  مدير المشروع: {currentProject.projectManagerName}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5 mb-4">
              <div 
                className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-cyan-500 to-indigo-500"
                style={{ width: `${currentProject.progress}%` }}
              ></div>
            </div>

            {/* Phase pill */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 border-t border-white/5 pt-3">
              <div>
                <span className="text-slate-500">المرحلة الحالية: </span>
                <span className="text-slate-200 font-medium">{currentProject.currentPhase}</span>
              </div>
              <div className="flex items-center gap-3">
                <span>الأخطاء: <strong className="text-amber-400 font-mono">{currentProject.bugsCount}</strong></span>
                <span>الأفكار: <strong className="text-cyan-400 font-mono">{currentProject.activeIdeasCount}</strong></span>
              </div>
            </div>

          </div>

          {/* Project Tasks Board */}
          <div className="rounded-2xl glass-panel p-5 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">مهام المشروع التنفيذية</h3>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                  {currentProject.tasks.length} مهام
                </span>
              </div>

              {/* Request Help Button */}
              <button
                id="request-cross-dept-help-btn"
                onClick={() => setCrossDeptHelpOpen(prev => !prev)}
                className="text-xs font-medium text-cyan-300 hover:text-cyan-200 bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/30 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
              >
                <Send className="w-3 h-3" />
                <span>طلب مساندة من قسم آخر</span>
              </button>
            </div>

            {/* Cross-Department Help Dropdown / Form */}
            {crossDeptHelpOpen && (
              <form onSubmit={handleSendCrossDeptRequest} className="mb-4 p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 animate-in fade-in duration-150">
                <div className="text-xs font-bold text-white mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>تنسيق ذاتي: طلب مساندة من {currentProject.projectManagerName} (مدير {currentProject.name})</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">القسم المستهدف للمساندة:</label>
                    <select
                      value={helpTargetDept}
                      onChange={e => setHelpTargetDept(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="التصميم والإبداع">التصميم والإبداع (ليان)</option>
                      <option value="التسويق والنمو">التسويق والنمو (عمر)</option>
                      <option value="التقنية والتطوير">التقنية والتطوير (فهد)</option>
                      <option value="البحث والابتكار">البحث والابتكار (خالد)</option>
                      <option value="التحليلات والجودة">التحليلات والجودة (نورة / ريم)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-slate-400 mb-1">المهمة المطلوبة:</label>
                    <input
                      type="text"
                      value={helpRequestText}
                      onChange={e => setHelpRequestText(e.target.value)}
                      placeholder="مثال: تجهيز 3 بنرات عمودية لشاشات التحدي، أو فحص أمني..."
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    * يتم التنسيق بين مديري الأقسام آلياً بدون أن تضطر لنقل الرسائل يدوياً.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCrossDeptHelpOpen(false)}
                      className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:text-white"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={helpSubmitted}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all flex items-center gap-1 shadow-sm"
                    >
                      {helpSubmitted ? 'تم إرسال الطلب بنجاح ✓' : 'إرسال طلب المساندة'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Task list */}
            <div className="space-y-2.5">
              {currentProject.tasks.map(task => {
                return (
                  <div 
                    key={task.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800/60 border border-white/5 transition-all"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`mt-0.5 p-1 rounded-md ${
                        task.status === 'completed' 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : task.status === 'needs_ceo'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-cyan-500/20 text-cyan-400'
                      }`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{task.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          المسؤول: <span className="text-slate-300 font-medium">{task.assigneeName}</span> • قسم: {task.department}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        task.priority === 'عالي' 
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/20' 
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        أولوية: {task.priority}
                      </span>

                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        task.status === 'needs_ceo'
                          ? 'bg-rose-500 text-white animate-pulse'
                          : task.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}>
                        {task.status === 'needs_ceo' ? 'بانتظار قرارك' : task.status === 'completed' ? 'مكتملة' : 'قيد التنفيذ'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Project Milestones */}
          <div className="rounded-2xl glass-panel p-5 border border-white/10">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>أحدث الإنجازات المحققة في المشروع</span>
            </h3>
            <div className="space-y-2">
              {currentProject.recentMilestones.map((m, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/40 border border-white/5 text-xs">
                  <div className="flex items-center gap-2 text-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    <span>{m.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{m.date}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Col: Assigned Team & Quick Intelligence */}
        <div className="space-y-6">
          
          {/* Assigned Team Card */}
          <div className="rounded-2xl glass-panel p-5 border border-white/10">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>فريق العمل المخصص للمشروع</span>
            </h3>

            <div className="space-y-2.5">
              {employees
                .filter(e => currentProject.assignedEmployees.includes(e.id))
                .map(emp => {
                  return (
                    <div
                      key={emp.id}
                      onClick={() => setSelectedEmployee(emp)}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/50 hover:bg-slate-800/70 border border-white/5 hover:border-cyan-500/30 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{emp.avatar}</span>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                            {emp.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {emp.position}
                          </div>
                        </div>
                      </div>

                      <div className="text-left">
                        <span className="text-[10px] font-mono font-bold text-emerald-400">
                          {emp.productivity}%
                        </span>
                        <span className="block text-[9px] text-slate-400">إنتاجية</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Marketing Phase for Project */}
          <div className="rounded-2xl glass-panel p-5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>الحالة التسويقية الحالية</span>
              </span>
              <button 
                onClick={() => setActiveTab('marketing')}
                className="text-[10px] text-cyan-400 hover:underline"
              >
                فتح تقويم التسويق
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-white/5">
              {currentProject.marketingPhase}
            </p>
          </div>

          {/* Autonomous Project Loop Spec */}
          <div className="rounded-2xl glass-panel p-5 border border-indigo-500/20 bg-gradient-to-b from-indigo-950/20 to-slate-950/60">
            <h4 className="text-xs font-bold text-indigo-300 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>هندسة التنسيق التلقائي (Autonomous Loop)</span>
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              يقوم مدير المشروع بالتواصل المباشر مع مديري التسويق، التصميم، والتقنية. يتم إعداد الحملات والمهام تلقائياً ويصلك أنت (نواف) التقرير النهائي للموافقة فقط.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
