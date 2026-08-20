import React, { useState, useEffect, useCallback } from 'react';
import {
  Moon,
  Sun,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Globe,
  Timer,
  Palette,
  ArrowLeft,
  Trash2,
  HelpCircle,
  Shield,
  LogOut,
  Smartphone,
  Eye,
  Zap,
  Save,
  RotateCcw,
  Calendar,
  Clock,
  MousePointer,
  Contrast,
  Check,
  AlertCircle,
  Info,
  ChevronRight
} from 'lucide-react';
import { useAppStore, ColorScheme } from '../store/app';
import { usePomodoroStore } from '../store/pomodoro';
import { useAuthStore } from '../store/auth';

const POMODORO_LIMITS = {
  workDuration: { min: 1, max: 60 },
  breakDuration: { min: 1, max: 30 },
  longBreakDuration: { min: 1, max: 45 },
  sessionsBeforeLongBreak: { min: 1, max: 10 }
} as const;

const colorSchemes: { value: ColorScheme; label: string; bgClass: string }[] = [
  { value: 'emerald', label: 'Esmeralda', bgClass: 'bg-emerald-500' },
  { value: 'blue', label: 'Azul', bgClass: 'bg-blue-500' },
  { value: 'purple', label: 'Púrpura', bgClass: 'bg-purple-500' },
  { value: 'amber', label: 'Ámbar', bgClass: 'bg-amber-500' },
  { value: 'rose', label: 'Rosa', bgClass: 'bg-rose-500' },
];

interface Toast {
  type: 'success' | 'error' | 'warning';
  message: string;
}

