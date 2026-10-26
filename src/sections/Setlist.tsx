import { ArtDisc, Button, Eyebrow, Heading, Lead, ListRow, RowList, Section, Split, Stack, type PaletteColor } from '../design-system';
import { media, setlist } from '../content';
import tuba from '../assets/setlist.webp';
import s from './Setlist.module.css';

/** One color per style, same trio as the Formules cards. */
const colors: PaletteColor[] = ['mustard', 'mint', 'pink'];

export function Setlist() {
  return (
    <Section id="setlist" tone="ink">
      <Split>
        <Stack gap="lg">
          <Stack>
            <Eyebrow>03 — La setlist</Eyebrow>
            <Heading words={['Au', 'programme']} />
          <Button
            href={media.listenHref || media.allVideosHref}
            target="_blank"
            rel="noreferrer"
            variant="outline"
            icon="youtube"
            arrow
            className={`${s.listen} jp-reveal`}
          >
            Nous écouter
          </Button>
            <Lead>Des tubes pop et électro réarrangés pour cuivres et percussions.</Lead>
          </Stack>
          <RowList>
            {setlist.map((item, i) => (
              <ListRow
                key={item.title}
                index={String(i + 1).padStart(2, '0')}
                title={item.title}
                note={item.note}
                color={colors[i % colors.length]}
              />
            ))}
          </RowList>
        </Stack>
        <ArtDisc src={tuba} alt="Illustration : un tuba et la bulle « La setlist »" disc="paper" ring="mustard" scale={0.8} />
      </Split>
    </Section>
  );
}
