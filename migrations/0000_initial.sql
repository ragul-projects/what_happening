CREATE TABLE IF NOT EXISTS "pastes" (
  "id" serial PRIMARY KEY,
  "paste_id" text NOT NULL UNIQUE,
  "title" text DEFAULT 'Untitled',
  "content" text NOT NULL,
  "language" text DEFAULT 'plaintext',
  "created_at" timestamp NOT NULL DEFAULT now(),
  "views" integer NOT NULL DEFAULT 0,
  "expires_at" timestamp,
  "author_name" text DEFAULT 'Anonymous',
  "tags" text[],
  "is_file" boolean DEFAULT false,
  "file_name" text,
  "file_type" text
); 