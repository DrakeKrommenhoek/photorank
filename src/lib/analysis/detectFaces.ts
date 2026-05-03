// src/lib/analysis/detectFaces.ts
import * as faceapi from 'face-api.js';
import type { FaceDetectionResult } from '@/lib/types';

let loadingPromise: Promise<void> | null = null;

/**
 * Loads face-api.js model weights from /models (served from /public/models/).
 * Safe to call multiple times — models are only loaded once.
 * Caches the Promise so concurrent callers get the same Promise object,
 * preventing a race condition where two simultaneous calls both pass the
 * guard and trigger duplicate network requests.
 * Model files required in /public/models/:
 *   - tiny_face_detector_model-weights_manifest.json + shard(s)
 *   - face_landmark_68_model-weights_manifest.json + shard(s)
 *   - face_expression_recognition_model-weights_manifest.json + shard(s)
 * Download from: https://github.com/justadudewhohacks/face-api.js/tree/master/weights
 */
// Non-async: returns the cached Promise directly so concurrent callers
// get the exact same Promise object (async would wrap it in a new Promise).
export function loadModels(): Promise<void> {
  if (!loadingPromise) {
    loadingPromise = Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceExpressionNet.loadFromUri('/models'),
    ]).then(() => undefined);
  }
  return loadingPromise;
}

/**
 * Detects all faces in an image, returning landmarks and expressions for each.
 * Uses TinyFaceDetector for speed in the browser.
 *
 * @param imageElement - A loaded HTMLImageElement to analyse
 * @returns Array of FaceDetectionResult (may be empty if no faces found)
 */
export async function detectFaces(
  imageElement: HTMLImageElement
): Promise<FaceDetectionResult[]> {
  const detections = await faceapi
    .detectAllFaces(imageElement, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceExpressions();

  return detections.map((d) => ({
    landmarks: d.landmarks,
    expressions: d.expressions,
    detection: d.detection,
  }));
}
