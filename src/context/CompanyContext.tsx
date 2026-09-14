import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Employee,
  Department,
  Project,
  Decision,
  IdeaItem,
  ActivityEvent,
  MarketingCampaign,
  GMSummary,
  CEOControlLevel,
  ProjectId,
  CompanyReport,
  ReportStatus,
  ProjectTask,
  MeetingMessage,
  MeetingSession,
  ExecutionPlan,
  ExecutionStep,
  AdvisorBriefing,
  AdvisorMessage,
  ThemeId,
  PrimaryNavGroup,
  CompanySubTab,
  WorkSubTab,
} from '../types';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_PROJECTS,
  INITIAL_EMPLOYEES,
} from '../data/initialData';
import { CREW_AGENTS } from '../services/crewai/agents';
import { OpenHandsEngine } from '../services/openhands/engine';
import { OpenHandsExecutionResult } from '../services/openhands/types';
import { generateCrewAgentResponseAsync } from '../services/crewai/dialogueEngine';
import { CrewOrchestrator } from '../services/crewai/orchestrator';

export type NavigationTab =
  | 'dashboard'
  | 'office'
  | 'employees'
  | 'projects'
  | 'tasks'
  | 'marketing'
  | 'content'
  | 'meetings'
  | 'reports'
  | 'decisions'
  | 'ideas'
  | 'analytics'
  | 'knowledge'
  | 'settings';

interface CompanyContextType {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  primaryNav: PrimaryNavGroup;
  setPrimaryNav: (nav: PrimaryNavGroup) => void;
  companySubTab: CompanySubTab;
  setCompanySubTab: (sub: CompanySubTab) => void;
  workSubTab: WorkSubTab;
  setWorkSubTab: (sub: WorkSubTab) => void;
  departments: Department[];
  projects: Project[];
  employees: Employee[];
  decisions: Decision[];
  ideas: IdeaItem[];
  activities: ActivityEvent[];
  campaigns: MarketingCampaign[];
  reports: CompanyReport[];
  gmSummary: GMSummary;
  plans: ExecutionPlan[];
  selectedPlan: ExecutionPlan | null;
  setSelectedPlan: (plan: ExecutionPlan | null) => void;
  isPlanModalOpen: boolean;
  setIsPlanModalOpen: (open: boolean) => void;
  createExecutionPlan: (goal: string, projectId?: ProjectId, customTitle?: string) => ExecutionPlan;
  approveExecutionPlan: (planId: string) => void;
  openHandsSession: OpenHandsExecutionResult | null;
  isOpenHandsTerminalOpen: boolean;
  openOpenHandsTerminal: (session?: OpenHandsExecutionResult | null) => void;
  closeOpenHandsTerminal: () => void;
  runOpenHandsAudit: (agentId: string, projectId: ProjectId, taskTitle?: string) => Promise<OpenHandsExecutionResult>;
  advisorBriefing: AdvisorBriefing;
  advisorMessages: AdvisorMessage[];
  sendAdvisorMessage: (text: string) => void;
  isAdvisorDrawerOpen: boolean;
  setIsAdvisorDrawerOpen: (open: boolean) => void;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedEmployee: Employee | null;
  setSelectedEmployee: (emp: Employee | null) => void;
  selectedProject: Project | null;
  setSelectedProject: (proj: Project | null) => void;
  selectedDepartment: Department | null;
  setSelectedDepartment: (dept: Department | null) => void;
  selectedReport: CompanyReport | null;
  setSelectedReport: (report: CompanyReport | null) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  isGMSummaryOpen: boolean;
  setIsGMSummaryOpen: (open: boolean) => void;
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  isEmployeeModalOpen: boolean;
  setIsEmployeeModalOpen: (open: boolean) => void;
  employeeToEdit: Employee | null;
  setEmployeeToEdit: (emp: Employee | null) => void;
  isCeoCommandOpen: boolean;
  setIsCeoCommandOpen: (open: boolean) => void;
  isMeetingModalOpen: boolean;
  setIsMeetingModalOpen: (open: boolean) => void;
  focusedZone: string | null;
  setFocusedZone: (zone: string | null) => void;
  controlLevel: CEOControlLevel;
  setControlLevel: (level: CEOControlLevel) => void;
  isCompanyOperating: boolean;
  setIsCompanyOperating: (operating: boolean) => void;
  tasks: ProjectTask[];
  updateTaskStatus: (taskId: string, newStatus: ProjectTask['status'], result?: string) => void;
  addNewTask: (task: Omit<ProjectTask, 'id'>) => void;
  deleteTask: (taskId: string) => void;
  meetingSession: MeetingSession | null;
  startMeeting: (topic: string, attendeeIds?: string[]) => void;
  endMeeting: () => void;
  sendMeetingMessage: (senderId: string, text: string) => void;
  approveDecision: (id: string, note?: string) => void;
  rejectDecision: (id: string, reason?: string) => void;
  modifyDecision: (id: string, instruction: string) => void;
  requestCEOApproval: (params: {
    title: string;
    description: string;
    projectId?: ProjectId;
    department?: string;
    requestedBy?: string;
    impact?: 'حاسم' | 'مرتفع' | 'متوسط';
  }) => Decision;
  triggerSimulatedCollaboration: () => void;
  isAutoSimulationActive: boolean;
  toggleAutoSimulation: () => void;
  addNewIdea: (idea: Omit<IdeaItem, 'id' | 'dateAdded'>) => void;
  promoteIdeaToTask: (ideaId: string, projectId: ProjectId) => void;
  updateEmployeeStatus: (empId: string, status: Employee['status'], currentTask?: string) => void;
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  editEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  addReport: (rep: Omit<CompanyReport, 'id' | 'createdAt'>) => void;
  updateReportProgress: (id: string, progress: number, status?: ReportStatus) => void;
  addActivity: (activity: Omit<ActivityEvent, 'id' | 'timestamp'>) => void;
  executeCEOCommand: (instruction: string) => Promise<{ success: boolean; message: string; assigneeName: string; taskTitle: string; plan?: ExecutionPlan }>;
  resetAllData: () => void;
  metrics: {
    workingEmployees: number;
    completedTasks: number;
    inProgressTasks: number;
    pendingDecisions: number;
    productivityRate: number;
  };
}

