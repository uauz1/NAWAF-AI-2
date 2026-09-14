import { Employee, Project, ExecutionPlan, Decision } from '../../types';
import { processEmployeeMessage, EmployeeChatContext } from '../chat/employeeChatEngine';
import { ToolExecutionResponse } from '../tools/toolRouter';

export interface DialogueContext {
  employee: Employee;
  project?: Project;
  activePlan?: ExecutionPlan;
  userQuery: string;
  isCompanyOperating: boolean;
  onTriggerApproval?: (params: { title: string; description: string; projectId: string }) => Decision | void;
}

export async function generateCrewAgentResponseAsync(context: DialogueContext): Promise<{ text: string; executedTools: ToolExecutionResponse[] }> {
  const { employee, project, activePlan, userQuery, isCompanyOperating, onTriggerApproval } = context;

  const chatContext: EmployeeChatContext = {
    employee,
    role: employee.position,
    permissions: employee.permissions || [],
    projectContext: project,
    taskContext: {
      currentTask: employee.currentTask,
      taskProgress: employee.taskProgress || 0,
      planSteps: activePlan?.steps
    },
    companyState: {
      isOperating: isCompanyOperating,
      activePlansCount: activePlan ? 1 : 0,
      pendingApprovalsCount: 0,
      totalEmployees: 6
    },
    availableTools: employee.tools || [],
    toolResults: [],
    previousRelevantResults: employee.lastResult ? [employee.lastResult] : [],
    onTriggerApproval
  };

  return await processEmployeeMessage(userQuery, chatContext);
}
