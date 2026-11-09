/**
 * Posts gate (live 2026-10-28): every full post under /posts/ requires a
 * signed-in reader. The landing page stays public with snippets; a
 * visitor who opens a post without a valid session is sent back to the
 * landing page with #auth_required, where the sign-up prompt lives.
 * Session verification mirrors /api/me exactly: hb_session is
 * b64url(email.expiry.sig) with sig = HMAC-SHA256-hex(WORKOS_API_KEY,
 * "email.expiry"), 30-day expiry.
 */

const enc = new TextEncoder();

async function hmacHex(secret, data) {
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function safeEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function cookieValue(cookieHeader, name) {
  const m = (cookieHeader || '').match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : '';
}

function b64urlDecode(str) {
  const s = str.replace(/-/g, '+').replace(/_/g, '/');
  return decodeURIComponent(escape(atob(s + '='.repeat((4 - (s.length % 4)) % 4))));
}

async function hasSession(request, env) {
  if (!env.WORKOS_API_KEY) return false;
  let payload = '';
  try {
    payload = b64urlDecode(cookieValue(request.headers.get('Cookie'), 'hb_session'));
  } catch {
    return false;
  }
  // Split from the right: the email itself may contain dots.
  const parts = payload.split('.');
  const sig = parts.pop();
  const expiryStr = parts.pop();
  const email = parts.join('.');
  const expiry = Number(expiryStr);
  if (!email || !expiry || expiry * 1000 < Date.now()) return false;
  return safeEqual(await hmacHex(env.WORKOS_API_KEY, `${email}.${expiry}`), sig);
}

export async function onRequest({ request, env, next }) {
  if (await hasSession(request, env)) return next();
  return Response.redirect(new URL('/#auth_required', request.url), 302);
}
