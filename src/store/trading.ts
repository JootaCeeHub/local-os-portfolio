import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Trade {
  id: string;
  asset: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  total: number;
  date: string;
  notes: string;
  category: 'stocks' | 'crypto' | 'forex' | 'commodities' | 'indices';
  createdAt: string;
}

export interface PortfolioAsset {
  id: string;
  symbol: string;
  name: string;
  category: 'stocks' | 'crypto' | 'forex' | 'commodities' | 'indices';
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
}

export interface TradingStrategy {
  id: string;
  name: string;
  description: string;
  performance: number;
  trades: number;
  winRate: number;
  maxDrawdown: number;
  createdAt: string;
}

interface TradingState {
  trades: Trade[];
  portfolio: PortfolioAsset[];
  watchlist: WatchlistItem[];
  strategies: TradingStrategy[];
  addTrade: (trade: Omit<Trade, 'id' | 'createdAt'>) => void;
  updateTrade: (id: string, updates: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;
  addToWatchlist: (item: Omit<WatchlistItem, 'id'>) => void;
  removeFromWatchlist: (id: string) => void;
  addStrategy: (strategy: Omit<TradingStrategy, 'id' | 'createdAt'>) => void;
  updateStrategy: (id: string, updates: Partial<TradingStrategy>) => void;
  deleteStrategy: (id: string) => void;
  updatePortfolio: () => void;
}

export const useTradingStore = create<TradingState>()(
  persist(
    (set, get) => ({
      trades: [],
      portfolio: [],
      watchlist: [],
      strategies: [],

      addTrade: (trade) => {
        const newTrade = {
          ...trade,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        
        set((state) => ({
          trades: [...state.trades, newTrade],
        }));
        
        get().updatePortfolio();
      },

      updateTrade: (id, updates) =>
        set((state) => ({
          trades: state.trades.map((trade) =>
            trade.id === id ? { ...trade, ...updates } : trade
          ),
        })),

      deleteTrade: (id) => {
        set((state) => ({
          trades: state.trades.filter((trade) => trade.id !== id),
        }));
        get().updatePortfolio();
      },

      addToWatchlist: (item) =>
        set((state) => ({
          watchlist: [
            ...state.watchlist,
            {
              ...item,
              id: crypto.randomUUID(),
            },
          ],
        })),

      removeFromWatchlist: (id) =>
        set((state) => ({
          watchlist: state.watchlist.filter((item) => item.id !== id),
        })),

      addStrategy: (strategy) =>
        set((state) => ({
          strategies: [
            ...state.strategies,
            {
              ...strategy,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateStrategy: (id, updates) =>
        set((state) => ({
          strategies: state.strategies.map((strategy) =>
            strategy.id === id ? { ...strategy, ...updates } : strategy
          ),
        })),

      deleteStrategy: (id) =>
        set((state) => ({
          strategies: state.strategies.filter((strategy) => strategy.id !== id),
        })),

      updatePortfolio: () => {
        const { trades } = get();
        const portfolioMap = new Map<string, PortfolioAsset>();

        trades.forEach((trade) => {
          const existing = portfolioMap.get(trade.asset);
          
          if (existing) {
            if (trade.type === 'buy') {
              const totalQuantity = existing.quantity + trade.quantity;
              const totalCost = (existing.quantity * existing.avgPrice) + trade.total;
              existing.quantity = totalQuantity;
              existing.avgPrice = totalCost / totalQuantity;
            } else {
              existing.quantity -= trade.quantity;
            }
          } else if (trade.type === 'buy') {
            portfolioMap.set(trade.asset, {
              id: crypto.randomUUID(),
              symbol: trade.asset,
              name: trade.asset, // En una app real, esto vendría de una API
              category: trade.category,
              quantity: trade.quantity,
              avgPrice: trade.price,
              currentPrice: trade.price * 1.05, // Simulado
              currentValue: trade.quantity * trade.price * 1.05,
              profitLoss: trade.quantity * trade.price * 0.05,
              profitLossPercent: 5,
            });
          }
        });

        // Filtrar activos con cantidad > 0
        const portfolio = Array.from(portfolioMap.values()).filter(
          (asset) => asset.quantity > 0
        );

        set({ portfolio });
      },
    }),
    {
      name: 'trading-storage',
    }
  )
);