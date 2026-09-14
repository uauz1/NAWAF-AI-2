export type OpenHandsStatus = 'CONNECTED' | 'NOT_CONFIGURED' | 'ERROR';

export interface OpenHandsAdapterConfig {
  endpoint?: string;
  status: OpenHandsStatus;
}

export class OpenHandsAdapter {
  private static instance: OpenHandsAdapter;
  private status: OpenHandsStatus = 'NOT_CONFIGURED';
  private endpoint: string | null = null;

  private constructor() {}

  public static getInstance(): OpenHandsAdapter {
    if (!OpenHandsAdapter.instance) {
      OpenHandsAdapter.instance = new OpenHandsAdapter();
    }
    return OpenHandsAdapter.instance;
  }

  /**
   * Health check against backend engine status.
   * Only marked CONNECTED if a real external service answers a health check.
   */
  public async checkHealth(): Promise<OpenHandsStatus> {
    try {
      const res = await fetch('/api/engine/status');
      if (!res.ok) {
        this.status = 'ERROR';
        return this.status;
      }
      const data = await res.json();
      this.status = data.openhands?.status || 'NOT_CONFIGURED';
      this.endpoint = data.openhands?.endpoint || null;
      return this.status;
    } catch {
      this.status = 'ERROR';
      return this.status;
    }
  }

  public getStatus(): OpenHandsStatus {
    return this.status;
  }

  public getEndpoint(): string | null {
    return this.endpoint;
  }
}
