// src/app/results/page.tsx
'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { rankPhotos } from '@/lib/analysis/rankPhotos';
import { ProgressBar } from '@/components/ProgressBar';
import { ResultsSection } from '@/components/ResultsSection';
import { DownloadButton } from '@/components/DownloadButton';

export default function ResultsPage() {
  const router = useRouter();
  const {
    photos,
    criteria,
    results,
    favorites,
    setResults,
    toggleFavorite,
    setIsAnalyzing,
    setAnalysisProgress,
    isAnalyzing,
    analysisProgress,
  } = useStore();

  const hasStarted = useRef(false);

  useEffect(() => {
    if (photos.length === 0) {
      router.replace('/upload');
      return;
    }
    if (results || hasStarted.current) return;
    hasStarted.current = true;

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    rankPhotos(photos, criteria, (current, total) => {
      setAnalysisProgress(Math.round((current / total) * 100));
    })
      .then((r) => {
        setResults(r);
        setIsAnalyzing(false);
      })
      .catch((err) => {
        console.error('Ranking failed:', err);
        setIsAnalyzing(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Collect unique favorite photos for download
  const allRankedPhotos = results
    ? results.sections
        .flatMap((s) => s.photos)
        .filter((rp, i, arr) => arr.findIndex((x) => x.photo.id === rp.photo.id) === i)
    : [];
  const favoritePhotos = allRankedPhotos
    .filter((rp) => !!favorites[rp.photo.id])
    .map((rp) => rp.photo);

  if (isAnalyzing) {
    const current = Math.round((analysisProgress / 100) * photos.length);
    return (
      <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-6">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Analyzing your photos…</h1>
            <p className="text-zinc-500 text-sm">This may take a moment for larger batches.</p>
          </div>
          <ProgressBar
            progress={analysisProgress}
            status={`Analyzing photo ${current} of ${photos.length}…`}
          />
        </div>
      </main>
    );
  }

  if (!results) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <p className="text-zinc-500">
          No results yet.{' '}
          <button
            onClick={() => router.push('/upload')}
            className="underline text-zinc-300"
          >
            Start over
          </button>
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Results</h1>
            <p className="text-zinc-400 mt-1">
              {photos.length} photo{photos.length !== 1 ? 's' : ''} ranked across{' '}
              {results.sections.length} section{results.sections.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DownloadButton photos={favoritePhotos} />
            <button
              onClick={() => router.push('/upload')}
              className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
            >
              Start over
            </button>
          </div>
        </div>

        {/* Sections */}
        {results.sections.map((section) => (
          <ResultsSection
            key={section.key}
            section={section}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>
    </main>
  );
}
