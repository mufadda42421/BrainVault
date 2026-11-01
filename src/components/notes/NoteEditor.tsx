import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Pin,
  Star,
  Archive,
  Trash2,
  Tag,
  Sparkles,
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Code,
  Quote,
  CheckSquare,
  Copy,
  Check,
  Brain,
  Lightbulb,
  FileQuestion,
  Network,
  RotateCcw,
  Plus,
  X,
  Layers,
} from 'lucide-react';
import { NoteItem, Flashcard, ConnectionResult } from '../../types';
import { useData } from '../../context/DataContext';

interface NoteEditorProps {
  note: NoteItem;
  onBack: () => void;
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

export const NoteEditor: React.FC<NoteEditorProps> = ({ note, onBack }) => {
  const { updateNote, deleteNote, togglePinNote, toggleFavoriteNote, toggleArchiveNote, notes } = useData();

  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [category, setCategory] = useState(note.category || 'Ideas & Thoughts');
  const [tags, setTags] = useState<string[]>(note.tags || []);
  const [newTagInput, setNewTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // AI Assistant states
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiActionType, setAiActionType] = useState<string | null>(null);
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [connections, setConnections] = useState<ConnectionResult[]>([]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync internal state if active note changes
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category || 'Ideas & Thoughts');
    setTags(note.tags || []);
    setAiOutput(null);
    setFlashcards([]);
    setConnections([]);
  }, [note.id]);

  // Debounced autosave
  const triggerAutosave = (newTitle: string, newContent: string, newCat: string, newTagsList: string[]) => {
    setIsSaving(true);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await updateNote(note.id, {
          title: newTitle,
          content: newContent,
          category: newCat,
          tags: newTagsList,
        });
      } finally {
        setIsSaving(false);
      }
    }, 800);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    triggerAutosave(val, content, category, tags);
  };

  const handleContentChange = (val: string) => {
    setContent(val);
    triggerAutosave(title, val, category, tags);
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    triggerAutosave(title, content, val, tags);
  };

  const handleAddTag = () => {
    const trimmed = newTagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      const updated = [...tags, trimmed];
      setTags(updated);
      setNewTagInput('');
      triggerAutosave(title, content, category, updated);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = tags.filter((t) => t !== tagToRemove);
    setTags(updated);
    triggerAutosave(title, content, category, updated);
  };

  // Text formatting insertion helper
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = prefix + selectedText + suffix;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    triggerAutosave(title, newContent, category, tags);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  // Run AI action via backend API
  const handleAiAction = async (action: string) => {
    if (!content.trim()) {
      alert('Please write or add some content first to use AI features.');
      return;
    }

    setIsAiLoading(true);
    setAiActionType(action);
    setAiOutput(null);
    setFlashcards([]);
    setConnections([]);

    try {
      const otherNotes = notes
        .filter((n) => n.id !== note.id && !n.isDeleted)
        .map((n) => ({
          id: n.id,
          title: n.title,
          category: n.category,
          snippet: n.content.slice(0, 300),
        }));

      const res = await fetch('/api/ai/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          title,
          content,
          allNotesSummary: otherNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'AI generation failed');
      }

      if (action === 'study_flashcards') {
        if (Array.isArray(data.result)) {
          setFlashcards(data.result);
          setActiveCardIndex(0);
          setIsCardFlipped(false);
        } else {
          setAiOutput('No flashcards could be generated from this text.');
        }
      } else if (action === 'find_connections') {
        if (Array.isArray(data.result)) {
          setConnections(data.result);
        } else {
          setAiOutput('No direct connections found with other notes.');
        }
      } else {
        setAiOutput(data.result);
      }
    } catch (err: any) {
      console.error(err);
      setAiOutput(`Error: ${err.message || 'Failed to process AI request'}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApplyAiRewrite = () => {
    if (aiOutput) {
      setContent(aiOutput);
      triggerAutosave(title, aiOutput, category, tags);
      setAiOutput(null);
    }
  };

  const handleAppendAiOutput = () => {
    if (aiOutput) {
      const updated = content + '\n\n---\n### AI Synthesis\n' + aiOutput;
      setContent(updated);
      triggerAutosave(title, updated, category, tags);
      setAiOutput(null);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#090a0f] text-slate-100">
      {/* Top action toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-slate-800 bg-[#0b0d14]/70 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Back to notes list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <span className="text-xs text-slate-500 font-mono">
            {isSaving ? (
              <span className="text-purple-400 flex items-center gap-1.5 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> Saving...
              </span>
            ) : (
              'Saved'
            )}
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => togglePinNote(note.id)}
            className={`p-2 rounded-xl transition ${
              note.isPinned
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title={note.isPinned ? 'Unpin note' : 'Pin note to top'}
          >
            <Pin className="w-4 h-4" />
          </button>

          <button
            onClick={() => toggleFavoriteNote(note.id)}
            className={`p-2 rounded-xl transition ${
              note.isFavorite
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title={note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className="w-4 h-4" fill={note.isFavorite ? 'currentColor' : 'none'} />
          </button>

          <button
            onClick={handleCopy}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Copy note text"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={() => toggleArchiveNote(note.id)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={note.isArchived ? 'Unarchive note' : 'Archive note'}
          >
            <Archive className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (confirm('Move this note to trash?')) {
                deleteNote(note.id);
                onBack();
              }
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
            title="Move to trash"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main split area: Editor on left/center, AI Assistant drawer on right */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-y-auto px-4 sm:px-8 py-6 custom-scrollbar max-w-4xl mx-auto w-full">
          {/* Category & Tags Row */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-purple-300 font-semibold focus:border-purple-500 focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Tags chips */}
            <div className="flex items-center gap-1.5 flex-wrap flex-1">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-mono group"
                >
                  #{t}
                  <button
                    onClick={() => handleRemoveTag(t)}
                    className="text-slate-400 hover:text-red-400 p-0.5 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {tags.length < 10 && (
                <div className="inline-flex items-center gap-1">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="+ add tag"
                    className="w-20 px-2 py-1 rounded-lg bg-transparent text-xs text-slate-400 focus:w-28 focus:bg-slate-900 focus:text-white border border-transparent focus:border-slate-700 outline-none transition-all"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Title Input */}
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled Note..."
            className="w-full text-2xl sm:text-3xl font-extrabold text-white bg-transparent border-none focus:outline-none mb-4 placeholder-slate-600 tracking-tight"
          />

          {/* Markdown Formatting Bar */}
          <div className="flex items-center gap-1 py-1.5 px-2 mb-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-400 overflow-x-auto">
            <button
              onClick={() => insertFormatting('# ')}
              className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800"
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertFormatting('## ')}
              className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800"
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-slate-800 mx-1" />
            <button
              onClick={() => insertFormatting('**', '**')}
              className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800"
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertFormatting('*', '*')}
              className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800"
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-slate-800 mx-1" />
            <button
              onClick={() => insertFormatting('- ')}
              className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800"
              title="Bullet list"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertFormatting('1. ')}
              className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800"
              title="Numbered list"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertFormatting('- [ ] ')}
              className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800"
              title="Checklist"
            >
              <CheckSquare className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-slate-800 mx-1" />
            <button
              onClick={() => insertFormatting('```\n', '\n```')}
              className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800"
              title="Code block"
            >
              <Code className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertFormatting('> ')}
              className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800"
              title="Quote block"
            >
              <Quote className="w-4 h-4" />
            </button>
          </div>

          {/* Note Content Textarea */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Type your notes, ideas, code snippets, or thoughts here... (Supports Markdown)"
            className="w-full flex-1 min-h-[400px] bg-transparent resize-none border-none focus:outline-none text-slate-200 placeholder-slate-600 text-base leading-relaxed font-sans"
          />
        </div>

        {/* AI Copilot Side Panel */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-800 bg-[#0b0d14]/90 flex flex-col p-4 sm:p-5 overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">AI Brain Copilot</h3>
              <p className="text-[10px] text-slate-400">Cognitive intelligence for this note</p>
            </div>
          </div>

          {/* Quick AI Action Pills */}
          <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
            <button
              onClick={() => handleAiAction('summarize')}
              disabled={isAiLoading}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 hover:bg-purple-950/20 text-slate-300 font-medium transition text-left disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
              <span>Summarize</span>
            </button>

            <button
              onClick={() => handleAiAction('explain')}
              disabled={isAiLoading}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 hover:bg-purple-950/20 text-slate-300 font-medium transition text-left disabled:opacity-50"
            >
              <Brain className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
              <span>Explain Simply</span>
            </button>

            <button
              onClick={() => handleAiAction('generate_ideas')}
              disabled={isAiLoading}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 hover:bg-purple-950/20 text-slate-300 font-medium transition text-left disabled:opacity-50"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>6 Ideas</span>
            </button>

            <button
              onClick={() => handleAiAction('rewrite')}
              disabled={isAiLoading}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 hover:bg-purple-950/20 text-slate-300 font-medium transition text-left disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Polish & Rewrite</span>
            </button>

            <button
              onClick={() => handleAiAction('extract_points')}
              disabled={isAiLoading}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 hover:bg-purple-950/20 text-slate-300 font-medium transition text-left disabled:opacity-50"
            >
              <List className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
              <span>Key Points</span>
            </button>

            <button
              onClick={() => handleAiAction('generate_questions')}
              disabled={isAiLoading}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 hover:bg-purple-950/20 text-slate-300 font-medium transition text-left disabled:opacity-50"
            >
              <FileQuestion className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
              <span>Study Quiz</span>
            </button>

            <button
              onClick={() => handleAiAction('study_flashcards')}
              disabled={isAiLoading}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 hover:bg-purple-950/20 text-slate-300 font-medium transition text-left disabled:opacity-50"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <span>Flashcards</span>
            </button>

            <button
              onClick={() => handleAiAction('find_connections')}
              disabled={isAiLoading}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 hover:bg-purple-950/20 text-slate-300 font-medium transition text-left disabled:opacity-50"
            >
              <Network className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
              <span>Connections</span>
            </button>
          </div>

          {/* AI Result Area */}
          {isAiLoading && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center rounded-2xl bg-purple-950/20 border border-purple-500/20">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300 mb-3 animate-pulse">
                <Sparkles className="w-5 h-5 animate-spin" />
              </div>
              <p className="text-xs font-semibold text-purple-200">
                Synthesizing with Gemini 3.8 Flash...
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Analyzing note depth, context, and semantic graph
              </p>
            </div>
          )}

          {/* 1. Flashcards Viewer */}
          {!isAiLoading && flashcards.length > 0 && (
            <div className="flex-1 flex flex-col space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-purple-300">
                  Card {activeCardIndex + 1} of {flashcards.length}
                </span>
                <span className="text-slate-500">Tap to flip card</span>
              </div>

              {/* Interactive Flashcard */}
              <div
                onClick={() => setIsCardFlipped(!isCardFlipped)}
                className="min-h-[160px] p-5 rounded-2xl bg-gradient-to-tr from-purple-950/40 to-slate-900 border border-purple-500/40 cursor-pointer flex flex-col justify-center text-center shadow-lg transition-transform active:scale-98"
              >
                <span className="text-[10px] uppercase font-mono tracking-widest text-purple-400 mb-2">
                  {isCardFlipped ? 'Answer' : 'Question'}
                </span>
                <p className="text-sm text-white font-medium leading-relaxed">
                  {isCardFlipped
                    ? flashcards[activeCardIndex].answer
                    : flashcards[activeCardIndex].question}
                </p>
              </div>

              {/* Card navigation */}
              <div className="flex items-center justify-between pt-1">
                <button
                  disabled={activeCardIndex === 0}
                  onClick={() => {
                    setActiveCardIndex((p) => Math.max(0, p - 1));
                    setIsCardFlipped(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={activeCardIndex === flashcards.length - 1}
                  onClick={() => {
                    setActiveCardIndex((p) => Math.min(flashcards.length - 1, p + 1));
                    setIsCardFlipped(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold disabled:opacity-40"
                >
                  Next Card
                </button>
              </div>
            </div>
          )}

          {/* 2. Knowledge Connections */}
          {!isAiLoading && connections.length > 0 && (
            <div className="flex-1 space-y-2.5">
              <span className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5" /> Discovered Connections ({connections.length})
              </span>
              <div className="space-y-2">
                {connections.map((c, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-900/80 border border-purple-500/30 text-left"
                  >
                    <div className="text-xs font-bold text-white mb-1">
                      Link: "{c.targetTitle}"
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {c.connectionReason}
                    </p>
                    {c.suggestedAction && (
                      <div className="mt-2 text-[10px] text-purple-300 bg-purple-950/40 p-1.5 rounded-lg border border-purple-500/20">
                        💡 Suggestion: {c.suggestedAction}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Text output (summary, explanation, rewrite, questions) */}
          {!isAiLoading && aiOutput && (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-purple-300 uppercase tracking-wide">
                  {aiActionType} Result
                </span>
                <button
                  onClick={() => setAiOutput(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 p-3.5 rounded-xl bg-slate-900/90 border border-purple-500/30 text-xs text-slate-200 leading-relaxed overflow-y-auto whitespace-pre-wrap max-h-72 custom-scrollbar">
                {aiOutput}
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                {aiActionType === 'rewrite' ? (
                  <button
                    onClick={handleApplyAiRewrite}
                    className="col-span-2 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition"
                  >
                    Replace Note With Polished Version
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleAppendAiOutput}
                      className="py-1.5 px-2 rounded-xl bg-purple-600/30 border border-purple-500/40 hover:bg-purple-600/50 text-purple-200 font-medium transition"
                    >
                      Append to Note
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(aiOutput);
                        alert('Copied to clipboard!');
                      }}
                      className="py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
                    >
                      Copy Result
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {!isAiLoading && !aiOutput && flashcards.length === 0 && connections.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500 rounded-2xl border border-dashed border-slate-800">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30 text-purple-400" />
              <p className="text-xs font-medium text-slate-400">Ready to assist</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-[200px]">
                Click any action above to summarize, study, or discover hidden connections
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
