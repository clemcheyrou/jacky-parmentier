import { useRef, useState, type FormEvent } from 'react';
import { Button, Field } from '../design-system';
import { site } from '../content';
import s from './Contact.module.css';

type Status = 'idle' | 'sending' | 'sent' | 'error';

/** Booking form in a native <dialog>. Sends through the `contact` Supabase Edge Function. */
export function ContactDialog() {
  const ref = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [mailto, setMailto] = useState('');

  const open = () => {
    setStatus('idle');
    ref.current?.showModal();
  };

  async function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const body = [
      data.message,
      '',
      `Date : ${data.date || '—'}`,
      `Lieu : ${data.place || '—'}`,
      `Invités : ${data.guests || '—'}`,
      `${data.name} · ${data.email}`,
    ].join('\n');
    // Fallback if sending fails: same message in the visitor's mail app.
    setMailto(`mailto:${site.email}?subject=${encodeURIComponent(`Demande de ${data.name}`)}&body=${encodeURIComponent(body)}`);
    setStatus('sending');
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  return (
    <>
      <Button size="lg" icon="mail" arrow onClick={open}>
        Nous écrire
      </Button>
      <dialog
        ref={ref}
        data-tone="paper"
        className={s.dialog}
        aria-labelledby="contact-title"
        onClick={(e) => e.target === ref.current && ref.current.close()}
      >
        <div className={s.dialogHead}>
          <h2 id="contact-title" className={s.dialogTitle}>
            Réserver la fanfare
          </h2>
          <button type="button" className={s.close} aria-label="Fermer" onClick={() => ref.current?.close()}>
            ✕
          </button>
        </div>

        {status === 'sent' ? (
          <div className={s.done} role="status">
            <p>Merci ! Votre message est parti, on revient vers vous très vite.</p>
            <Button variant="solid" onClick={() => ref.current?.close()}>
              Fermer
            </Button>
          </div>
        ) : (
          <form className={s.form} onSubmit={send}>
            <Field label="Votre nom">
              <input name="name" required maxLength={120} autoComplete="name" />
            </Field>
            <Field label="Votre e-mail">
              <input name="email" type="email" required maxLength={200} autoComplete="email" />
            </Field>
            <Field label="La date">
              <input name="date" type="date" />
            </Field>
            <Field label="Le lieu">
              <input name="place" maxLength={200} />
            </Field>
            <Field label="Les invités">
              <input name="guests" type="number" min={1} inputMode="numeric" />
            </Field>
            <Field label="Votre message" wide>
              <textarea name="message" required maxLength={5000} placeholder="Mariage, festival, défilé… dites-nous tout." />
            </Field>
            {/* Honeypot: hidden from people, filled by bots. */}
            <input name="website" tabIndex={-1} autoComplete="off" className="jp-sr-only" aria-hidden="true" />
            <div className={s.formActions}>
              {status === 'error' && (
                <p role="alert" className={s.error}>
                  L'envoi a échoué. <a href={mailto}>Ouvrir le message dans votre messagerie</a>
                </p>
              )}
              <Button type="submit" variant="solid" arrow disabled={status === 'sending'}>
                {status === 'sending' ? 'Envoi…' : 'Envoyer'}
              </Button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
