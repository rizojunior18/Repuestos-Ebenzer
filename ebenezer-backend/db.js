// db.js
const { Pool } = require('pg');
const pool = new Pool({ user: 'postgres', host: 'localhost', database: 'ebenezer_db', password: 'junior2001', port: 5432 });
module.exports = pool;