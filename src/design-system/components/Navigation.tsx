import { Icon, type IconName } from './Icon';
import s from './Navigation.module.css';

export type NavItem = { href: string; label: string; icon: IconName };

type NavProps = {
  brand: string;
  logo: string;
  items: NavItem[];
  cta: { href: string; label: string; shortLabel?: string };
};

/** Desktop: sticky top bar. Hidden under 820px. */
export function TopNav({ brand, logo, items, cta }: NavProps) {
  return (
    <nav className={s.top} data-tone="ink" aria-label="Navigation principale">
      <div className={s.topInner}>
        <a className={s.brand} href="/#top">
          <img src={logo} alt="" width={40} height={40} />
          <span>{brand}</span>
        </a>
        <div className={s.links}>
          {items.map((i) => (
            <a key={i.href} className={s.link} href={i.href}>
              {i.label}
            </a>
          ))}
          <a className={s.cta} href={cta.href}>
            {cta.shortLabel ?? cta.label}
          </a>
        </div>
      </div>
    </nav>
  );
}

/** Phone: floating pill fixed to the bottom of the screen. Hidden above 820px. */
export function TabBar({ items, cta }: Pick<NavProps, 'items' | 'cta'>) {
  return (
    <nav className={s.tabbar} aria-label="Navigation">
      {items.map((i) => (
        <a key={i.href} className={s.tab} href={i.href}>
          <Icon name={i.icon} size={22} />
          <span>{i.label}</span>
        </a>
      ))}
      <a className={`${s.tab} ${s.tabCta}`} href={cta.href}>
        <Icon name="mail" size={22} />
        <span>{cta.shortLabel ?? cta.label}</span>
      </a>
    </nav>
  );
}
