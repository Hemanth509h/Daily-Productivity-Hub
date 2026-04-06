import React, { useState } from 'react';
import { Link } from 'wouter';
import {
  useGetTasks,
  useGetDashboardSummary,
  useDeleteTask,
  useToggleTaskComplete,
  getGetTasksQueryKey,
  getGetDashboardSummaryQueryKey,
  getGetTodayTasksQueryKey,
  getGetUrgentTasksQueryKey,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { formatDeadline, priorityBadgeClass, categoryBadgeClass } from '../lib/utils.js';
import QuickAddModal from '../components/QuickAddModal.jsx';
import FocusTimer from '../components/FocusTimer.jsx';

const PRIORITIES = ['high', 'medium', 'low'];
const CATEGORIES = ['work', 'personal', 'study'];

export default function Tasks() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState({ timeRange: 'all', priority: [], category: [], status: '' });
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const { data: tasks, isLoading } = useGetTasks({
    status: filters.status || undefined,
    timeRange: filters.timeRange === 'all' ? undefined : filters.timeRange,
  });
  const { data: summary } = useGetDashboardSummary();
  const deleteTask = useDeleteTask();
  const toggleComplete = useToggleTaskComplete();

  const togglePriority = (p) => setFilters((f) => ({
    ...f,
    priority: f.priority.includes(p) ? f.priority.filter((x) => x !== p) : [...f.priority, p],
  }));
  const toggleCategory = (c) => setFilters((f) => ({
    ...f,
    category: f.category.includes(c) ? f.category.filter((x) => x !== c) : [...f.category, c],
  }));

  const filtered = (tasks || []).filter((t) => {
    if (filters.priority.length && !filters.priority.includes(t.priority)) return false;
    if (filters.category.length && !filters.category.includes(t.category)) return false;
    return true;
  });

  const handleDelete = (id, e) => {
    e.preventDefault();
    if (!confirm('Delete this task?')) return;
    deleteTask.mutate({ id }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetTasksQueryKey() });
        qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      },
    });
  };

  const handleToggle = (task, e) => {
    e.preventDefault();
    toggleComplete.mutate({ id: task.id, data: { completed: !task.completed } }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetTasksQueryKey() });
        qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        qc.invalidateQueries({ queryKey: getGetTodayTasksQueryKey() });
        qc.invalidateQueries({ queryKey: getGetUrgentTasksQueryKey() });
      },
    });
  };

  return (
    <div className="flex flex-col h-full gap-0">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Daily Tasks</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage your focus and track your progress.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-white text-sm font-medium hover:bg-muted transition-colors">
            ≡ Filters
          </button>
          <button
            onClick={() => setShowQuickAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'hsl(222, 47%, 20%)' }}
          >
            ⚡ Quick Add
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Active', value: summary?.totalActive || 0, sub: `+${summary?.todayCount || 0} today`, color: '' },
          { label: 'In Progress', value: summary?.inProgress || 0, color: 'text-blue-600' },
          { label: 'Completed', value: summary?.completedTotal || 0, color: 'text-green-600' },
          { label: 'Overdue', value: summary?.overdueCount || 0, color: 'text-red-600', red: true },
        ].map((s) => (
          <div key={s.label} className={`bg-white rounded-xl border p-4 ${s.red ? 'border-red-200 bg-red-50' : 'border-border'}`}>
            <div className={`text-[11px] font-semibold uppercase tracking-wider mb-1 ${s.red ? 'text-red-600' : 'text-muted-foreground'}`}>{s.label}</div>
            <div className={`text-3xl font-bold ${s.color || (s.red ? 'text-red-600' : 'text-foreground')}`}>
              {String(s.value).padStart(2, '0')}
            </div>
            {s.sub && (
              <span className="inline-block text-[11px] text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full font-semibold mt-1">{s.sub}</span>
            )}
          </div>
        ))}
      </div>

      {/* Main */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Filter Sidebar */}
        <div className="w-48 flex-shrink-0 space-y-5">
          {/* Time Range */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Time Range</div>
            {[
              { value: 'today', label: 'Today' },
              { value: 'upcoming', label: 'Next 7 Days' },
              { value: 'all', label: 'All Tasks' },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                  filters.timeRange === opt.value ? 'border-primary' : 'border-muted-foreground/40'
                }`}>
                  {filters.timeRange === opt.value && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <input
                  type="radio"
                  className="sr-only"
                  checked={filters.timeRange === opt.value}
                  onChange={() => setFilters((f) => ({ ...f, timeRange: opt.value }))}
                />
                <span className={`text-sm ${filters.timeRange === opt.value ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {opt.label}
                </span>
              </label>
            ))}
          </div>

          {/* Priority */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Priority</div>
            <div className="flex flex-wrap gap-1.5">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  onClick={() => togglePriority(p)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all capitalize ${
                    filters.priority.includes(p) ? priorityBadgeClass(p) : 'border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Category</div>
            <div className="space-y-1.5">
              {CATEGORIES.map((c) => (
                <label key={c} className="flex items-center gap-2.5 cursor-pointer">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                    filters.category.includes(c) ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                  }`}>
                    {filters.category.includes(c) && <span className="text-white text-[10px]">✓</span>}
                  </div>
                  <input type="checkbox" className="sr-only"
                    checked={filters.category.includes(c)}
                    onChange={() => toggleCategory(c)} />
                  <div className={`w-2 h-2 rounded-full ${c === 'work' ? 'bg-blue-500' : c === 'personal' ? 'bg-violet-500' : 'bg-green-500'}`} />
                  <span className="text-sm capitalize text-muted-foreground">{c}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowQuickAdd(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'hsl(222, 47%, 20%)' }}
          >
            + New Task
          </button>
        </div>

        {/* Task List */}
        <div className="flex-1 min-w-0 bg-white rounded-xl border border-border overflow-hidden flex flex-col">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_100px_130px_90px] gap-4 px-4 py-2.5 border-b border-border bg-muted/40">
            {['Task Title', 'Priority', 'Deadline', 'Actions'].map((h) => (
              <div key={h} className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{h}</div>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">Loading tasks...</div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center px-6">
                <div className="text-5xl mb-3">📋</div>
                <p className="font-medium text-foreground">No tasks found</p>
                <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or add a new task</p>
              </div>
            ) : (
              filtered.map((task) => {
                const deadline = formatDeadline(task.deadlineDate);
                return (
                  <Link href={`/tasks/${task.id}`} key={task.id}>
                    <div className="grid grid-cols-[1fr_100px_130px_90px] gap-4 px-4 py-3 border-b border-border task-row cursor-pointer items-center">
                      {/* Title */}
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={(e) => handleToggle(task, e)}
                          className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                            task.completed ? 'border-green-500 bg-green-500' : 'border-muted-foreground/40 hover:border-primary'
                          }`}
                        >
                          {task.completed && <span className="text-white text-[10px]">✓</span>}
                        </button>
                        <div className="min-w-0">
                          <div className={`text-sm font-medium truncate ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {task.title}
                          </div>
                          <div className="text-xs text-muted-foreground capitalize">{task.category} • {task.description?.slice(0, 30) || ''}</div>
                        </div>
                      </div>

                      {/* Priority */}
                      <div>
                        <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full capitalize ${priorityBadgeClass(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>

                      {/* Deadline */}
                      <div>
                        {deadline ? (
                          <div>
                            <div className={`text-xs font-semibold ${deadline.color}`}>
                              {task.deadlineDate ? new Date(task.deadlineDate).toLocaleDateString() : '—'}
                            </div>
                            <div className={`text-[11px] font-semibold ${deadline.color}`}>{deadline.label}</div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No deadline</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <Link href={`/tasks/${task.id}`}>
                          <button onClick={(e) => e.stopPropagation()} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground text-sm">✏️</button>
                        </Link>
                        <button
                          onClick={(e) => handleDelete(task.id, e)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-500 text-sm"
                        >🗑️</button>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Focus Session Banner */}
      <div className="mt-4 rounded-xl p-4" style={{ background: 'hsl(222, 47%, 18%)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-lg">Deep Focus Session</h3>
            <p className="text-white/60 text-sm mt-0.5">
              {summary?.totalActive
                ? `You have ${summary.totalActive} active task${summary.totalActive !== 1 ? 's' : ''}. Ready to start a 25-minute focus block?`
                : 'Ready to start a focused work session?'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/20 text-5xl font-bold font-mono">25:00</span>
            <FocusTimer taskName="Focus Session" />
          </div>
        </div>
      </div>

      {showQuickAdd && <QuickAddModal onClose={() => setShowQuickAdd(false)} />}
    </div>
  );
}
