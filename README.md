# Les Jacky Parmentier — site

React 18 + TypeScript + Vite. No UI library: a small in-house design system in `src/design-system/`.
Backend: Supabase (content, blog, image uploads, admin login) + one Edge Function for the contact form.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/, public pages prerendered (see below)
```

Pages: `/` (site), `/blog`, `/blog/:slug`, `/admin`. In production, the host must serve `dist/<path>/index.html` when it exists
and fall back to `index.html` otherwise (Netlify, Vercel, Cloudflare Pages do this with an SPA fallback rule).

### Prerendering

`npm run build` renders `/`, `/blog` and every published post to static HTML (`src/entry-server.tsx` → `prerender.js`),
with the content and posts saved in Supabase at build time. Search engines get real HTML with per-post `<title>`,
description and Open Graph tags; visitors see the page before the JS loads. The browser then hydrates it and fetches
anything saved since, so visitors always see the latest content — only search engines wait for the next build.

Also generated: schema.org data (`MusicGroup`, public agenda dates as `Event`, posts as `BlogPosting`), `robots.txt`,
and — when `SITE_URL` is set in `.env.local` or on the host — canonical links, `og:url`, the `og.jpg` share image and `sitemap.xml`.

Rebuild automatically: create a build hook on the host, then in Supabase → Database → Webhooks add one on
`content` and `posts` (insert/update/delete) calling it. Add a daily scheduled build too, for posts scheduled in the future.

## Backend setup (once)

1. Create a Supabase project, run `supabase/schema.sql` in the SQL editor (change the admin e-mail at the bottom first).
2. Authentication → add a user (e-mail + password) for each admin, then turn off *Allow new users to sign up*.
3. Copy `.env.example` to `.env.local` and fill in the URL and anon key (also set them on the host).
4. Contact form: create a [Resend](https://resend.com) key, then
   ```bash
   supabase secrets set RESEND_API_KEY=… CONTACT_TO=lesjackyparmentier@gmail.com CONTACT_FROM="Site <contact@your-domain>"
   supabase functions deploy contact --no-verify-jwt
   ```

Without the env vars the site still works on the defaults in `content.ts`; blog is empty and admin is disabled.
If the contact function fails, the dialog offers to open the message in the visitor's mail app instead.

## Where things are

```
src/
  content.ts            ← default copy, links, agenda, photos. Overridden by what's saved in /admin.
  App.tsx               ← page order + shared Layout (nav, footer)
  admin/                ← /admin: login, content editor (`blocks` = what's editable), blog editor
  blog/                 ← /blog list and post pages
  lib/supabase.ts       ← client + Post type
  sections/             ← one file per section (Hero, Qui, Quoi, Setlist, Agenda, Photos, Contact, Footer)
  hooks/                ← usePouet (button sound), useCopy (copy e-mail)
  assets/               ← illustrations (.webp)
  design-system/
    tokens.css          ← colors, type, spacing, radii, motion + the 5 tones
    tokens.ts           ← same palette for TypeScript
    global.css          ← reset, keyframes, reduced-motion
    components/         ← building blocks (below)
    index.ts            ← import everything from here
```

## Design system

### Tones

Every section is a `<Section tone="…">`. A tone sets semantic CSS variables
(`--tone-bg`, `--tone-fg`, `--tone-muted`, `--tone-accent`, `--tone-line`, `--tone-hl-bg`, …),
and every component reads those. Changing a section's tone restyles everything inside it.

| Tone      | Background | Text  | Highlight pill      | Used by           |
|-----------|-----------|-------|---------------------|-------------------|
| `ink`     | #0E2A22   | paper | mustard / ink       | Hero, Setlist     |
| `mint`    | #BFE0CC   | ink   | ink / paper         | Qui, Agenda       |
| `pink`    | #F8D6D3   | ink   | ink / paper         | Quoi              |
| `paper`   | #F4EFE6   | ink   | green / paper       | Photos            |
| `mustard` | #F2B33D   | ink   | ink / paper         | Contact           |

### Type

One family, **Archivo** (variable width). Display text is uppercase, weight 900, width 125%,
tracking −0.04em. Body is regular width. Sizes are tokens (`--jp-display-lg`, `--jp-title-md`, …).

### Components

| Component | What it is |
|---|---|
| `Section`, `SectionHead`, `Split`, `Stack`, `HStack`, `Lead` | Layout: colored band with marquee, title + action row, 2-column split, vertical rhythm, horizontal row, muted paragraph |
| `Marquee`, `repeatWord()` | Giant scrolling band, alternating filled / outlined words. Kept for the Hero and Contact only |
| `Eyebrow` | Small uppercase label with a dot ("01 — C'est qui ?") |
| `Heading` | Display title; `highlight` puts one word in a pill (Hero, Contact only); `animated` makes words rise one by one and the pill rock (Hero, Contact, Blog only) |
| `Button` | Pill, `primary` / `solid` / `outline`, optional icon + sliding arrow. `<a>` when `href` is set |
| `ArtDisc` | Illustration floating on a colored disc inside a ring; optional `badge` |
| `SpinBadge` | Round sticker with text around the edge, slowly spinning |
| `StepCard` / `StepRow` | Small numbered tiles, 3 per row |
| `FeatureCard` / `CardGrid` | Larger card with tag, title, text |
| `ListRow` / `RowList` | Outlined rows (setlist) |
| `EventRow` / `EventList` | Agenda date: calendar block, kind + status pills, title, place. `featured` for the next date |
| `PhotoTile`, `VideoTile`, `MediaGrid` | Bento gallery. Photos show a labelled placeholder until `src` is set |
| `SocialLinks` | Round outlined icon links |
| `TopNav` / `TabBar` | Desktop sticky header / phone bottom bar (switch at 820px) |
| `Icon` | Stroke icon set (24×24) |
| `Field` | Form label + input/textarea/select + hint (contact dialog, admin) |

### Motion

Shared keyframes live in `global.css`. Headings and `.jp-reveal` blocks animate on scroll
where the browser supports scroll timelines (Chrome, Edge), and on load elsewhere.
Everything is turned off for visitors with *reduce motion* enabled.

## To do before going live

In `/admin` (once saved there, a key no longer reads its default from `content.ts`):

- **Agenda:** replace the `[NOM DE L'ÉVÉNEMENT]`, `[Ville]`, `[HEURE]` placeholders. Past dates are hidden automatically; the soonest one is highlighted.
- **Projects without a date**, **photos / videos**, **social links** (currently `#`).
