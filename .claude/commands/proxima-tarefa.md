---
description: Executa a próxima tarefa pendente do roadmap seguindo os docs do projeto
argument-hint: (opcional) número da fase para focar
---

Execute a próxima tarefa do Garagerick. Foco opcional: $ARGUMENTS

1. Leia `CLAUDE.md` e `docs/08-roadmap.md`.
2. Encontre a primeira tarefa `[ ]` (da fase indicada, se houver). Diga em uma linha qual é.
   Se for a primeira tarefa de uma fase, crie a branch `fase-N-nome` a partir da `main` (`docs/07`).
3. Leia os docs relevantes para ela (mapa no `CLAUDE.md`) antes de escrever código.
4. Implemente com mudanças pequenas e focadas.
5. Cumpra a definição de "pronto" de `docs/07` (`npm run check` e `npm run build` passando).
6. Marque `[x]` no roadmap, registre decisões novas em `docs/decisoes.md`, atualize docs afetados e faça o commit
   (Conventional Commits em português). Não faça push nem merge sem confirmação.
7. Se a tarefa encerrou uma fase com 🛑, **pare** e peça revisão ao Erick, resumindo o que mudou e como testar.
   Ao fim de qualquer fase, ofereça o merge na `main` e o push.
   Caso contrário, informe a próxima tarefa e pergunte se deve continuar.
