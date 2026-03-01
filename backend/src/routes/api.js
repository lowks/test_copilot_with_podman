'use strict';

const express = require('express');
const router = express.Router();

// In-memory data store (replace with real data source in production)
let items = [
  { id: 1, name: 'Item One', description: 'First sample item' },
  { id: 2, name: 'Item Two', description: 'Second sample item' }
];
let nextId = 3;

/**
 * GET /api/items
 * Returns all items
 */
router.get('/items', (_req, res) => {
  res.status(200).json({ data: items });
});

/**
 * GET /api/items/:id
 * Returns a single item by id
 */
router.get('/items/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
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
router.post('/items', (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  const newItem = { id: nextId++, name, description: description || '' };
  items.push(newItem);
  return res.status(201).json({ data: newItem });
});

/**
 * PUT /api/items/:id
 * Updates an existing item
 */
router.put('/items/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  items[index] = { id, name, description: description || items[index].description };
  return res.status(200).json({ data: items[index] });
});

/**
 * DELETE /api/items/:id
 * Deletes an item
 */
router.delete('/items/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }
  items.splice(index, 1);
  return res.status(204).send();
});

// Expose reset helper for tests
router._resetItems = () => {
  items = [
    { id: 1, name: 'Item One', description: 'First sample item' },
    { id: 2, name: 'Item Two', description: 'Second sample item' }
  ];
  nextId = 3;
};

module.exports = router;
