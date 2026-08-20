import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart,
  Activity,
  Calendar,
  Clock,
  Target,
  Users,
  Zap,
  Award,
  DollarSign,
  BookOpen,
  Timer,
  CheckCircle,
  AlertCircle,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Menu,
  ArrowLeft,
  Settings
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

// Mock data - in a real app, this would come from your stores
const generateMockData = () => {
  const dates = Array.from({ length: 30 }, (_, i) => 
    format(subDays(new Date(), i), 'yyyy-MM-dd')
  ).reverse();

  return {
    productivity: dates.map(date => ({
      date,
      pomodoros: Math.floor(Math.random() * 8) + 2,
      tasksCompleted: Math.floor(Math.random() * 12) + 3,
      focusTime: Math.floor(Math.random() * 240) + 60, // minutes
      efficiency: Math.random() * 40 + 60 // percentage
    })),
    finance: {
      income: Array.from({ length: 12 }, (_, i) => ({
        month: format(new Date(2024, i, 1), 'MMM'),
        amount: Math.floor(Math.random() * 2000) + 3000
      })),
      expenses: Array.from({ length: 12 }, (_, i) => ({
        month: format(new Date(2024, i, 1), 'MMM'),
        amount: Math.floor(Math.random() * 1500) + 2000
      })),
      categories: [
        { name: 'Vivienda', amount: 1200, color: '#EF4444' },
        { name: 'Alimentación', amount: 800, color: '#F59E0B' },
        { name: 'Transporte', amount: 400, color: '#3B82F6' },
        { name: 'Entretenimiento', amount: 300, color: '#10B981' },
        { name: 'Otros', amount: 500, color: '#8B5CF6' }
      ]
    },
    learning: {
      coursesCompleted: Array.from({ length: 6 }, (_, i) => ({
        month: format(new Date(2024, i + 6, 1), 'MMM'),
        count: Math.floor(Math.random() * 3) + 1
      })),
      timeSpent: Array.from({ length: 7 }, (_, i) => ({
        day: format(subDays(new Date(), i), 'EEE'),
        hours: Math.floor(Math.random() * 4) + 1
      })).reverse(),
      skills: [
        { name: 'JavaScript', progress: 85, color: '#F7DF1E' },
        { name: 'React', progress: 78, color: '#61DAFB' },
        { name: 'Python', progress: 65, color: '#3776AB' },
        { name: 'Design', progress: 72, color: '#FF6B6B' }
      ]
    },
    goals: {
      completion: Array.from({ length: 6 }, (_, i) => ({
        month: format(new Date(2024, i + 6, 1), 'MMM'),
        completed: Math.floor(Math.random() * 5) + 2,
        total: Math.floor(Math.random() * 3) + 8
      })),
      categories: [
        { name: 'Personal', completed: 8, total: 12, color: '#10B981' },
        { name: 'Carrera', completed: 5, total: 8, color: '#3B82F6' },
        { name: 'Salud', completed: 6, total: 10, color: '#EF4444' },
        { name: 'Finanzas', completed: 3, total: 5, color: '#F59E0B' }
      ]
    }
  };
};

