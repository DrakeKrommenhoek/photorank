// src/__tests__/analysis/scoreEyesOpen.test.ts
import { scoreEyesOpen } from '@/lib/analysis/scoreEyesOpen';
import type { FaceDetectionResult } from '@/lib/types';

function makeFace(eyeOpenness: 'open' | 'closed'): FaceDetectionResult {
  const positions = Array(68).fill(null).map(() => ({ x: 0, y: 0 }));
  const spread = eyeOpenness === 'open' ? 10 : 2;
  // Left eye (36-41)
  positions[36] = { x: 0, y: 5 };
  positions[37] = { x: 3, y: 5 - spread };
  positions[38] = { x: 7, y: 5 - spread };
  positions[39] = { x: 10, y: 5 };
  positions[40] = { x: 7, y: 5 + spread };
  positions[41] = { x: 3, y: 5 + spread };
  // Right eye (42-47)
  positions[42] = { x: 20, y: 5 };
  positions[43] = { x: 23, y: 5 - spread };
  positions[44] = { x: 27, y: 5 - spread };
  positions[45] = { x: 30, y: 5 };
  positions[46] = { x: 27, y: 5 + spread };
  positions[47] = { x: 23, y: 5 + spread };

  return {
    landmarks: { positions } as unknown as FaceDetectionResult['landmarks'],
    expressions: { happy: 0 } as unknown as FaceDetectionResult['expressions'],
    detection: {} as unknown as FaceDetectionResult['detection'],
  };
}

describe('scoreEyesOpen', () => {
  it('returns 50 for empty face array', async () => {
    expect(await scoreEyesOpen([])).toBe(50);
  });

  it('scores open eyes higher than closed eyes', async () => {
    const open = await scoreEyesOpen([makeFace('open')]);
    const closed = await scoreEyesOpen([makeFace('closed')]);
    expect(open).toBeGreaterThan(closed);
  });

  it('returns a value between 0 and 100', async () => {
    const score = await scoreEyesOpen([makeFace('open')]);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
