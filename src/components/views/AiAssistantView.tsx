import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Brain,
  Copy,
  Check,
  Plus,
  RefreshCw,
  FileText,
  Compass,
  AlertCircle,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { AIChatMessage } from '../../types';
import { GlassCard } from '../common/GlassCard';

export const AiAssistantView: React.FC = () => {
  const { notes, vaultItems, createNote } = useData();

  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hello! I am your **BrainVault AI Copilot**. I have indexed your saved notes and knowledge vault items to help you synthesize, query, connect, and retrieve your personal second brain.\n\nAsk me anything about your saved knowledge, request summaries, or discover hidden connections between your notes!",
      timestamp: new Date().toISOString(),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedNoteId, setSavedNoteId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const activeNotes = notes.filter((n) => !n.isDeleted && !n.isArchived);
  const activeVault = vaultItems.filter((v) => !v.isDeleted && !v.isArchived);

  const handleSend = async (customMessage?: string) => {
    const textToSend = customMessage || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: AIChatMessage = {
      id: 'user_' + Date.now(),
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customMessage) setInput('');
    setLoading(true);

    try {
      // Pass actual user notes and vault items to the backend
      const contextNotes = activeNotes.map((n) => ({
        id: n.id,
        title: n.title,
        category: n.category,
        tags: n.tags || [],
        content: n.content.replace(/<[^>]*>/g, '').slice(0, 2000),
      }));

      const contextVaultItems = activeVault.map((v) => ({
        id: v.id,
        title: v.title,
        type: v.type,
        category: v.category,
        description: v.description,
        content: v.content,
        url: v.url,
      }));

      const history = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-6)
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          history,
          contextNotes,
          contextVaultItems,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'AI generation failed');
      }

      const assistantMsg: AIChatMessage = {
        id: 'assistant_' + Date.now(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'error_' + Date.now(),
          role: 'assistant',
          content: `⚠️ ${err.message || 'Error communicating with AI assistant. Please try again.'}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveAsNote = async (msg: AIChatMessage) => {
    try {
      const titleLine = msg.content.split('\n')[0].replace(/[#*]/g, '').trim().slice(0, 80);
      const noteTitle = titleLine || 'AI Brain Synthesis';
      await createNote({
        title: `AI: ${noteTitle}`,
        content: msg.content,
        category: 'Research',
        tags: ['ai-synthesis', 'brainvault'],
      });
      setSavedNoteId(msg.id);
      setTimeout(() => setSavedNoteId(null), 2500);
    } catch (e) {
      console.error(e);
      alert('Could not save note');
    }
  };

  const PROMPT_SUGGESTIONS = [
    'What are the core themes across my saved notes?',
    'Find surprising connections between my notes and bookmarks',
    'Summarize all ideas I have captured so far',
    'Generate 5 deep reflection questions from my vault',
    'What gaps in knowledge should I explore next?',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto p-4 sm:p-6 text-left">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <Brain className="w-5 h-5 text-purple-200" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Brain Copilot</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Gemini 3.8 Flash
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Grounded in {activeNotes.length} notes & {activeVault.length} knowledge items
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm('Clear chat history?')) {
              setMessages([
                {
                  id: 'welcome_new',
                  role: 'assistant',
                  content:
                    'Chat history cleared. What would you like to investigate in your BrainVault today?',
                  timestamp: new Date().toISOString(),
                },
              ]);
            }
          }}
          className="text-xs text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-slate-800 transition"
        >
          Clear Chat
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4 custom-scrollbar">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 border border-purple-500/30 text-purple-300 shadow-sm'
                }`}
              >
                {isUser ? 'You' : <Sparkles className="w-4 h-4 text-purple-400" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/10'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 shadow-xl'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed space-y-2">
                  {m.content}
                </div>

                {/* Assistant footer actions */}
                {!isUser && m.id !== 'welcome' && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-3 text-xs text-slate-400">
                    <button
                      onClick={() => handleCopy(m.id, m.content)}
                      className="inline-flex items-center gap-1 hover:text-white transition"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleSaveAsNote(m)}
                      className="inline-flex items-center gap-1 hover:text-purple-300 transition"
                    >
                      {savedNoteId === m.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-purple-400" />
                          <span className="text-purple-300">Saved to Notes</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Save as Note</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-purple-300 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <span>Scanning saved vault & generating synthesis...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Suggestions */}
      {messages.length <= 2 && (
        <div className="py-2 flex items-center gap-2 overflow-x-auto custom-scrollbar">
          {PROMPT_SUGGESTIONS.map((p) => (
            <button
              key={p}
              onClick={() => handleSend(p)}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex-shrink-0 transition"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Chat Input Bar */}
      <div className="pt-3 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your BrainVault anything about your notes, concepts, or connections..."
            className="w-full pl-4 pr-12 py-3 rounded-2xl bg-slate-900 border border-slate-800 focus:border-purple-500 focus:outline-none text-white text-sm placeholder-slate-500 shadow-inner"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 p-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white transition active:scale-95 shadow-md shadow-purple-600/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-slate-500 text-center mt-2">
          BrainVault AI strictly answers from your saved knowledge archive. Private & secure.
        </p>
      </div>
    </div>
  );
};
