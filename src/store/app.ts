import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ColorScheme = 'emerald' | 'blue' | 'purple' | 'amber' | 'rose';
export type DateFormat = 'dd/MM/yyyy' | 'MM/dd/yyyy' | 'yyyy-MM-dd';
export type TimeFormat = '12h' | '24h';

interface AppState {
  theme: 'light' | 'dark' | 'system';
  language: 'es' | 'en';
  notifications: boolean;
  soundEffects: boolean;
  vibration: boolean;
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
  colorScheme: ColorScheme;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  reduceMotion: boolean;
  highContrast: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (lang: 'es' | 'en') => void;
  toggleNotifications: () => void;
  toggleSoundEffects: () => void;
  toggleVibration: () => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  toggleCompactMode: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
  setDateFormat: (format: DateFormat) => void;
  setTimeFormat: (format: TimeFormat) => void;
  toggleReduceMotion: () => void;
  toggleHighContrast: () => void;
  resetSettings: () => void;
}

const defaultSettings = {
  theme: 'dark' as const,
  language: 'es' as const,
  notifications: true,
  soundEffects: true,
  vibration: true,
  fontSize: 'medium' as const,
  compactMode: false,
  colorScheme: 'emerald' as ColorScheme,
  dateFormat: 'dd/MM/yyyy' as DateFormat,
  timeFormat: '24h' as TimeFormat,
  reduceMotion: false,
  highContrast: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      toggleNotifications: () => set((state) => ({ notifications: !state.notifications })),
      toggleSoundEffects: () => set((state) => ({ soundEffects: !state.soundEffects })),
      toggleVibration: () => set((state) => ({ vibration: !state.vibration })),
      setFontSize: (fontSize) => set({ fontSize }),
      toggleCompactMode: () => set((state) => ({ compactMode: !state.compactMode })),
      setColorScheme: (colorScheme) => set({ colorScheme }),
      setDateFormat: (dateFormat) => set({ dateFormat }),
      setTimeFormat: (timeFormat) => set({ timeFormat }),
      toggleReduceMotion: () => set((state) => ({ reduceMotion: !state.reduceMotion })),
      toggleHighContrast: () => set((state) => ({ highContrast: !state.highContrast })),
      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'app-settings',
    }
  )
);