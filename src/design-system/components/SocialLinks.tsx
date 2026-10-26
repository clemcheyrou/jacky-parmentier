import { Icon } from './Icon';
import s from './SocialLinks.module.css';

export type Social = { network: 'instagram' | 'youtube' | 'facebook'; href: string; label: string };

/** Round outlined icon links. Invert on hover. */
export function SocialLinks({ links }: { links: Social[] }) {
  return (
    <ul className={`${s.list} jp-reveal`}>
      {links.map((l) => (
        <li key={l.network}>
          <a className={s.link} href={l.href} aria-label={l.label} target="_blank" rel="noreferrer">
            <Icon name={l.network} />
          </a>
        </li>
      ))}
    </ul>
  );
}
