# 05 — Componentes e Interações

Princípio: **tudo renderizado no servidor; o JS só alterna estado.** Sem JS, a página mostra
o primeiro veículo da vitrine e a lista completa funciona normalmente.

## Componentes de layout

### `BaseLayout.astro`
Props: `title` (sem o nome do site — o layout acrescenta ` | Garagerick`), `description?` (padrão `SITE.description`),
`ogImage?: ImageMetadata` (recortada para 1200×630 via `getImage`), `activeNav?: RankingKey` (ausente na 404).
Responsável por `<head>` (SEO, Open Graph, fontes, favicon, `theme-color`), `Header`, `<main>`, `Footer`
e link "Pular para o conteúdo".

### `Header.astro` / `Nav.astro`
- Logo "GARAGERICK" (texto em Poppins 700, como "iMovies") → `/`.
- Itens: ícone de moto (`aria-label="Motos"`) → `/motos`, Populares → `/`,
  Esportivos → `/esportivos`, Antigos → `/antigos`.
- Item ativo com `aria-current="page"` e sublinhado em `--color-accent`.
- Header fixo e transparente sobre a vitrine; ganha fundo `--color-bg` com blur ao rolar.

### `MobileMenu.astro` (< 640px)
- Botão "Abrir menu" + gaveta lateral com **Popover API** (`popover="auto"` + `popovertarget`):
  funciona sem JS, fecha com Esc/clique fora, e o navegador expõe `aria-expanded` no botão.
- Dentro: botão "Fechar menu" e `Nav variant="drawer"` (lista vertical; o item de moto mostra ícone + "Motos").
- Busca mobile entra na gaveta na Fase 6.

### `SearchBox.astro` + `scripts/search.ts`
- Busca **client-side** sobre `/search-index.json` (gerado no build por `pages/search-index.json.ts`):
  `{ slug, name, brand, ranking, rank, tags, cardImageSrc }`.
- Carrega o índice só no primeiro foco do campo.
- Normaliza acentos e caixa; casa por nome, marca e tags.
- Resultados num dropdown (`role="listbox"`) com miniatura, nome, marca e "#03 em Esportivos".
- Selecionar → navega para a rota do ranking + `#<slug>` (`populares` → `/`, demais → `/<ranking>`;
  usar um único mapa `RankingKey → rota` em `lib/rankings.ts`).
- Teclado: `/` foca a busca, ↑/↓ navega, Enter abre, Esc fecha.
- Vazio: "Nada encontrado nessa garagem."

### `Footer.astro` / `SocialLinks.astro`
Dados vindos de `lib/site.ts`: Instagram (`elarssen.design`), LinkedIn (`ericklarssen`) e
GitHub (`ErickLarssen`), nessa ordem; links para o Cinerick e para `ericksilva.dev`.
Sempre `target="_blank" rel="noopener"` com `aria-label` descritivo.

## A vitrine (`components/showcase/`)

### `Showcase.astro`
Props: `vehicles: RankedVehicle[]` (já em ordem decrescente), `rankingKey`.

Estrutura:

```html
<section class="showcase" data-showcase aria-roledescription="vitrine" aria-label="Ranking …">
  <ShowcaseBackdrop />            <!-- 2 camadas de imagem para crossfade -->
  <div class="showcase__main">
    <ShowcaseInfo />              <!-- aria-live="polite" -->
  </div>
  <div class="showcase__bar">
    <a href="#ranking" class="showcase__more">RANKING COMPLETO</a>
    <ShowcaseNav />               <!-- ◀ #07 de 12 ▶ -->
    <SocialLinks />
  </div>
  <SpecSheet />
</section>
<script type="application/json" id="showcase-data">…</script>
```

### `ShowcaseBackdrop.astro`
- Duas `<img>` sobrepostas (A/B). A troca carrega a nova na camada oculta e faz crossfade.
- Imagens geradas com `getHeroImage()` (`lib/images.ts`, sobre `getImage()`): **só AVIF**, larguras 640/1280/1920, `srcset` + `sizes="100vw"`.
- A primeira imagem tem `fetchpriority="high"` e **não** é lazy (é o LCP).

### `ShowcaseInfo.astro`
Ordem: `BrandLogo` → nome (`<h2>`; contém marca + modelo para leitores de tela,
ex.: `<span class="sr-only">BYD </span>Seal`) → `SpecRow` → texto → botões.

O `<h1>` da página é estático e nomeia o ranking (ex.: "Esportivos — ranking de carros favoritos"),
podendo ser visualmente oculto (`sr-only`) na vitrine.

- **▶ VÍDEO**: link para `videoUrl` (nova aba). Oculto se não houver vídeo.
- **FICHA TÉCNICA**: abre `SpecSheet`.

### `SpecRow.astro`
`ANO │ RankBadge │ quickSpecs[0] │ quickSpecs[1]` — renderizar como `<ul>` com separadores via CSS.

