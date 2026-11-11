import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// The site address is used for canonical URLs, the sitemap and the RSS feed.
// On GitHub the deploy workflow sets SITE_URL automatically (the github.io address, or the
// custom domain once one is added in the repository's Pages settings).
export const SITE_URL = process.env.SITE_URL || 'https://www.example.com';

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap()],
});
