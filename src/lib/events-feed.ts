import type { Loader } from 'astro/loaders';
import { z } from 'astro/zod';

/*
 * Content loader for events submitted through the Google Form.
 *
 * The Apps Script in /google-apps-script serves the form's sheet as JSON
 * (dates already converted to ISO with the Eastern-time offset). This loader
 * fetches it at build time and turns each row into an event entry with the
 * same shape as a Markdown event. Setup: docs/publishing-events.md.
 *
 * If EVENTS_FEED_URL is set but the feed can't be read, a production build
 * fails on purpose: Vercel then keeps the last good deploy instead of
 * publishing a site with every event missing.
 */

const feedRow = z.object({
  row: z.number(),
  title: z.string(),
  start: z.string(),
  end: z.string().nullable(),
  location: z.string(),
  type: z.string(),
  summary: z.string(),
  description: z.string(),
  rsvp: z.string(),
  link: z.string(),
  draft: z.boolean(),
});
const feed = z.object({ events: z.array(z.unknown()) });

// Form dropdown label → schema type.
function toType(label: string): 'talk' | 'journal-club' | 'social' | 'workshop' | 'other' {
  const l = label.toLowerCase();
  if (l.includes('speaker') || l.includes('talk')) return 'talk';
  if (l.includes('journal')) return 'journal-club';
  if (l.includes('social')) return 'social';
  if (l.includes('workshop')) return 'workshop';
  return 'other';
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

const optionalUrl = (value: string) => {
  try {
    return value ? new URL(value).toString() : undefined;
  } catch {
    return undefined;
  }
};

export function eventsFeedLoader(): Loader {
  return {
    name: 'events-feed',
    load: async ({ store, logger, parseData, renderMarkdown, generateDigest }) => {
      const url = process.env.EVENTS_FEED_URL ?? import.meta.env.EVENTS_FEED_URL;
      if (!url) {
        logger.info('EVENTS_FEED_URL not set; only Markdown events will be used.');
        store.clear();
        return;
      }

      let rows: unknown[];
      try {
        const res = await fetch(url, { redirect: 'follow' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        rows = feed.parse(await res.json()).events;
      } catch (error) {
        const message = `Could not read the events feed: ${error instanceof Error ? error.message : String(error)}`;
        if (import.meta.env.PROD) throw new Error(message);
        logger.warn(`${message}. Keeping the events from the last successful load.`);
        return;
      }

      store.clear();
      const seen = new Set<string>();

      for (const raw of rows) {
        const parsed = feedRow.safeParse(raw);
        if (!parsed.success) {
          logger.warn(`Skipping a malformed row from the events feed.`);
          continue;
        }
        const row = parsed.data;

        let id = `${row.start.slice(0, 10)}-${slugify(row.title)}`;
        if (seen.has(id)) id = `${id}-${row.row}`;
        seen.add(id);

        try {
          const data = await parseData({
            id,
            data: {
              title: row.title,
              date: row.start,
              endDate: row.end ?? undefined,
              location: row.location || 'TBD',
              type: toType(row.type),
              summary: row.summary || row.description.split('\n')[0] || row.title,
              rsvp: optionalUrl(row.rsvp),
              link: optionalUrl(row.link),
              draft: row.draft,
            },
          });
          store.set({
            id,
            data,
            body: row.description,
            rendered: await renderMarkdown(row.description),
            digest: generateDigest({ ...row }),
          });
        } catch (error) {
          logger.warn(`Skipping sheet row ${row.row} ("${row.title}"): ${error instanceof Error ? error.message : error}`);
        }
      }
      logger.info(`Loaded ${store.keys().length} events from the Google Form.`);
    },
  };
}
