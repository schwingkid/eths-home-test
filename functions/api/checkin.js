function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

function accessEmail(request) {
  return (request.headers.get('cf-access-authenticated-user-email') || '').trim().toLowerCase();
}

export async function onRequestPost(context) {
  const email = accessEmail(context.request);
  if (!email) return json({ ok: false, error: 'not_authenticated' }, 401);

  const db = context.env.YTC_ATTENDANCE;
  if (!db) return json({ ok: false, error: 'database_not_bound' }, 503);

  let body = {};
  try { body = await context.request.json(); } catch (_) {}
  const code = String(body.code || '').trim().toUpperCase();
  if (!code) return json({ ok: false, error: 'code_required' }, 400);

  const member = await db.prepare(
    `SELECT id, email, display_name, chapter_code, role, status
       FROM members
      WHERE lower(email) = lower(?)
      LIMIT 1`
  ).bind(email).first();

  if (!member || member.status !== 'active') {
    return json({ ok: false, error: 'not_active_member' }, 403);
  }

  const session = await db.prepare(
    `SELECT id, chapter_code, title, session_date, checkin_code, opens_at, closes_at
       FROM sessions
      WHERE chapter_code = ?
        AND datetime('now') BETWEEN datetime(opens_at) AND datetime(closes_at)
      ORDER BY id DESC
      LIMIT 1`
  ).bind(member.chapter_code).first();

  if (!session) return json({ ok: false, error: 'no_active_session' }, 409);
  if (String(session.checkin_code).toUpperCase() !== code) {
    return json({ ok: false, error: 'invalid_code' }, 403);
  }

  await db.prepare(
    `INSERT INTO attendance (session_id, member_id, source)
     VALUES (?, ?, 'portal')
     ON CONFLICT(session_id, member_id) DO NOTHING`
  ).bind(session.id, member.id).run();

  const attendance = await db.prepare(
    `SELECT checked_in_at FROM attendance
      WHERE session_id = ? AND member_id = ? LIMIT 1`
  ).bind(session.id, member.id).first();

  return json({
    ok: true,
    session: { id: session.id, title: session.title, date: session.session_date },
    checkedInAt: attendance?.checked_in_at || null,
  });
}
