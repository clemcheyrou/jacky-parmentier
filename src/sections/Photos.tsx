import { Button, Eyebrow, Heading, MediaGrid, PhotoTile, Section, SectionHead, Stack, VideoTile } from '../design-system';
import { media } from '../content';

export function Photos() {
  const [v1, v2] = media.videos;
  const [p1, p2, p3, p4, p5] = media.photos;
  return (
    <Section id="photos" tone="paper">
      <SectionHead>
        <Stack>
          <Eyebrow>05 — Photos &amp; vidéos</Eyebrow>
          <Heading words={['Les', 'Jacky', 'en vrai']} />
        </Stack>
        <Button href={media.allVideosHref} target="_blank" rel="noreferrer" variant="solid" icon="youtube" arrow className="jp-reveal">
          Toutes nos vidéos
        </Button>
      </SectionHead>
      {/* Order matters: it fills the 4-column bento without gaps. */}
      <MediaGrid>
        <VideoTile {...v1} span="2x2" />
        <PhotoTile {...p1} />
        <PhotoTile {...p2} />
        <PhotoTile {...p3} />
        <PhotoTile {...p4} />
        <VideoTile {...v2} span="2x1" layout="inline" color="green" />
        <PhotoTile {...p5} />
      </MediaGrid>
    </Section>
  );
}
