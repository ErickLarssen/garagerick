// Dados que o controlador da vitrine (scripts/showcase-controller.ts) recebe no cliente via
// <script type="application/json" id="showcase-data"> (docs/02 e docs/05). Gerados no build.
import {
  getBrandLogo,
  getHeroImage,
  type BrandLogoImage,
  type ResponsiveImage,
} from '@/lib/images';
import type { RankedVehicle, SpecItem } from '@/lib/rankings';

export interface ShowcaseVehicle {
  slug: string;
  rank: number;
  total: number;
  isTop: boolean;
  name: string;
  brandName: string;
  logo: BrandLogoImage;
  year?: number;
  quickSpecs: string[];
  specs: SpecItem[];
  body: string; // HTML
  hero: Pick<ResponsiveImage, 'src' | 'srcset' | 'sizes'>;
  heroFocus: string;
  ambientColor: string;
  videoUrl?: string;
}

export async function buildShowcaseData(vehicles: RankedVehicle[]): Promise<ShowcaseVehicle[]> {
  return Promise.all(
    vehicles.map(async (v) => {
      const hero = await getHeroImage(v.heroImage);
      return {
        slug: v.slug,
        rank: v.rank,
        total: v.total,
        isTop: v.isTop,
        name: v.name,
        brandName: v.brand.name,
        logo: await getBrandLogo(v.brand, 40),
        year: v.year,
        quickSpecs: v.quickSpecs,
        specs: v.specs,
        body: v.body,
        hero: { src: hero.src, srcset: hero.srcset, sizes: hero.sizes },
        heroFocus: v.heroFocus,
        ambientColor: v.ambientColor,
        videoUrl: v.videoUrl,
      };
    }),
  );
}

/** JSON seguro para embutir em <script> (sem "</script>" literal). */
export const toScriptJson = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');
