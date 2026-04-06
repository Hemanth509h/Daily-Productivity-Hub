import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Zap, Brain, Bell } from 'lucide-react';
import { cn } from '../lib/utils.js';

const MODES = [
  { id: 'focus', label: 'Focus', minutes: 25, icon: <Brain size={14} />, color: 'text-rose-500', bg: 'bg-rose-50' },
  { id: 'short', label: 'Short Break', minutes: 5, icon: <Coffee size={14} />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 'long', label: 'Long Break', minutes: 15, icon: <Zap size={14} />, color: 'text-blue-500', bg: 'bg-blue-50' }
];

export default function FocusTimer({ taskName }) {
  const [mode, setMode] = useState(MODES[0]);
  const [timeLeft, setTimeLeft] = useState(mode.minutes * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            notify();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const notify = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Sanctuary', { body: `${mode.label} complete!` });
    }
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(() => {});
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setTimeLeft(newMode.minutes * 60);
    setRunning(false);
  };

  const toggle = () => setRunning(!running);
  const reset = () => { setRunning(false); setTimeLeft(mode.minutes * 60); };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs < 10 ? '0' : ''}${rs}`;
  };

  const progress = (timeLeft / (mode.minutes * 60)) * 100;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 rounded-xl", mode.bg, mode.color)}>
            {mode.icon}
          </div>
          <span className="font-bold text-slate-900 text-sm">{mode.label}</span>
        </div>
        <button className="text-slate-400 hover:text-slate-600 transition-colors">
          <Bell size={16} />
        </button>
      </div>

      <div className="flex flex-col items-center justify-center space-y-6">
        {/* Circular Display */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="50%" cy="50%" r={radius}
              className="fill-none stroke-slate-50"
              strokeWidth="6"
            />
            <motion.circle
              cx="50%" cy="50%" r={radius}
              className={cn("fill-none transition-colors", mode.color)}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.3, ease: "linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-slate-900 tabular-nums tracking-tighter">
              {formatTime(timeLeft)}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {taskName || 'Focusing'}
            </span>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100 w-full">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => handleModeChange(m)}
              className={cn(
                "flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all",
                mode.id === m.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {m.label.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 w-full">
          <button 
            onClick={reset}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-slate-100 text-slate-400 hover:bg-slate-50 transition-all"
          >
            <RotateCcw size={16} />
          </button>
          <button 
            onClick={toggle}
            className={cn(
              "flex-[2] flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm shadow-lg transition-all active:scale-95",
              running ? "bg-slate-100 text-slate-900 ring-1 ring-slate-200" : "bg-slate-900 text-white shadow-slate-200"
            )}
          >
            {running ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            {running ? 'Pause' : 'Start Focus'}
          </button>
        </div>
      </div>
    </div>
  );
}
