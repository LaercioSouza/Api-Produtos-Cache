const repository = require('../repositories/productRepository');
const redis = require('../config/redis');
const { cacheTtlSeconds } = require('../config/env');
const { productKey, productsListKey } = require('../utils/cacheKeys');

async function getById(id) {
  const key = productKey(id);
  const cached = await redis.get(key);

  if (cached !== null) {
    return { data: JSON.parse(cached), cache: 'HIT' };
  }

  const product = await repository.findById(id);
  if (!product) return { data: null, cache: 'MISS' };

  await redis.set(key, JSON.stringify(product), { EX: cacheTtlSeconds });
  return { data: product, cache: 'MISS' };
}

async function getAll(filters) {
  const key = productsListKey(filters);
  const cached = await redis.get(key);

  if (cached !== null) {
    return { data: JSON.parse(cached), cache: 'HIT' };
  }

  const products = await repository.findAll(filters);
  await redis.set(key, JSON.stringify(products), { EX: cacheTtlSeconds });
  return { data: products, cache: 'MISS' };
}

async function update(id, data) {
  const updated = await repository.update(id, data);
  if (!updated) return null;

  // Invalida o cache do produto e todas as listas de produtos.
  const keys = await redis.keys('produtos:list:*');
  await redis.del([productKey(id), ...keys]);
  return updated;
}

module.exports = { getById, getAll, update };