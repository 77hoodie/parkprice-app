# ParkPrice AI

Sistema web de apoio à decisão para precificação dinâmica de estacionamentos. A aplicação combina uma interface React com uma API Python/FastAPI responsável pelos cálculos de lógica fuzzy, simulação de cenários e calibração por Algoritmo Genético.

A experiência foi organizada em dois perfis de acesso:

- **Cliente:** visão operacional, focada em informar o cenário do estacionamento, receber a tarifa recomendada, simular estratégias e exportar resultados.
- **Administrador:** visão avançada, com regras fuzzy, funções de pertinência, otimização evolutiva, análises de sensibilidade, execuções independentes e métricas de comparação.

O acesso usa autenticação demonstrativa local para separar fluxos de uso. Há duas contas de teste e novos clientes podem ser cadastrados com validação de e-mail, senha mínima e ciência sobre tratamento local de dados. A senha cadastrada é convertida em hash SHA-256 antes de ser salva no navegador; não há envio desses dados para a API.


## Identificação do projeto

| Campo | Informação |
|---|---|
| Instituição | CESUPA - Escola de Negócios, Tecnologia e Inovação |
| Disciplina | Inteligência Artificial e Computacional |
| Professor | Daniel Leal Souza |
| Turma | CC5MA |
| Equipe | João Pedro Almeida Follmann; Yuri Antonio Santos Fernandes; Samuel Paula Nunes Salheb; Arthur José Aviz Lima; Gabriel Cruz Filgueira |
| Parte 1 | Sistemas de Controle Fuzzy — Opção B: aplicação ou produto baseado em controle fuzzy |
| Parte 2 | IA Evolutiva e Computação Bioinspirada — Opção 2: protótipo de programa com Algoritmo Genético |
| Repositório | https://github.com/77hoodie/parkprice-app |

## Recursos principais

- Interface web em React, Vite e TypeScript.
- API em Python com FastAPI.
- Modelo fuzzy Mamdani com 4 entradas, 1 saída e 18 regras.
- Defuzzificação por centroide.
- 12 cenários sintéticos controlados.
- Comparação entre tarifa fixa, heurística simples, fuzzy manual e fuzzy otimizado.
- Algoritmo Genético para calibração dos pesos das regras fuzzy.
- Parâmetros editáveis: população, gerações, seed, crossover e mutação.
- Execuções independentes com sementes distintas.
- Análise de sensibilidade do modelo fuzzy.
- Análise de sensibilidade dos parâmetros do otimizador.
- Exportação de recomendação, simulação, histórico e análises.
- Login local com contas de teste, cadastro de cliente, validação de e-mail/senha e aviso de tratamento de dados.
- Otimização evolutiva acelerada para demonstração, mantendo a comparação final no fluxo completo do sistema.

## Estrutura

```text
parkprice-app/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── schemas.py
│   │   └── services/
│   │       ├── fuzzy_model.py
│   │       ├── genetic_optimizer.py
│   │       ├── simulator.py
│   │       ├── sensitivity.py
│   │       └── metrics.py
│   ├── data/
│   │   └── sample_scenarios.csv
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.tsx
│   │   ├── styles.css
│   │   └── types.ts
│   ├── package.json
│   └── vite.config.ts
├── docs/
├── relatorio/
│   └── Documentacao_ParkPrice_AI.pdf
├── slides/
│   └── slides_parkprice_ai.pdf
├── results/
└── README.md
```

A pasta `relatorio/` contém a documentação técnica de produto em PDF. A pasta `slides/` contém a apresentação em PDF usada como apoio visual para a demonstração.

## Como executar

### 1. API Python

Entre na pasta do backend:

```bash
cd backend
```

Crie o ambiente virtual:

```bash
python -m venv .venv
```

Ative o ambiente:

Windows:

```bash
.venv\Scripts\activate
```

Linux/macOS:

```bash
source .venv/bin/activate
```

Instale as dependências:

