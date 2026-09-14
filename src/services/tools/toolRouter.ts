import { OpenHandsAdapter } from '../openhands/adapter';
import { CrewOrchestrator } from '../crewai/orchestrator';

export type ToolName = 
  | 'inspect_repository'
  | 'read_file'
  | 'run_linter'
  | 'run_tests'
  | 'modify_file'
  | 'run_command'
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
    if (!ToolRouter.instance) {
      ToolRouter.instance = new ToolRouter();
    }
    return ToolRouter.instance;
  }

  public async route(request: ToolExecutionRequest): Promise<ToolExecutionResponse> {
    const startTime = Date.now();
    const timestamp = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    try {
      if (request.tool === 'inspect_repository') {
        const adapter = OpenHandsAdapter.getInstance();
        const res = await adapter.inspectRepository();
        return {
          success: res.success,
          tool: request.tool,
          timestamp,
          durationMs: Date.now() - startTime,
          data: res,
          error: res.error,
          isReal: true
        };
      }

      if (request.tool === 'read_file') {
        const filePath = request.params?.filePath;
        if (!filePath) {
          return {
            success: false,
            tool: request.tool,
            timestamp,
            durationMs: Date.now() - startTime,
            error: 'لم يتم تحديد مسار الملف المطلوب قراءته.',
            isReal: true
          };
        }
        const adapter = OpenHandsAdapter.getInstance();
        const res = await adapter.readFile(filePath);
        return {
          success: res.success,
          tool: request.tool,
          timestamp,
          durationMs: Date.now() - startTime,
          data: res,
          error: res.error,
          isReal: true
        };
      }

      if (request.tool === 'run_linter' || request.tool === 'run_tests') {
        const adapter = OpenHandsAdapter.getInstance();
        const res = await adapter.runLinter();
        return {
          success: res.success,
          tool: request.tool,
          timestamp,
          durationMs: Date.now() - startTime,
          data: res,
          error: res.error,
          isReal: true
        };
      }

      if (request.tool === 'modify_file' || request.tool === 'run_command') {
        const adapter = OpenHandsAdapter.getInstance();
        const res = await adapter.modifyFile(request.params?.filePath || '', request.params?.content || '');
        return {
          success: false,
          tool: request.tool,
          timestamp,
          durationMs: Date.now() - startTime,
          error: res.error || 'التنفيذ البرمجي وتعديل الأكواد غير متصل حاليًا (محرك OpenHands: NOT_CONFIGURED).',
          isReal: true
        };
      }

      if (request.tool === 'request_ceo_approval') {
        return {
          success: true,
          tool: request.tool,
          timestamp,
          durationMs: Date.now() - startTime,
          data: {
            title: request.params?.title,
            description: request.params?.description,
            projectId: request.projectId,
            requestedBy: request.requestedBy.agentName,
            status: 'waiting'
          },
          isReal: true
        };
      }

      return {
        success: false,
        tool: request.tool,
        timestamp,
        durationMs: Date.now() - startTime,
        error: `الأداة ${request.tool} غير مدعومة في نظام التوجيه الحالي.`,
        isReal: true
      };

    } catch (err: any) {
      return {
        success: false,
        tool: request.tool,
        timestamp,
        durationMs: Date.now() - startTime,
        error: err.message || 'خطأ غير متوقع في محرك الأدوات',
        isReal: true
      };
    }
  }
}
