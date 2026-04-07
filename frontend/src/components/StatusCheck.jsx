import React, { useState, useEffect } from 'react';
import { MemorizeLogo } from './Icons.jsx';

export function StatusCheck({ children }) {
  const [isOnline, setIsOnline] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/status', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.active && data.status === 'online') {
            setIsOnline(true);
            setIsChecking(false);
            return;
          }
        }
      } catch (error) {
        console.log('Backend not ready, retrying...');
      }

      // Retry after 1 second
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
      }, 1000);
    };

    if (!isOnline) {
      checkStatus();
    }
  }, [isOnline, retryCount]);

  if (!isOnline) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Animated Background Blur */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse animation-delay-2000" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center space-y-6">
          {/* Logo Animation */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-500 rounded-2xl blur-xl opacity-75 animate-pulse" />
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-primary to-purple-500 shadow-2xl">
                <MemorizeLogo size={48} />
              </div>
            </div>
          </div>

          {/* Status Text */}
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Memorizes
            </h1>
            <p className="text-lg md:text-xl text-slate-300 font-bold">
              Connecting to System...
            </p>
          </div>

          {/* Loading Indicator */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>

          {/* Status Info */}
          <div className="mt-8 text-sm text-slate-400 space-y-1">
            <p>Setting up your productivity workspace</p>
            <p className="text-xs text-slate-500">Attempt {retryCount + 1}</p>
          </div>

          {/* Animated Progress Line */}
          <div className="mt-12 w-64 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Bottom Text */}
        <div className="absolute bottom-8 text-center text-slate-500 text-xs">
          <p>Smart Memory & Task Management</p>
        </div>
      </div>
    );
  }

  return children;
}
