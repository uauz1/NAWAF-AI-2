export type OpenHandsStatus = 'CONNECTED' | 'NOT_CONFIGURED' | 'UNAVAILABLE';

export interface OpenHandsAdapterState {
  status: OpenHandsStatus;
  endpoint: string | null;
  lastChecked: string;
  error?: string;
}

export interface RealExecutionLog {
  id: string;
  timestamp: string;
  tool: string;
  action: string;
  command?: string;
  targetFile?: string;
  durationMs: number;
  exitCode: number;
  output: string;
  isReal: true;
}

export interface RealExecutionResult {
  sessionId: string;
  agentId: string;
  agentName: string;
  projectId: string;
  taskTitle: string;
  startedAt: string;
  completedAt: string;
  status: 'SUCCESS' | 'FAILED' | 'NOT_CONFIGURED';
  logs: RealExecutionLog[];
  filesInspected: string[];
  summary: string;
  rawResult?: any;
}

export class OpenHandsAdapter {
  private static instance: OpenHandsAdapter;
  private state: OpenHandsAdapterState = {
    status: 'NOT_CONFIGURED',
    endpoint: null,
    lastChecked: new Date().toISOString()
  };

  private constructor() {}

  public static getInstance(): OpenHandsAdapter {
    if (!OpenHandsAdapter.instance) {
      OpenHandsAdapter.instance = new OpenHandsAdapter();
    }
    return OpenHandsAdapter.instance;
  }

  public async checkStatus(): Promise<OpenHandsAdapterState> {
    try {
      const res = await fetch('/api/orchestrator/status');
      if (res.ok) {
        const data = await res.json();
        this.state = {
          status: data.openhands?.status || 'NOT_CONFIGURED',
          endpoint: data.openhands?.endpoint || null,
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
        error: err.message || 'Failed to check OpenHands status'
      };
    }
    return this.state;
  }

  public getState(): OpenHandsAdapterState {
    return this.state;
  }

  /**
   * Execute real tool via backend Tool Router
   */
  public async executeTool(tool: string, params?: any): Promise<{ success: boolean; data?: any; error?: string; status?: OpenHandsStatus }> {
    try {
      const res = await fetch('/api/tools/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool, params })
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'فشل الاتصال بالواجهة الخلفية لتنفيذ الأداة'
      };
    }
  }

  /**
   * Inspect actual files in the repository
   */
  public async inspectRepository(): Promise<{ success: boolean; files?: string[]; totalFiles?: number; packageJson?: any; error?: string }> {
    const res = await this.executeTool('inspect_repository');
    if (res.success && res.data) {
      return {
        success: true,
        files: res.data.files,
        totalFiles: res.data.totalFilesScanned,
        packageJson: res.data.packageJson
      };
    }
    return { success: false, error: res.error || 'فشل فحص المستودع' };
  }

  /**
   * Read actual file from the workspace
   */
  public async readFile(filePath: string): Promise<{ success: boolean; content?: string; sizeBytes?: number; error?: string }> {
    const res = await this.executeTool('read_file', { filePath });
    if (res.success && res.data) {
      return {
        success: true,
        content: res.data.content,
        sizeBytes: res.data.sizeBytes
      };
    }
    return { success: false, error: res.error || `تعذر قراءة الملف: ${filePath}` };
  }

  /**
   * Run real linter / type checks
   */
  public async runLinter(): Promise<{ success: boolean; stdout?: string; stderr?: string; exitCode?: number; error?: string }> {
    const res = await this.executeTool('run_linter');
    if (res.data) {
      return {
        success: res.data.exitCode === 0,
        stdout: res.data.stdout,
        stderr: res.data.stderr,
        exitCode: res.data.exitCode
      };
    }
    return { success: false, error: res.error || 'تعذر تشغيل الفحص البرمجي' };
  }

  /**
   * Modify file (Requires OpenHands remote runtime)
   */
  public async modifyFile(filePath: string, content: string): Promise<{ success: boolean; error: string; status: OpenHandsStatus }> {
    const res = await this.executeTool('modify_file', { filePath, content });
    return {
      success: false,
      status: (res.status as OpenHandsStatus) || 'NOT_CONFIGURED',
      error: res.error || 'التنفيذ البرمجي غير متصل حاليًا (OpenHands: NOT_CONFIGURED).'
    };
  }
}
