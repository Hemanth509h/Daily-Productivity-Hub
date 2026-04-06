import React from 'react';
import { Link } from 'wouter';
import { format } from 'date-fns';
import {
  useGetDashboardSummary,
  useGetTodayTasks,
  useGetUrgentTasks,
  useToggleTaskComplete,
  getGetTodayTasksQueryKey,
  getGetUrgentTasksQueryKey,
  getGetDashboardSummaryQueryKey,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext.jsx';
import { formatTime, getGreeting, categoryBadgeClass, formatDeadline } from '../lib/utils.js';
import FocusTimer from '../components/FocusTimer.jsx';

function TaskItem({ task }) {
  const qc = useQueryClient();
  const toggle = useToggleTaskComplete();

  const handleToggle = () => {
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
      <div className="flex items-center gap-4 px-4 py-3.5 hover:bg-muted/40 cursor-pointer group border-b border-border last:border-0 transition-colors">
        <button
          onClick={(e) => { e.preventDefault(); handleToggle(); }}
          className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${
            task.completed ? 'border-green-500 bg-green-500' : 'border-muted-foreground/40 hover:border-primary'
          }`}
        >
          {task.completed && <span className="text-white text-[10px] leading-none flex items-center justify-center w-full h-full">✓</span>}
        </button>
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-medium truncate ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {task.title}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {task.deadlineDate && (
              <span className="text-xs text-muted-foreground">⏰ {formatTime(task.deadlineDate)}</span>
            )}
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${categoryBadgeClass(task.category)}`}>
              {task.category}
            </span>
          </div>
        </div>
        <span className="text-muted-foreground/30 group-hover:text-muted-foreground text-lg">›</span>
      </div>
    </Link>
  );
}

function UrgentItem({ task }) {
  const deadline = formatDeadline(task.deadlineDate);
  const isOverdue = task.status === 'overdue';

  return (
    <Link href={`/tasks/${task.id}`}>
      <div className={`flex items-center gap-3 p-3.5 hover:bg-muted/30 cursor-pointer rounded-lg border border-border transition-colors`}
        style={{ borderLeft: `3px solid ${isOverdue ? '#ef4444' : '#f59e0b'}` }}>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground truncate">{task.title}</div>
          <div className={`text-xs font-semibold mt-0.5 uppercase tracking-wide ${isOverdue ? 'text-red-600' : 'text-amber-600'}`}>
            {deadline?.label || (isOverdue ? 'Overdue' : 'Due soon')}
          </div>
        </div>
        <span className="text-muted-foreground/40 text-lg">›</span>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: summary, isLoading: sumLoading } = useGetDashboardSummary();
  const { data: todayTasks, isLoading: todayLoading } = useGetTodayTasks();
  const { data: urgentTasks, isLoading: urgentLoading } = useGetUrgentTasks();

  const today = format(new Date(), 'MMM d, yyyy').toUpperCase();
  const greeting = getGreeting();

  return (
    <div className="h-full flex flex-col gap-0">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{greeting}, {user?.name?.split(' ')[0] || 'there'}.</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {summary?.todayCount
              ? `You have ${summary.todayCount} task${summary.todayCount !== 1 ? 's' : ''} to focus on today. Start with the urgent ones.`
              : 'No tasks due today. Great time to plan ahead!'}
          </p>
        </div>
        <div className="text-sm font-bold text-foreground border border-border rounded-lg px-4 py-2 bg-white">
          {today}
        </div>
      </div>

      {/* Main grid */}
      <div className="flex gap-5 flex-1 min-h-0">
        {/* Left – Daily Focus */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-border overflow-hidden h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="font-bold text-foreground">Daily Focus</h2>
              <Link href="/tasks" className="text-sm text-primary font-medium hover:underline">View All Tasks</Link>
            </div>
            <div className="flex-1 overflow-y-auto">
              {todayLoading ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">Loading...</div>
              ) : todayTasks?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center px-6">
                  <div className="text-4xl mb-3">🎯</div>
                  <p className="text-sm font-medium text-foreground">No tasks for today</p>
                  <p className="text-xs text-muted-foreground mt-1">Create a task with today's deadline to see it here</p>
                </div>
              ) : (
                todayTasks?.map((task) => <TaskItem key={task.id} task={task} />)
              )}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-4">
          {/* Urgent Tasks */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <span className="text-red-500 font-bold text-base">!</span>
              <h2 className="font-bold text-foreground text-sm">Urgent Tasks</h2>
            </div>
            <div className="p-3 space-y-2">
              {urgentLoading ? (
                <div className="text-muted-foreground text-sm py-4 text-center">Loading...</div>
              ) : urgentTasks?.length === 0 ? (
                <div className="text-center py-6">
                  <div className="text-3xl mb-2">✅</div>
                  <p className="text-xs text-muted-foreground">No urgent tasks</p>
                </div>
              ) : (
                urgentTasks?.map((task) => <UrgentItem key={task.id} task={task} />)
              )}
            </div>
          </div>

          {/* Completion Rate */}
          <div className="rounded-xl p-4 flex-1" style={{ background: 'hsl(222, 47%, 18%)' }}>
            <div className="text-white/50 text-[10px] font-semibold tracking-widest uppercase mb-1">Weekly Performance</div>
            <div className="flex items-center justify-between">
              <h3 className="text-white text-xl font-bold">Completion Rate</h3>
              <div className="relative w-14 h-14">
                <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3.5" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke="#4ADE80" strokeWidth="3.5"
                    strokeDasharray={`${(summary?.completionRate || 0)} ${100 - (summary?.completionRate || 0)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-white text-[13px] font-bold">
                  {summary?.completionRate || 0}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="text-white/50 text-[10px] font-semibold uppercase tracking-wider">Completed</div>
                <div className="text-white text-2xl font-bold mt-1">{String(summary?.completedTotal || 0).padStart(2, '0')}</div>
                <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-green-400 rounded-full" style={{ width: `${summary?.completionRate || 0}%` }} />
                </div>
              </div>
              <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="text-white/50 text-[10px] font-semibold uppercase tracking-wider">Missed</div>
                <div className="text-white text-2xl font-bold mt-1">{String(summary?.missedTotal || 0).padStart(2, '0')}</div>
                <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-red-400 rounded-full"
                    style={{ width: summary?.completedTotal ? `${Math.round((summary.missedTotal / (summary.completedTotal + summary.missedTotal)) * 100)}%` : '0%' }} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <span className="text-white/40 text-xs">Tasks trend</span>
              <div className="flex items-end gap-0.5">
                {[3, 5, 4, 7, 6, 8, 5].map((h, i) => (
                  <div key={i} className="w-1.5 rounded-sm bg-white/20" style={{ height: `${h * 3}px` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Focus Timer */}
      <FocusTimer />
    </div>
  );
}
