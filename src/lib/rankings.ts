// Única porta de entrada para listar veículos (docs/02 e docs/03).
// Lê as collections, valida os rankings e devolve objetos prontos para a UI.
import { getCollection, type CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';
import {
  formatBattery,
  formatDisplacement,
  formatPower,
  formatSeconds,
  formatSpeed,
  formatTorque,
  formatWeight,
  POWERTRAIN_LABELS,
} from '@/lib/format';
import { validateRankings, type RankingEntryRef } from '@/lib/validate-rankings';

export type RankingKey = 'populares' | 'esportivos' | 'antigos' | 'motos';

export const RANKING_KEYS: readonly RankingKey[] = ['populares', 'esportivos', 'antigos', 'motos'];

/** Rota de cada ranking (populares é a home). */
export const RANKING_ROUTES: Record<RankingKey, string> = {
  populares: '/',
  esportivos: '/esportivos',
  antigos: '/antigos',
  motos: '/motos',
};

/** Nome exibido de cada ranking. */
export const RANKING_LABELS: Record<RankingKey, string> = {
  populares: 'Populares',
  esportivos: 'Esportivos',
  antigos: 'Antigos',
  motos: 'Motos',
};

/** Título (sem o nome do site) e descrição de SEO de cada página de ranking (docs/07). */
export const RANKING_SEO: Record<RankingKey, { title: string; description: string }> = {
  populares: {
    title: 'Populares — Ranking de carros favoritos',
    description: 'Meus carros populares favoritos em contagem regressiva até o Top 1.',
  },
  esportivos: {
    title: 'Esportivos — Ranking de carros favoritos',
    description: 'Meus carros esportivos favoritos em contagem regressiva até o Top 1.',
  },
  antigos: {
    title: 'Antigos — Ranking de carros favoritos',
    description: 'Meus carros antigos e clássicos favoritos em contagem regressiva até o Top 1.',
  },
  motos: {
    title: 'Motos — Ranking de motos favoritas',
    description: 'Minhas motos favoritas em contagem regressiva até o Top 1.',
  },
};

export interface SpecItem {
  label: string;
  value: string;
}

export interface RankedVehicle {
  slug: string; // id do arquivo
  ranking: RankingKey;
  rank: number;
  total: number; // tamanho da lista (para "#07 de 10")
  isTop: boolean; // rank === 1
  name: string;
  brand: {
    name: string;
    logo: ImageMetadata;
    logoScale: number;
    logoTreatment: 'white' | 'original';
  };
  year?: number; // omitido quando desconhecido
  specs: SpecItem[]; // já formatadas, prontas para exibir
  quickSpecs: string[]; // até 2 itens para a linha principal
  heroImage: ImageMetadata;
  cardImage: ImageMetadata;
  heroFocus: string;
  heroFitMobile: 'cover' | 'contain';
  ambientColor: string; // fallback: token --color-ambient-default
  videoUrl?: string;
  body: string; // HTML renderizado do Markdown
  /** Texto puro do "por que eu gosto" para a lista; ausente enquanto for o placeholder TODO. */
  excerpt?: string;
}

type CarEntry = CollectionEntry<'cars'>;
type MotorcycleEntry = CollectionEntry<'motorcycles'>;
type BrandEntry = CollectionEntry<'brands'>;

const AMBIENT_FALLBACK = 'var(--color-ambient-default)';

interface Catalog {
  cars: CarEntry[];
  motorcycles: MotorcycleEntry[];
  brands: Map<string, BrandEntry>;
}

// Carrega e valida tudo uma única vez por build (a regra de slug único é global).
let catalogPromise: Promise<Catalog> | undefined;

function loadCatalog(): Promise<Catalog> {
  catalogPromise ??= (async () => {
    const [cars, motorcycles, brandEntries] = await Promise.all([
      getCollection('cars'),
      getCollection('motorcycles'),
      getCollection('brands'),
    ]);
    const brands = new Map(brandEntries.map((b) => [b.id, b]));

    const refs: RankingEntryRef[] = [
      ...cars.map((c) => toRef(c, c.data.category)),
      ...motorcycles.map((m) => toRef(m, 'motos')),
    ];
    validateRankings(refs, brands.keys());

    return { cars, motorcycles, brands };
  })();
  return catalogPromise;
}

function toRef(entry: CarEntry | MotorcycleEntry, list: RankingKey): RankingEntryRef {
  return {
    list,
    id: entry.id,
    rank: entry.data.rank,
    brand: entry.data.brand.id,
    file: entry.filePath?.split('/').pop() ?? `${entry.id}.md`,
  };
}

/** Texto puro do corpo; `undefined` se ainda for o placeholder "TODO: escreva…" (regra 4). */
function excerptOf(html: string): string | undefined {
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return !text || text.startsWith('TODO') ? undefined : text;
}

/** Remove comentários HTML (ex.: `<!-- TODO: confirmar ficha técnica -->`) do texto exibido. */
const stripComments = (html: string) => html.replace(/<!--[\s\S]*?-->/g, '').trim();

/** Adiciona o item só se o valor existir. */
function push<T>(specs: SpecItem[], label: string, value: T | undefined, fmt: (v: T) => string) {
  if (value !== undefined) specs.push({ label, value: fmt(value) });
}

function carSpecs(d: CarEntry['data']): { specs: SpecItem[]; quickSpecs: string[] } {
  const specs: SpecItem[] = [];
  const text = (v: string) => v;
  push(specs, 'Versão', d.version, (v: string) => v);
  push(specs, 'Motorização', d.powertrain, (v) => POWERTRAIN_LABELS[v]);
  push(specs, 'Motor', d.engine, text);
  push(specs, 'Potência', d.powerCv, formatPower);
  push(specs, 'Torque', d.torqueKgfm, formatTorque);
  push(specs, 'Bateria', d.batteryKwh, formatBattery);
  push(specs, 'Transmissão', d.transmission, text);
  push(specs, 'Tração', d.drivetrain, text);
  push(specs, '0–100 km/h', d.zeroToHundredS, formatSeconds);
  push(specs, 'Velocidade máxima', d.topSpeedKmh, formatSpeed);
  push(specs, 'Carroceria', d.bodyStyle, text);
  push(specs, 'Ano', d.year, String);

  // Regras de quickSpecs (docs/03): campo ausente → item omitido
  const second =
    d.powertrain === 'eletrico'
      ? [POWERTRAIN_LABELS.eletrico, d.drivetrain].filter(Boolean).join(' ')
      : (d.engine ?? d.version); // sem motor informado, a versão ocupa o lugar
  const quickSpecs = [d.powerCv !== undefined ? formatPower(d.powerCv) : undefined, second].filter(
    (v): v is string => Boolean(v),
  );

  return { specs, quickSpecs };
}

function motorcycleSpecs(d: MotorcycleEntry['data']): { specs: SpecItem[]; quickSpecs: string[] } {
  const specs: SpecItem[] = [];
  const text = (v: string) => v;
  push(specs, 'Versão', d.version, (v: string) => v);
  push(specs, 'Motorização', d.powertrain, (v) => POWERTRAIN_LABELS[v]);
  push(specs, 'Motor', d.engine, text);
  push(specs, 'Cilindrada', d.displacementCc, formatDisplacement);
  push(specs, 'Potência', d.powerCv, formatPower);
  push(specs, 'Torque', d.torqueKgfm, formatTorque);
  push(specs, 'Transmissão', d.transmission, text);
  push(specs, '0–100 km/h', d.zeroToHundredS, formatSeconds);
  push(specs, 'Velocidade máxima', d.topSpeedKmh, formatSpeed);
  push(specs, 'Peso', d.weightKg, formatWeight);
  push(specs, 'Estilo', d.style, text);
  push(specs, 'Ano', d.year, String);

  const quickSpecs = [
    d.powerCv !== undefined ? formatPower(d.powerCv) : undefined,
    d.displacementCc !== undefined ? formatDisplacement(d.displacementCc) : d.version,
  ].filter((v): v is string => Boolean(v));

  return { specs, quickSpecs };
}

function toRanked(
  entry: CarEntry | MotorcycleEntry,
  ranking: RankingKey,
  total: number,
  brands: Map<string, BrandEntry>,
  details: { specs: SpecItem[]; quickSpecs: string[] },
): RankedVehicle {
  const d = entry.data;
  const brand = brands.get(d.brand.id);
  if (!brand) throw new Error(`Marca "${d.brand.id}" não encontrada.`); // já garantido pela validação
  return {
    slug: entry.id,
    ranking,
    rank: d.rank,
    total,
    isTop: d.rank === 1,
    name: d.name,
    brand: {
      name: brand.data.name,
      logo: brand.data.logo,
      logoScale: brand.data.logoScale,
      logoTreatment: brand.data.logoTreatment,
    },
    year: d.year,
    specs: details.specs,
    quickSpecs: details.quickSpecs,
    heroImage: d.heroImage,
    cardImage: d.cardImage,
    heroFocus: d.heroFocus,
    heroFitMobile: d.heroFitMobile,
    ambientColor: d.ambientColor ?? AMBIENT_FALLBACK,
    videoUrl: d.videoUrl,
    body: stripComments(entry.rendered?.html ?? ''),
    excerpt: excerptOf(stripComments(entry.rendered?.html ?? '')),
  };
}

/** Retorna o ranking ordenado por rank DECRESCENTE (último colocado primeiro, Top 1 por último). */
export async function getRanking(key: RankingKey): Promise<RankedVehicle[]> {
  const { cars, motorcycles, brands } = await loadCatalog();

  const vehicles =
    key === 'motos'
      ? motorcycles.map((m) => ({ entry: m, details: motorcycleSpecs(m.data) }))
      : cars
          .filter((c) => c.data.category === key)
          .map((c) => ({ entry: c, details: carSpecs(c.data) }));

  const total = vehicles.length;
  return vehicles
    .map(({ entry, details }) => toRanked(entry, key, total, brands, details))
    .sort((a, b) => b.rank - a.rank);
}
