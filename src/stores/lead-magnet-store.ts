import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LeadMagnet } from '@/lib/types';

interface LeadMagnetState {
  // Current lead magnet being created/edited
  current: Partial<LeadMagnet> | null;

  // Generation state
  isGenerating: boolean;
  generationProgress: number;
  generationMessage: string;

  // User's lead magnets (persisted locally)
  leadMagnets: LeadMagnet[];
  isLoading: boolean;

  // Actions
  setCurrent: (leadMagnet: Partial<LeadMagnet> | null) => void;
  updateCurrent: (updates: Partial<LeadMagnet>) => void;
  setGenerating: (isGenerating: boolean, message?: string) => void;
  setProgress: (progress: number) => void;
  setLeadMagnets: (leadMagnets: LeadMagnet[]) => void;
  addLeadMagnet: (leadMagnet: LeadMagnet) => void;
  updateLeadMagnet: (id: string, updates: Partial<LeadMagnet>) => void;
  removeLeadMagnet: (id: string) => void;
  reset: () => void;
}

const initialState = {
  current: null,
  isGenerating: false,
  generationProgress: 0,
  generationMessage: '',
  leadMagnets: [],
  isLoading: false,
};

export const useLeadMagnetStore = create<LeadMagnetState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrent: (leadMagnet) => set({ current: leadMagnet }),

      updateCurrent: (updates) => set((state) => ({
        current: state.current ? { ...state.current, ...updates } : updates,
      })),

      setGenerating: (isGenerating, message = '') => set({
        isGenerating,
        generationMessage: message,
        generationProgress: isGenerating ? 0 : get().generationProgress,
      }),

      setProgress: (progress) => set({ generationProgress: progress }),

      setLeadMagnets: (leadMagnets) => set({ leadMagnets, isLoading: false }),

      addLeadMagnet: (leadMagnet) => set((state) => ({
        leadMagnets: [leadMagnet, ...state.leadMagnets],
      })),

      updateLeadMagnet: (id, updates) => set((state) => ({
        leadMagnets: state.leadMagnets.map((lm) =>
          lm.id === id ? { ...lm, ...updates, updatedAt: new Date() } : lm
        ),
      })),

      removeLeadMagnet: (id) => set((state) => ({
        leadMagnets: state.leadMagnets.filter((lm) => lm.id !== id),
      })),

      reset: () => set(initialState),
    }),
    {
      name: 'lead-magnet-storage',
      partialize: (state) => ({
        leadMagnets: state.leadMagnets,
      }),
    }
  )
);

// Selector hooks for specific parts of state
export const useCurrentLeadMagnet = () => useLeadMagnetStore((s) => s.current);
export const useIsGenerating = () => useLeadMagnetStore((s) => s.isGenerating);
export const useGenerationProgress = () => useLeadMagnetStore((s) => ({
  progress: s.generationProgress,
  message: s.generationMessage,
}));
