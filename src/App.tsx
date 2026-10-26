import type { ReactNode } from 'react';
import { TabBar, TopNav } from './design-system';
import { nav, navCta, site, tabs } from './content';
import { Hero } from './sections/Hero';
import { Qui } from './sections/Qui';
import { Quoi } from './sections/Quoi';
import { Setlist } from './sections/Setlist';
import { Agenda } from './sections/Agenda';
import { Photos } from './sections/Photos';
import { Contact } from './sections/Contact';
import { Footer } from './sections/Footer';
import crest from './assets/crest.webp';

/** Nav + footer shared by every public page. */
export function Layout({ hero, children }: { hero?: ReactNode; children: ReactNode }) {
  return (
    <>
      <TopNav brand={site.name} logo={crest} items={nav} cta={navCta} />
      {hero}
      <main>{children}</main>
      <Footer />
      <TabBar items={tabs} cta={navCta} />
    </>
  );
}

export default function App() {
  return (
    <Layout hero={<Hero />}>
      <Qui />
      <Quoi />
      <Setlist />
      <Agenda />
      <Photos />
      <Contact />
    </Layout>
  );
}
