import { getCollection, type CollectionEntry } from 'astro:content';

export type Event = CollectionEntry<'events'> | CollectionEntry<'formEvents'>;

/**
 * Drafts are visible in `npm run dev` so co-leaders can preview them,
 * and never in a production build.
 */
const isVisible = (entry: { data: { draft: boolean } }) => import.meta.env.DEV || !entry.data.draft;

const FEED_CONFIGURED = Boolean(process.env.EVENTS_FEED_URL ?? import.meta.env.EVENTS_FEED_URL);

const sameEvent = (a: Event, b: Event) =>
  a.data.date.toDateString() === b.data.date.toDateString() &&
  a.data.title.trim().toLowerCase() === b.data.title.trim().toLowerCase();

/**
 * Markdown events plus Google Form events, oldest first. If the same event
 * (same day and title) exists in both, the form version wins.
 */
export async function getEvents(): Promise<Event[]> {
  const [files, form] = await Promise.all([
    getCollection('events', isVisible),
    // Skip the form collection when no feed is configured (avoids empty-collection warnings).
    FEED_CONFIGURED ? getCollection('formEvents', isVisible) : Promise.resolve([]),
  ]);
  const merged: Event[] = [...form, ...files.filter((f) => !form.some((g) => sameEvent(f, g)))];
  return merged.sort((a, b) => a.data.date.getTime() - b.data.date.getTime());
}

export async function getUpcomingEvents(limit?: number, now = new Date()): Promise<Event[]> {
  const upcoming = (await getEvents()).filter((e) => (e.data.endDate ?? e.data.date) >= now);
  return limit ? upcoming.slice(0, limit) : upcoming;
}

/** Most recent first. */
export async function getPastEvents(now = new Date()): Promise<Event[]> {
  const past = (await getEvents()).filter((e) => (e.data.endDate ?? e.data.date) < now);
  return past.reverse();
}

export const EVENT_TYPE_LABELS: Record<Event['data']['type'], string> = {
  talk: 'Speaker series',
  'journal-club': 'Journal club',
  social: 'Social',
  workshop: 'Workshop',
  other: 'Event',
};
