'use strict';

const { Pool } = require('pg');

// Only create a pool when DATABASE_URL is provided (production / compose).
// When the variable is absent (e.g. unit tests) `db` is null and the routes
// fall back to their in-memory store.
const db = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;

module.exports = db;
