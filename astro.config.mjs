// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { SITE } from './src/lib/site.ts';

// https://astro.build/config
export default defineConfig({
  site: SITE.url,
  output: 'static',
  // URLs sem barra no fim (docs/07): /esportivos → esportivos.html; a Vercel serve com cleanUrls
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
