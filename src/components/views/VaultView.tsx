import React, { useState, useMemo } from 'react';
import {
  Compass,
  Plus,
  Search,
  Globe,
  Youtube,
  FileText,
  Image as ImageIcon,
  Lightbulb,
  FlaskConical,
  Star,
  ExternalLink,
  Tag,
  Trash2,
  Archive,
  Sparkles,
  Edit2,
  X,
  FileCode,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { VaultItem, VaultItemType } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { EmptyState } from '../common/EmptyState';

interface VaultViewProps {
  onOpenQuickAdd: () => void;
  selectedVaultItem: VaultItem | null;
  setSelectedVaultItem: (item: VaultItem | null) => void;
}

const TYPE_CONFIG: Record<VaultItemType, { label: string; icon: any; color: string }> = {
  url: { label: 'Website', icon: Globe, color: 'text-sky-400 bg-sky-950/40 border-sky-500/30' },
  youtube: { label: 'YouTube', icon: Youtube, color: 'text-rose-400 bg-rose-950/40 border-rose-500/30' },
  article: { label: 'Article', icon: FileText, color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30' },
  image: { label: 'Image', icon: ImageIcon, color: 'text-purple-400 bg-purple-950/40 border-purple-500/30' },
  pdf: { label: 'PDF', icon: FileCode, color: 'text-amber-400 bg-amber-950/40 border-amber-500/30' },
  document: { label: 'Document', icon: FileText, color: 'text-blue-400 bg-blue-950/40 border-blue-500/30' },
  idea: { label: 'Idea', icon: Lightbulb, color: 'text-yellow-400 bg-yellow-950/40 border-yellow-500/30' },
  research: { label: 'Research', icon: FlaskConical, color: 'text-indigo-400 bg-indigo-950/40 border-indigo-500/30' },
};

export const VaultView: React.FC<VaultViewProps> = ({
  onOpenQuickAdd,
  selectedVaultItem,
  setSelectedVaultItem,
}) => {
  const { vaultItems, updateVaultItem, deleteVaultItem, toggleFavoriteVaultItem, toggleArchiveVaultItem } = useData();

  const [activeTypeFilter, setActiveTypeFilter] = useState<'all' | VaultItemType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null);

  // AI summary state
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    return vaultItems
      .filter((v) => !v.isDeleted && !v.isArchived)
      .filter((v) => {
        if (activeTypeFilter !== 'all' && v.type !== activeTypeFilter) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = v.title.toLowerCase().includes(q);
          const matchDesc = (v.description || '').toLowerCase().includes(q);
          const matchUrl = (v.url || '').toLowerCase().includes(q);
          const matchTags = (v.tags || []).some((t) => t.toLowerCase().includes(q));
          return matchTitle || matchDesc || matchUrl || matchTags;
        }
        return true;
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [vaultItems, activeTypeFilter, searchQuery]);

  const handleAiSummarizeVault = async (item: VaultItem) => {
    setIsAiLoading(true);
    setAiSummary(null);
    try {
      const res = await fetch('/api/ai/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'summarize',
          title: item.title,
          content: `${item.title}\nURL: ${item.url || 'None'}\nDescription: ${item.description}\nNotes: ${item.content || ''}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAiSummary(data.result);
    } catch (err: any) {
      setAiSummary(`Error: ${err.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span>Knowledge Vault</span>
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30">
              {vaultItems.filter((v) => !v.isDeleted && !v.isArchived).length} items
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Store URLs, research papers, YouTube links, images, and conceptual ideas
          </p>
        </div>

        <button
          onClick={onOpenQuickAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-md shadow-sky-600/25 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Save Item</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl backdrop-blur-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved vault items..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/70 border border-slate-800 focus:border-sky-500 focus:outline-none text-white text-xs sm:text-sm"
          />
        </div>

        {/* Type pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveTypeFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition flex-shrink-0 ${
              activeTypeFilter === 'all'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            All Types
          </button>
          {(Object.keys(TYPE_CONFIG) as VaultItemType[]).map((t) => {
            const conf = TYPE_CONFIG[t];
            const Icon = conf.icon;
            return (
              <button
                key={t}
                onClick={() => setActiveTypeFilter(t)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition flex-shrink-0 ${
                  activeTypeFilter === t
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{conf.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={Compass}
          title={searchQuery || activeTypeFilter !== 'all' ? 'No matching vault items' : 'Your Knowledge Vault is empty'}
          description="Bookmark high-value websites, research papers, YouTube videos, and personal breakthroughs."
          actionLabel="Add Knowledge Item"
          onAction={onOpenQuickAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const conf = TYPE_CONFIG[item.type] || TYPE_CONFIG.url;
            const Icon = conf.icon;

            return (
              <GlassCard
                key={item.id}
                hoverEffect
                onClick={() => setSelectedVaultItem(item)}
                className="p-5 cursor-pointer flex flex-col justify-between group relative border-slate-800/80 hover:border-sky-500/40"
              >
                <div>
                  {/* Top row: Type badge, Favorite, and Category */}
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${conf.color}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{conf.label}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavoriteVaultItem(item.id);
                        }}
                        className={`p-1 rounded-lg transition ${
                          item.isFavorite
                            ? 'text-amber-400'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <Star className="w-4 h-4" fill={item.isFavorite ? 'currentColor' : 'none'} />
                      </button>

                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 text-slate-500 hover:text-sky-400 transition"
                          title="Open external link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-base text-white group-hover:text-sky-300 transition-colors line-clamp-2 leading-snug mb-2">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-3">
                    {item.description || item.content || (item.url ? `Source: ${item.url}` : 'No description')}
                  </p>
                </div>

                {/* Footer tags and category */}
                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">{item.category}</span>
                  <div className="flex items-center gap-1">
                    {(item.tags || []).slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Detail / Quick Inspection Modal */}
      {selectedVaultItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-[#0d1017] border border-sky-500/30 p-6 shadow-2xl flex flex-col text-left max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                    TYPE_CONFIG[selectedVaultItem.type]?.color || ''
                  }`}
                >
                  {TYPE_CONFIG[selectedVaultItem.type]?.label || 'Vault'}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {selectedVaultItem.category}
                </span>
              </div>

              <button
                onClick={() => {
                  setSelectedVaultItem(null);
                  setAiSummary(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
                {selectedVaultItem.title}
              </h2>

              {selectedVaultItem.url && (
                <a
                  href={selectedVaultItem.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:underline break-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{selectedVaultItem.url}</span>
                </a>
              )}

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {selectedVaultItem.description || 'No description provided.'}
              </div>

              {selectedVaultItem.tags && selectedVaultItem.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {selectedVaultItem.tags.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* AI Summarize Action */}
              <div className="pt-2">
                <button
                  onClick={() => handleAiSummarizeVault(selectedVaultItem)}
                  disabled={isAiLoading}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 font-medium text-xs transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>{isAiLoading ? 'Synthesizing with AI...' : 'Generate AI Summary & Insights'}</span>
                </button>

                {aiSummary && (
                  <div className="mt-3 p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {aiSummary}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  deleteVaultItem(selectedVaultItem.id);
                  setSelectedVaultItem(null);
                }}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Move to Trash</span>
              </button>

              <button
                onClick={() => {
                  toggleFavoriteVaultItem(selectedVaultItem.id);
                  setSelectedVaultItem({
                    ...selectedVaultItem,
                    isFavorite: !selectedVaultItem.isFavorite,
                  });
                }}
                className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium"
              >
                <Star
                  className="w-3.5 h-3.5"
                  fill={selectedVaultItem.isFavorite ? 'currentColor' : 'none'}
                />
                <span>{selectedVaultItem.isFavorite ? 'Starred' : 'Star Favorite'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
