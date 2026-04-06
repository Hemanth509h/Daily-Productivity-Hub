import React from 'react';
import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';
import AIAssistant from './AIAssistant.jsx';

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* TopBar can be hidden if we want a more focused look, but keeping it for now */}
        <TopBar />
        <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          {children}
        </main>
      </div>
      <AIAssistant />
    </div>
  );
}
