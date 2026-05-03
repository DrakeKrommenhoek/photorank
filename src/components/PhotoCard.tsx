// src/components/PhotoCard.tsx
'use client';
import type { RankedPhoto } from '@/lib/types';

interface Props {
  rankedPhoto: RankedPhoto;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClick: () => void;
}

function ScoreBadge({ score }: { score: number }) {
  const colorClass =
    score >= 75
      ? 'bg-emerald-900/50 text-emerald-400 border-emerald-800'
      : score >= 50
      ? 'bg-yellow-900/50 text-yellow-400 border-yellow-800'
      : 'bg-red-900/50 text-red-400 border-red-800';
  return (
    <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${colorClass}`}>
      {score}
    </span>
  );
}

export function PhotoCard({ rankedPhoto, isFavorite, onToggleFavorite, onClick }: Props) {
  const { photo, tags, reasoning, compositeScore } = rankedPhoto;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = photo.url;
    a.download = photo.name;
    a.click();
  };

  return (
    <div
      className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden cursor-pointer hover:border-[#3a3a3a] hover:scale-[1.01] transition-all duration-150 group"
      onClick={onClick}
    >
      <div className="aspect-square relative overflow-hidden">
        <img
          src={photo.url}
          alt={photo.name}
          className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-150"
        />
        <div className="absolute top-2 right-2">
          <ScoreBadge score={compositeScore} />
        </div>
      </div>

      <div className="p-3 space-y-2">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 4).map((tag) => (
              <span key={tag} className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">{reasoning}</p>

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="text-lg hover:scale-110 transition-transform"
            aria-label={isFavorite ? 'Unfavorite' : 'Favorite'}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
          <button
            onClick={handleDownload}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
            aria-label="Download photo"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
