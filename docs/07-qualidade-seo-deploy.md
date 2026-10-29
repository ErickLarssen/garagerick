# 07 — Qualidade, SEO e Deploy

## Definição de "pronto" (toda tarefa)

- [ ] `npm run check` passa (astro check, eslint, prettier) sem erros
- [ ] `npm run build` passa
- [ ] Testado em `npm run preview` nas larguras **375px, 768px, 1440px**
- [ ] Sem erros no console do navegador
- [ ] Checklist de interação de `docs/05` ok (se mexeu na vitrine)
- [ ] Item marcado em `docs/08-roadmap.md` e commit feito

## Metas

| Métrica | Meta |
|---|---|
| Lighthouse (Performance, A11y, Best Practices, SEO) | ≥ 95 em cada, mobile |
| LCP | < 2,5 s (a imagem `hero` inicial é o LCP — priorize-a) |
| CLS | < 0,05 (todas as imagens com dimensões; fontes com `font-display: swap` e fallback ajustado) |
| JS total enviado | < 40 kB gzip por página |
| Peso da página inicial | < 600 kB (sem contar imagens lazy da lista) |

## Acessibilidade

- HTML semântico: `header`, `nav`, `main`, `section`, `ol`, `footer`, `dialog`.
- Um único `<h1>` por página, estático, com o nome do ranking/página; nome do veículo ativo e seções com `<h2>`.
- Todos os controles alcançáveis por teclado com foco visível (`outline` em `--color-accent`, 2px, offset 3px).
- `alt` descritivo: "BYD Seal azul em vista dianteira 3/4". Logos: `alt="BYD"`.
  Imagens decorativas (camadas do fundo): `alt=""` + `aria-hidden`.
- Contraste ≥ 4.5:1 para texto normal; ≥ 3:1 para texto grande e ícones.
- Respeitar `prefers-reduced-motion`.
- `lang="pt-BR"` no `<html>`.

## SEO

- `<title>`: `"Esportivos — Ranking de carros favoritos | Garagerick"`.
- `meta description` por página; Open Graph e Twitter Card (imagem 1200×630; por página,
  usar o hero do Top 1 recortado via `getImage` (`lib/seo.ts`); páginas sem ranking (404) usam o
  Top 1 de Populares — sem imagem estática que fique desatualizada).
- `link rel="canonical"` (sem `.html` nem barra final), `@astrojs/sitemap`, `robots.txt` (gerado por
  `pages/robots.txt.ts` a partir de `SITE.url`).
- Dados estruturados JSON-LD por página: `ItemList` com cada veículo como `ListItem`
  (`position` = rank, `name` = "Marca Modelo").
- URLs limpas e em português; sem trailing slash: `trailingSlash: 'never'` + `build.format: 'file'`
  no Astro e `vercel.json` com `cleanUrls: true` e `trailingSlash: false` (a Vercel serve
  `esportivos.html` em `/esportivos` e redireciona `/esportivos/` → `/esportivos`).

## Compatibilidade

Últimas 2 versões de Chrome, Edge, Firefox e Safari (desktop e iOS), Chrome Android.
`backdrop-filter` e `color-mix` com fallback simples (cor sólida) via `@supports`.

## Git

- Branch principal: `main`. O agente cria uma branch por fase a partir da `main`
  (`fase-0-fundacao`, `fase-1-dados`, `fase-2-layout`, `fase-3-vitrine-estatica`…) e commita
  ao fim de cada tarefa. Ao fim da fase (após revisão do Erick), o merge na `main` e o push
  para `origin` (`ErickLarssen/garagerick`) só acontecem com confirmação dele.
- Conventional Commits em português: `feat`, `fix`, `style`, `refactor`, `docs`, `chore`, `content`
  (`content` = só dados/imagens, ex.: `content(esportivos): adiciona Porsche 911`).
- Nunca commitar `node_modules`, `dist`, `.astro`, `.env*`, `.vercel`.

## Deploy (Vercel)

1. Criar repositório no GitHub (`ErickLarssen/garagerick`).
2. Importar na Vercel; framework detectado: Astro; build `npm run build`; output `dist`.
3. Cada push em branch gera um preview; `main` vai para produção.
4. Domínio: apontar `garagerick.online` (ou o escolhido) nas configurações do projeto.
5. Após o primeiro deploy: rodar Lighthouse na URL de produção e registrar os números em
   `docs/decisoes.md`.

> O agente **não** faz deploy nem compra domínio por conta própria — prepara tudo e pede
> confirmação ao Erick.
