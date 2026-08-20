import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: string;
  type: 'certification' | 'award' | 'project' | 'publication';
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  imageUrl?: string;
  projectUrl?: string;
  githubUrl?: string;
  startDate: string;
  endDate?: string;
  status: 'in_progress' | 'completed' | 'archived';
}

export interface ProfileState {
  bio: string;
  location: string;
  website: string;
  company: string;
  education: {
    id: string;
    degree: string;
    school: string;
    year: string;
  }[];
  skills: string[];
  languages: {
    id: string;
    name: string;
    level: string;
  }[];
  interests: string[];
  socialLinks: {
    platform: string;
    url: string;
  }[];
  avatarUrl: string | null;
  bannerUrl: string | null;
  isPublic: boolean;
  achievements: Achievement[];
  projects: Project[];
  testimonials: {
    id: string;
    author: string;
    role: string;
    company: string;
    content: string;
    date: string;
  }[];
  portfolio: {
    categories: string[];
    items: {
      id: string;
      title: string;
      description: string;
      category: string;
      imageUrl: string;
      url?: string;
    }[];
  };
  updateProfile: (updates: Partial<Omit<ProfileState, 'updateProfile' | 'resetProfile'>>) => void;
  resetProfile: () => void;
}

const defaultProfile = {
  bio: '',
  location: '',
  website: '',
  company: '',
  education: [],
  skills: [],
  languages: [],
  interests: [],
  socialLinks: [],
  avatarUrl: null,
  bannerUrl: null,
  isPublic: false,
  achievements: [],
  projects: [],
  testimonials: [],
  portfolio: {
    categories: ['Web', 'Mobile', 'Design', 'Other'],
    items: []
  }
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      ...defaultProfile,
      updateProfile: (updates) => set((state) => ({ ...state, ...updates })),
      resetProfile: () => set(defaultProfile),
    }),
    {
      name: 'profile-storage',
    }
  )
);