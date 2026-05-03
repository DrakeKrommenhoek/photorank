// src/lib/analysis/scoreSharpness.ts

/**
 * Scores the sharpness (focus quality) of an image.
 * Uses Canvas API + Laplacian operator to measure edge variance.
 *
 * Returns 0–100. Higher = sharper.
 * Low variance in Laplacian response = blurry. High variance = sharp edges present.
 *
 * Empirical scale: <50 variance = very blurry (score ~0), >2000 = very sharp (score ~100).
 */
export async function scoreSharpness(imageElement: HTMLImageElement): Promise<number> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const W = 200, H = 200;
  canvas.width = W;
  canvas.height = H;
  ctx.drawImage(imageElement, 0, 0, W, H);
  const { data } = ctx.getImageData(0, 0, W, H);

  // Convert to grayscale
  const gray: number[] = [];
  for (let i = 0; i < data.length; i += 4) {
    gray.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  }

  // Apply Laplacian kernel [0,1,0 / 1,-4,1 / 0,1,0] to measure edge sharpness
  const laps: number[] = [];
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const idx = y * W + x;
      laps.push(
        gray[idx - W] + gray[idx + W] + gray[idx - 1] + gray[idx + 1] - 4 * gray[idx]
      );
    }
  }

  const mean = laps.reduce((a, b) => a + b, 0) / laps.length;
  const variance = laps.reduce((s, v) => s + (v - mean) ** 2, 0) / laps.length;

  // Empirical range: <50 very blurry, >2000 very sharp
  const score = Math.min(100, Math.max(0, ((variance - 50) / (2000 - 50)) * 100));
  return Math.round(score);
}
