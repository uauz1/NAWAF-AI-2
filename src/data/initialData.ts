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
  ExecutionPlan
} from '../types';

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'pm',
    name: 'إدارة المشروع',
    nameEn: 'Project Management',
    iconName: 'FolderKanban',
    managerName: 'سارة',
    managerTitle: 'مدير مشروع',
    employeeCount: 2,
    activeTasks: 6,
    color: 'from-blue-500 to-indigo-600',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    description: 'توجيه دفة المشاريع ومتابعة الجداول الزمنية والتنسيق بين الفرق الذكية بسلاسة تامة.',
    responsibilities: ['جدولة المهام ومراقبة الأداء', 'إزالة المعوقات التشغيلية', 'التنسيق التلقائي بين الأقسام'],
    nodeAngle: 90,
    radius: 175,
  },
  {
    id: 'creative',
    name: 'المحتوى والإبداع',
    nameEn: 'Content & Creative',
    iconName: 'Palette',
    managerName: 'ليان',
    managerTitle: 'مصمم جرافيك ورئيس الإبداع',
    employeeCount: 2,
    activeTasks: 5,
    color: 'from-purple-500 to-pink-600',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    description: 'صناعة تجارب مستخدم سينمائية ومواد تسويقية ساحرة تعزز هوية المشاريع الرقمية.',
    responsibilities: ['تصميم واجهات المستخدم UI/UX', 'إنتاج مواد الهوية البصرية والموشن', 'تجهيز المخرجات الإعلانية'],
    nodeAngle: 35,
    radius: 180,
  },
  {
    id: 'marketing',
    name: 'التسويق',
    nameEn: 'Marketing',
    iconName: 'TrendingUp',
    managerName: 'عمر',
    managerTitle: 'مدير التسويق',
    employeeCount: 2,
    activeTasks: 5,
    color: 'from-emerald-500 to-teal-600',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    description: 'استراتيجيات الانتشار العضوي والحملات الإبداعية واستقطاب المستخدمين بدون ميزانيات إعلانية مدفوعة.',
    responsibilities: ['تخطيط الحملات الفيروسية والعضوية', 'إدارة تقويم النشر وشبكات التواصل', 'تحليل قنوات الاستحواذ'],
    nodeAngle: 145,
    radius: 185,
  },
  {
    id: 'systems',
    name: 'التطوير والأنظمة',
    nameEn: 'Dev & Systems',
    iconName: 'Code2',
    managerName: 'فهد',
    managerTitle: 'صانع محتوى وكبير المهندسين',
    employeeCount: 2,
    activeTasks: 7,
    color: 'from-cyan-500 to-blue-600',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    description: 'تطوير البنية البرمجية والأنظمة مفتوحة المصدر وحلول الويب عالية الكفاءة بمصاريف استضافة $0.',
    responsibilities: ['بناء وصيانة واجهات برمجة التطبيقات', 'تحسين الأداء وضغط الموارد', 'أتمتة الاختبارات ونشر الكود'],
    nodeAngle: 325,
    radius: 185,
  },
  {
    id: 'sales',
    name: 'المبيعات',
    nameEn: 'Sales & Growth',
    iconName: 'Coins',
    managerName: 'خالد',
    managerTitle: 'مسؤول النمو والمبيعات',
    employeeCount: 1,
    activeTasks: 3,
    color: 'from-amber-500 to-orange-600',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    description: 'حماية خزينة الشركة واستكشاف فرص الشراكات وتطوير مجتمعات اللاعبين بتكلفة صفرية.',
    responsibilities: ['الشراكات المجتمعية', 'نماذج النمو العضوي', 'مراقبة التكاليف وضمان بقائها $0.00'],
    nodeAngle: 270,
    radius: 180,
  },
  {
    id: 'analytics',
    name: 'التحليلات',
    nameEn: 'Analytics',
    iconName: 'ShieldCheck',
    managerName: 'نورة',
    managerTitle: 'محلل بيانات',
    employeeCount: 1,
    activeTasks: 4,
    color: 'from-rose-500 to-violet-600',
    glowColor: 'rgba(244, 63, 94, 0.4)',
    description: 'رصد مؤشرات الأداء الحيوية، فحص استقرار التطبيقات، والتأكد من أمان البيانات وسلامة المحتوى.',
    responsibilities: ['مراقبة استقرار الخوادم ومعدلات الارتداد', 'التدقيق الأمني والجودة قبل النشر', 'تحليل سلوك اللاعبين'],
    nodeAngle: 215,
    radius: 175,
  },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'mueen',
    name: 'مُعِين',
    nameEn: 'Mueen',
    tagline: 'تطبيق إسلامي ذكي يعينك على عبادتك اليومية بأناقة وروحانية',
    description: 'منصة إسلامية تقدم الأذكار، المصحف، متابعة الورد القرآني، ومواقيت الصلاة بتصميم هادئ وميزات مجتمعية خالية من أي إعلانات أو تكاليف.',
    category: 'تطبيق إسلامي (Islamic Life)',
    progress: 82,
    currentPhase: 'المرحلة 3: تجربة المستخدم الروحانية ومراجعة المحتوى الديني',
    health: 'ممتاز',
    projectManagerName: 'طارق',
    assignedEmployees: ['tareq', 'fahad', 'layan', 'reem'],
    bugsCount: 1,
    marketingPhase: 'بناء مجتمع المهتمين الأوائل والتهيؤ لموسم الطاعات',
    activeIdeasCount: 5,
    isSensitiveReligiousContent: true, // Requires CEO review for any religious texts
    color: '#06b6d4',
    recentMilestones: [
      { title: 'اكتمال فهرسة المصحف الشريف بخط الرسم العثماني بدون إنترنت', date: 'أمس' },
      { title: 'تحسين استهلاك البطارية في حساب أوقات الصلاة بدقة GPS عالية', date: 'منذ 3 أيام' },
      { title: 'إعداد منظومة أذكار الصباح والمساء الصوتية المعتمدة', date: 'منذ 5 أيام' }
    ],
    tasks: [
      {
        id: 't-m-1',
        title: 'تدقيق نصوص التفسير الميسر والتأكد من سندها الدقيق',
        assigneeName: 'طارق',
        status: 'needs_ceo',
        priority: 'عالي',
        department: 'إدارة المشاريع'
      },
      {
        id: 't-m-2',
        title: 'تحسين أداء عرض خطوط القرآن الكريم على شاشات OLED عالية الدقة',
        assigneeName: 'زياد',
        status: 'in_progress',
        priority: 'عالي',
        department: 'التقنية والتطوير'
      },
      {
        id: 't-m-3',
        title: 'تصميم شاشات إحصائيات الختمة الشهرية بأسلوب بصري هادئ',
        assigneeName: 'ليان',
        status: 'completed',
        priority: 'متوسط',
        department: 'التصميم والإبداع'
      },
      {
        id: 't-m-4',
        title: 'اختبار دقة توقيت الإمساك والفجر في مختلف المدن',
        assigneeName: 'ريم',
        status: 'in_progress',
        priority: 'متوسط',
        department: 'التحليلات والجودة'
      }
    ]
  },
  {
    id: 'qaddha',
    name: 'قدّها',
    nameEn: 'Qaddha',
    tagline: 'منصة ألعاب التجمعات والحماس الاجتماعي الأكثر انتشاراً في الخليج',
    description: 'لعبة جماعية تفاعلية للجمعات العائلية ولقاءات الأصدقاء تضم تحديات ذكية، أسئلة محرجة ومضحكة، وغرف لعب مباشرة سريعة عبر المتصفح بدون تثبيت.',
    category: 'ألعاب تواصل وتحدي (Social Party Gaming)',
    progress: 68,
    currentPhase: 'المرحلة 2: تعزيز غرف اللعب المباشر وتجهيز حملة الانتشار العضوي',
    health: 'مستقر',
    projectManagerName: 'ريان',
    assignedEmployees: ['rayan', 'fahad', 'omar', 'layan'],
    bugsCount: 2,
    marketingPhase: 'إعداد مقاطع التحديات الفيروسية لتيك توك وإكس',
    activeIdeasCount: 7,
    isSensitiveReligiousContent: false,
    color: '#a855f7',
    recentMilestones: [
      { title: 'إطلاق نظام الغرف اللحظية بروابط سريعة WebRTC مجانية', date: 'اليوم' },
      { title: 'إضافة بنك يضم 1,200 سؤال وتحدي مرح للجمعات الشبابية', date: 'منذ يومين' },
      { title: 'تجربة حية ناجحة لغرفة لعب احتوت 12 متنافساً في آن واحد', date: 'منذ 4 أيام' }
    ],
    tasks: [
      {
        id: 't-q-1',
        title: 'اعتماد المخطط التسويقي لإطلاق النسخة التجريبية عبر تيك توك',
        assigneeName: 'عمر',
        status: 'needs_ceo',
        priority: 'عالي',
        department: 'التسويق والنمو'
      },
      {
        id: 't-q-2',
        title: 'برمجة بطاقات التحدي التفاعلية مع مؤثرات صوتية مبهجة',
        assigneeName: 'فهد',
        status: 'in_progress',
        priority: 'عالي',
        department: 'التقنية والتطوير'
      },
      {
        id: 't-q-3',
        title: 'تصميم 3 قوالب غرافيك جديدة لنتائج الفائزين قابلة للمشاركة على سناب',
        assigneeName: 'ليان',
        status: 'completed',
        priority: 'متوسط',
        department: 'التصميم والإبداع'
      },
      {
        id: 't-q-4',
        title: 'فحص سرعة استجابة السيرفر المجاني أثناء الضغط اللحظي',
        assigneeName: 'نورة',
        status: 'in_progress',
        priority: 'متوسط',
        department: 'التحليلات والجودة'
      }
    ]
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'sarah',
    name: 'سارة',
    avatar: '🤖',
    position: 'مدير مشروع',
    departmentId: 'pm',
    departmentName: 'إدارة المشروع',
    status: 'يعمل الآن',
    currentTask: 'مزامنة أولويات المهام وتحديث لوحة الإنجاز لجميع الأقسام',
    taskProgress: 85,
    assignedProject: 'qaddha',
    productivity: 98,
    robotColor: '#f59e0b',
    roomLocation: 'pm',
    responsibilities: ['متابعة سير مشاريع قدّها ومُعين', 'جدولة المهام اليومية للأقسام', 'صياغة تقارير الأداء للرئيس التنفيذي'],
    permissions: ['إسناد المهام الداخلية', 'تعديل أولويات المشاريع', 'رفع القرارات للاعتماد'],
    instructions: 'التركيز على تحقيق أعلى سرعة تسليم وضمان التنسيق المستمر بين الفرق والالتزام الصارم بالتكلفة الصفرية.',
    recentWork: [
      'تحديث خارطة طريق الربع الحالي لمنصة قدّها',
      'إعادة توزيع المهام التسويقية والتقنية',
      'صياغة التقرير الصباحي المرفوع للمدير العام'
    ],
    tasksCompletedCount: 42,
    skills: ['تخطيط رشيق Agile', 'إدارة المعوقات', 'تنسيق الفرق المستقلة'],
    systemRole: 'Autonomous Project Orchestrator & Task Scheduler',
    collaborationHistory: [
      { withEmployee: 'عمر', action: 'تنسيق موعد إطلاق حملة قدّها', timestamp: 'منذ ساعتين' },
      { withEmployee: 'طارق', action: 'مراجعة الجدول الزمني لمشروع مُعين', timestamp: 'منذ 25 دقيقة' }
    ]
  },
  {
    id: 'omar',
    name: 'عمر',
    avatar: '🤖',
    position: 'مدير التسويق',
    departmentId: 'marketing',
    departmentName: 'التسويق',
    status: 'يعمل الآن',
    currentTask: 'تحليل سلوك الجمهور المستهدف وإطلاق حملة قدّها الفيروسية',
    taskProgress: 72,
    assignedProject: 'qaddha',
    productivity: 95,
    robotColor: '#10b981',
    roomLocation: 'marketing',
    responsibilities: ['تخطيط الحملات العضوية', 'إدارة قنوات التواصل', 'هندسة الانتشار الفيروسي بدون ميزانيات'],
    permissions: ['إنشاء مسودات الحملات', 'طلب تصاميم من الإبداع', 'رفع مخرجات التسويق'],
    instructions: 'الالتزام التام بالقانون رقم 1: حملات مجانية 100% تعتمد على صناعة التحديات وتفاعل المستخدمين.',
    recentWork: [
      'تحليل أنماط الهاشتاقات الصاعدة في المملكة والخليج خلال الأسبوع',
      'هندسة أسلوب الدعوة العضوية بين الأصدقاء (Invite Loop) بدون مكافآت مدفوعة',
      'تجهيز نصوص النشر الفيروسي المؤثرة لمنصة إكس وتيك توك'
    ],
    tasksCompletedCount: 37,
    skills: ['النمو العضوي الفيروسي', 'هندسة التحويل Conversion', 'استراتيجيات المحتوى التفاعلي'],
    systemRole: 'Zero-Budget Growth Strategist & Viral Marketer',
    collaborationHistory: [
      { withEmployee: 'ليان', action: 'طلب 3 بنرات عمودية مناسبة للريلز والستوري', timestamp: 'منذ 45 دقيقة' },
      { withEmployee: 'ريان', action: 'صياغة العبارات التحفيزية لنهاية كل جولة لعب', timestamp: 'منذ 3 ساعات' }
    ]
  },
  {
    id: 'layan',
    name: 'ليان',
    avatar: '🤖',
    position: 'مصمم جرافيك',
    departmentId: 'creative',
    departmentName: 'المحتوى والإبداع',
    status: 'يعمل الآن',
    currentTask: 'إنشاء 3 مواد تسويقية وتجهيز الهوية البصرية لشعار قدّها',
    taskProgress: 90,
    assignedProject: 'qaddha',
    productivity: 99,
    robotColor: '#a855f7',
    roomLocation: 'creative',
    responsibilities: ['تصميم الواجهات UI/UX', 'ابتكار الهويات البصرية', 'تصميم بطاقات اللعب المبهجة'],
    permissions: ['تعديل المكتبة البصرية', 'رفع الأصول التصميمية', 'تحديث القوالب'],
    instructions: 'تقديم تصاميم مبهجة وفخمة تعكس الطابع الشبابي المرح لمنصة قدّها والتجربة الروحانية لمُعين.',
    recentWork: [
      'تصميم الأيقونات التفاعلية لردود الفعل المباشرة أثناء اللعب',
      'ابتكار هوية بصرية مريحة للعين لمشروع مُعين مستوحاة من العمارة الإسلامية',
      'بناء نظام المكونات Design System المشترك لمشاريع الشركة'
    ],
    tasksCompletedCount: 46,
    skills: ['تصميم واجهات UI/UX', 'الموشن غرافيكس', 'هندسة الهوية والتجربة العاطفية'],
    systemRole: 'Creative Director & Cinematic UI/Motion Designer',
    collaborationHistory: [
      { withEmployee: 'عمر', action: 'تسليم المسودات البصرية للحملة الترويجية', timestamp: 'منذ 15 دقيقة' },
      { withEmployee: 'ريان', action: 'مراجعة بطاقات اللعبة المضحكة وألوانها', timestamp: 'منذ ساعتين' }
    ]
  },
  {
    id: 'fahad',
    name: 'فهد',
    avatar: '🤖',
    position: 'صانع محتوى',
    departmentId: 'systems',
    departmentName: 'التطوير والأنظمة',
    status: 'يعمل الآن',
    currentTask: 'تجهيز نصوص وتحديات غرف اللعب المباشر وتحسين كود WebRTC',
    taskProgress: 64,
    assignedProject: 'qaddha',
    productivity: 97,
    robotColor: '#06b6d4',
    roomLocation: 'systems',
    responsibilities: ['صناعة محتوى التحديات والأسئلة', 'كتابة سيناريوهات الألعاب', 'تطوير وتأمين غرف اللعب'],
    permissions: ['إضافة أسئلة لبنك التحديات', 'تعديل المحتوى التفاعلي', 'نشر التحديثات البرمجية'],
    instructions: 'كتابة تحديات ذكية ومسلية تتناسب مع جمعات الشباب والعائلات في الخليج وضمان سرعة الاستجابة.',
    recentWork: [
      'تحديث كود مزامنة الغرف ليعتمد على Peer-to-Peer مجاني بالكامل',
      'فحص أداء الكاش لتقليل استهلاك الذاكرة بنسبة 40%',
      'تدقيق أمان الكود والتأكد من عدم تسريب أي مفاتيح تشغيلية'
    ],
    tasksCompletedCount: 58,
    skills: ['React / TypeScript', 'WebSockets / WebRTC', 'بنى تحتية خالية التكلفة'],
    systemRole: 'Full-Stack Software Architect & Free Infrastructure Specialist',
    collaborationHistory: [
      { withEmployee: 'ريان', action: 'تحسين تجربة الانضمام للعبة عبر QR Code', timestamp: 'منذ 4 ساعات' }
    ]
  },
  {
    id: 'noura',
    name: 'نورة',
    avatar: '🤖',
    position: 'محلل بيانات',
    departmentId: 'analytics',
    departmentName: 'التحليلات',
    status: 'يعمل الآن',
    currentTask: 'رصد مؤشرات الأداء الحيوية وتحليل تفاعل اللاعبين في قدّها',
    taskProgress: 78,
    assignedProject: 'qaddha',
    productivity: 98,
    robotColor: '#f43f5e',
    roomLocation: 'analytics',
    responsibilities: ['تحليل سلوك المستخدمين', 'بناء لوحات المؤشرات الحية', 'فحص الاستقرار والجودة'],
    permissions: ['قراءة السجلات التحليلية', 'إنشاء تقارير الجودة', 'تنبيه الإدارة عند حدوث أي خلل'],
    instructions: 'رصد دقيق لمعدلات الاستبقاء وسرعة الاتصال في جلسات اللعب المباشر وحماية خصوصية المستخدمين.',
    recentWork: [
      'بناء لوحة المؤشرات الحية لإنتاجية الشركة ومعدل استجابة الموظفين الذاتية',
      'تدقيق مسارات الاستخدام لتطبيق مُعين لضمان بساطة الوصول لأذكار المساء بنقرة واحدة',
      'التأكد من التشفير المحلي التام لبيانات المستخدمين على المتصفح'
    ],
    tasksCompletedCount: 39,
    skills: ['تحليل البيانات السلوكية', 'ذكاء الأعمال BI', 'تصميم لوحات المؤشرات الحية'],
    systemRole: 'Data Intelligence Lead & Behavioral Analytics Scientist',
    collaborationHistory: [
      { withEmployee: 'ريم', action: 'مراجعة سجلات الأخطاء ومطابقتها مع الأجهزة القديمة', timestamp: 'منذ ساعتين' },
      { withEmployee: 'خالد', action: 'تزويد مختبر الأفكار ببيانات اهتمام المستخدمين', timestamp: 'منذ 6 ساعات' }
    ]
  },
  {
    id: 'tareq',
    name: 'طارق',
    avatar: '🤖',
    position: 'مدير مشروع مُعين',
    departmentId: 'pm',
    departmentName: 'إدارة المشروع',
    status: 'يعمل الآن',
    currentTask: 'مراجعة تفاسير الآيات الميسرة وضمان سلامة المحتوى',
    taskProgress: 92,
    assignedProject: 'mueen',
    productivity: 96,
    robotColor: '#3b82f6',
    roomLocation: 'pm',
    responsibilities: ['إدارة مشروع مُعين', 'التدقيق الديني للمحتوى', 'متابعة مراحل الإطلاق'],
    permissions: ['إدارة محتوى مُعين', 'طلب مراجعات شرعية'],
    instructions: 'الالتزام التام بالضوابط الشرعية المعتمدة رسمياً.',
    recentWork: [
      'فهرسة تفاسير الآيات الموثوقة للتأكد من خلوها من أي إشكال',
      'التنسيق مع المصممة ليان لتحسين راحة العين في وضع القراءة الليلي',
      'إعداد تقرير التزام التطبيق بالضوابط الدينية المعتمدة'
    ],
    tasksCompletedCount: 29,
    skills: ['إدارة المنتجات الهادفة', 'التدقيق المعرفي', 'تجربة المستخدم القرآني'],
    systemRole: 'Islamic App Product Owner & Integrity Lead',
    collaborationHistory: [
      { withEmployee: 'ليان', action: 'استلام تصاميم المصحف الشريف الجديد', timestamp: 'منذ 40 دقيقة' },
      { withEmployee: 'ريم', action: 'تدقيق نصوص أحاديث رياض الصالحين', timestamp: 'منذ 3 ساعات' }
    ]
  },
  {
    id: 'khaled',
    name: 'خالد',
    avatar: '🤖',
    position: 'مسؤول النمو والمبيعات',
    departmentId: 'sales',
    departmentName: 'المبيعات',
    status: 'يعمل الآن',
    currentTask: 'فحص فرص الشراكات المجتمعية المجانية لزيادة انتشار قدّها',
    taskProgress: 60,
    assignedProject: 'hq',
    productivity: 92,
    robotColor: '#eab308',
    roomLocation: 'sales',
    responsibilities: ['الشراكات العضوية', 'دراسة الفرص الاستثمارية', 'حماية الميزانية'],
    permissions: ['إعداد تقارير الشراكات', 'تقييم الأفكار الجديدة'],
    instructions: 'التركيز على الشراكات المتبادلة دون دفع أي مبالغ مالية.',
    recentWork: [
      'تقييم 12 فكرة مشروع جديدة واستبعاد 9 منها لتكلفتها واعتماد 3 مجانية تماماً',
      'إعداد دراسة مقارنة حول المنصات السحابية المجانية لضمان الالتزام بالقانون رقم 1',
      'تحليل الفجوات في تطبيقات ألعاب التجمعات المنافسة لقدّها في المتاجر العربية'
    ],
    tasksCompletedCount: 24,
    skills: ['تقييم الأفكار والجدوى', 'استكشاف المصادر المفتوحة', 'تحليل المنافسين والاستراتيجية'],
    systemRole: 'Idea Lab Evaluator & Zero-Cost Technology Scout',
    collaborationHistory: [
      { withEmployee: 'نورة', action: 'طلب تحليل إحصائيات البحث عن ألعاب التجمعات', timestamp: 'منذ ساعة' },
      { withEmployee: 'سارة', action: 'تقديم تقرير 3 أفكار واعدة للربع القادم', timestamp: 'منذ 5 ساعات' }
    ]
  }
];

