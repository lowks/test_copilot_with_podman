'use strict';

/**
 * Integration tests using Testcontainers.
 *
 * These tests spin up a real PostgreSQL container, initialise the schema,
 * and exercise the Express app against an actual database.  They are kept
 * separate from the unit tests so that the standard `npm test` command
 * (which requires no Docker daemon) continues to work as before.
 *
 * Run with: npm run test:integration
 */

const { PostgreSqlContainer } = require('@testcontainers/postgresql');
const supertest = require('supertest');
const { Pool } = require('pg');

let container;
let app;

beforeAll(async () => {
  // Start a PostgreSQL container (postgres:16-alpine)
  container = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('itemsdb')
    .withUsername('appuser')
    .withPassword('secret')
    .start();

  // Jest runs each test file in an isolated worker process, so mutating
  // process.env here does not affect other test files.
  process.env.DATABASE_URL = container.getConnectionUri();

  // Initialise schema
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id          SERIAL PRIMARY KEY,
      name        TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await pool.query(`
    INSERT INTO items (name, description) VALUES
      ('Item One', 'First sample item'),
      ('Item Two', 'Second sample item')
  `);
  await pool.end();

  // Load the Express app after DATABASE_URL is set so that db.js picks it up
  app = require('../src/index');
}, 120000);

afterAll(async () => {
  // Close the database pool before stopping the container to avoid
  // "terminating connection" unhandled errors from pg's idle connections.
  const db = require('../src/db');
  if (db) await db.end();
  delete process.env.DATABASE_URL;
  if (container) {
    await container.stop();
  }
});

describe('Integration: health check', () => {
  it('GET /health returns 200 with status ok', async () => {
    const res = await supertest(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Integration: GET /api/items', () => {
  it('returns seeded items from the database', async () => {
    const res = await supertest(app).get('/api/items');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    const names = res.body.data.map((i) => i.name);
    expect(names).toContain('Item One');
    expect(names).toContain('Item Two');
  });
});

describe('Integration: POST /api/items', () => {
  it('creates a new item and persists it', async () => {
    const res = await supertest(app)
      .post('/api/items')
      .send({ name: 'Integration Item', description: 'Created by testcontainers test' });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Integration Item');
    expect(res.body.data.id).toBeDefined();
  });

  it('returns 400 when name is missing', async () => {
    const res = await supertest(app).post('/api/items').send({ description: 'No name' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('name is required');
  });
});

describe('Integration: GET /api/items/:id', () => {
  it('returns the item by id', async () => {
    const created = await supertest(app)
      .post('/api/items')
      .send({ name: 'Fetch Me', description: 'Fetch by id' });
    const id = created.body.data.id;

    const res = await supertest(app).get(`/api/items/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Fetch Me');
  });

  it('returns 404 for a non-existent id', async () => {
    const res = await supertest(app).get('/api/items/999999');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Item not found');
  });
});

describe('Integration: PUT /api/items/:id', () => {
  it('updates an existing item', async () => {
    const created = await supertest(app)
      .post('/api/items')
      .send({ name: 'Update Me', description: 'Before' });
    const id = created.body.data.id;

    const res = await supertest(app)
      .put(`/api/items/${id}`)
      .send({ name: 'Updated Name', description: 'After' });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Name');
    expect(res.body.data.description).toBe('After');
  });

  it('returns 404 for a non-existent id', async () => {
    const res = await supertest(app).put('/api/items/999999').send({ name: 'X' });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Item not found');
  });
});

describe('Integration: DELETE /api/items/:id', () => {
  it('deletes an item and confirms it is gone', async () => {
    const created = await supertest(app)
      .post('/api/items')
      .send({ name: 'Delete Me', description: 'To be removed' });
    const id = created.body.data.id;

    const res = await supertest(app).delete(`/api/items/${id}`);
    expect(res.status).toBe(204);

    const check = await supertest(app).get(`/api/items/${id}`);
    expect(check.status).toBe(404);
  });

  it('returns 404 for a non-existent id', async () => {
    const res = await supertest(app).delete('/api/items/999999');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Item not found');
  });
});
