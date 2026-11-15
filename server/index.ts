import cors from '@fastify/cors';
import Fastify from 'fastify';
import { departmentRoutes } from './routes';

const PORT = Number(process.env.PORT ?? 3001);

async function buildServer() {
  const app = Fastify({ logger: true });
  await app.register(cors, { origin: true });
  await app.register(departmentRoutes);
  return app;
}

buildServer()
  .then((app) => app.listen({ port: PORT, host: '0.0.0.0' }))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
