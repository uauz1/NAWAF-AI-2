import React from 'react';
import { 
  BookOpen, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  DollarSign, 
  CheckCircle2, 
  Layers, 
  Lock,
  Moon,
  Gamepad2
} from 'lucide-react';

export const KnowledgeView: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="rounded-2xl glass-panel p-6 border border-white/10 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md">
            <BookOpen className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            دستور وقوانين شركة Nawaf HQ (Company Playbook)
          </h2>
          <span className="text-xs bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
            وثيقة تشغيل رسمية
          </span>
        </div>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          المرجعية التشغيلية والأخلاقية الملزمة لجميع موظفي ومديري الذكاء الاصطناعي داخل المؤسسة.
        </p>
      </div>

      {/* Rule #1 Hero Card */}
      <div className="rounded-2xl glass-panel p-6 border-2 border-amber-500/40 bg-gradient-to-br from-amber-950/30 via-slate-950/80 to-slate-950 relative overflow-hidden shadow-[0_0_40px_-10px_rgba(245,158,11,0.2)]">
        <div className="absolute top-0 right-0 h-full w-2 bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-600"></div>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-amber-400 tracking-wider">
              NON-NEGOTIABLE RULE #1
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              القانون رقم 1 — مجانية التشغيل والتحكم المالي الصارم
            </h3>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/20 mb-4">
          <p className="text-sm font-bold text-amber-200 mb-1">
            «المشروع يجب أن يبقى مجانياً في تشغيله قدر الإمكان. لا صرف ولا تفعيل لأي بنية تحتية مدفوعة إطلاقاً.»
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">
            يُفضّل دائماً: الخطط المجانية Free Tiers، المصادر المفتوحة، التقنيات التي تعمل في متصفح المستخدم Client-side، مستودعات GitHub، باقة Vercel المجانية، وقواعد البيانات والـ APIs المجانية.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5">
            <span className="font-bold text-rose-400 block mb-1">الممنوعات الصارمة:</span>
            <ul className="space-y-1 list-disc list-inside text-slate-400 text-[11px]">
              <li>منع صرف أي مبالغ مالية دون موافقة</li>
              <li>منع تفعيل خوادم أو اشتراكات مدفوعة</li>
              <li>منع ترقية أي باقة سحابية تلقائياً</li>
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5">
            <span className="font-bold text-cyan-400 block mb-1">في حال استلزمت ميزة تكلفة:</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              التوقف فوراً، وشرح: 1. سبب الحاجة، 2. التكلفة المتوقعة بدقة، 3. البدائل المجانية، وانتظار موافقة نواف الخطية.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5">
            <span className="font-bold text-emerald-400 block mb-1">الرئيس التنفيذي (نواف):</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              له حق التحكم المطلق في كل ريال أو دولار يدخل أو يخرج من الشركة الرقمية.
            </p>
          </div>
        </div>
      </div>

      {/* Project Governance Policies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Mueen Religious Policy */}
        <div className="rounded-2xl glass-panel p-6 border border-cyan-500/20">
          <div className="flex items-center gap-2.5 mb-3">
            <Moon className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">سياسة المحتوى الديني لتطبيق «مُعين»</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            نظراً لأن مشروع مُعين تطبيق إسلامي، فإن التعامل مع النصوص الدينية والقرآنية والأحاديث الشريفة يتطلب عناية فائقة وتقديساً للمعايير الشرعية.
          </p>
          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200">
            <strong>القاعدة الملزمة:</strong> لا يحق لأي موظف أو مدير AI تعديل أو نشر أي محتوى قرآني أو تفسيري بشكل ذاتي. أي تغيير في المحتوى الإسلامي يوجب الرفع لمركز القرارات للاعتماد الشخصي من نواف.
          </div>
        </div>

        {/* Qaddha Social Gaming Policy */}
        <div className="rounded-2xl glass-panel p-6 border border-purple-500/20">
          <div className="flex items-center gap-2.5 mb-3">
            <Gamepad2 className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">سياسة النمو والنزاهة لمنصة «قدّها»</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            منصة قدّها تركز على جمعات الشباب والعائلات في الخليج؛ نعتمد كلياً على الانتشار العضوي الفيروسي التفاعلي دون حرق ميزانيات على الإعلانات الممولة.
          </p>
          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200">
            <strong>القاعدة الملزمة:</strong> فحص جميع بنوك الأسئلة والتحديات للتأكد من ملاءمتها للأعراف والآداب، والاعتماد على اتصالات Peer-to-Peer مجانية لغرف اللعب.
          </div>
        </div>

      </div>

    </div>
  );
};
