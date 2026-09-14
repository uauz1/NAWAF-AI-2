export type OrchestratorStatus = 'CONNECTED' | 'NOT_CONFIGURED' | 'UNAVAILABLE';

export interface CrewOrchestratorState {
  status: OrchestratorStatus;
  endpoint: string | null;
  lastChecked: string;
  error?: string;
}

export class CrewOrchestrator {
  private static instance: CrewOrchestrator;
  private state: CrewOrchestratorState = {
    status: 'NOT_CONFIGURED',
    endpoint: null,
    lastChecked: new Date().toISOString(),
  };

  private constructor() {}

  public static getInstance(): CrewOrchestrator {
    if (!CrewOrchestrator.instance) {
      CrewOrchestrator.instance = new CrewOrchestrator();
    }
    return CrewOrchestrator.instance;
  }

  public async checkStatus(): Promise<CrewOrchestratorState> {
    try {
      const res = await fetch('/api/orchestrator/status');
      if (!res.ok) {
        this.state = {
          status: 'UNAVAILABLE',
          endpoint: null,
          lastChecked: new Date().toISOString(),
          error: `Server responded with status ${res.status}`,
        };
        return this.state;
      }

      const data = await res.json();
      const backendStatus = data.crewai?.status;
      this.state = {
        status: backendStatus === 'CONNECTED'
          ? 'CONNECTED'
          : backendStatus === 'NOT_CONFIGURED'
            ? 'NOT_CONFIGURED'
            : 'UNAVAILABLE',
        endpoint: data.crewai?.endpoint || null,
        lastChecked: new Date().toISOString(),
        error: backendStatus === 'ERROR' ? 'CrewAI health check failed.' : undefined,
      };
    } catch (error: any) {
      this.state = {
        status: 'UNAVAILABLE',
        endpoint: null,
        lastChecked: new Date().toISOString(),
        error: error?.message || 'Failed to check orchestrator status',
      };
    }
    return this.state;
  }

  public getState(): CrewOrchestratorState {
    return this.state;
  }

  public async runWorkflow(
    workflowId: string,
    payload: any,
  ): Promise<{ success: boolean; status: OrchestratorStatus; error?: string; result?: any }> {
    const current = await this.checkStatus();
    if (current.status !== 'CONNECTED') {
      return {
        success: false,
        status: current.status,
        error: current.status === 'NOT_CONFIGURED'
          ? 'CREWAI: NOT_CONFIGURED — لا يوجد خادم CrewAI حقيقي متصل.'
          : `CREWAI: UNAVAILABLE — ${current.error || 'تعذر الوصول إلى خدمة CrewAI.'}`,
      };
    }

    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'orchestrate',
          params: { workflowId, payload },
        }),
      });
      const data = await res.json();
      return {
        success: Boolean(res.ok && data?.ok),
        status: 'CONNECTED',
        result: data?.output,
        error: data?.ok ? undefined : (data?.error || 'CrewAI execution failed.'),
      };
    } catch (error: any) {
      return {
        success: false,
        status: 'UNAVAILABLE',
        error: `خطأ في الاتصال بخادم CrewAI: ${error?.message || 'unknown error'}`,
      };
    }
  }
}
