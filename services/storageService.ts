
import { FileHistory } from '../types';

const HISTORY_PREFIX = 'mannu_history_';

export const storageService = {
  saveToHistory: (userId: string, historyItem: Omit<FileHistory, 'id' | 'timestamp'>) => {
    const key = `${HISTORY_PREFIX}${userId}`;
    const existing = storageService.getHistory(userId);
    const newItem: FileHistory = {
      ...historyItem,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };
    const updated = [newItem, ...existing].slice(0, 10); // Keep last 10
    localStorage.setItem(key, JSON.stringify(updated));
  },

  getHistory: (userId: string): FileHistory[] => {
    const key = `${HISTORY_PREFIX}${userId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }
};
