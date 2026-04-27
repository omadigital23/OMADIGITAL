'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { generateId } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWidget() {
  const t = useTranslations('chat');
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ id: generateId(), role: 'assistant', content: t('greeting') }]);
    }
  }, [open, messages.length, t]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    const userMsg: Message = { id: generateId(), role: 'user', content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { id: generateId(), role: 'assistant', content: data.message },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: generateId(), role: 'assistant', content: 'Erreur de connexion. Réessayez.' },
      ]);
    }
    setLoading(false);
  };

  const quickActions = [
    { label: t('quickServices'), msg: 'Quels sont vos services ?' },
    { label: t('quickPricing'), msg: 'Quels sont vos tarifs ?' },
    { label: t('quickAudit'), msg: "Je souhaite un audit gratuit" },
    { label: t('quickContact'), msg: 'Comment vous contacter ?' },
  ];

  return (
    <>
      {/* Toggle button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ delay: 2, type: 'spring' }}
            onClick={() => setOpen(true)}
            className="fixed bottom-24 right-6 z-40 w-14 h-14 rounded-full gradient-bg shadow-glow-lg flex items-center justify-center hover:scale-110 transition-transform"
            aria-label={t('title')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-4rem)] flex flex-col rounded-2xl bg-bg-secondary border border-border-subtle shadow-float overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 gradient-bg">
              <div>
                <h3 className="font-heading font-semibold text-white">{t('title')}</h3>
                <p className="text-white/70 text-xs">{t('subtitle')}</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white p-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'gradient-bg text-white rounded-br-md'
                        : 'bg-bg-card border border-border-subtle text-text-primary rounded-bl-md'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-bg-card border border-border-subtle rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              {/* Quick actions (show only at start) */}
              {messages.length <= 1 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => sendMessage(action.msg)}
                      className="text-xs px-3 py-1.5 rounded-full border border-border-subtle text-text-secondary hover:text-accent-violet hover:border-accent-violet/30 transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-border-subtle">
              <form
                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('placeholder')}
                  className="flex-1 bg-bg-primary border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-violet transition-colors"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white disabled:opacity-40 hover:shadow-glow transition-all shrink-0"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
