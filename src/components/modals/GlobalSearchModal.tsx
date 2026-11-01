import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  X,
  FileText,
  Compass,
  BookOpen,
  ArrowRight,
  Tag,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { ActiveView, NoteItem, VaultItem, JournalEntry } from '../../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNote: (note: NoteItem) => void;
  onSelectVaultItem: (item: VaultItem) => void;
  onSelectJournal: (entry: JournalEntry) => void;
  onNavigate: (view: ActiveView) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectNote,
  onSelectVaultItem,
  onSelectJournal,
  onNavigate,
}) => {
  const { notes, vaultItems, journals } = useData();
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'notes' | 'vault' | 'journal'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K and Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    type ResultItem = {
      type: 'note' | 'vault' | 'journal';
      id: string;
      title: string;
      snippet: string;
      category?: string;
      tags?: string[];
      updatedAt: string;
      raw: NoteItem | VaultItem | JournalEntry;
    };

    const results: ResultItem[] = [];

    // Search Notes
    if (filterType === 'all' || filterType === 'notes') {
      notes
        .filter((n) => !n.isDeleted)
        .forEach((n) => {
          const matchTitle = n.title.toLowerCase().includes(q);
          const matchContent = n.content.toLowerCase().includes(q);
          const matchCategory = n.category.toLowerCase().includes(q);
          const matchTags = (n.tags || []).some((t) => t.toLowerCase().includes(q));

          if (matchTitle || matchContent || matchCategory || matchTags) {
            results.push({
              type: 'note',
              id: n.id,
              title: n.title,
              snippet: n.content.replace(/<[^>]*>/g, '').slice(0, 140),
              category: n.category,
              tags: n.tags,
              updatedAt: n.updatedAt,
              raw: n,
            });
          }
        });
    }

    // Search Vault Items
    if (filterType === 'all' || filterType === 'vault') {
      vaultItems
        .filter((v) => !v.isDeleted)
        .forEach((v) => {
          const matchTitle = v.title.toLowerCase().includes(q);
          const matchDesc = (v.description || '').toLowerCase().includes(q);
          const matchContent = (v.content || '').toLowerCase().includes(q);
          const matchUrl = (v.url || '').toLowerCase().includes(q);
          const matchTags = (v.tags || []).some((t) => t.toLowerCase().includes(q));

          if (matchTitle || matchDesc || matchContent || matchUrl || matchTags) {
            results.push({
              type: 'vault',
              id: v.id,
              title: v.title,
              snippet: (v.description || v.content || v.url || '').slice(0, 140),
              category: v.category,
              tags: v.tags,
              updatedAt: v.updatedAt,
              raw: v,
            });
          }
        });
    }

    // Search Journal Entries
    if (filterType === 'all' || filterType === 'journal') {
      journals.forEach((j) => {
        const matchTitle = j.title.toLowerCase().includes(q);
        const matchContent = j.content.toLowerCase().includes(q);
        const matchDate = j.date.includes(q);
        const matchMood = j.mood.toLowerCase().includes(q);

        if (matchTitle || matchContent || matchDate || matchMood) {
          results.push({
            type: 'journal',
            id: j.id,
            title: `${j.date} — ${j.title}`,
            snippet: j.content.slice(0, 140),
            category: `Mood: ${j.mood}`,
            tags: j.tags,
            updatedAt: j.updatedAt,
            raw: j,
          });
        }
      });
    }

    return results.slice(0, 30);
  }, [query, filterType, notes, vaultItems, journals]);

  const handleSelect = (item: any) => {
    onClose();
    if (item.type === 'note') {
      onSelectNote(item.raw as NoteItem);
      onNavigate('notes');
    } else if (item.type === 'vault') {
      onSelectVaultItem(item.raw as VaultItem);
      onNavigate('vault');
    } else if (item.type === 'journal') {
      onSelectJournal(item.raw as JournalEntry);
      onNavigate('journal');
    }
  };

  const highlightMatches = (text: string, term: string) => {
    if (!term.trim()) return text;
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === term.toLowerCase() ? (
            <mark key={i} className="bg-purple-500/30 text-purple-200 rounded px-0.5">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-[#0d1017] border border-purple-500/30 shadow-2xl flex flex-col overflow-hidden text-left max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-[#0b0d14]">
          <Search className="w-5 h-5 text-purple-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search notes, knowledge vault, bookmarks, journals..."
            className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm sm:text-base focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex text-[10px] font-mono uppercase px-2 py-0.5 bg-slate-800 text-slate-400 rounded border border-slate-700">
            Esc to close
          </kbd>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-800/60 bg-slate-900/40 text-xs overflow-x-auto">
          {(['all', 'notes', 'vault', 'journal'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-lg capitalize font-medium transition ${
                filterType === t
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {t === 'vault' ? 'Knowledge Vault' : t}
            </button>
          ))}
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar min-h-[200px]">
          {query.trim() === '' ? (
            <div className="py-12 text-center text-slate-500">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30 text-purple-400" />
              <p className="text-sm font-medium text-slate-400">Search Your Second Brain</p>
              <p className="text-xs text-slate-500 mt-1">
                Type keywords, tags, or concepts to instantly retrieve knowledge
              </p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm">No knowledge found matching "{query}"</p>
              <p className="text-xs text-slate-500 mt-1">
                Try searching for related tags, broader words, or check your category filters
              </p>
            </div>
          ) : (
            searchResults.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-3 rounded-xl cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500/40 shadow-sm'
                      : 'bg-slate-900/30 border-slate-800/80 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {item.type === 'note' && (
                        <FileText className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      )}
                      {item.type === 'vault' && (
                        <Compass className="w-4 h-4 text-sky-400 flex-shrink-0" />
                      )}
                      {item.type === 'journal' && (
                        <BookOpen className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      )}
                      <span className="font-semibold text-sm text-white truncate">
                        {highlightMatches(item.title, query)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {item.category && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {item.category}
                        </span>
                      )}
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </div>

                  {item.snippet && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {highlightMatches(item.snippet, query)}
                    </p>
                  )}

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <Tag className="w-3 h-3 text-slate-500" />
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/30 text-purple-300 border border-purple-500/20"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 border-t border-slate-800/80 bg-[#090a0f] text-[11px] text-slate-400 flex items-center justify-between">
          <span>Found {searchResults.length} knowledge items</span>
          <div className="flex items-center gap-3">
            <span>Click item to jump</span>
          </div>
        </div>
      </div>
    </div>
  );
};
