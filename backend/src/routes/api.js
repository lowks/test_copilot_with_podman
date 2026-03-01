'use strict';

const express = require('express');
const router = express.Router();
const db = require('../db');

// In-memory data store – used when DATABASE_URL is not set (e.g. unit tests)
let items = [
  { id: 1, name: 'Item One', description: 'First sample item' },
  { id: 2, name: 'Item Two', description: 'Second sample item' }
];
let nextId = 3;

/**
 * GET /api/items
 * Returns all items
 */
router.get('/items', async (_req, res, next) => {
  if (db) {
    try {
      const result = await db.query('SELECT id, name, description FROM items ORDER BY id');
      return res.status(200).json({ data: result.rows });
    } catch (err) {
      return next(err);
    }
  }
  return res.status(200).json({ data: items });
});

/**
 * GET /api/items/:id
 * Returns a single item by id
 */
router.get('/items/:id', async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (db) {
    try {
      const result = await db.query('SELECT id, name, description FROM items WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }
      return res.status(200).json({ data: result.rows[0] });
    } catch (err) {
      return next(err);
    }
  }
  const item = items.find((i) => i.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  return res.status(200).json({ data: item });
});

/**
 * POST /api/items
 * Creates a new item
 */
router.post('/items', async (req, res, next) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  if (db) {
    try {
      const result = await db.query(
        'INSERT INTO items (name, description) VALUES ($1, $2) RETURNING id, name, description',
        [name, description || '']
      );
      return res.status(201).json({ data: result.rows[0] });
    } catch (err) {
      return next(err);
    }
  }
  const newItem = { id: nextId++, name, description: description || '' };
  items.push(newItem);
  return res.status(201).json({ data: newItem });
});

/**
 * PUT /api/items/:id
 * Updates an existing item
 */
router.put('/items/:id', async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  if (db) {
    try {
      const result = await db.query(
        'UPDATE items SET name = $1, description = COALESCE($2, description) WHERE id = $3 RETURNING id, name, description',
        [name, description !== undefined ? description : null, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }
      return res.status(200).json({ data: result.rows[0] });
    } catch (err) {
      return next(err);
    }
  }
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }
  items[index] = { id, name, description: description || items[index].description };
  return res.status(200).json({ data: items[index] });
});

/**
 * DELETE /api/items/:id
 * Deletes an item
 */
router.delete('/items/:id', async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (db) {
    try {
      const result = await db.query('DELETE FROM items WHERE id = $1 RETURNING id', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  }
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }
  items.splice(index, 1);
  return res.status(204).send();
});

// Expose reset helper for tests (in-memory path only)
router._resetItems = () => {
  items = [
    { id: 1, name: 'Item One', description: 'First sample item' },
    { id: 2, name: 'Item Two', description: 'Second sample item' }
  ];
  nextId = 3;
};

module.exports = router;
