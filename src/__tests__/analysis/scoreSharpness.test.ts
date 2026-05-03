// src/__tests__/analysis/scoreSharpness.test.ts
import { scoreSharpness } from '@/lib/analysis/scoreSharpness';

function makeImageWithVariance(variance: 'high' | 'low'): HTMLImageElement {
  const img = new Image();
  const W = 200, H = 200;
  const data = new Uint8ClampedArray(W * H * 4);
  for (let i = 0; i < data.length; i += 4) {
    // high variance: alternating 0 and 255; low variance: uniform 128
    const val = variance === 'high' ? (Math.floor(i / 4) % 2 === 0 ? 0 : 255) : 128;
    data[i] = data[i + 1] = data[i + 2] = val;
    data[i + 3] = 255;
  }
  jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    drawImage: jest.fn(),
    getImageData: jest.fn(() => ({ data, width: W, height: H })),
    putImageData: jest.fn(),
    createImageData: jest.fn(),
    canvas: document.createElement('canvas'),
  } as unknown as CanvasRenderingContext2D);
  return img;
}

describe('scoreSharpness', () => {
  afterEach(() => jest.restoreAllMocks());

  it('returns a score between 0 and 100', async () => {
    const score = await scoreSharpness(makeImageWithVariance('high'));
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('scores a high-variance image higher than a uniform image', async () => {
    const sharp = await scoreSharpness(makeImageWithVariance('high'));
    const blurry = await scoreSharpness(makeImageWithVariance('low'));
    expect(sharp).toBeGreaterThan(blurry);
  });
});
