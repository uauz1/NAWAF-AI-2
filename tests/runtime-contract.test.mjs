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
  for (const marker of forbidden) assert.equal(server.includes(marker), false, `fake project marker still present: ${marker}`);
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

test('runtime uses official CrewAI and hardened OpenHands file tools', async () => {
  const runtime = await read('runtime/main.py');
  assert.match(runtime, /from crewai import Agent, Crew, LLM, Process, Task/);
  assert.match(runtime, /from openhands\.sdk import Agent, Conversation, LLM, Tool/);
  assert.match(runtime, /from openhands\.tools\.file_editor import FileEditorTool/);
  assert.match(runtime, /from openhands\.tools\.task_tracker import TaskTrackerTool/);
  assert.equal(runtime.includes('from openhands.tools.terminal import TerminalTool'), false);
  assert.match(runtime, /workspaceMode': 'ephemeral-clone-file-tools-only'/);
  assert.match(runtime, /verificationPassed/);
  assert.match(runtime, /EXECUTION_SEMAPHORE = asyncio\.Semaphore\(1\)/);
  assert.match(runtime, /MAX_EXECUTIONS_PER_MINUTE = 8/);
  assert.match(runtime, /MAX_INSTRUCTION_CHARS = 12000/);
});

test('runtime trusted verification includes lint tests and build', async () => {
  const runtime = await read('runtime/main.py');
  assert.match(runtime, /scripts = \['lint', 'test'\] \+ \(\['build'\]/);
  assert.match(runtime, /verify_workspace\(workspace, include_build=True\)/);
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
  assert.equal(context.includes('setTimeout('), false);
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
  const forbidden = ['progress: 82','progress: 68','tasksCompletedCount: 42','مطبق بنجاح','منذ 35 دقيقة','زمن الاستجابة أقل من 35ms','إطلاق نظام الغرف اللحظية','اكتملت مراجعة 14 شاشة'];
  for (const marker of forbidden) assert.equal(initial.includes(marker), false, `seeded operational claim still present: ${marker}`);
  assert.match(initial, /export const INITIAL_DECISIONS: Decision\[\] = \[\]/);
  assert.match(initial, /export const INITIAL_ACTIVITIES: ActivityEvent\[\] = \[\]/);
  assert.match(initial, /export const INITIAL_REPORTS: CompanyReport\[\] = \[\]/);
  assert.match(initial, /export const INITIAL_PLANS: ExecutionPlan\[\] = \[\]/);
});

test('agent catalog advertises no arbitrary shell or pseudo tools', async () => {
  const agents = await read('src/services/crewai/agents.ts');
  for (const marker of ['webrtc_network_inspector','quranic_text_diff_verifier','audio_timestamp_matcher','cost_tracker_zero_enforcer','openhands_terminal','openhands:exec_cmd']) {
    assert.equal(agents.includes(marker), false, `unsupported agent capability still advertised: ${marker}`);
  }
  assert.equal(agents.includes('isZeroCost: true'), false);
  assert.match(agents, /openhands_test_runner/);
  assert.match(agents, /crew_delegator/);
});

test('OpenHands results require verified checks before runtime success', async () => {
  const engine = await read('src/services/openhands/engine.ts');
  const types = await read('src/services/openhands/types.ts');
  assert.match(types, /success\?: boolean/);
  assert.match(types, /source\?: 'openhands-runtime' \| 'local-verification'/);
  assert.match(engine, /const verificationPassed = output\?\.verificationPassed === true/);
  assert.match(engine, /success: verificationPassed, source: 'openhands-runtime'/);
  assert.match(engine, /success: localSuccess, source: 'local-verification'/);
});

test('truth migration resets operational state and employee productivity', async () => {
  const migration = await read('src/services/truth/initializeTruthfulState.ts');
  assert.match(migration, /nawaf_hq_truth_migration_v4/);
  assert.match(migration, /productivity: 0/);
  assert.match(migration, /safeSet\(`\$\{BASE\}_decisions`, \[\]\)/);
  assert.match(migration, /safeSet\(`\$\{BASE\}_plans`, \[\]\)/);
});
