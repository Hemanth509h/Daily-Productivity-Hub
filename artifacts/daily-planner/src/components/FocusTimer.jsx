import React, { useState, useEffect, useRef } from 'react';

const DURATIONS = [
  { label: '25 min', seconds: 25 * 60 },
  { label: '15 min', seconds: 15 * 60 },
  { label: '50 min', seconds: 50 * 60 },
];

export default function FocusTimer({ taskName }) {
  const [duration, setDuration] = useState(DURATIONS[0].seconds);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [running, setRunning] = useState(false);
  const [sessionName, setSessionName] = useState(taskName || 'Focus Session');
  const intervalRef = useRef(null);

  useEffect(() => {
    if (taskName) setSessionName(taskName);
  }, [taskName]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Sanctuary', { body: `Focus session complete: ${sessionName}` });
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
    if (timeLeft === 0) {
      setTimeLeft(duration);
    }
    setRunning(!running);
  };

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="mt-4 flex items-center justify-between bg-white border border-border rounded-xl px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`w-2.5 h-2.5 rounded-full ${running ? 'bg-green-400 animate-pulse' : 'bg-muted-foreground/30'}`} />
        <span className="text-sm font-semibold text-foreground">{sessionName}</span>
        <span className="text-muted-foreground/30 text-sm">|</span>
        <div className="flex gap-1.5">
          {DURATIONS.map((d) => (
            <button
              key={d.seconds}
              onClick={() => handleDuration(d.seconds)}
              className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                duration === d.seconds ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold font-mono text-foreground tabular-nums">{fmt(timeLeft)}</span>
        <button
          onClick={toggle}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors ${
            running ? 'bg-amber-500 hover:bg-amber-600' : 'bg-primary hover:opacity-90'
          }`}
        >
          {running ? '⏸' : timeLeft === 0 ? '↺' : '▶'}
        </button>
      </div>
    </div>
  );
}
