import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  category: string;
  budget: number;
  progress: number;
  technologies: string[];
  teamMembers: string[];
  githubUrl?: string;
  liveUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectCategory {
  id: string;
  name: string;
  color: string;
}

interface ProjectsState {
  projects: Project[];
  categories: ProjectCategory[];
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addCategory: (name: string, color: string) => void;
  updateCategory: (id: string, updates: Partial<ProjectCategory>) => void;
  deleteCategory: (id: string) => void;
}

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set) => ({
      projects: [],
      categories: [
        { id: 'web', name: 'Desarrollo Web', color: '#3B82F6' },
        { id: 'mobile', name: 'Aplicaciones Móviles', color: '#10B981' },
        { id: 'design', name: 'Diseño', color: '#F59E0B' },
        { id: 'research', name: 'Investigación', color: '#8B5CF6' },
        { id: 'personal', name: 'Personal', color: '#EF4444' }
      ],

      addProject: (project) =>
        set((state) => ({
          projects: [
            ...state.projects,
            {
              ...project,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id
              ? {
                  ...project,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : project
          ),
        })),

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
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
          projects: state.projects.map((project) =>
            project.category === id ? { ...project, category: '' } : project
          ),
        })),
    }),
    {
      name: 'projects-storage',
    }
  )
);