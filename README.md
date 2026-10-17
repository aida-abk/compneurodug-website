# Computational Neuroscience DUG website

The website of Brown's Computational Neuroscience Departmental Undergraduate Group: [browncompneuro.com](https://www.browncompneuro.com).

- **Co-leaders:** start with [Editing the site](#editing-the-site). You don't need to install anything.
- **Maintainers:** see [Development](#development) and [`CLAUDE.md`](CLAUDE.md) for the rules the code follows.

## Editing the site

Every change below goes live about a minute after you save it: Vercel rebuilds the site whenever this repository changes.

### Events

Use the **Add an event** Google Form. To change or hide an event, edit the events sheet. Full instructions: [`docs/publishing-events.md`](docs/publishing-events.md).

### Everything else: edit a file on GitHub

1. Open the file on GitHub (paths below).
2. Click the pencil icon, make your change, then **Commit changes** at the top right.

To add a new item, open any existing file in the same folder, copy its contents, then use **Add file → Create new file** in that folder.

| What | Where | Notes |
|---|---|---|
| Team members | `src/content/members/` | One file per person. `order` sets the position on the page (lower = first). |
| Team photos | `src/assets/team/` | Square JPGs. Point to one from the member file with `photo: ../../assets/team/name.jpg`. |
| Resource links | `src/content/resources/` | `category` is one of `concentration`, `advising`, `courses`, `research`, `reading`. Keep `summary` to a few words. |
| Guides (long pages) | `src/content/guides/` | Written in Markdown. The file name becomes the address: `my-guide.md` → `/resources/my-guide`. |
| Events (advanced) | `src/content/events/` | Only for events the form can't handle. Same day and title as a form event? The form version wins. |
| Names, links, emails | `src/lib/site.ts` | Substack, Instagram, Ed board, contact email, partner logos. |
| Homepage photos (Moments) | `src/assets/moments/` + `src/lib/moments.ts` | Add the image file, then one line in `moments.ts` with a short description. The first photo shows large. Only photos of people happy to be on a public site. |

Things to know:

- The part between the two `---` lines at the top of a file holds the fields. Keep the `name: value` format; text with a colon in it goes in quotes.
- Add `draft: true` to hide an item from the live site while you work on it.
- If something is typed wrong, the site doesn't update and the last good version stays online. Vercel emails whoever made the change, and the error message names the file and field.

Short Markdown cheat sheet for guides and event descriptions:

```md
## A heading
A paragraph. A blank line starts the next one.
**bold**, [a link](https://example.com)
- a bullet
1. a numbered step
```

## Development

Requires Node 22.22 or later.

```bash
npm install
```

```bash
npm run dev
```

Runs the site at http://localhost:4321. Draft content shows here, marked "Draft".

```bash
npm run build
```

Builds the static site into `dist/`. Run `npm run check` (type check) before pushing.

### Stack

Astro (static output) · TypeScript · Tailwind CSS v4 driven by design tokens · Three.js for the homepage hero · GSAP + Lenis for scroll motion · content collections in Markdown · Substack RSS and a Google Form feed pulled at build time · deployed on Vercel.

### Layout

```
src/
  components/   layout/ (nav, footer), ui/, home/ (homepage sections),
                hero/ (3D hero + fallback), figures/ (line drawings)
  content/      events/, members/, resources/, guides/
  layouts/      BaseLayout.astro
  lib/          site config, data loaders, motion
  pages/        routes
  styles/       tokens.css (design tokens), global.css
docs/           publishing-events.md
google-apps-script/   the events feed (copy of what runs in Google)
```

The design rules (tokens only, motion and accessibility requirements, brand constraints) are in [`CLAUDE.md`](CLAUDE.md).

### Environment variables

| Name | Where | Purpose |
|---|---|---|
| `EVENTS_FEED_URL` | Vercel (Production + Preview), optional `.env` locally | The Apps Script web app URL for form events. Unset = Markdown events only. |

### Deploying

Vercel builds every push to `main` and makes a preview for every other branch. Framework preset: **Astro**. Build command: `npm run build`. Output: `dist`.

The site also rebuilds when the events form or sheet changes, and every night at 4 AM, through a Vercel deploy hook called by the Apps Script.

## Credits

Brand and design by the DUG leadership, 2026. Line drawings are original. The Brown University logo is used with approval.
