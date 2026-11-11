import rss from '@astrojs/rss';
import { getArticles } from '../data/articles.js';

export async function GET(context) {
  const articles = await getArticles();
  return rss({
    title: 'Bushfire Assessments: Articles',
    description: 'Articles on BAL ratings, bushfire prone land and bushfire rules in Queensland and New South Wales.',
    site: context.site,
    items: articles.map((a) => ({
      title: a.data.title,
      description: a.data.description,
      pubDate: a.data.date,
      categories: [a.data.category],
      link: `/blog/${a.id}/`,
    })),
  });
}
