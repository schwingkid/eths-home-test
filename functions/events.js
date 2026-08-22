// Public upcoming-events feed for the Student Hub front door (no auth).
// Reads the public YTC@ETHS Google Calendar ICS and returns the next few events.

const CALENDAR_ICS =
  'https://calendar.google.com/calendar/ical/c_16190cd950ee7c8e1a2a97f81eb50c97a5baccf4182dd8e73e70266062038897%40group.calendar.google.com/public/basic.ics';

function icsUnescape(s) {
  return s.replace(/\\n/g, ' ').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\');
}

function parseIcs(ics, limit) {
  const lines = ics.replace(/\r\n[ \t]/g, '').split(/\r?\n/);
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
  const up = [];
  for (const ev of events) {
    if (!ev.DTSTART || !ev.SUMMARY) continue;
    const v = ev.DTSTART;
    let dt;
    if (/^\d{8}T\d{6}Z?$/.test(v)) {
      dt = new Date(Date.UTC(+v.slice(0, 4), +v.slice(4, 6) - 1, +v.slice(6, 8), +v.slice(9, 11), +v.slice(11, 13), +v.slice(13, 15)));
      if (!v.endsWith('Z')) dt = new Date(dt.getTime() + 5 * 3600 * 1000);
    } else if (/^\d{8}$/.test(v)) {
      dt = new Date(Date.UTC(+v.slice(0, 4), +v.slice(4, 6) - 1, +v.slice(6, 8), 12));
    } else continue;
    if (dt.getTime() < now - 3600 * 1000) continue;
    up.push({ when: dt, title: icsUnescape(ev.SUMMARY), location: ev.LOCATION ? icsUnescape(ev.LOCATION) : '' });
  }
  up.sort((a, b) => a.when - b.when);
  return up.slice(0, limit).map(e => ({
    title: e.title,
    location: e.location,
    weekday: e.when.toLocaleDateString('en-US', { timeZone: 'America/Chicago', weekday: 'short' }),
    month: e.when.toLocaleDateString('en-US', { timeZone: 'America/Chicago', month: 'short' }),
    day: e.when.toLocaleDateString('en-US', { timeZone: 'America/Chicago', day: 'numeric' }),
    time: e.when.toLocaleTimeString('en-US', { timeZone: 'America/Chicago', hour: 'numeric', minute: '2-digit' }),
    iso: e.when.toISOString(),
  }));
}

function json(data) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=300',
      'access-control-allow-origin': '*',
    },
  });
}

export async function onRequestGet() {
  try {
    const r = await fetch(CALENDAR_ICS, { cf: { cacheTtl: 300, cacheEverything: true } });
    if (!r.ok) return json({ ok: false, events: [] });
    return json({ ok: true, events: parseIcs(await r.text(), 5) });
  } catch (_) {
    return json({ ok: false, events: [] });
  }
}
