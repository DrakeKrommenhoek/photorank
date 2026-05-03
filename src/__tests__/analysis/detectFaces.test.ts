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

  it('loadModels is idempotent (calling twice does not reload)', async () => {
    const faceapi = require('face-api.js');
    faceapi.nets.tinyFaceDetector.loadFromUri.mockClear();
    await loadModels();
    await loadModels();
    // Should only be called once total since models were already loaded
    // (or zero times if already cached from first test)
    expect(faceapi.nets.tinyFaceDetector.loadFromUri.mock.calls.length).toBeLessThanOrEqual(1);
  });
});
