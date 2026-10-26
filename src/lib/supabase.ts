import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** null when the env vars aren't set: pages fall back to the defaults in content.ts. */
export const supabase = url && key ? createClient(url, key) : null;

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** Carousel under the text. */
  photos: string[];
  body: string;
  /** ISO date. null = draft; a future date = scheduled. */
  published_at: string | null;
};
