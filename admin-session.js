function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

function accessEmail(request) {
  return (request.headers.get('cf-access-authenticated-user-email') || '').trim().toLowerCase();
}

function makeCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => alphabet[b % alphabet.length]).join('');
}

async function adminMember(db, email) {
  const member = await db.prepare(
    `SELECT id, email, display_name, chapter_code, role, status
       FROM members WHERE lower(email)=lower(?) LIMIT 1`
  ).bind(email).first();
  if (!member || member.status !== 'active' || !['sponsor','admin'].includes(member.role)) return null;
  return member;
}

export async function onRequestGet(context) {
  const email = accessEmail(context.request);
  if (!email) return json({ ok:false, error:'not_authenticated' }, 401);
  const db = context.env.YTC_ATTENDANCE;
  if (!db) return json({ ok:false, error:'database_not_bound' }, 503);
  const member = await adminMember(db, email);
  if (!member) return json({ ok:false, error:'admin_required' }, 403);

  const session = await db.prepare(
    `SELECT id, title, session_date, checkin_code, opens_at, closes_at
       FROM sessions
      WHERE chapter_code=?
        AND datetime('now') BETWEEN datetime(opens_at) AND datetime(closes_at)
      ORDER BY id DESC LIMIT 1`
  ).bind(member.chapter_code).first();

  let count = 0, inPerson = 0, online = 0;
  if (session) {
    const row = await db.prepare(`SELECT COUNT(*) AS n,
        SUM(CASE WHEN join_mode='in_person' THEN 1 ELSE 0 END) AS p,
        SUM(CASE WHEN join_mode='online' THEN 1 ELSE 0 END) AS o
      FROM attendance WHERE session_id=?`).bind(session.id).first();
    count = Number(row?.n || 0); inPerson = Number(row?.p || 0); online = Number(row?.o || 0);
  }
  return json({ ok:true, session: session || null, attendanceCount: count, inPerson, online });
}

export async function onRequestPost(context) {
  const email = accessEmail(context.request);
  if (!email) return json({ ok:false, error:'not_authenticated' }, 401);
  const db = context.env.YTC_ATTENDANCE;
  if (!db) return json({ ok:false, error:'database_not_bound' }, 503);
  const member = await adminMember(db, email);
  if (!member) return json({ ok:false, error:'admin_required' }, 403);

  let body = {};
  try { body = await context.request.json(); } catch (_) {}
  const title = String(body.title || 'YTC Club Meeting').trim().slice(0, 120);
  const sessionDate = String(body.sessionDate || '').trim();
  const opensAt = String(body.opensAt || '').trim();
  const closesAt = String(body.closesAt || '').trim();
  if (!sessionDate || !opensAt || !closesAt) return json({ ok:false, error:'date_and_times_required' }, 400);

  const code = makeCode();
  await db.prepare(
    `INSERT INTO sessions (chapter_code,title,session_date,checkin_code,opens_at,closes_at,created_by_email)
     VALUES (?,?,?,?,?,?,?)
     ON CONFLICT(chapter_code,session_date) DO UPDATE SET
       title=excluded.title,
       checkin_code=excluded.checkin_code,
       opens_at=excluded.opens_at,
       closes_at=excluded.closes_at,
       created_by_email=excluded.created_by_email`
  ).bind(member.chapter_code, title, sessionDate, code, opensAt, closesAt, email).run();

  const session = await db.prepare(
    `SELECT id,title,session_date,checkin_code,opens_at,closes_at
       FROM sessions WHERE chapter_code=? AND session_date=? LIMIT 1`
  ).bind(member.chapter_code, sessionDate).first();

  return json({ ok:true, session });
}
