/** Categorical palette used by every chart; tuned to read on light and dark surfaces. */
export const CHART_PALETTE = [
  '#6366f1', // indigo
  '#0ea5e9', // sky
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#8b5cf6', // violet
  '#14b8a6', // teal
] as const;

export const STATUS_COLORS = {
  positive: '#10b981',
  negative: '#ef4444',
  neutral: '#71717a',
} as const;
