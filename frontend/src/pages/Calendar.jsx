import React, { useState } from 'react';
import { Link } from 'wouter';
import { useGetTasks } from '@/api-client-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, getDay, addMonths, subMonths } from 'date-fns';
import { IconChevronLeft, IconChevronRight, IconCalendar } from '../components/Icons.jsx';
import { cn } from '../lib/utils.js';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
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
    if (!day || !Array.isArray(tasks)) return [];
    return tasks.filter((t) => t.deadlineDate && isSameDay(new Date(t.deadlineDate), day));
  };

  const unscheduled = (Array.isArray(tasks) ? tasks : []).filter((t) => !t.deadlineDate && !t.completed);

  return (
    <div className="flex flex-col h-full bg-slate-50/20 rounded-t-3xl md:rounded-t-none">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 px-2 mt-4 md:mt-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <IconCalendar size={28} className="text-primary hidden md:block" />
             {format(currentDate, 'MMMM yyyy')}
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-1">Visualize your productivity timeline.</p>
        </div>
        
        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="flex items-center bg-white rounded-2xl border border-slate-200 p-1 shadow-sm">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all"
            >
              <IconChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-all"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all"
            >
              <IconChevronRight size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
        {/* Unscheduled sidebar - Hidden on mobile */}
        <aside className="hidden lg:block w-64 flex-shrink-0 bg-white/50 border border-slate-200/60 rounded-[2.5rem] p-6">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-6 px-2">Unscheduled</div>
          <div className="space-y-3">
            {unscheduled.length === 0 ? (
              <div className="px-2 py-4 text-center">
                 <p className="text-xs text-slate-400 italic">Workspace clear</p>
              </div>
            ) : (
              unscheduled.slice(0, 8).map((t) => (
                <Link key={t.id} href={`/tasks/${t.id}`}>
                  <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3.5 cursor-pointer hover:shadow-xl hover:shadow-slate-200/40 transition-all group">
                    <div className="text-[13px] font-bold text-slate-700 group-hover:text-primary transition-colors truncate">{t.title}</div>
                    <div className="text-[9px] font-black text-slate-300 mt-1 uppercase tracking-widest">{t.priority}</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </aside>

        {/* Calendar grid */}
        <div className="flex-1 min-w-0 bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-slate-50 bg-slate-50/30">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="py-4 text-center text-[10px] font-black text-slate-400 tracking-[0.2em]">
                {d}
              </div>
            ))}
          </div>

          {/* Weeks */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 border-b border-slate-50 last:border-0" style={{ minHeight: '100px' }}>
                {week.map((day, di) => {
                  const dayTasks = day ? getTasksForDay(day) : [];
                  const active = day && isToday(day);
                  return (
                    <div
                      key={di}
                      className={cn(
                        "relative border-r border-slate-50 last:border-r-0 p-2 md:p-3 transition-colors",
                        !day && "bg-slate-50/20",
                        active && "bg-primary/5"
                      )}
                    >
                      {day && (
                        <>
                          <div className={cn(
                            "text-xs md:text-sm font-black mb-2 w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-xl",
                            active ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-slate-400"
                          )}>
                            {format(day, 'd')}
                          </div>
                          <div className="space-y-1">
                            {dayTasks.slice(0, 2).map((t) => (
                              <Link key={t.id} href={`/tasks/${t.id}`}>
                                <div className={cn(
                                  "text-[9px] md:text-[10px] font-bold px-2 py-1 rounded-lg truncate cursor-pointer transition-all hover:scale-105",
                                  t.priority === 'high' ? "bg-rose-50 text-rose-500 border border-rose-100" :
                                  t.priority === 'medium' ? "bg-amber-50 text-amber-500 border border-amber-100" :
                                  "bg-slate-50 text-slate-500 border border-slate-100"
                                )}>
                                  {t.title}
                                </div>
                              </Link>
                            ))}
                            {dayTasks.length > 2 && (
                              <div className="text-[9px] font-black text-slate-300 px-1 mt-1">+{dayTasks.length - 2} MORE</div>
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
    </div>
  );
}
