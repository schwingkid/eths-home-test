import { COURSES } from './courses-data.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

// Public ICS feed of the YTC@ETHS Google Calendar.
const CALENDAR_ICS =
  'https://calendar.google.com/calendar/ical/c_16190cd950ee7c8e1a2a97f81eb50c97a5baccf4182dd8e73e70266062038897%40group.calendar.google.com/public/basic.ics';

function icsUnescape(s) {
  return s.replace(/\\n/g, ' ').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\');
}

// Minimal ICS parser: returns the next `limit` upcoming events, soonest first.
function parseIcsEvents(ics, limit = 5) {
  const lines = ics.replace(/\r\n[ \t]/g, '').split(/\r?\n/); // unfold wrapped lines
  const events = [];
  let cur = null;
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') { cur = {}; continue; }
    if (line === 'END:VEVENT') { if (cur) events.push(cur); cur = null; continue; }
    if (!cur) continue;
    const m = line.match(/^(DTSTART|SUMMARY|LOCATION)[^:]*:(.*)$/);
    if (m) cur[m[1]] = m[2];
  }
  const now = Date.now();
  const upcoming = [];
  for (const ev of events) {
    if (!ev.DTSTART || !ev.SUMMARY) continue;
    const v = ev.DTSTART;
    let dt;
    if (/^\d{8}T\d{6}Z?$/.test(v)) {
      dt = new Date(Date.UTC(+v.slice(0, 4), +v.slice(4, 6) - 1, +v.slice(6, 8), +v.slice(9, 11), +v.slice(11, 13), +v.slice(13, 15)));
      if (!v.endsWith('Z')) dt = new Date(dt.getTime() + 5 * 3600 * 1000); // floating/local: assume America/Chicago (CDT)
    } else if (/^\d{8}$/.test(v)) {
      dt = new Date(Date.UTC(+v.slice(0, 4), +v.slice(4, 6) - 1, +v.slice(6, 8), 12));
    } else continue;
    if (dt.getTime() < now - 3600 * 1000) continue;
    upcoming.push({ when: dt, title: icsUnescape(ev.SUMMARY), location: ev.LOCATION ? icsUnescape(ev.LOCATION) : '' });
  }
  upcoming.sort((a, b) => a.when - b.when);
  const todayStr = new Date().toLocaleDateString('en-US', { timeZone: 'America/Chicago' });
  const todayEv = upcoming.find(e => e.when.toLocaleDateString('en-US', { timeZone: 'America/Chicago' }) === todayStr) || null;
  return {
    today: todayEv ? { title: todayEv.title, location: todayEv.location } : null,
    list: upcoming.slice(0, limit).map(e => {
      const label = e.when.toLocaleString('en-US', {
        timeZone: 'America/Chicago', weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
      });
      return `${label} — ${e.title}${e.location ? ' (' + e.location + ')' : ''}`;
    }),
  };
}

async function fetchCalendarEvents() {
  try {
    const r = await fetch(CALENDAR_ICS, { cf: { cacheTtl: 300, cacheEverything: true } });
    if (!r.ok) return { note: 'Calendar feed is not reachable right now.', events: [], today: null };
    const parsed = parseIcsEvents(await r.text());
    return {
      note: parsed.list.length ? 'Upcoming from the YTC@ETHS club calendar.' : 'No upcoming events posted yet.',
      events: parsed.list,
      today: parsed.today,
    };
  } catch (_) {
    return { note: 'Calendar feed is not reachable right now.', events: [], today: null };
  }
}

const COURSE_ORDER = ['course1', 'course2', 'course3'];

async function journeyFor(db, memberId) {
  const rows = (await db.prepare(
    `SELECT course_key, lesson_no FROM progress WHERE member_id = ?`
  ).bind(memberId).all()).results || [];
  const counts = {};
  for (const r of rows) counts[r.course_key] = (counts[r.course_key] || 0) + 1;
  const teach = await db.prepare(
    `SELECT COALESCE(SUM(minutes), 0) AS m FROM teaching_log WHERE member_id = ? AND verified_at IS NOT NULL`
  ).bind(memberId).first();
  const meetings = await db.prepare(
    `SELECT COUNT(*) AS c FROM attendance WHERE member_id = ?`
  ).bind(memberId).first();

  let currentCourse = 'course1', nextLesson = 1;
  for (const key of COURSE_ORDER) {
    const done = counts[key] || 0;
    if (done < 6) { currentCourse = key; nextLesson = done + 1; break; }
    currentCourse = null; // all courses complete
  }
  return {
    courses: COURSE_ORDER.map(k => ({ key: k, passed: counts[k] || 0, of: 6 })),
    currentCourse, nextLesson,
    minutesTaught: teach ? teach.m : 0,
    meetingsAttended: meetings ? meetings.c : 0,
  };
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

  const cal = await fetchCalendarEvents();
  // Each chapter is self-contained: its own Classroom (or none yet).
  const chapter = await db.prepare(
    `SELECT name, classroom_url, classroom_join_code, classroom_note FROM chapters WHERE chapter_code = ? LIMIT 1`
  ).bind(member.chapter_code).first();
  const chapterClassroom = chapter && chapter.classroom_url ? {
    title: 'Google Classroom',
    note: chapter.classroom_note || ('Your program’s Classroom' + (chapter.classroom_join_code ? ' — join code ' + chapter.classroom_join_code : '')),
    url: chapter.classroom_url,
    joinCode: chapter.classroom_join_code || null,
  } : null;
  const profile = await db.prepare(
    `SELECT preferred_name, grade, photo_url FROM profiles WHERE member_id = ? LIMIT 1`
  ).bind(member.id).first();
  const journey = await journeyFor(db, member.id);
  const balRow = await db.prepare(
    `SELECT COALESCE(SUM(amount), 0) AS bal FROM bytcoin_ledger WHERE member_id = ?`
  ).bind(member.id).first();

  return json({
    ok: true,
    profile: profile || null,
    journey,
    bytcoin: balRow ? balRow.bal : 0,
    todayAgenda: cal.today,
    calendar: {
      title: 'YTC ETHS Calendar',
      note: cal.note,
      events: cal.events
    },
    classroom: chapterClassroom,
    courses: COURSES,
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
      { title: 'Google Classroom', status: 'Course 1 live — join code y6rgx4pf' },
      { title: 'Club files', status: 'Connection pending' },
      { title: 'Leadership + hours', status: 'Next phase' }
    ]
  });
}
