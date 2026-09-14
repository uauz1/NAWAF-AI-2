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
    lastChecked: new Date().toISOString()
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
      if (res.ok) {
        const data = await res.json();
        this.state = {
          status: data.crewai?.status || 'NOT_CONFIGURED',
          endpoint: data.crewai?.endpoint || null,
          lastChecked: new Date().toISOString()
        };
      } else {
        this.state = {
          status: 'UNAVAILABLE',
          endpoint: null,
          lastChecked: new Date().toISOString(),
          error: `Server responded with status ${res.status}`
        };
      }
    } catch (err: any) {
      this.state = {
        status: 'UNAVAILABLE',
        endpoint: null,
        lastChecked: new Date().toISOString(),
        error: err.message || 'Failed to check orchestrator status'
      };
    }
    return this.state;
  }

  public getState(): CrewOrchestratorState {
    return this.state;
  }

  public async runWorkflow(workflowId: string, payload: any): Promise<{ success: boolean; status: OrchestratorStatus; error?: string; result?: any }> {
    if (this.state.status !== 'CONNECTED') {
      return {
        success: false,
        status: this.state.status,
        error: 'محرك CrewAI غير متصل حالياً (NOT_CONFIGURED). لا يمكن بدء سير عمل التنسيق الآلي بدون خادم CrewAI متصل.'
      };
    }

    try {
      const res = await fetch(`${this.state.endpoint}/api/crew/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId, payload })
      });
      const data = await res.json();
      return { success: res.ok, status: 'CONNECTED', result: data };
    } catch (err: any) {
      return {
        success: false,
        status: 'UNAVAILABLE',
        error: `خطأ في الاتصال بخادم CrewAI: ${err.message}`
      };
    }
  }
}
