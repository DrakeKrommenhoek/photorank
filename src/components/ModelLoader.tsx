// src/components/ModelLoader.tsx
'use client';
import { useEffect, useState } from 'react';
import { loadModels } from '@/lib/analysis/detectFaces';

export function ModelLoader({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [modelError, setModelError] = useState(false);

  useEffect(() => {
    loadModels()
      .then(() => setLoaded(true))
      .catch(() => {
        // Face models not found — app still works, face features disabled
        setLoaded(true);
        setModelError(true);
      });
  }, []);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 text-sm">Loading face detection models…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {modelError && (
        <div className="fixed bottom-4 right-4 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-400 z-50 max-w-xs">
          Face detection models not found in{' '}
          <code className="text-zinc-300">/public/models/</code>. Face features disabled.
        </div>
      )}
      {children}
    </>
  );
}
