import { getInstanceByDom } from 'echarts/core';
export interface ExportSection { title: string; description: string; image?: string; imageWidth?: number; imageHeight?: number; headers?: string[]; rows?: string[][] }
export interface DashboardDocument { title: string; filters: string; generated: string; metrics: { label: string; value: string; change: string }[]; sections: ExportSection[] }
const content = (el: Element | null) => el?.textContent?.trim() || '';
export function captureDashboard(root: HTMLElement, filters: string): DashboardDocument {
  if (root.querySelector('[aria-busy="true"]')) throw new Error('Wait for analytics to finish loading, then export again.');
  if (root.querySelector('[role="alert"]')) throw new Error('Resolve the page error before exporting.');
  const metrics = [...root.querySelectorAll('.kpi')].map(card => ({ label: content(card.querySelector('.kpi-label')), value: content(card.querySelector('.metric')), change: content(card.querySelector('.kpi-bottom')) }));
  const sections = [...root.querySelectorAll('.panel:not(.kpi)')].map(panel => {
    const chart = panel.querySelector<HTMLElement>('.echarts-for-react');
    const section: ExportSection = { title: content(panel.querySelector('h2')) || 'Analytics data', description: content(panel.querySelector('.panel-heading p')) };
    if (chart) {
      const instance = getInstanceByDom(chart);
      if (!instance) throw new Error('A chart is still initializing. Please try exporting again.');
      section.imageWidth = instance.getWidth(); section.imageHeight = instance.getHeight();
      section.image = instance.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: getComputedStyle(root).getPropertyValue('--surface').trim() || '#ffffff' });
    }
    const table = panel.querySelector('table');
    if (table) {
      section.headers = [...table.querySelectorAll('thead th')].map(content);
      section.rows = [...table.querySelectorAll('tbody tr')].map(row => [...row.querySelectorAll('td')].map(cell => cell.textContent?.trim() || ''));
      // Selection checkboxes are a UI control, not a report column.
      if (section.headers[0] === '' && section.rows.some(row => row[0] === '')) { section.headers.shift(); section.rows.forEach(row => row.shift()); }
      section.description += ' Table includes the rows currently shown on this page.';
    }
    if (!section.image && !table) section.description = content(panel.querySelector('p')) || content(panel.querySelector('.empty')) || section.description;
    return section;
  });
  if (!metrics.length && !sections.length) throw new Error('No report content is ready to export.');
  return { title: content(root.querySelector('h1')).replace(/\.$/, ''), filters, generated: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST', metrics, sections };
}
const filename = (doc: DashboardDocument) => `nexora-${doc.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
const ascii = (s: string) => s.replace(/[–—−]/g, '-').replace(/→/g, 'to').replace(/[^\x20-\x7E\n]/g, '');

export async function createPdf(report: DashboardDocument) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const heading = (title: string) => {
    pdf.setFillColor(99, 91, 255); pdf.rect(0, 0, 297, 3, 'F');
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(10); pdf.setTextColor(99, 91, 255); pdf.text('NEXORA ANALYTICS', 15, 15);
    pdf.setTextColor(32, 36, 54); pdf.setFontSize(20); pdf.text(ascii(title).slice(0, 85), 15, 29);
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); pdf.setTextColor(100, 107, 125);
    pdf.text(pdf.splitTextToSize(ascii(report.filters), 265), 15, 38);
    pdf.setFontSize(8); pdf.text(`Generated ${report.generated} | Mock analytics`, 15, 200);
  };
  heading(report.title);
  if (report.metrics.length) report.metrics.forEach((m, i) => {
    const x = 15 + i % 3 * 90, y = 62 + Math.floor(i / 3) * 51;
    pdf.setDrawColor(228, 231, 240); pdf.roundedRect(x, y, 85, 43, 2, 2);
    pdf.setFontSize(10); pdf.setTextColor(100, 107, 125); pdf.text(ascii(m.label), x + 6, y + 10);
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(22); pdf.setTextColor(32, 36, 54); pdf.text(ascii(m.value), x + 6, y + 24);
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); pdf.text(pdf.splitTextToSize(ascii(m.change), 74), x + 6, y + 34);
  });
  else { pdf.setFontSize(12); pdf.text('Page details and tables follow.', 15, 65); }
  for (const section of report.sections) {
    pdf.addPage(); heading(section.title);
    pdf.setFontSize(9); pdf.text(pdf.splitTextToSize(ascii(section.description), 265), 15, 50);
    if (section.image) { const fit = fitImage(section, 262, 122); pdf.addImage(section.image, 'PNG', 17 + (262 - fit.w) / 2, 62, fit.w, fit.h, undefined, 'FAST'); }
    if (section.headers?.length) {
      const width = 267 / section.headers.length;
      const rows = section.rows || [];
      const header = () => { pdf.setFillColor(242, 241, 255); pdf.rect(15, 62, 267, 10, 'F'); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8); section.headers!.forEach((h, i) => pdf.text(ascii(h).slice(0, 35), 17 + width * i, 68, { maxWidth: width - 4 })); pdf.setFont('helvetica', 'normal'); };
      header();
      rows.forEach((row, i) => {
        if (i && i % 12 === 0) { pdf.addPage(); heading(`${section.title} (continued)`); header(); }
        const y = 77 + i % 12 * 9;
        pdf.setFontSize(7); row.forEach((v, c) => pdf.text(ascii(v).slice(0, Math.max(8, Math.floor(width / 1.5))), 17 + width * c, y, { maxWidth: width - 4 }));
        pdf.setDrawColor(238, 240, 245); pdf.line(15, y + 3, 282, y + 3);
      });
    }
  }
  return pdf;
}

export async function createPowerPoint(report: DashboardDocument) {
  const { default: PptxGenJS } = await import('pptxgenjs');
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE'; pptx.author = 'Nexora Analytics'; pptx.subject = report.filters; pptx.title = report.title; pptx.company = 'Nexora';
  const heading = (title: string) => {
    const slide = pptx.addSlide(); slide.background = { color: 'FFFFFF' };
    slide.addText('NEXORA ANALYTICS', { x: .5, y: .25, w: 12, h: .25, fontSize: 10, bold: true, color: '635BFF' });
    slide.addText(title, { x: .5, y: .7, w: 12, h: .5, fontSize: 25, bold: true, color: '202436', breakLine: false });
    slide.addText(report.filters, { x: .5, y: 1.25, w: 12, h: .5, fontSize: 10, color: '687085' });
    slide.addText(`Generated ${report.generated} | Mock analytics`, { x: .5, y: 7.1, w: 12, h: .2, fontSize: 8, color: '687085' });
    return slide;
  };
  const summary = heading(report.title);
  if (report.metrics.length) report.metrics.forEach((m, i) => {
    const x = .5 + i % 3 * 4.15, y = 2.05 + Math.floor(i / 3) * 1.9;
    summary.addText(m.label, { x, y, w: 3.8, h: .3, fontSize: 12, color: '687085' });
    summary.addText(m.value, { x, y: y + .4, w: 3.8, h: .6, fontSize: 30, bold: true, color: '202436' });
    summary.addText(m.change, { x, y: y + 1.1, w: 3.8, h: .4, fontSize: 10, color: '687085' });
  });
  else summary.addText('Page details and tables follow.', { x: .5, y: 2.2, w: 12, h: .5, fontSize: 16, color: '687085' });
  for (const section of report.sections) {
    const slide = heading(section.title);
    slide.addText(section.description, { x: .5, y: 1.75, w: 12, h: .5, fontSize: 10, color: '687085' });
    if (section.image) { const fit = fitImage(section, 12.1, 4.35); slide.addImage({ data: section.image, x: .6 + (12.1 - fit.w) / 2, y: 2.4, w: fit.w, h: fit.h }); }
    if (section.headers?.length) {
      const rows = section.rows || [];
      for (let offset = 0; offset < Math.max(rows.length, 1); offset += 10) {
        const tableSlide = offset ? heading(`${section.title} (continued)`) : slide;
        tableSlide.addTable([section.headers, ...rows.slice(offset, offset + 10)].map((row, i) => row.map(text => ({ text, options: { bold: i === 0, fill: { color: i === 0 ? 'F2F1FF' : 'FFFFFF' } } }))), { x: .5, y: 2.4, w: 12.3, colW: 12.3 / section.headers.length, rowH: .33, fontSize: 9, color: '202436', border: { pt: .5, color: 'E4E7F0' }, fill: { color: 'FFFFFF' }, margin: .07, bold: false, autoPage: false });
      }
    }
  }
  return pptx;
}

function fitImage(section: ExportSection, w: number, h: number) {
  const ratio = (section.imageWidth || 800) / (section.imageHeight || 300);
  return w / ratio <= h ? { w, h: w / ratio } : { w: h * ratio, h };
}
export async function exportPdf(report: DashboardDocument) { (await createPdf(report)).save(`${filename(report)}.pdf`); }
export async function exportPowerPoint(report: DashboardDocument) { await (await createPowerPoint(report)).writeFile({ fileName: `${filename(report)}.pptx` }); }
