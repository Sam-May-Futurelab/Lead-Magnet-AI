import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark';
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      actualTheme: 'light',
      setTheme: (theme: Theme) => {
        set({ theme });

        // Calculate actual theme
        let actual: 'light' | 'dark' = 'light';
        if (theme === 'system') {
          actual = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } else {
          actual = theme;
        }

        set({ actualTheme: actual });

        // Update document class
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(actual);
      },
    }),
    {
      name: 'lead-magnet-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Apply theme on load
          let actual: 'light' | 'dark' = 'light';
          if (state.theme === 'system') {
            actual = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          } else {
            actual = state.theme;
          }

          document.documentElement.classList.remove('light', 'dark');
          document.documentElement.classList.add(actual);
          state.actualTheme = actual;
        }
      },
    }
  )
);

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const state = useTheme.getState();
    if (state.theme === 'system') {
      const actual = e.matches ? 'dark' : 'light';
      useTheme.setState({ actualTheme: actual });
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(actual);
    }
  });
}