export const INITIAL_DECISIONS: Decision[] = [
  {
    id: 'dec-1',
    title: 'اعتماد حملة تسويقية جديدة',
    description: 'حملة قدّها - انطلاقة أقوى.',
    department: 'التسويق',
    projectId: 'qaddha',
    proposer: 'عمر (مدير التسويق)',
    impact: 'حاسم',
    estimatedCost: '0.00$ (مجاني)',
    estimatedTime: 'جاهز للإطلاق',
    status: 'waiting',
    controlLevel: 'requires_approval',
    timestamp: 'منذ 35 دقيقة',
    tags: ['تسويق فيروزي', 'حملة قدّها', 'انطلاقة أقوى'],
    financialImpact: false
  },
  {
    id: 'dec-2',
    title: 'الموافقة على الهوية البصرية',
    description: 'شعار وهوية قدّها الجديدة',
    department: 'المحتوى والإبداع',
    projectId: 'qaddha',
    proposer: 'ليان (مصمم جرافيك)',
    impact: 'مرتفع',
    estimatedCost: '0.00$ (تصميم داخلي)',
    estimatedTime: 'جاهز للنشر',
    status: 'waiting',
    controlLevel: 'requires_approval',
    timestamp: 'منذ ساعتين',
    tags: ['هوية بصرية', 'شعار قدّها', 'تصميم واجهات'],
    financialImpact: false
  },
  {
    id: 'dec-3',
    title: 'تثبيت البنية السحابية المجانية الدائمة (Zero-Cost Infrastructure Stack)',
    description: 'اقتراح مشترك باعتماد مزيج تقني دائم يضم Vercel Free Tier + GitHub Actions المجانية + Cloudflare CDN المجاني، لضمان تشغيل مشاريع الشركة لآلاف المستخدمين دون دفع دولار واحد.',
    department: 'التطوير والأنظمة',
    projectId: 'hq',
    proposer: 'فهد (صانع محتوى وكبير المهندسين)',
    impact: 'حاسم',
    estimatedCost: '0.00$ شهرياً (مدى الحياة)',
    estimatedTime: 'مطبق بنجاح',
    status: 'waiting',
    controlLevel: 'requires_approval',
    timestamp: 'منذ 4 ساعات',
    tags: ['القانون رقم 1', 'تكلفة صفرية', 'بنية سحابية'],
    financialImpact: true
  }
];

