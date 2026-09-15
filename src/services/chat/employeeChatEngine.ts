import { Employee, Project, ExecutionStep, Decision } from '../../types';
import { ToolRouter, ToolExecutionResponse } from '../tools/toolRouter';
import { ExecutionAdapter } from '../execution/executionAdapter';

export interface EmployeeChatContext {
  employee: Employee;
  role: string;
  permissions: string[];
  projectContext?: Project;
  taskContext?: {
    currentTask: string;
    taskProgress: number;
    planSteps?: ExecutionStep[];
  };
  companyState: {
    isOperating: boolean;
    activePlansCount: number;
    pendingApprovalsCount: number;
    totalEmployees: number;
  };
  availableTools: string[];
  toolResults: ToolExecutionResponse[];
  previousRelevantResults?: string[];
  onTriggerApproval?: (params: { title: string; description: string; projectId: string }) => Decision | void;
}

const PROPOSAL_KEY_PREFIX = 'nawaf_hq_execution_proposal_';

function normalize(text: string) {
  return text.trim().toLowerCase();
}

function hasAny(query: string, terms: string[]) {
  return terms.some(term => query.includes(term));
}

function taskStatusLabel(status?: string) {
  const labels: Record<string, string> = {
    completed: 'مكتملة', in_progress: 'قيد التنفيذ', needs_ceo: 'تحتاج قرار نواف',
    blocked: 'متوقفة بسبب عائق', pending: 'بانتظار البدء', reviewing: 'قيد المراجعة'
  };
  return status ? (labels[status] || status) : 'غير محدد';
}

function runtimePayload(output: any) {
  return output?.output?.output || output?.output || output;
}

function summarizeRuntimeOutput(output: any) {
  const inner = runtimePayload(output);
  if (inner?.text) return String(inner.text);
  if (inner?.diff || inner?.changedFiles) {
    const changed = Array.isArray(inner.changedFiles) ? inner.changedFiles.join('\n') : 'لا توجد ملفات معدلة';
    const diff = String(inner.diff || '').trim();
    return `الملفات المتأثرة:\n${changed}${diff ? `\n\nالتغييرات الفعلية:\n${diff.slice(0, 5000)}${diff.length > 5000 ? '\n…' : ''}` : ''}`;
  }
  return JSON.stringify(output, null, 2);
}

async function askGroundedAgent(userMessage: string, context: EmployeeChatContext) {
  try {
    const response = await fetch('/api/agent/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userMessage,
        context: {
          employee: context.employee,
          role: context.role,
          permissions: context.permissions,
          project: context.projectContext,
          task: context.taskContext,
          companyState: context.companyState,
          availableTools: context.availableTools,
          toolResults: context.toolResults,
          previousRelevantResults: context.previousRelevantResults,
        },
      }),
    });
    const data = await response.json();
    if (response.ok && data?.text) return String(data.text);
    return null;
  } catch {
    return null;
  }
}

