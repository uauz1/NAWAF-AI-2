import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
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
  WorkSubTab
} from '../types';
import { 
  INITIAL_DEPARTMENTS, 
  INITIAL_PROJECTS, 
  INITIAL_EMPLOYEES, 
  INITIAL_DECISIONS, 
  INITIAL_IDEAS, 
  INITIAL_ACTIVITIES, 
  INITIAL_CAMPAIGNS, 
  INITIAL_GM_SUMMARY, 
  INITIAL_REPORTS,
  INITIAL_PLANS
} from '../data/initialData';
import { CREW_AGENTS } from '../services/crewai/agents';
import { OpenHandsEngine } from '../services/openhands/engine';
import { OpenHandsExecutionResult } from '../services/openhands/types';

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
  // Themes & Visual OS
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;

  // Grouped Navigation
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
  
  // Real Execution Plans
  plans: ExecutionPlan[];
  selectedPlan: ExecutionPlan | null;
  setSelectedPlan: (plan: ExecutionPlan | null) => void;
  isPlanModalOpen: boolean;
  setIsPlanModalOpen: (open: boolean) => void;
  createExecutionPlan: (goal: string, projectId?: ProjectId, customTitle?: string) => ExecutionPlan;
  approveExecutionPlan: (planId: string) => void;

  // OpenHands Engine & Sandboxed Execution
  openHandsSession: OpenHandsExecutionResult | null;
  isOpenHandsTerminalOpen: boolean;
  openOpenHandsTerminal: (session?: OpenHandsExecutionResult | null) => void;
  closeOpenHandsTerminal: () => void;
  runOpenHandsAudit: (agentId: string, projectId: ProjectId, taskTitle?: string) => Promise<OpenHandsExecutionResult>;

  // Real Executive Advisor (Chief of Staff)
  advisorBriefing: AdvisorBriefing;
  advisorMessages: AdvisorMessage[];
  sendAdvisorMessage: (text: string) => void;
  isAdvisorDrawerOpen: boolean;
  setIsAdvisorDrawerOpen: (open: boolean) => void;

  // Legacy Navigation & Modals
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
  
  // CEO Control
  controlLevel: CEOControlLevel;
  setControlLevel: (level: CEOControlLevel) => void;
  isCompanyOperating: boolean;
  setIsCompanyOperating: (operating: boolean) => void;
  
  // Tasks Management
  tasks: ProjectTask[];
  updateTaskStatus: (taskId: string, newStatus: ProjectTask['status'], result?: string) => void;
  addNewTask: (task: Omit<ProjectTask, 'id'>) => void;
  deleteTask: (taskId: string) => void;

  // Meetings
  meetingSession: MeetingSession | null;
  startMeeting: (topic: string, attendeeIds?: string[]) => void;
  endMeeting: () => void;
  sendMeetingMessage: (senderId: string, text: string) => void;
  
  // Actions
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
  
  // Calculated Metrics
  metrics: {
    workingEmployees: number;
    completedTasks: number;
    inProgressTasks: number;
    pendingDecisions: number;
    productivityRate: number;
  };
}

const STORAGE_KEY = 'nawaf_hq_os_data_v1';

const enrichEmployeesWithCrew = (rawList: Employee[]): Employee[] => {
  return rawList.map(emp => {
    const crew = CREW_AGENTS[emp.id];
    if (!crew) return emp;
    return {
      ...emp,
      permissions: emp.permissions || crew.permissions,
      tools: emp.tools || crew.tools,
      crewGoal: emp.crewGoal || crew.goal,
      crewBackstory: emp.crewBackstory || crew.backstory,
      openHandsEnabled: crew.permissions.some(p => p.startsWith('openhands:'))
    };
  });
};

