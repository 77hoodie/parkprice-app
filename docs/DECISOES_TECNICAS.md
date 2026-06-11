# Decisões técnicas

## 1. Arquitetura

A aplicação foi separada em duas camadas:

- **Frontend React:** experiência visual, fluxo por perfil, gráficos e exportações.
- **Backend FastAPI:** cálculos fuzzy, simulação, Algoritmo Genético e análises.

Essa separação evita que a interface fique responsável por cálculos pesados e permite que o motor matemático seja testado de forma independente.

## 2. Perfis de uso

Foram definidos dois atores:

- **Cliente:** operador ou gestor que quer obter recomendações de preço.
- **Administrador:** responsável por acompanhar regras, calibração, métricas e análises.

A separação melhora a organização da interface e simula um produto com diferentes níveis de acesso, sem exigir autenticação completa.

## 3. Modelo fuzzy

O sistema usa abordagem Mamdani porque a atividade da Parte 1, na Opção B, usa Mamdani como padrão quando a equipe não escolhe TSK.

Entradas:

- ocupação atual;
- demanda prevista;
- proximidade de evento/pico;
- tempo médio de permanência.

Saída:

- multiplicador da tarifa-base.

O preço final é calculado por:

```text
preço_final = tarifa_base × multiplicador
```

## 4. Base de regras

A base possui 18 regras para cobrir:

- dias fracos;
- dias comuns;
- picos moderados;
- cenários quase lotados;
- eventos com vagas disponíveis;
- conflitos operacionais.

## 5. Defuzzificação

A saída fuzzy é agregada e convertida em valor numérico por centroide. Isso permite gerar um multiplicador contínuo, mais adequado que uma decisão rígida por faixas.

## 6. Algoritmo Genético

O Algoritmo Genético calibra pesos das regras fuzzy.

Representação:

```text
[peso_R01, peso_R02, ..., peso_R18]
```

Operadores:

- seleção por torneio;
- crossover blend;
- mutação gaussiana;
- elitismo preservando o melhor indivíduo.

## 7. Função de aptidão

A aptidão combina receita estimada e penalidades operacionais. A intenção é evitar que o sistema otimize apenas preço alto.

Componentes considerados:

- receita estimada;
- ocupação prevista;
- penalidade por preço excessivo;
- penalidade por ocupação extrema;
- rotatividade.

## 8. Simulação

Foram usados cenários sintéticos controlados, com valores realistas e interpretáveis. Eles permitem comparar estratégias sob as mesmas condições.

## 9. Métricas

A aplicação registra:

- melhor aptidão;
- aptidão média;
- pior aptidão;
- tempo de execução;
- número de avaliações;
- melhor, média e desvio-padrão em execuções independentes;
- comparação de receita entre estratégias.

## Autenticação demonstrativa local

A interface passou a ter login com dois tipos de usuário: Cliente e Administrador. Essa decisão melhora a separação de responsabilidades:

- o Cliente recebe uma visão operacional e guiada;
- o Administrador acessa transparência do modelo, regras, otimização e análises.

Foram incluídas duas contas de teste e cadastro local de novos clientes. O cadastro valida e-mail, exige senha mínima, confirmação e aceite de tratamento local. A senha é salva como hash SHA-256 no navegador, e não em texto puro.

Essa autenticação não é apresentada como recurso de segurança empresarial completo. Ela serve para organizar o fluxo do produto dentro do escopo acadêmico, sem prometer uma plataforma comercial final.

## Aceleração da otimização evolutiva

A versão anterior executava a função de aptidão chamando o fluxo completo de recomendação para cada indivíduo do Algoritmo Genético. Isso era tecnicamente correto, mas muito lento para demonstração ao vivo, especialmente em análise de parâmetros e execuções independentes.

A solução adotada foi:

1. manter a recomendação exibida ao usuário com o modelo fuzzy Mamdani completo;
2. pré-calcular as curvas de saída fuzzy;
3. pré-calcular as ativações puras das regras nos cenários sintéticos;
4. usar uma avaliação rápida da aptidão durante a busca evolutiva;
5. após encontrar o melhor vetor de pesos, comparar os resultados pelo fluxo completo de simulação.

Essa abordagem preserva os elementos cobrados na atividade de IA Evolutiva: representação, população, função de aptidão, operadores, parâmetros, convergência, 5 sementes, comparação e métricas. Ao mesmo tempo, torna a demonstração viável em sala.
