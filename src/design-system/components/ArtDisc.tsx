import type { CSSProperties, ReactNode } from 'react';
import { palette, type PaletteColor } from '../tokens';
import s from './ArtDisc.module.css';

type ArtDiscProps = {
  src: string;
  alt: string;
  /** Solid disc behind the illustration. */
  disc: PaletteColor;
  /** Disc diameter relative to the ring (0–1). */
  discSize?: number;
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
export function ArtDisc({ src, alt, disc, discSize = 0.88, ring, scale = 0.9, badge, priority, className = '' }: ArtDiscProps) {
  const vars = {
    '--disc': palette[disc],
    '--disc-size': `${discSize * 100}%`,
    '--ring': palette[ring],
    '--scale': scale,
  } as CSSProperties;
  return (
    <div className={`${s.frame} ${className}`} style={vars}>
      <span className={s.disc} aria-hidden="true" />
      {/* After the disc: stays visible when the disc fills it. */}
      <span className={s.ring} aria-hidden="true" />
      <img className={s.art} src={src} alt={alt} loading={priority ? 'eager' : 'lazy'} />
      {badge && <div className={s.badge}>{badge}</div>}
    </div>
  );
}
