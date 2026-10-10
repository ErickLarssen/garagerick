// Formatação de specs em pt-BR (docs/03): "36,7 kgfm", "3,8 s", "250 km/h", "82,5 kWh", "998 cc".

const integer = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

export const formatPower = (cv: number) => `${integer.format(cv)} cv`;
export const formatTorque = (kgfm: number) => `${decimal.format(kgfm)} kgfm`;
export const formatSeconds = (s: number) => `${decimal.format(s)} s`;
export const formatSpeed = (kmh: number) => `${integer.format(kmh)} km/h`;
export const formatBattery = (kwh: number) => `${decimal.format(kwh)} kWh`;
export const formatDisplacement = (cc: number) => `${integer.format(cc)} cc`;
export const formatWeight = (kg: number) => `${integer.format(kg)} kg`;

/** Posição com dois dígitos: 7 → "#07". */
export const formatRank = (rank: number) => `#${String(rank).padStart(2, '0')}`;

export const POWERTRAIN_LABELS = {
  combustao: 'Combustão',
  hibrido: 'Híbrido',
  eletrico: 'Elétrico',
} as const;

export type Powertrain = keyof typeof POWERTRAIN_LABELS;
