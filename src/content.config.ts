// Schemas das collections (docs/03). O schema é a fonte da verdade do modelo de dados.
import { defineCollection, reference, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const brands = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/brands' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(), // "Volkswagen"
      logo: image(), // "../../assets/brands/volkswagen.svg" — SVG monocromático
      logoScale: z.number().min(0.5).max(2).default(1), // ajuste ótico (logos largos x altos)
      // white: silhueta clara via filtro (padrão); original: cores do arquivo (emblemas coloridos)
      logoTreatment: z.enum(['white', 'original']).default('white'),
      country: z.string().optional(), // "Alemanha"
    }),
});

const powertrain = z.enum(['combustao', 'hibrido', 'eletrico']);

// Campos comuns a carros e motos
const vehicleBase = ({ image }: SchemaContext) => ({
  name: z.string(), // "Seal" (sem a marca)
  brand: reference('brands'), // "byd"
  rank: z.number().int().positive(), // 1 = Top 1
  year: z.number().int().min(1886).max(2100).optional(), // ano-modelo de referência (omitido se desconhecido)
  version: z.string().optional(), // versão/acabamento informado pelo Erick ("Highline 200 TSI")
  powertrain,
  powerCv: z.number().positive().optional(),
  torqueKgfm: z.number().positive().optional(),
  zeroToHundredS: z.number().positive().optional(),
  topSpeedKmh: z.number().positive().optional(),
  transmission: z.string().optional(), // "Automático 6 marchas", "Redução única"
  heroImage: image(), // 16:9
  cardImage: image(), // 3:4
  heroFocus: z.string().default('center'), // object-position do fundo ("70% 50%")
  ambientColor: z
    .string()
    .regex(/^#[0-9a-f]{6}$/i)
    .optional(), // tom do degradê da vitrine
  videoUrl: z.url().optional(), // YouTube
  tags: z.array(z.string()).default([]), // usados na busca
});

const cars = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cars' }),
  schema: ({ image }) =>
    z.object({
      ...vehicleBase({ image }),
      category: z.enum(['populares', 'esportivos', 'antigos']),
      engine: z.string().optional(), // "1.0 TSI 3 cil. turbo" (vazio para elétricos)
      batteryKwh: z.number().positive().optional(), // só elétricos/híbridos plug-in
      drivetrain: z.enum(['FWD', 'RWD', 'AWD', '4x4']).optional(),
      bodyStyle: z.string().optional(), // "Sedã", "SUV cupê", "Hatch"
    }),
});

const motorcycles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/motorcycles' }),
  schema: ({ image }) =>
    z.object({
      ...vehicleBase({ image }),
      displacementCc: z.number().int().positive().optional(), // 998
      engine: z.string().optional(), // "4 cil. em linha"
      style: z.string().optional(), // "Naked", "Esportiva", "Custom", "Trail"
      weightKg: z.number().positive().optional(),
    }),
});

export const collections = { brands, cars, motorcycles };
