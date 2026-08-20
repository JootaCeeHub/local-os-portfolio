import React, { useState, useCallback, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  MoreVertical,
  Clock,
  MapPin,
  Users,
  Link as LinkIcon,
  Bell,
  Repeat,
  Tag,
  Flag,
  X,
  Settings,
  Filter,
  Menu,
  Grid,
  List,
  ArrowLeft,
  Save,
  Trash2,
  Edit3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock4
} from 'lucide-react';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  isToday,
  parseISO,
  isWithinInterval,
  isBefore,
  isAfter,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { useCalendarStore, type CalendarEvent, type EventType } from '../store/calendar';

const EVENT_TYPES = [
  { id: 'meeting', label: 'Reunión', icon: <Users className="h-4 w-4" /> },
  { id: 'task', label: 'Tarea', icon: <CheckCircle className="h-4 w-4" /> },
  { id: 'reminder', label: 'Recordatorio', icon: <Bell className="h-4 w-4" /> },
  { id: 'deadline', label: 'Fecha límite', icon: <Clock className="h-4 w-4" /> },
  { id: 'personal', label: 'Personal', icon: <CalendarIcon className="h-4 w-4" /> },
  { id: 'other', label: 'Otro', icon: <Tag className="h-4 w-4" /> },
];

const PRIORITY_CONFIG = {
  low: { color: 'text-blue-400', bg: 'bg-blue-400/10', icon: Flag },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: Flag },
  high: { color: 'text-red-400', bg: 'bg-red-400/10', icon: Flag }
};

const STATUS_CONFIG = {
  pending: { color: 'text-gray-400', bg: 'bg-gray-400/10', label: 'Pendiente' },
  in_progress: { color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'En progreso' },
  completed: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', label: 'Completado' },
  cancelled: { color: 'text-red-400', bg: 'bg-red-400/10', label: 'Cancelado' }
};

