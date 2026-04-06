import React, { useState, useEffect, useRef } from 'react';
import { IconPlay, IconPause, IconRefresh } from './Icons.jsx';

const DURATIONS = [
  { label: '15m', seconds: 15 * 60 },
  { label: '25m', seconds: 25 * 60 },
  { label: '50m', seconds: 50 * 60 },
];

export default function FocusTimer({ taskName }) {
  const [duration, setDuration] = useState(DURATIONS[1].seconds);
  const [timeLeft, setTimeLeft] = useState(DURATIONS[1].seconds);
  const [running, setRunning] = useState(false);
  const [sessionName] = useState(taskName || 'Focus Session');
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Sanctuary', { body: `Session complete: ${sessionName}` });
            }
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

  const handleDuration = (secs) => {
    if (running) return;
    setDuration(secs);
    setTimeLeft(secs);
  };

  const toggle = () => {
    if (timeLeft === 0) setTimeLeft(duration);
    setRunning(!running);
  };

  const reset = () => { setRunning(false); setTimeLeft(duration); };

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const progress = ((duration - timeLeft) / duration) * 100;

  return (
    <div className="flex items-center gap-3.5 bg-white rounded-2xl px-4 py-3"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid hsl(213,25%,90%)' }}>
      {/* Status dot */}
      <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors ${running ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]' : 'bg-muted-foreground/25'}`} />

      {/* Session name */}
      <span className="text-[12.5px] font-semibold text-foreground/70 truncate max-w-[120px]">{sessionName}</span>

      <div className="w-px h-4 bg-border mx-1" />

      {/* Duration pills */}
      <div className="flex gap-1">
        {DURATIONS.map((d) => (
          <button key={d.seconds} onClick={() => handleDuration(d.seconds)}
            className={`text-[11px] px-2 py-1 rounded-full font-bold transition-all ${
              duration === d.seconds
                ? 'bg-foreground text-white shadow-sm'
                : 'text-muted-foreground hover:bg-muted'
            }`}>
            {d.label}
          </button>
        ))}
      </div>

      <div className="flex-1" />

      {/* Progress bar */}
      <div className="w-24 h-1.5 rounded-full overflow-hidden flex-shrink-0" style={{ background: 'hsl(213,25%,90%)' }}>
        <div className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${progress}%`, background: running ? 'linear-gradient(90deg, #4F46E5, #7C3AED)' : 'hsl(215,20%,65%)' }} />
      </div>

      {/* Time display */}
      <div className="text-[18px] font-bold font-mono text-foreground tabular-nums tracking-tight flex-shrink-0">
        {fmt(timeLeft)}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button onClick={reset}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors">
          <IconRefresh size={13} />
        </button>
        <button onClick={toggle}
          className={`w-8 h-8 flex items-center justify-center rounded-xl text-white transition-all hover:shadow-md hover:scale-105 ${
            running ? 'bg-amber-500' : 'bg-primary'
          }`}>
          {running ? <IconPause size={13} /> : <IconPlay size={13} />}
        </button>
      </div>
    </div>
  );
}
