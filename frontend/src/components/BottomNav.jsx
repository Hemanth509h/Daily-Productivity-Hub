import React from 'react';
import { useLocation, Link } from 'wouter';
import { cn } from '../lib/utils.js';
import { IconDashboard, IconTasks, IconCalendar, IconHabit, IconSettings } from './Icons.jsx';

const tabs = [
  { href: '/', icon: IconDashboard, label: 'Home' },
  { href: '/tasks', icon: IconTasks, label: 'Tasks' },
  { href: '/calendar', icon: IconCalendar, label: 'Calendar' },
  { href: '/habits', icon: IconHabit, label: 'Habits' },
  { href: '/settings', icon: IconSettings, label: 'Settings' },
];

export default function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/90 backdrop-blur-xl border-t border-slate-200/60 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = href === '/' ? location === '/' : location.startsWith(href);
          return (
            <Link key={href} href={href}>
              <div className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all">
                <Icon
                  size={22}
                  strokeWidth={active ? 2.5 : 1.8}
                  className={cn(
                    'transition-colors',
                    active ? 'text-primary' : 'text-slate-400'
                  )}
                />
                <span className={cn(
                  'text-[10px] font-bold tracking-wide transition-colors',
                  active ? 'text-primary' : 'text-slate-400'
                )}>
                  {label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
