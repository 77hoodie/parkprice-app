# ParkPrice AI

**Sistema fuzzy-evolutivo para precificação dinâmica de estacionamentos**

Aplicação web de apoio à decisão para recomendação de tarifa dinâmica em estacionamentos, utilizando **lógica fuzzy Mamdani** e **Algoritmo Genético** para calibração dos pesos das regras fuzzy.

---

## Identificação

| Campo              | Informação                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Instituição        | CESUPA - Escola de Negócios, Tecnologia e Inovação                                                                                    |
| Disciplina         | Inteligência Artificial e Computacional                                                                                               |
| Professor          | Daniel Leal Souza                                                                                                                     |
| Turma              | CC5MA                                                                                                                                 |
| Equipe             | João Pedro Almeida Follmann, Yuri Antonio Santos Fernandes, Samuel Paula Nunes Salheb, Arthur José Aviz Lima e Gabriel Cruz Filgueira |
| Parte 1            | Opção B - Aplicação ou produto baseado em controle fuzzy                                                                              |
| Parte 2            | Opção 2 - Protótipo de programa com Algoritmo Genético                                                                                |
| Repositório GitHub | https://github.com/77hoodie/parkprice-app                                                                                             |
| Data               | 11/06/2026                                                                                                                            |

---

## Visão geral

O **ParkPrice AI** é uma aplicação de apoio à decisão voltada à precificação dinâmica de estacionamentos. O sistema recebe dados operacionais, interpreta essas informações por meio de um sistema fuzzy Mamdani e recomenda um multiplicador sobre a tarifa-base.

Em complemento, um **Algoritmo Genético** calibra pesos das regras fuzzy para comparar o modelo manual com uma versão otimizada, mantendo o foco em receita, ocupação saudável, rotatividade e justiça tarifária.

A proposta foi organizada como documentação técnica de produto, pois a modalidade escolhida na Parte 1 é a **Opção B**. Por isso, além da modelagem fuzzy, o projeto apresenta público-alvo, proposta de valor, requisitos, atores, fluxo de uso, arquitetura, manual de execução, testes, limitações e melhorias futuras.

A Parte 2 é atendida pela formulação de otimização com **Algoritmo Genético**, representação de indivíduos, população, função de aptidão, operadores, parâmetros, execuções independentes e comparação com baselines.

---

## Objetivo do projeto

O objetivo do ParkPrice AI é recomendar uma tarifa por hora para estacionamentos a partir de uma tarifa-base e de variáveis operacionais do contexto.

O sistema considera:

* ocupação atual;
* demanda prevista;
* proximidade de evento ou pico;
* tempo médio de permanência.

A recomendação final é dada por:

```text
preço_final = tarifa_base × multiplicador_fuzzy
```

O uso de multiplicador permite aplicar o mesmo modelo a estacionamentos com diferentes tarifas-base.

---

## Público-alvo

O público-alvo principal é composto por administradores e operadores de estacionamentos privados, incluindo:

* estacionamentos de shoppings;
* faculdades;
* hospitais;
* centros comerciais;
* prédios corporativos;
* regiões próximas a eventos.

A escolha desse público é adequada porque esses ambientes possuem variação real de fluxo, ocupação, demanda e permanência, tornando a decisão tarifária um problema com incerteza, gradação e múltiplos critérios.

---

## Atores do sistema

O web app possui dois perfis principais:

| Ator          | Função no sistema                                                 | Justificativa                                                                       |
| ------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Cliente       | Usa recomendação, simulação, histórico e guias interpretativos.   | Representa o usuário operacional que quer saber qual tarifa aplicar e por quê.      |
| Administrador | Acessa modelo fuzzy, regras, otimização, experimentos e análises. | Representa a equipe técnica ou gestora que precisa validar parâmetros e resultados. |

---

## Contas de teste

| Conta                  | E-mail                                              | Senha      | Perfil        |
| ---------------------- | --------------------------------------------------- | ---------- | ------------- |
| Cliente de teste       | [cliente@parkprice.ai](mailto:cliente@parkprice.ai) | cliente123 | Cliente       |
| Administrador de teste | [admin@parkprice.ai](mailto:admin@parkprice.ai)     | admin123   | Administrador |

Novos clientes podem se cadastrar com e-mail e senha. O frontend valida formato de e-mail, senha mínima, confirmação de senha e aceite de tratamento local. A senha é transformada em hash SHA-256 no navegador e armazenada localmente.

