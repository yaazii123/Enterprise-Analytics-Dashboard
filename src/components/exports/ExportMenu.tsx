import { useRef, useState } from 'react';
import { ChevronDown, Download, FileSpreadsheet, FileText, Presentation, LoaderCircle } from 'lucide-react';
import { useAppSelector } from '@/store';
import { captureDashboard, exportPdf, exportPowerPoint } from '@/utils/documentExport';

export function ExportMenu({ onCsv, disabled = false }: { onCsv: () => void; disabled?: boolean }) {
  const filters = useAppSelector(s => s.filters);
  const menu = useRef<HTMLDetailsElement>(null);
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');
  async function generate(format: 'PDF' | 'PowerPoint') {
    menu.current?.removeAttribute('open'); setMessage('');
    try {
      const root = menu.current?.closest('main');
      if (!root) throw new Error('Dashboard content is unavailable.');
      const report = captureDashboard(root, `${filters.range.from} to ${filters.range.to} | Regions: ${filters.regions.join(', ') || 'All'} | Categories: ${filters.categories.join(', ') || 'All'}`);
      setBusy(format);
      if (format === 'PDF') await exportPdf(report); else await exportPowerPoint(report);
      setMessage(`${format} downloaded.`);
    } catch (error) { setMessage(`Export failed: ${error instanceof Error ? error.message : 'Please try again.'}`); }
    finally { setBusy(''); }
  }
  return <div className="export-control"><details ref={menu}><summary className="primary" aria-label="Export data" onClick={e => { if (busy || disabled) e.preventDefault(); }} aria-disabled={!!busy || disabled}>{busy ? <LoaderCircle size={15} className="spin" /> : <Download size={15} />}<span>{busy ? `Creating ${busy}…` : 'Export data'}</span><ChevronDown size={13} /></summary><div className="popover export-options"><button disabled={!!busy || disabled} onClick={() => { onCsv(); menu.current?.removeAttribute('open'); }}><FileSpreadsheet size={16} /><span>CSV<small>Filtered order records</small></span></button><button disabled={!!busy || disabled} onClick={() => generate('PDF')}><FileText size={16} /><span>PDF document<small>Current page metrics and charts</small></span></button><button disabled={!!busy || disabled} onClick={() => generate('PowerPoint')}><Presentation size={16} /><span>PowerPoint presentation<small>Summary and chart slides (.pptx)</small></span></button></div></details>{message && <span className={`export-status ${message.startsWith('Export failed') ? 'negative' : 'positive'}`} role="status">{message}</span>}</div>;
}
