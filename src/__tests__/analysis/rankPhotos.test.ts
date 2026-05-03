// src/__tests__/analysis/rankPhotos.test.ts
import { buildRankedResults } from '@/lib/analysis/rankPhotos';
import type { PhotoAnalysis, SelectedCriteria, PhotoFile, FaceDetectionResult } from '@/lib/types';

function makeAnalysis(overrides: Partial<PhotoAnalysis> = {}): PhotoAnalysis {
  return {
    photoId: 'test-id',
    lighting: 70,
    sharpness: 70,
    faces: [] as FaceDetectionResult[],
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
  return { id, name: `${id}.jpg`, file: {} as File, url: `blob:${id}` };
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
    expect(last.title).toBe('Needs Review');
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

  it('ranks Best Lighting section by lighting score descending', () => {
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

  it('compositeScore uses only selected criteria', () => {
    const photos = [makePhoto('a')];
    // lighting=90, sharpness=10 — only lighting selected
    const analyses = [makeAnalysis({ photoId: 'a', lighting: 90, sharpness: 10 })];
    const criteria = { ...baseCriteria, bestLighting: true };
    const result = buildRankedResults(photos, analyses, criteria);
    const photo = result.sections[0].photos[0];
    // composite should be ~90 (only lighting weighted)
    expect(photo.compositeScore).toBeGreaterThan(80);
  });
});
