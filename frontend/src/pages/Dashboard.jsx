import React from 'react';
import { Link } from 'wouter';
import { format } from 'date-fns';
import {
  useGetDashboardSummary, useGetTodayTasks, useGetUrgentTasks, useToggleTaskComplete,
  getGetTodayTasksQueryKey, getGetUrgentTasksQueryKey, getGetDashboardSummaryQueryKey,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext.jsx';
import { formatTime, getGreeting, categoryBadgeClass, formatDeadline } from '../lib/utils.js';
import { IconCheck, IconChevronRight, IconAlert, IconTrendingUp } from '../components/Icons.jsx';
import FocusTimer from '../components/FocusTimer.jsx';

const CATEGORY_COLORS = { work: '#3B82F6', personal: '#8B5CF6', study: '#10B981' };

function TaskRow({ task }) {
  const qc = useQueryClient();
  const toggle = useToggleTaskComplete();

  const handleToggle = (e) => {
    e.preventDefault();
    toggle.mutate({ id: task.id, data: { completed: !task.completed } }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetTodayTasksQueryKey() });
        qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        qc.invalidateQueries({ queryKey: getGetUrgentTasksQueryKey() });
      },
    });
  };

  return (
    <Link href={`/tasks/${task.id}`}>
      <div className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-muted/30 cursor-pointer group border-b border-border/50 last:border-0 transition-colors">
        <button
          onClick={handleToggle}
          className={`w-[22px] h-[22px] rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
            task.completed
              ? 'border-green-500 bg-green-500 scale-95'
              : 'border-border hover:border-primary/50 hover:bg-primary/5'
          }`}
        >
          {task.completed && <IconCheck size={11} className="text-white" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className={`text-[13.5px] font-medium leading-tight ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {task.title}
          </div>
          {task.deadlineDate && (
            <div className="text-[11px] text-muted-foreground/70 mt-0.5 flex items-center gap-1.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              {formatTime(task.deadlineDate)}
            </div>
          )}
        </div>

        {/* Category dot */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[task.category] || '#94A3B8' }} />
          <span className="text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: CATEGORY_COLORS[task.category] || '#94A3B8' }}>
            {task.category}
          </span>
        </div>

        <IconChevronRight size={14} className="text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors flex-shrink-0" />
      </div>
    </Link>
  );
}

function UrgentRow({ task }) {
  const deadline = formatDeadline(task.deadlineDate);
  const isOverdue = task.status === 'overdue';

  return (
    <Link href={`/tasks/${task.id}`}>
      <div className="flex items-center gap-3 p-3 hover:bg-white/6 cursor-pointer rounded-xl transition-colors group"
        style={{ borderLeft: `3px solid ${isOverdue ? '#EF4444' : '#F59E0B'}` }}>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-white truncate">{task.title}</div>
          <div className={`text-[11px] font-semibold mt-0.5 ${isOverdue ? 'text-red-400' : 'text-amber-400'}`}>
            {deadline?.label || (isOverdue ? 'Overdue' : 'Due soon')}
          </div>
        </div>
        <IconChevronRight size={13} className="text-white/20 group-hover:text-white/50 flex-shrink-0 transition-colors" />
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: summary } = useGetDashboardSummary();
  const { data: todayTasks, isLoading: todayLoading } = useGetTodayTasks();
  const { data: urgentTasks, isLoading: urgentLoading } = useGetUrgentTasks();

  const today = format(new Date(), "EEEE, MMMM d");
  const greeting = getGreeting();
  const rate = summary?.completionRate || 0;
  const circumference = 2 * Math.PI * 34;
  const dashOffset = circumference - (rate / 100) * circumference;

  return (
    <div className="flex flex-col h-full gap-0 min-h-0">
      {/* Header */}
      <div className="flex items-start justify-between mb-5 flex-shrink-0">
        <div>
          <h1 className="text-[1.9rem] font-bold text-foreground tracking-tight leading-tight">
            {greeting},{' '}
            <span style={{ background: 'linear-gradient(135deg, hsl(222,47%,25%), hsl(235,60%,45%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {user?.name?.split(' ')[0] || 'there'}.
            </span>
          </h1>
          <p className="text-muted-foreground mt-1.5 text-[13.5px]">
            {summary?.todayCount
              ? `${summary.todayCount} task${summary.todayCount !== 1 ? 's' : ''} due today · start with the urgent ones.`
              : 'No tasks due today — great time to get ahead!'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">{format(new Date(), 'EEEE')}</div>
            <div className="text-[14px] font-bold text-foreground">{format(new Date(), 'MMM d, yyyy')}</div>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left — Daily Focus */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="bg-white rounded-2xl flex flex-col h-full overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid hsl(213,25%,90%)' }}>
            {/* Card header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: 'hsl(213,25%,92%)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'hsl(222,47%,18%)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                </div>
                <span className="font-bold text-foreground text-[13.5px]">Daily Focus</span>
                {todayTasks?.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: 'hsl(222,47%,20%)' }}>{todayTasks.length}</span>
                )}
              </div>
              <Link href="/tasks">
                <span className="text-[12px] font-semibold text-primary hover:underline cursor-pointer">View all →</span>
              </Link>
            </div>

            {/* Task list */}
            <div className="flex-1 overflow-y-auto">
              {todayLoading ? (
                <div className="flex flex-col gap-2 p-5">
                  {[1,2,3].map(i => <div key={i} className="h-12 rounded-xl bg-muted/60 animate-pulse" />)}
                </div>
              ) : todayTasks?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center px-8">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'hsl(213,33%,94%)' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="hsl(215,20%,65%)" strokeWidth="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                  </div>
                  <p className="text-[14px] font-semibold text-foreground">All clear for today!</p>
                  <p className="text-[12px] text-muted-foreground mt-1 max-w-[200px] leading-relaxed">Add tasks with today's deadline to see them here.</p>
                </div>
              ) : (
                todayTasks.map((task) => <TaskRow key={task.id} task={task} />)
              )}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-[268px] flex-shrink-0 flex flex-col gap-3">
          {/* Urgent Tasks */}
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid hsl(213,25%,90%)' }}>
            <div className="flex items-center gap-2.5 px-4 py-3 border-b" style={{ borderColor: 'hsl(213,25%,92%)' }}>
              <div className="w-5 h-5 rounded-md bg-red-500/10 flex items-center justify-center">
                <IconAlert size={11} className="text-red-500" />
              </div>
              <span className="font-bold text-foreground text-[13px]">Urgent Tasks</span>
              {urgentTasks?.length > 0 && (
                <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">{urgentTasks.length}</span>
              )}
            </div>
            <div className="p-3 space-y-1">
              {urgentLoading ? (
                <div className="py-4 space-y-2">
                  {[1,2].map(i => <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />)}
                </div>
              ) : urgentTasks?.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">🎯</div>
                  <p className="text-[11.5px] font-semibold text-muted-foreground">No urgent tasks!</p>
                </div>
              ) : (
                urgentTasks.map((task) => <UrgentRow key={task.id} task={task} />)
              )}
            </div>
          </div>

          {/* Completion Rate Card */}
          <div className="rounded-2xl p-4 flex-1 flex flex-col" style={{
            background: 'linear-gradient(160deg, hsl(222,55%,16%) 0%, hsl(222,47%,22%) 100%)',
            boxShadow: '0 4px 20px rgba(27,43,75,0.3)',
          }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-white/40 text-[9.5px] font-bold tracking-[0.18em] uppercase">Progress</div>
                <div className="text-white font-bold text-[15px] mt-0.5">Completion Rate</div>
              </div>
              {/* SVG Ring */}
              <div className="relative w-[72px] h-[72px]">
                <svg viewBox="0 0 80 80" className="w-[72px] h-[72px] -rotate-90">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
                  <circle
                    cx="40" cy="40" r="34" fill="none"
                    stroke="url(#ringGrad)" strokeWidth="7"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                  />
                  <defs>
                    <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop stopColor="#4ADE80" /><stop offset="1" stopColor="#22D3EE" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-[15px]">{rate}%</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              {[
                { label: 'Completed', value: summary?.completedTotal || 0, color: '#4ADE80', bg: 'rgba(74,222,128,0.1)' },
                { label: 'Missed', value: summary?.missedTotal || 0, color: '#F87171', bg: 'rgba(248,113,113,0.1)' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="text-white/40 text-[9.5px] font-bold uppercase tracking-wider">{s.label}</div>
                  <div className="text-white text-xl font-bold mt-1">{String(s.value).padStart(2, '0')}</div>
                  <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full transition-all" style={{
                      background: s.color,
                      width: `${Math.min(100, (s.value / Math.max(1, (summary?.completedTotal || 0) + (summary?.missedTotal || 0))) * 100)}%`
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Trend micro chart */}
            <div className="mt-3 flex items-center gap-2 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <IconTrendingUp size={13} className="text-green-400 flex-shrink-0" />
              <span className="text-white/40 text-[10.5px] flex-1">Tasks trend this week</span>
              <div className="flex items-end gap-[2px]">
                {[3, 5, 4, 7, 6, 8, 5].map((h, i) => (
                  <div key={i} className="w-[4px] rounded-[2px]" style={{ height: `${h * 2.5}px`, background: i === 5 ? '#4ADE80' : 'rgba(255,255,255,0.15)' }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Focus Timer */}
      <div className="flex-shrink-0 mt-4">
        <FocusTimer />
      </div>
    </div>
  );
}
