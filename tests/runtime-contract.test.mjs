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

test('company state cannot silently re-enable simulation or fabricated metrics', async () => {
  const context = await read('src/context/CompanyContext.tsx');
  assert.match(context, /const isAutoSimulationActive = false/);
  assert.equal(context.includes('setTimeout('), false, 'random delayed employee simulation must stay removed');
  assert.equal(context.includes('productivityRate: 87'), false);
  assert.equal(context.includes('completedTasks: 3'), false);
  assert.equal(context.includes('inProgressTasks: 5'), false);
  assert.equal(context.includes("estimatedCost: '0$ (مجاني)'"), false);
  assert.equal(context.includes("estimatedTime: 'فوري'"), false);
  assert.equal(context.includes('zeroCostGuarantee: true'), false);
  assert.match(context, /const \[isCompanyOperating, setIsCompanyOperating\] = useState\(false\)/);
  assert.match(context, /productivityRate: total > 0 \? Math\.round\(\(completed \/ total\) \* 100\) : 0/);
});

test('task completion requires evidence and project progress is derived', async () => {
  const context = await read('src/context/CompanyContext.tsx');
  assert.equal(context.includes('progress: 65'), false);
  assert.equal(context.includes('progress: 30'), false);
  assert.equal(context.includes('progress: 20'), false);
  assert.equal(context.includes('اكتملت الخطوة بنجاح وتم التحقق من الجودة'), false);
  assert.match(context, /newStatus === 'completed' && !hasCompletionEvidence \? 'reviewing' : newStatus/);
  assert.match(context, /Math\.round\(totalProgress \/ updatedTasks\.length\)/);
});

test('seed data contains identity only, not fake operational history', async () => {
  const initial = await read('src/data/initialData.ts');
  const forbidden = [
    'progress: 82',
    'progress: 68',
    'tasksCompletedCount: 42',
    'مطبق بنجاح',
    'منذ 35 دقيقة',
    'زمن الاستجابة أقل من 35ms',
    'إطلاق نظام الغرف اللحظية',
    'اكتملت مراجعة 14 شاشة',
  ];
  for (const marker of forbidden) {
    assert.equal(initial.includes(marker), false, `seeded operational claim still present: ${marker}`);
  }
  assert.match(initial, /export const INITIAL_DECISIONS: Decision\[\] = \[\]/);
  assert.match(initial, /export const INITIAL_ACTIVITIES: ActivityEvent\[\] = \[\]/);
  assert.match(initial, /export const INITIAL_REPORTS: CompanyReport\[\] = \[\]/);
  assert.match(initial, /export const INITIAL_PLANS: ExecutionPlan\[\] = \[\]/);
});

test('CrewAI agent catalog advertises only implemented execution paths', async () => {
  const agents = await read('src/services/crewai/agents.ts');
  assert.equal(agents.includes('webrtc_network_inspector'), false);
  assert.equal(agents.includes('quranic_text_diff_verifier'), false);
  assert.equal(agents.includes('audio_timestamp_matcher'), false);
  assert.equal(agents.includes('cost_tracker_zero_enforcer'), false);
  assert.equal(agents.includes('isZeroCost: true'), false);
  assert.match(agents, /openhands_terminal/);
  assert.match(agents, /openhands_test_runner/);
  assert.match(agents, /crew_delegator/);
});

test('OpenHands results expose verified outcome and execution source', async () => {
  const engine = await read('src/services/openhands/engine.ts');
  const types = await read('src/services/openhands/types.ts');
  assert.match(types, /success\?: boolean/);
  assert.match(types, /source\?: 'openhands-runtime' \| 'local-verification'/);
  assert.match(engine, /success: true, source: 'openhands-runtime'/);
  assert.match(engine, /success: localSuccess, source: 'local-verification'/);
  assert.equal(engine.includes("summary: output?.summary || 'تم التنفيذ عبر OpenHands"), false);
});

test('truth migration resets operational state and employee productivity', async () => {
  const migration = await read('src/services/truth/initializeTruthfulState.ts');
  assert.match(migration, /nawaf_hq_truth_migration_v4/);
  assert.match(migration, /productivity: 0/);
  assert.match(migration, /safeSet\(`\$\{BASE\}_decisions`, \[\]\)/);
  assert.match(migration, /safeSet\(`\$\{BASE\}_plans`, \[\]\)/);
});
