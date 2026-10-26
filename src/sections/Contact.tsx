import {
  ArtDisc,
  Button,
  Eyebrow,
  Heading,
  Lead,
  Section,
  SocialLinks,
  SpinBadge,
  Split,
  Stack,
  repeatWord,
} from '../design-system';
import { site, socials } from '../content';
import { useCopy } from '../hooks/useCopy';
import { ContactDialog } from './ContactDialog';
import drums from '../assets/contact.webp';
import s from './Contact.module.css';

export function Contact() {
  const { copy, copied } = useCopy(site.email);
  const [user, domain] = site.email.split('@');
  return (
    <Section id="contact" tone="mustard" marquee={repeatWord('Pouet', 6)}>
      <Split>
        <Stack>
          <Eyebrow>06 — Contact · on répond vite</Eyebrow>
          <Heading size="xl" animated words={['Envie', "d'un", 'pouet', 'chez', 'vous ?']} highlight={2} />
          <Lead>La date, le lieu, le nombre d'invités : écrivez-nous, on revient vite avec une proposition.</Lead>
          <div className={`${s.actions} jp-reveal`}>
            <ContactDialog />
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
        </Stack>
        <ArtDisc
          src={drums}
          alt="Illustration : une batterie et la bulle « Contact »"
          disc="ink"
          ring="ink"
          scale={0.92}
          badge={<SpinBadge text="Mariages · Festivals · Défilés · Bals ·" bg="paper" fg="green" />}
        />
      </Split>
    </Section>
  );
}
