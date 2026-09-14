import { OpenHandsExecutionResult, OpenHandsLogEntry } from './types';
import { OpenHandsAdapter } from './openHandsAdapter';

function nowAr() {
  return new Date().toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function stringifyResult(value: unknown) {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export class OpenHandsEngine {
  private static instance: OpenHandsEngine;

  private constructor() {}

  public static getInstance(): OpenHandsEngine {
    if (!OpenHandsEngine.instance) {
      OpenHandsEngine.instance = new OpenHandsEngine();
    }
    return OpenHandsEngine.instance;
  }

  public async executeTechnicalTask(params: {
    agentId: string;
    agentName: string;
    projectId: 'mueen' | 'qaddha' | 'hq';
    taskTitle: string;
    objective: string;
  }): Promise<OpenHandsExecutionResult> {
    const sessionId = `oh-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const startedAt = nowAr();
    const adapter = OpenHandsAdapter.getInstance();
    const status = await adapter.checkHealth();

    if (status !== 'CONNECTED') {
      const logs: OpenHandsLogEntry[] = [{
        id: `${sessionId}-status`,
        timestamp: startedAt,
        action: 'cmd_run',
        observation: status === 'NOT_CONFIGURED'
          ? 'OpenHands غير متصل فعلياً. لم يتم تنفيذ أي أمر أو قراءة أي ملف.'
          : 'تعذر الوصول إلى خدمة OpenHands. لم يتم تنفيذ أي أمر أو قراءة أي ملف.',
        exitCode: 1,
        durationMs: 0,
        isError: true,
      }];

      return {
        sessionId,
        agentId: params.agentId,
        agentName: params.agentName,
        projectId: params.projectId,
        taskTitle: params.taskTitle,
        startedAt,
        completedAt: nowAr(),
        logs,
        filesInspected: [],
        summary: status === 'NOT_CONFIGURED'
          ? 'OPENHANDS: NOT_CONFIGURED — لا يوجد تنفيذ تقني حقيقي حتى يتم ربط خدمة OpenHands فعلية.'
          : 'OPENHANDS: ERROR — فشل الاتصال بمحرك التنفيذ، ولم يتم ادعاء أي نتيجة.',
        metrics: {
          testsPassed: 0,
          testsFailed: 0,
          zeroCostVerified: false,
        },
      };
    }

    const started = performance.now();
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'execute_code',
          projectId: params.projectId,
          params: {
            agentId: params.agentId,
            agentName: params.agentName,
            taskTitle: params.taskTitle,
            objective: params.objective,
          },
        }),
      });
      const result = await response.json();
      const durationMs = Math.round(performance.now() - started);

      if (!response.ok || !result?.ok) {
        const message = result?.error || `OpenHands request failed with HTTP ${response.status}`;
        return {
          sessionId,
          agentId: params.agentId,
          agentName: params.agentName,
          projectId: params.projectId,
          taskTitle: params.taskTitle,
          startedAt,
          completedAt: nowAr(),
          logs: [{
            id: `${sessionId}-error`,
            timestamp: nowAr(),
            action: 'cmd_run',
            observation: message,
            exitCode: 1,
            durationMs,
            isError: true,
          }],
          filesInspected: [],
          summary: `OpenHands لم يؤكد نجاح التنفيذ: ${message}`,
          metrics: {
            testsPassed: 0,
            testsFailed: 0,
            zeroCostVerified: false,
          },
        };
      }

      const output = result.output;
      const filesInspected = Array.isArray(output?.filesInspected)
        ? output.filesInspected
        : Array.isArray(output?.files)
          ? output.files
          : [];
      const testsPassed = Number(output?.metrics?.testsPassed ?? output?.testsPassed ?? 0) || 0;
      const testsFailed = Number(output?.metrics?.testsFailed ?? output?.testsFailed ?? 0) || 0;

      return {
        sessionId,
        agentId: params.agentId,
        agentName: params.agentName,
        projectId: params.projectId,
        taskTitle: params.taskTitle,
        startedAt,
        completedAt: nowAr(),
        logs: [{
          id: `${sessionId}-result`,
          timestamp: nowAr(),
          action: 'cmd_run',
          observation: stringifyResult(output),
          exitCode: 0,
          durationMs,
        }],
        filesInspected,
        summary: output?.summary || 'تم التنفيذ عبر خدمة OpenHands المتصلة فعلياً، وتم استلام نتيجة من الخادم.',
        metrics: {
          testsPassed,
          testsFailed,
          latencyMs: Number(output?.metrics?.latencyMs ?? output?.latencyMs) || undefined,
          bundleSizeMb: Number(output?.metrics?.bundleSizeMb ?? output?.bundleSizeMb) || undefined,
          zeroCostVerified: Boolean(output?.metrics?.zeroCostVerified ?? output?.zeroCostVerified ?? false),
        },
      };
    } catch (error: any) {
      const durationMs = Math.round(performance.now() - started);
      const message = error?.message || 'Unknown OpenHands connection error';
      return {
        sessionId,
        agentId: params.agentId,
        agentName: params.agentName,
        projectId: params.projectId,
        taskTitle: params.taskTitle,
        startedAt,
        completedAt: nowAr(),
        logs: [{
          id: `${sessionId}-exception`,
          timestamp: nowAr(),
          action: 'cmd_run',
          observation: message,
          exitCode: 1,
          durationMs,
          isError: true,
        }],
        filesInspected: [],
        summary: `فشل الاتصال الحقيقي بـ OpenHands: ${message}`,
        metrics: {
          testsPassed: 0,
          testsFailed: 0,
          zeroCostVerified: false,
        },
      };
    }
  }
}
