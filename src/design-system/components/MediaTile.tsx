import { useRef, useState, type ReactNode } from 'react';
import { palette, type PaletteColor } from '../tokens';
import { Icon } from './Icon';
import s from './MediaTile.module.css';

type Span = '1x1' | '2x1' | '1x2' | '2x2';

type PhotoTileProps = {
  /** Image URL. Without it the tile shows a labelled placeholder. */
  src?: string;
  alt: string;
  color?: PaletteColor;
  span?: Span;
};

/** Photo in the gallery grid. Shows a colored placeholder until `src` is set. */
export function PhotoTile({ src, alt, color = 'pink', span = '1x1' }: PhotoTileProps) {
  return (
    <figure className={`${s.tile} ${s[`span${span}`]}`} style={{ background: palette[color] }}>
      {src ? (
        <img className={s.img} src={src} alt={alt} loading="lazy" />
      ) : (
        <div className={s.placeholder}>
          <Icon name="image" size={34} strokeWidth={1.8} />
          <figcaption>[{alt}]</figcaption>
        </div>
      )}
    </figure>
  );
}

type VideoTileProps = {
  href: string;
  title: string;
  meta: string;
  duration: string;
  /** Poster image; otherwise the YouTube thumbnail, or a flat color. */
  poster?: string;
  color?: PaletteColor;
  span?: Span;
  layout?: 'stacked' | 'inline';
};

/** Video id of a YouTube link (watch, youtu.be, shorts, embed, live); null for anything else. */
export function youtubeId(href: string) {
  try {
    const u = new URL(href);
    const host = u.hostname.replace(/^(www|m)\./, '');
    if (host === 'youtu.be') return u.pathname.split('/')[1] || null;
    if (host === 'youtube.com') return u.searchParams.get('v') ?? u.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]+)/)?.[1] ?? null;
    return null;
  } catch {
    return null;
  }
}

/**
 * Video card with a play button. YouTube links play in a modal on the page and use the video's
 * thumbnail when there's no poster; other links (Instagram…) open in a new tab. The href stays as the no-JS fallback.
 */
export function VideoTile({
  href,
  title,
  meta,
  duration,
  poster,
  color = 'ink',
  span = '2x2',
  layout = 'stacked',
}: VideoTileProps) {
  const id = youtubeId(href);
  const embed = id && `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
  const image = poster || (id && `https://i.ytimg.com/vi/${id}/hqdefault.jpg`);
  const dialog = useRef<HTMLDialogElement>(null);
  // The iframe only exists while open, so closing stops the video.
  const [playing, setPlaying] = useState(false);
  return (
    <>
      <a
        className={`${s.tile} ${s.video} ${s[layout]} ${s[`span${span}`]}`}
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label={`Lire la vidéo : ${title}`}
        style={{ background: palette[color] }}
        onClick={
          embed
            ? (e) => {
                e.preventDefault();
                setPlaying(true);
                dialog.current?.showModal();
              }
            : undefined
        }
      >
        {image && <img className={s.poster} src={image} alt="" loading="lazy" />}
        <span className={s.pill}>Vidéo · {duration}</span>
        <span className={s.play}>
          <Icon name="play" size={layout === 'stacked' ? 34 : 28} />
        </span>
        <span className={s.caption}>
          <span className={s.title}>{title}</span>
          <span className={s.meta}>{meta}</span>
        </span>
      </a>
      {embed && (
        <dialog
          ref={dialog}
          className={s.dialog}
          aria-label={title}
          onClose={() => setPlaying(false)}
          onClick={(e) => e.target === dialog.current && dialog.current.close()}
        >
          <button type="button" className={s.close} aria-label="Fermer" onClick={() => dialog.current?.close()}>
            ✕
          </button>
          {playing && (
            <iframe
              className={s.player}
              src={embed}
              title={title}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          )}
        </dialog>
      )}
    </>
  );
}

/** Bento grid: 4 columns on desktop, 2 on phones. */
export function MediaGrid({ children }: { children: ReactNode }) {
  return <div className={`${s.grid} jp-reveal`}>{children}</div>;
}
