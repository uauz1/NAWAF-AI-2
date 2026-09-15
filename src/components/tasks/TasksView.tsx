import React, { useState } from 'react';
import { CheckCircle2, Clock, AlertCircle, Plus, Search, Trash2, Play, Eye, ListTodo, Layers } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { ProjectId, ProjectTask } from '../../types';
import { ExecutionPlansList } from '../plans/ExecutionPlansList';

const statusLabel: Record<ProjectTask['status'], string> = {
  pending: 'بانتظار البدء',
  in_progress: 'قيد التنفيذ',
  completed: 'مكتملة',
  needs_ceo: 'تحتاج قرار نواف',
  reviewing: 'قيد المراجعة',
  blocked: 'متوقفة',
};

export const TasksView: React.FC = () => {
  const { tasks, projects, employees, updateTaskStatus, addNewTask, deleteTask, setSelectedEmployee } = useCompany();
  const [activeSubView, setActiveSubView] = useState<'plans' | 'tasks'>('plans');
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState(employees[0]?.id || '');
  const [projectId, setProjectId] = useState<ProjectId>(projects[0]?.id || 'hq');

  const filteredTasks = tasks.filter(task => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = task.title.toLowerCase().includes(query)
      || (task.description || '').toLowerCase().includes(query)
      || task.assigneeName.toLowerCase().includes(query);
    return matchesSearch
      && (projectFilter === 'all' || task.projectId === projectFilter)
      && (statusFilter === 'all' || task.status === statusFilter);
  });

  const createTask = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    const employee = employees.find(item => item.id === assigneeId);
    addNewTask({
      title: title.trim(),
      description: description.trim() || undefined,
      assigneeId: employee?.id,
      assigneeName: employee?.name || 'غير مسند',
      assigneeAvatar: employee?.avatar,
      projectId,
      status: 'pending',
      priority: 'متوسط',
      department: employee?.departmentName || 'غير محدد',
      progress: 0,
    });
    setTitle('');
    setDescription('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 text-right">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span>مركز المهام والعمليات</span>
            <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">{tasks.length} مهمة</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">الحالة والتقدم والنتائج لا تُرفع تلقائياً؛ المهمة الجديدة تبدأ بانتظار البدء و0%.</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2">
          <Plus className="w-4 h-4" /><span>إضافة مهمة</span>
        </button>
      </div>

      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] w-fit">
        <button onClick={() => setActiveSubView('plans')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${activeSubView === 'plans' ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-secondary)]'}`}>
          <Layers className="w-4 h-4" />الخطط
        </button>
        <button onClick={() => setActiveSubView('tasks')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${activeSubView === 'tasks' ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-secondary)]'}`}>
          <ListTodo className="w-4 h-4" />المهام
        </button>
      </div>

      {activeSubView === 'plans' ? <ExecutionPlansList /> : (
        <>
          <div className="flex flex-col md:flex-row gap-3 p-3 rounded-2xl bg-slate-900/60 border border-white/5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="ابحث في المهام..." className="w-full bg-slate-950/60 border border-white/5 rounded-xl pr-9 pl-4 py-2 text-xs text-white focus:outline-none" />
            </div>
            <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} className="bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200">
              <option value="all">كل المشاريع</option>
              {projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200">
              <option value="all">كل الحالات</option>
              <option value="pending">بانتظار البدء</option>
              <option value="in_progress">قيد التنفيذ</option>
              <option value="reviewing">قيد المراجعة</option>
              <option value="needs_ceo">تحتاج قرار نواف</option>
              <option value="blocked">متوقفة</option>
              <option value="completed">مكتملة</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.map(task => {
              const employee = employees.find(item => item.id === task.assigneeId);
              const progress = typeof task.progress === 'number' ? Math.max(0, Math.min(100, task.progress)) : 0;
              return (
                <div key={task.id} className="p-5 rounded-2xl bg-[#0b101e] border border-white/5 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">{projects.find(p => p.id === task.projectId)?.name || task.projectId || 'غير محدد'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">{statusLabel[task.status]}</span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">{task.title}</h3>
                    {task.description && <p className="text-xs text-slate-400 mt-1 leading-relaxed">{task.description}</p>}
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1"><span>التقدم المسجل</span><span className="font-mono text-cyan-300">{progress}%</span></div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden"><div className={`h-full ${task.status === 'completed' ? 'bg-emerald-500' : 'bg-cyan-500'}`} style={{ width: `${progress}%` }} /></div>
                  </div>

                  {task.result && <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-[11px] text-emerald-200"><strong>النتيجة الموثقة:</strong> {task.result}</div>}
                  {task.blockerReason && <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-[11px] text-amber-200"><strong>العائق:</strong> {task.blockerReason}</div>}

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <button type="button" onClick={() => employee && setSelectedEmployee(employee)} className="text-right">
                      <div className="text-xs font-bold text-slate-200">{task.assigneeName}</div>
                      <div className="text-[10px] text-slate-500">{task.department}</div>
                    </button>
                    <div className="flex items-center gap-1.5">
                      {task.status === 'pending' && <button onClick={() => updateTaskStatus(task.id, 'in_progress')} className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-300" title="بدء المهمة"><Play className="w-3.5 h-3.5" /></button>}
                      {task.status === 'in_progress' && <button onClick={() => updateTaskStatus(task.id, 'reviewing')} className="p-1.5 rounded-lg bg-purple-500/15 text-purple-300" title="إرسال للمراجعة"><Eye className="w-3.5 h-3.5" /></button>}
                      {task.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {task.status === 'blocked' && <AlertCircle className="w-4 h-4 text-amber-400" />}
                      {task.status === 'reviewing' && <Clock className="w-4 h-4 text-purple-400" />}
                      <button onClick={() => deleteTask(task.id)} className="p-1.5 rounded-lg bg-rose-500/10 text-rose-300" title="حذف"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {filteredTasks.length === 0 && <div className="py-12 text-center text-xs text-slate-500">لا توجد مهام تطابق التصفية.</div>}
        </>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form onSubmit={createTask} className="w-full max-w-lg rounded-2xl bg-slate-950 border border-white/10 p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">إضافة مهمة مسجلة</h2>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="عنوان المهمة" className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" autoFocus />
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="الوصف أو النتيجة المطلوبة" className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white min-h-24" />
            <select value={projectId} onChange={e => setProjectId(e.target.value as ProjectId)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
              {projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
            <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
              <option value="">غير مسند</option>
              {employees.map(employee => <option key={employee.id} value={employee.id}>{employee.name} — {employee.position}</option>)}
            </select>
            <div className="text-xs text-slate-500">ستُنشأ المهمة بحالة «بانتظار البدء» وتقدم 0%. لا تعتبر مكتملة بدون نتيجة فعلية.</div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-xs text-slate-400">إلغاء</button>
              <button type="submit" disabled={!title.trim()} className="px-4 py-2 rounded-xl bg-cyan-500 disabled:opacity-50 text-slate-950 text-xs font-bold">حفظ المهمة</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
