// src/app/criteria/page.tsx
'use client';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { CriteriaSelector } from '@/components/CriteriaSelector';

// TODO: Replace checkbox logic with LLM criteria parser
export default function CriteriaPage() {
  const router = useRouter();
  const { criteria, setCriteria, photos } = useStore();

  const hasAnyCriteria = Object.entries(criteria)
    .filter(([k]) => k !== 'specificPeopleNames')
    .some(([, v]) => v === true);

  return (
    <main className="min-h-screen bg-[#0f0f0f] px-6 py-12">
      <div className="max-w-xl mx-auto space-y-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">What matters to you?</h1>
          <p className="text-zinc-400">
            Select criteria for your {photos.length} photo
            {photos.length !== 1 ? 's' : ''}. PhotoRank scores and groups results accordingly.
          </p>
        </div>

        <CriteriaSelector criteria={criteria} onChange={setCriteria} />

        {/* NLP — coming soon */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-zinc-600">
            Natural language criteria{' '}
            <span className="text-zinc-700 normal-case">(coming soon)</span>
          </label>
          <textarea
            disabled
            placeholder="e.g. Find photos where my eyes are open, everyone looks good, and Drake is in the shot."
            className="w-full h-24 bg-[#111] border border-[#1e1e1e] rounded-xl px-4 py-3 text-sm text-zinc-700 placeholder-zinc-700 cursor-not-allowed resize-none"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={() => router.push('/results')}
            disabled={!hasAnyCriteria}
            className="bg-[#6366f1] hover:bg-[#5558e8] disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-150 hover:scale-[1.02] disabled:cursor-not-allowed disabled:scale-100"
          >
            Rank My Photos →
          </button>
        </div>
      </div>
    </main>
  );
}
