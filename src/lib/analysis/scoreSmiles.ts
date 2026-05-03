// src/lib/analysis/scoreSmiles.ts
import type { FaceDetectionResult } from '@/lib/types';

function dist(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

/**
 * Scores how much people are smiling across all detected faces.
 * Returns 0–100. 100 = big smiles on all faces.
 * Returns 50 for empty input (neutral/unknown score).
 *
 * Blends two signals:
 *   - Expression confidence (face-api.js `happy` score) — 60% weight
 *   - Mouth landmark geometry: width/height ratio — 40% weight
 *     Wide + shallow mouth = smile; narrow/tall = neutral/open
 */
export async function scoreSmiles(faces: FaceDetectionResult[]): Promise<number> {
  if (faces.length === 0) return 50;

  let total = 0;
  for (const face of faces) {
    // Expression detection (60% weight)
    const happy = (face.expressions as unknown as Record<string, number>).happy ?? 0;

    // Landmark mouth ratio (40% weight): wider mouth relative to height = bigger smile
    const p = face.landmarks.positions;
    const mouthWidth = dist(p[48], p[54]);       // outer mouth corners
    const mouthHeight = dist(p[51], p[57]) + 1;  // upper/lower lip (+ 1 prevents div-by-zero)
    const ratio = mouthWidth / mouthHeight;
    // ratio ~1.5 = neutral, ~5+ = big smile; map [1.5, 5.0] → [0, 1]
    const ratioScore = Math.min(1, Math.max(0, (ratio - 1.5) / 3.5));

    total += happy * 0.6 + ratioScore * 0.4;
  }

  return Math.round(Math.min(100, Math.max(0, (total / faces.length) * 100)));
}
