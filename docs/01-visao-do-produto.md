# 01 — Visão do Produto

## Contexto

O Erick já mantém o **Cinerick** (https://cinerick.online), um "santuário cinematográfico"
com seus 50 filmes favoritos em contagem regressiva (#50 → #1). Cada item tem:

- imagem, posição e título (`#50 DEVORADORES DE ESTRELAS`)
- linha curta de metadados (ano · duração · gênero · classificação)
- um parágrafo em **primeira pessoa**, tom leve e apaixonado, explicando por que ele gosta
- link para o trailer
- uma introdução "Sobre mim" e um rodapé com redes (Instagram, Behance, YouTube, GitHub) — no Garagerick: Instagram, LinkedIn e GitHub

O **Garagerick** é o equivalente para **carros e motos**. Mesma alma (ranking pessoal,
sem pretensão de crítica especializada, voz do Erick), mas com uma apresentação mais
cinematográfica, inspirada numa interface de streaming (referência visual em `docs/04`).

## Objetivo

Expor, de forma visualmente marcante, os veículos favoritos do Erick em rankings
decrescentes por categoria, terminando no **Top 1** de cada uma.

## Público

- Amigos, seguidores e recrutadores que já conhecem o Cinerick e o portfólio do Erick
- Entusiastas de carros que caem no site por indicação
- O próprio Erick — o site também é peça de portfólio front-end, então **o acabamento
  visual e técnico importa tanto quanto o conteúdo**

## Páginas

| Rota | Nome no menu | Conteúdo |
|---|---|---|
| `/` | Populares | Ranking de carros populares (ex.: #1 BYD Seal, #2 Volkswagen Nivus…) |
| `/esportivos` | Esportivos | Ranking de carros esportivos |
| `/antigos` | Antigos | Ranking de carros clássicos/antigos |
| `/motos` | ícone de motocicleta | Ranking de motos favoritas |
| `/404` | — | Página de erro temática ("Saiu da pista") |

> O ícone de casa da referência é substituído por um **ícone de motocicleta** que leva a `/motos`.
> O logo "Garagerick" no canto superior esquerdo leva a `/`.

Cada página de ranking tem a mesma estrutura:

1. **Vitrine (hero, 100vh)** — veículo ativo em destaque; troca por setas ◀ ▶ com contador, teclado e
   swipe. **Sem cards/carrossel** (decisão do Erick em 2026-10-11: os cards tampavam os veículos).
2. **Ranking completo** — lista/grade de todos os itens em ordem decrescente (#N → #1),
   para quem prefere rolar como no Cinerick. Clicar num item volta à vitrine com ele ativo.
3. **Sobre mim** (apenas em `/`) — bloco curto no espírito do Cinerick, com foto e texto do Erick.
4. **Rodapé** — links para o Cinerick, portfólio (ericksilva.site) e redes sociais.

## Experiência do ranking (contagem regressiva)

- A vitrine abre num **slide de introdução** (o que é a página, quantos veículos, "o Top 1 fica para o
  final", botão "Começar pelo #10"), com o Top 1 escuro e desfocado ao fundo; depois vem o **último
  colocado** (ex.: #10) e o usuário avança em direção ao #1, criando suspense como no Cinerick.
  Links diretos (`/esportivos#audi-tt`), a busca e a lista pulam a introdução.
- Um indicador mostra o progresso: `#07 de 10`.
- O **Top 1** recebe tratamento especial (selo dourado "TOP 1", leve brilho no card).
- O estado é refletido na URL via hash (`/esportivos#porsche-911`) para permitir compartilhar
  um veículo específico; ao abrir com hash, a vitrine já começa nele.

## O que cada veículo mostra na vitrine

Paralelo direto com a referência (filme "The Little Mermaid"):

| Referência (filme) | Garagerick (veículo) |
|---|---|
| Logo "Disney" | **Logo da marca** (SVG, monocromático claro) |
| Título "The Little Mermaid" | **Nome do modelo** em tipografia display grande |
| `2023 │ 12+ │ 2h 14min │ Romance` | `2024 │ #01 │ 531 cv │ Elétrico AWD` |
| Sinopse | **"Por que eu gosto"** — texto do Erick, 1ª pessoa |
| Botão `▶ WATCH` | Botão `▶ VÍDEO` (abre o vídeo no YouTube) |
| Botão `+ MY LIST` | Botão `FICHA TÉCNICA` (abre painel com specs completas) |
| `WATCH TRAILER` (rodapé esquerdo) | `RANKING COMPLETO` (rola até a lista) |
| Ícones sociais (rodapé direito) | Instagram, LinkedIn e GitHub do Erick |

## Fora de escopo (por enquanto)

- Backend, banco de dados, login, comentários, votação
- CMS — o conteúdo é editado em arquivos Markdown/JSON no repositório
- Internacionalização (só pt-BR)
- Páginas individuais por veículo (listadas como fase opcional no roadmap)

## Critérios de sucesso

- Vitrine fiel ao espírito da referência, fluida em desktop **e** em celular
- Adicionar um veículo novo = criar 1 arquivo + 2 imagens, sem tocar em código
- Lighthouse ≥ 95 em Performance, Acessibilidade, Boas Práticas e SEO
