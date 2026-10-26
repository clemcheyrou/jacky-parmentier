import type { ReactNode } from 'react';
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
  /** Poster image; otherwise a flat color. */
  poster?: string;
  color?: PaletteColor;
  span?: Span;
  layout?: 'stacked' | 'inline';
};

/** Video link card with a play button. Opens the video (YouTube, Instagram…). */
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
  return (
    <a
      className={`${s.tile} ${s.video} ${s[layout]} ${s[`span${span}`]}`}
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={`Lire la vidéo : ${title}`}
      style={{ background: palette[color] }}
    >
      {poster && <img className={s.poster} src={poster} alt="" loading="lazy" />}
      <span className={s.pill}>Vidéo · {duration}</span>
      <span className={s.play}>
        <Icon name="play" size={layout === 'stacked' ? 34 : 28} />
      </span>
      <span className={s.caption}>
        <span className={s.title}>{title}</span>
        <span className={s.meta}>{meta}</span>
      </span>
    </a>
  );
}

/** Bento grid: 4 columns on desktop, 2 on phones. */
export function MediaGrid({ children }: { children: ReactNode }) {
  return <div className={`${s.grid} jp-reveal`}>{children}</div>;
}
