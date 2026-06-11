# API do ParkPrice AI

A API concentra os cálculos pesados do sistema: recomendação fuzzy, simulação, otimização evolutiva e análises.

Base local:

```text
http://localhost:8000
```

## `GET /health`

Verifica se a API está ativa.

Resposta esperada:

```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

## `POST /recommend`

Calcula a recomendação de tarifa.

Entrada:

```json
{
  "base_rate": 8,
  "occupancy": 72,
  "demand": 6.5,
  "event_level": 4,
  "avg_stay_minutes": 90
}
```

Saídas principais:

- multiplicador;
- classificação linguística;
- tarifa recomendada;
- justificativa;
- graus de pertinência;
- regras ativadas;
- curva agregada da saída.

## `POST /simulate`

Compara estratégias nos cenários cadastrados.

Estratégias comparadas:

- tarifa fixa;
- heurística simples;
- fuzzy manual;
- fuzzy otimizado, quando pesos otimizados são informados.

## `POST /optimize`

Executa o Algoritmo Genético para calibrar pesos das regras fuzzy.

Entrada:

```json
{
  "population_size": 32,
  "generations": 30,
  "seed": 42,
  "crossover_probability": 0.72,
  "mutation_probability": 0.28
}
```

Saídas principais:

- melhor vetor de pesos;
- melhor aptidão;
- histórico de convergência;
- comparação entre estratégias;
- tempo de execução;
- número de avaliações.

## `POST /experiments/run-5-seeds`

Executa rodadas independentes usando sementes distintas.

Usado para observar estabilidade do Algoritmo Genético.

## `POST /analysis/fuzzy-sensitivity`

Varia uma entrada do modelo fuzzy e observa o comportamento do multiplicador.

Variáveis aceitas:

- `occupancy`;
- `demand`;
- `event_level`;
- `avg_stay_minutes`.

## `POST /analysis/parameter-sensitivity`

Compara configurações do otimizador variando:

- tamanho da população;
- número de gerações;
- probabilidade de crossover;
- probabilidade de mutação.

## `GET /rules`

Retorna a base de regras fuzzy.

## `GET /membership-functions`

Retorna pontos para plotar as funções de pertinência.

## `GET /scenarios`

Retorna os cenários sintéticos controlados usados na simulação.
