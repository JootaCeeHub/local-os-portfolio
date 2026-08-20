import React, { useState, useCallback } from 'react';
import {
  Wallet,
  Plus,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Calendar,
  Tag,
  Menu,
  X,
  Edit3,
  Trash2,
  ChevronRight,
  ArrowLeft,
  Save,
  DollarSign,
  PieChart,
  TrendingUp,
  TrendingDown,
  Clock,
  FileText,
  Settings,
  Download,
  Upload,
  AlertCircle
} from 'lucide-react';
import { useFinanceStore } from '../store/finance';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

const TRANSACTION_CATEGORIES = {
  income: [
    { id: 'salary', name: 'Salario', color: '#10B981' },
    { id: 'investments', name: 'Inversiones', color: '#6366F1' },
    { id: 'freelance', name: 'Freelance', color: '#F59E0B' },
    { id: 'other_income', name: 'Otros ingresos', color: '#8B5CF6' }
  ],
  expense: [
    { id: 'housing', name: 'Vivienda', color: '#EF4444' },
    { id: 'food', name: 'Alimentación', color: '#F97316' },
    { id: 'transport', name: 'Transporte', color: '#3B82F6' },
    { id: 'utilities', name: 'Servicios', color: '#EC4899' },
    { id: 'entertainment', name: 'Entretenimiento', color: '#14B8A6' },
    { id: 'health', name: 'Salud', color: '#8B5CF6' },
    { id: 'education', name: 'Educación', color: '#6366F1' },
    { id: 'shopping', name: 'Compras', color: '#F59E0B' },
    { id: 'other_expense', name: 'Otros gastos', color: '#64748B' }
  ]
};

