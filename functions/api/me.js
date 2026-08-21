// /api/me — the signed-in student's identity and profile.
// GET  -> member + profile (profile null = needs onboarding)
// POST -> save/update profile from the onboarding form

import { json, accessEmail, getMember } from './_shared.js';

export async function onRequestGet(context) {
  const email = accessEmail(context.request);
  if (!email) return json({ ok: false, error: 'not_authenticated' }, 401);
  const db = context.env.YTC_ATTENDANCE;
  if (!db) return json({ ok: false, error: 'database_not_bound' }, 503);

  const member = await getMember(db, email);
  if (!member) return json({ ok: false, error: 'not_active_member' }, 403);

  const profile = await db.prepare(
    `SELECT preferred_name, grade, school_email, other_clubs, years_in_ytc,
            why_joined, favorite_moment, photo_url
       FROM profiles WHERE member_id = ? LIMIT 1`
  ).bind(member.id).first();

  return json({
    ok: true,
    member: {
      name: member.display_name || member.email,
      email: member.email,
      chapter: member.chapter_code,
      role: member.role,
      canTeach: !!member.can_teach,
    },
    profile: profile || null,
  });
}

const FIELDS = ['preferred_name', 'grade', 'school_email', 'other_clubs',
  'years_in_ytc', 'why_joined', 'favorite_moment'];

export async function onRequestPost(context) {
  const email = accessEmail(context.request);
  if (!email) return json({ ok: false, error: 'not_authenticated' }, 401);
  const db = context.env.YTC_ATTENDANCE;
  if (!db) return json({ ok: false, error: 'database_not_bound' }, 503);

  const member = await getMember(db, email);
  if (!member) return json({ ok: false, error: 'not_active_member' }, 403);

  let body = {};
  try { body = await context.request.json(); } catch (_) {}

  const vals = {};
  for (const f of FIELDS) {
    let v = body[f];
    if (typeof v !== 'string') v = v == null ? null : String(v);
    if (v) v = v.trim().slice(0, 2000);
    vals[f] = v || null;
  }
  if (!vals.preferred_name) return json({ ok: false, error: 'name_required' }, 400);

  await db.prepare(
    `INSERT INTO profiles (member_id, preferred_name, grade, school_email, other_clubs,
                           years_in_ytc, why_joined, favorite_moment, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(member_id) DO UPDATE SET
       preferred_name = excluded.preferred_name,
       grade = excluded.grade,
       school_email = excluded.school_email,
       other_clubs = excluded.other_clubs,
       years_in_ytc = excluded.years_in_ytc,
       why_joined = excluded.why_joined,
       favorite_moment = excluded.favorite_moment,
       updated_at = CURRENT_TIMESTAMP`
  ).bind(member.id, vals.preferred_name, vals.grade, vals.school_email, vals.other_clubs,
         vals.years_in_ytc, vals.why_joined, vals.favorite_moment).run();

  return json({ ok: true });
}
