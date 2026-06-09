# API — ParkPrice AI Sprint 2

A API foi implementada em FastAPI e concentra todos os cálculos pesados: inferência fuzzy, simulação, otimização evolutiva e análises experimentais.

Base local padrão:

```text
http://localhost:8000
```

Documentação interativa:

```text
http://localhost:8000/docs
```

## GET /health

Verifica se a API está ativa.

Resposta esperada:

```json
{"status":"ok","sprint":"2"}
```

## GET /rules

Retorna as 18 regras fuzzy.

Uso na apresentação:

- comprovar base de regras;
- explicar regras normais, críticas e conflitantes;
- relacionar regras ativadas com a recomendação.

## GET /membership-functions

Retorna pontos das funções de pertinência para os gráficos.

Variáveis:

- `occupancy`;
- `demand`;
- `event`;
- `stay`;
- `multiplier`.

## GET /scenarios

Retorna os 12 cenários sintéticos controlados cadastrados em `backend/data/sample_scenarios.csv`.

## POST /recommend

Calcula recomendação fuzzy para uma entrada operacional.

Payload:

```json
{
  "base_rate": 8.0,
  "occupancy": 90,
  "demand": 8.5,
  "event_level": 8.0,
  "avg_stay_minutes": 150
}
```

Retorna:

- multiplicador;
- classificação linguística;
- tarifa recomendada;
- memberships das entradas;
- regras ativadas;
- curva agregada de saída;
- explicação em linguagem operacional.

## POST /simulate

Compara estratégias em cenários sintéticos.

Payload sem pesos:

```json
{}
```

Payload com pesos otimizados:

```json
{
  "optimized_rule_weights": [1.0, 1.1, 0.9]
}
```

Estratégias comparadas:

- tarifa fixa;
- heurística simples;
- fuzzy manual;
- fuzzy otimizado, quando houver pesos.

## POST /optimize

Executa Algoritmo Genético para otimizar pesos das regras fuzzy.

Payload:

```json
{
  "population_size": 32,
  "generations": 30,
  "seed": 42,
  "crossover_probability": 0.72,
  "mutation_probability": 0.28
}
```

Retorna:

- melhor vetor de pesos;
- melhor fitness;
- histórico de convergência;
- comparação com fuzzy otimizado;
- parâmetros usados;
- desempenho computacional.

## POST /experiments/run-5-seeds

Executa o AG com pelo menos 5 sementes distintas.

Payload:

```json
{
  "population_size": 32,
  "generations": 30,
  "seed": 42,
  "crossover_probability": 0.72,
  "mutation_probability": 0.28,
  "seeds": [7, 21, 42, 84, 126]
}
```

Retorna:

- melhor fitness;
- média;
- desvio-padrão;
- pior fitness;
- tempo médio;
- avaliações médias;
- melhor execução.

## POST /analysis/fuzzy-sensitivity

Varia uma entrada fuzzy por vez e mantém as demais fixas.

Payload:

```json
{
  "variable": "occupancy",
  "steps": 31,
  "base_input": {
    "base_rate": 8.0,
    "occupancy": 72,
    "demand": 6.5,
    "event_level": 4,
    "avg_stay_minutes": 90
  },
  "optimized_rule_weights": null
}
```

Variáveis aceitas:

- `occupancy`;
- `demand`;
- `event_level`;
- `avg_stay_minutes`.

Uso na apresentação:

- demonstrar sensibilidade;
- explicar coerência da resposta fuzzy;
- discutir limites do modelo.

## POST /analysis/parameter-sensitivity

Executa estudo experimental inicial variando quatro parâmetros do AG.

Payload:

```json
{
  "seed": 42,
  "baseline_population_size": 24,
  "baseline_generations": 18,
  "baseline_crossover_probability": 0.72,
  "baseline_mutation_probability": 0.28
}
```

Parâmetros avaliados:

- população;
- gerações;
- crossover;
- mutação.

Retorna fitness, tempo e avaliações para cada variação.
