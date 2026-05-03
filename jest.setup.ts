// jest.setup.ts
import '@testing-library/jest-dom';

// Mock canvas getContext for scoring functions
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  drawImage: jest.fn(),
  getImageData: jest.fn(() => ({
    data: new Uint8ClampedArray(100 * 100 * 4).fill(128),
  })),
})) as unknown as typeof HTMLCanvasElement.prototype.getContext;
