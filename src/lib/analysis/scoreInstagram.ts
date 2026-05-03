// src/lib/analysis/scoreInstagram.ts
export async function scoreInstagram(
  lighting: number,
  sharpness: number,
  eyesOpen: number,
  faceCount: number
): Promise<number> {
  const faceBonus = faceCount > 0 ? Math.min(100, faceCount * 20 + 20) : 40;
  const score = lighting * 0.35 + sharpness * 0.35 + eyesOpen * 0.15 + faceBonus * 0.15;
  return Math.round(Math.min(100, Math.max(0, score)));
}