const METRIC_CARDS = [
  {
    id: 'productivity',
    title: 'Productividad',
    icon: Zap,
    color: '#10B981',
    metrics: [
      { label: 'Pomodoros hoy', value: '6', change: '+12%' },
      { label: 'Tareas completadas', value: '8', change: '+5%' },
      { label: 'Tiempo de foco', value: '3.2h', change: '+18%' },
      { label: 'Eficiencia', value: '87%', change: '+3%' }
    ]
  },
  {
    id: 'finance',
    title: 'Finanzas',
    icon: DollarSign,
    color: '#3B82F6',
    metrics: [
      { label: 'Balance mensual', value: '$1,240', change: '+8%' },
      { label: 'Gastos', value: '$2,180', change: '-5%' },
      { label: 'Ahorros', value: '$850', change: '+15%' },
      { label: 'Inversiones', value: '$3,200', change: '+22%' }
    ]
  },
  {
    id: 'learning',
    title: 'Aprendizaje',
    icon: BookOpen,
    color: '#8B5CF6',
    metrics: [
      { label: 'Cursos activos', value: '3', change: '+1' },
      { label: 'Horas esta semana', value: '12.5h', change: '+25%' },
      { label: 'Certificados', value: '2', change: '+1' },
      { label: 'Progreso promedio', value: '74%', change: '+8%' }
    ]
  },
  {
    id: 'goals',
    title: 'Objetivos',
    icon: Target,
    color: '#F59E0B',
    metrics: [
      { label: 'Completados', value: '22', change: '+4' },
      { label: 'En progreso', value: '8', change: '+2' },
      { label: 'Tasa de éxito', value: '73%', change: '+5%' },
      { label: 'Racha actual', value: '12 días', change: '+3' }
    ]
  }
];

