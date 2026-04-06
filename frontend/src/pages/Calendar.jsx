import React, { useState } from 'react';
import { Link } from 'wouter';
import { useGetTasks } from '@/api-client-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, getDay, addMonths, subMonths } from 'date-fns';
import { categoryBadgeClass } from '../lib/utils.js';
import FocusTimer from '../components/FocusTimer.jsx';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const { data: tasks } = useGetTasks();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start of month
  const startPad = getDay(monthStart);
  const paddedDays = Array(startPad).fill(null).concat(days);
  const weeks = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7));
  }

  const getTasksForDay = (day) => {
    if (!day || !tasks) return [];
    return tasks.filter((t) => t.deadlineDate && isSameDay(new Date(t.deadlineDate), day));
  };

  const unscheduled = (tasks || []).filter((t) => !t.deadlineDate && !t.completed);

  const ongoingTask = (tasks || []).find((t) => !t.completed);

  return (
    <div className="flex flex-col h-full gap-0">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{format(currentDate, 'MMMM yyyy')}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Focus: {ongoingTask ? ongoingTask.title : 'No active focus'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
          >‹</button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
          >Today</button>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
          >›</button>
          <div className="flex border border-border rounded-lg overflow-hidden ml-2">
            {['Day', 'Week', 'Month'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v.toLowerCase())}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  view === v.toLowerCase() ? 'bg-primary text-white' : 'hover:bg-muted text-foreground'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Unscheduled sidebar */}
        <div className="w-44 flex-shrink-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Unscheduled</div>
          <div className="space-y-2">
            {unscheduled.length === 0 ? (
              <p className="text-xs text-muted-foreground">No unscheduled tasks</p>
            ) : (
              unscheduled.slice(0, 6).map((t) => (
                <Link key={t.id} href={`/tasks/${t.id}`}>
                  <div className="bg-white border border-border rounded-lg px-3 py-2.5 cursor-pointer hover:shadow-sm transition-shadow">
                    <div className="text-xs font-semibold text-foreground truncate">{t.title}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 capitalize">{t.priority} priority</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Calendar grid */}
        <div className="flex-1 min-w-0 bg-white rounded-xl border border-border overflow-hidden flex flex-col">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
              <div key={d} className="py-2 text-center text-[11px] font-semibold text-muted-foreground tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Weeks */}
          <div className="flex-1 overflow-y-auto">
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 border-b border-border last:border-0" style={{ minHeight: '90px' }}>
                {week.map((day, di) => {
                  const dayTasks = day ? getTasksForDay(day) : [];
                  const today = day && isToday(day);
                  return (
                    <div
                      key={di}
                      className={`border-r border-border last:border-r-0 p-1.5 ${day ? '' : 'bg-muted/20'} ${today ? 'bg-indigo-50' : ''}`}
                    >
                      {day && (
                        <>
                          <div className={`text-sm font-semibold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                            today ? 'bg-primary text-white' : 'text-foreground'
                          }`}>
                            {format(day, 'd')}
                          </div>
                          <div className="space-y-0.5">
                            {dayTasks.slice(0, 2).map((t) => (
                              <Link key={t.id} href={`/tasks/${t.id}`}>
                                <div className={`text-[11px] font-medium px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity ${
                                  t.status === 'overdue' ? 'bg-red-100 text-red-700' :
                                  t.priority === 'high' ? 'bg-indigo-100 text-indigo-700' :
                                  'bg-teal-100 text-teal-700'
                                }`}>
                                  {t.title}
                                </div>
                              </Link>
                            ))}
                            {dayTasks.length > 2 && (
                              <div className="text-[11px] text-muted-foreground px-1">+{dayTasks.length - 2}</div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Focus timer */}
      {ongoingTask && (
        <div className="mt-3 flex items-center justify-between bg-white border border-border rounded-xl px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-primary font-bold text-xs uppercase tracking-widest">In Focus</span>
            <span className="text-sm font-bold text-foreground">{ongoingTask.title}</span>
          </div>
          <FocusTimer taskName={ongoingTask.title} />
        </div>
      )}
    </div>
  );
}
