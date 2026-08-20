import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  type: 'article' | 'video' | 'podcast' | 'image' | 'code' | 'tutorial';
  content: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  category: string;
  tags: string[];
  publishDate?: string;
  seoTitle?: string;
  seoDescription?: string;
  featured: boolean;
  views: number;
  likes: number;
  shares: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContentCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
}

export interface ContentAnalytics {
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  engagementRate: number;
  topContent: string[];
  viewsByDate: { date: string; views: number }[];
  popularTags: { tag: string; count: number }[];
}

interface ContentState {
  content: ContentItem[];
  categories: ContentCategory[];
  analytics: ContentAnalytics;
  
  // Content actions
  addContent: (content: Omit<ContentItem, 'id'>) => void;
  updateContent: (id: string, updates: Partial<ContentItem>) => void;
  deleteContent: (id: string) => void;
  publishContent: (id: string) => void;
  archiveContent: (id: string) => void;
  
  // Category actions
  addCategory: (category: Omit<ContentCategory, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<ContentCategory>) => void;
  deleteCategory: (id: string) => void;
  
  // Analytics
  getContentAnalytics: () => ContentAnalytics;
  incrementViews: (id: string) => void;
  incrementLikes: (id: string) => void;
  incrementShares: (id: string) => void;
}

export const useContentStore = create<ContentState>()(
  persist(
    (set, get) => ({
      content: [],
      categories: [
        { id: 'tech', name: 'Tecnología', color: '#3B82F6' },
        { id: 'design', name: 'Diseño', color: '#8B5CF6' },
        { id: 'business', name: 'Negocios', color: '#10B981' },
        { id: 'personal', name: 'Personal', color: '#F59E0B' },
        { id: 'tutorial', name: 'Tutoriales', color: '#EF4444' }
      ],
      analytics: {
        totalViews: 0,
        totalLikes: 0,
        totalShares: 0,
        engagementRate: 0,
        topContent: [],
        viewsByDate: [],
        popularTags: []
      },

      addContent: (content) =>
        set((state) => ({
          content: [
            ...state.content,
            {
              ...content,
              id: crypto.randomUUID(),
            },
          ],
        })),

      updateContent: (id, updates) =>
        set((state) => ({
          content: state.content.map((item) =>
            item.id === id
              ? {
                  ...item,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : item
          ),
        })),

      deleteContent: (id) =>
        set((state) => ({
          content: state.content.filter((item) => item.id !== id),
        })),

      publishContent: (id) =>
        set((state) => ({
          content: state.content.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: 'published',
                  publishDate: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              : item
          ),
        })),

      archiveContent: (id) =>
        set((state) => ({
          content: state.content.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: 'archived',
                  updatedAt: new Date().toISOString(),
                }
              : item
          ),
        })),

      addCategory: (category) =>
        set((state) => ({
          categories: [
            ...state.categories,
            {
              ...category,
              id: crypto.randomUUID(),
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
          content: state.content.map((item) =>
            item.category === id ? { ...item, category: '' } : item
          ),
        })),

      getContentAnalytics: () => {
        const { content } = get();
        const totalViews = content.reduce((sum, item) => sum + item.views, 0);
        const totalLikes = content.reduce((sum, item) => sum + item.likes, 0);
        const totalShares = content.reduce((sum, item) => sum + item.shares, 0);
        const engagementRate = totalViews > 0 ? ((totalLikes + totalShares) / totalViews) * 100 : 0;

        const topContent = content
          .sort((a, b) => b.views - a.views)
          .slice(0, 5)
          .map(item => item.id);

        // Generate mock data for views by date
        const viewsByDate = Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return {
            date: date.toISOString().split('T')[0],
            views: Math.floor(Math.random() * 100) + 10
          };
        }).reverse();

        // Calculate popular tags
        const tagCounts: Record<string, number> = {};
        content.forEach(item => {
          item.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        });

        const popularTags = Object.entries(tagCounts)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        return {
          totalViews,
          totalLikes,
          totalShares,
          engagementRate,
          topContent,
          viewsByDate,
          popularTags
        };
      },

      incrementViews: (id) =>
        set((state) => ({
          content: state.content.map((item) =>
            item.id === id ? { ...item, views: item.views + 1 } : item
          ),
        })),

      incrementLikes: (id) =>
        set((state) => ({
          content: state.content.map((item) =>
            item.id === id ? { ...item, likes: item.likes + 1 } : item
          ),
        })),

      incrementShares: (id) =>
        set((state) => ({
          content: state.content.map((item) =>
            item.id === id ? { ...item, shares: item.shares + 1 } : item
          ),
        })),
    }),
    {
      name: 'content-storage',
    }
  )
);