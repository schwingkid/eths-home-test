// /api/* middleware — Cloudflare Access JWT validation (defense in depth) + security headers.
//
// Cloudflare Access already gates /api/* at the edge, but per the recovery brief we do not
// rely solely on the cf-access-authenticated-user-email header: when the two env vars below
// are configured, every API request must carry a valid, signed Access JWT whose email matches.
//
// Required Pages environment variables to ENABLE enforcement:
//   CF_ACCESS_TEAM_DOMAIN  e.g. "youthtechnologycorps.cloudflareaccess.com"
//   CF_ACCESS_AUD          the Access application's Audience (AUD) tag
//
// If either variable is missing, the middleware passes requests through unchanged
// (edge Access still applies), so deploying this file cannot lock anyone out.

let jwksCache = { keys: null, fetchedAt: 0 };

async function getAccessKeys(teamDomain) {
  const now = Date.now();
  if (jwksCache.keys && now - jwksCache.fetchedAt < 60 * 60 * 1000) return jwksCache.keys;
  const res = await fetch(`https://${teamDomain}/cdn-cgi/access/certs`);
  if (!res.ok) throw new Error('jwks_fetch_failed');
  const data = await res.json();
  jwksCache = { keys: Array.isArray(data.keys) ? data.keys : [], fetchedAt: now };
  return jwksCache.keys;
}

function b64urlToBytes(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = s.length % 4 ? '='.repeat(4 - (s.length % 4)) : '';
  const bin = atob(s + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function decodeJson(b64url) {
  return JSON.parse(new TextDecoder().decode(b64urlToBytes(b64url)));
}

// Returns the verified JWT payload, or null if the token is missing/invalid.
async function verifyAccessJwt(token, teamDomain, aud) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  let header, payload;
  try { header = decodeJson(parts[0]); payload = decodeJson(parts[1]); } catch (_) { return null; }

  const now = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp < now) return null;
  if (payload.nbf && payload.nbf > now + 60) return null;
  const audOk = Array.isArray(payload.aud) ? payload.aud.includes(aud) : payload.aud === aud;
  if (!audOk) return null;

  const keys = await getAccessKeys(teamDomain);
  const jwk = keys.find(k => k.kid && k.kid === header.kid);
  if (!jwk) return null;

  const key = await crypto.subtle.importKey(
    'jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']
  );
  const ok = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    key,
    b64urlToBytes(parts[2]),
    new TextEncoder().encode(parts[0] + '.' + parts[1])
  );
  return ok ? payload : null;
}

function deny() {
  return new Response(JSON.stringify({ ok: false, error: 'not_authenticated' }), {
    status: 401,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

// Pages Functions must set their own security headers (_headers only covers static assets).
function withSecurityHeaders(res) {
  const out = new Response(res.body, res);
  out.headers.set('X-Content-Type-Options', 'nosniff');
  out.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  out.headers.set('X-Frame-Options', 'DENY');
  out.headers.set('Content-Security-Policy', "frame-ancestors 'none'");
  out.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return out;
}

export async function onRequest(context) {
  const { request, env } = context;
  const teamDomain = (env.CF_ACCESS_TEAM_DOMAIN || '').trim();
  const aud = (env.CF_ACCESS_AUD || '').trim();

  if (teamDomain && aud) {
    const token = request.headers.get('cf-access-jwt-assertion') || '';
    let payload = null;
    try { payload = token ? await verifyAccessJwt(token, teamDomain, aud) : null; } catch (_) { payload = null; }
    if (!payload) return withSecurityHeaders(deny());

    const jwtEmail = String(payload.email || '').trim().toLowerCase();
    const headerEmail = (request.headers.get('cf-access-authenticated-user-email') || '').trim().toLowerCase();
    // The email the handlers trust (the header) must match the signed token.
    if (!jwtEmail || (headerEmail && headerEmail !== jwtEmail)) return withSecurityHeaders(deny());
  }

  const res = await context.next();
  return withSecurityHeaders(res);
}
