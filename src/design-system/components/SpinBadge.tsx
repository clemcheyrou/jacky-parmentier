import { useId } from 'react';
import { palette, type PaletteColor } from '../tokens';
import s from './SpinBadge.module.css';

type SpinBadgeProps = {
  /** Text set around the circle. Keep it under ~30 characters. */
  text: string;
  bg?: PaletteColor;
  fg?: PaletteColor;
};

/** Round sticker with text running around its edge and a music note in the middle. Spins slowly. */
export function SpinBadge({ text, bg = 'mustard', fg = 'ink' }: SpinBadgeProps) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className={s.badge} viewBox="0 0 200 200" aria-hidden="true">
      <circle cx="100" cy="100" r="96" fill={palette[bg]} stroke={palette.ink} strokeWidth="3" />
      <path id={id} d="M100,100 m-70,0 a70,70 0 1,1 140,0 a70,70 0 1,1 -140,0" fill="none" />
      <text className={s.text} fill={palette[fg]}>
        <textPath href={`#${id}`}>{text}</textPath>
      </text>
      <path
        d="M88 78v44M88 78l26-6v44"
        fill="none"
        stroke={palette[fg]}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="82" cy="122" r="9" fill={palette[fg]} />
      <circle cx="108" cy="116" r="9" fill={palette[fg]} />
    </svg>
  );
}
