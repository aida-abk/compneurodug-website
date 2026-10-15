import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { HeroColors } from './HeroScene';

// Three.js lives in this chunk and is only downloaded when the gate passes.
const HeroScene = lazy(() => import('./HeroScene'));

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

/** Desktop is handled by `client:media` in Hero.astro; this checks the rest. */
function canRun3D(): boolean {
  if (window.matchMedia(REDUCED_MOTION).matches) return false;

  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  if (nav.connection?.saveData) return false;
  if (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency < 4) return false;
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return false;

  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function readColors(): HeroColors {
  const css = getComputedStyle(document.documentElement);
  return {
    structure: css.getPropertyValue('--dug-structure').trim(),
    signal: css.getPropertyValue('--dug-signal').trim(),
  };
}

/**
 * Mounts the 3D hero over the static SVG when the device can handle it.
 * The SVG stays in the page (server-rendered) and fades out once the first
 * 3D frame is drawn, so there is never an empty hero.
 */
export default function HeroCanvas() {
  const container = useRef<HTMLDivElement>(null);
  const [colors, setColors] = useState<HeroColors | null>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (canRun3D()) setColors(readColors());

    // Respect a reduced-motion switch made while the page is open.
    const query = window.matchMedia(REDUCED_MOTION);
    const onChange = () => {
      if (query.matches) {
        setColors(null);
        container.current?.closest('[data-hero-art]')?.removeAttribute('data-live');
      }
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const el = container.current;
    if (!el || !colors) return;
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, [colors]);

  const onReady = () => container.current?.closest('[data-hero-art]')?.setAttribute('data-live', '');

  return (
    <div ref={container} className="absolute inset-0">
      {colors && (
        <Suspense fallback={null}>
          <HeroScene colors={colors} active={active} onReady={onReady} />
        </Suspense>
      )}
    </div>
  );
}
