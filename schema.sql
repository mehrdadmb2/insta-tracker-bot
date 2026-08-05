-- Create the insta-db D1 database first: wrangler d1 create insta-db

CREATE TABLE IF NOT EXISTS insta (
  chat_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  user_data TEXT,
  fetch_info TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  added_at INTEGER DEFAULT 0,
  last_checked INTEGER DEFAULT 0,
  PRIMARY KEY (chat_id, user_id)
);

CREATE TABLE IF NOT EXISTS settings (
  chat_id INTEGER PRIMARY KEY,
  language TEXT DEFAULT 'en'
);
