import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  category: string;
  favorite: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

interface TasksState {
  tasks: Task[];
  categories: Category[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'favorite' | 'archived'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskFavorite: (id: string) => void;
  archiveTask: (id: string) => void;
  addCategory: (name: string, color: string) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set) => ({
      tasks: [],
      categories: [
        { id: 'personal', name: 'Personal', color: '#10B981' },
        { id: 'trabajo', name: 'Trabajo', color: '#3B82F6' },
        { id: 'compras', name: 'Compras', color: '#F59E0B' },
        { id: 'salud', name: 'Salud', color: '#EF4444' }
      ],
      
      addTask: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...task,
              id: crypto.randomUUID(),
              favorite: false,
              archived: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...updates, updatedAt: new Date().toISOString() }
              : task
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),

      toggleTaskFavorite: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, favorite: !task.favorite, updatedAt: new Date().toISOString() }
              : task
          ),
        })),

      archiveTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, archived: !task.archived, updatedAt: new Date().toISOString() }
              : task
          ),
        })),

      addCategory: (name, color) =>
        set((state) => ({
          categories: [
            ...state.categories,
            {
              id: crypto.randomUUID(),
              name,
              color,
            },
          ],
        })),

      updateCategory: (id, updates) =>
        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === id ? { ...category, ...updates } : category
          ),
        })),

      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((category) => category.id !== id),
          tasks: state.tasks.map((task) =>
            task.category === id ? { ...task, category: '' } : task
          ),
        })),
    }),
    {
      name: 'tasks-storage',
    }
  )
);