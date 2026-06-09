# Decisões técnicas — Sprint 2

## 1. React + FastAPI

A interface foi mantida em React para criar uma experiência mais próxima de produto. Os cálculos permanecem no backend Python porque a parte técnica principal do trabalho envolve fuzzy, simulação, fitness e computação evolutiva.

## 2. Switch Produto / Apresentação

A decisão de criar dois modos resolve um problema de comunicação:

- o avaliador precisa ver evidências técnicas;
- um cliente final não deveria ver detalhes excessivos do modelo.

Por isso:

- **Modo Produto** mostra decisão, tarifa e justificativa operacional;
- **Modo Apresentação** mostra regras, pertinências, centroide, AG, baselines e métricas.

## 3. Modelo fuzzy

Foi mantido um modelo Mamdani simplificado com:

- fuzzificação das entradas;
- operador AND por mínimo;
- peso evolutivo aplicado sobre ativação da regra;
- implicação por recorte da função de saída;
- agregação por máximo;
- defuzzificação por centroide.

A saída continua sendo multiplicador, não preço direto. Isso deixa o produto adaptável a estacionamentos com tarifas-base diferentes.

## 4. Pesos das regras como solução evolutiva

A representação do AG é:

```text
[peso_R01, peso_R02, ..., peso_R18]
```

Essa escolha foi mantida porque é defensável, simples de explicar e integrada ao modelo fuzzy. Cada gene altera a influência de uma regra no resultado final.

## 5. Fitness com penalidades

A fitness não maximiza apenas receita. Ela considera:

- receita estimada;
- penalidade por ocupação muito baixa;
- penalidade por lotação crítica;
- penalidade por preço potencialmente injusto;
- penalidade por baixa rotatividade;
- penalidade por instabilidade de preço.

Isso reforça a defesa ética do projeto.

## 6. Sensibilidade fuzzy

Foi criada análise de sensibilidade para variar uma entrada por vez. Essa evidência ajuda a responder perguntas como:

- o modelo aumenta a tarifa de forma coerente quando a ocupação sobe?
- evento forte sempre aumenta preço mesmo com vagas?
- permanência longa influencia a rotatividade?

## 7. Sensibilidade do AG

A análise experimental ampliada varia quatro parâmetros:

- população;
- gerações;
- crossover;
- mutação.

A versão atual varia um parâmetro por vez para manter o tempo de execução adequado à demonstração. Para o relatório final, a equipe pode aumentar repetições e discutir custo computacional.

## 8. Exportação

A exportação foi feita no frontend para não adicionar complexidade desnecessária ao backend. Ela serve para gerar evidências e tabelas para o relatório/slides.
