import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, User, Bot, Loader2 } from 'lucide-react';
import { customFetch } from '@/api-client-react/custom-fetch';
import { cn } from '../lib/utils.js';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your Quantum AI. How can I optimize your productivity today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || isTyping) return;

    const userMsg = { role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsTyping(true);

    try {
      const data = await customFetch('/api/ai/query', {
        method: 'POST',
        body: JSON.stringify({ prompt: query })
      });
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting to my neural network. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-[350px] h-[500px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          >
            {/* Chat Header */}
            <header className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Sparkles size={18} fill="currentColor" />
                </div>
                <div>
                  <div className="text-sm font-black">Quantum Assistant</div>
                  <div className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-widest">Neural Mode</div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/20 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </header>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-slate-50/50">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex flex-col", m.role === 'user' ? "items-end" : "items-start")}>
                  <div className="flex items-center gap-2 mb-1.5 px-2">
                    {m.role === 'assistant' ? <Bot size={12} className="text-emerald-500" /> : <User size={12} className="text-slate-400" />}
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      {m.role === 'assistant' ? 'AI Mind' : 'You'}
                    </span>
                  </div>
                  <div className={cn(
                    "max-w-[85%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed shadow-sm",
                    m.role === 'user' ? "bg-slate-900 text-white rounded-tr-none" : "bg-white text-slate-700 rounded-tl-none border border-slate-100"
                  )}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex flex-col items-start">
                   <div className="flex items-center gap-2 mb-1.5 px-2">
                    <Bot size={12} className="text-emerald-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Neural Sync</span>
                  </div>
                  <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-emerald-500" />
                    <span className="text-xs text-slate-400 font-medium">Synthesizing...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-100">
              <div className="relative">
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask anything..."
                  className="w-full pl-4 pr-12 py-3 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-emerald-500/5 transition-all text-sm outline-none"
                />
                <button 
                  disabled={!query.trim() || isTyping}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-900 text-white disabled:bg-slate-100 disabled:text-slate-300 transition-all shadow-md active:scale-95"
                >
                  <Send size={16} strokeWidth={3} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-500 hover:-translate-y-1 active:scale-95 z-[101]",
          isOpen ? "bg-slate-900 text-white rotate-90" : "bg-emerald-500 text-white hover:bg-emerald-600"
        )}
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} fill="currentColor" />}
      </button>
    </div>
  );
}
