-- CockroachDB initialisation script
-- Run once after the cluster starts: cockroach sql --insecure < db/init.sql

CREATE DATABASE IF NOT EXISTS itemsdb;

USE itemsdb;

CREATE TABLE IF NOT EXISTS items (
  id          SERIAL PRIMARY KEY,
  name        STRING NOT NULL,
  description STRING NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed data – only insert when the table is empty to keep it idempotent
INSERT INTO items (name, description)
SELECT 'Item One', 'First sample item'
WHERE NOT EXISTS (SELECT 1 FROM items LIMIT 1);

INSERT INTO items (name, description)
SELECT 'Item Two', 'Second sample item'
WHERE NOT EXISTS (SELECT 1 FROM items WHERE name = 'Item Two');
