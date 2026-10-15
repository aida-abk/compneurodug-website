// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.browncompneuro.com',
  integrations: [react(), sitemap(), mdx()],

  vite: {
    plugins: [tailwindcss()],
    // Pre-bundle the lazily imported motion libraries at dev-server start.
    // Otherwise Vite discovers them on first import, re-optimizes, and the
    // page can request a stale copy (504 "Outdated Optimize Dep").
    optimizeDeps: {
      include: ['three', 'gsap', 'gsap/ScrollTrigger', 'gsap/DrawSVGPlugin', 'lenis']
    }
  },

  adapter: vercel()
});
