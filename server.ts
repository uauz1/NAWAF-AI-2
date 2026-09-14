import express from 'express';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const execAsync = promisify(exec);
type EngineStatus = 'CONNECTED' | 'NOT_CONFIGURED' | 'ERROR';
const workspaceRoot = process.cwd();

async function pingEngine(url?: string | null): Promise<EngineStatus> {
  if (!url) return 'NOT_CONFIGURED';
  try {
    const response = await fetch(`${url.replace(/\/$/, '')}/health`, {
      signal: AbortSignal.timeout(2500),
    });
    return response.ok ? 'CONNECTED' : 'ERROR';
  } catch {
    return 'ERROR';
  }
}

async function readPackageJson() {
  const raw = await fs.promises.readFile(path.join(workspaceRoot, 'package.json'), 'utf8');
  return JSON.parse(raw);
}

async function scanWorkspace(maxFiles = 120) {
  const ignored = new Set(['node_modules', 'dist', '.git', '.next', '.cache', 'coverage']);
  const files: string[] = [];
  async function walk(dir: string): Promise<void> {
    if (files.length >= maxFiles) return;
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (files.length >= maxFiles) break;
      if (ignored.has(entry.name)) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(fullPath);
      else files.push(path.relative(workspaceRoot, fullPath));
    }
  }
  await walk(workspaceRoot);
  return files;
}

function safeWorkspacePath(relativePath: string) {
  const resolved = path.resolve(workspaceRoot, relativePath);
  const rootWithSep = workspaceRoot.endsWith(path.sep) ? workspaceRoot : `${workspaceRoot}${path.sep}`;
  if (resolved !== workspaceRoot && !resolved.startsWith(rootWithSep)) {
    throw new Error('Access denied: path is outside the workspace');
  }
  return resolved;
}

async function engineSnapshot() {
  const crewaiUrl = process.env.CREWAI_API_URL || null;
  const openhandsUrl = process.env.OPENHANDS_API_URL || null;
  const [crewaiStatus, openhandsStatus] = await Promise.all([
    pingEngine(crewaiUrl),
    pingEngine(openhandsUrl),
  ]);
  return {
    executionEngine: openhandsStatus,
    crewai: { status: crewaiStatus, endpoint: crewaiUrl },
    openhands: { status: openhandsStatus, endpoint: openhandsUrl },
    gemini: { status: process.env.GEMINI_API_KEY ? 'CONNECTED' : 'NOT_CONFIGURED' },
    localBackend: {
      status: 'CONNECTED' as const,
      nodeVersion: process.version,
      workspaceRoot,
      timestamp: new Date().toISOString(),
    },
  };
}

