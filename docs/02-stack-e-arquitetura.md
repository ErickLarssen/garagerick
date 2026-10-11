# 02 — Stack e Arquitetura

## Por que esta stack

O site é **conteúdo estático com uma única área muito interativa** (a vitrine).
Isso aponta para um gerador estático com "ilhas" de JavaScript, não para uma SPA.

| Escolha | Motivo |
|---|---|
| **Astro** (última estável) | HTML estático por padrão, JS só onde precisa, Content Collections com validação Zod, otimização de imagens nativa |
| **TypeScript strict** | Schemas de dados tipados ponta a ponta (collection → componente) |
| **Tailwind CSS v4** | Velocidade de layout; tokens do design system expostos via `@theme` |
| **TS vanilla nos `<script>`** | A interação da vitrine é pequena e localizada; React seria peso morto |
| **Vercel** | Deploy estático com preview por branch; o Erick já usa |

> **Versões:** sempre instale a última versão estável de cada pacote e consulte a
> documentação oficial da versão instalada antes de usar uma API. Se alguma API citada
> nestes docs tiver mudado, siga a documentação atual e registre em `docs/decisoes.md`.

### Dependências permitidas

- Produção: `astro`, `@astrojs/sitemap` (`embla-carousel` removido em 2026-10-11, junto com os cards)
- Estilo: `tailwindcss`, `@tailwindcss/vite`
- Fontes: `@fontsource/poppins` (400, 500, 600, 700), `@fontsource/rajdhani` (600, 700) (auto-hospedadas, sem Google Fonts em runtime)
- Dev: `typescript`, `@astrojs/check`, `eslint`, `eslint-plugin-astro`, `typescript-eslint`,
  `prettier`, `prettier-plugin-astro`

Qualquer outra dependência exige aprovação do Erick.

**Proibido:** React, Vue, jQuery, bibliotecas de UI prontas (Bootstrap, DaisyUI…),
bibliotecas de animação pesadas. Transições com CSS + Web Animations API.

## Estrutura de diretórios

```
garagerick/
├── CLAUDE.md                      # ponto de entrada do agente
├── README.md                      # instruções para humanos
├── docs/                          # documentação de direcionamento (estes arquivos)
│   ├── 01-visao-do-produto.md
│   ├── 02-stack-e-arquitetura.md
│   ├── 03-modelo-de-dados.md
│   ├── 04-design-system.md
│   ├── 05-componentes-e-interacoes.md
│   ├── 06-conteudo-e-assets.md
│   ├── 07-qualidade-seo-deploy.md
│   ├── 08-roadmap.md
│   └── decisoes.md
├── .claude/
│   └── commands/                  # comandos personalizados do Claude Code
│       ├── novo-veiculo.md        # /novo-veiculo
│       └── proxima-tarefa.md      # /proxima-tarefa
├── public/
│   ├── favicon.svg
│   ├── og-default.jpg             # imagem padrão de compartilhamento (1200×630)
│   └── robots.txt
├── src/
│   ├── assets/
│   │   ├── brands/                # logos das marcas (PNG transparente ou SVG): byd.png, volkswagen.png…
│   │   ├── vehicles/              # uma foto por veículo (seal.webp, nivus.jpg…), usada no
│   │   │                          # fundo (16:9) e no card (3:4); _placeholder/ para pendências
│   │   ├── icons/                 # ícones SVG da interface (moto, busca, play, redes…)
│   │   └── about/erick.jpg        # foto do "Sobre mim"
│   ├── content/
│   │   ├── brands/                # um .json por marca
│   │   ├── cars/                  # um .md por carro (frontmatter + texto "por que eu gosto")
│   │   └── motorcycles/           # um .md por moto
│   ├── content.config.ts          # schemas Zod das collections
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.astro       # logo + nav + busca
│   │   │   ├── Nav.astro
│   │   │   ├── SearchBox.astro
│   │   │   ├── Footer.astro
│   │   │   └── SocialLinks.astro
│   │   ├── showcase/              # a vitrine (fundo + informações + navegação)
│   │   │   ├── Showcase.astro     # orquestra tudo; contém o <script> principal
│   │   │   ├── ShowcaseBackdrop.astro
│   │   │   ├── ShowcaseInfo.astro # logo, nome, specs, texto, botões
│   │   │   ├── SpecRow.astro
│   │   │   ├── RankBadge.astro
│   │   │   ├── BrandLogo.astro
│   │   │   ├── ShowcaseNav.astro      # ◀ #07 de 12 ▶
│   │   │   └── SpecSheet.astro    # painel "Ficha técnica" (<dialog>)
│   │   ├── ranking/
│   │   │   ├── RankingList.astro
│   │   │   └── RankingItem.astro
│   │   ├── sections/
│   │   │   └── About.astro
│   │   └── ui/
│   │       ├── Button.astro
│   │       └── Icon.astro
│   ├── layouts/
│   │   └── BaseLayout.astro       # <head>, SEO, fontes, Header, Footer
│   ├── lib/
│   │   ├── site.ts                # nome do site, URL, redes sociais (fonte única)
│   │   ├── rankings.ts            # getRanking(category) → itens ordenados e enriquecidos
│   │   ├── validate-rankings.ts   # garante posições únicas e contínuas (quebra o build se falhar)
│   │   ├── format.ts              # formatação de specs (cv, kgfm, s, km/h)
│   │   └── search-index.ts        # gera o índice de busca
│   ├── scripts/                   # TS de interação reaproveitável
│   │   ├── showcase-controller.ts
│   │   ├── search.ts
│   │   └── reduced-motion.ts
│   ├── pages/
│   │   ├── index.astro            # Populares
│   │   ├── [category].astro       # esportivos | antigos (getStaticPaths)
│   │   ├── motos.astro
│   │   ├── search-index.json.ts   # endpoint estático com o índice de busca
│   │   └── 404.astro
│   └── styles/
│       └── global.css             # @import tailwind, @theme, tokens, base
├── astro.config.mjs
├── tsconfig.json                  # strict + alias @/*
├── eslint.config.js
├── .prettierrc
├── .gitignore
└── package.json
```

