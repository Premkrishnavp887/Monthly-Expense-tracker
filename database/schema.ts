/**
 * Database Table Schemas for Envelope Budget
 */

export const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS months (
  id TEXT PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS envelopes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  carry_over_enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS monthly_envelopes (
  id TEXT PRIMARY KEY,
  month_id TEXT NOT NULL,
  envelope_id TEXT NOT NULL,
  allocated_amount INTEGER NOT NULL DEFAULT 0,
  carry_over_amount INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (month_id) REFERENCES months (id),
  FOREIGN KEY (envelope_id) REFERENCES envelopes (id),
  UNIQUE(month_id, envelope_id)
);

CREATE TABLE IF NOT EXISTS income (
  id TEXT PRIMARY KEY,
  month_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  date TEXT NOT NULL,
  notes TEXT,
  recurring_income_id TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (month_id) REFERENCES months (id)
);

CREATE TABLE IF NOT EXISTS recurring_income (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  amount INTEGER NOT NULL,
  day_of_month INTEGER NOT NULL DEFAULT 1,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  month_id TEXT NOT NULL,
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  envelope_id TEXT,
  to_envelope_id TEXT,
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (month_id) REFERENCES months (id),
  FOREIGN KEY (envelope_id) REFERENCES envelopes (id),
  FOREIGN KEY (to_envelope_id) REFERENCES envelopes (id)
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;
