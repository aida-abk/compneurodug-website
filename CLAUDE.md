# CLAUDE.md

Website for Brown's Computational Neuroscience Departmental Undergraduate Group (DUG). Aida leads the club; the site is part of a full brand redesign. Co-leaders: Ah-Young, Nhi, Cal, Tiger.

- Production URL: https://www.browncompneuro.com (the old site there is being replaced)
- Substack: https://substack.com/@browncompneurodugnewsletter — RSS at https://browncompneurodugnewsletter.substack.com/feed
- Figma brand board: file key `T6DcLXl6cROcY86o2LpNv7` (page `0:1`, "1 · Guidelines"). Color frame `5:136`, typography `5:242`, motion `5:535`, logo `4:62`, co-branding `4:253`. The board has no page layouts; Claude designs layouts from its tokens and type scale.

## Stack

- Astro 7 + TypeScript (strict), React islands only for interactive pieces
- Tailwind CSS v4 via `@tailwindcss/vite`, driven by design tokens
- Three.js via `@react-three/fiber` + `@react-three/drei` (3D hero only)
- GSAP (ScrollTrigger, DrawSVG) for scroll animation, Lenis for smooth scrolling
- Content collections (Markdown) for events, members, resources
- Deploys to Vercel from GitHub (`@astrojs/vercel` adapter)

## Commands

- `npm run dev` — dev server (Claude runs it in the background: `npx astro dev --background`; manage with `astro dev stop|status|logs`)
- `npm run build` — production build
- `npx astro check` — type check `.astro`, `.ts`, `.tsx`

Before finishing any phase, `npm run build` and `npx astro check` both pass.

## Design direction

- Warm and light throughout. No dark sections. Modern and calm, Notion-inspired: generous whitespace, 1px Rule borders, Surface cards, small DM Mono labels, a quiet grid.
- Hero: a 3D wireframe crystalline cluster on the light Field background, drawn in Structure lines with coral Signal nodes (echoes the logo). Slow movement, subtle cursor response.
- Content sections: editorial and scientific. Fine single-weight anatomical line drawings with small "FIG. 1"-style DM Mono labels, and a grid of short labeled descriptions beneath. Drawings trace themselves in on scroll.
- Brand rules from the Figma board apply: proportion roughly Field 60% · Surface 25% · Structure 10% · Signal 5%. Text under 24px is Ink, Muted or Signal Text — never bright Signal.

## The token rule

- Every color, font, font size, line height, spacing step, radius and duration comes from a CSS variable defined in `src/styles/tokens.css` and exposed to Tailwind via `@theme` in `src/styles/global.css`.
- Never hard-code hex values, px sizes or font names in components or Tailwind arbitrary values (`text-[#172827]`, `p-[13px]` are not allowed). If a value is missing, add a token first.
- Token names follow the Figma variables (`DUG / Field` → `--dug-field` → Tailwind `bg-field`). Figma is the source of truth; if they disagree, ask Aida.
- `global.css` clears Tailwind's default colors, fonts, weights, type sizes and radii, so only brand utilities exist: colors `field surface structure signal ink muted signal-text signal-display rule`; type `text-display text-h1 text-h2 text-h3 text-body text-small text-label`; fonts `font-serif font-sans font-mono`; plus `container-page` and `label` utilities. Type tokens switch from mobile to desktop values at 48rem.
- The one exception: `public/favicon.svg` carries raw hex, because browsers can't read CSS variables there. Keep it in sync with `tokens.css`.
- Logo: `src/components/ui/LogoMark.astro` copies the Figma component geometry (Compact 3:66, Favicon 3:82). Never redraw, recolor or rotate it.
- Brown and Carney logos need written approval before use (Figma 03). Don't add them until Aida confirms.

## Motion rules

- `prefers-reduced-motion: reduce` disables 3D motion, scroll-triggered animation and Lenis smooth scrolling. Content must be fully visible and readable with all motion off (line drawings render fully drawn).
- The 3D hero is desktop only and lazy: load it with `client:visible` or `client:idle`, never `client:load`. Mobile, low-power devices (`navigator.hardwareConcurrency`, `saveData`, no WebGL) and reduced-motion users get a static image fallback.
- Animations initialise only after the content is in the DOM; animate `transform` and `opacity`, not layout properties.
- Pending: Aida reviews one motion version in phase 4 before the rules are final. The Figma board's motion spec (logo plays once, never loops) applies to the logo until then.

## Accessibility rules

- Semantic HTML: one `h1` per page, ordered headings, landmarks (`header`, `nav`, `main`, `footer`), lists for lists.
- Every image has meaningful `alt`; decorative images and SVG drawings use `alt=""` / `aria-hidden="true"`. Figures use `figure` + `figcaption`.
- Everything is reachable and operable by keyboard with a visible focus style. Include a skip-to-content link.
- Contrast meets WCAG AA using only the Figma "Readable pairs" (Ink on Field 11.8:1, Muted on Field 4.9:1, Signal Text on Field 4.6:1, Signal Display on Field 24px+ only).
- The canvas is decorative (`aria-hidden`); the hero's text content lives in HTML, not in WebGL.

## Performance rules

- Content pages ship zero client JavaScript unless a component needs it. Default to `.astro` components; reach for React only for interactivity.
- Use `astro:assets` (`<Image />`) for raster images. Self-host fonts.
- Aim for Lighthouse 90+ on Performance, Accessibility, Best Practices and SEO.

## Folder conventions

```
src/
  components/
    layout/     Nav, Footer, page shells
    ui/         Small reusable pieces (Button, Label, Card)
    hero/       3D hero (React island) and its static fallback
    figures/    Scroll-traced line drawings and FIG labels
  content/
    events/     One .md per event
    members/    One .md per team member (photos alongside or in src/assets)
    resources/  One .md per resource
  content.config.ts  Collection schemas — the contract for content files
  layouts/      Base page layout(s)
  lib/          Plain TS helpers (dates, RSS fetching)
  pages/        Routes
  styles/       tokens.css (variables), global.css (Tailwind + @theme)
public/         Files served as-is (favicons, OG images, static fallbacks)
```

- Components: PascalCase filenames (`EventCard.astro`). Content files: kebab-case slugs (`2026-10-30-journal-club.md`).
- Content files with `draft: true` never render. Placeholder entries stay drafts until Aida supplies real content.
- Content schemas change only with care: co-leaders rely on them. Document any field change in the README.

## Phases

Work one phase at a time and stop after each for Aida to review in the browser.

1. Scaffold, git, CLAUDE.md — done
2. Design tokens, fonts, base layout (nav + footer) — done
3. Homepage as static layout, no animation
4. 3D hero
5. Scroll-traced line drawings
6. Remaining pages (About/Team, Events, Resources, Newsletter) and the Substack RSS feed at build time
7. Deployment prep (Vercel, GitHub, metadata, Lighthouse pass)

## Open items

- Team roles, and which headshot (in `../website/headshots`) belongs to whom
- Resource content and categories (current schema: courses, research, reading)
- Real events
