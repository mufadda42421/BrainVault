import React, { useState } from 'react';
import {
  X,
  FileText,
  Compass,
  BookOpen,
  FolderPlus,
  Plus,
  Link as LinkIcon,
  Sparkles,
  Tag,
  Lock,
  Globe,
  Youtube,
  Image as ImageIcon,
  FileCode,
  Lightbulb,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { VaultItemType, JournalMood } from '../../types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'note' | 'vault' | 'journal' | 'collection';
}

const CATEGORIES = [
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

const REFLECTION_PROMPTS = [
  'What was the most fascinating idea or insight you encountered today?',
  'What challenge did you face today, and how did your perspective shift?',
  'What is one high-leverage skill or concept you want to master this month?',
  'What made you feel energized or curious today?',
  'If you could leave a one-sentence memo for your future self from today, what is it?',
];

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'note',
}) => {
  const { createNote, createVaultItem, createJournalEntry, createCollection } = useData();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'note' | 'vault' | 'journal' | 'collection'>(defaultTab);

  // Note form state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteCategory, setNoteCategory] = useState('Ideas & Thoughts');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState('');
  const [notePinned, setNotePinned] = useState(false);
  const [noteFavorite, setNoteFavorite] = useState(false);

  // Vault form state
  const [vaultType, setVaultType] = useState<VaultItemType>('url');
  const [vaultTitle, setVaultTitle] = useState('');
  const [vaultUrl, setVaultUrl] = useState('');
  const [vaultDescription, setVaultDescription] = useState('');
  const [vaultCategory, setVaultCategory] = useState('Research');
  const [vaultTags, setVaultTags] = useState('');

  // Journal form state
  const [journalTitle, setJournalTitle] = useState('');
  const [journalMood, setJournalMood] = useState<JournalMood>('good');
  const [journalPrompt, setJournalPrompt] = useState(REFLECTION_PROMPTS[0]);
  const [journalContent, setJournalContent] = useState('');
  const [journalPrivate, setJournalPrivate] = useState(false);

  // Collection form state
  const [colName, setColName] = useState('');
  const [colDesc, setColDesc] = useState('');
  const [colColor, setColColor] = useState('#8b5cf6');
  const [colIcon, setColIcon] = useState('folder');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const parseTags = (str: string): string[] => {
    return str
      .split(/[,#\s]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .slice(0, 10);
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) {
      setError('Please provide a note title');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createNote({
        title: noteTitle.trim(),
        category: noteCategory,
        content: noteContent,
        tags: parseTags(noteTags),
        isPinned: notePinned,
        isFavorite: noteFavorite,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateVaultItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaultTitle.trim()) {
      setError('Please provide a title');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createVaultItem({
        type: vaultType,
        title: vaultTitle.trim(),
        url: vaultUrl.trim(),
        description: vaultDescription.trim(),
        category: vaultCategory,
        tags: parseTags(vaultTags),
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save vault item');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];
    setSaving(true);
    setError(null);
    try {
      await createJournalEntry({
        title: journalTitle.trim() || `Journal ${today}`,
        date: today,
        mood: journalMood,
        reflectionPrompt: journalPrompt,
        content: journalContent,
        isPrivate: journalPrivate,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save journal entry');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colName.trim()) {
      setError('Please provide a collection name');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createCollection({
        name: colName.trim(),
        description: colDesc.trim(),
        color: colColor,
        icon: colIcon,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save collection');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0d1017] border border-purple-500/30 shadow-2xl overflow-hidden flex flex-col text-left">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0b0d14]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Quick Add</h3>
              <p className="text-xs text-slate-400">Capture ideas, links, or notes instantly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-900/40 px-6 pt-2 text-xs">
          <button
            onClick={() => setActiveTab('note')}
            className={`flex items-center gap-2 pb-3 px-3 font-semibold border-b-2 transition ${
              activeTab === 'note'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Note</span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`flex items-center gap-2 pb-3 px-3 font-semibold border-b-2 transition ${
              activeTab === 'vault'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Vault Bookmark</span>
          </button>

          <button
            onClick={() => setActiveTab('journal')}
            className={`flex items-center gap-2 pb-3 px-3 font-semibold border-b-2 transition ${
              activeTab === 'journal'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Journal</span>
          </button>

          <button
            onClick={() => setActiveTab('collection')}
            className={`flex items-center gap-2 pb-3 px-3 font-semibold border-b-2 transition ${
              activeTab === 'collection'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Collection</span>
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Tab Forms */}
        <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
          {/* 1. Note Tab */}
          {activeTab === 'note' && (
            <form onSubmit={handleCreateNote} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Note Title</label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. Cognitive Architecture in Modern LLMs"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-purple-500 focus:outline-none text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:border-purple-500 focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tags</label>
                  <input
                    type="text"
                    value={noteTags}
                    onChange={(e) => setNoteTags(e.target.value)}
                    placeholder="ai, architecture, research"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-purple-500 focus:outline-none text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Content</label>
                <textarea
                  rows={4}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write thoughts, insights, or paste notes here..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-purple-500 focus:outline-none text-white text-sm custom-scrollbar"
                />
              </div>

              <div className="flex items-center gap-6 pt-1 text-xs text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notePinned}
                    onChange={(e) => setNotePinned(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500 bg-slate-900 border-slate-700"
                  />
                  <span>Pin to top</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noteFavorite}
                    onChange={(e) => setNoteFavorite(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500 bg-slate-900 border-slate-700"
                  />
                  <span>Mark as Favorite</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm transition shadow-md shadow-purple-600/25 active:scale-98 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Note to BrainVault'}
              </button>
            </form>
          )}

          {/* 2. Knowledge Vault Tab */}
          {activeTab === 'vault' && (
            <form onSubmit={handleCreateVaultItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Item Type</label>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {[
                    { id: 'url', label: 'Website', icon: Globe },
                    { id: 'youtube', label: 'YouTube', icon: Youtube },
                    { id: 'article', label: 'Article', icon: FileText },
                    { id: 'idea', label: 'Idea', icon: Lightbulb },
                  ].map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setVaultType(t.id as VaultItemType)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition ${
                          vaultType === t.id
                            ? 'bg-purple-900/40 border-purple-500 text-purple-300 shadow-sm'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-4 h-4 mb-1" />
                        <span className="text-[11px] font-medium">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={vaultTitle}
                  onChange={(e) => setVaultTitle(e.target.value)}
                  placeholder="e.g. Deep Learning Systems Engineering"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-purple-500 focus:outline-none text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  URL or Source Link
                </label>
                <input
                  type="url"
                  value={vaultUrl}
                  onChange={(e) => setVaultUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-purple-500 focus:outline-none text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={vaultCategory}
                    onChange={(e) => setVaultCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:border-purple-500 focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tags</label>
                  <input
                    type="text"
                    value={vaultTags}
                    onChange={(e) => setVaultTags(e.target.value)}
                    placeholder="engineering, bookmark"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-purple-500 focus:outline-none text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description / Annotations
                </label>
                <textarea
                  rows={3}
                  value={vaultDescription}
                  onChange={(e) => setVaultDescription(e.target.value)}
                  placeholder="Key summary or takeaway from this link..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-purple-500 focus:outline-none text-white text-sm custom-scrollbar"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm transition shadow-md shadow-purple-600/25 active:scale-98 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Add to Knowledge Vault'}
              </button>
            </form>
          )}

          {/* 3. Daily Journal Tab */}
          {activeTab === 'journal' && (
            <form onSubmit={handleCreateJournal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">How are you feeling?</label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { id: 'great', label: 'Great', emoji: '🚀' },
                    { id: 'good', label: 'Good', emoji: '✨' },
                    { id: 'neutral', label: 'Calm', emoji: '🌿' },
                    { id: 'reflective', label: 'Deep', emoji: '🌌' },
                    { id: 'challenging', label: 'Tough', emoji: '🧗' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setJournalMood(m.id as JournalMood)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition ${
                        journalMood === m.id
                          ? 'bg-purple-900/40 border-purple-500 text-white ring-2 ring-purple-500/20'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-xl mb-0.5">{m.emoji}</span>
                      <span className="text-[10px] font-medium">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">Daily Reflection Prompt</label>
                  <button
                    type="button"
                    onClick={() => {
                      const next =
                        REFLECTION_PROMPTS[
                          (REFLECTION_PROMPTS.indexOf(journalPrompt) + 1) % REFLECTION_PROMPTS.length
                        ];
                      setJournalPrompt(next);
                    }}
                    className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Cycle prompt
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200 italic">
                  "{journalPrompt}"
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Entry Title</label>
                <input
                  type="text"
                  value={journalTitle}
                  onChange={(e) => setJournalTitle(e.target.value)}
                  placeholder="Today's Reflections & Discoveries"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-purple-500 focus:outline-none text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Thoughts & Reflection</label>
                <textarea
                  rows={4}
                  required
                  value={journalContent}
                  onChange={(e) => setJournalContent(e.target.value)}
                  placeholder="Record what you learned, decisions made, or insights..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-purple-500 focus:outline-none text-white text-sm custom-scrollbar"
                />
              </div>

              <div className="flex items-center gap-2 pt-1 text-xs text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={journalPrivate}
                    onChange={(e) => setJournalPrivate(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500 bg-slate-900 border-slate-700"
                  />
                  <Lock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Private entry</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm transition shadow-md shadow-purple-600/25 active:scale-98 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Journal Entry'}
              </button>
            </form>
          )}

          {/* 4. Collection Tab */}
          {activeTab === 'collection' && (
            <form onSubmit={handleCreateCollection} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Collection Name
                </label>
                <input
                  type="text"
                  required
                  value={colName}
                  onChange={(e) => setColName(e.target.value)}
                  placeholder="e.g. AI Research & Prompts"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-purple-500 focus:outline-none text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={colDesc}
                  onChange={(e) => setColDesc(e.target.value)}
                  placeholder="What belongs in this collection?"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-purple-500 focus:outline-none text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Accent Color
                </label>
                <div className="flex items-center gap-3">
                  {[
                    { color: '#8b5cf6', label: 'Purple' },
                    { color: '#38bdf8', label: 'Sky' },
                    { color: '#10b981', label: 'Emerald' },
                    { color: '#f59e0b', label: 'Amber' },
                    { color: '#ec4899', label: 'Pink' },
                    { color: '#6366f1', label: 'Indigo' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => setColColor(c.color)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        colColor === c.color ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#0d1017]' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c.color }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full mt-3 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm transition shadow-md shadow-purple-600/25 active:scale-98 disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create Collection'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
