# CLAUDE.md

Website for Brown's Computational Neuroscience Departmental Undergraduate Group (DUG). Aida leads the club; the site is part of a full brand redesign. Co-leaders: Ah-Young, Nhi, Cal, Tiger.

- Production URL: https://www.browncompneuro.com (the old site there is being replaced)
- Substack: https://substack.com/@browncompneurodugnewsletter — RSS at https://browncompneurodugnewsletter.substack.com/feed
- Figma brand board: file key `T6DcLXl6cROcY86o2LpNv7` (page `0:1`, "1 · Guidelines"). Color frame `5:136`, typography `5:242`, motion `5:535`, logo `4:62`, co-branding `4:253`. The board has no page layouts; Claude designs layouts from its tokens and type scale.

## Stack

- Astro 7 + TypeScript (strict), React islands only for interactive pieces
- Tailwind CSS v4 via `@tailwindcss/vite`, driven by design tokens
- Three.js, plain with named imports (3D hero only). React Three Fiber was dropped in phase 4: it doubled the hero bundle (240 KB → 131 KB gzipped without it)
- GSAP (ScrollTrigger, DrawSVG) for scroll animation, Lenis for smooth scrolling
- Content collections (Markdown) for events, members, resources
- Static output (`dist/`), deployed to Vercel from GitHub. No adapter: there are no server routes

## Commands

- `npm run check` — same as `npx astro check`

- `npm run dev` — dev server (Claude runs it in the background: `npx astro dev --background`; manage with `astro dev stop|status|logs`)
- `npm run build` — production build
- `npx astro check` — type check `.astro`, `.ts`, `.tsx`

Before finishing any phase, `npm run build` and `npx astro check` both pass.

## Design direction

- Warm and light throughout. No dark sections. Modern and calm, Notion-inspired: generous whitespace, 1px Rule borders, Surface cards, small DM Mono labels, a quiet grid.
- Hero: a 3D wireframe crystalline cluster on the light Field background, drawn in Structure lines with coral Signal nodes (echoes the logo). Slow movement, subtle cursor response.
- Content sections: editorial and scientific. Fine single-weight anatomical line drawings with small "FIG. 1"-style DM Mono labels, and a grid of short labeled descriptions beneath. Drawings trace themselves in on scroll.
- Type (Oct 2026, Aida's choice): Young Serif for display and headings (one weight, use `font-display`), Hanken Grotesk for text, DM Mono for labels. This replaces the board's Newsreader + DM Sans; the board's roles, scale and colors still apply. The Figma text styles should be updated to match.
- Dark green (Structure) is used for the footer. Partner logos never sit on it: the Brown logo lives in the light strip at the very bottom. On dark, small text uses Field or Rule (never coral), and focus rings switch to Field via `.on-dark`.
- Brand rules from the Figma board apply: proportion roughly Field 60% · Surface 25% · Structure 10% · Signal 5%. Text under 24px is Ink, Muted or Signal Text — never bright Signal.

## The token rule

- Every color, font, font size, line height, spacing step, radius and duration comes from a CSS variable defined in `src/styles/tokens.css` and exposed to Tailwind via `@theme` in `src/styles/global.css`.
- Never hard-code hex values, px sizes or font names in components or Tailwind arbitrary values (`text-[#172827]`, `p-[13px]` are not allowed). If a value is missing, add a token first.
- Token names follow the Figma variables (`DUG / Field` → `--dug-field` → Tailwind `bg-field`). Figma is the source of truth; if they disagree, ask Aida.
- `global.css` clears Tailwind's default colors, fonts, weights, type sizes and radii, so only brand utilities exist: colors `field surface structure signal ink muted signal-text signal-display rule`; type `text-display text-h1 text-h2 text-h3 text-body text-small text-label`; fonts `font-serif font-sans font-mono`; plus `container-page` and `label` utilities. Type tokens switch from mobile to desktop values at 48rem.
- The exceptions: `public/favicon.svg`, `public/favicon.ico`, `public/apple-touch-icon.png`, `public/og.png` and the `theme-color` meta tag carry raw brand colors, because browsers and social sites can't read CSS variables. Keep them in sync with `tokens.css`.
- Logo: `src/components/ui/LogoMark.astro` copies the Figma component geometry (Compact 3:66, Favicon 3:82). Never redraw, recolor or rotate it.
- Partner logos follow Figma 03: ours first, same height as our mark, 1px Rule divider, official unaltered files only (transparent padding may be trimmed). Toggle with `PARTNERS` in `src/lib/site.ts`. Brown: approved (Oct 2026), shown in the footer. Carney: hidden until an official transparent file replaces the grey-background PNG.

## Motion rules

- `prefers-reduced-motion: reduce` disables 3D motion, scroll-triggered animation and Lenis smooth scrolling. Content must be fully visible and readable with all motion off (line drawings render fully drawn).
- The 3D hero is desktop only and lazy: load it with `client:visible` or `client:idle`, never `client:load`. Mobile, low-power devices (`navigator.hardwareConcurrency`, `saveData`, no WebGL) and reduced-motion users get a static image fallback.
- Animations initialise only after the content is in the DOM; animate `transform` and `opacity`, not layout properties.
- Scroll tracing (phase 5): `Figure.astro` loads `src/lib/motion/trace.ts` (GSAP ScrollTrigger + DrawSVG, ~46 KB gzipped) only on pages with figures. It's tied directly to scroll position (`scrub: true`, no extra lag, since Lenis already smooths; done when the figure's top reaches 35% of the viewport), wrapped in `gsap.matchMedia` so reduced motion reverts it, and never hides anything before it runs.
- Smooth scrolling: `src/lib/motion/smooth-scroll.ts` (Lenis, ~5.5 KB) runs on every page from `BaseLayout.astro`, off under reduced motion; anchor links offset by the nav height.
- Don't animate the opacity of `.brain-region` with GSAP: CSS owns it for the hover highlight. Animate the `data-trace-reveal` wrapper instead.
- Hero (phase 4): a 1.4 KB script (`hero/hero-gate.ts`, run from `Hero.astro`) waits for idle, then checks desktop width (64rem+), reduced motion, Save-Data, CPU cores and memory (4+), and WebGL before lazy-importing `hero/hero-scene.ts` (Three.js). No React on the homepage. The server-rendered `HeroArt.astro` SVG stays underneath and fades out once the first 3D frame draws. Rendering pauses when the hero is off screen. Scene colors are read from the CSS tokens at runtime.
- Pending: Aida reviews this first motion version before the rules are final. The Figma board's motion spec (logo plays once, never loops) applies to the logo until then.

