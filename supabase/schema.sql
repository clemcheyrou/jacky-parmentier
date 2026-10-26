-- Run once in the Supabase SQL editor.
-- Then: Authentication → create a user for each admin, add their e-mail below, and turn off "Allow new users to sign up".

-- Who can edit. RLS on, no policies: only readable through is_admin().
create table public.admins (email text primary key);
alter table public.admins enable row level security;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.admins where email = auth.jwt() ->> 'email') $$;

-- Site copy: one row per key of `editable` in src/content.ts. Missing keys use the defaults.
create table public.content (
  key text primary key,
  value jsonb not null
);
alter table public.content enable row level security;
create policy "content: public read" on public.content for select using (true);
create policy "content: admin write" on public.content for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Blog. published_at null = draft, future = scheduled.
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  excerpt text not null default '',
  cover text,
  body text not null default '',
  published_at date
);
alter table public.posts enable row level security;
create policy "posts: public read" on public.posts for select
  using (published_at <= current_date or public.is_admin());
create policy "posts: admin write" on public.posts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Uploaded images (photos, video posters, blog covers). Public read, admin write, 5 MB images only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/*']);
create policy "media: admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());
create policy "media: admin update" on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin());
create policy "media: admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());

insert into public.admins (email) values ('lesjackyparmentier@gmail.com');