Essa autenticação é demonstrativa e suficiente para o escopo acadêmico do projeto. Um produto comercial completo exigiria autenticação no backend, banco de dados, controle de sessão, recuperação de senha e políticas completas de segurança.

---

## Técnicas utilizadas

### Lógica fuzzy Mamdani

A lógica fuzzy foi usada porque o problema envolve conceitos graduais, como:

* ocupação baixa, média, alta ou crítica;
* demanda baixa, média ou alta;
* evento irrelevante, moderado ou forte;
* permanência curta, média ou longa.

Esses conceitos não possuem fronteiras exatas. Por isso, a lógica fuzzy permite representar transições suaves e decisões interpretáveis por meio de regras linguísticas.

### Algoritmo Genético

O Algoritmo Genético foi usado para otimizar pesos das regras fuzzy. Cada indivíduo representa uma configuração de pesos:

```text
[peso_R01, peso_R02, peso_R03, ..., peso_R18]
```

O AG não substitui a lógica fuzzy. Ele atua como mecanismo de calibração, ajustando a influência relativa das regras para melhorar o desempenho em cenários simulados.

---

## Modelagem fuzzy

### Entradas

| Variável          | Universo    | Termos linguísticos          |
| ----------------- | ----------- | ---------------------------- |
| Ocupação atual    | 0% a 100%   | baixa, média, alta, crítica  |
| Demanda prevista  | 0 a 10      | baixa, média, alta           |
| Evento/pico       | 0 a 10      | irrelevante, moderado, forte |
| Permanência média | 0 a 240 min | curta, média, longa          |

### Saída

| Variável                | Universo    | Termos linguísticos                       |
| ----------------------- | ----------- | ----------------------------------------- |
| Multiplicador da tarifa | 0,70 a 1,80 | desconto, normal, moderado, alto, crítico |

### Base de regras

O sistema usa **18 regras fuzzy**, cobrindo cenários normais, críticos e conflitantes. Exemplos:

| Regra | Condição                                                 | Saída    |
| ----- | -------------------------------------------------------- | -------- |
| R01   | ocupação é baixa E demanda é baixa                       | desconto |
| R05   | ocupação é média E demanda é alta                        | moderado |
| R08   | ocupação é crítica E demanda é alta                      | crítico  |
| R09   | ocupação é crítica E evento é forte                      | crítico  |
| R10   | ocupação é alta E permanência é longa                    | alto     |
| R18   | ocupação é alta E evento é irrelevante E demanda é baixa | moderado |

A tabela completa de regras está descrita na documentação técnica do projeto.

---

## Comparação de estratégias

A validação compara quatro estratégias de precificação:

| Estratégia         | Descrição                                                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Tarifa fixa        | Mantém a tarifa-base sem ajuste.                                                                                        |
| Heurística simples | Aumenta 20% quando a ocupação é maior ou igual a 80% e aplica desconto de 10% quando a ocupação é menor ou igual a 40%. |
| Fuzzy manual       | Usa regras e funções de pertinência definidas pela equipe, com pesos iguais.                                            |
| Fuzzy otimizado    | Usa pesos das regras calibrados pelo Algoritmo Genético.                                                                |

Essa comparação permite avaliar o ganho da solução fuzzy-evolutiva em relação a alternativas simples.

---

## Validação experimental

A validação utiliza:

* 12 cenários sintéticos controlados;
* comparação entre tarifa fixa, heurística simples, fuzzy manual e fuzzy otimizado;
* 5 execuções independentes com sementes distintas;
* curva de convergência do Algoritmo Genético;
* análise de sensibilidade fuzzy;
* análise de parâmetros do AG;
* métricas de fitness, tempo, avaliações, média e desvio-padrão.

As sementes usadas nas execuções independentes são:

```text
7, 21, 42, 84 e 126
```

---

## Arquitetura

O projeto é dividido em frontend React e backend FastAPI.

```text
Usuário
  ↓
Frontend React
  ↓
API FastAPI
  ↓
Modelo Fuzzy + Simulador + Algoritmo Genético
  ↓
Resultados, gráficos e exportações
```

### Camadas

