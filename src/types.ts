export type ThemeId = 'executive-gold' | 'midnight-blue' | 'graphite' | 'warm-stone';

export type PrimaryNavGroup = 'hq' | 'company' | 'work' | 'advisor' | 'settings';
export type CompanySubTab = 'projects' | 'employees' | 'departments';
export type WorkSubTab = 'plans' | 'tasks' | 'decisions' | 'reports';

export type ExecutionState = 
  | 'PLANNING'
  | 'APPROVED'
  | 'READY'
  | 'WORKING'
  | 'REVIEWING'
  | 'WAITING_FOR_NAWAF'
  | 'BLOCKED'
  | 'COMPLETED';

export interface ExecutionStep {
  id: string;
  stepNumber: number;
  title: string;
  objective: string;
  assigneeId?: string;
  assigneeName: string;
  assigneeRole: string;
  assigneeAvatar: string;
  expectedResult: string;
  dependencies?: string[];
  status: ExecutionState;
  result?: string;
  blockerReason?: string;
  progress?: number;
  startedAt?: string;
  completedAt?: string;
  requiresApproval?: boolean;
  isTechnical?: boolean;
  toolsRequired?: string[];
  openHandsSession?: any;
}

export interface ExecutionPlan {
  id: string;
  title: string;
  goal: string;
  projectId: ProjectId;
  projectName: string;
  createdAt: string;
  status: 'PLANNING' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  team: { id: string; name: string; role: string; avatar: string }[];
  steps: ExecutionStep[];
  estimatedComplexity?: 'منخفض' | 'متوسط' | 'مرتفع';
  whatRequiresApproval?: string;
  approvedByCeoAt?: string;
  summary?: string;
  zeroCostGuarantee?: boolean;
}

export interface AdvisorBriefingItem {
  id: string;
  type: 'attention' | 'status' | 'completed' | 'blocked' | 'decision' | 'opportunity';
  title: string;
  description: string;
  relatedProjectId?: ProjectId;
  relatedEmployeeName?: string;
  suggestedAction?: {
    label: string;
    actionType: 'approve_plan' | 'resolve_blocker' | 'start_task' | 'open_decision';
    payload?: any;
  };
  timestamp: string;
}

export interface AdvisorBriefing {
  headline?: string;
  subtext?: string;
  needsNawafCount?: number;
  activeEmployeesCount: number;
  summaryQuote?: string;
  items?: AdvisorBriefingItem[];
  executiveSummary?: string;
  urgentDecisionsCount?: number;
  recommendedFocus?: string;
  zeroCostStatus?: string;
  topInsights?: string[];
  companyStatus?: 'optimal' | 'attention_needed' | 'critical';
}

export interface AdvisorMessage {
  id: string;
  sender: 'nawaf' | 'advisor';
  text: string;
  timestamp: string;
  planPreview?: ExecutionPlan;
  relatedPlan?: ExecutionPlan;
  suggestedActions?: {
    label: string;
    prompt: string;
  }[];
}

export type EmployeeStatus = 
  | 'READY'
  | 'WORKING'
  | 'RESEARCHING'
  | 'REVIEWING'
  | 'COLLABORATING'
  | 'MEETING'
  | 'WAITING_FOR_NAWAF'
  | 'BLOCKED'
  | 'COMPLETED'
  | 'يعمل الآن'
  | 'يبحث'
  | 'يحلل'
  | 'يصمم'
  | 'يطور'
  | 'ينتظر قرارك'
  | 'متوقف مؤقتًا';

export type CEOControlLevel = 
  | 'requires_approval'      // يحتاج موافقتي
  | 'limited_autonomous'     // تنفيذ تلقائي محدود
  | 'fully_autonomous';      // تنفيذ تلقائي

export type ProjectId = 'mueen' | 'qaddha' | 'hq';

export type ReportStatus = 
  | 'يتم جمع البيانات'
  | 'يتم التحليل'
  | 'جاري إعداد التقرير'
  | 'جاهز للمراجعة'
  | 'مكتمل';

export interface CompanyReport {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  projectId: ProjectId;
  projectName: string;
  status: ReportStatus;
  progress: number; // 0 - 100%
  createdAt: string;
  completedAt?: string;
  summary: string;
  keyFindings: string[];
  recommendations: string[];
}

