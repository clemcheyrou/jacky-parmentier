import type { ReactNode } from 'react';
import s from './Eyebrow.module.css';

/** Small uppercase label with a dot, e.g. "01 — C'est qui ?". */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className={`${s.eyebrow} jp-reveal`}>
      <span className={s.dot} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
