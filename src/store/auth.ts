import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  signIn: async (email: string, password: string) => {
    set({ loading: true });
    try {
      // Simulamos autenticación local
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const user = storedUsers.find((u: User & { password: string }) => 
        u.email === email && u.password === password
      );
      
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      const { password: _, ...userWithoutPassword } = user;
      set({ user: userWithoutPassword, loading: false });
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  signUp: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      
      if (storedUsers.some((u: User) => u.email === email)) {
        throw new Error('Email already exists');
      }
      
      const newUser = {
        id: crypto.randomUUID(),
        email,
        password,
        name: email.split('@')[0]
      };
      
      storedUsers.push(newUser);
      localStorage.setItem('users', JSON.stringify(storedUsers));
      
      const { password: _, ...userWithoutPassword } = newUser;
      set({ user: userWithoutPassword, loading: false });
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  signOut: () => {
    set({ user: null });
    localStorage.removeItem('currentUser');
  },
}));