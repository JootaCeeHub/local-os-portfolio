export interface MenuItem {
  id: string;
  title: string;
  icon: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
}

export interface FinanceData {
  id: string;
  date: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
}

export interface TradingRecord {
  id: string;
  date: string;
  asset: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  notes: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface ContentItem {
  id: string;
  title: string;
  contentType: string;
  status: 'draft' | 'in_review' | 'published';
  content: string;
  metadata: Record<string, any>;
  publishDate: string;
  createdAt: string;
  updatedAt: string;
}