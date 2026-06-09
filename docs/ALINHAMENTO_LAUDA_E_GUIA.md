# Alinhamento com laudas e guia — Sprint 2

## Parte 1 — Sistemas de Controle Fuzzy, Opção B

A Sprint 2 mantém o projeto como aplicação/produto de mercado baseado em controle fuzzy.

Evidências implementadas:

- problema realista: precificação dinâmica de estacionamentos;
- público-alvo: administradores de estacionamentos privados, shoppings, faculdades, hospitais e centros comerciais;
- decisão apoiada: recomendação de tarifa/multiplicador;
- protótipo funcional em React + FastAPI;
- 4 entradas fuzzy;
- 1 saída fuzzy;
- funções de pertinência em gráficos;
- 18 regras;
- cenários de teste;
- análise de sensibilidade;
- documentação e execução.

## Equipe com 5 integrantes — Parte 1

A Sprint 2 favorece a trilha de ampliação técnica e validação ampliada:

- no mínimo 3 entradas: o projeto usa 4;
- pelo menos 18 regras: o projeto usa 18;
- no mínimo 12 cenários: o projeto usa 12;
- análise de sensibilidade: implementada em `/analysis/fuzzy-sensitivity`.

## Parte 2 — IA Evolutiva e Computação Bioinspirada, Opção 2

Evidências implementadas:

- protótipo executável;
- motor evolutivo integrado ao produto;
- representação de solução como vetor de pesos das regras;
- função de aptidão com receita e penalidades;
- restrições por limites de peso e multiplicador;
- parâmetros do algoritmo;
- operadores evolutivos;
- critério de parada por gerações;
- comparação com tarifa fixa, heurística simples e fuzzy manual;
- 5 execuções independentes;
- curva de convergência;
- tempo de execução e avaliações.

## Equipe com 5 integrantes — Parte 2

A Sprint 2 favorece a trilha de análise experimental ampliada:

- variação de população;
- variação de gerações;
- variação de crossover;
- variação de mutação;
- discussão de impacto em fitness, tempo e avaliações.

Endpoint relacionado:

```text
POST /analysis/parameter-sensitivity
```

## Guia inicial ParkPrice AI

A Sprint 2 segue o guia nos pontos principais:

- fuzzy interpreta variáveis graduais;
- AG otimiza parâmetros do fuzzy;
- saída é multiplicador sobre tarifa-base;
- objetivo equilibra receita, ocupação, rotatividade e justiça tarifária;
- comparação inclui tarifa fixa, heurística simples, fuzzy manual e fuzzy otimizado;
- paleta visual em preto, branco e tons de cinza.

## Pontos ainda pendentes para versão final

- Transformar resultados exportados em tabelas/figuras no PDF técnico.
- Preparar slides objetivos.
- Inserir declaração de uso de IA.
- Revisar referências.
- Garantir que todos os integrantes saibam executar e explicar o projeto.
- Confirmar autorização da equipe com 5 integrantes.
