# PhotoRank MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully client-side Next.js app that scores and ranks event photos using Canvas API and face-api.js, with zero backend.

**Architecture:** Four-screen flow (Landing → Upload → Criteria → Results) sharing state via Zustand. A modular scoring pipeline in `lib/analysis/` runs entirely in-browser using Canvas pixel data and face-api.js landmark detection. Results are grouped into dynamic sections based on the criteria the user selected.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Zustand, face-api.js, Canvas API, Jest + Testing Library

---

## File Map

| File | Responsibility |
|---|---|
| `src/lib/types.ts` | All shared TypeScript interfaces |
| `src/lib/store.ts` | Zustand store — photos, criteria, results, favorites, progress |
| `src/lib/analysis/scoreLighting.ts` | Canvas: brightness + contrast → 0–100 |
| `src/lib/analysis/scoreSharpness.ts` | Canvas: Laplacian variance → 0–100 |
| `src/lib/analysis/detectFaces.ts` | face-api.js: face detection + landmarks + expressions |
| `src/lib/analysis/scoreEyesOpen.ts` | Eye Aspect Ratio from landmarks → 0–100 |
| `src/lib/analysis/scoreSmiles.ts` | Mouth landmark spread + expressions → 0–100 |
| `src/lib/analysis/scoreComposition.ts` | PLACEHOLDER — returns mock 50 |
| `src/lib/analysis/matchPeople.ts` | PLACEHOLDER — future face recognition |
| `src/lib/analysis/scoreInstagram.ts` | Composite: lighting + sharpness + face score |
| `src/lib/analysis/analyzePhoto.ts` | Orchestrates all scoring for one photo |
| `src/lib/analysis/rankPhotos.ts` | Runs pipeline on all photos, groups results |
| `src/app/layout.tsx` | Root layout, dark background, font, model loader |
| `src/app/page.tsx` | Landing screen |
| `src/app/upload/page.tsx` | Upload screen with drag-and-drop |
| `src/app/criteria/page.tsx` | Criteria checkboxes |
| `src/app/results/page.tsx` | Results screen orchestrator |
| `src/components/PhotoGrid.tsx` | Upload thumbnail grid |
| `src/components/PhotoCard.tsx` | Single ranked photo card |
| `src/components/CriteriaSelector.tsx` | Checkbox groups |
| `src/components/ResultsSection.tsx` | One results section (title + photo cards) |
| `src/components/ProgressBar.tsx` | Progress bar with status text |
| `src/components/PhotoModal.tsx` | Full-screen photo detail modal |
| `src/components/DownloadButton.tsx` | Download single photo or favorites zip |
| `src/components/ModelLoader.tsx` | Loads face-api.js models on app start |
| `jest.config.js` | Jest config |
| `jest.setup.ts` | Canvas mock setup |

---

## Task 1: Scaffold Next.js App

**Files:**
- Create: project root (scaffolded by create-next-app)
- Create: `jest.config.js`
- Create: `jest.setup.ts`

- [ ] **Step 1: Scaffold the app**

Run from `C:\Users\drake\Desktop\photorank`:
```powershell
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*" --yes
```
Expected: Next.js project scaffolded in current directory with `src/` structure. If prompted for overwrite on existing files, choose yes.

- [ ] **Step 2: Install dependencies**

```powershell
npm install face-api.js zustand
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @types/jest ts-jest
```

- [ ] **Step 3: Verify src/ structure**

```powershell
# --src-dir flag puts app/ inside src/ automatically — verify:
if (Test-Path "src/app") { Write-Host "src/app exists — correct" } else { Write-Host "WARNING: src/app missing, check scaffold output" }
```

- [ ] **Step 4: Create jest.config.js**

```js
// jest.config.js
const nextJest = require('next/jest');
const createJestConfig = nextJest({ dir: './' });
module.exports = createJestConfig({
  // "setupFilesAfterFramework" is a Jest config option that runs setup after the test framework installs
  // If Jest reports unknown config key, check docs and use the current spelling
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
});
```

- [ ] **Step 5: Create jest.setup.ts**

```ts
// jest.setup.ts
import '@testing-library/jest-dom';

// Mock canvas getContext for scoring functions
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  drawImage: jest.fn(),
  getImageData: jest.fn(() => ({
    data: new Uint8ClampedArray(100 * 100 * 4).fill(128),
  })),
})) as unknown as typeof HTMLCanvasElement.prototype.getContext;
```

- [ ] **Step 6: Add test script to package.json**

Edit `package.json` — add to `scripts`:
```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 7: Verify scaffold**

```powershell
npm run dev
```
Expected: Next.js dev server starts on http://localhost:3000. Ctrl+C to stop.

- [ ] **Step 8: Commit**

```powershell
git init
git add .
git commit -m "feat: scaffold Next.js app with dependencies"
```

---

## Task 2: Types

**Files:**
- Create: `src/lib/types.ts`

- [ ] **Step 1: Create src/lib/ directory**

```powershell
New-Item -ItemType Directory -Force "src/lib/analysis"
```

- [ ] **Step 2: Write types.ts**

```ts
// src/lib/types.ts
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
```

- [ ] **Step 3: Commit**

```powershell
git add src/lib/types.ts
git commit -m "feat: add shared TypeScript types"
```

---

## Task 3: Zustand Store

**Files:**
- Create: `src/lib/store.ts`

- [ ] **Step 1: Write store.ts**

```ts
// src/lib/store.ts
import { create } from 'zustand';
import type { PhotoFile, SelectedCriteria, RankedResults } from './types';

interface AppState {
  photos: PhotoFile[];
  criteria: SelectedCriteria;
  results: RankedResults | null;
  favorites: Set<string>;
  isAnalyzing: boolean;
  analysisProgress: number;
  addPhotos: (photos: PhotoFile[]) => void;
  removePhoto: (id: string) => void;
  setCriteria: (criteria: Partial<SelectedCriteria>) => void;
  setResults: (results: RankedResults) => void;
  toggleFavorite: (id: string) => void;
  setIsAnalyzing: (v: boolean) => void;
  setAnalysisProgress: (v: number) => void;
  reset: () => void;
}

const defaultCriteria: SelectedCriteria = {
  eyesOpen: false,
  allEyesOpen: false,
  bestSmiles: false,
  specificPeople: false,
  specificPeopleNames: '',
  bestLighting: false,
  leastBlurry: false,
  bestComposition: false,
  bestGroup: false,
  bestSolo: false,
  bestCandid: false,
  instagram: false,
};

export const useStore = create<AppState>((set) => ({
  photos: [],
  criteria: defaultCriteria,
  results: null,
  favorites: new Set<string>(),
  isAnalyzing: false,
  analysisProgress: 0,

  addPhotos: (newPhotos) =>
    set((state) => ({ photos: [...state.photos, ...newPhotos] })),
  removePhoto: (id) =>
    set((state) => ({ photos: state.photos.filter((p) => p.id !== id) })),
  setCriteria: (partial) =>
    set((state) => ({ criteria: { ...state.criteria, ...partial } })),
  setResults: (results) => set({ results }),
  toggleFavorite: (id) =>
    set((state) => {
      const favorites = new Set(state.favorites);
      if (favorites.has(id)) favorites.delete(id);
      else favorites.add(id);
      return { favorites };
    }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setAnalysisProgress: (analysisProgress) => set({ analysisProgress }),
  reset: () =>
    set({
      photos: [],
      criteria: defaultCriteria,
      results: null,
      favorites: new Set<string>(),
      isAnalyzing: false,
      analysisProgress: 0,
    }),
}));
```

- [ ] **Step 2: Commit**

```powershell
git add src/lib/store.ts
git commit -m "feat: add Zustand store for app state"
```

---

## Task 4: scoreLighting + scoreSharpness

**Files:**
- Create: `src/lib/analysis/scoreLighting.ts`
- Create: `src/lib/analysis/scoreSharpness.ts`
- Create: `src/__tests__/analysis/scoreLighting.test.ts`
- Create: `src/__tests__/analysis/scoreSharpness.test.ts`

- [ ] **Step 1: Write failing test for scoreLighting**

```powershell
New-Item -ItemType Directory -Force "src/__tests__/analysis"
```

```ts
// src/__tests__/analysis/scoreLighting.test.ts
import { scoreLighting } from '@/lib/analysis/scoreLighting';

function makeImage(pixelValue: number): HTMLImageElement {
  const img = new Image();
  // Mock getContext to return pixels of the given luminance
  jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    drawImage: jest.fn(),
    getImageData: jest.fn(() => ({
      data: new Uint8ClampedArray(
        Array(100 * 100 * 4).fill(0).map((_, i) => (i % 4 === 3 ? 255 : pixelValue))
      ),
    })),
  } as unknown as CanvasRenderingContext2D);
  return img;
}