export const INITIAL_ACTIVITIES: ActivityEvent[] = [
  {
    id: 'act-1',
    timestamp: '10:24',
    actor: 'مدير قدّها',
    actorAvatar: '🤖',
    actorRole: 'إدارة المشروع',
    department: 'إدارة المشروع',
    actionText: 'مدير قدّها طلب من فريق التسويق تجهيز حملة جديدة',
    target: 'عمر (مدير التسويق)',
    projectId: 'qaddha',
    type: 'collaboration',
    isAutonomous: true
  },
  {
    id: 'act-2',
    timestamp: '10:17',
    actor: 'المصمم',
    actorAvatar: '🎨',
    actorRole: 'المحتوى والإبداع',
    department: 'المحتوى والإبداع',
    actionText: 'المصمم بدأ إنشاء 3 مواد تسويقية',
    target: 'عمر',
    projectId: 'qaddha',
    type: 'creation',
    isAutonomous: true
  },
  {
    id: 'act-3',
    timestamp: '09:48',
    actor: 'عمر',
    actorAvatar: '📈',
    actorRole: 'التسويق',
    department: 'التسويق',
    actionText: 'تم الانتهاء من تحليل السوق المستهدف',
    target: 'سارة',
    projectId: 'qaddha',
    type: 'milestone',
    isAutonomous: true
  },
  {
    id: 'act-4',
    timestamp: '09:15',
    actor: 'سارة',
    actorAvatar: '👩‍💼',
    actorRole: 'إدارة المشروع',
    department: 'إدارة المشروع',
    actionText: 'مقترح جديد جاهز للمراجعة',
    target: 'نواف (الرئيس التنفيذي)',
    projectId: 'qaddha',
    type: 'decision',
    isAutonomous: true
  },
  {
    id: 'act-5',
    timestamp: '08:50',
    actor: 'نورة',
    actorAvatar: '📊',
    actorRole: 'التحليلات',
    department: 'التحليلات',
    actionText: 'تقرير الأداء الأسبوعي جاهز',
    target: 'نواف (الرئيس التنفيذي)',
    projectId: 'hq',
    type: 'milestone',
    isAutonomous: true
  },
  {
    id: 'act-6',
    timestamp: '08:30',
    actor: 'فهد',
    actorAvatar: '💻',
    actorRole: 'التطوير والأنظمة',
    department: 'التطوير والأنظمة',
    actionText: 'تحديث خوارزمية الاتصال اللحظي بتقنية P2P السريعة',
    target: 'قدّها',
    projectId: 'qaddha',
    type: 'system',
    isAutonomous: true
  }
];

