function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

function accessEmail(request) {
  return (request.headers.get('cf-access-authenticated-user-email') || '').trim().toLowerCase();
}

export async function onRequestGet(context) {
  const email = accessEmail(context.request);
  if (!email) return json({ ok: false, error: 'not_authenticated' }, 401);

  const db = context.env.YTC_ATTENDANCE;
  if (!db) return json({ ok: false, error: 'database_not_bound' }, 503);

  const member = await db.prepare(
    `SELECT id, email, display_name, chapter_code, role, status, can_teach
       FROM members
      WHERE lower(email) = lower(?)
      LIMIT 1`
  ).bind(email).first();

  if (!member || member.status !== 'active') {
    return json({ ok: false, error: 'not_active_member', email }, 403);
  }

  const session = await db.prepare(
    `SELECT id, chapter_code, title, session_date, opens_at, closes_at
       FROM sessions
      WHERE chapter_code = ?
        AND datetime('now') BETWEEN datetime(opens_at) AND datetime(closes_at)
      ORDER BY id DESC
      LIMIT 1`
  ).bind(member.chapter_code).first();

  let attendance = null;
  if (session) {
    attendance = await db.prepare(
      `SELECT checked_in_at, checked_out_at, join_mode
         FROM attendance
        WHERE session_id = ? AND member_id = ?
        LIMIT 1`
    ).bind(session.id, member.id).first();
  }

  return json({
    ok: true,
    member: {
      email: member.email,
      name: member.display_name || member.email.split('@')[0],
      chapter: member.chapter_code,
      role: member.role,
      canTeach: Boolean(member.can_teach) || ['leader','sponsor','admin'].includes(member.role),
    },
    activeSession: session || null,
    checkedIn: Boolean(attendance),
    checkedInAt: attendance?.checked_in_at || null,
    joinMode: attendance?.join_mode || null,
    portalUnlocked: !session || Boolean(attendance),
  });
}
