import { getCollection, type CollectionEntry } from 'astro:content';

export type Event = CollectionEntry<'events'>;

/**
 * Drafts are visible in `npm run dev` so co-leaders can preview them,
 * and never in a production build.
 */
const isVisible = (entry: { data: { draft: boolean } }) => import.meta.env.DEV || !entry.data.draft;

export async function getEvents(): Promise<Event[]> {
  const events = await getCollection('events', isVisible);
  return events.sort((a, b) => a.data.date.getTime() - b.data.date.getTime());
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
