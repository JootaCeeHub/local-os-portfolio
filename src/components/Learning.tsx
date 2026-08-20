import React, { useState, useCallback } from 'react';
import { BookOpen, Play, Pause, CheckCircle, Clock, Star, Award, Target, TrendingUp, Calendar, Filter, Search, Plus, MoreVertical, Edit3, Trash2, Download, Upload, FileText, Video, Headphones, Image, Link as LinkIcon, Users, MessageSquare, ThumbsUp, Share2, Bookmark, BookmarkCheck, Cross as Progress, Menu, X, Save, ArrowLeft, ChevronRight, GraduationCap, Brain, Lightbulb, Zap } from 'lucide-react';
import { useLearningStore } from '../store/learning';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

const CONTENT_TYPES = {
  course: { icon: BookOpen, label: 'Curso', color: 'text-blue-400' },
  video: { icon: Video, label: 'Video', color: 'text-red-400' },
  article: { icon: FileText, label: 'Artículo', color: 'text-emerald-400' },
  podcast: { icon: Headphones, label: 'Podcast', color: 'text-purple-400' },
  book: { icon: BookOpen, label: 'Libro', color: 'text-amber-400' }
};

const DIFFICULTY_LEVELS = {
  beginner: { label: 'Principiante', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  intermediate: { label: 'Intermedio', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  advanced: { label: 'Avanzado', color: 'text-red-400', bg: 'bg-red-400/10' }
};

export function Learning() {
  const {
    courses,
    progress,
    achievements,
    goals,
    addCourse,
    updateCourse,
    deleteCourse,
    updateProgress,
    addAchievement,
    addGoal,
    updateGoal
  } = useLearningStore();

  const [showNewCourse, setShowNewCourse] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'courses' | 'progress' | 'achievements' | 'goals'>('courses');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    instructor: '',
    category: '',
    difficulty: 'beginner' as const,
    duration: '',
    type: 'course' as keyof typeof CONTENT_TYPES,
    url: '',
    imageUrl: '',
    price: ''
  });

  const categories = [
    'Programación',
    'Diseño',
    'Marketing',
    'Negocios',
    'Idiomas',
    'Ciencias',
    'Arte',
    'Música',
    'Desarrollo Personal'
  ];

  const filteredCourses = courses
    .filter(course => {
      if (searchTerm && !course.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (selectedCategory && course.category !== selectedCategory) return false;
      if (selectedDifficulty && course.difficulty !== selectedDifficulty) return false;
      if (selectedStatus && course.status !== selectedStatus) return false;
      return true;
    })
    .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime());

  const handleAddCourse = useCallback(() => {
    if (!newCourse.title || !newCourse.category) return;

    addCourse({
      ...newCourse,
      duration: parseInt(newCourse.duration) || 0,
      price: parseFloat(newCourse.price) || 0,
      status: 'not_started',
      enrolledAt: new Date().toISOString(),
      completedAt: null,
      rating: 0,
      tags: []
    });

    setNewCourse({
      title: '',
      description: '',
      instructor: '',
      category: '',
      difficulty: 'beginner',
      duration: '',
      type: 'course',
      url: '',
      imageUrl: '',
      price: ''
    });

    setShowNewCourse(false);
  }, [newCourse, addCourse]);

  const getCourseProgress = useCallback((courseId: string) => {
    const courseProgress = progress.find(p => p.courseId === courseId);
    return courseProgress ? (courseProgress.completedLessons / courseProgress.totalLessons) * 100 : 0;
  }, [progress]);

  const stats = {
    totalCourses: courses.length,
    completed: courses.filter(c => c.status === 'completed').length,
    inProgress: courses.filter(c => c.status === 'in_progress').length,
    totalHours: courses.reduce((sum, c) => sum + c.duration, 0),
    achievements: achievements.length,
    streak: 7, // Días consecutivos de estudio
    avgRating: courses.filter(c => c.rating > 0).reduce((sum, c) => sum + c.rating, 0) / courses.filter(c => c.rating > 0).length || 0
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
          <h1 className="text-xl font-semibold">Aprendizaje</h1>
        </div>
        <div className="flex items-center space-x-2">
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
          <button
            onClick={() => setShowNewCourse(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Agregar curso</span>
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
              <div className="space-y-3">
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Cursos totales</span>
                    <BookOpen className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="text-lg font-medium">{stats.totalCourses}</div>
                </div>

                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Completados</span>
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="text-lg font-medium text-emerald-400">{stats.completed}</div>
                </div>

                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Horas totales</span>
                    <Clock className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="text-lg font-medium">{stats.totalHours}h</div>
                </div>

                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Racha actual</span>
                    <Zap className="h-4 w-4 text-yellow-400" />
                  </div>
                  <div className="text-lg font-medium text-yellow-400">{stats.streak} días</div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="mb-6">
              <div className="space-y-1">
                {[
                  { id: 'courses', label: 'Cursos', icon: BookOpen },
                  { id: 'progress', label: 'Progreso', icon: Progress },
                  { id: 'achievements', label: 'Logros', icon: Award },
                  { id: 'goals', label: 'Objetivos', icon: Target }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                        activeTab === tab.id ? 'bg-gray-800' : 'hover:bg-gray-800'
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
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    !selectedCategory ? 'bg-gray-800' : 'hover:bg-gray-800'
                  }`}
                >
                  <BookOpen className="h-5 w-5 text-gray-400" />
                  <span>Todas</span>
                  <span className="ml-auto text-gray-500">{courses.length}</span>
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category ? 'bg-gray-800' : 'hover:bg-gray-800'
                    }`}
                  >
                    <Brain className="h-5 w-5 text-gray-400" />
                    <span>{category}</span>
                    <span className="ml-auto text-gray-500">
                      {courses.filter(c => c.category === category).length}
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
                  placeholder="Buscar cursos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <select
                value={selectedDifficulty || ''}
                onChange={(e) => setSelectedDifficulty(e.target.value || null)}
                className="bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Todas las dificultades</option>
                {Object.entries(DIFFICULTY_LEVELS).map(([key, level]) => (
                  <option key={key} value={key}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Content based on active tab */}
          <div className="p-4">
            {activeTab === 'courses' && (
              <div>
                {filteredCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => {
                      const ContentIcon = CONTENT_TYPES[course.type].icon;
                      const progressPercent = getCourseProgress(course.id);
                      
                      return (
                        <div
                          key={course.id}
                          className="group bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors"
                        >
                          {course.imageUrl ? (
                            <img
                              src={course.imageUrl}
                              alt={course.title}
                              className="w-full h-48 object-cover"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
                              <ContentIcon className="h-12 w-12 text-gray-500" />
                            </div>
                          )}
                          
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-medium text-white line-clamp-2">{course.title}</h3>
                                <p className="text-sm text-gray-400">{course.instructor}</p>
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1 hover:bg-gray-600 rounded-lg transition-colors">
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{course.description}</p>

                            <div className="flex items-center space-x-2 mb-3">
                              <span className={`px-2 py-1 rounded-lg text-xs ${
                                CONTENT_TYPES[course.type].color
                              } bg-gray-700`}>
                                {CONTENT_TYPES[course.type].label}
                              </span>
                              <span className={`px-2 py-1 rounded-lg text-xs ${
                                DIFFICULTY_LEVELS[course.difficulty].bg
                              } ${DIFFICULTY_LEVELS[course.difficulty].color}`}>
                                {DIFFICULTY_LEVELS[course.difficulty].label}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{course.duration}h</span>
                              </div>
                              {course.rating > 0 && (
                                <div className="flex items-center space-x-1">
                                  <Star className="h-4 w-4 text-yellow-400" />
                                  <span>{course.rating.toFixed(1)}</span>
                                </div>
                              )}
                            </div>

                            {/* Progress Bar */}
                            {course.status !== 'not_started' && (
                              <div className="mb-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-gray-400">Progreso</span>
                                  <span className="text-sm font-medium">{progressPercent.toFixed(0)}%</span>
                                </div>
                                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-500 transition-all duration-300"
                                    style={{ width: `${progressPercent}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            <div className="flex items-center space-x-2">
                              {course.status === 'not_started' ? (
                                <button
                                  onClick={() => updateCourse(course.id, { status: 'in_progress' })}
                                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                >
                                  <Play className="h-4 w-4" />
                                  <span>Comenzar</span>
                                </button>
                              ) : course.status === 'completed' ? (
                                <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-gray-700 text-emerald-400 rounded-lg">
                                  <CheckCircle className="h-4 w-4" />
                                  <span>Completado</span>
                                </button>
                              ) : (
                                <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                  <Play className="h-4 w-4" />
                                  <span>Continuar</span>
                                </button>
                              )}
                              
                              {course.url && (
                                <a
                                  href={course.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                                >
                                  <LinkIcon className="h-4 w-4" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-300 mb-2">
                      No hay cursos
                    </h3>
                    <p className="text-gray-500">
                      {searchTerm
                        ? 'No se encontraron cursos que coincidan con tu búsqueda'
                        : 'Haz clic en "Agregar curso" para comenzar tu aprendizaje'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'progress' && (
              <div className="space-y-6">
                {progress.length > 0 ? (
                  progress.map((courseProgress) => {
                    const course = courses.find(c => c.id === courseProgress.courseId);
                    if (!course) return null;

                    const progressPercent = (courseProgress.completedLessons / courseProgress.totalLessons) * 100;

                    return (
                      <div key={courseProgress.id} className="bg-gray-800 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-medium text-white">{course.title}</h3>
                            <p className="text-sm text-gray-400">{course.instructor}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-lg text-xs ${
                            course.status === 'completed' ? 'bg-emerald-400/10 text-emerald-400' :
                            course.status === 'in_progress' ? 'bg-blue-400/10 text-blue-400' :
                            'bg-gray-400/10 text-gray-400'
                          }`}>
                            {course.status === 'completed' ? 'Completado' :
                             course.status === 'in_progress' ? 'En progreso' : 'No iniciado'}
                          </span>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">
                              {courseProgress.completedLessons} de {courseProgress.totalLessons} lecciones
                            </span>
                            <span className="text-sm font-medium">{progressPercent.toFixed(0)}%</span>
                          </div>
                          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 transition-all duration-300"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{courseProgress.timeSpent}h estudiadas</span>
                            </div>
                            {courseProgress.lastAccessed && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  Último acceso: {format(new Date(courseProgress.lastAccessed), 'dd MMM', { locale: es })}
                                </span>
                              </div>
                            )}
                          </div>
                          <button className="text-emerald-400 hover:text-emerald-300 transition-colors">
                            Continuar
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <Progress className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-300 mb-2">
                      Sin progreso registrado
                    </h3>
                    <p className="text-gray-500">
                      Comienza un curso para ver tu progreso aquí
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'achievements' && (
              <div>
                {achievements.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="bg-gray-800 rounded-lg p-6 text-center"
                      >
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Award className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="font-medium text-white mb-2">{achievement.title}</h3>
                        <p className="text-sm text-gray-400 mb-3">{achievement.description}</p>
                        <div className="text-xs text-gray-500">
                          Obtenido el {format(new Date(achievement.unlockedAt), 'dd MMM yyyy', { locale: es })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Award className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-300 mb-2">
                      Sin logros aún
                    </h3>
                    <p className="text-gray-500">
                      Completa cursos y alcanza objetivos para desbloquear logros
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'goals' && (
              <div>
                {goals.length > 0 ? (
                  <div className="space-y-4">
                    {goals.map((goal) => {
                      const progressPercent = (goal.currentValue / goal.targetValue) * 100;
                      const daysLeft = goal.deadline ? differenceInDays(new Date(goal.deadline), new Date()) : null;

                      return (
                        <div
                          key={goal.id}
                          className="bg-gray-800 rounded-lg p-6"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-medium text-white">{goal.title}</h3>
                              <p className="text-sm text-gray-400">{goal.description}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-lg text-xs ${
                              goal.status === 'completed' ? 'bg-emerald-400/10 text-emerald-400' :
                              goal.status === 'in_progress' ? 'bg-blue-400/10 text-blue-400' :
                              'bg-gray-400/10 text-gray-400'
                            }`}>
                              {goal.status === 'completed' ? 'Completado' :
                               goal.status === 'in_progress' ? 'En progreso' : 'Pendiente'}
                            </span>
                          </div>

                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-400">
                                {goal.currentValue} de {goal.targetValue} {goal.unit}
                              </span>
                              <span className="text-sm font-medium">{progressPercent.toFixed(0)}%</span>
                            </div>
                            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 transition-all duration-300"
                                style={{ width: `${Math.min(progressPercent, 100)}%` }}
                              />
                            </div>
                          </div>

                          {goal.deadline && (
                            <div className="flex items-center justify-between text-sm text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  Fecha límite: {format(new Date(goal.deadline), 'dd MMM yyyy', { locale: es })}
                                </span>
                              </div>
                              {daysLeft !== null && (
                                <span className={daysLeft < 7 ? 'text-red-400' : 'text-gray-400'}>
                                  {daysLeft > 0 ? `${daysLeft} días restantes` : 'Vencido'}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Target className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-300 mb-2">
                      Sin objetivos definidos
                    </h3>
                    <p className="text-gray-500">
                      Establece objetivos de aprendizaje para mantenerte motivado
                    </p>
                  </div>
                )}
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

            {/* Learning Overview */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium mb-4">Resumen de aprendizaje</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Cursos completados</span>
                  <span className="text-xl font-medium text-emerald-400">{stats.completed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Horas estudiadas</span>
                  <span className="text-xl font-medium">{stats.totalHours}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Racha actual</span>
                  <span className="text-xl font-medium text-yellow-400">{stats.streak} días</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Calificación promedio</span>
                  <span className="text-xl font-medium text-blue-400">
                    {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress by Category */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium mb-4">Progreso por categoría</h3>
              <div className="space-y-4">
                {categories.map(category => {
                  const categoryCourses = courses.filter(c => c.category === category);
                  const completedInCategory = categoryCourses.filter(c => c.status === 'completed').length;
                  const percentage = categoryCourses.length > 0 
                    ? (completedInCategory / categoryCourses.length) * 100 
                    : 0;

                  if (categoryCourses.length === 0) return null;

                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">{category}</span>
                        <span className="text-sm font-medium">
                          {completedInCategory}/{categoryCourses.length}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Logros recientes</h3>
              {achievements.slice(0, 3).map((achievement) => (
                <div key={achievement.id} className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Award className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{achievement.title}</div>
                    <div className="text-xs text-gray-400">
                      {format(new Date(achievement.unlockedAt), 'dd MMM', { locale: es })}
                    </div>
                  </div>
                </div>
              ))}
              {achievements.length === 0 && (
                <p className="text-gray-500 text-sm">No hay logros aún</p>
              )}
            </div>
          </div>
        )}

        {/* New Course Dialog */}
        {showNewCourse && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <h2 className="text-lg font-medium">Agregar curso</h2>
                <button
                  onClick={() => setShowNewCourse(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Título del curso
                    </label>
                    <input
                      type="text"
                      value={newCourse.title}
                      onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Nombre del curso"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Instructor
                    </label>
                    <input
                      type="text"
                      value={newCourse.instructor}
                      onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Nombre del instructor"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
                    placeholder="Describe el curso..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Categoría
                    </label>
                    <select
                      value={newCourse.category}
                      onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Seleccionar categoría</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Dificultad
                    </label>
                    <select
                      value={newCourse.difficulty}
                      onChange={(e) => setNewCourse({ ...newCourse, difficulty: e.target.value as any })}
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {Object.entries(DIFFICULTY_LEVELS).map(([key, level]) => (
                        <option key={key} value={key}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Tipo
                    </label>
                    <select
                      value={newCourse.type}
                      onChange={(e) => setNewCourse({ ...newCourse, type: e.target.value as any })}
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {Object.entries(CONTENT_TYPES).map(([key, type]) => (
                        <option key={key} value={key}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Duración (horas)
                    </label>
                    <input
                      type="number"
                      value={newCourse.duration}
                      onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Precio
                    </label>
                    <input
                      type="number"
                      value={newCourse.price}
                      onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })}
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      URL del curso
                    </label>
                    <input
                      type="url"
                      value={newCourse.url}
                      onChange={(e) => setNewCourse({ ...newCourse, url: e.target.value })}
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      URL de imagen
                    </label>
                    <input
                      type="url"
                      value={newCourse.imageUrl}
                      onChange={(e) => setNewCourse({ ...newCourse, imageUrl: e.target.value })}
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 p-4 border-t border-gray-800">
                <button
                  onClick={() => setShowNewCourse(false)}
                  className="px-4 py-2 text-gray-400 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                
                <button
                  onClick={handleAddCourse}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Agregar curso
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}