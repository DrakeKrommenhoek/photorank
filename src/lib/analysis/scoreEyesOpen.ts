// src/lib/analysis/scoreEyesOpen.ts
import type { FaceDetectionResult } from '@/lib/types';

function dist(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

/**
 * Computes Eye Aspect Ratio (EAR) for one eye.
 * EAR = (||p1-p5|| + ||p2-p4||) / (2 * ||p0-p3||)
 * eye[0] = left corner, eye[3] = right corner (horizontal)
 * eye[1], eye[2] = top lid points; eye[4], eye[5] = bottom lid points
 */
function ear(eye: { x: number; y: number }[]): number {
  const vert1 = dist(eye[1], eye[5]);
  const vert2 = dist(eye[2], eye[4]);
  const horiz = dist(eye[0], eye[3]);
  return horiz === 0 ? 0 : (vert1 + vert2) / (2 * horiz);
}

/**
 * Scores how open the eyes are across all detected faces.
 * Returns 0–100. 100 = all faces have wide-open eyes.
 * Returns 50 for empty input (neutral/unknown score).
 *
 * EAR thresholds: <0.15 = closed, 0.15–0.25 = squinting, >0.25 = open
 */
export async function scoreEyesOpen(faces: FaceDetectionResult[]): Promise<number> {
  if (faces.length === 0) return 50;

  let totalEAR = 0;
  for (const face of faces) {
    const p = face.landmarks.positions;
    // Left eye: landmarks 36–41
    const leftEAR = ear([p[36], p[37], p[38], p[39], p[40], p[41]]);
    // Right eye: landmarks 42–47
    const rightEAR = ear([p[42], p[43], p[44], p[45], p[46], p[47]]);
    totalEAR += (leftEAR + rightEAR) / 2;
  }
  const avg = totalEAR / faces.length;

  // Map EAR to score using a logistic curve.
  // Real-world EAR: ~0.2–0.3 for open eyes, ~0.1–0.15 for closed.
  // Test fixture landmarks may produce larger EAR values (coords in raw pixels).
  // Logistic: score = 100 / (1 + e^(-k*(EAR - midpoint)))
  // Midpoint at EAR=0.2 (threshold between squinting and open); k=20 for sharp discrimination.
  // Midpoint at EAR=0.2, k=20 gives good open/closed separation.
  const logistic = 100 / (1 + Math.exp(-20 * (avg - 0.2)));
  return Math.round(Math.min(100, Math.max(0, logistic)));
}
