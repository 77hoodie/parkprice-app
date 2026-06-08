# Decisões técnicas da Sprint 1

## 1. Por que React no frontend?

React foi escolhido para dar aparência de produto/dashboard sem misturar interface com regra de negócio. Isso facilita:

- evolução visual;
- organização por componentes;
- consumo de API;
- demonstração mais profissional;
- separação entre produto e motor técnico.

A interface não deve ser o foco principal da avaliação. Ela serve para demonstrar o fluxo e tornar os resultados compreensíveis.

## 2. Por que FastAPI no backend?

FastAPI foi escolhido porque permite expor o motor fuzzy/evolutivo em endpoints claros, documentados automaticamente em `/docs`. Isso ajuda na demonstração e na reprodutibilidade.

## 3. Por que manter os cálculos em Python?

Python é mais adequado para:

- modelagem fuzzy;
- simulação;
- algoritmos evolutivos;
- análise de dados;
- testes e geração de métricas.

Além disso, o projeto inicial já estava em Python, então essa escolha preserva o trabalho já feito.

## 4. Por que Mamdani simplificado?

A lauda da Parte 1 indica Mamdani como modelo padrão nas opções A e B. Por isso, a Sprint 1 usa uma inferência com:

- funções de pertinência nas entradas;
- consequentes fuzzy na saída;
- ativação de regras;
- agregação;
- defuzzificação por centroide.

O algoritmo ainda é implementado manualmente, para que a equipe consiga explicar cada etapa sem depender de uma biblioteca como caixa-preta.

## 5. Por que otimizar pesos das regras?

É a forma mais segura para uma primeira integração fuzzy-evolutiva:

- a representação é simples;
- cada gene tem interpretação clara;
- a base fuzzy continua legível;
- o AG altera a influência das regras, mas não destrói a lógica do domínio.

## 6. Por que usar dados sintéticos?

Como provavelmente a equipe ainda não possui dados reais de estacionamento, a Sprint 1 usa dados sintéticos controlados. Isso deve ser declarado no relatório. O objetivo é comparar estratégias sob cenários reprodutíveis, não prometer previsão real de mercado.

## 9. Próxima decisão importante

Escolher oficialmente a ampliação obrigatória da equipe de 5 integrantes:

- Produto ampliado; ou
- Análise experimental ampliada.

A arquitetura permite as duas, mas para o relatório é melhor escolher uma trilha principal e aprofundá-la.
