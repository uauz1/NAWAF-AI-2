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
  /** True only when the execution path that actually ran completed successfully. */
  success?: boolean;
  /** Distinguishes real OpenHands execution from truthful local verification fallback. */
  source?: 'openhands-runtime' | 'local-verification';
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
