import { useState, useCallback } from 'react';

interface HistoryItem {
  id: string;
  product: {
    title: string;
    price: string;
    image: string;
    url: string;
    asin: string;
  };
  timestamp: number;
  query: string;
}

const HISTORY_KEY = 'product_history';
const MAX_HISTORY_ITEMS = 100; // Keep last 100 items

export function useProductHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const loadHistory = useCallback(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
    return [];
  }, []);

  const addToHistory = useCallback((product: any, query: string) => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      let currentHistory: HistoryItem[] = stored ? JSON.parse(stored) : [];

      // Create new history item
      const newItem: HistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        product: {
          title: product.title,
          price: product.price,
          image: product.image,
          url: product.url,
          asin: product.asin,
        },
        timestamp: Date.now(),
        query,
      };

      // Add to beginning of array (most recent first)
      currentHistory.unshift(newItem);

      // Keep only last MAX_HISTORY_ITEMS
      if (currentHistory.length > MAX_HISTORY_ITEMS) {
        currentHistory = currentHistory.slice(0, MAX_HISTORY_ITEMS);
      }

      // Save to localStorage
      localStorage.setItem(HISTORY_KEY, JSON.stringify(currentHistory));
      setHistory(currentHistory);

      console.log('[History] Added item:', newItem.product.title);
    } catch (e) {
      console.error('Failed to add to history:', e);
    }
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
    console.log('[History] Cleared all history');
  }, []);

  return {
    history,
    loadHistory,
    addToHistory,
    clearHistory,
  };
}
