# Roteiro operacional de demonstração

Este roteiro orienta a navegação pelo web app no dia da apresentação.

## 1. Abertura

Começar pela tela de acesso e explicar que existem dois atores:

- Cliente: usa a plataforma para decisão operacional.
- Administrador: acompanha modelo, calibração e métricas.

## 2. Fluxo do cliente

1. Entrar como Cliente.
2. Abrir Início.
3. Explicar o resumo operacional.
4. Abrir Recomendação.
5. Clicar no cenário “Dia comum”.
6. Mostrar tarifa recomendada, multiplicador e classificação.
7. Clicar no cenário “Quase lotado”.
8. Mostrar mudança da recomendação.
9. Clicar no cenário “Evento com vagas”.
10. Explicar que o sistema evita uma decisão simplista de apenas aumentar preço.
11. Abrir Simulação.
12. Mostrar comparação entre estratégias.
13. Abrir Histórico.
14. Mostrar recomendações recentes e exportação.

## 3. Fluxo do administrador

1. Sair e entrar como Administrador.
2. Abrir Modelo.
3. Mostrar funções de pertinência.
4. Mostrar base de regras.
5. Abrir Otimização.
6. Explicar os parâmetros do Algoritmo Genético.
7. Executar calibração.
8. Mostrar curva de convergência.
9. Rodar execuções independentes.
10. Mostrar melhor, média e desvio-padrão.
11. Abrir Análises.
12. Executar sensibilidade de ocupação.
13. Executar sensibilidade do otimizador.
14. Abrir Operação e fechar com o mapa do sistema.

## 4. Frases úteis

- “O sistema recomenda um multiplicador, não um preço fixo, porque diferentes estacionamentos podem ter tarifas-base diferentes.”
- “A lógica fuzzy foi usada porque as variáveis do problema são graduais: ocupação alta, demanda moderada, evento forte e permanência longa.”
- “O Algoritmo Genético calibra pesos das regras, mas a decisão continua interpretável.”
- “A função de aptidão não maximiza apenas receita; ela também penaliza preço excessivo, ocupação extrema e baixa rotatividade.”
- “Os cenários sintéticos foram usados para manter a validação controlada e reproduzível.”

## 5. Cuidados no dia

- Rodar a API antes da interface.
- Deixar a página `/docs` da API aberta em outra aba.
- Testar os cenários antes de apresentar.
- Evitar executar configurações muito grandes do AG durante a fala.
- Usar parâmetros moderados para não demorar.
- Ter prints dos resultados como reserva.
