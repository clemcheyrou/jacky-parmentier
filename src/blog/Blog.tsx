import { Fragment, useEffect, useState } from 'react';
import { Button, CardGrid, Eyebrow, FeatureCard, Heading, Lead, Section, Stack } from '../design-system';
import { Layout } from '../App';
import { site } from '../content';
import { supabase, type Post } from '../lib/supabase';
import s from './Blog.module.css';

export const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

/**
 * Post body: blank line = new paragraph, "## " = subheading, lines starting with "- " = list.
 * Rendered as React text, never as HTML.
 */
export function PostBody({ text }: { text: string }) {
  const blocks = text.replace(/\r\n/g, '\n').trim().split(/\n{2,}/);
  return (
    <div className={s.body}>
      {blocks.map((block, i) => {
        if (block.startsWith('## ')) return <h2 key={i}>{block.slice(3)}</h2>;
        const lines = block.split('\n');
        if (lines.every((l) => l.startsWith('- ')))
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{l.slice(2)}</li>
              ))}
            </ul>
          );
        return (
          <p key={i}>
            {lines.map((l, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {l}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

/**
 * /blog: published posts, newest first. /blog/:slug: one post (drafts visible to a logged-in admin, as a preview).
 * `initialPosts` comes from the build (prerendered page); the fetch then refreshes it.
 * `preview` (admin): show `initialPosts` as given, no fetch.
 */
export default function Blog({ slug, initialPosts, preview }: { slug?: string; initialPosts?: Post[]; preview?: boolean }) {
  const [fetched, setPosts] = useState<Post[] | null>(initialPosts ?? null);
  const posts = preview ? (initialPosts ?? null) : fetched;

  useEffect(() => {
    if (preview) return;
    if (!supabase) return setPosts([]);
    const q = supabase.from('posts').select('*');
    const today = new Date().toISOString().slice(0, 10);
    (slug ? q.eq('slug', slug) : q.lte('published_at', today).order('published_at', { ascending: false })).then(
      ({ data }) => setPosts((data as Post[]) ?? []),
    );
  }, [slug, preview]);

  const post = slug ? posts?.[0] : undefined;
  useEffect(() => {
    document.title = post ? `${post.title} — ${site.name}` : `Blog — ${site.name}`;
  }, [post]);

  if (!slug) {
    return (
      <Layout>
        <Section tone="pink">
          <Stack>
            <Eyebrow>Blog · nouvelles de la fanfare</Eyebrow>
            <Heading as="h1" words={['Les', 'Jacky', 'racontent']} animated />
          </Stack>
          {posts?.length === 0 && <Lead>Pas encore d'article. Revenez bientôt !</Lead>}
          {posts && posts.length > 0 && (
            <CardGrid>
              {posts.map((p) => (
                <a key={p.id} href={`/blog/${p.slug}`} className={s.cardLink}>
                  {p.cover && <img className={s.cardCover} src={p.cover} alt="" loading="lazy" />}
                  <FeatureCard tag={formatDate(p.published_at!)} title={p.title}>
                    {p.excerpt}
                  </FeatureCard>
                </a>
              ))}
            </CardGrid>
          )}
        </Section>
      </Layout>
    );
  }

  return (
    <Layout>
      <Section tone="paper">
        <Button href="/blog" variant="outline" className={s.back}>
          ← Tous les articles
        </Button>
        {posts && !post && <Lead>Cet article n'existe pas (ou plus).</Lead>}
        {post && (
          <article className={s.post}>
            <Stack>
              <Eyebrow>{post.published_at ? formatDate(post.published_at) : 'Brouillon'}</Eyebrow>
              <Heading as="h1" size="md" words={post.title.split(' ')} />
            </Stack>
            {post.cover && <img className={s.cover} src={post.cover} alt="" />}
            <PostBody text={post.body} />
          </article>
        )}
      </Section>
    </Layout>
  );
}
