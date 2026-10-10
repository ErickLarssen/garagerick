# Registro de Decisões

> Toda decisão técnica que não está prevista nos docs (ou que os contradiz) entra aqui,
> da mais recente para a mais antiga. Seja breve.

## Modelo

```md
### AAAA-MM-DD — Título curto
- **Contexto:** o que motivou
- **Decisão:** o que foi feito
- **Motivo:** por que esta opção e não as alternativas
- **Impacto:** arquivos/docs afetados
```

---

### 2026-10-10 — `BaseLayout` e contraste do accent
- **Contexto:** primeira tarefa da Fase 2. Ao estilizar o link "Pular para o conteúdo", o contraste de **branco sobre `--color-accent` deu 3,56:1** (3,10:1 no hover) — abaixo do 4,5:1 exigido pelo `docs/07` para texto normal.
- **Decisão:** `title` recebe só o título da página e o layout acrescenta ` | Garagerick`; `activeNav` é opcional; `ogImage` opcional (sem imagem → `twitter:card=summary`, sem `og:image` até a Fase 7). Canonical a partir de `Astro.site`. Link "pular" usa texto `--color-bg` sobre accent (5,60:1). **Pendente para a Fase 3:** o botão primário (`docs/04`: branco sobre accent) precisa de outra solução — ver opções no resumo ao Erick.
- **Motivo:** meta de acessibilidade do `docs/07`.
- **Impacto:** `src/layouts/BaseLayout.astro`, `src/pages/index.astro`, `docs/05`.

### 2026-10-10 — Validação de rankings testada
- **Contexto:** tarefa de teste da Fase 1.
- **Decisão:** testados (e desfeitos) três cenários: rank duplicado (`posição 3 repetida (...)` + `posição 4 ausente`), marca inexistente e mesmo slug em carros e motos — todos quebram o build com mensagem acionável. O Astro 7 também acusa referência inválida (`Invalid content reference`) antes da nossa validação; mantemos a nossa por dar contexto do ranking. Sem framework de testes (não previsto em `docs/02`).
- **Motivo:** garantir que o build é a rede de segurança do ranking.
- **Impacto:** nenhum arquivo de código.

### 2026-10-10 — Núcleo de dados (`format`, `validate-rankings`, `rankings`)
- **Contexto:** implementação do contrato de `docs/03`.
- **Decisão:** `validateRankings` é uma função pura (recebe refs e ids de marcas), reúne **todas** as violações e lança um único erro; mensagens no formato `posição N repetida/ausente/fora do intervalo`. `rankings.ts` carrega e valida o catálogo uma vez por build (memoizado), já que a regra de slug único é global. `RankedVehicle` ganhou `ranking`; `rankings.ts` exporta `RANKING_KEYS`, `RANKING_ROUTES` e `RANKING_LABELS`. `body` remove comentários HTML (o `<!-- TODO -->` não vaza para a UI/JSON). Fallback de `ambientColor` = `var(--color-ambient-default)`. Página `/debug` (noindex) criada já nesta tarefa porque a validação só roda quando uma página chama `getRanking`.
- **Motivo:** erros acionáveis de uma vez só; fonte única de rotas/rótulos.
- **Impacto:** `src/lib/*.ts`, `src/pages/debug.astro`, `docs/03`.

### 2026-10-10 — BYD Seal e VW Nivus com dados mínimos
- **Contexto:** regra 3 (não inventar ficha técnica), mas o schema exige `year`, `powertrain`, imagens e um logo existente para a marca.
- **Decisão:** preenchidos só fatos independentes de versão: `powertrain` (Seal elétrico, Nivus combustão), `bodyStyle` (Sedã, SUV cupê) e `country` das marcas. `year: 2024` em ambos com comentário `# TODO: confirmar ano-modelo` (campo obrigatório). Demais specs vazias + `<!-- TODO: confirmar ficha técnica -->` no corpo. Imagens apontam para `_placeholder/` (comentário indica o caminho final). `byd.svg` e `volkswagen.svg` são cópias do logo placeholder com comentário `PLACEHOLDER` — basta sobrescrever o arquivo pelo logo oficial. `ambientColor` vazio (usa o padrão) até o Erick escolher.
- **Motivo:** o build precisa de dados válidos sem inventar números de versão específica.
- **Impacto:** `src/content/cars/byd-seal.md`, `src/content/cars/volkswagen-nivus.md`, `src/content/brands/{byd,volkswagen}.json`, `src/assets/brands/{byd,volkswagen}.svg`.

