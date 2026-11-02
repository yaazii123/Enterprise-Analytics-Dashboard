/** localStorage wrapper that never throws (private mode, quota, SSR). */
export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T): void {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  },
  remove(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

export const STORAGE_KEYS = {
  theme: 'nsa.theme',
  sidebar: 'nsa.sidebar',
  session: 'nsa.session',
  preferences: 'nsa.preferences',
  filters: 'nsa.filters',
} as const;
