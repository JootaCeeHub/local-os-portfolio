import React, { useState, useCallback } from 'react';
import {
  Briefcase,
  Plus,
  Calendar,
  Clock,
  Users,
  Star,
  GitBranch,
  ExternalLink,
  Github,
  Filter,
  Search,
  MoreVertical,
  Edit3,
  Trash2,
  Archive,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Target,
  TrendingUp,
  FileText,
  Tag,
  Folder,
  Settings,
  BarChart3,
  X,
  Save,
  ArrowLeft,
  Menu
} from 'lucide-react';
import { useProjectsStore } from '../store/projects';
import { format, differenceInDays, isAfter, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';

const PROJECT_STATUS_CONFIG = {
  planning: { color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Planificación' },
  in_progress: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'En progreso' },
  on_hold: { color: 'text-orange-400', bg: 'bg-orange-400/10', label: 'En pausa' },
  completed: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', label: 'Completado' },
  cancelled: { color: 'text-red-400', bg: 'bg-red-400/10', label: 'Cancelado' }
};

const PRIORITY_CONFIG = {
  low: { color: 'text-blue-400', bg: 'bg-blue-400/10' },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  high: { color: 'text-red-400', bg: 'bg-red-400/10' }
};

export function Projects() {
  const {
    projects,
    categories,
    addProject,
    updateProject,
    deleteProject,
    addCategory,
    updateCategory,
    deleteCategory
  } = useProjectsStore();

  const [showNewProject, setShowNewProject] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'startDate' | 'endDate' | 'priority'>('startDate');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    category: '',
    priority: 'medium' as const,
    status: 'planning' as const,
    budget: '',
    technologies: [] as string[],
    teamMembers: [] as string[],
    githubUrl: '',
    liveUrl: ''
  });

  const filteredProjects = projects
    .filter(project => {
      if (searchTerm && !project.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (selectedCategory && project.category !== selectedCategory) return false;
      if (selectedStatus && project.status !== selectedStatus) return false;
      if (selectedPriority && project.priority !== selectedPriority) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'startDate':
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        case 'endDate':
          return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        default:
          return 0;
      }
    });

  const handleAddProject = useCallback(() => {
    if (!newProject.name || !newProject.startDate || !newProject.endDate) return;

    addProject({
      ...newProject,
      budget: parseFloat(newProject.budget) || 0,
      progress: 0
    });

    setNewProject({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      category: '',
      priority: 'medium',
      status: 'planning',
      budget: '',
      technologies: [],
      teamMembers: [],
      githubUrl: '',
      liveUrl: ''
    });

    setShowNewProject(false);
  }, [newProject, addProject]);

  const getProjectProgress = useCallback((project: any) => {
    if (project.status === 'completed') return 100;
    if (project.status === 'cancelled') return 0;
    
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
    const now = new Date();
    
    if (isBefore(now, start)) return 0;
    if (isAfter(now, end)) return 100;
    
    const totalDays = differenceInDays(end, start);
    const elapsedDays = differenceInDays(now, start);
    
    return Math.round((elapsedDays / totalDays) * 100);
  }, []);

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'in_progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    planning: projects.filter(p => p.status === 'planning').length,
    overdue: projects.filter(p => 
      p.status !== 'completed' && 
      p.status !== 'cancelled' && 
      isAfter(new Date(), new Date(p.endDate))
    ).length,
    totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0)
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
          <h1 className="text-xl font-semibold">Proyectos</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            {viewMode === 'grid' ? <FileText className="h-5 w-5" /> : <Folder className="h-5 w-5" />}
          </button>
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
            onClick={() => setShowNewProject(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Nuevo proyecto</span>
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
            {/* Quick Stats */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Resumen</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
                  <span className="text-sm">Total</span>
                  <span className="font-medium">{stats.total}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
                  <span className="text-sm">Activos</span>
                  <span className="font-medium text-yellow-400">{stats.active}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
                  <span className="text-sm">Completados</span>
                  <span className="font-medium text-emerald-400">{stats.completed}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
                  <span className="text-sm">Vencidos</span>
                  <span className="font-medium text-red-400">{stats.overdue}</span>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-400">Categorías</h3>
                <button
                  onClick={() => {/* TODO: Add new category dialog */}}
                  className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    !selectedCategory ? 'bg-gray-800' : 'hover:bg-gray-800'
                  }`}
                >
                  <Folder className="h-5 w-5 text-gray-400" />
                  <span>Todas</span>
                  <span className="ml-auto text-gray-500">{projects.length}</span>
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id ? 'bg-gray-800' : 'hover:bg-gray-800'
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span>{category.name}</span>
                    <span className="ml-auto text-gray-500">
                      {projects.filter(p => p.category === category.id).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">Estado</h3>
              <div className="space-y-1">
                {Object.entries(PROJECT_STATUS_CONFIG).map(([status, config]) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status === selectedStatus ? null : status)}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      selectedStatus === status ? 'bg-gray-800' : 'hover:bg-gray-800'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${config.bg}`} />
                    <span>{config.label}</span>
                    <span className="ml-auto text-gray-500">
                      {projects.filter(p => p.status === status).length}
                    </span>
                  </button>
                ))}
              </div>
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
                  placeholder="Buscar proyectos..."
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
                <option value="startDate">Fecha inicio</option>
                <option value="endDate">Fecha fin</option>
                <option value="name">Nombre</option>
                <option value="priority">Prioridad</option>
              </select>
            </div>

            {/* Active Filters */}
            {(selectedCategory || selectedStatus || selectedPriority) && (
              <div className="flex items-center space-x-2 mt-2">
                {selectedCategory && (
                  <span className="flex items-center space-x-1 bg-gray-800 text-sm px-2 py-1 rounded-lg">
                    <Folder className="h-4 w-4" />
                    <span>{categories.find(c => c.id === selectedCategory)?.name}</span>
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
                    <CheckCircle className="h-4 w-4" />
                    <span>{PROJECT_STATUS_CONFIG[selectedStatus as keyof typeof PROJECT_STATUS_CONFIG].label}</span>
                    <button
                      onClick={() => setSelectedStatus(null)}
                      className="hover:text-gray-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Projects Grid/List */}
          <div className="p-4">
            {filteredProjects.length > 0 ? (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
              }>
                {filteredProjects.map((project) => {
                  const progress = getProjectProgress(project);
                  const category = categories.find(c => c.id === project.category);
                  
                  return (
                    <div
                      key={project.id}
                      className={`group bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors ${
                        viewMode === 'list' ? 'flex items-center space-x-6' : ''
                      }`}
                    >
                      <div className={viewMode === 'list' ? 'flex-1' : ''}>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-medium text-white mb-1">{project.name}</h3>
                            <p className="text-sm text-gray-400 line-clamp-2">{project.description}</p>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1 hover:bg-gray-600 rounded-lg transition-colors">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {/* Status and Priority */}
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-lg text-xs ${
                              PROJECT_STATUS_CONFIG[project.status].bg
                            } ${PROJECT_STATUS_CONFIG[project.status].color}`}>
                              {PROJECT_STATUS_CONFIG[project.status].label}
                            </span>
                            <span className={`px-2 py-1 rounded-lg text-xs ${
                              PRIORITY_CONFIG[project.priority].bg
                            } ${PRIORITY_CONFIG[project.priority].color}`}>
                              {project.priority}
                            </span>
                            {category && (
                              <span
                                className="px-2 py-1 rounded-lg text-xs text-white"
                                style={{ backgroundColor: category.color }}
                              >
                                {category.name}
                              </span>
                            )}
                          </div>

                          {/* Progress */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-400">Progreso</span>
                              <span className="text-sm font-medium">{progress}%</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>

                          {/* Dates */}
                          <div className="flex items-center justify-between text-sm text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{format(new Date(project.startDate), 'dd MMM', { locale: es })}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{format(new Date(project.endDate), 'dd MMM', { locale: es })}</span>
                            </div>
                          </div>

                          {/* Technologies */}
                          {project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {project.technologies.slice(0, 3).map((tech, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-700 text-xs rounded-lg"
                                >
                                  {tech}
                                </span>
                              ))}
                              {project.technologies.length > 3 && (
                                <span className="px-2 py-1 bg-gray-700 text-xs rounded-lg">
                                  +{project.technologies.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Links */}
                          <div className="flex items-center space-x-2">
                            {project.githubUrl && (
                              <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                              >
                                <Github className="h-4 w-4" />
                              </a>
                            )}
                            {project.liveUrl && (
                              <a
                                href={project.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  No hay proyectos
                </h3>
                <p className="text-gray-500">
                  {searchTerm
                    ? 'No se encontraron proyectos que coincidan con tu búsqueda'
                    : 'Haz clic en "Nuevo proyecto" para comenzar'}
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

            {/* Overview Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Briefcase className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm text-gray-400">Total</span>
                </div>
                <div className="text-2xl font-light">{stats.total}</div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Play className="h-5 w-5 text-yellow-400" />
                  <span className="text-sm text-gray-400">Activos</span>
                </div>
                <div className="text-2xl font-light">{stats.active}</div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm text-gray-400">Completados</span>
                </div>
                <div className="text-2xl font-light">{stats.completed}</div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <span className="text-sm text-gray-400">Vencidos</span>
                </div>
                <div className="text-2xl font-light">{stats.overdue}</div>
              </div>
            </div>

            {/* Budget Overview */}
            <div className="bg-gray-800 rounded-lg p-4 mb-8">
              <h3 className="text-lg font-medium mb-4">Presupuesto total</h3>
              <div className="text-3xl font-light text-emerald-400">
                ${stats.totalBudget.toLocaleString()}
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Distribución por estado</h3>
              <div className="space-y-4">
                {Object.entries(PROJECT_STATUS_CONFIG).map(([status, config]) => {
                  const count = projects.filter(p => p.status === status).length;
                  const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;

                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">{config.label}</span>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${config.color.replace('text-', 'bg-')}`}
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

        {/* New Project Dialog */}
        {showNewProject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <h2 className="text-lg font-medium">Nuevo proyecto</h2>
                <button
                  onClick={() => setShowNewProject(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Nombre del proyecto
                    </label>
                    <input
                      type="text"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Mi nuevo proyecto"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Categoría
                    </label>
                    <select
                      value={newProject.category}
                      onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Seleccionar categoría</option>
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
                    Descripción
                  </label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
                    placeholder="Describe tu proyecto..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Fecha inicio
                    </label>
                    <input
                      type="date"
                      value={newProject.startDate}
                      onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Fecha fin
                    </label>
                    <input
                      type="date"
                      value={newProject.endDate}
                      onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Presupuesto
                    </label>
                    <input
                      type="number"
                      value={newProject.budget}
                      onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Prioridad
                    </label>
                    <select
                      value={newProject.priority}
                      onChange={(e) => setNewProject({ ...newProject, priority: e.target.value as any })}
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Estado
                    </label>
                    <select
                      value={newProject.status}
                      onChange={(e) => setNewProject({ ...newProject, status: e.target.value as any })}
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {Object.entries(PROJECT_STATUS_CONFIG).map(([status, config]) => (
                        <option key={status} value={status}>
                          {config.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      URL de GitHub
                    </label>
                    <input
                      type="url"
                      value={newProject.githubUrl}
                      onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="https://github.com/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      URL en vivo
                    </label>
                    <input
                      type="url"
                      value={newProject.liveUrl}
                      onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 p-4 border-t border-gray-800">
                <button
                  onClick={() => setShowNewProject(false)}
                  className="px-4 py-2 text-gray-400 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddProject}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Crear proyecto
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}