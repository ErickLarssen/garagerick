# CLAUDE.md — Garagerick

> Este arquivo é lido automaticamente pelo Claude Code. Ele é o ponto de entrada:
> leia-o inteiro antes de qualquer tarefa e consulte os documentos em `docs/` indicados abaixo.

## O que é o projeto

**Garagerick** (projeto irmão do [Cinerick](https://cinerick.online)) é um site pessoal
de Erick Silva — designer gráfico e desenvolvedor front-end de São Paulo — que expõe seus
**carros e motos favoritos em formato de ranking decrescente** (do último colocado até o **Top 1**).

Cada veículo aparece numa vitrine em tela cheia inspirada em interfaces de streaming:
logo da marca + nome do modelo em destaque, linha de especificações (ano, cv, motor…),
um texto em primeira pessoa sobre por que o Erick gosta dele, e um carrossel lateral
com os demais veículos do ranking.

Páginas: **Populares**, **Esportivos**, **Antigos** e **Motos** (ícone de motocicleta no menu).

## Mapa da documentação (leia o doc relevante ANTES de implementar)

| Documento | Quando ler |
|---|---|
| `docs/01-visao-do-produto.md` | Sempre que houver dúvida sobre "o que" construir e por quê |
| `docs/02-stack-e-arquitetura.md` | Antes de criar arquivos, pastas ou instalar dependências |
| `docs/03-modelo-de-dados.md` | Antes de mexer em `src/content/` ou `src/content.config.ts` |
| `docs/04-design-system.md` | Antes de escrever qualquer CSS ou componente visual |
| `docs/05-componentes-e-interacoes.md` | Antes de criar/alterar componentes e scripts de interação |
| `docs/06-conteudo-e-assets.md` | Ao adicionar veículos, imagens ou logos |
| `docs/07-qualidade-seo-deploy.md` | Antes de finalizar qualquer fase e antes de deploy |
| `docs/08-roadmap.md` | No início de cada sessão — é a fonte da verdade do progresso |
| `docs/decisoes.md` | Registre aqui toda decisão técnica não prevista nos docs |

## Stack (resumo — detalhes em `docs/02`)

- **Astro** (última versão estável) com saída 100% estática
- **TypeScript** em modo `strict`
- **Tailwind CSS v4** (via plugin Vite oficial) + CSS custom properties para tokens
- **Embla Carousel** (API vanilla) para o carrossel coverflow
- Interações em **TypeScript vanilla** dentro de `<script>` dos componentes Astro — **sem React/Vue**
- Conteúdo em **Astro Content Collections** validadas com Zod
- Deploy na **Vercel** (estático)

## Comandos

```bash
npm install            # instalar dependências
npm run dev            # servidor local (http://localhost:4321)
npx astro dev --background  # servidor em segundo plano (astro dev stop | status | logs)
npm run build          # build de produção (falha se o ranking estiver inconsistente)
npm run preview        # pré-visualizar o build
npm run check          # astro check + eslint + prettier --check
npm run format         # prettier --write
```

## Regras de trabalho (obrigatórias)

1. **Trabalhe por fases.** Abra `docs/08-roadmap.md`, pegue a primeira tarefa não marcada
   da fase atual, implemente, valide e marque `[x]`. Não pule fases sem o Erick pedir.
2. **Antes de terminar qualquer tarefa**, rode `npm run check` e `npm run build`.
   Só declare a tarefa concluída se ambos passarem.
3. **Não invente dados técnicos.** Potência, torque, 0–100 etc. só entram se o Erick forneceu
   ou se você tiver certeza; caso contrário deixe o campo opcional vazio e registre
   `<!-- TODO: confirmar ficha técnica -->` no arquivo do veículo.
4. **O texto "por que eu gosto" é do Erick.** Nunca escreva opinião pessoal no lugar dele.
   Use `TODO: escreva por que você gosta deste veículo.` como placeholder, a menos que ele
   peça explicitamente um rascunho.
5. **Peça permissão antes de adicionar dependências** que não estejam listadas em `docs/02`.
6. **Nada de dados hardcoded em componentes.** Todo conteúdo vem das collections.
7. **Acessibilidade e performance não são opcionais** — siga as metas de `docs/07`.
8. **Commits pequenos** no padrão Conventional Commits, em português
   (ex.: `feat(vitrine): adiciona troca de veículo por teclado`). O agente faz os commits
   e cria uma branch por fase (`fase-N-nome`, ver `docs/07`). **Push, merge na `main` e deploy
   só com confirmação do Erick.** O agente também mantém `docs/`, `README.md` e este arquivo atualizados.
9. **Decisões fora do previsto** vão para `docs/decisoes.md` (data, contexto, decisão, motivo).
10. **Idioma:** interface e textos em português do Brasil; código, nomes de arquivos,
    variáveis e chaves de dados em inglês.

## Convenções rápidas

- Componentes Astro em `PascalCase.astro`; utilitários TS em `kebab-case.ts`.
- Slugs de veículos em `kebab-case` com marca: `byd-seal`, `volkswagen-nivus`.
- Rotas em português: `/`, `/esportivos`, `/antigos`, `/motos`.
- Imports com alias `@/` → `src/`.
- Respeite `prefers-reduced-motion` em toda animação.
