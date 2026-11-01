import React from 'react';
import { Star, FileText, Compass, ExternalLink, ArrowRight } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { NoteItem, VaultItem, ActiveView } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { EmptyState } from '../common/EmptyState';

interface FavoritesViewProps {
  onSelectNote: (note: NoteItem) => void;
  onSelectVaultItem: (item: VaultItem) => void;
  onNavigate: (view: ActiveView) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  onSelectNote,
  onSelectVaultItem,
  onNavigate,
}) => {
  const { notes, vaultItems, toggleFavoriteNote, toggleFavoriteVaultItem } = useData();

  const favNotes = notes.filter((n) => !n.isDeleted && !n.isArchived && n.isFavorite);
  const favVault = vaultItems.filter((v) => !v.isDeleted && !v.isArchived && v.isFavorite);

  const total = favNotes.length + favVault.length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto text-left">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
          <span>Starred & Favorites</span>
          <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
            {total} items
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Your curated high-signal notes, bookmarks, and breakthrough insights
        </p>
      </div>

      {total === 0 ? (
        <EmptyState
          icon={Star}
          title="No favorites starred yet"
          description="Click the star icon on any note or vault item to surface your most important knowledge here."
        />
      ) : (
        <div className="space-y-8">
          {/* Favorited Notes */}
          {favNotes.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <h2 className="text-base font-bold text-white tracking-tight">Favorite Notes ({favNotes.length})</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favNotes.map((note) => (
                  <GlassCard
                    key={note.id}
                    hoverEffect
                    onClick={() => {
                      onSelectNote(note);
                      onNavigate('notes');
                    }}
                    className="p-5 cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-[11px] font-semibold text-purple-300 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/20">
                          {note.category}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavoriteNote(note.id);
                          }}
                          className="text-amber-400"
                        >
                          <Star className="w-4 h-4 fill-amber-400" />
                        </button>
                      </div>

                      <h3 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors line-clamp-1 mb-1">
                        {note.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {note.content.replace(/<[^>]*>/g, '') || 'Empty note content'}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
                      Updated {new Date(note.updatedAt).toLocaleDateString()}
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* Favorited Vault Bookmarks */}
          {favVault.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-sky-400" />
                <h2 className="text-base font-bold text-white tracking-tight">Favorite Vault Bookmarks ({favVault.length})</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favVault.map((item) => (
                  <GlassCard
                    key={item.id}
                    hoverEffect
                    onClick={() => {
                      onSelectVaultItem(item);
                      onNavigate('vault');
                    }}
                    className="p-5 cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-[11px] font-semibold text-sky-300 bg-sky-950/40 px-2 py-0.5 rounded border border-sky-500/20 capitalize">
                          {item.type}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavoriteVaultItem(item.id);
                          }}
                          className="text-amber-400"
                        >
                          <Star className="w-4 h-4 fill-amber-400" />
                        </button>
                      </div>

                      <h3 className="font-bold text-sm text-white group-hover:text-sky-300 transition-colors line-clamp-1 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {item.description || item.url || 'No description'}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                      <span>{item.category}</span>
                      {item.url && <ExternalLink className="w-3 h-3" />}
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
