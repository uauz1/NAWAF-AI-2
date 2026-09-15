import { OpenHandsAdapter } from '../openhands/adapter';

export type ToolName =
  | 'inspect_repository'
  | 'read_file'
  | 'run_linter'
  | 'run_tests'
  | 'modify_file'
  | 'request_ceo_approval';

export interface ToolExecutionRequest {
  tool: ToolName;
  params?: any;
  requestedBy: {
    agentId: string;
    agentName: string;
    role: string;
  };
  projectId?: string;
}

export interface ToolExecutionResponse {
  success: boolean;
  tool: ToolName;
  timestamp: string;
  durationMs: number;
  data?: any;
  error?: string;
  isReal: true;
}

export class ToolRouter {
  private static instance: ToolRouter;
  private constructor() {}

  public static getInstance(): ToolRouter {
    if (!ToolRouter.instance) ToolRouter.instance = new ToolRouter();
    return ToolRouter.instance;
  }

  public async route(request: ToolExecutionRequest): Promise<ToolExecutionResponse> {
    const started = Date.now();
    const timestamp = new Date().toLocaleTimeString('ar-SA', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    const adapter = OpenHandsAdapter.getInstance();

    try {
      let res: any;
      switch (request.tool) {
        case 'inspect_repository':
          res = await adapter.inspectRepository();
          break;
        case 'read_file':
          if (!request.params?.filePath) {
            return { success: false, tool: request.tool, timestamp, durationMs: Date.now() - started, error: 'لم يتم تحديد مسار الملف.', isReal: true };
          }
          res = await adapter.readFile(request.params.filePath);
          break;
        case 'run_linter':
          res = await adapter.runLinter();
          break;
        case 'run_tests':
          res = await adapter.runTests();
          break;
        case 'modify_file':
          res = await adapter.modifyFile(request.params?.filePath || '', request.params?.content || '');
          break;
        case 'request_ceo_approval':
          return {
            success: true,
            tool: request.tool,
            timestamp,
            durationMs: Date.now() - started,
            data: {
              title: request.params?.title,
              description: request.params?.description,
              projectId: request.projectId,
              requestedBy: request.requestedBy.agentName,
              status: 'waiting',
            },
            isReal: true,
          };
        default:
          return { success: false, tool: request.tool, timestamp, durationMs: Date.now() - started, error: `الأداة ${request.tool} غير مدعومة.`, isReal: true };
      }

      return {
        success: Boolean(res?.success),
        tool: request.tool,
        timestamp,
        durationMs: Date.now() - started,
        data: res?.data ?? res,
        error: res?.error,
        isReal: true,
      };
    } catch (error: any) {
      return {
        success: false,
        tool: request.tool,
        timestamp,
        durationMs: Date.now() - started,
        error: error?.message || 'خطأ غير متوقع في محرك الأدوات',
        isReal: true,
      };
    }
  }
}
