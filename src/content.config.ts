import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Articles live in src/content/articles as Markdown files.
// Files starting with "_" (like _template.md) are ignored.
const articles = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!**/_*.md'], base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    category: z.string(),
    author: z.string().default('Bushfire Assessments'),
    image: z.string().optional(),      // e.g. /articles/my-photo.jpg (file goes in public/articles/)
    imageAlt: z.string().optional(),
    draft: z.boolean().default(false), // true = not published
  }),
});

export const collections = { articles };