export const INITIAL_REPORTS: CompanyReport[] = [
  {
    id: 'rep-1',
    title: 'تحليل سلوك واهتمامات جمهور قدّها في الخليج',
    authorId: 'omar',
    authorName: 'عمر',
    authorRole: 'مدير التسويق',
    projectId: 'qaddha',
    projectName: 'قدّها',
    status: 'مكتمل',
    progress: 100,
    createdAt: '08:30',
    completedAt: '09:48',
    summary: 'تم الانتهاء من تحليل السوق المستهدف بدقة واكتشاف أن الجمعات الشبابية تفضل ألعاب التحدي السريعة بدون شاشات تسجيل دخول معقدة.',
    keyFindings: [
      '84% من اللاعبين يفضلون بدء اللعب فوراً برابط مشاركة واتساب',
      'تحديات «مين أكثر واحد» تحقق أعلى تفاعل بنسبة مشاركة 92%',
      'أفضل أوقات اللعب بين 8 مساءً و 1 صباحاً في عطلة نهاية الأسبوع'
    ],
    recommendations: [
      'تجهيز 3 قوالب تحديات جاهزة بنقرة واحدة',
      'إطلاق وسم #قدها_ولا_مو_قدها على منصة تيك توك بدون إعلانات مدفوعة'
    ]
  },
  {
    id: 'rep-2',
    title: 'تقرير مراجعة الهوية البصرية وشعار قدّها الجديد',
    authorId: 'layan',
    authorName: 'ليان',
    authorRole: 'مصمم جرافيك',
    projectId: 'qaddha',
    projectName: 'قدّها',
    status: 'جاهز للمراجعة',
    progress: 90,
    createdAt: '09:00',
    summary: 'اكتملت حزمة الهوية البصرية والأيقونات والبطاقات التفاعلية لتبدو عصرية وشابة ومبهجة.',
    keyFindings: [
      'اختبار ألوان البنفسجي والنيون أظهر جاذبية بصرية بنسبة 88%',
      'توافق الألوان مع الوضع الليلي بنسبة 100%'
    ],
    recommendations: [
      'اعتماد الشعار في مركز قرارات الرئيس التنفيذي لإدراجه في الواجهة'
    ]
  },
  {
    id: 'rep-3',
    title: 'دراسة جاهزية البنية البرمجية وغرف WebRTC المجانية',
    authorId: 'fahad',
    authorName: 'فهد',
    authorRole: 'صانع محتوى',
    projectId: 'qaddha',
    projectName: 'قدّها',
    status: 'جاري إعداد التقرير',
    progress: 70,
    createdAt: '09:30',
    summary: 'اختبار الاتصال المباشر بين أجهزة متعددة دون استهلاك سيرفرات مركزية مكلفة (تكلفة $0).',
    keyFindings: [
      'زمن الاستجابة أقل من 35ms داخل شبكات الخليج',
      'استهلاك الذاكرة خفيف جداً على المتصفح'
    ],
    recommendations: [
      'تطبيق ضغط خفيف على رسائل الحزم اللحظية'
    ]
  },
  {
    id: 'rep-4',
    title: 'تقرير التدقيق ومراجعة المحتوى لمشروع مُعين',
    authorId: 'sarah',
    authorName: 'سارة',
    authorRole: 'مدير مشروع',
    projectId: 'mueen',
    projectName: 'مُعين',
    status: 'يتم التحليل',
    progress: 48,
    createdAt: '10:00',
    summary: 'مراجعة أسانيد الأذكار وتفاسير الآيات للتأكد من مطابقتها للمصادر المعتمدة 100%.',
    keyFindings: [
      'تطابق كامل لنصوص المصحف الشريف مع مجمع الملك فهد لطباعة المصحف',
      'حظر أي تفسير غير معتمد'
    ],
    recommendations: [
      'عرض النتيجة لنواف قبل إتاحتها للمستخدمين'
    ]
  },
  {
    id: 'rep-5',
    title: 'رصد مؤشرات الأداء الحيوية ومعدل الارتداد',
    authorId: 'noura',
    authorName: 'نورة',
    authorRole: 'محلل بيانات',
    projectId: 'qaddha',
    projectName: 'قدّها',
    status: 'يتم جمع البيانات',
    progress: 35,
    createdAt: '10:15',
    summary: 'تتبع معدلات إتمام جولات اللعب وسرعة تحميل الواجهة على مختلف المتصفحات.',
    keyFindings: [
      'معدل إتمام الجولات 89%',
      'متوسط زمن التحميل الأولي 0.8 ثانية'
    ],
    recommendations: [
      'إكمال تجميع عينات الأجهزة اللوحية'
    ]
  }
];

