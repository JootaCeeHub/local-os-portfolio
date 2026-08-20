import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Eye,
  Share2,
  Calendar,
  Tag,
  Image,
  Video,
  Mic,
  Code,
  BookOpen,
  Globe,
  Users,
  Clock,
  TrendingUp,
  BarChart3,
  Settings,
  Menu,
  X,
  Save,
  Upload,
  Download,
  Copy,
  ExternalLink,
  Heart,
  MessageSquare,
  Star,
  Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContentStore } from '../store/content';
import { useFormValidation, commonSchemas } from '../hooks/useFormValidation';
import { FormField, Input, Textarea, Select, Button } from './ui/FormField';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { z } from 'zod';

const CONTENT_TYPES = {
  article: { name: 'Artículo', icon: FileText, color: '#10B981' },
  video: { name: 'Video', icon: Video, color: '#EF4444' },
  podcast: { name: 'Podcast', icon: Mic, color: '#8B5CF6' },
  image: { name: 'Imagen', icon: Image, color: '#F59E0B' },
  code: { name: 'Código', icon: Code, color: '#3B82F6' },
  tutorial: { name: 'Tutorial', icon: BookOpen, color: '#EC4899' }
};

const CONTENT_STATUS = {
  draft: { name: 'Borrador', color: 'text-gray-400', bg: 'bg-gray-400/10' },
  review: { name: 'En revisión', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  published: { name: 'Publicado', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  archived: { name: 'Archivado', color: 'text-red-400', bg: 'bg-red-400/10' }
};

const contentSchema = z.object({
  title: commonSchemas.required,
  description: z.string().optional(),
  type: z.enum(['article', 'video', 'podcast', 'image', 'code', 'tutorial']),
  content: commonSchemas.required,
  tags: z.array(z.string()).optional(),
  category: commonSchemas.required,
  publishDate: commonSchemas.date.optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  featured: z.boolean().optional()
});

export function Content() {
  const {
    content,
    categories,
    analytics,
    addContent,
    updateContent,
    deleteContent,
    addCategory,
    getContentAnalytics
  } = useContentStore();

  const [showNewContent, setShowNewContent] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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
    schema: contentSchema,
    onSubmit: async (data) => {
      addContent({
        ...data,
        status: 'draft',
        views: 0,
        likes: 0,
        shares: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      reset();
      setShowNewContent(false);
    },
    initialValues: {
      type: 'article',
      featured: false,
      tags: []
    }
  });

  const filteredContent = useMemo(() => {
    return content
      .filter(item => {
        if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (selectedType && item.type !== selectedType) return false;
        if (selectedStatus && item.status !== selectedStatus) return false;
        if (selectedCategory && item.category !== selectedCategory) return false;
        return true;
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [content, searchTerm, selectedType, selectedStatus, selectedCategory]);

  const stats = useMemo(() => {
    return {
      total: content.length,
      published: content.filter(c => c.status === 'published').length,
      draft: content.filter(c => c.status === 'draft').length,
      totalViews: content.reduce((sum, c) => sum + c.views, 0),
      totalLikes: content.reduce((sum, c) => sum + c.likes, 0),
      avgEngagement: content.length > 0 
        ? content.reduce((sum, c) => sum + (c.likes / Math.max(c.views, 1)), 0) / content.length * 100
        : 0
    };
  }, [content]);

  const ContentCard = ({ item }: { item: any }) => {
    const ContentIcon = CONTENT_TYPES[item.type as keyof typeof CONTENT_TYPES].icon;
    const statusConfig = CONTENT_STATUS[item.status as keyof typeof CONTENT_STATUS];

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="card card-hover group"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${CONTENT_TYPES[item.type as keyof typeof CONTENT_TYPES].color}20` }}
            >
              <ContentIcon 
                className="h-5 w-5" 
                style={{ color: CONTENT_TYPES[item.type as keyof typeof CONTENT_TYPES].color }}
              />
            </div>
            <div>
              <h3 className="font-medium text-white line-clamp-2">{item.title}</h3>
              <p className="text-sm text-gray-400 mt-1 line-clamp-2">{item.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setSelectedContent(item.id)}
              className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button className="p-1 hover:bg-gray-700 rounded-lg transition-colors">
              <Edit3 className="h-4 w-4" />
            </button>
            <button 
              onClick={() => deleteContent(item.id)}
              className="p-1 hover:bg-gray-700 rounded-lg transition-colors text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Status and Metadata */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-lg text-xs ${statusConfig.bg} ${statusConfig.color}`}>
              {statusConfig.name}
            </span>
            {item.featured && (
              <Star className="h-4 w-4 text-yellow-400" />
            )}
          </div>
          <span className="text-xs text-gray-500">
            {format(new Date(item.updatedAt), 'dd MMM yyyy', { locale: es })}
          </span>
        </div>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {item.tags.slice(0, 3).map((tag: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-700 text-xs rounded-lg"
              >
                #{tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-700 text-xs rounded-lg">
                +{item.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Analytics */}
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{item.views}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span>{item.likes}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Share2 className="h-4 w-4" />
              <span>{item.shares}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="hover:text-white transition-colors">
              <Share2 className="h-4 w-4" />
            </button>
            <button className="hover:text-white transition-colors">
              <Bookmark className="h-4 w-4" />
            </button>
          </div>
        </div>
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
            <FileText className="h-6 w-6 text-[var(--primary-500)]" />
            <h1 className="text-xl font-semibold">Contenido</h1>
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
            onClick={() => setShowAnalytics(!showAnalytics)}
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
            onClick={() => setShowNewContent(true)}
            variant="primary"
            icon={<Plus className="h-5 w-5" />}
          >
            <span className="hidden sm:inline">Nuevo contenido</span>
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
                        <FileText className="h-4 w-4 text-[var(--primary-500)]" />
                        <span className="text-xs text-gray-400">Total</span>
                      </div>
                      <div className="text-lg font-medium">{stats.total}</div>
                    </div>
                    <div className="bg-[var(--dark-bg-tertiary)] rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Globe className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs text-gray-400">Publicado</span>
                      </div>
                      <div className="text-lg font-medium text-emerald-400">{stats.published}</div>
                    </div>
                    <div className="bg-[var(--dark-bg-tertiary)] rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Eye className="h-4 w-4 text-blue-400" />
                        <span className="text-xs text-gray-400">Vistas</span>
                      </div>
                      <div className="text-lg font-medium text-blue-400">{stats.totalViews}</div>
                    </div>
                    <div className="bg-[var(--dark-bg-tertiary)] rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Heart className="h-4 w-4 text-red-400" />
                        <span className="text-xs text-gray-400">Likes</span>
                      </div>
                      <div className="text-lg font-medium text-red-400">{stats.totalLikes}</div>
                    </div>
                  </div>
                </div>

                {/* Content Types */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Tipos de contenido</h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedType(null)}
                      className={`nav-item w-full ${
                        !selectedType ? 'nav-item-active' : ''
                      }`}
                    >
                      <FileText className="h-5 w-5" />
                      <span>Todos</span>
                      <span className="ml-auto text-gray-500">{content.length}</span>
                    </button>
                    {Object.entries(CONTENT_TYPES).map(([key, type]) => {
                      const Icon = type.icon;
                      const count = content.filter(c => c.type === key).length;
                      return (
                        <button
                          key={key}
                          onClick={() => setSelectedType(key)}
                          className={`nav-item w-full ${
                            selectedType === key ? 'nav-item-active' : ''
                          }`}
                        >
                          <Icon className="h-5 w-5" style={{ color: type.color }} />
                          <span>{type.name}</span>
                          <span className="ml-auto text-gray-500">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Categorías</h3>
                  <div className="space-y-1">
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`nav-item w-full ${
                          selectedCategory === category.id ? 'nav-item-active' : ''
                        }`}
                      >
                        <Tag className="h-5 w-5" />
                        <span>{category.name}</span>
                        <span className="ml-auto text-gray-500">
                          {content.filter(c => c.category === category.id).length}
                        </span>
                      </button>
                    ))}
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
                  placeholder="Buscar contenido..."
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
                  ...Object.entries(CONTENT_STATUS).map(([key, status]) => ({
                    value: key,
                    label: status.name
                  }))
                ]}
              />
            </div>
          </div>

          {/* Content Grid */}
          <div className="p-4">
            {filteredContent.length > 0 ? (
              <motion.div
                layout
                className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
                }
              >
                <AnimatePresence>
                  {filteredContent.map((item) => (
                    <ContentCard key={item.id} item={item} />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <FileText className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  No hay contenido
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm
                    ? 'No se encontró contenido que coincida con tu búsqueda'
                    : 'Crea tu primer contenido para comenzar'}
                </p>
                <Button
                  onClick={() => setShowNewContent(true)}
                  variant="primary"
                  icon={<Plus className="h-5 w-5" />}
                >
                  Crear contenido
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Analytics Panel */}
        <AnimatePresence>
          {showAnalytics && (
            <motion.div
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-[var(--dark-bg-secondary)] p-4 overflow-y-auto z-40"
            >
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setShowAnalytics(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
                <h2 className="text-lg font-medium">Análisis de contenido</h2>
                <div className="w-6" />
              </div>

              {/* Performance Overview */}
              <div className="card mb-6">
                <h3 className="text-lg font-medium mb-4">Rendimiento general</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">Engagement promedio</span>
                      <span className="text-xl font-medium text-emerald-400">
                        {stats.avgEngagement.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                        style={{ width: `${Math.min(stats.avgEngagement, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-medium">{stats.totalViews}</div>
                      <div className="text-sm text-gray-400">Vistas totales</div>
                    </div>
                    <div>
                      <div className="text-2xl font-medium">{stats.totalLikes}</div>
                      <div className="text-sm text-gray-400">Likes totales</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Content */}
              <div className="card mb-6">
                <h3 className="text-lg font-medium mb-4">Contenido destacado</h3>
                <div className="space-y-3">
                  {content
                    .sort((a, b) => b.views - a.views)
                    .slice(0, 5)
                    .map((item, index) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <div className="text-sm font-medium text-gray-400">
                          #{index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{item.title}</div>
                          <div className="text-xs text-gray-400">
                            {item.views} vistas • {item.likes} likes
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Content Distribution */}
              <div className="card">
                <h3 className="text-lg font-medium mb-4">Distribución por tipo</h3>
                <div className="space-y-3">
                  {Object.entries(CONTENT_TYPES).map(([key, type]) => {
                    const count = content.filter(c => c.type === key).length;
                    const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    const Icon = type.icon;

                    if (count === 0) return null;

                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Icon className="h-4 w-4" style={{ color: type.color }} />
                            <span className="text-sm text-gray-400">{type.name}</span>
                          </div>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full"
                            style={{
                              backgroundColor: type.color,
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

        {/* New Content Dialog */}
        <AnimatePresence>
          {showNewContent && (
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
                className="bg-[var(--dark-bg-secondary)] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between p-4 border-b border-[var(--dark-border)]">
                  <h2 className="text-lg font-medium">Nuevo contenido</h2>
                  <button
                    onClick={() => setShowNewContent(false)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      label="Título"
                      required
                      error={getFieldError('title')}
                    >
                      <Input
                        value={values.title || ''}
                        onChange={(e) => setValue('title', e.target.value)}
                        placeholder="Título del contenido"
                        error={hasFieldError('title')}
                      />
                    </FormField>

                    <FormField
                      label="Tipo de contenido"
                      required
                      error={getFieldError('type')}
                    >
                      <Select
                        value={values.type || 'article'}
                        onChange={(e) => setValue('type', e.target.value)}
                        options={Object.entries(CONTENT_TYPES).map(([key, type]) => ({
                          value: key,
                          label: type.name
                        }))}
                        error={hasFieldError('type')}
                      />
                    </FormField>
                  </div>

                  <FormField
                    label="Descripción"
                    description="Breve descripción del contenido"
                    error={getFieldError('description')}
                  >
                    <Textarea
                      value={values.description || ''}
                      onChange={(e) => setValue('description', e.target.value)}
                      placeholder="Describe tu contenido..."
                      error={hasFieldError('description')}
                    />
                  </FormField>

                  <FormField
                    label="Contenido"
                    required
                    error={getFieldError('content')}
                  >
                    <Textarea
                      value={values.content || ''}
                      onChange={(e) => setValue('content', e.target.value)}
                      placeholder="Escribe tu contenido aquí..."
                      className="min-h-[300px]"
                      error={hasFieldError('content')}
                    />
                  </FormField>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      label="Categoría"
                      required
                      error={getFieldError('category')}
                    >
                      <Select
                        value={values.category || ''}
                        onChange={(e) => setValue('category', e.target.value)}
                        options={categories.map(cat => ({
                          value: cat.id,
                          label: cat.name
                        }))}
                        placeholder="Seleccionar categoría"
                        error={hasFieldError('category')}
                      />
                    </FormField>

                    <FormField
                      label="Fecha de publicación"
                      description="Opcional - programar publicación"
                      error={getFieldError('publishDate')}
                    >
                      <Input
                        type="datetime-local"
                        value={values.publishDate || ''}
                        onChange={(e) => setValue('publishDate', e.target.value)}
                        error={hasFieldError('publishDate')}
                      />
                    </FormField>
                  </div>

                  {/* SEO Section */}
                  <div className="border-t border-[var(--dark-border)] pt-6">
                    <h3 className="text-lg font-medium mb-4">SEO</h3>
                    <div className="space-y-4">
                      <FormField
                        label="Título SEO"
                        description="Título optimizado para motores de búsqueda"
                        error={getFieldError('seoTitle')}
                      >
                        <Input
                          value={values.seoTitle || ''}
                          onChange={(e) => setValue('seoTitle', e.target.value)}
                          placeholder="Título SEO..."
                          error={hasFieldError('seoTitle')}
                        />
                      </FormField>

                      <FormField
                        label="Descripción SEO"
                        description="Meta descripción para motores de búsqueda"
                        error={getFieldError('seoDescription')}
                      >
                        <Textarea
                          value={values.seoDescription || ''}
                          onChange={(e) => setValue('seoDescription', e.target.value)}
                          placeholder="Descripción SEO..."
                          rows={3}
                          error={hasFieldError('seoDescription')}
                        />
                      </FormField>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={values.featured || false}
                        onChange={(e) => setValue('featured', e.target.checked)}
                        className="rounded border-gray-600 text-[var(--primary-500)] focus:ring-[var(--primary-500)]"
                      />
                      <label htmlFor="featured" className="text-sm text-gray-300">
                        Contenido destacado
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-4 pt-6 border-t border-[var(--dark-border)]">
                    <Button
                      type="button"
                      onClick={() => setShowNewContent(false)}
                      variant="ghost"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                    >
                      Guardar borrador
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      loading={isSubmitting}
                      icon={<Save className="h-5 w-5" />}
                    >
                      Crear contenido
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