## Fluxo de dados

```
src/content/*  ──(Zod)──►  getCollection()  ──►  lib/rankings.ts  ──►  página
                                                     │                    │
                                                     │ ordena desc,       ├─► Showcase (props serializadas
                                                     │ resolve marca,     │    em data-attributes / JSON)
                                                     │ resolve imagens    └─► RankingList
```

- `lib/rankings.ts` chama `validateRankings()` antes de devolver qualquer lista; se houver
  posição repetida, faltando ou fora do intervalo, o **build falha** com mensagem clara
  (ex.: `Ranking "esportivos": posição 4 ausente`).
- `lib/rankings.ts` é a **única** porta de entrada para listar veículos.
  Ele ordena por `rank` **decrescente** (último colocado primeiro), junta os dados da marca
  e devolve objetos prontos para a UI (tipo `RankedVehicle`).
- O `Showcase` renderiza **todo o HTML no servidor** (todos os slides e o primeiro veículo
  ativo). O script cliente só alterna estados — o site funciona e é indexável sem JS.
- Os dados necessários ao script (textos, specs, URLs das imagens otimizadas) vão em um
  `<script type="application/json" id="showcase-data">` gerado no build.

## Páginas

- `index.astro` → `getRanking('populares')`
- `[category].astro` → `getStaticPaths` retorna `esportivos` e `antigos`
- `motos.astro` → `getRanking('motos')` (lê a collection `motorcycles`)
- As três usam o mesmo conjunto de componentes; nada de duplicar markup.

## Configuração essencial

- `astro.config.mjs`: `output: 'static'`, `site` importado de `SITE.url` em `lib/site.ts`
  (fonte única; domínio `garagerick.online` ainda provisório), integração `@astrojs/sitemap`,
  plugin Vite do Tailwind.
- `.prettierignore`: `docs/`, `.claude/`, `CLAUDE.md` (documentação escrita à mão), além de
  `dist/`, `.astro/` e `node_modules/`.
- `tsconfig.json`: estender o preset `strict` do Astro, `paths: { "@/*": ["src/*"] }`.
- `package.json` scripts:
  ```json
  {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check && eslint . && prettier --check .",
    "format": "prettier --write ."
  }
  ```
