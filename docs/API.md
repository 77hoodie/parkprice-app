# Documentação da API — Sprint 1

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

Resposta:

```json
{"status":"ok"}
```

## GET /rules

Retorna a base de regras fuzzy.

Resposta resumida:

```json
{
  "count": 18,
  "rules": [
    {
      "name": "R01",
      "if": [["occupancy", "low"], ["demand", "low"]],
      "then": "discount",
      "rationale": "baixa procura permite incentivo de entrada"
    }
  ]
}
```

## GET /membership-functions

Retorna pontos das funções de pertinência para gerar gráficos.

Variáveis retornadas:

- occupancy;
- demand;
- event;
- stay;
- multiplier.

## GET /scenarios

Retorna os 12 cenários sintéticos controlados.

## POST /recommend

Calcula a recomendação fuzzy para um conjunto de entradas.

Payload:

```json
{
  "base_rate": 8.0,
  "occupancy": 87,
  "demand": 8.5,
  "event_level": 7.0,
  "avg_stay_minutes": 150
}
```

Resposta principal:

```json
{
  "multiplier": 1.54,
  "label": "high",
  "label_pt": "alto",
  "base_rate": 8.0,
  "recommended_rate": 12.32,
  "explanation": "...",
  "memberships": {},
  "activations": [],
  "output_curve": []
}
```

## POST /simulate

Roda comparação entre estratégias.

Payload sem pesos otimizados:

```json
{}
```

Payload com pesos otimizados:

```json
{
  "optimized_rule_weights": [1.0, 0.95, 1.1]
}
```

A lista real deve conter 18 pesos.

Resposta:

```json
{
  "summary": [],
  "rows": []
}
```

## POST /optimize

Executa Algoritmo Genético para otimizar pesos das regras fuzzy.

Payload:

```json
{
  "population_size": 32,
  "generations": 30,
  "seed": 42
}
```

Resposta principal:

```json
{
  "weights": [],
  "fitness": 123.45,
  "history": [],
  "comparison_summary": [],
  "comparison_rows": [],
  "parameters": {}
}
```

## POST /experiments/run-5-seeds

Executa o AG em pelo menos 5 sementes distintas para avaliar estabilidade.

Payload:

```json
{
  "population_size": 24,
  "generations": 20,
  "seeds": [7, 21, 42, 84, 126]
}
```

Resposta principal:

```json
{
  "summary": {
    "executions": 5,
    "best_fitness": 0,
    "mean_fitness": 0,
    "std_fitness": 0,
    "worst_fitness": 0,
    "seeds": [7, 21, 42, 84, 126]
  },
  "runs": [],
  "best_run": {}
}
```
