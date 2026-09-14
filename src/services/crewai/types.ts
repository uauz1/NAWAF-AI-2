export type AgentPermission = 
  | 'openhands:exec_cmd'
  | 'openhands:read_file'
  | 'openhands:write_code'
  | 'openhands:run_tests'
  | 'openhands:git_commit'
  | 'crew:delegate_task'
  | 'crew:request_ceo_approval'
  | 'crew:publish_report'
  | 'crew:manage_budget'
  | 'crew:access_analytics';

export interface AgentToolDefinition {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  category: 'technical' | 'orchestration' | 'verification' | 'design' | 'growth';
  isZeroCost: boolean;
}

export interface AgentMemory {
  shortTermMemory: string[];
  longTermMemory: string[];
  entityMemory: Record<string, string>;
}

export interface CrewAgentConfig {
  id: string;
  name: string;
  role: string;
  roleAr: string;
  goal: string;
  backstory: string;
  departmentId: string;
  avatar: string;
  robotColor: string;
  permissions: AgentPermission[];
  tools: string[];
  memory: AgentMemory;
  assignedProject: 'mueen' | 'qaddha' | 'hq';
  allowDelegation: boolean;
  maxIterations: number;
}

export interface CrewTask {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  expectedOutput: string;
  agentId: string;
  isTechnical: boolean;
  dependencies: string[];
  toolsRequired: string[];
  requiresApproval?: boolean;
  status: 'PENDING' | 'DELEGATED' | 'IN_PROGRESS' | 'TECHNICAL_EXECUTION' | 'COMPLETED' | 'BLOCKED' | 'WAITING_APPROVAL';
  progress: number;
  result?: string;
  blockerReason?: string;
  openHandsLogs?: Array<{
    action: string;
    command?: string;
    targetFile?: string;
    observation: string;
    exitCode: number;
    durationMs: number;
    timestamp: string;
  }>;
}

export interface CrewPlan {
  id: string;
  title: string;
  goal: string;
  projectId: 'mueen' | 'qaddha' | 'hq';
  projectName: string;
  managerAgentId: string;
  createdAt: string;
  status: 'PLANNING' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  tasks: CrewTask[];
  summary: string;
}
