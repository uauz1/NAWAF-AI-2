import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function read(path) {
  return readFile(new URL(`../${path}`, import.meta.url), 'utf8');
}

async function missing(path, markers) {
  const source = await read(path);
  for (const marker of markers) assert.equal(source.includes(marker), false, `${path} contains forbidden workflow claim: ${marker}`);
}

test('employee cards do not invent task progress or autonomy', async () => {
  await missing('src/components/employees/EmployeesView.tsx', [
    'Fictional AI Agents',
    'يعملون باستقلالية وتنسيق ذاتي',
    'taskProgress ?? 50',
    'width: `${emp.taskProgress ?? 50}%`',
  ]);
});

test('project workspace has no simulated cross-department success', async () => {
  await missing('src/components/projects/ProjectsView.tsx', [
    'triggerSimulatedCollaboration',
    'setTimeout(',
    'تنسيق ذاتي',
    'تم إرسال الطلب بنجاح',
  ]);
});

test('task creation starts pending at zero and has no fabricated completion evidence', async () => {
  const source = await read('src/components/tasks/TasksView.tsx');
  assert.match(source, /status: 'pending'/);
  assert.match(source, /progress: 0/);
  await missing('src/components/tasks/TasksView.tsx', [
    'progress: 20',
    'تم استيفاء معايير الجودة وإنجاز التسليم بنجاح',
    'التزام صفرية التكلفة $0.00',
  ]);
});

test('idea lab does not invent research counts free cost or promising status', async () => {
  const source = await read('src/components/ideas/IdeaLabView.tsx');
  assert.match(source, /status: 'under_review'/);
  await missing('src/components/ideas/IdeaLabView.tsx', [
    '12 فكرة دُرست',
    '0$ — مجاني بالكامل',
    'مجاناً 100%',
    "status: 'promising',",
  ]);
});

test('marketing workspace has no simulated scheduling or zero-ad claim', async () => {
  await missing('src/components/marketing/MarketingWorkspace.tsx', [
    'triggerSimulatedCollaboration',
    'Zero Paid Ads ($0)',
    '+ تحديث الجدولة',
  ]);
});
