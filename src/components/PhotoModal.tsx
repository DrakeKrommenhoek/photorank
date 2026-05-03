// src/components/PhotoModal.tsx
'use client';
import { useEffect } from 'react';
import type { RankedPhoto } from '@/lib/types';

function ScoreRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-zinc-400">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-24 h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#6366f1] rounded-full"
            style={{ width: `${value}%` }}
          />
        </div>
        <span className="text-sm font-mono text-zinc-300 w-8 text-right">{value}</span>
      </div>
    </div>
  );
}

interface Props {
  rankedPhoto: RankedPhoto | null;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClose: () => void;
}

export function PhotoModal({ rankedPhoto, isFavorite, onToggleFavorite, onClose }: Props) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!rankedPhoto) return null;
  const { photo, analysis, compositeScore, tags, reasoning } = rankedPhoto;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = photo.url;
    a.download = photo.name;
    a.click();
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="md:w-1/2 bg-black rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none overflow-hidden flex-shrink-0">
            <img
              src={photo.url}
              alt={photo.name}
              className="w-full h-full object-contain max-h-[60vh] md:max-h-[80vh]"
            />
          </div>

          {/* Details */}
          <div className="md:w-1/2 p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold truncate">{photo.name}</h2>
                <p className="text-sm text-zinc-500">
                  {(photo.file.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-zinc-500 hover:text-white transition-colors text-xl flex-shrink-0"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Overall score */}
            <div className="bg-[#111] rounded-xl p-4 text-center">
              <div className="text-4xl font-bold text-[#6366f1]">{compositeScore}</div>
              <div className="text-xs text-zinc-500 mt-1">Overall Score</div>
            </div>

            {/* Score bars */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Scores</h3>
              <ScoreRow label="Lighting" value={analysis.lighting} />
              <ScoreRow label="Sharpness" value={analysis.sharpness} />
              <ScoreRow label="Eyes Open" value={analysis.eyesOpen} />
              <ScoreRow label="Smiles" value={analysis.smiles} />
              <ScoreRow label="Instagram" value={analysis.instagram} />
            </div>

            {/* Faces */}
            <p className="text-sm text-zinc-400">
              {analysis.faces.length === 0
                ? 'No faces detected'
                : `${analysis.faces.length} face${analysis.faces.length > 1 ? 's' : ''} detected`}
            </p>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Reasoning */}
            <div className="bg-[#111] rounded-xl p-3">
              <p className="text-sm text-zinc-400 leading-relaxed">{reasoning}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onToggleFavorite}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  isFavorite
                    ? 'bg-red-900/30 border-red-800/50 text-red-400'
                    : 'bg-[#111] border-[#2a2a2a] text-zinc-300 hover:border-[#3a3a3a]'
                }`}
              >
                {isFavorite ? '❤️ Favorited' : '🤍 Favorite'}
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-[#6366f1] hover:bg-[#5558e8] text-white transition-all"
              >
                ⬇ Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