function sanitizeContext(value: unknown) {
  return JSON.parse(JSON.stringify(value ?? null));
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/api/engine/status', async (_req, res) => {
    res.json(await engineSnapshot());
  });

  app.get('/api/orchestrator/status', async (_req, res) => {
    const snapshot = await engineSnapshot();
    const pkg = await readPackageJson().catch(() => ({ scripts: {} }));
    const scripts = pkg.scripts || {};
    res.json({
      crewai: {
        ...snapshot.crewai,
        type: 'orchestrator',
        capabilities: snapshot.crewai.status === 'CONNECTED'
          ? ['delegation', 'task_planning', 'multi_agent_execution']
          : [],
      },
      openhands: {
        ...snapshot.openhands,
        type: 'code_executor',
        capabilities: snapshot.openhands.status === 'CONNECTED'
          ? ['modify_file', 'run_command', 'sandbox_execution']
          : [],
      },
      gemini: snapshot.gemini,
      localExecution: {
        status: 'CONNECTED',
        type: 'workspace_backend',
        capabilities: [
          'inspect_repository',
          'read_file',
          ...(scripts.lint ? ['run_linter'] : []),
          ...(scripts.test ? ['run_tests'] : []),
        ],
      },
    });
  });

  app.post('/api/agent/respond', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ ok: false, error: 'GEMINI_API_KEY is not configured.' });
    }

    const { userMessage, context } = req.body || {};
    if (!userMessage || typeof userMessage !== 'string') {
      return res.status(400).json({ ok: false, error: 'userMessage is required.' });
    }

    try {
      const safe = sanitizeContext(context);
      const prompt = `
You are an AI employee inside NAWAF HQ. Reply in concise natural Saudi Arabic unless the user asks for another language.

STRICT TRUTHFULNESS RULES:
- Use ONLY the supplied context and real tool results.
- Never claim a file was read, code was modified, a command ran, tests passed, a repository was inspected, a meeting happened, or a task completed unless a real tool result in the context proves it.
- If a capability is unavailable or not configured, say that plainly.
- Do not invent percentages, milestones, progress, blockers, project state, costs, or deadlines.
- Speak as the employee defined in the context, respecting that employee's role, permissions, project, current task, and previous real results.
- Be useful: discuss options, reasoning, tradeoffs, and next steps relevant to the employee role.
- Avoid filler like "توجيهك واضح" unless it adds real value.

CONTEXT:
${JSON.stringify(safe)}

USER MESSAGE:
${userMessage}
`;
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      const text = String((response as any).text || '').trim();
      if (!text) return res.status(502).json({ ok: false, error: 'Gemini returned an empty response.' });
      return res.json({ ok: true, text });
    } catch (error: any) {
      return res.status(500).json({ ok: false, error: error?.message || 'Agent response failed.' });
    }
  });

  app.post('/api/execute', async (req, res) => {
    const startedAt = new Date().toISOString();
    const { action, params } = req.body || {};
    if (!action || typeof action !== 'string') {
      return res.status(400).json({
        ok: false, action: 'unknown', startedAt,
        finishedAt: new Date().toISOString(), output: null,
        error: 'Action parameter is required.',
      });
    }

    try {
      if (action === 'inspect_project_state' || action === 'inspect_repository') {
        const pkg = await readPackageJson();
        const files = await scanWorkspace();
        return res.json({
          ok: true,
          action,
          startedAt,
          finishedAt: new Date().toISOString(),
          output: {
            source: 'workspace',
            verifiedOnDisk: true,
            workspaceRoot,
            packageName: pkg.name || null,
            packageVersion: pkg.version || null,
            scripts: Object.keys(pkg.scripts || {}),
            dependencies: Object.keys(pkg.dependencies || {}),
            totalFilesScanned: files.length,
            files,
            note: 'Only facts read from the current NAWAF-AI-2 workspace are returned. No project tasks, progress, health, or milestones are invented.',
          },
          error: null,
        });
      }

      if (action === 'orchestrate' || action === 'create_plan') {
        const crewaiUrl = process.env.CREWAI_API_URL;
        if (!crewaiUrl) {
          return res.json({
            ok: false, action, startedAt, finishedAt: new Date().toISOString(), output: null,
            error: 'CREWAI: NOT_CONFIGURED. CREWAI_API_URL is not configured.',
          });
        }
        if (await pingEngine(crewaiUrl) !== 'CONNECTED') {
          return res.status(502).json({
            ok: false, action, startedAt, finishedAt: new Date().toISOString(), output: null,
            error: 'CREWAI: ERROR. The configured service did not pass its health check.',
          });
        }
        const response = await fetch(`${crewaiUrl.replace(/\/$/, '')}/api/orchestrate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, params }),
          signal: AbortSignal.timeout(120000),
        });
        const data = await response.json().catch(() => ({}));
        return res.status(response.ok ? 200 : 502).json({
          ok: response.ok,
          action,
          startedAt,
          finishedAt: new Date().toISOString(),
          output: response.ok ? data : null,
          error: response.ok ? null : (data?.error || 'CrewAI execution failed.'),
        });
      }

      if (['modify_code', 'execute_code', 'run_command', 'modify_file'].includes(action)) {
        const openhandsUrl = process.env.OPENHANDS_API_URL;
        if (!openhandsUrl) {
          return res.json({
            ok: false, action, startedAt, finishedAt: new Date().toISOString(), output: null,
            error: 'OPENHANDS: NOT_CONFIGURED. OPENHANDS_API_URL is not configured.',
          });
        }
        if (await pingEngine(openhandsUrl) !== 'CONNECTED') {
          return res.status(502).json({
            ok: false, action, startedAt, finishedAt: new Date().toISOString(), output: null,
            error: 'OPENHANDS: ERROR. The configured service did not pass its health check.',
          });
        }
        const response = await fetch(`${openhandsUrl.replace(/\/$/, '')}/api/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, params }),
          signal: AbortSignal.timeout(120000),
        });
        const data = await response.json().catch(() => ({}));
        return res.status(response.ok ? 200 : 502).json({
          ok: response.ok,
          action,
          startedAt,
          finishedAt: new Date().toISOString(),
          output: response.ok ? data : null,
          error: response.ok ? null : (data?.error || 'OpenHands execution failed.'),
        });
      }

      return res.status(400).json({
        ok: false, action, startedAt, finishedAt: new Date().toISOString(), output: null,
        error: `Action "${action}" is not supported.`,
      });
    } catch (error: any) {
      return res.status(500).json({
        ok: false, action, startedAt, finishedAt: new Date().toISOString(), output: null,
        error: error?.message || 'Internal execution error.',
      });
    }
  });

  app.post('/api/tools/execute', async (req, res) => {
    const { tool, params } = req.body || {};
    const started = Date.now();
    try {
      if (tool === 'inspect_repository') {
        const pkg = await readPackageJson();
        const files = await scanWorkspace();
        return res.json({
          success: true,
          tool,
          durationMs: Date.now() - started,
          data: {
            workspaceRoot,
            totalFilesScanned: files.length,
            files,
            packageJson: {
              name: pkg.name || null,
              version: pkg.version || null,
              dependencies: Object.keys(pkg.dependencies || {}),
              scripts: Object.keys(pkg.scripts || {}),
            },
          },
        });
      }

      if (tool === 'read_file') {
        const filePath = params?.filePath;
        if (!filePath || typeof filePath !== 'string') {
          return res.status(400).json({ success: false, tool, error: 'filePath parameter is required.' });
        }
        const target = safeWorkspacePath(filePath);
        const stat = await fs.promises.stat(target).catch(() => null);
        if (!stat) return res.status(404).json({ success: false, tool, error: `File not found: ${filePath}` });
        if (stat.isDirectory()) return res.status(400).json({ success: false, tool, error: 'Target is a directory.' });
        const content = await fs.promises.readFile(target, 'utf8');
        return res.json({
          success: true,
          tool,
          durationMs: Date.now() - started,
          data: {
            filePath,
            sizeBytes: stat.size,
            content: content.slice(0, 32000),
            truncated: content.length > 32000,
          },
        });
      }

      if (tool === 'run_linter' || tool === 'run_tests') {
        const pkg = await readPackageJson();
        const scriptName = tool === 'run_linter' ? 'lint' : 'test';
        if (!pkg.scripts?.[scriptName]) {
          return res.json({
            success: false, tool, status: 'NOT_CONFIGURED', durationMs: Date.now() - started,
            error: `npm script "${scriptName}" is not configured in package.json.`,
          });
        }
        const command = `npm run ${scriptName}`;
        try {
          const { stdout, stderr } = await execAsync(command, { cwd: workspaceRoot, timeout: 60000 });
          return res.json({
            success: true,
            tool,
            durationMs: Date.now() - started,
            data: { command, exitCode: 0, stdout: stdout.trim(), stderr: stderr.trim(), status: 'PASS' },
          });
        } catch (error: any) {
          return res.json({
            success: false,
            tool,
            durationMs: Date.now() - started,
            data: {
              command,
              exitCode: typeof error?.code === 'number' ? error.code : 1,
              stdout: String(error?.stdout || '').trim(),
              stderr: String(error?.stderr || error?.message || '').trim(),
              status: 'FAIL',
            },
          });
        }
      }

      if (tool === 'modify_file' || tool === 'run_command') {
        const openhandsUrl = process.env.OPENHANDS_API_URL;
        if (!openhandsUrl) {
          return res.json({
            success: false,
            tool,
            status: 'NOT_CONFIGURED',
            error: 'OpenHands is not connected. Configure OPENHANDS_API_URL before code mutation or arbitrary command execution.',
          });
        }
        if (await pingEngine(openhandsUrl) !== 'CONNECTED') {
          return res.status(502).json({ success: false, tool, status: 'ERROR', error: 'OpenHands health check failed.' });
        }
        const response = await fetch(`${openhandsUrl.replace(/\/$/, '')}/api/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tool, params }),
          signal: AbortSignal.timeout(120000),
        });
        const data = await response.json().catch(() => ({}));
        return res.status(response.ok ? 200 : 502).json({
          success: response.ok,
          tool,
          status: response.ok ? 'CONNECTED' : 'ERROR',
          data: response.ok ? data : undefined,
          error: response.ok ? undefined : (data?.error || 'OpenHands execution failed.'),
        });
      }

      return res.status(400).json({ success: false, tool, error: `Unsupported tool: ${String(tool)}` });
    } catch (error: any) {
      return res.status(500).json({ success: false, tool, error: error?.message || 'Tool execution failed.' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(workspaceRoot, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exitCode = 1;
});
