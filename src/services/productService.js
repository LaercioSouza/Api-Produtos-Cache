const repository = require('../repositories/productRepository');
const redis = require('../config/redis');
const { cacheTtlSeconds } = require('../config/env');
const { productKey, productsListKey } = require('../utils/cacheKeys');

async function getById(id) {
  const key = productKey(id);

  // Tenta ler do cache; se o Redis falhar, segue sem cache
  try {
    const cached = await redis.get(key);
    if (cached !== null) {
      return { data: JSON.parse(cached), cache: 'HIT' };
    }
  } catch (err) {
    console.error('[cache] Erro ao ler do Redis em getById:', err.message);
  }

  const product = await repository.findById(id);
  if (!product) return { data: null, cache: 'MISS' };

  // Tenta gravar no cache; falha não impede o retorno
  try {
    await redis.set(key, JSON.stringify(product), { EX: cacheTtlSeconds });
  } catch (err) {
    console.error('[cache] Erro ao gravar no Redis em getById:', err.message);
  }

  return { data: product, cache: 'MISS' };
}

async function getAll(filters) {
  const key = productsListKey(filters);

  try {
    const cached = await redis.get(key);
    if (cached !== null) {
      return { data: JSON.parse(cached), cache: 'HIT' };
    }
  } catch (err) {
    console.error('[cache] Erro ao ler do Redis em getAll:', err.message);
  }

  const products = await repository.findAll(filters);

  try {
    await redis.set(key, JSON.stringify(products), { EX: cacheTtlSeconds });
  } catch (err) {
    console.error('[cache] Erro ao gravar no Redis em getAll:', err.message);
  }

  return { data: products, cache: 'MISS' };
}

async function update(id, data) {
  const updated = await repository.update(id, data);
  if (!updated) return null;

  // Invalida o cache do produto e todas as listas de produtos.
  try {
    const keys = await redis.keys('produtos:list:*');
    await redis.del([productKey(id), ...keys]);
  } catch (err) {
    console.error('[cache] Erro ao invalidar cache no Redis em update:', err.message);
  }

  return updated;
}

module.exports = { getById, getAll, update };