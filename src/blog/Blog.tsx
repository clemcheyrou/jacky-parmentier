import { Fragment, useEffect, useRef, useState } from 'react';
import { Eyebrow, FeatureCard, Heading, Icon, Lead, Section, Stack } from '../design-system';
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

/** Swipeable photo strip (CSS scroll-snap); the arrows scroll by one photo. */
function Carousel({ photos }: { photos: string[] }) {
  const track = useRef<HTMLDivElement>(null);
  const go = (dir: number) => track.current?.scrollBy({ left: dir * track.current.clientWidth, behavior: 'smooth' });
  return (
    <div className={s.carousel}>
      <div ref={track} className={s.track} tabIndex={0} role="region" aria-label="Photos">
        {photos.map((src) => (
          <img key={src} src={src} alt="" loading="lazy" />
        ))}
      </div>
      {photos.length > 1 && (
        <div className={s.arrows}>
          <button type="button" onClick={() => go(-1)} aria-label="Photo précédente">
            <Icon name="arrow" style={{ transform: 'scaleX(-1)' }} />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Photo suivante">
            <Icon name="arrow" />
          </button>
        </div>
      )}
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
            <div className={`${s.list} jp-reveal`}>
              {posts.map((p) => (
                <a key={p.id} href={`/blog/${p.slug}`} className={s.cardLink}>
                  {p.photos?.[0] && <img className={s.thumb} src={p.photos[0]} alt="" loading="lazy" />}
                  <FeatureCard tag={formatDate(p.published_at!)} title={p.title}>
                    {p.excerpt}
                  </FeatureCard>
                </a>
              ))}
            </div>
          )}
        </Section>
      </Layout>
    );
  }

  return (
    <Layout>
      <Section tone="paper" className={s.postSection}>
        {posts && !post && (
          <Lead>Cet article n'existe pas (ou plus).</Lead>
        )}
        {post && (
          <article className={s.post}>
            <Stack gap="sm">
              <div className={s.titleRow}>
                <Heading as="h1" size="md" words={post.title.split(' ')} />
              </div>
            </Stack>
            {post.photos?.length > 0 && <Carousel photos={post.photos} />}
            <PostBody text={post.body} />
          </article>
        )}
      </Section>
    </Layout>
  );
}
