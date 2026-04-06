import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { IconSearch, IconBell, IconPlus } from './Icons.jsx';
import QuickAddModal from './QuickAddModal.jsx';

export default function TopBar() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <>
      <header className="h-14 flex items-center px-5 gap-3 bg-white border-b flex-shrink-0" style={{ borderColor: 'hsl(213,25%,88%)' }}>
        {/* Search */}
        <div className="flex-1 max-w-sm relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none">
            <IconSearch size={15} />
          </span>
          <input
            type="search"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border-0 outline-none focus:ring-2 focus:ring-ring/30 placeholder:text-muted-foreground/40 font-medium"
            style={{ background: 'hsl(213,33%,95%)', color: 'hsl(222,47%,15%)' }}
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Quick Add */}
          <button
            onClick={() => setShowQuickAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, hsl(222,47%,22%) 0%, hsl(222,47%,28%) 100%)', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
          >
            <IconPlus size={14} />
            Quick Add
          </button>

          {/* Bell */}
          <button
            onClick={() => {
              if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
            }}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors text-foreground/55 hover:text-foreground/80"
          >
            <IconBell size={17} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>

          {/* User */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 hover:bg-muted/80 px-2.5 py-1.5 rounded-xl transition-colors"
            >
              <div className="text-right">
                <div className="text-[12.5px] font-semibold text-foreground leading-tight">{user?.name || 'User'}</div>
                <div className="text-[10px] text-muted-foreground/60">Pro Member</div>
              </div>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </button>
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-border z-50 min-w-[150px] py-1 overflow-hidden">
                  <a href="/settings" className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0112 0v2"/></svg>
                    Profile
                  </a>
                  <div className="h-px bg-border my-1" />
                  <button
                    onClick={() => { setShowUserMenu(false); window.location.href = '/login'; localStorage.removeItem('sanctuary_token'); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
      {showQuickAdd && <QuickAddModal onClose={() => setShowQuickAdd(false)} />}
    </>
  );
}
