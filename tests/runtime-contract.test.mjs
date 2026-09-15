import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function read(path) {
  return readFile(new URL(`../${path}`, import.meta.url), 'utf8');
}

test('server does not hardcode fake project task state', async () => {
  const server = await read('server.ts');
  const forbidden = [
    'تطوير غرف اللعب',
    'إعداد 12 نمط',
    'تدقيق نصوص التفسير الميسر',
    'تصميم شاشات إحصائيات الختمة الشهرية',
    'verifiedOnDisk: true,\n            project',
  ];
  for (const marker of forbidden) {
    assert.equal(server.includes(marker), false, `fake project marker still present: ${marker}`);
  }
});

test('real execution routes are present and guarded', async () => {
  const server = await read('server.ts');
  assert.match(server, /\/api\/engine\/status/);
  assert.match(server, /\/api\/tools\/execute/);
  assert.match(server, /OPENHANDS_API_URL/);
  assert.match(server, /CREWAI_API_URL/);
  assert.match(server, /GEMINI_API_KEY/);
  assert.match(server, /NOT_CONFIGURED/);
});

test('runtime uses official CrewAI and OpenHands packages', async () => {
  const runtime = await read('runtime/main.py');
  assert.match(runtime, /from crewai import Agent, Crew, LLM, Process, Task/);
  assert.match(runtime, /from openhands\.sdk import Agent, Conversation, LLM, Tool/);
  assert.match(runtime, /from openhands\.tools\.terminal import TerminalTool/);
  assert.match(runtime, /git', 'diff'/);
  assert.match(runtime, /workspaceMode': 'ephemeral-clone'/);
});

test('OpenHands proposals cannot silently push before approval', async () => {
  const runtime = await read('runtime/main.py');
  const executeStart = runtime.indexOf('def execute_openhands');
  const applyStart = runtime.indexOf('def apply_approved_change');
  assert.ok(executeStart >= 0 && applyStart > executeStart);
  const executeSection = runtime.slice(executeStart, applyStart);
  assert.equal(executeSection.includes("git', 'push'"), false);
  assert.match(executeSection, /Do not commit or push/);
});

test('frontend decision center does not claim automatic GitHub push without backend permission', async () => {
  const ui = await read('src/components/decisions/DecisionCenter.tsx');
  assert.match(ui, /GitHub/);
  assert.equal(ui.includes('تم الاعتماد والتطبيق على GitHub —'), false);
});
