-- YTC Student Portal attendance schema (Cloudflare D1)
-- Attendance means participation in a YTC session, not physical presence in one room.
-- Three records are kept: in-person (room code), virtual learning (same code, join_mode='online'),
-- and virtual teaching (separate teaching_log, permissioned, sponsor-verified).

CREATE TABLE IF NOT EXISTS members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  display_name TEXT,
  chapter_code TEXT NOT NULL DEFAULT 'ETHS',
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student','leader','sponsor','admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  can_teach INTEGER NOT NULL DEFAULT 0,          -- 1 = approved student-teacher (may log teaching sessions)
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chapter_code TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'chapter' CHECK (scope IN ('chapter','global')),
  mode TEXT NOT NULL DEFAULT 'hybrid' CHECK (mode IN ('in_person','virtual','hybrid')),
  title TEXT NOT NULL DEFAULT 'YTC Club Meeting',
  session_date TEXT NOT NULL,
  checkin_code TEXT NOT NULL,                     -- rotating meeting code shown by the sponsor
  opens_at TEXT NOT NULL,
  closes_at TEXT NOT NULL,
  created_by_email TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (chapter_code, session_date)             -- one meeting per chapter per day (matches admin-session.js upsert)
);

CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  member_id INTEGER NOT NULL,
  checked_in_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  checked_out_at TEXT,
  join_mode TEXT NOT NULL DEFAULT 'online' CHECK (join_mode IN ('in_person','online','other')),
  source TEXT NOT NULL DEFAULT 'portal',
  FOREIGN KEY (session_id) REFERENCES sessions(id),
  FOREIGN KEY (member_id) REFERENCES members(id),
  UNIQUE (session_id, member_id)
);

-- Virtual teaching is logged separately from learning and must be verified by a sponsor/admin.
CREATE TABLE IF NOT EXISTS teaching_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER NOT NULL,
  taught_on TEXT NOT NULL,                        -- YYYY-MM-DD
  minutes INTEGER NOT NULL CHECK (minutes > 0 AND minutes <= 600),
  audience TEXT NOT NULL,                         -- e.g. "Namibia cohort", "ETHS freshmen", "Camp Kuumba"
  notes TEXT,
  submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  verified_by_email TEXT,
  verified_at TEXT,
  FOREIGN KEY (member_id) REFERENCES members(id)
);

CREATE INDEX IF NOT EXISTS idx_members_chapter_status ON members(chapter_code, status);
CREATE INDEX IF NOT EXISTS idx_sessions_chapter_time ON sessions(chapter_code, opens_at, closes_at);
CREATE INDEX IF NOT EXISTS idx_sessions_scope_time ON sessions(scope, opens_at, closes_at);
CREATE INDEX IF NOT EXISTS idx_attendance_member_session ON attendance(member_id, session_id);
CREATE INDEX IF NOT EXISTS idx_teaching_member ON teaching_log(member_id, taught_on);

-- If the database was created from the earlier version of this file, run these once instead of recreating:
-- ALTER TABLE members  ADD COLUMN can_teach INTEGER NOT NULL DEFAULT 0;
-- ALTER TABLE sessions ADD COLUMN checkin_code TEXT NOT NULL DEFAULT 'CHANGE';
-- (SQLite cannot alter a UNIQUE constraint in place; if the old UNIQUE(chapter_code,session_date,title) exists,
--  create a UNIQUE INDEX instead:)  CREATE UNIQUE INDEX IF NOT EXISTS ux_sessions_day ON sessions(chapter_code, session_date);

-- Example seed rows. Replace with real approved club members before launch.
-- INSERT INTO members (email, display_name, chapter_code, role, can_teach) VALUES ('student@example.org','Student Name','ETHS','student',0);
-- INSERT INTO members (email, display_name, chapter_code, role, can_teach) VALUES ('teacher@example.org','Student Teacher','ETHS','leader',1);
-- INSERT INTO members (email, display_name, chapter_code, role) VALUES ('sponsor@example.org','Club Sponsor','ETHS','sponsor');
