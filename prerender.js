// Last build step: writes the HTML of every public page into dist/, so search engines and first paint don't wait for JS.
// Pages: /, /blog, /blog/<slug> for each published post. Re-run the build when content or posts change.
// With SITE_URL (e.g. https://jackyparmentier.fr): canonical links, og:url, og:image fallback and sitemap.xml.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const { renderAll } = await import('./dist-ssr/entry-server.js');
const template = await readFile('dist/index.html', 'utf8');
const siteUrl = process.env.SITE_URL?.replace(/\/+$/, '');
if (!siteUrl) console.warn('prerender: SITE_URL not set, skipping canonical links, og:image fallback and sitemap.xml.');

const attr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
// JSON inside <script>: escape "<" so "</script>" in a post can't close the tag.
const json = (v) => JSON.stringify(v).replace(/</g, '\\u003c');

const urls = [];
for (const page of await renderAll()) {
  // Function replacers: page text may contain "$&" and friends.
  let html = template.replace(
    '<div id="root"></div>',
    () => `<div id="root">${page.html}</div><script>window.__DATA__=${json(page.data)}</script>`,
  );
  if (page.title) html = html.replace(/<title>.*?<\/title>/, () => `<title>${attr(page.title)}</title>`);
  if (page.description) html = html.replace(/(<meta name="description" content=")[^"]*/, (_, start) => start + attr(page.description));

  const title = html.match(/<title>(.*?)<\/title>/)[1];
  const description = html.match(/<meta name="description" content="([^"]*)"/)[1];
  const url = siteUrl && siteUrl + page.path;
  const image = page.image || (siteUrl && `${siteUrl}/og.jpg`);
  const og = [
    ['og:type', page.path.startsWith('/blog/') ? 'article' : 'website'],
    ['og:title', title],
    ['og:description', description],
    url && ['og:url', url],
    image && ['og:image', attr(image)],
  ].filter(Boolean);
  const head = [
    ...og.map(([p, c]) => `<meta property="${p}" content="${c}" />`),
    url && `<link rel="canonical" href="${url}" />`,
    page.jsonLd && `<script type="application/ld+json">${json(page.jsonLd)}</script>`,
  ].filter(Boolean);
  html = html.replace('</head>', () => head.map((h) => `    ${h}\n`).join('') + '  </head>');

  const file = page.path === '/' ? 'dist/index.html' : `dist${page.path}/index.html`;
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
  console.log('prerendered', page.path);
  urls.push({ loc: url, lastmod: page.lastmod });
}

// /admin: the bare shell (no prerendered page, main.tsx loads the admin), so it works without a host fallback rule.
await mkdir('dist/admin', { recursive: true });
await writeFile('dist/admin/index.html', template.replace('</head>', () => '    <meta name="robots" content="noindex" />\n  </head>'));
console.log('shell /admin');

await writeFile('dist/robots.txt', ['User-agent: *', 'Disallow: /admin', siteUrl && `Sitemap: ${siteUrl}/sitemap.xml`, ''].filter((l) => l !== undefined && l !== false).join('\n'));
if (siteUrl) {
  const entries = urls.map((u) => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`);
  await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`);
}

await rm('dist-ssr', { recursive: true, force: true });