| Camada             | Tecnologia               | Responsabilidade                                                                                  |
| ------------------ | ------------------------ | ------------------------------------------------------------------------------------------------- |
| Frontend           | React, Vite e TypeScript | Login, telas por ator, formulários, gráficos, histórico local e exportações.                      |
| Backend            | FastAPI e Python         | Endpoints, validação de payloads e orquestração dos serviços.                                     |
| Modelo fuzzy       | Python e NumPy           | Pertinência, regras, inferência Mamdani, defuzzificação e recomendação.                           |
| Simulador          | Python e pandas          | Cenários sintéticos, baselines, estimativa operacional e comparação.                              |
| Algoritmo Genético | Python                   | Otimização de pesos, histórico de convergência, múltiplas sementes e sensibilidade de parâmetros. |

---

## Estrutura do projeto

```text
parkprice-app/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── schemas.py
│   │   └── services/
│   │       ├── fuzzy_model.py
│   │       ├── simulator.py
│   │       ├── genetic_optimizer.py
│   │       ├── sensitivity.py
│   │       └── metrics.py
│   ├── tests/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   └── components/
│   │       └── Charts.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── docs/
├── slides/
│   └── slides_parkprice_ai.pdf
│
├── relatorio/
│   └── Documentacao_ParkPrice_AI.pdf
│
└── README.md
```

---

## Principais arquivos

| Arquivo                                   | Função no produto                                                         |
| ----------------------------------------- | ------------------------------------------------------------------------- |
| backend/app/main.py                       | Define a API, endpoints e integração entre serviços.                      |
| backend/app/schemas.py                    | Define e valida os dados recebidos pela API.                              |
| backend/app/services/fuzzy_model.py       | Contém variáveis, funções de pertinência, regras e recomendação fuzzy.    |
| backend/app/services/simulator.py         | Carrega cenários, calcula baselines e estima operação.                    |
| backend/app/services/genetic_optimizer.py | Executa o Algoritmo Genético e os experimentos de estabilidade.           |
| backend/app/services/sensitivity.py       | Executa análise de sensibilidade fuzzy.                                   |
| backend/app/services/metrics.py           | Agrupa e resume métricas da comparação.                                   |
| frontend/src/App.tsx                      | Controla login, telas, fluxos do cliente e do administrador.              |
| frontend/src/services/api.ts              | Centraliza chamadas do frontend para a API.                               |
| frontend/src/components/Charts.tsx        | Renderiza gráficos de pertinência, convergência, receita e sensibilidade. |

---

## Endpoints da API

| Endpoint                        | Método | Finalidade                                                     |
| ------------------------------- | ------ | -------------------------------------------------------------- |
| /                               | GET    | Retorna status geral e capacidades da API.                     |
| /health                         | GET    | Verifica funcionamento da API.                                 |
| /rules                          | GET    | Retorna as 18 regras fuzzy.                                    |
| /membership-functions           | GET    | Retorna pontos das funções de pertinência.                     |
| /scenarios                      | GET    | Retorna os 12 cenários sintéticos.                             |
| /recommend                      | POST   | Calcula recomendação fuzzy para entradas informadas.           |
| /simulate                       | POST   | Compara estratégias de preço nos cenários.                     |
| /optimize                       | POST   | Executa o Algoritmo Genético para otimizar pesos.              |
| /experiments/run-5-seeds        | POST   | Executa 5 otimizações independentes com sementes distintas.    |
| /analysis/fuzzy-sensitivity     | POST   | Varia uma entrada para analisar sensibilidade do modelo fuzzy. |
| /analysis/parameter-sensitivity | POST   | Varia 4 parâmetros do AG para análise experimental ampliada.   |

---

## Instalação e execução

### Pré-requisitos

* Python 3.10 ou superior;
* Node.js 18 ou superior;
* npm;
* Git.

---

## Executando o backend

Acesse a pasta do backend:

```bash
cd backend
```

Crie o ambiente virtual:

```bash
python -m venv .venv
```

Ative o ambiente virtual.

No Windows:

```bash
.venv\Scripts\activate
```

No Linux ou macOS:

```bash
source .venv/bin/activate
```

Instale as dependências:

```bash
pip install -r requirements.txt
```

Execute a API:

```bash
uvicorn app.main:app --reload
```

A API ficará disponível em:

```text
http://localhost:8000
```

A documentação interativa da API ficará disponível em:

```text
http://localhost:8000/docs
```

---

## Executando o frontend

Em outro terminal, acesse a pasta do frontend:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Execute a aplicação:

```bash
npm run dev
```

A interface ficará disponível em:

```text
http://localhost:5173
```

---

## Executando os testes

Acesse a pasta do backend:

