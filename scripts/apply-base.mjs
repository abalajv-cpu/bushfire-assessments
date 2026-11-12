// Runs after the build. Two jobs:
// 1. Writes robots.txt with the real site address.
// 2. If the site is served from a sub-folder (a GitHub Pages address like
//    name.github.io/repository/ before a custom domain is connected), prefixes every
//    root-relative link so pages, styles and scripts still load. With a custom domain or a
//    name.github.io repository there is no sub-folder and nothing is rewritten.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const site = (process.env.SITE_URL || 'https://www.example.com').replace(/\/$/, '');
const base = (process.env.SITE_BASE || '').replace(/\/$/, '');

writeFileSync(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site}${base}/sitemap-index.xml\n`);

if (!base) { console.log('[base] site is served from the root; no links rewritten'); process.exit(0); }

const walk = (dir) => readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
let count = 0;
for (const file of walk(DIST)) {
  if (!/\.(html|xml|css)$/.test(file)) continue;
  const before = readFileSync(file, 'utf8');
  const after = before
    .replace(/\b(href|src|action)="\/(?!\/)/g, `$1="${base}/`)        // attributes
    .replace(/url\((['"]?)\/(?!\/)/g, `url($1${base}/`)                        // CSS
    .replace(/(fetch|getJSON)\((['"])\/(?!\/)/g, `$1($2${base}/`)                     // inline scripts
    .replaceAll(`${site}/`, `${site}${base}/`).replaceAll(`${site}${base}${base}/`, `${site}${base}/`); // absolute URLs (canonical, sitemap, feed, schema)
  if (after !== before) { writeFileSync(file, after); count++; }
}
console.log(`[base] prefixed links with "${base}" in ${count} files`);
