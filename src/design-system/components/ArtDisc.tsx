import type { CSSProperties, ReactNode } from 'react';
import { palette, type PaletteColor } from '../tokens';
import s from './ArtDisc.module.css';

type ArtDiscProps = {
  src: string;
  alt: string;
  /** Solid disc behind the illustration. */
  disc: PaletteColor;
  /** Color of the ring around the disc. */
  ring: PaletteColor;
  /** Illustration width relative to the frame (0–1). */
  scale?: number;
  /** Optional element pinned bottom-right, usually a <SpinBadge>. */
  badge?: ReactNode;
  /** Above the fold: load right away instead of lazily. */
  priority?: boolean;
  className?: string;
};

/** Floating illustration on a colored disc, inside a ring. */
export function ArtDisc({ src, alt, disc, ring, scale = 0.9, badge, priority, className = '' }: ArtDiscProps) {
  const vars = {
    '--disc': palette[disc],
    '--ring': palette[ring],
    '--scale': scale,
  } as CSSProperties;
  return (
    <div className={`${s.frame} ${className}`} style={vars}>
      <span className={s.ring} aria-hidden="true" />
      <span className={s.disc} aria-hidden="true" />
      <img className={s.art} src={src} alt={alt} loading={priority ? 'eager' : 'lazy'} />
      {badge && <div className={s.badge}>{badge}</div>}
    </div>
  );
}
