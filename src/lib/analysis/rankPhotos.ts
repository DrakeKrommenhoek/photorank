// src/lib/analysis/rankPhotos.ts
import type {
  PhotoFile, SelectedCriteria, RankedResults, RankedPhoto,
  ResultSection, PhotoAnalysis,
} from '@/lib/types';
import { analyzePhoto } from './analyzePhoto';

type CriteriaKey = keyof SelectedCriteria;

// Maps criteria keys to human-readable section titles (excludes non-boolean/unscorable keys)
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

function scoreForCriterion(key: CriteriaKey, a: PhotoAnalysis): number {
  switch (key) {
    case 'bestLighting': return a.lighting;
    case 'leastBlurry': return a.sharpness;
    case 'eyesOpen': return a.eyesOpen;
    case 'allEyesOpen': return a.eyesOpen;
    case 'bestSmiles': return a.smiles;
    case 'bestComposition': return a.composition;
    case 'instagram': return a.instagram;
    case 'bestGroup': return Math.min(100, a.faces.length >= 2 ? 80 + a.lighting * 0.2 : 20);
    case 'bestSolo': return Math.min(100, a.faces.length === 1 ? 80 + a.lighting * 0.2 : 20);
    // TODO: candid scoring for groups >2 not yet supported — heuristic uses non-smiling + sharp for small groups
    case 'bestCandid': return a.faces.length <= 2 ? (100 - a.smiles) * 0.5 + a.sharpness * 0.5 : 20;
    default: return a.overallScore;
  }
}

function computeComposite(a: PhotoAnalysis, criteria: SelectedCriteria): number {
  const active = (Object.keys(CRITERIA_LABELS) as CriteriaKey[]).filter((k) => criteria[k]);
  if (active.length === 0) return a.overallScore;
  const sum = active.reduce((acc, k) => acc + scoreForCriterion(k, a), 0);
  return Math.round(sum / active.length);
}

// Pure function — exported for tests
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

  ranked.sort((a, b) =>
    b.compositeScore - a.compositeScore || a.photo.id.localeCompare(b.photo.id)
  );

  const sections: ResultSection[] = [];

  // Best Overall: top 30% (at least 1)
  sections.push({
    key: 'overall',
    title: 'Best Overall',
    photos: ranked.slice(0, Math.max(1, Math.ceil(ranked.length * 0.3))),
  });

  // Dynamic sections per selected criterion
  const activeCriteria = (Object.keys(CRITERIA_LABELS) as CriteriaKey[]).filter((k) => criteria[k]);
  for (const key of activeCriteria) {
    const sorted = [...ranked].sort(
      (a, b) => scoreForCriterion(key, b.analysis) - scoreForCriterion(key, a.analysis) || a.photo.id.localeCompare(b.photo.id)
    );
    sections.push({
      key,
      title: CRITERIA_LABELS[key]!,
      photos: sorted.slice(0, Math.max(1, Math.ceil(sorted.length * 0.5))),
    });
  }

  // Needs Review: bottom 20% (at least 1)
  const needsReview = [...ranked]
    .sort((a, b) => a.compositeScore - b.compositeScore || a.photo.id.localeCompare(b.photo.id))
    .slice(0, Math.max(1, Math.ceil(ranked.length * 0.2)));

  sections.push({ key: 'needs-review', title: 'Needs Review', photos: needsReview });

  return { sections };
}

// Async pipeline — used by results page
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
