import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: string;
  type: 'numeric' | 'boolean' | 'habit' | 'milestone';
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  isPublic: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  description?: string;
  targetDate: string;
  completed: boolean;
  completedAt?: string;
  order: number;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetCount: number;
  currentStreak: number;
  longestStreak: number;
  completedDates: string[];
  isActive: boolean;
  createdAt: string;
}

export interface GoalProgress {
  goalId: string;
  date: string;
  value: number;
  note?: string;
}

interface GoalsState {
  goals: Goal[];
  milestones: Milestone[];
  habits: Habit[];
  progress: GoalProgress[];
  
  // Goal actions
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  
  // Milestone actions
  addMilestone: (milestone: Omit<Milestone, 'id'>) => void;
  updateMilestone: (id: string, updates: Partial<Milestone>) => void;
  deleteMilestone: (id: string) => void;
  
  // Habit actions
  addHabit: (habit: Omit<Habit, 'id'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  markHabitComplete: (id: string, date: string) => void;
  
  // Progress actions
  addProgress: (progress: GoalProgress) => void;
  getGoalProgress: (goalId: string) => number;
  getGoalStats: () => {
    total: number;
    completed: number;
    active: number;
    paused: number;
    averageProgress: number;
    streak: number;
  };
}

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set, get) => ({
      goals: [],
      milestones: [],
      habits: [],
      progress: [],

      addGoal: (goal) =>
        set((state) => ({
          goals: [
            ...state.goals,
            {
              ...goal,
              id: crypto.randomUUID(),
            },
          ],
        })),

      updateGoal: (id, updates) =>
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id
              ? {
                  ...goal,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                  ...(updates.currentValue === goal.targetValue && goal.status !== 'completed'
                    ? { status: 'completed', completedAt: new Date().toISOString() }
                    : {}),
                }
              : goal
          ),
        })),

      deleteGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((goal) => goal.id !== id),
          milestones: state.milestones.filter((milestone) => milestone.goalId !== id),
          progress: state.progress.filter((p) => p.goalId !== id),
        })),

      addMilestone: (milestone) =>
        set((state) => ({
          milestones: [
            ...state.milestones,
            {
              ...milestone,
              id: crypto.randomUUID(),
            },
          ],
        })),

      updateMilestone: (id, updates) =>
        set((state) => ({
          milestones: state.milestones.map((milestone) =>
            milestone.id === id
              ? {
                  ...milestone,
                  ...updates,
                  ...(updates.completed && !milestone.completed
                    ? { completedAt: new Date().toISOString() }
                    : {}),
                }
              : milestone
          ),
        })),

      deleteMilestone: (id) =>
        set((state) => ({
          milestones: state.milestones.filter((milestone) => milestone.id !== id),
        })),

      addHabit: (habit) =>
        set((state) => ({
          habits: [
            ...state.habits,
            {
              ...habit,
              id: crypto.randomUUID(),
            },
          ],
        })),

      updateHabit: (id, updates) =>
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === id ? { ...habit, ...updates } : habit
          ),
        })),

      deleteHabit: (id) =>
        set((state) => ({
          habits: state.habits.filter((habit) => habit.id !== id),
        })),

      markHabitComplete: (id, date) =>
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id !== id) return habit;

            const completedDates = [...habit.completedDates];
            if (!completedDates.includes(date)) {
              completedDates.push(date);
              completedDates.sort();

              // Calculate streak
              const today = new Date().toISOString().split('T')[0];
              let currentStreak = 0;
              let checkDate = new Date(today);

              while (true) {
                const dateStr = checkDate.toISOString().split('T')[0];
                if (completedDates.includes(dateStr)) {
                  currentStreak++;
                  checkDate.setDate(checkDate.getDate() - 1);
                } else {
                  break;
                }
              }

              return {
                ...habit,
                completedDates,
                currentStreak,
                longestStreak: Math.max(habit.longestStreak, currentStreak),
              };
            }

            return habit;
          }),
        })),

      addProgress: (progress) =>
        set((state) => ({
          progress: [...state.progress, progress],
        })),

      getGoalProgress: (goalId) => {
        const goal = get().goals.find((g) => g.id === goalId);
        if (!goal) return 0;
        return Math.min((goal.currentValue / goal.targetValue) * 100, 100);
      },

      getGoalStats: () => {
        const { goals } = get();
        const total = goals.length;
        const completed = goals.filter((g) => g.status === 'completed').length;
        const active = goals.filter((g) => g.status === 'active').length;
        const paused = goals.filter((g) => g.status === 'paused').length;

        const averageProgress = total > 0
          ? goals.reduce((sum, goal) => {
              return sum + Math.min((goal.currentValue / goal.targetValue) * 100, 100);
            }, 0) / total
          : 0;

        // Calculate streak (simplified - days with any goal progress)
        const today = new Date();
        let streak = 0;
        let checkDate = new Date(today);

        while (streak < 365) { // Max 365 days check
          const dateStr = checkDate.toISOString().split('T')[0];
          const hasProgress = goals.some(goal => 
            goal.updatedAt.startsWith(dateStr) && goal.currentValue > 0
          );
          
          if (hasProgress) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }

        return {
          total,
          completed,
          active,
          paused,
          averageProgress,
          streak,
        };
      },
    }),
    {
      name: 'goals-storage',
    }
  )
);