// Normaliza categoria para que "Periféricos", "periféricos" e espaços extras
// produzam a mesma chave. Os filtros são ordenados antes de compor a chave.
function normalizeCategory(value) {
  if (typeof value !== 'string') return '';
  return value.trim().normalize('NFC').toLocaleLowerCase('pt-BR');
}

function productKey(id) {
  return `produto:${Number(id)}`;
}

function productsListKey(filters = {}) {
  const normalized = {
    categoria: normalizeCategory(filters.categoria || '')
  };
  const canonical = Object.keys(normalized)
    .sort()
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(normalized[key])}`)
    .join('&');
  return `produtos:list:${canonical || 'todos'}`;
}

module.exports = { normalizeCategory, productKey, productsListKey };