export const INITIAL_IDEAS: IdeaItem[] = [
  {
    id: 'idea-1',
    title: 'مولّد تحديات «قدّها» الذكي للجمعات بدون إنترنت (Offline Card Engine)',
    opportunity: 'تمكين اللاعبين في الاستراحات والبر والأماكن ضعيفة التغطية من الاستمتاع بكامل باقات اللعبة دون انقطاع، مما يضاعف انتشار التطبيق بنسبة 40%.',
    difficulty: 'سهل',
    potential: 'استثنائي',
    estimatedDevTime: '3 أيام عمل',
    expectedCost: '0$ — عبر تقنية Service Workers والتخزين المحلي',
    status: 'promising',
    category: 'ألعاب وترفيه',
    notes: 'فكرة ممتازة وتوافق تماماً سياسة التكلفة الصفرية وسريعة التنفيذ.',
    dateAdded: 'اليوم',
    suggestedBy: 'خالد (البحث والابتكار)'
  },
  {
    id: 'idea-2',
    title: 'منظومة بطاقات التدبر القرآني القابلة للمشاركة الفورية (مُعين)',
    opportunity: 'توليد بطاقة تصميمية سينمائية للآية مع التفسير بضغطة زر لمشاركتها كقصة في واتساب وإنستغرام، ما يحقق انتشاراً روحانياً عفوياً واسعاً.',
    difficulty: 'متوسط',
    potential: 'مرتفع',
    estimatedDevTime: '5 أيام عمل',
    expectedCost: '0$ — توليد الصور مباشرة في متصفح المستخدم عبر HTML Canvas',
    status: 'promising',
    category: 'مشاريع إسلامية',
    notes: 'تحقق انتشاراً كبيراً في شهر رمضان والمواسم الروحانية.',
    dateAdded: 'أمس',
    suggestedBy: 'ليان (التصميم الإبداعي)'
  },
  {
    id: 'idea-3',
    title: 'نظام المنافسة العائلية بالأذكار والورد القرآني المشترك (مُعين)',
    opportunity: 'تمكين أفراد العائلة الواحدة من تشجيع بعضهم على ختمة القرآن وقراءة أذكار الصباح في لوحة شرف خاصة بالأسرة لتعزيز الأثر الصالح.',
    difficulty: 'متوسط',
    potential: 'واعد',
    estimatedDevTime: '6 أيام عمل',
    expectedCost: '0$ — مزامنة مشفرة خفيفة',
    status: 'promising',
    category: 'مشاريع إسلامية',
    notes: 'تتطلب تأكيد نواف من الناحية الشرعية لضمان الإخلاص وعدم الرياء.',
    dateAdded: 'منذ يومين',
    suggestedBy: 'طارق (مدير مشروع مُعين)'
  },
  {
    id: 'idea-4',
    title: 'تفعيل إعلانات مدفوعة على شبكة تيك توك للوصول لـ 100 ألف لاعب',
    opportunity: 'استئجار مؤثرين وإعلانات ممولة في الخليج لتسريع نمو قدّها.',
    difficulty: 'سهل',
    potential: 'مرتفع',
    estimatedDevTime: 'يوم واحد',
    expectedCost: '1,500$ إعلانات ممولة',
    status: 'rejected',
    category: 'تسويق',
    notes: 'مرفوضة فوراً لمخالفتها الصريحة للقانون رقم 1 الصارم: لا صرف أموال ولا حملات مدفوعة، التركيز الكامل على الانتشار العضوي المجاني.',
    dateAdded: 'منذ 3 أيام',
    suggestedBy: 'عمر (مدير التسويق)'
  },
  {
    id: 'idea-5',
    title: 'الاشتراك في خادم قواعد بيانات سحابي مخصص ومسبق الدفع',
    opportunity: 'توسيع سعة التخزين الاحتياطية قبل الحاجة الفعلية.',
    difficulty: 'سهل',
    potential: 'واعد',
    estimatedDevTime: 'ساعتين',
    expectedCost: '45$ شهرياً',
    status: 'rejected',
    category: 'بنية تحتية',
    notes: 'مرفوضة بموجب حماية الميزانية. المنصات المجانية الحالية تكفي لأكثر من 50,000 مستخدم نشط.',
    dateAdded: 'منذ 4 أيام',
    suggestedBy: 'فهد (التقنية)'
  }
];

