import React, { useState } from 'react';
import {
  LayoutDashboard,
  Wallet,
  LineChart,
  Calendar,
  ClipboardList,
  Timer,
  FileText,
  Settings,
  Menu,
  X,
  Star,
  Clock,
  Users,
  Trophy,
  ShoppingBag,
  Trees as Tree,
  Bell,
  Briefcase,
  BookOpen,
  Target,
  BarChart2,
  Coffee,
  Palette,
  Globe,
  MessageSquare,
  HelpCircle,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  onModuleChange: (moduleId: string) => void;
}

const menuItems = [
  { id: 'dashboard', title: 'Dashboard', icon: LayoutDashboard },
  { id: 'projects', title: 'Proyectos', icon: Briefcase },
  { id: 'finances', title: 'Finanzas', icon: Wallet },
  { id: 'trading', title: 'Trading', icon: LineChart },
  { id: 'tasks', title: 'Tareas', icon: ClipboardList },
  { id: 'calendar', title: 'Calendario', icon: Calendar },
  { id: 'pomodoro', title: 'Pomodoro', icon: Timer },
  { id: 'learning', title: 'Aprendizaje', icon: BookOpen },
  { id: 'goals', title: 'Objetivos', icon: Target },
  { id: 'analytics', title: 'Análisis', icon: BarChart2 },
  { id: 'content', title: 'Contenido', icon: FileText },
  { id: 'achievements', title: 'Logros', icon: Trophy },
  { id: 'forest', title: 'Bosque', icon: Tree },
  { id: 'wellness', title: 'Bienestar', icon: Coffee },
  { id: 'design', title: 'Diseño', icon: Palette },
  { id: 'network', title: 'Red', icon: Globe },
];

const bottomMenuItems = [
  { id: 'notifications', title: 'Notificaciones', icon: Bell },
  { id: 'messages', title: 'Mensajes', icon: MessageSquare },
  { id: 'profile', title: 'Perfil', icon: Users },
  { id: 'help', title: 'Ayuda', icon: HelpCircle },
  { id: 'settings', title: 'Ajustes', icon: Settings },
];

export function Sidebar({ activeModule, onModuleChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showFavorites, setShowFavorites] = useState(true);
  const [showRecent, setShowRecent] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800/50 backdrop-blur-sm text-white rounded-lg hover:bg-gray-700 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static top-0 left-0 h-full w-72 bg-gray-900/50 backdrop-blur-md text-white p-4 transition-transform duration-300 ease-in-out z-40 flex flex-col border-r border-gray-800/50`}
      >
        <div className="flex items-center justify-center mb-8 pt-4">
          <h1 className="text-2xl font-bold text-gradient">
            Personal Hub
          </h1>
        </div>

        {/* Search */}
        <div className="px-3 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full bg-gray-800/50 text-white rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 border border-gray-700/50"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-gray-400 bg-gray-700/50 rounded">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Favoritos */}
        <div className="mb-6">
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className="flex items-center justify-between w-full text-gray-400 mb-3 px-4 group"
          >
            <div className="flex items-center space-x-2">
              <Star size={16} className="group-hover:text-yellow-400 transition-colors" />
              <span className="text-sm group-hover:text-white transition-colors">Favoritos</span>
            </div>
            <ChevronRight
              size={16}
              className={`transform transition-transform ${showFavorites ? 'rotate-90' : ''}`}
            />
          </button>
          {showFavorites && (
            <div className="space-y-1">
              {['Personal', 'Trabajo', 'Proyectos'].map((item) => (
                <button
                  key={item}
                  className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-300 hover:bg-teal-600/10 hover:text-teal-500 transition-all duration-200"
                >
                  <span>{item}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onModuleChange(item.id);
                  if (isOpen) setIsOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 group ${
                  activeModule === item.id
                    ? 'nav-item-active'
                    : 'nav-item'
                }`}
              >
                <Icon size={20} />
                <span>{item.title}</span>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-1 h-1 bg-primary-400 rounded-full"></div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Menu */}
        <div className="mt-auto pt-4 border-t border-gray-800/50 space-y-1">
          {bottomMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onModuleChange(item.id);
                  if (isOpen) setIsOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 group ${
                  activeModule === item.id
                    ? 'nav-item-active'
                    : 'nav-item'
                }`}
              >
                <Icon size={20} />
                <span>{item.title}</span>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-1 h-1 bg-primary-400 rounded-full"></div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}