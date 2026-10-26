/**
 * All site copy and links in one place: these are the defaults.
 * The admin (/admin) saves overrides in Supabase; `loadContent()` merges them in before the first render.
 * Values in [BRACKETS] are placeholders to replace.
 */
import type { ComponentProps } from 'react';
import type { EventRow, NavItem, PaletteColor, PhotoTile, Social, VideoTile } from './design-system';

export const site = {
  name: 'Jacky Parmentier',
  fullName: 'Fanfare Les Jacky Parmentier',
  email: 'lesjackyparmentier@gmail.com',
  motto: '« Trop belle comme un diamant dans le ciel »',
};

export const nav: NavItem[] = [
  { href: '/#qui', label: "C'est qui", icon: 'user' },
  { href: '/#prestas', label: 'Prestas', icon: 'music' },
  { href: '/#setlist', label: 'Setlist', icon: 'list' },
  { href: '/#agenda', label: 'Agenda', icon: 'calendar' },
  { href: '/#photos', label: 'Photos', icon: 'camera' },
  { href: '/blog', label: 'Blog', icon: 'list' },
];

/** The phone tab bar has room for 4 links + the CTA. */
export const tabs: NavItem[] = nav.filter((n) => n.href !== '/#qui' && n.href !== '/#setlist');

/**
 * Upcoming dates, soonest first. Past dates are hidden automatically.
 * status: 'public' (open to all) | 'private' | 'soldout'.
 */
export const agenda: Omit<ComponentProps<typeof EventRow>, 'featured'>[] = [
  { date: '2026-10-24', time: '[HEURE]', title: '[NOM DE L’ÉVÉNEMENT]', place: '[Ville]', kind: 'Défilé', status: 'public', href: '#' },
  { date: '2026-11-14', time: '[HEURE]', title: '[NOM DE L’ÉVÉNEMENT]', place: '[Ville]', kind: 'Festival', status: 'public', href: '#' },
  { date: '2026-12-05', title: '[NOM DE L’ÉVÉNEMENT]', place: '[Ville]', kind: 'Mariage', status: 'private' },
  { date: '2027-01-17', time: '[HEURE]', title: '[NOM DE L’ÉVÉNEMENT]', place: '[Ville]', kind: 'Bal', status: 'soldout', href: '#' },
];

/** Things in the works that don't have a date yet. */
export const plans = [
  { index: '01', label: '[PROJET À VENIR 1]' },
  { index: '02', label: '[PROJET À VENIR 2]' },
  { index: '03', label: '[PROJET À VENIR 3]' },
];

export const navCta = { href: '/#contact', label: 'Réserver la fanfare', shortLabel: 'Réserver' };

export const socials: Social[] = [
  { network: 'instagram', href: '#', label: 'Instagram' },
  { network: 'youtube', href: '#', label: 'YouTube' },
  { network: 'facebook', href: '#', label: 'Facebook' },
];

/** Instruments we're looking for (Contact section). Empty = the recruiting card is hidden. */
export const recruiting = ['Trombone', 'Souba', 'Tuba'];

export const occasions = ['Mariages', 'Festivals', 'Défilés', 'Apéros', 'Bals', 'Fêtes'];

export const formats: { tag: string; color: PaletteColor; title: string; text: string }[] = [
  { tag: 'A', color: 'mustard', title: 'Dans la rue', text: 'Défilés, déambulations et apéros qui tournent en bal.' },
  { tag: 'B', color: 'mint', title: 'Sur scène', text: 'Un set complet pour festivals et salles des fêtes.' },
  { tag: 'C', color: 'pink', title: 'Sur mesure', text: "Mariage, inauguration, anniversaire : on s'adapte." },
];

export const setlist = [
  { title: 'Pop', note: 'ABBA, Dirty Dancing, Fame, Diamonds…' },
  { title: 'Électro', note: 'Kavinsky, Save Your Tears…' },
  { title: 'Compositions maison', note: 'signées Jacky' },
];

export const media: {
  /** "Toutes nos vidéos" button (Photos section). */
  allVideosHref: string;
  /** "Nous écouter" button (Setlist section); empty = same as allVideosHref. */
  listenHref: string;
  videos: ComponentProps<typeof VideoTile>[];
  photos: ComponentProps<typeof PhotoTile>[];
} = {
  allVideosHref: '#',
  listenHref: '',
  videos: [
    { href: '#', title: '[TITRE DE LA VIDÉO 1]', meta: '[Lieu, date]', duration: '[DURÉE]' },
    { href: '#', title: '[TITRE DE LA VIDÉO 2]', meta: '[Lieu, date]', duration: '[DURÉE]' },
  ],
  /** Set `src` (an imported image, or upload one in /admin) to replace each placeholder. */
  photos: [
    { alt: 'PHOTO : la fanfare en défilé', color: 'pink' },
    { alt: 'PHOTO portrait : un musicien', color: 'mint' },
    { alt: 'PHOTO : le public qui danse', color: 'mustard' },
    { alt: 'PHOTO : les cuivres de près', color: 'mint' },
    { alt: 'PHOTO de groupe : toute la fanfare', color: 'pink' },
  ],
};

/** What /admin can edit, by Supabase `content.key`. */
export const editable = { site, agenda, plans, setlist, formats, occasions, recruiting, socials, media };
export type EditableKey = keyof typeof editable;

export type ContentRow = { key: string; value: unknown };

/** Rows saved from /admin. Empty on any error (offline, slow, not configured): the defaults stay. */
export async function fetchContent(): Promise<ContentRow[]> {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  try {
    const res = await fetch(`${url}/rest/v1/content?select=key,value`, {
      headers: { apikey: key },
      signal: AbortSignal.timeout(3000),
    });
    return res.ok ? await res.json() : [];
  } catch {
    return [];
  }
}

/** Replaces the defaults in place, so every import sees the saved values. */
export function applyContent(rows: ContentRow[]) {
  for (const { key, value } of rows) {
    if (!(key in editable)) continue;
    const target = editable[key as EditableKey];
    if (Array.isArray(target)) (target as unknown[]).splice(0, target.length, ...(value as unknown[]));
    else Object.assign(target, value);
  }
}

export const loadContent = async () => applyContent(await fetchContent());