export function Settings() {
  const [toast, setToast] = useState<Toast | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isConfirmingAction, setIsConfirmingAction] = useState(false);
  const [lastSavedSettings, setLastSavedSettings] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const {
    theme,
    language,
    notifications,
    soundEffects,
    vibration,
    fontSize,
    compactMode,
    colorScheme,
    dateFormat,
    timeFormat,
    reduceMotion,
    highContrast,
    setTheme,
    setLanguage,
    toggleNotifications,
    toggleSoundEffects,
    toggleVibration,
    setFontSize,
    toggleCompactMode,
    setColorScheme,
    setDateFormat,
    setTimeFormat,
    toggleReduceMotion,
    toggleHighContrast,
    resetSettings
  } = useAppStore();

  const { settings: pomodoroSettings, updateSettings } = usePomodoroStore();
  const { signOut, user } = useAuthStore();

  useEffect(() => {
    if (!lastSavedSettings) {
      setLastSavedSettings({
        theme,
        language,
        notifications,
        soundEffects,
        vibration,
        fontSize,
        compactMode,
        colorScheme,
        dateFormat,
        timeFormat,
        reduceMotion,
        highContrast,
        pomodoroSettings
      });
    }
  }, []);

  useEffect(() => {
    if (lastSavedSettings) {
      const currentSettings = {
        theme,
        language,
        notifications,
        soundEffects,
        vibration,
        fontSize,
        compactMode,
        colorScheme,
        dateFormat,
        timeFormat,
        reduceMotion,
        highContrast,
        pomodoroSettings
      };
      setHasUnsavedChanges(JSON.stringify(currentSettings) !== JSON.stringify(lastSavedSettings));
    }
  }, [theme, language, notifications, soundEffects, vibration, fontSize, compactMode, colorScheme,
      dateFormat, timeFormat, reduceMotion, highContrast, pomodoroSettings]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const showToast = useCallback((type: Toast['type'], message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handlePomodoroSettingChange = useCallback((key: string, value: number | boolean) => {
    if (typeof value === 'number') {
      const limits = POMODORO_LIMITS[key as keyof typeof POMODORO_LIMITS];
      if (limits && (value < limits.min || value > limits.max)) {
        showToast('error', `El valor debe estar entre ${limits.min} y ${limits.max}`);
        return;
      }
    }
    updateSettings({ [key]: value });
    setHasUnsavedChanges(true);
  }, [updateSettings, showToast]);

  const handleSettingChange = useCallback((action: () => void) => {
    action();
    setHasUnsavedChanges(true);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      setLastSavedSettings({
        theme,
        language,
        notifications,
        soundEffects,
        vibration,
        fontSize,
        compactMode,
        colorScheme,
        dateFormat,
        timeFormat,
        reduceMotion,
        highContrast,
        pomodoroSettings
      });
      setHasUnsavedChanges(false);
      showToast('success', 'Cambios guardados correctamente');
    } catch (error) {
      showToast('error', 'Error al guardar los cambios');
    }
  }, [theme, language, notifications, soundEffects, vibration, fontSize, compactMode,
      colorScheme, dateFormat, timeFormat, reduceMotion, highContrast, pomodoroSettings]);

  const handleResetSettings = useCallback(() => {
    setIsConfirmingAction(true);
    const confirmed = window.confirm('¿Estás seguro de que deseas restablecer todos los ajustes a sus valores predeterminados?');
    if (confirmed) {
      resetSettings();
      setHasUnsavedChanges(false);
      showToast('success', 'Ajustes restablecidos correctamente');
    }
    setIsConfirmingAction(false);
  }, [resetSettings, showToast]);

  const handleSignOut = useCallback(async () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('Hay cambios sin guardar. ¿Deseas cerrar sesión de todos modos?');
      if (!confirmed) return;
    }
    try {
      await signOut();
      showToast('success', 'Sesión cerrada correctamente');
    } catch (error) {
      showToast('error', 'Error al cerrar sesión');
    }
  }, [hasUnsavedChanges, signOut, showToast]);

  return (
    <div className="min-h-screen bg-[#121212] text-white p-4 md:p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-semibold">Ajustes</h2>
          </div>
          <div className="flex items-center space-x-4">
            {hasUnsavedChanges && (
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Save className="h-5 w-5" />
                <span>Guardar cambios</span>
              </button>
            )}
            <button
              onClick={handleResetSettings}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Restablecer ajustes"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Apariencia */}
          <section className="bg-gray-800/50 rounded-xl p-6">
            <h3 className="text-lg font-medium text-gray-200 flex items-center mb-6">
              <Palette className="h-5 w-5 mr-2" />
              Apariencia
            </h3>
            <div className="space-y-6">
              {/* Tema */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-sm font-medium text-gray-200">Tema</span>
                  <span className="text-sm text-gray-400">Personaliza el aspecto de la aplicación</span>
                </div>
                <button
                  onClick={() => handleSettingChange(() => setTheme(theme === 'dark' ? 'light' : 'dark'))}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  {theme === 'dark' ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                  <span>{theme === 'dark' ? 'Oscuro' : 'Claro'}</span>
                </button>
              </div>

              {/* Esquema de color */}
              <div>
                <span className="block text-sm font-medium text-gray-200 mb-2">Esquema de color</span>
                <div className="grid grid-cols-5 gap-4">
                  {colorSchemes.map((scheme) => (
                    <button
                      key={scheme.value}
                      onClick={() => handleSettingChange(() => setColorScheme(scheme.value))}
                      className={`h-12 rounded-lg transition-all ${scheme.bgClass} ${
                        colorScheme === scheme.value
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800'
                          : 'opacity-75 hover:opacity-100'
                      }`}
                      title={scheme.label}
                    />
                  ))}
                </div>
              </div>

              {/* Tamaño de fuente */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-sm font-medium text-gray-200">Tamaño de fuente</span>
                  <span className="text-sm text-gray-400">Ajusta el tamaño del texto</span>
                </div>
                <select
                  value={fontSize}
                  onChange={(e) => handleSettingChange(() => setFontSize(e.target.value as 'small' | 'medium' | 'large'))}
                  className="bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="small">Pequeño</option>
                  <option value="medium">Mediano</option>
                  <option value="large">Grande</option>
                </select>
              </div>

              {/* Modo compacto */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-sm font-medium text-gray-200">Modo compacto</span>
                  <span className="text-sm text-gray-400">Reduce el espacio entre elementos</span>
                </div>
                <button
                  onClick={() => handleSettingChange(toggleCompactMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    compactMode ? 'bg-emerald-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      compactMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Reducir movimiento */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-sm font-medium text-gray-200">Reducir movimiento</span>
                  <span className="text-sm text-gray-400">Minimiza las animaciones</span>
                </div>
                <button
                  onClick={() => handleSettingChange(toggleReduceMotion)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    reduceMotion ? 'bg-emerald-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      reduceMotion ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Alto contraste */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-sm font-medium text-gray-200">Alto contraste</span>
                  <span className="text-sm text-gray-400">Mejora la legibilidad</span>
                </div>
                <button
                  onClick={() => handleSettingChange(toggleHighContrast)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    highContrast ? 'bg-emerald-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      highContrast ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Idioma y región */}
          <section className="bg-gray-800/50 rounded-xl p-6">
            <h3 className="text-lg font-medium text-gray-200 flex items-center mb-6">
              <Globe className="h-5 w-5 mr-2" />
              Idioma y región
            </h3>
            <div className="space-y-6">
              {/* Idioma */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-sm font-medium text-gray-200">Idioma</span>
                  <span className="text-sm text-gray-400">Selecciona el idioma de la aplicación</span>
                </div>
                <select
                  value={language}
                  onChange={(e) => handleSettingChange(() => setLanguage(e.target.value as 'es' | 'en'))}
                  className="bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>

              {/* Formato de fecha */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-sm font-medium text-gray-200">Formato de fecha</span>
                  <span className="text-sm text-gray-400">Personaliza cómo se muestran las fechas</span>
                </div>
                <select
                  value={dateFormat}
                  onChange={(e) => handleSettingChange(() => setDateFormat(e.target.value as any))}
                  className="bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="dd/MM/yyyy">31/12/2025</option>
                  <option value="MM/dd/yyyy">12/31/2025</option>
                  <option value="yyyy-MM-dd">2025-12-31</option>
                </select>
              </div>

              {/* Formato de hora */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-sm font-medium text-gray-200">Formato de hora</span>
                  <span className="text-sm text-gray-400">Elige entre 12 o 24 horas</span>
                </div>
                <select
                  value={timeFormat}
                  onChange={(e) => handleSettingChange(() => setTimeFormat(e.target.value as '12h' | '24h'))}
                  className="bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="12h">12 horas (AM/PM)</option>
                  <option value="24h">24 horas</option>
                </select>
              </div>
            </div>
          </section>

          {/* Notificaciones */}
          <section className="bg-gray-800/50 rounded-xl p-6">
            <h3 className="text-lg font-medium text-gray-200 flex items-center mb-6">
              <Bell className="h-5 w-5 mr-2" />
              Notificaciones
            </h3>
            <div className="space-y-6">
              {/* Notificaciones push */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-sm font-medium text-gray-200">Notificaciones push</span>
                  <span className="text-sm text-gray-400">Recibe alertas importantes</span>
                </div>
                <button
                  onClick={() => handleSettingChange(toggleNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications ? 'bg-emerald-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Sonidos */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-sm font-medium text-gray-200">Sonidos</span>
                  <span className="text-sm text-gray-400">Efectos de sonido en la aplicación</span>
                </div>
                <button
                  onClick={() => handleSettingChange(toggleSoundEffects)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    soundEffects ? 'bg-emerald-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      soundEffects ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Vibración */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-sm font-medium text-gray-200">Vibración</span>
                  <span className="text-sm text-gray-400">Feedback táctil</span>
                </div>
                <button
                  onClick={() => handleSettingChange(toggleVibration)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    vibration ? 'bg-emerald-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      vibration ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Configuración del Pomodoro */}
          <section className="bg-gray-800/50 rounded-xl p-6">
            <h3 className="text-lg font-medium text-gray-200 flex items-center mb-6">
              <Timer className="h-5 w-5 mr-2" />
              Configuración del Pomodoro
            </h3>
            <div className="space-y-6">
              {/* Duración del trabajo */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-sm font-medium text-gray-200">Duración del trabajo</span>
                  <span className="text-sm text-gray-400">Tiempo de concentración (minutos)</span>
                </div>
                <input
                  type="number"
                  value={pomodoroSettings.workDuration}
                  onChange={(e) => handlePomodoroSettingChange('workDuration', parseInt(e.target.value))}
                  className="w-20 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  min={POMODORO_LIMITS.workDuration.min}
                  max={POMODORO_LIMITS.workDuration.max}
                />
              </div>

              {/* Duración del descanso corto */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-sm font-medium text-gray-200">Descanso corto</span>
                  <span className="text-sm text-gray-400">Duración del descanso (minutos)</span>
                </div>
                <input
                  type="number"
                  value={pomodoroSettings.breakDuration}
                  onChange={(e) => handlePomodoroSettingChange('breakDuration', parseInt(e.target.value))}
                  className="w-20 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  min={POMODORO_LIMITS.breakDuration.min}
                  max={POMODORO_LIMITS.breakDuration.max}
                />
              </div>

              {/* Duración del descanso largo */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-sm font-medium text-gray-200">Descanso largo</span>
                  <span className="text-sm text-gray-400">Duración del descanso largo (minutos)</span>
                </div>
                <input
                  type="number"
                  value={pomodoroSettings.longBreakDuration}
                  onChange={(e) => handlePomodoroSettingChange('longBreakDuration', parseInt(e.target.value))}
                  className="w-20 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  min={POMODORO_LIMITS.longBreakDuration.min}
                  max={POMODORO_LIMITS.longBreakDuration.max}
                />
              </div>

              {/* Sesiones antes del descanso largo */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-sm font-medium text-gray-200">Sesiones para descanso largo</span>
                  <span className="text-sm text-gray-400">Pomodoros antes del descanso largo</span>
                </div>
                <input
                  type="number"
                  value={pomodoroSettings.sessionsBeforeLongBreak}
                  onChange={(e) => handlePomodoroSettingChange('sessionsBeforeLongBreak', parseInt(e.target.value))}
                  className="w-20 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  min={POMODORO_LIMITS.sessionsBeforeLongBreak.min}
                  max={POMODORO_LIMITS.sessionsBeforeLongBreak.max}
                />
              </div>

              {/* Auto-iniciar descansos */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-sm font-medium text-gray-200">Auto-iniciar descansos</span>
                  <span className="text-sm text-gray-400">Inicia automáticamente los descansos</span>
                </div>
                <button
                  onClick={() => handlePomodoroSettingChange('autoStartBreaks', !pomodoroSettings.autoStartBreaks)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    pomodoroSettings.autoStartBreaks ? 'bg-emerald-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      pomodoroSettings.autoStartBreaks ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Auto-iniciar pomodoros */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-sm font-medium text-gray-200">Auto-iniciar pomodoros</span>
                  <span className="text-sm text-gray-400">Inicia automáticamente los pomodoros</span>
                </div>
                <button
                  onClick={() => handlePomodoroSettingChange('autoStartPomodoros', !pomodoroSettings.autoStartPomodoros)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    pomodoroSettings.autoStartPomodoros ? 'bg-emerald-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      pomodoroSettings.autoStartPomodoros ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Cuenta */}
          <section className="bg-gray-800/50 rounded-xl p-6">
            <h3 className="text-lg font-medium text-gray-200 flex items-center mb-6">
              <Shield className="h-5 w-5 mr-2" />
              Cuenta
            </h3>
            <div className="space-y-4">
              {/* Información del usuario */}
              {user && (
                <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-emerald-600 flex items-center justify-center">
                      <span className="text-lg font-semibold">{user.name[0].toUpperCase()}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-200">{user.name}</h4>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Cerrar sesión</span>
              </button>

              <button 
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <Trash2 className="h-5 w-5" />
                <span>Eliminar cuenta</span>
              </button>
            </div>
          </section>

          {/* Ayuda */}
          <section className="bg-gray-800/50 rounded-xl p-6">
            <h3 className="text-lg font-medium text-gray-200 flex items-center mb-6">
              <HelpCircle className="h-5 w-5 mr-2" />
              Ayuda
            </h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-700 rounded-lg transition-colors">
                <span>Centro de ayuda</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-700 rounded-lg transition-colors">
                <span>Contactar soporte</span>
                <ChevronRight className=" h-5 w-5 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-700 rounded-lg transition-colors">
                <span>Términos y condiciones</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-700 rounded-lg transition-colors">
                <span>Política de privacidad</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Toast notifications */}
      {toast && (
        <div 
          className={`fixed bottom-4 right-4 flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
            toast.type === 'success' ? 'bg-emerald-600' :
            toast.type === 'error' ? 'bg-red-600' :
            'bg-yellow-600'
          }`}
        >
          {toast.type === 'success' ? <Check className="h-5 w-5" /> :
           toast.type === 'error' ? <AlertCircle className="h-5 w-5" /> :
           <Info className="h-5 w-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Indicador de cambios no guardados */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-4 left-4 bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>Hay cambios sin guardar</span>
          </div>
        </div>
      )}
    </div>
  );
}