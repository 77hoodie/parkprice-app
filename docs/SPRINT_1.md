# Sprint 1 — Escopo entregue

## Objetivo da Sprint

Criar uma base robusta, mas ainda inicial, para transformar o ParkPrice AI em um produto acadêmico demonstrável com interface React e cálculos em API Python.

A Sprint 1 não busca finalizar o projeto. Ela entrega uma fundação para análise da equipe e evolução segura.

## O que foi implementado

### 1. Arquitetura separada

- Frontend em React, Vite e TypeScript.
- Backend em FastAPI.
- Motor fuzzy e evolutivo em Python.
- Comunicação por HTTP/JSON.

### 2. Modelo fuzzy

- 4 entradas:
  - ocupação atual;
  - demanda prevista;
  - intensidade de evento/pico;
  - permanência média.
- 1 saída:
  - multiplicador da tarifa.
- 18 regras fuzzy.
- Inferência Mamdani simplificada:
  - fuzzificação;
  - operador AND por mínimo;
  - implicação por recorte;
  - agregação por máximo;
  - defuzzificação por centroide.

### 3. Simulação

- 12 cenários sintéticos controlados.
- Comparação entre:
  - tarifa fixa;
  - heurística simples;
  - fuzzy manual;
  - fuzzy otimizado, quando houver pesos do AG.

### 4. Computação evolutiva

- Algoritmo Genético para otimizar pesos das regras.
- Representação da solução:

```text
[peso_R01, peso_R02, ..., peso_R18]
```

- Operadores:
  - seleção por torneio;
  - crossover blend;
  - mutação gaussiana;
  - elitismo simples.

### 5. Fitness

A função de aptidão combina:

- receita estimada;
- penalidade por ocupação muito baixa;
- penalidade por ocupação crítica;
- penalidade por preço potencialmente injusto;
- penalidade por baixa rotatividade;
- penalidade por instabilidade de preço.

Isso evita que o sistema seja defendido como um mecanismo de simples aumento de preço.

### 6. Interface

A interface contém abas para:

- recomendação;
- modelo fuzzy;
- simulação;
- laboratório evolutivo;
- roteiro de estudo.

A paleta visual foi mantida em preto, branco e tons de cinza.

## O que ainda não foi feito

- Exportação de resultados.
- Persistência de experimentos.
- Upload de cenários pelo usuário.
- Ajuste dos limites das funções de pertinência pelo AG.
- Autenticação.
- Deploy.
- Geração automática de gráficos para relatório.

## Critérios de aceitação da Sprint 1

A Sprint 1 será considerada validada se:

1. a equipe conseguir instalar backend e frontend;
2. a API responder em `/docs`;
3. a interface calcular recomendação;
4. a simulação mostrar comparação entre estratégias;
5. o AG executar sem erro;
6. a rotina de 5 sementes retornar melhor, média e desvio-padrão;
7. a equipe entender os arquivos principais.
