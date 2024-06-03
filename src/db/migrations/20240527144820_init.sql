-- +goose Up
CREATE TABLE "user" (
  id SERIAL PRIMARY KEY,
  google_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL
);

CREATE TABLE task (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES "user"(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  title TEXT NOT NULL,
  description TEXT,
  finish_timestamp TIMESTAMP NOT NULL,
  completed_timestamp TIMESTAMP,
  failed_recipient_email TEXT,
  failed_message TEXT
);

CREATE TABLE contact (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES "user"(id),
  email TEXT NOT NULL
);

-- +goose Down
DROP TABLE contact;
DROP TABLE task;
DROP TABLE "user";

