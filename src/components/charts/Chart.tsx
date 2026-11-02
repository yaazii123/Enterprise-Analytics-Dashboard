import { useState } from 'react';
import ReactECharts from 'echarts-for-react/esm/core';
import * as echarts from 'echarts/core';
import { LineChart, BarChart, PieChart, ScatterChart, RadarChart, FunnelChart, TreemapChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, RadarComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { ChartNoAxesCombined, Table2, Download } from 'lucide-react';
import type { EChartsOption } from 'echarts';
import { useAppSelector } from '@/store';
import { downloadCsv, toCsv } from '@/utils/csv';

echarts.use([LineChart, BarChart, PieChart, ScatterChart, RadarChart, FunnelChart, TreemapChart, GridComponent, TooltipComponent, LegendComponent, RadarComponent, CanvasRenderer]);

const CHART_TYPES = ['line', 'area', 'bar', 'horizontal', 'pie', 'donut', 'scatter', 'radar', 'funnel', 'treemap'] as const;
export type ChartKind = (typeof CHART_TYPES)[number];
const labels: Record<ChartKind, string> = { line: 'Line', area: 'Area', bar: 'Bar', horizontal: 'Horizontal bar', pie: 'Pie', donut: 'Donut', scatter: 'Scatter', radar: 'Radar', funnel: 'Funnel', treemap: 'Treemap' };
const colors = ['#635bff', '#9d96ff', '#16b8a6', '#f5b956', '#ec7eaa', '#67a9ee'];

export function Chart({ data, kind = 'line', height = 260, title = 'Chart data' }: { data: { name: string; value: number }[]; kind?: ChartKind; height?: number; title?: string }) {
  const dark = useAppSelector(s => s.theme === 'dark');
  const [selected, setSelected] = useState<ChartKind>(kind);
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const text = dark ? '#a5aec3' : '#687085';
  const gridColor = dark ? '#2b3042' : '#eef0f6';
  const circular = selected === 'pie' || selected === 'donut';
  const cartesian = ['line', 'area', 'bar', 'horizontal', 'scatter'].includes(selected);
  const horizontal = selected === 'horizontal';
  const categoryAxis = { type: 'category' as const, data: data.map(d => d.name), boundaryGap: !['line', 'area'].includes(selected), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { hideOverlap: true, width: horizontal ? 110 : 85, overflow: 'truncate' as const, formatter: (v: string) => /^\d{4}-/.test(v) ? v.slice(5) : v } };
  const valueAxis = { type: 'value' as const, splitLine: { lineStyle: { color: gridColor, type: 'dashed' as const } }, axisLabel: { formatter: (v: number) => Math.abs(v) >= 1000 ? `${+(v / 1000).toFixed(1)}k` : String(v) } };
  const option: EChartsOption = {
    color: colors, backgroundColor: 'transparent', textStyle: { color: text, fontFamily: 'Inter Variable, Inter, sans-serif' },
    tooltip: { trigger: cartesian ? 'axis' : 'item', backgroundColor: dark ? '#222635' : '#fff', borderColor: gridColor, textStyle: { color: dark ? '#eef0fa' : '#202436', fontSize: 12 }, extraCssText: 'border-radius:8px;box-shadow:0 8px 24px #11152b14;' },
    ...(cartesian ? {
      grid: { left: horizontal ? 125 : 52, right: 22, top: 22, bottom: 38 },
      xAxis: horizontal ? valueAxis : categoryAxis, yAxis: horizontal ? categoryAxis : valueAxis,
      series: [{ name: title, type: selected === 'scatter' ? 'scatter' : selected === 'bar' || horizontal ? 'bar' : 'line', data: data.map(d => d.value), smooth: false, symbol: selected === 'scatter' ? 'circle' : 'none', symbolSize: 9, barMaxWidth: 30, lineStyle: { width: 2.5 }, areaStyle: selected === 'area' ? { opacity: .12 } : undefined, itemStyle: { borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0] } }],
    } : circular ? {
      legend: { type: 'scroll', bottom: 8, textStyle: { color: text, fontSize: 10 }, itemWidth: 10, itemHeight: 10 },
      series: [{ name: title, type: 'pie', radius: selected === 'donut' ? ['48%', '72%'] : '72%', center: ['50%', '43%'], label: { show: false }, data, emphasis: { label: { show: true, formatter: '{b}\n{d}%' } } }],
    } : selected === 'radar' ? {
      radar: { indicator: data.map(d => ({ name: d.name, max: Math.max(...data.map(p => p.value), 1) * 1.15 })), radius: '58%', axisName: { color: text, width: 80, overflow: 'truncate' }, splitLine: { lineStyle: { color: gridColor } }, splitArea: { show: false } },
      series: [{ name: title, type: 'radar', data: [{ name: title, value: data.map(d => d.value) }], areaStyle: { opacity: .12 } }],
    } : selected === 'funnel' ? {
      series: [{ name: title, type: 'funnel', left: '15%', width: '70%', top: 16, bottom: 16, sort: 'descending', gap: 3, label: { position: 'inside', color: '#fff', formatter: '{b}', overflow: 'truncate', width: 140 }, data }],
    } : {
      series: [{ name: title, type: 'treemap', data, roam: false, nodeClick: false, breadcrumb: { show: false }, top: 12, bottom: 12, left: 12, right: 12, label: { formatter: '{b}', color: '#fff' } }],
    }),
  };
  return <div className="chart-explorer"><div className="chart-toolbar"><div className="chart-view-switch" role="group" aria-label={`${title} view`}><button aria-label={`Show ${title} chart`} aria-pressed={view === 'chart'} onClick={() => setView('chart')}><ChartNoAxesCombined size={13} />Chart</button><button aria-label={`Show ${title} table`} aria-pressed={view === 'table'} onClick={() => setView('table')}><Table2 size={13} />Data</button></div><select aria-label={`${title} chart type`} value={selected} onChange={e => { setSelected(e.target.value as ChartKind); setView('chart'); }}>{CHART_TYPES.map(type => <option key={type} value={type}>{labels[type]}</option>)}</select><button className="chart-download" aria-label={`Download ${title} CSV`} onClick={() => downloadCsv(title, toCsv(['Label', 'Value'], data.map(d => [d.name, d.value])))}><Download size={13} /></button></div>{!data.length ? <div className="empty" style={{ height }}><span className="empty-icon" aria-hidden="true">↗</span><strong>No data for the selected filters.</strong><span>Try a wider date range or adjust your categories.</span></div> : view === 'table' ? <div className="chart-data-table table-scroll" style={{ height }} tabIndex={0} aria-label={`${title} data`}><table><caption className="sr-only">{title} — exact values for the current filters</caption><thead><tr><th scope="col">Label</th><th scope="col">Value</th></tr></thead><tbody>{data.map((d, i) => <tr key={`${d.name}-${i}`}><td>{d.name}</td><td>{d.value.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td></tr>)}</tbody></table></div> : <ReactECharts echarts={echarts} option={option} style={{ height }} notMerge />}</div>;
}
