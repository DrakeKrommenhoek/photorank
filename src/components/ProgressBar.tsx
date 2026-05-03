// src/components/ProgressBar.tsx
interface Props {
  progress: number; // 0-100
  status: string;
}

export function ProgressBar({ progress, status }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-400">{status}</span>
        <span className="text-zinc-500">{Math.round(progress)}%</span>
      </div>
      <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#6366f1] rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}
