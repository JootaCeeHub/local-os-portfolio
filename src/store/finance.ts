import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  account: string;
  description: string;
  date: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'credit' | 'savings' | 'investment';
  balance: number;
  currency: string;
  color: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  rollover: boolean;
}

interface FinanceState {
  transactions: Transaction[];
  accounts: Account[];
  budgets: Budget[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      transactions: [],
      accounts: [
        {
          id: 'cash',
          name: 'Efectivo',
          type: 'cash',
          balance: 0,
          currency: 'USD',
          color: '#10B981'
        },
        {
          id: 'bank',
          name: 'Cuenta bancaria',
          type: 'bank',
          balance: 0,
          currency: 'USD',
          color: '#3B82F6'
        }
      ],
      budgets: [],

      addTransaction: (transaction) =>
        set((state) => {
          const newTransaction = {
            ...transaction,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Actualizar balance de la cuenta
          const updatedAccounts = state.accounts.map(account => {
            if (account.id === transaction.account) {
              return {
                ...account,
                balance: account.balance + (
                  transaction.type === 'income'
                    ? transaction.amount
                    : -transaction.amount
                )
              };
            }
            return account;
          });

          return {
            transactions: [...state.transactions, newTransaction],
            accounts: updatedAccounts
          };
        }),

      updateTransaction: (id, updates) =>
        set((state) => {
          const oldTransaction = state.transactions.find(t => t.id === id);
          if (!oldTransaction) return state;

          // Si el monto o tipo cambió, actualizar balances
          const amountChanged = updates.amount !== undefined && updates.amount !== oldTransaction.amount;
          const typeChanged = updates.type !== undefined && updates.type !== oldTransaction.type;
          const accountChanged = updates.account !== undefined && updates.account !== oldTransaction.account;

          let updatedAccounts = [...state.accounts];

          if (amountChanged || typeChanged || accountChanged) {
            // Revertir la transacción anterior
            if (oldTransaction.account) {
              updatedAccounts = updatedAccounts.map(account => {
                if (account.id === oldTransaction.account) {
                  return {
                    ...account,
                    balance: account.balance + (
                      oldTransaction.type === 'income'
                        ? -oldTransaction.amount
                        : oldTransaction.amount
                    )
                  };
                }
                return account;
              });
            }

            // Aplicar la nueva transacción
            const newAmount = updates.amount ?? oldTransaction.amount;
            const newType = updates.type ?? oldTransaction.type;
            const newAccount = updates.account ?? oldTransaction.account;

            updatedAccounts = updatedAccounts.map(account => {
              if (account.id === newAccount) {
                return {
                  ...account,
                  balance: account.balance + (
                    newType === 'income'
                      ? newAmount
                      : -newAmount
                  )
                };
              }
              return account;
            });
          }

          return {
            transactions: state.transactions.map(transaction =>
              transaction.id === id
                ? {
                    ...transaction,
                    ...updates,
                    updatedAt: new Date().toISOString(),
                  }
                : transaction
            ),
            accounts: updatedAccounts
          };
        }),

      deleteTransaction: (id) =>
        set((state) => {
          const transaction = state.transactions.find(t => t.id === id);
          if (!transaction) return state;

          // Actualizar balance de la cuenta
          const updatedAccounts = state.accounts.map(account => {
            if (account.id === transaction.account) {
              return {
                ...account,
                balance: account.balance + (
                  transaction.type === 'income'
                    ? -transaction.amount
                    : transaction.amount
                )
              };
            }
            return account;
          });

          return {
            transactions: state.transactions.filter(t => t.id !== id),
            accounts: updatedAccounts
          };
        }),

      addAccount: (account) =>
        set((state) => ({
          accounts: [
            ...state.accounts,
            {
              ...account,
              id: crypto.randomUUID(),
            },
          ],
        })),

      updateAccount: (id, updates) =>
        set((state) => ({
          accounts: state.accounts.map((account) =>
            account.id === id ? { ...account, ...updates } : account
          ),
        })),

      deleteAccount: (id) =>
        set((state) => {
          // Verificar si hay transacciones asociadas
          const hasTransactions = state.transactions.some(t => t.account === id);
          if (hasTransactions) {
            throw new Error('No se puede eliminar una cuenta con transacciones');
          }
          return {
            accounts: state.accounts.filter((account) => account.id !== id),
          };
        }),

      addBudget: (budget) =>
        set((state) => ({
          budgets: [
            ...state.budgets,
            {
              ...budget,
              id: crypto.randomUUID(),
            },
          ],
        })),

      updateBudget: (id, updates) =>
        set((state) => ({
          budgets: state.budgets.map((budget) =>
            budget.id === id ? { ...budget, ...updates } : budget
          ),
        })),

      deleteBudget: (id) =>
        set((state) => ({
          budgets: state.budgets.filter((budget) => budget.id !== id),
        })),
    }),
    {
      name: 'finance-storage',
    }
  )
);