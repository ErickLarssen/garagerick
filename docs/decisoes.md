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

### 2026-10-28 — Primeiro deploy na Vercel (domínio provisório)
- **Contexto:** o Erick autorizou o deploy e, com o domínio ainda indefinido, o uso do endereço provisório da Vercel.
- **Decisão:** projeto `garagerick` criado na equipe "Elarssen Code Solutions" (`ericksikva`), ligado a `ErickLarssen/garagerick` — cada push na `main` publica em produção, outras branches geram preview. Produção em **https://garagerick.vercel.app** (público). A equipe usa Deployment Protection `all_except_custom_domains`: os endereços longos (`garagerick-ericksikva.vercel.app`, previews) exigem login na Vercel, o curto não — nenhuma configuração foi alterada. `SITE.url` trocado de `garagerick.online` para `garagerick.vercel.app` (canonical, OG, sitemap, robots). Conferido em produção: rotas sem extensão 200, `/esportivos/` e `/esportivos.html` → 308 para `/esportivos`, 404 com status 404, cabeçalhos de segurança presentes e `/_astro/*` com `immutable`. O primeiro build levou ~8 min (252 imagens AVIF sem cache).
- **Impacto:** `src/lib/site.ts`, `README.md`, `docs/02`, `docs/06`, `docs/07`.

### 2026-10-28 — Preparação do deploy na Vercel
- **Contexto:** última tarefa da Fase 7. O agente não faz deploy nem mexe em domínio sem confirmação (docs/07).
- **Decisão:** `vercel.json` completo: `framework`, `buildCommand` e `outputDirectory` explícitos (a importação não depende da detecção), `Cache-Control: public, max-age=31536000, immutable` em `/_astro/*` (a Vercel, por padrão, revalida todo arquivo estático; os de `/_astro/` têm hash no nome), `/search-index.json` com `max-age=0, must-revalidate` (nome fixo, muda com o ranking) e cabeçalhos de segurança básicos (`nosniff`, `strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Permissions-Policy` sem câmera/microfone/localização). **Sem CSP** por ora: o CSS embutido, o JSON-LD e os scripts inline exigiriam hashes/nonce — fica para depois, se o Erick quiser. README ganhou a seção "Deploy (Vercel)" e teve dois trechos desatualizados corrigidos (logos não precisam ser SVG monocromático — `logoTreatment`; não existe mais card 3:4). `engines.node >=22.12.0` já estava no `package.json` (a Vercel usa para escolher a versão do Node).
- **Pendente (Erick):** confirmar o deploy e o domínio — `SITE.url` é `https://garagerick.online` (provisório); canonical, Open Graph, sitemap e robots usam esse valor.
- **Impacto:** `vercel.json`, `README.md`, `docs/07`.

### 2026-10-28 — Revisão de acessibilidade (teclado + leitor de tela)
- **Contexto:** quarta tarefa da Fase 7; pendência antiga: o bloco de info da vitrine era `aria-live` inteiro.
- **Decisão:** o bloco deixa de ser região viva (a cada troca o leitor relia logo, specs, o texto inteiro, "Vídeo (abre o YouTube…)" e "Ficha técnica", e anunciava o "Ler mais/Ler menos"). No lugar, um `<p role="status" class="sr-only" data-showcase-announcer>` na vitrine, preenchido no `setActive` só em trocas feitas pelo usuário (não na carga): "BMW M2, 2020. Posição 11 de 12." / "Top 1 de 12." — anunciado na hora, sem esperar a animação; trocas rápidas deixam só o último texto. `BrandLogo` ganhou `decorative` (`alt=""`), usado na vitrine e na lista, onde o nome já traz a marca em texto oculto (antes: "BYD, BYD Seal"); o controlador não regrava mais o `alt`. Setas: "Veículo anterior"/"Próximo veículo" (antes "Anterior"/"Próximo", ambíguos fora de contexto). Título da ficha: o `compressHTML` colava "Ficha técnicaBMW M2" → separador oculto ": ".
- **Verificado:** Tab percorre, em ordem, pular link → logo → nav → busca → Ficha técnica → Ranking completo → setas → redes → itens da lista → Sobre → rodapé, todos com contorno de foco visível; ←/→ trocam e anunciam; a ficha abre com Enter (foco em "Fechar"), prende o Tab, fecha com Esc e devolve o foco; árvore de acessibilidade do Chrome conferida (um `h1`, nomes de links/botões, `#12` visual oculto e "Posição 12" para leitores). Busca, gaveta e 404 revisadas nas tarefas anteriores.
- **Impacto:** `src/components/showcase/{Showcase,ShowcaseInfo,ShowcaseNav,BrandLogo,SpecSheet}.astro`, `src/components/ranking/RankingItem.astro`, `src/scripts/showcase-controller.ts`, `docs/05`, `docs/07`.

### 2026-10-28 — Auditoria Lighthouse (mobile)
- **Contexto:** terceira tarefa da Fase 7. Lighthouse 12 via `npx -y lighthouse@12` (ferramenta, não dependência do projeto; permissão em `.claude/settings.local.json`, fora do git), perfil mobile padrão, contra `astro preview`. Relatórios em `.lighthouse/` (no `.gitignore`).
- **Primeira rodada:** Populares 99/100/100/100, Esportivos 98/100/100/100, Antigos 98/100/100/100, Motos 98/100/100/100 (Desempenho/Acessibilidade/Boas práticas/SEO). Apontados: CSS bloqueante (2 arquivos, ~460 ms estimados) e foto da vitrine maior que o necessário (25–48 KiB): em 412 px × DPR 1,75 o navegador pulava de 640 para 1280.
- **Decisão:** `build.inlineStylesheets: 'always'` (CSS ~9 kB embutido no HTML; perde o cache entre páginas, mas elimina a requisição antes da primeira pintura) e hero com degrau de 960 px + `sizes="(min-width: 1024px) 70vw, 100vw"` (no desktop a foto ocupa 70% da largura). bf-cache reprovado por "CacheLimitPrunedOnCriticalMemoryPressure" (não acionável, memória do Chrome headless).
- **Resultado final:** Populares 99/100/100/100 (LCP 1,8 s, CLS 0,011, 242 kB), Esportivos 99/100/100/100 (LCP 2,1 s, 283 kB), Antigos 99/100/100/100 (LCP 2,1 s, 211 kB), Motos 98/100/100/100 (LCP 2,2 s, 239 kB); TBT 0 em todas. 404 (`/404.html`): 100/100/100/63 — o SEO baixo é só o `is-crawlable`, consequência intencional do `noindex`. Números locais; repetir na URL de produção após o deploy (`docs/07`).
- **Impacto:** `astro.config.mjs`, `src/lib/images.ts`, `.gitignore`, `docs/02`, `docs/07`.

