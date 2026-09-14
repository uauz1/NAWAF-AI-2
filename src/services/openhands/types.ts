export type OpenHandsActionType = 
  | 'cmd_run'
  | 'file_read'
  | 'file_edit'
  | 'test_run'
  | 'git_diff'
  | 'audit_security';

export interface OpenHandsLogEntry {
  id: string;
  timestamp: string;
  action: OpenHandsActionType;
  command?: string;
  targetFile?: string;
  observation: string;
  exitCode: number;
  durationMs: number;
  isError?: boolean;
}

export interface OpenHandsExecutionResult {
  sessionId: string;
  agentId: string;
  agentName: string;
  projectId: 'mueen' | 'qaddha' | 'hq';
  taskTitle: string;
  startedAt: string;
  completedAt: string;
  logs: OpenHandsLogEntry[];
  summary: string;
  filesInspected: string[];
  metrics: {
    testsPassed?: number;
    testsFailed?: number;
    latencyMs?: number;
    bundleSizeMb?: number;
    zeroCostVerified: boolean;
  };
}
