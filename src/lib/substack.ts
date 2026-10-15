import { XMLParser } from 'fast-xml-parser';
import { SITE } from './site';

export interface NewsletterPost {
  title: string;
  url: string;
  date: Date;
  summary: string;
  image?: string;
}

interface RssItem {
  title?: string;
  link?: string;
  pubDate?: string;
  description?: string;
  enclosure?: { '@_url'?: string };
}

const parser = new XMLParser({ ignoreAttributes: false, cdataPropName: false });

/**
 * Latest posts from the Substack RSS feed, newest first. Runs at build time
 * (and per request in dev). Returns [] if the feed can't be reached, so a
 * Substack outage never breaks the build.
 */
export async function getLatestPosts(limit = 3): Promise<NewsletterPost[]> {
  try {
    const res = await fetch(SITE.substack.feed);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    const raw = parser.parse(xml)?.rss?.channel?.item ?? [];
    const items: RssItem[] = Array.isArray(raw) ? raw : [raw];

    return items
      .filter((item) => item.title && item.link && item.pubDate)
      .map((item) => ({
        title: String(item.title),
        url: String(item.link),
        date: new Date(String(item.pubDate)),
        summary: String(item.description ?? ''),
        image: item.enclosure?.['@_url'],
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  } catch (error) {
    console.warn(`[substack] Could not load ${SITE.substack.feed}:`, error);
    return [];
  }
}
