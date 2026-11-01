import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Moon,
  Sun,
  Download,
  HardDrive,
  LogOut,
  Smartphone,
  Shield,
  FileText,
  Check,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { GlassCard } from '../common/GlassCard';
import { PWAInstallButton } from '../common/PWAInstallButton';

export const SettingsView: React.FC = () => {
  const { user, userProfile, signOut, updateThemePreference } = useAuth();
  const { notes, vaultItems, collections, journals } = useData();
  const { theme, setTheme } = useTheme();

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // Storage and knowledge statistics
  const totalWords = notes.reduce((acc, n) => acc + (n.content ? n.content.split(/\s+/).length : 0), 0);
  const estimatedBytes = JSON.stringify({ notes, vaultItems, collections, journals }).length;
  const estimatedKb = (estimatedBytes / 1024).toFixed(1);

  // Export full JSON backup
  const handleExportJSON = () => {
    const backupData = {
      app: 'BrainVault',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      user: {
        userId: user?.uid,
        email: user?.email,
        displayName: userProfile?.displayName,
      },
      data: {
        notes,
        vaultItems,
        collections,
        journals,
      },
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BrainVault_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export notes as a single Markdown file
  const handleExportMarkdown = () => {
    let md = `# BrainVault Personal Knowledge Export\nExported on: ${new Date().toLocaleString()}\nTotal Notes: ${notes.length}\n\n---\n\n`;

    notes
      .filter((n) => !n.isDeleted)
      .forEach((n) => {
        md += `## ${n.title}\n`;
        md += `*Category: ${n.category} | Created: ${n.createdAt} | Tags: ${(n.tags || []).join(', ')}*\n\n`;
        md += `${n.content}\n\n---\n\n`;
      });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BrainVault_Notes_${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto text-left">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-purple-400" />
          <span>BrainVault Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Customize themes, manage profile, inspect memory capacity, and export backups
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Profile & Account */}
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Profile & Identity</h2>
              <p className="text-xs text-slate-400">Authenticated user information</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
              <input
                type="text"
                disabled
                value={user?.email || 'Guest / Local Session'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 text-sm cursor-not-allowed font-mono text-xs"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              UID: <code className="font-mono text-slate-400">{user?.uid || 'local'}</code>
            </span>

            {user && (
              <button
                onClick={() => signOut()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600/15 hover:bg-red-600/25 text-red-300 border border-red-500/30 text-xs font-semibold transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </GlassCard>

        {/* 2. Theme & Appearance */}
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Appearance & Theme</h2>
              <p className="text-xs text-slate-400">Choose your visual environment</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => {
                setTheme('dark');
                updateThemePreference('dark');
              }}
              className={`p-4 rounded-xl border text-left flex items-center justify-between transition ${
                theme === 'dark'
                  ? 'bg-purple-950/40 border-purple-500 text-white shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-purple-400" />
                <div>
                  <h4 className="text-sm font-bold">Deep Dark (Default)</h4>
                  <p className="text-[11px] text-slate-400">Charcoal & electric purple</p>
                </div>
              </div>
              {theme === 'dark' && <Check className="w-4 h-4 text-purple-400" />}
            </button>

            <button
              onClick={() => {
                setTheme('light');
                updateThemePreference('light');
              }}
              className={`p-4 rounded-xl border text-left flex items-center justify-between transition ${
                theme === 'light'
                  ? 'bg-purple-950/40 border-purple-500 text-white shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sun className="w-5 h-5 text-amber-400" />
                <div>
                  <h4 className="text-sm font-bold">Light Mode</h4>
                  <p className="text-[11px] text-slate-400">Crisp daytime readability</p>
                </div>
              </div>
              {theme === 'light' && <Check className="w-4 h-4 text-purple-400" />}
            </button>
          </div>
        </GlassCard>

        {/* 3. Data Export & Backup */}
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Data Portability & Backup</h2>
              <p className="text-xs text-slate-400">Export your second brain anytime. You own your data.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleExportJSON}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-left flex items-center justify-between transition group"
            >
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition">
                  Export Full JSON Backup
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Complete archive of notes, vault items, journals & collections
                </p>
              </div>
              <Download className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition flex-shrink-0" />
            </button>

            <button
              onClick={handleExportMarkdown}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 text-left flex items-center justify-between transition group"
            >
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-purple-400 transition">
                  Export Notes as Markdown
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Clean .md file compatible with Obsidian, Notion, or Logseq
                </p>
              </div>
              <FileText className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition flex-shrink-0" />
            </button>
          </div>
        </GlassCard>

        {/* 4. Storage & Knowledge Metrics */}
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-300">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Memory Capacity & Storage</h2>
              <p className="text-xs text-slate-400">Diagnostic telemetry of your second brain</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-2xl font-bold font-mono text-white">{notes.length}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Total Notes</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-2xl font-bold font-mono text-white">{vaultItems.length}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Vault Items</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-2xl font-bold font-mono text-white">{totalWords.toLocaleString()}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Words Written</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-2xl font-bold font-mono text-purple-400">{estimatedKb} KB</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Database Usage</div>
            </div>
          </div>
        </GlassCard>

        {/* 5. Progressive Web App (PWA) Info */}
        <GlassCard className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Progressive Web App (PWA)</h2>
                <p className="text-xs text-slate-400">Install BrainVault as an offline-first desktop or mobile app</p>
              </div>
            </div>

            <PWAInstallButton />
          </div>

          <p className="text-xs text-slate-400 leading-relaxed pt-1">
            BrainVault uses a background Service Worker with CacheFirst runtime caching. Your notes are cached locally so you can think and write without an active internet connection.
          </p>
        </GlassCard>
      </div>
    </div>
  );
};
