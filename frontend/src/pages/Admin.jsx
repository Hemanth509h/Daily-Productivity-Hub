import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Link } from 'wouter';
import { useGetTasks } from '@/api-client-react';

export default function Admin() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const { data: allTasks = [] } = useGetTasks();

  // Check if user is admin (you can add role checking logic here)
  const isAdmin = user?.email?.includes('admin') || user?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <h1 className="text-4xl font-black text-white mb-2">Access Denied</h1>
          <p className="text-slate-300 mb-8">You don't have permission to access the admin panel</p>
          <Link href="/" className="px-6 py-3 rounded-xl bg-primary text-white font-bold hover:shadow-lg transition-all">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const overdueTasks = allTasks.filter(t => !t.completed && new Date(t.deadlineDate) < new Date()).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Admin Panel</h1>
            <p className="text-slate-400 text-sm">System Management & Analytics</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-white font-bold text-sm">{user?.firstName || user?.name || 'Admin'}</p>
              <p className="text-slate-400 text-xs">{user?.email}</p>
            </div>
            <button
              onClick={() => logout()}
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-slate-700">
          {['dashboard', 'users', 'tasks', 'analytics', 'settings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-bold text-sm uppercase tracking-wider capitalize transition-all border-b-2 ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-2xl p-6">
                <div className="text-slate-300 text-sm font-bold uppercase tracking-wider mb-2">Total Tasks</div>
                <div className="text-4xl font-black text-primary">{totalTasks}</div>
                <p className="text-slate-400 text-xs mt-2">Across all users</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 rounded-2xl p-6">
                <div className="text-slate-300 text-sm font-bold uppercase tracking-wider mb-2">Completed</div>
                <div className="text-4xl font-black text-emerald-500">{completedTasks}</div>
                <p className="text-slate-400 text-xs mt-2">{((completedTasks / totalTasks) * 100).toFixed(0)}% completion rate</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/30 rounded-2xl p-6">
                <div className="text-slate-300 text-sm font-bold uppercase tracking-wider mb-2">Pending</div>
                <div className="text-4xl font-black text-yellow-500">{pendingTasks}</div>
                <p className="text-slate-400 text-xs mt-2">Awaiting completion</p>
              </div>
              <div className="bg-gradient-to-br from-red-500/20 to-red-500/5 border border-red-500/30 rounded-2xl p-6">
                <div className="text-slate-300 text-sm font-bold uppercase tracking-wider mb-2">Overdue</div>
                <div className="text-4xl font-black text-red-500">{overdueTasks}</div>
                <p className="text-slate-400 text-xs mt-2">Requires attention</p>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-black text-white mb-4">System Status</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-300">Backend Status</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-green-500 font-bold text-sm">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-300">Frontend Status</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-green-500 font-bold text-sm">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-300">Database Status</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-green-500 font-bold text-sm">Connected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-lg font-black text-white mb-4">User Management</h2>
            <p className="text-slate-400">User management dashboard coming soon...</p>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-lg font-black text-white mb-4">Task Management</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {allTasks.slice(0, 10).map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-all">
                  <div className="flex-1">
                    <p className="text-white font-bold text-sm">{task.title}</p>
                    <p className="text-slate-400 text-xs">{task.category || 'Uncategorized'}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      task.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {task.completed ? 'Done' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-lg font-black text-white mb-4">Analytics</h2>
            <p className="text-slate-400">Advanced analytics coming soon...</p>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-lg font-black text-white mb-4">Admin Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 font-bold mb-2 text-sm">System Maintenance Mode</label>
                <button className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold transition-colors">
                  Enable Maintenance
                </button>
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-2 text-sm">Database Backup</label>
                <button className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-colors">
                  Backup Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