describe('scoreLighting', () => {
  it('returns a score between 0 and 100', async () => {
    const img = makeImage(128);
    const score = await scoreLighting(img);
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
```

- [ ] **Step 2: Run test to verify it fails**

```powershell
npx jest src/__tests__/analysis/scoreLighting.test.ts --no-coverage
```
Expected: FAIL — "Cannot find module '@/lib/analysis/scoreLighting'"

- [ ] **Step 3: Write scoreLighting.ts**

```ts
// src/lib/analysis/scoreLighting.ts
export async function scoreLighting(imageElement: HTMLImageElement): Promise<number> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const W = 100, H = 100;
  canvas.width = W;
  canvas.height = H;
  ctx.drawImage(imageElement, 0, 0, W, H);
  const { data } = ctx.getImageData(0, 0, W, H);

  let totalLum = 0;
  const pixelCount = W * H;
  for (let i = 0; i < data.length; i += 4) {
    totalLum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  const avg = totalLum / pixelCount;

  // Ideal range 60–200, centered around 128
  const idealMin = 60, idealMax = 200, ideal = 128;
  let score: number;
  if (avg < idealMin) {
    score = (avg / idealMin) * 70;
  } else if (avg > idealMax) {
    score = 70 - ((avg - idealMax) / (255 - idealMax)) * 70;
  } else {
    const dist = Math.abs(avg - ideal);
    score = 100 - (dist / ((idealMax - idealMin) / 2)) * 30;
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}
```

- [ ] **Step 4: Run test to verify it passes**

```powershell
npx jest src/__tests__/analysis/scoreLighting.test.ts --no-coverage
```
Expected: PASS (3 tests)

- [ ] **Step 5: Write failing test for scoreSharpness**

```ts
// src/__tests__/analysis/scoreSharpness.test.ts
import { scoreSharpness } from '@/lib/analysis/scoreSharpness';

function makeImageWithVariance(variance: 'high' | 'low'): HTMLImageElement {
  const img = new Image();
  const W = 200, H = 200;
  // High variance: alternating 0 and 255 per pixel
  // Low variance: uniform 128
  const data = new Uint8ClampedArray(W * H * 4);
  for (let i = 0; i < data.length; i += 4) {
    const val = variance === 'high' ? (i % 8 < 4 ? 0 : 255) : 128;
    data[i] = data[i + 1] = data[i + 2] = val;
    data[i + 3] = 255;
  }
  jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    drawImage: jest.fn(),
    getImageData: jest.fn(() => ({ data })),
  } as unknown as CanvasRenderingContext2D);
  return img;
}

describe('scoreSharpness', () => {
  it('returns a score between 0 and 100', async () => {
    const img = makeImageWithVariance('high');
    const score = await scoreSharpness(img);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('scores a high-variance image higher than a uniform image', async () => {
    const sharp = await scoreSharpness(makeImageWithVariance('high'));
    const blurry = await scoreSharpness(makeImageWithVariance('low'));
    expect(sharp).toBeGreaterThan(blurry);
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

```powershell
npx jest src/__tests__/analysis/scoreSharpness.test.ts --no-coverage
```
Expected: FAIL — "Cannot find module '@/lib/analysis/scoreSharpness'"

- [ ] **Step 7: Write scoreSharpness.ts**

```ts
// src/lib/analysis/scoreSharpness.ts
export async function scoreSharpness(imageElement: HTMLImageElement): Promise<number> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const W = 200, H = 200;
  canvas.width = W;
  canvas.height = H;
  ctx.drawImage(imageElement, 0, 0, W, H);
  const { data } = ctx.getImageData(0, 0, W, H);

  // Convert to grayscale
  const gray: number[] = [];
  for (let i = 0; i < data.length; i += 4) {
    gray.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  }

  // Apply Laplacian kernel
  const laps: number[] = [];
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const idx = y * W + x;
      laps.push(
        gray[idx - W] + gray[idx + W] + gray[idx - 1] + gray[idx + 1] - 4 * gray[idx]
      );
    }
  }

  const mean = laps.reduce((a, b) => a + b, 0) / laps.length;
  const variance = laps.reduce((s, v) => s + (v - mean) ** 2, 0) / laps.length;

  // Empirical range: <50 very blurry, >2000 very sharp
  const score = Math.min(100, Math.max(0, ((variance - 50) / (2000 - 50)) * 100));
  return Math.round(score);
}
```

- [ ] **Step 8: Run both tests**

```powershell
npx jest src/__tests__/analysis/ --no-coverage
```
Expected: PASS (5 tests total)

- [ ] **Step 9: Commit**

```powershell
git add src/lib/analysis/scoreLighting.ts src/lib/analysis/scoreSharpness.ts src/__tests__/
git commit -m "feat: add Canvas-based lighting and sharpness scoring"
```

---

## Task 5: detectFaces + face-api.js Setup

**Files:**
- Create: `src/lib/analysis/detectFaces.ts`
- Create: `src/__tests__/analysis/detectFaces.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// src/__tests__/analysis/detectFaces.test.ts
jest.mock('face-api.js', () => ({
  nets: {
    tinyFaceDetector: { loadFromUri: jest.fn().mockResolvedValue(undefined) },
    faceLandmark68Net: { loadFromUri: jest.fn().mockResolvedValue(undefined) },
    faceExpressionNet: { loadFromUri: jest.fn().mockResolvedValue(undefined) },
  },
  TinyFaceDetectorOptions: jest.fn(),
  detectAllFaces: jest.fn(() => ({
    withFaceLandmarks: jest.fn(() => ({
      withFaceExpressions: jest.fn().mockResolvedValue([
        {
          landmarks: { positions: Array(68).fill({ x: 10, y: 10 }) },
          expressions: { happy: 0.9, sad: 0.1 },
          detection: { score: 0.95 },
        },
      ]),
    })),
  })),
}));

import { loadModels, detectFaces } from '@/lib/analysis/detectFaces';

describe('detectFaces', () => {
  it('loads models without throwing', async () => {
    await expect(loadModels()).resolves.not.toThrow();
  });

  it('returns an array of face results', async () => {
    const img = new Image();
    const faces = await detectFaces(img);
    expect(Array.isArray(faces)).toBe(true);
    expect(faces.length).toBe(1);
    expect(faces[0]).toHaveProperty('landmarks');
    expect(faces[0]).toHaveProperty('expressions');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```powershell
npx jest src/__tests__/analysis/detectFaces.test.ts --no-coverage
```
Expected: FAIL

- [ ] **Step 3: Write detectFaces.ts**

```ts
// src/lib/analysis/detectFaces.ts
import * as faceapi from 'face-api.js';
import type { FaceDetectionResult } from '@/lib/types';

let modelsLoaded = false;

export async function loadModels(): Promise<void> {
  if (modelsLoaded) return;
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models'),
  ]);
  modelsLoaded = true;
}

export async function detectFaces(imageElement: HTMLImageElement): Promise<FaceDetectionResult[]> {
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
```

- [ ] **Step 4: Run test to verify it passes**

```powershell
npx jest src/__tests__/analysis/detectFaces.test.ts --no-coverage
```
Expected: PASS

- [ ] **Step 5: Commit**

```powershell
git add src/lib/analysis/detectFaces.ts src/__tests__/analysis/detectFaces.test.ts
git commit -m "feat: add face-api.js face detection"
```

---

## Task 6: scoreEyesOpen + scoreSmiles

**Files:**
- Create: `src/lib/analysis/scoreEyesOpen.ts`
- Create: `src/lib/analysis/scoreSmiles.ts`
- Create: `src/__tests__/analysis/scoreEyesOpen.test.ts`
- Create: `src/__tests__/analysis/scoreSmiles.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// src/__tests__/analysis/scoreEyesOpen.test.ts
import { scoreEyesOpen } from '@/lib/analysis/scoreEyesOpen';
import type { FaceDetectionResult } from '@/lib/types';

function makeFace(eyeOpenness: 'open' | 'closed'): FaceDetectionResult {
  // Open eye: wide vertical spread (EAR ~0.35)
  // Closed eye: flat (EAR ~0.10)
  const positions = Array(68).fill(null).map(() => ({ x: 0, y: 0 }));
  // Left eye: indices 36-41
  // Right eye: indices 42-47
  const spread = eyeOpenness === 'open' ? 10 : 2;
  // p0=36 (left corner), p3=39 (right corner), p1=37, p2=38, p4=41, p5=40
  positions[36] = { x: 0, y: 5 };    // left corner
  positions[37] = { x: 3, y: 5 - spread }; // top-left
  positions[38] = { x: 7, y: 5 - spread }; // top-right
  positions[39] = { x: 10, y: 5 };   // right corner
  positions[40] = { x: 7, y: 5 + spread }; // bottom-right
  positions[41] = { x: 3, y: 5 + spread }; // bottom-left
  // Mirror for right eye
  positions[42] = { x: 20, y: 5 };
  positions[43] = { x: 23, y: 5 - spread };
  positions[44] = { x: 27, y: 5 - spread };
  positions[45] = { x: 30, y: 5 };
  positions[46] = { x: 27, y: 5 + spread };
  positions[47] = { x: 23, y: 5 + spread };

  return {
    landmarks: { positions } as unknown as FaceDetectionResult['landmarks'],
    expressions: { happy: 0, sad: 0 } as unknown as FaceDetectionResult['expressions'],
    detection: {} as unknown as FaceDetectionResult['detection'],
  };
}

describe('scoreEyesOpen', () => {
  it('returns 50 for empty face array', async () => {
    expect(await scoreEyesOpen([])).toBe(50);
  });

  it('scores open eyes higher than closed eyes', async () => {
    const open = await scoreEyesOpen([makeFace('open')]);
    const closed = await scoreEyesOpen([makeFace('closed')]);
    expect(open).toBeGreaterThan(closed);
  });

  it('returns a value between 0 and 100', async () => {
    const score = await scoreEyesOpen([makeFace('open')]);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
```

```ts
// src/__tests__/analysis/scoreSmiles.test.ts
import { scoreSmiles } from '@/lib/analysis/scoreSmiles';
import type { FaceDetectionResult } from '@/lib/types';

function makeFace(smiling: boolean): FaceDetectionResult {
  const positions = Array(68).fill({ x: 50, y: 50 });
  // Mouth outer corners: 48 (left), 54 (right)
  // Upper lip: 51, lower lip: 57
  const mouthWidth = smiling ? 30 : 15;
  const mouthHeight = smiling ? 8 : 5;
  const posArr = [...positions];
  posArr[48] = { x: 35, y: 50 };
  posArr[54] = { x: 35 + mouthWidth, y: 50 };
  posArr[51] = { x: 50, y: 45 };
  posArr[57] = { x: 50, y: 45 + mouthHeight };

  return {
    landmarks: { positions: posArr } as unknown as FaceDetectionResult['landmarks'],
    expressions: { happy: smiling ? 0.85 : 0.05 } as unknown as FaceDetectionResult['expressions'],
    detection: {} as unknown as FaceDetectionResult['detection'],
  };
}

describe('scoreSmiles', () => {
  it('returns 50 for empty face array', async () => {
    expect(await scoreSmiles([])).toBe(50);
  });

  it('scores a smiling face higher than a neutral face', async () => {
    const smiling = await scoreSmiles([makeFace(true)]);
    const neutral = await scoreSmiles([makeFace(false)]);
    expect(smiling).toBeGreaterThan(neutral);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```powershell
npx jest src/__tests__/analysis/scoreEyesOpen.test.ts src/__tests__/analysis/scoreSmiles.test.ts --no-coverage
```
Expected: FAIL

- [ ] **Step 3: Write scoreEyesOpen.ts**

```ts
// src/lib/analysis/scoreEyesOpen.ts
import type { FaceDetectionResult } from '@/lib/types';

function dist(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

function ear(eye: { x: number; y: number }[]): number {
  // EAR = (||p1-p5|| + ||p2-p4||) / (2 * ||p0-p3||)
  const vert1 = dist(eye[1], eye[5]);
  const vert2 = dist(eye[2], eye[4]);
  const horiz = dist(eye[0], eye[3]);
  return horiz === 0 ? 0 : (vert1 + vert2) / (2 * horiz);
}

export async function scoreEyesOpen(faces: FaceDetectionResult[]): Promise<number> {
  if (faces.length === 0) return 50;

  let totalEAR = 0;
  for (const face of faces) {
    const p = face.landmarks.positions;
    const leftEAR = ear([p[36], p[37], p[38], p[39], p[40], p[41]]);
    const rightEAR = ear([p[42], p[43], p[44], p[45], p[46], p[47]]);
    totalEAR += (leftEAR + rightEAR) / 2;
  }
  const avg = totalEAR / faces.length;

  // EAR thresholds: <0.15 closed, 0.15–0.25 squinting, >0.25 open
  const score = Math.min(100, Math.max(0, ((avg - 0.1) / (0.35 - 0.1)) * 100));
  return Math.round(score);
}
```

- [ ] **Step 4: Write scoreSmiles.ts**

```ts
// src/lib/analysis/scoreSmiles.ts
import type { FaceDetectionResult } from '@/lib/types';

function dist(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

export async function scoreSmiles(faces: FaceDetectionResult[]): Promise<number> {
  if (faces.length === 0) return 50;

  let total = 0;
  for (const face of faces) {
    // Expression-based (60% weight)
    const happy = (face.expressions as Record<string, number>).happy ?? 0;

    // Landmark-based mouth ratio (40% weight)
    const p = face.landmarks.positions;
    const mouthWidth = dist(p[48], p[54]);
    const mouthHeight = dist(p[51], p[57]) + 1;
    const ratio = mouthWidth / mouthHeight;
    // ratio 1.5 = neutral, 5+ = big smile
    const ratioScore = Math.min(1, Math.max(0, (ratio - 1.5) / 3.5));

    total += happy * 0.6 + ratioScore * 0.4;
  }

  return Math.round(Math.min(100, Math.max(0, (total / faces.length) * 100)));
}
```

- [ ] **Step 5: Run tests to verify they pass**

```powershell
npx jest src/__tests__/analysis/ --no-coverage
```
Expected: PASS (all 9 tests)

- [ ] **Step 6: Commit**

```powershell
git add src/lib/analysis/scoreEyesOpen.ts src/lib/analysis/scoreSmiles.ts src/__tests__/analysis/scoreEyesOpen.test.ts src/__tests__/analysis/scoreSmiles.test.ts
git commit -m "feat: add eye-open and smile scoring from face landmarks"
```

---

## Task 7: Placeholders, scoreInstagram, analyzePhoto

**Files:**
- Create: `src/lib/analysis/scoreComposition.ts`
- Create: `src/lib/analysis/matchPeople.ts`
- Create: `src/lib/analysis/scoreInstagram.ts`
- Create: `src/lib/analysis/analyzePhoto.ts`

- [ ] **Step 1: Write scoreComposition.ts (placeholder)**

```ts
// src/lib/analysis/scoreComposition.ts
// FUTURE: Replace with vision model for composition analysis (rule of thirds, subject centering)
export async function scoreComposition(_imageElement: HTMLImageElement): Promise<number> {
  return 50; // placeholder
}
```

- [ ] **Step 2: Write matchPeople.ts (placeholder)**

```ts
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
  return { matched: [], unmatched: _names }; // placeholder
}
```

- [ ] **Step 3: Write scoreInstagram.ts**

```ts
// src/lib/analysis/scoreInstagram.ts
export async function scoreInstagram(
  lighting: number,
  sharpness: number,
  eyesOpen: number,
  faceCount: number
): Promise<number> {
  const faceBonus = faceCount > 0 ? Math.min(100, faceCount * 20 + 20) : 40;
  const score = lighting * 0.35 + sharpness * 0.35 + eyesOpen * 0.15 + faceBonus * 0.15;
  return Math.round(Math.min(100, Math.max(0, score)));
}
```

- [ ] **Step 4: Write analyzePhoto.ts**

```ts
// src/lib/analysis/analyzePhoto.ts
import type { PhotoFile, PhotoAnalysis } from '@/lib/types';
import { scoreLighting } from './scoreLighting';
import { scoreSharpness } from './scoreSharpness';
import { detectFaces } from './detectFaces';
import { scoreEyesOpen } from './scoreEyesOpen';
import { scoreSmiles } from './scoreSmiles';
import { scoreComposition } from './scoreComposition';
import { scoreInstagram } from './scoreInstagram';

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export async function analyzePhoto(photo: PhotoFile): Promise<PhotoAnalysis> {
  const img = await loadImage(photo.url);

  const [lighting, sharpness, faces] = await Promise.all([
    scoreLighting(img),
    scoreSharpness(img),
    detectFaces(img),
  ]);

  const [eyesOpen, smiles, composition] = await Promise.all([
    scoreEyesOpen(faces),
    scoreSmiles(faces),
    scoreComposition(img),
  ]);

  const instagram = await scoreInstagram(lighting, sharpness, eyesOpen, faces.length);

  const tags: string[] = [];
  if (sharpness >= 70) tags.push('sharp');
  if (lighting >= 70) tags.push('bright');
  if (eyesOpen >= 70) tags.push('eyes-open');
  if (smiles >= 70) tags.push('smiling');
  if (faces.length >= 2) tags.push('group');
  if (faces.length === 1) tags.push('solo');
  if (faces.length === 0) tags.push('no-faces');

  const reasonParts: string[] = [];
  if (sharpness >= 70) reasonParts.push('High sharpness');
  else if (sharpness < 40) reasonParts.push('Some blur detected');
  if (lighting >= 70) reasonParts.push('Good exposure');
  else if (lighting < 40) reasonParts.push('Low exposure');
  if (faces.length > 0) {
    reasonParts.push(`${faces.length} face${faces.length > 1 ? 's' : ''} detected`);
    if (eyesOpen >= 70) reasonParts.push('eyes open');
  }
  const reasoning = reasonParts.length > 0 ? reasonParts.join(', ') + '.' : 'No notable features detected.';

  const overallScore = Math.round(
    lighting * 0.25 + sharpness * 0.25 + eyesOpen * 0.2 + smiles * 0.15 + composition * 0.15
  );

  return {
    photoId: photo.id,
    lighting,
    sharpness,
    faces,
    eyesOpen,
    smiles,
    composition,
    instagram,
    overallScore,
    tags,
    reasoning,
  };
}
```

- [ ] **Step 5: Commit**

```powershell
git add src/lib/analysis/
git commit -m "feat: add composition/people placeholders, instagram score, analyzePhoto orchestrator"
```

---

## Task 8: rankPhotos

**Files:**
- Create: `src/lib/analysis/rankPhotos.ts`
- Create: `src/__tests__/analysis/rankPhotos.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// src/__tests__/analysis/rankPhotos.test.ts
import { buildRankedResults } from '@/lib/analysis/rankPhotos';
import type { PhotoAnalysis, SelectedCriteria, PhotoFile, FaceDetectionResult } from '@/lib/types';

function makeAnalysis(overrides: Partial<PhotoAnalysis> = {}): PhotoAnalysis {
  return {
    photoId: 'test-id',
    lighting: 70,
    sharpness: 70,
    faces: [],
    eyesOpen: 70,
    smiles: 70,
    composition: 50,
    instagram: 70,
    overallScore: 70,
    tags: ['sharp', 'bright'],
    reasoning: 'Test.',
    ...overrides,
  };
}

function makePhoto(id: string): PhotoFile {
  return { id, file: {} as File, url: `blob:${id}` };
}

const baseCriteria: SelectedCriteria = {
  eyesOpen: false, allEyesOpen: false, bestSmiles: false, specificPeople: false,
  specificPeopleNames: '', bestLighting: false, leastBlurry: false,
  bestComposition: false, bestGroup: false, bestSolo: false, bestCandid: false, instagram: false,
};

describe('buildRankedResults', () => {
  it('always includes Best Overall as first section', () => {
    const photos = [makePhoto('a'), makePhoto('b')];
    const analyses = [makeAnalysis({ photoId: 'a' }), makeAnalysis({ photoId: 'b' })];
    const result = buildRankedResults(photos, analyses, baseCriteria);
    expect(result.sections[0].key).toBe('overall');
    expect(result.sections[0].title).toBe('Best Overall');
  });

  it('always includes Needs Review as last section', () => {
    const photos = [makePhoto('a'), makePhoto('b'), makePhoto('c')];
    const analyses = photos.map((p) => makeAnalysis({ photoId: p.id }));
    const result = buildRankedResults(photos, analyses, baseCriteria);
    const last = result.sections[result.sections.length - 1];
    expect(last.key).toBe('needs-review');
  });

  it('adds a section for each selected criterion', () => {
    const photos = [makePhoto('a'), makePhoto('b')];
    const analyses = photos.map((p) => makeAnalysis({ photoId: p.id }));
    const criteria = { ...baseCriteria, bestLighting: true, leastBlurry: true };
    const result = buildRankedResults(photos, analyses, criteria);
    const keys = result.sections.map((s) => s.key);
    expect(keys).toContain('bestLighting');
    expect(keys).toContain('leastBlurry');
  });

  it('ranks photos in Best Lighting by lighting score descending', () => {
    const photos = [makePhoto('bright'), makePhoto('dark')];
    const analyses = [
      makeAnalysis({ photoId: 'bright', lighting: 90 }),
      makeAnalysis({ photoId: 'dark', lighting: 20 }),
    ];
    const criteria = { ...baseCriteria, bestLighting: true };
    const result = buildRankedResults(photos, analyses, criteria);
    const lightingSection = result.sections.find((s) => s.key === 'bestLighting')!;
    expect(lightingSection.photos[0].photo.id).toBe('bright');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```powershell
npx jest src/__tests__/analysis/rankPhotos.test.ts --no-coverage
```
Expected: FAIL

- [ ] **Step 3: Write rankPhotos.ts**

```ts
// src/lib/analysis/rankPhotos.ts
import type {
  PhotoFile, SelectedCriteria, RankedResults, RankedPhoto,
  ResultSection, PhotoAnalysis,
} from '@/lib/types';
import { analyzePhoto } from './analyzePhoto';

type CriteriaKey = keyof SelectedCriteria;

function scoreForCriterion(key: CriteriaKey, a: PhotoAnalysis): number {
  switch (key) {
    case 'bestLighting': return a.lighting;
    case 'leastBlurry': return a.sharpness;
    case 'eyesOpen': return a.eyesOpen;
    case 'allEyesOpen': return a.eyesOpen;
    case 'bestSmiles': return a.smiles;
    case 'bestComposition': return a.composition;
    case 'instagram': return a.instagram;
    case 'bestGroup': return a.faces.length >= 2 ? 80 + a.lighting * 0.2 : 20;
    case 'bestSolo': return a.faces.length === 1 ? 80 + a.lighting * 0.2 : 20;
    case 'bestCandid': return a.faces.length <= 2 ? (100 - a.smiles) * 0.5 + a.sharpness * 0.5 : 20;
    default: return a.overallScore;
  }
}

const CRITERIA_LABELS: Partial<Record<CriteriaKey, string>> = {
  bestLighting: 'Best Lighting',
  leastBlurry: 'Sharpest Photos',
  eyesOpen: 'Eyes Open',
  allEyesOpen: "Everyone's Eyes Open",
  bestSmiles: 'Best Smiles',
  bestComposition: 'Best Composition',
  bestGroup: 'Best Group Photos',
  bestSolo: 'Best Solo Shots',
  bestCandid: 'Best Candids',
  instagram: 'Instagram-Worthy',
};

function computeComposite(a: PhotoAnalysis, criteria: SelectedCriteria): number {
  const active = (Object.keys(CRITERIA_LABELS) as CriteriaKey[]).filter((k) => criteria[k]);
  if (active.length === 0) return a.overallScore;
  const sum = active.reduce((acc, k) => acc + scoreForCriterion(k, a), 0);
  return Math.round(sum / active.length);
}

// Pure ranking function — exported for tests
export function buildRankedResults(
  photos: PhotoFile[],
  analyses: PhotoAnalysis[],
  criteria: SelectedCriteria
): RankedResults {
  const ranked: RankedPhoto[] = photos.map((photo, i) => {
    const analysis = analyses[i];
    return {
      photo,
      analysis,
      compositeScore: computeComposite(analysis, criteria),
      tags: analysis.tags,
      reasoning: analysis.reasoning,
    };
  });

  ranked.sort((a, b) => b.compositeScore - a.compositeScore);

  const sections: ResultSection[] = [];

  // Best Overall: top 30%
  sections.push({
    key: 'overall',
    title: 'Best Overall',
    photos: ranked.slice(0, Math.max(1, Math.ceil(ranked.length * 0.3))),
  });

  // Dynamic sections
  const activeCriteria = (Object.keys(CRITERIA_LABELS) as CriteriaKey[]).filter((k) => criteria[k]);
  for (const key of activeCriteria) {
    const sorted = [...ranked].sort(
      (a, b) => scoreForCriterion(key, b.analysis) - scoreForCriterion(key, a.analysis)
    );
    sections.push({
      key,
      title: CRITERIA_LABELS[key]!,
      photos: sorted.slice(0, Math.max(1, Math.ceil(sorted.length * 0.5))),
    });
  }

  // Needs Review: bottom 20%
  const needsReview = [...ranked]
    .sort((a, b) => a.compositeScore - b.compositeScore)
    .slice(0, Math.max(1, Math.ceil(ranked.length * 0.2)));

  sections.push({ key: 'needs-review', title: 'Needs Review', photos: needsReview });

  return { sections };
}

// Full async pipeline — used by results page
export async function rankPhotos(
  photos: PhotoFile[],
  criteria: SelectedCriteria,
  onProgress?: (current: number, total: number) => void
): Promise<RankedResults> {
  const analyses: PhotoAnalysis[] = [];
  for (let i = 0; i < photos.length; i++) {
    analyses.push(await analyzePhoto(photos[i]));
    onProgress?.(i + 1, photos.length);
  }
  return buildRankedResults(photos, analyses, criteria);
}
```

- [ ] **Step 4: Run tests to verify they pass**

```powershell
npx jest src/__tests__/analysis/rankPhotos.test.ts --no-coverage
```
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```powershell
git add src/lib/analysis/rankPhotos.ts src/__tests__/analysis/rankPhotos.test.ts
git commit -m "feat: add photo ranking and dynamic result grouping"
```

---

## Task 9: Layout + Landing Page

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Create: `src/components/ModelLoader.tsx`

- [ ] **Step 1: Write ModelLoader.tsx**

```tsx
// src/components/ModelLoader.tsx
'use client';
import { useEffect, useState } from 'react';
import { loadModels } from '@/lib/analysis/detectFaces';

export function ModelLoader({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadModels()
      .then(() => setLoaded(true))
      .catch(() => {
        // Face models not found — app still works, face features disabled
        setLoaded(true);
        setError(true);
      });
  }, []);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 text-sm">Loading face detection models…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="fixed bottom-4 right-4 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-400 z-50 max-w-xs">
          Face detection models not found in <code className="text-zinc-300">/public/models/</code>. Face features disabled.
        </div>
      )}
      {children}
    </>
  );
}
```

- [ ] **Step 2: Write layout.tsx**

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ModelLoader } from '@/components/ModelLoader';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PhotoRank',
  description: 'Find the best photos from the chaos.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0f0f0f] text-white min-h-screen`}>
        <ModelLoader>{children}</ModelLoader>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Write landing page**

```tsx
// src/app/page.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Logo mark */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-10 h-10 bg-[#6366f1] rounded-xl flex items-center justify-center text-xl font-bold">
            P
          </div>
          <span className="text-2xl font-semibold tracking-tight text-white">PhotoRank</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
            Find the best photos<br />
            <span className="text-[#6366f1]">from the chaos.</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-lg mx-auto">
            Upload your event photos, pick what matters, and get ranked results instantly.
          </p>
        </div>

        <Link
          href="/upload"
          className="inline-block bg-[#6366f1] hover:bg-[#5558e8] text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-150 hover:scale-[1.02]"
        >
          Start Sorting
        </Link>

        {/* Privacy note */}
        <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-5a4 4 0 100-8 4 4 0 000 8z" />
          </svg>
          <span>Your photos never leave your device.</span>
          <button
            className="text-zinc-400 hover:text-zinc-300 underline-offset-2 hover:underline"
            title="PhotoRank uses your browser's computing power to analyze photos locally. Face detection runs on-device using face-api.js."
          >
            How?
          </button>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Verify in browser**

```powershell
npm run dev
```
Open http://localhost:3000 — should see dark landing page with headline, "Start Sorting" button, and privacy note. Ctrl+C to stop.

- [ ] **Step 5: Commit**

```powershell
git add src/app/layout.tsx src/app/page.tsx src/components/ModelLoader.tsx
git commit -m "feat: landing page and model loader"
```

---

## Task 10: Upload Screen + PhotoGrid

**Files:**
- Create: `src/app/upload/page.tsx`
- Create: `src/components/PhotoGrid.tsx`

- [ ] **Step 1: Write PhotoGrid.tsx**

```tsx
// src/components/PhotoGrid.tsx
'use client';
import Image from 'next/image';
import type { PhotoFile } from '@/lib/types';

interface Props {
  photos: PhotoFile[];
  onRemove: (id: string) => void;
}

export function PhotoGrid({ photos, onRemove }: Props) {
  if (photos.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {photos.map((photo) => (
        <div key={photo.id} className="relative group rounded-xl overflow-hidden bg-[#1a1a1a] border border-[#2a2a2a] aspect-square">
          <img
            src={photo.url}
            alt={photo.file.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => onRemove(photo.id)}
            className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 hover:bg-red-600 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150"
            aria-label="Remove photo"
          >
            ×
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1 opacity-0 group-hover:opacity-100 transition-all duration-150">
            <p className="text-white text-xs truncate">{photo.file.name}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Write upload page**

```tsx
// src/app/upload/page.tsx
'use client';
import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { PhotoGrid } from '@/components/PhotoGrid';
import type { PhotoFile } from '@/lib/types';

function fileToPhotoFile(file: File): PhotoFile {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`,
    file,
    url: URL.createObjectURL(file),
  };
}

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

export default function UploadPage() {
  const router = useRouter();
  const { photos, addPhotos, removePhoto } = useStore();
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files)
      .filter((f) => ACCEPTED.includes(f.type) || f.name.toLowerCase().endsWith('.heic'))
      .map(fileToPhotoFile);
    if (valid.length > 0) addPhotos(valid);
  }, [addPhotos]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  return (
    <main className="min-h-screen bg-[#0f0f0f] px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Upload Photos</h1>
          <p className="text-zinc-400">Drag and drop your event photos, or click to select them.</p>
        </div>

        {/* Drop zone */}
        <div
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-150 ${
            dragOver
              ? 'border-[#6366f1] bg-[#6366f1]/10'
              : 'border-[#2a2a2a] hover:border-[#3a3a3a] bg-[#1a1a1a]'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
        >
          <div className="space-y-3">
            <div className="text-4xl">📷</div>
            <div>
              <p className="text-white font-medium">Drop photos here or click to browse</p>
              <p className="text-zinc-500 text-sm mt-1">JPG, PNG, WEBP, HEIC supported</p>
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,.heic"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {/* Count */}
        {photos.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-zinc-400 text-sm">
              <span className="text-white font-semibold">{photos.length}</span> photo{photos.length !== 1 ? 's' : ''} uploaded
            </p>
            <button
              onClick={() => useStore.getState().reset()}
              className="text-zinc-500 hover:text-red-400 text-sm transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Grid */}
        <PhotoGrid photos={photos} onRemove={removePhoto} />

        {/* Privacy note */}
        <div className="flex items-center gap-2 text-sm text-zinc-500 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3">
          <span>🔒</span>
          <span>Your photos are processed entirely on your device. Nothing is uploaded to any server.</span>
        </div>

        {/* Empty state */}
        {photos.length === 0 && (
          <div className="text-center text-zinc-600 py-4">
            No photos yet — drop some in to get started.
          </div>
        )}

        {/* CTA */}
        <div className="flex justify-end">
          <button
            onClick={() => router.push('/criteria')}
            disabled={photos.length === 0}
            className="bg-[#6366f1] hover:bg-[#5558e8] disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-150 hover:scale-[1.02] disabled:cursor-not-allowed disabled:scale-100"
          >
            Set Criteria →
          </button>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Verify in browser**

```powershell
npm run dev
```
Open http://localhost:3000/upload — drag in some photos, verify thumbnails appear, verify × remove button works, verify "Set Criteria →" becomes enabled. Ctrl+C.

- [ ] **Step 4: Commit**

```powershell
git add src/app/upload/page.tsx src/components/PhotoGrid.tsx
git commit -m "feat: upload screen with drag-and-drop and thumbnail grid"
```

---

## Task 11: Criteria Screen

**Files:**
- Create: `src/app/criteria/page.tsx`
- Create: `src/components/CriteriaSelector.tsx`

- [ ] **Step 1: Write CriteriaSelector.tsx**

```tsx
// src/components/CriteriaSelector.tsx
'use client';
import type { SelectedCriteria } from '@/lib/types';

interface CheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  badge?: string;
}

function Checkbox({ id, label, checked, onChange, badge }: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer border transition-all duration-150 ${
        checked
          ? 'bg-[#6366f1]/15 border-[#6366f1]/50 text-white'
          : 'bg-[#1a1a1a] border-[#2a2a2a] text-zinc-300 hover:border-[#3a3a3a]'
      }`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
        checked ? 'bg-[#6366f1] border-[#6366f1]' : 'border-zinc-600'
      }`}>
        {checked && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>}
      </div>
      <span className="text-sm font-medium">{label}</span>
      {badge && (
        <span className="ml-auto text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{badge}</span>
      )}
    </label>
  );
}

interface GroupProps {
  title: string;
  children: React.ReactNode;
}

function Group({ title, children }: GroupProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

interface Props {
  criteria: SelectedCriteria;
  onChange: (partial: Partial<SelectedCriteria>) => void;
}

export function CriteriaSelector({ criteria, onChange }: Props) {
  return (
    <div className="space-y-8">
      <Group title="People">
        <Checkbox id="eyesOpen" label="My eyes are open" checked={criteria.eyesOpen} onChange={(v) => onChange({ eyesOpen: v })} badge="face detection" />
        <Checkbox id="allEyesOpen" label="Everyone's eyes are open" checked={criteria.allEyesOpen} onChange={(v) => onChange({ allEyesOpen: v })} badge="face detection" />
        <Checkbox id="bestSmiles" label="Best smiles" checked={criteria.bestSmiles} onChange={(v) => onChange({ bestSmiles: v })} badge="face detection" />
        <div className="space-y-2">
          <Checkbox id="specificPeople" label="Specific people included" checked={criteria.specificPeople} onChange={(v) => onChange({ specificPeople: v })} badge="coming soon" />
          {criteria.specificPeople && (
            <input
              type="text"
              placeholder="e.g. Drake, Greg, Goose"
              value={criteria.specificPeopleNames}
              onChange={(e) => onChange({ specificPeopleNames: e.target.value })}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-[#6366f1] transition-colors"
            />
          )}
        </div>
      </Group>

      <Group title="Technical Quality">
        <Checkbox id="bestLighting" label="Best lighting / exposure" checked={criteria.bestLighting} onChange={(v) => onChange({ bestLighting: v })} />
        <Checkbox id="leastBlurry" label="Least blurry / sharpest" checked={criteria.leastBlurry} onChange={(v) => onChange({ leastBlurry: v })} />
        <Checkbox id="bestComposition" label="Best composition" checked={criteria.bestComposition} onChange={(v) => onChange({ bestComposition: v })} badge="coming soon" />
      </Group>

      <Group title="Vibe">
        <Checkbox id="bestGroup" label="Best group photo" checked={criteria.bestGroup} onChange={(v) => onChange({ bestGroup: v })} />
        <Checkbox id="bestSolo" label="Best solo shot" checked={criteria.bestSolo} onChange={(v) => onChange({ bestSolo: v })} />
        <Checkbox id="bestCandid" label="Best candid" checked={criteria.bestCandid} onChange={(v) => onChange({ bestCandid: v })} />
        <Checkbox id="instagram" label="Instagram-worthy" checked={criteria.instagram} onChange={(v) => onChange({ instagram: v })} />
      </Group>
    </div>
  );
}
```

- [ ] **Step 2: Write criteria page**

```tsx
// src/app/criteria/page.tsx
'use client';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { CriteriaSelector } from '@/components/CriteriaSelector';

// TODO: Replace checkbox logic with LLM criteria parser
export default function CriteriaPage() {
  const router = useRouter();
  const { criteria, setCriteria, photos } = useStore();

  const hasAny = Object.entries(criteria)
    .filter(([k]) => k !== 'specificPeopleNames')
    .some(([, v]) => v === true);

  return (
    <main className="min-h-screen bg-[#0f0f0f] px-6 py-12">
      <div className="max-w-xl mx-auto space-y-10">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">What matters to you?</h1>
          <p className="text-zinc-400">
            Select the criteria you care about. PhotoRank will score and group your {photos.length} photo{photos.length !== 1 ? 's' : ''} accordingly.
          </p>
        </div>

        {/* Criteria */}
        <CriteriaSelector criteria={criteria} onChange={setCriteria} />

        {/* NLP — coming soon */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-zinc-600">
            Natural language criteria <span className="text-zinc-700">(coming soon)</span>
          </label>
          <textarea
            disabled
            placeholder={`e.g. Find photos where my eyes are open, everyone looks good, and Drake is in the shot.`}
            className="w-full h-24 bg-[#111] border border-[#1e1e1e] rounded-xl px-4 py-3 text-sm text-zinc-700 placeholder-zinc-700 cursor-not-allowed resize-none"
          />
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={() => router.push('/results')}
            disabled={!hasAny}
            className="bg-[#6366f1] hover:bg-[#5558e8] disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-150 hover:scale-[1.02] disabled:cursor-not-allowed disabled:scale-100"
          >
            Rank My Photos →
          </button>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Verify in browser**

```powershell
npm run dev
```
Navigate Upload → Criteria. Check criteria checkboxes, verify they toggle. Verify "Rank My Photos →" is disabled until at least one is selected. Ctrl+C.

- [ ] **Step 4: Commit**

```powershell
git add src/app/criteria/page.tsx src/components/CriteriaSelector.tsx
git commit -m "feat: criteria selection screen with checkbox groups"
```

---

## Task 12: ProgressBar + PhotoCard

**Files:**
- Create: `src/components/ProgressBar.tsx`
- Create: `src/components/PhotoCard.tsx`

- [ ] **Step 1: Write ProgressBar.tsx**

```tsx
// src/components/ProgressBar.tsx
interface Props {
  progress: number; // 0-100
  status: string;
}

export function ProgressBar({ progress, status }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-400">{status}</span>
        <span className="text-zinc-500">{Math.round(progress)}%</span>
      </div>
      <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#6366f1] rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write PhotoCard.tsx**

```tsx
// src/components/PhotoCard.tsx
'use client';
import type { RankedPhoto } from '@/lib/types';

interface Props {
  rankedPhoto: RankedPhoto;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClick: () => void;
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 75 ? 'bg-emerald-900/50 text-emerald-400 border-emerald-800' :
    score >= 50 ? 'bg-yellow-900/50 text-yellow-400 border-yellow-800' :
                  'bg-red-900/50 text-red-400 border-red-800';
  return (
    <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${color}`}>
      {score}
    </span>
  );
}

export function PhotoCard({ rankedPhoto, isFavorite, onToggleFavorite, onClick }: Props) {
  const { photo, analysis, compositeScore, tags, reasoning } = rankedPhoto;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = photo.url;
    a.download = photo.file.name;
    a.click();
  };

  return (
    <div
      className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden cursor-pointer hover:border-[#3a3a3a] hover:scale-[1.01] transition-all duration-150 group"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="aspect-square relative overflow-hidden">
        <img
          src={photo.url}
          alt={photo.file.name}
          className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-150"
        />
        <div className="absolute top-2 right-2">
          <ScoreBadge score={compositeScore} />
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 4).map((tag) => (
              <span key={tag} className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Reasoning */}
        <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">{reasoning}</p>

        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
            className="text-lg hover:scale-110 transition-transform"
            aria-label={isFavorite ? 'Unfavorite' : 'Favorite'}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
          <button
            onClick={handleDownload}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
            aria-label="Download"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```powershell
git add src/components/ProgressBar.tsx src/components/PhotoCard.tsx
git commit -m "feat: progress bar and photo card components"
```

---

## Task 13: PhotoModal + DownloadButton

**Files:**
- Create: `src/components/PhotoModal.tsx`
- Create: `src/components/DownloadButton.tsx`

- [ ] **Step 1: Write PhotoModal.tsx**

```tsx
// src/components/PhotoModal.tsx
'use client';
import { useEffect } from 'react';
import type { RankedPhoto } from '@/lib/types';

interface Props {
  rankedPhoto: RankedPhoto | null;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClose: () => void;
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-zinc-400">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-24 h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
          <div className="h-full bg-[#6366f1] rounded-full" style={{ width: `${value}%` }} />
        </div>
        <span className="text-sm font-mono text-zinc-300 w-8 text-right">{value}</span>
      </div>
    </div>
  );
}

export function PhotoModal({ rankedPhoto, isFavorite, onToggleFavorite, onClose }: Props) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!rankedPhoto) return null;
  const { photo, analysis, compositeScore, tags, reasoning } = rankedPhoto;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = photo.url;
    a.download = photo.file.name;
    a.click();
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="md:w-1/2 bg-black rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none overflow-hidden">
            <img src={photo.url} alt={photo.file.name} className="w-full h-full object-contain max-h-[60vh] md:max-h-[80vh]" />
          </div>

          {/* Details */}
          <div className="md:w-1/2 p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold truncate max-w-[200px]">{photo.file.name}</h2>
                <p className="text-sm text-zinc-500">{(photo.file.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
              <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors text-xl">×</button>
            </div>

            {/* Overall score */}
            <div className="bg-[#111] rounded-xl p-4 text-center">
              <div className="text-4xl font-bold text-[#6366f1]">{compositeScore}</div>
              <div className="text-xs text-zinc-500 mt-1">Overall Score</div>
            </div>

            {/* Scores */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Scores</h3>
              <ScoreRow label="Lighting" value={analysis.lighting} />
              <ScoreRow label="Sharpness" value={analysis.sharpness} />
              <ScoreRow label="Eyes Open" value={analysis.eyesOpen} />
              <ScoreRow label="Smiles" value={analysis.smiles} />
              <ScoreRow label="Instagram" value={analysis.instagram} />
            </div>

            {/* Face count */}
            <p className="text-sm text-zinc-400">
              {analysis.faces.length === 0
                ? 'No faces detected'
                : `${analysis.faces.length} face${analysis.faces.length > 1 ? 's' : ''} detected`}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span key={tag} className="text-xs bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-full">{tag}</span>
              ))}
            </div>

            {/* Reasoning */}
            <div className="bg-[#111] rounded-xl p-3">
              <p className="text-sm text-zinc-400 leading-relaxed">{reasoning}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onToggleFavorite}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isFavorite
                    ? 'bg-red-900/30 border border-red-800/50 text-red-400'
                    : 'bg-[#111] border border-[#2a2a2a] text-zinc-300 hover:border-[#3a3a3a]'
                }`}
              >
                {isFavorite ? '❤️ Favorited' : '🤍 Favorite'}
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-[#6366f1] hover:bg-[#5558e8] text-white transition-all"
              >
                ⬇ Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write DownloadButton.tsx**

```tsx
// src/components/DownloadButton.tsx
'use client';
import type { PhotoFile } from '@/lib/types';

interface Props {
  photos: PhotoFile[];
  label?: string;
}

export function DownloadButton({ photos, label = 'Download All Favorites' }: Props) {
  const handleDownloadAll = async () => {
    // Download files one by one with small delays (browser-native)
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const a = document.createElement('a');
      a.href = photo.url;
      a.download = photo.file.name;
      a.click();
      // Small delay to avoid browser blocking multiple downloads
      await new Promise((r) => setTimeout(r, 200));
    }
  };

  if (photos.length === 0) return null;

  return (
    <button
      onClick={handleDownloadAll}
      className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#6366f1] text-zinc-300 hover:text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      {label} ({photos.length})
    </button>
  );
}
```

- [ ] **Step 3: Commit**

```powershell
git add src/components/PhotoModal.tsx src/components/DownloadButton.tsx
git commit -m "feat: photo detail modal and download button"
```

---

## Task 14: ResultsSection + Results Page

**Files:**
- Create: `src/components/ResultsSection.tsx`
- Create: `src/app/results/page.tsx`

- [ ] **Step 1: Write ResultsSection.tsx**

```tsx
// src/components/ResultsSection.tsx
'use client';
import { useState } from 'react';
import type { ResultSection, RankedPhoto } from '@/lib/types';
import { PhotoCard } from './PhotoCard';
import { PhotoModal } from './PhotoModal';

interface Props {
  section: ResultSection;
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
}

export function ResultsSection({ section, favorites, onToggleFavorite }: Props) {
  const [selected, setSelected] = useState<RankedPhoto | null>(null);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">{section.title}</h2>
          <span className="text-sm text-zinc-500 bg-zinc-800/50 px-2.5 py-0.5 rounded-full">
            {section.photos.length} photo{section.photos.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {section.photos.map((rp) => (
            <PhotoCard
              key={rp.photo.id}
              rankedPhoto={rp}
              isFavorite={favorites.has(rp.photo.id)}
              onToggleFavorite={() => onToggleFavorite(rp.photo.id)}
              onClick={() => setSelected(rp)}
            />
          ))}
        </div>
      </div>

      <PhotoModal
        rankedPhoto={selected}
        isFavorite={selected ? favorites.has(selected.photo.id) : false}
        onToggleFavorite={() => selected && onToggleFavorite(selected.photo.id)}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
```

- [ ] **Step 2: Write results page**

```tsx
// src/app/results/page.tsx
'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { rankPhotos } from '@/lib/analysis/rankPhotos';
import { ProgressBar } from '@/components/ProgressBar';
import { ResultsSection } from '@/components/ResultsSection';
import { DownloadButton } from '@/components/DownloadButton';

export default function ResultsPage() {
  const router = useRouter();
  const {
    photos, criteria, results, favorites,
    setResults, toggleFavorite, setIsAnalyzing, setAnalysisProgress,
    isAnalyzing, analysisProgress,
  } = useStore();

  const hasStarted = useRef(false);

  useEffect(() => {
    if (photos.length === 0) { router.replace('/upload'); return; }
    if (results || hasStarted.current) return;
    hasStarted.current = true;

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    rankPhotos(photos, criteria, (current, total) => {
      setAnalysisProgress(Math.round((current / total) * 100));
    })
      .then((r) => { setResults(r); setIsAnalyzing(false); })
      .catch((err) => {
        console.error('Analysis failed:', err);
        setIsAnalyzing(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const favoritePhotos = results
    ? results.sections
        .flatMap((s) => s.photos)
        .filter((rp, i, arr) => arr.findIndex((x) => x.photo.id === rp.photo.id) === i)
        .filter((rp) => favorites.has(rp.photo.id))
        .map((rp) => rp.photo)
    : [];

  if (isAnalyzing) {
    const current = Math.round((analysisProgress / 100) * photos.length);
    return (
      <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-6">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Analyzing your photos…</h1>
            <p className="text-zinc-500 text-sm">This may take a moment depending on photo count.</p>
          </div>
          <ProgressBar
            progress={analysisProgress}
            status={`Analyzing photo ${current} of ${photos.length}…`}
          />
        </div>
      </main>
    );
  }

  if (!results) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <p className="text-zinc-500">No results yet. <button onClick={() => router.push('/upload')} className="underline text-zinc-300">Start over</button></p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Results</h1>
            <p className="text-zinc-400 mt-1">
              {photos.length} photos ranked across {results.sections.length} categories
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DownloadButton photos={favoritePhotos} />
            <button
              onClick={() => router.push('/upload')}
              className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
            >
              Start over
            </button>
          </div>
        </div>

        {/* Sections */}
        {results.sections.map((section) => (
          <ResultsSection
            key={section.key}
            section={section}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Commit**

```powershell
git add src/app/results/page.tsx src/components/ResultsSection.tsx
git commit -m "feat: results page with dynamic sections, progress, favorites, download"
```

---

## Task 15: next.config + SSR Fix + Final Verification

face-api.js uses browser globals. We need to prevent it from being imported during SSR.

**Files:**
- Modify: `next.config.ts` (or `next.config.js`)
- Modify: `src/components/ModelLoader.tsx` (dynamic import guard)

- [ ] **Step 1: Update next.config to handle face-api.js**

Read the current next.config file first, then replace its content:
```ts
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // face-api.js uses browser APIs — exclude from server bundle
      config.externals = [...(config.externals || []), 'face-api.js'];
    }
    return config;
  },
};

export default nextConfig;
```

- [ ] **Step 2: Guard face-api.js import in detectFaces.ts**

The `detectFaces.ts` file imports face-api.js at the top level, which is fine since it's only called from client components. But `loadModels` is called in `ModelLoader.tsx` which is `'use client'` — this is safe. Verify by running:

```powershell
npm run build
```
Expected: Build succeeds with no errors. If face-api.js SSR errors appear, wrap the import:

If build fails with face-api.js errors, replace the top of `src/lib/analysis/detectFaces.ts`:
```ts
// src/lib/analysis/detectFaces.ts
let faceapi: typeof import('face-api.js');

async function getFaceapi() {
  if (!faceapi) {
    faceapi = await import('face-api.js');
  }
  return faceapi;
}

let modelsLoaded = false;

export async function loadModels(): Promise<void> {
  if (modelsLoaded) return;
  const fa = await getFaceapi();
  await Promise.all([
    fa.nets.tinyFaceDetector.loadFromUri('/models'),
    fa.nets.faceLandmark68Net.loadFromUri('/models'),
    fa.nets.faceExpressionNet.loadFromUri('/models'),
  ]);
  modelsLoaded = true;
}

export async function detectFaces(imageElement: HTMLImageElement): Promise<import('@/lib/types').FaceDetectionResult[]> {
  const fa = await getFaceapi();
  const detections = await fa
    .detectAllFaces(imageElement, new fa.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceExpressions();

  return detections.map((d) => ({
    landmarks: d.landmarks,
    expressions: d.expressions,
    detection: d.detection,
  }));
}
```

- [ ] **Step 3: Run full test suite**

```powershell
npx jest --no-coverage
```
Expected: All tests pass.

- [ ] **Step 4: Full end-to-end smoke test**

```powershell
npm run dev
```

Run through the full flow:
1. Open http://localhost:3000 — verify landing page
2. Click "Start Sorting" → `/upload`
3. Drop in 5+ photos — verify thumbnails appear
4. Click "Set Criteria →" → `/criteria`
5. Select "Least blurry" + "Best lighting" → click "Rank My Photos →"
6. Verify progress bar appears and counts up
7. Verify results page shows "Best Overall", "Sharpest Photos", "Best Lighting", "Needs Review" sections
8. Verify scores differ between photos (not all the same number)
9. Click a photo → verify modal opens with score bars
10. Click ❤️ → verify it persists when modal closes
11. Click ⬇ on a photo → verify download starts

- [ ] **Step 5: Final commit**

```powershell
git add -A
git commit -m "feat: complete PhotoRank MVP — all screens, scoring pipeline, results"
```

---

## Post-Build: Face Model Setup (Manual Step)

The app works without face models (face features show 50/neutral), but to enable real face detection:

1. Download model files from https://github.com/justadudewhohacks/face-api.js/tree/master/weights
2. Files needed (each has a `-shard1of1` file and a `manifest.json`):
   - `tiny_face_detector_model-weights_manifest.json` + `tiny_face_detector_model-shard1`
   - `face_landmark_68_model-weights_manifest.json` + `face_landmark_68_model-shard1`
   - `face_expression_recognition_model-weights_manifest.json` + `face_expression_recognition_model-shard1`
3. Place all files in `public/models/`
4. Reload the app — the loading spinner should resolve quickly and face detection activates
