import type { ReactNode } from 'react';
import { palette, type PaletteColor } from '../tokens';
import s from './Card.module.css';

/** Small bordered tile: a number over a short label. Tilts on hover. */
export function StepCard({ index, label }: { index: string; label: string }) {
  return (
    <div className={`${s.card} ${s.step}`}>
      <span className={s.index}>{index}</span>
      <span className={s.stepLabel}>{label}</span>
    </div>
  );
}

/** Row of StepCards (3 columns, also on phones). */
export function StepRow({ children }: { children: ReactNode }) {
  return <div className={`${s.stepRow} jp-reveal`}>{children}</div>;
}

type FeatureCardProps = {
  tag: string;
  tagColor?: PaletteColor;
  title: string;
  children: ReactNode;
};

/** Larger card with a pill tag, display title and description. */
export function FeatureCard({ tag, tagColor = 'mustard', title, children }: FeatureCardProps) {
  return (
    <article className={`${s.card} ${s.feature}`}>
      <span className={s.tag} style={{ background: palette[tagColor] }}>
        {tag}
      </span>
      <div className={s.body}>
        <h3 className={s.title}>{title}</h3>
        <p className={s.text}>{children}</p>
      </div>
    </article>
  );
}

/** Responsive grid for FeatureCards. */
export function CardGrid({ children }: { children: ReactNode }) {
  return <div className={`${s.grid} jp-reveal`}>{children}</div>;
}
