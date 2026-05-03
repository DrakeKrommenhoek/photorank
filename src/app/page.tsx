// src/app/page.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Logo mark */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-10 h-10 bg-[#6366f1] rounded-xl flex items-center justify-center text-xl font-bold">
            P
          </div>
          <span className="text-2xl font-semibold tracking-tight text-white">PhotoRank</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
            Find the best photos<br />
            <span className="text-[#6366f1]">from the chaos.</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-lg mx-auto">
            Upload your event photos, pick what matters, and get ranked results instantly.
          </p>
        </div>

        <Link
          href="/upload"
          className="inline-block bg-[#6366f1] hover:bg-[#5558e8] text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-150 hover:scale-[1.02]"
        >
          Start Sorting
        </Link>

        {/* Privacy note */}
        <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10M12 3a4 4 0 014 4H8a4 4 0 014-4z" />
          </svg>
          <span>Your photos never leave your device.</span>
        </div>
      </div>
    </main>
  );
}
