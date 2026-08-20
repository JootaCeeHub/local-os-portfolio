import React, { useState, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
  Calendar,
  Filter,
  Search,
  Plus,
  Edit3,
  Trash2,
  Download,
  Upload,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  Eye,
  Settings,
  Menu,
  X,
  Save,
  ArrowLeft
} from 'lucide-react';
import { useTradingStore } from '../store/trading';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

const TRADE_TYPES = {
  buy: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: ArrowUpRight },
  sell: { color: 'text-red-400', bg: 'bg-red-400/10', icon: ArrowDownRight }
};

const ASSET_CATEGORIES = {
  stocks: { name: 'Acciones', color: '#3B82F6' },
  crypto: { name: 'Criptomonedas', color: '#F59E0B' },
  forex: { name: 'Forex', color: '#10B981' },
  commodities: { name: 'Materias primas', color: '#8B5CF6' },
  indices: { name: 'Índices', color: '#EF4444' }
};

export function Trading() {
  const {
    trades,
    portfolio,
    watchlist,
    strategies,
    addTrade,
    updateTrade,
    deleteTrade,
    addToWatchlist,
    removeFromWatchlist,
    addStrategy,
    updateStrategy,
    deleteStrategy
  } = useTradingStore();

  const [showNewTrade, setShowNewTrade] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'trades' | 'portfolio' | 'watchlist' | 'strategies'>('trades');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const [newTrade, setNewTrade] = useState({
    asset: '',
    type: 'buy' as const,
    quantity: '',
    price: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
    category: 'stocks' as keyof typeof ASSET_CATEGORIES
  });

  const filteredTrades = trades
    .filter(trade => {
      if (searchTerm && !trade.asset.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (selectedAsset && trade.asset !== selectedAsset) return false;
      if (selectedType && trade.type !== selectedType) return false;
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAddTrade = useCallback(() => {
    if (!newTrade.asset || !newTrade.quantity || !newTrade.price) return;

    addTrade({
      ...newTrade,
      quantity: parseFloat(newTrade.quantity),
      price: parseFloat(newTrade.price),
      total: parseFloat(newTrade.quantity) * parseFloat(newTrade.price)
    });

    setNewTrade({
      asset: '',
      type: 'buy',
      quantity: '',
      price: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
      category: 'stocks'
    });

    setShowNewTrade(false);
  }, [newTrade, addTrade]);

  // Calcular estadísticas
  const stats = {
    totalTrades: trades.length,
    totalProfit: trades.reduce((sum, trade) => {
      return sum + (trade.type === 'sell' ? trade.total : -trade.total);
    }, 0),
    winRate: trades.length > 0 
      ? (trades.filter(t => t.type === 'sell' && t.total > 0).length / trades.length) * 100 
      : 0,
    portfolioValue: portfolio.reduce((sum, asset) => sum + asset.currentValue, 0),
    monthlyReturn: 0, // Calcular basado en trades del mes
    bestPerformer: portfolio.length > 0 
      ? portfolio.reduce((best, current) => 
          current.profitLoss > best.profitLoss ? current : best
        )
      : null
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
          <h1 className="text-xl font-semibold">Trading</h1>
        </div>
        <div className="flex items-center space-x-2">
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
            onClick={() => setShowNewTrade(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Nueva operación</span>
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
                    <span className="text-sm text-gray-400">Balance total</span>
                    <DollarSign className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="text-lg font-medium text-emerald-400">
                    ${stats.portfolioValue.toLocaleString()}
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">P&L Total</span>
                    {stats.totalProfit >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                  <div className={`text-lg font-medium ${
                    stats.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    ${Math.abs(stats.totalProfit).toLocaleString()}
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Tasa de éxito</span>
                    <Target className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="text-lg font-medium text-blue-400">
                    {stats.winRate.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="mb-6">
              <div className="space-y-1">
                {[
                  { id: 'trades', label: 'Operaciones', icon: Activity },
                  { id: 'portfolio', label: 'Portafolio', icon: PieChart },
                  { id: 'watchlist', label: 'Lista de seguimiento', icon: Eye },
                  { id: 'strategies', label: 'Estrategias', icon: Target }
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

            {/* Asset Categories */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">Categorías</h3>
              <div className="space-y-1">
                {Object.entries(ASSET_CATEGORIES).map(([key, category]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedAsset(key === selectedAsset ? null : key)}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      selectedAsset === key ? 'bg-gray-800' : 'hover:bg-gray-800'
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span>{category.name}</span>
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
                  placeholder="Buscar activos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
                <option value="quarter">Este trimestre</option>
                <option value="year">Este año</option>
              </select>
            </div>
          </div>

          {/* Content based on active tab */}
          <div className="p-4">
            {activeTab === 'trades' && (
              <div>
                {filteredTrades.length > 0 ? (
                  <div className="space-y-4">
                    {filteredTrades.map((trade) => {
                      const TradeIcon = TRADE_TYPES[trade.type].icon;
                      const category = ASSET_CATEGORIES[trade.category];
                      
                      return (
                        <div
                          key={trade.id}
                          className="group bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                              <div className={`p-2 rounded-lg ${TRADE_TYPES[trade.type].bg}`}>
                                <TradeIcon className={`h-5 w-5 ${TRADE_TYPES[trade.type].color}`} />
                              </div>
                              
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-medium text-white">{trade.asset}</h3>
                                  <span
                                    className="px-2 py-1 rounded-lg text-xs text-white"
                                    style={{ backgroundColor: category.color }}
                                  >
                                    {category.name}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                                  <span>{trade.quantity} unidades</span>
                                  <span>${trade.price.toLocaleString()}</span>
                                  <span className="flex items-center space-x-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{format(new Date(trade.date), 'dd MMM yyyy', { locale: es })}</span>
                                  </span>
                                </div>
                                {trade.notes && (
                                  <p className="text-sm text-gray-500 mt-1">{trade.notes}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <div className={`text-lg font-medium ${TRADE_TYPES[trade.type].color}`}>
                                  {trade.type === 'buy' ? '-' : '+'}${trade.total.toLocaleString()}
                                </div>
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1 hover:bg-gray-600 rounded-lg transition-colors">
                                  <Edit3 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => deleteTrade(trade.id)}
                                  className="p-1 hover:bg-gray-600 rounded-lg transition-colors text-red-400"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Activity className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-300 mb-2">
                      No hay operaciones
                    </h3>
                    <p className="text-gray-500">
                      Haz clic en "Nueva operación" para comenzar
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'portfolio' && (
              <div>
                {portfolio.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {portfolio.map((asset) => (
                      <div
                        key={asset.id}
                        className="bg-gray-800 rounded-lg p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-medium text-white">{asset.symbol}</h3>
                            <p className="text-sm text-gray-400">{asset.name}</p>
                          </div>
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: ASSET_CATEGORIES[asset.category].color }}
                          />
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Cantidad</span>
                            <span className="font-medium">{asset.quantity}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Precio promedio</span>
                            <span className="font-medium">${asset.avgPrice.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Valor actual</span>
                            <span className="font-medium">${asset.currentValue.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">P&L</span>
                            <span className={`font-medium ${
                              asset.profitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                              {asset.profitLoss >= 0 ? '+' : ''}${asset.profitLoss.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <PieChart className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-300 mb-2">
                      Portafolio vacío
                    </h3>
                    <p className="text-gray-500">
                      Realiza tu primera operación para ver tu portafolio
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'watchlist' && (
              <div>
                {watchlist.length > 0 ? (
                  <div className="space-y-4">
                    {watchlist.map((item) => (
                      <div
                        key={item.id}
                        className="group bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-white">{item.symbol}</h3>
                            <p className="text-sm text-gray-400">{item.name}</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="text-lg font-medium">${item.currentPrice.toLocaleString()}</div>
                              <div className={`text-sm ${
                                item.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                              }`}>
                                {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                              </div>
                            </div>
                            <button
                              onClick={() => removeFromWatchlist(item.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-600 rounded-lg"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Eye className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-300 mb-2">
                      Lista de seguimiento vacía
                    </h3>
                    <p className="text-gray-500">
                      Agrega activos para seguir su rendimiento
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'strategies' && (
              <div>
                {strategies.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {strategies.map((strategy) => (
                      <div
                        key={strategy.id}
                        className="bg-gray-800 rounded-lg p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-medium text-white">{strategy.name}</h3>
                            <p className="text-sm text-gray-400">{strategy.description}</p>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1 hover:bg-gray-600 rounded-lg transition-colors">
                              <Edit3 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Rendimiento</span>
                            <span className={`font-medium ${
                              strategy.performance >= 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                              {strategy.performance >= 0 ? '+' : ''}{strategy.performance.toFixed(2)}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Operaciones</span>
                            <span className="font-medium">{strategy.trades}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Tasa de éxito</span>
                            <span className="font-medium">{strategy.winRate.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Target className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-300 mb-2">
                      No hay estrategias
                    </h3>
                    <p className="text-gray-500">
                      Crea tu primera estrategia de trading
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

            {/* Performance Overview */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium mb-4">Rendimiento general</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Balance total</span>
                  <span className="text-xl font-medium text-emerald-400">
                    ${stats.portfolioValue.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">P&L Total</span>
                  <span className={`text-xl font-medium ${
                    stats.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {stats.totalProfit >= 0 ? '+' : ''}${Math.abs(stats.totalProfit).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Tasa de éxito</span>
                  <span className="text-xl font-medium text-blue-400">
                    {stats.winRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Best Performer */}
            {stats.bestPerformer && (
              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium mb-4">Mejor rendimiento</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{stats.bestPerformer.symbol}</div>
                    <div className="text-sm text-gray-400">{stats.bestPerformer.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-400 font-medium">
                      +${stats.bestPerformer.profitLoss.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Trading Activity */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Actividad de trading</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total de operaciones</span>
                  <span className="font-medium">{stats.totalTrades}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Operaciones ganadoras</span>
                  <span className="font-medium text-emerald-400">
                    {Math.round((stats.winRate / 100) * stats.totalTrades)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Operaciones perdedoras</span>
                  <span className="font-medium text-red-400">
                    {stats.totalTrades - Math.round((stats.winRate / 100) * stats.totalTrades)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New Trade Dialog */}
        {showNewTrade && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-lg w-full max-w-md">
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <h2 className="text-lg font-medium">Nueva operación</h2>
                <button
                  onClick={() => setShowNewTrade(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setNewTrade({ ...newTrade, type: 'buy' })}
                    className={`flex-1 flex items-center justify-center space-x-2 p-3 rounded-lg transition-colors ${
                      newTrade.type === 'buy'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <ArrowUpRight className="h-5 w-5" />
                    <span>Comprar</span>
                  </button>
                  <button
                    onClick={() => setNewTrade({ ...newTrade, type: 'sell' })}
                    className={`flex-1 flex items-center justify-center space-x-2 p-3 rounded-lg transition-colors ${
                      newTrade.type === 'sell'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <ArrowDownRight className="h-5 w-5" />
                    <span>Vender</span>
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Activo
                  </label>
                  <input
                    type="text"
                    value={newTrade.asset}
                    onChange={(e) => setNewTrade({ ...newTrade, asset: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="AAPL, BTC, EUR/USD..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Categoría
                  </label>
                  <select
                    value={newTrade.category}
                    onChange={(e) => setNewTrade({ ...newTrade, category: e.target.value as any })}
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {Object.entries(ASSET_CATEGORIES).map(([key, category]) => (
                      <option key={key} value={key}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      value={newTrade.quantity}
                      onChange={(e) => setNewTrade({ ...newTrade, quantity: e.target.value })}
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Precio
                    </label>
                    <input
                      type="number"
                      value={newTrade.price}
                      onChange={(e) => setNewTrade({ ...newTrade, price: e.target.value })}
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={newTrade.date}
                    onChange={(e) => setNewTrade({ ...newTrade, date: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Notas
                  </label>
                  <textarea
                    value={newTrade.notes}
                    onChange={(e) => setNewTrade({ ...newTrade, notes: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Razón de la operación..."
                    rows={3}
                  />
                </div>

                {newTrade.quantity && newTrade.price && (
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Total</span>
                      <span className="text-lg font-medium">
                        ${(parseFloat(newTrade.quantity) * parseFloat(newTrade.price)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-2 p-4 border-t border-gray-800">
                <button
                  onClick={() => setShowNewTrade(false)}
                  className="px-4 py-2 text-gray-400 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddTrade}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Registrar operación
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}