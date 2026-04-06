import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext.jsx';
import QuickAddModal from './QuickAddModal.jsx';

export default function TopBar() {
  const { user, logout } = useAuth();
  const [search, setSearch] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <>
      <header className="h-14 flex items-center px-6 gap-4 bg-white border-b border-border flex-shrink-0">
        {/* Search */}
        <div className="flex-1 max-w-md relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">🔍</span>
          <input
            type="search"
            placeholder="Search tasks, events, or files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-muted rounded-lg border-0 outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Quick Add */}
          <button
            onClick={() => setShowQuickAdd(true)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'hsl(222, 47%, 20%)' }}
          >
            <span className="text-base leading-none">+</span>
            Quick Add
          </button>

          {/* Bell */}
          <button
            onClick={() => {
              if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission();
              }
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-foreground/70 text-lg"
          >
            🔔
          </button>

          {/* User */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 hover:bg-muted px-2 py-1 rounded-lg transition-colors"
            >
              <div>
                <div className="text-sm font-semibold text-foreground text-right leading-tight">
                  {user?.name || 'User'}
                </div>
                <div className="text-[11px] text-muted-foreground text-right">Focus Mode: ON</div>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                style={{ background: 'hsl(222, 47%, 30%)' }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </button>
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-border z-50 min-w-[140px] py-1 overflow-hidden">
                <button
                  onClick={() => { setShowUserMenu(false); logout(); }}
                  className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {showQuickAdd && <QuickAddModal onClose={() => setShowQuickAdd(false)} />}
    </>
  );
}
