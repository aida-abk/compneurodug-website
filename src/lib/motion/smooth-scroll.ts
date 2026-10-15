import Lenis from 'lenis';

/*
 * Lenis smooth scrolling, site-wide. Off when reduced motion is requested,
 * and switched off live if that preference changes. Anchor links land below
 * the sticky nav.
 */
export function initSmoothScroll(): void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let lenis: Lenis | undefined;

  const start = () => {
    if (lenis || reduced.matches) return;
    const nav = document.querySelector('header');
    lenis = new Lenis({ autoRaf: true, anchors: { offset: -(nav?.offsetHeight ?? 0) } });
  };

  const stop = () => {
    lenis?.destroy();
    lenis = undefined;
  };

  reduced.addEventListener('change', () => (reduced.matches ? stop() : start()));
  start();
}
