# ParkPrice AI — Sprint 1

Sistema fuzzy-evolutivo para apoio à decisão em precificação dinâmica de estacionamentos.

Esta Sprint 1 reorganiza o projeto inicial em uma arquitetura mais adequada para evolução acadêmica e demonstração:

- **Frontend React + Vite + TypeScript** para interface de produto/dashboard.
- **Backend Python + FastAPI** para cálculos, simulações e otimização.
- **Motor fuzzy Mamdani simplificado** com 4 entradas, 1 saída, 18 regras e defuzzificação por centroide.
- **Algoritmo Genético** para otimizar pesos das regras fuzzy.
- **Cenários sintéticos controlados** para comparação entre tarifa fixa, heurística simples, fuzzy manual e fuzzy otimizado.
- **Rotina de 5 execuções independentes** com sementes distintas para avaliação de estabilidade.

> Importante: esta Sprint 1 é uma base técnica inicial. A interface ajuda na demonstração, mas o foco avaliativo continua sendo modelagem fuzzy, otimização evolutiva, validação, documentação e domínio técnico da equipe.

---

## 1. Estrutura do projeto

```text
parkprice-ai-sprint1/
├── backend/
│   ├── app/
│   │   ├── main.py                  # API FastAPI
│   │   ├── schemas.py               # Validação dos payloads
│   │   └── services/
│   │       ├── fuzzy_model.py        # Modelo fuzzy Mamdani simplificado
│   │       ├── simulator.py          # Cenários, baselines e fitness
│   │       ├── genetic_optimizer.py  # Algoritmo Genético
│   │       └── metrics.py            # Métricas e resumos
│   ├── data/
│   │   └── sample_scenarios.csv      # 12 cenários sintéticos controlados
│   ├── tests/
│   │   ├── test_api.py
│   │   └── test_fuzzy_model.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/              # Componentes visuais
│   │   ├── services/api.ts           # Cliente da API
│   │   ├── App.tsx                   # Interface principal
│   │   ├── styles.css                # Paleta preto/branco/cinza
│   │   └── types.ts
│   ├── package.json
│   └── vite.config.ts
│
├── docs/
│   ├── ALINHAMENTO_LAUDA_E_GUIA.md
│   ├── API.md
│   ├── DECISOES_TECNICAS.md
│   ├── EXECUCAO.md
│   ├── SPRINT_1.md
│   └── ROTEIRO_DE_ESTUDO.md
│
├── results/
├── assets/
├── .gitignore
└── README.md
```

---

## 2. Pré-requisitos

Instale antes de executar:

- Python 3.11 ou superior
- Node.js 20 ou superior
- npm 10 ou superior

Versões anteriores podem funcionar, mas estas são as recomendadas para reduzir erro de ambiente.

---

## 3. Como executar o backend

Abra um terminal na pasta raiz do projeto e rode:

```bash
cd backend
python -m venv .venv
```

No Windows:

```bash
.venv\Scripts\activate
```

No Linux/macOS:

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

A documentação interativa do FastAPI ficará em:

```text
http://localhost:8000/docs
```

Teste rápido:

```bash
curl http://localhost:8000/health
```

Resposta esperada:

```json
{"status":"ok"}
```

---

## 4. Como executar o frontend

Em outro terminal, a partir da raiz do projeto:

```bash
cd frontend
npm install
npm run dev
```

A interface ficará disponível em:

```text
http://localhost:5173
```

Se a API estiver em outro endereço, crie um arquivo `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:8000
```

---

## 5. Como rodar os testes do backend

Com o ambiente virtual ativado:

```bash
cd backend
pytest
```

Os testes verificam:

- saúde da API;
- endpoint de recomendação;
- endpoint de simulação;
- retorno mínimo do modelo fuzzy;
- presença de pelo menos 18 regras.

---

## 6. Fluxo principal do protótipo

1. Usuário informa tarifa-base, ocupação, demanda, evento/pico e permanência média.
2. API calcula graus de pertinência das entradas.
3. Base de regras fuzzy é ativada.
4. Saída fuzzy é agregada e defuzzificada por centroide.
5. Sistema retorna multiplicador, tarifa recomendada e justificativa.
6. Simulador compara tarifa fixa, heurística simples e fuzzy manual.
7. Algoritmo Genético otimiza pesos das regras.
8. Sistema compara fuzzy manual e fuzzy otimizado.
9. Rotina de 5 sementes mede estabilidade do método evolutivo.

---

## 7. Endpoints principais

```text
GET  /health
GET  /rules
GET  /membership-functions
GET  /scenarios
POST /recommend
POST /simulate
POST /optimize
POST /experiments/run-5-seeds
```

Detalhes completos estão em `docs/API.md`.

---

## 8. O que estudar para apresentar

A equipe precisa dominar:

- problema, público-alvo e decisão apoiada;
- diferença entre tarifa fixa, heurística, fuzzy manual e fuzzy otimizado;
- variáveis fuzzy, universos de discurso e funções de pertinência;
- base de regras e justificativa das regras;
- inferência Mamdani: fuzzificação, ativação, implicação, agregação e defuzzificação;
- representação evolutiva como vetor de pesos das regras;
- função de aptidão com receita e penalidades;
- operadores do AG: seleção, crossover, mutação e elitismo;
- cenários sintéticos, baselines, curva de convergência e 5 sementes;
- limitações, riscos de uso e próximos passos.

Veja `docs/ROTEIRO_DE_ESTUDO.md`.

---

## 9. Limitações da Sprint 1

- Os dados ainda são sintéticos, não reais.
- A simulação de receita é controlada e simplificada.
- A interface ainda não exporta arquivos CSV/JSON, apesar de a arquitetura permitir isso.
- O AG otimiza pesos das regras, mas ainda não ajusta limites das funções de pertinência.
- A validação precisa ser expandida com gráficos exportáveis e análise escrita para o PDF final.

---

## 10. Próximas sprints sugeridas

- Exportação de resultados em CSV/JSON.
- Persistência local dos experimentos.
- Tela de configuração do AG.
- Estudo de sensibilidade variando pelo menos 4 parâmetros.
- Otimização também dos limites das pertinências.
- Geração de gráficos para o relatório.
- Preparação dos slides e PDF técnico.
