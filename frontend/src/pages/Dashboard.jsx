import React from 'react';
import { Link, useLocation } from 'wouter';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import {
  useGetDashboardSummary,
  useGetTodayTasks,
} from '@/api-client-react';
import { customFetch } from '@/api-client-react/custom-fetch';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getGreeting, cn } from '../lib/utils.js';
import { IconCheck, IconChevronRight, IconAward, IconZap, IconTrendingUp, IconPlus, IconClock } from '../components/Icons.jsx';
import FocusTimer from '../components/FocusTimer.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary();
  const { data: todayTasks, isLoading: todayLoading } = useGetTodayTasks();
  
  // Custom fetch for habits summary
  const { data: habits } = useQuery({
    queryKey: ['habits'],
    queryFn: () => customFetch('/api/habits')
  });

  const greeting = getGreeting();
  const progress = summary?.completionRate || 84; // Fixed for demo if null

  return (
    <div className="flex flex-col h-full space-y-12 pb-24">
      {/* Header Section */}
      <header className="px-2">
        <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-[1.1] mb-3">
          {greeting}, <span className="text-primary">{user?.name?.split(' ')[0] || 'Alex'}.</span>
        </h1>
        <p className="text-slate-400 text-base font-medium max-w-xl leading-relaxed">
          You have {todayTasks?.length ?? 0} tasks to focus on today. Start with the urgent ones.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Col: Daily Focus */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Daily Focus</h3>
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
                  className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center gap-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer group animate-in fade-in slide-in-from-bottom-4"
                >
                  <div className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-300 group-hover:border-primary group-hover:text-primary transition-all">
                    {task.completed ? <IconCheck size={24} strokeWidth={3} /> : <div className="w-4 h-4 rounded-full bg-slate-50 border border-slate-100" />}
                  </div>
                  <div className="flex-1">
                    <h4 className={cn("text-lg font-bold text-slate-900 group-hover:text-primary transition-colors mb-1.5", task.completed && "line-through text-slate-400")}>
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                        <IconClock size={12} />
                        {task.deadlineTime || '10:30 AM'}
                      </span>
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                        task.category === 'Work' ? "bg-indigo-50 text-indigo-500" : "bg-emerald-50 text-emerald-500"
                      )}>
                        {task.category || 'PROJECT A'}
                      </span>
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    {[1, 2].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm" />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-[2rem] bg-slate-100 flex items-center justify-center mb-6 text-slate-300">
                  <IconPlus size={32} />
                </div>
                <h4 className="text-lg font-bold text-slate-600 mb-2">Workspace Clear</h4>
                <p className="text-sm text-slate-400">Time to plan your next successful focus block.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Urgent & Stats */}
        <div className="lg:col-span-4 space-y-10">
          {/* Urgent Tasks Sidebar */}
          <div className="bg-slate-50/50 rounded-[2.5rem] p-8 border border-slate-200/50">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-1.5 h-6 bg-rose-500 rounded-full" />
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Urgent Tasks</h3>
            </div>
            
            <div className="space-y-4">
              <UrgentItem title="Client Invoice #882" status="Overdue by 1d" color="rose" />
              <UrgentItem title="Prepare Weekly Sync" status="Due in 2h" color="amber" />
            </div>
          </div>

          {/* Weekly Performance Widget */}
          <div className="bg-[#0f172a] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-300">
            <div className="relative z-10">
              <div className="mb-8">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">Weekly Performance</span>
                <h3 className="text-2xl font-black mb-1">Completion Rate</h3>
              </div>
              
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-6">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Completed</span>
                    <div className="text-3xl font-black">32</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Missed</span>
                    <div className="text-3xl font-black text-rose-500">04</div>
                  </div>
                </div>
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-white/5" />
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-xs">{progress}%</div>
                </div>
              </div>

              <div className="flex items-end gap-1.5 h-16 pt-4">
                {[4, 7, 5, 8, 6, 9, 7].map((h, i) => (
                  <div key={i} className="flex-1 bg-white/10 rounded-t-sm group relative" style={{ height: `${h * 10}%` }}>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity rounded-t-sm" />
                  </div>
                ))}
              </div>
              <span className="mt-4 block text-[9px] font-black uppercase tracking-widest text-white/20">Tasks trend</span>
            </div>
            {/* Bg glow */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/20 blur-[60px]" />
          </div>
        </div>
      </div>

      {/* Floating Focus Session Bar */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-6">
        <div className="bg-white/90 backdrop-blur-2xl border border-slate-200 p-3 rounded-[2.5rem] shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-4 pl-6">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ripple shadow-[0_0_12px_rgba(52,211,153,0.5)]" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Focused Session</span>
            <div className="w-px h-4 bg-slate-200 mx-2" />
            <div className="text-2xl font-black text-slate-900 mono">24:59</div>
          </div>
          
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2">Proposal Design</span>
             <button className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all">
                <IconPause size={20} fill="currentColor" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const UrgentItem = ({ title, status, color }) => (
  <div className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center justify-between group cursor-pointer hover:shadow-lg hover:shadow-slate-200/40 transition-all">
    <div className="flex items-center gap-4">
      <div className={cn("w-1.5 h-12 rounded-full", color === 'rose' ? "bg-rose-500" : "bg-amber-400")} />
      <div>
        <h4 className="text-sm font-black text-slate-800 mb-1">{title}</h4>
        <span className={cn("text-[10px] font-black uppercase tracking-widest", color === 'rose' ? "text-rose-500" : "text-amber-500")}>{status}</span>
      </div>
    </div>
    <IconChevronRight size={16} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
  </div>
);

// Added IconPause for the redesign
const IconPause = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
  </svg>
);
