# Sprint 2 — Escopo entregue

## Objetivo

Transformar a base da Sprint 1 em um protótipo mais profissional para demonstração, sem perder o foco técnico exigido nas laudas. A Sprint 2 organiza a interface em dois contextos:

- **Modo Produto:** uso limpo, como se fosse apresentado a um cliente final.
- **Modo Apresentação:** defesa técnica, com regras, funções de pertinência, parâmetros, métricas e experimentos.

## O que foi implementado

### 1. Switch Produto / Apresentação

O frontend agora possui um seletor no topo da página:

- **Modo Produto:** exibe visão geral, recomendação e simulação com linguagem operacional.
- **Modo Apresentação:** libera abas técnicas de modelo fuzzy, evolutivo, experimentos e defesa.

Isso permite demonstrar valor de produto sem esconder a fundamentação técnica necessária para a avaliação.

### 2. Interface mais profissional

Foram adicionados:

- hero institucional com status da arquitetura;
- badges de evidência;
- navegação mais clara;
- cards executivos;
- checklist técnico para apresentação;
- organização visual em preto, branco e tons de cinza.

### 3. Presets de demonstração

Foram criados atalhos para cenários importantes:

- Dia fraco;
- Dia comum;
- Pico moderado;
- Quase lotado;
- Evento com vagas;
- Conflito operacional.

Esses presets reduzem risco no dia da apresentação, porque a equipe não precisa digitar valores manualmente para demonstrar casos relevantes.

### 4. Parâmetros editáveis do AG

A interface agora permite ajustar:

- tamanho da população;
- número de gerações;
- seed;
- probabilidade de crossover;
- probabilidade de mutação.

O backend também passou a retornar:

- tempo de execução em milissegundos;
- número de avaliações da função objetivo;
- quantidade de regras usadas.

### 5. Análise de sensibilidade fuzzy

Novo endpoint:

```text
POST /analysis/fuzzy-sensitivity
```

Ele varia uma entrada por vez e mantém as demais fixas. Isso ajuda a demonstrar se o modelo responde de forma coerente a mudanças em:

- ocupação;
- demanda;
- evento/pico;
- permanência média.

### 6. Análise experimental ampliada do AG

Novo endpoint:

```text
POST /analysis/parameter-sensitivity
```

Ele varia quatro parâmetros relevantes:

- população;
- gerações;
- crossover;
- mutação.

Esse recurso ajuda a atender à ampliação obrigatória sugerida para equipes com 5 integrantes na Parte 2, pois mostra impacto sobre aptidão, tempo e avaliações.

### 7. Exportação de resultados

A interface permite exportar:

- simulação em JSON;
- simulação em CSV;
- otimização em JSON;
- sensibilidade fuzzy em CSV;
- sensibilidade do AG em JSON.

Isso fortalece o aspecto de produto ampliado e facilita coleta de evidências para relatório/slides.

## Arquivos principais alterados

```text
backend/app/main.py
backend/app/schemas.py
backend/app/services/genetic_optimizer.py
backend/app/services/sensitivity.py
backend/tests/test_api.py
frontend/src/App.tsx
frontend/src/components/Charts.tsx
frontend/src/components/ParameterPanel.tsx
frontend/src/components/ScenarioTable.tsx
frontend/src/services/api.ts
frontend/src/types.ts
frontend/src/styles.css
frontend/package.json
frontend/tsconfig.json
README.md
docs/API.md
docs/DECISOES_TECNICAS.md
docs/EXECUCAO.md
docs/ROTEIRO_DE_ESTUDO.md
```

## Testes realizados

### Backend

Comando:

```bash
cd backend
python -m pytest -q
```

Resultado:

```text
7 passed
```

### Frontend

Comando:

```bash
cd frontend
npm run build
```

Resultado:

```text
build concluído com sucesso
```

Observação: o Vite pode gerar aviso de bundle acima de 500 kB por causa das bibliotecas de gráficos. É aviso de otimização futura, não erro.

## Critérios de aceitação da Sprint 2

A Sprint 2 está pronta para revisão se a equipe conseguir:

1. executar backend e frontend;
2. alternar entre modo Produto e Apresentação;
3. aplicar presets e calcular recomendação;
4. visualizar regras e funções de pertinência;
5. rodar simulação e comparar estratégias;
6. executar AG com parâmetros editáveis;
7. rodar 5 sementes;
8. executar sensibilidade fuzzy;
9. executar sensibilidade de parâmetros evolutivos;
10. exportar resultados para usar no relatório.

## Limitações mantidas

- Não há banco de dados.
- Não há autenticação.
- Não há upload de cenários pela interface.
- A análise experimental é inicial e curta para demonstração; a versão final pode ampliar repetições e combinações.
- Os dados são sintéticos controlados.
