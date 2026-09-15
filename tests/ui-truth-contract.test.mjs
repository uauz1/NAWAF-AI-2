import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function read(path) {
  return readFile(new URL(`../${path}`, import.meta.url), 'utf8');
}

async function assertMissing(path, markers) {
  const source = await read(path);
  for (const marker of markers) {
    assert.equal(source.includes(marker), false, `${path} contains unsupported UI claim: ${marker}`);
  }
}

test('main dashboard contains no fabricated autonomy or fixed project claims', async () => {
  await assertMissing('src/components/dashboard/MainDashboard.tsx', [
    'استقلالية تامة',
    'التكلفة الصفرية $0.00',
    'الفريق يعمل بسلاسة',
    '>3 مشاريع<',
    'نبض العمل المستقل',
  ]);
});

test('metric cards contain no fabricated daily deltas', async () => {
  await assertMissing('src/components/dashboard/MetricsBar.tsx', [
    '+3 اليوم',
    '+2 اليوم',
    'أعلى من الأسبوع الماضي',
  ]);
});

test('analytics contains no invented history savings reach or collaboration rate', async () => {
  await assertMissing('src/components/analytics/AnalyticsView.tsx', [
    '145K+',
    '92%',
    '35,000',
    'Avg: 97.4%',
    'النظام يعمل 24/7',
    'بدون أي إعلان مدفوع',
    'Math.round((dept.activeTasks / 33)',
  ]);
});

test('advisor briefing does not present zero spend or autonomous harmony as verified facts', async () => {
  await assertMissing('src/components/advisor/AdvisorBriefingPanel.tsx', [
    '$0.00',
    'التناغم الذاتي',
    'اعتماد وبدء التنفيذ فوراً',
    'جاهزة للاعتماد الفوري',
  ]);
});

test('OpenHands terminal has no fabricated success fallbacks', async () => {
  await assertMissing('src/components/openhands/OpenHandsTerminalModal.tsx', [
    '|| 50',
    "'dev, build, start'",
    'Compiled cleanly without type errors.',
    'الحالة: NOT_CONFIGURED',
  ]);
});
