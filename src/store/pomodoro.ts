import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Tree {
  id: string;
  date: string;
  duration: number;
  type: string;
}

interface PomodoroSettings {
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  dailyGoalSessions: number;
}

interface PomodoroStats {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  dailySessions: number;
  lastActiveDate: string | null;
  weeklyActivity: Record<string, number>;
}

interface PomodoroState {
  trees: Tree[];
  coins: number;
  settings: PomodoroSettings;
  stats: PomodoroStats;
  addTree: (duration: number, type: string) => void;
  addCoins: (amount: number) => void;
  updateSettings: (settings: Partial<PomodoroSettings>) => void;
  updateStats: (stats: Partial<PomodoroStats>) => void;
  resetDailyStats: () => void;
  updateStreak: () => void;
}

const defaultSettings: PomodoroSettings = {
  workDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  dailyGoalSessions: 8,
};

const defaultStats: PomodoroStats = {
  totalSessions: 0,
  totalMinutes: 0,
  currentStreak: 0,
  longestStreak: 0,
  dailySessions: 0,
  lastActiveDate: null,
  weeklyActivity: {},
};

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      trees: [],
      coins: 0,
      settings: defaultSettings,
      stats: defaultStats,
      
      addTree: (duration, type) =>
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          const newTree = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            duration,
            type,
          };

          // Actualizar actividad semanal
          const weeklyActivity = { ...state.stats.weeklyActivity };
          weeklyActivity[today] = (weeklyActivity[today] || 0) + 1;

          return {
            trees: [...state.trees, newTree],
            stats: {
              ...state.stats,
              weeklyActivity,
              dailySessions: state.stats.dailySessions + 1,
            },
          };
        }),

      addCoins: (amount) =>
        set((state) => ({
          coins: state.coins + amount,
        })),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      updateStats: (newStats) =>
        set((state) => ({
          stats: { ...state.stats, ...newStats },
        })),

      resetDailyStats: () =>
        set((state) => ({
          stats: {
            ...state.stats,
            dailySessions: 0,
            lastActiveDate: new Date().toISOString().split('T')[0],
          },
        })),

      updateStreak: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        const lastActive = state.stats.lastActiveDate;

        if (!lastActive) {
          set((state) => ({
            stats: {
              ...state.stats,
              currentStreak: 1,
              longestStreak: 1,
              lastActiveDate: today,
            },
          }));
          return;
        }

        const daysDiff = Math.floor(
          (new Date(today).getTime() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff === 1) {
          // Mantener racha
          const newStreak = state.stats.currentStreak + 1;
          set((state) => ({
            stats: {
              ...state.stats,
              currentStreak: newStreak,
              longestStreak: Math.max(newStreak, state.stats.longestStreak),
              lastActiveDate: today,
            },
          }));
        } else if (daysDiff > 1) {
          // Romper racha
          set((state) => ({
            stats: {
              ...state.stats,
              currentStreak: 1,
              lastActiveDate: today,
            },
          }));
        }
      },
    }),
    {
      name: 'pomodoro-storage',
    }
  )
);