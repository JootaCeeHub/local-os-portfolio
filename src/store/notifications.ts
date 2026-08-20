import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationCategory = 
  | 'system' 
  | 'pomodoro' 
  | 'tasks' 
  | 'calendar' 
  | 'achievements' 
  | 'social';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
  link?: string;
  metadata?: Record<string, any>;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  settings: {
    pushEnabled: boolean;
    soundEnabled: boolean;
    categories: Record<NotificationCategory, boolean>;
  };
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'isArchived' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  archiveNotification: (id: string) => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  updateSettings: (settings: Partial<NotificationsState['settings']>) => void;
  getUnreadCount: () => number;
  getFilteredNotifications: (filters: {
    category?: NotificationCategory;
    type?: NotificationType;
    isRead?: boolean;
    isArchived?: boolean;
  }) => Notification[];
}

const defaultSettings = {
  pushEnabled: true,
  soundEnabled: true,
  categories: {
    system: true,
    pomodoro: true,
    tasks: true,
    calendar: true,
    achievements: true,
    social: true,
  },
};

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      settings: defaultSettings,
      
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: crypto.randomUUID(),
          isRead: false,
          isArchived: false,
          createdAt: new Date().toISOString(),
        };
        
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));

        // Reproducir sonido si está habilitado
        if (get().settings.soundEnabled) {
          const audio = new Audio('/sounds/notification.mp3');
          audio.play().catch(() => {});
        }

        // Mostrar notificación push si está habilitado
        if (get().settings.pushEnabled && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/icons/notification-icon.png',
            });
          }
        }
      },

      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: state.unreadCount - 1,
      })),

      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      })),

      archiveNotification: (id) => set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isArchived: true } : n
        ),
      })),

      deleteNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: state.notifications.find((n) => n.id === id)?.isRead
          ? state.unreadCount
          : state.unreadCount - 1,
      })),

      clearAll: () => set({ notifications: [], unreadCount: 0 }),

      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings },
      })),

      getUnreadCount: () => get().notifications.filter((n) => !n.isRead).length,

      getFilteredNotifications: (filters) => {
        return get().notifications.filter((n) => {
          if (filters.category && n.category !== filters.category) return false;
          if (filters.type && n.type !== filters.type) return false;
          if (typeof filters.isRead === 'boolean' && n.isRead !== filters.isRead) return false;
          if (typeof filters.isArchived === 'boolean' && n.isArchived !== filters.isArchived) return false;
          return true;
        });
      },
    }),
    {
      name: 'notifications-storage',
    }
  )
);