export interface Employee {
  id: string;
  name: string;
  avatar: string;
  position: string;
  departmentId: string;
  departmentName: string;
  status: EmployeeStatus;
  currentTask: string;
  taskProgress?: number; // 0 - 100%
  assignedProject: ProjectId;
  productivity: number; // e.g. 96%
  recentWork: string[];
  tasksCompletedCount: number;
  collaborationHistory: {
    withEmployee: string;
    action: string;
    timestamp: string;
  }[];
  skills: string[];
  systemRole: string; // Brief technical prompt archetype
  responsibilities?: string[];
  permissions?: string[];
  tools?: string[];
  crewGoal?: string;
  crewBackstory?: string;
  openHandsEnabled?: boolean;
  instructions?: string;
  robotColor?: string; // Color of visor and glow
  roomLocation?: string; // Department room id in office
  lastResult?: string;
  availability?: 'available' | 'busy' | 'in_meeting' | 'offline' | string;
}

export interface Department {
  id: string;
  name: string;
  nameEn: string;
  iconName: string;
  managerName: string;
  managerTitle: string;
  employeeCount: number;
  activeTasks: number;
  color: string; // Tailwind accent or hex
  glowColor: string;
  description: string;
  responsibilities: string[];
  nodeAngle: number; // Angle around HQ for interactive map
  radius: number;
}

export interface ProjectTask {
  id: string;
  title: string;
  description?: string;
  objective?: string;
  expectedResult?: string;
  dependencies?: string[];
  planId?: string;
  planStepId?: string;
  assigneeName: string;
  assigneeId?: string;
  assigneeAvatar?: string;
  projectId?: ProjectId;
  status: 'pending' | 'in_progress' | 'completed' | 'needs_ceo' | 'reviewing' | 'blocked';
  priority: 'عالي' | 'متوسط' | 'عادي';
  department: string;
  progress?: number;
  result?: string;
  blockerReason?: string;
  logs?: { timestamp: string; note: string }[];
  dueDate?: string;
  isTechnical?: boolean;
  openHandsSession?: any;
}

export interface MeetingMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
}

export interface MeetingSession {
  id: string;
  topic: string;
  status: 'active' | 'concluded';
  attendees: string[];
  messages: MeetingMessage[];
  startedAt: string;
  summary?: string;
}

export interface Project {
  id: ProjectId;
  name: string;
  nameEn: string;
  tagline: string;
  description: string;
  category: string;
  progress: number; // e.g. 82%
  currentPhase: string;
  health: 'ممتاز' | 'مستقر' | 'يحتاج انتباه';
  projectManagerName: string;
  assignedEmployees: string[]; // employee IDs
  tasks: ProjectTask[];
  bugsCount: number;
  marketingPhase: string;
  activeIdeasCount: number;
  isSensitiveReligiousContent?: boolean; // For مُعين
  recentMilestones: { title: string; date: string }[];
  color: string;
}

export interface Decision {
  id: string;
  title: string;
  description: string;
  department: string;
  projectId?: ProjectId;
  proposer: string;
  impact: 'حاسم' | 'مرتفع' | 'متوسط';
  estimatedCost: string; // e.g. "0$ (مجاني)"
  estimatedTime: string;
  status: 'waiting' | 'approved' | 'rejected' | 'modified';
  controlLevel: CEOControlLevel;
  timestamp: string;
  tags: string[];
  ceoNote?: string;
  financialImpact: boolean; // Flag to enforce Rule #1
}

export interface IdeaItem {
  id: string;
  title: string;
  opportunity: string;
  difficulty: 'سهل' | 'متوسط' | 'معقد';
  potential: 'استثنائي' | 'مرتفع' | 'واعد';
  estimatedDevTime: string;
  expectedCost: string; // must emphasize $0 / Free tier
  status: 'promising' | 'rejected' | 'under_review';
  category: string;
  notes: string;
  dateAdded: string;
  suggestedBy: string;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  actor: string;
  actorAvatar: string;
  actorRole: string;
  department: string;
  actionText: string;
  target?: string;
  projectId?: ProjectId;
  type: 'collaboration' | 'decision' | 'milestone' | 'alert' | 'system' | 'creation';
  isAutonomous: boolean;
}

export interface MarketingCampaign {
  id: string;
  title: string;
  projectId: ProjectId;
  projectName: string;
  channel: 'X (Twitter)' | 'Instagram' | 'TikTok' | 'Community' | 'SEO';
  status: 'planned' | 'preparing' | 'ready' | 'published';
  targetAudience: string;
  keyVisualsCount: number;
  scheduledDate: string;
  materialsReady: boolean;
  leadEmployee: string;
}

export interface GMSummary {
  date: string;
  greeting: string;
  headline: string;
  activeEmployeesCount: number;
  completedTasksCount: number;
  detectedIssuesCount: number;
  newIdeasCount: number;
  pendingDecisionsCount: number;
  keyInsights: string[];
  recommendedFocus: string;
  stalledTasks?: string[];
}

