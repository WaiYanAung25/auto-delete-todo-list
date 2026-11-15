import type { FastifyInstance } from 'fastify';
import { transformDepartments } from '../shared/transform';
import type { Departments, DummyUsersResponse } from '../shared/types';

const USERS_API = 'https://dummyjson.com/users?limit=0';
const CACHE_TTL_MS = 60_000;

let cache: { data: Departments; expiresAt: number } | null = null;

async function fetchAllUsers(): Promise<DummyUsersResponse> {
  const response = await fetch(USERS_API);
  if (!response.ok) {
    throw new Error(`dummyjson responded with ${response.status}`);
  }
  return (await response.json()) as DummyUsersResponse;
}

/** Cached + transformed departments; the upstream call happens at most once per TTL. */
export async function getDepartments(): Promise<Departments> {
  if (cache && Date.now() < cache.expiresAt) return cache.data;
  const { users } = await fetchAllUsers();
  cache = { data: transformDepartments(users), expiresAt: Date.now() + CACHE_TTL_MS };
  return cache.data;
}

export async function departmentRoutes(app: FastifyInstance) {
  app.get('/api/departments', async (_request, reply) => {
    try {
      const data = await getDepartments();
      reply.header('cache-control', `public, max-age=${CACHE_TTL_MS / 1000}`);
      return data;
    } catch (error) {
      app.log.error(error);
      return reply.status(502).send({ error: 'Failed to fetch users from dummyjson' });
    }
  });
}
