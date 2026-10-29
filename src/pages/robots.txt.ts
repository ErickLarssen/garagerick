// robots.txt (docs/07): libera tudo e aponta o sitemap gerado pelo @astrojs/sitemap.
import type { APIRoute } from 'astro';
import { SITE } from '@/lib/site';

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('/sitemap-index.xml', site ?? SITE.url).href;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
