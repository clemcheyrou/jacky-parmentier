import {
  ArtDisc,
  Button,
  Eyebrow,
  FeatureCard,
  Heading,
  Lead,
  Section,
  SocialLinks,
  SpinBadge,
  Split,
  Stack,
  repeatWord,
} from '../design-system';
import { recruiting, site, socials } from '../content';
import { useCopy } from '../hooks/useCopy';
// import { ContactDialog } from './ContactDialog';
import drums from '../assets/contact.webp';
import s from './Contact.module.css';

export function Contact() {
  const { copy, copied } = useCopy(site.email);
  const [user, domain] = site.email.split('@');
  // The admin textarea leaves '' for blank lines.
  const wanted = recruiting.filter((r) => r.trim());
  return (
    <Section id="contact" tone="mustard" marquee={repeatWord('Pouet', 6)}>
      <Split>
        <Stack>
          <Eyebrow>06 — Contact · on répond vite</Eyebrow>
          <Heading size="xl" animated words={['Envie', "d'un", 'pouet', 'chez', 'vous ?']} highlight={2} />
          <Lead>La date, le lieu, le nombre d'invités : écrivez-nous, on revient vite avec une proposition.</Lead>
          <div className={`${s.actions} jp-reveal`}>
            {/* <ContactDialog /> */}
            <Button href={`mailto:${site.email}?subject=${encodeURIComponent('Réservation')}`} size="lg" icon="mail" arrow>
              Nous écrire
            </Button>
            <Button variant="outline" size="lg" icon="copy" onClick={copy} aria-live="polite" className={s.mail}>
              {copied ? (
                'Copié !'
              ) : (
                <>
                  {user}
                  <wbr />@{domain}
                </>
              )}
            </Button>
          </div>
          <SocialLinks links={socials} />
          {wanted.length > 0 && (
            <div className="jp-reveal">
              <FeatureCard tag="On recrute" tagColor="pink" title={wanted.join(', ')}>
                Vous jouez d'un de ces instruments et vous avez envie de pouet avec nous ?{' '}
                <a href={`mailto:${site.email}?subject=${encodeURIComponent('Recrutement')}`}>Écrivez-nous</a>, on vous attend !
              </FeatureCard>
            </div>
          )}
        </Stack>
        <ArtDisc
          src={drums}
          alt="Illustration : une batterie et la bulle « Contact »"
          disc="paper"
          discSize={1}
          ring="ink"
          scale={0.92}
          badge={<SpinBadge text="Mariages · Festivals · Défilés · Bals ·" bg="paper" fg="green" />}
        />
      </Split>
    </Section>
  );
}
