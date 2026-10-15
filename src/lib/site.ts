// Site-wide names, links and navigation. Edit here, not in components.

export const SITE = {
  // Three forms of one name (Figma 01 — Our name). Never invent a fourth.
  name: {
    formal: 'Computational Neuroscience Departmental Undergraduate Group',
    standard: 'Computational Neuroscience DUG',
    short: 'Comp Neuro DUG',
  },
  university: 'Brown University',
  description:
    'The Computational Neuroscience Departmental Undergraduate Group at Brown University: talks, journal club, research and community at the intersection of brains and computation.',
  substack: {
    profile: 'https://substack.com/@browncompneurodugnewsletter',
    home: 'https://browncompneurodugnewsletter.substack.com',
    subscribe: 'https://browncompneurodugnewsletter.substack.com/subscribe',
    feed: 'https://browncompneurodugnewsletter.substack.com/feed',
  },
} as const;

export type NavLink = { href: string; label: string };

export const NAV_LINKS: NavLink[] = [
  { href: '/about', label: 'About' },
  { href: '/events', label: 'Events' },
  { href: '/resources', label: 'Resources' },
  { href: '/newsletter', label: 'Newsletter' },
];