### 2026-10-10 — Placeholders da Fase 1
- **Contexto:** `docs/06` pede marca `exemplo`, imagens placeholder e itens de exemplo.
- **Decisão:** imagens em **PNG** (não SVG), geradas por um script Node sem dependências (só `zlib`); 5 tons, um por posição. Populares recebe só #3–#5 (BYD Seal e VW Nivus ocupam #1 e #2 na tarefa seguinte); demais listas #1–#5. Specs fictícias e variadas (elétrico, híbrido, combustão, moto, item sem specs), com comentário `# PLACEHOLDER` no frontmatter. Corpo usa o `TODO` da regra 4. Confirmado na prática: ids preservam o `_` (`_exemplo-esportivos-2`). Teste negativo: `ambientColor` inválido derruba o `astro sync` com mensagem clara.
- **Motivo:** o Astro não rasteriza SVG para AVIF/WebP, e a vitrine precisa testar o pipeline real de imagens; specs variadas permitem testar a linha de `quickSpecs` e a omissão de campos.
- **Impacto:** `src/assets/brands/exemplo.svg`, `src/assets/vehicles/_placeholder/`, `src/content/**/_exemplo-*`, `src/content/brands/exemplo.json`, `docs/06`.

### 2026-10-10 — Content collections no Astro 7 (Zod 4)
- **Contexto:** o Astro 7 usa Zod 4; `import { z } from 'astro:content'` está obsoleto (sai no Astro 8) e `z.string().url()` virou `z.url()`.
- **Decisão:** `z` de `astro/zod`, `glob` de `astro/loaders`; `vehicleBase` tipado com `SchemaContext`. Verificado no código do loader: o glob **não** ignora arquivos com `_`, e o id usa `github-slugger`, que preserva o `_` (`_exemplo-3.md` → id `_exemplo-3`) — confirmação prática na tarefa de placeholders.
- **Motivo:** APIs atuais, sem avisos de obsolescência.
- **Impacto:** `src/content.config.ts`, `docs/03`.

### 2026-10-08 — `astro.config.mjs` importa `SITE` de `src/lib/site.ts`
- **Contexto:** decisão de manter a URL do site numa fonte única.
- **Decisão:** `import { SITE } from './src/lib/site.ts'` no `astro.config.mjs` (`site: SITE.url`); o Astro carrega o config via Vite, então o import de `.ts` funciona. Resolve o `site` literal provisório da tarefa de Tailwind/sitemap.
- **Motivo:** trocar domínio = editar só `lib/site.ts`.
- **Impacto:** `astro.config.mjs`, `src/lib/site.ts`.

### 2026-10-08 — Tokens em `@theme static`
- **Contexto:** o Tailwind v4 só emite as variáveis de `@theme` que detecta em uso; tokens usados apenas em `<style>` de componentes ou em scripts (ex.: `--ease-garage`) sumiam do CSS.
- **Decisão:** `@theme static` em `global.css`. Nomes adicionais: `--font-sans` (Poppins), `--font-display` (Rajdhani), `--ease-garage` (easing padrão) e utilitário `numeric` (Rajdhani 600 + `tabular-nums`). `--ambient` nasce em `:root` com `--color-ambient-default`. A regra global de `prefers-reduced-motion` zera só `animation` e `scroll-behavior` — transições ficam, para permitir o crossfade de 150 ms previsto no `docs/04`.
- **Motivo:** tokens sempre disponíveis como variáveis CSS; custo de poucos bytes.
- **Impacto:** `src/styles/global.css`, `docs/04`.

### 2026-10-08 — Configuração de lint e formatação
- **Contexto:** ESLint 10 (flat config) e typescript-eslint 8.71, que marcou `tseslint.config()` como obsoleto.
- **Decisão:** `eslint.config.js` usa `defineConfig` de `eslint/config` com `tseslint.configs.recommended` + `eslintPluginAstro.configs.recommended`; sem `@eslint/js` (não está na lista de dependências permitidas). Prettier: `singleQuote`, `printWidth: 100`, plugin Astro; `.prettierignore` também ignora `package-lock.json`. Alias `@/*` → `./src/*` via `paths` (sem `baseUrl`).
- **Motivo:** APIs atuais, sem dependência extra.
- **Impacto:** `eslint.config.js`, `.prettierrc`, `.prettierignore`, `tsconfig.json`, `package.json`.