export function Finances() {
  const {
    transactions,
    accounts,
    budgets,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addAccount,
    updateAccount,
    deleteAccount,
    addBudget,
    updateBudget,
    deleteBudget
  } = useFinanceStore();

  const [showNewTransaction, setShowNewTransaction] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'income' | 'expense' | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<'all' | 'month' | 'week' | 'custom'>('month');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [newTransaction, setNewTransaction] = useState({
    type: 'expense' as const,
    amount: '',
    category: '',
    account: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    tags: [] as string[]
  });

  // Calcular estadísticas
  const stats = {
    totalIncome: transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0),
    totalExpenses: transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0),
    balance: transactions.reduce((sum, t) => 
      t.type === 'income' ? sum + t.amount : sum - t.amount, 0
    ),
    monthlyIncome: transactions
      .filter(t => t.type === 'income' && 
        new Date(t.date).getMonth() === new Date().getMonth())
      .reduce((sum, t) => sum + t.amount, 0),
    monthlyExpenses: transactions
      .filter(t => t.type === 'expense' && 
        new Date(t.date).getMonth() === new Date().getMonth())
      .reduce((sum, t) => sum + t.amount, 0),
    categoriesDistribution: TRANSACTION_CATEGORIES.expense.map(category => ({
      ...category,
      total: transactions
        .filter(t => t.category === category.id)
        .reduce((sum, t) => sum + t.amount, 0)
    }))
  };

  // Filtrar transacciones
  const filteredTransactions = transactions
    .filter(transaction => {
      if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (selectedType && transaction.type !== selectedType) return false;
      if (selectedCategory && transaction.category !== selectedCategory) return false;
      if (selectedAccount && transaction.account !== selectedAccount) return false;
      
      if (selectedDateRange === 'month') {
        const transactionDate = new Date(transaction.date);
        const today = new Date();
        return transactionDate.getMonth() === today.getMonth() &&
               transactionDate.getFullYear() === today.getFullYear();
      }
      
      if (selectedDateRange === 'week') {
        const transactionDate = new Date(transaction.date);
        const today = new Date();
        const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
        const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
        return transactionDate >= weekStart && transactionDate <= weekEnd;
      }
      
      if (selectedDateRange === 'custom' && customDateRange.start && customDateRange.end) {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= new Date(customDateRange.start) &&
               transactionDate <= new Date(customDateRange.end);
      }
      
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc'
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return sortOrder === 'asc'
        ? a.amount - b.amount
        : b.amount - a.amount;
    });

  const handleAddTransaction = useCallback(() => {
    if (!newTransaction.amount || !newTransaction.category || !newTransaction.account) {
      return;
    }

    addTransaction({
      ...newTransaction,
      amount: parseFloat(newTransaction.amount),
      date: newTransaction.date || format(new Date(), 'yyyy-MM-dd')
    });

    setNewTransaction({
      type: 'expense',
      amount: '',
      category: '',
      account: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      tags: []
    });

    setShowNewTransaction(false);
  }, [newTransaction, addTransaction]);

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
          <h1 className="text-xl font-semibold">Finanzas</h1>
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
            onClick={() => setShowNewTransaction(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Nueva transacción</span>
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
            {/* Resumen de cuentas */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-400">Cuentas</h3>
                <button className="p-1 hover:bg-gray-800 rounded-lg transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                {accounts.map(account => (
                  <button
                    key={account.id}
                    onClick={() => setSelectedAccount(account.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      selectedAccount === account.id
                        ? 'bg-gray-800'
                        : 'hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Wallet className="h-5 w-5 text-emerald-400" />
                      <span>{account.name}</span>
                    </div>
                    <span className={account.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      ${Math.abs(account.balance).toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Presupuestos */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-400">Presupuestos</h3>
                <button className="p-1 hover:bg-gray-800 rounded-lg transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3">
                {budgets.map(budget => {
                  const spent = transactions
                    .filter(t => 
                      t.type === 'expense' &&
                      t.category === budget.category &&
                      new Date(t.date).getMonth() === new Date().getMonth()
                    )
                    .reduce((sum, t) => sum + t.amount, 0);
                  const percentage = (spent / budget.amount) * 100;

                  return (
                    <div key={budget.id} className="p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span>{TRANSACTION_CATEGORIES.expense.find(c => c.id === budget.category)?.name}</span>
                        <span className="text-sm">
                          ${spent.toLocaleString()} / ${budget.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            percentage > 100
                              ? 'bg-red-500'
                              : percentage > 80
                              ? 'bg-yellow-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Categorías */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-4">Categorías</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-500 mb-2">Ingresos</h4>
                  <div className="space-y-1">
                    {TRANSACTION_CATEGORIES.income.map(category => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setSelectedType('income');
                        }}
                        className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-gray-800'
                            : 'hover:bg-gray-800'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-medium text-gray-500 mb-2">Gastos</h4>
                  <div className="space-y-1">
                    {TRANSACTION_CATEGORIES.expense.map(category => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setSelectedType('expense');
                        }}
                        className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-gray-800'
                            : 'hover:bg-gray-800'
                        }`}
                      >
                        <span
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
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
            <div className="bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-emerald-900 bg-opacity-50 p-3 rounded-lg">
                  <ArrowUpRight className="text-emerald-400 h-5 w-5" />
                </div>
                <span className="text-sm text-gray-400">Ingresos del mes</span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white">
                ${stats.monthlyIncome.toLocaleString()}
              </h3>
              <p className="text-emerald-400 text-sm mt-1">
                +14% vs mes anterior
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-red-900 bg-opacity-50 p-3 rounded-lg">
                  <ArrowDownRight className="text-red-400 h-5 w-5" />
                </div>
                <span className="text-sm text-gray-400">Gastos del mes</span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white">
                ${stats.monthlyExpenses.toLocaleString()}
              </h3>
              <p className="text-red-400 text-sm mt-1">
                -5% vs mes anterior
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-900 bg-opacity-50 p-3 rounded-lg">
                  <Wallet className="text-blue-400 h-5 w-5" />
                </div>
                <span className="text-sm text-gray-400">Balance total</span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white">
                ${stats.balance.toLocaleString()}
              </h3>
              <p className="text-blue-400 text-sm mt-1">
                Actualizado hace 5 min
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-900 bg-opacity-50 p-3 rounded-lg">
                  <PieChart className="text-purple-400 h-5 w-5" />
                </div>
                <span className="text-sm text-gray-400">Ahorro del mes</span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white">
                ${(stats.monthlyIncome - stats.monthlyExpenses).toLocaleString()}
              </h3>
              <p className="text-purple-400 text-sm mt-1">
                {Math.round((1 - stats.monthlyExpenses / stats.monthlyIncome) * 100)}% de ingresos
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Buscar transacciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
                className="bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="date">Fecha</option>
                <option value="amount">Monto</option>
              </select>
              <button
                onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                {sortOrder === 'asc' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              </button>
            </div>

            {/* Active Filters */}
            {(selectedType || selectedCategory || selectedAccount || selectedDateRange !== 'all') && (
              <div className="flex items-center space-x-2 mt-2">
                {selectedType && (
                  <span className="flex items-center space-x-1 bg-gray-800 text-sm px-2 py-1 rounded-lg">
                    {selectedType === 'income' ? (
                      <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-400" />
                    )}
                    <span className="capitalize">{selectedType}</span>
                    <button
                      onClick={() => setSelectedType(null)}
                      className="hover:text-gray-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                )}

                {selectedCategory && (
                  <span className="flex items-center space-x-1 bg-gray-800 text-sm px-2 py-1 rounded-lg">
                    <Tag className="h-4 w-4" />
                    <span>
                      {TRANSACTION_CATEGORIES[selectedType || 'expense'].find(
                        c => c.id === selectedCategory
                      )?.name}
                    </span>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="hover:text-gray-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                )}

                {selectedAccount && (
                  <span className="flex items-center space-x-1 bg-gray-800 text-sm px-2 py-1 rounded-lg">
                    <Wallet className="h-4 w-4" />
                    <span>
                      {accounts.find(a => a.id === selectedAccount)?.name}
                    </span>
                    <button
                      onClick={() => setSelectedAccount(null)}
                      className="hover:text-gray-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                )}

                {selectedDateRange !== 'all' && (
                  <span className="flex items-center space-x-1 bg-gray-800 text-sm px-2 py-1 rounded-lg">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {selectedDateRange === 'month'
                        ? 'Este mes'
                        : selectedDateRange === 'week'
                        ? 'Esta semana'
                        : `${format(new Date(customDateRange.start), 'dd/MM/yyyy')} - ${format(
                            new Date(customDateRange.end),
                            'dd/MM/yyyy'
                          )}`}
                    </span>
                    <button
                      onClick={() => setSelectedDateRange('all')}
                      className="hover:text-gray-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Transactions List */}
          <div className="p-4">
            {filteredTransactions.length > 0 ? (
              <div className="space-y-2">
                {filteredTransactions.map((transaction) => {
                  const category = TRANSACTION_CATEGORIES[transaction.type].find(
                    c => c.id === transaction.category
                  );

                  return (
                    <div
                      key={transaction.id}
                      className="group flex items-start space-x-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <div
                        className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: category?.color }}
                      >
                        {transaction.type === 'income' ? (
                          <ArrowUpRight className="h-5 w-5 text-white" />
                        ) : (
                          <ArrowDownRight className="h-5 w-5 text-white" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-white">
                              {transaction.description || category?.name}
                            </h3>
                            <div className="flex items-center text-sm text-gray-400 mt-1">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>
                                {format(new Date(transaction.date), 'dd MMM yyyy', {
                                  locale: es
                                })}
                              </span>
                              <span className="mx-2">•</span>
                              <Wallet className="h-4 w-4 mr-1" />
                              <span>
                                {accounts.find(a => a.id === transaction.account)?.name}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-lg font-medium ${
                              transaction.type === 'income'
                                ? 'text-emerald-400'
                                : 'text-red-400'
                            }`}>
                              {transaction.type === 'income' ? '+' : '-'}$
                              {transaction.amount.toLocaleString()}
                            </span>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {/* TODO: Edit transaction dialog */}}
                                className="p-1 text-gray-400 hover:bg-gray-600 rounded-lg transition-colors"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteTransaction(transaction.id)}
                                className="p-1 text-red-400 hover:bg-gray-600 rounded-lg transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  No hay transacciones
                </h3>
                <p className="text-gray-500">
                  {searchTerm
                    ? 'No se encontraron transacciones que coincidan con tu búsqueda'
                    : 'Haz clic en "Nueva transacción" para comenzar'}
                </p>
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

            {/* Balance Overview */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium mb-4">Balance general</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-400">Ingresos totales</span>
                    <span className="text-emerald-400">
                      ${stats.totalIncome.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{
                        width: '100%'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-400">Gastos totales</span>
                    <span className="text-red-400">
                      ${stats.totalExpenses.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500"
                      style={{
                        width: `${(stats.totalExpenses / stats.totalIncome) * 100}%`
                      }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Balance neto</span>
                    <span className={`text-lg font-medium ${
                      stats.balance >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      ${Math.abs(stats.balance).toLocaleString()}
                    </span>
                 ```
                  </div>
                </div>
              </div>
            </div>

            {/* Expense Categories */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium mb-4">Distribución de gastos</h3>
              <div className="space-y-4">
                {stats.categoriesDistribution
                  .filter(category => category.total > 0)
                  .sort((a, b) => b.total - a.total)
                  .map(category => (
                    <div key={category.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-400">{category.name}</span>
                        <span className="text-sm font-medium">
                          ${category.total.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full"
                          style={{
                            backgroundColor: category.color,
                            width: `${(category.total / stats.totalExpenses) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Monthly Trends */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Tendencias mensuales</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Ingresos vs Gastos</span>
                    <span className="text-sm text-emerald-400">
                      +${(stats.monthlyIncome - stats.monthlyExpenses).toLocaleString()}
                    </span>
                  </div>
                  <div className="relative pt-2">
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                      <span>Ingresos</span>
                      <span>${stats.monthlyIncome.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                      <span>Gastos</span>
                      <span>${stats.monthlyExpenses.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500"
                        style={{
                          width: `${(stats.monthlyExpenses / stats.monthlyIncome) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Tasa de ahorro</span>
                    <span className="text-sm text-emerald-400">
                      {Math.round((1 - stats.monthlyExpenses / stats.monthlyIncome) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{
                        width: `${(1 - stats.monthlyExpenses / stats.monthlyIncome) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New Transaction Dialog */}
        {showNewTransaction && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-lg w-full max-w-md">
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <h2 className="text-lg font-medium">Nueva transacción</h2>
                <button
                  onClick={() => setShowNewTransaction(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setNewTransaction({ ...newTransaction, type: 'income' })}
                    className={`flex-1 flex items-center justify-center space-x-2 p-3 rounded-lg transition-colors ${
                      newTransaction.type === 'income'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <ArrowUpRight className="h-5 w-5" />
                    <span>Ingreso</span>
                  </button>
                  <button
                    onClick={() => setNewTransaction({ ...newTransaction, type: 'expense' })}
                    className={`flex-1 flex items-center justify-center space-x-2 p-3 rounded-lg transition-colors ${
                      newTransaction.type === 'expense'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <ArrowDownRight className="h-5 w-5" />
                    <span>Gasto</span>
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Monto
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                      className="w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Categoría
                  </label>
                  <select
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Seleccionar categoría</option>
                    {TRANSACTION_CATEGORIES[newTransaction.type].map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Cuenta
                  </label>
                  <select
                    value={newTransaction.account}
                    onChange={(e) => setNewTransaction({ ...newTransaction, account: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Seleccionar cuenta</option>
                    {accounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Agregar descripción..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 p-4 border-t border-gray-800">
                <button
                  onClick={() => setShowNewTransaction(false)}
                  className="px-4 py-2 text-gray-400 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddTransaction}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}