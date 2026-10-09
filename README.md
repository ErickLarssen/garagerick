# Garagerick

Meus carros e motos favoritos em contagem regressiva até o Top 1.
Projeto irmão do [Cinerick](https://cinerick.online).

## Desenvolvimento com o Claude Code

1. Abra a pasta no VS Code, abra o terminal integrado e rode `claude`.
2. Rode **`/proxima-tarefa`** — repita até o fim de cada fase (o agente cria a branch da fase,
   commita cada tarefa e pede confirmação antes de merge/push).
3. Para adicionar veículos: **`/novo-veiculo Porsche 911 esportivos 3`**.

## Comandos

```bash
npm install
npm run dev       # http://localhost:4321
npm run build
npm run check
```

## Onde fica cada coisa

- Veículos: `src/content/cars/` e `src/content/motorcycles/`
- Marcas: `src/content/brands/` (+ logos em `src/assets/brands/`)
- Imagens: `src/assets/vehicles/<slug>/hero.jpg` e `card.jpg`
- Documentação completa: `docs/`
