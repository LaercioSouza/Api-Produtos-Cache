const { z } = require('zod');
const service = require('../services/productService');

const idSchema = z.coerce.number().int().positive();
const listQuerySchema = z.object({
  categoria: z.string().trim().min(1).max(80).optional()
});
const updateSchema = z.object({
  nome: z.string().trim().min(1).max(120),
  categoria: z.string().trim().min(1).max(80),
  preco: z.coerce.number().finite().nonnegative()
}).strict();

function parseId(value) {
  const parsed = idSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

async function getById(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ erro: 'id deve ser um inteiro positivo.' });

    const result = await service.getById(id);
    res.set('X-Cache', result.cache);
    if (!result.data) return res.status(404).json({ erro: 'Produto não encontrado.' });
    return res.json(result.data);
  } catch (error) {
    next(error);
  }
}

async function getAll(req, res, next) {
  try {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ erro: 'Parâmetros inválidos.', detalhes: parsed.error.flatten() });
    }
    const result = await service.getAll(parsed.data);
    res.set('X-Cache', result.cache);
    return res.json(result.data);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ erro: 'id deve ser um inteiro positivo.' });

    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ erro: 'Corpo inválido.', detalhes: parsed.error.flatten() });
    }

    const product = await service.update(id, parsed.data);
    if (!product) return res.status(404).json({ erro: 'Produto não encontrado.' });

    return res.json(product);
  } catch (error) {
    next(error);
  }
}

module.exports = { getById, getAll, update };