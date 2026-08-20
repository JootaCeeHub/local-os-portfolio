import React, { useState, useEffect } from 'react';
import {
  Bell,
  Settings,
  Archive,
  Trash2,
  Check,
  CheckCheck,
  Timer,
  Calendar,
  ListTodo,
  Trophy,
  Users,
  Info,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Filter,
  X,
  Volume2,
  VolumeX,
  BellOff,
} from 'lucide-react';
import { useNotificationsStore, type NotificationType, type NotificationCategory } from '../store/notifications';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const categoryIcons: Record<NotificationCategory, React.ReactNode> = {
  system: <Info className="h-5 w-5" />,
  pomodoro: <Timer className="h-5 w-5" />,
  tasks: <ListTodo className="h-5 w-5" />,
  calendar: <Calendar className="h-5 w-5" />,
  achievements: <Trophy className="h-5 w-5" />,
  social: <Users className="h-5 w-5" />,
};

const typeStyles: Record<NotificationType, { icon: React.ReactNode; bgColor: string }> = {
  info: { icon: <Info className="h-5 w-5" />, bgColor: 'bg-blue-500' },
  success: { icon: <Check className="h-5 w-5" />, bgColor: 'bg-emerald-500' },
  warning: { icon: <AlertTriangle className="h-5 w-5" />, bgColor: 'bg-amber-500' },
  error: { icon: <XCircle className="h-5 w-5" />, bgColor: 'bg-red-500' },
};

export function Notifications() {
  const {
    notifications,
    settings,
    unreadCount,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    clearAll,
    updateSettings,
    getFilteredNotifications,
  } = useNotificationsStore();

  const [showSettings, setShowSettings] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{
    category?: NotificationCategory;
    type?: NotificationType;
    isRead?: boolean;
    isArchived?: boolean;
  }>({});

  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    // Solicitar permiso para notificaciones push
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const filteredNotifications = getFilteredNotifications({
    ...activeFilters,
    isArchived: showArchived,
  });

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleArchive = (id: string) => {
    archiveNotification(id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta notificación?')) {
      deleteNotification(id);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar todas las notificaciones?')) {
      clearAll();
    }
  };

  const toggleFilter = (type: keyof typeof activeFilters, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [type]: prev[type] === value ? undefined : value,
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Bell className="h-6 w-6" />
          <h2 className="text-2xl font-semibold">Notificaciones</h2>
          {unreadCount > 0 && (
            <span className="px-2 py-1 bg-emerald-600 text-white text-sm rounded-full">
              {unreadCount} nuevas
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Filtros"
          >
            <Filter className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Configuración"
          >
            <Settings className="h-5 w-5" />
          </button>
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-red-400"
              title="Eliminar todas"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-6 bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Configuración de notificaciones</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="block font-medium">Notificaciones push</span>
                <span className="text-sm text-gray-400">Recibir notificaciones del sistema</span>
              </div>
              <button
                onClick={() => updateSettings({ pushEnabled: !settings.pushEnabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.pushEnabled ? 'bg-emerald-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.pushEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="block font-medium">Sonidos</span>
                <span className="text-sm text-gray-400">Reproducir sonidos de notificación</span>
              </div>
              <button
                onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.soundEnabled ? 'bg-emerald-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <h4 className="font-medium mb-3">Categorías</h4>
              <div className="space-y-3">
                {Object.entries(settings.categories).map(([category, enabled]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {categoryIcons[category as NotificationCategory]}
                      <span className="capitalize">{category}</span>
                    </div>
                    <button
                      onClick={() =>
                        updateSettings({
                          categories: {
                            ...settings.categories,
                            [category]: !enabled,
                          },
                        })
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        enabled ? 'bg-emerald-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6 bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Filtros</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Categorías</h4>
              <div className="flex flex-wrap gap-2">
                {Object.keys(settings.categories).map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleFilter('category', category)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors ${
                      activeFilters.category === category
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {categoryIcons[category as NotificationCategory]}
                    <span className="capitalize">{category}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Tipo</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(typeStyles).map(([type, { icon }]) => (
                  <button
                    key={type}
                    onClick={() => toggleFilter('type', type)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors ${
                      activeFilters.type === type
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {icon}
                    <span className="capitalize">{type}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Estado</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => toggleFilter('isRead', false)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors ${
                    activeFilters.isRead === false
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Bell className="h-5 w-5" />
                  <span>No leídas</span>
                </button>
                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors ${
                    showArchived
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Archive className="h-5 w-5" />
                  <span>Archivadas</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-gray-800 rounded-xl p-4 transition-all ${
                !notification.isRead ? 'border-l-4 border-emerald-500' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-lg ${typeStyles[notification.type].bgColor}`}>
                    {categoryIcons[notification.category]}
                  </div>
                  <div>
                    <h3 className="font-medium">{notification.title}</h3>
                    <p className="text-gray-400 mt-1">{notification.message}</p>
                    <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
                      <span>
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>
                      {notification.link && (
                        <a
                          href={notification.link}
                          className="text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          Ver más
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-emerald-400"
                      title="Marcar como leída"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                  )}
                  {!notification.isArchived && (
                    <button
                      onClick={() => handleArchive(notification.id)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Archivar"
                    >
                      <Archive className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-red-400"
                    title="Eliminar"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 mx-auto text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              No hay notificaciones
            </h3>
            <p className="text-gray-500">
              {showArchived
                ? 'No hay notificaciones archivadas'
                : 'No tienes notificaciones nuevas'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}