import React, { useMemo } from 'react';
import {
  Plus,
  Search,
  FileText,
  Compass,
  FolderClosed,
  Star,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  BookOpen,
  Shuffle,
  Tag,
  ExternalLink,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { ActiveView, NoteItem, VaultItem } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { EmptyState } from '../common/EmptyState';

interface DashboardViewProps {
  onNavigate: (view: ActiveView) => void;
  onOpenQuickAdd: () => void;
  onOpenSearch: () => void;
  onSelectNote: (note: NoteItem) => void;
  onSelectVaultItem: (item: VaultItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenQuickAdd,
  onOpenSearch,
  onSelectNote,
  onSelectVaultItem,
}) => {
  const { notes, vaultItems, collections, stats } = useData();
  const { userProfile } = useAuth();

  // Dynamic time greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Filter active items
  const activeNotes = useMemo(() => notes.filter((n) => !n.isDeleted && !n.isArchived), [notes]);
  const activeVault = useMemo(() => vaultItems.filter((v) => !v.isDeleted && !v.isArchived), [vaultItems]);

  // Recently added notes (up to 4)
  const recentNotes = useMemo(() => {
    return [...activeNotes]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  }, [activeNotes]);

  // Recently updated/opened notes (up to 3)
  const recentlyUpdatedNotes = useMemo(() => {
    return [...activeNotes]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3);
  }, [activeNotes]);

  // Favorite items
  const favoriteItems = useMemo(() => {
    const favNotes = activeNotes.filter((n) => n.isFavorite);
    const favVault = activeVault.filter((v) => v.isFavorite);
    return { favNotes, favVault, total: favNotes.length + favVault.length };
  }, [activeNotes, activeVault]);

  // Random knowledge spark card
  const randomKnowledge = useMemo(() => {
    const all = [
      ...activeNotes.map((n) => ({ type: 'note' as const, item: n })),
      ...activeVault.map((v) => ({ type: 'vault' as const, item: v })),
    ];
    if (all.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * all.length);
    return all[randomIndex];
  }, [activeNotes, activeVault]);

  // Daily activity chart data (last 7 days)
  const activityData = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

      // Count created or updated on this date
      const countNotes = notes.filter((n) => n.updatedAt.startsWith(dateStr) || n.createdAt.startsWith(dateStr)).length;
      const countVault = vaultItems.filter((v) => v.updatedAt.startsWith(dateStr) || v.createdAt.startsWith(dateStr)).length;
      days.push({
        date: dateStr,
        day: dayLabel,
        count: countNotes + countVault,
      });
    }
    const max = Math.max(...days.map((d) => d.count), 1);
    return { days, max };
  }, [notes, vaultItems]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* 1. Welcome & Hero Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/30 border border-purple-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Second Brain Knowledge Operating System</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {greeting}, {userProfile?.displayName || 'Knowledge Seeker'}
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl">
              Your Mind. Your Knowledge. Your Universe. Everything you learn, organize, and synthesize in one unified vault.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-sm font-medium transition shadow-sm"
            >
              <Search className="w-4 h-4 text-purple-400" />
              <span>Global Search</span>
              <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">
                ⌘K
              </kbd>
            </button>

            <button
              onClick={onOpenQuickAdd}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-purple-600/25 active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Quick Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Stat Counter Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard
          hoverEffect
          onClick={() => onNavigate('notes')}
          className="p-5 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Saved Notes
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
              {stats.totalNotes}
            </span>
            <span className="text-xs text-purple-400 font-medium">notes</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Rich text & markdown</p>
        </GlassCard>

        <GlassCard
          hoverEffect
          onClick={() => onNavigate('vault')}
          className="p-5 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Vault Bookmarks
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
              {stats.totalVaultItems}
            </span>
            <span className="text-xs text-sky-400 font-medium">items</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">URLs, articles, media</p>
        </GlassCard>

        <GlassCard
          hoverEffect
          onClick={() => onNavigate('collections')}
          className="p-5 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Collections
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition">
              <FolderClosed className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
              {stats.totalCollections}
            </span>
            <span className="text-xs text-indigo-400 font-medium">folders</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Thematic organization</p>
        </GlassCard>

        <GlassCard
          hoverEffect
          onClick={() => onNavigate('favorites')}
          className="p-5 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Favorites
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
              {stats.totalFavorites}
            </span>
            <span className="text-xs text-amber-400 font-medium">starred</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">High-priority knowledge</p>
        </GlassCard>
      </div>

      {/* 3. Middle Grid: Activity Chart & Random Knowledge Spark */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Activity Chart (2 cols) */}
        <GlassCard className="p-6 lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-300">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Knowledge Activity</h3>
                <p className="text-xs text-slate-400">Notes & items added or updated over 7 days</p>
              </div>
            </div>
            <span className="text-xs font-mono text-purple-400 bg-purple-950/40 px-2.5 py-1 rounded-lg border border-purple-500/30">
              Active Mind
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
            {activityData.days.map((d) => {
              const heightPercent = Math.max(12, Math.round((d.count / activityData.max) * 100));
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition">
                    {d.count}
                  </div>
                  <div className="w-full max-w-[42px] bg-slate-800/80 rounded-t-xl overflow-hidden h-28 flex items-end p-0.5">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 via-purple-600 to-purple-400 group-hover:to-pink-400 transition-all duration-300 shadow-sm"
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-400 group-hover:text-white transition">
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Random Knowledge Spark Card (1 col) */}
        <GlassCard className="p-6 flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-slate-900/90 to-purple-950/30 border-purple-500/25">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                Random Knowledge Spark
              </h3>
            </div>
            <span className="text-[10px] text-slate-500">Serendipity</span>
          </div>

          {randomKnowledge ? (
            <div className="space-y-2.5 my-auto py-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                {randomKnowledge.type === 'note' ? (
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                ) : (
                  <Compass className="w-3.5 h-3.5 text-sky-400" />
                )}
                <span className="font-medium text-slate-300">
                  {randomKnowledge.item.category || 'Knowledge'}
                </span>
              </div>
              <h4 className="text-base font-bold text-white leading-snug line-clamp-2">
                {randomKnowledge.item.title}
              </h4>
              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                {randomKnowledge.type === 'note'
                  ? (randomKnowledge.item as NoteItem).content.replace(/<[^>]*>/g, '') || 'No text content'
                  : (randomKnowledge.item as VaultItem).description || 'Saved in Knowledge Vault'}
              </p>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 my-auto">
              <Sparkles className="w-8 h-8 text-purple-400/40 mx-auto mb-2" />
              <p className="text-xs text-slate-300 font-medium">Your Vault Awaits</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Save your first note or URL to enable daily serendipitous recall
              </p>
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            {randomKnowledge ? (
              <button
                onClick={() => {
                  if (randomKnowledge.type === 'note') {
                    onSelectNote(randomKnowledge.item as NoteItem);
                    onNavigate('notes');
                  } else {
                    onSelectVaultItem(randomKnowledge.item as VaultItem);
                    onNavigate('vault');
                  }
                }}
                className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold"
              >
                <span>Open item</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onOpenQuickAdd}
                className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold"
              >
                <span>Add first note</span>
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </GlassCard>
      </div>

      {/* 4. Bottom Grid: Recently Added Notes & Quick Access Folders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recently Added Notes (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <h2 className="text-base font-bold text-white tracking-tight">Recently Added Notes</h2>
            </div>
            <button
              onClick={() => onNavigate('notes')}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium inline-flex items-center gap-1"
            >
              <span>View all notes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentNotes.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No notes added yet"
              description="Capture your first flash of insight, meeting summary, or technical note."
              actionLabel="Create First Note"
              onAction={onOpenQuickAdd}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {recentNotes.map((note) => (
                <GlassCard
                  key={note.id}
                  hoverEffect
                  onClick={() => {
                    onSelectNote(note);
                    onNavigate('notes');
                  }}
                  className="p-4 cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-semibold text-purple-300 text-[11px] bg-purple-950/40 px-2 py-0.5 rounded-md border border-purple-500/20">
                        {note.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors line-clamp-1 mb-1.5">
                      {note.title}
                    </h4>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {note.content.replace(/<[^>]*>/g, '') || 'Empty note content'}
                    </p>
                  </div>

                  {note.tags && note.tags.length > 0 && (
                    <div className="flex items-center gap-1 mt-3 flex-wrap">
                      {note.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </GlassCard>
              ))}
            </div>
          )}
        </div>

        {/* Quick Access to Collections / Folders (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderClosed className="w-4 h-4 text-indigo-400" />
              <h2 className="text-base font-bold text-white tracking-tight">Folders & Collections</h2>
            </div>
            <button
              onClick={() => onNavigate('collections')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {collections.length === 0 ? (
            <div className="p-6 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 text-center">
              <FolderClosed className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-300">No collections yet</p>
              <p className="text-[11px] text-slate-500 mt-1 mb-3">
                Group your knowledge into custom folders
              </p>
              <button
                onClick={onOpenQuickAdd}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
              >
                + Create Collection
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {collections.slice(0, 5).map((col) => {
                const count = activeNotes.filter((n) => n.folderId === col.id).length;
                return (
                  <GlassCard
                    key={col.id}
                    hoverEffect
                    onClick={() => onNavigate('collections')}
                    className="p-3.5 cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm"
                        style={{ backgroundColor: col.color || '#8b5cf6' }}
                      >
                        <FolderClosed className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                          {col.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 line-clamp-1">{col.description || 'Collection'}</p>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/60">
                      {count} items
                    </span>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
