# PhotoRank — MVP Build Brief

You are Claude Code acting as a senior full-stack engineer and product designer. Build a working MVP for a web app that helps users sort through hundreds or thousands of event photos and surface the best ones based on user-selected criteria.

---

## Core Idea

After parties, formals, trips, weddings, or group events, users end up with hundreds of photos they need to sort through. PhotoRank lets them upload a batch, select what matters to them, and get an intelligently ranked, organized result set — fast.

---

## Tech Stack

- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **face-api.js** — runs fully in the browser, no API key needed. Used for real face detection, landmark analysis, and eye-open estimation.
- **Browser-native APIs** — Canvas API for sharpness/blur scoring, brightness analysis
- No backend. No database. No auth. Everything runs client-side.

---

## MVP Screens

### 1. Landing Page (`/`)

- Headline: **"Find the best photos from the chaos."**
- Subheadline: "Upload your event photos, pick what matters, and get ranked results instantly."
- CTA button: **"Start Sorting"** → navigates to `/upload`
- Privacy note: "Your photos never leave your device."
- Clean, minimal design. Dark neutral background. Feels like Linear or Apple Photos.

---

### 2. Upload Screen (`/upload`)

- Drag-and-drop zone + click-to-upload
- Accepts multiple image files at once (jpg, png, webp, heic)
- Shows:
  - Count of uploaded photos
  - Thumbnail grid with remove (×) buttons per photo
- CTA: **"Set Criteria →"** once at least 1 photo is uploaded
- Store photos in React state as `File` objects + local object URLs. Do not upload anywhere.

---

### 3. Criteria Screen (`/criteria`)

A checkbox-based criteria selector. Each checkbox maps directly to a scoring function. Group them clearly.

**People**
- [ ] My eyes are open *(requires face detection)*
- [ ] Everyone's eyes are open *(requires face detection)*
- [ ] Best smiles *(requires face detection)*
- [ ] Specific people included — text input: `e.g. Drake, Greg, Goose` *(placeholder for future face recognition — mark clearly in UI and code)*

**Technical Quality**
- [ ] Best lighting / exposure
- [ ] Least blurry / sharpest
- [ ] Best composition *(placeholder — mark clearly)*

**Vibe**
- [ ] Best group photo
- [ ] Best solo shot
- [ ] Best candid
- [ ] Instagram-worthy *(composite score)*

Below the checkboxes, show a disabled greyed-out text area with label:
> **"Natural language criteria (coming soon)"**
> `"e.g. Find photos where my eyes are open, everyone looks good, and Drake is in the shot."`

This makes clear that NLP parsing is a planned feature. Add a code comment: `// TODO: Replace checkbox logic with LLM criteria parser`

CTA: **"Rank My Photos →"**

---

### 4. Results Screen (`/results`)

Show results grouped by **the criteria the user actually selected**, not a fixed list of categories.

For example:
- If user selected "Best lighting" and "Least blurry" → show sections: **Best Lighting**, **Sharpest Photos**
- If user selected "My eyes are open" and "Best group photo" → show: **Eyes Open**, **Best Group Photos**
- Always show **Best Overall** as the first section (composite of all selected criteria)
- Always show **Needs Review** at the end (lowest scoring photos)

Each photo card shows:
- Thumbnail (click to expand full size)
- Score badge (0–100)
- Tags matching selected criteria (e.g. `sharp` `eyes-open` `bright`)
- Reasoning note (e.g. "High sharpness, good exposure, both faces detected with eyes open.")
- ❤️ Favorite button (toggles, persists in local state)
- ⬇️ Download button (triggers native browser download of original file)

Add a **"Download All Favorites"** button at the top of results.

---

## Scoring & Analysis Pipeline

Build a clean, modular scoring pipeline in `lib/analysis/`. Each function is independent and testable.

```
lib/
  analysis/
    analyzePhoto.ts        — orchestrates all scoring for a single photo
    scoreLighting.ts       — Canvas API: measure average brightness + contrast
    scoreSharpness.ts      — Canvas API: Laplacian variance for blur detection  
    detectFaces.ts         — face-api.js: count faces, get landmarks
    scoreEyesOpen.ts       — face-api.js: estimate eye aspect ratio per face
    scoreSmiles.ts         — face-api.js: mouth landmark spread as smile proxy
    scoreComposition.ts    — placeholder, return mock score with TODO comment
    matchPeople.ts         — placeholder for future face recognition, return mock
    rankPhotos.ts          — takes photos + selected criteria, returns sorted+grouped results
    scoreInstagram.ts      — composite: lighting + sharpness + face score weighted
```

