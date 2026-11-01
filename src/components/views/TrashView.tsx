import React from 'react';
import { Trash2, RotateCcw, AlertTriangle, FileText, Compass } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { GlassCard } from '../common/GlassCard';
import { EmptyState } from '../common/EmptyState';

export const TrashView: React.FC = () => {
  const {
    notes,
    vaultItems,
    restoreNote,
    restoreVaultItem,
    permanentlyDeleteNote,
    permanentlyDeleteVaultItem,
  } = useData();

  const deletedNotes = notes.filter((n) => n.isDeleted);
  const deletedVault = vaultItems.filter((v) => v.isDeleted);
  const total = deletedNotes.length + deletedVault.length;

  const handleEmptyTrash = async () => {
    if (!confirm('Permanently delete all items in trash? This action cannot be undone.')) {
      return;
    }
    for (const n of deletedNotes) {
      await permanentlyDeleteNote(n.id);
    }
    for (const v of deletedVault) {
      await permanentlyDeleteVaultItem(v.id);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Trash2 className="w-6 h-6 text-red-400" />
            <span>Trash Bin</span>
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30">
              {total} items
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Items in trash can be restored or permanently removed
          </p>
        </div>

        {total > 0 && (
          <button
            onClick={handleEmptyTrash}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-xs font-semibold transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Empty Trash Bin</span>
          </button>
        )}
      </div>

      {total === 0 ? (
        <EmptyState
          icon={Trash2}
          title="Trash is clean"
          description="Deleted notes and vault bookmarks appear here before permanent removal."
        />
      ) : (
        <div className="space-y-6">
          {deletedNotes.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                Deleted Notes ({deletedNotes.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {deletedNotes.map((note) => (
                  <GlassCard key={note.id} className="p-4 flex flex-col justify-between border-red-950/30">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          {note.category}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => restoreNote(note.id)}
                            className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
                            title="Restore note"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore</span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Permanently delete "${note.title}"?`)) {
                                permanentlyDeleteNote(note.id);
                              }
                            }}
                            className="text-xs text-red-400 hover:text-red-300"
                            title="Delete permanently"
                          >
                            Delete
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

          {deletedVault.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                Deleted Vault Bookmarks ({deletedVault.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {deletedVault.map((item) => (
                  <GlassCard key={item.id} className="p-4 flex flex-col justify-between border-red-950/30">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded capitalize">
                          {item.type}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => restoreVaultItem(item.id)}
                            className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
                            title="Restore item"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore</span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Permanently delete "${item.title}"?`)) {
                                permanentlyDeleteVaultItem(item.id);
                              }
                            }}
                            className="text-xs text-red-400 hover:text-red-300"
                            title="Delete permanently"
                          >
                            Delete
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
