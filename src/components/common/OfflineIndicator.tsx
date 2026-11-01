import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl bg-amber-500/90 text-slate-950 px-4 py-2.5 text-xs font-semibold shadow-xl shadow-amber-500/20 backdrop-blur border border-amber-300 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <WifiOff className="w-4 h-4 animate-pulse text-slate-950" />
      <span>Offline Mode — Cached notes are accessible</span>
      <span className="flex items-center gap-1 text-[11px] bg-black/10 px-1.5 py-0.5 rounded">
        <RefreshCw className="w-3 h-3" /> Auto-syncs on reconnect
      </span>
    </div>
  );
};
