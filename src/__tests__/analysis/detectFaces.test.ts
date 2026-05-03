// src/__tests__/analysis/detectFaces.test.ts
jest.mock('face-api.js', () => ({
  nets: {
    tinyFaceDetector: { loadFromUri: jest.fn().mockResolvedValue(undefined) },
    faceLandmark68Net: { loadFromUri: jest.fn().mockResolvedValue(undefined) },
    faceExpressionNet: { loadFromUri: jest.fn().mockResolvedValue(undefined) },
  },
  TinyFaceDetectorOptions: jest.fn().mockImplementation(() => ({})),
  detectAllFaces: jest.fn(() => ({
    withFaceLandmarks: jest.fn(() => ({
      withFaceExpressions: jest.fn().mockResolvedValue([
        {
          landmarks: { positions: Array(68).fill({ x: 10, y: 10 }) },
          expressions: { happy: 0.9, sad: 0.1 },
          detection: { score: 0.95, box: { x: 10, y: 10, width: 100, height: 120 } },
        },
      ]),
    })),
  })),
}));

import { loadModels, detectFaces } from '@/lib/analysis/detectFaces';

describe('detectFaces', () => {
  it('loadModels resolves without throwing', async () => {
    await expect(loadModels()).resolves.not.toThrow();
  });

  it('returns an array of FaceDetectionResult', async () => {
    const img = new Image();
    const faces = await detectFaces(img);
    expect(Array.isArray(faces)).toBe(true);
    expect(faces.length).toBe(1);
  });

  it('each result has landmarks, expressions, and detection', async () => {
    const img = new Image();
    const faces = await detectFaces(img);
    expect(faces[0]).toHaveProperty('landmarks');
    expect(faces[0]).toHaveProperty('expressions');
    expect(faces[0]).toHaveProperty('detection');
  });

  it('loadModels is idempotent — concurrent calls return the same Promise', async () => {
    // Use jest.isolateModules to get a fresh module instance (loadingPromise = null)
    // while keeping the jest.mock('face-api.js') factory in effect.
    let p1: Promise<void>;
    let p2: Promise<void>;
    await jest.isolateModulesAsync(async () => {
      const { loadModels: freshLoadModels } = await import('@/lib/analysis/detectFaces');
      p1 = freshLoadModels();
      p2 = freshLoadModels();
      expect(p1).toBe(p2); // same Promise object — no double-loading
      await p1;
    });
  });
});
