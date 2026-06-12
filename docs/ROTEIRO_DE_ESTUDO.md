# Roteiro de estudo para apresentação

## Integrante 1 — Produto e problema

Precisa saber explicar:

- qual problema o ParkPrice AI resolve;
- quem é o público-alvo;
- qual decisão o sistema apoia;
- por que precificação dinâmica é um problema adequado;
- por que o sistema não é apenas “aumentar preço quando lota”;
- diferença entre Modo Produto e Modo Apresentação.

Frase-chave:

> O ParkPrice AI é um sistema de apoio à decisão que recomenda um multiplicador sobre a tarifa-base, equilibrando receita, ocupação, rotatividade e justiça tarifária.

## Integrante 2 — Fuzzy

Precisa saber explicar:

- variáveis de entrada e saída;
- universos de discurso;
- termos linguísticos;
- funções triangulares e trapezoidais;
- base de 18 regras;
- operador AND por mínimo;
- agregação por máximo;
- defuzzificação por centroide;
- como interpretar regras ativadas.

Pergunta provável:

> Por que lógica fuzzy é adequada para esse problema?

Resposta esperada:

> Porque o domínio usa conceitos graduais, como ocupação alta, demanda moderada, evento forte e permanência longa. Essas categorias não são binárias.

## Integrante 3 — Computação evolutiva

Precisa saber explicar:

- por que foi escolhido Algoritmo Genético;
- como uma solução é representada;
- o que é população;
- o que é fitness;
- seleção por torneio;
- crossover blend;
- mutação gaussiana;
- elitismo;
- critério de parada.

Frase-chave:

> Cada indivíduo do AG é um vetor de pesos das 18 regras fuzzy. O AG procura pesos que melhorem a aptidão nos cenários simulados.

## Integrante 4 — Testes, validação e métricas

Precisa saber explicar:

- 12 cenários sintéticos controlados;
- tarifa fixa;
- heurística simples;
- fuzzy manual;
- fuzzy otimizado;
- 5 execuções independentes;
- melhor, média e desvio-padrão;
- curva de convergência;
- tempo e número de avaliações.

Frase-chave:

> A validação compara estratégias sob as mesmas hipóteses de simulação, por isso os dados são sintéticos controlados e não previsão real de receita.

## Integrante 5 — Interface, documentação e reprodutibilidade

Precisa saber explicar:

- arquitetura React + FastAPI;
- como executar backend e frontend;
- endpoints principais;
- exportação JSON/CSV;
- organização do GitHub;
- README;
- declaração de uso de IA;
- limitações e melhorias futuras.

Frase-chave:

> A interface organiza a demonstração, mas os cálculos estão na API Python para manter o motor fuzzy-evolutivo testável e reutilizável.

## Demonstração sugerida no dia

1. Abrir Modo Produto.
2. Usar preset **Quase lotado**.
3. Explicar recomendação final.
4. Trocar para Modo Apresentação.
5. Mostrar regras ativadas.
6. Abrir funções de pertinência.
7. Rodar simulação.
8. Rodar AG.
9. Rodar 5 sementes.
10. Mostrar análise de sensibilidade.

## Perguntas difíceis e respostas curtas

### Os dados são reais?

Não. São cenários sintéticos controlados, usados para validar coerência e comparar estratégias sob as mesmas hipóteses.

### O sistema só aumenta preço?

Não. Ele também recomenda desconto ou normalidade em cenários fracos, e a fitness penaliza preço injusto, ocupação extrema e baixa rotatividade.

### O que o AG otimiza?

Os pesos das regras fuzzy.

### Por que não otimizar tudo?

Porque a versão atual prioriza uma representação simples, explicável e defensável. Ajustar limites de pertinência pode ser melhoria futura.

### O que prova que melhorou?

Comparação contra tarifa fixa, heurística simples e fuzzy manual, além da curva de convergência e das 5 execuções independentes.
