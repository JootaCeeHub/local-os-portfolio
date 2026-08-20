import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Play, 
  Pause,
  Trees as Tree,
  Trophy,
  Ban,
  Settings as SettingsIcon,
  Volume2,
  VolumeX,
  Menu,
  X,
  BarChart3,
  Plus,
  ChevronRight,
  Calendar,
  Clock,
  Target,
  Flame,
  Award,
  ArrowLeft
} from 'lucide-react';
import { usePomodoroStore } from '../store/pomodoro';
import { useAppStore } from '../store/app';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const TIMER_MODES = [
  { id: 'focus', name: 'Concentración profunda', duration: 25 },
  { id: 'social', name: 'Plantar juntos', duration: 30 },
  { id: 'extended', name: 'Tiempo de conteo excedido', duration: 35 }
];

export function Pomodoro() {
  const { trees, coins, settings, stats, addTree, addCoins, updateStats } = usePomodoroStore();
  const { soundEffects, toggleSoundEffects } = useAppStore();
  const [time, setTime] = useState(settings.workDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [showTimerSettings, setShowTimerSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [selectedMode, setSelectedMode] = useState(TIMER_MODES[0]);

  const resetTimer = useCallback((duration: number) => {
    setIsActive(false);
    setTime(duration * 60);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((time) => time - 1);
      }, 1000);
    } else if (time === 0 && isActive) {
      setIsActive(false);
      
      if (!isBreak) {
        addTree(settings.workDuration, 'work');
        addCoins(Math.floor(settings.workDuration / 5));
        setSessions((s) => s + 1);
        
        if (sessions + 1 >= settings.sessionsBeforeLongBreak) {
          resetTimer(settings.longBreakDuration);
          setSessions(0);
        } else {
          resetTimer(settings.breakDuration);
        }
        
        setIsBreak(true);
        if (settings.autoStartBreaks) setIsActive(true);
      } else {
        resetTimer(settings.workDuration);
        setIsBreak(false);
        if (settings.autoStartPomodoros) setIsActive(true);
      }

      if (soundEffects) {
        const audio = new Audio(isBreak ? '/sounds/work.mp3' : '/sounds/break.mp3');
        audio.play().catch(() => {});
      }
    }

    return () => clearInterval(interval);
  }, [isActive, time, isBreak, settings, soundEffects, sessions, addTree, addCoins, resetTimer]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-emerald-800 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button 
          className="p-2 hover:bg-emerald-700 rounded-lg transition-colors"
          onClick={() => setShowTimerSettings(!showTimerSettings)}
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowStats(!showStats)}
            className="p-2 hover:bg-emerald-700 rounded-lg transition-colors"
          >
            <BarChart3 className="h-6 w-6" />
          </button>
          <button 
            onClick={toggleSoundEffects}
            className="p-2 hover:bg-emerald-700 rounded-lg transition-colors"
          >
            {soundEffects ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
          </button>
          <div className="flex items-center bg-emerald-700/50 px-3 py-1 rounded-full">
            <Trophy className="h-5 w-5 text-yellow-400 mr-2" />
            <span>{coins}</span>
          </div>
        </div>
      </div>

      {/* Main Timer */}
      <div className="flex flex-col items-center justify-center space-y-8 mt-12">
        <div className="relative w-64 h-64 rounded-full border-8 border-emerald-500 flex items-center justify-center bg-emerald-700/20 backdrop-blur-sm">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl font-light">{formatTime(time)}</span>
          </div>
          {isActive && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full rounded-full border-8 border-emerald-400 animate-pulse opacity-50" />
            </div>
          )}
        </div>

        {/* Session Type */}
        <div className="text-xl font-light">
          {isBreak ? 'Descanso' : 'Tiempo de Trabajo'}
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsActive(!isActive)}
            className="p-4 bg-white text-emerald-600 rounded-full hover:bg-emerald-50 transition-colors"
          >
            {isActive ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
          </button>
          {isActive && (
            <button
              onClick={() => {
                resetTimer(isBreak ? settings.breakDuration : settings.workDuration);
                setIsBreak(false);
              }}
              className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <Ban className="h-8 w-8" />
            </button>
          )}
        </div>

        {/* Forest Stats */}
        <div className="mt-12 w-full max-w-4xl px-4">
          <h3 className="text-lg font-semibold mb-4">Tu Bosque</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {trees.slice(-8).map((tree) => (
              <div
                key={tree.id}
                className="bg-emerald-700/30 backdrop-blur-sm p-4 rounded-lg text-center"
              >
                <Tree className="h-8 w-8 mx-auto mb-2" />
                <span className="text-sm block">{new Date(tree.date).toLocaleDateString()}</span>
                <span className="text-xs text-emerald-200">{tree.duration} min</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Panel */}
      {showStats && (
        <div className="fixed inset-0 bg-black/50 z-50">
          <div className="absolute top-0 right-0 w-full max-w-md h-full bg-emerald-800 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={() => setShowStats(false)}
                className="p-2 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h2 className="text-lg font-medium">Estadísticas</h2>
              <div className="w-6" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-emerald-700/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm text-emerald-300">Hoy</span>
                </div>
                <div className="text-2xl font-light">{stats.dailySessions} sesiones</div>
                <div className="text-sm text-emerald-300">
                  Meta: {settings.dailyGoalSessions} sesiones
                </div>
              </div>

              <div className="bg-emerald-700/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm text-emerald-300">Tiempo total</span>
                </div>
                <div className="text-2xl font-light">{stats.totalMinutes} min</div>
                <div className="text-sm text-emerald-300">
                  {stats.totalSessions} sesiones totales
                </div>
              </div>

              <div className="bg-emerald-700/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Flame className="h-5 w-5 text-orange-400" />
                  <span className="text-sm text-emerald-300">Racha actual</span>
                </div>
                <div className="text-2xl font-light">{stats.currentStreak} días</div>
                <div className="text-sm text-emerald-300">
                  Mejor: {stats.longestStreak} días
                </div>
              </div>

              <div className="bg-emerald-700/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Award className="h-5 w-5 text-yellow-400" />
                  <span className="text-sm text-emerald-300">Monedas</span>
                </div>
                <div className="text-2xl font-light">{coins}</div>
                <div className="text-sm text-emerald-300">
                  {trees.length} árboles plantados
                </div>
              </div>
            </div>

            {/* Weekly Activity */}
            <div className="bg-emerald-700/50 rounded-lg p-4 mb-8">
              <h3 className="text-lg font-medium mb-4">Actividad semanal</h3>
              <div className="space-y-2">
                {Object.entries(stats.weeklyActivity)
                  .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                  .slice(0, 7)
                  .map(([date, count]) => (
                    <div key={date} className="flex items-center justify-between">
                      <span className="text-sm">
                        {format(new Date(date), 'EEEE d', { locale: es })}
                      </span>
                      <div className="flex-1 mx-4">
                        <div className="h-2 bg-emerald-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-400"
                            style={{
                              width: `${Math.min((count / settings.dailyGoalSessions) * 100, 100)}%`
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Tree Distribution */}
            <div className="bg-emerald-700/50 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Distribución de árboles</h3>
              <div className="space-y-4">
                {TIMER_MODES.map(mode => {
                  const modeCount = trees.filter(t => t.type === mode.id).length;
                  const percentage = trees.length > 0 ? (modeCount / trees.length) * 100 : 0;
                  
                  return (
                    <div key={mode.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{mode.name}</span>
                        <span className="text-sm">{modeCount}</span>
                      </div>
                      <div className="h-2 bg-emerald-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-400"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timer Settings Menu */}
      {showTimerSettings && (
        <div className="fixed inset-0 bg-black/50 z-50">
          <div className="absolute top-0 left-0 w-full max-w-md h-full bg-emerald-800 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={() => setShowTimerSettings(false)}
                className="p-2 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              <h2 className="text-lg font-medium">Configuración</h2>
              <div className="w-6" />
            </div>

            <div className="space-y-6">
              {/* Timer Modes */}
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3">Modos de temporizador</h3>
                <div className="space-y-2">
                  {TIMER_MODES.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setSelectedMode(mode)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        selectedMode.id === mode.id
                          ? 'bg-emerald-600'
                          : 'bg-emerald-700/50 hover:bg-emerald-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Tree className="h-5 w-5" />
                        <span>{mode.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>{mode.duration} min</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Timer Settings */}
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3">Ajustes del temporizador</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Auto-iniciar descansos</span>
                    <button
                      onClick={() => updateStats({ autoStartBreaks: !settings.autoStartBreaks })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.autoStartBreaks ? 'bg-emerald-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.autoStartBreaks ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Auto-iniciar pomodoros</span>
                    <button
                      onClick={() => updateStats({ autoStartPomodoros: !settings.autoStartPomodoros })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.autoStartPomodoros ? 'bg-emerald-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.autoStartPomodoros ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}