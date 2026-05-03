import type * as faceapi from 'face-api.js';

export interface PhotoFile {
  id: string;
  file: File;
  url: string;
}

export interface FaceDetectionResult {
  landmarks: faceapi.FaceLandmarks68;
  expressions: faceapi.FaceExpressions;
  detection: faceapi.FaceDetection;
}

export interface PhotoAnalysis {
  photoId: string;
  lighting: number;
  sharpness: number;
  faces: FaceDetectionResult[];
  eyesOpen: number;
  smiles: number;
  composition: number;
  instagram: number;
  overallScore: number;
  tags: string[];
  reasoning: string;
}

export interface SelectedCriteria {
  eyesOpen: boolean;
  allEyesOpen: boolean;
  bestSmiles: boolean;
  specificPeople: boolean;
  specificPeopleNames: string;
  bestLighting: boolean;
  leastBlurry: boolean;
  bestComposition: boolean;
  bestGroup: boolean;
  bestSolo: boolean;
  bestCandid: boolean;
  instagram: boolean;
}

export interface RankedPhoto {
  photo: PhotoFile;
  analysis: PhotoAnalysis;
  compositeScore: number;
  tags: string[];
  reasoning: string;
}

export interface ResultSection {
  key: string;
  title: string;
  photos: RankedPhoto[];
}

export interface RankedResults {
  sections: ResultSection[];
}
