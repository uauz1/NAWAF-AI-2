export interface ExecutionResult<T = any> {
  ok: boolean;
  action: string;
  startedAt: string;
  finishedAt: string;
  output: T | null;
  error: string | null;
}

export type ExecutionEngineStatus = 'CONNECTED' | 'NOT_CONFIGURED' | 'ERROR';

export interface SystemEngineStatus {
  executionEngine: ExecutionEngineStatus;
  crewai: {
    status: ExecutionEngineStatus;
    endpoint: string | null;
  };
  openhands: {
    status: ExecutionEngineStatus;
    endpoint: string | null;
  };
  localBackend: {
    status: 'CONNECTED';
    nodeVersion?: string;
    timestamp?: string;
  };
}

export class ExecutionAdapter {
  private static instance: ExecutionAdapter;

  private constructor() {}

  public static getInstance(): ExecutionAdapter {
    if (!ExecutionAdapter.instance) {
      ExecutionAdapter.instance = new ExecutionAdapter();
    }
    return ExecutionAdapter.instance;
  }

  public async getEngineStatus(): Promise<SystemEngineStatus> {
    try {
      const res = await fetch('/api/engine/status');
      if (!res.ok) {
        return {
          executionEngine: 'ERROR',
          crewai: { status: 'ERROR', endpoint: null },
          openhands: { status: 'ERROR', endpoint: null },
          localBackend: { status: 'CONNECTED' }
        };
      }
      return await res.json();
    } catch {
      return {
        executionEngine: 'NOT_CONFIGURED',
        crewai: { status: 'NOT_CONFIGURED', endpoint: null },
        openhands: { status: 'NOT_CONFIGURED', endpoint: null },
        localBackend: { status: 'CONNECTED' }
      };
    }
  }

  public async execute<T = any>(action: string, params?: any, projectId?: string): Promise<ExecutionResult<T>> {
    const startedAt = new Date().toISOString();
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, params, projectId })
      });

      const data = await res.json();
      return data;
    } catch (err: any) {
      return {
        ok: false,
        action,
        startedAt,
        finishedAt: new Date().toISOString(),
        output: null,
        error: err.message || 'فشل الاتصال بالواجهة الخلفية (Backend Connection Error)'
      };
    }
  }
}
