import React from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import {
  useGetDashboardSummary,
  useGetTodayTasks,
  useToggleTaskComplete,
} from '@/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { customFetch } from '@/api-client-react/custom-fetch';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getGreeting, getTimeLeft, cn } from '../lib/utils.js';
import { IconCheck, IconChevronRight, IconPlus, IconClock } from '../components/Icons.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data: summary } = useGetDashboardSummary();
  const { data: todayData, isLoading: todayLoading } = useGetTodayTasks();
  const todayTasks = todayData?.tasks ?? [];
  const isFallback = todayData?.isFallback ?? false;

  const { data: urgentTasks } = useQuery({
    queryKey: ['urgent-tasks'],
    queryFn: () => customFetch('/api/dashboard/urgent')
  });

  const queryClient = useQueryClient();
  const toggleMutation = useToggleTaskComplete({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [['/api/dashboard/today']] });
        queryClient.invalidateQueries({ queryKey: ['urgent-tasks'] });
        queryClient.invalidateQueries({ queryKey: [['/api/dashboard/summary']] });
      }
    }
  });

  const handleToggleComplete = (e, task) => {
    e.stopPropagation();
    toggleMutation.mutate({ 
      id: task.id, 
      data: { completed: !task.completed } 
    });
  };

  const greeting = getGreeting();
  const progress = summary?.completionRate ?? 0;
  const completedTotal = summary?.completedTotal ?? 0;
  const overdueCount = summary?.overdueCount ?? 0;

  return (
    <div className="flex flex-col h-full space-y-8 md:space-y-12 pb-12">
      {/* Header Section */}
      <header className="px-2">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] mb-2 md:mb-3">
          {greeting}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}.
        </h1>
        <p className="text-slate-400 text-sm md:text-base font-medium max-w-xl leading-relaxed">
          {isFallback 
            ? "No tasks for today. Here is what's next:" 
            : `You have ${todayTasks.length} tasks for today. Start with the urgent ones.`}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
        {/* Left Col: Today's Tasks */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {isFallback ? "Upcoming Tasks" : "Today's Tasks"}
            </h3>
            <Link href="/tasks" className="text-xs font-black text-primary uppercase tracking-widest hover:underline">View All Tasks</Link>
          </div>
          
          <div className="space-y-4">
            {todayLoading ? (
              <div className="animate-pulse space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-[2rem] border" />)}
              </div>
            ) : (Array.isArray(todayTasks) && todayTasks.length > 0) ? (
              todayTasks.map(task => (
                <div 
                  key={task.id}
                  onClick={() => navigate(`/tasks/${task.id}`)}
                  className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-slate-100 flex items-center gap-4 md:gap-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer group animate-in fade-in slide-in-from-bottom-4"
                >
                  <div 
                    onClick={(e) => handleToggleComplete(e, task)}
                    className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-300 hover:border-primary hover:text-primary transition-all z-10"
                  >
                    {task.completed ? <IconCheck size={24} strokeWidth={3} className="text-primary" /> : <div className="w-4 h-4 rounded-full bg-slate-50 border border-slate-100" />}
                  </div>
                  <div className="flex-1">
                    <h4 className={cn("text-lg font-bold text-slate-900 group-hover:text-primary transition-colors mb-1.5", task.completed && "line-through text-slate-400")}>
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-3">
                      {task.deadlineDate && (
                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                          <IconClock size={12} />
                          {getTimeLeft(task.deadlineDate)}
                        </span>
                      )}
                      {task.category && (
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest capitalize",
                          task.category === 'work' ? "bg-indigo-50 text-indigo-500" : "bg-emerald-50 text-emerald-500"
                        )}>
                          {task.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-[2rem] bg-slate-100 flex items-center justify-center mb-6 text-slate-300">
                  <IconPlus size={32} />
                </div>
                <h4 className="text-lg font-bold text-slate-600 mb-2">Workspace Clear</h4>
                <p className="text-sm text-slate-400">Time to plan your next tasks.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Urgent & Stats */}
        <div className="lg:col-span-4 space-y-10">
          {/* Urgent Tasks Sidebar */}
          <div className="bg-slate-50/50 rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 border border-slate-200/50">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-1.5 h-6 bg-rose-500 rounded-full" />
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Urgent Tasks</h3>
            </div>
            
            <div className="space-y-4">
              {Array.isArray(urgentTasks) && urgentTasks.length > 0 ? (
                urgentTasks.map(task => {
                  const timeLeft = task.deadlineDate ? getTimeLeft(task.deadlineDate) : null;
                  const isOverdue = timeLeft === 'Overdue';
                  const color = isOverdue ? 'rose' : 'amber';
                  const status = isOverdue
                    ? 'Overdue'
                    : timeLeft
                    ? `Due in ${timeLeft}`
                    : task.priority === 'high' ? 'High priority' : 'Urgent';
                  return (
                    <UrgentItem
                      key={task.id}
                      title={task.title}
                      status={status}
                      color={color}
                      onClick={() => navigate(`/tasks/${task.id}`)}
                    />
                  );
                })
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">No urgent tasks right now.</p>
              )}
            </div>
          </div>

          {/* Weekly Performance Widget */}
          <div className="bg-[#0f172a] rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-300">
            <div className="relative z-10">
              <div className="mb-8">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">Performance</span>
                <h3 className="text-2xl font-black mb-1">Completion Rate</h3>
              </div>
              
              <div className="flex items-center justify-between gap-2 mb-8 md:mb-10">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="space-y-1">
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/30">Completed</span>
                    <div className="text-2xl md:text-3xl font-black">{completedTotal}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/30">Overdue</span>
                    <div className="text-2xl md:text-3xl font-black text-rose-500">{overdueCount}</div>
                  </div>
                </div>
                <div className="relative w-14 h-14 md:w-16 md:h-16 flex-shrink-0">
                  <div className="absolute inset-0 rounded-full border-4 border-white/5" />
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-[10px] md:text-xs">{progress}%</div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/20 blur-[60px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

const UrgentItem = ({ title, status, color, onClick }) => (
  <div onClick={onClick} className="bg-white p-4 rounded-2xl md:rounded-3xl border border-slate-100 flex items-center justify-between group cursor-pointer hover:shadow-lg hover:shadow-slate-200/40 transition-all">
    <div className="flex items-center gap-3">
      <div className={cn("w-1 h-10 rounded-full", color === 'rose' ? "bg-rose-500" : "bg-amber-400")} />
      <div>
        <h4 className="text-xs md:text-sm font-black text-slate-800 mb-0.5">{title}</h4>
        <span className={cn("text-[9px] font-black uppercase tracking-widest", color === 'rose' ? "text-rose-500" : "text-amber-500")}>{status}</span>
      </div>
    </div>
    <IconChevronRight size={14} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
  </div>
);
