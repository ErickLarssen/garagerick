# Garagerick

Meus carros e motos favoritos em contagem regressiva até o Top 1.
Projeto irmão do [Cinerick](https://cinerick.online).

Site estático feito com Astro, TypeScript e Tailwind CSS v4.
Detalhes da stack em [`docs/02-stack-e-arquitetura.md`](docs/02-stack-e-arquitetura.md).

## Como rodar

Requisito: **Node.js 22.12 ou superior**.

```bash
npm install        # instalar dependências
npm run dev        # servidor local em http://localhost:4321
npm run build      # build de produção em dist/ (falha se o ranking estiver inconsistente)
npm run preview    # pré-visualizar o build
npm run check      # astro check + eslint + prettier --check
npm run format     # formatar o código com Prettier
```

## Como adicionar um veículo

1. Garanta que a marca existe em `src/content/brands/<marca>.json` e que o logo está em
   `src/assets/brands/<marca>.svg` (SVG **monocromático**).
2. Coloque a foto em `src/assets/vehicles/<nome>.<ext>` (mín. 1920 px de largura). Ela é usada
   no fundo da vitrine (16:9) e no card (3:4); ajuste o enquadramento com `heroFocus`.
3. Crie `src/content/cars/<slug>.md` (ou `src/content/motorcycles/<slug>.md`) com o frontmatter
   descrito em [`docs/03-modelo-de-dados.md`](docs/03-modelo-de-dados.md).
4. Escreva no corpo do arquivo por que você gosta dele.
5. Se a posição nova "empurra" outras, ajuste o `rank` dos demais da mesma lista.
6. Rode `npm run build` — se o ranking estiver inconsistente, o erro diz o que corrigir.

O slug segue o padrão `marca-modelo` em kebab-case: `byd-seal`, `volkswagen-nivus`.
Mais detalhes (imagens, logos, cor ambiente) em
[`docs/06-conteudo-e-assets.md`](docs/06-conteudo-e-assets.md).

## Desenvolvimento com o Claude Code

1. Abra a pasta no VS Code, abra o terminal integrado e rode `claude`.
2. Rode **`/proxima-tarefa`** — repita até o fim de cada fase (o agente cria a branch da fase,
   commita cada tarefa e pede confirmação antes de merge/push).
3. Para adicionar veículos: **`/novo-veiculo Porsche 911 esportivos 3`** (faz os passos 1–3 e 5
   acima por você).

## Onde fica cada coisa

- Veículos: `src/content/cars/` e `src/content/motorcycles/`
- Marcas: `src/content/brands/` (+ logos em `src/assets/brands/`)
- Imagens: `src/assets/vehicles/<nome>.<ext>` (uma foto por veículo)
- Lista oficial do ranking: [`docs/carros-favoritos.md`](docs/carros-favoritos.md)
- Progresso do projeto: [`docs/08-roadmap.md`](docs/08-roadmap.md)
- Documentação completa: `docs/`
