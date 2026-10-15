import type { HeroColors } from './hero-scene';

/*
 * Decides whether the 3D hero runs, and loads Three.js only if it does.
 * The server-rendered SVG fallback stays underneath and fades out (via the
 * `data-live` attribute) once the first 3D frame is drawn.
 */

const DESKTOP = '(min-width: 64rem)';
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

function deviceCanRun3D(): boolean {
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

export function initHero(art: HTMLElement, stage: HTMLElement): void {
  const desktop = window.matchMedia(DESKTOP);
  const reduced = window.matchMedia(REDUCED_MOTION);

  // Checked lazily so phones never create a WebGL context just to test it.
  let capable: boolean | undefined;
  let dispose: (() => void) | undefined;
  let starting = false;

  const start = async () => {
    if (dispose || starting || !desktop.matches || reduced.matches) return;
    capable ??= deviceCanRun3D();
    if (!capable) return;
    starting = true;
    const { mountHero } = await import('./hero-scene');
    starting = false;
    // Conditions may have changed while the chunk was loading.
    if (dispose || !desktop.matches || reduced.matches) return;
    dispose = mountHero(stage, readColors(), () => art.setAttribute('data-live', ''));
  };

  const stop = () => {
    dispose?.();
    dispose = undefined;
    art.removeAttribute('data-live');
  };

  const update = () => (desktop.matches && !reduced.matches ? void start() : stop());
  desktop.addEventListener('change', update);
  reduced.addEventListener('change', update);

  // Load after the page is idle so the hero never competes with content.
  if ('requestIdleCallback' in window) window.requestIdleCallback(update, { timeout: 2000 });
  else setTimeout(update, 200);
}
