import { ArtDisc, CardGrid, Eyebrow, FeatureCard, Heading, Lead, Section, Split, Stack } from '../design-system';
import { formats } from '../content';
import quoi from '../assets/quoi.webp';

export function Quoi() {
  return (
    <Section id="prestas" tone="pink">
      <Split>
        <Stack>
          <Eyebrow>02 — Nos prestas</Eyebrow>
          <Heading words={['Un', 'format', 'par', 'occasion']} />
          <Lead>Rue, scène ou fête privée : on adapte le set, la durée et l'énergie au moment.</Lead>
        </Stack>
        <ArtDisc src={quoi} alt="Illustration : une trompette et la bulle « Jacky, fait quoi ? »" disc="ink" ring="ink" scale={0.95} />
      </Split>
      <CardGrid>
        {formats.map((f) => (
          <FeatureCard key={f.tag} tag={f.tag} tagColor={f.color} title={f.title}>
            {f.text}
          </FeatureCard>
        ))}
      </CardGrid>
    </Section>
  );
}
