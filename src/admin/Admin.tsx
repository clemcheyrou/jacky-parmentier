import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Button, Field } from '../design-system';
import { editable, site, type ContentRow, type EditableKey } from '../content';
import { supabase, type Post } from '../lib/supabase';
import { formatDate } from '../blog/Blog';
import s from './Admin.module.css';

type Row = Record<string, string | undefined>;
type Draft = typeof editable;

type FieldSpec = {
  name: string;
  label: string;
  type?: 'text' | 'textarea' | 'date' | 'url' | 'email' | 'image';
  options?: [value: string, label: string][];
  hint?: string;
};

type BlockSpec = {
  key: EditableKey;
  /** Edit `media.videos` / `media.photos` instead of the whole key. */
  sub?: 'videos' | 'photos';
  label: string;
  hint?: string;
  fields?: FieldSpec[];
  /** string[] edited as one item per line. */
  lines?: boolean;
  /** List with a fixed number of items (the layout depends on it). */
  fixed?: boolean;
};

/** What the content tab shows, in page order. Add a block here to make a new key editable. */
const blocks: BlockSpec[] = [
  {
    key: 'site',
    label: 'Infos générales',
    fields: [
      { name: 'name', label: 'Nom court' },
      { name: 'fullName', label: 'Nom complet' },
      { name: 'email', label: 'E-mail de contact', type: 'email' },
      { name: 'motto', label: 'Devise (pied de page)' },
    ],
  },
  { key: 'occasions', label: 'Occasions (bandeau du haut)', hint: 'Une par ligne.', lines: true },
  {
    key: 'formats',
    label: 'Formats',
    fixed: true,
    fields: [
      { name: 'tag', label: 'Lettre' },
      { name: 'title', label: 'Titre' },
      { name: 'text', label: 'Texte', type: 'textarea' },
    ],
  },
  {
    key: 'setlist',
    label: 'Setlist',
    fields: [
      { name: 'title', label: 'Style' },
      { name: 'note', label: 'Exemples' },
    ],
  },
  {
    key: 'agenda',
    label: 'Agenda',
    hint: 'Les dates passées disparaissent toutes seules. La plus proche est mise en avant.',
    fields: [
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'time', label: 'Heure' },
      { name: 'title', label: 'Événement' },
      { name: 'place', label: 'Lieu' },
      {
        name: 'mapHref',
        label: 'Lien Google Maps',
        type: 'url',
        hint: 'Le nom du lieu devient cliquable, avec une épingle, et ouvre la carte. Vide = pas de lien.',
      },
      { name: 'kind', label: 'Type (Défilé, Mariage…)' },
      {
        name: 'status',
        label: 'Statut',
        options: [
          ['public', 'Ouvert à tous'],
          ['private', 'Privé'],
          ['soldout', 'Complet'],
        ],
      },
      {
        name: 'href',
        label: 'Page de l’événement',
        type: 'url',
        hint: 'Ajoute un bouton sur la date. Vide = pas de bouton.',
      },
      { name: 'linkLabel', label: 'Texte du bouton', hint: 'Par défaut : « Billets & infos », ou « Infos » si complet.' },
    ],
  },
  // Hidden on the site for now (see Agenda.tsx).
  // {
  //   key: 'plans',
  //   label: 'Projets sans date',
  //   fields: [
  //     { name: 'index', label: 'Numéro' },
  //     { name: 'label', label: 'Projet' },
  //   ],
  // },
  {
    key: 'media',
    label: 'Boutons « Toutes nos vidéos » et « Nous écouter »',
    hint: 'Liens YouTube, Instagram, Spotify… Ils s’ouvrent dans un nouvel onglet.',
    fields: [
      { name: 'allVideosHref', label: 'Lien « Toutes nos vidéos »', type: 'url', hint: 'Bouton de la section Photos & vidéos.' },
      { name: 'listenHref', label: 'Lien « Nous écouter »', type: 'url', hint: 'Bouton de la section Setlist. Vide = même lien que les vidéos.' },
    ],
  },
  {
    key: 'media',
    sub: 'videos',
    label: 'Vidéos à la une',
    fixed: true,
    fields: [
      { name: 'title', label: 'Titre' },
      { name: 'meta', label: 'Lieu, date' },
      { name: 'duration', label: 'Durée' },
      { name: 'href', label: 'Lien de la vidéo', type: 'url', hint: 'Lien YouTube : la miniature de la vidéo sert d’image.' },
      // No upload for now: the YouTube thumbnail is used (see VideoTile).
      // { name: 'poster', label: 'Image', type: 'image' },
    ],
  },
  {
    key: 'media',
    sub: 'photos',
    label: 'Photos',
    fixed: true,
    fields: [
      { name: 'src', label: 'Photo', type: 'image' },
      { name: 'alt', label: 'Description (accessibilité)' },
    ],
  },
  {
    key: 'socials',
    label: 'Réseaux sociaux',
    fixed: true,
    fields: [
      { name: 'label', label: 'Nom' },
      { name: 'href', label: 'Lien', type: 'url' },
    ],
  },
];

