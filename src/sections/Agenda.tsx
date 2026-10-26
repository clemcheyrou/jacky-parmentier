import { useMemo } from 'react';
import {
  Button,
  EventList,
  EventRow,
  Eyebrow,
  Heading,
  Lead,
  Section,
  SectionHead,
  Stack,
  StepCard,
  StepRow,
} from '../design-system';
import { agenda, navCta, plans } from '../content';
import s from './Agenda.module.css';

/** Upcoming dates (past ones drop off automatically) + projects without a date yet. */
export function Agenda() {
  const upcoming = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return agenda.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  }, []);

  return (
    <Section id="agenda" tone="mint">
      <SectionHead>
        <Stack>
          <Eyebrow>04 — Agenda</Eyebrow>
          <Heading words={['Prochaines', 'dates']} />
        </Stack>
        <Button href={navCta.href} variant="solid" arrow className="jp-reveal">
          Réserver une date
        </Button>
      </SectionHead>

      {upcoming.length > 0 ? (
        <EventList>
          {upcoming.map((e, i) => (
            <EventRow key={`${e.date}-${i}`} {...e} featured={i === 0} />
          ))}
        </EventList>
      ) : (
        <Lead>Pas de date publique pour le moment. Écrivez-nous pour réserver la prochaine.</Lead>
      )}

      <div className={s.plans}>
        <Stack gap="sm">
          <h3 className={s.plansTitle}>Et dans les cartons</h3>
          <Lead>Ce qu'on prépare, sans date pour l'instant.</Lead>
        </Stack>
        <StepRow>
          {plans.map((p) => (
            <StepCard key={p.index} index={p.index} label={p.label} />
          ))}
        </StepRow>
      </div>
    </Section>
  );
}
