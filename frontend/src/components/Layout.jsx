import React from 'react';
import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';
import BottomNav from './BottomNav.jsx';

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 min-h-0 overflow-y-auto px-3 py-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
