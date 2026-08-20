import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in hours
  type: 'course' | 'video' | 'article' | 'podcast' | 'book';
  status: 'not_started' | 'in_progress' | 'completed';
  url?: string;
  imageUrl?: string;
  price: number;
  rating: number;
  enrolledAt: string;
  completedAt: string | null;
  tags: string[];
}

export interface CourseProgress {
  id: string;
  courseId: string;
  completedLessons: number;
  totalLessons: number;
  timeSpent: number; // in hours
  lastAccessed: string | null;
  notes: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: 'completion' | 'streak' | 'time' | 'skill';
}

export interface LearningGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string; // 'courses', 'hours', 'certificates', etc.
  deadline: string | null;
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
}

interface LearningState {
  courses: Course[];
  progress: CourseProgress[];
  achievements: Achievement[];
  goals: LearningGoal[];
  addCourse: (course: Omit<Course, 'id'>) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  updateProgress: (courseId: string, updates: Partial<CourseProgress>) => void;
  addAchievement: (achievement: Omit<Achievement, 'id' | 'unlockedAt'>) => void;
  addGoal: (goal: Omit<LearningGoal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<LearningGoal>) => void;
  deleteGoal: (id: string) => void;
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      courses: [],
      progress: [],
      achievements: [],
      goals: [],

      addCourse: (course) =>
        set((state) => ({
          courses: [
            ...state.courses,
            {
              ...course,
              id: crypto.randomUUID(),
            },
          ],
        })),

      updateCourse: (id, updates) =>
        set((state) => ({
          courses: state.courses.map((course) =>
            course.id === id ? { ...course, ...updates } : course
          ),
        })),

      deleteCourse: (id) =>
        set((state) => ({
          courses: state.courses.filter((course) => course.id !== id),
          progress: state.progress.filter((p) => p.courseId !== id),
        })),

      updateProgress: (courseId, updates) =>
        set((state) => {
          const existingProgress = state.progress.find((p) => p.courseId === courseId);
          
          if (existingProgress) {
            return {
              progress: state.progress.map((p) =>
                p.courseId === courseId ? { ...p, ...updates } : p
              ),
            };
          } else {
            return {
              progress: [
                ...state.progress,
                {
                  id: crypto.randomUUID(),
                  courseId,
                  completedLessons: 0,
                  totalLessons: 10, // default
                  timeSpent: 0,
                  lastAccessed: new Date().toISOString(),
                  notes: [],
                  ...updates,
                },
              ],
            };
          }
        }),

      addAchievement: (achievement) =>
        set((state) => ({
          achievements: [
            ...state.achievements,
            {
              ...achievement,
              id: crypto.randomUUID(),
              unlockedAt: new Date().toISOString(),
            },
          ],
        })),

      addGoal: (goal) =>
        set((state) => ({
          goals: [
            ...state.goals,
            {
              ...goal,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateGoal: (id, updates) =>
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id ? { ...goal, ...updates } : goal
          ),
        })),

      deleteGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((goal) => goal.id !== id),
        })),
    }),
    {
      name: 'learning-storage',
    }
  )
);