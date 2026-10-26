import { ArtDisc, Button, Eyebrow, Heading, Marquee, SpinBadge, type MarqueeItem } from '../design-system';
import { navCta, occasions } from '../content';
import { usePouet } from '../hooks/usePouet';
import crest from '../assets/crest.webp';
import s from './Hero.module.css';

/** Landing: fills the screen on desktop, scrolls naturally on phones. */
export function Hero() {
  const pouet = usePouet();
  const band: MarqueeItem[] = occasions.map((text, i) => ({
    text,
    style: i % 2 ? 'outline' : i % 4 === 2 ? 'accent' : 'fill',
  }));
  return (
    <header id="top" data-tone="ink" className={s.hero}>
      <div className={s.inner}>
        <div className={s.text}>
          <Eyebrow>Fanfare à Paris · Cuivres &amp; percussions</Eyebrow>
          <Heading as="h1" size="hero" animated className={s.title} words={['Les', 'Jacky', 'Parmentier']} highlight={2} />
          <p className={`${s.lead} jp-reveal`}>
            Une fanfare parisienne qui joue debout, fort et de bon cœur. Dans la rue, sur scène ou au milieu de la piste.
          </p>
          <div className={`${s.actions} jp-reveal`}>
            <Button href={navCta.href} size="lg" arrow className={s.btn}>
              {navCta.label}
            </Button>
            <Button
              variant="outline"
              size="lg"
              icon="speaker"
              onClick={pouet.play}
              className={`${s.btn} ${pouet.hit ? s.hit : ''}`}
            >
              Pouet !
            </Button>
          </div>
        </div>
        <ArtDisc
          className={s.art}
          src={crest}
          alt="Blason de la fanfare : un diamant vert et le monogramme JKP"
          disc="green"
          ring="mustard"
          scale={0.82}
          priority
          badge={<SpinBadge text="Fanfare · Cuivres · Percus ·" />}
        />
      </div>
      <Marquee items={band} size="md" edge="top" className={s.band} />
    </header>
  );
}
