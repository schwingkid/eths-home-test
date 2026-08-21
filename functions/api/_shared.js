// Shared helpers for YTC portal API (Cloudflare Pages Functions)

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export function accessEmail(request) {
  return (request.headers.get('cf-access-authenticated-user-email') || '').trim().toLowerCase();
}

// Resolve the signed-in member row (active roster only).
export async function getMember(db, email) {
  if (!email) return null;
  const m = await db.prepare(
    `SELECT id, email, display_name, chapter_code, role, status, can_teach
       FROM members WHERE lower(email) = lower(?) LIMIT 1`
  ).bind(email).first();
  return m && m.status === 'active' ? m : null;
}

// ISO week id like "2026-W34", computed in America/Chicago (UTC-5 in season).
export function currentWeekId(now = new Date()) {
  const chicago = new Date(now.getTime() - 5 * 3600 * 1000);
  const d = new Date(Date.UTC(chicago.getUTCFullYear(), chicago.getUTCMonth(), chicago.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function prevWeekId(weekId) {
  const [y, w] = weekId.split('-W').map(Number);
  if (w > 1) return `${y}-W${String(w - 1).padStart(2, '0')}`;
  return `${y - 1}-W52`;
}

export async function bytcoinBalance(db, memberId) {
  const r = await db.prepare(
    `SELECT COALESCE(SUM(amount), 0) AS bal FROM bytcoin_ledger WHERE member_id = ?`
  ).bind(memberId).first();
  return r ? r.bal : 0;
}
