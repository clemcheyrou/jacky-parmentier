import { StrictMode, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
import Blog from './blog/Blog';
import { agenda, applyContent, fetchContent, site, socials, type ContentRow } from './content';
import { supabase, type Post } from './lib/supabase';

/** Embedded in each prerendered page as window.__DATA__, so the browser hydrates with the same data. */
export type PageData = { path: string; content: ContentRow[]; posts?: Post[] };

export type Rendered = {
  path: string;
  html: string;
  data: PageData;
  title?: string;
  description?: string;
  image?: string | null;
  /** schema.org data for search engines, written as <script type="application/ld+json">. */
  jsonLd?: object;
  /** ISO date for sitemap.xml. */
  lastmod?: string | null;
};

function structuredData(today: string) {
  const group = {
    '@type': 'MusicGroup',
    name: site.fullName,
    email: site.email,
    genre: ['Pop', 'Électro'],
    location: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: 'Paris', addressCountry: 'FR' } },
    sameAs: socials.map((s) => s.href).filter((h) => h.startsWith('http')),
  };
  const events = agenda
    // Private gigs and unfilled placeholders ("[Ville]") stay out of search results.
    .filter((e) => e.status !== 'private' && e.date >= today && !`${e.title}${e.place}`.includes('['))
    .map((e) => ({
      '@type': 'Event',
      name: e.title,
      startDate: e.date,
      eventStatus: 'https://schema.org/EventScheduled',
      location: { '@type': 'Place', name: e.place, address: e.place },
      performer: group,
      ...(e.href?.startsWith('http') && { url: e.href }),
    }));
  return { group, home: { '@context': 'https://schema.org', '@graph': [group, ...events] } };
}

/** Every public page rendered to HTML, with the content and posts as of now. Called by prerender.js at build time. */
export async function renderAll(): Promise<Rendered[]> {
  const content = await fetchContent();
  applyContent(content);

  const today = new Date().toISOString().slice(0, 10);
  const { group, home } = structuredData(today);

  let posts: Post[] = [];
  if (supabase) {
    const { data, error } = await supabase.from('posts').select('*').lte('published_at', today).order('published_at', { ascending: false });
    if (error) console.warn('prerender: posts not fetched, the blog is rendered empty.', error.message);
    posts = (data as Post[] | null) ?? [];
  }

  const render = (path: string, page: ReactElement, pagePosts?: Post[]) => ({
    path,
    html: renderToString(<StrictMode>{page}</StrictMode>),
    data: { path, content, posts: pagePosts },
  });

  return [
    { ...render('/', <App />), jsonLd: home },
    { ...render('/blog', <Blog initialPosts={posts} />, posts), title: `Blog — ${site.name}`, image: posts[0]?.photos?.[0], lastmod: posts[0]?.published_at },
    ...posts.map((p) => ({
      ...render(`/blog/${p.slug}`, <Blog slug={p.slug} initialPosts={[p]} />, [p]),
      title: `${p.title} — ${site.name}`,
      description: p.excerpt || undefined,
      image: p.photos?.[0],
      lastmod: p.published_at,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: p.title,
        datePublished: p.published_at,
        description: p.excerpt || undefined,
        image: p.photos?.[0],
        author: group,
      },
    })),
  ];
}
