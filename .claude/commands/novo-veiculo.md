---
description: Adiciona um carro ou moto a um ranking, criando arquivos e ajustando posições
argument-hint: <marca e modelo> <lista: populares|esportivos|antigos|motos> <posição>
---

Adicione um novo veículo ao Garagerick. Argumentos: $ARGUMENTS

Siga `docs/03-modelo-de-dados.md` e `docs/06-conteudo-e-assets.md`.

1. Interprete marca, modelo, lista e posição. Se algum faltar ou estiver ambíguo, pergunte antes de criar qualquer arquivo.
2. Gere o slug (`marca-modelo` em kebab-case, sem acentos).
3. Marca:
   - Se `src/content/brands/<marca>.json` não existir, crie-o e avise que falta o logo em `src/assets/brands/<marca>.svg`.
4. Imagens:
   - Crie `src/assets/vehicles/<slug>/` e verifique se `hero.jpg` e `card.jpg` existem.
   - Se não existirem, use temporariamente as imagens de `_placeholder/` e liste as pendências no final.
5. Crie o arquivo do veículo (`src/content/cars/` ou `src/content/motorcycles/`):
   - Preencha só os dados que o Erick informou. Fichas técnicas desconhecidas ficam vazias com `<!-- TODO: confirmar ficha técnica -->`.
   - Corpo: `TODO: escreva por que você gosta deste veículo.` (a menos que o Erick tenha mandado o texto).
6. Ranking: se a posição já estiver ocupada, **desloque** os itens da mesma lista (posição ≥ nova → +1). Mostre a nova ordem completa.
7. Rode `npm run build` e corrija o que quebrar.
8. Resuma: arquivos criados/alterados, nova ordem da lista e pendências (logo, imagens, ficha, texto).
9. Commit: `content(<lista>): adiciona <Marca Modelo> em #<posição>`.
