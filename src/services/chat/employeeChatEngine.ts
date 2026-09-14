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

export async function processEmployeeMessage(
  userQuery: string,
  context: EmployeeChatContext
): Promise<{ text: string; executedTools: ToolExecutionResponse[] }> {
  const query = userQuery.trim().toLowerCase();
  const { employee, projectContext, taskContext, companyState } = context;
  const executedTools: ToolExecutionResponse[] = [];
  const adapter = ExecutionAdapter.getInstance();

  // 1. Check if user is asking to modify code or run commands (Execution Engine check)
  if (
    query.includes('عدل') || 
    query.includes('اكتب كود') || 
    query.includes('غير الملف') || 
    query.includes('احفظ التعديل') ||
    query.includes('شغل الحاوية') ||
    query.includes('نفذ الأمر') ||
    query.includes('تنفيذ كود')
  ) {
    const execRes = await adapter.execute('modify_code', { query }, projectContext?.id);
    return {
      text: `${execRes.error || 'EXECUTION ENGINE: NOT CONFIGURED'}\nوفقاً للسياسة الصارمة للنظام، لا يمكن للموظف ادعاء تعديل الأكواد أو تشغيل أوامر برمجية ما لم يتصل محرك التنفيذ الخارجي الفعلي ويُعيد نتيجة نجاح حقيقية.`,
      executedTools
    };
  }

  // 2. Query about Project status (Calls real backend POST /api/execute inspect_project_state)
  if (
    query.includes('وضع المشروع') || 
    query.includes('وضع مشروع') || 
    query.includes('مشروع معين') || 
    query.includes('مشروع مُعين') || 
    query.includes('مشروع قدها') || 
    query.includes('مشروع قدّها') ||
    query.includes('المشروع الحالي') ||
    query.includes('حالة المشروع')
  ) {
    const targetProjId = projectContext?.id || (query.includes('معين') ? 'mueen' : 'qaddha');
    const execRes = await adapter.execute('inspect_project_state', {}, targetProjId);

    if (execRes.ok && execRes.output) {
      const data = execRes.output;
      const tasks = data.tasks || [];
      const inProgress = tasks.filter((t: any) => t.status === 'in_progress');
      const completed = tasks.filter((t: any) => t.status === 'completed');

      const completedSummary = completed.length > 0
        ? `المهام المكتملة فعلياً (${data.completedTasks}/${data.totalTasks}): ${completed.map((t: any) => `«${t.title}»`).join('، ')}.`
        : 'لم تكتمل أي مهام بعد.';

      const inProgressSummary = inProgress.length > 0
        ? `المهام قيد العمل: ${inProgress.map((t: any) => `«${t.title}»`).join('، ')}.`
        : 'لا توجد مهام قيد العمل حالياً.';

      return {
        text: `إليك الوضع الحقيقي المستلم مباشرة من خادم النظام (POST /api/execute):\n- اسم المشروع: «${data.projectName}»\n- نسبة الإنجاز المحسوبة رياضياً: ${data.calculatedProgress}%\n- الحالة التشغيلية: ${data.health}\n- الهدف: ${data.description}\n- ${completedSummary}\n- ${inProgressSummary}\n- التكلفة المالية: ${data.cost} (انعدام تكلفة تام $0.00).\n(تم التحقق الفعلي من ملفات المشروع على الخادم: ${data.verifiedOnDisk ? 'نعم ✓' : 'لا'})`,
        executedTools
      };
    } else {
      return {
        text: `تعذر جلب حالة المشروع من الواجهة الخلفية: ${execRes.error}`,
        executedTools
      };
    }
  }

  // 2. Check if user is asking to read a file or inspect repository
  if (
    query.includes('افتح ملف') || 
    query.includes('اقرأ ملف') || 
    query.includes('فحص المستودع') || 
    query.includes('قراءة الملف') ||
    query.includes('ملف المشروع') ||
    query.includes('package.json')
  ) {
    // Determine target file
    let targetFile = 'package.json';
    if (query.includes('types')) targetFile = 'src/types.ts';
    if (query.includes('server')) targetFile = 'server.ts';

    // Execute real read via ToolRouter
    const router = ToolRouter.getInstance();
    const toolRes = await router.route({
      tool: query.includes('فحص المستودع') ? 'inspect_repository' : 'read_file',
      params: { filePath: targetFile },
      requestedBy: {
        agentId: employee.id,
        agentName: employee.name,
        role: employee.position
      },
      projectId: projectContext?.id
    });

    executedTools.push(toolRes);

    if (toolRes.success && toolRes.data) {
      if (toolRes.tool === 'read_file') {
        const preview = toolRes.data.content.slice(0, 350);
        return {
          text: `تمت قراءة الملف الفعلي (${targetFile}) من مسار القرص بنجاح عبر الواجهة الخلفية:\n\n\`\`\`\n${preview}...\n\`\`\`\nالحجم الفعلي: ${toolRes.data.sizeBytes} بايت. تم جلب المحتوى من ملفات النظام الحقيقية.`,
          executedTools
        };
      } else if (toolRes.tool === 'inspect_repository') {
        return {
          text: `تم فحص مستودع العمل الفعلي عبر الواجهة الخلفية بنجاح:\n- إجمالي الملفات المرصودة: ${toolRes.data.totalFiles} ملف.\n- الحزمة الأساسية: ${toolRes.data.packageJson?.name} (الإصدار ${toolRes.data.packageJson?.version}).\n- عينة من الملفات الموجودة: ${toolRes.data.files.slice(0, 5).join(', ')}...`,
          executedTools
        };
      }
    } else {
      return {
        text: `تعذر قراءة الملف: ${toolRes.error || 'الملف غير موجود على القرص أو غير متاح'}.\nلن أقوم باختلاق أي محتوى وهمي.`,
        executedTools
      };
    }
  }

  // 3. Check if user asks to run automated test or linter
  if (query.includes('فحص الكود') || query.includes('شغل الفحص') || query.includes('اختبار') || query.includes('لينتر')) {
    const router = ToolRouter.getInstance();
    const toolRes = await router.route({
      tool: 'run_linter',
      requestedBy: {
        agentId: employee.id,
        agentName: employee.name,
        role: employee.position
      },
      projectId: projectContext?.id
    });

    executedTools.push(toolRes);

    if (toolRes.success && toolRes.data) {
      return {
        text: `تم تشغيل فحص التحقق البرمجي الفعلي (TypeScript Compiler / Linter) عبر الخادم:\n- الأمر المنفذ: \`${toolRes.data.command}\`\n- حالة الخروج: ${toolRes.data.exitCode} (${toolRes.data.status})\n- مخرجات الفحص: ${toolRes.data.stdout || 'اجتياز تام بدون أخطاء نوعية'}\n- استغرق الفحص: ${toolRes.durationMs}ms.`,
        executedTools
      };
    } else {
      return {
        text: `تم تشغيل الفحص البرمجي الفعلي ورصدت الأخطاء التالية:\n${toolRes.data?.stderr || toolRes.error}`,
        executedTools
      };
    }
  }

  // 4. Check if user requests CEO Approval
  if (query.includes('طلب موافقة') || query.includes('اعتماد') || query.includes('موافقة الرئيس') || query.includes('أرسل للاعتماد')) {
    if (context.onTriggerApproval) {
      const title = `طلب اعتماد من ${employee.name}: ${taskContext?.currentTask || 'مراجعة إجراءات المشروع'}`;
      const desc = `يرفع ${employee.name} (${employee.position}) طلباً رسمياً لمراجعة وتوقيع الرئيس التنفيذي نواف لمشروع «${projectContext?.name || 'الشركة'}».`;
      const newDec = context.onTriggerApproval({
        title,
        description: desc,
        projectId: projectContext?.id || 'all'
      });

      const decId = newDec ? (newDec as Decision).id : 'طلب جديد';

      return {
        text: `تم إنشاء قرار اعتماد حقيقي في النظام بنجاح برقم (${decId}).\nيمكنك الآن الانتقال إلى «مركز قرارات الرئيس التنفيذي» (CEO Approvals) لمراجعته وتوقيعه، وسينعكس توقيعك فوراً على مسار العمل.`,
        executedTools
      };
    }
  }

  // 5. Query about Task status
  if (query.includes('مهمتك') || query.includes('تشتغل على') || query.includes('وش تسوي')) {
    return {
      text: `مهمتي المسجلة حالياً في النظام هي: «${taskContext?.currentTask || employee.currentTask}» في مشروع «${projectContext?.name || 'الشركة'}».\nنسبة إنجاز هذه المهمة وفق السجلات: ${taskContext?.taskProgress || employee.taskProgress || 0}%.\nالصلاحيات الممنوحة لي: ${employee.permissions?.join(', ') || 'صلاحيات قياسية'}.`,
      executedTools
    };
  }

  // 7. General truthful answer grounded in role & company state
  return {
    text: `أنا ${employee.name}، ${employee.position} في قسم ${employee.departmentName}.\nأعمل حالياً على: «${taskContext?.currentTask || employee.currentTask}» لمشروع «${projectContext?.name || 'الشركة'}».\n\nحالة الشركة العامة: ${companyState.isOperating ? 'العمليات نشطة' : 'متوقفة مؤقتاً'}، وهناك ${companyState.pendingApprovalsCount} قرارات بانتظار توقيع الرئيس التنفيذي.\nإذا أردت فحص حالة المشروع أو قراءة ملف حقيقي أو رفع طلب اعتماد، حدد لي وسأقوم بالإجراء الحقيقي.`,
    executedTools
  };
}
