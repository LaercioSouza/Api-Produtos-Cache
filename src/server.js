const app = require('./app');
const db = require('./config/database');
const redis = require('./config/redis');
const { port } = require('./config/env');

async function start() {
  await db.query('SELECT 1');
  await redis.connect();

  const server = app.listen(port, () => {
    console.log(`API disponível em http://localhost:${port}`);
  });

  async function shutdown() {
    server.close();
    await redis.quit().catch(() => {});
    await db.end().catch(() => {});
    process.exit(0);
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((error) => {
  console.error('Não foi possível iniciar a API:', error.message);
  process.exit(1);
});