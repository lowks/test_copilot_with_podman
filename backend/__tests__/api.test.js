'use strict';

const request = require('supertest');
const app = require('../src/index');
const apiRouter = require('../src/routes/api');

beforeEach(() => {
  apiRouter._resetItems();
});

describe('Health check', () => {
  it('GET /health returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });
});

describe('404 handler', () => {
  it('GET /unknown returns 404', async () => {
    const res = await request(app).get('/unknown-path');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Not found');
  });
});

describe('GET /api/items', () => {
  it('returns all items', async () => {
    const res = await request(app).get('/api/items');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0]).toMatchObject({ id: 1, name: 'Item One' });
  });
});

describe('GET /api/items/:id', () => {
  it('returns a single item when found', async () => {
    const res = await request(app).get('/api/items/1');
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ id: 1, name: 'Item One' });
  });

  it('returns 404 when item not found', async () => {
    const res = await request(app).get('/api/items/999');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Item not found');
  });
});

describe('POST /api/items', () => {
  it('creates a new item and returns 201', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ name: 'New Item', description: 'A new item' });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ name: 'New Item', description: 'A new item' });
    expect(res.body.data.id).toBeDefined();
  });

  it('returns 400 when name is missing', async () => {
    const res = await request(app).post('/api/items').send({ description: 'No name' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('name is required');
  });
});

describe('PUT /api/items/:id', () => {
  it('updates an existing item', async () => {
    const res = await request(app)
      .put('/api/items/1')
      .send({ name: 'Updated Item', description: 'Updated description' });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ id: 1, name: 'Updated Item', description: 'Updated description' });
  });

  it('returns 404 when item not found', async () => {
    const res = await request(app).put('/api/items/999').send({ name: 'X' });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Item not found');
  });

  it('returns 400 when name is missing', async () => {
    const res = await request(app).put('/api/items/1').send({ description: 'No name' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('name is required');
  });
});

describe('DELETE /api/items/:id', () => {
  it('deletes an existing item and returns 204', async () => {
    const res = await request(app).delete('/api/items/1');
    expect(res.status).toBe(204);

    const check = await request(app).get('/api/items/1');
    expect(check.status).toBe(404);
  });

  it('returns 404 when item not found', async () => {
    const res = await request(app).delete('/api/items/999');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Item not found');
  });
});
