import type { CSSProperties } from 'react';
import s from './Heading.module.css';

type Size = 'hero' | 'xl' | 'lg' | 'md';

type HeadingProps = {
  as?: 'h1' | 'h2' | 'h3';
  size?: Size;
  /** Words (or word groups) revealed one after another. */
  words: string[];
  /** Index of the word drawn in a highlight pill that gently rocks. */
  highlight?: number;
  /** Words rise in sequence and the pill rocks. Keep it for a few key titles. */
  animated?: boolean;
  className?: string;
};

/**
 * Display heading: uppercase, extra-wide Archivo. With `animated`, words rise in sequence on scroll.
 * The highlight pill uses the tone's --tone-hl-bg / --tone-hl-fg.
 */
export function Heading({ as: Tag = 'h2', size = 'lg', words, highlight, animated, className = '' }: HeadingProps) {
  return (
    <Tag className={`${s.heading} ${s[size]} ${animated ? s.animated : ''} ${className}`}>
      {words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          className={`${s.word} ${i === highlight ? s.hl : ''}`}
          style={{ '--i': i } as CSSProperties}
        >
          {w}
        </span>
      ))}
    </Tag>
  );
}
