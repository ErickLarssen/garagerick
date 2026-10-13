// Índice da busca (docs/05), gerado no build e servido como /search-index.json.
import { getImage } from 'astro:assets';
import { normalize } from '@/lib/normalize';
import { formatRank } from '@/lib/format';
import {
  RANKING_KEYS,
  RANKING_LABELS,
  RANKING_ROUTES,
  getRanking,
  type RankingKey,
} from '@/lib/rankings';

export interface SearchEntry {
  slug: string;
  name: string; // "Seal"
  brand: string; // "BYD"
  ranking: RankingKey;
  rank: number;
  /** "#03 em Esportivos" / "Top 1 em Populares" */
  rankingLabel: string;
  /** Destino: rota do ranking + #slug (populares é a home) */
  href: string;
  thumbSrc: string; // miniatura 160×120 do dropdown
  /** Nome, marca, versão e tags já normalizados (ver lib/normalize.ts) */
  keywords: string;
}

export async function buildSearchIndex(): Promise<SearchEntry[]> {
  const lists = await Promise.all(
    RANKING_KEYS.map(async (key) => [key, await getRanking(key)] as const),
  );

  const entries = lists.flatMap(([key, vehicles]) =>
    vehicles.map(async (v): Promise<SearchEntry> => {
      const thumb = await getImage({
        src: v.heroImage,
        width: 160,
        height: 120,
        fit: 'cover',
        format: 'avif',
      });
      const position = v.isTop ? 'Top 1' : formatRank(v.rank);
      return {
        slug: v.slug,
        name: v.name,
        brand: v.brand.name,
        ranking: key,
        rank: v.rank,
        rankingLabel: `${position} em ${RANKING_LABELS[key]}`,
        href: `${RANKING_ROUTES[key]}#${v.slug}`,
        thumbSrc: thumb.src,
        keywords: normalize([v.brand.name, v.name, v.version ?? '', ...v.tags].join(' ')),
      };
    }),
  );

  // Ordem do índice: por ranking e, dentro dele, do Top 1 para baixo
  return (await Promise.all(entries)).sort(
    (a, b) => RANKING_KEYS.indexOf(a.ranking) - RANKING_KEYS.indexOf(b.ranking) || a.rank - b.rank,
  );
}
