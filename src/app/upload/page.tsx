// src/app/upload/page.tsx
'use client';
import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { PhotoGrid } from '@/components/PhotoGrid';
import type { PhotoFile } from '@/lib/types';

function fileToPhotoFile(file: File): PhotoFile {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`,
    name: file.name,
    file,
    url: URL.createObjectURL(file),
  };
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

export default function UploadPage() {
  const router = useRouter();
  const { photos, addPhotos, removePhoto } = useStore();
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const valid = Array.from(files)
        .filter(
          (f) =>
            ACCEPTED_TYPES.includes(f.type) || f.name.toLowerCase().endsWith('.heic')
        )
        .map(fileToPhotoFile);
      if (valid.length > 0) addPhotos(valid);
    },
    [addPhotos]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <main className="min-h-screen bg-[#0f0f0f] px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Upload Photos</h1>
          <p className="text-zinc-400">
            Drag and drop your event photos, or click to select them.
          </p>
        </div>

        {/* Drop zone */}
        <div
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-150 ${
            dragOver
              ? 'border-[#6366f1] bg-[#6366f1]/10'
              : 'border-[#2a2a2a] hover:border-[#3a3a3a] bg-[#1a1a1a]'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
        >
          <div className="space-y-3">
            <div className="text-4xl">📷</div>
            <div>
              <p className="text-white font-medium">
                Drop photos here or click to browse
              </p>
              <p className="text-zinc-500 text-sm mt-1">
                JPG, PNG, WEBP, HEIC supported
              </p>
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,.heic"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {/* Count + clear */}
        {photos.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-zinc-400 text-sm">
              <span className="text-white font-semibold">{photos.length}</span>{' '}
              photo{photos.length !== 1 ? 's' : ''} uploaded
            </p>
            <button
              onClick={() => useStore.getState().reset()}
              className="text-zinc-500 hover:text-red-400 text-sm transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Grid */}
        <PhotoGrid photos={photos} onRemove={removePhoto} />

        {/* Privacy note */}
        <div className="flex items-center gap-2 text-sm text-zinc-500 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3">
          <span>🔒</span>
          <span>
            Your photos are processed entirely on your device. Nothing is uploaded to any
            server.
          </span>
        </div>

        {/* Empty state */}
        {photos.length === 0 && (
          <div className="text-center text-zinc-600 py-4">
            No photos yet — drop some in to get started.
          </div>
        )}

        {/* CTA */}
        <div className="flex items-center justify-between">
          <a href="/" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
            ← Back
          </a>
          <button
            onClick={() => router.push('/criteria')}
            disabled={photos.length === 0}
            className="bg-[#6366f1] hover:bg-[#5558e8] disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-150 hover:scale-[1.02] disabled:cursor-not-allowed disabled:scale-100"
          >
            Set Criteria →
          </button>
        </div>
      </div>
    </main>
  );
}
