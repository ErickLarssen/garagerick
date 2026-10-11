// Imagens otimizadas da vitrine (docs/05). AVIF basta: os navegadores-alvo (docs/07) suportam.
import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';

export interface ResponsiveImage {
  src: string;
  srcset: string;
  sizes: string;
  width: number;
  height: number;
}

/**
 * Larguras do srcset limitadas ao tamanho da imagem original, incluindo a própria largura
 * quando ela fica entre dois degraus (ex.: foto de 1200 px → 640 e 1200, e não só 640).
 */
function widthsFor(image: ImageMetadata, steps: number[]): number[] {
  const max = Math.max(...steps);
  const widths = steps.filter((w) => w < image.width);
  widths.push(Math.min(image.width, max));
  return [...new Set(widths)];
}

async function responsive(
  image: ImageMetadata,
  steps: number[],
  sizes: string,
): Promise<ResponsiveImage> {
  const result = await getImage({ src: image, widths: widthsFor(image, steps), format: 'avif' });
  return {
    src: result.src,
    srcset: result.srcSet.attribute,
    sizes,
    width: image.width,
    height: image.height,
  };
}

/** Fundo da vitrine: AVIF em até 640/1280/1920 px, ocupando a largura da tela. */
export function getHeroImage(image: ImageMetadata): Promise<ResponsiveImage> {
  return responsive(image, [640, 1280, 1920], '100vw');
}

/** Card do carrossel (3:4): AVIF em até 320/640 px (1x/2x do maior tamanho exibido). */
export function getCardImage(image: ImageMetadata): Promise<ResponsiveImage> {
  return responsive(
    image,
    [320, 640],
    '(min-width: 1024px) 12.5rem, (min-width: 640px) 9.5rem, 6.75rem',
  );
}

/** Logo da marca na altura exibida ×2 (telas de alta densidade). SVG passa direto. */
export async function getLogoImage(image: ImageMetadata, height: number): Promise<string> {
  if (image.format === 'svg') return image.src;
  const target = Math.min(image.height, Math.round(height * 2));
  const result = await getImage({ src: image, height: target, format: 'webp' });
  return result.src;
}
