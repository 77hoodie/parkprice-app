# Alinhamento com a lauda e com o guia inicial

## Enquadramento geral

O ParkPrice AI foi estruturado como um sistema de apoio à decisão para precificação dinâmica de estacionamentos. A proposta é recomendar um multiplicador sobre a tarifa-base, e não simplesmente aumentar preço quando o estacionamento está cheio.

## Parte 1 — Sistemas de Controle Fuzzy, Opção B

A Sprint 1 atende à ideia de produto/aplicação de mercado porque possui:

- problema realista;
- público-alvo identificável;
- entradas e saída compreensíveis;
- protótipo funcional;
- base de regras;
- funções de pertinência;
- cenários de teste;
- interface demonstrável;
- documentação de execução.

### Requisitos fuzzy contemplados

| Item | Como aparece na Sprint 1 |
|---|---|
| Pelo menos 2 entradas e 1 saída | 4 entradas e 1 saída |
| Termos linguísticos | baixa/média/alta/crítica, baixa/moderada/alta etc. |
| Funções de pertinência | Disponíveis em `/membership-functions` e na aba `Modelo fuzzy` |
| Pelo menos 12 regras | 18 regras |
| Pelo menos 6 cenários | 12 cenários sintéticos |
| Validação | Comparação e tabelas de simulação |
| Produto | Interface React + API Python |

## Equipe com 5 integrantes na Parte 1

A Sprint 1 já prepara a trilha de ampliação técnica do modelo:

- usa mais de 3 entradas;
- usa 18 regras;
- usa 12 cenários de teste.

Ainda falta expandir a análise de sensibilidade para ficar mais forte no relatório final.

## Parte 2 — IA Evolutiva e Computação Bioinspirada, Opção 2

A Sprint 1 atende à trilha de protótipo de programa porque possui:

- problema de otimização;
- representação de solução;
- função de aptidão;
- restrições indiretas e penalidades;
- algoritmo evolutivo;
- parâmetros;
- critérios de parada;
- comparação com baseline;
- rotina com 5 execuções independentes.

### Elementos evolutivos contemplados

| Item | Como aparece na Sprint 1 |
|---|---|
| Algoritmo | Algoritmo Genético |
| Representação | Vetor com 18 pesos de regras |
| Fitness | Receita estimada menos penalidades operacionais e éticas |
| Operadores | Seleção por torneio, crossover blend, mutação gaussiana e elitismo |
| Parâmetros | população, gerações, seed, probabilidades |
| Comparação | tarifa fixa, heurística, fuzzy manual, fuzzy otimizado |
| 5 sementes | endpoint `/experiments/run-5-seeds` |

## Equipe com 5 integrantes na Parte 2

A Sprint 1 favorece duas possibilidades:

1. **Produto ampliado**, pela existência de interface React + API FastAPI.
2. **Análise experimental ampliada**, pela base de simulação e rotina de 5 sementes.

A recomendação é escolher uma das duas oficialmente no relatório. Para a Sprint 2, a melhor escolha provavelmente é análise experimental ampliada, variando quatro parâmetros do AG e discutindo impacto em convergência, aptidão e custo computacional.

## Pontos de cuidado

- Declarar que os dados são sintéticos controlados.
- Não vender o sistema como produto comercial final.
- Defender que o objetivo é equilíbrio entre receita, ocupação, rotatividade e justiça tarifária.
- Não deixar a interface esconder a parte técnica.
- Garantir que todos consigam explicar fuzzy, AG, fitness e validação.
