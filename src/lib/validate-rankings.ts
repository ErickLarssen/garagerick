// Regras de ranking (docs/03). Lança erro — e quebra o build — se alguma lista estiver inconsistente.

export interface RankingEntryRef {
  list: string; // "populares", "esportivos", "antigos", "motos"
  id: string; // slug
  rank: number;
  brand: string; // id da marca referenciada
  file: string; // nome do arquivo, para a mensagem de erro
}

export function validateRankings(entries: RankingEntryRef[], brandIds: Iterable<string>): void {
  const errors: string[] = [];
  const brands = new Set(brandIds);

  // 1. Cada lista tem as posições 1..N, sem buracos e sem repetição
  const byList = new Map<string, RankingEntryRef[]>();
  for (const entry of entries) {
    byList.set(entry.list, [...(byList.get(entry.list) ?? []), entry]);
  }
  for (const [list, items] of byList) {
    const total = items.length;
    const byRank = new Map<number, RankingEntryRef[]>();
    for (const item of items) byRank.set(item.rank, [...(byRank.get(item.rank) ?? []), item]);

    for (const [rank, same] of byRank) {
      if (same.length > 1) {
        const files = same.map((s) => s.file).join(', ');
        errors.push(`Ranking "${list}": posição ${rank} repetida (${files}).`);
      }
      if (rank > total) {
        const files = same.map((s) => s.file).join(', ');
        errors.push(`Ranking "${list}": posição ${rank} fora do intervalo 1–${total} (${files}).`);
      }
    }
    for (let rank = 1; rank <= total; rank++) {
      if (!byRank.has(rank)) errors.push(`Ranking "${list}": posição ${rank} ausente.`);
    }
  }

  // 2. O mesmo slug não aparece em duas listas (ex.: carro e moto com o mesmo nome de arquivo)
  const listsById = new Map<string, RankingEntryRef[]>();
  for (const entry of entries) {
    listsById.set(entry.id, [...(listsById.get(entry.id) ?? []), entry]);
  }
  for (const [id, same] of listsById) {
    if (same.length > 1) {
      const where = same.map((s) => `"${s.list}"`).join(' e ');
      errors.push(`Slug "${id}" aparece em mais de uma lista (${where}).`);
    }
  }

  // 3. A marca referenciada existe
  for (const entry of entries) {
    if (!brands.has(entry.brand)) {
      errors.push(
        `Marca "${entry.brand}" não existe em src/content/brands/ (${entry.file}, ranking "${entry.list}").`,
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(`Ranking inconsistente:\n- ${errors.join('\n- ')}`);
  }
}
