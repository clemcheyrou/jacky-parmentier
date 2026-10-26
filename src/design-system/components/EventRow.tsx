import type { ReactNode } from 'react';
import { Icon } from './Icon';
import s from './EventRow.module.css';

export type EventStatus = 'public' | 'private' | 'soldout';

const statusLabel: Record<EventStatus, string> = {
  public: 'Ouvert à tous',
  private: 'Privé',
  soldout: 'Complet',
};

type EventRowProps = {
  /** ISO date, e.g. "2026-11-14". Rendered as day + short month in French. */
  date: string;
  time?: string;
  title: string;
  place: string;
  kind: string;
  status?: EventStatus;
  /** Ticketing or event page. Shows a labelled button on the row. */
  href?: string;
  /** Button text; defaults to "Billets & infos", or "Infos" when sold out. */
  linkLabel?: string;
  /** Larger treatment for the next date. */
  featured?: boolean;
};

function parts(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return {
    day: d.toLocaleDateString('fr-FR', { day: '2-digit' }),
    month: d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', ''),
    weekday: d.toLocaleDateString('fr-FR', { weekday: 'long' }),
  };
}

/** One upcoming date: calendar block, title, place, kind and status pills, and a button when there's a link. */
export function EventRow({ date, time, title, place, kind, status = 'public', href, linkLabel, featured }: EventRowProps) {
  const p = parts(date);
  const body = (
    <>
      <time className={s.date} dateTime={date}>
        <span className={s.day}>{p.day}</span>
        <span className={s.month}>{p.month}</span>
      </time>
      <span className={s.main}>
        <span className={s.meta}>
          <span className={s.kind}>{kind}</span>
          <span className={`${s.status} ${s[status]}`}>{statusLabel[status]}</span>
        </span>
        <span className={s.title}>{title}</span>
        <span className={s.place}>
          {place}
          {' · '}
          <span className={s.weekday}>{p.weekday}</span>
          {time && ` · ${time}`}
        </span>
        {href && (
          <span className={s.cta}>
            {linkLabel || (status === 'soldout' ? 'Infos' : 'Billets & infos')}
            <Icon name="arrow" size={18} strokeWidth={2.4} className={s.arrow} />
          </span>
        )}
      </span>
    </>
  );
  const cls = `${s.row} ${featured ? s.featured : ''}`;
  return (
    <li>
      {href ? (
        <a className={cls} href={href} {...(href.startsWith('http') && { target: '_blank', rel: 'noreferrer' })}>
          {body}
        </a>
      ) : (
        <div className={cls}>{body}</div>
      )}
    </li>
  );
}

/** List wrapper for EventRows. */
export function EventList({ children }: { children: ReactNode }) {
  return <ul className={`${s.list} jp-reveal`}>{children}</ul>;
}
