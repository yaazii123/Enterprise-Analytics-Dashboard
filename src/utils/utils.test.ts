import { describe, expect, it } from 'vitest';
import { addDays, diffDays, pickGranularity, presetToRange, previousRange, rangeLength } from './date';
import { escapeCsvCell, toCsv } from './csv';
import { formatCurrency, formatSignedPercent, percentChange } from './format';
import { can, canAccess } from './permissions';
import { mulberry32 } from './rng';

describe('date utils', () => {
  it('adds days across month boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('computes inclusive range length and day difference', () => {
    expect(diffDays('2026-01-01', '2026-01-31')).toBe(30);
    expect(rangeLength({ from: '2026-01-01', to: '2026-01-31' })).toBe(31);
  });

  it('builds presets ending today', () => {
    expect(presetToRange('today', '2026-11-02')).toEqual({ from: '2026-11-02', to: '2026-11-02' });
    expect(presetToRange('7d', '2026-11-02')).toEqual({ from: '2026-10-27', to: '2026-11-02' });
    expect(rangeLength(presetToRange('90d', '2026-11-02'))).toBe(90);
  });

  it('previous range is adjacent and same length', () => {
    const r = { from: '2026-10-04', to: '2026-11-02' };
    const p = previousRange(r);
    expect(p.to).toBe('2026-10-03');
    expect(rangeLength(p)).toBe(rangeLength(r));
  });

  it('chooses granularity by span', () => {
    expect(pickGranularity({ from: '2026-10-01', to: '2026-10-07' })).toBe('day');
    expect(pickGranularity({ from: '2026-08-01', to: '2026-11-01' })).toBe('week');
    expect(pickGranularity({ from: '2025-01-01', to: '2026-01-01' })).toBe('month');
  });
});

describe('csv utils', () => {
  it('escapes quotes, commas and newlines', () => {
    expect(escapeCsvCell('a,b')).toBe('"a,b"');
    expect(escapeCsvCell('say "hi"')).toBe('"say ""hi"""');
    expect(escapeCsvCell('x\ny')).toBe('"x\ny"');
  });

  it('neutralises formula injection in strings but not numbers', () => {
    expect(escapeCsvCell('=SUM(A1)')).toBe("'=SUM(A1)");
    expect(escapeCsvCell(-5)).toBe('-5');
  });

  it('serialises rows with CRLF line endings', () => {
    expect(toCsv(['a', 'b'], [[1, 'x'], [2, null]])).toBe('a,b\r\n1,x\r\n2,');
  });
});

describe('format utils', () => {
  it('formats currency and signed percentages', () => {
    expect(formatCurrency(1234.5)).toBe('$1,235');
    expect(formatSignedPercent(12.34)).toBe('+12.3%');
    expect(formatSignedPercent(-3)).toBe('−3.0%');
  });

  it('handles zero baselines in percentChange', () => {
    expect(percentChange(10, 0)).toBe(100);
    expect(percentChange(0, 0)).toBe(0);
    expect(percentChange(110, 100)).toBeCloseTo(10);
  });
});

describe('permissions', () => {
  it('restricts pages and capabilities by role', () => {
    expect(canAccess('admin', 'reports')).toBe(true);
    expect(canAccess('analyst', 'reports')).toBe(false);
    expect(canAccess('analyst', 'customers')).toBe(false);
    expect(can('manager', 'settings:team')).toBe(false);
    expect(can(undefined, 'export:csv')).toBe(false);
  });
});

describe('rng', () => {
  it('is deterministic for a given seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
});
