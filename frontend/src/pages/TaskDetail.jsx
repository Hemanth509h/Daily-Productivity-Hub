import React, { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  useGetTask,
  useUpdateTask,
  useDeleteTask,
  getGetTasksQueryKey,
  getGetTaskQueryKey,
  getGetDashboardSummaryQueryKey,
} from '@/api-client-react';
import { customFetch } from '@/api-client-react/custom-fetch';
import { cn, statusBadgeClass, priorityBadgeClass } from '../lib/utils.js';
import { IconCheck, IconTrash, IconPlus, IconClock, IconCalendar, IconChevronLeft } from '../components/Icons.jsx';
import FocusTimer from '../components/FocusTimer.jsx';

export default function TaskDetail() {
  const [, params] = useRoute('/tasks/:id');
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const id = parseInt(params?.id || '0', 10);

  const { data: task, isLoading } = useGetTask(id);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Manual subtask mutations since generated hooks are missing them
  const addSubtask = useMutation({
    mutationFn: (title) => customFetch(`/api/tasks/${id}/subtasks`, { method: 'POST', body: JSON.stringify({ title }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getGetTaskQueryKey(id) });
      setNewSubtaskTitle('');
    }
  });

  const toggleSubtask = useMutation({
    mutationFn: ({ subtaskId, completed }) => customFetch(`/api/tasks/subtasks/${subtaskId}`, { method: 'PATCH', body: JSON.stringify({ completed }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: getGetTaskQueryKey(id) })
  });

  if (isLoading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  if (!task) return <div className="p-8 text-center">Task not found.</div>;

  const progress = task.subtasks?.length > 0 
    ? Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100) 
    : 0;

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto pb-10">
      {/* Top Navigation */}
      <button 
        onClick={() => navigate('/tasks')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-6 group w-fit"
      >
        <IconChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-bold">Back to Workflow</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border", priorityBadgeClass(task.priority))}>
                    {task.priority}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border bg-slate-100 text-slate-600 border-slate-200">
                    {task.category}
                  </span>
                </div>
                <h1 className={cn("text-2xl font-extrabold text-slate-900", task.completed && "line-through text-slate-400")}>
                  {task.title}
                </h1>
              </div>
              <button 
                onClick={() => updateTask.mutate({ id, data: { completed: !task.completed } }, { onSuccess: () => qc.invalidateQueries({ queryKey: getGetTaskQueryKey(id) }) })}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                  task.completed ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-900 text-white shadow-lg"
                )}
              >
                {task.completed ? <IconCheck size={16} strokeWidth={3} /> : null}
                {task.completed ? 'Completed' : 'Mark Done'}
              </button>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed mb-8">
              {task.description || "No detailed description provided for this focus task."}
            </p>

            {/* Timeline Row */}
            <div className="flex flex-wrap items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2">
                <IconCalendar size={16} className="text-slate-400" />
                <div className="text-xs">
                  <div className="text-slate-400 font-medium">Deadline</div>
                  <div className="text-slate-900 font-bold">{task.deadlineDate ? format(new Date(task.deadlineDate), 'MMM d, yyyy') : 'No deadline'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <IconClock size={16} className="text-slate-400" />
                <div className="text-xs">
                  <div className="text-slate-400 font-medium">Est. Focus</div>
                  <div className="text-slate-900 font-bold">{task.estimatedPomodoros || 1} Pomodoros</div>
                </div>
              </div>
            </div>
          </section>

          {/* Subtasks Section */}
          <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Subtasks</h3>
                <p className="text-slate-400 text-xs font-medium">Break it down, conquer one by one.</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-slate-900">{progress}%</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Progress</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500" 
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="space-y-3 mb-6">
              {task.subtasks?.map(sub => (
                <div key={sub.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                  <button 
                    onClick={() => toggleSubtask.mutate({ subtaskId: sub.id, completed: !sub.completed })}
                    className={cn(
                      "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                      sub.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200 group-hover:border-slate-300"
                    )}
                  >
                    {sub.completed && <IconCheck size={12} strokeWidth={3} />}
                  </button>
                  <span className={cn("text-sm font-medium", sub.completed ? "text-slate-400 line-through" : "text-slate-700")}>
                    {sub.title}
                  </span>
                </div>
              ))}
            </div>

            <div className="relative group">
              <input 
                type="text" 
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && newSubtaskTitle && addSubtask.mutate(newSubtaskTitle)}
                placeholder="Add another step..."
                className="w-full pl-4 pr-12 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm outline-none px-4"
              />
              <button 
                disabled={!newSubtaskTitle}
                onClick={() => addSubtask.mutate(newSubtaskTitle)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-900 text-white disabled:bg-slate-100 disabled:text-slate-300 transition-all"
              >
                <IconPlus size={18} strokeWidth={3} />
              </button>
            </div>
          </section>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <FocusTimer taskName={task.title} />

          <div className="bg-slate-900 rounded-3xl p-6 text-white text-center shadow-xl shadow-slate-200">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Rewards</div>
            <div className="text-3xl font-black mb-1">+25 XP</div>
            <p className="text-slate-400 text-[11px] font-medium leading-relaxed">Complete this task to strengthen your productivity streak.</p>
          </div>

          <button 
            onClick={() => { if(confirm('Delete permanently?')) deleteTask.mutate({ id }, { onSuccess: () => navigate('/tasks') }) }}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-3xl border border-red-100 text-red-500 font-bold text-xs hover:bg-red-50 transition-all opacity-60 hover:opacity-100"
          >
            <IconTrash size={16} />
            Delete This Task
          </button>
        </div>
      </div>
    </div>
  );
}