export function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const data = useMemo(() => generateMockData(), []);

  const chartData = useMemo(() => {
    switch (selectedMetric) {
      case 'productivity':
        return data.productivity.slice(-7).map(item => ({
          name: format(new Date(item.date), 'EEE'),
          value: item.pomodoros,
          secondary: item.tasksCompleted
        }));
      case 'finance':
        return data.finance.income.slice(-6).map((item, index) => ({
          name: item.month,
          value: item.amount,
          secondary: data.finance.expenses[index]?.amount || 0
        }));
      case 'learning':
        return data.learning.timeSpent.map(item => ({
          name: item.day,
          value: item.hours,
          secondary: 0
        }));
      case 'goals':
        return data.goals.completion.map(item => ({
          name: item.month,
          value: (item.completed / item.total) * 100,
          secondary: item.total
        }));
      default:
        return [];
    }
  }, [selectedMetric, data]);

  const SimpleChart = ({ data, color }: { data: any[], color: string }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div className="h-64 flex items-end space-x-2 p-4">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(item.value / maxValue) * 200}px` }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="w-full rounded-t-lg mb-2"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-gray-400">{item.name}</span>
          </div>
        ))}
      </div>
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
            <BarChart3 className="h-6 w-6 text-[var(--primary-500)]" />
            <h1 className="text-xl font-semibold">Análisis</h1>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="bg-[var(--dark-bg-secondary)] text-white rounded-lg px-3 py-2 border border-[var(--dark-border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]"
          >
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="quarter">Este trimestre</option>
            <option value="year">Este año</option>
          </select>
          <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <RefreshCw className="h-5 w-5" />
          </button>
          <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <Download className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        {(showMenu || window.innerWidth >= 1024) && (
          <div className="fixed inset-y-0 left-0 w-64 bg-[var(--dark-bg-secondary)] transform transition-transform duration-300 ease-in-out z-30 lg:relative lg:translate-x-0">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Métricas</h3>
              <div className="space-y-2">
                {METRIC_CARDS.map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <button
                      key={metric.id}
                      onClick={() => setSelectedMetric(metric.id)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        selectedMetric === metric.id
                          ? 'bg-[var(--primary-600)] text-white'
                          : 'hover:bg-[var(--dark-bg-tertiary)] text-gray-300'
                      }`}
                    >
                      <Icon className="h-5 w-5" style={{ color: metric.color }} />
                      <span>{metric.title}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8">
                <h3 className="text-sm font-medium text-gray-400 mb-4">Reportes</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-[var(--dark-bg-tertiary)] text-gray-300 transition-colors">
                    <Activity className="h-5 w-5" />
                    <span>Resumen semanal</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-[var(--dark-bg-tertiary)] text-gray-300 transition-colors">
                    <TrendingUp className="h-5 w-5" />
                    <span>Tendencias</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-[var(--dark-bg-tertiary)] text-gray-300 transition-colors">
                    <PieChart className="h-5 w-5" />
                    <span>Distribución</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0 p-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {METRIC_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`card cursor-pointer transition-all duration-300 ${
                    selectedMetric === card.id ? 'ring-2 ring-[var(--primary-500)]' : 'card-hover'
                  }`}
                  onClick={() => setSelectedMetric(card.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5" style={{ color: card.color }} />
                      <h3 className="font-medium">{card.title}</h3>
                    </div>
                    <Eye className="h-4 w-4 text-gray-400" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {card.metrics.map((metric, index) => (
                      <div key={index}>
                        <div className="text-lg font-semibold">{metric.value}</div>
                        <div className="text-xs text-gray-400">{metric.label}</div>
                        <div className={`text-xs ${
                          metric.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {metric.change}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Main Chart */}
          {selectedMetric && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {METRIC_CARDS.find(m => m.id === selectedMetric)?.title} - Tendencia
                </h2>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <SimpleChart 
                data={chartData} 
                color={METRIC_CARDS.find(m => m.id === selectedMetric)?.color || '#10B981'} 
              />
            </motion.div>
          )}

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Productivity Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <h3 className="text-lg font-semibold mb-4">Desglose de Productividad</h3>
              <div className="space-y-4">
                {[
                  { label: 'Tiempo de foco', value: '4.2h', target: '6h', progress: 70 },
                  { label: 'Tareas completadas', value: '8', target: '12', progress: 67 },
                  { label: 'Pomodoros', value: '6', target: '8', progress: 75 },
                  { label: 'Eficiencia', value: '87%', target: '90%', progress: 97 }
                ].map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">{item.label}</span>
                      <span className="text-sm font-medium">{item.value} / {item.target}</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Financial Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card"
            >
              <h3 className="text-lg font-semibold mb-4">Resumen Financiero</h3>
              <div className="space-y-4">
                {data.finance.categories.map((category, index) => {
                  const total = data.finance.categories.reduce((sum, cat) => sum + cat.amount, 0);
                  const percentage = (category.amount / total) * 100;
                  
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-sm text-gray-400">{category.name}</span>
                        </div>
                        <span className="text-sm font-medium">${category.amount}</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="h-full"
                          style={{ backgroundColor: category.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Learning Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card"
            >
              <h3 className="text-lg font-semibold mb-4">Progreso de Aprendizaje</h3>
              <div className="space-y-4">
                {data.learning.skills.map((skill, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">{skill.name}</span>
                      <span className="text-sm font-medium">{skill.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.progress}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="h-full"
                        style={{ backgroundColor: skill.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Goals Achievement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card"
            >
              <h3 className="text-lg font-semibold mb-4">Logro de Objetivos</h3>
              <div className="space-y-4">
                {data.goals.categories.map((category, index) => {
                  const percentage = (category.completed / category.total) * 100;
                  
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-sm text-gray-400">{category.name}</span>
                        </div>
                        <span className="text-sm font-medium">
                          {category.completed}/{category.total}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="h-full"
                          style={{ backgroundColor: category.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Insights and Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card mt-6"
          >
            <h3 className="text-lg font-semibold mb-4">Insights y Recomendaciones</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <span className="font-medium text-emerald-400">Excelente</span>
                </div>
                <p className="text-sm text-gray-300">
                  Tu productividad ha aumentado un 18% esta semana. ¡Sigue así!
                </p>
              </div>
              
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                  <span className="font-medium text-yellow-400">Atención</span>
                </div>
                <p className="text-sm text-gray-300">
                  Tus gastos en entretenimiento han aumentado. Considera revisar tu presupuesto.
                </p>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                  <span className="font-medium text-blue-400">Oportunidad</span>
                </div>
                <p className="text-sm text-gray-300">
                  Puedes mejorar tu tasa de completación de objetivos enfocándote en 2-3 metas principales.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}