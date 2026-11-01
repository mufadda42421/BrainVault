/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/navigation/Sidebar';
import { Header } from './components/navigation/Header';
import { DashboardView } from './components/views/DashboardView';
import { NotesView } from './components/views/NotesView';
import { VaultView } from './components/views/VaultView';
import { AiAssistantView } from './components/views/AiAssistantView';
import { CollectionsView } from './components/views/CollectionsView';
import { FavoritesView } from './components/views/FavoritesView';
import { DailyJournalView } from './components/views/DailyJournalView';
import { ArchiveView } from './components/views/ArchiveView';
import { TrashView } from './components/views/TrashView';
import { SettingsView } from './components/views/SettingsView';
import { QuickAddModal } from './components/modals/QuickAddModal';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import { AuthModal } from './components/modals/AuthModal';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { ActiveView, NoteItem, VaultItem, JournalEntry } from './types';

const BrainVaultApp: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Selected item states
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);
  const [selectedVaultItem, setSelectedVaultItem] = useState<VaultItem | null>(null);

  // Modal open states
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Global keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectNote = (note: NoteItem) => {
    setSelectedNote(note);
    setActiveView('notes');
  };

  const handleSelectVaultItem = (item: VaultItem) => {
    setSelectedVaultItem(item);
    setActiveView('vault');
  };

  const handleSelectJournal = (entry: JournalEntry) => {
    setActiveView('journal');
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        setActiveView={(view) => {
          setActiveView(view);
          setSelectedNote(null);
          setSelectedVaultItem(null);
        }}
        collapsed={isSidebarCollapsed}
        setCollapsed={setIsSidebarCollapsed}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        isMobileOpen={isMobileNavOpen}
        setIsMobileOpen={setIsMobileNavOpen}
      />

      {/* Main Content Viewport */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Header */}
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
          activeView={activeView}
          setActiveView={(view) => {
            setActiveView(view);
            setSelectedNote(null);
            setSelectedVaultItem(null);
          }}
        />

        {/* View Content Renderer */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {activeView === 'dashboard' && (
            <DashboardView
              onNavigate={setActiveView}
              onOpenQuickAdd={() => setIsQuickAddOpen(true)}
              onOpenSearch={() => setIsSearchOpen(true)}
              onSelectNote={handleSelectNote}
              onSelectVaultItem={handleSelectVaultItem}
            />
          )}

          {activeView === 'notes' && (
            <NotesView
              selectedNote={selectedNote}
              setSelectedNote={setSelectedNote}
              onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            />
          )}

          {activeView === 'vault' && (
            <VaultView
              onOpenQuickAdd={() => setIsQuickAddOpen(true)}
              selectedVaultItem={selectedVaultItem}
              setSelectedVaultItem={setSelectedVaultItem}
            />
          )}

          {activeView === 'assistant' && <AiAssistantView />}

          {activeView === 'collections' && (
            <CollectionsView
              onOpenQuickAdd={() => setIsQuickAddOpen(true)}
              onSelectNote={handleSelectNote}
              onNavigate={setActiveView}
            />
          )}

          {activeView === 'favorites' && (
            <FavoritesView
              onSelectNote={handleSelectNote}
              onSelectVaultItem={handleSelectVaultItem}
              onNavigate={setActiveView}
            />
          )}

          {activeView === 'journal' && <DailyJournalView />}

          {activeView === 'archive' && <ArchiveView />}

          {activeView === 'trash' && <TrashView />}

          {activeView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Modals */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectNote={handleSelectNote}
        onSelectVaultItem={handleSelectVaultItem}
        onSelectJournal={handleSelectJournal}
        onNavigate={setActiveView}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Network Connectivity Status Toast */}
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <BrainVaultApp />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
