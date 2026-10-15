import { getCollection, type CollectionEntry } from 'astro:content';

export type Member = CollectionEntry<'members'>;

export async function getMembers(): Promise<Member[]> {
  const members = await getCollection('members', (m) => import.meta.env.DEV || !m.data.draft);
  return members.sort((a, b) => a.data.order - b.data.order);
}

export const initials = (name: string) =>
  name
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .slice(0, 2)
    .join('');