export default function Admin() {
  if (!supabase)
    return (
      <div className={s.page} data-tone="paper">
        <p className={s.wrap}>Supabase n'est pas configuré : ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans .env.local.</p>
      </div>
    );
  return <AdminApp />;
}

const db = supabase!;

/** Browser "leave the page?" prompt while there are unsaved edits. */
function useUnsavedWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
}

/** Viewport widths the preview can show; desktop is scaled down to fit the panel. */
const devices = { desktop: { label: 'Ordinateur', width: 1280 }, mobile: { label: 'Mobile', width: 390 } };

/** Live preview: the real page in an iframe (`?preview`, see main.tsx), sent the unsaved edits on every change. */
function Preview({ path, message, onClose }: { path: string; message: { content?: ContentRow[]; post?: object }; onClose: () => void }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [device, setDevice] = useState<keyof typeof devices>(() => (window.innerWidth < 900 ? 'mobile' : 'desktop'));
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(box.current!);
    return () => ro.disconnect();
  }, []);

  const width = devices[device].width;
  const scale = size.w ? Math.min(1, size.w / width) : 1;

  useEffect(() => {
    const onReady = (e: MessageEvent) => {
      if (e.origin === location.origin && e.source === ref.current?.contentWindow && e.data === 'preview-ready') setReady(true);
    };
    window.addEventListener('message', onReady);
    return () => window.removeEventListener('message', onReady);
  }, []);

  useEffect(() => {
    if (ready) ref.current?.contentWindow?.postMessage(message, location.origin);
  }, [ready, message]);

  return (
    <aside className={s.preview}>
      <div className={s.previewBar}>
        <span>Aperçu · non enregistré</span>
        <span className={s.previewActions}>
          {(Object.keys(devices) as (keyof typeof devices)[]).map((d) => (
            <button key={d} type="button" className={s.small} aria-pressed={device === d} onClick={() => setDevice(d)}>
              {devices[d].label}
            </button>
          ))}
          <button type="button" className={s.small} onClick={onClose}>
            Fermer
          </button>
        </span>
      </div>
      <div ref={box} className={s.previewBox}>
        <iframe
          ref={ref}
          src={`${path}?preview`}
          title="Aperçu du site"
          style={{ width, height: size.h / scale, transform: `translateX(-50%) scale(${scale})` }}
        />
      </div>
    </aside>
  );
}

async function upload(file: File) {
  const path = `${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, '_')}`;
  const { error } = await db.storage.from('media').upload(path, file);
  if (error) throw error;
  return db.storage.from('media').getPublicUrl(path).data.publicUrl;
}

