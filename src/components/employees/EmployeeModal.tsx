import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  Building2, 
  FolderKanban, 
  Activity, 
  Cpu, 
  Award,
  ArrowRight,
  Send,
  Edit3,
  Brain,
  ShieldCheck,
  FileCode2,
  Terminal,
  Bot,
  Wrench
} from 'lucide-react';
import { Employee, EmployeeStatus, ProjectId } from '../../types';
import { useCompany } from '../../context/CompanyContext';
import { EmployeeFormModal } from './EmployeeFormModal';
import { generateCrewAgentResponseAsync } from '../../services/crewai/dialogueEngine';

interface EmployeeModalProps {
  employee: Employee | null;
  onClose: () => void;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({ employee, onClose }) => {
  const { 
    updateEmployeeStatus, 
    triggerSimulatedCollaboration, 
    startMeeting,
    runOpenHandsAudit,
    openOpenHandsTerminal,
    requestCEOApproval,
    projects,
    plans,
    isCompanyOperating
  } = useCompany();
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'overview' | 'intelligence' | 'governance'>('chat');
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'nawaf' | 'agent'; text: string; time: string }>>([
    {
      sender: 'agent',
      text: `أهلاً يا أستاذ نواف. أنا على رأس العمل في «${employee?.currentTask || 'تنفيذ المهام'}». كيف أستطيع خدمتك أو تقديم تقرير تفصيلي؟`,
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAgentTyping, setIsAgentTyping] = useState(false);

  if (!employee) return null;

  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isAgentTyping) return;

    const userText = chatInput.trim();
    const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

    setChatMessages(prev => [...prev, { sender: 'nawaf', text: userText, time: timeStr }]);
    setChatInput('');
    setIsAgentTyping(true);

    try {
      const matchedProject = projects.find(p => p.id === employee.assignedProject || p.id === employee.projectId);
      const activePlan = plans.find(p => p.status === 'IN_PROGRESS');

      const result = await generateCrewAgentResponseAsync({
        employee,
        project: matchedProject,
        activePlan,
        userQuery: userText,
        isCompanyOperating,
        onTriggerApproval: (params) => {
          return requestCEOApproval({
            title: params.title,
            description: params.description,
            projectId: params.projectId as ProjectId,
            requestedBy: `${employee.name} (${employee.position})`
          });
        }
      });

      if (userText.includes('اجتماع')) {
        handleStatusChange('MEETING');
      } else if (userText.includes('استراحة') || userText.includes('وقف')) {
        handleStatusChange('متوقف مؤقتًا');
      }

      setChatMessages(prev => [...prev, {
        sender: 'agent',
        text: result.text,
        time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err: any) {
      setChatMessages(prev => [...prev, {
        sender: 'agent',
        text: `حدث خطأ أثناء معالجة الطلب: ${err.message || 'خطأ غير متوقع'}`,
        time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsAgentTyping(false);
    }
  };

  const statuses: EmployeeStatus[] = [
    'يعمل الآن',
    'يبحث',
    'يحلل',
    'يصمم',
    'يطور',
    'ينتظر قرارك',
    'متوقف مؤقتًا'
  ];

  const handleStatusChange = (newStatus: EmployeeStatus) => {
    updateEmployeeStatus(employee.id, newStatus);
    triggerSimulatedCollaboration();
  };

  const robotColor = employee.robotColor || '#06b6d4';

  // Realistic mock thoughts representing this agent's autonomous thinking
  const agentThoughts = [
    `تحليل سياق المهمة: «${employee.currentTask}» والتأكد من توافقها التام مع القانون رقم 1.`,
    `التنسيق السلس مع موظفي الأقسام ذات الصلة لضمان عدم ازدواجية العمل.`,
    `فحص المخرجات الحالية بنسبة دقة ${employee.productivity}% قبل تقديم مسودة التقرير النهائي.`
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
        <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel p-6 sm:p-8 border border-white/10 shadow-2xl text-right">
          
          {/* Top Controls: Close & Edit */}
          <div className="absolute top-5 left-5 flex items-center gap-2">
            <button
              onClick={() => setIsEditFormOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/30 transition-all flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>تعديل الموظف</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 border border-white/5 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div 
              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 flex items-center justify-center text-4xl sm:text-5xl shadow-lg shrink-0 transition-all"
              style={{ 
                borderColor: robotColor,
                backgroundColor: `${robotColor}20`,
                boxShadow: `0 0 30px ${robotColor}35`
              }}
            >
              {employee.avatar}
              <span 
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-950"
                style={{ backgroundColor: robotColor }}
              ></span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-black text-white">{employee.name}</h2>
                <span 
                  className="text-xs font-mono px-2.5 py-0.5 rounded-full border"
                  style={{ 
                    borderColor: `${robotColor}50`, 
                    backgroundColor: `${robotColor}15`,
                    color: robotColor 
                  }}
                >
                  Autonomous AI Agent
                </span>
              </div>
              <p className="text-sm text-slate-300 font-semibold">{employee.position}</p>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{employee.departmentName}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <FolderKanban className="w-3.5 h-3.5 text-purple-400" />
                  <span>مشروع: {employee.assignedProject === 'mueen' ? 'مُعين' : employee.assignedProject === 'qaddha' ? 'قدّها' : 'HQ العام'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-3 overflow-x-auto">
            <button
              onClick={() => setActiveSubTab('chat')}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                activeSubTab === 'chat'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>💬</span>
              <span>التوجيه والدردشة المباشرة</span>
            </button>
            <button
              onClick={() => setActiveSubTab('overview')}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all shrink-0 ${
                activeSubTab === 'overview'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              الملف العام والمهام
            </button>
            <button
              onClick={() => setActiveSubTab('intelligence')}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all shrink-0 ${
                activeSubTab === 'intelligence'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              سلسلة التفكير والمخرجات
            </button>
            <button
              onClick={() => setActiveSubTab('governance')}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all shrink-0 ${
                activeSubTab === 'governance'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              الصلاحيات والتوجيهات
            </button>
          </div>

          {/* TAB 0: LIVE CHAT & DIRECT COMMAND */}
          {activeSubTab === 'chat' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Quick Actions Strip */}
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                <button
                  type="button"
                  onClick={() => {
                    handleStatusChange('MEETING');
                    setChatMessages(prev => [...prev, {
                      sender: 'nawaf',
                      text: 'توجه إلى قاعة الاجتماعات الكبرى فوراً.',
                      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
                    }, {
                      sender: 'agent',
                      text: 'أمرك يا أستاذ نواف! أنا في طريقي لقاعة الاجتماعات الآن.',
                      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
                    }]);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all shrink-0"
                >
                  استدعاء إلى قاعة الاجتماعات
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleStatusChange('يعمل الآن');
                    setChatMessages(prev => [...prev, {
                      sender: 'nawaf',
                      text: 'أعطني تقريراً موجزاً عن آخر التطورات.',
                      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
                    }, {
                      sender: 'agent',
                      text: `المهمة الحالية: «${employee.currentTask}» بنسبة إنجاز ${employee.taskProgress || 70}%. لا توجد أي عوائق تشغيلية والتكلفة 0.00$.`,
                      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
                    }]);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 text-xs font-bold transition-all shrink-0"
                >
                  طلب تقرير موجز
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleStatusChange(employee.status === 'متوقف مؤقتًا' ? 'يعمل الآن' : 'متوقف مؤقتًا');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 text-xs font-bold transition-all shrink-0"
                >
                  {employee.status === 'متوقف مؤقتًا' ? 'استئناف العمل' : 'إيقاف مؤقت'}
                </button>
              </div>

              {/* Chat Messages Container */}
              <div className="h-64 overflow-y-auto space-y-3 p-4 rounded-2xl bg-slate-950/80 border border-white/5">
                {chatMessages.map((msg, idx) => {
                  const isNawaf = msg.sender === 'nawaf';
                  return (
                    <div 
                      key={idx}
                      className={`flex gap-2.5 max-w-[85%] ${isNawaf ? 'mr-auto flex-row-reverse text-left' : 'ml-auto text-right'}`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-sm shrink-0">
                        {isNawaf ? '👑' : employee.avatar}
                      </div>
                      <div>
                        <div className={`text-[10px] text-slate-400 mb-0.5 ${isNawaf ? 'text-left' : 'text-right'}`}>
                          <span className="font-bold text-white">{isNawaf ? 'نواف' : employee.name}</span> • <span className="font-mono">{msg.time}</span>
                        </div>
                        <div 
                          className={`p-3 rounded-2xl text-xs leading-relaxed ${
                            isNawaf 
                              ? 'bg-amber-500/20 text-amber-100 border border-amber-500/30' 
                              : 'bg-slate-900 text-slate-200 border border-white/10'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isAgentTyping && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 mr-8">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></span>
                    <span>{employee.name} يكتب الرد...</span>
                  </div>
                )}
              </div>

              {/* Chat Input Form */}
              <form onSubmit={handleSendChat} className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder={`وجّه رسالة أو سؤالاً مباشراً إلى ${employee.name}...`}
                  className="flex-1 bg-slate-950 border border-white/10 focus:border-amber-500/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isAgentTyping}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                    !chatInput.trim() || isAgentTyping
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                  }`}
                >
                  <span>إرسال</span>
                  <Send className="w-3.5 h-3.5 rotate-180" />
                </button>
              </form>

            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeSubTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Current Status Selector */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  الحالة الحالية لموظف AI (اضغط للتعديل اللحظي):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {statuses.map(st => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(st)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        employee.status === st
                          ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                          : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Active Task & Progress */}
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 animate-pulse" />
                    <span>المهمة قيد التنفيذ حالياً:</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-cyan-300">
                    {employee.taskProgress ?? 50}%
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-medium mb-3">
                  {employee.currentTask}
                </p>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/10">
                  <div 
                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-cyan-500 to-indigo-500"
                    style={{ width: `${employee.taskProgress ?? 50}%` }}
                  ></div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5 text-center">
                  <div className="text-xl font-black text-emerald-400 font-mono">{employee.productivity}%</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">معدل الإنتاجية</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5 text-center">
                  <div className="text-xl font-black text-white font-mono">{employee.tasksCompletedCount}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">مهام مكتملة</div>
                </div>
                <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-slate-900/40 border border-white/5 text-center">
                  <div className="text-xl font-black text-purple-400 font-mono">{employee.skills.length}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">مهارات برمجية/تخصصية</div>
                </div>
              </div>

              {/* Skills Tags */}
              <div>
                <div className="text-xs font-bold text-slate-300 mb-2">المهارات والقدرات المكتسبة:</div>
                <div className="flex flex-wrap gap-1.5">
                  {employee.skills.map((skill, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-medium text-cyan-300 bg-cyan-950/50 border border-cyan-500/20">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recent Work Completed */}
              <div>
                <div className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>أحدث المهام المنجزة مؤخراً:</span>
                </div>
                <div className="space-y-1.5">
                  {employee.recentWork.map((work, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-900/40 border border-white/5 text-xs text-slate-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                      <span>{work}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Collaboration History */}
              <div>
                <div className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>سجل التعاون التلقائي مع الزملاء:</span>
                </div>
                <div className="space-y-1.5">
                  {employee.collaborationHistory.map((collab, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/40 border border-white/5 text-xs">
                      <div className="text-slate-300">
                        تعاون مع <strong className="text-white">{collab.withEmployee}</strong>: {collab.action}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0 mr-2">{collab.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: THOUGHTS & OUTPUTS */}
          {activeSubTab === 'intelligence' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Agent Chain of Thought */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                <div className="flex items-center gap-2 mb-3 text-xs font-bold text-purple-300">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span>سلسلة التفكير اللحظي (Agent Thought Stream):</span>
                </div>
                <div className="space-y-2">
                  {agentThoughts.map((thought, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200 font-mono flex items-start gap-2">
                      <span className="text-purple-400 font-bold mt-0.5">›</span>
                      <span>{thought}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Outputs Generated */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                <div className="flex items-center gap-2 mb-3 text-xs font-bold text-cyan-300">
                  <FileCode2 className="w-4 h-4 text-cyan-400" />
                  <span>المخرجات المعتمدة مؤخراً (Outputs & Artifacts):</span>
                </div>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5 text-xs">
                    <div className="font-bold text-white mb-1">مسودة تحليل وتنسيق المهام</div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      تم تسليم النسخة التجريبية للمشروع المخصص وجاهزة للاعتماد المباشر أو المراجعة التلقائية.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5 text-xs">
                    <div className="font-bold text-white mb-1">وثيقة التنسيق الداخلي</div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      مخرجات التكامل بين قسم {employee.departmentName} وباقي أقسام الشركة.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GOVERNANCE & CREWAI / OPENHANDS SPECS */}
          {activeSubTab === 'governance' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* CrewAI Agent Role & Goal */}
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-cyan-300">
                  <Bot className="w-4 h-4 text-cyan-400" />
                  <span>هدف وكيل CrewAI التنسيقي (Crew Goal):</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {employee.crewGoal || 'تنسيق المهام المستقلة، التحليل العميق لسياق المشروع، ومواءمة النتائج مع توجيهات الرئيس التنفيذي نواف.'}
                </p>
                {employee.crewBackstory && (
                  <div className="mt-2 pt-2 border-t border-cyan-500/15 text-[11px] text-slate-400 leading-relaxed italic">
                    «{employee.crewBackstory}»
                  </div>
                )}
              </div>

              {/* Tools Authorized (CrewAI & OpenHands) */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <Wrench className="w-4 h-4 text-amber-400" />
                    <span>الأدوات المصرح بها للوكيل (Authorized Tools):</span>
                  </div>
                  {employee.openHandsEnabled && (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                      OpenHands Enabled
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(employee.tools || [
                    'crewai:delegation',
                    'crewai:task_planner',
                    'crewai:context_memory'
                  ]).map((toolName, idx) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-1 rounded-xl bg-slate-950 border border-white/10 text-[11px] font-mono text-slate-300 flex items-center gap-1"
                    >
                      <span className="text-amber-400">⚡</span>
                      <span>{toolName}</span>
                    </span>
                  ))}
                </div>

                {/* OpenHands Sandbox Action Trigger */}
                {employee.openHandsEnabled && (
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      يملك الموظف صلاحية تشغيل الحاوية التقنية وفحص الكود:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        openOpenHandsTerminal();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                      <span>فتح تيرمينال ومحرك الأدوات</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Permissions */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                <div className="flex items-center gap-2 mb-3 text-xs font-bold text-emerald-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>الصلاحيات والحدود المعتمدة:</span>
                </div>
                <div className="space-y-2">
                  {(employee.permissions || [
                    'تنفيذ المهام المستقلة المعتمدة',
                    'التنسيق البرمجي والفكري مع أعضاء الفريق',
                    'رفع مسودات القرارات لمركز القيادة'
                  ]).map((perm, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-200 flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{perm}</span>
                    </div>
                  ))}
                  <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                    <span className="font-bold">✕ حظر صارم:</span>
                    <span>لا يحق للموظف صرف أي ميزانيات مالية أو تفعيل خدمات مدفوعة تحت أي ظرف (تكلفة صفرية دائماً).</span>
                  </div>
                </div>
              </div>

              {/* System Instructions / Prompt */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <span>التعليمات التأسيسية للموظف (System Prompt):</span>
                  </div>
                  <button
                    onClick={() => setIsEditFormOpen(true)}
                    className="text-[11px] text-cyan-400 hover:underline"
                  >
                    تعديل التعليمات
                  </button>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                  {employee.instructions || 'أنت وكيل ذكاء اصطناعي تابع لشركة Nawaf HQ. تعمل بأعلى درجات الاستقلالية والتنسيق، مع الالتزام التام بالقانون رقم 1 الصارم (تكلفة صفرية دائماً) وتعظيم القيمة التنفيذية.'}
                </div>
              </div>

            </div>
          )}

          {/* System Prompt Archetype Footer */}
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Agent System Archetype: <strong className="text-cyan-400">{employee.systemRole}</strong></span>
            <span>ID: {employee.id}</span>
          </div>

        </div>
      </div>

      {/* Edit Form Modal */}
      <EmployeeFormModal
        isOpen={isEditFormOpen}
        onClose={() => setIsEditFormOpen(false)}
        employeeToEdit={employee}
      />
    </>
  );
};

