# 04 — Design System

## Referência visual

A referência é uma interface de streaming (mockup "iMovies") com:

- **Fundo em tela cheia** com a imagem do título ativo, escurecida e com degradê azul-petróleo
- **Coluna esquerda**: logo do título, linha de metadados separada por barras verticais,
  um selo colorido (`12+`), sinopse curta e dois botões (primário laranja-vermelho + secundário escuro)
- ~~**Coluna direita**: painel translúcido com carrossel coverflow~~ — **removido** no Garagerick
  (2026-10-11): os cards tampavam os veículos. A foto ocupa a direita e a navegação é ◀ #07 de 12 ▶.
- Topo: logo à esquerda, nav centralizada, busca com sublinhado à direita
- Rodapé da vitrine: "WATCH TRAILER" com ícone de play circular à esquerda, redes à direita

Mantemos essa composição e trocamos a atmosfera subaquática por uma **atmosfera de garagem/pista
à noite**: grafite profundo, reflexos de luz e o tom do próprio veículo tingindo o fundo.

## Cores (tokens em `src/styles/global.css` via `@theme`)

```css
@theme {
  --color-bg:            #07090c;  /* fundo base, quase preto azulado */
  --color-surface:       #11151b;  /* painéis, cards da lista */
  --color-surface-glass: rgb(17 21 27 / 0.45); /* painel translúcido (com backdrop-blur) */
  --color-border:        rgb(255 255 255 / 0.08);
  --color-text:          #f2f4f7;
  --color-text-muted:    #9aa3ae;  /* metadados (como "2023 | 2h 14min" na referência) */
  --color-accent:        #ff3b1f;  /* laranja-vermelho "luz de freio" — botão primário, selo de rank */
  --color-accent-hover:  #ff5a3d;
  --color-gold:          #e8b649;  /* exclusivo do Top 1 */
  --color-ambient-default: #0d2230;
}
```

- **`--ambient`** (variável dinâmica no elemento da vitrine) recebe `ambientColor` do veículo
  ativo e alimenta o degradê de sobreposição — é o que faz cada carro "tingir" a página,
  como o azul do oceano na referência.
- Contraste mínimo **4.5:1** para texto sobre o fundo escurecido. O degradê da vitrine deve
  garantir isso mesmo com imagens claras (escurecer mais o lado esquerdo).

### Sobreposição da vitrine (camadas, de baixo para cima)

1. Imagem `hero` em `object-fit: cover` com `object-position: heroFocus`
2. Degradê lateral: `linear-gradient(90deg, var(--color-bg) 0%, color-mix(in srgb, var(--ambient) 70%, transparent) 45%, transparent 75%)`
3. Degradê inferior: `linear-gradient(0deg, var(--color-bg) 0%, transparent 35%)`
4. Vinheta radial sutil + ruído (SVG `feTurbulence` com opacidade ~0.04) para textura

## Tipografia

| Uso | Fonte | Estilo |
|---|---|---|
| UI, textos, nav, botões | **Poppins** (400, 500, 600) | a mesma da referência |
| Logo "GARAGERICK" no header | **Poppins** 700 | como "iMovies" na referência |
| Nome do modelo (display) | **Rajdhani** 700, caixa alta | ar automotivo/painel de instrumentos |
| Números (rank, cv, ano) | **Rajdhani** 600, `font-variant-numeric: tabular-nums` | utilitário `numeric` |

Escala (fluida com `clamp`):

| Token | Tamanho |
|---|---|
| `--text-display` | `clamp(3rem, 7vw, 6.5rem)` — nome do modelo |
| `--text-meta` | `clamp(1.25rem, 2vw, 2rem)` — linha de specs |
| `--text-body` | `1rem` / line-height 1.6 — texto "por que eu gosto" (máx. ~60ch) |
| `--text-nav` | `0.95rem`, 500 |
| `--text-button` | `0.875rem`, 600, caixa alta, `letter-spacing: 0.06em` |

## Componentes visuais

- **Logo da marca**: SVG **monocromático** renderizado em `<img>` e clareado com filtro CSS
  (`filter: brightness(0) invert(1)`, com leve ajuste para creme se desejado),
  altura base 40px × `logoScale`. Fica **acima** do nome do modelo, como "Disney" sobre o título.
