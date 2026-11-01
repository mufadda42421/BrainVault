import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 bg-slate-800 rounded-md" />
        <div className="h-4 w-12 bg-slate-800 rounded-md" />
      </div>
      <div className="h-6 w-3/4 bg-slate-800/80 rounded-md" />
      <div className="space-y-2">
        <div className="h-3 w-full bg-slate-800/60 rounded" />
        <div className="h-3 w-5/6 bg-slate-800/60 rounded" />
      </div>
      <div className="flex gap-2 pt-2">
        <div className="h-5 w-16 bg-slate-800/80 rounded-full" />
        <div className="h-5 w-14 bg-slate-800/80 rounded-full" />
      </div>
    </div>
  );
};

export const NoteGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
};
