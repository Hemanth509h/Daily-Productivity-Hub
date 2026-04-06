import React, { useState } from 'react';
import { useLocation } from 'wouter';
import {
  useGetTasks, useGetDashboardSummary, useDeleteTask, useToggleTaskComplete,
  getGetTasksQueryKey, getGetDashboardSummaryQueryKey, getGetTodayTasksQueryKey, getGetUrgentTasksQueryKey,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { formatDeadline, priorityBadgeClass, categoryBadgeClass } from '../lib/utils.js';
import { IconCheck, IconEdit, IconTrash, IconZap } from '../components/Icons.jsx';
import QuickAddModal from '../components/QuickAddModal.jsx';
import FocusTimer from '../components/FocusTimer.jsx';

const PRIORITIES = ['high', 'medium', 'low'];
const CATEGORIES = ['work', 'personal', 'study'];
const CAT_COLORS = { work: '#3B82F6', personal: '#8B5CF6', study: '#10B981' };

export default function Tasks() {
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const [filters, setFilters] = useState({ timeRange: 'all', priority: [], category: [], status: '' });
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const { data: tasks, isLoading } = useGetTasks({
    status: filters.status || undefined,
  });
  const { data: summary } = useGetDashboardSummary();
  const deleteTask = useDeleteTask();
  const toggleComplete = useToggleTaskComplete();

  const togglePriority = (p) => setFilters((f) => ({
    ...f, priority: f.priority.includes(p) ? f.priority.filter((x) => x !== p) : [...f.priority, p],
  }));
  const toggleCategory = (c) => setFilters((f) => ({
    ...f, category: f.category.includes(c) ? f.category.filter((x) => x !== c) : [...f.category, c],
  }));

  const filtered = (tasks || []).filter((t) => {
    if (filters.priority.length && !filters.priority.includes(t.priority)) return false;
    if (filters.category.length && !filters.category.includes(t.category)) return false;
    return true;
  });

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this task?')) return;
    deleteTask.mutate({ id }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetTasksQueryKey() });
        qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      },
    });
  };

  const handleToggle = (task, e) => {
    e.stopPropagation();
    toggleComplete.mutate({ id: task.id, data: { completed: !task.completed } }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetTasksQueryKey() });
        qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        qc.invalidateQueries({ queryKey: getGetTodayTasksQueryKey() });
        qc.invalidateQueries({ queryKey: getGetUrgentTasksQueryKey() });
      },
    });
  };

  const statsData = [
    { label: 'Total Active', value: summary?.totalActive || 0, icon: '📋', color: 'text-foreground', iconBg: 'bg-blue-50' },
    { label: 'In Progress', value: summary?.inProgress || 0, icon: '⚡', color: 'text-blue-600', iconBg: 'bg-blue-50' },
    { label: 'Completed', value: summary?.completedTotal || 0, icon: '✓', color: 'text-green-600', iconBg: 'bg-green-50' },
    { label: 'Overdue', value: summary?.overdueCount || 0, icon: '⚠', color: 'text-red-600', iconBg: 'bg-red-50', red: true },
  ];

  return (
    <div className="flex flex-col h-full gap-0">
      {/* Header */}
      <div className="flex items-start justify-between mb-5 flex-shrink-0">
        <div>
          <h1 className="text-[1.9rem] font-bold text-foreground tracking-tight">Daily Tasks</h1>
          <p className="text-muted-foreground text-[13.5px] mt-1">Manage your focus and track your progress.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowQuickAdd(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, hsl(222,47%,20%) 0%, hsl(222,47%,28%) 100%)', boxShadow: '0 2px 8px rgba(27,43,75,0.25)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            New Task
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3 mb-5 flex-shrink-0">
        {statsData.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 flex items-center gap-3.5"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: `1px solid ${s.red ? '#FEE2E2' : 'hsl(213,25%,90%)'}`, background: s.red ? '#FFF5F5' : 'white' }}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${s.iconBg}`}>
              {s.icon}
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">{s.label}</div>
              <div className={`text-2xl font-bold ${s.color}`}>{String(s.value).padStart(2, '0')}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Filter Sidebar */}
        <div className="w-48 flex-shrink-0 space-y-5">
          {/* Time Range */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2.5">Time Range</div>
            {[{ value: 'today', label: 'Today' }, { value: 'upcoming', label: 'Next 7 Days' }, { value: 'all', label: 'All Tasks' }].map((opt) => (
              <label key={opt.value} className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                  filters.timeRange === opt.value ? 'border-primary' : 'border-muted-foreground/30 group-hover:border-muted-foreground/50'
                }`}>
                  {filters.timeRange === opt.value && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <input type="radio" className="sr-only" checked={filters.timeRange === opt.value}
                  onChange={() => setFilters((f) => ({ ...f, timeRange: opt.value }))} />
                <span className={`text-[13px] ${filters.timeRange === opt.value ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>{opt.label}</span>
              </label>
            ))}
          </div>

          {/* Priority */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2.5">Priority</div>
            <div className="flex flex-wrap gap-1.5">
              {PRIORITIES.map((p) => (
                <button key={p} onClick={() => togglePriority(p)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all capitalize ${
                    filters.priority.includes(p) ? priorityBadgeClass(p) : 'border-border text-muted-foreground hover:bg-muted'
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2.5">Category</div>
            <div className="space-y-2">
              {CATEGORIES.map((c) => (
                <label key={c} className="flex items-center gap-2.5 cursor-pointer group">
                  <div className={`w-4 h-4 rounded-[4px] border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                    filters.category.includes(c) ? 'border-transparent' : 'border-muted-foreground/30 group-hover:border-muted-foreground/50'
                  }`}
                    style={filters.category.includes(c) ? { background: CAT_COLORS[c] } : {}}>
                    {filters.category.includes(c) && <IconCheck size={10} className="text-white" />}
                  </div>
                  <input type="checkbox" className="sr-only" checked={filters.category.includes(c)} onChange={() => toggleCategory(c)} />
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CAT_COLORS[c] }} />
                  <span className={`text-[13px] capitalize ${filters.category.includes(c) ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>{c}</span>
                </label>
              ))}
            </div>
          </div>

          <button onClick={() => setShowQuickAdd(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'hsl(222,47%,20%)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            New Task
          </button>
        </div>

        {/* Task Table */}
        <div className="flex-1 min-w-0 bg-white rounded-2xl overflow-hidden flex flex-col"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid hsl(213,25%,90%)' }}>
          {/* Table header */}
          <div className="grid gap-4 px-5 py-3 border-b" style={{ gridTemplateColumns: '1fr 90px 130px 80px', borderColor: 'hsl(213,25%,92%)', background: 'hsl(213,33%,97%)' }}>
            {['Task Title', 'Priority', 'Deadline', 'Actions'].map((h) => (
              <div key={h} className="text-[10.5px] font-bold uppercase tracking-widest text-muted-foreground/60">{h}</div>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-5 space-y-2">
                {[1,2,3,4].map(i => <div key={i} className="h-14 rounded-xl bg-muted/50 animate-pulse" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center px-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'hsl(213,33%,95%)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(215,20%,65%)" strokeWidth="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                </div>
                <p className="font-semibold text-foreground text-[14px]">No tasks found</p>
                <p className="text-[12px] text-muted-foreground mt-1">Adjust filters or create a new task</p>
              </div>
            ) : (
              filtered.map((task) => {
                const deadline = formatDeadline(task.deadlineDate);
                return (
                  <div
                    key={task.id}
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    className="grid gap-4 px-5 py-3.5 border-b hover:bg-muted/25 cursor-pointer items-center transition-colors task-row"
                    style={{ gridTemplateColumns: '1fr 90px 130px 80px', borderColor: 'hsl(213,25%,93%)' }}
                  >
                    {/* Title */}
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={(e) => handleToggle(task, e)}
                        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                          task.completed ? 'border-green-500 bg-green-500' : 'border-muted-foreground/30 hover:border-primary/50'
                        }`}
                      >
                        {task.completed && <IconCheck size={10} className="text-white" />}
                      </button>
                      <div className="min-w-0">
                        <div className={`text-[13.5px] font-medium truncate ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-[11px] text-muted-foreground/60 truncate mt-0.5">{task.description.slice(0, 45)}</div>
                        )}
                      </div>
                    </div>

                    {/* Priority */}
                    <div>
                      <span className={`inline-block text-[10.5px] font-bold px-2.5 py-1 rounded-full capitalize ${priorityBadgeClass(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>

                    {/* Deadline */}
                    <div>
                      {deadline ? (
                        <div>
                          <div className="text-[11.5px] font-semibold text-muted-foreground">
                            {task.deadlineDate ? new Date(task.deadlineDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                          </div>
                          <div className={`text-[10.5px] font-bold ${deadline.color}`}>{deadline.label}</div>
                        </div>
                      ) : (
                        <span className="text-[11.5px] text-muted-foreground/40">No deadline</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/tasks/${task.id}`); }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 transition-colors text-muted-foreground/50 hover:text-blue-500"
                      >
                        <IconEdit size={14} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(task.id, e)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors text-muted-foreground/50 hover:text-red-500"
                      >
                        <IconTrash size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Focus Session Banner */}
      <div className="mt-4 flex-shrink-0 rounded-2xl p-4 flex items-center gap-5"
        style={{ background: 'linear-gradient(135deg, hsl(222,55%,16%) 0%, hsl(222,47%,22%) 100%)', boxShadow: '0 4px 20px rgba(27,43,75,0.25)' }}>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <IconZap size={18} className="text-amber-400" />
          </div>
          <div>
            <div className="text-white font-bold text-[14px]">Deep Focus Session</div>
            <div className="text-white/50 text-[11.5px]">
              {summary?.totalActive ? `${summary.totalActive} active task${summary.totalActive !== 1 ? 's' : ''} · start a 25-min block` : 'Ready to focus?'}
            </div>
          </div>
        </div>
        <div className="flex-1" />
        <FocusTimer />
      </div>

      {showQuickAdd && <QuickAddModal onClose={() => setShowQuickAdd(false)} />}
    </div>
  );
}