- **Linha de specs**: itens separados por barra vertical fina (`1px`, `--color-border` mais claro),
  cor `--color-text-muted`, exceto o selo de rank.
- **Selo de rank** (`RankBadge`): fundo `--color-accent`, texto `--color-bg` (contraste), Rajdhani, cantos
  levemente chanfrados (`clip-path`) — equivalente ao `12+`. Top 1: fundo `--color-gold`,
  texto escuro e rótulo "TOP 1" **no lugar de** `#01` (na linha de specs e na lista). Ao chegar no
  Top 1, uma faixa de luz atravessa o selo uma vez.
- **Botões**: primário sólido `--color-accent` com **texto e ícone `--color-bg`** (contraste 5,6:1 —
  branco sobre o accent dá só 3,56:1) e ícone ▶; secundário `--color-surface` com
  borda sutil. Altura 44px, raio 4px (cantos quase retos, como a referência).
- **Navegação da vitrine** (`ShowcaseNav`): setas circulares de 44px com borda sutil + contador
  `#07 de 12` em Rajdhani (dourado no Top 1), no centro da barra inferior; no celular, sobre a base da
  foto, numa pílula escura translúcida (com blur).
- **Busca**: ícone de lupa + campo sem caixa, só com sublinhado de 1px.
- **Ícones**: traço de 1.5–2px, estilo linear, em SVG próprio (`src/assets/icons/`).
  Ícone de **motocicleta** no lugar do ícone de casa.

## Layout

### Desktop (≥ 1024px)

```
┌──────────────────────────────────────────────────────────────┐
│ GARAGERICK        🏍  Populares  Esportivos  Antigos     🔍 ___│
│ ░░░░░░░░░░░░░░░░░░░▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│  [logo marca]       ▒▒▒▓▓▓▓   foto do veículo   ▓▓▓▓▓▓▓▓▓▓▓▓│
│  NOME DO MODELO     ▒▒▒▓▓▓▓   (70% da direita)  ▓▓▓▓▓▓▓▓▓▓▓▓│
│  2024 │ #01 │ 531 cv ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│  Texto "por que eu gosto"…                                   │
│  [▶ VÍDEO] [FICHA TÉCNICA]                                   │
│ (◎) RANKING COMPLETO       ◀  #07 de 12  ▶         ◎  in  ⌥ │
└──────────────────────────────────────────────────────────────┘
```

- Foto nos **70% da direita** (`object-fit: cover`, recorte guiado pela altura — fica menor e a
  frente dos carros, quase sempre virada para a esquerda, não disputa espaço com o texto).
- À esquerda, **preto sólido até 30%** dissolvendo sobre a borda da foto até ~60%; o tom do
  veículo (`--ambient`) vira um brilho radial suave atrás das informações.
- Info com largura máxima `min(40rem, 42vw)`. Margens laterais `clamp(1.5rem, 5vw, 6rem)`.

### Tablet (640–1023px) e celular (< 640px)

- Foto no topo, em largura total, com **~56svh** de altura, fundindo em preto na base.
- Informações começam em ~46svh, abaixo do carro (não o cobrem); barra inferior com
  RANKING COMPLETO + navegação (no celular as redes ficam só no rodapé).
- Swipe horizontal troca o veículo (esquerda = próximo).
- Celular: header com logo + botão de menu (gaveta com nav e busca).
- Texto "por que eu gosto" limitado a 4 linhas com "Ler mais" no celular (o corte só é aplicado
  com JS; sem JS o texto aparece inteiro).

## Movimento

- Troca de veículo: fundo faz **crossfade** (400ms) + leve zoom (1.04 → 1);
  bloco de informações sai/entra com fade + translateY(12px), escalonado (logo → nome → specs → texto).
- Easing padrão: `cubic-bezier(0.22, 1, 0.36, 1)` — token `--ease-garage` (utilitário `ease-garage`).
- Ao chegar no **Top 1**: uma faixa de luz percorre o selo dourado uma única vez.
- `prefers-reduced-motion: reduce` → só crossfade de 150ms, sem zoom, sem translate, sem brilho.

## Tom de voz da interface

Português, direto, com um toque automotivo leve, sem exagero:
"Ficha técnica", "Ranking completo", "Saiu da pista" (404), "Nada encontrado nessa garagem" (busca vazia).
