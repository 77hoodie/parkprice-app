# Alinhamento com laudas e guia inicial

Este documento registra a aderência técnica do ParkPrice AI às duas atividades.

## Parte 1 — Opção B

A escolha é **Opção B: aplicação ou produto baseado em controle fuzzy**.

Aderência:

- problema realista: precificação dinâmica de estacionamentos;
- público-alvo: administradores e gestores de estacionamentos;
- decisão apoiada: recomendar multiplicador sobre tarifa-base;
- solução apresentada como produto web;
- modelo fuzzy Mamdani;
- 4 entradas e 1 saída;
- funções de pertinência visualizadas;
- 18 regras fuzzy;
- cenários baixos, médios, críticos e conflitantes;
- simulação e análise de sensibilidade;
- documentação e execução reproduzível.

## Ampliação por 5 integrantes na Parte 1

A trilha mais coerente é **Ampliação técnica do modelo**.

O sistema atende essa ampliação porque possui:

- mínimo de 3 entradas: usa 4;
- mínimo de 18 regras: usa 18;
- mínimo de 12 cenários: usa 12;
- análise de sensibilidade de variável fuzzy.

Também há características de produto ampliado, como interface mais completa, exportação de resultados e perfis de acesso.

## Parte 2 — Opção 2 com Algoritmo Genético

A escolha é **Opção 2: protótipo de programa com IA Evolutiva e Computação Bioinspirada**, usando **Algoritmo Genético**.

Aderência:

- problema formulado como otimização de parâmetros;
- solução candidata representada por vetor de pesos das regras;
- população de indivíduos;
- função de aptidão;
- restrições nos pesos;
- seleção, crossover, mutação e elitismo;
- parâmetros editáveis;
- critério de parada por número de gerações;
- comparação com tarifa fixa, heurística simples e fuzzy manual;
- execuções independentes com sementes distintas;
- curva de convergência;
- tempo de execução e número de avaliações;
- análise de limitações e sensibilidade.

## Ampliação por 5 integrantes na Parte 2

A trilha mais coerente é **Análise experimental ampliada**.

O sistema atende porque varia quatro parâmetros relevantes:

- tamanho da população;
- número de gerações;
- probabilidade de crossover;
- probabilidade de mutação.

A interface apresenta impactos em aptidão, tempo e número de avaliações.

## Pontuação extra possível

A integração fuzzy-evolutiva também ajuda na pontuação extra, pois o Algoritmo Genético ajusta parâmetros do modelo fuzzy e permite comparação antes/depois.

Para defender isso, a equipe deve explicar que:

- o fuzzy é o motor de decisão interpretável;
- o AG não substitui o fuzzy;
- o AG calibra pesos das regras para melhorar a função de aptidão;
- a melhoria é analisada por comparação e não apenas assumida.
