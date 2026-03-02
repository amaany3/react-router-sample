CREATE SCHEMA IF NOT EXISTS "public";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-----------------------------
-- tasks
-----------------------------
CREATE TABLE "public"."tasks" (
  "id" uuid DEFAULT uuid_generate_v4(),
  "title" character varying(128) NOT NULL UNIQUE,
  "body" text,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);
