import { ArtDisc, Eyebrow, Heading, Lead, Section, Split, Stack } from '../design-system';
import qui from '../assets/qui.webp';

export function Qui() {
  return (
    <Section id="qui" tone="mint">
      <Split>
        <ArtDisc src={qui} alt="Illustration : un trombone et la bulle « Jacky, c'est qui ? »" disc="paper" ring="ink" />
        <Stack>
          <Eyebrow>01 — C'est qui ?</Eyebrow>
          <Heading size="md" words={['Cuivres,', 'percus', 'et', 'énergie']} />
          <Lead>
            Une vingtaine de musiciens, cuivres et percussions, qui arrivent en bande et repartent rarement sans avoir
            fait danser tout le monde.
          </Lead>
        </Stack>
      </Split>
    </Section>
  );
}
