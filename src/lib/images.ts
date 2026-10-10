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

const HERO_WIDTHS = [640, 1280, 1920];

/** Fundo da vitrine: AVIF em 640/1280/1920 px, ocupando a largura da tela. */
export async function getHeroImage(image: ImageMetadata): Promise<ResponsiveImage> {
  const result = await getImage({
    src: image,
    widths: HERO_WIDTHS.filter((w) => w <= image.width),
    format: 'avif',
  });
  return {
    src: result.src,
    srcset: result.srcSet.attribute,
    sizes: '100vw',
    width: image.width,
    height: image.height,
  };
}

const CARD_WIDTHS = [320, 640];

/** Card do carrossel (3:4): AVIF em 320/640 px (1x/2x do maior tamanho exibido). */
export async function getCardImage(image: ImageMetadata): Promise<ResponsiveImage> {
  const result = await getImage({
    src: image,
    widths: CARD_WIDTHS.filter((w) => w <= image.width),
    format: 'avif',
  });
  return {
    src: result.src,
    srcset: result.srcSet.attribute,
    sizes: '(min-width: 1024px) 13rem, (min-width: 640px) 11rem, 9rem',
    width: image.width,
    height: image.height,
  };
}
