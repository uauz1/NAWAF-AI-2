import React from 'react';
import { CompanyProvider, useCompany } from './context/CompanyContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MainDashboard } from './components/dashboard/MainDashboard';
import { ProjectsView } from './components/projects/ProjectsView';
import { EmployeesView } from './components/employees/EmployeesView';
import { DecisionCenter } from './components/decisions/DecisionCenter';
import { IdeaLabView } from './components/ideas/IdeaLabView';
import { MarketingWorkspace } from './components/marketing/MarketingWorkspace';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { KnowledgeView } from './components/knowledge/KnowledgeView';
import { SettingsView } from './components/settings/SettingsView';
import { ReportsView } from './components/reports/ReportsView';
import { InteractiveOffice } from './components/office/InteractiveOffice';
import { GeneralManagerModal } from './components/dashboard/GeneralManagerModal';
import { EmployeeModal } from './components/employees/EmployeeModal';
import { DepartmentModal } from './components/office/DepartmentModal';
import { CeoCommandModal } from './components/command/CeoCommandModal';
import { MeetingModal } from './components/meetings/MeetingModal';
import { TasksView } from './components/tasks/TasksView';
import { AdvisorDrawer } from './components/advisor/AdvisorDrawer';
import { ExecutionPlanModal } from './components/plans/ExecutionPlanModal';
import { OpenHandsTerminalModal } from './components/openhands/OpenHandsTerminalModal';

const AppContent: React.FC = () => {
  const { 
    activeTab, 
    selectedEmployee, 
    setSelectedEmployee,
    selectedDepartment,
    setSelectedDepartment,
    openHandsSession,
    isOpenHandsTerminalOpen,
    closeOpenHandsTerminal
  } = useCompany();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <MainDashboard />;
      case 'office':
        return (
          <div className="space-y-6">
            <InteractiveOffice />
          </div>
        );
      case 'reports':
        return <ReportsView />;
      case 'projects':
        return <ProjectsView />;
      case 'tasks':
        return <TasksView />;
      case 'employees':
        return <EmployeesView />;
      case 'decisions':
        return <DecisionCenter />;
      case 'ideas':
        return <IdeaLabView />;
      case 'marketing':
        return <MarketingWorkspace />;
      case 'analytics':
        return <AnalyticsView />;
      case 'knowledge':
        return <KnowledgeView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <MainDashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent-primary)]/30 selection:text-[var(--text-primary)] transition-colors duration-300">
      
      {/* Fixed Sidebar for Desktop and Drawer for Mobile */}
      <Sidebar isMobileOpen={isMobileMenuOpen} onCloseMobile={() => setIsMobileMenuOpen(false)} />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Sticky Header */}
        <Header onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} isMobileMenuOpen={isMobileMenuOpen} />

        {/* Scrollable Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveTab()}
        </main>
      </div>

      {/* Chief of Staff Advisor Drawer */}
      <AdvisorDrawer />

      {/* Execution Plan Details & Approval Modal */}
      <ExecutionPlanModal />

      {/* Global AI General Manager Briefing Modal */}
      <GeneralManagerModal />

      {/* Global Employee Profile Modal */}
      <EmployeeModal 
        employee={selectedEmployee} 
        onClose={() => setSelectedEmployee(null)} 
      />

      {/* Global Department Workspace Modal */}
      <DepartmentModal 
        department={selectedDepartment} 
        onClose={() => setSelectedDepartment(null)} 
      />

      {/* Global CEO Command Center Modal */}
      <CeoCommandModal />

      {/* Global Boardroom / Meeting Modal */}
      <MeetingModal />

      {/* OpenHands Technical Execution Sandboxed Terminal */}
      <OpenHandsTerminalModal 
        isOpen={isOpenHandsTerminalOpen} 
        onClose={closeOpenHandsTerminal} 
      />

    </div>
  );
};

export default function App() {
  return (
    <CompanyProvider>
      <AppContent />
    </CompanyProvider>
  );
}
