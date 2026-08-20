import React, { useState, useMemo } from 'react';
import {
  Award,
  Trophy,
  Star,
  Medal,
  Crown,
  Zap,
  Target,
  Calendar,
  TrendingUp,
  Users,
  BookOpen,
  Timer,
  DollarSign,
  Heart,
  Flame,
  CheckCircle,
  Lock,
  Gift,
  Sparkles,
  Menu,
  Filter,
  Search,
  Share2,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAchievementsStore } from '../store/achievements';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ACHIEVEMENT_CATEGORIES = {
  productivity: { name: 'Productividad', icon: Zap, color: '#10B981' },
  learning: { name: 'Aprendizaje', icon: BookOpen, color: '#8B5CF6' },
  finance: { name: 'Finanzas', icon: DollarSign, color: '#F59E0B' },
  health: { name: 'Salud', icon: Heart, color: '#EF4444' },
  social: { name: 'Social', icon: Users, color: '#3B82F6' },
  goals: { name: 'Objetivos', icon: Target, color: '#EC4899' },
  streak: { name: 'Rachas', icon: Flame, color: '#F97316' },
  milestone: { name: 'Hitos', icon: Crown, color: '#A855F7' }
};

const ACHIEVEMENT_TIERS = {
  bronze: { name: 'Bronce', icon: Medal, color: '#CD7F32', gradient: 'from-amber-600 to-amber-800' },
  silver: { name: 'Plata', icon: Medal, color: '#C0C0C0', gradient: 'from-gray-400 to-gray-600' },
  gold: { name: 'Oro', icon: Trophy, color: '#FFD700', gradient: 'from-yellow-400 to-yellow-600' },
  platinum: { name: 'Platino', icon: Crown, color: '#E5E4E2', gradient: 'from-slate-300 to-slate-500' },
  diamond: { name: 'Diamante', icon: Sparkles, color: '#B9F2FF', gradient: 'from-cyan-300 to-blue-500' }
};