### 2026-10-28 — Página 404 temática
- **Contexto:** segunda tarefa da Fase 7.
- **Decisão:** `pages/404.astro` com o fundo da vitrine (brilho em `--ambient` via `color-mix`, com fallback, + ruído) e uma cena em SVG inline decorativo (`aria-hidden`): pista em perspectiva, marcas de pneu saindo pela direita (traço animado uma vez com `stroke-dashoffset`) e luzes de freio que acendem no fim; com movimento reduzido, a regra global leva direto ao estado final. Botão "Voltar para a garagem" (`Button`) e links para os rankings (de `RANKING_KEYS/LABELS/ROUTES`). `BaseLayout` ganhou `noindex`: `meta robots noindex` e sem canonical/`og:url` (antes a 404 saía com canonical `/404`). Testado em 375/768/1440 px, sem erros no console.
- **Impacto:** `src/pages/404.astro`, `src/layouts/BaseLayout.astro`, `docs/05`.

### 2026-10-28 — SEO: Open Graph, JSON-LD, sitemap, robots e canonical
- **Contexto:** primeira tarefa da Fase 7 (branch `fase-7-polimento-seo-deploy`).
- **Decisão:** `lib/seo.ts`: `rankingOgImage()` (hero do Top 1, recortado em 1200×630 JPG com `fit: 'cover'`, alt "BYD Seal, Top 1 em Populares") e `rankingStructuredData()` (`ItemList` com `ListItem` position = rank, name = "Marca Modelo", url = página#slug, do Top 1 para baixo). `BaseLayout` ganhou `ogImage` ({ image, alt }), `structuredData` (JSON-LD escapado com `toScriptJson`), `og:image:type/alt` e `twitter:image:alt`. **Sem `public/og-default.jpg`:** o fallback (404) é o Top 1 de Populares, gerado no build — uma imagem estática ficaria desatualizada quando o ranking mudar. `robots.txt` gerado por `pages/robots.txt.ts` (libera tudo + sitemap). URLs sem barra final: `trailingSlash: 'never'` + `build.format: 'file'` (antes o sitemap e o canonical saíam com `/esportivos/`), e `vercel.json` com `cleanUrls: true` + `trailingSlash: false` para a Vercel servir `esportivos.html` em `/esportivos`. O canonical remove `.html`/`index.html` do pathname. Conferido: `astro preview` responde 200 em `/`, `/esportivos`, `/antigos`, `/motos`, `/robots.txt`, `/search-index.json` e 404 no resto.
- **Impacto:** `astro.config.mjs`, `vercel.json`, `src/lib/seo.ts`, `src/layouts/BaseLayout.astro`, `src/pages/{index,[category],motos}.astro`, `src/pages/robots.txt.ts`, `docs/02`, `docs/07`.

### 2026-10-28 — Busca: estado vazio e versão mobile
- **Contexto:** última tarefa da Fase 6.
- **Decisão:** o dropdown virou um painel (`data-search-panel`) com o `listbox` e, ao lado dele, o `<p>` "Nada encontrado nessa garagem." (fora do `listbox`, que só pode conter opções). Com texto no campo o painel abre; `aria-expanded` só fica `true` quando há opções; o `role="status"` anuncia a contagem ou a frase do estado vazio. Enquanto o índice não chega, nada é renderizado (sem "nada encontrado" falso); ao chegar, a busca roda com o que já foi digitado. Mobile: `SearchBox variant="drawer"` no topo da gaveta (acima da nav), com campo em largura total e resultados no fluxo (sem flutuar); a linha "marca · ranking" quebra em vez de cortar. Esc na gaveta: 1º fecha os resultados, 2º limpa o campo, 3º fecha a gaveta — o `preventDefault` no `keydown` segura o fechamento do popover. Escolher um veículo da mesma página fecha a gaveta. Testado num iframe de 390 px com cliques e teclas reais.
- **Impacto:** `src/components/layout/{SearchBox,MobileMenu}.astro`, `src/scripts/search.ts`, `docs/05`.

### 2026-10-28 — `SearchBox` (combobox) no header
- **Contexto:** segunda tarefa da Fase 6.
- **Decisão:** `components/layout/SearchBox.astro` (`<search>` + `<input role="combobox">` + `<ul role="listbox">`, padrão ARIA 1.2: o foco fica no campo e a opção marcada vai em `aria-activedescendant`) e `scripts/search.ts`. Prop `id` prefixa os ids porque haverá uma segunda instância na gaveta. O componente nasce `hidden` e o script o revela — sem JS a busca não funcionaria. Índice baixado no primeiro foco (uma requisição compartilhada; em erro, tenta de novo no próximo foco). Casamento: todos os termos normalizados contidos em `keywords`; ordem = nome começando pela busca → palavra começando pelo 1º termo → resto; máximo 8. Teclado: `/` foca a busca visível (fora de campos e sem diálogo aberto), ↓/↑ circulam, Enter abre a marcada (ou a primeira), 1º Esc fecha a lista e o 2º limpa. Contagem anunciada num `role="status"` oculto. Selecionar na mesma página troca só o hash (o controlador da vitrine já escuta `hashchange`), rola até a vitrine e foca o nome do veículo, como a lista do ranking; em outra página, navega. No header fica à direita, visível a partir de 640 px (largura do campo `clamp(6rem, 14vw, 12rem)`, testado em 640/768/1024 sem sobreposição).
- **Impacto:** `src/components/layout/{SearchBox,Header}.astro`, `src/scripts/search.ts`, `src/assets/icons/search.svg`, `docs/05`.

### 2026-10-13 — Índice da busca (`/search-index.json`)
- **Contexto:** primeira tarefa da Fase 6 (branch `fase-6-busca`).
- **Decisão:** `lib/search-index.ts` → `buildSearchIndex()` servido por `pages/search-index.json.ts` (estático no build). Formato ajustado ao que existe hoje: sem `cardImageSrc` (cards removidos) → `thumbSrc` (AVIF 160×120, `fit: cover`, a partir do `heroImage`); `href` pronto via `RANKING_ROUTES`; `rankingLabel` ("#03 em Esportivos", "Top 1 em Populares"); `keywords` pré-normalizado (marca, nome, versão, tags) para o cliente não repetir o trabalho. Normalização em `lib/normalize.ts` (NFD sem diacríticos, minúsculas, só letras/números) — módulo puro, separado porque `search-index.ts` importa `astro:assets`. `RankedVehicle` passou a expor `version` e `tags`. Ordem: por ranking e, dentro dele, do Top 1 para baixo. Resultado: 34 entradas, 9,1 kB (2,2 kB gzip).
- **Impacto:** `src/lib/{search-index,normalize,rankings}.ts`, `src/pages/search-index.json.ts`, `docs/05`.

### 2026-10-12 — "Sobre mim" na home
- **Contexto:** última tarefa da Fase 5; a foto `src/assets/about/erick.jpg` ainda não existe e o texto é do Erick (regra 4).
- **Decisão:** nova collection `about` (um arquivo, `src/content/about/sobre.md`: `title` padrão "Sobre mim", `photo?`, `photoAlt?`, corpo = texto) para respeitar a regra 6 (nada de conteúdo no componente); `lib/about.ts` → `getAbout()`. `sections/About.astro` (`<section id="sobre">`, só em `/`, entre o ranking completo e o rodapé): foto em AVIF 320/640 (4:5, lazy) ou, sem foto, bloco com as iniciais de `SITE.author` ("ES"); texto; links para o Cinerick e o portfólio (de `SITE.links`). Texto inicial: `TODO: escreva sua apresentação.`
- **Impacto:** `content.config.ts`, `src/content/about/sobre.md`, `src/lib/about.ts`, `src/components/sections/About.astro`, `src/pages/index.astro`, `docs/02`, `docs/05`, `docs/06`.

### 2026-10-12 — Rolagem suave até o "Ranking completo"
- **Contexto:** terceira tarefa da Fase 5.
- **Decisão:** sem JS: `html { scroll-behavior: smooth }` só em `prefers-reduced-motion: no-preference` (a regra global de movimento reduzido já força `auto`); `#ranking` tem `scroll-margin-top: var(--header-h)`. Vale também para o "Pular para o conteúdo". Testado: o link leva a `#ranking` e a seção para logo abaixo do header fixo (72 px); a vitrine ignora o hash `#ranking`.
- **Impacto:** `src/styles/global.css`.

### 2026-10-12 — Clique no item da lista ativa o veículo e volta à vitrine
- **Contexto:** segunda tarefa da Fase 5.
- **Decisão:** delegação de `click` no `document` (no controlador da vitrine) para `[data-ranking-item]`: `preventDefault` (ignora clique com Ctrl/Cmd/botão do meio, que abre o link normalmente), `go(i)` — a troca sincronizada grava `#slug` via `replaceState` —, `scrollIntoView` da vitrine (suave; instantâneo com `prefers-reduced-motion`) e foco no nome do veículo (`<h2 tabindex="-1">`, sem contorno) para quem usa teclado não ficar preso na lista. Item do veículo já ativo: só rola. Testado: clique no Aventador ativa #02, grava o hash e foca o nome; rolagem conferida em modo instantâneo (a suave não anda em aba oculta de automação). Sem JS o link só muda o hash (não há âncora com o slug).
- **Motivo:** `docs/05`.
- **Impacto:** `src/scripts/showcase-controller.ts`, `ShowcaseInfo`.

### 2026-10-12 — `RankingList` e `RankingItem`
- **Contexto:** primeira tarefa da Fase 5 (branch `fase-5-ranking-sobre`).
- **Decisão:** `<section id="ranking">` com `<h2>` "Ranking completo — X", contagem de posições e `<ol reversed>` (lista sem marcadores visuais; a posição aparece no item). Grade `auto-fill, minmax(min(100%, 20rem), 1fr)`: 1 coluna no celular, 2 no tablet (768 px), 3–4 no desktop. Item = link `#slug` (a vitrine já reage ao `hashchange`) com miniatura 4:3 (`getThumbImage`, AVIF 320/640, lazy, mesmo `heroFocus`), posição grande no canto, logo (20 px), nome, linha "ano · quickSpecs" e trecho de 2 linhas; Top 1 com borda e "TOP 1" dourados. Para leitores de tela o nome é "Posição 12: Dodge Charger". Novo `RankedVehicle.excerpt` (texto puro, ausente enquanto o corpo for o placeholder TODO). `getCardImage` (sem uso desde a remoção dos cards) virou `getThumbImage`; `RankingPagePlaceholder` removido.
- **Motivo:** `docs/05`; não poluir a lista com 34 "TODO".
- **Impacto:** `src/components/ranking/{RankingList,RankingItem}.astro`, páginas de ranking, `lib/{rankings,images}.ts`, `docs/05`.

### 2026-10-11 — Separadores da linha de specs e barra em telas estreitas
- **Contexto:** pendências da 2ª rodada de revisão, autorizadas pelo Erick.
- **Decisão:** separador `│` da `SpecRow` por CSS puro: cada separador em posição absoluta à esquerda do item, lista com margem negativa + `overflow: hidden` — o separador de quem inicia uma linha cai fora e é cortado (sem JS e sem mexer no layout; esconder o separador via JS poderia fazer o item voltar à linha de cima). Abaixo de 480 px, "Ranking completo" mostra só o ícone (texto mantido para leitores de tela) e o rótulo nunca quebra. Foto com `heroFitMobile: contain` ganhou `max-height: calc(56svh - header)`: fotos 4:3 (Nivus, Passat) invadiam o nome em telas de ~430 px; agora encolhem e centralizam. Testado em 300/360/430 px: navegação dentro da tela, specs sem separador no início da linha, foto terminando antes do nome. **Observação:** fotos de estúdio com fundo claro, quando encolhem, mostram as laterais do retângulo — trocar por fotos de fundo escuro resolve.
- **Impacto:** `SpecRow`, `Showcase`, `ShowcaseBackdrop`.

### 2026-10-11 — Revisão da Fase 4 (2ª rodada): Porsche, troca sincronizada e fotos no celular
- **Contexto:** o Erick apontou (1) o logo da Porsche todo branco perdendo a identidade; (2) lentidão — às vezes a foto demorava segundos/minutos e o logo de um veículo aparecia com o título de outro (ex.: foto do R8, logo da Ferrari, título "Aventador"); (3) carros cortados no celular (não as motos), com lista de 23 carros a ajustar e 4 que já estavam bons (Taos, M2, 458 Itália, Mustang Shelby GT350).
- **Decisão:** (1) `porsche.png` processado a partir do original: brasão nas cores originais, "PORSCHE" e "®" convertidos para claro (só pixels escuros e sem saturação nessas regiões, preservando a sombra do brasão); marca com `logoTreatment: original`, `logoScale: 1.4`. (2) **Causa:** fundo e informações trocavam em momentos independentes, e um `<img>` mantém a imagem antiga até a nova carregar — com imagens lentas (no `npm run dev` o Astro gera cada AVIF na hora do primeiro pedido, a partir de fotos de até 8075 px) as partes ficavam de veículos diferentes. **Correção:** troca em 3 etapas — prepara a foto na camada oculta (escondida na hora, sem transição, para não "vazar" numa troca rápida) e carrega o logo enquanto as informações saem → espera ambos (teto `READY_MAX_MS` = 2,5 s) → fundo, logo e textos mudam juntos; trocas substituídas no meio são descartadas pelo token. Testado: 5 trocas rápidas, ida e volta e troca simples terminam com contador, título, foto, logo e URL do mesmo veículo e uma só camada ativa. (3) Novo campo `heroFitMobile: 'cover' | 'contain'` (padrão `cover`); com `contain`, abaixo de 640 px a foto aparece inteira na largura, logo abaixo do header, com `mask-image` dissolvendo topo e base. Marcados os 23 carros da lista; motos e os 4 citados ficam em `cover`. **Observações:** para avaliar velocidade real, usar `npm run build && npm run preview` (no dev a primeira visualização de cada foto é lenta por geração sob demanda); a 300 px de largura o contador da barra fica cortado (ok a partir de 360 px).
- **Motivo:** identidade das marcas, consistência visual e veículos inteiros no celular.
- **Impacto:** `src/assets/brands/porsche.png`, `src/content/brands/porsche.json`, `src/scripts/showcase-controller.ts`, `ShowcaseBackdrop`, `content.config.ts`, `lib/{rankings,showcase-data}.ts`, 23 arquivos em `src/content/cars/`, `docs/03`, `docs/06`.

### 2026-10-11 — Revisão da Fase 4: sem cards, foto à direita e degradê preto
- **Contexto:** revisão do Erick: os cards do carrossel tampavam boa parte dos veículos (e diminuí-los ainda comprometeria a experiência); a maioria das fotos tem a frente do carro virada para a esquerda, onde ficam as informações. Ele escolheu manter a vitrine (um veículo por tela) com setas, em vez de rolagem vertical como no Cinerick.
- **Decisão:** removidos `CoverflowCarousel`, `VehicleCard` e a dependência `embla-carousel` (JS da página: ~10 kB → ~3 kB gzip). Novo `ShowcaseNav` (◀ #07 de 12 ▶) no centro da barra inferior (RANKING COMPLETO · navegação · redes). Controlador sem Embla: `go(i)` → `setActive`; swipe próprio por Pointer Events (toque/caneta, ≥ 50 px, horizontal dominante; vitrine com `touch-action: pan-y`); `.is-enhanced` agora na vitrine (setas só com JS). Brilho do Top 1 migrou do card para o **selo**: degradê com faixa de luz guardada fora do selo, animado via `background-position`. **Fundo:** desktop com a foto nos 70% da direita (`object-fit: cover`, recorte guiado pela altura — fica menor), preto sólido até 30% dissolvendo até ~60%, `--ambient` como brilho radial atrás do texto e degradê no topo para o menu; tablet e celular com a foto no topo (56svh, largura total) e as informações a partir de 46svh, abaixo do carro (a primeira versão do tablet com foto a 85% ainda cobria o carro). Testado no Chrome (capturas de tela voltaram a funcionar nesta aba): desktop 1536 px com a Ferrari 458 inteira à direita; tablet/celular sem rolagem horizontal; swipe esquerda/direita troca, gesto vertical é ignorado. **Pendências menores:** quando a linha de specs quebra, o separador aparece no início da 2ª linha; "RANKING COMPLETO" quebra em 2 linhas em telas muito estreitas.
- **Motivo:** visão dos veículos em primeiro lugar e legibilidade das informações.
- **Impacto:** `Showcase`, `ShowcaseBackdrop`, `ShowcaseNav` (novo), `RankBadge`, `src/scripts/showcase-controller.ts`, `package.json`, `CLAUDE.md`, `README.md`, `docs/01`, `docs/02`, `docs/04`, `docs/05`, `docs/08`.

### 2026-10-11 — Movimento reduzido e checklist de interação (fim da Fase 4)
- **Contexto:** última tarefa da Fase 4; checklist do `docs/05`.
- **Decisão / ajustes:** setas do carrossel escondidas sem JS (`.carousel:not(.is-enhanced)`; contador fica); `touch-action: pan-y pinch-zoom` no contêiner do Embla (recomendação dele para o swipe); com `prefers-reduced-motion` o encaixe pós-arraste do Embla usa `duration: 10` (padrão 25).
- **Resultado do checklist:** (1) teclado — ordem de Tab com 20 paradas e um único card (roving tabindex), ←/→ e Esc testados; Enter no card ativo não faz nada (já está ativo). (2) Leitor de tela — única região `aria-live="polite"` no `ShowcaseInfo`, um só `<h1>`, vitrine com `aria-roledescription`. (3) Hash — testado na tarefa própria. (4) Sem JS (iframe `sandbox` sem scripts) — último colocado visível com hero, faixa rolável com scroll-snap, lista com os 12, texto inteiro, ficha e menu funcionando. (5) Movimento reduzido — **verificado por revisão de código** (a ferramenta não emula a media query): crossfade 150 ms, sem zoom/deslocamento/faixa do Top 1, `scrollTo` com salto, Embla rápido, gaveta e ficha reduzidas, regra global para animações CSS; a preferência é lida na hora. (6) Celular 390 px — sem 3D, sem rolagem horizontal; swipe real não testável por automação. **Pendências conhecidas:** sem JS os cards continuam botões focáveis sem ação; o leitor de tela pode anunciar também o texto "Ler mais/Ler menos" (está dentro da região viva).
- **Impacto:** `CoverflowCarousel`, `src/scripts/showcase-controller.ts`.

### 2026-10-11 — Pré-carregamento dos vizinhos
- **Contexto:** sexta tarefa da Fase 4.
- **Decisão:** `preloadAround(i)` cria `new Image()` fora do DOM com o mesmo `srcset`/`sizes` do fundo (o navegador baixa a mesma variante que a troca usará) e pré-carrega o logo; cada índice uma vez só (`Set`). Na carga, só após `load` + `requestIdleCallback` (timeout 2 s; reserva `setTimeout`) para não disputar com o LCP; depois, a cada `setActive`. Não pré-carrega com `navigator.connection.saveData`. Testado (Resource Timing): na home, o hero do Taos chega após a ociosidade; ao ir para o Taos, chega o do Elantra e o do Lancer não é baixado de novo.
- **Motivo:** troca de fundo sem espera (`docs/05`).
- **Impacto:** `src/scripts/showcase-controller.ts`.

### 2026-10-11 — Tratamento especial do Top 1
- **Contexto:** quinta tarefa da Fase 4.
- **Decisão:** além do selo dourado "TOP 1" (já existente), o controlador liga `.is-top` na vitrine quando o Top 1 está ativo (contador em dourado) e anima uma faixa dourada (`[data-card-shine]`, renderizada só no card do Top 1, `mix-blend-mode: screen`) atravessando o card **uma vez por chegada** — 1,1 s, 250 ms de atraso para o card centralizar; também ao abrir direto pelo hash; desligada com `prefers-reduced-motion`. Card do Top 1 ativo ganha halo dourado (contorno + brilho de 28 px + a sombra de profundidade do ativo). **Bug achado no teste:** a regra do halo empatava em especificidade com a sombra do card ativo definida no `CoverflowCarousel` (cujo CSS vem depois) e perdia → seletor `.card.card--top[aria-current][data-card]`. Testado: `.is-top` liga/desliga, faixa roda ao abrir no Top 1 e ao voltar a ele, halo só no Top 1 ativo.
- **Motivo:** `docs/01` e `docs/04` (Top 1 com selo dourado e brilho).
- **Impacto:** `VehicleCard`, `Showcase`, `src/scripts/showcase-controller.ts`.

### 2026-10-11 — Hash na URL
- **Contexto:** quarta tarefa da Fase 4.
- **Decisão:** na carga, se o hash é o slug de um veículo do ranking, o Embla já nasce nele (`startIndex`) e `setActive(i, { instant: true })` troca fundo (na camada visível) e informações sem animação e **sem** `replaceState`. Trocas do usuário gravam `#slug` com `history.replaceState` (preserva `pathname` e `search`). `hashchange` com slug válido → `go(i)`; outros hashes (`#ranking`, `#conteudo`, inexistentes) são ignorados e seguem como âncora. Testado: `/esportivos#porsche-911` abre no 911 com a URL intacta; `/esportivos` continua sem hash; avançar grava `#audi-tt` sem aumentar o histórico nem disparar `hashchange`; `#ranking` só rola até a lista. **Limitação conhecida:** sem JS (ou antes do JS rodar) a vitrine mostra o último colocado e troca para o do hash em seguida, e o hero do último colocado é baixado à toa nesses acessos — aceitável por ser só em links compartilhados.
- **Motivo:** compartilhar um veículo específico (`docs/01`).
- **Impacto:** `src/scripts/showcase-controller.ts`.

### 2026-10-11 — Navegação: setas, teclado, contador e clique no card
- **Contexto:** terceira tarefa da Fase 4.
- **Decisão:** `go(i)` (limita às pontas; com movimento reduzido `scrollTo` pula sem animar), `next` = em direção ao #1. Clique no card chama `go(i)` direto — o Embla v8 não tem `clickAllowed()` (era da v7) e já cancela na captura o clique que encerra um arraste. Teclado ←/→ global com `preventDefault`, ignorando modificadores, campos de texto, `dialog[open]` e `:popover-open`. **Bug achado no teste:** clicar numa área vazia foca o `<main tabindex=-1>` e bloqueava as setas → `main` conta como "foco na página". Contador atualiza só o `<span data-counter-rank>` ("TOP 1" no primeiro); **bug visual:** o Astro compacta o HTML e juntava "#12de 12" → espaço explícito `{' '}`. Setas com `aria-disabled` nas pontas; roving tabindex nos cards, com o foco acompanhando a troca; listener que zera `scrollLeft` do viewport (o navegador pode rolar um contêiner com overflow escondido ao focar). Testado no Chrome com teclas reais e cliques via `element.click()` (cliques por coordenada não são confiáveis com a aba de automação em segundo plano).
- **Motivo:** `docs/05` (entradas da vitrine) com acessibilidade de teclado.
- **Impacto:** `src/scripts/showcase-controller.ts`, `CoverflowCarousel`, `docs/05`.

### 2026-10-11 — Troca de veículo: crossfade e informações escalonadas
- **Contexto:** segunda tarefa da Fase 4.
- **Decisão:** `setActive` atualiza cards, `--ambient` (registrada com `@property` como `<color>` para transitar em 400 ms), ficha técnica, fundo e informações. Fundo: carrega a foto na camada oculta (srcset/sizes/foco), espera `load` + `decode()` (com teto de 300 ms — **bug achado:** `decode()` fica pendente para sempre em abas ocultas, travando a troca), faz crossfade por CSS (opacity 400 ms) e zoom 1,04→1 por Web Animations. Informações: saída (fade + -8 px, 180 ms) → `render` → entrada escalonada (logo → nome → specs → texto → botões; +12 px, 400 ms, 60 ms entre itens). `prefers-reduced-motion`: crossfade 150 ms, sem zoom/deslocamento, informações só com fade curto. Trocas rápidas: um `token` descarta etapas de trocas antigas (testado: três trocas seguidas terminam no último veículo, fundo e texto juntos). Para manter o escopo de estilo do Astro, o JS não cria elementos estilizados do zero: o `SpecRow` renderiza sempre os slots (ano + 2 specs, vazios com `hidden`; separador via `li:not([hidden]) ~ li:not([hidden])`) e a ficha clona um `<template>` do próprio componente. Novo `scripts/reduced-motion.ts`. Em desenvolvimento o controlador fica em `window.__showcase` (removido do build de produção) para testes pelo console.
- **Motivo:** movimento do `docs/04` com troca robusta.
- **Impacto:** `src/scripts/{showcase-controller,reduced-motion}.ts`, `SpecRow`, `SpecSheet`, `ShowcaseBackdrop`, `Showcase`, `global.css`.

### 2026-10-11 — `showcase-controller.ts`: Embla + coverflow
- **Contexto:** primeira tarefa da Fase 4 (branch `fase-4-vitrine-interativa`, que também recebeu o commit de conteúdo real).
- **Decisão:** classe `ShowcaseController` (`src/scripts/showcase-controller.ts`) iniciada pelo `<script>` do `Showcase`; lê o JSON `#showcase-data` (gerado por `lib/showcase-data.ts`, com hero responsivo e logo dimensionado de cada veículo; `getBrandLogo` virou função de `lib/images.ts` usada também pelo `BrandLogo`). Embla `loop: false`, `align: center`, `containScroll: false`, `startIndex` = índice ativo; a classe `.is-enhanced` troca a faixa rolável (sem JS) pelo Embla. Coverflow contínuo por variáveis CSS calculadas por interpolação da tabela do `docs/04` a cada quadro (rAF agrupando eventos `scroll`). **Bug achado:** a margem negativa dos slides (sobreposição) deslocava o centro calculado pelo Embla em 24 px → no modo com JS os slides ficam sem margem e a sobreposição vem de `--cf-shift`, calculado a partir da largura real e das escalas (`packedOffset`): sobreposição uniforme de 6% da largura (medido: 11 px entre todos os pares, card ativo centralizado com desvio 0). `setActive` por enquanto só atualiza `aria-current` e `data-distance` (fundo/info na próxima tarefa). JS total da página: ~8 kB gzip.
- **Motivo:** fidelidade à referência com o Embla alinhando corretamente.
- **Impacto:** `src/scripts/showcase-controller.ts`, `src/lib/{showcase-data,images}.ts`, `Showcase`, `CoverflowCarousel`, `BrandLogo`, `docs/05`.

### 2026-10-11 — Veículos reais substituem os placeholders
- **Contexto:** o Erick entregou `docs/carros-favoritos.md` (34 veículos: 10 populares, 12 esportivos, 5 antigos, 7 motos), 30 logos PNG e uma foto por veículo; o texto "por que eu gosto" ainda será escrito.
- **Decisão:** 19 marcas e 34 veículos gerados só com os dados informados (nome, posição, ano, versão; "AWD" do Seal → `drivetrain`). `powertrain` (obrigatório): Seal elétrico, demais combustão — **Ford Maverick 2024 Lariat** fica com `# TODO`, pois a linha tem versão a combustão (2.0 EcoBoost) e híbrida e o Erick não especificou. Corpo com `TODO: escreva por que você gosta deste veículo.` e `<!-- TODO: confirmar ficha técnica -->`. Placeholders `_exemplo-*` e marca `exemplo` removidos (as imagens de `_placeholder/` ficam para o `/novo-veiculo`). **Schema:** `year` opcional (motos e Lancer sem ano; a UI omite), novo `version` (vai para a ficha e substitui motor/cilindrada na linha principal quando eles faltam), novo `logoTreatment` (`white` | `original`) nas marcas. **Imagens:** uma foto por veículo em `src/assets/vehicles/<nome>.<ext>` (JPG/PNG/WebP/AVIF), usada em `heroImage` e `cardImage`; o card também usa `heroFocus`. Focos ajustados para fotos altas/quadradas (Fat Boy, Fat Bob, Trident 660, Taos, Opala, Passat, Charger, Fusca, Bonneville). srcset passa a incluir a largura original quando ela fica entre degraus (fotos de 1200 px não ficam presas a 640). **Logos:** margens transparentes cortadas (originais preservados fora do repo), `BYD.png` → `byd.png`, servidos otimizados (WebP na altura ×2, antes iam os PNG originais de até 736 kB); largura máxima 4,5× a altura base; `logoTreatment: original` para Ford, Lamborghini, Ferrari, BMW, Harley-Davidson e Triumph (o filtro os transformava em formas sólidas); `honda.png` em vez de `honda.svg` (que tem fundo branco). `logoScale` inicial maior para emblemas altos/quadrados. Logos sem uso (Fiat, Jeep, Kia, Land Rover, Maserati, Mazda, Mercedes-Benz, Nissan, Subaru, Toyota) ficam na pasta, também aparados.
- **Motivo:** conteúdo real para a Fase 4 em diante sem inventar dados (regras 3 e 4).
- **Impacto:** `src/content/**`, `src/content.config.ts`, `src/lib/{rankings,images}.ts`, `BrandLogo`, `SpecRow`, `VehicleCard`, `src/assets/brands/`, `docs/02`, `docs/03`, `docs/06`, `README.md`, `/novo-veiculo`.

### 2026-10-10 — `SpecSheet` com `<dialog>` e Invoker Commands
- **Contexto:** última tarefa da Fase 3.
- **Decisão:** `<dialog id="spec-sheet" closedby="any">` aberto pelo botão FICHA TÉCNICA com `command="show-modal" commandfor="spec-sheet"` (zero JS); fechar por `<form method="dialog">`, Esc nativo e clique fora. Script mínimo: reserva de clique no backdrop se `closedBy` não existir, e devolução de foco ao invocador. **Bug achado no teste:** com a animação de saída (`transition-behavior: allow-discrete`), o `<dialog>` segue renderizado ~250 ms com o foco no botão Fechar e depois o foco cai no `body` — então, no `close`, se o foco estiver no `body` **ou dentro do diálogo**, ele volta ao invocador (após `setTimeout`). Testado no Chrome: abrir sem JS, fechar por botão/Esc/clique real fora, foco de volta ao botão nos três casos; grade de 2 colunas. Specs em `<dl>` (label muted, valor Rajdhani 600). Animação fade + escala 0,97, reduzida em `prefers-reduced-motion`.
- **Motivo:** acessibilidade e progressive enhancement, mesmo padrão do menu mobile.
- **Impacto:** `src/components/showcase/{SpecSheet,ShowcaseInfo,Showcase}.astro`, `docs/05`.

### 2026-10-10 — Layout responsivo da vitrine
- **Contexto:** quarta tarefa da Fase 3. Medido por script em iframes (as capturas do Chrome falham com a aba em segundo plano), com um texto de ~500 caracteres.
- **Decisão:** `Showcase` = área principal (info + carrossel) + barra inferior ("RANKING COMPLETO" com ícone circular → `#ranking`, e `SocialLinks`). Desktop: 12 colunas (info 1–5, carrossel 7–12). Tablet: info em cima, carrossel abaixo. Celular: imagem limitada a 72svh no topo, info e faixa de cards sobre o degradê; cards de 6,75rem sem escala/desfoque (só escurecidos; ativo com contorno accent); painel sem moldura; redes ocultas (já estão no rodapé). Nome do modelo limitado a `min(--text-display, 10svh)` (2,5rem no celular). "Ler mais": script em `ShowcaseInfo` corta em 4 linhas só no celular e só se houver excesso (sem JS, texto inteiro); reavalia no evento `showcase:content-change`, que o controlador da Fase 4 deve disparar. **Bugs achados e corrigidos:** (1) `BrandLogo` crescia para ~225px porque o reset do Tailwind aplica `height: auto` em `img` e o SVG não tem tamanho intrínseco → altura fixa via `style`; (2) itens do grid sem `min-width: 0` deixavam a faixa do carrossel alargar a coluna no celular; (3) regras de componente com `.backdrop > *` ganham especificidade extra pelo escopo do Astro — media queries precisam de seletores equivalentes. Resultado: cabe em 100svh em 1440×900, 1366×768, 768×1024 e 390×844; cresce em telas muito baixas (1536×695: +31px; 375×667: +164px), o que o `min-height` permite.
- **Motivo:** fidelidade ao `docs/04` sem esconder conteúdo.
- **Impacto:** `src/components/showcase/{Showcase,ShowcaseInfo,ShowcaseBackdrop,CoverflowCarousel,BrandLogo}.astro`, `src/lib/images.ts`, ícone `arrow-down-circle.svg`.

### 2026-10-10 — `CoverflowCarousel` e `VehicleCard` estáticos
- **Contexto:** terceira tarefa da Fase 3 (sem JS). Fase 2 mergeada na `main` com push (confirmado pelo Erick).
- **Decisão:** markup no formato do Embla (`viewport > ul container > li slides`). Sem JS o viewport é uma faixa com `overflow-x: auto` + `scroll-snap`; a Fase 4 adiciona `.is-enhanced` (overflow escondido). Coverflow estático por `data-distance` (0, 1, 2+) calculado no servidor: escala 1 / 0,85 / 0,7, `brightness` 1 / 0,5 / 0,35, blur 0 / 1 / 1,5 px; slides com margem negativa para leve sobreposição; `padding-inline: calc(50% - card/2)` permite centralizar o primeiro e o último. Cards em AVIF 320/640 (`getCardImage`), lazy só a mais de 3 posições do ativo. `VehicleCard`: `<button>` com `aria-label` "#04 — Marca Modelo" ("Top 1 — …" no primeiro), `aria-current` no ativo, número translúcido (dourado no Top 1, com contorno dourado sutil). Contador `#05 de 5` e setas com `aria-label` Anterior/Próximo (sem ação até a Fase 4). Grade provisória: info colunas 1–5, carrossel 7–12 a partir de 1024 px. Verificado por script no Chrome (capturas falham com a aba em segundo plano).
- **Motivo:** fidelidade à referência sem JS; Fase 4 só liga o comportamento.
- **Impacto:** `src/components/showcase/{CoverflowCarousel,VehicleCard,Showcase}.astro`, `src/lib/images.ts`, ícones `chevron-left/right.svg`.

### 2026-10-10 — `ShowcaseInfo` e componentes de base
- **Contexto:** segunda tarefa da Fase 3.
- **Decisão:** `ui/Button.astro` (primary = accent + texto escuro; secondary = superfície + borda) vira `<a>` sempre que recebe `href` (mesmo vazio) — o botão VÍDEO é sempre link, escondido com `hidden` quando não há `videoUrl`, para a Fase 4 só trocar `href`/`hidden`. `BrandLogo` usa `filter: brightness(0) invert(.96) sepia(.08)` (branco levemente creme) e calcula largura pela proporção do SVG. `RankBadge`: texto visual (`#05`/`TOP 1`) com `aria-hidden` + texto `sr-only` ("Posição 5"/"Top 1") — `aria-label` em `<span>` genérico não é válido. `SpecRow` em Rajdhani 600 com separadores de 1px via `::before`. Ícones novos: `play.svg`, `specs.svg`. Botão FICHA TÉCNICA (`data-open-specs`) ainda sem ação até a tarefa do `SpecSheet`. Atributos `data-*` (`data-info-name`, `data-info-body`, `data-info-video`, `data-brand-logo`, `data-spec-row`) servem de ganchos para o controlador da Fase 4.
- **Motivo:** acessibilidade e preparação para a troca de veículo por JS sem mudar markup.
- **Impacto:** `src/components/ui/Button.astro`, `src/components/showcase/{ShowcaseInfo,BrandLogo,RankBadge,SpecRow,Showcase}.astro`, `src/assets/icons/{play,specs}.svg`.

### 2026-10-10 — `ShowcaseBackdrop` e esqueleto do `Showcase`
- **Contexto:** primeira tarefa da Fase 3. A Fase 2 ainda não foi mergeada (sem confirmação do Erick), então `fase-3-vitrine-estatica` saiu de `fase-2-layout`.
- **Decisão:** hero **só em AVIF** (640/1280/1920) via `lib/images.ts → getHeroImage` — os navegadores-alvo suportam AVIF e uma `<img>` com `srcset` simplifica a troca por JS na Fase 4 (um `<picture>` exigiria trocar várias `<source>`). Camada B começa com a mesma URL da A (vem do cache). Camadas conforme `docs/04`, com fallback sem `color-mix` via `@supports`; no celular o degradê inferior é reforçado (info sobre a parte de baixo). `Showcase` define `--ambient` inline, abre no último colocado e tem o `<h1>` estático (`sr-only`). A lista temporária virou `<section id="ranking">` com `<h2>`. Verificação visual no Chrome não foi possível (capturas travando); fica para a revisão do Erick no fim da fase.
- **Motivo:** desempenho (LCP) e simplicidade da troca de imagem.
- **Impacto:** `src/lib/images.ts`, `src/components/showcase/{Showcase,ShowcaseBackdrop}.astro`, páginas de ranking, `RankingPagePlaceholder`, `docs/05`.

### 2026-10-10 — Rotas da Fase 2 e revisão visual
- **Contexto:** última tarefa da Fase 2 + conferência no navegador (preview, iframes de 390 e 768 px; desktop 1440 px).
- **Decisão:** `RANKING_SEO` (título e descrição por ranking) em `lib/rankings.ts`. Páginas `index`, `[category]` (esportivos/antigos) e `motos` usam o componente temporário `RankingPagePlaceholder` (h1 com o nome do ranking + lista simples) — chamar `getRanking` ali reativa a validação no build; ele será substituído pela vitrine na Fase 3. `404.astro` básica ("Saiu da pista." + "Voltar para a garagem", botão accent com texto escuro). Bugs achados na revisão e corrigidos: (1) no celular o botão de menu caía na coluna do meio do grid do header (o `Nav` some) → `col-start-3`; (2) `inline-flex` no link do rodapé engolia o espaço antes do travessão e espremia o texto no tablet → link `inline-block` com padding e rodapé em linha só a partir de `lg`. Observação: abas de automação em segundo plano não disparam `scroll`/rAF, então o fundo do header ao rolar foi confirmado só visualmente.
- **Motivo:** navegação completa entre as páginas antes da vitrine; layout responsivo correto.
- **Impacto:** `src/pages/{index,[category],motos,404}.astro`, `src/components/ranking/RankingPagePlaceholder.astro`, `lib/rankings.ts`, `Header.astro`, `Footer.astro`.

### 2026-10-10 — Redes sociais: Instagram, LinkedIn e GitHub
- **Contexto:** pedido do Erick após a tarefa do rodapé.
- **Decisão:** removidos YouTube e Behance (ícones, `SITE.links` e docs); adicionado LinkedIn (`https://www.linkedin.com/in/ericklarssen/`), ícone adaptado da Lucide. Ordem: Instagram, LinkedIn, GitHub. O YouTube continua só como destino do `videoUrl` dos veículos.
- **Motivo:** preferência do Erick.
- **Impacto:** `src/lib/site.ts`, `SocialLinks.astro`, `src/assets/icons/`, `docs/01`, `docs/05`, `docs/06`.

### 2026-10-10 — `Footer` e `SocialLinks`
- **Contexto:** quarta tarefa da Fase 2.
- **Decisão:** ícones de Instagram, YouTube e GitHub adaptados da biblioteca **Lucide** (licença ISC, só os paths copiados — sem dependência); Behance desenhado à mão no mesmo estilo linear. `SocialLinks` aceita `class` para ser reutilizado na vitrine. Rodapé: nome + descrição, links Cinerick ("meus filmes favoritos") e Portfólio ("ericksilva.dev"), redes e `© ano autor`. Todos os externos com `target="_blank" rel="noopener"` e `aria-label` que começa pelo texto visível + "(abre em nova aba)". Alvos de toque de 44px.
- **Motivo:** sem dependência de ícones; acessibilidade (`docs/07`).
- **Impacto:** `src/components/layout/{Footer,SocialLinks}.astro`, `src/assets/icons/{instagram,youtube,github,behance}.svg`, `BaseLayout`.

### 2026-10-10 — Menu mobile com Popover API
- **Contexto:** gaveta mobile acessível; o site deve navegar sem JS e com < 40 kB de JS.
- **Decisão:** `MobileMenu.astro` usa `popover="auto"` + `popovertarget` (zero JS): Esc, clique fora e `aria-expanded` nativos; animação com `@starting-style` + `transition-behavior: allow-discrete`, reduzida em `prefers-reduced-motion`. `Nav` ganhou `variant="bar" | "drawer"`. Sem trava de rolagem do fundo (popover não é modal) — aceitável para um menu de 4 itens. **Armadilha registrada:** estilos de `<style>` de componente ficam fora das camadas do Tailwind v4 e vencem utilitários (ex.: `sm:hidden` perde para um `display` do componente); breakpoints de elementos com `display` próprio vão em media query dentro do componente.
- **Motivo:** acessibilidade e progressive enhancement sem custo de JS; suporte nas 2 últimas versões dos navegadores-alvo.
- **Impacto:** `src/components/layout/{MobileMenu,Nav,Header}.astro`, `src/assets/icons/{menu,close}.svg`, `docs/05`.

### 2026-10-10 — `Header` e `Nav`
- **Contexto:** segunda tarefa da Fase 2.
- **Decisão:** ícones SVG importados como componente (recurso nativo do Astro 7: `import Icon from '@/assets/icons/x.svg'`), traço 1,75px em `currentColor`; ícone próprio `motorcycle.svg`. Itens e rotas do menu vêm de `RANKING_LABELS`/`RANKING_ROUTES`. Altura do header em `--header-h` (4,5rem, no `:root`); conteúdo que não é a vitrine compensa com padding. Header ganha `data-scrolled` quando `scrollY > 8` (listener passivo + rAF), com fundo `rgb(7 9 12 / .75)` + blur e fallback sólido via `@supports`. Nav fica oculta abaixo de 640px até a tarefa do menu mobile. Alvos de toque com 44px de altura.
- **Motivo:** sem dependência de ícones; dados de navegação numa fonte única.
- **Impacto:** `src/components/layout/{Header,Nav}.astro`, `src/assets/icons/motorcycle.svg`, `BaseLayout`, `global.css`.

### 2026-10-10 — `BaseLayout` e contraste do accent
- **Contexto:** primeira tarefa da Fase 2. Ao estilizar o link "Pular para o conteúdo", o contraste de **branco sobre `--color-accent` deu 3,56:1** (3,10:1 no hover) — abaixo do 4,5:1 exigido pelo `docs/07` para texto normal.
- **Decisão:** `title` recebe só o título da página e o layout acrescenta ` | Garagerick`; `activeNav` é opcional; `ogImage` opcional (sem imagem → `twitter:card=summary`, sem `og:image` até a Fase 7). Canonical a partir de `Astro.site`. Link "pular" usa texto `--color-bg` sobre accent (5,60:1). **Resolvido pelo Erick (opção 1):** o botão primário usa texto/ícone `--color-bg` sobre o accent; o accent não muda. Vale para todo texto sobre `--color-accent` (ex.: `RankBadge`).
- **Motivo:** meta de acessibilidade do `docs/07`.
- **Impacto:** `src/layouts/BaseLayout.astro`, `src/pages/index.astro`, `docs/05`.

### 2026-10-10 — Validação de rankings testada
- **Contexto:** tarefa de teste da Fase 1.
- **Decisão:** testados (e desfeitos) três cenários: rank duplicado (`posição 3 repetida (...)` + `posição 4 ausente`), marca inexistente e mesmo slug em carros e motos — todos quebram o build com mensagem acionável. O Astro 7 também acusa referência inválida (`Invalid content reference`) antes da nossa validação; mantemos a nossa por dar contexto do ranking. Sem framework de testes (não previsto em `docs/02`).
- **Motivo:** garantir que o build é a rede de segurança do ranking.
- **Impacto:** nenhum arquivo de código.

### 2026-10-10 — Núcleo de dados (`format`, `validate-rankings`, `rankings`)
- **Contexto:** implementação do contrato de `docs/03`.
- **Decisão:** `validateRankings` é uma função pura (recebe refs e ids de marcas), reúne **todas** as violações e lança um único erro; mensagens no formato `posição N repetida/ausente/fora do intervalo`. `rankings.ts` carrega e valida o catálogo uma vez por build (memoizado), já que a regra de slug único é global. `RankedVehicle` ganhou `ranking`; `rankings.ts` exporta `RANKING_KEYS`, `RANKING_ROUTES` e `RANKING_LABELS`. `body` remove comentários HTML (o `<!-- TODO -->` não vaza para a UI/JSON). Fallback de `ambientColor` = `var(--color-ambient-default)`. Página `/debug` (noindex) criada já nesta tarefa porque a validação só roda quando uma página chama `getRanking`.
- **Motivo:** erros acionáveis de uma vez só; fonte única de rotas/rótulos.
- **Impacto:** `src/lib/*.ts`, `src/pages/debug.astro`, `docs/03`.

### 2026-10-10 — BYD Seal e VW Nivus com dados mínimos
- **Contexto:** regra 3 (não inventar ficha técnica), mas o schema exige `year`, `powertrain`, imagens e um logo existente para a marca.
- **Decisão:** preenchidos só fatos independentes de versão: `powertrain` (Seal elétrico, Nivus combustão), `bodyStyle` (Sedã, SUV cupê) e `country` das marcas. `year: 2024` em ambos com comentário `# TODO: confirmar ano-modelo` (campo obrigatório). Demais specs vazias + `<!-- TODO: confirmar ficha técnica -->` no corpo. Imagens apontam para `_placeholder/` (comentário indica o caminho final). `byd.svg` e `volkswagen.svg` são cópias do logo placeholder com comentário `PLACEHOLDER` — basta sobrescrever o arquivo pelo logo oficial. `ambientColor` vazio (usa o padrão) até o Erick escolher.
- **Motivo:** o build precisa de dados válidos sem inventar números de versão específica.
- **Impacto:** `src/content/cars/byd-seal.md`, `src/content/cars/volkswagen-nivus.md`, `src/content/brands/{byd,volkswagen}.json`, `src/assets/brands/{byd,volkswagen}.svg`.

### 2026-10-10 — Placeholders da Fase 1
- **Contexto:** `docs/06` pede marca `exemplo`, imagens placeholder e itens de exemplo.
- **Decisão:** imagens em **PNG** (não SVG), geradas por um script Node sem dependências (só `zlib`); 5 tons, um por posição. Populares recebe só #3–#5 (BYD Seal e VW Nivus ocupam #1 e #2 na tarefa seguinte); demais listas #1–#5. Specs fictícias e variadas (elétrico, híbrido, combustão, moto, item sem specs), com comentário `# PLACEHOLDER` no frontmatter. Corpo usa o `TODO` da regra 4. Confirmado na prática: ids preservam o `_` (`_exemplo-esportivos-2`). Teste negativo: `ambientColor` inválido derruba o `astro sync` com mensagem clara.
- **Motivo:** o Astro não rasteriza SVG para AVIF/WebP, e a vitrine precisa testar o pipeline real de imagens; specs variadas permitem testar a linha de `quickSpecs` e a omissão de campos.
- **Impacto:** `src/assets/brands/exemplo.svg`, `src/assets/vehicles/_placeholder/`, `src/content/**/_exemplo-*`, `src/content/brands/exemplo.json`, `docs/06`.

### 2026-10-10 — Content collections no Astro 7 (Zod 4)
- **Contexto:** o Astro 7 usa Zod 4; `import { z } from 'astro:content'` está obsoleto (sai no Astro 8) e `z.string().url()` virou `z.url()`.
- **Decisão:** `z` de `astro/zod`, `glob` de `astro/loaders`; `vehicleBase` tipado com `SchemaContext`. Verificado no código do loader: o glob **não** ignora arquivos com `_`, e o id usa `github-slugger`, que preserva o `_` (`_exemplo-3.md` → id `_exemplo-3`) — confirmação prática na tarefa de placeholders.
- **Motivo:** APIs atuais, sem avisos de obsolescência.
- **Impacto:** `src/content.config.ts`, `docs/03`.

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
