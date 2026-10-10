# 03 — Modelo de Dados

Todo o conteúdo vive em **Astro Content Collections** (`src/content/`), validado por Zod em
`src/content.config.ts`. Componentes nunca leem arquivos diretamente — sempre via `lib/rankings.ts`.

> **Astro 7 / Zod 4:** `z` vem de `astro/zod` (o `z` de `astro:content` está obsoleto), `glob` de
> `astro/loaders` e `defineCollection`/`reference` de `astro:content`. URLs usam `z.url()`.
> Os trechos abaixo omitem os imports; o arquivo real é a referência.

## Collections

| Collection | Formato | Pasta | Um arquivo por… |
|---|---|---|---|
| `brands` | JSON | `src/content/brands/` | marca |
| `cars` | Markdown | `src/content/cars/` | carro |
| `motorcycles` | Markdown | `src/content/motorcycles/` | moto |

O **corpo do Markdown** de cada veículo é o texto "Por que eu gosto", escrito pelo Erick
em primeira pessoa. O frontmatter guarda os dados estruturados.

## `brands`

```ts
// src/content.config.ts (trecho)
const brands = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/brands' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),                       // "Volkswagen"
      logo: image(),                          // "../../assets/brands/volkswagen.svg"
      logoScale: z.number().min(0.5).max(2).default(1), // ajuste ótico (logos largos x altos)
      country: z.string().optional(),         // "Alemanha"
    }),
});
```

Exemplo — `src/content/brands/byd.json`:

```json
{
  "name": "BYD",
  "logo": "../../assets/brands/byd.svg",
  "logoScale": 1.1,
  "country": "China"
}
```

## Campos comuns de veículo

```ts
const powertrain = z.enum(['combustao', 'hibrido', 'eletrico']);

const vehicleBase = ({ image }) => ({
  name: z.string(),                           // "Seal" (sem a marca)
  brand: reference('brands'),                 // "byd"
  rank: z.number().int().positive(),          // 1 = Top 1
  year: z.number().int().min(1886).max(2100), // ano-modelo de referência
  powertrain,
  powerCv: z.number().positive().optional(),
  torqueKgfm: z.number().positive().optional(),
  zeroToHundredS: z.number().positive().optional(),
  topSpeedKmh: z.number().positive().optional(),
  transmission: z.string().optional(),        // "Automático 6 marchas", "Redução única"
  heroImage: image(),                         // 16:9
  cardImage: image(),                         // 3:4
  heroFocus: z.string().default('center'),    // object-position do fundo ("70% 50%")
  ambientColor: z.string().regex(/^#[0-9a-f]{6}$/i).optional(), // tom do degradê da vitrine
  videoUrl: z.url().optional(),               // YouTube
  tags: z.array(z.string()).default([]),      // usados na busca
});
```

## `cars`

```ts
const cars = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cars' }),
  schema: ({ image }) =>
    z.object({
      ...vehicleBase({ image }),
      category: z.enum(['populares', 'esportivos', 'antigos']),
      engine: z.string().optional(),          // "1.0 TSI 3 cil. turbo" (vazio para elétricos)
      batteryKwh: z.number().positive().optional(), // só elétricos/híbridos plug-in
      drivetrain: z.enum(['FWD', 'RWD', 'AWD', '4x4']).optional(),
      bodyStyle: z.string().optional(),       // "Sedã", "SUV cupê", "Hatch"
    }),
});
```

## `motorcycles`

```ts
const motorcycles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/motorcycles' }),
  schema: ({ image }) =>
    z.object({
      ...vehicleBase({ image }),
      displacementCc: z.number().int().positive().optional(), // 998
      engine: z.string().optional(),          // "4 cil. em linha"
      style: z.string().optional(),           // "Naked", "Esportiva", "Custom", "Trail"
      weightKg: z.number().positive().optional(),
    }),
});
```

> O schema é a fonte da verdade. Se precisar de um campo novo, adicione aqui **e** neste
> documento, e registre em `docs/decisoes.md`.

## Exemplo de veículo

`src/content/cars/byd-seal.md`:

```md
---
name: Seal
brand: byd
rank: 1
category: populares
year: 2024
powertrain: eletrico
powerCv: 531              # conferir
drivetrain: AWD
bodyStyle: Sedã
heroImage: ../../assets/vehicles/byd-seal/hero.jpg
cardImage: ../../assets/vehicles/byd-seal/card.jpg
heroFocus: 60% 50%
ambientColor: '#0b2a3a'
videoUrl: https://www.youtube.com/watch?v=XXXXXXXXXXX
tags: [eletrico, seda, byd]
---

TODO: escreva por que você gosta deste veículo.
```

`src/content/cars/volkswagen-nivus.md` segue o mesmo formato com `rank: 2`,
`powertrain: combustao`, `engine: "1.0 TSI"` etc.

> **Os números acima são ilustrativos.** O agente não deve preencher fichas técnicas por
> conta própria — ver regra 3 do `CLAUDE.md`.

## Regras de ranking

Validadas em `src/lib/validate-rankings.ts`, chamado por `lib/rankings.ts` (o build falha se violar):

1. Cada **lista** tem as posições `1..N` **sem buracos e sem repetição**.
   Listas: `populares`, `esportivos`, `antigos` (cars) e `motos` (motorcycles).
2. O mesmo slug não aparece em duas listas.
3. A marca referenciada existe em `brands`.

Mensagens de erro em português e acionáveis:
`Ranking "esportivos": posições 3 e 3 repetidas (porsche-911.md, ferrari-f40.md).`

## Tipo de saída para a UI

```ts
// src/lib/rankings.ts
export type RankingKey = 'populares' | 'esportivos' | 'antigos' | 'motos';

export interface RankedVehicle {
  slug: string;              // id do arquivo
  rank: number;
  total: number;             // tamanho da lista (para "#07 de 10")
  isTop: boolean;            // rank === 1
  name: string;
  brand: { name: string; logo: ImageMetadata; logoScale: number };
  year: number;
  specs: SpecItem[];         // já formatadas, prontas para exibir
  quickSpecs: string[];      // 2 itens para a linha principal (ex.: "531 cv", "Elétrico AWD")
  heroImage: ImageMetadata;
  cardImage: ImageMetadata;
  heroFocus: string;
  ambientColor: string;      // fallback: token --color-ambient-default
  videoUrl?: string;
  body: string;              // HTML renderizado do Markdown
}

export interface SpecItem { label: string; value: string } // { label: "Torque", value: "36,7 kgfm" }

export async function getRanking(key: RankingKey): Promise<RankedVehicle[]>;
// Retorna ordenado por rank DECRESCENTE (último colocado primeiro, Top 1 por último).
```

### Regras de `quickSpecs` (linha principal da vitrine)

Formato final: `ANO │ #RANK │ quickSpecs[0] │ quickSpecs[1]`

| Tipo | quickSpecs[0] | quickSpecs[1] |
|---|---|---|
| Carro a combustão/híbrido | potência (`128 cv`) | motor (`1.0 TSI`) |
| Carro elétrico | potência (`531 cv`) | `Elétrico` + tração (`Elétrico AWD`) |
| Moto | potência (`200 cv`) | cilindrada (`998 cc`) |

Campo ausente → item omitido (nunca exibir "undefined" ou "—" na linha principal).

### Formatação (`lib/format.ts`)

Use `Intl.NumberFormat('pt-BR')`: `36,7 kgfm`, `3,8 s`, `250 km/h`, `82,5 kWh`, `998 cc`.
