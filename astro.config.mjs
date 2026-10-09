// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { SITE } from './src/lib/site.ts';

// https://astro.build/config
export default defineConfig({
  site: SITE.url,
  output: 'static',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
