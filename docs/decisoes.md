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
