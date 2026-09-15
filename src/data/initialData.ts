import {
  Employee,
  Department,
  Project,
  Decision,
  IdeaItem,
  ActivityEvent,
  MarketingCampaign,
  GMSummary,
  CompanyReport,
  ExecutionPlan,
} from '../types';

/**
 * Static company identity only.
 *
 * IMPORTANT: this file must never contain pretend operational history, fake progress,
 * fabricated reports, fake completed work, or invented runtime metrics. Live state is
 * created only by real user actions and verified execution results.
 */
export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'pm', name: 'إدارة المشروع', nameEn: 'Project Management', iconName: 'FolderKanban',
    managerName: 'سارة', managerTitle: 'مدير مشروع', employeeCount: 2, activeTasks: 0,
    color: 'from-blue-500 to-indigo-600', glowColor: 'rgba(59, 130, 246, 0.4)',
    description: 'تنسيق المشاريع والمهام والاعتمادات بين فرق الشركة.',
    responsibilities: ['تنظيم الخطط', 'إزالة المعوقات', 'تنسيق العمل بين الأقسام'],
    nodeAngle: 90, radius: 175,
  },
  {
    id: 'creative', name: 'المحتوى والإبداع', nameEn: 'Content & Creative', iconName: 'Palette',
    managerName: 'ليان', managerTitle: 'رئيسة التصميم', employeeCount: 1, activeTasks: 0,
    color: 'from-purple-500 to-pink-600', glowColor: 'rgba(168, 85, 247, 0.4)',
    description: 'التصميم والهوية وتجربة المستخدم والمحتوى البصري.',
    responsibilities: ['تصميم UI/UX', 'الهوية البصرية', 'مراجعة الأصول التصميمية'],
    nodeAngle: 35, radius: 180,
  },
  {
    id: 'marketing', name: 'التسويق', nameEn: 'Marketing', iconName: 'TrendingUp',
    managerName: 'عمر', managerTitle: 'مدير التسويق', employeeCount: 1, activeTasks: 0,
    color: 'from-emerald-500 to-teal-600', glowColor: 'rgba(16, 185, 129, 0.4)',
    description: 'التسويق والنمو ودراسة قنوات الوصول للمستخدمين.',
    responsibilities: ['التخطيط التسويقي', 'إدارة قنوات التواصل', 'تحليل قنوات الاستحواذ'],
    nodeAngle: 145, radius: 185,
  },
  {
    id: 'systems', name: 'التطوير والأنظمة', nameEn: 'Dev & Systems', iconName: 'Code2',
    managerName: 'فهد', managerTitle: 'كبير المهندسين', employeeCount: 1, activeTasks: 0,
    color: 'from-cyan-500 to-blue-600', glowColor: 'rgba(6, 182, 212, 0.4)',
    description: 'الهندسة البرمجية والبنية التقنية والاختبارات والتنفيذ.',
    responsibilities: ['تطوير البرمجيات', 'تحسين الأداء', 'تشغيل الفحوص التقنية'],
    nodeAngle: 325, radius: 185,
  },
  {
    id: 'sales', name: 'النمو والشراكات', nameEn: 'Sales & Growth', iconName: 'Coins',
    managerName: 'خالد', managerTitle: 'مسؤول النمو والشراكات', employeeCount: 1, activeTasks: 0,
    color: 'from-amber-500 to-orange-600', glowColor: 'rgba(245, 158, 11, 0.4)',
    description: 'استكشاف فرص النمو والشراكات ودراسة الجدوى.',
    responsibilities: ['دراسة الشراكات', 'تقييم فرص النمو', 'مراجعة الأثر المالي قبل أي التزام'],
    nodeAngle: 270, radius: 180,
  },
  {
    id: 'analytics', name: 'التحليلات والجودة', nameEn: 'Analytics & QA', iconName: 'ShieldCheck',
    managerName: 'نورة', managerTitle: 'مهندسة جودة ومحلل بيانات', employeeCount: 1, activeTasks: 0,
    color: 'from-rose-500 to-violet-600', glowColor: 'rgba(244, 63, 94, 0.4)',
    description: 'الاختبار والجودة والتحليل المبني على بيانات ونتائج فعلية.',
    responsibilities: ['تشغيل الاختبارات', 'تحليل النتائج', 'توثيق المشاكل المثبتة'],
    nodeAngle: 215, radius: 175,
  },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'mueen',
    name: 'مُعِين',
    nameEn: 'Mueen',
    tagline: 'تطبيق إسلامي ذكي',
    description: 'مشروع مُعِين. حالته التشغيلية لا تُفترض من البيانات الابتدائية وتُحدّث فقط من نتائج موثقة.',
    category: 'تطبيق إسلامي',
    progress: 0,
    currentPhase: 'بانتظار أول تنفيذ موثق',
    health: 'يحتاج انتباه',
    projectManagerName: 'طارق',
    assignedEmployees: ['tareq', 'fahad', 'layan', 'noura'],
    tasks: [],
    bugsCount: 0,
    marketingPhase: '',
    activeIdeasCount: 0,
    isSensitiveReligiousContent: true,
    recentMilestones: [],
    color: '#06b6d4',
  },
  {
    id: 'qaddha',
    name: 'قدّها',
    nameEn: 'Qaddha',
    tagline: 'منصة ألعاب جماعية',
    description: 'مشروع قدّها. حالته التشغيلية لا تُفترض من البيانات الابتدائية وتُحدّث فقط من نتائج موثقة.',
    category: 'ألعاب جماعية',
    progress: 0,
    currentPhase: 'بانتظار أول تنفيذ موثق',
    health: 'يحتاج انتباه',
    projectManagerName: 'سارة',
    assignedEmployees: ['sara', 'fahad', 'omar', 'layan', 'noura'],
    tasks: [],
    bugsCount: 0,
    marketingPhase: '',
    activeIdeasCount: 0,
    isSensitiveReligiousContent: false,
    recentMilestones: [],
    color: '#a855f7',
  },
  {
    id: 'hq',
    name: 'NAWAF HQ',
    nameEn: 'NAWAF HQ',
    tagline: 'نظام تشغيل الشركة بالذكاء الاصطناعي',
    description: 'مقر التشغيل وإدارة العمال والوكلاء والأدوات. لا يسجل أي إنجاز إلا بعد نتيجة فعلية.',
    category: 'AI Company OS',
    progress: 0,
    currentPhase: 'تشغيل ومراقبة موثقة',
    health: 'يحتاج انتباه',
    projectManagerName: 'سارة',
    assignedEmployees: ['sara', 'fahad', 'noura'],
    tasks: [],
    bugsCount: 0,
    marketingPhase: '',
    activeIdeasCount: 0,
    recentMilestones: [],
    color: '#d4af37',
  },
];