let globalUidCounter = 0;
export const createUniqueId = (prefix: string = 'id'): string => {
  globalUidCounter += 1;
  const time = Date.now();
  const rand = Math.random().toString(36).substring(2, 7);
  return `${prefix}-${time}-${globalUidCounter}-${rand}`;
};

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial or stored state
  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_departments`);
    return saved ? JSON.parse(saved) : INITIAL_DEPARTMENTS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_projects`);
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_employees`);
    const list = saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
    return enrichEmployeesWithCrew(list);
  });

  const [decisions, setDecisions] = useState<Decision[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_decisions`);
    return saved ? JSON.parse(saved) : INITIAL_DECISIONS;
  });

  const [ideas, setIdeas] = useState<IdeaItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_ideas`);
    return saved ? JSON.parse(saved) : INITIAL_IDEAS;
  });

  const [activities, setActivities] = useState<ActivityEvent[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_activities`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const seen = new Set<string>();
          return parsed.map((act: ActivityEvent, idx: number) => {
            if (!act.id || seen.has(act.id)) {
              const uniqueId = createUniqueId('act');
              seen.add(uniqueId);
              return { ...act, id: uniqueId };
            }
            seen.add(act.id);
            return act;
          });
        }
      } catch (e) {
        console.error('Failed to parse activities from storage:', e);
      }
    }
    return INITIAL_ACTIVITIES;
  });

  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_campaigns`);
    return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
  });

  const [reports, setReports] = useState<CompanyReport[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_reports`);
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });

  const [gmSummary] = useState<GMSummary>(INITIAL_GM_SUMMARY);

  // Themes & Visual OS
  const [theme, setThemeState] = useState<ThemeId>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_theme`) as ThemeId;
    return saved && ['executive-gold', 'midnight-blue', 'graphite', 'warm-stone'].includes(saved)
      ? saved
      : 'executive-gold';
  });

  const setTheme = useCallback((newTheme: ThemeId) => {
    setThemeState(newTheme);
    localStorage.setItem(`${STORAGE_KEY}_theme`, newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Grouped Navigation
  const [primaryNav, setPrimaryNavState] = useState<PrimaryNavGroup>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_primary_nav`) as PrimaryNavGroup;
    return saved || 'hq';
  });
  const [companySubTab, setCompanySubTabState] = useState<CompanySubTab>('projects');
  const [workSubTab, setWorkSubTabState] = useState<WorkSubTab>('plans');

  // App UI State
  const [activeTab, setActiveTabState] = useState<NavigationTab>('dashboard');

  const setActiveTab = useCallback((tab: NavigationTab) => {
    setActiveTabState(tab);
    if (tab === 'dashboard' || tab === 'office') {
      setPrimaryNavState('hq');
    } else if (tab === 'projects') {
      setPrimaryNavState('company');
      setCompanySubTabState('projects');
    } else if (tab === 'employees') {
      setPrimaryNavState('company');
      setCompanySubTabState('employees');
    } else if (tab === 'tasks') {
      setPrimaryNavState('work');
      setWorkSubTabState('tasks');
    } else if (tab === 'decisions') {
      setPrimaryNavState('work');
      setWorkSubTabState('decisions');
    } else if (tab === 'reports') {
      setPrimaryNavState('work');
      setWorkSubTabState('reports');
    } else if (tab === 'settings') {
      setPrimaryNavState('settings');
    }
  }, []);

  const setPrimaryNav = useCallback((nav: PrimaryNavGroup) => {
    setPrimaryNavState(nav);
    localStorage.setItem(`${STORAGE_KEY}_primary_nav`, nav);
    if (nav === 'hq' || nav === 'advisor') {
      setActiveTabState('dashboard');
    } else if (nav === 'company') {
      setActiveTabState(companySubTab === 'employees' ? 'employees' : 'projects');
    } else if (nav === 'work') {
      setActiveTabState(workSubTab === 'decisions' ? 'decisions' : (workSubTab === 'reports' ? 'reports' : 'tasks'));
    } else if (nav === 'settings') {
      setActiveTabState('settings');
    }
  }, [companySubTab, workSubTab]);

  const setCompanySubTab = useCallback((sub: CompanySubTab) => {
    setCompanySubTabState(sub);
    if (sub === 'projects') setActiveTabState('projects');
    else if (sub === 'employees') setActiveTabState('employees');
    else setActiveTabState('office');
  }, []);

  const setWorkSubTab = useCallback((sub: WorkSubTab) => {
    setWorkSubTabState(sub);
    if (sub === 'decisions') setActiveTabState('decisions');
    else if (sub === 'reports') setActiveTabState('reports');
    else setActiveTabState('tasks');
  }, []);

  // Real Execution Plans
  const [plans, setPlans] = useState<ExecutionPlan[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_plans`);
    return saved ? JSON.parse(saved) : INITIAL_PLANS;
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_plans`, JSON.stringify(plans));
  }, [plans]);

  const [selectedPlan, setSelectedPlan] = useState<ExecutionPlan | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState<boolean>(false);

  // Real Executive Advisor (Chief of Staff)
  const [isAdvisorDrawerOpen, setIsAdvisorDrawerOpen] = useState<boolean>(false);
  const [advisorMessages, setAdvisorMessages] = useState<AdvisorMessage[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_advisor_msgs`);
    return saved ? JSON.parse(saved) : [
      {
        id: 'adv-init-1',
        sender: 'advisor',
        text: 'مرحباً بك يا أبا أحمد. بصفتي المستشار التنفيذي للشركة (Chief of Staff)، لخصت لك مستجدات اليوم: فريق قدّها يعمل على فحص مسارات الغرف، ومشروع مُعين وصل 82%، وعندك قراران بانتظار توقيعك. وجّهني بأي استراتيجية ترغب بتنفيذها فوراً.',
        timestamp: '09:00',
        suggestedActions: [
          { label: 'ابدأ فحص قدّها وتطوير الألعاب', prompt: 'راجع قدّها وطور تجربة الألعاب وخله جاهز للاستخدام' },
          { label: 'ما هي القرارات المعلقة؟', prompt: 'ما هي القرارات التي تحتاج تدخلي الآن؟' },
          { label: 'مراجعة جاهزية التكاليف $0.00', prompt: 'تأكد من التزام جميع الفرق بالقانون رقم 1 والتكلفة الصفرية' }
        ]
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_advisor_msgs`, JSON.stringify(advisorMessages));
  }, [advisorMessages]);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedReport, setSelectedReport] = useState<CompanyReport | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isGMSummaryOpen, setIsGMSummaryOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState<boolean>(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [isCeoCommandOpen, setIsCeoCommandOpen] = useState<boolean>(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState<boolean>(false);
  const [focusedZone, setFocusedZone] = useState<string | null>(null);

  const [meetingSession, setMeetingSession] = useState<MeetingSession | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_meeting`);
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (meetingSession) {
      localStorage.setItem(`${STORAGE_KEY}_meeting`, JSON.stringify(meetingSession));
    } else {
      localStorage.removeItem(`${STORAGE_KEY}_meeting`);
    }
  }, [meetingSession]);
  
  const [controlLevel, setControlLevel] = useState<CEOControlLevel>('requires_approval');
  const [isCompanyOperating, setIsCompanyOperating] = useState<boolean>(true);
  const [isAutoSimulationActive, setIsAutoSimulationActive] = useState<boolean>(true);

  // OpenHands Engine & Sandbox Execution
  const [openHandsSession, setOpenHandsSession] = useState<OpenHandsExecutionResult | null>(null);
  const [isOpenHandsTerminalOpen, setIsOpenHandsTerminalOpen] = useState<boolean>(false);

  const openOpenHandsTerminal = useCallback((session: OpenHandsExecutionResult) => {
    setOpenHandsSession(session);
    setIsOpenHandsTerminalOpen(true);
  }, []);

  const closeOpenHandsTerminal = useCallback(() => {
    setIsOpenHandsTerminalOpen(false);
  }, []);

  const runOpenHandsAudit = useCallback(async (agentId: string, projectId: ProjectId, taskTitle?: string): Promise<OpenHandsExecutionResult> => {
    const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    const emp = employees.find(e => e.id === agentId) || employees.find(e => e.id === 'fahad') || employees[0];
    const engine = OpenHandsEngine.getInstance();
    const effectiveProj: 'mueen' | 'qaddha' | 'hq' = ((projectId as unknown as string) === 'all' || !projectId) ? 'hq' : (projectId as 'mueen' | 'qaddha' | 'hq');
    const result = await engine.executeTechnicalTask({
      agentId: emp.id,
      agentName: emp.name,
      projectId: effectiveProj,
      taskTitle: taskTitle || `فحص برمجي وتحقق تقني شامل عبر OpenHands لمشروع ${effectiveProj}`,
      objective: `فحص الكود البرمجي وضمان انعدام التكاليف ($0.00) والعمل بدون خوادم مأجورة`
    });

    setOpenHandsSession(result);
    setIsOpenHandsTerminalOpen(true);

    setActivities(prev => [{
      id: createUniqueId('act'),
      timestamp: timeStr,
      actor: emp.name,
      actorAvatar: emp.avatar,
      actorRole: emp.position,
      department: emp.departmentName,
      actionText: `شغّل محرك OpenHands للتدقيق البرمجي: ${result.summary} ($0.00)`,
      projectId: effectiveProj,
      type: 'milestone',
      isAutonomous: true
    }, ...prev]);

    return result;
  }, [employees]);

  // Derived tasks from projects
  const tasks = projects.flatMap(p => 
    (p.tasks || []).map(t => ({
      ...t,
      projectId: t.projectId || p.id
    }))
  );

  const createExecutionPlan = useCallback((goal: string, targetProjectId?: ProjectId, customTitle?: string): ExecutionPlan => {
    const text = goal.toLowerCase();
    let projId: ProjectId = targetProjectId || 'qaddha';
    let projName = 'قدّها';

    if (text.includes('معين') || text.includes('مُعين') || text.includes('قران') || text.includes('مصحف') || text.includes('mueen')) {
      projId = 'mueen';
      projName = 'مُعِين';
    } else if (text.includes('قدها') || text.includes('قدّها') || text.includes('لعب') || text.includes('game') || text.includes('qaddha')) {
      projId = 'qaddha';
      projName = 'قدّها';
    } else if (!targetProjectId) {
      projId = 'hq';
      projName = 'الشركة العامة';
    }

    const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    const planId = createUniqueId('plan');
    const title = customTitle || (goal.length > 50 ? `خطة: ${goal.slice(0, 50)}...` : `خطة: ${goal}`);

    let steps: ExecutionStep[] = [];
    let team: { id: string; name: string; role: string; avatar: string }[] = [];

    if (projId === 'qaddha') {
      team = [
        { id: 'rayan', name: 'ريان', role: 'مدير مشروع قدّها', avatar: '🎮' },
        { id: 'fahad', name: 'فهد', role: 'كبير المهندسين', avatar: '👨‍💻' },
        { id: 'layan', name: 'ليان', role: 'رئيسة التصميم', avatar: '👩‍🎨' },
        { id: 'noura', name: 'نورة', role: 'كبيرة المحللين والجودة', avatar: '📊' },
        { id: 'omar', name: 'عمر', role: 'مدير التسويق', avatar: '📈' }
      ];
      steps = [
        {
          id: `${planId}-step-1`,
          stepNumber: 1,
          title: 'مراجعة واجهات وتجربة اللعب (UI/UX Audit)',
          objective: 'فحص واجهات غرف وتحديات قدّها على شاشات الجوال لضمان سرعة التفاعل ووضوح الأسئلة.',
          assigneeId: 'layan',
          assigneeName: 'ليان',
          assigneeRole: 'التصميم والإبداع',
          assigneeAvatar: '👩‍🎨',
          expectedResult: 'تحديث بطاقات الأسئلة والتأكد من التباين اللوني الجذاب.',
          dependencies: [],
          status: 'READY',
          progress: 0
        },
        {
          id: `${planId}-step-2`,
          stepNumber: 2,
          title: 'مراجعة مسارات غرف اللعب اللحظية (Game Routes Audit)',
          objective: 'فحص اتصال الغرف اللحظي P2P وسلاسة انضمام اللاعبين بالرابط المباشر بدون تحميل.',
          assigneeId: 'fahad',
          assigneeName: 'فهد',
          assigneeRole: 'التقنية والتطوير',
          assigneeAvatar: '👨‍💻',
          expectedResult: 'استقرار الغرف وتأكيد صفرية تكاليف الخوادم بالاعتماد على WebRTC المجانية.',
          dependencies: [`${planId}-step-1`],
          status: 'READY',
          progress: 0
        },
        {
          id: `${planId}-step-3`,
          stepNumber: 3,
          title: 'اختبار كل لعبة ورصد التفاعلات المعطلة',
          objective: 'تجربة كافة أنماط التحدي واختبار احتساب النقاط وجرس النهاية بدقة متناهية.',
          assigneeId: 'noura',
          assigneeName: 'نورة',
          assigneeRole: 'التحليلات والجودة',
          assigneeAvatar: '📊',
          expectedResult: 'رصد أي تعارض أو تأخير وتوثيق الحلول المطلوبة.',
          dependencies: [`${planId}-step-2`],
          status: 'READY',
          progress: 0
        },
        {
          id: `${planId}-step-4`,
          stepNumber: 4,
          title: 'معالجة الملاحظات البرمجية ذات الأولوية القصوى',
          objective: 'تحسين سرعة الاستجابة لزمن أقل من 50ms وضمان التوافق مع متصفحات الآيفون والأندرويد.',
          assigneeId: 'fahad',
          assigneeName: 'فهد',
          assigneeRole: 'التقنية والتطوير',
          assigneeAvatar: '👨‍💻',
          expectedResult: 'تحديث الكود واعتماد استقرار الأداء بنسبة 100%.',
          dependencies: [`${planId}-step-3`],
          status: 'READY',
          progress: 0
        },
        {
          id: `${planId}-step-5`,
          stepNumber: 5,
          title: 'إعادة الاختبار وضمان الجودة الشاملة (QA Review)',
          objective: 'فحص نهائي لتجربة المستخدم على 5 أنواع من الأجهزة.',
          assigneeId: 'rayan',
          assigneeName: 'ريان',
          assigneeRole: 'إدارة المشروع',
          assigneeAvatar: '🎮',
          expectedResult: 'إغلاق الملاحظات وجاهزية اللعبة الكاملة للمستخدمين.',
          dependencies: [`${planId}-step-4`],
          status: 'READY',
          progress: 0
        },
        {
          id: `${planId}-step-6`,
          stepNumber: 6,
          title: 'إعداد التقرير النهائي ورفعه للرئيس التنفيذي نواف',
          objective: 'توثيق مؤشرات الجاهزية التشغيلية وخطة الانتشار العضوي المجاني.',
          assigneeId: 'rayan',
          assigneeName: 'ريان',
          assigneeRole: 'إدارة المشروع',
          assigneeAvatar: '🎮',
          expectedResult: 'تقرير تنفيذي كامل يعرض في مركز القرارات لاعتماد الإطلاق.',
          dependencies: [`${planId}-step-5`],
          status: 'WAITING_FOR_NAWAF',
          progress: 0
        }
      ];
    } else if (projId === 'mueen') {
      team = [
        { id: 'tareq', name: 'طارق', role: 'مدير مشروع مُعِين', avatar: '📖' },
        { id: 'fahad', name: 'فهد', role: 'كبير المهندسين', avatar: '👨‍💻' },
        { id: 'layan', name: 'ليان', role: 'رئيسة التصميم', avatar: '👩‍🎨' },
        { id: 'noura', name: 'نورة', role: 'كبيرة المحللين', avatar: '📊' }
      ];
      steps = [
        {
          id: `${planId}-step-1`,
          stepNumber: 1,
          title: 'مراجعة الخط العثماني والرسم القرآني المعتمد',
          objective: 'التأكد من مطابقة الرسم لمجمع الملك فهد بن عبد العزيز لطباعة المصحف الشريف.',
          assigneeId: 'tareq',
          assigneeName: 'طارق',
          assigneeRole: 'إدارة المشروع والتدقيق',
          assigneeAvatar: '📖',
          expectedResult: 'تأكيد دقة 114 سورة وعلامات الوقف المعتمدة.',
          dependencies: [],
          status: 'READY',
          progress: 0
        },
        {
          id: `${planId}-step-2`,
          stepNumber: 2,
          title: 'مزامنة التلاوات الصوتية والتظليل اللحظي للآيات',
          objective: 'فحص دقة تظليل الآية مع صوت القارئ بدون أي تأخير بالملي ثانية.',
          assigneeId: 'fahad',
          assigneeName: 'فهد',
          assigneeRole: 'التقنية والتطوير',
          assigneeAvatar: '👨‍💻',
          expectedResult: 'مزامنة دقيقة وميزة التكرار المتقن للحفظ والمراجعة.',
          dependencies: [`${planId}-step-1`],
          status: 'READY',
          progress: 0
        },
        {
          id: `${planId}-step-3`,
          stepNumber: 3,
          title: 'تحسين تجربة القراءة الليلية والخطوط المريحة',
          objective: 'ضبط تباين الوضع الليلي وحجم الخطوط لكبار السن وتوفير استهلاك بطارية الهاتف.',
          assigneeId: 'layan',
          assigneeName: 'ليان',
          assigneeRole: 'التصميم والإبداع',
          assigneeAvatar: '👩‍🎨',
          expectedResult: 'سمات بصرية فاخرة وألوان مريحة للعين في القراءة الطويلة.',
          dependencies: [`${planId}-step-2`],
          status: 'READY',
          progress: 0
        },
        {
          id: `${planId}-step-4`,
          stepNumber: 4,
          title: 'تأكيد العمل التام دون اتصال بالإنترنت (Offline First)',
          objective: 'تخزين التفسير والآيات محلياً لضمان القراءة في أي وقت بدون استهلاك بيانات.',
          assigneeId: 'fahad',
          assigneeName: 'فهد',
          assigneeRole: 'التقنية والتطوير',
          assigneeAvatar: '👨‍💻',
          expectedResult: 'تخزين خفيف لا يتعدى 25MB وتشغيل فوري في وضع الطيران.',
          dependencies: [`${planId}-step-3`],
          status: 'READY',
          progress: 0
        },
        {
          id: `${planId}-step-5`,
          stepNumber: 5,
          title: 'إعداد تقرير الجاهزية والرفع للاعتماد النهائي',
          objective: 'عرض المخرجات والمصادقة على الجاهزية للإطلاق.',
          assigneeId: 'tareq',
          assigneeName: 'طارق',
          assigneeRole: 'إدارة المشروع',
          assigneeAvatar: '📖',
          expectedResult: 'تقرير شامل بانتظار توقيع أبي أحمد.',
          dependencies: [`${planId}-step-4`],
          status: 'WAITING_FOR_NAWAF',
          progress: 0
        }
      ];
    } else {
      team = [
        { id: 'sara', name: 'سارة', role: 'مديرة المشاريع العامة', avatar: '⚡' },
        { id: 'fahad', name: 'فهد', role: 'كبير المهندسين', avatar: '👨‍💻' },
        { id: 'omar', name: 'عمر', role: 'مدير التسويق', avatar: '📈' },
        { id: 'noura', name: 'نورة', role: 'محلل أول', avatar: '📊' }
      ];
      steps = [
        {
          id: `${planId}-step-1`,
          stepNumber: 1,
          title: 'التحليل المبدئي وتحديد المتطلبات الاستراتيجية',
          objective: `دراسة الهدف: «${goal}» وتحديد المسار الأمثل بأقل جهد وتكلفة صفرية.`,
          assigneeId: 'sara',
          assigneeName: 'سارة',
          assigneeRole: 'إدارة العمليات',
          assigneeAvatar: '⚡',
          expectedResult: 'وثيقة واضحة لتوزيع الأدوار بين أعضاء الفريق.',
          dependencies: [],
          status: 'READY',
          progress: 0
        },
        {
          id: `${planId}-step-2`,
          stepNumber: 2,
          title: 'التنفيذ التقني والتطوير الذاتي المستقل',
          objective: 'بناء وحل المتطلبات بأعلى معايير الجودة والأمان.',
          assigneeId: 'fahad',
          assigneeName: 'فهد',
          assigneeRole: 'التقنية والتطوير',
          assigneeAvatar: '👨‍💻',
          expectedResult: 'تسليم كود مستقر وحلول مجربة.',
          dependencies: [`${planId}-step-1`],
          status: 'READY',
          progress: 0
        },
        {
          id: `${planId}-step-3`,
          stepNumber: 3,
          title: 'مراجعة المخرجات وضمان الجودة والتحقق',
          objective: 'التأكد من التوافق التام ومطابقة النتائج لرؤية الرئيس التنفيذي.',
          assigneeId: 'noura',
          assigneeName: 'نورة',
          assigneeRole: 'الجودة والتحليل',
          assigneeAvatar: '📊',
          expectedResult: 'تقرير تدقيق الجودة وخلو المخرجات من العيوب.',
          dependencies: [`${planId}-step-2`],
          status: 'READY',
          progress: 0
        },
        {
          id: `${planId}-step-4`,
          stepNumber: 4,
          title: 'الاعتماد النهائي ورفع النتائج للمدير التنفيذي',
          objective: 'توثيق الإنجاز وتقديم التوصيات للمرحلة القادمة.',
          assigneeId: 'sara',
          assigneeName: 'سارة',
          assigneeRole: 'إدارة العمليات',
          assigneeAvatar: '⚡',
          expectedResult: 'تقرير تنفيذي جاهز في لوحة القرارات بانتظار الاعتماد.',
          dependencies: [`${planId}-step-3`],
          status: 'WAITING_FOR_NAWAF',
          progress: 0
        }
      ];
    }

    const newPlan: ExecutionPlan = {
      id: planId,
      title,
      goal,
      projectId: projId,
      projectName: projName,
      createdAt: timeStr,
      status: 'PLANNING',
      team,
      steps,
      estimatedComplexity: steps.length > 5 ? 'مرتفع' : 'متوسط',
      whatRequiresApproval: 'اعتماد خطة العمل وبدء التنفيذ المستقل للفرق الذكية',
      summary: `تم إعداد مسودة الخطة التنفيذية استجابةً لتوجيهك: «${goal}». الخطة تحتوي على ${steps.length} خطوات محكمة التوزيع على ${team.length} من كفاءات الشركة الذكية بالتزام تام بالتكلفة الصفرية ($0.00).`
    };

    setPlans(prev => [newPlan, ...prev]);
    setSelectedPlan(newPlan);
    setIsPlanModalOpen(true);

    const advMsg: AdvisorMessage = {
      id: createUniqueId('msg'),
      sender: 'advisor',
      text: `صممت لك خطة عمل تنفيذية متكاملة لـ «${title}» مقسمة إلى ${steps.length} خطوات محكمة ومسندة للفرق الذكية بالتزام تام بالتكلفة الصفرية ($0.00). تفضل بمراجعتها واعتماد البدء.`,
      timestamp: timeStr,
      relatedPlan: newPlan
    };
    setAdvisorMessages(prev => [...prev, advMsg]);

    return newPlan;
  }, []);

  const approveExecutionPlan = useCallback((planId: string) => {
    const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

    setPlans(prevPlans => {
      const plan = prevPlans.find(p => p.id === planId);
      if (!plan) return prevPlans;

      const updatedSteps = plan.steps.map((step, idx) => {
        if (idx === 0) {
          return {
            ...step,
            status: 'WORKING' as const,
            progress: 30,
            startedAt: timeStr
          };
        }
        return step;
      });

      const updatedPlan: ExecutionPlan = {
        ...plan,
        status: 'IN_PROGRESS',
        approvedByCeoAt: timeStr,
        steps: updatedSteps
      };

      const targetProjId = plan.projectId;
      const step1 = updatedSteps[0];

      if (step1) {
        setEmployees(prevEmp => prevEmp.map(emp => {
          if (emp.id === step1.assigneeId) {
            return {
              ...emp,
              status: 'WORKING',
              currentTask: step1.title
            };
          }
          return emp;
        }));
      }

      setProjects(prevProjects => prevProjects.map(proj => {
        if (proj.id === targetProjId) {
          const newTasks: ProjectTask[] = updatedSteps.map(step => ({
            id: `task-${step.id}`,
            title: step.title,
            objective: step.objective,
            expectedResult: step.expectedResult,
            planId: plan.id,
            planStepId: step.id,
            assigneeName: step.assigneeName,
            assigneeRole: step.assigneeRole,
            assigneeAvatar: step.assigneeAvatar,
            status: step.status === 'WORKING' ? 'in_progress' : (step.status === 'COMPLETED' ? 'completed' : 'todo'),
            priority: 'high',
            progress: step.progress,
            projectId: targetProjId,
            dependencies: step.dependencies
          }));

          return {
            ...proj,
            tasks: [...newTasks, ...(proj.tasks || [])]
          };
        }
        return proj;
      }));

      setActivities(prevAct => [{
        id: createUniqueId('act'),
        timestamp: timeStr,
        actor: 'نواف (الرئيس التنفيذي)',
        actorAvatar: '👑',
        actorRole: 'الرئيس التنفيذي',
        department: 'الإدارة العليا',
        actionText: `اعتمد رسمياً الخطة التنفيذية «${plan.title}» وبدأت الفرق التنفيذ المستقل`,
        projectId: plan.projectId,
        type: 'decision',
        isAutonomous: false
      }, ...prevAct]);

      setAdvisorMessages(prev => [
        ...prev,
        {
          id: createUniqueId('msg'),
          sender: 'advisor',
          text: `تم اعتماد الخطة بنجاح! بدأ ${step1?.assigneeName || 'الفريق'} الآن الخطوة الأولى: «${step1?.title}». شركتك الذكية ستنجز المهام بنظام التتابع الآلي دون إشغالك.`,
          timestamp: timeStr
        }
      ]);

      return prevPlans.map(p => p.id === planId ? updatedPlan : p);
    });

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }

    setIsPlanModalOpen(false);
  }, []);

  const updateTaskStatus = useCallback((taskId: string, newStatus: ProjectTask['status'], result?: string) => {
    let targetPlanId: string | undefined;
    let targetStepId: string | undefined;

    setProjects(prevProjects => prevProjects.map(p => ({
      ...p,
      tasks: (p.tasks || []).map(t => {
        if (t.id === taskId) {
          targetPlanId = t.planId;
          targetStepId = t.planStepId;
          const updatedProgress = newStatus === 'completed' ? 100 : (newStatus === 'in_progress' ? 65 : (t.progress || 20));
          return {
            ...t,
            status: newStatus,
            result: result !== undefined ? result : t.result,
            progress: updatedProgress
          };
        }
        return t;
      })
    })));

    const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

    // Handle Execution Plan Progression
    if (newStatus === 'completed' && targetPlanId && targetStepId) {
      setPlans(prevPlans => prevPlans.map(plan => {
        if (plan.id !== targetPlanId) return plan;

        let completedStepTitle = '';
        const updatedSteps = plan.steps.map(step => {
          if (step.id === targetStepId) {
            completedStepTitle = step.title;
            return {
              ...step,
              status: 'COMPLETED' as const,
              progress: 100,
              result: result || step.expectedResult || 'اكتملت الخطوة بنجاح وتم التحقق من الجودة.'
            };
          }
          return step;
        });

        // Find next step whose dependencies are satisfied
        const completedStepIds = updatedSteps.filter(s => s.status === 'COMPLETED').map(s => s.id);
        let nextWorkingStep: ExecutionStep | null = null;

        const nextSteps = updatedSteps.map(step => {
          if (step.status === 'READY' && !nextWorkingStep) {
            const depsSatisfied = step.dependencies.every(d => completedStepIds.includes(d));
            if (depsSatisfied) {
              nextWorkingStep = { ...step, status: 'WORKING' as const, progress: 25, startedAt: timeStr };
              return nextWorkingStep;
            }
          }
          return step;
        });

        const allCompleted = nextSteps.every(s => s.status === 'COMPLETED');

        // If next step found, update assigned employee
        if (nextWorkingStep) {
          const empToWork = (nextWorkingStep as ExecutionStep).assigneeId;
          setEmployees(prevEmp => prevEmp.map(emp => {
            if (emp.id === empToWork) {
              return {
                ...emp,
                status: 'WORKING',
                currentTask: (nextWorkingStep as ExecutionStep).title
              };
            }
            return emp;
          }));

          setActivities(prevAct => [{
            id: createUniqueId('act'),
            timestamp: timeStr,
            actor: (nextWorkingStep as ExecutionStep).assigneeName,
            actorAvatar: (nextWorkingStep as ExecutionStep).assigneeAvatar,
            actorRole: (nextWorkingStep as ExecutionStep).assigneeRole,
            department: 'العمليات والتنفيذ',
            actionText: `استلم تلقائياً الخطوة التالية في الخطة: «${(nextWorkingStep as ExecutionStep).title}»`,
            projectId: plan.projectId,
            type: 'task',
            isAutonomous: true
          }, ...prevAct]);
        }

        if (allCompleted) {
          // Log plan completion and add report
          setActivities(prevAct => [{
            id: createUniqueId('act'),
            timestamp: timeStr,
            actor: 'نظام قيادة العمليات الذكية',
            actorAvatar: '🎯',
            actorRole: 'نظام إدارة المشاريع',
            department: 'الإدارة العليا',
            actionText: `أنجز الفريق كافة مراحل الخطة «${plan.title}» بنجاح وتكلفة صفرية ($0.00)`,
            projectId: plan.projectId,
            type: 'milestone',
            isAutonomous: true
          }, ...prevAct]);

          setAdvisorMessages(prevMsg => [
            ...prevMsg,
            {
              id: createUniqueId('msg'),
              sender: 'advisor',
              text: `أبشر يا أبا أحمد! تم إنجاز جميع خطوات الخطة «${plan.title}» بنجاح كامل ومراجعة الجودة. تم توثيق المخرجات النهائية وإغلاق الخطة.`,
              timestamp: timeStr
            }
          ]);
        }

        return {
          ...plan,
          status: allCompleted ? 'COMPLETED' : plan.status,
          completedAt: allCompleted ? timeStr : plan.completedAt,
          steps: nextSteps
        };
      }));
    }

    if (newStatus === 'completed') {
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {
        // safe fallback
      }
    }

    const statusLabel = newStatus === 'completed' ? 'أكمل المهمة بنجاح' : (newStatus === 'in_progress' ? 'بدأ العمل على' : 'حدّث حالة');
    setActivities(prev => [{
      id: createUniqueId('act'),
      timestamp: timeStr,
      actor: 'نظام إدارة العمليات',
      actorAvatar: '⚡',
      actorRole: 'العمليات والتنفيذ',
      department: 'العمليات',
      actionText: `${statusLabel}: «${taskId}»`,
      type: 'task',
      isAutonomous: true
    }, ...prev]);
  }, []);

  const addNewTask = useCallback((taskData: Omit<ProjectTask, 'id'>) => {
    const targetProjId = taskData.projectId || 'qaddha';
    const newTask: ProjectTask = {
      ...taskData,
      id: createUniqueId('task'),
      projectId: targetProjId,
      status: taskData.status || 'in_progress',
      progress: taskData.progress || 20
    };

    setProjects(prev => prev.map(p => {
      if (p.id === targetProjId) {
        return {
          ...p,
          tasks: [newTask, ...(p.tasks || [])]
        };
      }
      return p;
    }));

    const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    setActivities(prev => [{
      id: createUniqueId('act'),
      timestamp: timeStr,
      actor: 'نواف (الرئيس التنفيذي)',
      actorAvatar: '👑',
      actorRole: 'الرئيس التنفيذي',
      department: 'الإدارة العليا',
      actionText: `أضاف مهمة جديدة: «${newTask.title}» موجهة إلى ${newTask.assigneeName}`,
      projectId: targetProjId,
      type: 'task',
      isAutonomous: false
    }, ...prev]);
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setProjects(prev => prev.map(p => ({
      ...p,
      tasks: (p.tasks || []).filter(t => t.id !== taskId)
    })));
  }, []);

  // Meetings
  const startMeeting = useCallback((topic: string, attendeeIds?: string[]) => {
    const attendees = attendeeIds && attendeeIds.length > 0 
      ? attendeeIds 
      : ['sarah', 'fahad', 'omar', 'layan', 'tareq', 'noura'];

    const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

    setEmployees(prev => prev.map(emp => {
      if (attendees.includes(emp.id)) {
        return {
          ...emp,
          status: 'MEETING',
          currentTask: `حضور اجتماع: ${topic}`
        };
      }
      return emp;
    }));

    const initialMsg: MeetingMessage = {
      id: createUniqueId('msg'),
      senderId: 'sarah',
      senderName: 'سارة',
      senderRole: 'مديرة المشاريع العامة',
      senderAvatar: '🤖',
      text: `أهلاً بالجميع في قاعة الاجتماعات الكبرى. افتتحنا الجلسة لبحث موضوع: «${topic}». المطلوب هو وضع حلول تنفيذية مباشرة بتكلفة صفرية $0.00 وفق القانون رقم 1.`,
      timestamp: timeStr
    };

    const newMeeting: MeetingSession = {
      id: createUniqueId('meet'),
      topic,
      status: 'active',
      attendees,
      messages: [initialMsg],
      startedAt: timeStr
    };

    setMeetingSession(newMeeting);
    setIsMeetingModalOpen(true);

    setActivities(prev => [{
      id: createUniqueId('act'),
      timestamp: timeStr,
      actor: 'نواف (الرئيس التنفيذي)',
      actorAvatar: '👑',
      actorRole: 'الرئيس التنفيذي',
      department: 'الإدارة العليا',
      actionText: `دعا إلى اجتماع استراتيجي في قاعة الاجتماعات الكبرى: «${topic}»`,
      type: 'collaboration',
      isAutonomous: false
    }, ...prev]);
  }, []);

  const endMeeting = useCallback(() => {
    if (!meetingSession) return;
    const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

    setEmployees(prev => prev.map(emp => {
      if (meetingSession.attendees.includes(emp.id)) {
        return {
          ...emp,
          status: 'WORKING',
          currentTask: `استكمال مخرجات اجتماع: ${meetingSession.topic}`
        };
      }
      return emp;
    }));

    setMeetingSession(null);
    setIsMeetingModalOpen(false);

    setActivities(prev => [{
      id: createUniqueId('act'),
      timestamp: timeStr,
      actor: 'سارة',
      actorAvatar: '🤖',
      actorRole: 'مديرة المشاريع',
      department: 'إدارة المشاريع',
      actionText: `اختتمت الاجتماع حول «${meetingSession.topic}» وتم توثيق القرارات التنفيذية بنجاح`,
      type: 'collaboration',
      isAutonomous: true
    }, ...prev]);
  }, [meetingSession]);

  const sendMeetingMessage = useCallback((senderId: string, text: string) => {
    const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

    let senderName = 'نواف';
    let senderRole = 'الرئيس التنفيذي';
    let senderAvatar = '👑';

    if (senderId !== 'nawaf') {
      const emp = employees.find(e => e.id === senderId);
      if (emp) {
        senderName = emp.name;
        senderRole = emp.position;
        senderAvatar = emp.avatar;
      }
    }

    const newMsg: MeetingMessage = {
      id: createUniqueId('msg'),
      senderId,
      senderName,
      senderRole,
      senderAvatar,
      text,
      timestamp: timeStr
    };

    setMeetingSession(prev => prev ? {
      ...prev,
      messages: [...prev.messages, newMsg]
    } : null);

    if (senderId === 'nawaf') {
      setTimeout(() => {
        const responders = ['fahad', 'omar', 'layan', 'tareq', 'noura', 'sarah'];
        const randomId = responders[Math.floor(Math.random() * responders.length)];
        const responder = employees.find(e => e.id === randomId) || employees[0];
        if (responder) {
          const replies = [
            `توجيهك واضح يا أستاذ نواف. قمت بتسجيل النقطة وسأقوم باختبار التطبيق فورياً.`,
            `متفق تماماً، سنعتمد هذا التوجه وسننهي المسودة بدون أي تكلفة إضافية.`,
            `ممتاز جداً، سأنسق مع الفريق لنشر التحديث خلال الجولة القادمة.`,
            `تم استيعاب الملاحظة وجاري مواءمة المتطلبات مع أعضاء الفريق.`
          ];
          const chosenReply = replies[Math.floor(Math.random() * replies.length)];
          const replyMsg: MeetingMessage = {
            id: createUniqueId('msg'),
            senderId: responder.id,
            senderName: responder.name,
            senderRole: responder.position,
            senderAvatar: responder.avatar,
            text: chosenReply,
            timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
          };
          setMeetingSession(curr => curr ? {
            ...curr,
            messages: [...curr.messages, replyMsg]
          } : null);
        }
      }, 1000);
    }
  }, [employees]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_departments`, JSON.stringify(departments));
    localStorage.setItem(`${STORAGE_KEY}_projects`, JSON.stringify(projects));
    localStorage.setItem(`${STORAGE_KEY}_employees`, JSON.stringify(employees));
    localStorage.setItem(`${STORAGE_KEY}_decisions`, JSON.stringify(decisions));
    localStorage.setItem(`${STORAGE_KEY}_ideas`, JSON.stringify(ideas));
    localStorage.setItem(`${STORAGE_KEY}_activities`, JSON.stringify(activities));
    localStorage.setItem(`${STORAGE_KEY}_campaigns`, JSON.stringify(campaigns));
    localStorage.setItem(`${STORAGE_KEY}_reports`, JSON.stringify(reports));
  }, [departments, projects, employees, decisions, ideas, activities, campaigns, reports]);

  // Derived Metrics matching exactly the approved UI
  const metrics = {
    workingEmployees: employees.filter(e => e.status !== 'متوقف مؤقتًا').length,
    completedTasks: 3,
    inProgressTasks: 5,
    pendingDecisions: decisions.filter(d => d.status === 'waiting').length,
    productivityRate: 87,
  };

  // Sound/Vibe confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#6366f1', '#a855f7', '#10b981']
      });
    } catch {
      // safe fallback
    }
  };

  // Approve Decision
  const approveDecision = useCallback((id: string, note?: string) => {
    setDecisions(prev => prev.map(d => {
      if (d.id === id) {
        return { ...d, status: 'approved', ceoNote: note || 'تم الاعتماد المباشر من نواف (الرئيس التنفيذي)' };
      }
      return d;
    }));

    const targetDec = decisions.find(d => d.id === id);
    if (targetDec) {
      triggerConfetti();

      // If it was Qaddha campaign decision, update campaign status
      if (targetDec.projectId === 'qaddha' && targetDec.id === 'dec-1') {
        setCampaigns(prev => prev.map(c => c.id === 'camp-1' ? { ...c, status: 'published' } : c));
      }

      // If there are plan steps waiting for CEO approval, complete them
      setPlans(prev => prev.map(plan => {
        const hasWaitingStep = plan.steps.some(s => s.status === 'WAITING_FOR_NAWAF');
        if (hasWaitingStep) {
          const updatedSteps = plan.steps.map(s => 
            s.status === 'WAITING_FOR_NAWAF' ? { ...s, status: 'COMPLETED' as const, progress: 100 } : s
          );
          return { ...plan, steps: updatedSteps };
        }
        return plan;
      }));

      // If tasks required CEO approval in this project, complete them and update project progress mathematically
      if (targetDec.projectId) {
        setProjects(prev => prev.map(p => {
          if (p.id === targetDec.projectId) {
            const updatedTasks = p.tasks.map(t => t.status === 'needs_ceo' ? { ...t, status: 'completed' as const } : t);
            const compCount = updatedTasks.filter(t => t.status === 'completed').length;
            const newProgress = updatedTasks.length > 0 ? Math.round((compCount / updatedTasks.length) * 100) : p.progress;
            return { ...p, tasks: updatedTasks, progress: newProgress, health: 'ممتاز' };
          }
          return p;
        }));
      }

      // Add live activity
      const newAct: ActivityEvent = {
        id: createUniqueId('act'),
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        actor: 'نواف',
        actorAvatar: '👑',
        actorRole: 'الرئيس التنفيذي (CEO)',
        department: 'مركز القيادة',
        actionText: `اعتمد رسمياً: «${targetDec.title}»`,
        projectId: targetDec.projectId,
        type: 'decision',
        isAutonomous: false
      };
      setActivities(prev => [newAct, ...prev]);
    }
  }, [decisions]);

  // Request CEO Approval (Real Approval Record)
  const requestCEOApproval = useCallback((params: {
    title: string;
    description: string;
    projectId?: ProjectId;
    department?: string;
    requestedBy?: string;
    impact?: 'حاسم' | 'مرتفع' | 'متوسط';
  }): Decision => {
    const newId = createUniqueId('dec');
    const effectiveProjectId: ProjectId = params.projectId || 'hq';
    const newDecision: Decision = {
      id: newId,
      title: params.title,
      description: params.description,
      projectId: effectiveProjectId,
      department: params.department || 'إدارة العمليات',
      proposer: params.requestedBy || 'سارة (مديرة العمليات)',
      impact: params.impact || 'مرتفع',
      estimatedCost: '0$ (مجاني)',
      estimatedTime: 'فوري',
      status: 'waiting',
      controlLevel: 'requires_approval',
      timestamp: 'الآن',
      tags: ['اعتماد_رسمي'],
      financialImpact: false
    };

    setDecisions(prev => [newDecision, ...prev]);

    const newAct: ActivityEvent = {
      id: createUniqueId('act'),
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      actor: params.requestedBy || 'سارة',
      actorAvatar: '👑',
      actorRole: 'إدارة العمليات',
      department: params.department || 'مركز القيادة',
      actionText: `رفع طلب قرار رسمي إلى الرئيس التنفيذي: «${params.title}»`,
      projectId: effectiveProjectId,
      type: 'decision',
      isAutonomous: true
    };
    setActivities(prev => [newAct, ...prev]);

    return newDecision;
  }, []);

  // Reject Decision
  const rejectDecision = useCallback((id: string, reason?: string) => {
    setDecisions(prev => prev.map(d => {
      if (d.id === id) {
        return { ...d, status: 'rejected', ceoNote: reason || 'مرفوض بتوجيه من الرئيس التنفيذي نواف' };
      }
      return d;
    }));

    const targetDec = decisions.find(d => d.id === id);
    if (targetDec) {
      const newAct: ActivityEvent = {
        id: createUniqueId('act'),
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        actor: 'نواف',
        actorAvatar: '👑',
        actorRole: 'الرئيس التنفيذي (CEO)',
        department: 'مركز القيادة',
        actionText: `رفض مقترح: «${targetDec.title}» (السبب: حماية الميزانية والأولويات)`,
        projectId: targetDec.projectId,
        type: 'decision',
        isAutonomous: false
      };
      setActivities(prev => [newAct, ...prev]);
    }
  }, [decisions]);

  // Modify Decision
  const modifyDecision = useCallback((id: string, instruction: string) => {
    setDecisions(prev => prev.map(d => {
      if (d.id === id) {
        return { ...d, status: 'modified', ceoNote: instruction };
      }
      return d;
    }));

    const targetDec = decisions.find(d => d.id === id);
    if (targetDec) {
      const newAct: ActivityEvent = {
        id: createUniqueId('act'),
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        actor: 'نواف',
        actorAvatar: '👑',
        actorRole: 'الرئيس التنفيذي (CEO)',
        department: 'مركز القيادة',
        actionText: `وجّه بتعديل مقترح «${targetDec.title}»: ${instruction}`,
        projectId: targetDec.projectId,
        type: 'decision',
        isAutonomous: false
      };
      setActivities(prev => [newAct, ...prev]);
    }
  }, [decisions]);

  // Update employee status
  const updateEmployeeStatus = useCallback((empId: string, status: Employee['status'], currentTask?: string) => {
    setEmployees(prev => prev.map(e => {
      if (e.id === empId) {
        return {
          ...e,
          status,
          currentTask: currentTask || e.currentTask
        };
      }
      return e;
    }));
  }, []);

  // Add new idea
  const addNewIdea = useCallback((ideaData: Omit<IdeaItem, 'id' | 'dateAdded'>) => {
    const newIdea: IdeaItem = {
      ...ideaData,
      id: createUniqueId('idea'),
      dateAdded: 'الآن'
    };
    setIdeas(prev => [newIdea, ...prev]);

    const newAct: ActivityEvent = {
      id: createUniqueId('act'),
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      actor: ideaData.suggestedBy,
      actorAvatar: '💡',
      actorRole: 'مختبر الابتكار',
      department: 'البحث والابتكار',
      actionText: `أضاف فكرة استراتيجية جديدة لمختبر الأفكار: «${ideaData.title}»`,
      type: 'creation',
      isAutonomous: true
    };
    setActivities(prev => [newAct, ...prev]);
  }, []);

  // Promote Idea to Task
  const promoteIdeaToTask = useCallback((ideaId: string, projectId: ProjectId) => {
    const idea = ideas.find(i => i.id === ideaId);
    if (!idea) return;

    setIdeas(prev => prev.map(i => i.id === ideaId ? { ...i, status: 'promising', notes: 'تمت ترقيتها إلى مهمة تنفيذية مجانية' } : i));

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const newTask = {
          id: createUniqueId('task'),
          title: `تنفيذ: ${idea.title}`,
          assigneeName: projectId === 'qaddha' ? 'فهد' : 'زياد',
          status: 'in_progress' as const,
          priority: 'عالي' as const,
          department: 'التقنية والتطوير'
        };
        return {
          ...p,
          tasks: [newTask, ...p.tasks]
        };
      }
      return p;
    }));

    const newAct: ActivityEvent = {
      id: createUniqueId('act'),
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      actor: 'سارة',
      actorAvatar: '👩‍💼',
      actorRole: 'مديرة المشاريع',
      department: 'إدارة المشاريع',
      actionText: `حوّلت فكرة «${idea.title}» إلى مهمة تطويرية نشطة بتكلفة 0$`,
      projectId,
      type: 'milestone',
      isAutonomous: true
    };
    setActivities(prev => [newAct, ...prev]);
  }, [ideas]);

  // Autonomous collaboration simulation generator
  const triggerSimulatedCollaboration = useCallback(() => {
    const simulationSnippets = [
      {
        actor: 'ريان',
        avatar: '🎮',
        role: 'مدير مشروع قدّها',
        dept: 'إدارة المشاريع',
        action: 'طلب من المصممة ليان تجهيز شاشات التهنئة بفوز الفريق',
        project: 'qaddha' as ProjectId,
        type: 'collaboration' as const
      },
      {
        actor: 'ليان',
        avatar: '👩‍🎨',
        role: 'رئيسة التصميم',
        dept: 'التصميم والإبداع',
        action: 'أنجزت 4 أيقونات متحركة جديدة للعبة قدّها مع التزام تام بالخفة',
        project: 'qaddha' as ProjectId,
        type: 'creation' as const
      },
      {
        actor: 'فهد',
        avatar: '👨‍💻',
        role: 'كبير المهندسين',
        dept: 'التقنية والتطوير',
        action: 'دمج تقنية التخزين المؤقت المحلي PWA لفتح مصحف مُعين فوراً أوفلاين',
        project: 'mueen' as ProjectId,
        type: 'milestone' as const
      },
      {
        actor: 'عمر',
        avatar: '📈',
        role: 'مدير التسويق',
        dept: 'التسويق والنمو',
        action: 'أعدّ مسودة سلسلة تغريدات تعريفية بتطبيق مُعين تركز على الهدوء الروحي',
        project: 'mueen' as ProjectId,
        type: 'collaboration' as const
      },
      {
        actor: 'نورة',
        avatar: '📊',
        role: 'كبيرة المحللين',
        dept: 'التحليلات والجودة',
        action: 'رصدت انخفاض زمن استجابة خوادم قدّها إلى 42 ملي ثانية فقط',
        project: 'qaddha' as ProjectId,
        type: 'milestone' as const
      },
      {
        actor: 'خالد',
        avatar: '💡',
        role: 'قائد الابتكار',
        dept: 'البحث والابتكار',
        action: 'وثّق مكتبة صوتية مفتوحة المصدر مجانية للاستخدام في تطبيق مُعين',
        project: 'mueen' as ProjectId,
        type: 'creation' as const
      }
    ];

    const randomSnippet = simulationSnippets[Math.floor(Math.random() * simulationSnippets.length)];
    const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

    const newAct: ActivityEvent = {
      id: createUniqueId('act'),
      timestamp: timeStr,
      actor: randomSnippet.actor,
      actorAvatar: randomSnippet.avatar,
      actorRole: randomSnippet.role,
      department: randomSnippet.dept,
      actionText: randomSnippet.action,
      projectId: randomSnippet.project,
      type: randomSnippet.type,
      isAutonomous: true
    };

    setActivities(prev => [newAct, ...prev.slice(0, 24)]);
  }, []);

  // Employee CRUD operations
  const addEmployee = useCallback((newEmpData: Omit<Employee, 'id'>) => {
    const newId = createUniqueId('emp');
    const newEmp: Employee = {
      ...newEmpData,
      id: newId,
      taskProgress: newEmpData.taskProgress ?? 15,
      tasksCompletedCount: newEmpData.tasksCompletedCount ?? 0,
      collaborationHistory: newEmpData.collaborationHistory ?? [],
      skills: newEmpData.skills ?? ['الذكاء الاصطناعي', 'الأتمتة'],
      recentWork: newEmpData.recentWork ?? ['الانضمام إلى فريق عمل الشركة'],
    };

    setEmployees(prev => [newEmp, ...prev]);

    // Update department count
    if (newEmp.departmentId) {
      setDepartments(prev => prev.map(d => d.id === newEmp.departmentId ? { ...d, employeeCount: d.employeeCount + 1 } : d));
    }

    // Add activity
    const newAct: ActivityEvent = {
      id: createUniqueId('act'),
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      actor: 'نواف',
      actorAvatar: '👑',
      actorRole: 'الرئيس التنفيذي',
      department: 'الموارد البشرية الذكية',
      actionText: `تم تعيين الموظف الذكي الجديد «${newEmp.name}» في قسم «${newEmp.departmentName}»`,
      projectId: newEmp.assignedProject,
      type: 'creation',
      isAutonomous: false
    };
    setActivities(prev => [newAct, ...prev]);
    triggerConfetti();
  }, []);

  const editEmployee = useCallback((id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === id) {
        const updated = { ...emp, ...updates };
        if (selectedEmployee?.id === id) {
          setSelectedEmployee(updated);
        }
        return updated;
      }
      return emp;
    }));

    const targetEmp = employees.find(e => e.id === id);
    if (targetEmp) {
      const newAct: ActivityEvent = {
        id: createUniqueId('act'),
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        actor: 'نواف',
        actorAvatar: '👑',
        actorRole: 'الرئيس التنفيذي',
        department: targetEmp.departmentName,
        actionText: `تم تحديث بيانات وصلاحيات الموظف الذكي «${targetEmp.name}»`,
        projectId: targetEmp.assignedProject,
        type: 'system',
        isAutonomous: false
      };
      setActivities(prev => [newAct, ...prev]);
    }
  }, [employees, selectedEmployee]);

  const deleteEmployee = useCallback((id: string) => {
    const targetEmp = employees.find(e => e.id === id);
    if (!targetEmp) return;

    setEmployees(prev => prev.filter(e => e.id !== id));
    if (selectedEmployee?.id === id) {
      setSelectedEmployee(null);
    }

    if (targetEmp.departmentId) {
      setDepartments(prev => prev.map(d => d.id === targetEmp.departmentId ? { ...d, employeeCount: Math.max(1, d.employeeCount - 1) } : d));
    }

    const newAct: ActivityEvent = {
      id: createUniqueId('act'),
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      actor: 'نواف',
      actorAvatar: '👑',
      actorRole: 'الرئيس التنفيذي',
      department: targetEmp.departmentName,
      actionText: `تم إنهاء تكليف الموظف الذكي «${targetEmp.name}» وأرشفة ملفه`,
      projectId: targetEmp.assignedProject,
      type: 'system',
      isAutonomous: false
    };
    setActivities(prev => [newAct, ...prev]);
  }, [employees, selectedEmployee]);

  // Reports Management
  const addReport = useCallback((repData: Omit<CompanyReport, 'id' | 'createdAt'>) => {
    const newId = createUniqueId('rep');
    const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    const newRep: CompanyReport = {
      ...repData,
      id: newId,
      createdAt: timeStr,
    };

    setReports(prev => [newRep, ...prev]);

    const newAct: ActivityEvent = {
      id: createUniqueId('act'),
      timestamp: timeStr,
      actor: newRep.authorName,
      actorAvatar: '📑',
      actorRole: newRep.authorRole,
      department: 'إدارة التقارير',
      actionText: `تم إنشاء مسودة تقرير جديدة: «${newRep.title}»`,
      projectId: newRep.projectId,
      type: 'creation',
      isAutonomous: true
    };
    setActivities(prev => [newAct, ...prev]);
  }, []);

  const updateReportProgress = useCallback((id: string, progress: number, newStatus?: ReportStatus) => {
    const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    setReports(prev => prev.map(r => {
      if (r.id === id) {
        let status = newStatus || r.status;
        if (!newStatus) {
          if (progress >= 100) status = 'مكتمل';
          else if (progress >= 85) status = 'جاهز للمراجعة';
          else if (progress >= 60) status = 'جاري إعداد التقرير';
          else if (progress >= 30) status = 'يتم التحليل';
          else status = 'يتم جمع البيانات';
        }
        return {
          ...r,
          progress: Math.min(100, progress),
          status,
          completedAt: progress >= 100 ? timeStr : r.completedAt
        };
      }
      return r;
    }));
  }, []);

  const addActivity = useCallback((act: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    const newAct: ActivityEvent = {
      ...act,
      id: createUniqueId('act'),
      timestamp: timeStr,
    };
    setActivities(prev => [newAct, ...prev]);
  }, []);

  const sendAdvisorMessage = useCallback((text: string) => {
    const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    const userMsg: AdvisorMessage = {
      id: createUniqueId('msg'),
      sender: 'nawaf',
      text,
      timestamp: timeStr
    };

    setAdvisorMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const q = text.toLowerCase();
      let replyText = '';
      let planGenerated: ExecutionPlan | undefined = undefined;

      if (q.includes('قدها') || q.includes('قدّها') || q.includes('لعب') || q.includes('فحص') || q.includes('طور') || q.includes('راجع')) {
        const newPlan = createExecutionPlan(text, 'qaddha', 'خطة فحص وتطوير قدّها وإطلاق الغرف اللحظية');
        planGenerated = newPlan;
        replyText = `أبشر يا أبا أحمد. تم وضع خطة عمل محكمة لمشروع «قدّها» تضم ${newPlan.steps.length} خطوات تشغيلية بإشراف ريان وفهد وليان ونورة. جميع الخطوات ملتزمة بالتكلفة الصفرية ($0.00). تفضل باعتمادها لنبدأ التنفيذ فوراً.`;
      } else if (q.includes('معين') || q.includes('مُعين') || q.includes('قران') || q.includes('مصحف')) {
        const newPlan = createExecutionPlan(text, 'mueen', 'خطة مراجعة وإطلاق تطبيق مُعِين القرآني');
        planGenerated = newPlan;
        replyText = `أبشر يا أبا أحمد. تم إعداد خطة مراجعة مصحف مُعِين وتدقيق الرسم العثماني ومزامنة الصوتيات مع طارق وفهد. التكلفة $0.00. بانتظار اعتمادك.`;
      } else if (q.includes('قرار') || q.includes('معلق') || q.includes('اعتماد')) {
        replyText = `عندك حالياً ${decisions.filter(d => d.status === 'waiting').length} قرارات تتطلب توجيهك في مركز العمليات، أبرزها قرار تحسين شبكة غرف قدّها مجاناً. يمكنك استعراضها واتخاذ القرار بنقرة واحدة.`;
      } else if (q.includes('تكلف') || q.includes('قانون') || q.includes('صفر') || q.includes('فلوس') || q.includes('ميزانية')) {
        replyText = `سعادة الرئيس التنفيذي: القانون رقم 1 مفعل بصرامة. جميع الأدوات والخدمات التي تعمل عليها الفرق حالياً بتكلفة $0.00، ولم يتم تسجيل أي التزام مالي دون موافقتك الصريحة.`;
      } else {
        replyText = `أهلاً يا أبا أحمد. استلمت توجيهك: «${text}». الفريق جاهز لتنفيذ أي مسار ترغب به. يمكنك أيضاً أن تطلب مني إنشاء خطة عمل مخصصة أو عقد اجتماع تنفيذي طارئ.`;
      }

      const respTime = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
      setAdvisorMessages(prev => [
        ...prev,
        {
          id: createUniqueId('msg'),
          sender: 'advisor',
          text: replyText,
          timestamp: respTime,
          relatedPlan: planGenerated
        }
      ]);
    }, 600);
  }, [createExecutionPlan, decisions]);

  const advisorBriefing: AdvisorBriefing = useMemo(() => {
    const qaddhaProj = projects.find(p => p.id === 'qaddha');
    const mueenProj = projects.find(p => p.id === 'mueen');
    const waitingDecisions = decisions.filter(d => d.status === 'waiting');
    const workingEmps = employees.filter(e => e.status === 'WORKING');

    return {
      executiveSummary: 'الشركة تعمل بكفاءة ذاتية عالية وفق القانون رقم 1. مشروع مُعِين وصل إلى مرحلة التدقيق النهائي، وفريق قدّها بانتظار اعتماد خطة تحديث الألعاب.',
      focusArea: 'اعتماد خطة تطوير قدّها وتفعيل غرف اللعب المباشر',
      urgentDecisionsCount: waitingDecisions.length,
      activeEmployeesCount: workingEmps.length,
      costCommitment: '$0.00 (صفر تكلفة تشغيلية)',
      projectHighlights: [
        {
          projectId: 'qaddha',
          projectName: 'قدّها - غرف وتحديات ذكاء',
          progress: qaddhaProj?.progress || 74,
          statusSummary: 'جاهزية تجربة اللعب اللحظي وفحص استقرار الروابط',
          nextMilestone: 'إطلاق غرف اللعب الجماعي المباشر'
        },
        {
          projectId: 'mueen',
          projectName: 'مُعِين - القرآن الكريم والتدبر',
          progress: mueenProj?.progress || 82,
          statusSummary: 'تدقيق الرسم العثماني ومزامنة التلاوات الصوتية',
          nextMilestone: 'جاهزية النشر على الويب واستخدام وضع الطيران'
        }
      ],
      suggestedAction: {
        label: 'اعتماد خطة مراجعة وتطوير قدّها',
        description: 'بدء تنفيذ 6 خطوات حاسمة لإطلاق تجربة الألعاب فوراً',
        actionType: 'approve_plan',
        targetId: plans[0]?.id
      }
    };
  }, [projects, decisions, employees, plans]);

  const executeCEOCommand = useCallback(async (instruction: string) => {
    const text = instruction.toLowerCase().trim();
    const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

    // If instruction is strategic or comprehensive, build an execution plan
    const isStrategic = text.includes('راجع') || text.includes('طور') || text.includes('خطة') || 
                        text.includes('صلح') || text.includes('فحص') || text.includes('مراجعة') || 
                        text.includes('تطوير') || text.includes('جهز') || text.length > 25;

    if (isStrategic) {
      const plan = createExecutionPlan(instruction);
      return {
        success: true,
        message: `تم إعداد الخطة التنفيذية لـ «${plan.title}» بنجاح وعرضها عليك للاعتماد.`,
        assigneeName: 'فريق العمل الاستراتيجي',
        taskTitle: plan.title,
        plan
      };
    }

    // 1. Detect project
    let targetProject: ProjectId = 'mueen';
    if (text.includes('قدها') || text.includes('قدّها') || text.includes('qaddha')) {
      targetProject = 'qaddha';
    } else if (text.includes('معين') || text.includes('مُعِين') || text.includes('mueen')) {
      targetProject = 'mueen';
    } else {
      targetProject = 'hq';
    }

    // 2. Select optimal employee
    let assignedEmpId = 'tareq';
    let assignedEmpName = 'طارق';
    let assignedRole = 'مدير مشروع مُعِين';

    if (text.includes('مشاكل') || text.includes('bug') || text.includes('كود') || text.includes('برمج') || text.includes('سيرفر') || text.includes('خادم')) {
      assignedEmpId = 'fahad';
      assignedEmpName = 'فهد';
      assignedRole = 'كبير المهندسين ومسؤول الأنظمة';
    } else if (text.includes('تسويق') || text.includes('حملة') || text.includes('نشر') || text.includes('إعلان') || text.includes('عملاء')) {
      assignedEmpId = 'omar';
      assignedEmpName = 'عمر';
      assignedRole = 'مدير التسويق';
    } else if (text.includes('تصميم') || text.includes('شعار') || text.includes('هوية') || text.includes('واجهة') || text.includes('ألوان')) {
      assignedEmpId = 'layan';
      assignedEmpName = 'ليان';
      assignedRole = 'رئيسة التصميم الإبداعي';
    } else if (text.includes('تحليل') || text.includes('أرقام') || text.includes('بيانات') || text.includes('تقرير') || text.includes('مؤشر')) {
      assignedEmpId = 'noura';
      assignedEmpName = 'نورة';
      assignedRole = 'محلل بيانات أول';
    } else if (text.includes('مبيعات') || text.includes('اشتراك') || text.includes('تكلفة') || text.includes('شراكة')) {
      assignedEmpId = 'khaled';
      assignedEmpName = 'خالد';
      assignedRole = 'مسؤول النمو والمبيعات';
    } else {
      assignedEmpId = 'sara';
      assignedEmpName = 'سارة';
      assignedRole = 'مديرة المشاريع العامة';
    }

    const taskTitle = `توجيه تنفيذي: ${instruction}`;

    // 3. Update employee state
    setEmployees(prev => prev.map(e => {
      if (e.id === assignedEmpId) {
        return {
          ...e,
          status: 'WORKING',
          currentTask: taskTitle,
          taskProgress: 20,
          assignedProject: targetProject,
          recentWork: [taskTitle, ...e.recentWork.slice(0, 4)]
        };
      }
      return e;
    }));

    // 4. Add task to project
    setProjects(prev => prev.map(p => {
      if (p.id === targetProject) {
        const newTask = {
          id: createUniqueId('task'),
          title: taskTitle,
          assigneeName: assignedEmpName,
          status: 'in_progress' as const,
          priority: 'عالي' as const,
          department: assignedRole
        };
        return {
          ...p,
          tasks: [newTask, ...p.tasks]
        };
      }
      return p;
    }));

    // 5. Add immediate activity log
    const cmdAct: ActivityEvent = {
      id: createUniqueId('act'),
      timestamp: timeStr,
      actor: 'نواف (الرئيس التنفيذي)',
      actorAvatar: '👑',
      actorRole: 'الرئيس التنفيذي',
      department: 'الإدارة العليا',
      actionText: `أصدر توجيهاً فورياً: «${instruction}» إلى ${assignedEmpName} (${assignedRole})`,
      projectId: targetProject,
      type: 'decision',
      isAutonomous: false
    };
    setActivities(prev => [cmdAct, ...prev]);

    // 6. Check if approval is requested
    const needsApproval = text.includes('اعتماد') || text.includes('موافقة') || text.includes('قرار') || text.includes('ميزانية');
    if (needsApproval) {
      const newDecision: Decision = {
        id: createUniqueId('dec'),
        title: `قرار مطلوب بشأن: ${instruction}`,
        description: `بناءً على توجيهك، تم فحص الخيارات ووضع خطة التنفيذ بانتظار اعتمادك النهائي للبدء فوراً دون أي تكلفة إضافية.`,
        department: assignedRole,
        projectId: targetProject,
        proposer: assignedEmpName,
        impact: 'مرتفع',
        estimatedCost: '$0.00 (مجاني وفق القانون رقم 1)',
        estimatedTime: 'فوري',
        status: 'waiting',
        controlLevel: 'requires_approval',
        timestamp: timeStr,
        tags: ['توجيه تنفيذي', 'اعتماد مباشر'],
        financialImpact: false
      };
      setDecisions(prev => [newDecision, ...prev]);
    }

    return {
      success: true,
      message: `تم تكليف ${assignedEmpName} بالمهمة بنجاح وجاري العمل عليها الآن.`,
      assigneeName: assignedEmpName,
      taskTitle
    };
  }, [createExecutionPlan]);

  // Periodic heartbeat loop for the living company feel
  useEffect(() => {
    if (!isCompanyOperating || !isAutoSimulationActive) return;

    // Simulate steady progress on active tasks and reports
    const progressInterval = setInterval(() => {
      // Pick an employee and increment their task progress
      setEmployees(prev => {
        const workingEmps = prev.filter(e => (e.taskProgress ?? 50) < 100);
        if (workingEmps.length === 0) return prev;
        const target = workingEmps[Math.floor(Math.random() * workingEmps.length)];
        const nextProgress = Math.min(100, (target.taskProgress ?? 50) + Math.floor(Math.random() * 8) + 4);

        if (nextProgress === 100) {
          // Log task completion
          const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
          const newAct: ActivityEvent = {
            id: createUniqueId('act'),
            timestamp: timeStr,
            actor: target.name,
            actorAvatar: target.avatar,
            actorRole: target.position,
            department: target.departmentName,
            actionText: `أنجزت مهمتها الحالية بنجاح بنسبة 100%: «${target.currentTask.slice(0, 45)}...»`,
            projectId: target.assignedProject,
            type: 'milestone',
            isAutonomous: true
          };
          setActivities(a => [newAct, ...a.slice(0, 24)]);
        }

        return prev.map(e => e.id === target.id ? { 
          ...e, 
          taskProgress: nextProgress === 100 ? 15 : nextProgress,
          tasksCompletedCount: nextProgress === 100 ? e.tasksCompletedCount + 1 : e.tasksCompletedCount 
        } : e);
      });

      // Also advance a report progress
      setReports(prev => {
        const inProgressReps = prev.filter(r => r.progress < 100);
        if (inProgressReps.length === 0) return prev;
        const rep = inProgressReps[Math.floor(Math.random() * inProgressReps.length)];
        const newProg = Math.min(100, rep.progress + Math.floor(Math.random() * 7) + 3);
        let nextStatus: ReportStatus = rep.status;
        if (newProg >= 100) nextStatus = 'مكتمل';
        else if (newProg >= 85) nextStatus = 'جاهز للمراجعة';
        else if (newProg >= 60) nextStatus = 'جاري إعداد التقرير';
        else if (newProg >= 30) nextStatus = 'يتم التحليل';

        return prev.map(r => r.id === rep.id ? { ...r, progress: newProg, status: nextStatus } : r);
      });
    }, 14000);

    const collabInterval = setInterval(() => {
      triggerSimulatedCollaboration();
    }, 45000); // Trigger subtle new collaboration event every 45s

    return () => {
      clearInterval(progressInterval);
      clearInterval(collabInterval);
    };
  }, [isCompanyOperating, isAutoSimulationActive, triggerSimulatedCollaboration]);

  const toggleAutoSimulation = () => {
    setIsAutoSimulationActive(prev => !prev);
  };

  const resetAllData = () => {
    localStorage.clear();
    setDepartments(INITIAL_DEPARTMENTS);
    setProjects(INITIAL_PROJECTS);
    setEmployees(INITIAL_EMPLOYEES);
    setDecisions(INITIAL_DECISIONS);
    setIdeas(INITIAL_IDEAS);
    setActivities(INITIAL_ACTIVITIES);
    setCampaigns(INITIAL_CAMPAIGNS);
    setReports(INITIAL_REPORTS);
    setPlans(INITIAL_PLANS);
    triggerConfetti();
  };

  return (
    <CompanyContext.Provider
      value={{
        theme,
        setTheme,
        primaryNav,
        setPrimaryNav,
        companySubTab,
        setCompanySubTab,
        workSubTab,
        setWorkSubTab,

        plans,
        setPlans,
        selectedPlan,
        setSelectedPlan,
        isPlanModalOpen,
        setIsPlanModalOpen,
        createExecutionPlan,
        approveExecutionPlan,

        openHandsSession,
        isOpenHandsTerminalOpen,
        openOpenHandsTerminal,
        closeOpenHandsTerminal,
        runOpenHandsAudit,

        advisorBriefing,
        advisorMessages,
        sendAdvisorMessage,
        isAdvisorDrawerOpen,
        setIsAdvisorDrawerOpen,

        departments,
        projects,
        employees,
        decisions,
        ideas,
        activities,
        campaigns,
        reports,
        gmSummary,
        
        activeTab,
        setActiveTab,
        selectedEmployee,
        setSelectedEmployee,
        selectedProject,
        setSelectedProject,
        selectedDepartment,
        setSelectedDepartment,
        selectedReport,
        setSelectedReport,
        isSearchOpen,
        setIsSearchOpen,
        isNotificationsOpen,
        setIsNotificationsOpen,
        isGMSummaryOpen,
        setIsGMSummaryOpen,
        isReportModalOpen,
        setIsReportModalOpen,
        isEmployeeModalOpen,
        setIsEmployeeModalOpen,
        employeeToEdit,
        setEmployeeToEdit,
        isCeoCommandOpen,
        setIsCeoCommandOpen,
        isMeetingModalOpen,
        setIsMeetingModalOpen,
        focusedZone,
        setFocusedZone,
        
        controlLevel,
        setControlLevel,
        isCompanyOperating,
        setIsCompanyOperating,
        
        tasks,
        updateTaskStatus,
        addNewTask,
        deleteTask,

        meetingSession,
        startMeeting,
        endMeeting,
        sendMeetingMessage,
        
        approveDecision,
        rejectDecision,
        modifyDecision,
        requestCEOApproval,
        triggerSimulatedCollaboration,
        isAutoSimulationActive,
        toggleAutoSimulation,
        addNewIdea,
        promoteIdeaToTask,
        updateEmployeeStatus,
        addEmployee,
        editEmployee,
        deleteEmployee,
        addReport,
        updateReportProgress,
        addActivity,
        executeCEOCommand,
        resetAllData,
        
        metrics,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = (): CompanyContextType => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};
