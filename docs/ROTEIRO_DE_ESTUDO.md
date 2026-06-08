# Roteiro de estudo para apresentação e arguição

Este roteiro foi criado para a equipe estudar o projeto sem depender apenas do código.

## Integrante 1 — Produto e problema

Precisa saber explicar:

- qual problema o ParkPrice AI resolve;
- quem é o público-alvo;
- qual decisão o sistema apoia;
- por que precificação dinâmica envolve incerteza e gradação;
- por que o sistema não deve ser apresentado como mecanismo para cobrar mais caro;
- limitações éticas e operacionais.

Frase-base:

> O ParkPrice AI é um sistema de apoio à decisão que recomenda um multiplicador de tarifa buscando equilíbrio entre receita, ocupação, rotatividade e justiça tarifária.

## Integrante 2 — Modelo fuzzy

Precisa saber explicar:

- variáveis de entrada;
- universo de discurso de cada variável;
- termos linguísticos;
- funções triangulares e trapezoidais;
- base de regras;
- por que existem regras para conflitos;
- por que o fuzzy é adequado ao problema.

Perguntas prováveis:

- Por que ocupação tem termo crítico?
- Por que permanência média influencia preço?
- O que acontece quando ocupação é baixa mas evento é forte?

## Integrante 3 — Inferência e defuzzificação

Precisa saber explicar:

- fuzzificação;
- operador AND por mínimo;
- implicação por recorte;
- agregação por máximo;
- centroide;
- multiplicador final;
- diferença entre saída linguística e saída numérica.

Pergunta provável:

- Como o sistema transforma regras linguísticas em preço final?

Resposta esperada:

> Ele calcula os graus de pertinência das entradas, ativa regras, agrega as saídas fuzzy e usa centroide para obter um multiplicador numérico aplicado à tarifa-base.

## Integrante 4 — Algoritmo Genético

Precisa saber explicar:

- por que existe otimização;
- representação da solução;
- o que cada gene significa;
- seleção por torneio;
- crossover;
- mutação;
- elitismo;
- gerações e população;
- seed.

Representação:

```text
[peso_R01, peso_R02, ..., peso_R18]
```

Pergunta provável:

- O AG muda as regras?

Resposta esperada:

> Na Sprint 1, o AG não muda a lógica textual das regras. Ele ajusta os pesos, ou seja, a influência relativa de cada regra na saída agregada.

## Integrante 5 — Validação, métricas e resultados

Precisa saber explicar:

- cenários sintéticos controlados;
- tarifa fixa;
- heurística simples;
- fuzzy manual;
- fuzzy otimizado;
- curva de convergência;
- melhor, média e desvio-padrão em 5 sementes;
- limitações dos dados sintéticos.

Perguntas prováveis:

- Por que 5 execuções?
- Como vocês sabem que o AG melhorou?
- Quais são as limitações da simulação?

## Todos os integrantes

Todos precisam saber responder:

1. O que entra no sistema?
2. O que sai do sistema?
3. Quantas regras existem?
4. Qual algoritmo evolutivo foi usado?
5. O que a fitness tenta equilibrar?
6. Quais baselines foram comparados?
7. O que ainda precisa melhorar?
