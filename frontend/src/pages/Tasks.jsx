import React, { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetTasks,
  useGetDashboardSummary,
  useDeleteTask,
  useUpdateTask,
  getGetTasksQueryKey,
  getGetDashboardSummaryQueryKey,
} from '@/api-client-react';
import { cn, formatDeadline, getTimeLeft } from '../lib/utils.js';
import { IconCheck, IconEdit, IconTrash, IconLayout, IconList, IconPlus, IconSearch, IconFilter } from '../components/Icons.jsx';
import QuickAddModal from '../components/QuickAddModal.jsx';
import KanbanBoard from '../components/KanbanBoard.jsx';

const PRIORITIES = ['high', 'medium', 'low'];
const CATEGORIES = ['work', 'personal', 'study', 'health', 'finance'];

export default function Tasks() {
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const [viewMode, setViewMode] = useState('list'); 
  const [filters, setFilters] = useState({ priority: [], category: [], search: '' });
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { data: tasks, isLoading } = useGetTasks();
  const { data: summary } = useGetDashboardSummary();
  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();

  const handleTaskMove = (taskId, newStatus) => {
    updateTask.mutate({ id: taskId, data: { status: newStatus, completed: newStatus === 'completed' } }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetTasksQueryKey() });
        qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      }
    });
  };

  const filteredTasks = (Array.isArray(tasks) ? tasks : []).filter(t => {
    if (filters.priority.length && !filters.priority.includes(t.priority)) return false;
    if (filters.category.length && !filters.category.includes(t.category)) return false;
    if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      const aDeadline = a.deadlineDate ? new Date(a.deadlineDate).getTime() : Number.MAX_SAFE_INTEGER;
      const bDeadline = b.deadlineDate ? new Date(b.deadlineDate).getTime() : Number.MAX_SAFE_INTEGER;
      if (aDeadline !== bDeadline) return aDeadline - bDeadline;
      return a.title.localeCompare(b.title);
    });
  }, [filteredTasks]);

  return (
    <div className="flex h-full bg-slate-50/20">
      {/* Left Filter Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 flex-shrink-0 border-r border-slate-200/60 p-8 space-y-10 overflow-y-auto">
        <section className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Time Range</h4>
          <div className="space-y-3">
             <FilterOption label="Today" active={true} />
             <FilterOption label="Next 7 Days" />
             <FilterOption label="Custom Range" />
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Priority</h4>
          <div className="flex flex-wrap gap-2">
            {PRIORITIES.map(p => (
              <button 
                key={p}
                onClick={() => setFilters(f => ({ ...f, priority: f.priority.includes(p) ? f.priority.filter(x => x !== p) : [...f.priority, p] }))}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[11px] font-extrabold border transition-all capitalize",
                  filters.priority.includes(p) ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-500"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</h4>
          <div className="space-y-3">
            {CATEGORIES.map(c => (
              <label key={c} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="hidden"
                  checked={filters.category.includes(c)}
                  onChange={() => setFilters(f => ({ ...f, category: f.category.includes(c) ? f.category.filter(x => x !== c) : [...f.category, c] }))}
                />
                <div className={cn(
                  "w-4 h-4 rounded border-2 transition-all flex items-center justify-center",
                  filters.category.includes(c) ? "bg-primary border-primary" : "border-slate-200 group-hover:border-slate-300"
                )}>
                  {filters.category.includes(c) && <IconCheck size={10} className="text-white" strokeWidth={4} />}
                </div>
                <div className={cn("w-2 h-2 rounded-full", c === 'work' ? 'bg-primary' : c === 'personal' ? 'bg-emerald-400' : 'bg-amber-400')} />
                <span className="text-[13px] font-medium text-slate-600 capitalize">{c}</span>
              </label>
            ))}
          </div>
        </section>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8 md:space-y-10">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">Daily Tasks</h1>
            <p className="text-slate-400 text-sm font-medium">Manage your daily tasks and track your progress.</p>
          </div>
          <div className="flex items-center gap-3">
             <button 
               onClick={() => setShowFilters(true)}
               className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black text-slate-600 bg-white border border-slate-200 uppercase tracking-widest hover:bg-slate-50"
             >
                <IconFilter size={14} />
                Filters
             </button>
             <button
                onClick={() => setShowQuickAdd(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black text-white bg-slate-900 shadow-xl shadow-slate-200 uppercase tracking-widest hover:-translate-y-0.5 transition-all"
             >
                <IconPlus size={14} strokeWidth={3} />
                Quick Add
             </button>
          </div>
        </header>

        {/* Stats Row */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <StatBadge label="Total Active" value={summary?.totalActive ?? 0} />
          <StatBadge label="In Progress" value={summary?.inProgress ?? 0} />
          <StatBadge label="Completed" value={summary?.completedToday ?? 0} />
          <StatBadge label="Overdue" value={summary?.overdueCount ?? 0} variant="rose" />
        </section>

        {/* Task List Header */}
        <div className="hidden md:flex items-center px-6 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-300">
           <div className="flex-1 pl-12">Task Title</div>
           <div className="w-24 text-center">Priority</div>
           <div className="w-32 text-center">Deadline</div>
           <div className="w-24 text-right">Actions</div>
        </div>

        {/* Task List Content */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto sidebar-scroll pr-2  md:min-h-[500px] ">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-[2rem] border border-slate-100" />)}
            </div>
          ) : sortedTasks.length === 0 ? (
            <EmptyState onClick={() => setShowQuickAdd(true)} />
          ) : (
            sortedTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onDelete={(id) => deleteTask.mutate({ id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getGetTasksQueryKey() }) })}
                onToggle={(id, status) => handleTaskMove(id, status)}
                onClick={() => navigate(`/tasks/${task.id}`)}
              />
            ))
          )}
        </div>


      </main>

      {showQuickAdd && <QuickAddModal onClose={() => setShowQuickAdd(false)} />}

      {/* Mobile Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 text-slate-400 hover:text-slate-900">
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <section className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Priority</h4>
                <div className="flex flex-wrap gap-2">
                  {PRIORITIES.map(p => (
                    <button 
                      key={p}
                      onClick={() => setFilters(f => ({ ...f, priority: f.priority.includes(p) ? f.priority.filter(x => x !== p) : [...f.priority, p] }))}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[11px] font-extrabold border transition-all capitalize",
                        filters.priority.includes(p) ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-500"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</h4>
                <div className="space-y-3">
                  {CATEGORIES.map(c => (
                    <label key={c} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={filters.category.includes(c)}
                        onChange={() => setFilters(f => ({ ...f, category: f.category.includes(c) ? f.category.filter(x => x !== c) : [...f.category, c] }))}
                      />
                      <div className={cn(
                        "w-4 h-4 rounded border-2 transition-all flex items-center justify-center",
                        filters.category.includes(c) ? "bg-primary border-primary" : "border-slate-200 group-hover:border-slate-300"
                      )}>
                        {filters.category.includes(c) && <IconCheck size={10} className="text-white" strokeWidth={4} />}
                      </div>
                      <div className={cn("w-2 h-2 rounded-full", c === 'work' ? 'bg-primary' : c === 'personal' ? 'bg-emerald-400' : 'bg-amber-400')} />
                      <span className="text-[13px] font-medium text-slate-600 capitalize">{c}</span>
                    </label>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const FilterOption = ({ label, active = false }) => (
  <div className="flex items-center gap-3 cursor-pointer group">
    <div className={cn(
      "w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center",
      active ? "border-primary" : "border-slate-200 group-hover:border-slate-300"
    )}>
      {active && <div className="w-2 h-2 rounded-full bg-primary" />}
    </div>
    <span className={cn("text-[13px] font-medium transition-colors", active ? "text-slate-900" : "text-slate-500 group-hover:text-slate-700")}>
      {label}
    </span>
  </div>
);

const StatBadge = ({ label, value, increase, variant = 'default' }) => (
  <div className={cn(
    "p-5 md:p-8 rounded-3xl md:rounded-[2rem] border min-w-0 transition-all hover:scale-[1.02]",
    variant === 'rose' ? "bg-rose-50 border-rose-100" : "bg-white border-slate-100 shadow-sm"
  )}>
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{label}</span>
    <div className="flex items-baseline gap-2 md:gap-3">
      <div className={cn("text-2xl md:text-4xl font-black", variant === 'rose' ? "text-rose-500" : "text-slate-900")}>
        {value}
      </div>
      {increase && (
        <span className="bg-emerald-100 text-emerald-700 text-[8px] md:text-[9px] font-black px-1.5 md:px-2 py-0.5 rounded-full uppercase tracking-tighter">
          {increase}
        </span>
      )}
    </div>
  </div>
);

const TaskCard = ({ task, onDelete, onToggle, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-slate-100 flex flex-col md:flex-row md:items-center gap-4 md:gap-6 hover:shadow-xl hover:shadow-slate-200/40 transition-all cursor-pointer group animate-in slide-in-from-bottom-2"
  >
    <div className="flex items-center gap-4 md:gap-6 flex-1">
      <button 
        onClick={(e) => { e.stopPropagation(); onToggle(task.id, task.completed ? 'pending' : 'completed'); }}
        className={cn(
          "w-8 h-8 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
          task.completed ? "bg-emerald-50 border-emerald-50 text-white" : "border-slate-100 group-hover:border-primary/30"
        )}
      >
        {task.completed && <IconCheck size={16} strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        <h4 className={cn("text-base md:text-lg font-bold truncate group-hover:text-primary transition-colors", task.completed ? "text-slate-300 line-through" : "text-slate-800")}>
          {task.title}
        </h4>
        <div className="flex flex-wrap items-center gap-3 mt-1.5">
          {task.category && <span className="text-[11px] font-bold text-slate-400 capitalize">{task.category}</span>}
          {!task.completed && task.deadlineDate && (
            <span className="text-[10px] font-black uppercase tracking-[0.05em] text-rose-500">
              {getTimeLeft(task.deadlineDate)}
            </span>
          )}
        </div>
      </div>
    </div>

    <div className="flex items-center justify-between md:justify-end gap-4">
      <div className="flex items-center gap-4">
        <div className="hidden md:block w-24 text-center">
           {task.priority ? (
             <span className={cn(
               "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
               task.priority === 'high' ? "bg-rose-50 text-rose-500" : task.priority === 'medium' ? "bg-amber-50 text-amber-500" : "bg-slate-100 text-slate-400"
             )}>
               {task.priority}
             </span>
           ) : <span className="text-[11px] text-slate-300">—</span>}
        </div>

        <div className="hidden md:block w-32 text-center">
           <div className={cn("text-[11px] font-bold", task.completed ? "text-slate-300" : task.deadlineDate ? "text-rose-500" : "text-slate-300")}>
             {task.completed ? 'Completed' : task.deadlineDate ? formatDeadline(task.deadlineDate) : '—'}
           </div>
           {!task.completed && task.deadlineDate && (
             <div className="text-[9px] font-black uppercase tracking-[0.05em] text-rose-300 mt-0.5">{getTimeLeft(task.deadlineDate)}</div>
           )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 md:opacity-100 md:group-hover:opacity-100 transition-opacity">
        <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
          <IconEdit size={18} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
          className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
        >
          <IconTrash size={18} />
        </button>
      </div>
    </div>

    {/* Mobile details */}
    <div className="md:hidden flex flex-col gap-2 text-xs text-slate-400">
      <div className="flex items-center gap-4">
        {task.priority && (
          <span className={cn(
            "px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
            task.priority === 'high' ? "bg-rose-50 text-rose-500" : task.priority === 'medium' ? "bg-amber-50 text-amber-500" : "bg-slate-100 text-slate-400"
          )}>
            {task.priority}
          </span>
        )}
        {task.deadlineDate && (
          <div className={cn("font-bold", task.completed ? "text-slate-300" : "text-rose-500")}>
            {task.completed ? 'Completed' : formatDeadline(task.deadlineDate)}
          </div>
        )}
      </div>
      {!task.completed && task.deadlineDate && (
        <div className="text-[10px] uppercase tracking-[0.05em] text-rose-300 font-black">
          {getTimeLeft(task.deadlineDate)}
        </div>
      )}
      <div className="flex gap-2">
        <button className="p-1 text-slate-300 hover:text-slate-900 transition-colors">
          <IconEdit size={16} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
          className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
        >
          <IconTrash size={16} />
        </button>
      </div>
    </div>
  </div>
);

const EmptyState = ({ onClick }) => (
  <div className="flex flex-col items-center justify-center p-20 text-center bg-white/50 border-2 border-dashed border-slate-200 rounded-[3rem]">
    <div className="w-16 h-16 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 text-slate-300">
      <IconPlus size={32} />
    </div>
    <h3 className="text-lg font-bold text-slate-600 mb-2">No Active Tasks</h3>
    <p className="text-sm text-slate-400 mb-8 max-w-[240px]">Plan your day by adding your first productivity block.</p>
    <button 
      onClick={onClick}
      className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest"
    >
      Add Task
    </button>
  </div>
);
