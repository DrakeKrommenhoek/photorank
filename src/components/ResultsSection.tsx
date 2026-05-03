// src/components/ResultsSection.tsx
'use client';
import { useState } from 'react';
import type { ResultSection, RankedPhoto } from '@/lib/types';
import { PhotoCard } from './PhotoCard';
import { PhotoModal } from './PhotoModal';

interface Props {
  section: ResultSection;
  favorites: Record<string, true>;
  onToggleFavorite: (id: string) => void;
}

export function ResultsSection({ section, favorites, onToggleFavorite }: Props) {
  const [selected, setSelected] = useState<RankedPhoto | null>(null);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">{section.title}</h2>
          <span className="text-sm text-zinc-500 bg-zinc-800/50 px-2.5 py-0.5 rounded-full">
            {section.photos.length} photo{section.photos.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {section.photos.map((rp) => (
            <PhotoCard
              key={rp.photo.id}
              rankedPhoto={rp}
              isFavorite={!!favorites[rp.photo.id]}
              onToggleFavorite={() => onToggleFavorite(rp.photo.id)}
              onClick={() => setSelected(rp)}
            />
          ))}
        </div>
      </div>

      <PhotoModal
        rankedPhoto={selected}
        isFavorite={selected ? !!favorites[selected.photo.id] : false}
        onToggleFavorite={() => selected && onToggleFavorite(selected.photo.id)}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
