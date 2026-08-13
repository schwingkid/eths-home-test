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
    `SELECT id, email, display_name, chapter_code, role, status
       FROM members WHERE lower(email)=lower(?) LIMIT 1`
  ).bind(email).first();
  if (!member || member.status !== 'active') return json({ ok: false, error: 'not_active_member' }, 403);

  const session = await db.prepare(
    `SELECT id, title, session_date, opens_at, closes_at
       FROM sessions
      WHERE chapter_code = ?
        AND datetime('now') BETWEEN datetime(opens_at) AND datetime(closes_at)
      ORDER BY id DESC LIMIT 1`
  ).bind(member.chapter_code).first();

  if (session) {
    const attendance = await db.prepare(
      `SELECT id FROM attendance WHERE session_id=? AND member_id=? LIMIT 1`
    ).bind(session.id, member.id).first();
    if (!attendance) return json({ ok: false, error: 'checkin_required' }, 423);
  }

  return json({
    ok: true,
    calendar: {
      title: 'YTC ETHS Calendar',
      note: 'Calendar source not connected yet. This panel is ready for the club calendar feed.',
      events: []
    },
    today: {
      title: session ? session.title : 'No active club meeting right now',
      date: session ? session.session_date : null,
      note: session ? 'You are checked in. Clubroom tools are unlocked.' : 'Members can still use the portal outside meeting hours.'
    },
    opportunities: [
      {
        status: 'Confirmed partnership',
        title: 'Learn from Student Makers at Georgia Tech',
        text: 'Future engineers from Student Makers at Georgia Tech will teach STEM courses virtually into the ETHS YTC Clubroom this school year.'
      },
      {
        status: 'In development',
        title: 'Teach forward at Foster School',
        text: 'YTC is developing a weekly after-school program with Foster School and Camp Kuumba. ETHS student teaching teams are planned for robotics and French and French culture, including Haiti.'
      }
    ],
    resources: [
      { title: 'Google Classroom', status: 'Connection pending' },
      { title: 'Club files', status: 'Connection pending' },
      { title: 'Leadership + hours', status: 'Next phase' }
    ]
  });
}
