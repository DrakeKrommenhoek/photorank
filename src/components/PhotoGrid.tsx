// src/components/PhotoGrid.tsx
'use client';
import type { PhotoFile } from '@/lib/types';

interface Props {
  photos: PhotoFile[];
  onRemove: (id: string) => void;
}

export function PhotoGrid({ photos, onRemove }: Props) {
  if (photos.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="relative group rounded-xl overflow-hidden bg-[#1a1a1a] border border-[#2a2a2a] aspect-square"
        >
          <img
            src={photo.url}
            alt={photo.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => onRemove(photo.id)}
            className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 hover:bg-red-600 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150"
            aria-label="Remove photo"
          >
            ×
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1 opacity-0 group-hover:opacity-100 transition-all duration-150">
            <p className="text-white text-xs truncate">{photo.name}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
