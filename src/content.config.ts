import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One Markdown file per entry. Co-leaders edit these files, not components.
// Entries with `draft: true` are never shown on the site.

const events = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    location: z.string(),
    type: z.enum(['talk', 'journal-club', 'social', 'workshop', 'other']),
    summary: z.string(),
    link: z.url().optional(),
    draft: z.boolean().default(false),
  }),
});

const members = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/members' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      role: z.string(),
      // Lower numbers appear first on the Team page.
      order: z.number().int(),
      photo: image().optional(),
      photoAlt: z.string().optional(),
      email: z.email().optional(),
      pronouns: z.string().optional(),
      concentration: z.string().optional(),
      year: z.number().int().optional(),
      draft: z.boolean().default(false),
    }),
});

const resources = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/resources' }),
  schema: z.object({
    title: z.string(),
    category: z.enum(['courses', 'research', 'reading']),
    summary: z.string(),
    url: z.url().optional(),
    order: z.number().int().default(0),
    draft: z.boolean().default(false),
  }),
});

export const collections = { events, members, resources };
