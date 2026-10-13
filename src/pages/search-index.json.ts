// /search-index.json — endpoint estático gerado no build (docs/02). A busca o carrega no
// primeiro foco do campo.
import type { APIRoute } from 'astro';
import { buildSearchIndex } from '@/lib/search-index';

export const GET: APIRoute = async () =>
  new Response(JSON.stringify(await buildSearchIndex()), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
