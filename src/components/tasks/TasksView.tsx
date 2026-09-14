import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Filter, 
  Search, 
  Bot, 
  ArrowUpRight, 
  Trash2, 
  Check, 
  Layers, 
  Sparkles,
  Zap,
  FolderKanban,
  X,
  ListTodo
} from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { ProjectTask, ProjectId } from '../../types';
import { ExecutionPlansList } from '../plans/ExecutionPlansList';

export const TasksView: React.FC = () => {
  const { 
    tasks, 
    projects, 
    employees, 
    updateTaskStatus, 
    addNewTask, 
    deleteTask,
    setSelectedEmployee
  } = useCompany();

  const [activeSubView, setActiveSubView] = useState<'plans' | 'tasks'>('plans');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskAssigneeId, setNewTaskAssigneeId] = useState(employees[0]?.id || 'fahad');
  const [newTaskProjectId, setNewTaskProjectId] = useState<ProjectId>('qaddha');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('high');

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      task.assigneeName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesProject = selectedProjectFilter === 'all' || task.projectId === selectedProjectFilter;
    const matchesStatus = selectedStatusFilter === 'all' || task.status === selectedStatusFilter;

    return matchesSearch && matchesProject && matchesStatus;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const assignedEmp = employees.find(e => e.id === newTaskAssigneeId);

    addNewTask({
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || 'مهمة استراتيجية جديدة موجهة من الرئيس التنفيذي نواف',
      assigneeId: newTaskAssigneeId,
      assigneeName: assignedEmp ? assignedEmp.name : 'فهد',
      assigneeAvatar: assignedEmp ? assignedEmp.avatar : '⚡',
      projectId: newTaskProjectId,
      status: 'in_progress',
      priority: 'عالي',
      department: assignedEmp ? assignedEmp.departmentName : 'الهندسة والتطوير',
      progress: 20
    });

    setNewTaskTitle('');
    setNewTaskDesc('');
    setIsAddModalOpen(false);
  };

  const getStatusBadge = (status: ProjectTask['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>مكتملة ومُعتمدة</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            <Clock className="w-3 h-3 animate-spin" />
            <span>قيد العمل النشط</span>
          </span>
        );
      case 'needs_ceo':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <AlertCircle className="w-3 h-3" />
            <span>بانتظار مراجعة نواف</span>
          </span>
        );
      case 'reviewing':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <Sparkles className="w-3 h-3" />
            <span>تدقيق ومراجعة الجودة</span>
          </span>
        );
      default:
        return (
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
            قيد الانتظار
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span>مركز المهام والعمليات التنفيذية</span>
            <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
              {tasks.length} مهام
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            متابعة دقيقة لكل مخرجات ومسؤوليات وكلاء الذكاء الاصطناعي مع التزام صفرية التكلفة $0.00.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مهمة جديدة</span>
        </button>
      </div>

      {/* Sub-view Switcher: Plans vs Tasks */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] w-fit">
        <button
          onClick={() => setActiveSubView('plans')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubView === 'plans'
              ? 'bg-[var(--accent-primary)] text-white shadow-md'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>الخطط التنفيذية الشاملة</span>
        </button>

        <button
          onClick={() => setActiveSubView('tasks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubView === 'tasks'
              ? 'bg-[var(--accent-primary)] text-white shadow-md'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          <span>قائمة المهام والعمليات</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-black/20">
            {tasks.length}
          </span>
        </button>
      </div>

      {activeSubView === 'plans' ? (
        <ExecutionPlansList />
      ) : (
        <>
          {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-white/5 backdrop-blur-md">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث في المهام، المسؤولين، أو المخرجات..."
            className="w-full bg-slate-950/60 border border-white/5 focus:border-cyan-500/40 rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Project Filter */}
          <select
            value={selectedProjectFilter}
            onChange={e => setSelectedProjectFilter(e.target.value)}
            className="bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">جميع المشاريع</option>
            <option value="qaddha">لعبة قدّها</option>
            <option value="mueen">تطبيق مُعِين</option>
            <option value="hq">نظام NAWAF HQ</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={e => setSelectedStatusFilter(e.target.value)}
            className="bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">جميع الحالات</option>
            <option value="in_progress">قيد العمل النشط</option>
            <option value="waiting_approval">بانتظار اعتماد نواف</option>
            <option value="completed">مكتملة</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs">
            لا توجد مهام تطابق خيارات التصفية الحالية.
          </div>
        ) : (
          filteredTasks.map((task, idx) => {
            const project = projects.find(p => p.id === task.projectId);
            const employee = employees.find(e => e.id === task.assigneeId);

            return (
              <div 
                key={`${task.id || 'task'}-${idx}`}
                className="p-5 rounded-2xl bg-[#0b101e] border border-white/5 hover:border-cyan-500/30 transition-all group flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Card Header: Project tag + Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-white/5">
                      {project ? project.name : task.projectId}
                    </span>
                    {getStatusBadge(task.status)}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>
                  )}

                  {/* Deliverable/Result Preview if present */}
                  {task.result && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-white/5 text-[11px] text-emerald-300/90 leading-relaxed font-mono">
                      <span className="font-bold text-slate-400 block mb-1">المخرجات المعتمدة:</span>
                      {task.result}
                    </div>
                  )}
                </div>

                <div>
                  {/* Progress Bar */}
                  <div className="space-y-1 mb-4">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>نسبة الإنجاز</span>
                      <span className="font-mono text-cyan-300 font-bold">{task.progress || 0}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          task.status === 'completed' 
                            ? 'bg-emerald-500' 
                            : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                        }`}
                        style={{ width: `${task.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Assignee & Action Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    {/* Assignee clickable */}
                    <button
                      type="button"
                      onClick={() => employee && setSelectedEmployee(employee)}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity text-right"
                    >
                      <span className="text-base">{task.assigneeAvatar}</span>
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">{task.assigneeName}</span>
                        <span className="text-[10px] text-slate-500">مسؤول التنفيذ</span>
                      </div>
                    </button>

                    {/* Operational Actions */}
                    <div className="flex items-center gap-1.5">
                      {task.status !== 'completed' && (
                        <button
                          type="button"
                          onClick={() => updateTaskStatus(task.id, 'completed', 'تم استيفاء معايير الجودة وإنجاز التسليم بنجاح')}
                          className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all"
                          title="اعتماد وإكمال المهمة فورياً"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {task.status === 'completed' && (
                        <button
                          type="button"
                          onClick={() => updateTaskStatus(task.id, 'in_progress')}
                          className="px-2 py-1 rounded-lg text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10"
                          title="إعادة فتح المهمة"
                        >
                          إعادة فتح
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                        title="حذف المهمة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      </>
      )}

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0a0f1d] border border-cyan-500/30 p-6 sm:p-8 shadow-2xl text-right">
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                <span>إسناد مهمة جديدة لفريق AI</span>
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1.5">
                  عنوان المهمة
                </label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  placeholder="مثال: تحسين خوارزمية توزيع الأسئلة في قدّها"
                  className="w-full bg-slate-950 border border-white/10 focus:border-cyan-500/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1.5">
                  تفاصيل ومتطلبات المهمة
                </label>
                <textarea
                  rows={3}
                  value={newTaskDesc}
                  onChange={e => setNewTaskDesc(e.target.value)}
                  placeholder="حدد النتيجة المتوقعة وملاحظات التنفيذ بدقة..."
                  className="w-full bg-slate-950 border border-white/10 focus:border-cyan-500/50 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1.5">
                    مسؤول التنفيذ
                  </label>
                  <select
                    value={newTaskAssigneeId}
                    onChange={e => setNewTaskAssigneeId(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.position})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1.5">
                    المشروع التابع له
                  </label>
                  <select
                    value={newTaskProjectId}
                    onChange={e => setNewTaskProjectId(e.target.value as ProjectId)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-900 border border-white/10"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20"
                >
                  تأكيد الإسناد
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
