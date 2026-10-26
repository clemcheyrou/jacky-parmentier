import s from './Marquee.module.css';

export type MarqueeItem = { text: string; style?: 'fill' | 'outline' | 'accent' };

type MarqueeProps = {
  items: MarqueeItem[];
  size?: 'md' | 'lg';
  reverse?: boolean;
  /** Which edge carries the 2px rule. */
  edge?: 'top' | 'bottom';
  className?: string;
};

/** Infinite scrolling band of giant words, alternating filled / outlined. Decorative. */
export function Marquee({ items, size = 'lg', reverse, edge = 'bottom', className = '' }: MarqueeProps) {
  const loop = [...items, ...items];
  return (
    <div className={`${s.band} ${s[edge]} ${className}`} aria-hidden="true">
      <div className={`${s.track} ${s[size]} ${reverse ? s.reverse : ''}`}>
        {loop.map((item, i) => (
          <span key={i} className={s[item.style ?? 'fill']}>
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Shorthand: repeat one word, alternating fill and outline. */
export function repeatWord(text: string, count = 4, accentEvery?: number): MarqueeItem[] {
  return Array.from({ length: count }, (_, i) => ({
    text,
    style: i % 2 === 1 ? 'outline' : accentEvery && i % accentEvery === 0 ? 'accent' : 'fill',
  }));
}
