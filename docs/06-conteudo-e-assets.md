# 06 — Conteúdo e Assets

## Como adicionar um veículo (fluxo do Erick)

1. Garanta que a marca existe em `src/content/brands/<marca>.json` e que o logo está em
   `src/assets/brands/<marca>.png` (ou `.svg`).
2. Coloque a foto em `src/assets/vehicles/<nome>.<ext>` (JPG, PNG, WebP ou AVIF). A mesma foto
   serve de fundo (16:9) e de card (3:4); se quiser um card diferente, aponte `cardImage` para outra.
3. Crie `src/content/cars/<slug>.md` (ou `motorcycles/`) com o frontmatter de `docs/03`.
4. Escreva no corpo do arquivo por que você gosta dele.
5. Se a posição nova "empurra" outras, ajuste o `rank` dos demais da mesma lista.
6. `npm run build` — se o ranking estiver inconsistente, o erro diz exatamente o que corrigir.

> No Claude Code, o comando **`/novo-veiculo`** faz os passos 1–3 e 5 por você
> (ver `.claude/commands/novo-veiculo.md`).

## Imagens

| Arquivo | Proporção | Tamanho mínimo | Conteúdo ideal |
|---|---|---|---|
| `heroImage` | 16:9 (recortada) | 1920×1080 | Carro 3/4 dianteiro ou lateral, **ocupando a metade direita**; lado esquerdo mais "vazio"/escuro para o texto. Fotos em retrato ou quadradas funcionam com `heroFocus`, mas perdem nitidez |
| `cardImage` | 3:4 (recortada) | 640 px de largura | Por padrão é a mesma foto; o recorte usa o mesmo `heroFocus` |

- Formatos de origem: JPG ou PNG de alta qualidade. **O Astro gera AVIF/WebP** — não converta à mão.
- Se o carro estiver do lado errado, ajuste `heroFocus` antes de editar a imagem.
- Se no **celular** o carro aparecer cortado (fotos largas), use `heroFitMobile: contain`: a foto passa a
  aparecer inteira na largura da tela, logo abaixo do header, com as bordas dissolvendo no preto.
- `ambientColor`: escolha um tom **escuro** extraído da imagem (luminância baixa), ex.: `#0b2a3a`.
  O agente pode sugerir um valor a partir da cor média da imagem, mas o Erick decide.
- Use imagens que você tenha direito de usar (fotos próprias, kits de imprensa das montadoras,
  bancos com licença). Registre a origem num comentário no frontmatter: `# foto: press kit BYD`.

## Logos das marcas

- **PNG com fundo transparente** (ou SVG sem fundo). Margens transparentes são cortadas antes de salvar
  (o logo é exibido por altura; margem sobrando o deixa minúsculo).
- Por padrão (`logoTreatment: "white"`) a interface deixa o logo branco com filtro CSS — bom para
  logos monocromáticos ou de traço. Emblemas preenchidos (escudos, ovais, círculos: Ferrari,
  Lamborghini, BMW, Ford, Harley-Davidson, Triumph) viram uma forma sólida; para eles use
  `logoTreatment: "original"`, que mantém as cores do arquivo.
- Logos com brasão colorido **e** texto preto (ex.: Porsche): use `original` e deixe só o texto claro no
  próprio arquivo (o `porsche.png` foi processado assim: brasão nas cores originais, "PORSCHE" e "®" claros).
- Fontes recomendadas: sites/kits de imprensa oficiais das marcas e o Wikimedia Commons
  (confira a licença/uso de marca de cada arquivo).
- Antes de salvar: remova `width`/`height` fixos (deixe só `viewBox`), remova cores fixas
  quando possível (`fill="currentColor"`), e otimize (sem metadados de editor).
- Logos muito largos (ex.: "Volkswagen" por extenso) ou muito altos (emblemas) são
  equilibrados com `logoScale` em `brands/*.json`, não editando o SVG.
- Nome do arquivo = id da marca, em minúsculas: `byd.png`, `volkswagen.png`, `harley-davidson.png`.

## Texto "por que eu gosto"

- Primeira pessoa, mesmo tom do Cinerick: pessoal, apaixonado, sem pretensão técnica.
- Ideal: 300–550 caracteres (cabe na vitrine sem "Ler mais" no desktop).
- Markdown simples permitido: *itálico* e **negrito**. Sem títulos, listas ou imagens.

## Ranking inicial (semente — substituído em 2026-10-11 pela lista de `docs/carros-favoritos.md`)

Para desenvolver a interface, crie **dados de exemplo** com placeholders:

| Lista | Itens iniciais |
|---|---|
| Populares | #1 BYD Seal, #2 Volkswagen Nivus, + 3 placeholders |
| Esportivos | 5 placeholders |
| Antigos | 5 placeholders |
| Motos | 5 placeholders |

Placeholders: `name: "Modelo Exemplo 3"`, marca `exemplo` (logo genérico neutro criado pelo agente),
imagens geradas como degradês escuros (PNG em `src/assets/vehicles/_placeholder/`: `hero-1..5.png`
1920×1080 e `card-1..5.png` 900×1200, cinco tons). Arquivos placeholder seguem o padrão
`_exemplo-<lista>-<rank>.md` para serem fáceis de achar e apagar; em Populares eles ocupam #3–#5.
As specs dos placeholders são **fictícias** (marcadas no frontmatter) e variadas de propósito
para exercitar a UI — a regra 3 do `CLAUDE.md` vale para veículos reais.

> O Erick vai substituir os placeholders pelos veículos reais. Não pesquise nem escolha
> veículos por ele.

## "Sobre mim" (home)

Edite `src/content/about/sobre.md`: o corpo é o seu texto de apresentação. Para a foto, coloque-a em
`src/assets/about/` (retrato, idealmente 4:5) e descomente `photo` e `photoAlt` no frontmatter.
Sem foto, a seção mostra suas iniciais.

## `lib/site.ts`

Fonte única para:

```ts
export const SITE = {
  name: 'Garagerick',
  url: 'https://garagerick.vercel.app',
  author: 'Erick Silva',
  description: 'Meus carros e motos favoritos em contagem regressiva até o Top 1.',
  links: {
    cinerick: 'https://cinerick.online',
    portfolio: 'https://ericksilva.site',
    instagram: 'https://www.instagram.com/elarssen.design/',
    linkedin: 'https://www.linkedin.com/in/ericklarssen/',
    github: 'https://github.com/ErickLarssen/',
  },
} as const;
```

Trocar o nome ou o domínio do site = mudar `SITE.name` / `SITE.url` (o `astro.config.mjs` lê daqui).
O endereço `garagerick.vercel.app` é provisório (domínio próprio ainda indefinido).
