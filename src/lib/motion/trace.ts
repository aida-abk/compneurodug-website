import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

/*
 * Line drawings trace themselves in as they scroll into view.
 *
 * Markup contract (inside a `[data-figure] [data-drawing]` SVG):
 *   [data-trace-group="outline"]     children draw in first, staggered
 *   [data-trace-group="annotation"]  then each group in document order, where
 *     [data-trace-draw]   strokes draw in
 *     [data-trace-reveal] elements fade and scale in
 *
 * Nothing is hidden until this runs, and gsap.matchMedia reverts everything
 * if reduced motion is (or becomes) requested, so drawings are always
 * complete without JavaScript or motion.
 */

const OUTLINE_STAGGER = 0.035;
const SCRUB = 0.8; // seconds the drawing lags behind the scrollbar

export function initTrace(): void {
  const drawings = document.querySelectorAll<SVGSVGElement>('[data-figure] [data-drawing]');
  if (!drawings.length) return;

  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    drawings.forEach((svg) => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: svg, start: 'top 85%', end: 'bottom 60%', scrub: SCRUB },
      });

      const outline = svg.querySelectorAll('[data-trace-group="outline"] > *');
      if (outline.length) tl.from(outline, { drawSVG: 0, duration: 1, stagger: OUTLINE_STAGGER });

      svg.querySelectorAll('[data-trace-group="annotation"]').forEach((group) => {
        group.querySelectorAll<SVGElement>('[data-trace-draw], [data-trace-reveal]').forEach((el) => {
          if (el.hasAttribute('data-trace-draw')) {
            tl.from(el, { drawSVG: 0, duration: 0.4 });
          } else {
            tl.from(el, { opacity: 0, scale: 0.6, transformOrigin: '50% 50%', duration: 0.3, ease: 'power2.out' });
          }
        });
      });
    });
  });
}
