// src/lib/analysis/matchPeople.ts
import type { FaceDetectionResult } from '@/lib/types';

export interface MatchResult {
  matched: string[];
  unmatched: string[];
}

// FUTURE: Replace with real face recognition API (AWS Rekognition, Azure Face, or face-api.js descriptor matching)
export async function matchPeople(
  _faces: FaceDetectionResult[],
  _names: string[]
): Promise<MatchResult> {
  return { matched: [], unmatched: _names }; // placeholder — always unmatched
}
