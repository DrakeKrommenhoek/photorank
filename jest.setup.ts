// jest.setup.ts
import '@testing-library/jest-dom';

// Mock canvas getContext for scoring functions
HTMLCanvasElement.prototype.getContext = jest.fn((_contextId: string) => ({
  drawImage: jest.fn(),
  getImageData: jest.fn((x: number, y: number, sw: number, sh: number) => ({
    data: new Uint8ClampedArray(sw * sh * 4).fill(128),
    width: sw,
    height: sh,
  })),
  putImageData: jest.fn(),
  createImageData: jest.fn((sw: number, sh: number) => ({
    data: new Uint8ClampedArray(sw * sh * 4),
    width: sw,
    height: sh,
  })),
  canvas: document.createElement('canvas'),
})) as unknown as typeof HTMLCanvasElement.prototype.getContext;