export function Calendar() {
  const {
    events,
    view,
    categories,
    settings,
    addEvent,
    updateEvent,
    deleteEvent,
    setView,
    updateSettings
  } = useCalendarStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    allDay: false,
    type: 'meeting',
    priority: 'medium',
    status: 'pending',
  });

  // Navegación del calendario
  const navigateCalendar = useCallback((direction: 'prev' | 'next') => {
    if (view === 'month') {
      setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
    } else if (view === 'week') {
      setCurrentDate(direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
    } else {
      setCurrentDate(direction === 'prev' ? subDays(currentDate, 1) : addDays(currentDate, 1));
    }
  }, [view, currentDate]);

  // Obtener días del mes actual
  const days = useMemo(() => {
    const start = view === 'month'
      ? startOfMonth(currentDate)
      : view === 'week'
      ? startOfWeek(currentDate, { weekStartsOn: settings.firstDayOfWeek })
      : currentDate;

    const end = view === 'month'
      ? endOfMonth(currentDate)
      : view === 'week'
      ? endOfWeek(currentDate, { weekStartsOn: settings.firstDayOfWeek })
      : currentDate;

    return eachDayOfInterval({ start, end });
  }, [currentDate, view, settings.firstDayOfWeek]);

  // Filtrar eventos
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (selectedCategories.length > 0 && event.category && !selectedCategories.includes(event.category)) {
        return false;
      }

      const eventStart = parseISO(event.startDate);
      const eventEnd = parseISO(event.endDate);

      if (view === 'month') {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        return isWithinInterval(eventStart, { start: monthStart, end: monthEnd }) ||
               isWithinInterval(eventEnd, { start: monthStart, end: monthEnd });
      } else if (view === 'week') {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: settings.firstDayOfWeek });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: settings.firstDayOfWeek });
        return isWithinInterval(eventStart, { start: weekStart, end: weekEnd }) ||
               isWithinInterval(eventEnd, { start: weekStart, end: weekEnd });
      } else {
        return isSameDay(eventStart, currentDate) || isSameDay(eventEnd, currentDate);
      }
    });
  }, [events, currentDate, view, selectedCategories, settings.firstDayOfWeek]);

  // Agrupar eventos por día
  const eventsByDay = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    
    filteredEvents.forEach(event => {
      const dateKey = event.startDate.split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    return grouped;
  }, [filteredEvents]);

  const handleAddEvent = useCallback(() => {
    if (!newEvent.title || !newEvent.startDate || !newEvent.endDate) return;

    addEvent(newEvent as CalendarEvent);
    setNewEvent({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      allDay: false,
      type: 'meeting',
      priority: 'medium',
      status: 'pending',
    });
    setShowNewEvent(false);
  }, [newEvent, addEvent]);

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold">Calendario</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setView('month')}
              className={`p-2 rounded-lg transition-colors ${
                view === 'month' ? 'bg-gray-700' : 'hover:bg-gray-700'
              }`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setView('week')}
              className={`p-2 rounded-lg transition-colors ${
                view === 'week' ? 'bg-gray-700' : 'hover:bg-gray-700'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
            <button
              onClick={() => setView('day')}
              className={`p-2 rounded-lg transition-colors ${
                view === 'day' ? 'bg-gray-700' : 'hover:bg-gray-700'
              }`}
            >
              <Clock4 className="h-5 w-5" />
            </button>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Settings className="h-5 w-5" />
          </button>

          <button
            onClick={() => setShowNewEvent(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Nuevo evento</span>
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div
          className={`
            fixed inset-y-0 left-0 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out z-30
            lg:relative lg:translate-x-0
            ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div className="p-4">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-400">Categorías</h3>
                <button className="p-1 hover:bg-gray-800 rounded-lg transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                {categories.map(category => (
                  <label
                    key={category.id}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-800 rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategories([...selectedCategories, category.id]);
                        } else {
                          setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                        }
                      }}
                      className="rounded border-gray-700 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span>{category.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Mini Calendar */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => navigateCalendar('prev')}
                  className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="font-medium">
                  {format(currentDate, 'MMMM yyyy', { locale: es })}
                </span>
                <button
                  onClick={() => navigateCalendar('next')}
                  className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
                  <div key={day} className="text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {days.map((day) => {
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const hasEvents = eventsByDay[format(day, 'yyyy-MM-dd')]?.length > 0;

                  return (
                    <button
                      key={day.toString()}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        p-2 rounded-lg transition-colors relative
                        ${isCurrentMonth ? 'text-white' : 'text-gray-600'}
                        ${isSelected ? 'bg-emerald-600' : 'hover:bg-gray-700'}
                        ${isToday(day) ? 'font-bold' : ''}
                      `}
                    >
                      {format(day, 'd')}
                      {hasEvents && (
                        <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-emerald-400 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main Calendar */}
        <div className="flex-1 min-w-0">
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateCalendar('prev')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-medium">
                {format(currentDate, view === 'month' ? 'MMMM yyyy' : 'PP', { locale: es })}
              </h2>
              <button
                onClick={() => navigateCalendar('next')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Hoy
            </button>
          </div>

          {/* Calendar Grid */}
          {view === 'month' && (
            <div className="grid grid-cols-7 gap-px bg-gray-800">
              {/* Week days header */}
              {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-400">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {days.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayEvents = eventsByDay[dateKey] || [];
                const isCurrentMonth = isSameMonth(day, currentDate);

                return (
                  <div
                    key={day.toString()}
                    className={`min-h-[120px] p-2 bg-gray-900 ${
                      !isCurrentMonth ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm ${isToday(day) ? 'bg-emerald-600 px-2 py-1 rounded-full' : ''}`}>
                        {format(day, 'd')}
                      </span>
                      {isCurrentMonth && (
                        <button
                          onClick={() => {
                            setNewEvent(prev => ({
                              ...prev,
                              startDate: format(day, "yyyy-MM-dd'T'HH:mm"),
                              endDate: format(addDays(day, 1), "yyyy-MM-dd'T'HH:mm"),
                            }));
                            setShowNewEvent(true);
                          }}
                          className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <button
                          key={event.id}
                          onClick={() => setShowEventDetails(event.id)}
                          className={`
                            w-full text-left px-2 py-1 rounded text-xs truncate
                            ${event.category ? categories.find(c => c.id === event.category)?.color : 'bg-gray-800'}
                          `}
                        >
                          {event.title}
                        </button>
                      ))}
                      {dayEvents.length > 3 && (
                        <button className="w-full text-left px-2 py-1 text-xs text-gray-400">
                          +{dayEvents.length - 3} más
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Week View */}
          {view === 'week' && (
            <div className="grid grid-cols-7 gap-px bg-gray-800">
              {/* Time slots */}
              <div className="col-span-7 grid grid-cols-7">
                {Array.from({ length: 24 }).map((_, hour) => (
                  <React.Fragment key={hour}>
                    {Array.from({ length: 7 }).map((_, dayIndex) => {
                      const currentSlot = addDays(
                        startOfWeek(currentDate, { weekStartsOn: settings.firstDayOfWeek }),
                        dayIndex
                      );
                      const slotDate = format(currentSlot, 'yyyy-MM-dd');
                      const slotEvents = eventsByDay[slotDate]?.filter(event => {
                        const eventHour = new Date(event.startDate).getHours();
                        return eventHour === hour;
                      });

                      return (
                        <div
                          key={`${hour}-${dayIndex}`}
                          className="h-16 border-t border-gray-800 relative"
                        >
                          {hour === 0 && (
                            <div className="absolute top-0 left-0 w-full text-center text-sm text-gray-400 -mt-6">
                              {format(currentSlot, 'EEE d', { locale: es })}
                            </div>
                          )}
                          <div className="absolute left-0 -mt-3 ml-1 text-xs text-gray-500">
                            {`${hour.toString().padStart(2, '0')}:00`}
                          </div>
                          {slotEvents?.map(event => (
                            <button
                              key={event.id}
                              onClick={() => setShowEventDetails(event.id)}
                              className={`
                                absolute w-full px-2 py-1 text-xs truncate rounded
                                ${event.category ? categories.find(c => c.id === event.category)?.color : 'bg-gray-800'}
                              `}
                              style={{
                                top: '0.25rem',
                                height: 'calc(100% - 0.5rem)'
                              }}
                            >
                              {event.title}
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Day View */}
          {view === 'day' && (
            <div className="grid grid-cols-1">
              {Array.from({ length: 24 }).map((_, hour) => {
                const slotDate = format(currentDate, 'yyyy-MM-dd');
                const slotEvents = eventsByDay[slotDate]?.filter(event => {
                  const eventHour = new Date(event.startDate).getHours();
                  return eventHour === hour;
                });

                return (
                  <div
                    key={hour}
                    className="h-24 border-t border-gray-800 relative"
                  >
                    <div className="absolute left-0 -mt-3 ml-4 text-sm text-gray-500">
                      {`${hour.toString().padStart(2, '0')}:00`}
                    </div>
                    <div className="ml-16 h-full">
                      {slotEvents?.map(event => (
                        <button
                          key={event.id}
                          onClick={() => setShowEventDetails(event.id)}
                          className={`
                            absolute w-[calc(100%-4rem)] px-4 py-2 rounded-lg
                            ${event.category ? categories.find(c => c.id === event.category)?.color : 'bg-gray-800'}
                          `}
                          style={{
                            top: '0.25rem',
                            height: 'calc(100% - 0.5rem)'
                          }}
                        >
                          <div className="font-medium">{event.title}</div>
                          {event.description && (
                            <div className="text-sm text-gray-300 mt-1">{event.description}</div>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-sm">
                            {event.location && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>{event.location}</span>
                              </div>
                            )}
                            {event.attendees?.length > 0 && (
                              <div className="flex items-center space-x-1">
                                <Users className="h-4 w-4" />
                                <span>{event.attendees.length} asistentes</span>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* New Event Dialog */}
      {showNewEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h2 className="text-lg font-medium">Nuevo evento</h2>
              <button
                onClick={() => setShowNewEvent(false)}
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
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Título del evento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Descripción
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
                  placeholder="Descripción del evento"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Fecha inicio
                  </label>
                  <input
                    type="datetime-local"
                    value={newEvent.startDate}
                    onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Fecha fin
                  </label>
                  <input
                    type="datetime-local"
                    value={newEvent.endDate}
                    onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Tipo de evento
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {EVENT_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setNewEvent({ ...newEvent, type: type.id })}
                      className={`flex items-center justify-center space-x-2 p-2 rounded-lg transition-colors ${
                        newEvent.type === type.id ? 'bg-emerald-600' : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      {type.icon}
                      <span className="text-sm">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Categoría
                </label>
                <select
                  value={newEvent.category}
                  onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                  className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Sin categoría</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Prioridad
                </label>
                <div className="flex items-center space-x-4">
                  {['low', 'medium', 'high'].map((priority) => (
                    <button
                      key={priority}
                      onClick={() => setNewEvent({ ...newEvent, priority: priority as any })}
                      className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                        newEvent.priority === priority
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

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Recordatorio
                </label>
                <select
                  value={newEvent.reminder}
                  onChange={(e) => setNewEvent({ ...newEvent, reminder: parseInt(e.target.value) as any })}
                  className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Sin recordatorio</option>
                  <option value="5">5 minutos antes</option>
                  <option value="10">10 minutos antes</option>
                  <option value="15">15 minutos antes</option>
                  <option value="30">30 minutos antes</option>
                  <option value="60">1 hora antes</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allDay"
                  checked={newEvent.allDay}
                  onChange={( e) => setNewEvent({ ...newEvent, allDay: e.target.checked })}
                  className="rounded border-gray-700 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="allDay" className="text-sm">
                  Todo el día
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 p-4 border-t border-gray-800">
              <button
                onClick={() => setShowNewEvent(false)}
                className="px-4 py-2 text-gray-400 hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddEvent}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Crear evento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Dialog */}
      {showEventDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg w-full max-w-md">
            {(() => {
              const event = events.find(e => e.id === showEventDetails);
              if (!event) return null;

              return (
                <>
                  <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <h2 className="text-lg font-medium">{event.title}</h2>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setNewEvent(event);
                          setShowEventDetails(null);
                          setShowNewEvent(true);
                        }}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <Edit3 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setShowEventDetails(null)}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    {event.description && (
                      <p className="text-gray-300">{event.description}</p>
                    )}

                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>
                          {format(parseISO(event.startDate), 'PPp', { locale: es })}
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {event.category && (
                        <span
                          className="px-2 py-1 rounded-lg text-sm"
                          style={{
                            backgroundColor: categories.find(c => c.id === event.category)?.color,
                            color: 'white'
                          }}
                        >
                          {categories.find(c => c.id === event.category)?.name}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-lg text-sm ${
                        PRIORITY_CONFIG[event.priority].bg
                      }`}>
                        {event.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-lg text-sm ${
                        STATUS_CONFIG[event.status].bg
                      }`}>
                        {STATUS_CONFIG[event.status].label}
                      </span>
                    </div>

                    {event.url && (
                      <a
                        href={event.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300"
                      >
                        <LinkIcon className="h-4 w-4" />
                        <span>Enlace del evento</span>
                      </a>
                    )}

                    {event.attendees && event.attendees.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-2">
                          Asistentes
                        </h3>
                        <div className="space-y-2">
                          {event.attendees.map((attendee, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2 text-sm"
                            >
                              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                                {attendee[0].toUpperCase()}
                              </div>
                              <span>{attendee}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {event.recurring && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Repeat className="h-4 w-4 text-gray-400" />
                        <span>
                          Se repite cada {event.recurring.interval}{' '}
                          {event.recurring.frequency === 'daily' ? 'días' :
                           event.recurring.frequency === 'weekly' ? 'semanas' :
                           event.recurring.frequency === 'monthly' ? 'meses' : 'años'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end space-x-2 p-4 border-t border-gray-800">
                    <button
                      onClick={() => {
                        deleteEvent(event.id);
                        setShowEventDetails(null);
                      }}
                      className="px-4 py-2 text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      Eliminar
                    </button>
                    <button
                      onClick={() => setShowEventDetails(null)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Cerrar
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Settings Dialog */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h2 className="text-lg font-medium">Configuración</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Primer día de la semana
                </label>
                <select
                  value={settings.firstDayOfWeek}
                  onChange={(e) => updateSettings({ firstDayOfWeek: parseInt(e.target.value) as 0 | 1 })}
                  className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={1}>Lunes</option>
                  <option value={0}>Domingo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Vista predeterminada
                </label>
                <select
                  value={settings.defaultView}
                  onChange={(e) => updateSettings({ defaultView: e.target.value as any })}
                  className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="month">Mes</option>
                  <option value="week">Semana</option>
                  <option value="day">Día</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-sm font-medium text-gray-400">
                    Mostrar fines de semana
                  </span>
                  <span className="text-sm text-gray-500">
                    Incluir sábados y domingos
                  </span>
                </div>
                <button
                  onClick={() => updateSettings({ showWeekends: !settings.showWeekends })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.showWeekends ? 'bg-emerald-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.showWeekends ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-sm font-medium text-gray-400">
                    Mostrar números de semana
                  </span>
                  <span className="text-sm text-gray-500">
                    Mostrar el número de semana del año
                  </span>
                </div>
                <button
                  onClick={() => updateSettings({ showWeekNumbers: !settings.showWeekNumbers })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.showWeekNumbers ? 'bg-emerald-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.showWeekNumbers ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Horario laboral
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="time"
                      value={settings.workingHours.start}
                      onChange={(e) => updateSettings({
                        workingHours: { ...settings.workingHours, start: e.target.value }
                      })}
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <input
                      type="time"
                      value={settings.workingHours.end}
                      onChange={(e) => updateSettings({
                        workingHours: { ...settings.workingHours, end: e.target.value }
                      })}
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Duración predeterminada de eventos
                </label>
                <select
                  value={settings.defaultEventDuration}
                  onChange={(e) => updateSettings({ defaultEventDuration: parseInt(e.target.value) })}
                  className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="30">30 minutos</option>
                  <option value="60">1 hora</option>
                  <option value="90">1 hora 30 minutos</option>
                  <option value="120">2 horas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Recordatorio predeterminado
                </label>
                <select
                  value={settings.defaultReminder}
                  onChange={(e) => updateSettings({ defaultReminder: parseInt(e.target.value) as any })}
                  className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="5">5 minutos antes</option>
                  <option value="10">10 minutos antes</option>
                  <option value="15">15 minutos antes</option>
                  <option value="30">30 minutos antes</option>
                  <option value="60">1 hora antes</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 p-4 border-t border-gray-800">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-400 hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}