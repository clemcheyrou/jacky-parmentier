import { StrictMode, type ComponentType } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import './design-system';
import App from './App';
import { applyContent, loadContent, type ContentRow } from './content';
import type { PageData } from './entry-server';
import type { Post } from './lib/supabase';

declare global {
  interface Window {
    __DATA__?: PageData;
  }
}

type Page = ComponentType<{ slug?: string; initialPosts?: Post[]; preview?: boolean }>;

// Three pages, plain links between them: no router needed. Blog and admin load on demand.
const path = location.pathname.replace(/\/+$/, '') || '/';
const slug = path.startsWith('/blog/') ? path.slice(6) : undefined;
const load = (): Promise<Page> =>
  path === '/admin'
    ? import('./admin/Admin').then((m) => m.default)
    : path === '/blog' || slug
      ? import('./blog/Blog').then((m) => m.default)
      : Promise.resolve(App);

const root = document.getElementById('root')!;
const data = window.__DATA__;

if (new URLSearchParams(location.search).has('preview')) {
  // /admin's live preview: this page in an iframe, re-rendered with the unsaved edits it posts here.
  Promise.all([load(), loadContent()]).then(([Page]) => {
    const app = createRoot(root);
    const show = (post?: Post) => app.render(<Page slug={slug} initialPosts={post && [post]} preview />);
    window.addEventListener('message', (e: MessageEvent<{ content?: ContentRow[]; post?: Post }>) => {
      if (e.origin !== location.origin || e.source !== window.parent) return;
      if (e.data.content) applyContent(e.data.content);
      show(e.data.post);
    });
    show();
    window.parent.postMessage('preview-ready', location.origin);
  });
} else if (data?.path === path) {
  // Prerendered at build (prerender.js): hydrate the HTML right away, then pick up anything saved since the build.
  applyContent(data.content);
  load().then(async (Page) => {
    const page = <StrictMode><Page slug={slug} initialPosts={data.posts} /></StrictMode>;
    const app = hydrateRoot(root, page);
    await loadContent();
    app.render(page);
  });
} else {
  // Dev server, /admin, or a post newer than the last build.
  Promise.all([load(), loadContent()]).then(([Page]) =>
    createRoot(root).render(
      <StrictMode>
        <Page slug={slug} />
      </StrictMode>,
    ),
  );
}
