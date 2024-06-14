-- +goose Up
CREATE TABLE "user" (
  id SERIAL PRIMARY KEY,
  google_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL
);

CREATE TYPE status AS ENUM('ongoing', 'failed', 'completed', 'error');

CREATE TABLE task (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES "user"(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  title TEXT NOT NULL,
  description TEXT,
  finish_timestamp TIMESTAMP NOT NULL,
  status STATUS NOT NULL,
  completed_timestamp TIMESTAMP,
  failed_recipient_email TEXT,
  failed_message TEXT,
  error_message TEXT
);

CREATE TABLE contact (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES "user"(id),
  email TEXT NOT NULL
);

CREATE TABLE message (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES "user"(id),
  content TEXT NOT NULL
);

-- +goose Down
DROP TABLE IF EXISTS message;
DROP TABLE IF EXISTS contact;
DROP TABLE IF EXISTS task;
DROP TYPE IF EXISTS status;
DROP TABLE IF EXISTS "user";


