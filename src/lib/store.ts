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
