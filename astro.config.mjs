// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// https://astro.build/config
// Fully static output (dist/). Vercel detects Astro and serves it as is; no
// adapter needed since there are no server routes.
export default defineConfig({
  site: 'https://www.browncompneuro.com',
  integrations: [react(), sitemap(), mdx()],
  // The whole stylesheet is ~6 KB gzipped: inlining it removes the only
  // render-blocking request, which was delaying mobile LCP by ~1.3s.
  build: { inlineStylesheets: 'always' },
  // /about was renamed /board (Oct 2026); keep old links working.
  redirects: { '/about': '/board' },

  vite: {
    plugins: [tailwindcss()],
    // Pre-bundle the lazily imported motion libraries at dev-server start.
    // Otherwise Vite discovers them on first import, re-optimizes, and the
    // page can request a stale copy (504 "Outdated Optimize Dep").
    optimizeDeps: {
      include: ['three', 'gsap', 'gsap/ScrollTrigger', 'gsap/DrawSVGPlugin', 'lenis']
    }
  }
});