```bash
cd backend
```

Execute:

```bash
python -m pytest -q
```

Resultado esperado:

```text
7 passed
```

---

## Build do frontend

Acesse a pasta do frontend:

```bash
cd frontend
```

Execute:

```bash
npm run build
```

Esse comando gera a versão final da interface na pasta `dist/`.

---

## Fluxo de uso

### Cliente

1. Acessa a tela de login.
2. Entra com a conta de cliente ou cria novo cadastro.
3. Informa tarifa-base, ocupação, demanda, evento/pico e permanência média.
4. Recebe preço recomendado, multiplicador e justificativa.
5. Visualiza gráficos e explicações.
6. Consulta histórico local.
7. Exporta resultados, se necessário.

### Administrador

1. Acessa a tela de login.
2. Entra com a conta de administrador.
3. Consulta regras fuzzy e funções de pertinência.
4. Executa simulações e comparação entre estratégias.
5. Executa otimização por Algoritmo Genético.
6. Visualiza curva de convergência e métricas.
7. Executa análise de sensibilidade fuzzy e análise de parâmetros do AG.
8. Exporta resultados em JSON ou CSV.

---

## Escopo e limitações

### Escopo

* Recomendação de tarifa com base em cenário informado.
* Simulação de cenários sintéticos controlados.
* Comparação entre tarifa fixa, heurística simples, fuzzy manual e fuzzy otimizado.
* Login demonstrativo com cliente e administrador.
* Exportação de resultados e histórico local.
* Visualização de gráficos e justificativas.

### Não escopo

* Integração real com sensores, cancelas ou meios de pagamento.
* Coleta real de dados de veículos.
* Operação comercial completa em produção.
* Autenticação comercial robusta com banco de dados, JWT e gestão de permissões.
* Armazenamento corporativo centralizado.

---

## Declaração de uso de IA

O uso de IA generativa foi adotado como apoio ao desenvolvimento, organização textual, revisão de decisões técnicas e estruturação de documentação. Declaramos que todo material gerado por inteligência artificial foi revisado, executado e validado antes de ir para produção.

| Ferramenta           | Finalidade                                                                                                                                                                                                                                          | Prompt/comando resumido                                                                                                                                                                                                                                                                                                                                                 | Revisão crítica da equipe                                                                                                                                                                                                                                                                                                                                              |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ChatGPT 5.5 e Claude | Apoiar a estruturação do projeto em termos de código e ideias, apoiar a estruturação da documentação do produto e estruturação da apresentação. Por fim, solicitamos uma análise do projeto para verificar se estava de acordo com ambas as laudas. | “Analise essas laudas e dê ideias de projetos considerando a opção B e a lauda opção 2”, “Considerando que vamos fazer uma aplicação web, faça um esboço inicial que siga nossa ideia e esteja alinhado com a teoria”, “Otimize as funções da aplicação e a interface”, “Estruture melhor as justificativas”, “Estruture uma parte inicial da documentação do produto”. | Para a geração de ideias, ideias muito simples foram descartadas. A interface da aplicação também foi revisada e passou por mudanças. As funções que antes demoravam muito para executar na API foram otimizadas, e várias justificativas foram colocadas no site. Detalhes visuais e gramaticais também foram descartados ou revisados para melhor navegação no site. |

---

## Documentação e apresentação

A documentação técnica do produto está disponível em:

```text
relatorio/Documentacao_ParkPrice_AI.pdf
```

Os slides de apresentação estão disponíveis em:

```text
slides/slides_parkprice_ai.pdf
```

---

## Conclusão

O ParkPrice AI apresenta uma solução fuzzy-evolutiva coerente para apoio à precificação dinâmica de estacionamentos. A abordagem fuzzy Mamdani foi escolhida por permitir decisões graduais e interpretáveis em um domínio com incerteza qualitativa.

O Algoritmo Genético complementa o sistema ao otimizar pesos das regras, permitindo comparação mensurável entre configuração manual e otimizada.

A solução atende à Opção B da Parte 1 por ser documentada como produto, com problema, público-alvo, requisitos, protótipo funcional, manual, testes e limitações. Também atende à Parte 2 por incluir motor evolutivo, representação de soluções, função de aptidão, parâmetros, operadores, 5 execuções independentes e comparação com baselines.

Como trabalho acadêmico, o sistema não pretende ser um produto comercial completo, mas sim uma solução demonstrável, tecnicamente justificável e reproduzível.