## Accessibility rules

- Semantic HTML: one `h1` per page, ordered headings, landmarks (`header`, `nav`, `main`, `footer`), lists for lists.
- Every image has meaningful `alt`; decorative images and SVG drawings use `alt=""` / `aria-hidden="true"`. Figures use `figure` + `figcaption`.
- Everything is reachable and operable by keyboard with a visible focus style. Include a skip-to-content link.
- Contrast meets WCAG AA using only the Figma "Readable pairs" (Ink on Field 11.8:1, Muted on Field 4.9:1, Signal Text on Field 4.6:1, Signal Display on Field 24px+ only).
- The canvas is decorative (`aria-hidden`); the hero's text content lives in HTML, not in WebGL.

## Performance rules

- Content pages ship zero client JavaScript unless a component needs it. Default to `.astro` components; reach for React only for interactivity.
- Use `astro:assets` (`<Image />`) for raster images. Self-host fonts.
- Aim for Lighthouse 90+ on Performance, Accessibility, Best Practices and SEO. Phase 7 baseline (simulated mobile): 88–97 Performance, 100 on the rest; desktop 100 across the board. CSS is inlined (`build.inlineStylesheets: 'always'`) and the Young Serif latin font (27 KB) is preloaded.

## Folder conventions

```
src/
  components/
    layout/     Nav, Footer, page shells
    ui/         Reusable pieces: Button, PageHeader, SectionHeader, EventList, EventsEmpty, PostCard, MemberCard, LogoMark
    hero/       3D hero (hero-gate.ts, hero-scene.ts) and its static SVG fallback
    figures/    Scroll-traced line drawings and FIG labels
    home/       Homepage sections (Hero, Mission, WhatWeDo, Mentoring, UpcomingEvents, Moments, LatestNewsletter)
  content/
    events/     One .md per event
    members/    One .md per team member (photos alongside or in src/assets)
    resources/  One .md per resource link (category: concentration, advising, courses, research, reading)
    guides/     One .md per long-form guide, rendered at /resources/<file-name>
  content.config.ts  Collection schemas — the contract for content files
  layouts/      Base page layout(s)
  lib/          Plain TS helpers (motion/ holds trace.ts and smooth-scroll.ts): site.ts (names, links, nav), events.ts, substack.ts (RSS at build time), format.ts (dates in America/New_York)
  pages/        Routes: index, board (/about redirects here), events, events/[slug], resources, resources/[slug] (guides), newsletter, 404
  styles/       tokens.css (variables), global.css (Tailwind + @theme)
public/         Files served as-is (favicons, OG images, static fallbacks)
```