export const INITIAL_CAMPAIGNS: MarketingCampaign[] = [
  {
    id: 'camp-1',
    title: 'حملة تحدي جمعات العيد والويكند (Viral Room Challenge)',
    projectId: 'qaddha',
    projectName: 'قدّها',
    channel: 'TikTok',
    status: 'ready',
    targetAudience: 'الشباب والعائلات في السعودية والخليج (16-35 سنة)',
    keyVisualsCount: 3,
    scheduledDate: 'بانتظار اعتماد نواف',
    materialsReady: true,
    leadEmployee: 'عمر'
  },
  {
    id: 'camp-2',
    title: 'سلسلة «آية وتأمل» اليومية بتصاميم سينمائية هادئة',
    projectId: 'mueen',
    projectName: 'مُعين',
    channel: 'X (Twitter)',
    status: 'preparing',
    targetAudience: 'المهتمون بالقراءة اليومية والأذكار والمحتوى الإسلامي الراقي',
    keyVisualsCount: 5,
    scheduledDate: 'الأسبوع القادم',
    materialsReady: false,
    leadEmployee: 'ليان'
  },
  {
    id: 'camp-3',
    title: 'إطلاق دليل الاستراحة: 50 لعبة ذكاء بدون ورق ولا إنترنت',
    projectId: 'qaddha',
    projectName: 'قدّها',
    channel: 'Community',
    status: 'planned',
    targetAudience: 'منظمو الجلسات وتجمعات الأصدقاء',
    keyVisualsCount: 2,
    scheduledDate: 'نهاية الشهر',
    materialsReady: false,
    leadEmployee: 'عمر'
  },
  {
    id: 'camp-4',
    title: 'إعلان إطلاق تطبيق مُعين بنسخته المفتوحة بدون إعلانات',
    projectId: 'mueen',
    projectName: 'مُعين',
    channel: 'SEO',
    status: 'published',
    targetAudience: 'الباحثون في محركات البحث عن تطبيقات إسلامية نقية خالية من الإعلانات',
    keyVisualsCount: 4,
    scheduledDate: 'تم النشر بنجاح',
    materialsReady: true,
    leadEmployee: 'نورة'
  }
];

