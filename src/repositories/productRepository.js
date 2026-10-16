const db = require('../config/database');
const { normalizeCategory } = require('../utils/cacheKeys');

async function findById(id) {
  // Entrada validada antes de chegar ao repository; SQL parametrizado.
  const result = await db.query(
    'SELECT id, nome, categoria, preco, created_at, updated_at FROM produtos WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

async function findAll({ categoria }) {
  if (categoria) {
    const result = await db.query(
      `SELECT id, nome, categoria, preco, created_at, updated_at
       FROM produtos WHERE LOWER(categoria) = $1 ORDER BY id`,
      [normalizeCategory(categoria)]
    );
    return result.rows;
  }

  const result = await db.query(
    'SELECT id, nome, categoria, preco, created_at, updated_at FROM produtos ORDER BY id'
  );
  return result.rows;
}

async function update(id, data) {
  const result = await db.query(
    `UPDATE produtos
     SET nome = $1, categoria = $2, preco = $3, updated_at = NOW()
     WHERE id = $4
     RETURNING id, nome, categoria, preco, created_at, updated_at`,
    [data.nome, data.categoria, data.preco, id]
  );
  return result.rows[0] || null;
}

module.exports = { findById, findAll, update };