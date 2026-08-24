// Roster management for YTC portal sponsors.
// GET   -> list the caller's chapter roster
// POST  {action:'preview', text}            -> parse a pasted block, classify every line
// POST  {action:'add', entries, role}       -> add the parsed entries as active members
// POST  {action:'setStatus', email, status} -> deactivate / reactivate one member
//
// Nothing here ever deletes a member. Deactivating keeps the attendance,
// BYTCOIN and teaching history intact and simply closes the door.

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

function accessEmail(request) {
  return (request.headers.get('cf-access-authenticated-user-email') || '').trim().toLowerCase();
}

async function staffMember(db, email) {
  const member = await db.prepare(
    `SELECT id, email, display_name, chapter_code, role, status
       FROM members WHERE lower(email)=lower(?) LIMIT 1`
  ).bind(email).first();
  if (!member || member.status !== 'active' || !['sponsor', 'admin'].includes(member.role)) return null;
  return member;
}

const MAX_ENTRIES = 300;
const EMAIL_RE = /^[^\s@,;<>]+@[^\s@,;<>]+\.[A-Za-z]{2,}$/;

// Pull a name and an address out of one pasted line.
// Handles:  a@b.org  |  Name <a@b.org>  |  "Name" <a@b.org>
//           Name, a@b.org  |  a@b.org, Name  |  tab-separated columns
function parseLine(raw) {
  const line = String(raw || '').replace(/ /g, ' ').trim().replace(/^[\s,;]+|[\s,;]+$/g, '');
  if (!line) return null;

  // Name <email>
  const angled = line.match(/^(.*?)[<＜]\s*([^>＞]+)\s*[>＞]$/);
  if (angled) {
    const email = angled[2].trim().toLowerCase();
    const name = angled[1].trim().replace(/^["']|["']$/g, '').replace(/[,;]$/, '').trim();
    return { raw: line, email, display_name: name || null };
  }

  // Split on tab, comma or semicolon and find the part that looks like an address.
  const parts = line.split(/[\t,;]+/).map(s => s.trim()).filter(Boolean);
  if (parts.length > 1) {
    const idx = parts.findIndex(pp => EMAIL_RE.test(pp));
    if (idx !== -1) {
      const email = parts[idx].toLowerCase();
      const name = parts.filter((_, i) => i !== idx).join(' ').replace(/^["']|["']$/g, '').trim();
      return { raw: line, email, display_name: name || null };
    }
    return { raw: line, email: parts[0].toLowerCase(), display_name: null };
  }

  return { raw: line, email: line.toLowerCase(), display_name: null };
}

function parseBlock(text) {
  const lines = String(text || '').split(/[\r\n]+/);
  const out = [];
  for (const l of lines) {
    const p = parseLine(l);
    if (p) out.push(p);
  }
  return out;
}

async function classify(db, chapter, parsed) {
  const valid = [], invalid = [], duplicate = [];
  const seen = new Set();

  for (const p of parsed) {
    if (!EMAIL_RE.test(p.email)) { invalid.push(p); continue; }
    if (seen.has(p.email)) { duplicate.push(p); continue; }
    seen.add(p.email);
    valid.push(p);
  }

  const existing = new Map();
  const emails = [...seen];
  for (let i = 0; i < emails.length; i += 40) {
    const chunk = emails.slice(i, i + 40);
    const placeholders = chunk.map(() => 'lower(?)').join(',');
    const rows = await db.prepare(
      `SELECT email, display_name, role, status, chapter_code
         FROM members WHERE lower(email) IN (${placeholders})`
    ).bind(...chunk).all();
    for (const r of (rows.results || [])) existing.set(String(r.email).toLowerCase(), r);
  }

  const fresh = [], already = [];
  for (const p of valid) {
    const hit = existing.get(p.email);
    if (hit) already.push({ ...p, current: hit });
    else fresh.push(p);
  }

  return { fresh, already, invalid, duplicate, chapter };
}

export async function onRequestGet(context) {
  const email = accessEmail(context.request);
  if (!email) return json({ ok: false, error: 'not_authenticated' }, 401);
  const db = context.env.YTC_ATTENDANCE;
  if (!db) return json({ ok: false, error: 'database_not_bound' }, 503);
  const me = await staffMember(db, email);
  if (!me) return json({ ok: false, error: 'admin_required' }, 403);

  const rows = await db.prepare(
    `SELECT id, email, display_name, role, status, can_teach, created_at
       FROM members WHERE chapter_code = ?
      ORDER BY CASE status WHEN 'active' THEN 0 ELSE 1 END,
               CASE role WHEN 'admin' THEN 0 WHEN 'sponsor' THEN 1 WHEN 'leader' THEN 2 ELSE 3 END,
               lower(COALESCE(display_name, email))`
  ).bind(me.chapter_code).all();

  const members = rows.results || [];
  return json({
    ok: true,
    chapter: me.chapter_code,
    you: { email: me.email, role: me.role },
    counts: {
      total: members.length,
      active: members.filter(m => m.status === 'active').length,
      students: members.filter(m => m.role === 'student' && m.status === 'active').length,
    },
    members,
  });
}

export async function onRequestPost(context) {
  const email = accessEmail(context.request);
  if (!email) return json({ ok: false, error: 'not_authenticated' }, 401);
  const db = context.env.YTC_ATTENDANCE;
  if (!db) return json({ ok: false, error: 'database_not_bound' }, 503);
  const me = await staffMember(db, email);
  if (!me) return json({ ok: false, error: 'admin_required' }, 403);

  let body;
  try { body = await context.request.json(); }
  catch { return json({ ok: false, error: 'bad_request' }, 400); }

  const action = String(body.action || '');

  /* ---------- preview ---------- */
  if (action === 'preview') {
    const parsed = parseBlock(body.text);
    if (!parsed.length) return json({ ok: true, empty: true, fresh: [], already: [], invalid: [], duplicate: [] });
    if (parsed.length > MAX_ENTRIES) {
      return json({ ok: false, error: 'too_many', limit: MAX_ENTRIES, found: parsed.length }, 400);
    }
    const result = await classify(db, me.chapter_code, parsed);
    return json({ ok: true, ...result });
  }

  /* ---------- add ---------- */
  if (action === 'add') {
    const entries = Array.isArray(body.entries) ? body.entries : [];
    if (!entries.length) return json({ ok: false, error: 'nothing_to_add' }, 400);
    if (entries.length > MAX_ENTRIES) {
      return json({ ok: false, error: 'too_many', limit: MAX_ENTRIES, found: entries.length }, 400);
    }
    // Sponsors may create students and student leaders only. Staff roles stay manual.
    const role = ['student', 'leader'].includes(body.role) ? body.role : 'student';

    const clean = [];
    const seen = new Set();
    for (const e of entries) {
      const addr = String(e && e.email || '').trim().toLowerCase();
      if (!EMAIL_RE.test(addr) || seen.has(addr)) continue;
      seen.add(addr);
      let name = e && e.display_name ? String(e.display_name).trim().slice(0, 120) : null;
      if (name === '') name = null;
      clean.push({ email: addr, display_name: name });
    }
    if (!clean.length) return json({ ok: false, error: 'nothing_valid' }, 400);

    const stmt = db.prepare(
      `INSERT OR IGNORE INTO members (email, display_name, chapter_code, role, status)
       VALUES (?, ?, ?, ?, 'active')`
    );
    const results = await db.batch(
      clean.map(c => stmt.bind(c.email, c.display_name, me.chapter_code, role))
    );
    const added = results.reduce((n, r) => n + ((r.meta && r.meta.changes) || 0), 0);

    return json({ ok: true, added, submitted: clean.length, skipped: clean.length - added, role });
  }

  /* ---------- activate / deactivate ---------- */
  if (action === 'setStatus') {
    const target = String(body.email || '').trim().toLowerCase();
    const status = body.status === 'inactive' ? 'inactive' : 'active';
    if (!EMAIL_RE.test(target)) return json({ ok: false, error: 'bad_email' }, 400);
    if (target === String(me.email).toLowerCase()) {
      return json({ ok: false, error: 'cannot_change_self' }, 400);
    }

    const row = await db.prepare(
      `SELECT email, role, chapter_code FROM members WHERE lower(email)=lower(?) LIMIT 1`
    ).bind(target).first();
    if (!row) return json({ ok: false, error: 'not_found' }, 404);
    if (row.chapter_code !== me.chapter_code) return json({ ok: false, error: 'other_chapter' }, 403);
    if (row.role === 'admin') return json({ ok: false, error: 'cannot_change_admin' }, 403);

    await db.prepare(`UPDATE members SET status=? WHERE lower(email)=lower(?)`).bind(status, target).run();
    return json({ ok: true, email: target, status });
  }

  return json({ ok: false, error: 'unknown_action' }, 400);
}
