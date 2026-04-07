import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Link } from 'wouter';
import { IconSearch, IconBell, IconPlus } from './Icons.jsx';
import QuickAddModal from './QuickAddModal.jsx';

export default function TopBar({ onMenuClick }) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <>
      <header className="h-14 md:h-16 flex items-center px-3 md:px-8 gap-2 md:gap-6 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 flex-shrink-0 sticky top-0 z-30">
        {/* Hamburger — mobile only */}


        {/* Search */}
        <div className="flex-1 max-w-xl relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none">
            <IconSearch size={16} strokeWidth={2.5} />
          </span>
          <input
            type="search"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 text-[13.5px] rounded-xl border-none outline-none focus:ring-4 focus:ring-primary/5 placeholder:text-slate-400 font-medium transition-all"
            style={{ background: 'rgba(241, 245, 249, 0.7)' }}
          />
        </div>

        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          {/* Quick Add */}
          <button
            onClick={() => setShowQuickAdd(true)}
            className="flex items-center gap-2 px-3 md:px-5 py-2.5 rounded-xl text-[11px] font-black text-white transition-all hover:shadow-lg hover:shadow-primary/20 active:scale-95 bg-primary uppercase tracking-widest"
          >
            <IconPlus size={14} strokeWidth={3} />
            <span className="hidden md:inline">Quick Add</span>
          </button>

          {/* Bell */}
          <button
            onClick={() => {
              if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
            }}
            className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100/50 text-slate-400 hover:text-slate-900 transition-all hover:bg-slate-100"
          >
            <IconBell size={18} strokeWidth={2} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1" />

          {/* User */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-2xl transition-all hover:bg-slate-100/50"
            >
              <div className="text-right hidden sm:block">
                <div className="text-[12px] font-bold text-slate-900 leading-tight">{user?.name || 'Explorer'}</div>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Focus Mode: ON</div>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[13px] font-black shadow-md"
                style={{ background: 'linear-gradient(135deg, hsl(222,47%,20%), hsl(222,47%,30%))' }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </button>
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-full mt-2 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 z-50 min-w-[220px] p-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 mb-1">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Sanctuary Account</div>
                    <div className="text-[13px] font-bold text-slate-900 truncate">{user?.email}</div>
                  </div>
                  <div className="h-px bg-slate-50 mx-2 mb-1" />
                  <Link href="/settings" onClick={() => setShowUserMenu(false)}>
                    <div className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all cursor-pointer">
                      Profile Settings
                    </div>
                  </Link>
                  <button
                    onClick={() => { setShowUserMenu(false); logout(); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    Terminate Session
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
