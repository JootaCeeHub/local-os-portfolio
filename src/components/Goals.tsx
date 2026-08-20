import React, { useState, useCallback, useMemo } from 'react';
import {
  Target,
  Plus,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Filter,
  Search,
  Edit3,
  Trash2,
  Play,
  Pause,
  Flag,
  Star,
  Menu,
  X,
  Save,
  ArrowLeft,
  Zap,
  Trophy,
  Flame,
  Users,
  BookOpen,
  Dumbbell,
  DollarSign,
  Heart,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoalsStore } from '../store/goals';
import { useFormValidation, commonSchemas } from '../hooks/useFormValidation';
import { FormField, Input, Textarea, Select, Button } from './ui/FormField';
import { VirtualizedList } from './ui/VirtualizedList';
import { format, differenceInDays, isAfter, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import { z } from 'zod';

const GOAL_CATEGORIES = {
  personal: { name: 'Personal', icon: Star, color: '#10B981' },
  career: { name: 'Carrera', icon: Briefcase, color: '#3B82F6' },
  health: { name: 'Salud', icon: Heart, color: '#EF4444' },
  finance: { name: 'Finanzas', icon: DollarSign, color: '#F59E0B' },
  learning: { name: 'Aprendizaje', icon: BookOpen, color: '#8B5CF6' },
  fitness: { name: 'Fitness', icon: Dumbbell, color: '#06B6D4' },
  social: { name: 'Social', icon: Users, color: '#EC4899' }
};

const GOAL_TYPES = {
  numeric: { name: 'Numérico', description: 'Meta con valor objetivo específico' },
  boolean: { name: 'Sí/No', description: 'Meta de completar o no completar' },
  habit: { name: 'Hábito', description: 'Meta de repetición diaria/semanal' },
  milestone: { name: 'Hito', description: 'Meta con fechas específicas' }
};

const goalSchema = z.object({
  title: commonSchemas.required,
  description: z.string().optional(),
  category: commonSchemas.required,
  type: z.enum(['numeric', 'boolean', 'habit', 'milestone']),
  targetValue: commonSchemas.positiveNumber,
  unit: commonSchemas.required,
  deadline: commonSchemas.date.optional(),
  priority: z.enum(['low', 'medium', 'high']),
  isPublic: z.boolean(),
  tags: z.array(z.string()).optional()
});

export function Goals() {
  const {
    goals,
    milestones,
    habits,
    addGoal,
    updateGoal,
    deleteGoal,
    addMilestone,
    updateHabit,
    getGoalProgress,
    getGoalStats
  } = useGoalsStore();

  const [showNewGoal, setShowNewGoal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'goals' | 'habits' | 'milestones'>('goals');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const {
    values,
    errors,
    isSubmitting,
    setValue,
    handleSubmit,
    reset,
    getFieldError,
    hasFieldError
  } = useFormValidation({
    schema: goalSchema,
    onSubmit: async (data) => {
      addGoal({
        ...data,
        currentValue: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      reset();
      setShowNewGoal(false);
    },
    initialValues: {
      type: 'numeric',
      priority: 'medium',
      isPublic: false,
      targetValue: 1,
      unit: 'unidades'
    }
  });

  const filteredGoals = useMemo(() => {
    return goals
      .filter(goal => {
        if (searchTerm && !goal.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (selectedCategory && goal.category !== selectedCategory) return false;
        if (selectedStatus && goal.status !== selectedStatus) return false;
        return true;
      })
      .sort((a, b) => {
        // Sort by priority first, then by deadline
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (a.priority !== b.priority) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        if (a.deadline && b.deadline) {
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [goals, searchTerm, selectedCategory, selectedStatus]);

  const stats = useMemo(() => getGoalStats(), [getGoalStats]);

  const renderGoalItem = useCallback(({ index, style, data }: any) => {
    const goal = data[index];
    const progress = getGoalProgress(goal.id);
    const category = GOAL_CATEGORIES[goal.category as keyof typeof GOAL_CATEGORIES];
    const CategoryIcon = category?.icon || Target;
    const daysLeft = goal.deadline ? differenceInDays(new Date(goal.deadline), new Date()) : null;

    return (
      <motion.div
        style={style}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-2"
      >
        <div className="card card-hover group">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${category?.color}20` }}
              >
                <CategoryIcon 
                  className="h-5 w-5" 
                  style={{ color: category?.color }}
                />
              </div>
              <div>
                <h3 className="font-medium text-white">{goal.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{goal.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1 hover:bg-gray-700 rounded-lg transition-colors">
                <Edit3 className="h-4 w-4" />
              </button>
              <button 
                onClick={() => deleteGoal(goal.id)}
                className="p-1 hover:bg-gray-700 rounded-lg transition-colors text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Progreso</span>
              <span className="text-sm font-medium">
                {goal.currentValue} / {goal.targetValue} {goal.unit}
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>{progress.toFixed(1)}% completado</span>
              {daysLeft !== null && (
                <span className={daysLeft < 7 ? 'text-red-400' : 'text-gray-400'}>
                  {daysLeft > 0 ? `${daysLeft} días restantes` : 'Vencido'}
                </span>
              )}
            </div>
          </div>

          {/* Tags and Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-lg text-xs ${
                goal.priority === 'high' ? 'bg-red-400/10 text-red-400' :
                goal.priority === 'medium' ? 'bg-yellow-400/10 text-yellow-400' :
                'bg-blue-400/10 text-blue-400'
              }`}>
                {goal.priority}
              </span>
              <span className={`px-2 py-1 rounded-lg text-xs ${
                goal.status === 'completed' ? 'bg-emerald-400/10 text-emerald-400' :
                goal.status === 'active' ? 'bg-blue-400/10 text-blue-400' :
                'bg-gray-400/10 text-gray-400'
              }`}>
                {goal.status}
              </span>
            </div>
            {goal.isPublic && (
              <Users className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
      </motion.div>
    );
  }, [getGoalProgress, deleteGoal]);

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
            <Target className="h-6 w-6 text-[var(--primary-500)]" />
            <h1 className="text-xl font-semibold">Objetivos</h1>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <BarChart3 className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowStats(!showStats)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <TrendingUp className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Filter className="h-5 w-5" />
          </button>
          <Button
            onClick={() => setShowNewGoal(true)}
            variant="primary"
            icon={<Plus className="h-5 w-5" />}
          >
            <span className="hidden sm:inline">Nuevo objetivo</span>
          </Button>
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
                {/* Quick Stats */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Resumen</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[var(--dark-bg-tertiary)] rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Target className="h-4 w-4 text-[var(--primary-500)]" />
                        <span className="text-xs text-gray-400">Total</span>
                      </div>
                      <div className="text-lg font-medium">{stats.total}</div>
                    </div>
                    <div className="bg-[var(--dark-bg-tertiary)] rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs text-gray-400">Completados</span>
                      </div>
                      <div className="text-lg font-medium text-emerald-400">{stats.completed}</div>
                    </div>
                    <div className="bg-[var(--dark-bg-tertiary)] rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Play className="h-4 w-4 text-blue-400" />
                        <span className="text-xs text-gray-400">Activos</span>
                      </div>
                      <div className="text-lg font-medium text-blue-400">{stats.active}</div>
                    </div>
                    <div className="bg-[var(--dark-bg-tertiary)] rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Flame className="h-4 w-4 text-orange-400" />
                        <span className="text-xs text-gray-400">Racha</span>
                      </div>
                      <div className="text-lg font-medium text-orange-400">{stats.streak}</div>
                    </div>
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="mb-6">
                  <div className="space-y-1">
                    {[
                      { id: 'goals', label: 'Objetivos', icon: Target },
                      { id: 'habits', label: 'Hábitos', icon: Zap },
                      { id: 'milestones', label: 'Hitos', icon: Flag }
                    ].map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`nav-item w-full ${
                            activeTab === tab.id ? 'nav-item-active' : ''
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Categorías</h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`nav-item w-full ${
                        !selectedCategory ? 'nav-item-active' : ''
                      }`}
                    >
                      <Star className="h-5 w-5" />
                      <span>Todas</span>
                      <span className="ml-auto text-gray-500">{goals.length}</span>
                    </button>
                    {Object.entries(GOAL_CATEGORIES).map(([key, category]) => {
                      const Icon = category.icon;
                      const count = goals.filter(g => g.category === key).length;
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Search and Filters */}
          <div className="p-4 border-b border-[var(--dark-border)]">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Buscar objetivos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <Select
                value={selectedStatus || ''}
                onChange={(e) => setSelectedStatus(e.target.value || null)}
                options={[
                  { value: '', label: 'Todos los estados' },
                  { value: 'active', label: 'Activos' },
                  { value: 'completed', label: 'Completados' },
                  { value: 'paused', label: 'Pausados' }
                ]}
              />
            </div>
          </div>

          {/* Goals List */}
          <div className="p-4">
            {filteredGoals.length > 0 ? (
              <VirtualizedList
                items={filteredGoals}
                height={600}
                itemHeight={200}
                renderItem={renderGoalItem}
                className="w-full"
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Target className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  No hay objetivos
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm
                    ? 'No se encontraron objetivos que coincidan con tu búsqueda'
                    : 'Crea tu primer objetivo para comenzar a alcanzar tus metas'}
                </p>
                <Button
                  onClick={() => setShowNewGoal(true)}
                  variant="primary"
                  icon={<Plus className="h-5 w-5" />}
                >
                  Crear objetivo
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Stats Panel */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-[var(--dark-bg-secondary)] p-4 overflow-y-auto z-40"
            >
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setShowStats(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
                <h2 className="text-lg font-medium">Estadísticas</h2>
                <div className="w-6" />
              </div>

              {/* Progress Overview */}
              <div className="card mb-6">
                <h3 className="text-lg font-medium mb-4">Progreso general</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">Objetivos completados</span>
                      <span className="text-xl font-medium text-emerald-400">
                        {stats.completed}/{stats.total}
                      </span>
                    </div>
                    <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                        style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">Progreso promedio</span>
                      <span className="text-xl font-medium">{stats.averageProgress.toFixed(1)}%</span>
                    </div>
                    <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                        style={{ width: `${stats.averageProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Distribution */}
              <div className="card">
                <h3 className="text-lg font-medium mb-4">Distribución por categoría</h3>
                <div className="space-y-3">
                  {Object.entries(GOAL_CATEGORIES).map(([key, category]) => {
                    const count = goals.filter(g => g.category === key).length;
                    const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    const Icon = category.icon;

                    if (count === 0) return null;

                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Icon className="h-4 w-4" style={{ color: category.color }} />
                            <span className="text-sm text-gray-400">{category.name}</span>
                          </div>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full"
                            style={{
                              backgroundColor: category.color,
                              width: `${percentage}%`
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* New Goal Dialog */}
        <AnimatePresence>
          {showNewGoal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[var(--dark-bg-secondary)] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between p-4 border-b border-[var(--dark-border)]">
                  <h2 className="text-lg font-medium">Nuevo objetivo</h2>
                  <button
                    onClick={() => setShowNewGoal(false)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Título del objetivo"
                      required
                      error={getFieldError('title')}
                    >
                      <Input
                        value={values.title || ''}
                        onChange={(e) => setValue('title', e.target.value)}
                        placeholder="Ej: Leer 12 libros este año"
                        error={hasFieldError('title')}
                      />
                    </FormField>

                    <FormField
                      label="Categoría"
                      required
                      error={getFieldError('category')}
                    >
                      <Select
                        value={values.category || ''}
                        onChange={(e) => setValue('category', e.target.value)}
                        options={Object.entries(GOAL_CATEGORIES).map(([key, cat]) => ({
                          value: key,
                          label: cat.name
                        }))}
                        placeholder="Seleccionar categoría"
                        error={hasFieldError('category')}
                      />
                    </FormField>
                  </div>

                  <FormField
                    label="Descripción"
                    description="Describe tu objetivo en detalle"
                    error={getFieldError('description')}
                  >
                    <Textarea
                      value={values.description || ''}
                      onChange={(e) => setValue('description', e.target.value)}
                      placeholder="Describe qué quieres lograr y por qué es importante..."
                      error={hasFieldError('description')}
                    />
                  </FormField>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      label="Tipo de objetivo"
                      required
                      error={getFieldError('type')}
                    >
                      <Select
                        value={values.type || 'numeric'}
                        onChange={(e) => setValue('type', e.target.value)}
                        options={Object.entries(GOAL_TYPES).map(([key, type]) => ({
                          value: key,
                          label: type.name
                        }))}
                        error={hasFieldError('type')}
                      />
                    </FormField>

                    <FormField
                      label="Valor objetivo"
                      required
                      error={getFieldError('targetValue')}
                    >
                      <Input
                        type="number"
                        value={values.targetValue || ''}
                        onChange={(e) => setValue('targetValue', parseFloat(e.target.value))}
                        placeholder="100"
                        min="1"
                        error={hasFieldError('targetValue')}
                      />
                    </FormField>

                    <FormField
                      label="Unidad"
                      required
                      error={getFieldError('unit')}
                    >
                      <Input
                        value={values.unit || ''}
                        onChange={(e) => setValue('unit', e.target.value)}
                        placeholder="libros, horas, kg..."
                        error={hasFieldError('unit')}
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Fecha límite"
                      description="Opcional - cuándo quieres completar este objetivo"
                      error={getFieldError('deadline')}
                    >
                      <Input
                        type="date"
                        value={values.deadline || ''}
                        onChange={(e) => setValue('deadline', e.target.value)}
                        error={hasFieldError('deadline')}
                      />
                    </FormField>

                    <FormField
                      label="Prioridad"
                      required
                      error={getFieldError('priority')}
                    >
                      <Select
                        value={values.priority || 'medium'}
                        onChange={(e) => setValue('priority', e.target.value)}
                        options={[
                          { value: 'low', label: 'Baja' },
                          { value: 'medium', label: 'Media' },
                          { value: 'high', label: 'Alta' }
                        ]}
                        error={hasFieldError('priority')}
                      />
                    </FormField>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={values.isPublic || false}
                      onChange={(e) => setValue('isPublic', e.target.checked)}
                      className="rounded border-gray-600 text-[var(--primary-500)] focus:ring-[var(--primary-500)]"
                    />
                    <label htmlFor="isPublic" className="text-sm text-gray-300">
                      Hacer público este objetivo
                    </label>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-4 border-t border-[var(--dark-border)]">
                    <Button
                      type="button"
                      onClick={() => setShowNewGoal(false)}
                      variant="ghost"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      loading={isSubmitting}
                      icon={<Save className="h-5 w-5" />}
                    >
                      Crear objetivo
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}