export const INITIAL_GM_SUMMARY: GMSummary = {
  date: 'اليوم، 14 سبتمبر 2026',
  greeting: 'تحياتي يا أبا أحمد — شركتك الرقمية تعمل بكامل طاقتها',
  headline: 'فريقك الذكي أنجز 14 مهمة مستقلة، والتنسيق التلقائي بين الأقسام يعمل بتناغم تام دون أي حاجة للتدخل اليدوي.',
  activeEmployeesCount: 8,
  completedTasksCount: 14,
  detectedIssuesCount: 1,
  newIdeasCount: 3,
  pendingDecisionsCount: 3,
  keyInsights: [
    'التنسيق الذاتي بين مدير قدّها (ريان) وفريق التسويق (عمر وليان) أنتج مواد الحملة في 45 دقيقة فقط دون توجيه يدوي.',
    'مشروع مُعين وصل إلى نسبة إنجاز 82%، ومحتوى التفسير الميسر جاهز في مركز القرارات بانتظار توقيعك.',
    'حساب التكلفة الإجمالية للشركة اليوم: 0.00$ — التزام كامل بنسبة 100% بالقانون رقم 1 الصارم.'
  ],
  recommendedFocus: 'التركيز اليوم على البت في القرارين بمركز الموافقات لإعطاء الضوء الأخضر لإطلاق الحملة المجانية لمنصة قدّها.',
  stalledTasks: [
    'تأخر اعتماد بنك أسئلة قدّها من قبل الرئيس التنفيذي منذ ساعتين',
    'فحص إمكانية تحسين استهلاك بطارية الهاتف أثناء قراءة القرآن في مُعين'
  ]
};

