import React, { useState, useCallback } from 'react';
import {
  ListTodo,
  Plus,
  Calendar,
  Clock,
  Tag,
  Flag,
  MoreVertical,
  Filter,
  Search,
  CheckCircle2,
  Circle,
  AlertCircle,
  ChevronRight,
  BarChart3,
  Trash2,
  Edit3,
  X,
  ArrowLeft,
  SortAsc,
  Star,
  StarOff,
  Archive,
  Inbox,
  FolderOpen,
  Users,
  Settings,
  AlertTriangle,
  CheckCircle,
  Menu
} from 'lucide-react';
import { useTasksStore } from '../store/tasks';
import { format, isToday, isTomorrow, isPast, isThisWeek } from 'date-fns';
import { es } from 'date-fns/locale';

const PRIORITY_CONFIG = {
  low: { color: 'text-blue-400', bg: 'bg-blue-400/10', icon: Flag },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: Flag },
  high: { color: 'text-red-400', bg: 'bg-red-400/10', icon: Flag }
};

const STATUS_CONFIG = {
  pending: { color: 'text-gray-400', bg: 'bg-gray-400/10', label: 'Pendiente' },
  in_progress: { color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'En progreso' },
  completed: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', label: 'Completada' }
};

export function Tasks() {
  const {
    tasks,
    categories,
    addTask,
    updateTask,
    deleteTask,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleTaskFavorite,
    archiveTask
  } = useTasksStore();

  const [showNewTask, setShowNewTask] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'title'>('dueDate');
  const [showArchived, setShowArchived] = useState(false);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    category: '',
    priority: 'medium' as const,
    status: 'pending' as const
  });

  const filteredTasks = tasks
    .filter(task => {
      if (showArchived !== task.archived) return false;
      if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (selectedCategory && task.category !== selectedCategory) return false;
      if (selectedStatus && task.status !== selectedStatus) return false;
      if (selectedPriority && task.priority !== selectedPriority) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const handleAddTask = useCallback(() => {
    if (!newTask.title || !newTask.dueDate) return;

    addTask({
      ...newTask,
      favorite: false,
      archived: false
    });

    setNewTask({
      title: '',
      description: '',
      dueDate: '',
      category: '',
      priority: 'medium',
      status: 'pending'
    });

    setShowNewTask(false);
  }, [newTask, addTask]);

  const getTaskStatusColor = useCallback((dueDate: string, status: string) => {
    if (status === 'completed') return 'text-emerald-400';
    if (isPast(new Date(dueDate))) return 'text-red-400';
    if (isToday(new Date(dueDate))) return 'text-yellow-400';
    return 'text-gray-400';
  }, []);

  const getTaskDueDateLabel = useCallback((dueDate: string) => {
    if (isToday(new Date(dueDate))) return 'Hoy';
    if (isTomorrow(new Date(dueDate))) return 'Mañana';
    if (isPast(new Date(dueDate))) return 'Vencida';
    if (isThisWeek(new Date(dueDate))) {
      return format(new Date(dueDate), 'EEEE', { locale: es });
    }
    return format(new Date(dueDate), 'd MMM', { locale: es });
  }, []);

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    overdue: tasks.filter(t => t.status !== 'completed' && isPast(new Date(t.dueDate))).length,
    highPriority: tasks.filter(t => t.priority === 'high').length
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold">Tareas</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <BarChart3 className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Filter className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowNewTask(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Nueva tarea</span>
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out z-30
          lg:relative lg:translate-x-0
          ${showMenu ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-4">
            <div className="space-y-1">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setShowArchived(false);
                }}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  !selectedCategory && !showArchived ? 'bg-gray-800' : 'hover:bg-gray-800'
                }`}
              >
                <Inbox className="h-5 w-5 text-blue-400" />
                <span>Todas</span>
                <span className="ml-auto text-gray-500">{tasks.filter(t => !t.archived).length}</span>
              </button>
              
              <button
                onClick={() => setSelectedCategory('today')}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  selectedCategory === 'today' ? 'bg-gray-800' : 'hover:bg-gray-800'
                }`}
              >
                <Calendar className="h-5 w-5 text-emerald-400" />
                <span>Hoy</span>
                <span className="ml-auto text-gray-500">
                  {tasks.filter(t => !t.archived && isToday(new Date(t.dueDate))).length}
                </span>
              </button>

              <button
                onClick={() => setSelectedCategory('favorites')}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  selectedCategory === 'favorites' ? 'bg-gray-800' : 'hover:bg-gray-800'
                }`}
              >
                <Star className="h-5 w-5 text-yellow-400" />
                <span>Favoritas</span>
                <span className="ml-auto text-gray-500">
                  {tasks.filter(t => !t.archived && t.favorite).length}
                </span>
              </button>
            </div>

            {/* Categories */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Categorías</h3>
                <button
                  onClick={() => {/* TODO: Add new category dialog */}}
                  className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-1">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id ? 'bg-gray-800' : 'hover:bg-gray-800'
                    }`}
                  >
                    <FolderOpen className="h-5 w-5 text-gray-400" />
                    <span>{category.name}</span>
                    <span className="ml-auto text-gray-500">
                      {tasks.filter(t => !t.archived && t.category === category.id).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Archive */}
            <div className="mt-8">
              <button
                onClick={() => {
                  setShowArchived(!showArchived);
                  setSelectedCategory(null);
                }}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  showArchived ? 'bg-gray-800' : 'hover:bg-gray-800'
                }`}
              >
                <Archive className="h-5 w-5 text-gray-400" />
                <span>Archivo</span>
                <span className="ml-auto text-gray-500">
                  {tasks.filter(t => t.archived).length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Search and Filters */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Buscar tareas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="dueDate">Fecha</option>
                <option value="priority">Prioridad</option>
                <option value="title">Título</option>
              </select>
            </div>

            {/* Active Filters */}
            {(selectedCategory || selectedStatus || selectedPriority) && (
              <div className="flex items-center space-x-2 mt-2">
                {selectedCategory && (
                  <span className="flex items-center space-x-1 bg-gray-800 text-sm px-2 py-1 rounded-lg">
                    <FolderOpen className="h-4 w-4" />
                    <span>{categories.find(c => c.id === selectedCategory)?.name || 'Categoría'}</span>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="hover:text-gray-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                )}
                {selectedStatus && (
                  <span className="flex items-center space-x-1 bg-gray-800 text-sm px-2 py-1 rounded-lg">
                    <Circle className="h-4 w-4" />
                    <span>{STATUS_CONFIG[selectedStatus as keyof typeof STATUS_CONFIG].label}</span>
                    <button
                      onClick={() => setSelectedStatus(null)}
                      className="hover:text-gray-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                )}
                {selectedPriority && (
                  <span className="flex items-center space-x-1 bg-gray-800 text-sm px-2 py-1 rounded-lg">
                    <Flag className="h-4 w-4" />
                    <span>{selectedPriority}</span>
                    <button
                      onClick={() => setSelectedPriority(null)}
                      className="hover:text-gray-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Tasks List */}
          <div className="p-4">
            {filteredTasks.length > 0 ? (
              <div className="space-y-2">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-start space-x-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <button
                      onClick={() => updateTask(task.id, {
                        status: task.status === 'completed' ? 'pending' : 'completed'
                      })}
                      className={`flex-shrink-0 mt-1 ${
                        task.status === 'completed' ? 'text-emerald-400' : 'text-gray-400'
                      }`}
                    >
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className={`font-medium ${
                            task.status === 'completed' ? 'line-through text-gray-400' : 'text-white'
                          }`}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="mt-1 text-sm text-gray-400">{task.description}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => toggleTaskFavorite(task.id)}
                            className={`p-1 rounded-lg hover:bg-gray-600 transition-colors ${
                              task.favorite ? 'text-yellow-400' : 'text-gray-400'
                            }`}
                          >
                            {task.favorite ? (
                              <Star className="h-4 w-4" />
                            ) : (
                              <StarOff className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => {/* TODO: Edit task dialog */}}
                            className="p-1 text-gray-400 hover:bg-gray-600 rounded-lg transition-colors"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => archiveTask(task.id)}
                            className="p-1 text-gray-400 hover:bg-gray-600 rounded-lg transition-colors"
                          >
                            <Archive className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-1 text-red-400 hover:bg-gray-600 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 mt-2">
                        {task.category && (
                          <span className="flex items-center space-x-1 text-xs bg-gray-700 px-2 py-1 rounded-lg">
                            <FolderOpen className="h-3 w-3" />
                            <span>{categories.find(c => c.id === task.category)?.name}</span>
                          </span>
                        )}
                        <span className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-lg ${
                          PRIORITY_CONFIG[task.priority].bg
                        }`}>
                          <Flag className={`h-3 w-3 ${PRIORITY_CONFIG[task.priority].color}`} />
                          <span className={PRIORITY_CONFIG[task.priority].color}>
                            {task.priority}
                          </span>
                        </span>
                        <span className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-lg ${
                          getTaskStatusColor(task.dueDate, task.status)
                        }`}>
                          <Calendar className="h-3 w-3" />
                          <span>{getTaskDueDateLabel(task.dueDate)}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ListTodo className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  No hay tareas
                </h3>
                <p className="text-gray-500">
                  {searchTerm
                    ? 'No se encontraron tareas que coincidan con tu búsqueda'
                    : showArchived
                    ? 'No hay tareas archivadas'
                    : 'Haz clic en "Nueva tarea" para comenzar'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Panel */}
        {showStats && (
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-gray-900 p-4 overflow-y-auto z-40">
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

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <ListTodo className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm text-gray-400">Total</span>
                </div>
                <div className="text-2xl font-light">{stats.total}</div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm text-gray-400">Completadas</span>
                </div>
                <div className="text-2xl font-light">{stats.completed}</div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Circle className="h-5 w-5 text-blue-400" />
                  <span className="text-sm text-gray-400">Pendientes</span>
                </div>
                <div className="text-2xl font-light">{stats.pending}</div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <span className="text-sm text-gray-400">Vencidas</span>
                </div>
                <div className="text-2xl font-light">{stats.overdue}</div>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-gray-800 rounded-lg p-4 mb-8">
              <h3 className="text-lg font-medium mb-4">Progreso</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Completadas</span>
                    <span className="text-sm font-medium">
                      {stats.total > 0
                        ? Math.round((stats.completed / stats.total) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{
                        width: `${stats.total > 0
                          ? (stats.completed / stats.total) * 100
                          : 0}%`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">En progreso</span>
                    <span className="text-sm font-medium">
                      {stats.total > 0
                        ? Math.round((stats.inProgress / stats.total) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${stats.total > 0
                          ? (stats.inProgress / stats.total) * 100
                          : 0}%`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Pendientes</span>
                    <span className="text-sm font-medium">
                      {stats.total > 0
                        ? Math.round((stats.pending / stats.total) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-500"
                      style={{
                        width: `${stats.total > 0
                          ? (stats.pending / stats.total) * 100
                          : 0}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Priority Distribution */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Distribución por prioridad</h3>
              <div className="space-y-4">
                {['high', 'medium', 'low'].map((priority) => {
                  const count = tasks.filter(t => t.priority === priority).length;
                  const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;

                  return (
                    <div key={priority}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400 capitalize">{priority}</span>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            priority === 'high'
                              ? 'bg-red-500'
                              : priority === 'medium'
                              ? 'bg-yellow-500'
                              : 'bg-blue-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* New Task Dialog */}
        {showNewTask && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-lg w-full max-w-md">
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <h2 className="text-lg font-medium">Nueva tarea</h2>
                <button
                  onClick={() => setShowNewTask(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="¿Qué necesitas hacer?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
                    placeholder="Agrega más detalles..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Fecha límite
                    </label>
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Categoría
                    </label>
                    <select
                      value={newTask.category}
                      onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus :ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Sin categoría</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Prioridad
                  </label>
                  <div className="flex items-center space-x-4">
                    {['low', 'medium', 'high'].map((priority) => (
                      <button
                        key={priority}
                        onClick={() => setNewTask({ ...newTask, priority: priority as any })}
                        className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                          newTask.priority === priority
                            ? PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG].bg
                            : 'bg-gray-800'
                        }`}
                      >
                        <Flag className={PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG].color} />
                        <span className="capitalize">{priority}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 p-4 border-t border-gray-800">
                <button
                  onClick={() => setShowNewTask(false)}
                  className="px-4 py-2 text-gray-400 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddTask}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Crear tarea
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}