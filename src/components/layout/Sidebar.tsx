import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Orbit, 
  Users, 
  FolderKanban, 
  CheckCircle2, 
  FileText,
  Layers, 
  Settings, 
  Bot, 
  Sparkles, 
  ShieldCheck, 
  ChevronLeft,
  ChevronDown,
  Palette,
  Check
} from 'lucide-react';
import { useCompany, NavigationTab } from '../../context/CompanyContext';
import { ThemeId } from '../../types';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { 
    activeTab, 
    setActiveTab, 
    decisions, 
    projects, 
    employees, 
    reports,
    plans,
    theme,
    setTheme,
    setIsAdvisorDrawerOpen,
    isCompanyOperating
  } = useCompany();

  const [isCompanyExpanded, setIsCompanyExpanded] = useState(true);

  const pendingDecisionsCount = decisions.filter(d => d.status === 'waiting').length;
  const activePlansCount = plans.filter(p => p.status === 'IN_PROGRESS' || p.status === 'PLANNING').length;
  const readyReportsCount = reports.filter(r => r.status === 'جاهز للمراجعة').length;

  const handleNavClick = (tab: NavigationTab) => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const cycleTheme = () => {
    const themeList: ThemeId[] = ['executive-gold', 'midnight-blue', 'graphite', 'warm-stone'];
    const currentIndex = themeList.indexOf(theme);
    const nextTheme = themeList[(currentIndex + 1) % themeList.length];
    setTheme(nextTheme);
  };

  const getThemeLabel = (t: ThemeId) => {
    switch (t) {
      case 'executive-gold': return 'الذهب التنفيذي';
      case 'midnight-blue': return 'أزرق منتصف الليل';
      case 'graphite': return 'الجرافيت';
      case 'warm-stone': return 'الحجر الدافئ';
      default: return 'تنفيذي';
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside className={`fixed lg:sticky top-0 right-0 z-50 h-screen w-72 flex-col justify-between border-l border-[var(--border-subtle)] bg-[var(--bg-surface)] backdrop-blur-2xl px-3.5 py-4.5 transition-transform duration-300 text-right select-none ${
        isMobileOpen ? 'translate-x-0 flex' : 'translate-x-full lg:translate-x-0 hidden lg:flex'
      }`}>
        
        {/* Top Header & Branding */}
        <div className="space-y-4">
          
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-glow)] p-[1px] shadow-sm">
                <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[var(--bg-base)]">
                  <Sparkles className="h-4 w-4 text-[var(--accent-primary)]" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black tracking-tight text-[var(--text-primary)] font-mono">NAWAF HQ</span>
                  <span className="rounded-full bg-[var(--accent-primary)]/10 px-1.5 py-0.2 text-[9px] font-bold text-[var(--accent-primary)] border border-[var(--border-accent)]">v2.5</span>
                </div>
                <p className="text-[10px] text-[var(--text-secondary)]">نظام التشغيل الذكي للمؤسسة</p>
              </div>
            </div>

            {/* Quick Theme Cycler */}
            <button
              onClick={cycleTheme}
              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors border border-[var(--border-subtle)]"
              title={`السمة الحالية: ${getThemeLabel(theme)} (اضغط للتغيير)`}
            >
              <Palette className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            </button>
          </div>

          {/* PRIMARY SECTION 1: Chief of Staff Highlight (Advisor) */}
          <button
            id="nav-advisor-trigger"
            onClick={() => {
              setIsAdvisorDrawerOpen(true);
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full p-2.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-accent)] hover:border-[var(--accent-primary)] transition-all flex items-center justify-between group shadow-sm text-right"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[var(--bg-base)] border border-[var(--border-accent)] flex items-center justify-center text-[var(--accent-primary)] shrink-0">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                  المستشار التنفيذي (Advisor)
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Chief of Staff جاهز للمشورة</span>
                </div>
              </div>
            </div>

            <ChevronLeft className="w-3.5 h-3.5 text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-transform group-hover:-translate-x-0.5" />
          </button>

          {/* PRIMARY & SECONDARY NAVIGATION LIST */}
          <div className="space-y-4 pt-1 overflow-y-auto max-h-[calc(100vh-290px)] pr-0.5">
            
            {/* Primary Nav Items */}
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                القيادة والعمليات (Primary)
              </div>

              {/* 1. HQ */}
              <button
                id="nav-dashboard"
                onClick={() => handleNavClick('dashboard')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-[var(--accent-primary)]/15 text-[var(--text-primary)] border-r-2 border-[var(--accent-primary)] font-bold shadow-sm' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`} />
                  <span>المقر التنفيذي (HQ)</span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </button>

              {/* 2. Work / Execution Plans & Tasks */}
              <button
                id="nav-tasks"
                onClick={() => handleNavClick('tasks')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'tasks'
                    ? 'bg-[var(--accent-primary)]/15 text-[var(--text-primary)] border-r-2 border-[var(--accent-primary)] font-bold shadow-sm' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className={`w-4 h-4 ${activeTab === 'tasks' ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`} />
                  <span>العمليات والخطط (Work)</span>
                </div>
                {activePlansCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border border-[var(--border-accent)]">
                    {activePlansCount} خطط
                  </span>
                )}
              </button>

              {/* 3. Executive Decisions */}
              <button
                id="nav-decisions"
                onClick={() => handleNavClick('decisions')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'decisions'
                    ? 'bg-[var(--accent-primary)]/15 text-[var(--text-primary)] border-r-2 border-[var(--accent-primary)] font-bold shadow-sm' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className={`w-4 h-4 ${activeTab === 'decisions' ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`} />
                  <span>مركز القرارات (Decisions)</span>
                </div>
                {pendingDecisionsCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500 text-white animate-pulse">
                    {pendingDecisionsCount}
                  </span>
                )}
              </button>

              {/* 4. Company (Hub with Projects, Employees, 3D Office) */}
              <div className="pt-1">
                <button
                  onClick={() => setIsCompanyExpanded(!isCompanyExpanded)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FolderKanban className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span>الشركة والفرق (Company)</span>
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCompanyExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isCompanyExpanded && (
                  <div className="mr-3 space-y-0.5 border-r border-[var(--border-subtle)] pr-2 mt-1">
                    <button
                      id="nav-projects"
                      onClick={() => handleNavClick('projects')}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                        activeTab === 'projects'
                          ? 'bg-[var(--accent-primary)]/15 text-[var(--text-primary)] font-bold'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                      }`}
                    >
                      <span>المشاريع الاستراتيجية</span>
                      <span className="text-[10px] font-mono text-[var(--text-muted)]">{projects.length}</span>
                    </button>

                    <button
                      id="nav-employees"
                      onClick={() => handleNavClick('employees')}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                        activeTab === 'employees'
                          ? 'bg-[var(--accent-primary)]/15 text-[var(--text-primary)] font-bold'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                      }`}
                    >
                      <span>فريق الكفاءات الذكية</span>
                      <span className="text-[10px] font-mono text-[var(--text-muted)]">{employees.length}</span>
                    </button>

                    <button
                      id="nav-office"
                      onClick={() => handleNavClick('office')}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                        activeTab === 'office'
                          ? 'bg-[var(--accent-primary)]/15 text-[var(--text-primary)] font-bold'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                      }`}
                    >
                      <span>المكتب التفاعلي 3D</span>
                      <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-300 font-bold">مباشر</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* SECONDARY SECTION */}
            <div className="space-y-1 pt-2 border-t border-[var(--border-subtle)]">
              <div className="px-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                المخرجات والإعدادات (Secondary)
              </div>

              {/* 5. Reports */}
              <button
                id="nav-reports"
                onClick={() => handleNavClick('reports')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'reports'
                    ? 'bg-[var(--accent-primary)]/15 text-[var(--text-primary)] border-r-2 border-[var(--accent-primary)] font-bold shadow-sm' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className={`w-4 h-4 ${activeTab === 'reports' ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`} />
                  <span>التقارير والمخرجات</span>
                </div>
                {readyReportsCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]">
                    {readyReportsCount}
                  </span>
                )}
              </button>

              {/* 6. Settings */}
              <button
                id="nav-settings"
                onClick={() => handleNavClick('settings')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'settings'
                    ? 'bg-[var(--accent-primary)]/15 text-[var(--text-primary)] border-r-2 border-[var(--accent-primary)] font-bold shadow-sm' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`} />
                  <span>الإعدادات والسمات</span>
                </div>
              </button>
            </div>

          </div>
        </div>

        {/* Footer: Law #1 & Governance */}
        <div className="space-y-2.5 pt-3 border-t border-[var(--border-subtle)]">
          
          <div className="rounded-xl p-2.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isCompanyOperating ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
                <span className="font-bold text-[var(--text-primary)] text-[11px]">حالة المنظومة</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                {isCompanyOperating ? 'تشغيل ذاتي 100%' : 'وضع الاستراحة'}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[var(--border-subtle)]">
              <span className="text-[var(--text-secondary)] flex items-center gap-1 text-[10px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                القانون رقم 1:
              </span>
              <span className="font-mono text-emerald-400 font-bold text-[10px]">$0.00 (صفر التكلفة)</span>
            </div>
          </div>

          <div className="flex items-center justify-between px-1 text-[10px] text-[var(--text-muted)] font-mono">
            <span>الرئيس: نواف (CEO)</span>
            <span className="text-[var(--accent-primary)]">{getThemeLabel(theme)}</span>
          </div>

        </div>

      </aside>
    </>
  );
};
