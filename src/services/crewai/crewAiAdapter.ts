export type CrewAiStatus = 'CONNECTED' | 'NOT_CONFIGURED' | 'ERROR';

export interface CrewAiAdapterConfig {
  endpoint?: string;
  status: CrewAiStatus;
}

export class CrewAiAdapter {
  private static instance: CrewAiAdapter;
  private status: CrewAiStatus = 'NOT_CONFIGURED';
  private endpoint: string | null = null;

  private constructor() {}

  public static getInstance(): CrewAiAdapter {
    if (!CrewAiAdapter.instance) {
      CrewAiAdapter.instance = new CrewAiAdapter();
    }
    return CrewAiAdapter.instance;
  }

  /**
   * Health check against backend engine status.
   * Only marked CONNECTED if a real external service answers a health check.
   */
  public async checkHealth(): Promise<CrewAiStatus> {
    try {
      const res = await fetch('/api/engine/status');
      if (!res.ok) {
        this.status = 'ERROR';
        return this.status;
      }
      const data = await res.json();
      this.status = data.crewai?.status || 'NOT_CONFIGURED';
      this.endpoint = data.crewai?.endpoint || null;
      return this.status;
    } catch {
      this.status = 'ERROR';
      return this.status;
    }
  }

  public getStatus(): CrewAiStatus {
    return this.status;
  }

  public getEndpoint(): string | null {
    return this.endpoint;
  }
}
