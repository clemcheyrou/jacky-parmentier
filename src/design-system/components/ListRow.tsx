import type { ReactNode } from 'react';
import { palette, type PaletteColor } from '../tokens';
import s from './ListRow.module.css';

/** Ordered list of outlined rows (used for the setlist). */
export function RowList({ children }: { children: ReactNode }) {
  return <ol className={`${s.list} jp-reveal`}>{children}</ol>;
}

/** One row: number pill, display title, muted note underneath. */
export function ListRow({ index, title, note, color = 'mustard' }: { index: string; title: string; note?: string; color?: PaletteColor }) {
  return (
    <li className={s.row}>
      <span className={s.index} style={{ background: palette[color] }}>
        {index}
      </span>
      <span className={s.title}>{title}</span>
      {note && <span className={s.note}>{note}</span>}
    </li>
  );
}
