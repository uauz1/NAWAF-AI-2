import {
  INITIAL_DEPARTMENTS,
  INITIAL_PROJECTS,
  INITIAL_EMPLOYEES,
} from '../../data/initialData';

const BASE = 'nawaf_hq_os_data_v1';
const MIGRATION_KEY = 'nawaf_hq_truth_migration_v4';

function safeSet(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to persist truthful-state migration for ${key}`, error);
  }
}

export function initializeTruthfulState() {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(MIGRATION_KEY) === 'done') return;

  const cleanDepartments = INITIAL_DEPARTMENTS.map((department) => ({
    ...department,
    activeTasks: 0,
  }));

  const cleanProjects = INITIAL_PROJECTS.map((project) => ({
    ...project,
    progress: 0,
    currentPhase: 'بانتظار أول تنفيذ موثق',
    health: 'يحتاج انتباه' as const,
    bugsCount: 0,
    marketingPhase: '',
    activeIdeasCount: 0,
    recentMilestones: [],
    tasks: [],
  }));

  const cleanEmployees = INITIAL_EMPLOYEES.map((employee) => ({
    ...employee,
    status: 'READY' as const,
    currentTask: '',
    taskProgress: 0,
    productivity: 0,
    recentWork: [],
    tasksCompletedCount: 0,
    collaborationHistory: [],
    lastResult: undefined,
    availability: 'available',
  }));

  safeSet(`${BASE}_departments`, cleanDepartments);
  safeSet(`${BASE}_projects`, cleanProjects);
  safeSet(`${BASE}_employees`, cleanEmployees);
  safeSet(`${BASE}_decisions`, []);
  safeSet(`${BASE}_ideas`, []);
  safeSet(`${BASE}_activities`, []);
  safeSet(`${BASE}_campaigns`, []);
  safeSet(`${BASE}_reports`, []);
  safeSet(`${BASE}_plans`, []);
  safeSet(`${BASE}_advisor_msgs`, []);
  localStorage.removeItem(`${BASE}_meeting`);

  // Supersede earlier seeded/demo-state migrations once, then keep this baseline stable.
  localStorage.setItem(MIGRATION_KEY, 'done');
}
