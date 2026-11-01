import React, { useState } from 'react';
import {
  FolderClosed,
  Plus,
  Edit2,
  Trash2,
  FileText,
  Compass,
  ArrowRight,
  FolderOpen,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { CollectionItem, NoteItem } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { EmptyState } from '../common/EmptyState';

interface CollectionsViewProps {
  onOpenQuickAdd: () => void;
  onSelectNote: (note: NoteItem) => void;
  onNavigate: (view: any) => void;
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({
  onOpenQuickAdd,
  onSelectNote,
  onNavigate,
}) => {
  const { collections, notes, deleteCollection, updateCollection, updateNote } = useData();
  const [selectedCol, setSelectedCol] = useState<CollectionItem | null>(null);

  const activeNotes = notes.filter((n) => !n.isDeleted && !n.isArchived);

  const getNotesInCollection = (colId: string) => {
    return activeNotes.filter((n) => n.folderId === colId);
  };

  const getNotesWithoutCollection = () => {
    return activeNotes.filter((n) => !n.folderId);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Collections & Folders
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Curate ideas into thematic knowledge clusters and project workspaces
          </p>
        </div>

        <button
          onClick={onOpenQuickAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-md shadow-purple-600/25 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      {collections.length === 0 ? (
        <EmptyState
          icon={FolderClosed}
          title="No collections yet"
          description="Create your first collection to group related notes, research, and project references together."
          actionLabel="Create Collection"
          onAction={onOpenQuickAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((col) => {
            const items = getNotesInCollection(col.id);
            const isSelected = selectedCol?.id === col.id;

            return (
              <GlassCard
                key={col.id}
                hoverEffect
                onClick={() => setSelectedCol(isSelected ? null : col)}
                className={`p-5 cursor-pointer flex flex-col justify-between border-slate-800 ${
                  isSelected ? 'border-purple-500/50 bg-purple-950/20 shadow-lg' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: col.color || '#8b5cf6' }}
                    >
                      <FolderClosed className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
                        {items.length} notes
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete collection "${col.name}"?`)) {
                            deleteCollection(col.id);
                            if (selectedCol?.id === col.id) setSelectedCol(null);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                        title="Delete collection"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">{col.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {col.description || 'No description provided'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-purple-400 font-medium">
                  <span>{isSelected ? 'Viewing notes below' : 'Explore collection'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Selected Collection's Notes Detail view */}
      {selectedCol && (
        <div className="mt-8 p-6 rounded-2xl bg-slate-900/40 border border-purple-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FolderOpen className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white">
                Notes in "{selectedCol.name}" ({getNotesInCollection(selectedCol.id).length})
              </h2>
            </div>
            <button
              onClick={() => setSelectedCol(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>

          {getNotesInCollection(selectedCol.id).length === 0 ? (
            <p className="text-xs text-slate-400 py-4">
              No notes in this collection yet. You can assign notes into this folder when editing them.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {getNotesInCollection(selectedCol.id).map((note) => (
                <GlassCard
                  key={note.id}
                  hoverEffect
                  onClick={() => {
                    onSelectNote(note);
                    onNavigate('notes');
                  }}
                  className="p-3.5 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span className="font-semibold text-xs text-white truncate">{note.title}</span>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