### `SpecSheet.astro`
`<dialog>` nativo (modal), com `specs: SpecItem[]` em grade de 2 colunas (label muted, valor em Rajdhani).
Fecha com Esc, botão "Fechar" e clique no backdrop. Devolve o foco ao botão que abriu.
Abre **sem JS** via Invoker Commands (`command="show-modal" commandfor="spec-sheet"`); "Fechar" é um
`<form method="dialog">`; clique fora via `closedby="any"` (com reserva em JS). Um script pequeno guarda o
invocador (evento `command`) e devolve o foco a ele se ele se perder (Safari não foca botões no clique).

### `ShowcaseNav.astro` (substitui `CoverflowCarousel` + `VehicleCard`, removidos em 2026-10-11)
- Setas ◀ ▶ (`aria-label="Anterior"/"Próximo"`) + contador `#07 de 12` (posição do ranking, não índice;
  "TOP 1" no primeiro). "Próximo" (▶ / →) avança **em direção ao #1** (índice +1 no array decrescente).
- Nas pontas, `aria-disabled="true"` (não `disabled`, para não perder o foco). Sem JS as setas ficam
  ocultas (só aparecem com `.is-enhanced` na vitrine); o contador continua.
- Dados do cliente: `lib/showcase-data.ts` (`ShowcaseVehicle`, `buildShowcaseData`) → JSON em
  `<script type="application/json" id="showcase-data">` dentro da vitrine.

## Controlador da vitrine (`scripts/showcase-controller.ts`)

Uma classe/módulo pequeno, iniciado pelo `<script>` do `Showcase`:

```ts
interface ShowcaseState { index: number }   // índice no array (0 = último colocado)

init(root: HTMLElement): void
  - lê #showcase-data, marca a vitrine com .is-enhanced
  - liga setas, teclado, swipe e hashchange
  - lê location.hash → se existir slug, setActive(i, { instant: true })

setActive(i):
  - atualiza backdrop (crossfade), info (textos, logo, specs, vídeo), --ambient
  - atualiza contador e setas
  - history.replaceState(null, '', '#' + slug)    // não poluir o histórico;
    // NÃO roda na carga inicial — só após interação do usuário
  - se isTop → classe .is-top (contador dourado) e faixa de luz no selo TOP 1
  - pré-carrega hero do próximo e do anterior
```

Entradas:
- Setas ◀ ▶ e teclas ←/→ (quando o foco está na vitrine ou no `body`, nunca em inputs)
- Swipe (toque/caneta): ≥ 50 px na horizontal e dominante sobre o vertical; esquerda = próximo.
  A vitrine tem `touch-action: pan-y` (rolagem vertical continua com o navegador). Mouse não arrasta.
- Roda do mouse **não** troca veículo (evita sequestrar a rolagem da página)
- Teclado: ←/→ valem com foco na vitrine, no `body` ou no `<main>` (que recebe foco ao clicar em área
  vazia); nunca em campos, com a ficha técnica aberta ou com o menu mobile aberto.
- Setas nas pontas usam `aria-disabled="true"` (não `disabled`, para não perder o foco).
- `hashchange` (ex.: vindo da busca na mesma página) → `go(i)`

**Hash:** só é tratado como veículo se corresponder a um slug do ranking atual. Qualquer outro
hash (`#ranking`, `#conteudo` do "pular para o conteúdo"…) é ignorado pelo controlador e segue
o comportamento normal de âncora.

## Ranking completo (`components/ranking/`)

### `RankingList.astro`
`<section id="ranking">` com título "Ranking completo — Esportivos" e `<ol reversed>`
(semântica de contagem regressiva). Grade responsiva: 1 coluna (celular), 2 (tablet), 3–4 (desktop).

### `RankingItem.astro`
Card horizontal: miniatura, `#04` grande, logo, nome, `quickSpecs`, e o início do texto (2 linhas).
É um link para `#<slug>` que rola suavemente até o topo e ativa o veículo na vitrine.
Top 1 com borda dourada.

## `About.astro` (só em `/`)
Foto do Erick (`src/assets/about/erick.jpg`), título curto e texto de apresentação
**fornecido pelo Erick** (placeholder `TODO` até lá), com link para o Cinerick e o portfólio.

## 404
"Saiu da pista." + botão "Voltar para a garagem" → `/`. Mesmo fundo atmosférico, sem imagem pesada.

## Checklist de interação (testar em toda mudança na vitrine)

- [ ] Funciona só com teclado (Tab, ←/→, Enter, Esc)
- [ ] Leitor de tela anuncia o novo veículo (região `aria-live="polite"` só no bloco de info)
- [ ] Hash na URL abre o veículo certo
- [ ] Sem JS: primeiro veículo visível e lista completa navegável
- [ ] `prefers-reduced-motion` respeitado
- [ ] Swipe funciona em celular; sem scroll horizontal da página
