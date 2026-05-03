// src/components/DownloadButton.tsx
'use client';
import type { PhotoFile } from '@/lib/types';

interface Props {
  photos: PhotoFile[];
  label?: string;
}

export function DownloadButton({ photos, label = 'Download All Favorites' }: Props) {
  const handleDownloadAll = async () => {
    for (let i = 0; i < photos.length; i++) {
      const a = document.createElement('a');
      a.href = photos[i].url;
      a.download = photos[i].name;
      a.click();
      // Small delay to prevent browser from blocking multiple simultaneous downloads
      await new Promise((r) => setTimeout(r, 200));
    }
  };

  if (photos.length === 0) return null;

  return (
    <button
      onClick={handleDownloadAll}
      className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#6366f1] text-zinc-300 hover:text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      {label} ({photos.length})
    </button>
  );
}
