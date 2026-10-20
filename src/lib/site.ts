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
    'The Computational Neuroscience Departmental Undergraduate Group at Brown University: talks, advising, research and community at the intersection of brains and computation.',
  email: 'compneurodug@brown.edu',
  // Mailing-list sign-up (Google Form); the header Subscribe button links here.
  mailingList:
    'https://docs.google.com/forms/d/e/1FAIpQLSdWNpQI09VTjt2nAnSewvvGF4J0KB4SvryI7C3NejVVLNcoow/viewform?usp=dialog',
  instagram: 'https://www.instagram.com/brown_compneuro_dug/',
  // Advising board on Ed, moderated by Prof. David Sheinberg.
  ed: 'https://edstem.org/us/join/JaEjcM',
  departmentEmail: 'neuroundergrad@brown.edu',
  concentration: {
    bulletin: 'https://bulletin.brown.edu/the-college/concentrations/cneu/',
    program: 'https://www.brown.edu/undergraduate-programs/computational-neuroscience-scb',
  },
  substack: {
    profile: 'https://substack.com/@browncompneurodugnewsletter',
    home: 'https://browncompneurodugnewsletter.substack.com',
    subscribe: 'https://browncompneurodugnewsletter.substack.com/subscribe',
    feed: 'https://browncompneurodugnewsletter.substack.com/feed',
  },
} as const;

export type NavLink = { href: string; label: string };

export const NAV_LINKS: NavLink[] = [
  { href: '/board', label: 'Board' },
  { href: '/events', label: 'Events' },
  { href: '/resources', label: 'Resources' },
  { href: '/newsletter', label: 'Newsletter' },
];

// Partner logos (Figma 03 — With Brown and Carney). Official, unaltered files
// only: never recolor, redraw, crop the artwork or place on coral/dark.
// Set `show: false` to hide a partner everywhere.
export const PARTNERS = {
  brown: {
    name: 'Brown University',
    href: 'https://www.brown.edu',
    show: true, // Approved per Aida, October 2026
  },
  carney: {
    name: 'Carney Institute for Brain Science',
    href: 'https://carney.brown.edu',
    // Hidden until an official transparent PNG/SVG replaces the grey-background file.
    show: false,
  },
} as const;
