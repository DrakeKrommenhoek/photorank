// src/__tests__/analysis/scoreLighting.test.ts
import { scoreLighting } from '@/lib/analysis/scoreLighting';

function makeImage(pixelValue: number): HTMLImageElement {
  const img = new Image();
  jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    drawImage: jest.fn(),
    getImageData: jest.fn(() => ({
      data: new Uint8ClampedArray(
        Array(100 * 100 * 4).fill(0).map((_, i) => (i % 4 === 3 ? 255 : pixelValue))
      ),
      width: 100,
      height: 100,
    })),
    putImageData: jest.fn(),
    createImageData: jest.fn(),
    canvas: document.createElement('canvas'),
  } as unknown as CanvasRenderingContext2D);
  return img;
}

describe('scoreLighting', () => {
  afterEach(() => jest.restoreAllMocks());

  it('returns a score between 0 and 100', async () => {
    const score = await scoreLighting(makeImage(128));
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('scores a well-lit image (128 luminance) higher than a dark image (20 luminance)', async () => {
    const bright = await scoreLighting(makeImage(128));
    const dark = await scoreLighting(makeImage(20));
    expect(bright).toBeGreaterThan(dark);
  });

  it('scores a well-lit image higher than an overexposed one (245 luminance)', async () => {
    const normal = await scoreLighting(makeImage(128));
    const overexposed = await scoreLighting(makeImage(245));
    expect(normal).toBeGreaterThan(overexposed);
  });
});
