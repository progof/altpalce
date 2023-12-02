CREATE TABLE IF NOT EXISTS users (
  user_id BIGSERIAL PRIMARY KEY NOT NULL,
  username VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  password VARCHAR(200) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_sessions (
  user_id SERIAL PRIMARY KEY,
  token TEXT
);    