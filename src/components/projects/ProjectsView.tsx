import React, { useMemo, useState } from 'react';
import { FolderKanban, ShieldCheck, CheckCircle2, AlertCircle, Clock, Moon, Gamepad2, Users } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { ProjectId } from '../../types';

const taskStatusLabel: Record<string, string> = {
  pending: 'بانتظار البدء',
  in_progress: 'قيد التنفيذ',
  completed: 'مكتملة',
  needs_ceo: 'تحتاج قرار نواف',
  reviewing: 'قيد المراجعة',
  blocked: 'متوقفة',
};

export const ProjectsView: React.FC = () => {
  const { projects, employees, setSelectedProject, setSelectedEmployee } = useCompany();
  const [activeProjectId, setActiveProjectId] = useState<ProjectId>(projects[0]?.id || 'hq');

  const currentProject = useMemo(
    () => projects.find(project => project.id === activeProjectId) || projects[0],
    [projects, activeProjectId],
  );

  if (!currentProject) {
    return <div className="py-16 text-center text-slate-500">لا توجد مشاريع مسجلة حالياً.</div>;
  }

  const assignedEmployees = employees.filter(emp => currentProject.assignedEmployees.includes(emp.id));
  const completed = currentProject.tasks.filter(task => task.status === 'completed').length;
  const blocked = currentProject.tasks.filter(task => task.status === 'blocked').length;
  const waiting = currentProject.tasks.filter(task => task.status === 'needs_ceo').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-cyan-400" />
            <span>مشاريع الشركة</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">التقدم والمهام المعروضة هنا مأخوذة من الحالة المسجلة فقط.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {projects.map(project => {
            const selected = project.id === currentProject.id;
            return (
              <button
                key={project.id}
                onClick={() => setActiveProjectId(project.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${selected ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'}`}
              >
                {project.id === 'mueen' ? <Moon className="w-4 h-4" /> : <Gamepad2 className="w-4 h-4" />}
                <span>{project.name}</span>
                <span className="font-mono text-[11px]">{project.progress}%</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl glass-panel p-6 border border-white/10 relative overflow-hidden">
        {currentProject.isSensitiveReligiousContent && (
          <div className="mb-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 p-3.5 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs text-cyan-100/90 leading-relaxed">
              <strong className="text-cyan-200">محتوى ديني حساس: </strong>
              أي تعديل أو نشر لمحتوى شرعي يحتاج مراجعة واعتماد مناسبين، ولا يعتبر صحيحاً لمجرد أن وكيل AI أنشأه.
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-2xl font-black text-white">{currentProject.name}</h3>
              <span className="text-xs font-mono text-slate-400 px-2 py-0.5 bg-slate-900 rounded-md border border-white/5">{currentProject.nameEn}</span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-white/10">الحالة المسجلة: {currentProject.health}</span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-1">{currentProject.tagline}</p>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-2xl">{currentProject.description}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 shrink-0 min-w-40">
            <div className="text-3xl font-extrabold text-white font-mono">{currentProject.progress}%</div>
            <div className="text-[10px] text-slate-400">تقدم مشتق من المهام</div>
            <div className="text-[11px] text-cyan-300 mt-1">المدير: {currentProject.projectManagerName}</div>
          </div>
        </div>

        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5 my-4">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500" style={{ width: `${Math.max(0, Math.min(100, currentProject.progress))}%` }} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
          <div className="rounded-xl bg-slate-900/50 p-3 border border-white/5"><div className="font-mono text-lg text-white">{currentProject.tasks.length}</div><div className="text-[10px] text-slate-400">مهام مسجلة</div></div>
          <div className="rounded-xl bg-slate-900/50 p-3 border border-white/5"><div className="font-mono text-lg text-emerald-300">{completed}</div><div className="text-[10px] text-slate-400">مكتملة</div></div>
          <div className="rounded-xl bg-slate-900/50 p-3 border border-white/5"><div className="font-mono text-lg text-amber-300">{blocked}</div><div className="text-[10px] text-slate-400">متوقفة</div></div>
          <div className="rounded-xl bg-slate-900/50 p-3 border border-white/5"><div className="font-mono text-lg text-rose-300">{waiting}</div><div className="text-[10px] text-slate-400">تحتاج قرارك</div></div>
          <div className="rounded-xl bg-slate-900/50 p-3 border border-white/5 col-span-2 sm:col-span-1"><div className="font-mono text-lg text-cyan-300">{assignedEmployees.length}</div><div className="text-[10px] text-slate-400">موظفون مسندون</div></div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 text-xs text-slate-400">
          المرحلة الحالية: <span className="text-slate-200">{currentProject.currentPhase || 'غير محددة'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl glass-panel p-5 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">مهام المشروع</h3>
          </div>

          {currentProject.tasks.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">لا توجد مهام موثقة لهذا المشروع حالياً.</div>
          ) : (
            <div className="space-y-2.5">
              {currentProject.tasks.map(task => (
                <div key={task.id} className="p-3 rounded-xl bg-slate-900/50 border border-white/5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-semibold text-white">{task.title}</div>
                      <div className="text-[10px] text-slate-400 mt-1">المسؤول: {task.assigneeName} · القسم: {task.department}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">{taskStatusLabel[task.status] || task.status}</span>
                      {typeof task.progress === 'number' && <span className="text-[10px] font-mono text-cyan-300">{task.progress}%</span>}
                    </div>
                  </div>
                  {task.result && <div className="mt-2 text-[11px] text-emerald-200 bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-2">النتيجة: {task.result}</div>}
                  {task.blockerReason && <div className="mt-2 text-[11px] text-amber-200 bg-amber-950/20 border border-amber-500/20 rounded-lg p-2">العائق: {task.blockerReason}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl glass-panel p-5 border border-white/10">
          <div className="flex items-center gap-2 mb-4"><Users className="w-4 h-4 text-purple-400" /><h3 className="text-sm font-bold text-white">الفريق المسند</h3></div>
          {assignedEmployees.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">لا يوجد موظفون مسندون.</div>
          ) : assignedEmployees.map(emp => (
            <button key={emp.id} onClick={() => setSelectedEmployee(emp)} className="w-full p-3 mb-2 rounded-xl bg-slate-900/50 border border-white/5 hover:border-cyan-500/30 text-right">
              <div className="flex items-center gap-2"><span className="text-lg">{emp.avatar}</span><div><div className="text-xs font-bold text-white">{emp.name}</div><div className="text-[10px] text-slate-400">{emp.position}</div></div></div>
              <div className="mt-2 text-[10px] text-slate-500">الحالة: {emp.status}</div>
            </button>
          ))}
          {(blocked > 0 || waiting > 0) && (
            <div className="mt-3 p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-[11px] text-amber-200 flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>يوجد عمل يحتاج معالجة أو قراراً قبل اعتباره مكتملًا.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