function AdminApp() {
  const [session, setSession] = useState<Session | null>();
  const [tab, setTab] = useState<'content' | 'blog'>('content');

  useEffect(() => {
    document.title = `Admin — ${site.name}`;
    db.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = db.auth.onAuthStateChange((_e, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  if (session === undefined) return null;
  if (!session) return <Login />;

  return (
    <div className={s.page} data-tone="paper">
      <header className={s.head} data-tone="ink">
        <strong>Admin · {site.name}</strong>
        <nav className={s.tabs}>
          <button type="button" aria-pressed={tab === 'content'} onClick={() => setTab('content')}>
            Contenu
          </button>
          <button type="button" aria-pressed={tab === 'blog'} onClick={() => setTab('blog')}>
            Blog
          </button>
        </nav>
        <span className={s.headEnd}>
          <a href="/" target="_blank" rel="noreferrer">
            Voir le site
          </a>
          <button type="button" onClick={() => db.auth.signOut()}>
            Déconnexion
          </button>
        </span>
      </header>
      {/* Both stay mounted so switching tabs keeps unsaved edits. */}
      <div className={s.wrap} hidden={tab !== 'content'}>
        <ContentEditor />
      </div>
      <div className={s.wrap} hidden={tab !== 'blog'}>
        <PostsEditor />
      </div>
    </div>
  );
}

function Login() {
  const [error, setError] = useState('');

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const { error } = await db.auth.signInWithPassword({ email: String(f.get('email')), password: String(f.get('password')) });
    if (!error) return setError('');
    if (error.message.includes('Invalid login credentials')) setError('E-mail ou mot de passe incorrect.');
    else if (error.message.includes('Email not confirmed'))
      setError('Compte pas encore confirmé : dans Supabase → Authentication → Users, confirmez-le (ou recréez-le avec « Auto Confirm »).');
    else setError(`Connexion impossible : ${error.message}`);
  }

  return (
    <div className={s.page} data-tone="paper">
      <form className={`${s.wrap} ${s.login}`} onSubmit={submit}>
        <h1>Admin</h1>
        <Field label="E-mail">
          <input name="email" type="email" required autoComplete="username" />
        </Field>
        <Field label="Mot de passe">
          <input name="password" type="password" required autoComplete="current-password" />
        </Field>
        {error && <p role="alert">{error}</p>}
        <Button type="submit" variant="solid">
          Se connecter
        </Button>
      </form>
    </div>
  );
}

/** One input for a FieldSpec. */
function Input({ spec, value, onChange }: { spec: FieldSpec; value?: string; onChange: (v: string) => void }) {
  if (spec.type === 'image') return <ImageInput value={value} onChange={onChange} />;
  if (spec.type === 'textarea') return <textarea value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
  if (spec.options)
    return (
      <select value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
        {spec.options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    );
  return <input type={spec.type ?? 'text'} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
}

function ImageInput({ value, onChange }: { value?: string | null; onChange: (url: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return (
    <span className={s.image}>
      {value && <img src={value} alt="" />}
      <input
        type="file"
        accept="image/*"
        disabled={busy}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setBusy(true);
          setError('');
          try {
            onChange(await upload(file));
          } catch {
            setError("L'envoi a échoué (5 Mo max).");
          }
          setBusy(false);
        }}
      />
      {busy && <small>Envoi…</small>}
      {error && <small role="alert">{error}</small>}
      {value && (
        <button type="button" className={s.small} onClick={() => onChange('')}>
          Retirer l'image
        </button>
      )}
    </span>
  );
}

function PhotosInput({ value, onChange }: { value: string[]; onChange: (urls: string[]) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return (
    <span className={s.image}>
      {value.length > 0 && (
        <span className={s.thumbs}>
          {value.map((url, i) => (
            <span key={url}>
              <img src={url} alt="" />
              <button type="button" className={s.small} onClick={() => onChange(value.filter((_, j) => j !== i))}>
                Retirer
              </button>
            </span>
          ))}
        </span>
      )}
      <input
        type="file"
        accept="image/*"
        multiple
        disabled={busy}
        onChange={async (e) => {
          const files = [...(e.target.files ?? [])];
          if (!files.length) return;
          setBusy(true);
          setError('');
          try {
            onChange([...value, ...(await Promise.all(files.map(upload)))]);
          } catch {
            setError("L'envoi a échoué (5 Mo max par photo).");
          }
          setBusy(false);
          e.target.value = '';
        }}
      />
      {busy && <small>Envoi…</small>}
      {error && <small role="alert">{error}</small>}
    </span>
  );
}

function ContentEditor() {
  const [draft, setDraft] = useState<Draft>(() => structuredClone(editable));
  const [status, setStatus] = useState('');
  const [dirty, setDirty] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  useUnsavedWarning(dirty);
  const rows = Object.entries(draft).map(([key, value]) => ({ key, value }));

  /** Immutable update: edit a fresh copy. */
  const update = (fn: (d: Draft) => void) => {
    setDirty(true);
    setStatus('Modifications non enregistrées');
    setDraft((d) => {
      const next = structuredClone(d);
      fn(next);
      return next;
    });
  };

  const target = (d: Draft, b: BlockSpec) => (b.sub ? d.media[b.sub] : d[b.key]) as unknown;

  async function save() {
    setStatus('Enregistrement…');
    const { error } = await db.from('content').upsert(rows);
    if (!error) setDirty(false);
    setStatus(error ? `Erreur : ${error.message}` : 'Enregistré ✓ Visible sur le site au prochain chargement.');
  }

  return (
    <>
      {blocks.map((b) => {
        const value = target(draft, b);
        return (
          <fieldset key={`${b.key}-${b.sub ?? ''}`} className={s.block}>
            <legend>{b.label}</legend>
            {b.hint && <p className={s.hint}>{b.hint}</p>}

            {b.lines && (
              <Field label={b.label}>
                <textarea
                  value={(value as string[]).join('\n')}
                  onChange={(e) => update((d) => void (d[b.key] as string[]).splice(0, Infinity, ...e.target.value.split('\n')))}
                />
              </Field>
            )}

            {!Array.isArray(value) && b.fields && (
              <div className={s.grid}>
                {b.fields.map((f) => (
                  <Field key={f.name} label={f.label} hint={f.hint}>
                    <Input spec={f} value={(value as Row)[f.name]} onChange={(v) => update((d) => void ((target(d, b) as Row)[f.name] = v))} />
                  </Field>
                ))}
              </div>
            )}

            {Array.isArray(value) && b.fields && (
              <>
                {(value as Row[]).map((row, i, all) => {
                  const list = (d: Draft) => target(d, b) as Row[];
                  const move = (to: number) => update((d) => void list(d).splice(to, 0, ...list(d).splice(i, 1)));
                  return (
                    <div key={i} className={s.row}>
                      <div className={s.grid}>
                        {b.fields!.map((f) => (
                          <Field key={f.name} label={f.label} hint={f.hint}>
                            <Input spec={f} value={row[f.name]} onChange={(v) => update((d) => void (list(d)[i][f.name] = v))} />
                          </Field>
                        ))}
                      </div>
                      {!b.fixed && (
                        <div className={s.rowActions}>
                          <button type="button" className={s.small} disabled={i === 0} onClick={() => move(i - 1)} aria-label="Monter">
                            ↑
                          </button>
                          <button type="button" className={s.small} disabled={i === all.length - 1} onClick={() => move(i + 1)} aria-label="Descendre">
                            ↓
                          </button>
                          <button type="button" className={s.small} onClick={() => update((d) => void list(d).splice(i, 1))}>
                            Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
                {!b.fixed && (
                  <button
                    type="button"
                    className={s.small}
                    onClick={() =>
                      update((d) => void (target(d, b) as Row[]).push(Object.fromEntries(b.fields!.map((f) => [f.name, f.options?.[0][0] ?? '']))))
                    }
                  >
                    + Ajouter
                  </button>
                )}
              </>
            )}
          </fieldset>
        );
      })}

      <div className={s.toolbar}>
        <span role="status">{status}</span>
        <Button variant={previewing ? 'solid' : 'outline'} aria-pressed={previewing} onClick={() => setPreviewing(!previewing)}>
          Aperçu
        </Button>
        <Button variant="solid" onClick={save}>
          Enregistrer
        </Button>
      </div>
      {previewing && <Preview path="/" message={{ content: rows }} onClose={() => setPreviewing(false)} />}
    </>
  );
}

const slugify = (t: string) =>
  t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** New posts default to today: the date is required, so a post can't be saved as an invisible draft by mistake. */
const newPost = () => ({ title: '', slug: '', excerpt: '', photos: [], body: '', published_at: new Date().toISOString().slice(0, 10) });

function postStatus(p: Post) {
  if (!p.published_at) return 'Brouillon';
  const today = new Date().toISOString().slice(0, 10);
  return `${p.published_at > today ? 'Programmé' : 'Publié'} · ${formatDate(p.published_at)}`;
}

function PostsEditor() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [edit, setEdit] = useState<Omit<Post, 'id'> & { id?: string }>();
  const [status, setStatus] = useState('');
  const [dirty, setDirty] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [toast, setToast] = useState('');
  useUnsavedWarning(dirty);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(''), 3000);
    return () => window.clearTimeout(t);
  }, [toast]);

  /** Back to the list, with a confirmation toast. */
  const done = (message: string) => {
    setDirty(false);
    setPreviewing(false);
    setStatus('');
    setEdit(undefined);
    setToast(message);
    load();
  };

  const load = () =>
    db
      .from('posts')
      .select('*')
      .order('published_at', { ascending: false, nullsFirst: true })
      .then(({ data }) => setPosts((data as Post[]) ?? []));

  useEffect(() => {
    load();
  }, []);

  if (!edit)
    return (
      <>
        <div className={s.toolbar}>
          <span />
          <Button variant="solid" onClick={() => setEdit(newPost())}>
            + Nouvel article
          </Button>
        </div>
        {toast && (
          <p role="status" className={s.toast}>
            {toast}
          </p>
        )}
        {posts.length === 0 && <p>Aucun article pour l'instant.</p>}
        <ul className={s.posts}>
          {posts.map((p) => (
            <li key={p.id} className={s.row}>
              <span>
                <strong>{p.title}</strong>
                <small>{postStatus(p)}</small>
              </span>
              <button
                type="button"
                className={s.small}
                onClick={() => {
                  setStatus('');
                  setEdit(p);
                }}
              >
                Modifier
              </button>
            </li>
          ))}
        </ul>
      </>
    );

  const set = (patch: Partial<Post>) => {
    setDirty(true);
    setEdit({ ...edit, ...patch });
  };

  const back = () => {
    if (dirty && !confirm('Quitter sans enregistrer les modifications ?')) return;
    setDirty(false);
    setEdit(undefined);
  };

  async function save(e: FormEvent) {
    e.preventDefault();
    setStatus('Enregistrement…');
    const { data, error } = await db
      .from('posts')
      .upsert({ ...edit, published_at: edit!.published_at || null })
      .select()
      .single();
    if (error) return setStatus(error.code === '23505' ? 'Ce lien est déjà utilisé par un autre article.' : `Erreur : ${error.message}`);
    done(`« ${(data as Post).title} » enregistré ✓`);
  }

  async function remove() {
    if (!edit?.id || !confirm(`Supprimer « ${edit.title} » ? C'est définitif.`)) return;
    const { error } = await db.from('posts').delete().eq('id', edit.id);
    if (error) return setStatus(`Erreur : ${error.message}`);
    done(`« ${edit.title} » supprimé`);
  }

  return (
    <form onSubmit={save}>
      <fieldset className={s.block}>
        <legend>{edit.id ? 'Modifier l’article' : 'Nouvel article'}</legend>
        <div className={s.grid}>
          <Field label="Titre">
            <input
              required
              value={edit.title}
              // Keep the link in sync with the title until it's edited by hand.
              onChange={(e) => set({ title: e.target.value, ...(edit.slug === slugify(edit.title) && { slug: slugify(e.target.value) }) })}
            />
          </Field>
          <Field label="Lien" hint={`/blog/${edit.slug || '…'}`}>
            <input required pattern="[a-z0-9]+(-[a-z0-9]+)*" value={edit.slug} onChange={(e) => set({ slug: e.target.value })} />
          </Field>
          <Field label="Date de publication" hint="Date future = programmé : l'article apparaîtra ce jour-là.">
            <input type="date" required value={edit.published_at ?? ''} onChange={(e) => set({ published_at: e.target.value })} />
          </Field>
          <Field label="Photos (carrousel en haut de l’article, la 1re sert de couverture)" wide>
            <PhotosInput value={edit.photos ?? []} onChange={(photos) => set({ photos })} />
          </Field>
          <Field label="Résumé (liste des articles)" wide>
            <textarea className={s.short} value={edit.excerpt} onChange={(e) => set({ excerpt: e.target.value })} />
          </Field>
          <Field label="Texte" wide hint="Ligne vide = nouveau paragraphe · « ## » en début de ligne = intertitre · « - » = liste.">
            <textarea className={s.tall} value={edit.body} onChange={(e) => set({ body: e.target.value })} />
          </Field>
        </div>
      </fieldset>
      <div className={s.toolbar}>
        <span role="status">{status}</span>
        <Button variant="outline" onClick={back}>
          ← Retour
        </Button>
        {edit.id && (
          <Button variant="outline" onClick={remove}>
            Supprimer
          </Button>
        )}
        <Button variant={previewing ? 'solid' : 'outline'} aria-pressed={previewing} onClick={() => setPreviewing(!previewing)}>
          Aperçu
        </Button>
        <Button type="submit" variant="solid">
          Enregistrer
        </Button>
      </div>
      {/* Fixed path: the post comes from the message, so typing a new slug doesn't reload the iframe. */}
      {previewing && <Preview path="/blog/apercu" message={{ post: edit }} onClose={() => setPreviewing(false)} />}
    </form>
  );
}
