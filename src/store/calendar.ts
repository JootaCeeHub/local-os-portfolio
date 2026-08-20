import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type EventPriority = 'low' | 'medium' | 'high';
export type EventStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type EventType = 'meeting' | 'task' | 'reminder' | 'deadline' | 'personal' | 'other';
export type ViewType = 'month' | 'week' | 'day' | 'agenda';
export type ReminderTime = 5 | 10 | 15 | 30 | 60;

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  type: EventType;
  priority: EventPriority;
  status: EventStatus;
  location?: string;
  url?: string;
  category?: string;
  reminder?: ReminderTime;
  attendees?: string[];
  color?: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: string;
    occurrences?: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface CalendarState {
  events: CalendarEvent[];
  view: ViewType;
  categories: {
    id: string;
    name: string;
    color: string;
  }[];
  settings: {
    firstDayOfWeek: 0 | 1;
    showWeekends: boolean;
    showWeekNumbers: boolean;
    defaultView: ViewType;
    workingHours: {
      start: string;
      end: string;
    };
    defaultEventDuration: number;
    defaultReminder: ReminderTime;
  };
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  setView: (view: ViewType) => void;
  addCategory: (name: string, color: string) => void;
  updateCategory: (id: string, updates: { name?: string; color?: string }) => void;
  deleteCategory: (id: string) => void;
  updateSettings: (updates: Partial<CalendarState['settings']>) => void;
}

const defaultSettings = {
  firstDayOfWeek: 1 as const,
  showWeekends: true,
  showWeekNumbers: false,
  defaultView: 'month' as const,
  workingHours: {
    start: '09:00',
    end: '17:00',
  },
  defaultEventDuration: 60,
  defaultReminder: 15,
};

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set) => ({
      events: [],
      view: 'month',
      categories: [
        { id: 'work', name: 'Trabajo', color: '#3B82F6' },
        { id: 'personal', name: 'Personal', color: '#10B981' },
        { id: 'family', name: 'Familia', color: '#F59E0B' },
        { id: 'health', name: 'Salud', color: '#EF4444' },
      ],
      settings: defaultSettings,

      addEvent: (event) =>
        set((state) => ({
          events: [
            ...state.events,
            {
              ...event,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateEvent: (id, updates) =>
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id
              ? {
                  ...event,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : event
          ),
        })),

      deleteEvent: (id) =>
        set((state) => ({
          events: state.events.filter((event) => event.id !== id),
        })),

      setView: (view) => set({ view }),

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
          events: state.events.map((event) =>
            event.category === id ? { ...event, category: undefined } : event
          ),
        })),

      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),
    }),
    {
      name: 'calendar-storage',
    }
  )
);