```bash
pip install -r requirements.txt
```

Inicie a API:

```bash
uvicorn app.main:app --reload
```

A documentação interativa da API ficará disponível em:

```text
http://localhost:8000/docs
```

### 2. Interface web

Abra outro terminal e entre na pasta do frontend:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Inicie a interface:

```bash
npm run dev
```

A aplicação ficará disponível em:

```text
http://localhost:5173
```

## Fluxo sugerido de uso

1. Entrar com uma das contas de teste:
   - Cliente: `cliente@parkprice.ai` / `cliente123`
   - Administrador: `admin@parkprice.ai` / `admin123`
2. Opcionalmente, cadastrar um novo cliente com e-mail e senha.
3. Entrar como **Cliente**.
4. Usar os cenários rápidos em **Recomendação**.
5. Conferir a tarifa recomendada, multiplicador, justificativa operacional e guia de interpretação.
6. Abrir **Simulação** para comparar estratégias e ler a análise do gráfico.
7. Sair e entrar como **Administrador**.
8. Abrir **Modelo** para ver pertinências e regras.
9. Abrir **Otimização** e executar a calibração por Algoritmo Genético.
10. Rodar execuções independentes.
11. Abrir **Análises** e executar sensibilidade do modelo e do otimizador.
12. Exportar resultados em JSON ou CSV quando necessário.

## Arquivos finais incluídos

- `relatorio/Documentacao_ParkPrice_AI.pdf`: documentação técnica de produto e validação fuzzy-evolutiva.
- `slides/slides_parkprice_ai.pdf`: apresentação visual do ParkPrice AI para apoio à demonstração.
- `README.md`: guia de execução, identificação da equipe, contas de teste, estrutura do projeto e declaração de uso de IA.

## Testes

Na pasta `backend`, execute:

```bash
python -m pytest -q
```

Resultado validado nesta versão:

```text
7 passed
```

Na pasta `frontend`, execute:

```bash
npm run build
```

Resultado validado nesta versão: build concluído com sucesso. O Vite pode emitir aviso de bundle grande por causa da biblioteca de gráficos, mas isso não impede a execução.

## Documentação adicional

- `docs/ALTERACOES_WEB_APP.md`: resumo das mudanças finais da interface.
- `docs/EXECUCAO.md`: passo a passo completo de instalação e uso.
- `docs/API.md`: endpoints principais da API.
- `docs/DECISOES_TECNICAS.md`: justificativas de arquitetura e modelagem.
- `docs/ALINHAMENTO_LAUDA_E_GUIA.md`: conferência de aderência às atividades.
- `docs/ROTEIRO_OPERACIONAL_DEMO.md`: roteiro de demonstração no dia.
- `docs/CHECKLIST_FINAL.md`: lista de verificação antes da submissão.
- `docs/DECLARACAO_USO_IA_MODELO.md`: modelo inicial para declaração de uso de IA.

## Declaração de uso de IA

A equipe utilizou ferramentas de IA generativa como apoio ao desenvolvimento, organização e revisão do projeto ParkPrice AI.

| Ferramenta | Finalidade | Prompt/comando resumido | Revisão crítica da equipe |
|---|---|---|---|
| ChatGPT | Apoio na estruturação do projeto, documentação, sugestões de arquitetura, revisão de requisitos, organização de roteiro e geração inicial de trechos de código. | Solicitações sobre arquitetura React + FastAPI, modelagem fuzzy, Algoritmo Genético, documentação e preparação de apresentação. | A equipe revisou, executou, testou, ajustou e assumiu responsabilidade pelo conteúdo final. |
| Assistente de código/editor, se usado | Apoio à escrita e correção de código. | Autocomplete, refatoração e depuração. | Código executado localmente e confrontado com o comportamento esperado. |

A IA foi usada como ferramenta de apoio. As decisões finais de modelagem, validação, execução, interpretação dos resultados e apresentação são de responsabilidade da equipe.
