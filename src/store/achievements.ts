import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'productivity' | 'learning' | 'finance' | 'health' | 'social' | 'goals' | 'streak' | 'milestone';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  points: number;
  icon: string;
  condition: {
    type: 'count' | 'streak' | 'value' | 'date';
    target: number;
    metric: string;
  };
  reward?: string;
  hidden: boolean;
  createdAt: string;
}

export interface UnlockedAchievement {
  id: string;
  achievementId: string;
  unlockedAt: string;
  progress: number;
}

export interface AchievementProgress {
  achievementId: string;
  current: number;
  target: number;
  percentage: number;
}

interface AchievementsState {
  achievements: Achievement[];
  unlockedAchievements: UnlockedAchievement[];
  progress: AchievementProgress[];
  stats: {
    totalCount: number;
    unlockedCount: number;
    totalPoints: number;
    currentStreak: number;
  };
  
  // Actions
  unlockAchievement: (achievementId: string) => void;
  updateProgress: (achievementId: string, current: number) => void;
  getAchievementProgress: (achievementId: string) => AchievementProgress | null;
  getCategoryStats: (category: string) => {
    total: number;
    unlocked: number;
    points: number;
  };
  checkAchievements: (metric: string, value: number) => void;
}

const defaultAchievements: Achievement[] = [
  // Productivity Achievements
  {
    id: 'first-pomodoro',
    title: 'Primer Pomodoro',
    description: 'Completa tu primera sesión de Pomodoro',
    category: 'productivity',
    tier: 'bronze',
    points: 10,
    icon: '🍅',
    condition: { type: 'count', target: 1, metric: 'pomodoros' },
    hidden: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'pomodoro-master',
    title: 'Maestro del Pomodoro',
    description: 'Completa 100 sesiones de Pomodoro',
    category: 'productivity',
    tier: 'gold',
    points: 100,
    icon: '🏆',
    condition: { type: 'count', target: 100, metric: 'pomodoros' },
    reward: 'Tema especial desbloqueado',
    hidden: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'task-completionist',
    title: 'Completista',
    description: 'Completa 50 tareas',
    category: 'productivity',
    tier: 'silver',
    points: 50,
    icon: '✅',
    condition: { type: 'count', target: 50, metric: 'tasks_completed' },
    hidden: false,
    createdAt: new Date().toISOString()
  },
  
  // Learning Achievements
  {
    id: 'first-course',
    title: 'Primer Curso',
    description: 'Completa tu primer curso',
    category: 'learning',
    tier: 'bronze',
    points: 20,
    icon: '📚',
    condition: { type: 'count', target: 1, metric: 'courses_completed' },
    hidden: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'knowledge-seeker',
    title: 'Buscador de Conocimiento',
    description: 'Completa 10 cursos',
    category: 'learning',
    tier: 'gold',
    points: 200,
    icon: '🎓',
    condition: { type: 'count', target: 10, metric: 'courses_completed' },
    reward: 'Certificado especial',
    hidden: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'study-streak',
    title: 'Racha de Estudio',
    description: 'Estudia 7 días consecutivos',
    category: 'learning',
    tier: 'silver',
    points: 75,
    icon: '🔥',
    condition: { type: 'streak', target: 7, metric: 'study_days' },
    hidden: false,
    createdAt: new Date().toISOString()
  },
  
  // Finance Achievements
  {
    id: 'first-budget',
    title: 'Primer Presupuesto',
    description: 'Crea tu primer presupuesto',
    category: 'finance',
    tier: 'bronze',
    points: 15,
    icon: '💰',
    condition: { type: 'count', target: 1, metric: 'budgets_created' },
    hidden: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'savings-goal',
    title: 'Meta de Ahorro',
    description: 'Ahorra $1000',
    category: 'finance',
    tier: 'silver',
    points: 100,
    icon: '🏦',
    condition: { type: 'value', target: 1000, metric: 'total_savings' },
    hidden: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'investment-starter',
    title: 'Inversor Principiante',
    description: 'Realiza tu primera inversión',
    category: 'finance',
    tier: 'gold',
    points: 150,
    icon: '📈',
    condition: { type: 'count', target: 1, metric: 'investments_made' },
    reward: 'Guía de inversión avanzada',
    hidden: false,
    createdAt: new Date().toISOString()
  },
  
  // Goals Achievements
  {
    id: 'goal-setter',
    title: 'Establecedor de Metas',
    description: 'Crea tu primer objetivo',
    category: 'goals',
    tier: 'bronze',
    points: 10,
    icon: '🎯',
    condition: { type: 'count', target: 1, metric: 'goals_created' },
    hidden: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'goal-achiever',
    title: 'Alcanzador de Metas',
    description: 'Completa 5 objetivos',
    category: 'goals',
    tier: 'silver',
    points: 75,
    icon: '🏅',
    condition: { type: 'count', target: 5, metric: 'goals_completed' },
    hidden: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'goal-master',
    title: 'Maestro de Objetivos',
    description: 'Completa 25 objetivos',
    category: 'goals',
    tier: 'platinum',
    points: 250,
    icon: '👑',
    condition: { type: 'count', target: 25, metric: 'goals_completed' },
    reward: 'Plantillas de objetivos premium',
    hidden: false,
    createdAt: new Date().toISOString()
  },
  
  // Streak Achievements
  {
    id: 'week-warrior',
    title: 'Guerrero Semanal',
    description: 'Mantén una racha de 7 días',
    category: 'streak',
    tier: 'bronze',
    points: 25,
    icon: '⚡',
    condition: { type: 'streak', target: 7, metric: 'daily_activity' },
    hidden: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'month-champion',
    title: 'Campeón Mensual',
    description: 'Mantén una racha de 30 días',
    category: 'streak',
    tier: 'gold',
    points: 200,
    icon: '🔥',
    condition: { type: 'streak', target: 30, metric: 'daily_activity' },
    reward: 'Insignia de constancia',
    hidden: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'year-legend',
    title: 'Leyenda Anual',
    description: 'Mantén una racha de 365 días',
    category: 'streak',
    tier: 'diamond',
    points: 1000,
    icon: '💎',
    condition: { type: 'streak', target: 365, metric: 'daily_activity' },
    reward: 'Estatus de leyenda permanente',
    hidden: true,
    createdAt: new Date().toISOString()
  },
  
  // Milestone Achievements
  {
    id: 'early-adopter',
    title: 'Adoptador Temprano',
    description: 'Únete en los primeros 100 usuarios',
    category: 'milestone',
    tier: 'platinum',
    points: 500,
    icon: '🌟',
    condition: { type: 'count', target: 1, metric: 'early_adopter' },
    reward: 'Insignia de adoptador temprano',
    hidden: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'anniversary',
    title: 'Aniversario',
    description: 'Usa la aplicación por un año completo',
    category: 'milestone',
    tier: 'diamond',
    points: 365,
    icon: '🎂',
    condition: { type: 'date', target: 365, metric: 'days_since_signup' },
    reward: 'Tema de aniversario exclusivo',
    hidden: false,
    createdAt: new Date().toISOString()
  }
];