export const INITIAL_PLANS: ExecutionPlan[] = [
  {
    id: 'plan-qaddha-improvement',
    title: 'خطة مراجعة وتطوير تجربة غرف اللعب التفاعلية في قدّها',
    goal: 'مراجعة قدّها وتطوير تجربة الألعاب وضمان جاهزيتها الكاملة للاستخدام والانتشار العضوي المجاني ($0.00).',
    projectId: 'qaddha',
    projectName: 'قدّها',
    createdAt: 'اليوم، 09:00',
    status: 'IN_PROGRESS',
    estimatedComplexity: 'متوسط',
    whatRequiresApproval: 'اعتماد موعد الإطلاق التجريبي وحملة الانتشار',
    approvedByCeoAt: 'اليوم، 09:15',
    summary: 'تم اعتماد الخطة التنفيذية من الرئيس التنفيذي، ويعمل الفريق حالياً على فحص مسارات الغرف وبطاقات التحدي.',
    team: [
      { id: 'rayan', name: 'ريان', role: 'مدير مشروع قدّها', avatar: '🎮' },
      { id: 'fahad', name: 'فهد', role: 'كبير المهندسين', avatar: '👨‍💻' },
      { id: 'layan', name: 'ليان', role: 'رئيسة التصميم', avatar: '👩‍🎨' },
      { id: 'nora', name: 'نورة', role: 'كبيرة المحللين والجودة', avatar: '📊' },
      { id: 'omar', name: 'عمر', role: 'مدير التسويق', avatar: '📈' }
    ],
    steps: [
      {
        id: 'step-1',
        stepNumber: 1,
        title: 'مراجعة واجهات المستخدم وتجربة اللعب (UI Audit)',
        objective: 'فحص جميع شاشات اللعب على الهواتف الذكية وضمان وضوح نصوص التحديات وسلاسة الحركة.',
        assigneeId: 'layan',
        assigneeName: 'ليان',
        assigneeRole: 'التصميم والإبداع',
        assigneeAvatar: '👩‍🎨',
        expectedResult: 'قائمة بالملاحظات البصرية وتحديث قوالب بطاقات الأسئلة لتكون مبهجة.',
        dependencies: [],
        status: 'COMPLETED',
        progress: 100,
        result: 'اكتملت مراجعة 14 شاشة وتحديث تناسق الخطوط والتباين اللوني مع شاشات الجوال بنجاح.'
      },
      {
        id: 'step-2',
        stepNumber: 2,
        title: 'مراجعة مسارات وغرف اللعب اللحظية (Game Routes Audit)',
        objective: 'اختبار خوارزمية الربط اللحظي P2P والتأكد من انضمام اللاعبين للغرفة برابط سريع بدون تحميل.',
        assigneeId: 'fahad',
        assigneeName: 'فهد',
        assigneeRole: 'التقنية والتطوير',
        assigneeAvatar: '👨‍💻',
        expectedResult: 'استقرار الغرف وتأكيد صفرية تكاليف الخوادم بالاعتماد على WebRTC المجانية.',
        dependencies: ['step-1'],
        status: 'WORKING',
        progress: 75,
        startedAt: '09:30',
        isTechnical: true,
        toolsRequired: ['openhands:bash', 'openhands:read_file', 'openhands:webrtc_audit']
      },
      {
        id: 'step-3',
        stepNumber: 3,
        title: 'اختبار الألعاب التفاعلية ورصد التفاعلات المعطلة',
        objective: 'تجربة كافة أنماط اللعب (تحديات سريعة، أسئلة صراحة، مين أكثر واحد) وتوثيق أي خلل في احتساب النقاط.',
        assigneeId: 'noura',
        assigneeName: 'نورة',
        assigneeRole: 'التحليلات والجودة',
        assigneeAvatar: '📊',
        expectedResult: 'تقرير شامل عن دقة عدّاد الثواني والمزامنة اللحظية بين شاشات اللاعبين.',
        dependencies: ['step-2'],
        status: 'READY',
        progress: 0,
        isTechnical: true,
        toolsRequired: ['openhands:run_tests', 'openhands:latency_bench']
      },
      {
        id: 'step-4',
        stepNumber: 4,
        title: 'معالجة أهم الملاحظات ذات الأولوية القصوى',
        objective: 'إصلاح أي بطء أو تأخير في استجابة البطاقات وتأكيد التوافق التام مع متصفحات سفاري وكروم.',
        assigneeId: 'fahad',
        assigneeName: 'فهد',
        assigneeRole: 'التقنية والتطوير',
        assigneeAvatar: '👨‍💻',
        expectedResult: 'تحديث الكود واجتياز فحوصات الأداء بنسبة 100%.',
        dependencies: ['step-3'],
        status: 'READY',
        progress: 0,
        isTechnical: true,
        toolsRequired: ['openhands:edit_code', 'openhands:run_linter']
      },
      {
        id: 'step-5',
        stepNumber: 5,
        title: 'إعادة الاختبار الشامل وضمان الجودة (QA & Mobile Review)',
        objective: 'فحص نهائي لتجربة المستخدم على 5 أنواع من شاشات الجوال لضمان أقصى متعة وسهولة.',
        assigneeId: 'rayan',
        assigneeName: 'ريان',
        assigneeRole: 'إدارة المشروع',
        assigneeAvatar: '🎮',
        expectedResult: 'إغلاق كافة الملاحظات واعتماد الجاهزية التشغيلية للعبة.',
        dependencies: ['step-4'],
        status: 'READY',
        progress: 0
      },
      {
        id: 'step-6',
        stepNumber: 6,
        title: 'إعداد التقرير النهائي ورفعه للمدير التنفيذي نواف',
        objective: 'توثيق نتائج الخطة والجاهزية، مع تقديم توصيات الإطلاق العضوي المجاني.',
        assigneeId: 'rayan',
        assigneeName: 'ريان',
        assigneeRole: 'إدارة المشروع',
        assigneeAvatar: '🎮',
        expectedResult: 'تقرير مخرجات كامل معروض في لوحة القرارات بانتظار إشارة البدء.',
        dependencies: ['step-5'],
        status: 'WAITING_FOR_NAWAF',
        progress: 0
      }
    ]
  }
];

