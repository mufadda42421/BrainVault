import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Pin,
  Star,
  Archive,
  Trash2,
  Tag,
  Grid,
  List as ListIcon,
  FileText,
  Clock,
  Sparkles,
  Check,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { NoteItem } from '../../types';
import { NoteEditor } from '../notes/NoteEditor';
import { GlassCard } from '../common/GlassCard';
import { EmptyState } from '../common/EmptyState';

const CATEGORIES = [
  'All',
  'Work',
  'Study',
  'Tech & Code',
  'Ideas & Thoughts',
  'Research',
  'Personal',
  'Books & Reading',
  'Projects',
  'Other',
];

interface NotesViewProps {
  selectedNote: NoteItem | null;
  setSelectedNote: (note: NoteItem | null) => void;
  onOpenQuickAdd: () => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  selectedNote,
  setSelectedNote,
  onOpenQuickAdd,
}) => {
  const { notes, createNote, deleteNote, togglePinNote, toggleFavoriteNote, toggleArchiveNote } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title' | 'category'>('updated');
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');

  // Filter notes
  const filteredNotes = useMemo(() => {
    return notes
      .filter((n) => !n.isDeleted && !n.isArchived)
      .filter((n) => {
        if (selectedCategory !== 'All' && n.category !== selectedCategory) {
          return false;
        }
        if (selectedTag && !(n.tags || []).includes(selectedTag)) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = n.title.toLowerCase().includes(q);
          const matchContent = n.content.toLowerCase().includes(q);
          const matchTags = (n.tags || []).some((t) => t.toLowerCase().includes(q));
          return matchTitle || matchContent || matchTags;
        }
        return true;
      })
      .sort((a, b) => {
        // Pinned notes always surface first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        if (sortBy === 'updated') {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
        if (sortBy === 'created') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'category') {
          return (a.category || '').localeCompare(b.category || '');
        }
        return 0;
      });
  }, [notes, selectedCategory, selectedTag, searchQuery, sortBy]);

  // All unique tags for tag cloud
  const allTags = useMemo(() => {
    const set = new Set<string>();
    notes
      .filter((n) => !n.isDeleted && !n.isArchived)
      .forEach((n) => {
        (n.tags || []).forEach((t) => set.add(t));
      });
    return Array.from(set).slice(0, 15);
  }, [notes]);

  const handleCreateNewNote = async () => {
    const newNote = await createNote({
      title: 'Untitled Note',
      category: selectedCategory !== 'All' ? selectedCategory : 'Ideas & Thoughts',
      content: '',
      tags: selectedTag ? [selectedTag] : [],
    });
    setSelectedNote(newNote);
  };

  // If a note is selected for editing, show the rich NoteEditor
  if (selectedNote) {
    // Keep reference fresh if note was updated in DataContext
    const currentNote = notes.find((n) => n.id === selectedNote.id) || selectedNote;
    return <NoteEditor note={currentNote} onBack={() => setSelectedNote(null)} />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">My Notes</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Capture, synthesize, and interconnect your thoughts with AI
          </p>
        </div>

        <button
          onClick={handleCreateNewNote}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-md shadow-purple-600/25 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl backdrop-blur-xl">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by title, content or tags..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/70 border border-slate-800 focus:border-purple-500 focus:outline-none text-white text-xs sm:text-sm"
          />
        </div>

        {/* Sort & Layout Controls */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          {/* Sort selector */}
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent border-none text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="updated">Recently Updated</option>
              <option value="created">Recently Created</option>
              <option value="title">Title (A-Z)</option>
              <option value="category">Category</option>
            </select>
          </div>

          {/* Grid vs List view toggle */}
          <div className="flex items-center rounded-xl bg-slate-950/70 border border-slate-800 p-0.5">
            <button
              onClick={() => setViewLayout('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewLayout === 'grid' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewLayout('list')}
              className={`p-1.5 rounded-lg transition ${
                viewLayout === 'list' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs custom-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl font-medium transition flex-shrink-0 ${
              selectedCategory === cat
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/20'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tags Chips Bar */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-slate-500 flex items-center gap-1 text-[11px] mr-1">
            <Tag className="w-3 h-3" /> Tags:
          </span>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2 py-0.5 rounded-lg font-mono text-[11px] border transition ${
                selectedTag === tag
                  ? 'bg-purple-500/30 text-purple-200 border-purple-400/50'
                  : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:text-slate-300'
              }`}
            >
              #{tag}
            </button>
          ))}
          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="text-[11px] text-purple-400 hover:underline ml-1"
            >
              Clear tag
            </button>
          )}
        </div>
      )}

      {/* Notes List or Grid */}
      {filteredNotes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={searchQuery || selectedCategory !== 'All' ? 'No matching notes found' : 'No notes created yet'}
          description={
            searchQuery || selectedCategory !== 'All'
              ? 'Try adjusting your filters, tags, or search query.'
              : 'BrainVault is your personal digital thinking canvas. Start by creating your first note.'
          }
          actionLabel="Create First Note"
          onAction={handleCreateNewNote}
        />
      ) : viewLayout === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <GlassCard
              key={note.id}
              hoverEffect
              onClick={() => setSelectedNote(note)}
              className="p-5 cursor-pointer flex flex-col justify-between group relative border-slate-800/80 hover:border-purple-500/40"
            >
              <div>
                {/* Card header tags & pin */}
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-semibold text-purple-300 text-[11px] bg-purple-950/40 px-2 py-0.5 rounded-md border border-purple-500/20">
                    {note.category}
                  </span>

                  <div className="flex items-center gap-1 text-slate-500">
                    {note.isPinned && (
                      <Pin className="w-3.5 h-3.5 text-purple-400" />
                    )}
                    {note.isFavorite && (
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    )}
                    <span className="text-[10px] font-mono text-slate-500 ml-1">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-base text-white group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug mb-2">
                  {note.title}
                </h3>

                {/* Content snippet */}
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed font-sans">
                  {note.content.replace(/<[^>]*>/g, '') || 'Empty note...'}
                </p>
              </div>

              {/* Footer tags */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-1 flex-wrap">
                  {(note.tags || []).slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/60 text-slate-400 font-mono"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                <span className="text-[10px] text-purple-400 font-medium group-hover:underline">
                  Edit Note →
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        /* List Layout */
        <div className="space-y-2">
          {filteredNotes.map((note) => (
            <GlassCard
              key={note.id}
              hoverEffect
              onClick={() => setSelectedNote(note)}
              className="p-4 cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {note.isPinned && <Pin className="w-3.5 h-3.5 text-purple-400" />}
                    {note.isFavorite && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                    <h3 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors truncate">
                      {note.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {note.content.replace(/<[^>]*>/g, '') || 'Empty note...'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0 text-xs">
                <span className="text-[11px] bg-purple-950/40 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20 hidden sm:inline">
                  {note.category}
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};
