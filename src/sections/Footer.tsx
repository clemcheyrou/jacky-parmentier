import { site } from '../content';
import crowd from '../assets/merci.webp';
import s from './Footer.module.css';

export function Footer() {
  return (
    <footer data-tone="ink" className={s.footer}>
      <img className={s.crowd} src={crowd} alt="Une foule dessinée qui danse, avec la bulle « Merci ! »" loading="lazy" />
      <div className={s.bar}>
        <span className={s.name}>{site.fullName}</span>
        <span>{site.motto}</span>
      </div>
    </footer>
  );
}
