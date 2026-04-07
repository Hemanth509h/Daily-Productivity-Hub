import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Flame, Plus, Check, ChevronRight, Calendar, Info, Trash2 } from 'lucide-react';
import { customFetch } from '@/api-client-react/custom-fetch';
import { cn } from '../lib/utils.js';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Habits() {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', frequency: '', target: '' });

  const { data: habits, isLoading } = useQuery({
    queryKey: ['habits'],
    queryFn: () => customFetch('/api/habits')
  });

  const createHabit = useMutation({
    mutationFn: (data) => customFetch('/api/habits', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['habits'] });
      setShowAdd(false);
      setNewHabit({ name: '', frequency: '', target: '' });
    }
  });

  const logHabit = useMutation({
    mutationFn: (habitId) => customFetch(`/api/habits/${habitId}/log`, { method: 'POST', body: JSON.stringify({ date: new Date().toISOString(), completedValue: 1 }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits'] })
  });

  if (isLoading) return <div className="p-8">Loading habits...</div>;

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-2">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Consistency King</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Small daily steps lead to massive results.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-lg shadow-slate-200 hover:scale-[1.02] transition-all"
        >
          <Plus size={18} />
          Create New Habit
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(habits || []).map(habit => (
          <HabitCard key={habit.id} habit={habit} onLog={() => logHabit.mutate(habit.id)} />
        ))}
        {!(habits?.length) && <EmptyState onClick={() => setShowAdd(true)} />}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Build a New Habit</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">Habit Name</label>
                <input 
                  type="text" 
                  value={newHabit.name} 
                  onChange={(e) => setNewHabit(h => ({ ...h, name: e.target.value }))}
                  placeholder="e.g., Morning Run"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary outline-none text-sm"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">Frequency</label>
                  <select 
                    value={newHabit.frequency}
                    onChange={(e) => setNewHabit(h => ({ ...h, frequency: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm"
                  >
                    <option value="">Select...</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div className="w-24">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">Target</label>
                  <input 
                    type="number" 
                    value={newHabit.target}
                    onChange={(e) => setNewHabit(h => ({ ...h, target: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-center"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setShowAdd(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-all"
              >
                Nevermind
              </button>
              <button 
                onClick={() => createHabit.mutate(newHabit)}
                disabled={!newHabit.name}
                className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm disabled:opacity-50"
              >
                Start Journey
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

const HabitCard = ({ habit, onLog }) => {
  // Simple streak calculation (mocked for now, usually done by backend)
  const streak = 12; 
  const isCompletedToday = habit.habitLogs?.some(log => new Date(log.date).toDateString() === new Date().toDateString());

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-6">
        <div className="p-3 rounded-2xl bg-slate-50 text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all">
          <Flame size={20} fill={streak > 0 ? "currentColor" : "none"} />
        </div>
        <div className="text-right">
          <div className="text-sm font-black text-slate-900">{streak} 🔥</div>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Day Streak</div>
        </div>
      </div>

      <h3 className="text-lg font-extrabold text-slate-900 mb-1">{habit.name}</h3>
      <p className="text-xs text-slate-400 font-medium mb-6 uppercase tracking-widest">{habit.frequency} · Target {habit.target}x</p>

      {/* Heatmap Preview (Simplified) */}
      <div className="flex gap-1.5 mb-8">
        {[...Array(14)].map((_, i) => (
          <div key={i} className={cn("habit-cell", i > 8 ? "habit-level-1" : "habit-level-0")} />
        ))}
      </div>

      <button 
        onClick={onLog}
        disabled={isCompletedToday}
        className={cn(
          "w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all",
          isCompletedToday 
            ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
            : "bg-slate-900 text-white shadow-lg active:scale-95"
        )}
      >
        {isCompletedToday ? <Check size={18} strokeWidth={3} /> : null}
        {isCompletedToday ? 'Done for Today' : 'Mark as Complete'}
      </button>
    </div>
  );
};

const EmptyState = ({ onClick }) => (
  <div className="bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center flex flex-col items-center justify-center h-full min-h-[300px]">
    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
      <Plus size={24} className="text-slate-300" />
    </div>
    <h4 className="text-slate-900 font-bold">Zero Habits</h4>
    <p className="text-slate-400 text-xs mt-1 max-w-[150px] mx-auto">Greatness is the result of small daily actions.</p>
    <button onClick={onClick} className="mt-6 text-sm font-bold text-primary hover:underline">Start your first journey</button>
  </div>
);
