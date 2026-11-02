import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from 'lucide-react';

const slides = [
  { title: 'Your next insight is already here.', description: 'Connect revenue, customers, and performance in one clear view. See the signals that move your business forward.', label: 'REVENUE OVERVIEW', metric: 'Growth, in perspective', badge: 'Revenue + customers', secondary: 'Revenue by category', type: 'line' },
  { title: 'A fresh perspective. Every time.', description: 'Explore ten chart types, switch to exact data, and find the view that makes your next decision easier.', label: 'EXPLORE YOUR PERFORMANCE', metric: 'One dataset. More clarity.', badge: '10 chart types', secondary: 'Your strongest regions', type: 'bar' },
  { title: 'Good insights deserve to travel.', description: 'Turn filtered analytics into focused reports and shareable CSVs. Bring your whole team into the picture.', label: 'REPORTING, SIMPLIFIED', metric: 'From insight to impact.', badge: 'Ready to share', secondary: 'A snapshot worth sharing', type: 'report' },
] as const;

export function LoginCarousel() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!playing || hovered || focused) return;
    const timer = window.setInterval(() => setIndex(i => (i + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, [playing, hovered, focused]);
  const slide = slides[index];
  const move = (direction: number) => setIndex(i => (i + direction + slides.length) % slides.length);
  return <section className="login-carousel" aria-label="Explore Nexora" aria-roledescription="carousel" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false); }} onKeyDown={e => { if (e.target instanceof HTMLSelectElement || e.target instanceof HTMLInputElement) return; if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); } if (e.key === 'ArrowRight') { e.preventDefault(); move(1); } }}>
    <svg className="carousel-ribbons" viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="600" height="900" fill="#5b46cd" />{Array.from({ length: 15 }, (_, i) => <path key={i} d={`M${-480 + i * 68} -60 C${850 + i * 16} 160 ${-440 + i * 25} 520 ${-120 + i * 68} 980`} fill="none" stroke={i % 2 ? '#a296ee' : '#7c65df'} strokeWidth="43" opacity={.38 + (i % 3) * .13} />)}</svg>
    <div className="carousel-topline"><span className="carousel-badge">THE NEXORA PERSPECTIVE</span><span>0{index + 1} / 0{slides.length}</span></div>
    <div className="carousel-slide" key={index} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${slides.length}`}>
      <div className="carousel-art" role="img" aria-label={`Illustration: ${slide.label.toLowerCase()}`}>
        <div className="preview-card preview-primary"><div className="preview-heading"><span>{slide.label}</span><span>Last 30 days</span></div><div className="preview-metric">{slide.metric}</div><span className="preview-growth"><ArrowUpRight size={12} />{slide.badge}</span>{slide.type === 'line' ? <svg viewBox="0 0 360 120" fill="none" aria-hidden="true"><path d="M0 25H360M0 60H360M0 95H360" stroke="#e9e7f3" strokeDasharray="3 4" /><path d="M0 95C25 95 25 25 55 38S95 100 120 65S155 20 180 55S210 90 240 50S280 20 300 35S340 65 360 10" stroke="#7b5ee9" strokeWidth="3" /><path d="M0 70C30 90 40 95 60 68S100 45 130 75S180 90 210 63S250 20 280 40S320 80 360 28" stroke="#e5bb53" strokeWidth="2" /></svg> : slide.type === 'bar' ? <div className="preview-bars">{[35, 62, 48, 82, 60, 95, 76, 100].map((h, i) => <span key={i} style={{ height: `${h}%`, opacity: .45 + i * .07 }} />)}</div> : <div className="preview-report">{['Revenue summary', 'Customer performance', 'Product insights'].map((label, i) => <div key={label}><span className="preview-file">↗</span><span>{label}<small>Filtered analytics · CSV</small></span><b>{['Ready', 'Ready', 'Ready'][i]}</b></div>)}</div>}<div className="preview-axis"><span>01 Oct</span><span>10 Oct</span><span>20 Oct</span><span>30 Oct</span></div></div>
        <div className="preview-card preview-secondary"><div className="preview-heading"><span>{slide.secondary}</span><span>•••</span></div><div className="preview-breakdown"><div className="preview-donut" /><div className="preview-legend">{['Software', 'Subscriptions', 'Services'].map((label, i) => <div key={label}><i style={{ background: ['#8063e9', '#5bc6cb', '#edca67'][i] }} /><span>{label}</span><b>{[46, 32, 22][i]}%</b></div>)}</div></div></div>
      </div>
      <div className="carousel-copy" aria-live={playing ? 'off' : 'polite'}><h2>{slide.title}</h2><p>{slide.description}</p></div>
    </div>
    <div className="carousel-controls"><button type="button" aria-label="Previous slide" onClick={() => move(-1)}><ArrowLeft size={18} /></button><div className="carousel-dots">{slides.map((s, i) => <button key={s.title} type="button" aria-label={`Go to slide ${i + 1}`} aria-current={index === i ? 'true' : undefined} onClick={() => setIndex(i)} />)}</div><button type="button" aria-label="Next slide" onClick={() => move(1)}><ArrowRight size={18} /></button><button className="carousel-play" type="button" aria-label={playing ? 'Pause slideshow' : 'Play slideshow'} onClick={() => setPlaying(!playing)}>{playing ? <Pause size={14} /> : <Play size={14} />}</button></div>
  </section>;
}
