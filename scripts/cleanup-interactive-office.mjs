import { readFile, writeFile } from 'node:fs/promises';

const path = new URL('../src/components/office/InteractiveOffice.tsx', import.meta.url);
let source = await readFile(path, 'utf8');
const before = source;

source = source
  .replace(/\n\s*Sparkles,/, '')
  .replace(/\n\s*Zap,/, '')
  .replace(/,\n\s*triggerSimulatedCollaboration\n\s*\} = useCompany\(\);/, '\n  } = useCompany();')
  .replace(/\n\s*if \(curr\.userData\?\.isLoungeBar\) \{\n\s*triggerSimulatedCollaboration\(\);\n\s*return;\n\s*\}/, `\n          if (curr.userData?.isLoungeBar) {\n            focusOnZone('lounge');\n            return;\n          }`)
  .replace(/\n\s*<button\n\s*onClick=\{triggerSimulatedCollaboration\}[\s\S]*?<span className="hidden sm:inline">نبضة تفاعل<\/span>\n\s*<\/button>\n/, '\n')
  .replace(/\} else if \(zone\.type === 'lounge'\) \{\n\s*triggerSimulatedCollaboration\(\);/, `} else if (zone.type === 'lounge') {\n                    focusOnZone('lounge');`)
  .replace('/* Left: HQ Identity & Live Heartbeat */', '/* Left: HQ Identity */')
  .replace('bg-cyan-400 animate-ping', 'bg-cyan-400/60')
  .replace(
`          } else {\n            // Standard WORKING at desk: typing motions\n            item.leftArm.rotation.x = 0.7 + Math.sin(time * 6.0 + item.animOffset) * 0.12;\n            item.rightArm.rotation.x = 0.7 + Math.cos(time * 6.0 + item.animOffset) * 0.12;\n            item.head.rotation.x = 0.2; // looking down at screen\n          }`,
`          } else if (item.state === 'WORKING' || item.state === 'يعمل الآن' || item.state === 'يطور' || item.state === 'يصمم') {\n            // Animate work gestures only when the recorded state says the employee is working.\n            item.leftArm.rotation.x = 0.7 + Math.sin(time * 6.0 + item.animOffset) * 0.12;\n            item.rightArm.rotation.x = 0.7 + Math.cos(time * 6.0 + item.animOffset) * 0.12;\n            item.head.rotation.x = 0.2;\n          } else {\n            // READY/unknown states stay visually neutral; do not imply work that did not happen.\n            item.leftArm.rotation.x = 0.05;\n            item.rightArm.rotation.x = 0.05;\n            item.head.rotation.x = 0;\n            item.head.rotation.y = 0;\n          }`)
  .replace(
`                  emp.status === 'ينتظر قرارك' || emp.status === 'WAITING_FOR_NAWAF' \n                    ? 'bg-amber-400 animate-ping' \n                    : (emp.status === 'MEETING' ? 'bg-cyan-400' : 'bg-emerald-400')`,
`                  emp.status === 'ينتظر قرارك' || emp.status === 'WAITING_FOR_NAWAF'\n                    ? 'bg-amber-400'\n                    : emp.status === 'MEETING'\n                      ? 'bg-cyan-400'\n                      : ['WORKING', 'يعمل الآن', 'يطور', 'يصمم'].includes(emp.status)\n                        ? 'bg-emerald-400'\n                        : 'bg-slate-500'`)
  .replace('حضور الفريق:', 'حالة الفريق:');

if (source.includes('triggerSimulatedCollaboration')) {
  throw new Error('InteractiveOffice still references triggerSimulatedCollaboration');
}
if (source.includes('نبضة تفاعل')) {
  throw new Error('InteractiveOffice still advertises simulated interaction');
}
if (source === before) {
  console.log('InteractiveOffice already cleaned; no changes needed.');
  process.exit(0);
}

await writeFile(path, source, 'utf8');
console.log('InteractiveOffice truth cleanup applied.');
