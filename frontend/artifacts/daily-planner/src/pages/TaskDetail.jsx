import React, { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import {
  useGetTask,
  useUpdateTask,
  useDeleteTask,
  getGetTasksQueryKey,
  getGetTaskQueryKey,
  getGetDashboardSummaryQueryKey,
  getGetTodayTasksQueryKey,
  getGetUrgentTasksQueryKey,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { statusBadgeClass } from '../lib/utils.js';
import FocusTimer from '../components/FocusTimer.jsx';

function toLocalDatetime(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

export default function TaskDetail() {
  const [, params] = useRoute('/tasks/:id');
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const id = parseInt(params?.id || '0', 10);

  const { data: task, isLoading } = useGetTask(id, { query: { enabled: !!id } });
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [form, setForm] = useState({
    title: '',
    description: '',
    startDate: '',
    deadlineDate: '',
    reminderTime: '',
    priority: 'medium',
    category: 'work',
    completed: false,
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description || '',
        startDate: toLocalDatetime(task.startDate),
        deadlineDate: toLocalDatetime(task.deadlineDate),
        reminderTime: toLocalDatetime(task.reminderTime),
        priority: task.priority,
        category: task.category,
        completed: task.completed,
      });
    }
  }, [task]);

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: getGetTasksQueryKey() });
    qc.invalidateQueries({ queryKey: getGetTaskQueryKey(id) });
    qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
    qc.invalidateQueries({ queryKey: getGetTodayTasksQueryKey() });
    qc.invalidateQueries({ queryKey: getGetUrgentTasksQueryKey() });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    updateTask.mutate({
      id,
      data: {
        title: form.title,
        description: form.description || null,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
        deadlineDate: form.deadlineDate ? new Date(form.deadlineDate).toISOString() : null,
        reminderTime: form.reminderTime ? new Date(form.reminderTime).toISOString() : null,
        priority: form.priority,
        category: form.category,
        completed: form.completed,
      },
    }, {
      onSuccess: () => { setSaved(true); setSaving(false); invalidateAll(); setTimeout(() => setSaved(false), 2000); },
      onError: () => setSaving(false),
    });
  };

  const handleToggleComplete = () => {
    const newCompleted = !form.completed;
    setForm((f) => ({ ...f, completed: newCompleted }));
    updateTask.mutate({ id, data: { completed: newCompleted } }, {
      onSuccess: () => invalidateAll(),
    });
  };

  const handleDelete = () => {
    if (!confirm('Delete this task?')) return;
    deleteTask.mutate({ id }, {
      onSuccess: () => {
        invalidateAll();
        navigate('/tasks');
      },
    });
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!task) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="text-5xl">🔍</div>
      <p className="text-foreground font-medium">Task not found</p>
      <button onClick={() => navigate('/tasks')} className="text-primary text-sm hover:underline">← Back to tasks</button>
    </div>
  );

  const REMINDER_OPTIONS = ['None', '15 minutes before', '30 minutes before', '1 hour before', '1 day before'];

  return (
    <div className="flex flex-col h-full gap-0">
      {/* Status bar */}
      <div className="flex items-center gap-3 mb-4">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${statusBadgeClass(task.status)}`}>
          Status: {task.status}
        </span>
        <span className="text-xs text-muted-foreground">
          Last updated {task.updatedAt ? format(new Date(task.updatedAt), 'MMM d • HH:mm') : '—'}
        </span>
      </div>

      {/* Title row */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-foreground">Task Details</h1>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <span className="text-sm font-medium text-foreground">Mark as Completed</span>
          <button
            onClick={handleToggleComplete}
            className={`relative w-11 h-6 rounded-full transition-colors ${form.completed ? 'bg-primary' : 'bg-muted-foreground/30'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.completed ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
          </button>
        </label>
      </div>

      <form onSubmit={handleSave} className="flex gap-5 flex-1 min-h-0">
        {/* Left – Content */}
        <div className="flex-1 min-w-0 bg-white rounded-xl border border-border p-5 flex flex-col gap-4 overflow-y-auto">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">Task Headline</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2.5 text-lg font-semibold bg-muted/30 rounded-lg border border-border outline-none focus:ring-2 focus:ring-ring"
              placeholder="Task title..."
            />
          </div>

          <div className="flex-1">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">Deep Description</label>
            {/* Toolbar */}
            <div className="flex items-center gap-1 mb-1 p-1.5 border border-border rounded-t-lg bg-muted/30">
              {['B', 'I', '• List', '🔗', '🖼'].map((t) => (
                <button key={t} type="button" className="px-2 py-1 text-xs font-medium hover:bg-muted rounded transition-colors text-foreground">
                  {t}
                </button>
              ))}
            </div>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={8}
              placeholder="Add a detailed description..."
              className="w-full px-3 py-2.5 text-sm border border-t-0 border-border rounded-b-lg outline-none focus:ring-2 focus:ring-ring resize-none bg-white"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <button type="button" onClick={() => navigate('/tasks')} className="px-5 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
              Cancel Changes
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
              >
                Delete
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
                style={{ background: 'hsl(222, 47%, 20%)' }}
              >
                {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save & Finalize'}
              </button>
            </div>
          </div>
        </div>

        {/* Right – Metadata */}
        <div className="w-64 flex-shrink-0 space-y-3">
          {/* Timeline */}
          <div className="bg-white rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-primary text-sm">⏰</span>
              <span className="font-bold text-sm text-foreground">Timeline</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Start Date</label>
                <input
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                  className="w-full px-2.5 py-1.5 text-sm border border-border rounded-lg outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Deadline</label>
                <input
                  type="datetime-local"
                  value={form.deadlineDate}
                  onChange={(e) => setForm((f) => ({ ...f, deadlineDate: e.target.value }))}
                  className={`w-full px-2.5 py-1.5 text-sm border rounded-lg outline-none focus:ring-1 focus:ring-ring ${
                    task.status === 'overdue' ? 'border-red-300 bg-red-50 text-red-700' : 'border-border'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Priority */}
          <div className="bg-white rounded-xl border border-border p-4">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Priority Level</label>
            <div className="flex gap-1.5">
              {['low', 'med', 'high'].map((p) => {
                const val = p === 'med' ? 'medium' : p;
                const active = form.priority === val;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, priority: val }))}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border transition-all ${
                      active ? 'border-foreground bg-foreground text-white' : 'border-border text-muted-foreground hover:border-foreground/30'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category */}
          <div className="bg-white rounded-xl border border-border p-4">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Category Tag</label>
            <div className="flex flex-wrap gap-1.5">
              {['work', 'personal', 'study'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, category: c }))}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all capitalize ${
                    form.category === c
                      ? c === 'work' ? 'bg-blue-600 text-white border-blue-600'
                        : c === 'personal' ? 'bg-violet-600 text-white border-violet-600'
                        : 'bg-green-600 text-white border-green-600'
                      : 'border-border text-muted-foreground hover:border-foreground/30'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Reminders */}
          <div className="bg-white rounded-xl border border-border p-4">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Smart Notifications</label>
            <select
              className="w-full px-2.5 py-1.5 text-sm border border-border rounded-lg outline-none focus:ring-1 focus:ring-ring bg-white"
              defaultValue="1 hour before"
            >
              {REMINDER_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </form>

      {/* Timer */}
      <FocusTimer taskName={task.title} />
    </div>
  );
}
