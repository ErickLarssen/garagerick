// SEO por página de ranking (docs/07): imagem de compartilhamento e JSON-LD ItemList.
import type { ImageMetadata } from 'astro';
import {
  RANKING_LABELS,
  RANKING_ROUTES,
  type RankedVehicle,
  type RankingKey,
} from '@/lib/rankings';
import { SITE } from '@/lib/site';

export interface OgImage {
  image: ImageMetadata;
  alt: string;
}

const fullName = (v: RankedVehicle) => `${v.brand.name} ${v.name}`;

/** Hero do Top 1 do ranking (docs/07); `undefined` se a lista estiver vazia. */
export function rankingOgImage(vehicles: RankedVehicle[]): OgImage | undefined {
  const top = vehicles.find((v) => v.isTop);
  return (
    top && {
      image: top.heroImage,
      alt: `${fullName(top)}, Top 1 em ${RANKING_LABELS[top.ranking]}`,
    }
  );
}

/** JSON-LD `ItemList`: cada veículo é um `ListItem` com position = rank, do Top 1 para baixo. */
export function rankingStructuredData(key: RankingKey, vehicles: RankedVehicle[]) {
  const pageUrl = new URL(RANKING_ROUTES[key], SITE.url).href;
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Ranking de favoritos — ${RANKING_LABELS[key]}`,
    url: pageUrl,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: vehicles.length,
    itemListElement: [...vehicles]
      .sort((a, b) => a.rank - b.rank)
      .map((v) => ({
        '@type': 'ListItem',
        position: v.rank,
        name: fullName(v),
        url: `${pageUrl}#${v.slug}`,
      })),
  };
}
