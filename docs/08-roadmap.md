# 08 — Roadmap

> Fonte da verdade do progresso. O agente trabalha **de cima para baixo**, marca `[x]` ao concluir
> (após cumprir a definição de "pronto" de `docs/07`) e para ao fim de cada fase para o Erick revisar.

## Fase 0 — Fundação

- [x] Inicializar projeto Astro (template mínimo, TypeScript strict) na raiz do repositório, preservando `CLAUDE.md`, `docs/` e `.claude/`
- [x] Instalar e configurar Tailwind CSS v4 (plugin Vite), fontes (`@fontsource`), Embla, sitemap
- [ ] Configurar alias `@/`, ESLint, Prettier e scripts do `package.json` (`docs/02`)
- [ ] Criar `.gitignore`, `.prettierignore`, atualizar `README.md` (como rodar e como adicionar veículo) e commit
- [ ] Criar `src/styles/global.css` com tokens de `docs/04` (cores, fontes, escala)
- [ ] Criar `lib/site.ts`

**Entrega:** página em branco estilizada com o fundo e as fontes corretas; `check` e `build` passando.

## Fase 1 — Dados

- [ ] `src/content.config.ts` com as três collections (`docs/03`)
- [ ] Placeholders: marca `exemplo`, imagens placeholder, 5 itens por lista (`docs/06`)
- [ ] BYD Seal (#1) e Volkswagen Nivus (#2) em Populares, com ficha marcada como TODO
- [ ] `lib/format.ts`, `lib/validate-rankings.ts`, `lib/rankings.ts` (`getRanking`, `RankedVehicle`)
- [ ] Testar a validação: duplicar um rank de propósito, confirmar a mensagem de erro, desfazer

**Entrega:** uma página de debug temporária (`/debug`, removida no fim da fase) listando os rankings ordenados.

## Fase 2 — Layout base

- [ ] `BaseLayout` com SEO básico e "pular para o conteúdo"
- [ ] `Header` + `Nav` (ícone de moto, estado ativo, comportamento ao rolar)
- [ ] Menu mobile (gaveta) acessível
- [ ] `Footer` + `SocialLinks`
- [ ] Rotas `/`, `/esportivos`, `/antigos`, `/motos`, `404` usando o layout

**Entrega:** navegação completa entre as quatro páginas, ainda sem vitrine.

## Fase 3 — Vitrine (estática)

- [ ] `ShowcaseBackdrop` com degradês e `--ambient`
- [ ] `ShowcaseInfo`: `BrandLogo`, nome display, `SpecRow` + `RankBadge`, texto, botões
- [ ] `CoverflowCarousel` + `VehicleCard` renderizados (sem JS ainda)
- [ ] Layout responsivo desktop/tablet/celular (`docs/04`)
- [ ] `SpecSheet` (`<dialog>`) abrindo e fechando

**Entrega:** vitrine visualmente fiel à referência, mostrando o último colocado. 🛑 Pausa para revisão visual do Erick.

## Fase 4 — Vitrine (interação)

- [ ] `showcase-controller.ts`: Embla + efeito coverflow
- [ ] Troca de veículo com crossfade e animação escalonada da informação
- [ ] Teclado (←/→), setas, contador `#07 de 10`, clique no card
- [ ] Hash na URL (entrada e atualização com `replaceState`)
- [ ] Tratamento especial do Top 1
- [ ] Pré-carregamento de imagens vizinhas
- [ ] `prefers-reduced-motion` e checklist de interação de `docs/05`

**Entrega:** vitrine completa. 🛑 Pausa para revisão.

## Fase 5 — Ranking completo e Sobre mim

- [ ] `RankingList` + `RankingItem` com `<ol reversed>` e destaque do Top 1
- [ ] Clique no item → ativa na vitrine e rola para o topo
- [ ] Link "RANKING COMPLETO" da vitrine rola até a lista
- [ ] `About.astro` em `/` com placeholder de texto e foto

## Fase 6 — Busca

- [ ] Endpoint `search-index.json.ts`
- [ ] `SearchBox` com dropdown acessível, atalho `/`, navegação por teclado
- [ ] Estado vazio e mobile (dentro da gaveta)

## Fase 7 — Polimento, SEO e deploy

- [ ] Open Graph por página, JSON-LD `ItemList`, sitemap, robots, canonical
- [ ] Página 404 temática
- [ ] Auditoria Lighthouse mobile ≥ 95 nas 4 categorias; corrigir o que faltar
- [ ] Revisão de acessibilidade (teclado + leitor de tela)
- [ ] Preparar deploy na Vercel (`docs/07`) e pedir confirmação ao Erick

## Fase 8 — Opcional (só se o Erick pedir)

- [ ] Página individual por veículo `/veiculos/[slug]` com galeria
- [ ] Botão "ouvir o ronco" (áudio curto do motor, só para veículos que tiverem o arquivo)
- [ ] Comparar dois veículos lado a lado
- [ ] Transições entre páginas com View Transitions do Astro
- [ ] Coleções temáticas (ex.: "Carros do Velozes e Furiosos"), ligando ao Cinerick