Each function signature:
```ts
// scoreLighting.ts
export async function scoreLighting(imageElement: HTMLImageElement): Promise<number>
// Returns 0–100. Uses Canvas API to sample pixel luminance across the image.
// Higher = better exposed. Penalizes overexposure and underexposure.

// scoreSharpness.ts  
export async function scoreSharpness(imageElement: HTMLImageElement): Promise<number>
// Returns 0–100. Implements Laplacian variance via Canvas pixel sampling.
// Higher variance = sharper image.

// detectFaces.ts
export async function detectFaces(imageElement: HTMLImageElement): Promise<FaceDetectionResult[]>
// Uses face-api.js (TinyFaceDetector + FaceLandmark68Net).
// Returns array of detected faces with landmarks and expressions.
// face-api.js model files should be loaded from /public/models/

// scoreEyesOpen.ts
export async function scoreEyesOpen(faces: FaceDetectionResult[]): Promise<number>
// Computes Eye Aspect Ratio (EAR) from landmarks.
// Returns 0–100. 100 = all detected faces have open eyes.

// rankPhotos.ts
export async function rankPhotos(
  photos: PhotoFile[],
  criteria: SelectedCriteria
): Promise<RankedResults>
// Runs the full pipeline on each photo, weights scores by selected criteria,
// groups results into dynamic sections based on what criteria were selected.
```

**face-api.js setup:**
- Install: `npm install face-api.js`
- Load models from `/public/models/` (tiny_face_detector, face_landmark_68, face_expression)
- Download model files from the face-api.js GitHub releases and place in `/public/models/`
- Initialize once at app load, before analysis runs
- Add a loading state: "Loading face detection models…"

**Canvas-based scoring:**
- Draw image to offscreen canvas
- Sample pixel data with `getImageData`
- No external dependencies for lighting/sharpness — pure browser APIs

**Placeholders (mark clearly in code and UI):**
```ts
// FUTURE: Replace with real face recognition API (AWS Rekognition, Azure Face, or face-api.js descriptor matching)
export async function matchPeople(faces: FaceDetectionResult[], names: string[]): Promise<MatchResult>

// FUTURE: Replace with vision model for composition analysis (rule of thirds, subject centering)
export async function scoreComposition(imageElement: HTMLImageElement): Promise<number>
```

---

## State Management

Use React Context or Zustand (whichever is simpler). Store:

```ts
interface AppState {
  photos: PhotoFile[]           // uploaded files + metadata
  criteria: SelectedCriteria    // checkboxes selected
  results: RankedResults | null // null until ranking runs
  favorites: Set<string>        // photo IDs
  isAnalyzing: boolean
  analysisProgress: number      // 0–100, shown as progress bar
}
```

---

## UX Details

- Show a **progress bar** during analysis with status text: `"Analyzing photo 12 of 47…"`
- Analysis runs async with `Promise.all` batching (don't block the UI)
- Photo grid in results: 3-col desktop, 2-col tablet, 1-col mobile
- Clicking a photo opens a full-screen modal with all scores and the reasoning note
- Smooth transitions between screens (Tailwind transitions, no heavy animation libraries)
- Empty states: friendly copy if no photos uploaded, if no criteria selected, if 0 results

---

## Privacy

Prominently display on upload screen and landing page:

> "🔒 Your photos are processed entirely on your device. Nothing is uploaded to any server."

Add a small info icon that expands: "PhotoRank uses your browser's computing power to analyze photos locally. Face detection runs on-device using face-api.js."

---

## Design Direction

- Background: `#0f0f0f` or `#111` dark neutral
- Cards: `#1a1a1a` with subtle border `#2a2a2a`
- Accent: clean white or soft indigo `#6366f1`
- Font: Inter or system-ui
- Rounded corners: `rounded-xl` on cards, `rounded-2xl` on modals
- Hover: subtle scale + brightness lift on photo cards
- Feels like: **Apple Photos × Linear × Notion**
- Fully mobile responsive

---

## File Structure

```
photorank/
  CLAUDE.md
  public/
    models/           ← face-api.js model files go here (download separately)
  src/
    app/
      page.tsx         ← landing
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
      analysis/        ← all scoring functions
      store.ts         ← app state
      types.ts         ← shared TypeScript types
  package.json
  tailwind.config.ts
  tsconfig.json
  next.config.ts
```

---

## Build Instructions

1. Inspect the repo. If empty, scaffold: `npx create-next-app@latest . --typescript --tailwind --app`
2. Install dependencies: `npm install face-api.js`
3. Download face-api.js model files into `/public/models/` (tiny_face_detector_model, face_landmark_68_model, face_expression_recognition_model)
4. Build screens in order: Landing → Upload → Criteria → Results
5. Build scoring pipeline in `lib/analysis/` — real implementations for lighting, sharpness, eye detection; clearly marked placeholders for composition and people matching
6. Wire state through all screens
7. Test with a batch of 20+ photos
8. Confirm: upload → select criteria → rank → see dynamic grouped results → favorite → download

---

## Success Criteria

By the end I should be able to:

1. Run `npm run dev` and open the app locally
2. Upload 20+ photos via drag-and-drop
3. Select criteria checkboxes (e.g. "Sharpest" + "Eyes Open" + "Best Lighting")
4. Click "Rank My Photos"
5. See a progress bar while analysis runs
6. See results grouped into sections matching my selected criteria
7. See real scores on each photo (not all the same random number)
8. Favorite photos and download them
9. See clearly marked placeholders for NLP criteria and face recognition
10. Understand exactly where to plug in a vision API later

Keep the code clean, modular, and commented. Prioritize a working demo with real scoring logic over feature completeness.
