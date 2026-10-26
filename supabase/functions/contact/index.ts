// Contact form → e-mail via Resend.
// Secrets: RESEND_API_KEY, CONTACT_TO (the band's inbox), CONTACT_FROM (a sender on a domain verified in Resend).
// Deploy: supabase functions deploy contact --no-verify-jwt

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const reply = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (req.method !== 'POST') return reply(405, { error: 'method' });

  const data = await req.json().catch(() => ({}));
  if (str(data.website, 200)) return reply(200, { ok: true }); // honeypot: pretend it worked

  const name = str(data.name, 120);
  const email = str(data.email, 200);
  const message = str(data.message, 5000);
  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply(400, { error: 'invalid' });

  const text = [
    message,
    '',
    `Date : ${str(data.date, 20) || '—'}`,
    `Lieu : ${str(data.place, 200) || '—'}`,
    `Invités : ${str(data.guests, 10) || '—'}`,
    '',
    `${name} · ${email}`,
  ].join('\n');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: Deno.env.get('CONTACT_FROM'),
      to: Deno.env.get('CONTACT_TO'),
      reply_to: email,
      subject: `Demande de ${name}`,
      text,
    }),
  });
  if (!res.ok) console.error('resend', res.status, await res.text());
  return reply(res.ok ? 200 : 502, { ok: res.ok });
});
