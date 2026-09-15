import React, { useMemo, useState } from 'react';
import {
  X,
  Building2,
  FolderKanban,
  Send,
  Edit3,
  ShieldCheck,
  Terminal,
  Bot,
  Wrench,
  CheckCircle2,
  AlertCircle,
  FileText,
  Activity,
} from 'lucide-react';
import { Employee, EmployeeStatus, ProjectId } from '../../types';
import { useCompany } from '../../context/CompanyContext';
import { EmployeeFormModal } from './EmployeeFormModal';
import { generateCrewAgentResponseAsync } from '../../services/crewai/dialogueEngine';

interface EmployeeModalProps {
  employee: Employee | null;
  onClose: () => void;
}

type ChatMessage = {
  sender: 'nawaf' | 'agent';
  text: string;
  time: string;
};

const now = () => new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

export const EmployeeModal: React.FC<EmployeeModalProps> = ({ employee, onClose }) => {
  const {
    updateEmployeeStatus,
    requestCEOApproval,
    projects,
    plans,
    decisions,
    employees,
    isCompanyOperating,
    runOpenHandsAudit,
  } = useCompany();

  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'overview' | 'results' | 'governance'>('chat');
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [runtimeNote, setRuntimeNote] = useState<string | null>(null);

  const matchedProject = useMemo(() => {
    if (!employee) return undefined;
    return projects.find(p => p.id === employee.assignedProject || p.id === employee.projectId);
  }, [employee, projects]);

  const activePlan = useMemo(() => {
    if (!employee) return undefined;
    return plans.find(p =>
      (p.status === 'IN_PROGRESS' || p.status === 'APPROVED') &&
      (!matchedProject || p.projectId === matchedProject.id)
    );
  }, [employee, matchedProject, plans]);

  if (!employee) return null;

  const sendMessage = async (text: string) => {
    const userText = text.trim();
    if (!userText || isAgentTyping) return;

    setChatMessages(prev => [...prev, { sender: 'nawaf', text: userText, time: now() }]);
    setChatInput('');
    setIsAgentTyping(true);

    try {
      const result = await generateCrewAgentResponseAsync({
        employee,
        project: matchedProject,
        activePlan,
        userQuery: userText,
        isCompanyOperating,
        companyState: {
          activePlansCount: plans.filter(p => p.status === 'IN_PROGRESS' || p.status === 'APPROVED').length,
          pendingApprovalsCount: decisions.filter(d => d.status === 'waiting').length,
          totalEmployees: employees.length,
        },
        onTriggerApproval: params => requestCEOApproval({
          title: params.title,
          description: params.description,
          projectId: params.projectId as ProjectId,
          requestedBy: `${employee.name} (${employee.position})`,
        }),
      });

      setChatMessages(prev => [...prev, { sender: 'agent', text: result.text, time: now() }]);
    } catch (err: any) {
      setChatMessages(prev => [...prev, {
        sender: 'agent',
        text: `تعذر تنفيذ الطلب: ${err?.message || 'خطأ غير متوقع'}`,
        time: now(),
      }]);
    } finally {
      setIsAgentTyping(false);
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(chatInput);
  };

  const setStatus = (status: EmployeeStatus) => updateEmployeeStatus(employee.id, status);
  const robotColor = employee.robotColor || '#06b6d4';
  const taskProgress = typeof employee.taskProgress === 'number' ? employee.taskProgress : null;
  const currentTask = employee.currentTask?.trim() || '';
  const permissions = employee.permissions || [];
  const tools = employee.tools || [];
  const verifiedResults = [employee.lastResult, ...(employee.recentWork || [])].filter(Boolean) as string[];

  const runTechnicalAudit = async () => {
    if (!employee.openHandsEnabled) {
      setRuntimeNote('هذا الموظف ما عنده صلاحية OpenHands مسجلة.');
      return;
    }
    setRuntimeNote('جاري طلب فحص تقني حقيقي...');
    try {
      const result: any = await runOpenHandsAudit(employee.id, employee.assignedProject || 'hq', 'فحص تقني حقيقي من مساحة الموظف');
      const ok = result?.ok ?? result?.success;
      setRuntimeNote(ok
        ? 'رجع محرك التنفيذ بنتيجة حقيقية. افتح نتيجة OpenHands/المخرجات لمراجعة التفاصيل.'
        : `الفحص لم ينجح: ${result?.error || 'لم يرجع المحرك نتيجة ناجحة.'}`
      );
    } catch (error: any) {
      setRuntimeNote(`تعذر تشغيل الفحص: ${error?.message || 'خطأ غير معروف'}`);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel p-6 sm:p-8 border border-white/10 shadow-2xl text-right">
          <div className="absolute top-5 left-5 flex items-center gap-2">
            <button
              onClick={() => setIsEditFormOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/30 flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              تعديل الموظف
            </button>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 border border-white/5">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 pl-28">
            <div
              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 flex items-center justify-center text-4xl sm:text-5xl shrink-0"
              style={{ borderColor: robotColor, backgroundColor: `${robotColor}20`, boxShadow: `0 0 30px ${robotColor}25` }}
            >
              {employee.avatar}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-black text-white">{employee.name}</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/10 text-slate-300">
                  {employee.status}
                </span>
              </div>
              <p className="text-sm text-slate-300 font-semibold">{employee.position}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{employee.departmentName}</span>
                <span className="flex items-center gap-1"><FolderKanban className="w-3.5 h-3.5" />{matchedProject?.name || 'لا يوجد مشروع مرتبط'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-3 overflow-x-auto">
            {([
              ['chat', 'الدردشة والتنفيذ'],
              ['overview', 'الحالة والمهام'],
              ['results', 'النتائج الموثقة'],
              ['governance', 'الصلاحيات والأدوات'],
            ] as const).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setActiveSubTab(id)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl shrink-0 ${activeSubTab === id ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-white'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {activeSubTab === 'chat' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                <button onClick={() => void sendMessage('وش وضع مهمتك الحالية؟')} className="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-300 border border-white/10 text-xs font-bold shrink-0">
                  وش وضع مهمتك؟
                </button>
                <button onClick={() => void sendMessage('راجع المشروع الحالي وقل لي وش يحتاج فعلياً.')} className="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-300 border border-white/10 text-xs font-bold shrink-0">
                  مراجعة المشروع عبر CrewAI
                </button>
                <button onClick={() => void sendMessage('فحص المستودع')} className="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-300 border border-white/10 text-xs font-bold shrink-0">
                  فحص المستودع
                </button>
              </div>

              <div className="h-72 overflow-y-auto space-y-3 p-4 rounded-2xl bg-slate-950/80 border border-white/5">
                {chatMessages.length === 0 && (
                  <div className="h-full flex items-center justify-center text-center">
                    <div>
                      <Bot className="w-7 h-7 text-cyan-400 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">اسأل {employee.name} أو أعطه أمراً. الرد يعتمد على حالته وأدواته والنتائج الفعلية فقط.</p>
                    </div>
                  </div>
                )}
                {chatMessages.map((msg, idx) => {
                  const isNawaf = msg.sender === 'nawaf';
                  return (
                    <div key={idx} className={`flex gap-2.5 max-w-[90%] ${isNawaf ? 'mr-auto flex-row-reverse text-left' : 'ml-auto text-right'}`}>
                      <div className="w-7 h-7 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-sm shrink-0">
                        {isNawaf ? '👑' : employee.avatar}
                      </div>
                      <div>
                        <div className={`text-[10px] text-slate-500 mb-0.5 ${isNawaf ? 'text-left' : 'text-right'}`}>
                          {isNawaf ? 'نواف' : employee.name} • {msg.time}
                        </div>
                        <div className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${isNawaf ? 'bg-amber-500/20 text-amber-100 border border-amber-500/30' : 'bg-slate-900 text-slate-200 border border-white/10'}`}>
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {isAgentTyping && <div className="text-xs text-cyan-300">جاري التحقق/التنفيذ...</div>}
              </div>

              <form onSubmit={handleSendChat} className="flex items-center gap-2">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder={`اسأل ${employee.name} أو أعطه أمراً حقيقياً...`}
                  className="flex-1 bg-slate-950 border border-white/10 focus:border-amber-500/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isAgentTyping}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 bg-amber-500 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950"
                >
                  إرسال <Send className="w-3.5 h-3.5 rotate-180" />
                </button>
              </form>
            </div>
          )}

          {activeSubTab === 'overview' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                <div className="text-xs font-bold text-slate-300 mb-2">الحالة التشغيلية المسجلة</div>
                <div className="flex flex-wrap gap-2">
                  {(['READY', 'WORKING', 'REVIEWING', 'WAITING_FOR_NAWAF', 'BLOCKED'] as EmployeeStatus[]).map(status => (
                    <button key={status} onClick={() => setStatus(status)} className={`px-3 py-1 rounded-xl text-xs ${employee.status === status ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 mb-2"><Activity className="w-4 h-4" />المهمة الحالية</div>
                <p className="text-sm text-white">{currentTask || 'لا توجد مهمة مسجلة حالياً.'}</p>
                <p className="text-xs text-slate-400 mt-2">التقدم: {taskProgress === null ? 'غير مسجل' : `${taskProgress}%`}</p>
                {taskProgress !== null && (
                  <div className="w-full bg-slate-950 rounded-full h-2 mt-2 overflow-hidden border border-white/10">
                    <div className="h-full bg-cyan-500" style={{ width: `${Math.max(0, Math.min(100, taskProgress))}%` }} />
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                <div className="text-xs font-bold text-slate-300 mb-2">الخطة المرتبطة</div>
                {activePlan ? (
                  <div className="text-xs text-slate-300">
                    <div className="font-bold text-white">{activePlan.title}</div>
                    <div className="mt-1">الحالة: {activePlan.status}</div>
                    <div>الخطوات: {activePlan.steps.length} — المكتمل فعلياً: {activePlan.steps.filter(s => s.status === 'COMPLETED').length}</div>
                  </div>
                ) : <p className="text-xs text-slate-500">لا توجد خطة معتمدة/جارية مرتبطة بالمشروع.</p>}
              </div>
            </div>
          )}

          {activeSubTab === 'results' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 mb-3"><FileText className="w-4 h-4" />نتائج محفوظة</div>
                {verifiedResults.length ? (
                  <div className="space-y-2">
                    {verifiedResults.map((result, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-white/5 text-xs text-slate-300 whitespace-pre-wrap">{result}</div>
                    ))}
                  </div>
                ) : <p className="text-xs text-slate-500">لا توجد نتائج موثقة لهذا الموظف حتى الآن.</p>}
              </div>
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200">
                لا يتم عرض سلسلة تفكير داخلية أو مخرجات تجريبية. هذه الصفحة تعرض فقط النتائج المحفوظة في حالة النظام.
              </div>
            </div>
          )}

          {activeSubTab === 'governance' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 mb-3"><ShieldCheck className="w-4 h-4" />الصلاحيات</div>
                {permissions.length ? permissions.map((perm, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 mb-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />{perm}</div>
                )) : <p className="text-xs text-slate-500">لا توجد صلاحيات خاصة مسجلة.</p>}
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-3"><Wrench className="w-4 h-4" />الأدوات المسجلة</div>
                <div className="flex flex-wrap gap-2">
                  {tools.length ? tools.map((tool, idx) => <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-950 border border-white/10 text-[11px] font-mono text-slate-300">{tool}</span>) : <span className="text-xs text-slate-500">لا توجد أدوات مسجلة.</span>}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-300"><Terminal className="w-4 h-4" />OpenHands</div>
                    <p className="text-[11px] text-slate-400 mt-1">تشغيل فحص تقني حقيقي فقط إذا كانت الصلاحية مفعلة والمحرك متصل.</p>
                  </div>
                  <button
                    onClick={() => void runTechnicalAudit()}
                    disabled={!employee.openHandsEnabled}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/20 disabled:bg-slate-800 disabled:text-slate-500 text-cyan-300 border border-cyan-500/30 text-xs font-bold"
                  >
                    تشغيل فحص حقيقي
                  </button>
                </div>
                {runtimeNote && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-white/5 text-xs text-slate-300 flex gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>{runtimeNote}</span>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 text-xs text-rose-200">
                حظر ثابت: لا شراء، لا خدمة مدفوعة، لا التزام مالي، ولا نشر تغيير حساس بدون موافقة نواف.
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-mono">
            <span>Role: <strong className="text-cyan-400">{employee.systemRole}</strong></span>
            <span>ID: {employee.id}</span>
          </div>
        </div>
      </div>

      <EmployeeFormModal
        isOpen={isEditFormOpen}
        onClose={() => setIsEditFormOpen(false)}
        employeeToEdit={employee}
      />
    </>
  );
};
