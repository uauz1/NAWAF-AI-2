import React, { useMemo, useState, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  Sparkles, 
  Play, 
  Pause, 
  ShieldCheck, 
  Bot,
  Layers,
  Menu,
  X,
  Cpu
} from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { ExecutionAdapter, ExecutionEngineStatus } from '../../services/execution/executionAdapter';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu, isMobileMenuOpen }) => {
  const { 
    isCompanyOperating, 
    setIsCompanyOperating, 
    metrics, 
    decisions, 
    setIsSearchOpen, 
    setIsNotificationsOpen, 
    setIsGMSummaryOpen,
    triggerSimulatedCollaboration,
    isAutoSimulationActive,
    toggleAutoSimulation
  } = useCompany();

  // Determine greeting based on current local hour
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) {
      return 'صباح الخير يا نواف 👋';
    } else if (hour >= 12 && hour < 17) {
      return 'طاب يومك يا نواف 👋';
    } else {
      return 'مساء الخير يا نواف 👋';
    }
  }, []);

  const pendingDecisionsCount = decisions.filter(d => d.status === 'waiting').length;
  const [engineStatus, setEngineStatus] = useState<ExecutionEngineStatus>('NOT_CONFIGURED');

  useEffect(() => {
    ExecutionAdapter.getInstance().getEngineStatus().then(st => {
      setEngineStatus(st.executionEngine);
    }).catch(() => {
      setEngineStatus('NOT_CONFIGURED');
    });
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/[0.06] bg-[#07090e]/85 backdrop-blur-xl px-4 sm:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        
        {/* Left Side: Mobile Menu Button + Greeting */}
        <div className="flex items-center gap-3 sm:gap-6">
          <button 
            id="mobile-sidebar-toggle"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/60 border border-white/5"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>{greeting}</span>
              </h1>
              
              {/* Company Status Pulse Badge */}
              <div 
                onClick={() => setIsCompanyOperating(!isCompanyOperating)}
                title={isCompanyOperating ? "الشركة تعمل بشكل نشط (اضغط للإيقاف المؤقت)" : "الشركة متوقفة مؤقتاً (اضغط للاستئناف)"}
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer border transition-all ${
                  isCompanyOperating 
                    ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300 shadow-[0_0_12px_-2px_rgba(16,185,129,0.3)]' 
                    : 'bg-amber-950/50 border-amber-500/30 text-amber-300'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isCompanyOperating ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
                <span className={`w-2 h-2 rounded-full -mr-3.5 ${isCompanyOperating ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                <span className="mr-1">{isCompanyOperating ? 'الشركة تعمل الآن' : 'وضع الاستراحة'}</span>
              </div>

              {/* Visible System Status: EXECUTION ENGINE: CONNECTED / NOT CONFIGURED / ERROR */}
              <div 
                id="execution-engine-status-badge"
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold tracking-tight border transition-all ${
                  engineStatus === 'CONNECTED'
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : engineStatus === 'ERROR'
                    ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                    : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                }`}
                title="حالة محرك التنفيذ البرمجي الخارجي (OpenHands)"
              >
                <span className={`w-2 h-2 rounded-full ${
                  engineStatus === 'CONNECTED' ? 'bg-emerald-400 animate-pulse' : engineStatus === 'ERROR' ? 'bg-rose-400' : 'bg-amber-400'
                }`} />
                <span>EXECUTION ENGINE: {engineStatus === 'NOT_CONFIGURED' ? 'NOT CONFIGURED' : engineStatus}</span>
              </div>
            </div>

            <p className="hidden md:block text-xs text-slate-400 mt-0.5 font-normal">
              فريقك يشتغل على مشاريعك. هذه أهم المستجدات والقرارات بانتظارك.
            </p>
          </div>
        </div>

        {/* Right Side: Global Search + Simulated Action + Notifications + GM Briefing */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Global Search Button */}
          <button
            id="global-search-btn"
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-slate-300 bg-slate-900/70 hover:bg-slate-800/80 border border-white/10 hover:border-cyan-500/40 transition-all group"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            <span className="hidden sm:inline">ابحث في شركتك...</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] text-slate-400 bg-slate-800/90 rounded border border-white/5 font-mono">⌘K</kbd>
          </button>

          {/* Quick Simulation Trigger */}
          <button
            id="quick-simulation-trigger-btn"
            onClick={triggerSimulatedCollaboration}
            title="توليد حدث تعاون ذكي بين الموظفين في النشاط المباشر"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 hover:border-cyan-400/50 shadow-[0_0_15px_-4px_rgba(6,182,212,0.25)] transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>محاكاة تفاعل</span>
          </button>

          {/* GM Summary Drawer Trigger */}
          <button
            id="gm-summary-trigger-btn"
            onClick={() => setIsGMSummaryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-purple-200 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 hover:border-purple-400/50 transition-all"
          >
            <Bot className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">ملخص المدير العام</span>
          </button>

          {/* Notifications Trigger */}
          <button
            id="notifications-trigger-btn"
            onClick={() => setIsNotificationsOpen(true)}
            className="relative p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900/70 hover:bg-slate-800/80 border border-white/10 transition-all"
            aria-label="التنبيهات"
          >
            <Bell className="w-4 h-4" />
            {pendingDecisionsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md animate-pulse">
                {pendingDecisionsCount}
              </span>
            )}
          </button>

          {/* CEO Avatar Display */}
          <div className="flex items-center gap-2 pl-1 border-r border-white/10 pr-2">
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[1px] shadow-sm">
                <div className="w-full h-full rounded-[11px] bg-slate-950 flex items-center justify-center text-sm font-bold text-cyan-200">
                  ن
                </div>
              </div>
              <span className="absolute -bottom-0.5 -left-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full"></span>
            </div>
            <div className="hidden lg:block text-right">
              <div className="text-xs font-semibold text-white leading-tight">نواف</div>
              <div className="text-[10px] text-cyan-400 font-mono">CEO</div>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
