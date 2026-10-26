import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import s from './Button.module.css';

type Variant = 'primary' | 'solid' | 'outline';
type Size = 'md' | 'lg';

type Common = {
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  /** Shows a trailing arrow that slides on hover. */
  arrow?: boolean;
  children: ReactNode;
  className?: string;
};

type AsLink = Common & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
type AsButton = Common & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

/**
 * Pill button. `primary` = accent fill, `solid` = tone's solid color,
 * `outline` = 2px line in the current text color. Renders <a> when `href` is set.
 */
export function Button(props: AsLink | AsButton) {
  const { variant = 'primary', size = 'md', icon, arrow, children, className = '', ...rest } = props;
  const cls = [s.button, s[variant], s[size], className].join(' ');
  const content = (
    <>
      {icon && <Icon name={icon} />}
      <span>{children}</span>
      {arrow && <Icon name="arrow" strokeWidth={2.4} className={s.arrow} />}
    </>
  );
  if ('href' in rest && rest.href !== undefined) {
    return (
      <a className={cls} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {content}
      </a>
    );
  }
  return (
    <button type="button" className={cls} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {content}
    </button>
  );
}
