// src/lib/analysis/scoreLighting.ts

/**
 * Scores the lighting/exposure quality of an image.
 * Uses Canvas API to sample pixel luminance across the image.
 *
 * Returns 0–100. Higher = better exposed.
 * Penalizes both underexposure (too dark) and overexposure (too bright).
 * Ideal luminance is centered around 128, with a comfortable range of 60–200.
 */
export async function scoreLighting(imageElement: HTMLImageElement): Promise<number> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const W = 100, H = 100;
  canvas.width = W;
  canvas.height = H;
  ctx.drawImage(imageElement, 0, 0, W, H);
  const { data } = ctx.getImageData(0, 0, W, H);

  let totalLum = 0;
  const pixelCount = W * H;
  for (let i = 0; i < data.length; i += 4) {
    totalLum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  const avg = totalLum / pixelCount;

  // Ideal range 60–200, centered around 128. Penalize too dark or too bright.
  const idealMin = 60, idealMax = 200, ideal = 128;
  let score: number;
  if (avg < idealMin) {
    score = (avg / idealMin) * 70;
  } else if (avg > idealMax) {
    score = 70 - ((avg - idealMax) / (255 - idealMax)) * 70;
  } else {
    const dist = Math.abs(avg - ideal);
    score = 100 - (dist / ((idealMax - idealMin) / 2)) * 30;
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}
