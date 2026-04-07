import React, { useState } from 'react';
import { useCreateTask, getGetTasksQueryKey, getGetDashboardSummaryQueryKey, getGetTodayTasksQueryKey, getGetUrgentTasksQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export default function QuickAddModal({ onClose }) {
  const qc = useQueryClient();
  const createTask = useCreateTask();
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: '',
    category: '',
    deadlineDate: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    
    const taskData = {
      title: form.title.trim(),
      ...(form.description && { description: form.description }),
      ...(form.priority && { priority: form.priority }),
      ...(form.category && { category: form.category }),
      ...(form.deadlineDate && { deadlineDate: new Date(form.deadlineDate).toISOString() }),
    };
    
    createTask.mutate({ data: taskData }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetTasksQueryKey() });
        qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        qc.invalidateQueries({ queryKey: getGetTodayTasksQueryKey() });
        qc.invalidateQueries({ queryKey: getGetUrgentTasksQueryKey() });
        toast({ 
          title: 'Task created!', 
          description: `"${form.title}" has been added to your tasks.` 
        });
        onClose();
      },
      onError: (error) => {
        const errorMsg = error?.message || 'Failed to create task';
        toast({ 
          title: 'Error creating task', 
          description: errorMsg,
        });
        console.error('Task creation error:', error);
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">Quick Add Task</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              autoFocus
              type="text"
              placeholder="Task title..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <textarea
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-ring bg-white"
              >
                <option value="">Select...</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-ring bg-white"
              >
                <option value="">Select...</option>
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="study">Study</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Deadline</label>
            <input
              type="datetime-local"
              value={form.deadlineDate}
              onChange={(e) => setForm({ ...form, deadlineDate: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!form.title.trim() || createTask.isPending}
              className="flex-1 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: 'hsl(222, 47%, 20%)' }}
            >
              {createTask.isPending ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
