-- Creates tables for ED Chat
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS groups_tbl (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_groups (
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  group_id INT REFERENCES groups_tbl(id) ON DELETE CASCADE,
  PRIMARY KEY(user_id, group_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  group_id INT REFERENCES groups_tbl(id),
  content TEXT,
  media_url TEXT,
  media_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
