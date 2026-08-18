// Virtual teaching log — a separate record from attendance.
// POST: an approved student-teacher logs a session (date, minutes, audience, notes) → unverified.
// GET : the signed-in member sees their own log; sponsors/admins see the chapter's unverified queue.
// PUT : a sponsor/admin verifies (or un-verifies) an entry.
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}
function accessEmail(request) {
  return (request.headers.get('cf-access-authenticated-user-email') || '').trim().toLowerCase();
}
async function getMember(db, email) {
  return db.prepare(
    `SELECT id, email, display_name, chapter_code, role, status, can_teach
       FROM members WHERE lower(email)=lower(?) LIMIT 1`
  ).bind(email).first();
}
const isStaff = m => ['sponsor', 'admin'].includes(m.role);
const mayTeach = m => Boolean(m.can_teach) || ['leader', 'sponsor', 'admin'].includes(m.role);

export async function onRequestGet(context) {
  const email = accessEmail(context.request);
  if (!email) return json({ ok: false, error: 'not_authenticated' }, 401);
  const db = context.env.YTC_ATTENDANCE;
  if (!db) return json({ ok: false, error: 'database_not_bound' }, 503);
  const member = await getMember(db, email);
  if (!member || member.status !== 'active') return json({ ok: false, error: 'not_active_member' }, 403);

  const mine = await db.prepare(
    `SELECT id, taught_on, minutes, audience, notes, submitted_at, verified_at
       FROM teaching_log WHERE member_id=? ORDER BY taught_on DESC, id DESC LIMIT 50`
  ).bind(member.id).all();

  let queue = null;
  if (isStaff(member)) {
    queue = await db.prepare(
      `SELECT t.id, t.taught_on, t.minutes, t.audience, t.notes, t.submitted_at,
              m.display_name, m.email
         FROM teaching_log t JOIN members m ON m.id=t.member_id
        WHERE m.chapter_code=? AND t.verified_at IS NULL
        ORDER BY t.taught_on DESC, t.id DESC LIMIT 100`
    ).bind(member.chapter_code).all();
  }

  return json({ ok: true, canTeach: mayTeach(member), isStaff: isStaff(member),
                mine: mine.results || [], queue: queue ? (queue.results || []) : null });
}

export async function onRequestPost(context) {
  const email = accessEmail(context.request);
  if (!email) return json({ ok: false, error: 'not_authenticated' }, 401);
  const db = context.env.YTC_ATTENDANCE;
  if (!db) return json({ ok: false, error: 'database_not_bound' }, 503);
  const member = await getMember(db, email);
  if (!member || member.status !== 'active') return json({ ok: false, error: 'not_active_member' }, 403);
  if (!mayTeach(member)) return json({ ok: false, error: 'teaching_permission_required' }, 403);

  let body = {};
  try { body = await context.request.json(); } catch (_) {}
  const taughtOn = String(body.taughtOn || '').trim();
  const minutes = Number(body.minutes || 0);
  const audience = String(body.audience || '').trim().slice(0, 120);
  const notes = String(body.notes || '').trim().slice(0, 500);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(taughtOn)) return json({ ok: false, error: 'date_required' }, 400);
  if (!Number.isFinite(minutes) || minutes <= 0 || minutes > 600) return json({ ok: false, error: 'minutes_invalid' }, 400);
  if (!audience) return json({ ok: false, error: 'audience_required' }, 400);

  const r = await db.prepare(
    `INSERT INTO teaching_log (member_id, taught_on, minutes, audience, notes) VALUES (?,?,?,?,?)`
  ).bind(member.id, taughtOn, Math.round(minutes), audience, notes || null).run();

  return json({ ok: true, id: r.meta?.last_row_id || null, status: 'submitted_for_verification' });
}

export async function onRequestPut(context) {
  const email = accessEmail(context.request);
  if (!email) return json({ ok: false, error: 'not_authenticated' }, 401);
  const db = context.env.YTC_ATTENDANCE;
  if (!db) return json({ ok: false, error: 'database_not_bound' }, 503);
  const member = await getMember(db, email);
  if (!member || member.status !== 'active' || !isStaff(member)) return json({ ok: false, error: 'admin_required' }, 403);

  let body = {};
  try { body = await context.request.json(); } catch (_) {}
  const id = Number(body.id || 0);
  const verified = body.verified !== false;
  if (!id) return json({ ok: false, error: 'id_required' }, 400);

  // Only entries from this sponsor's chapter.
  await db.prepare(
    `UPDATE teaching_log SET verified_by_email=?, verified_at=?
      WHERE id=? AND member_id IN (SELECT id FROM members WHERE chapter_code=?)`
  ).bind(verified ? email : null, verified ? new Date().toISOString() : null, id, member.chapter_code).run();

  return json({ ok: true, id, verified });
}
