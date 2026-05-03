# PhotoRank MVP — Design Spec
_2026-05-03_

## Overview

PhotoRank is a fully client-side web app for ranking event photos. Users upload a batch, select scoring criteria, and get grouped results with real per-photo scores — all processed locally in the browser. No backend, no server uploads, no auth.

---

## Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js App Router + TypeScript | Spec requirement |
| Styling | Tailwind CSS | Spec requirement |
| Face detection | face-api.js | Runs fully in-browser, no API key |
| Image scoring | Canvas API | Native browser, zero deps |
| State | Zustand (simpler than Context for cross-route state) | Cleaner than Context for multi-screen flow |

---

## Screens

### `/` — Landing
- Headline: "Find the best photos from the chaos."
- Subheadline + privacy note ("Your photos never leave your device.")
- CTA: "Start Sorting" → `/upload`

### `/upload`
- Drag-and-drop zone + click-to-upload (jpg, png, webp, heic)
- Thumbnail grid with per-photo remove button
- Privacy badge
- CTA: "Set Criteria →" (enabled when ≥1 photo)

### `/criteria`
- Checkbox groups: **People**, **Technical Quality**, **Vibe**
- Disabled NLP textarea: "Natural language criteria (coming soon)"
- `// TODO: Replace checkbox logic with LLM criteria parser`
- CTA: "Rank My Photos →"

### `/results`
- Dynamic sections matching selected criteria
- Always first: **Best Overall** (composite of all selected)
- Always last: **Needs Review** (lowest scorers)
- Per-photo card: thumbnail, score badge (0–100), criteria tags, reasoning note, ❤️ favorite, ⬇️ download
- "Download All Favorites" button at top
- Click photo → full-screen modal with all scores

---

## Scoring Pipeline (`lib/analysis/`)

| File | Implementation | Returns |
|---|---|---|
| `scoreLighting.ts` | Canvas API: avg brightness + contrast, penalizes over/under exposure | 0–100 |
| `scoreSharpness.ts` | Laplacian variance via Canvas pixel sampling | 0–100 |
| `detectFaces.ts` | face-api.js TinyFaceDetector + FaceLandmark68Net | `FaceDetectionResult[]` |
| `scoreEyesOpen.ts` | Eye Aspect Ratio from landmarks | 0–100 |
| `scoreSmiles.ts` | Mouth landmark spread as smile proxy | 0–100 |
| `scoreComposition.ts` | **PLACEHOLDER** — returns mock + TODO comment | 0–100 |
| `matchPeople.ts` | **PLACEHOLDER** — future face recognition | `MatchResult` |
| `scoreInstagram.ts` | Composite: lighting + sharpness + face score weighted | 0–100 |
| `analyzePhoto.ts` | Orchestrates all scoring for a single photo | `PhotoAnalysis` |
| `rankPhotos.ts` | Runs pipeline on all photos, weights by criteria, groups results | `RankedResults` |

**face-api.js setup:**
- Models loaded from `/public/models/` (downloaded by user, documented in README)
- Load once at app startup, show "Loading face detection models…" state
- Models needed: `tiny_face_detector`, `face_landmark_68`, `face_expression_recognition`

---

## State Shape

```ts
interface AppState {
  photos: PhotoFile[]
  criteria: SelectedCriteria
  results: RankedResults | null
  favorites: Set<string>
  isAnalyzing: boolean
  analysisProgress: number  // 0–100
}
```

---

## UX Details

- Progress bar during analysis: "Analyzing photo X of Y…"
- `Promise.all` batching — non-blocking
- Photo grid: 3-col desktop / 2-col tablet / 1-col mobile
- Empty states for: no photos, no criteria, no results
- Smooth Tailwind transitions between screens

---

## Design Tokens

| Token | Value |
|---|---|
| Background | `#0f0f0f` / `#111` |
| Card bg | `#1a1a1a` |
| Card border | `#2a2a2a` |
| Accent | `#6366f1` (indigo) |
| Font | Inter / system-ui |
| Card radius | `rounded-xl` |
| Modal radius | `rounded-2xl` |
| Hover | scale + brightness lift |

Feel: **Apple Photos × Linear × Notion**

---

## File Structure

```
photorank/
  public/models/          ← face-api.js weights (user downloads)
  src/
    app/
      page.tsx
      upload/page.tsx
      criteria/page.tsx
      results/page.tsx
      layout.tsx
    components/
      PhotoGrid.tsx
      PhotoCard.tsx
      CriteriaSelector.tsx
      ResultsSection.tsx
      ProgressBar.tsx
      PhotoModal.tsx
      DownloadButton.tsx
    lib/
      analysis/           ← all scoring functions
      store.ts
      types.ts
```

---

## Success Criteria

1. `npm run dev` → opens app
2. Upload 20+ photos via drag-and-drop
3. Select criteria checkboxes
4. Click "Rank My Photos" → progress bar runs
5. See dynamic grouped results matching selected criteria
6. See real, varied scores per photo
7. Favorite + download photos
8. Clearly marked placeholders for NLP and face recognition

---

## Out of Scope (v1)

- Backend / server uploads
- Auth
- Persistence across sessions
- Real NLP criteria parsing
- Actual face recognition / identity matching
- Real composition scoring