export function Achievements() {
  const {
    achievements,
    unlockedAchievements,
    progress,
    stats,
    unlockAchievement,
    getAchievementProgress,
    getCategoryStats
  } = useAchievementsStore();

  const [showMenu, setShowMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAchievements = useMemo(() => {
    return achievements
      .filter(achievement => {
        if (searchTerm && !achievement.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (selectedCategory && achievement.category !== selectedCategory) return false;
        if (selectedTier && achievement.tier !== selectedTier) return false;
        if (showUnlockedOnly && !unlockedAchievements.some(u => u.achievementId === achievement.id)) return false;
        return true;
      })
      .sort((a, b) => {
        // Sort by unlocked status first, then by tier, then by title
        const aUnlocked = unlockedAchievements.some(u => u.achievementId === a.id);
        const bUnlocked = unlockedAchievements.some(u => u.achievementId === b.id);
        
        if (aUnlocked !== bUnlocked) {
          return bUnlocked ? 1 : -1;
        }
        
        const tierOrder = { bronze: 0, silver: 1, gold: 2, platinum: 3, diamond: 4 };
        if (a.tier !== b.tier) {
          return tierOrder[b.tier] - tierOrder[a.tier];
        }
        
        return a.title.localeCompare(b.title);
      });
  }, [achievements, unlockedAchievements, selectedCategory, selectedTier, showUnlockedOnly, searchTerm]);

  const AchievementCard = ({ achievement }: { achievement: any }) => {
    const isUnlocked = unlockedAchievements.some(u => u.achievementId === achievement.id);
    const unlockedData = unlockedAchievements.find(u => u.achievementId === achievement.id);
    const progressData = getAchievementProgress(achievement.id);
    const category = ACHIEVEMENT_CATEGORIES[achievement.category as keyof typeof ACHIEVEMENT_CATEGORIES];
    const tier = ACHIEVEMENT_TIERS[achievement.tier as keyof typeof ACHIEVEMENT_TIERS];
    const CategoryIcon = category?.icon || Award;
    const TierIcon = tier?.icon || Medal;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`card relative overflow-hidden ${
          isUnlocked ? 'ring-2 ring-yellow-400/50' : 'opacity-75'
        }`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent" />
        </div>

        {/* Unlock Status Indicator */}
        <div className="absolute top-2 right-2">
          {isUnlocked ? (
            <div className="p-1 bg-yellow-400/20 rounded-full">
              <CheckCircle className="h-5 w-5 text-yellow-400" />
            </div>
          ) : (
            <div className="p-1 bg-gray-600/20 rounded-full">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
          )}
        </div>

        {/* Achievement Icon */}
        <div className="flex items-center justify-center mb-4">
          <div className={`relative p-4 rounded-full bg-gradient-to-br ${tier.gradient}`}>
            <TierIcon className="h-8 w-8 text-white" />
            <div className="absolute -bottom-1 -right-1 p-1 bg-gray-800 rounded-full">
              <CategoryIcon className="h-4 w-4" style={{ color: category?.color }} />
            </div>
          </div>
        </div>

        {/* Achievement Info */}
        <div className="text-center mb-4">
          <h3 className={`font-semibold mb-1 ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
            {achievement.title}
          </h3>
          <p className="text-sm text-gray-400 line-clamp-2">
            {achievement.description}
          </p>
        </div>

        {/* Tier Badge */}
        <div className="flex items-center justify-center mb-4">
          <span
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${tier.color}20`,
              color: tier.color
            }}
          >
            {tier.name}
          </span>
        </div>

        {/* Progress Bar (if not unlocked) */}
        {!isUnlocked && progressData && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Progreso</span>
              <span className="text-xs font-medium">
                {progressData.current}/{progressData.target}
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(progressData.current / progressData.target) * 100}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
              />
            </div>
          </div>
        )}

        {/* Unlock Date */}
        {isUnlocked && unlockedData && (
          <div className="text-center">
            <div className="text-xs text-gray-400">
              Desbloqueado el {format(new Date(unlockedData.unlockedAt), 'dd MMM yyyy', { locale: es })}
            </div>
          </div>
        )}

        {/* Reward Info */}
        {achievement.reward && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center justify-center space-x-2 text-sm">
              <Gift className="h-4 w-4 text-emerald-400" />
              <span className="text-emerald-400">{achievement.reward}</span>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--dark-bg-primary)] text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--dark-border)]">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-yellow-400" />
            <h1 className="text-xl font-semibold">Logros</h1>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <Share2 className="h-5 w-5" />
          </button>
          <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <Download className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {(showMenu || window.innerWidth >= 1024) && (
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed inset-y-0 left-0 w-64 bg-[var(--dark-bg-secondary)] transform transition-transform duration-300 ease-in-out z-30 lg:relative lg:translate-x-0"
            >
              <div className="p-4">
                {/* Stats Overview */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Resumen</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[var(--dark-bg-tertiary)] rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Trophy className="h-4 w-4 text-yellow-400" />
                        <span className="text-xs text-gray-400">Desbloqueados</span>
                      </div>
                      <div className="text-lg font-medium text-yellow-400">
                        {stats.unlockedCount}
                      </div>
                    </div>
                    <div className="bg-[var(--dark-bg-tertiary)] rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Target className="h-4 w-4 text-blue-400" />
                        <span className="text-xs text-gray-400">Total</span>
                      </div>
                      <div className="text-lg font-medium">{stats.totalCount}</div>
                    </div>
                    <div className="bg-[var(--dark-bg-tertiary)] rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Star className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs text-gray-400">Puntos</span>
                      </div>
                      <div className="text-lg font-medium text-emerald-400">
                        {stats.totalPoints}
                      </div>
                    </div>
                    <div className="bg-[var(--dark-bg-tertiary)] rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Flame className="h-4 w-4 text-orange-400" />
                        <span className="text-xs text-gray-400">Racha</span>
                      </div>
                      <div className="text-lg font-medium text-orange-400">
                        {stats.currentStreak}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <input
                      type="checkbox"
                      id="unlockedOnly"
                      checked={showUnlockedOnly}
                      onChange={(e) => setShowUnlockedOnly(e.target.checked)}
                      className="rounded border-gray-600 text-[var(--primary-500)] focus:ring-[var(--primary-500)]"
                    />
                    <label htmlFor="unlockedOnly" className="text-sm text-gray-300">
                      Solo desbloqueados
                    </label>
                  </div>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Categorías</h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`nav-item w-full ${
                        !selectedCategory ? 'nav-item-active' : ''
                      }`}
                    >
                      <Award className="h-5 w-5" />
                      <span>Todas</span>
                      <span className="ml-auto text-gray-500">{achievements.length}</span>
                    </button>
                    {Object.entries(ACHIEVEMENT_CATEGORIES).map(([key, category]) => {
                      const Icon = category.icon;
                      const count = achievements.filter(a => a.category === key).length;
                      return (
                        <button
                          key={key}
                          onClick={() => setSelectedCategory(key)}
                          className={`nav-item w-full ${
                            selectedCategory === key ? 'nav-item-active' : ''
                          }`}
                        >
                          <Icon className="h-5 w-5" style={{ color: category.color }} />
                          <span>{category.name}</span>
                          <span className="ml-auto text-gray-500">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tiers */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Niveles</h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedTier(null)}
                      className={`nav-item w-full ${
                        !selectedTier ? 'nav-item-active' : ''
                      }`}
                    >
                      <Medal className="h-5 w-5" />
                      <span>Todos</span>
                    </button>
                    {Object.entries(ACHIEVEMENT_TIERS).map(([key, tier]) => {
                      const Icon = tier.icon;
                      const count = achievements.filter(a => a.tier === key).length;
                      return (
                        <button
                          key={key}
                          onClick={() => setSelectedTier(key)}
                          className={`nav-item w-full ${
                            selectedTier === key ? 'nav-item-active' : ''
                          }`}
                        >
                          <Icon className="h-5 w-5" style={{ color: tier.color }} />
                          <span>{tier.name}</span>
                          <span className="ml-auto text-gray-500">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Search */}
          <div className="p-4 border-b border-[var(--dark-border)]">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar logros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Progress Overview */}
          <div className="p-4 border-b border-[var(--dark-border)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Progreso general</h2>
              <span className="text-sm text-gray-400">
                {stats.unlockedCount} de {stats.totalCount} logros
              </span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(stats.unlockedCount / stats.totalCount) * 100}%` }}
                transition={{ duration: 1 }}
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600"
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-sm text-gray-400">
              <span>{((stats.unlockedCount / stats.totalCount) * 100).toFixed(1)}% completado</span>
              <span>{stats.totalPoints} puntos totales</span>
            </div>
          </div>

          {/* Achievements Grid */}
          <div className="p-4">
            {filteredAchievements.length > 0 ? (
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                <AnimatePresence>
                  {filteredAchievements.map((achievement) => (
                    <AchievementCard key={achievement.id} achievement={achievement} />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Trophy className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  No se encontraron logros
                </h3>
                <p className="text-gray-500">
                  {searchTerm
                    ? 'Intenta con otros términos de búsqueda'
                    : 'Ajusta los filtros para ver más logros'}
                </p>
              </motion.div>
            )}
          </div>

          {/* Recent Achievements */}
          {unlockedAchievements.length > 0 && (
            <div className="p-4 border-t border-[var(--dark-border)]">
              <h3 className="text-lg font-semibold mb-4">Logros recientes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unlockedAchievements
                  .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
                  .slice(0, 6)
                  .map((unlocked) => {
                    const achievement = achievements.find(a => a.id === unlocked.achievementId);
                    if (!achievement) return null;

                    const category = ACHIEVEMENT_CATEGORIES[achievement.category as keyof typeof ACHIEVEMENT_CATEGORIES];
                    const tier = ACHIEVEMENT_TIERS[achievement.tier as keyof typeof ACHIEVEMENT_TIERS];
                    const CategoryIcon = category?.icon || Award;
                    const TierIcon = tier?.icon || Medal;

                    return (
                      <motion.div
                        key={unlocked.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center space-x-3 p-3 bg-[var(--dark-bg-secondary)] rounded-lg"
                      >
                        <div className={`p-2 rounded-full bg-gradient-to-br ${tier.gradient}`}>
                          <TierIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{achievement.title}</div>
                          <div className="text-sm text-gray-400">
                            {format(new Date(unlocked.unlockedAt), 'dd MMM', { locale: es })}
                          </div>
                        </div>
                        <div className="text-emerald-400 font-medium">
                          +{achievement.points}
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}