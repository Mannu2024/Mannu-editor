
import { User } from '../types';

const USER_KEY = 'mannu_editor_user';

export const authService = {
  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  login: async (email: string, password?: string): Promise<User> => {
    // Simulated delay
    await new Promise(resolve => setTimeout(resolve, 800));
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: email,
      name: email.split('@')[0],
      avatar: `https://ui-avatars.com/api/?name=${email}&background=6366f1&color=fff`
    };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },

  loginWithGoogle: async (): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    const user: User = {
      id: 'google_' + Math.random().toString(36).substr(2, 9),
      email: 'user@gmail.com',
      name: 'Google User',
      avatar: 'https://lh3.googleusercontent.com/a/default-user'
    };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },

  logout: () => {
    localStorage.removeItem(USER_KEY);
  }
};
