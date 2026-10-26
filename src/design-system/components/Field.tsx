import type { ReactNode } from 'react';
import s from './Field.module.css';

/** Label + one input, textarea or select (passed as child, styled here) + optional hint. */
export function Field({ label, hint, wide, children }: { label: string; hint?: string; wide?: boolean; children: ReactNode }) {
  return (
    <label className={`${s.field} ${wide ? s.wide : ''}`}>
      <span className={s.label}>{label}</span>
      {children}
      {hint && <small className={s.hint}>{hint}</small>}
    </label>
  );
}
