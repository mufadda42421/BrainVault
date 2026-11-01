import React from 'react';
import {
  Menu,
  Search,
  Plus,
  Cloud,
  CloudOff,
  Sun,
  Moon,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { ActiveView } from '../../types';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenQuickAdd: () => void;
  onOpenAuth: () => void;
  onToggleMobileNav: () => void;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenQuickAdd,
  onOpenAuth,
  onToggleMobileNav,
  activeView,
  setActiveView,
}) => {
  const { saveStatus } = useData();
  const { theme, toggleTheme } = useTheme();
  const { user, userProfile } = useAuth();

  const getPageTitle = (view: ActiveView) => {
    switch (view) {
      case 'dashboard':
        return 'Dashboard';
      case 'notes':
        return 'My Notes';
      case 'vault':
        return 'Knowledge Vault';
      case 'assistant':
        return 'AI Brain Assistant';
      case 'collections':
        return 'Collections & Folders';
      case 'favorites':
        return 'Starred & Favorites';
      case 'journal':
        return 'Daily Journal';
      case 'archive':
        return 'Archive';
      case 'trash':
        return 'Trash';
      case 'settings':
        return 'Settings';
      default:
        return 'BrainVault';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#090a0f]/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger + Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileNav}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-baseline gap-2">
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-white capitalize">
            {getPageTitle(activeView)}
          </h1>
        </div>
      </div>

      {/* Middle: Global Search bar trigger */}
      <div className="flex-1 max-w-md mx-4 hidden sm:block">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:border-purple-500/40 hover:text-slate-200 transition text-sm group shadow-inner"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-colors" />
            <span className="text-xs text-slate-400">Search notes, links, tags, thoughts...</span>
          </div>
          <kbd className="hidden md:inline-flex items-center gap-0.5 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile search icon */}
        <button
          onClick={onOpenSearch}
          className="sm:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Sync status indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs">
          {saveStatus === 'offline' ? (
            <>
              <CloudOff className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-400 text-[11px] font-medium">Offline</span>
            </>
          ) : saveStatus === 'saving' ? (
            <>
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <span className="text-purple-300 text-[11px] font-medium">Saving...</span>
            </>
          ) : (
            <>
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400 text-[11px]">Synced</span>
            </>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {/* Quick Add Button */}
        <button
          onClick={onOpenQuickAdd}
          className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white px-3 py-1.5 text-xs font-semibold shadow-md shadow-purple-600/20 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Quick Add</span>
        </button>

        {/* User Profile / Sign in */}
        {user ? (
          <button
            onClick={() => setActiveView('settings')}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-800/60 transition group"
            title="Profile & Settings"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-purple-500/20 group-hover:ring-purple-400 transition">
              {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
          >
            <UserIcon className="w-3.5 h-3.5 text-purple-400" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
