import { OpenHandsExecutionResult, OpenHandsLogEntry } from './types';
import { OpenHandsAdapter } from './adapter';

function nowAr() {
  return new Date().toLocaleTimeString('ar-SA', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}

function stringify(value: unknown) {
  try { return typeof value === 'string' ? value : JSON.stringify(value, null, 2); }
  catch { return String(value); }
}

export class OpenHandsEngine {
  private static instance: OpenHandsEngine;
  private constructor() {}

  public static getInstance(): OpenHandsEngine {
    if (!OpenHandsEngine.instance) OpenHandsEngine.instance = new OpenHandsEngine();
    return OpenHandsEngine.instance;
  }

  public async executeTechnicalTask(params: {
    agentId: string;
    agentName: string;
    projectId: 'mueen' | 'qaddha' | 'hq';
    taskTitle: string;
    objective: string;
  }): Promise<OpenHandsExecutionResult> {
    const adapter = OpenHandsAdapter.getInstance();
    const sessionId = `exec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const startedAt = nowAr();
    const logs: OpenHandsLogEntry[] = [];
    const filesInspected: string[] = [];

    const state = await adapter.checkStatus();

    // If a real OpenHands runtime exists, send the technical job to it.
    if (state.status === 'CONNECTED') {
      const started = performance.now();
      try {
        const response = await fetch('/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'execute_code',
            params: {
              agentId: params.agentId,
              agentName: params.agentName,
              projectId: params.projectId,
              taskTitle: params.taskTitle,
              objective: params.objective,
            },
          }),
        });
        const result = await response.json();
        const durationMs = Math.round(performance.now() - started);
        if (!response.ok || !result?.ok) throw new Error(result?.error || `HTTP ${response.status}`);
        const output = result.output;
        const realFiles = Array.isArray(output?.filesInspected) ? output.filesInspected : (Array.isArray(output?.files) ? output.files : []);
        filesInspected.push(...realFiles);
        logs.push({
          id: `${sessionId}-openhands`, timestamp: nowAr(), action: 'cmd_run',
          observation: stringify(output), exitCode: 0, durationMs
        });
        return {
          sessionId, agentId: params.agentId, agentName: params.agentName,
          projectId: params.projectId, taskTitle: params.taskTitle,
          startedAt, completedAt: nowAr(), success: true, source: 'openhands-runtime', logs, filesInspected,
          summary: output?.summary || 'اكتمل التنفيذ عبر OpenHands المتصل فعلياً وتم استلام النتيجة من الخادم.',
          metrics: {
            testsPassed: Number(output?.metrics?.testsPassed ?? output?.testsPassed ?? 0) || 0,
            testsFailed: Number(output?.metrics?.testsFailed ?? output?.testsFailed ?? 0) || 0,
            latencyMs: Number(output?.metrics?.latencyMs ?? output?.latencyMs) || undefined,
            bundleSizeMb: Number(output?.metrics?.bundleSizeMb ?? output?.bundleSizeMb) || undefined,
            zeroCostVerified: Boolean(output?.metrics?.zeroCostVerified ?? output?.zeroCostVerified ?? false),
          },
        };
      } catch (error: any) {
        logs.push({
          id: `${sessionId}-openhands-error`, timestamp: nowAr(), action: 'cmd_run',
          observation: error?.message || 'OpenHands execution failed', exitCode: 1,
          durationMs: Math.round(performance.now() - started), isError: true
        });
      }
    }

    // Honest local fallback: perform only checks the local backend can really execute.
    const inspection = await adapter.inspectRepository();
    if (inspection.success) {
      filesInspected.push(...(inspection.files || []));
      logs.push({
        id: `${sessionId}-inspect`, timestamp: nowAr(), action: 'file_read',
        observation: `تم فحص ${inspection.totalFiles || 0} ملفاً فعلياً في مساحة عمل NAWAF-AI-2.`,
        exitCode: 0, durationMs: 0
      });
    } else {
      logs.push({
        id: `${sessionId}-inspect-error`, timestamp: nowAr(), action: 'file_read',
        observation: inspection.error || 'فشل فحص مساحة العمل.', exitCode: 1, durationMs: 0, isError: true
      });
    }

    const lint = await adapter.runLinter();
    const lintData = lint.data || {};
    logs.push({
      id: `${sessionId}-lint`, timestamp: nowAr(), action: 'test_run',
      command: lintData.command || 'npm run lint',
      observation: lint.success ? (lintData.stdout || 'TypeScript check passed.') : (lintData.stderr || lint.error || 'Lint failed.'),
      exitCode: lint.success ? 0 : Number(lintData.exitCode ?? 1), durationMs: 0, isError: !lint.success
    });

    const tests = await adapter.runTests();
    const testData = tests.data || {};
    logs.push({
      id: `${sessionId}-tests`, timestamp: nowAr(), action: 'test_run',
      command: testData.command || 'npm run test',
      observation: tests.success ? (testData.stdout || 'Configured test command passed.') : (testData.stderr || tests.error || 'Tests failed or are unavailable.'),
      exitCode: tests.success ? 0 : Number(testData.exitCode ?? 1), durationMs: 0, isError: !tests.success
    });

    const localSuccess = inspection.success && lint.success && tests.success;
    return {
      sessionId, agentId: params.agentId, agentName: params.agentName,
      projectId: params.projectId, taskTitle: params.taskTitle,
      startedAt, completedAt: nowAr(), success: localSuccess, source: 'local-verification', logs, filesInspected,
      summary: localSuccess
        ? (state.status === 'CONNECTED'
            ? 'تعذر تنفيذ OpenHands الخارجي، لكن الفحص المحلي الحقيقي للمستودع وTypeScript والاختبارات اكتمل بنجاح. لم يتم تنفيذ تعديل كود عبر OpenHands.'
            : `OpenHands ${state.status === 'NOT_CONFIGURED' ? 'غير مربوط حالياً' : 'غير متاح حالياً'}؛ اكتمل الفحص المحلي الحقيقي للمستودع وTypeScript والاختبارات بنجاح، بدون تنفيذ تعديل كود عبر OpenHands.`)
        : (state.status === 'CONNECTED'
            ? 'تعذر تنفيذ OpenHands الخارجي، كما أن واحداً أو أكثر من الفحوص المحلية الحقيقية فشل أو لم يكن متاحاً.'
            : `OpenHands ${state.status === 'NOT_CONFIGURED' ? 'غير مربوط حالياً' : 'غير متاح حالياً'}؛ واحد أو أكثر من الفحوص المحلية الحقيقية فشل أو لم يكن متاحاً.`),
      metrics: {
        testsPassed: tests.success ? 1 : 0,
        testsFailed: tests.success ? 0 : 1,
        zeroCostVerified: false,
      },
    };
  }
}
