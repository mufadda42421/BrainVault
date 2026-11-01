import React from 'react';
import { Archive, RotateCcw, Trash2, FileText, Compass, ExternalLink } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { GlassCard } from '../common/GlassCard';
import { EmptyState } from '../common/EmptyState';

export const ArchiveView: React.FC = () => {
  const { notes, vaultItems, toggleArchiveNote, toggleArchiveVaultItem, deleteNote, deleteVaultItem } = useData();

  const archivedNotes = notes.filter((n) => n.isArchived && !n.isDeleted);
  const archivedVault = vaultItems.filter((v) => v.isArchived && !v.isDeleted);
  const total = archivedNotes.length + archivedVault.length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto text-left">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Archive className="w-6 h-6 text-purple-400" />
          <span>Knowledge Archive</span>
          <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {total} items
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Archived notes and bookmarks safely stored outside your primary view
        </p>
      </div>

      {total === 0 ? (
        <EmptyState
          icon={Archive}
          title="Archive is empty"
          description="You can archive notes or vault bookmarks when you want to clear clutter without deleting them."
        />
      ) : (
        <div className="space-y-6">
          {archivedNotes.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                Archived Notes ({archivedNotes.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {archivedNotes.map((note) => (
                  <GlassCard key={note.id} className="p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-[11px] font-semibold text-purple-300 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/20">
                          {note.category}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => toggleArchiveNote(note.id)}
                            className="p-1 text-slate-400 hover:text-white transition"
                            title="Unarchive"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteNote(note.id)}
                            className="p-1 text-slate-400 hover:text-red-400 transition"
                            title="Move to Trash"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <h3 className="font-bold text-sm text-white line-clamp-1 mb-1">{note.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {note.content.replace(/<[^>]*>/g, '') || 'Empty note...'}
                      </p>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {archivedVault.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                Archived Vault Bookmarks ({archivedVault.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {archivedVault.map((item) => (
                  <GlassCard key={item.id} className="p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-[11px] font-semibold text-sky-300 bg-sky-950/40 px-2 py-0.5 rounded border border-sky-500/20 capitalize">
                          {item.type}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => toggleArchiveVaultItem(item.id)}
                            className="p-1 text-slate-400 hover:text-white transition"
                            title="Unarchive"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteVaultItem(item.id)}
                            className="p-1 text-slate-400 hover:text-red-400 transition"
                            title="Move to Trash"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <h3 className="font-bold text-sm text-white line-clamp-1 mb-1">{item.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {item.description || item.url || 'No description'}
                      </p>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