export const useAchievementsStore = create<AchievementsState>()(
  persist(
    (set, get) => ({
      achievements: defaultAchievements,
      unlockedAchievements: [],
      progress: [],
      stats: {
        totalCount: defaultAchievements.length,
        unlockedCount: 0,
        totalPoints: 0,
        currentStreak: 0
      },

      unlockAchievement: (achievementId) => {
        const { achievements, unlockedAchievements } = get();
        const achievement = achievements.find(a => a.id === achievementId);
        const alreadyUnlocked = unlockedAchievements.some(u => u.achievementId === achievementId);

        if (achievement && !alreadyUnlocked) {
          const newUnlocked: UnlockedAchievement = {
            id: crypto.randomUUID(),
            achievementId,
            unlockedAt: new Date().toISOString(),
            progress: 100
          };

          set((state) => ({
            unlockedAchievements: [...state.unlockedAchievements, newUnlocked],
            stats: {
              ...state.stats,
              unlockedCount: state.stats.unlockedCount + 1,
              totalPoints: state.stats.totalPoints + achievement.points
            }
          }));

          // Show notification (you could integrate with your notification system here)
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`¡Logro desbloqueado!`, {
              body: `${achievement.title} - ${achievement.points} puntos`,
              icon: '/achievement-icon.png'
            });
          }
        }
      },

      updateProgress: (achievementId, current) => {
        const { achievements } = get();
        const achievement = achievements.find(a => a.id === achievementId);
        
        if (achievement) {
          const percentage = Math.min((current / achievement.condition.target) * 100, 100);
          
          set((state) => ({
            progress: [
              ...state.progress.filter(p => p.achievementId !== achievementId),
              {
                achievementId,
                current,
                target: achievement.condition.target,
                percentage
              }
            ]
          }));

          // Auto-unlock if target reached
          if (current >= achievement.condition.target) {
            get().unlockAchievement(achievementId);
          }
        }
      },

      getAchievementProgress: (achievementId) => {
        const { progress } = get();
        return progress.find(p => p.achievementId === achievementId) || null;
      },

      getCategoryStats: (category) => {
        const { achievements, unlockedAchievements } = get();
        const categoryAchievements = achievements.filter(a => a.category === category);
        const unlockedInCategory = unlockedAchievements.filter(u => 
          achievements.find(a => a.id === u.achievementId)?.category === category
        );
        const points = unlockedInCategory.reduce((sum, u) => {
          const achievement = achievements.find(a => a.id === u.achievementId);
          return sum + (achievement?.points || 0);
        }, 0);

        return {
          total: categoryAchievements.length,
          unlocked: unlockedInCategory.length,
          points
        };
      },

      checkAchievements: (metric, value) => {
        const { achievements, unlockedAchievements } = get();
        
        achievements.forEach(achievement => {
          const alreadyUnlocked = unlockedAchievements.some(u => u.achievementId === achievement.id);
          
          if (!alreadyUnlocked && achievement.condition.metric === metric) {
            if (achievement.condition.type === 'count' || achievement.condition.type === 'value') {
              get().updateProgress(achievement.id, value);
            }
          }
        });
      }
    }),
    {
      name: 'achievements-storage',
    }
  )
);