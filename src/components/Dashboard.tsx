import React from 'react';
import { ArrowUpRight, ArrowDownRight, Target, Clock, Star, Plus } from 'lucide-react';

export function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          <p className="text-gray-400 mt-1">Bienvenido de vuelta</p>
        </div>
        <button className="btn">
          <Plus size={20} className="mr-2" />
          Nuevo Proyecto
        </button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-emerald-900 bg-opacity-50 p-3 rounded-lg">
              <ArrowUpRight className="text-emerald-400 h-5 w-5" />
            </div>
            <span className="text-sm text-gray-400">Ingresos Mensuales</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white">$3,240.00</h3>
          <p className="text-emerald-400 text-sm mt-1">+14% vs mes anterior</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-900 bg-opacity-50 p-3 rounded-lg">
              <ArrowDownRight className="text-red-400 h-5 w-5" />
            </div>
            <span className="text-sm text-gray-400">Gastos Mensuales</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white">$2,140.00</h3>
          <p className="text-red-400 text-sm mt-1">-5% vs mes anterior</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-900 bg-opacity-50 p-3 rounded-lg">
              <Target className="text-blue-400 h-5 w-5" />
            </div>
            <span className="text-sm text-gray-400">Metas Completadas</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white">8/12</h3>
          <p className="text-blue-400 text-sm mt-1">67% completado</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-900 bg-opacity-50 p-3 rounded-lg">
              <Clock className="text-purple-400 h-5 w-5" />
            </div>
            <span className="text-sm text-gray-400">Tiempo Productivo</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white">32h 40m</h3>
          <p className="text-purple-400 text-sm mt-1">+2h vs semana anterior</p>
        </div>
      </div>

      {/* Boards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tableros Favoritos */}
        <div className="col-span-full">
          <div className="flex items-center space-x-2 mb-4">
            <Star className="text-yellow-400 h-5 w-5" />
            <h3 className="text-lg font-semibold text-white">Tableros Favoritos</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {['Personal', 'Trabajo', 'Finanzas'].map((board) => (
              <div
                key={board}
                className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-emerald-500 transition-colors cursor-pointer group"
              >
                <h4 className="text-white font-medium group-hover:text-emerald-400 transition-colors">
                  {board}
                </h4>
                <p className="text-gray-400 text-sm mt-1">3 tareas pendientes</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks & Reminders */}
        <div className="bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Próximas Tareas</h3>
          <div className="space-y-4">
            {['Análisis mensual de gastos', 'Revisión de portfolio', 'Crear contenido para blog'].map((task, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-600 text-emerald-500 focus:ring-emerald-500 bg-gray-700"
                />
                <span className="text-gray-300">{task}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Recordatorios</h3>
          <div className="space-y-4">
            {[
              { text: 'Pago de servicios', date: '28 Mar' },
              { text: 'Reunión de trading', date: '30 Mar' },
              { text: 'Revisión de metas', date: '1 Abr' }
            ].map((reminder, index) => (
              <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <span className="text-gray-300">{reminder.text}</span>
                <span className="text-sm text-gray-400">{reminder.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}