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

/**
 * Fundo da vitrine: AVIF em até 640/960/1280/1920 px. Ocupa a largura da tela até o tablet e 70%
 * dela no desktop (ShowcaseBackdrop). O degrau de 960 atende celulares de alta densidade
 * (~412 px × 1,75–2,6) sem pular direto para 1280.
 */
export function getHeroImage(image: ImageMetadata): Promise<ResponsiveImage> {
  return responsive(image, [640, 960, 1280, 1920], '(min-width: 1024px) 70vw, 100vw');
}

/** Miniatura da lista "Ranking completo" (RankingItem): AVIF em até 320/640 px. */
export function getThumbImage(image: ImageMetadata): Promise<ResponsiveImage> {
  return responsive(image, [320, 640], '(min-width: 640px) 11rem, 36vw');
}

/** Logo da marca na altura exibida ×2 (telas de alta densidade). SVG passa direto. */
export async function getLogoImage(image: ImageMetadata, height: number): Promise<string> {
  if (image.format === 'svg') return image.src;
  const target = Math.min(image.height, Math.round(height * 2));
  const result = await getImage({ src: image, height: target, format: 'webp' });
  return result.src;
}

export interface BrandLogoImage {
  src: string;
  width: number;
  height: number;
  /** true → aplicar o filtro que deixa o logo branco (logoTreatment "white") */
  white: boolean;
}

/**
 * Logo da marca dimensionado (docs/04): altura base × logoScale, com largura máxima de 4,5× a
 * altura base — logos muito largos encolhem.
 */
export async function getBrandLogo(
  brand: { logo: ImageMetadata; logoScale: number; logoTreatment: 'white' | 'original' },
  baseHeight: number,
): Promise<BrandLogoImage> {
  const ratio = brand.logo.width / brand.logo.height;
  const maxWidth = baseHeight * 4.5;
  let height = baseHeight * brand.logoScale;
  if (height * ratio > maxWidth) height = maxWidth / ratio;
  height = Math.round(height);
  return {
    src: await getLogoImage(brand.logo, height),
    width: Math.round(height * ratio),
    height,
    white: brand.logoTreatment === 'white',
  };
}
