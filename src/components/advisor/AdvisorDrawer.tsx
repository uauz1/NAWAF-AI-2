import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Bot, 
  Sparkles, 
  ShieldCheck, 
  Play, 
  CheckCircle2, 
  FileText,
  Clock,
  ArrowRight,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { AdvisorMessage, ExecutionPlan } from '../../types';

export const AdvisorDrawer: React.FC = () => {
  const { 
    isAdvisorDrawerOpen, 
    setIsAdvisorDrawerOpen, 
    advisorMessages, 
    sendAdvisorMessage,
    setSelectedPlan,
    setIsPlanModalOpen,
    approveExecutionPlan
  } = useCompany();

  const [inputVal, setInputVal] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isAdvisorDrawerOpen) {
      scrollToBottom();
    }
  }, [advisorMessages, isAdvisorDrawerOpen]);

  if (!isAdvisorDrawerOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    sendAdvisorMessage(inputVal.trim());
    setInputVal('');
  };

  const handlePromptClick = (prompt: string) => {
    sendAdvisorMessage(prompt);
  };

  const handleOpenPlan = (plan: ExecutionPlan) => {
    setSelectedPlan(plan);
    setIsPlanModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden text-right">
      {/* Backdrop */}
      <div 
        onClick={() => setIsAdvisorDrawerOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-base)]">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-glow)] p-[1px] shadow-sm">
                <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[var(--bg-base)]">
                  <Bot className="h-5 w-5 text-[var(--accent-primary)]" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-[var(--text-primary)]">المستشار التنفيذي (Chief of Staff)</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">مساعدك الاستراتيجي لإدارة قرارات ومسارات الشركة</p>
              </div>
            </div>

            <button
              onClick={() => setIsAdvisorDrawerOpen(false)}
              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Compliance Notice */}
          <div className="bg-[var(--bg-card)] px-4 py-2 border-b border-[var(--border-subtle)] flex items-center justify-between text-[11px]">
            <span className="text-[var(--text-secondary)] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              ضمان التكلفة الصفرية ($0.00)
            </span>
            <span className="font-mono text-emerald-400 font-bold">القانون رقم 1 سارٍ</span>
          </div>

          {/* Messages stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {advisorMessages.map((msg, idx) => (
              <div 
                key={`${msg.id || 'msg'}-${idx}`}
                className={`flex flex-col ${msg.sender === 'nawaf' ? 'items-start' : 'items-end'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-[var(--text-muted)]">
                  <span>{msg.sender === 'nawaf' ? 'أبو أحمد (الرئيس التنفيذي)' : 'المستشار التنفيذي'}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div 
                  className={`max-w-[90%] rounded-2xl p-4 text-xs leading-relaxed shadow-sm ${
                    msg.sender === 'nawaf'
                      ? 'bg-[var(--accent-primary)] text-white rounded-br-none'
                      : 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-bl-none'
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* If this message contains a generated plan */}
                  {msg.relatedPlan && (
                    <div className="mt-3 p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-accent)] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] text-[var(--accent-primary)]">
                          {msg.relatedPlan.title}
                        </span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                          {msg.relatedPlan.steps.length} خطوات
                        </span>
                      </div>
                      <p className="text-[10px] text-[var(--text-secondary)] line-clamp-2">
                        {msg.relatedPlan.summary}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleOpenPlan(msg.relatedPlan!)}
                          className="flex-1 py-1.5 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] text-[10px] font-bold transition-all flex items-center justify-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          <span>تفاصيل الخطة</span>
                        </button>
                        {msg.relatedPlan.status === 'PLANNING' && (
                          <button
                            onClick={() => approveExecutionPlan(msg.relatedPlan!.id)}
                            className="flex-1 py-1.5 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-[10px] font-bold transition-all flex items-center justify-center gap-1 shadow-sm"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>اعتماد وبدء التنفيذ</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggested Action Prompts */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 justify-end max-w-[90%]">
                    {msg.suggestedActions.map((act, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePromptClick(act.prompt)}
                        className="text-[10px] px-2.5 py-1 rounded-full bg-[var(--bg-card)] hover:bg-[var(--bg-base)] text-[var(--accent-primary)] border border-[var(--border-accent)] transition-all flex items-center gap-1 shadow-sm"
                      >
                        <Sparkles className="w-3 h-3 text-[var(--accent-primary)]" />
                        <span>{act.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input form */}
          <div className="p-3 sm:p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-base)] space-y-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] text-[var(--text-secondary)]">
              <span className="text-[var(--text-muted)] shrink-0">أوامر سريعة:</span>
              <button
                onClick={() => handlePromptClick('راجع قدّها وطور تجربة الألعاب وخله جاهز للاستخدام')}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors"
              >
                تطوير وفحص قدّها
              </button>
              <button
                onClick={() => handlePromptClick('ما هي القرارات التي تحتاج تدخلي الآن؟')}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors"
              >
                القرارات المعلقة
              </button>
              <button
                onClick={() => handlePromptClick('تأكد من التزام جميع الفرق بالقانون رقم 1 والتكلفة الصفرية')}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors"
              >
                تدقيق التكلفة الصفرية
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <button
                type="submit"
                disabled={!inputVal.trim()}
                className="p-2.5 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white disabled:opacity-40 disabled:hover:bg-[var(--accent-primary)] transition-all shadow-md shrink-0"
              >
                <Send className="w-4 h-4 rotate-180" />
              </button>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="اكتب توجيهك أو استشارتك للمستشار التنفيذي..."
                className="w-full rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--border-accent)] transition-all text-right"
              />
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};
