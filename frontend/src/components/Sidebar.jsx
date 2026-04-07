import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useGetDashboardSummary } from '@/api-client-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import {
  IconDashboard, IconTasks, IconCalendar, IconSettings,
  IconClock, IconUpcoming, IconAlert, IconSmartphone, MemorizeLogo,
  IconHabit, IconAward, IconLogOut
} from './Icons.jsx';
import { cn } from '../lib/utils.js';

const NavItem = ({ href, icon: Icon, label, badge, active }) => (
  <Link href={href}>
    <div className={cn(
      "flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all mx-2 group mb-1",
      active 
        ? "bg-white text-primary font-bold shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)]" 
        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50"
    )}>
      <div className={cn("flex-shrink-0 transition-colors", active ? "text-primary" : "group-hover:text-slate-600")}>
        <Icon size={18} strokeWidth={active ? 2.5 : 2} />
      </div>
      <span className="text-[13.5px] flex-1">{label}</span>
      {badge > 0 && (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200/50">
          {badge}
        </span>
      )}
    </div>
  </Link>
);

export default function Sidebar({ open, onClose }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { data: summary } = useGetDashboardSummary();

  return (
    <aside className={cn(
      "flex-shrink-0 flex flex-col h-full relative overflow-hidden bg-sidebar/50 border-r border-sidebar-border transition-transform duration-300",
      // Desktop: always visible, fixed width
      "md:w-[240px] md:translate-x-0 md:static md:z-auto",
      // Mobile: full-height drawer from left, fixed position
      "w-[280px] fixed inset-y-0 left-0 z-40",
      open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
    )}>
      {/* Brand Header */}
      <div className="px-6 py-6 flex-shrink-0">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-purple-500/20 group-hover:shadow-xl group-hover:shadow-purple-500/30 transition-all">
            <MemorizeLogo size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-slate-900 font-bold text-sm tracking-tight leading-none mb-1 group-hover:text-indigo-600 transition-colors">Memorizes</div>
            <div className="text-slate-400 font-black text-[9px] tracking-[0.2em] uppercase">Smart Memory</div>
          </div>
          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </Link>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll py-2 px-1">
        <div className="px-6 pb-3 pt-2">
          <span className="text-slate-300 text-[10px] font-black tracking-[0.15em] uppercase">Menu</span>
        </div>
        <NavItem href="/" icon={IconDashboard} label="Dashboard" active={location === '/'} />
        <NavItem href="/tasks" icon={IconTasks} label="Tasks" active={location === '/tasks' || location.startsWith('/tasks/')} />
        <NavItem href="/calendar" icon={IconCalendar} label="Calendar" active={location === '/calendar'} />
        <NavItem href="/settings" icon={IconSettings} label="Settings" active={location === '/settings'} />

        <div className="px-6 pb-3 pt-8">
          <span className="text-slate-300 text-[10px] font-black tracking-[0.15em] uppercase">Views</span>
        </div>
        <NavItem href="/tasks?status=today" icon={IconClock} label="Today" badge={summary?.todayCount} active={false} />
        <NavItem href="/tasks?status=upcoming" icon={IconUpcoming} label="Upcoming" active={false} />
        <NavItem href="/tasks?status=overdue" icon={IconAlert} label="Overdue" badge={summary?.overdueCount} active={false} />
      </nav>

      {/* PWA Install Promo */}
      <div className="px-4 mb-4">
        <div className="p-5 rounded-2xl bg-slate-900 text-white relative overflow-hidden group">
          <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/5 group-hover:scale-150 transition-transform duration-700" />
          <div className="relative z-10">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-3">
              <IconSmartphone size={16} className="text-white/80" />
            </div>
            <div className="text-xs font-bold mb-1">Native App</div>
            <div className="text-[10px] text-white/50 leading-relaxed mb-3">Install Sanctuary for a seamless desktop experience.</div>
            <button className="w-full py-2 bg-white text-slate-900 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-slate-200 transition-colors">
              Install App
            </button>
          </div>
        </div>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-sidebar-border bg-slate-50/50">
        <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white hover:shadow-sm transition-all group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-md border border-white/20"
            style={{ background: 'linear-gradient(135deg, hsl(222,47%,20%), hsl(222,47% ,30%))' }}>
            {user?.name?.[0].toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-slate-900 text-[12.5px] font-bold truncate leading-none mb-1">{user?.name || 'Explorer'}</div>
            <div className="text-[10px] font-medium text-slate-400 truncate">Pro Member</div>
          </div>
          <button 
            onClick={logout}
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
          >
            <IconLogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
