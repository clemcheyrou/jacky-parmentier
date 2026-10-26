import type { ReactNode } from 'react';
import type { Tone } from '../tokens';
import { Marquee, type MarqueeItem } from './Marquee';
import s from './Section.module.css';

type SectionProps = {
  id?: string;
  tone: Tone;
  /** Giant scrolling band at the top of the section. */
  marquee?: MarqueeItem[];
  children: ReactNode;
  className?: string;
};

/** Full-bleed colored band. Sets the tone for everything inside. */
export function Section({ id, tone, marquee, children, className = '' }: SectionProps) {
  return (
    <section id={id} data-tone={tone} className={`${s.section} ${className}`}>
      {marquee && <Marquee items={marquee} />}
      <div className={s.inner}>{children}</div>
    </section>
  );
}

/** Two equal columns that stack under ~1000px. `align` = vertical alignment. */
export function Split({ children, align = 'center' }: { children: ReactNode; align?: 'center' | 'end' }) {
  return <div className={`${s.split} ${align === 'end' ? s.alignEnd : ''}`}>{children}</div>;
}

/** Vertical stack with the standard text rhythm. */
export function Stack({ children, gap = 'md' }: { children: ReactNode; gap?: 'sm' | 'md' | 'lg' }) {
  return <div className={`${s.stack} ${s[`gap-${gap}`]}`}>{children}</div>;
}

/** Horizontal row, same gaps as Stack. `align` = vertical alignment; `wrap` lets items flow onto new lines. */
export function HStack({
  children,
  gap = 'md',
  align = 'center',
  wrap = false,
  className = '',
}: {
  children: ReactNode;
  gap?: 'sm' | 'md' | 'lg';
  align?: 'start' | 'center' | 'end';
  wrap?: boolean;
  className?: string;
}) {
  return (
    <div className={`${s.hstack} ${s[`gap-${gap}`]} ${wrap ? s.wrap : ''} ${className}`} style={{ alignItems: align === 'center' ? align : `flex-${align}` }}>
      {children}
    </div>
  );
}

/** Body copy in the tone's muted color. */
export function Lead({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`${s.lead} jp-reveal ${className}`}>{children}</p>;
}

/** Section intro row: title block on the left, action on the right; wraps on phones. */
export function SectionHead({ children }: { children: ReactNode }) {
  return <div className={s.head}>{children}</div>;
}