export async function processEmployeeMessage(
  userQuery: string,
  context: EmployeeChatContext
): Promise<{ text: string; executedTools: ToolExecutionResponse[] }> {
  const query = normalize(userQuery);
  const { employee, projectContext, taskContext, companyState } = context;
  const executedTools: ToolExecutionResponse[] = [];
  const execution = ExecutionAdapter.getInstance();
  const router = ToolRouter.getInstance();

  if (hasAny(query, ['خطط', 'سو خطة', 'راجع المشروع', 'راجع ', 'جهز المشروع', 'جهز ', 'طور المشروع', 'حل المشاكل', 'حل المشكلة', 'قسم المهمة'])) {
    const crewRes = await execution.execute('orchestrate', {
      goal: userQuery,
      instruction: userQuery,
      employee: {
        id: employee.id,
        name: employee.name,
        position: employee.position,
        role: context.role,
        permissions: context.permissions,
      },
      project: projectContext || null,
      companyState,
      availableTools: context.availableTools,
    }, projectContext?.id);

    if (crewRes.ok) {
      return { text: `حللت التوجيه فعلياً عبر CrewAI.\n\n${summarizeRuntimeOutput(crewRes.output)}`, executedTools };
    }
    return { text: `CrewAI ما قدر ينفذ التخطيط الآن: ${crewRes.error || 'لا توجد نتيجة من المحرك.'}`, executedTools };
  }

  if (hasAny(query, ['عدل', 'اكتب كود', 'غير الملف', 'احفظ التعديل', 'نفذ الأمر', 'تنفيذ كود', 'شغل الأمر', 'اصلح الكود', 'صلح الكود'])) {
    const execRes = await execution.execute('modify_code', {
      instruction: userQuery,
      employeeId: employee.id,
      employeeRole: employee.position,
      projectId: projectContext?.id,
      projectName: projectContext?.name,
    }, projectContext?.id);

    if (!execRes.ok) {
      return { text: `ما تم تنفيذ التعديل. ${execRes.error || 'OpenHands لم يرجع نتيجة ناجحة.'}`, executedTools };
    }

    const proposal = runtimePayload(execRes.output);
    const changedFiles = Array.isArray(proposal?.changedFiles) ? proposal.changedFiles : [];
    const diff = String(proposal?.diff || '').trim();
    const hasChanges = proposal?.hasChanges !== false && changedFiles.length > 0 && Boolean(diff);

    if (!hasChanges) {
      return {
        text: `OpenHands نفذ المهمة في نسخة معزولة، لكن ما نتج أي تغيير فعلي في ملفات المستودع.\n\n${summarizeRuntimeOutput(execRes.output)}`,
        executedTools,
      };
    }

    if (!context.onTriggerApproval) {
      return {
        text: `OpenHands أنشأ تغييرات فعلية، لكن مسار موافقة الرئيس غير متاح في هذه الشاشة، لذلك ما كتبت أي شيء إلى GitHub.\n\n${summarizeRuntimeOutput(execRes.output)}`,
        executedTools,
      };
    }

    const decision = context.onTriggerApproval({
      title: `اعتماد تغييرات OpenHands — ${projectContext?.name || 'NAWAF HQ'}`,
      description: `نفذ ${employee.name} المهمة داخل نسخة معزولة من المستودع. يوجد ${changedFiles.length} تغيير/ملف متأثر. لن تُكتب التغييرات إلى GitHub إلا بعد اعتماد نواف.`,
      projectId: projectContext?.id || 'hq',
    });

    if (!decision) {
      return { text: 'OpenHands رجع تغييرات فعلية، لكن تعذر إنشاء طلب الاعتماد. لم يتم أي دفع إلى GitHub.', executedTools };
    }

    try {
      localStorage.setItem(`${PROPOSAL_KEY_PREFIX}${decision.id}`, JSON.stringify({
        sourceEngine: 'openhands-sdk',
        repository: proposal.repository,
        baseCommit: proposal.baseCommit,
        diff,
        changedFiles,
        instruction: proposal.instruction || userQuery,
        commitMessage: `NAWAF HQ approved: ${userQuery.slice(0, 120)}`,
        createdAt: new Date().toISOString(),
        employeeId: employee.id,
        employeeName: employee.name,
        projectId: projectContext?.id || 'hq',
      }));
    } catch {
      return { text: 'OpenHands رجع تغييرات فعلية وأنشأت طلب الاعتماد، لكن تعذر حفظ مسودة التغيير محلياً. لن يتم أي دفع إلى GitHub.', executedTools };
    }

    return {
      text: `OpenHands نفذ التعديل فعلياً داخل نسخة معزولة. أنشأت لك طلب اعتماد رقم ${decision.id}.\nما انكتب شيء في GitHub إلى الآن. إذا اعتمدته من مركز القرارات، النظام يطبق نفس الـdiff بعد فحص التعارضات والـlint والـbuild ثم يدفعه إلى main.\n\n${summarizeRuntimeOutput(execRes.output)}`,
      executedTools,
    };
  }

  if (hasAny(query, ['وضع المشروع', 'وضع مشروع', 'المشروع الحالي', 'حالة المشروع', 'مشروع معين', 'مشروع مُعين', 'مشروع قدها', 'مشروع قدّها'])) {
    if (!projectContext) return { text: 'ما عندي مشروع مرتبط بهذه المحادثة حالياً، لذلك ما راح أخمّن.', executedTools };
    const tasks = Array.isArray(projectContext.tasks) ? projectContext.tasks : [];
    const taskLines = tasks.length
      ? tasks.map(task => `- ${task.title}: ${taskStatusLabel(task.status)}${typeof task.progress === 'number' ? ` (${task.progress}%)` : ''}`).join('\n')
      : '- لا توجد مهام موثقة حالياً.';
    return {
      text: `الحالة المسجلة فعلياً داخل NAWAF HQ:\n- المشروع: ${projectContext.name}\n- المرحلة: ${projectContext.currentPhase || 'غير محددة'}\n- التقدم: ${typeof projectContext.progress === 'number' ? `${projectContext.progress}%` : 'غير محدد'}\n- الحالة: ${projectContext.health || 'غير محددة'}\n${taskLines}`,
      executedTools,
    };
  }

  if (hasAny(query, ['افتح ملف', 'اقرأ ملف', 'فحص المستودع', 'قراءة الملف', 'ملف المشروع', 'package.json'])) {
    let targetFile = 'package.json';
    if (query.includes('types')) targetFile = 'src/types.ts';
    if (query.includes('server')) targetFile = 'server.ts';
    if (query.includes('context')) targetFile = 'src/context/CompanyContext.tsx';
    const tool = query.includes('فحص المستودع') ? 'inspect_repository' : 'read_file';
    const result = await router.route({
      tool,
      params: { filePath: targetFile },
      requestedBy: { agentId: employee.id, agentName: employee.name, role: employee.position },
      projectId: projectContext?.id,
    });
    executedTools.push(result);
    if (!result.success || !result.data) return { text: `تعذر التنفيذ الفعلي: ${result.error || 'خطأ غير معروف'}.`, executedTools };
    if (tool === 'read_file') {
      const content = String(result.data.content || '');
      return { text: `قرأت الملف الفعلي «${targetFile}». الحجم: ${result.data.sizeBytes ?? 0} بايت.\n\n\`\`\`\n${content.slice(0, 700)}${content.length > 700 ? '\n…' : ''}\n\`\`\``, executedTools };
    }
    return { text: `تم فحص مساحة العمل الفعلية.\n- الملفات المرصودة: ${result.data.totalFiles ?? result.data.totalFilesScanned ?? result.data.files?.length ?? 0}\n- الحزمة: ${result.data.packageJson?.name || 'غير محددة'}\n- عينة: ${(result.data.files || []).slice(0, 8).join(', ') || 'لا توجد ملفات'}`, executedTools };
  }

  if (hasAny(query, ['فحص الكود', 'شغل الفحص', 'لينتر', 'lint'])) {
    const result = await router.route({ tool: 'run_linter', requestedBy: { agentId: employee.id, agentName: employee.name, role: employee.position }, projectId: projectContext?.id });
    executedTools.push(result);
    return result.success
      ? { text: `تم تشغيل الفحص الحقيقي.\nالأمر: ${result.data?.command || 'npm run lint'}\nالحالة: ${result.data?.status || 'PASS'}\n${result.data?.stdout || 'لم تظهر أخطاء.'}`, executedTools }
      : { text: `الفحص لم ينجح.\n${result.data?.stderr || result.error || 'لا توجد نتيجة'}`, executedTools };
  }

  if (hasAny(query, ['اختبار', 'tests', 'test'])) {
    const result = await router.route({ tool: 'run_tests', requestedBy: { agentId: employee.id, agentName: employee.name, role: employee.position }, projectId: projectContext?.id });
    executedTools.push(result);
    return result.success
      ? { text: `تم تشغيل الاختبار الحقيقي.\nالأمر: ${result.data?.command || 'npm run test'}\nالحالة: ${result.data?.status || 'PASS'}\n${result.data?.stdout || ''}`, executedTools }
      : { text: `الاختبار لم ينجح.\n${result.data?.stderr || result.error || 'لا توجد نتيجة'}`, executedTools };
  }

  if (hasAny(query, ['طلب موافقة', 'اعتماد', 'موافقة الرئيس', 'أرسل للاعتماد'])) {
    if (!context.onTriggerApproval) return { text: 'مسار الموافقات غير متاح هنا، لذلك ما أنشأت أي طلب وهمي.', executedTools };
    const decision = context.onTriggerApproval({
      title: `طلب اعتماد من ${employee.name}: ${taskContext?.currentTask || employee.currentTask || 'إجراء جديد'}`,
      description: `طلب اعتماد أنشأه ${employee.name} (${employee.position}) للمشروع «${projectContext?.name || 'الشركة'}».`,
      projectId: projectContext?.id || 'hq',
    });
    return decision ? { text: `تم إنشاء طلب اعتماد فعلي برقم ${decision.id}.`, executedTools } : { text: 'تعذر إنشاء طلب الاعتماد في حالة النظام.', executedTools };
  }

  if (hasAny(query, ['مهمتك', 'تشتغل على', 'وش تسوي', 'وش تعمل'])) {
    const currentTask = taskContext?.currentTask || employee.currentTask;
    const progress = taskContext?.taskProgress ?? employee.taskProgress;
    return {
      text: `أنا ${employee.name}، ${employee.position}.\nالمهمة الحالية: ${currentTask || 'لا توجد مهمة مسجلة'}.\nالمشروع: ${projectContext?.name || 'لا يوجد'}.\nالتقدم المسجل: ${typeof progress === 'number' ? `${progress}%` : 'غير محدد'}.\nالصلاحيات: ${employee.permissions?.length ? employee.permissions.join(', ') : 'لا توجد صلاحيات خاصة مسجلة'}.`,
      executedTools,
    };
  }

  const aiText = await askGroundedAgent(userQuery, { ...context, toolResults: [...context.toolResults, ...executedTools] });
  if (aiText) return { text: aiText, executedTools };

  const previous = context.previousRelevantResults?.filter(Boolean).slice(-3) || [];
  return {
    text: `أنا ${employee.name}، ${employee.position} في ${employee.departmentName}.\nالحالة المسجلة: ${employee.status}.\nالمهمة الحالية: ${taskContext?.currentTask || employee.currentTask || 'لا توجد مهمة مسجلة'}.\nالمشروع: ${projectContext?.name || 'لا يوجد'}.\nحالة الشركة: ${companyState.isOperating ? 'نشطة' : 'متوقفة'}، الخطط النشطة: ${companyState.activePlansCount}، القرارات المعلقة: ${companyState.pendingApprovalsCount}.${previous.length ? `\nآخر نتائج موثقة:\n- ${previous.join('\n- ')}` : ''}\n\nالمحادثة الذكية غير متاحة حالياً من الخادم، لذلك أعطيتك فقط المعلومات الموثقة عندي.`,
    executedTools,
  };
}
