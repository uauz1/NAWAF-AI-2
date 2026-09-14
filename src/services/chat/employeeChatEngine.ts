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

function normalize(text: string) {
  return text.trim().toLowerCase();
}

function hasAny(query: string, terms: string[]) {
  return terms.some(term => query.includes(term));
}

function taskStatusLabel(status?: string) {
  if (!status) return 'غير محدد';
  const labels: Record<string, string> = {
    completed: 'مكتملة',
    in_progress: 'قيد التنفيذ',
    needs_ceo: 'تحتاج قرار نواف',
    blocked: 'متوقفة بسبب عائق',
    pending: 'بانتظار البدء',
  };
  return labels[status] || status;
}

export async function processEmployeeMessage(
  userQuery: string,
  context: EmployeeChatContext
): Promise<{ text: string; executedTools: ToolExecutionResponse[] }> {
  const query = normalize(userQuery);
  const { employee, projectContext, taskContext, companyState } = context;
  const executedTools: ToolExecutionResponse[] = [];
  const adapter = ExecutionAdapter.getInstance();

  if (hasAny(query, ['عدل', 'اكتب كود', 'غير الملف', 'احفظ التعديل', 'نفذ الأمر', 'تنفيذ كود', 'شغل الأمر'])) {
    const execRes = await adapter.execute('modify_code', {
      instruction: userQuery,
      employeeId: employee.id,
      employeeRole: employee.position,
      projectId: projectContext?.id,
    }, projectContext?.id);

    if (execRes.ok) {
      return {
        text: `تم تنفيذ الطلب عبر محرك التنفيذ الحقيقي.\nالنتيجة:\n${JSON.stringify(execRes.output, null, 2)}`,
        executedTools,
      };
    }

    return {
      text: `ما أقدر أدّعي أني عدلت الكود لأن محرك التنفيذ لم يؤكد نجاح العملية.\n${execRes.error || 'OPENHANDS: NOT_CONFIGURED'}`,
      executedTools,
    };
  }

  if (hasAny(query, ['وضع المشروع', 'وضع مشروع', 'المشروع الحالي', 'حالة المشروع', 'مشروع معين', 'مشروع مُعين', 'مشروع قدها', 'مشروع قدّها'])) {
    if (!projectContext) {
      return {
        text: 'ما عندي مشروع مرتبط بهذه المحادثة حالياً، لذلك ما راح أخمّن حالة مشروع غير موجود في السياق.',
        executedTools,
      };
    }

    const registeredTasks = Array.isArray(projectContext.tasks) ? projectContext.tasks : [];
    const taskLines = registeredTasks.length
      ? registeredTasks.map(task => `- ${task.title}: ${taskStatusLabel(task.status)}`).join('\n')
      : '- لا توجد مهام مسجلة على هذا المشروع في حالة NAWAF HQ الحالية.';

    return {
      text: `هذه هي الحالة المسجلة فعلياً داخل NAWAF HQ الآن، وليست نتيجة فحص خارجي للمستودع:\n- المشروع: ${projectContext.name}\n- المرحلة المسجلة: ${projectContext.currentPhase || 'غير محددة'}\n- التقدم المسجل: ${typeof projectContext.progress === 'number' ? `${projectContext.progress}%` : 'غير محدد'}\n- الحالة المسجلة: ${projectContext.health || 'غير محددة'}\nالمهام المسجلة:\n${taskLines}\n\nمهم: إذا تبغى حالة موثقة من مستودع المشروع نفسه، لازم يكون مستودع ذلك المشروع أو محرك التنفيذ متصل فعلياً.`,
      executedTools,
    };
  }

  if (hasAny(query, ['افتح ملف', 'اقرأ ملف', 'فحص المستودع', 'قراءة الملف', 'ملف المشروع', 'package.json'])) {
    let targetFile = 'package.json';
    if (query.includes('types')) targetFile = 'src/types.ts';
    if (query.includes('server')) targetFile = 'server.ts';

    const router = ToolRouter.getInstance();
    const tool = query.includes('فحص المستودع') ? 'inspect_repository' : 'read_file';
    const toolRes = await router.route({
      tool,
      params: { filePath: targetFile },
      requestedBy: {
        agentId: employee.id,
        agentName: employee.name,
        role: employee.position,
      },
      projectId: projectContext?.id,
    });

    executedTools.push(toolRes);

    if (!toolRes.success || !toolRes.data) {
      return {
        text: `تعذر تنفيذ ${tool === 'read_file' ? 'قراءة الملف' : 'فحص المستودع'} فعلياً: ${toolRes.error || 'خطأ غير معروف'}. لن أختلق نتيجة بديلة.`,
        executedTools,
      };
    }

    if (tool === 'read_file') {
      const content = String(toolRes.data.content || '');
      const preview = content.slice(0, 500);
      return {
        text: `قرأت الملف الفعلي «${targetFile}» من مساحة عمل NAWAF-AI-2.\nالحجم: ${toolRes.data.sizeBytes} بايت.\n${toolRes.data.truncated ? 'المحتوى المعروض مختصر لأن الملف كبير.\n' : ''}\n\`\`\`\n${preview}\n\`\`\``,
        executedTools,
      };
    }

    return {
      text: `فحصت مساحة عمل NAWAF-AI-2 الفعلية.\n- الملفات التي تم مسحها: ${toolRes.data.totalFilesScanned ?? toolRes.data.files?.length ?? 0}\n- الحزمة: ${toolRes.data.packageJson?.name || 'غير محددة'}\n- الإصدار: ${toolRes.data.packageJson?.version || 'غير محدد'}\n- عينة ملفات: ${(toolRes.data.files || []).slice(0, 8).join(', ') || 'لا توجد ملفات مرصودة'}`,
      executedTools,
    };
  }

  if (hasAny(query, ['فحص الكود', 'شغل الفحص', 'لينتر', 'lint'])) {
    const router = ToolRouter.getInstance();
    const toolRes = await router.route({
      tool: 'run_linter',
      requestedBy: {
        agentId: employee.id,
        agentName: employee.name,
        role: employee.position,
      },
      projectId: projectContext?.id,
    });
    executedTools.push(toolRes);

    if (toolRes.success) {
      return {
        text: `تم تشغيل الفحص الحقيقي.\nالأمر: ${toolRes.data?.command}\nالحالة: ${toolRes.data?.status}\n${toolRes.data?.stdout || 'لم يُرجع الفحص أخطاء.'}`,
        executedTools,
      };
    }

    return {
      text: `الفحص الحقيقي لم ينجح أو غير مهيأ.\n${toolRes.data?.stderr || toolRes.error || 'لا توجد نتيجة'}`,
      executedTools,
    };
  }

  if (hasAny(query, ['اختبار', 'tests', 'test'])) {
    const router = ToolRouter.getInstance();
    const toolRes = await router.route({
      tool: 'run_tests',
      requestedBy: {
        agentId: employee.id,
        agentName: employee.name,
        role: employee.position,
      },
      projectId: projectContext?.id,
    });
    executedTools.push(toolRes);

    if (toolRes.success) {
      return {
        text: `تم تشغيل الاختبارات الحقيقية بنجاح.\nالأمر: ${toolRes.data?.command}\nالحالة: ${toolRes.data?.status}\n${toolRes.data?.stdout || ''}`,
        executedTools,
      };
    }

    return {
      text: `لم يتم اجتياز اختبارات حقيقية.\n${toolRes.error || toolRes.data?.stderr || 'اختبارات المشروع غير مهيأة.'}`,
      executedTools,
    };
  }

  if (hasAny(query, ['طلب موافقة', 'اعتماد', 'موافقة الرئيس', 'أرسل للاعتماد'])) {
    if (!context.onTriggerApproval) {
      return { text: 'مسار الموافقات غير متاح في هذا السياق، لذلك لم أنشئ طلباً وهمياً.', executedTools };
    }

    const title = `طلب اعتماد من ${employee.name}: ${taskContext?.currentTask || employee.currentTask || 'إجراء جديد'}`;
    const description = `طلب اعتماد حقيقي أنشأه ${employee.name} (${employee.position}) للمشروع «${projectContext?.name || 'الشركة'}».`;
    const decision = context.onTriggerApproval({
      title,
      description,
      projectId: projectContext?.id || 'all',
    });

    if (!decision) {
      return { text: 'تعذر إنشاء طلب الاعتماد في حالة النظام، لذلك لم أعتبره ناجحاً.', executedTools };
    }

    return {
      text: `تم إنشاء طلب اعتماد فعلي داخل NAWAF HQ برقم ${decision.id}. ستجده في مركز القرارات.`,
      executedTools,
    };
  }

  if (hasAny(query, ['مهمتك', 'تشتغل على', 'وش تسوي', 'وش تعمل'])) {
    const currentTask = taskContext?.currentTask || employee.currentTask;
    const progress = taskContext?.taskProgress ?? employee.taskProgress;
    return {
      text: `أنا ${employee.name}، ${employee.position}.\nالمهمة المسجلة لي الآن: ${currentTask || 'لا توجد مهمة حالية مسجلة'}.\nالمشروع: ${projectContext?.name || 'لا يوجد مشروع مرتبط'}.\nالتقدم المسجل: ${typeof progress === 'number' ? `${progress}%` : 'غير محدد'}.\nالصلاحيات: ${employee.permissions?.length ? employee.permissions.join(', ') : 'لا توجد صلاحيات أدوات خاصة مسجلة'}.`,
      executedTools,
    };
  }

  const previous = context.previousRelevantResults?.filter(Boolean).slice(-3) || [];
  return {
    text: `أنا ${employee.name}، ${employee.position} في ${employee.departmentName}.\nالحالة الحالية المسجلة: ${employee.status}.\nالمهمة الحالية: ${taskContext?.currentTask || employee.currentTask || 'لا توجد مهمة مسجلة'}.\nالمشروع المرتبط: ${projectContext?.name || 'لا يوجد'}.\nحالة الشركة: ${companyState.isOperating ? 'نشطة' : 'متوقفة'}، وخطط التنفيذ النشطة: ${companyState.activePlansCount}، والقرارات المعلقة: ${companyState.pendingApprovalsCount}.${previous.length ? `\nآخر نتائج مرتبطة مسجلة:\n- ${previous.join('\n- ')}` : ''}\n\nإذا طلبت مني تنفيذ شيء خارج الأدوات المتصلة فعلياً، سأقول لك إنه غير متاح بدلاً من ادعاء التنفيذ.`,
    executedTools,
  };
}
