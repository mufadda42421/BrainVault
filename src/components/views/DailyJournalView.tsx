import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  Lock,
  Sparkles,
  Search,
  Trash2,
  Plus,
  Smile,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { JournalEntry, JournalMood } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { EmptyState } from '../common/EmptyState';

const REFLECTION_PROMPTS = [
  'What was the most fascinating idea or insight you encountered today?',
  'What challenge did you face today, and how did your perspective shift?',
  'What is one high-leverage skill or concept you want to master this month?',
  'What made you feel energized or curious today?',
  'If you could leave a one-sentence memo for your future self from today, what is it?',
];

const MOODS: { id: JournalMood; label: string; emoji: string; color: string }[] = [
  { id: 'great', label: 'Great', emoji: '🚀', color: 'text-purple-400 border-purple-500/40 bg-purple-950/30' },
  { id: 'good', label: 'Good', emoji: '✨', color: 'text-sky-400 border-sky-500/40 bg-sky-950/30' },
  { id: 'neutral', label: 'Calm', emoji: '🌿', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30' },
  { id: 'reflective', label: 'Deep', emoji: '🌌', color: 'text-indigo-400 border-indigo-500/40 bg-indigo-950/30' },
  { id: 'challenging', label: 'Tough', emoji: '🧗', color: 'text-rose-400 border-rose-500/40 bg-rose-950/30' },
];

export const DailyJournalView: React.FC = () => {
  const { journals, createJournalEntry, updateJournalEntry, deleteJournalEntry } = useData();

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [searchQuery, setSearchQuery] = useState('');

  // Active entry for selectedDate
  const currentEntry = useMemo(() => {
    return journals.find((j) => j.date === selectedDate);
  }, [journals, selectedDate]);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<JournalMood>('good');
  const [prompt, setPrompt] = useState(REFLECTION_PROMPTS[0]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentEntry) {
      setTitle(currentEntry.title);
      setContent(currentEntry.content);
      setMood(currentEntry.mood);
      setPrompt(currentEntry.reflectionPrompt || REFLECTION_PROMPTS[0]);
      setIsPrivate(currentEntry.isPrivate);
    } else {
      setTitle(`Reflections for ${selectedDate}`);
      setContent('');
      setMood('good');
      setPrompt(REFLECTION_PROMPTS[0]);
      setIsPrivate(false);
    }
  }, [currentEntry, selectedDate]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (currentEntry) {
        await updateJournalEntry(currentEntry.id, {
          title,
          content,
          mood,
          reflectionPrompt: prompt,
          isPrivate,
        });
      } else {
        await createJournalEntry({
          date: selectedDate,
          title: title || `Reflections for ${selectedDate}`,
          content,
          mood,
          reflectionPrompt: prompt,
          isPrivate,
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleShiftDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const filteredPastEntries = useMemo(() => {
    return journals
      .filter((j) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return j.title.toLowerCase().includes(q) || j.content.toLowerCase().includes(q) || j.date.includes(q);
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [journals, searchQuery]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-purple-400" />
            <span>Daily Journal & Reflections</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track daily headspace, mental models, mood, and cognitive breakthroughs
          </p>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
          <button
            onClick={() => handleShiftDate(-1)}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-xs sm:text-sm font-mono text-purple-300 font-semibold focus:outline-none cursor-pointer px-1"
          />
          <button
            onClick={() => handleShiftDate(1)}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {selectedDate !== todayStr && (
            <button
              onClick={() => setSelectedDate(todayStr)}
              className="text-[11px] px-2 py-1 bg-purple-600/30 text-purple-300 rounded-lg hover:bg-purple-600/50 transition font-medium"
            >
              Today
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Journal Entry Editor (2 cols) */}
        <GlassCard className="p-6 lg:col-span-2 space-y-5">
          {/* Mood Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              How was your headspace today?
            </label>
            <div className="grid grid-cols-5 gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMood(m.id)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition ${
                    mood === m.id
                      ? `${m.color} ring-2 ring-purple-500/40 shadow-md`
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-xl mb-1">{m.emoji}</span>
                  <span className="text-[11px] font-medium">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reflection Prompt */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Reflection Prompt</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  const next =
                    REFLECTION_PROMPTS[
                      (REFLECTION_PROMPTS.indexOf(prompt) + 1) % REFLECTION_PROMPTS.length
                    ];
                  setPrompt(next);
                }}
                className="text-[11px] text-purple-400 hover:text-purple-300 transition"
              >
                Change Prompt
              </button>
            </div>
            <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200 italic leading-relaxed">
              "{prompt}"
            </div>
          </div>

          {/* Entry Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Entry Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Breakthroughs in Quantum Algorithms & Focus"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-purple-500 focus:outline-none text-white text-sm"
            />
          </div>

          {/* Entry Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Thoughts, Insights & Reflections
            </label>
            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write freely. BrainVault keeps your journal private and encrypted..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-purple-500 focus:outline-none text-white text-sm leading-relaxed custom-scrollbar"
            />
          </div>

          {/* Privacy & Save Actions */}
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="rounded text-purple-600 bg-slate-900 border-slate-700"
              />
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span>Mark as Private Journal</span>
            </label>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition shadow-md shadow-purple-600/20 active:scale-95 disabled:opacity-50"
            >
              <span>{isSaving ? 'Saving...' : currentEntry ? 'Update Entry' : 'Save Entry'}</span>
            </button>
          </div>
        </GlassCard>

        {/* Previous Entries List (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-tight">Journal History</h2>
            <span className="text-xs text-slate-500 font-mono">{journals.length} entries</span>
          </div>

          {/* Search previous entries */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search past entries..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-purple-500 focus:outline-none text-xs text-white"
            />
          </div>

          {filteredPastEntries.length === 0 ? (
            <div className="p-6 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 text-center text-slate-500">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30 text-purple-400" />
              <p className="text-xs font-semibold text-slate-400">No journal entries yet</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Save your reflection for today to start your streak
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto custom-scrollbar">
              {filteredPastEntries.map((j) => {
                const moodObj = MOODS.find((m) => m.id === j.mood);
                const isCurrent = j.date === selectedDate;
                return (
                  <GlassCard
                    key={j.id}
                    hoverEffect
                    onClick={() => setSelectedDate(j.date)}
                    className={`p-3.5 cursor-pointer flex items-center justify-between border-slate-800 ${
                      isCurrent ? 'border-purple-500/50 bg-purple-950/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl flex-shrink-0">{moodObj?.emoji || '✨'}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-purple-300 font-bold">
                            {j.date}
                          </span>
                          {j.isPrivate && <Lock className="w-3 h-3 text-slate-500" />}
                        </div>
                        <h4 className="text-xs font-semibold text-white truncate">{j.title}</h4>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete journal entry for ${j.date}?`)) {
                          deleteJournalEntry(j.id);
                        }
                      }}
                      className="p-1 text-slate-500 hover:text-red-400 transition"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