### 2026-10-08 — Fontes em subset latin
- **Contexto:** `@fontsource` traz vários subsets (latin, latin-ext, devanagari…).
- **Decisão:** importar só `latin-<peso>.css` em `src/styles/global.css` (Poppins 400/500/600/700, Rajdhani 600/700). `site` fica literal no `astro.config.mjs` até a tarefa de `lib/site.ts`.
- **Motivo:** o subset latin cobre o português (U+0000–00FF) com bem menos peso; meta de < 600 kB (`docs/07`).
- **Impacto:** `src/styles/global.css`, `astro.config.mjs`.

### 2026-10-08 — Projeto inicializado com Astro 7
- **Contexto:** `npm create astro` (template `minimal`) instalou Astro 7.3.8 e TypeScript 6; o template também traz `CLAUDE.md`/`AGENTS.md` genéricos.
- **Decisão:** template gerado numa pasta temporária e copiado para a raiz (sem os `CLAUDE.md`/`AGENTS.md` dele, preservando os nossos). `tsconfig` estende `astro/tsconfigs/strict`. Script `check` provisório = `astro check` (ESLint/Prettier entram na tarefa de configuração). Node ≥ 22.12 (exigência do Astro).
- **Motivo:** `create astro` não aceita diretório com arquivos; versões estáveis mais recentes, conforme `docs/02`.
- **Impacto:** `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `.vscode/`, `src/pages/index.astro`, `public/`, `CLAUDE.md` (comando `--background`).

### 2026-10-08 — Revisão de ambiguidades dos docs (antes da Fase 0)
- **Contexto:** leitura completa dos docs revelou conflitos e lacunas.
- **Decisão:**
  - **Git:** o agente commita cada tarefa e cria uma branch por fase a partir da `main`;
    merge, push (`ErickLarssen/garagerick`) e deploy só com confirmação do Erick.
    O agente mantém `docs/`, `README.md` e `CLAUDE.md` atualizados.
  - **Nome:** "Garagerick" é oficial. Domínio `garagerick.online` segue provisório; `SITE.url`
    em `lib/site.ts` é a fonte única e o `astro.config.mjs` lê dali.
  - **Hash da URL:** só slugs do ranking atual ativam veículo; outros hashes (`#ranking`,
    `#conteudo`) são âncoras normais. `replaceState` não roda na carga inicial.
  - **Logos de marca:** obrigatoriamente monocromáticos; clareados com filtro CSS em `<img>`.
  - **Fonte:** Poppins 700 incluída (logo do header).
  - **Top 1:** o selo "TOP 1" substitui `#01` na linha de specs, no card e na lista.
  - **Títulos:** `<h1>` estático com o nome do ranking; nome do veículo ativo em `<h2>`.
  - **Rotas:** mapa único `RankingKey → rota` (`populares` → `/`).
  - **Setas:** "Próximo" anda em direção ao #1.
  - **"Ler mais" (celular):** sem JS o texto aparece inteiro.
  - **Prettier:** `.prettierignore` exclui `docs/`, `.claude/` e `CLAUDE.md`.
  - **Fim de linha:** `.gitattributes` força LF (o Windows tem `core.autocrlf`, e o Prettier exige LF).
  - **Conteúdo:** na Fase 1, imagens e logos são todos placeholders (inclusive BYD Seal e
    VW Nivus); o ranking real ainda será definido pelo Erick vendo o site montado.
  - **Pendências verificadas na hora:** se o glob loader trata arquivos `_exemplo-*` de forma
    especial (Fase 1); `trailingSlash` na Vercel (Fase 7).
- **Motivo:** eliminar conflitos entre docs/comandos antes de implementar.
- **Impacto:** `.gitattributes`, `CLAUDE.md`, `README.md`, `docs/02`, `04`, `05`, `06`, `07`, `08`,
  `.claude/commands/proxima-tarefa.md`.

### 2026-10-08 — Stack inicial definida
- **Contexto:** site estático de rankings com uma vitrine interativa.
- **Decisão:** Astro + TypeScript strict + Tailwind v4 + Embla (vanilla) + Vercel; sem framework de UI.
- **Motivo:** HTML estático e rápido por padrão, JS só na vitrine, validação de conteúdo com Zod.
- **Impacto:** `docs/02`.

### 2026-10-08 — Validação de ranking dentro do build
- **Contexto:** posições repetidas ou faltando quebrariam a contagem regressiva.
- **Decisão:** `lib/validate-rankings.ts`, chamado por `lib/rankings.ts`, lança erro no build.
- **Motivo:** dispensa script separado e dependências extras para ler frontmatter.
- **Impacto:** `docs/02`, `docs/03`.
