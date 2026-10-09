# 06 — Conteúdo e Assets

## Como adicionar um veículo (fluxo do Erick)

1. Garanta que a marca existe em `src/content/brands/<marca>.json` e que o logo está em
   `src/assets/brands/<marca>.svg`.
2. Crie a pasta `src/assets/vehicles/<slug>/` com `hero.jpg` e `card.jpg`.
3. Crie `src/content/cars/<slug>.md` (ou `motorcycles/`) com o frontmatter de `docs/03`.
4. Escreva no corpo do arquivo por que você gosta dele.
5. Se a posição nova "empurra" outras, ajuste o `rank` dos demais da mesma lista.
6. `npm run build` — se o ranking estiver inconsistente, o erro diz exatamente o que corrigir.

> No Claude Code, o comando **`/novo-veiculo`** faz os passos 1–3 e 5 por você
> (ver `.claude/commands/novo-veiculo.md`).

## Imagens

| Arquivo | Proporção | Tamanho mínimo | Conteúdo ideal |
|---|---|---|---|
| `hero.jpg` | 16:9 | 2400×1350 | Carro 3/4 dianteiro ou lateral, **ocupando a metade direita**; lado esquerdo mais "vazio"/escuro para o texto |
| `card.jpg` | 3:4 | 900×1200 | Recorte vertical marcante (frente, detalhe do farol, carro centralizado), estilo pôster |

- Formatos de origem: JPG ou PNG de alta qualidade. **O Astro gera AVIF/WebP** — não converta à mão.
- Se o carro estiver do lado errado, ajuste `heroFocus` antes de editar a imagem.
- `ambientColor`: escolha um tom **escuro** extraído da imagem (luminância baixa), ex.: `#0b2a3a`.
  O agente pode sugerir um valor a partir da cor média da imagem, mas o Erick decide.
- Use imagens que você tenha direito de usar (fotos próprias, kits de imprensa das montadoras,
  bancos com licença). Registre a origem num comentário no frontmatter: `# foto: press kit BYD`.

## Logos das marcas

- Formato **SVG** e **obrigatoriamente monocromático** (uma cor só, sobre fundo transparente):
  a interface clareia o logo com filtro CSS, então logos coloridos/degradês perdem detalhes.
- Fontes recomendadas: sites/kits de imprensa oficiais das marcas e o Wikimedia Commons
  (confira a licença/uso de marca de cada arquivo).
- Antes de salvar: remova `width`/`height` fixos (deixe só `viewBox`), remova cores fixas
  quando possível (`fill="currentColor"`), e otimize (sem metadados de editor).
- Logos muito largos (ex.: "Volkswagen" por extenso) ou muito altos (emblemas) são
  equilibrados com `logoScale` em `brands/*.json`, não editando o SVG.
- Nome do arquivo = id da marca: `byd.svg`, `volkswagen.svg`, `honda.svg`, `bmw-motorrad.svg`.

## Texto "por que eu gosto"

- Primeira pessoa, mesmo tom do Cinerick: pessoal, apaixonado, sem pretensão técnica.
- Ideal: 300–550 caracteres (cabe na vitrine sem "Ler mais" no desktop).
- Markdown simples permitido: *itálico* e **negrito**. Sem títulos, listas ou imagens.

## Ranking inicial (semente)

Para desenvolver a interface, crie **dados de exemplo** com placeholders:

| Lista | Itens iniciais |
|---|---|
| Populares | #1 BYD Seal, #2 Volkswagen Nivus, + 3 placeholders |
| Esportivos | 5 placeholders |
| Antigos | 5 placeholders |
| Motos | 5 placeholders |

Placeholders: `name: "Modelo Exemplo 3"`, marca `exemplo` (logo genérico neutro criado pelo agente),
imagens geradas como degradês escuros (SVG/PNG simples em `src/assets/vehicles/_placeholder/`).
Arquivos placeholder começam com `_exemplo-` para serem fáceis de achar e apagar.

> O Erick vai substituir os placeholders pelos veículos reais. Não pesquise nem escolha
> veículos por ele.

## `lib/site.ts`

Fonte única para:

```ts
export const SITE = {
  name: 'Garagerick',
  url: 'https://garagerick.online',
  author: 'Erick Silva',
  description: 'Meus carros e motos favoritos em contagem regressiva até o Top 1.',
  links: {
    cinerick: 'https://cinerick.online',
    portfolio: 'https://ericksilva.dev',
    instagram: 'https://www.instagram.com/elarssen.design/',
    youtube: 'https://www.youtube.com/@ElarssenDesign/',
    github: 'https://github.com/ErickLarssen/',
    behance: 'https://www.behance.net/ericklarssen/',
  },
} as const;
```

Trocar o nome ou o domínio do site = mudar `SITE.name` / `SITE.url` (o `astro.config.mjs` lê daqui).
O domínio `garagerick.online` é provisório.