const baseEmployee = (
  id: string,
  name: string,
  position: string,
  departmentId: string,
  departmentName: string,
  assignedProject: 'mueen' | 'qaddha' | 'hq',
  robotColor: string,
  roomLocation: string,
  skills: string[],
  systemRole: string,
  responsibilities: string[],
  permissions: string[],
): Employee => ({
  id,
  name,
  avatar: '🤖',
  position,
  departmentId,
  departmentName,
  status: 'READY',
  currentTask: '',
  taskProgress: 0,
  assignedProject,
  productivity: 0,
  robotColor,
  roomLocation,
  responsibilities,
  permissions,
  instructions: 'استخدم فقط نتائج فعلية من الأدوات والحالة الموثقة. لا تدّعِ تنفيذاً أو نجاحاً أو نسبة تقدم بلا دليل.',
  recentWork: [],
  tasksCompletedCount: 0,
  skills,
  systemRole,
  collaborationHistory: [],
  availability: 'available',
});

export const INITIAL_EMPLOYEES: Employee[] = [
  baseEmployee(
    'sara', 'سارة', 'مديرة العمليات', 'pm', 'إدارة المشروع', 'hq', '#d4af37', 'pm',
    ['إدارة المشاريع', 'تنسيق الفرق', 'تحليل الأولويات'], 'Chief of Staff & Operations Orchestrator',
    ['تنسيق الخطط', 'توزيع المهام بعد الاعتماد', 'رفع القرارات المطلوبة لنواف'],
    ['crew:delegate_task', 'crew:request_ceo_approval', 'crew:publish_report'],
  ),
  baseEmployee(
    'fahad', 'فهد', 'كبير المهندسين', 'systems', 'التطوير والأنظمة', 'qaddha', '#06b6d4', 'systems',
    ['React / TypeScript', 'الاختبارات', 'الهندسة البرمجية'], 'Lead Systems Architect & OpenHands Engineer',
    ['تنفيذ التغييرات التقنية', 'تشغيل الاختبارات', 'توثيق نتائج التنفيذ'],
    ['openhands:exec_cmd', 'openhands:read_file', 'openhands:write_code', 'openhands:run_tests', 'openhands:git_commit'],
  ),
  baseEmployee(
    'noura', 'نورة', 'مهندسة جودة ومحلل بيانات', 'analytics', 'التحليلات والجودة', 'hq', '#10b981', 'analytics',
    ['QA', 'تحليل البيانات', 'اختبار البرمجيات'], 'QA Engineer & Data Analyst',
    ['تشغيل الاختبارات', 'توثيق المشاكل المثبتة', 'مراجعة الجودة'],
    ['openhands:run_tests', 'openhands:read_file', 'openhands:exec_cmd', 'crew:access_analytics'],
  ),
  baseEmployee(
    'layan', 'ليان', 'رئيسة التصميم', 'creative', 'المحتوى والإبداع', 'qaddha', '#a855f7', 'creative',
    ['UI/UX', 'أنظمة التصميم', 'الهوية البصرية'], 'Product Designer & UX Director',
    ['تصميم الواجهات', 'مراجعة تجربة المستخدم', 'تحديث الأصول التصميمية'],
    ['openhands:read_file', 'openhands:write_code', 'crew:publish_report'],
  ),
  baseEmployee(
    'omar', 'عمر', 'مدير التسويق', 'marketing', 'التسويق', 'qaddha', '#10b981', 'marketing',
    ['استراتيجية التسويق', 'المحتوى', 'النمو'], 'Growth & Marketing Lead',
    ['إعداد خطط التسويق', 'تحليل قنوات النمو', 'رفع المقترحات للاعتماد'],
    ['crew:publish_report', 'crew:request_ceo_approval'],
  ),
  baseEmployee(
    'tareq', 'طارق', 'مدير مشروع مُعِين', 'pm', 'إدارة المشروع', 'mueen', '#3b82f6', 'pm',
    ['إدارة المنتج', 'مراجعة المحتوى', 'تجربة المستخدم'], 'Mueen Product Owner & Integrity Lead',
    ['إدارة خطة مُعِين', 'تنسيق مراجعة المحتوى', 'رفع المحتوى الحساس لاعتماد نواف'],
    ['crew:delegate_task', 'crew:request_ceo_approval', 'crew:publish_report'],
  ),
  baseEmployee(
    'khaled', 'خالد', 'مسؤول النمو والشراكات', 'sales', 'النمو والشراكات', 'hq', '#eab308', 'sales',
    ['تحليل الجدوى', 'الشراكات', 'تحليل المنافسين'], 'Growth Partnerships Analyst',
    ['تقييم الفرص', 'دراسة الشراكات', 'توضيح أي أثر مالي قبل التنفيذ'],
    ['crew:publish_report', 'crew:request_ceo_approval', 'crew:manage_budget'],
  ),
];

// Operational collections deliberately start empty. They are populated only by
// real user actions, verified agents, or verified execution/tool results.
export const INITIAL_DECISIONS: Decision[] = [];
export const INITIAL_ACTIVITIES: ActivityEvent[] = [];
export const INITIAL_REPORTS: CompanyReport[] = [];
export const INITIAL_IDEAS: IdeaItem[] = [];
export const INITIAL_CAMPAIGNS: MarketingCampaign[] = [];
export const INITIAL_PLANS: ExecutionPlan[] = [];

export const INITIAL_GM_SUMMARY: GMSummary = {
  date: '',
  greeting: 'ملخص الشركة',
  headline: 'لا توجد أعمال تنفيذية موثقة حتى الآن.',
  activeEmployeesCount: 0,
  completedTasksCount: 0,
  detectedIssuesCount: 0,
  newIdeasCount: 0,
  pendingDecisionsCount: 0,
  keyInsights: [],
  recommendedFocus: 'ابدأ بتوجيه واضح أو خطة جديدة، ثم اعتمد النتائج الموثقة فقط.',
  stalledTasks: [],
};