- Components: PascalCase filenames (`EventCard.astro`). Content files: kebab-case slugs (`2026-10-30-journal-club.md`).
- Events come from a Google Form (primary) and Markdown files (fallback). See `docs/publishing-events.md`. The form feed is the `formEvents` collection (`src/lib/events-feed.ts`, env `EVENTS_FEED_URL`), served by `google-apps-script/Code.gs`; `src/lib/events.ts` merges both, form wins on same day + title. Form question titles are a contract with the Apps Script `COLUMNS` map: change both together.
- Markdown events: one file per event named `YYYY-MM-DD-short-name.md`; the file name becomes the URL (`/events/<name>`). Frontmatter holds the listing fields (`rsvp` shows an RSVP button); the Markdown body is the "About the event" text. Times carry their UTC offset (`-04:00` EDT, `-05:00` EST).
- Date-only fields (like a guide's `updated`) are formatted in UTC with `formatDateOnly`; date-times use Providence time.
- Content files with `draft: true` show in `npm run dev` (marked "Draft") and never in a production build. Placeholder entries stay drafts until Aida supplies real content.
- The Substack feed is fetched at build time by `src/lib/substack.ts`; if it fails, the build continues with a link to Substack instead.
- Line drawings are inline SVG in `src/components/figures/`: single weight, `stroke-structure`, `vector-effect="non-scaling-stroke"`. Don't add `pathLength` (it breaks DrawSVG). Tracing markup: `data-trace-group="outline"` (children draw first), then `data-trace-group="annotation"` groups in order, containing `data-trace-draw` strokes and `data-trace-reveal` elements. See `src/lib/motion/trace.ts`. The homepage brain (`BrainMap.astro`) maps DUG functions to regions: Advising → auditory cortex, Connecting with faculty → arcuate fasciculus, Building community → temporoparietal junction, Flavours of comp neuro → visual cortex. Region ids must match `REGIONS` in `WhatWeDo.astro`. `PyramidalNeuron.astro` is reserved for the About page.
- Content schemas change only with care: co-leaders rely on them. Document any field change in the README.

## Phases

Work one phase at a time and stop after each for Aida to review in the browser.

1. Scaffold, git, CLAUDE.md — done
2. Design tokens, fonts, base layout (nav + footer) — done
3. Homepage as static layout, no animation — done
4. 3D hero — done (motion pending review)
5. Scroll-traced line drawings — done (pending review)
6. Remaining pages (About/Team, Events, Resources, Newsletter, 404) and the Substack RSS feed at build time — done
7. Deployment prep (Vercel, GitHub, metadata, Lighthouse pass) — code done; GitHub, Vercel and DNS steps are Aida's

## Open items

- Course map: `src/lib/course-map.ts`, transcribed from the 2026–27 Bulletin (checked 2026-10-17); rendered by `components/figures/CourseMap.astro` on Resources. Courses@Brown blocks automated requests, so offering terms can't be pulled automatically; add `note`s by hand.
- Event photos: 9 in the homepage Moments grid (`src/lib/moments.ts`), metadata stripped. Event names and dates not yet known, so they aren't linked to past events.
- Headshots: all five done (square crops in src/assets/team). Ah-Young's source is only 432px; a larger file would look sharper.
- Resources: starter entries are real, verified links (Neuromatch, Neuronal Dynamics, Dayan & Abbott, Carney, UTRA, Neuroscience concentration) chosen by Claude; Aida to review. Brown course entries still needed (one draft placeholder).
- Copy is deliberately short (Oct 2026 trim): one line per intro, no paragraph beside section titles unless it is an instruction. Keep it that way; detail belongs in guides.
- Course plan worksheet and Honors application links for the declaration guide (not found publicly)
- Events form setup (docs/publishing-events.md, steps 1–6) needs the Vercel project from phase 7
