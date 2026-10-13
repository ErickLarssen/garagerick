// Normalização de texto para a busca (docs/05): sem acentos, minúsculas e espaços simples.
// Módulo puro — usado no build (índice) e no navegador (o que a pessoa digita).
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, ' ')
    .trim();
}
