const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});
const currencyPrecise = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const currencyCompact = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});
const numberFmt = new Intl.NumberFormat('en-US');
const numberCompact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

export const formatCurrency = (n: number): string => currency.format(n);
export const formatCurrencyPrecise = (n: number): string => currencyPrecise.format(n);
export const formatCurrencyCompact = (n: number): string => currencyCompact.format(n);
export const formatNumber = (n: number): string => numberFmt.format(Math.round(n));
export const formatNumberCompact = (n: number): string => numberCompact.format(n);

/** `value` is already a percentage number, e.g. 3.4 -> "3.4%". */
export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

export function formatSignedPercent(value: number, digits = 1): string {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return `${sign}${Math.abs(value).toFixed(digits)}%`;
}

export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}
