// /api/weekly — video of the week + question of the week (about LAST week's video).
// GET  -> this week's content + the student's watched/answered state + BYTCOIN balance
// POST -> {action:'watched'} or {action:'answer', answerIdx:n}; awards BYTCOIN once each per week

import { json, accessEmail, getMember, currentWeekId, prevWeekId, bytcoinBalance } from './_shared.js';

const WATCH_REWARD = 1;
const ANSWER_REWARD = 2;
const SURVEY_REWARD = 2;
const POTW_REWARD = 1;

async function loadWeek(db, weekId) {
  return db.prepare(`SELECT * FROM weekly_content WHERE week_id = ? LIMIT 1`).bind(weekId).first();
}

async function activity(db, memberId, weekId) {
  return db.prepare(
    `SELECT watched_at, answered_at, answer_correct FROM weekly_activity
      WHERE member_id = ? AND week_id = ? LIMIT 1`
  ).bind(memberId, weekId).first();
}

function publicWeek(row, act, potwDone, surveyDone) {
  if (!row) return null;
  let options = [], potwOptions = [], surveyQs = [];
  try { options = row.options_json ? JSON.parse(row.options_json) : []; } catch (_) {}
  try { potwOptions = row.potw_options_json ? JSON.parse(row.potw_options_json) : []; } catch (_) {}
  try { surveyQs = row.survey_json ? JSON.parse(row.survey_json) : []; } catch (_) {}
  return {
    weekId: row.week_id,
    video: {
      title: row.video_title,
      speaker: row.video_speaker,
      url: row.video_url,
      duration: row.video_duration,
      watched: !!(act && act.watched_at),
    },
    // Video survey — open-ended questions about the video. Shown instead of the quiz when set.
    videoSurvey: surveyQs.length ? {
      questions: surveyQs,
      answered: !!surveyDone,
    } : null,
    // Video quiz — always about LAST week's video. correct_idx never sent.
    videoQuiz: !surveyQs.length && row.question ? {
      text: row.question,
      options,
      aboutWeek: row.question_about_week,
      answered: !!(act && act.answered_at),
    } : null,
    // Question of the week — the club's listening device (hobbies, needs, ideas).
    potw: row.potw_question ? {
      text: row.potw_question,
      type: row.potw_type || 'text',
      options: potwOptions,
      answered: !!potwDone,
    } : null,
    agenda: row.agenda_override || null,
  };
}

async function potwAnswer(db, memberId, weekId) {
  return db.prepare(
    `SELECT id FROM potw_answers WHERE member_id = ? AND week_id = ? LIMIT 1`
  ).bind(memberId, weekId).first();
}

async function surveyAnswer(db, memberId, weekId) {
  return db.prepare(
    `SELECT id FROM survey_answers WHERE member_id = ? AND week_id = ? LIMIT 1`
  ).bind(memberId, weekId).first();
}

export async function onRequestGet(context) {
  const email = accessEmail(context.request);
  if (!email) return json({ ok: false, error: 'not_authenticated' }, 401);
  const db = context.env.YTC_ATTENDANCE;
  if (!db) return json({ ok: false, error: 'database_not_bound' }, 503);
  const member = await getMember(db, email);
  if (!member) return json({ ok: false, error: 'not_active_member' }, 403);

  const weekId = currentWeekId();
  let row = await loadWeek(db, weekId);
  if (!row) row = await loadWeek(db, prevWeekId(weekId)); // sponsor hasn't posted yet: carry last week
  const act = row ? await activity(db, member.id, row.week_id) : null;
  const potwDone = row ? await potwAnswer(db, member.id, row.week_id) : null;
  const surveyDone = row ? await surveyAnswer(db, member.id, row.week_id) : null;

  return json({
    ok: true,
    week: publicWeek(row, act, potwDone, surveyDone),
    bytcoin: await bytcoinBalance(db, member.id),
  });
}

