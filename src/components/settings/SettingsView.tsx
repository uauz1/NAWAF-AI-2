import React from 'react';
import { 
  Settings, 
  Lock, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  Play, 
  Pause, 
  Database, 
  Key, 
  CheckCircle2, 
  Server
} from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { CEOControlLevel } from '../../types';
import { ThemeSwitcher } from './ThemeSwitcher';

export const SettingsView: React.FC = () => {
  const { 
    controlLevel, 
    setControlLevel, 
    isCompanyOperating, 
    setIsCompanyOperating, 
    isAutoSimulationActive, 
    toggleAutoSimulation, 
    resetAllData 
  } = useCompany();

  const controlModes: {
    id: CEOControlLevel;
    title: string;
    description: string;
    badge: string;
  }[] = [
    {
      id: 'requires_approval',
      title: '1. يحتاج موافقتي (Requires CEO Approval)',
      description: 'يقوم موظفو ومديرو AI بتجهيز كامل الأعمال والتحليلات والمسودات، لكن لا يمكنهم تنفيذ أي إجراء حتى تضغط على زر الاعتماد شخصياً.',
      badge: 'الوضع الحالي الموصى به'
    },
    {
      id: 'limited_autonomous',
      title: '2. تنفيذ تلقائي محدود (Limited Autonomous Execution)',
      description: 'يسمح للموظفين بتنفيذ المهام الروتينية الآمنة مسبقة التحديد (مثل فحص الأداء وإعادة جدولة المهام البسيطة). أي نشر علني أو محتوى حساس يطلب موافقتك.',
      badge: 'شبه ذاتي'
    },
    {
      id: 'fully_autonomous',
      title: '3. تنفيذ تلقائي (Fully Autonomous - Non-Financial)',
      description: 'تفويض كامل للمهام التي صرحت بها للمشاريع. (ملاحظة دستورية: الصرف المالي لا يصبح تلقائياً تحت أي ظرف بموجب القانون رقم 1).',
      badge: 'تحكم ذكي متقدم'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="rounded-2xl glass-panel p-6 border border-white/10 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Settings className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            إعدادات مركز القيادة والتحكم (Control & Settings)
          </h2>
          <span className="text-xs bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono">
            نواف (CEO)
          </span>
        </div>
        <p className="text-xs text-slate-400 max-w-xl">
          ضبط صلاحيات موظفي الذكاء الاصطناعي، ومراقبة البنى التحتية المجانية، وإدارة وتيرة المحاكاة.
        </p>
      </div>

      {/* Theme Switcher */}
      <div className="rounded-2xl p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)]">
        <ThemeSwitcher />
      </div>

      {/* 3 CEO Control Levels */}
      <div className="rounded-2xl glass-panel p-6 border border-white/10 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>مستويات تفويض الرئيس التنفيذي (CEO Control Levels)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            اختر المستوى المناسب لطبيعة تشغيل شركتك حالياً.
          </p>
        </div>

        <div className="space-y-3">
          {controlModes.map(mode => {
            const isSelected = controlLevel === mode.id;

            return (
              <div
                key={mode.id}
                id={`control-level-${mode.id}`}
                onClick={() => setControlLevel(mode.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isSelected 
                    ? 'bg-cyan-950/30 border-cyan-500/50 shadow-[0_0_25px_-5px_rgba(6,182,212,0.2)]' 
                    : 'bg-slate-900/40 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-cyan-400 bg-cyan-500 text-slate-950' : 'border-slate-600'
                  }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-slate-950"></div>}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{mode.title}</span>
                      <span className={`text-[10px] px-2 py-0.2 rounded-full font-mono ${
                        isSelected ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {mode.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {mode.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Free Tier Infrastructure Status */}
      <div className="rounded-2xl glass-panel p-6 border border-white/10">
        <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-400" />
          <span>حالة البنية التحتية المجانية (Free-Tier Stack)</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          تأكيد الالتزام بالقانون رقم 1 الصارم لضمان عدم تكبد أي مصروفات.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
            <div className="text-slate-400">استضافة الواجهة</div>
            <div className="text-sm font-bold text-white mt-0.5">Vercel Free Tier</div>
            <div className="text-[10px] text-emerald-400 mt-1">نشط • 0$ / شهر</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
            <div className="text-slate-400">التكاملات والأتمتة</div>
            <div className="text-sm font-bold text-white mt-0.5">GitHub Actions Free</div>
            <div className="text-[10px] text-emerald-400 mt-1">2,000 دقيقة مجانية • 0$</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
            <div className="text-slate-400">قواعد البيانات الحالية</div>
            <div className="text-sm font-bold text-white mt-0.5">Browser Local State</div>
            <div className="text-[10px] text-emerald-400 mt-1">محلي دائم • 0$</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
            <div className="text-slate-400">حماية النطاق والـ CDN</div>
            <div className="text-sm font-bold text-white mt-0.5">Cloudflare Free Tier</div>
            <div className="text-[10px] text-emerald-400 mt-1">حماية لا محدودة • 0$</div>
          </div>
        </div>
      </div>

      {/* Simulation Engine Controls */}
      <div className="rounded-2xl glass-panel p-6 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>محرك النبض التلقائي للشركة (Heartbeat Simulation)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            توليد أنشطة تعاونية بين الموظفين لإشعارك بحيوية الشركة أثناء تفقدك للنظام.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleAutoSimulation}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isAutoSimulationActive 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {isAutoSimulationActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAutoSimulationActive ? 'النبض التلقائي مفعّل' : 'النبض متوقف'}</span>
          </button>

          <button
            onClick={resetAllData}
            title="إعادة تعيين البيانات للحالة الأولية"
            className="px-4 py-2 rounded-xl text-xs font-bold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>استعادة البيانات الافتراضية</span>
          </button>
        </div>
      </div>

    </div>
  );
};
