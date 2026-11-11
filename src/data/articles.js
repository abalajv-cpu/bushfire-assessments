import { getCollection } from 'astro:content';

export const slugify = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const readingTime = (body = '') => Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 200));

export const formatDate = (d) => d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });

/** Published articles, newest first. */
export async function getArticles() {
  const all = await getCollection('articles', ({ data }) => !data.draft);
  return all.sort((a, b) => b.data.date - a.data.date);
}

/** [{ name, slug, count }] for categories that have at least one article. */
export function categoriesOf(articles) {
  const map = new Map();
  for (const a of articles) {
    const slug = slugify(a.data.category);
    const c = map.get(slug) ?? { name: a.data.category, slug, count: 0 };
    c.count++; map.set(slug, c);
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}