export async function onRequestPost(context) {
  const email = accessEmail(context.request);
  if (!email) return json({ ok: false, error: 'not_authenticated' }, 401);
  const db = context.env.YTC_ATTENDANCE;
  if (!db) return json({ ok: false, error: 'database_not_bound' }, 503);
  const member = await getMember(db, email);
  if (!member) return json({ ok: false, error: 'not_active_member' }, 403);

  let body = {};
  try { body = await context.request.json(); } catch (_) {}
  const weekId = currentWeekId();
  let row = await loadWeek(db, weekId);
  if (!row) row = await loadWeek(db, prevWeekId(weekId));
  if (!row) return json({ ok: false, error: 'no_weekly_content' }, 404);

  await db.prepare(
    `INSERT INTO weekly_activity (member_id, week_id) VALUES (?, ?)
     ON CONFLICT(member_id, week_id) DO NOTHING`
  ).bind(member.id, row.week_id).run();
  const act = await activity(db, member.id, row.week_id);

  if (body.action === 'watched') {
    if (act.watched_at) return json({ ok: true, already: true, bytcoin: await bytcoinBalance(db, member.id) });
    await db.prepare(
      `UPDATE weekly_activity SET watched_at = CURRENT_TIMESTAMP
        WHERE member_id = ? AND week_id = ? AND watched_at IS NULL`
    ).bind(member.id, row.week_id).run();
    await db.prepare(
      `INSERT INTO bytcoin_ledger (member_id, amount, reason, ref) VALUES (?, ?, 'video_watched', ?)`
    ).bind(member.id, WATCH_REWARD, row.week_id).run();
    return json({ ok: true, awarded: WATCH_REWARD, bytcoin: await bytcoinBalance(db, member.id) });
  }

  if (body.action === 'answer') {
    if (!row.question || row.correct_idx == null) return json({ ok: false, error: 'no_question_this_week' }, 400);
    if (act.answered_at) return json({ ok: true, already: true, correct: !!act.answer_correct, bytcoin: await bytcoinBalance(db, member.id) });
    const idx = Number(body.answerIdx);
    const correct = idx === Number(row.correct_idx);
    if (!correct) return json({ ok: true, correct: false, bytcoin: await bytcoinBalance(db, member.id) }); // retry allowed
    await db.prepare(
      `UPDATE weekly_activity SET answered_at = CURRENT_TIMESTAMP, answer_correct = 1
        WHERE member_id = ? AND week_id = ? AND answered_at IS NULL`
    ).bind(member.id, row.week_id).run();
    await db.prepare(
      `INSERT INTO bytcoin_ledger (member_id, amount, reason, ref) VALUES (?, ?, 'question_correct', ?)`
    ).bind(member.id, ANSWER_REWARD, row.week_id).run();
    return json({ ok: true, correct: true, awarded: ANSWER_REWARD, bytcoin: await bytcoinBalance(db, member.id) });
  }

  if (body.action === 'survey') {
    let surveyQs = [];
    try { surveyQs = row.survey_json ? JSON.parse(row.survey_json) : []; } catch (_) {}
    if (!surveyQs.length) return json({ ok: false, error: 'no_survey_this_week' }, 400);
    const existing = await surveyAnswer(db, member.id, row.week_id);
    if (existing) return json({ ok: true, already: true, bytcoin: await bytcoinBalance(db, member.id) });
    const raw = Array.isArray(body.answers) ? body.answers : [];
    const answers = surveyQs.map((_, i) => String(raw[i] || '').trim().slice(0, 2000));
    if (answers.some(a => !a)) return json({ ok: false, error: 'all_answers_required' }, 400);
    await db.prepare(
      `INSERT INTO survey_answers (member_id, week_id, answers_json) VALUES (?, ?, ?)
       ON CONFLICT(member_id, week_id) DO NOTHING`
    ).bind(member.id, row.week_id, JSON.stringify(answers)).run();
    await db.prepare(
      `INSERT INTO bytcoin_ledger (member_id, amount, reason, ref) VALUES (?, ?, 'survey_answered', ?)`
    ).bind(member.id, SURVEY_REWARD, row.week_id).run();
    return json({ ok: true, awarded: SURVEY_REWARD, bytcoin: await bytcoinBalance(db, member.id) });
  }

  if (body.action === 'potw') {
    if (!row.potw_question) return json({ ok: false, error: 'no_potw_this_week' }, 400);
    const existing = await potwAnswer(db, member.id, row.week_id);
    if (existing) return json({ ok: true, already: true, bytcoin: await bytcoinBalance(db, member.id) });
    const answer = String(body.answer || '').trim().slice(0, 2000);
    if (!answer) return json({ ok: false, error: 'answer_required' }, 400);
    await db.prepare(
      `INSERT INTO potw_answers (member_id, week_id, answer_text) VALUES (?, ?, ?)
       ON CONFLICT(member_id, week_id) DO NOTHING`
    ).bind(member.id, row.week_id, answer).run();
    await db.prepare(
      `INSERT INTO bytcoin_ledger (member_id, amount, reason, ref) VALUES (?, ?, 'potw_answered', ?)`
    ).bind(member.id, POTW_REWARD, row.week_id).run();
    return json({ ok: true, awarded: POTW_REWARD, bytcoin: await bytcoinBalance(db, member.id) });
  }

  return json({ ok: false, error: 'unknown_action' }, 400);
}
