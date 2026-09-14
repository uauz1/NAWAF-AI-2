import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Users, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  MessageSquare, 
  Mic, 
  LogOut, 
  Clock,
  ShieldCheck,
  Zap,
  Bot
} from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';

export const MeetingModal: React.FC = () => {
  const { 
    isMeetingModalOpen, 
    setIsMeetingModalOpen, 
    meetingSession, 
    endMeeting, 
    sendMeetingMessage,
    employees 
  } = useCompany();

  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [meetingSession?.messages]);

  if (!isMeetingModalOpen || !meetingSession) return null;

  const attendeeObjects = employees.filter(e => meetingSession.attendees.includes(e.id));

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim()) return;

    sendMeetingMessage('nawaf', messageInput.trim());
    setMessageInput('');
  };

  const handleQuickDirective = (directiveText: string) => {
    sendMeetingMessage('nawaf', directiveText);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl h-[85vh] flex flex-col rounded-3xl bg-[#080c18] border border-cyan-500/30 shadow-2xl text-right overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-slate-950/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  قاعة الاجتماعات الكبرى — جلسة استراتيجية حية
                </h2>
                <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>جلسة نشطة</span>
                </span>
              </div>
              <p className="text-xs text-cyan-300/80 mt-0.5 font-medium">
                الموضوع: «{meetingSession.topic}»
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={endMeeting}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/30 transition-all flex items-center gap-1.5"
              title="إنهاء الاجتماع وعودة الفريق لمكاتبهم"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>اختتام الاجتماع</span>
            </button>

            <button
              onClick={() => setIsMeetingModalOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-white/5 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Attendees Presence Bar */}
        <div className="px-6 py-2.5 bg-slate-900/40 border-b border-white/5 flex items-center gap-3 overflow-x-auto text-xs shrink-0">
          <span className="text-slate-400 text-[11px] font-medium shrink-0">الحضور في القاعة:</span>
          <div className="flex items-center gap-2">
            {/* Nawaf */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-200">
              <span>👑</span>
              <span className="font-bold">نواف (الرئيس التنفيذي)</span>
            </div>

            {/* AI Attendees */}
            {attendeeObjects.map(att => (
              <div 
                key={att.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-white/5 text-slate-200"
              >
                <span>{att.avatar}</span>
                <span className="font-medium">{att.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">({att.position})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {meetingSession.messages.map((msg, idx) => {
            const isNawaf = msg.senderId === 'nawaf';

            return (
              <div 
                key={`${msg.id || 'msg'}-${idx}`}
                className={`flex gap-3 max-w-[85%] ${isNawaf ? 'mr-auto flex-row-reverse text-left' : 'ml-auto text-right'}`}
              >
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-base shrink-0 shadow-md">
                  {msg.senderAvatar}
                </div>

                <div className="space-y-1">
                  <div className={`flex items-center gap-2 text-[11px] ${isNawaf ? 'justify-end' : 'justify-start'}`}>
                    <span className="font-bold text-white">{msg.senderName}</span>
                    <span className="text-slate-400">({msg.senderRole})</span>
                    <span className="text-slate-500 font-mono text-[10px]">{msg.timestamp}</span>
                  </div>

                  <div 
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isNawaf 
                        ? 'bg-amber-600/20 text-amber-100 border border-amber-500/30 shadow-md' 
                        : 'bg-slate-900/80 text-slate-200 border border-white/10'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick CEO Interventions */}
        <div className="px-6 py-2 bg-slate-950/40 border-t border-white/5 flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-[11px] text-slate-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>توجيه فوري:</span>
          </span>
          <button
            type="button"
            onClick={() => handleQuickDirective('أكدوا لي الالتزام بالتكلفة الصفرية $0.00 وفق القانون رقم 1.')}
            className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/5 transition-all shrink-0"
          >
            التأكيد على القانون رقم 1
          </button>
          <button
            type="button"
            onClick={() => handleQuickDirective('اعتمدوا هذه الخطة وابدأوا بالتنفيذ فوراً.')}
            className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/5 transition-all shrink-0"
          >
            اعتماد الخطة والمضي قدماً
          </button>
          <button
            type="button"
            onClick={() => handleQuickDirective('يا فهد وليان، نسقوا اختبارات تجربة المستخدم المشتركة خلال ساعة.')}
            className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/5 transition-all shrink-0"
          >
            تنسيق فهد وليان
          </button>
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSendMessage} className="p-4 bg-slate-950/80 border-t border-white/10 flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={messageInput}
            onChange={e => setMessageInput(e.target.value)}
            placeholder="اكتب رسالتك أو توجيهك في الاجتماع..."
            className="flex-1 bg-slate-900 border border-white/10 focus:border-cyan-500/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!messageInput.trim()}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
              !messageInput.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 active:scale-95'
            }`}
          >
            <span>إرسال</span>
            <Send className="w-3.5 h-3.5 rotate-180" />
          </button>
        </form>

      </div>
    </div>
  );
};
