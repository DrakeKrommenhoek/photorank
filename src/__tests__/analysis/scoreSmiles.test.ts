// src/__tests__/analysis/scoreSmiles.test.ts
import { scoreSmiles } from '@/lib/analysis/scoreSmiles';
import type { FaceDetectionResult } from '@/lib/types';

function makeFace(smiling: boolean): FaceDetectionResult {
  const positions = Array(68).fill({ x: 50, y: 50 }).map(p => ({ ...p }));
  const mouthWidth = smiling ? 30 : 15;
  const mouthHeight = smiling ? 8 : 5;
  // Outer mouth: 48 (left), 54 (right); lips: 51 (top), 57 (bottom)
  positions[48] = { x: 35, y: 50 };
  positions[54] = { x: 35 + mouthWidth, y: 50 };
  positions[51] = { x: 50, y: 45 };
  positions[57] = { x: 50, y: 45 + mouthHeight };

  return {
    landmarks: { positions } as unknown as FaceDetectionResult['landmarks'],
    expressions: { happy: smiling ? 0.85 : 0.05 } as unknown as FaceDetectionResult['expressions'],
    detection: {} as unknown as FaceDetectionResult['detection'],
  };
}

describe('scoreSmiles', () => {
  it('returns 50 for empty face array', async () => {
    expect(await scoreSmiles([])).toBe(50);
  });

  it('scores a smiling face higher than a neutral face', async () => {
    const smiling = await scoreSmiles([makeFace(true)]);
    const neutral = await scoreSmiles([makeFace(false)]);
    expect(smiling).toBeGreaterThan(neutral);
  });

  it('returns a value between 0 and 100', async () => {
    const score = await scoreSmiles([makeFace(true)]);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
