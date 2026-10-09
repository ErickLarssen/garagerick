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
