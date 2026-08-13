-- YTC Student Portal attendance schema (Cloudflare D1)
-- Attendance means participation in a YTC session, not physical presence in one room.

CREATE TABLE IF NOT EXISTS members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  display_name TEXT,
  chapter_code TEXT NOT NULL DEFAULT 'ETHS',
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student','leader','sponsor','admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chapter_code TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'chapter' CHECK (scope IN ('chapter','global')),
  mode TEXT NOT NULL DEFAULT 'hybrid' CHECK (mode IN ('in_person','virtual','hybrid')),
  title TEXT NOT NULL DEFAULT 'YTC Club Meeting',
  session_date TEXT NOT NULL,
  opens_at TEXT NOT NULL,
  closes_at TEXT NOT NULL,
  created_by_email TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (chapter_code, session_date, title)
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

CREATE INDEX IF NOT EXISTS idx_members_chapter_status ON members(chapter_code, status);
CREATE INDEX IF NOT EXISTS idx_sessions_chapter_time ON sessions(chapter_code, opens_at, closes_at);
CREATE INDEX IF NOT EXISTS idx_sessions_scope_time ON sessions(scope, opens_at, closes_at);
CREATE INDEX IF NOT EXISTS idx_attendance_member_session ON attendance(member_id, session_id);

-- Example seed rows. Replace with real approved club members before launch.
-- INSERT INTO members (email, display_name, chapter_code, role) VALUES ('student@example.org','Student Name','ETHS','student');
-- INSERT INTO members (email, display_name, chapter_code, role) VALUES ('sponsor@example.org','Club Sponsor','ETHS','sponsor');
