import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Compass,
  Sparkles,
  FolderClosed,
  Star,
  BookOpen,
  Archive,
  Trash2,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  BrainCircuit,
  Plus,
} from 'lucide-react';
import { ActiveView } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  onOpenQuickAdd: () => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  collapsed,
  setCollapsed,
  onOpenQuickAdd,
  isMobileOpen = false,
  setIsMobileOpen,
}) => {
  const { stats } = useData();
  const { user, userProfile, signOut } = useAuth();

  const navItems = [
    {
      id: 'dashboard' as ActiveView,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      id: 'notes' as ActiveView,
      label: 'My Notes',
      icon: FileText,
      badge: stats.totalNotes > 0 ? stats.totalNotes : undefined,
    },
    {
      id: 'vault' as ActiveView,
      label: 'Knowledge Vault',
      icon: Compass,
      badge: stats.totalVaultItems > 0 ? stats.totalVaultItems : undefined,
    },
    {
      id: 'assistant' as ActiveView,
      label: 'AI Brain Assistant',
      icon: Sparkles,
      badge: 'AI',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    {
      id: 'collections' as ActiveView,
      label: 'Collections',
      icon: FolderClosed,
      badge: stats.totalCollections > 0 ? stats.totalCollections : undefined,
    },
    {
      id: 'favorites' as ActiveView,
      label: 'Favorites',
      icon: Star,
      badge: stats.totalFavorites > 0 ? stats.totalFavorites : undefined,
    },
    {
      id: 'journal' as ActiveView,
      label: 'Daily Journal',
      icon: BookOpen,
      badge: undefined,
    },
    {
      id: 'archive' as ActiveView,
      label: 'Archive',
      icon: Archive,
      badge: stats.totalArchived > 0 ? stats.totalArchived : undefined,
    },
    {
      id: 'trash' as ActiveView,
      label: 'Trash',
      icon: Trash2,
      badge: stats.totalTrash > 0 ? stats.totalTrash : undefined,
    },
    {
      id: 'settings' as ActiveView,
      label: 'Settings',
      icon: Settings,
      badge: undefined,
    },
  ];

  const handleSelectView = (view: ActiveView) => {
    setActiveView(view);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#0b0d14]/95 border-r border-slate-800/80 backdrop-blur-2xl transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/60">
          <div
            onClick={() => handleSelectView('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-500 p-0.5 shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
              <div className="w-full h-full bg-[#0b0d14] rounded-[10px] flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
              </div>
            </div>
            {!collapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                  BrainVault
                  <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    PWA
                  </span>
                </span>
                <span className="text-[11px] text-slate-400 truncate">Your Second Brain</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Add Action Button */}
        <div className="p-3">
          <button
            onClick={onOpenQuickAdd}
            className={`flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium shadow-md shadow-purple-600/25 active:scale-95 transition-all ${
              collapsed ? 'w-12 h-12 mx-auto p-0' : 'w-full py-2.5 px-3 text-sm'
            }`}
            title="Quick Add to BrainVault"
          >
            <Plus className="w-4 h-4" />
            {!collapsed && <span>Quick Add</span>}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-purple-600/15 text-purple-300 border border-purple-500/30 shadow-sm shadow-purple-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                } ${collapsed ? 'justify-center px-0' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-transform ${
                    isActive ? 'text-purple-400 scale-110' : 'group-hover:scale-110 text-slate-400'
                  }`}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {item.badge !== undefined && (
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-medium border ${
                          item.badgeColor ||
                          (isActive
                            ? 'bg-purple-500/30 text-purple-200 border-purple-400/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700/60')
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* PWA Install Area */}
        <div className="p-3 border-t border-slate-800/60">
          <PWAInstallButton compact={collapsed} />
        </div>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-slate-800/60 bg-[#090b11]">
          {user ? (
            <div
              className={`flex items-center gap-3 ${
                collapsed ? 'justify-center' : 'justify-between'
              }`}
            >
              <div
                onClick={() => handleSelectView('settings')}
                className="flex items-center gap-2.5 overflow-hidden cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 shadow">
                  {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
                {!collapsed && (
                  <div className="flex flex-col overflow-hidden text-left">
                    <span className="text-xs font-semibold text-white truncate group-hover:text-purple-300 transition">
                      {userProfile?.displayName || 'User'}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate font-mono">
                      {user.email || 'Private User'}
                    </span>
                  </div>
                )}
              </div>

              {!collapsed && (
                <button
                  onClick={() => signOut()}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="text-center">
              {!collapsed && (
                <p className="text-xs text-slate-400">Personal Knowledge Base</p>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