const BASE = 'nawaf_hq_os_data_v1';
const CompanyContext = createContext<CompanyContextType | undefined>(undefined);
let uid = 0;

export const createUniqueId = (prefix = 'id') => {
  uid += 1;
  return `${prefix}-${Date.now()}-${uid}-${Math.random().toString(36).slice(2, 7)}`;
};

function readStored<T>(suffix: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${BASE}_${suffix}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function cleanDepartments(): Department[] {
  return INITIAL_DEPARTMENTS.map(d => ({ ...d, activeTasks: 0 }));
}

function cleanProjects(): Project[] {
  return INITIAL_PROJECTS.map(p => ({
    ...p,
    progress: 0,
    currentPhase: 'بانتظار أول تنفيذ موثق',
    health: 'يحتاج انتباه',
    tasks: [],
    bugsCount: 0,
    marketingPhase: '',
    activeIdeasCount: 0,
    recentMilestones: [],
  }));
}

function enrichEmployees(list: Employee[]): Employee[] {
  return list.map(emp => {
    const crew = CREW_AGENTS[emp.id];
    return {
      ...emp,
      status: emp.status || 'READY',
      permissions: emp.permissions || crew?.permissions || [],
      tools: emp.tools || crew?.tools || [],
      crewGoal: emp.crewGoal || crew?.goal,
      crewBackstory: emp.crewBackstory || crew?.backstory,
      openHandsEnabled: Boolean((emp.permissions || crew?.permissions || []).some(p => p.startsWith('openhands:'))),
    };
  });
}

function cleanEmployees(): Employee[] {
  return enrichEmployees(INITIAL_EMPLOYEES.map(emp => ({
    ...emp,
    status: 'READY' as const,
    currentTask: '',
    taskProgress: 0,
    recentWork: [],
    tasksCompletedCount: 0,
    collaborationHistory: [],
    lastResult: undefined,
    availability: 'available',
  })));
}

function detectProject(goal: string, explicit?: ProjectId): ProjectId {
  if (explicit) return explicit;
  const q = goal.toLowerCase();
  if (q.includes('معين') || q.includes('مُعين') || q.includes('mueen') || q.includes('قرآن') || q.includes('مصحف')) return 'mueen';
  if (q.includes('قدها') || q.includes('قدّها') || q.includes('qaddha') || q.includes('لعب')) return 'qaddha';
  return 'hq';
}

function projectName(id: ProjectId) {
  if (id === 'mueen') return 'مُعِين';
  if (id === 'qaddha') return 'قدّها';
  return 'NAWAF HQ';
}

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [departments, setDepartments] = useState<Department[]>(() => readStored('departments', cleanDepartments()));
  const [projects, setProjects] = useState<Project[]>(() => readStored('projects', cleanProjects()));
  const [employees, setEmployees] = useState<Employee[]>(() => enrichEmployees(readStored('employees', cleanEmployees())));
  const [decisions, setDecisions] = useState<Decision[]>(() => readStored('decisions', []));
  const [ideas, setIdeas] = useState<IdeaItem[]>(() => readStored('ideas', []));
  const [activities, setActivities] = useState<ActivityEvent[]>(() => readStored('activities', []));
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(() => readStored('campaigns', []));
  const [reports, setReports] = useState<CompanyReport[]>(() => readStored('reports', []));
  const [plans, setPlans] = useState<ExecutionPlan[]>(() => readStored('plans', []));
  const [advisorMessages, setAdvisorMessages] = useState<AdvisorMessage[]>(() => readStored('advisor_msgs', []));

  const [theme, setThemeState] = useState<ThemeId>(() => (localStorage.getItem(`${BASE}_theme`) as ThemeId) || 'executive-gold');
  const [primaryNav, setPrimaryNavState] = useState<PrimaryNavGroup>(() => (localStorage.getItem(`${BASE}_primary_nav`) as PrimaryNavGroup) || 'hq');
  const [companySubTab, setCompanySubTabState] = useState<CompanySubTab>('projects');
  const [workSubTab, setWorkSubTabState] = useState<WorkSubTab>('plans');
  const [activeTab, setActiveTabState] = useState<NavigationTab>('dashboard');

  const [selectedPlan, setSelectedPlan] = useState<ExecutionPlan | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [openHandsSession, setOpenHandsSession] = useState<OpenHandsExecutionResult | null>(null);
  const [isOpenHandsTerminalOpen, setIsOpenHandsTerminalOpen] = useState(false);
  const [isAdvisorDrawerOpen, setIsAdvisorDrawerOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedReport, setSelectedReport] = useState<CompanyReport | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isGMSummaryOpen, setIsGMSummaryOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [isCeoCommandOpen, setIsCeoCommandOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [focusedZone, setFocusedZone] = useState<string | null>(null);
  const [controlLevel, setControlLevel] = useState<CEOControlLevel>('requires_approval');
  const [isCompanyOperating, setIsCompanyOperating] = useState(true);
  const [meetingSession, setMeetingSession] = useState<MeetingSession | null>(() => readStored('meeting', null));

  // Simulation is permanently disabled. Kept only for backwards UI compatibility.
  const isAutoSimulationActive = false;

  useEffect(() => {
    localStorage.setItem(`${BASE}_departments`, JSON.stringify(departments));
    localStorage.setItem(`${BASE}_projects`, JSON.stringify(projects));
    localStorage.setItem(`${BASE}_employees`, JSON.stringify(employees));
    localStorage.setItem(`${BASE}_decisions`, JSON.stringify(decisions));
    localStorage.setItem(`${BASE}_ideas`, JSON.stringify(ideas));
    localStorage.setItem(`${BASE}_activities`, JSON.stringify(activities));
    localStorage.setItem(`${BASE}_campaigns`, JSON.stringify(campaigns));
    localStorage.setItem(`${BASE}_reports`, JSON.stringify(reports));
    localStorage.setItem(`${BASE}_plans`, JSON.stringify(plans));
    localStorage.setItem(`${BASE}_advisor_msgs`, JSON.stringify(advisorMessages));
    if (meetingSession) localStorage.setItem(`${BASE}_meeting`, JSON.stringify(meetingSession));
    else localStorage.removeItem(`${BASE}_meeting`);
  }, [departments, projects, employees, decisions, ideas, activities, campaigns, reports, plans, advisorMessages, meetingSession]);

  const setTheme = useCallback((newTheme: ThemeId) => {
    setThemeState(newTheme);
    localStorage.setItem(`${BASE}_theme`, newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  }, []);

  useEffect(() => document.documentElement.setAttribute('data-theme', theme), [theme]);

  const setActiveTab = useCallback((tab: NavigationTab) => {
    setActiveTabState(tab);
    if (tab === 'dashboard' || tab === 'office') setPrimaryNavState('hq');
    else if (tab === 'projects' || tab === 'employees') setPrimaryNavState('company');
    else if (tab === 'tasks' || tab === 'decisions' || tab === 'reports') setPrimaryNavState('work');
    else if (tab === 'settings') setPrimaryNavState('settings');
  }, []);

  const setPrimaryNav = useCallback((nav: PrimaryNavGroup) => {
    setPrimaryNavState(nav);
    localStorage.setItem(`${BASE}_primary_nav`, nav);
    if (nav === 'hq' || nav === 'advisor') setActiveTabState('dashboard');
    else if (nav === 'company') setActiveTabState(companySubTab === 'employees' ? 'employees' : 'projects');
    else if (nav === 'work') setActiveTabState(workSubTab === 'decisions' ? 'decisions' : workSubTab === 'reports' ? 'reports' : 'tasks');
    else setActiveTabState('settings');
  }, [companySubTab, workSubTab]);

  const setCompanySubTab = useCallback((sub: CompanySubTab) => {
    setCompanySubTabState(sub);
    setActiveTabState(sub === 'employees' ? 'employees' : sub === 'projects' ? 'projects' : 'office');
  }, []);

  const setWorkSubTab = useCallback((sub: WorkSubTab) => {
    setWorkSubTabState(sub);
    setActiveTabState(sub === 'decisions' ? 'decisions' : sub === 'reports' ? 'reports' : 'tasks');
  }, []);

  const addActivity = useCallback((activity: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    setActivities(prev => [{
      ...activity,
      id: createUniqueId('act'),
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    }, ...prev]);
  }, []);

  const tasks = useMemo(() => projects.flatMap(project => (project.tasks || []).map(task => ({ ...task, projectId: task.projectId || project.id }))), [projects]);

  const metrics = useMemo(() => {
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress' || t.status === 'reviewing').length;
    const total = tasks.length;
    return {
      workingEmployees: employees.filter(e => ['WORKING', 'RESEARCHING', 'REVIEWING', 'COLLABORATING', 'MEETING'].includes(e.status)).length,
      completedTasks: completed,
      inProgressTasks: inProgress,
      pendingDecisions: decisions.filter(d => d.status === 'waiting').length,
      productivityRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [tasks, employees, decisions]);

  const gmSummary: GMSummary = useMemo(() => ({
    date: new Date().toLocaleDateString('ar-SA'),
    greeting: 'ملخص الشركة',
    headline: decisions.some(d => d.status === 'waiting') ? 'يوجد قرار يحتاج تدخلك' : tasks.length ? 'هذه هي حالة العمل الموثقة الآن' : 'لا توجد أعمال تنفيذية موثقة حالياً',
    activeEmployeesCount: metrics.workingEmployees,
    completedTasksCount: metrics.completedTasks,
    detectedIssuesCount: tasks.filter(t => t.status === 'blocked').length,
    newIdeasCount: ideas.length,
    pendingDecisionsCount: metrics.pendingDecisions,
    keyInsights: [
      `${metrics.inProgressTasks} مهمة قيد التنفيذ`,
      `${metrics.pendingDecisions} قرار بانتظارك`,
      `${reports.length} تقرير مسجل`,
    ],
    recommendedFocus: metrics.pendingDecisions ? 'راجع القرارات المعلقة' : metrics.inProgressTasks ? 'تابع المهام الحالية' : 'أصدر توجيهاً جديداً للشركة',
  }), [metrics, tasks, ideas.length, reports.length, decisions]);

  const createExecutionPlan = useCallback((goal: string, explicitProjectId?: ProjectId, customTitle?: string): ExecutionPlan => {
    const pid = detectProject(goal, explicitProjectId);
    const project = projects.find(p => p.id === pid);
    const teamIds = project?.assignedEmployees?.length ? project.assignedEmployees : employees.slice(0, 4).map(e => e.id);
    const teamEmployees = teamIds.map(id => employees.find(e => e.id === id)).filter(Boolean) as Employee[];
    const fallback = employees[0];
    const choose = (index: number) => teamEmployees[index % Math.max(teamEmployees.length, 1)] || fallback;
    const planId = createUniqueId('plan');
    const makeStep = (n: number, title: string, objective: string, expected: string, technical = false): ExecutionStep => {
      const emp = choose(n - 1);
      return {
        id: `${planId}-step-${n}`,
        stepNumber: n,
        title,
        objective,
        assigneeId: emp?.id,
        assigneeName: emp?.name || 'غير معيّن',
        assigneeRole: emp?.position || 'غير معيّن',
        assigneeAvatar: emp?.avatar || '🤖',
        expectedResult: expected,
        dependencies: n === 1 ? [] : [`${planId}-step-${n - 1}`],
        status: 'READY',
        progress: 0,
        isTechnical: technical,
        toolsRequired: technical ? ['openhands'] : [],
      };
    };

    const steps: ExecutionStep[] = [
      makeStep(1, 'فحص الحالة الحالية', `جمع الحقائق المتاحة المرتبطة بالهدف: «${goal}» بدون افتراضات.`, 'نتيجة فحص موثقة بالمصادر أو أدوات النظام.'),
      makeStep(2, 'تحديد خطة التنفيذ النهائية', 'تحويل نتائج الفحص إلى خطوات قابلة للتنفيذ مع تبعيات وصلاحيات واضحة.', 'خطة تنفيذ واضحة لا تحتوي مهام وهمية.'),
      makeStep(3, 'تنفيذ التغييرات المطلوبة', 'تنفيذ المطلوب فعلياً عبر الأدوات المتصلة والصلاحيات الممنوحة.', 'مخرجات تنفيذ حقيقية أو حالة واضحة بأن محرك التنفيذ غير متصل.', true),
      makeStep(4, 'الاختبار والمراجعة', 'تشغيل الفحوص المتاحة والتحقق من النتيجة قبل الإغلاق.', 'نتيجة اختبار موثقة وقرار جاهزية واضح.', true),
      makeStep(5, 'تسليم النتيجة', 'تلخيص ما تم فعلياً وما بقي وما يحتاج قرار نواف.', 'تقرير نهائي مبني فقط على نتائج حقيقية.'),
    ];

    const newPlan: ExecutionPlan = {
      id: planId,
      title: customTitle || `خطة: ${goal.slice(0, 70)}`,
      goal,
      projectId: pid,
      projectName: project?.name || projectName(pid),
      createdAt: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      status: 'PLANNING',
      team: teamEmployees.map(e => ({ id: e.id, name: e.name, role: e.position, avatar: e.avatar })),
      steps,
      estimatedComplexity: 'متوسط',
      whatRequiresApproval: 'اعتماد الخطة فقط. أي تكلفة أو إجراء خارجي حساس يحتاج موافقة منفصلة.',
      summary: `مسودة تنفيذ للهدف: «${goal}». لا تُعد أي خطوة منجزة قبل وصول نتيجة فعلية من الأداة أو الموظف المسؤول.`,
      zeroCostGuarantee: true,
    };
    setPlans(prev => [newPlan, ...prev]);
    setSelectedPlan(newPlan);
    setIsPlanModalOpen(true);
    return newPlan;
  }, [projects, employees]);

  const approveExecutionPlan = useCallback((planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    const now = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    const approved: ExecutionPlan = { ...plan, status: 'APPROVED', approvedByCeoAt: now };
    setPlans(prev => prev.map(p => p.id === planId ? approved : p));

    setProjects(prev => prev.map(project => {
      if (project.id !== plan.projectId) return project;
      const existing = new Set((project.tasks || []).map(t => t.planStepId));
      const generated = plan.steps.filter(step => !existing.has(step.id)).map(step => ({
        id: createUniqueId('task'),
        title: step.title,
        objective: step.objective,
        expectedResult: step.expectedResult,
        dependencies: step.dependencies,
        planId: plan.id,
        planStepId: step.id,
        assigneeName: step.assigneeName,
        assigneeId: step.assigneeId,
        assigneeAvatar: step.assigneeAvatar,
        projectId: plan.projectId,
        status: 'pending' as const,
        priority: 'عالي' as const,
        department: step.assigneeRole,
        progress: 0,
        isTechnical: step.isTechnical,
      }));
      return { ...project, tasks: [...generated, ...(project.tasks || [])] };
    }));

    addActivity({
      actor: 'نواف', actorAvatar: '👑', actorRole: 'الرئيس التنفيذي', department: 'الإدارة العليا',
      actionText: `اعتمد الخطة «${plan.title}». لم يتم احتساب أي إنجاز قبل التنفيذ الفعلي.`,
      projectId: plan.projectId, type: 'decision', isAutonomous: false,
    });

    void (async () => {
      const orchestrator = CrewOrchestrator.getInstance();
      const state = await orchestrator.checkStatus();
      if (state.status === 'CONNECTED') {
        const result = await orchestrator.runWorkflow(plan.id, approved);
        if (result.success) {
          setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, status: 'IN_PROGRESS' } : p));
          addActivity({ actor: 'CrewAI', actorAvatar: '🧠', actorRole: 'محرك التنسيق', department: 'العمليات', actionText: `بدأ تنسيق الخطة «${plan.title}» عبر CrewAI المتصل فعلياً.`, projectId: plan.projectId, type: 'system', isAutonomous: true });
        }
      }
    })();

    setIsPlanModalOpen(false);
  }, [plans, addActivity]);

  const openOpenHandsTerminal = useCallback((session?: OpenHandsExecutionResult | null) => {
    if (session) setOpenHandsSession(session);
    setIsOpenHandsTerminalOpen(true);
  }, []);
  const closeOpenHandsTerminal = useCallback(() => setIsOpenHandsTerminalOpen(false), []);

  const runOpenHandsAudit = useCallback(async (agentId: string, projectId: ProjectId, taskTitle?: string) => {
    const employee = employees.find(e => e.id === agentId) || employees[0];
    const engine = OpenHandsEngine.getInstance();
    const effective: 'mueen' | 'qaddha' | 'hq' = projectId === 'mueen' || projectId === 'qaddha' ? projectId : 'hq';
    const result = await engine.executeTechnicalTask({
      agentId: employee?.id || agentId,
      agentName: employee?.name || agentId,
      projectId: effective,
      taskTitle: taskTitle || 'فحص تقني موثق',
      objective: 'نفذ فقط الفحوص الحقيقية المتاحة وأعد النتائج كما هي بدون محاكاة.',
    });
    setOpenHandsSession(result);
    setIsOpenHandsTerminalOpen(true);
    addActivity({
      actor: employee?.name || 'النظام', actorAvatar: employee?.avatar || '🤖', actorRole: employee?.position || 'تنفيذ', department: employee?.departmentName || 'الأنظمة',
      actionText: result.summary, projectId: effective, type: result.logs.some(l => l.isError) ? 'alert' : 'milestone', isAutonomous: true,
    });
    return result;
  }, [employees, addActivity]);

  const updateTaskStatus = useCallback((taskId: string, newStatus: ProjectTask['status'], result?: string) => {
    let planId: string | undefined;
    let stepId: string | undefined;
    setProjects(prev => prev.map(p => ({ ...p, tasks: (p.tasks || []).map(t => {
      if (t.id !== taskId) return t;
      planId = t.planId; stepId = t.planStepId;
      return { ...t, status: newStatus, result: result ?? t.result, progress: newStatus === 'completed' ? 100 : t.progress };
    }) })));
    if (planId && stepId) {
      setPlans(prev => prev.map(plan => {
        if (plan.id !== planId) return plan;
        const steps = plan.steps.map(step => step.id === stepId ? {
          ...step,
          status: newStatus === 'completed' ? 'COMPLETED' as const : newStatus === 'blocked' ? 'BLOCKED' as const : newStatus === 'reviewing' ? 'REVIEWING' as const : newStatus === 'in_progress' ? 'WORKING' as const : step.status,
          progress: newStatus === 'completed' ? 100 : step.progress,
          result: result ?? step.result,
        } : step);
        const done = steps.every(s => s.status === 'COMPLETED');
        return { ...plan, steps, status: done ? 'COMPLETED' : plan.status };
      }));
    }
  }, []);

  const addNewTask = useCallback((taskData: Omit<ProjectTask, 'id'>) => {
    const pid = taskData.projectId || 'qaddha';
    const task: ProjectTask = { ...taskData, id: createUniqueId('task'), projectId: pid, status: taskData.status || 'pending', progress: taskData.progress ?? 0 };
    setProjects(prev => prev.map(p => p.id === pid ? { ...p, tasks: [task, ...(p.tasks || [])] } : p));
    addActivity({ actor: 'نواف', actorAvatar: '👑', actorRole: 'الرئيس التنفيذي', department: 'الإدارة العليا', actionText: `أضاف مهمة: «${task.title}»`, projectId: pid, type: 'creation', isAutonomous: false });
  }, [addActivity]);

  const deleteTask = useCallback((taskId: string) => setProjects(prev => prev.map(p => ({ ...p, tasks: (p.tasks || []).filter(t => t.id !== taskId) }))), []);

  const requestCEOApproval = useCallback((params: {
    title: string; description: string; projectId?: ProjectId; department?: string; requestedBy?: string; impact?: 'حاسم' | 'مرتفع' | 'متوسط';
  }): Decision => {
    const decision: Decision = {
      id: createUniqueId('dec'), title: params.title, description: params.description,
      projectId: params.projectId, department: params.department || 'العمليات', proposer: params.requestedBy || 'النظام',
      impact: params.impact || 'متوسط', estimatedCost: 'غير محدد — أي تكلفة تحتاج موافقة صريحة', estimatedTime: 'غير محدد',
      status: 'waiting', controlLevel: 'requires_approval', timestamp: 'الآن', tags: ['اعتماد'], financialImpact: false,
    };
    setDecisions(prev => [decision, ...prev]);
    return decision;
  }, []);

  const approveDecision = useCallback((id: string, note?: string) => {
    setDecisions(prev => prev.map(d => d.id === id ? { ...d, status: 'approved', ceoNote: note || 'تم الاعتماد من نواف' } : d));
  }, []);
  const rejectDecision = useCallback((id: string, reason?: string) => {
    setDecisions(prev => prev.map(d => d.id === id ? { ...d, status: 'rejected', ceoNote: reason || 'تم الرفض من نواف' } : d));
  }, []);
  const modifyDecision = useCallback((id: string, instruction: string) => {
    setDecisions(prev => prev.map(d => d.id === id ? { ...d, status: 'modified', ceoNote: instruction } : d));
  }, []);

  const startMeeting = useCallback((topic: string, attendeeIds?: string[]) => {
    const attendees = attendeeIds?.length ? attendeeIds : employees.slice(0, 5).map(e => e.id);
    const session: MeetingSession = {
      id: createUniqueId('meet'), topic, status: 'active', attendees, messages: [],
      startedAt: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    };
    setMeetingSession(session);
    setIsMeetingModalOpen(true);
  }, [employees]);

  const endMeeting = useCallback(() => {
    setMeetingSession(prev => prev ? { ...prev, status: 'concluded' } : null);
    setIsMeetingModalOpen(false);
  }, []);

  const sendMeetingMessage = useCallback((senderId: string, text: string) => {
    const now = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    const sender = senderId === 'nawaf' ? null : employees.find(e => e.id === senderId);
    const message: MeetingMessage = {
      id: createUniqueId('msg'), senderId,
      senderName: sender?.name || 'نواف', senderRole: sender?.position || 'الرئيس التنفيذي', senderAvatar: sender?.avatar || '👑', text, timestamp: now,
    };
    setMeetingSession(prev => prev ? { ...prev, messages: [...prev.messages, message] } : prev);

    if (senderId === 'nawaf' && meetingSession) {
      const responder = meetingSession.attendees.map(id => employees.find(e => e.id === id)).find(Boolean);
      if (responder) {
        const project = projects.find(p => p.assignedEmployees?.includes(responder.id));
        const activePlan = plans.find(p => p.status === 'IN_PROGRESS' || p.status === 'APPROVED');
        void generateCrewAgentResponseAsync({
          employee: responder,
          project,
          activePlan,
          userQuery: text,
          isCompanyOperating,
          onTriggerApproval: ({ title, description, projectId }) => requestCEOApproval({ title, description, projectId: (projectId as ProjectId) || 'hq', requestedBy: responder.name }),
        }).then(({ text: reply }) => {
          setMeetingSession(prev => prev ? { ...prev, messages: [...prev.messages, {
            id: createUniqueId('msg'), senderId: responder.id, senderName: responder.name, senderRole: responder.position, senderAvatar: responder.avatar,
            text: reply, timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
          }] } : prev);
        });
      }
    }
  }, [employees, meetingSession, projects, plans, isCompanyOperating, requestCEOApproval]);

  const addNewIdea = useCallback((idea: Omit<IdeaItem, 'id' | 'dateAdded'>) => setIdeas(prev => [{ ...idea, id: createUniqueId('idea'), dateAdded: new Date().toLocaleDateString('ar-SA') }, ...prev]), []);
  const promoteIdeaToTask = useCallback((ideaId: string, projectId: ProjectId) => {
    const idea = ideas.find(i => i.id === ideaId);
    if (!idea) return;
    addNewTask({ title: idea.title, description: idea.opportunity, assigneeName: 'غير معيّن', status: 'pending', priority: 'متوسط', department: 'غير معيّن', projectId, progress: 0 });
  }, [ideas, addNewTask]);

  const updateEmployeeStatus = useCallback((empId: string, status: Employee['status'], currentTask?: string) => {
    setEmployees(prev => prev.map(e => e.id === empId ? { ...e, status, currentTask: currentTask ?? e.currentTask } : e));
  }, []);
  const addEmployee = useCallback((emp: Omit<Employee, 'id'>) => setEmployees(prev => [...prev, { ...emp, id: createUniqueId('emp') }]), []);
  const editEmployee = useCallback((id: string, updates: Partial<Employee>) => setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e)), []);
  const deleteEmployee = useCallback((id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    setSelectedEmployee(prev => prev?.id === id ? null : prev);
  }, []);

  const addReport = useCallback((rep: Omit<CompanyReport, 'id' | 'createdAt'>) => setReports(prev => [{ ...rep, id: createUniqueId('rep'), createdAt: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) }, ...prev]), []);
  const updateReportProgress = useCallback((id: string, progress: number, status?: ReportStatus) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, progress: Math.max(0, Math.min(100, progress)), status: status || r.status, completedAt: progress >= 100 ? new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : r.completedAt } : r));
  }, []);

  const sendAdvisorMessage = useCallback((text: string) => {
    const now = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    setAdvisorMessages(prev => [...prev, { id: createUniqueId('adv'), sender: 'nawaf', text, timestamp: now }]);

    const q = text.toLowerCase();
    let createdPlan: ExecutionPlan | undefined;
    if (q.includes('خطة') || q.includes('راجع') || q.includes('طور') || q.includes('جهز') || q.includes('اصلح') || q.includes('صلح')) {
      createdPlan = createExecutionPlan(text);
    }

    void fetch('/api/agent/respond', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userMessage: text,
        context: {
          employee: { name: 'المستشار التنفيذي', position: 'Chief of Staff', departmentName: 'الإدارة العليا' },
          projects: projects.map(p => ({ id: p.id, name: p.name, progress: p.progress, currentPhase: p.currentPhase, health: p.health, tasks: p.tasks })),
          employees: employees.map(e => ({ id: e.id, name: e.name, position: e.position, status: e.status, currentTask: e.currentTask })),
          decisions: decisions.filter(d => d.status === 'waiting'),
          plans: plans.map(p => ({ id: p.id, title: p.title, status: p.status, steps: p.steps })),
          createdPlan,
        },
      }),
    }).then(r => r.json()).then(data => {
      const reply = data?.text || (createdPlan
        ? `أنشأت مسودة الخطة «${createdPlan.title}». راجعها واعتمدها إذا كانت مناسبة. ما اعتبرت أي خطوة منجزة.`
        : `الحالة الحالية: ${metrics.inProgressTasks} مهمة قيد التنفيذ و${metrics.pendingDecisions} قرار بانتظارك.`);
      setAdvisorMessages(prev => [...prev, { id: createUniqueId('adv'), sender: 'advisor', text: reply, timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }), relatedPlan: createdPlan }]);
    }).catch(() => {
      setAdvisorMessages(prev => [...prev, { id: createUniqueId('adv'), sender: 'advisor', text: createdPlan ? `تم إنشاء مسودة «${createdPlan.title}» بدون ادعاء تنفيذ.` : 'المحادثة الذكية غير متاحة حالياً، ولا توجد نتيجة وهمية بديلة.', timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }), relatedPlan: createdPlan }]);
    });
  }, [createExecutionPlan, projects, employees, decisions, plans, metrics]);

  const advisorBriefing: AdvisorBriefing = useMemo(() => ({
    headline: metrics.pendingDecisions ? 'فيه قرار يحتاجك' : metrics.inProgressTasks ? 'العمل الجاري موثق أدناه' : 'الشركة جاهزة لتوجيهك',
    subtext: 'لا يتم احتساب أي تقدم أو إنجاز بدون حالة أو نتيجة فعلية.',
    needsNawafCount: metrics.pendingDecisions + tasks.filter(t => t.status === 'blocked').length,
    activeEmployeesCount: metrics.workingEmployees,
    executiveSummary: `المهام: ${tasks.length}، قيد التنفيذ: ${metrics.inProgressTasks}، مكتملة: ${metrics.completedTasks}، قرارات معلقة: ${metrics.pendingDecisions}.`,
    urgentDecisionsCount: metrics.pendingDecisions,
    recommendedFocus: metrics.pendingDecisions ? 'مراجعة القرارات المعلقة' : metrics.inProgressTasks ? 'متابعة العمل الجاري' : 'إصدار توجيه أو إنشاء خطة جديدة',
    zeroCostStatus: 'لا يتم تفعيل أي خدمة مدفوعة بدون موافقة نواف.',
    topInsights: [
      `${metrics.workingEmployees} موظف بحالة عمل فعلية`,
      `${plans.filter(p => p.status === 'APPROVED' || p.status === 'IN_PROGRESS').length} خطة معتمدة أو جارية`,
      `${reports.filter(r => r.status === 'مكتمل').length} تقرير مكتمل`,
    ],
    companyStatus: metrics.pendingDecisions || tasks.some(t => t.status === 'blocked') ? 'attention_needed' : 'optimal',
  }), [metrics, tasks, plans, reports]);

  const executeCEOCommand = useCallback(async (instruction: string) => {
    const plan = createExecutionPlan(instruction);
    return {
      success: true,
      message: `تم تحويل توجيهك إلى خطة فعلية قابلة للاعتماد: «${plan.title}». لم يبدأ أي تنفيذ وهمي.`,
      assigneeName: plan.team[0]?.name || 'الفريق',
      taskTitle: plan.title,
      plan,
    };
  }, [createExecutionPlan]);

  const triggerSimulatedCollaboration = useCallback(() => {
    // Intentionally disabled. This function remains only so legacy buttons do not crash.
  }, []);
  const toggleAutoSimulation = useCallback(() => {
    // Intentionally disabled: fake autonomous activity is not allowed.
  }, []);

  const resetAllData = useCallback(() => {
    Object.keys(localStorage).filter(k => k.startsWith(BASE)).forEach(k => localStorage.removeItem(k));
    setDepartments(cleanDepartments());
    setProjects(cleanProjects());
    setEmployees(cleanEmployees());
    setDecisions([]);
    setIdeas([]);
    setActivities([]);
    setCampaigns([]);
    setReports([]);
    setPlans([]);
    setAdvisorMessages([]);
    setMeetingSession(null);
    setSelectedPlan(null);
    setSelectedEmployee(null);
    setSelectedProject(null);
    setSelectedDepartment(null);
    setSelectedReport(null);
  }, []);

  return (
    <CompanyContext.Provider value={{
      theme, setTheme, primaryNav, setPrimaryNav, companySubTab, setCompanySubTab, workSubTab, setWorkSubTab,
      departments, projects, employees, decisions, ideas, activities, campaigns, reports, gmSummary,
      plans, selectedPlan, setSelectedPlan, isPlanModalOpen, setIsPlanModalOpen, createExecutionPlan, approveExecutionPlan,
      openHandsSession, isOpenHandsTerminalOpen, openOpenHandsTerminal, closeOpenHandsTerminal, runOpenHandsAudit,
      advisorBriefing, advisorMessages, sendAdvisorMessage, isAdvisorDrawerOpen, setIsAdvisorDrawerOpen,
      activeTab, setActiveTab, selectedEmployee, setSelectedEmployee, selectedProject, setSelectedProject,
      selectedDepartment, setSelectedDepartment, selectedReport, setSelectedReport, isSearchOpen, setIsSearchOpen,
      isNotificationsOpen, setIsNotificationsOpen, isGMSummaryOpen, setIsGMSummaryOpen, isReportModalOpen, setIsReportModalOpen,
      isEmployeeModalOpen, setIsEmployeeModalOpen, employeeToEdit, setEmployeeToEdit, isCeoCommandOpen, setIsCeoCommandOpen,
      isMeetingModalOpen, setIsMeetingModalOpen, focusedZone, setFocusedZone, controlLevel, setControlLevel,
      isCompanyOperating, setIsCompanyOperating, tasks, updateTaskStatus, addNewTask, deleteTask,
      meetingSession, startMeeting, endMeeting, sendMeetingMessage, approveDecision, rejectDecision, modifyDecision,
      requestCEOApproval, triggerSimulatedCollaboration, isAutoSimulationActive, toggleAutoSimulation,
      addNewIdea, promoteIdeaToTask, updateEmployeeStatus, addEmployee, editEmployee, deleteEmployee,
      addReport, updateReportProgress, addActivity, executeCEOCommand, resetAllData, metrics,
    }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = (): CompanyContextType => {
  const context = useContext(CompanyContext);
  if (!context) throw new Error('useCompany must be used within a CompanyProvider');
  return context;
};
