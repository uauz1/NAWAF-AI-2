import React, { useEffect, useState } from 'react';
import { Terminal, X, FileCode2, Play, RotateCw, FolderSearch, AlertCircle } from 'lucide-react';
import { OpenHandsAdapter, RealExecutionLog } from '../../services/openhands/adapter';
import { ToolRouter } from '../../services/tools/toolRouter';

interface OpenHandsTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentName?: string;
  projectId?: string;
}

function nowAr() {
  return new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function text(value: unknown, fallback = 'لا توجد مخرجات نصية من الخادم.') {
  if (typeof value === 'string' && value.trim()) return value.trim();
  return fallback;
}

export const OpenHandsTerminalModal: React.FC<OpenHandsTerminalModalProps> = ({
  isOpen,
  onClose,
  agentName = 'فهد',
  projectId = 'hq',
}) => {
  const [adapterStatus, setAdapterStatus] = useState<'CONNECTED' | 'NOT_CONFIGURED' | 'UNAVAILABLE'>('NOT_CONFIGURED');
  const [logs, setLogs] = useState<RealExecutionLog[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [fileContent, setFileContent] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    OpenHandsAdapter.getInstance().checkStatus().then(st => setAdapterStatus(st.status));
  }, [isOpen]);

  const addLog = (log: Omit<RealExecutionLog, 'id' | 'timestamp' | 'isReal'>) => {
    setLogs(prev => [{ ...log, id: `log-${Date.now()}`, timestamp: nowAr(), isReal: true }, ...prev]);
  };

  const runInspection = async () => {
    setIsRunning(true);
    const res = await ToolRouter.getInstance().route({
      tool: 'inspect_repository',
      requestedBy: { agentId: 'fahad', agentName, role: 'مهندس برمجيات' },
      projectId,
    });
    setIsRunning(false);

    const data = res.data || {};
    const files = Array.isArray(data.files) ? data.files : [];
    const scripts = Array.isArray(data.packageJson?.scripts)
      ? data.packageJson.scripts
      : data.packageJson?.scripts && typeof data.packageJson.scripts === 'object'
        ? Object.keys(data.packageJson.scripts)
        : [];

    addLog({
      tool: 'inspect_repository',
      action: 'فحص المستودع',
      command: 'inspect_repository',
      durationMs: res.durationMs,
      exitCode: res.success ? 0 : 1,
      output: res.success
        ? `تم الفحص من الخادم.\nالملفات المرصودة: ${typeof data.totalFiles === 'number' ? data.totalFiles : files.length}.\nالحزمة: ${data.packageJson?.name || 'غير متاحة'}.\nScripts: ${scripts.length ? scripts.join(', ') : 'غير متاحة'}.`
        : `فشل الفحص: ${res.error || 'لم يرجع الخادم سبباً إضافياً.'}`,
    });
  };

  const runLinter = async () => {
    setIsRunning(true);
    const res = await ToolRouter.getInstance().route({
      tool: 'run_linter',
      requestedBy: { agentId: 'fahad', agentName, role: 'مهندس برمجيات' },
      projectId,
    });
    setIsRunning(false);

    const data = res.data || {};
    addLog({
      tool: 'run_linter',
      action: 'فحص TypeScript / Lint',
      command: data.command || 'npm run lint',
      durationMs: res.durationMs,
      exitCode: typeof data.exitCode === 'number' ? data.exitCode : (res.success ? 0 : 1),
      output: res.success
        ? `الحالة: ${data.status || 'PASS'}\n${text(data.stdout)}`
        : `الحالة: ${data.status || 'FAIL'}\n${text(data.stderr || res.error, 'فشل الفحص بدون مخرجات إضافية.')}`,
    });
  };

  const runTests = async () => {
    setIsRunning(true);
    const res = await ToolRouter.getInstance().route({
      tool: 'run_tests',
      requestedBy: { agentId: 'fahad', agentName, role: 'مهندس برمجيات' },
      projectId,
    });
    setIsRunning(false);

    const data = res.data || {};
    addLog({
      tool: 'run_tests',
      action: 'تشغيل الاختبارات',
      command: data.command || 'npm test',
      durationMs: res.durationMs,
      exitCode: typeof data.exitCode === 'number' ? data.exitCode : (res.success ? 0 : 1),
      output: res.success
        ? `الحالة: ${data.status || 'PASS'}\n${text(data.stdout)}`
        : `الحالة: ${data.status || 'FAIL'}\n${text(data.stderr || res.error, 'فشلت الاختبارات بدون مخرجات إضافية.')}`,
    });
  };

  const readPackage = async () => {
    setIsRunning(true);
    const res = await ToolRouter.getInstance().route({
      tool: 'read_file',
      params: { filePath: 'package.json' },
      requestedBy: { agentId: 'fahad', agentName, role: 'مهندس برمجيات' },
      projectId,
    });
    setIsRunning(false);

    const data = res.data || {};
    if (res.success) setFileContent(typeof data.content === 'string' ? data.content : '');
    addLog({
      tool: 'read_file',
      action: 'قراءة package.json',
      targetFile: 'package.json',
      durationMs: res.durationMs,
      exitCode: res.success ? 0 : 1,
      output: res.success
        ? `تمت القراءة من الخادم. الحجم: ${typeof data.sizeBytes === 'number' ? `${data.sizeBytes} بايت` : 'غير متاح'}.${data.truncated ? '\nالمحتوى المعروض مختصر.' : ''}`
        : `تعذرت القراءة: ${res.error || 'لم يرجع الخادم سبباً إضافياً.'}`,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-[#090b10] border border-cyan-500/30 shadow-2xl overflow-hidden text-right" dir="rtl">
        <div className="flex items-center justify-between px-4 py-3 bg-[#0d111a] border-b border-white/10">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-xs font-bold text-slate-200">OpenHands / Workspace Verification</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${adapterStatus === 'CONNECTED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
              OpenHands: {adapterStatus}
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"><X className="w-4 h-4" /></button>
        </div>

        {adapterStatus !== 'CONNECTED' && (
          <div className="px-4 py-2 bg-amber-950/20 border-b border-amber-500/20 flex items-center gap-2 text-xs text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>OpenHands غير متصل حالياً. الأدوات المحلية الموثقة أدناه قد تبقى متاحة بشكل مستقل.</span>
          </div>
        )}

        <div className="p-3 bg-[#0d111a] border-b border-white/5 flex flex-wrap items-center gap-2">
          <button onClick={runInspection} disabled={isRunning} className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50">
            <FolderSearch className="w-3.5 h-3.5" /><span>فحص المستودع</span>
          </button>
          <button onClick={runLinter} disabled={isRunning} className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50">
            <Play className="w-3.5 h-3.5" /><span>Lint</span>
          </button>
          <button onClick={runTests} disabled={isRunning} className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50">
            <Play className="w-3.5 h-3.5" /><span>Tests</span>
          </button>
          <button onClick={readPackage} disabled={isRunning} className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 border border-white/10 text-xs font-medium flex items-center gap-1.5 disabled:opacity-50">
            <FileCode2 className="w-3.5 h-3.5 text-cyan-400" /><span>قراءة package.json</span>
          </button>
          {isRunning && <span className="text-xs text-cyan-400 flex items-center gap-1 mr-auto"><RotateCw className="w-3 h-3 animate-spin" />جاري التنفيذ...</span>}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs text-slate-300 bg-[#05070a] min-h-[300px] max-h-[430px]">
          {logs.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-slate-500 gap-2">
              <Terminal className="w-8 h-8 opacity-40" />
              <p>شغّل أداة لرؤية النتيجة الحقيقية من الخادم.</p>
            </div>
          ) : logs.map(log => (
            <div key={log.id} className="p-3 rounded-xl bg-slate-900/60 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className={log.exitCode === 0 ? 'text-cyan-400 font-bold' : 'text-rose-400 font-bold'}>{log.action}</span>
                <span>{log.timestamp} · exit {log.exitCode} · {log.durationMs}ms</span>
              </div>
              <pre className="whitespace-pre-wrap break-words text-left" dir="ltr">{log.output}</pre>
            </div>
          ))}
        </div>

        {fileContent !== null && (
          <div className="border-t border-white/10 bg-[#0d111a] p-3 max-h-44 overflow-auto">
            <div className="text-[10px] text-slate-500 mb-1">package.json — content returned by backend</div>
            <pre className="text-[10px] text-slate-300 whitespace-pre-wrap text-left" dir="ltr">{fileContent.slice(0, 6000)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
