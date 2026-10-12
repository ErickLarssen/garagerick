// Conteúdo do "Sobre mim" (docs/05), lido da collection `about` (src/content/about/sobre.md).
import type { ImageMetadata } from 'astro';
import { getEntry } from 'astro:content';

export interface About {
  title: string;
  photo?: ImageMetadata;
  photoAlt: string;
  body: string; // HTML renderizado do Markdown, escrito pelo Erick
}

export async function getAbout(): Promise<About> {
  const entry = await getEntry('about', 'sobre');
  if (!entry) throw new Error('Falta src/content/about/sobre.md (conteúdo do "Sobre mim").');
  return {
    title: entry.data.title,
    photo: entry.data.photo,
    photoAlt: entry.data.photoAlt ?? '',
    body: entry.rendered?.html ?? '',
  };
}
