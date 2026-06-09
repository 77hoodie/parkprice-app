# ParkPrice AI — Sprint 2

Sistema fuzzy-evolutivo para apoio à decisão em precificação dinâmica de estacionamentos.

A Sprint 2 evolui a base da Sprint 1 para um protótipo acadêmico mais organizado para demonstração: a interface ganhou alternância entre **Modo Produto** e **Modo Apresentação**, enquanto a API Python recebeu endpoints de análise de sensibilidade, parâmetros editáveis do Algoritmo Genético e evidências experimentais mais fortes.

> A interface existe para demonstrar o produto com clareza. O foco avaliativo continua sendo: modelagem fuzzy, motor evolutivo, validação, comparação, documentação, reprodutibilidade e domínio técnico da equipe.

---

## 1. Principais entregas da Sprint 2

- Switch **Modo Produto / Modo Apresentação**.
- Presets de demonstração: dia fraco, dia comum, pico moderado, quase lotado, evento com vagas e conflito operacional.
- Dashboard mais profissional e organizado com abas por contexto.
- Parâmetros editáveis do AG: população, gerações, seed, crossover e mutação.
- Métricas de custo computacional: tempo de execução e número de avaliações.
- Análise de sensibilidade fuzzy variando uma entrada por vez.
- Análise experimental ampliada variando quatro parâmetros do AG.
- Exportação de resultados em JSON/CSV diretamente pela interface.
- Documentação nova da Sprint 2.
- Limpeza recomendada de entrega: `.git/`, `.venv/`, `node_modules/` e `dist/` não devem ir para o GitHub.

---

## 2. Estrutura do projeto

```text
parkprice-ai-sprint2/
├── backend/
│   ├── app/
│   │   ├── main.py                  # API FastAPI
│   │   ├── schemas.py               # Validação dos payloads
│   │   └── services/
│   │       ├── fuzzy_model.py        # Modelo fuzzy Mamdani simplificado
│   │       ├── simulator.py          # Cenários, baselines e fitness
│   │       ├── genetic_optimizer.py  # Algoritmo Genético e sensibilidade do AG
│   │       ├── sensitivity.py        # Sensibilidade fuzzy
│   │       └── metrics.py            # Métricas e resumos
│   ├── data/
│   │   └── sample_scenarios.csv      # 12 cenários sintéticos controlados
│   ├── tests/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/              # Componentes visuais
│   │   ├── services/api.ts           # Cliente da API
│   │   ├── App.tsx                   # Interface principal com switch de modo
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
│   ├── ROTEIRO_DE_ESTUDO.md
│   ├── SPRINT_1.md
│   └── SPRINT_2.md
│
├── assets/
├── results/
├── .gitignore
└── README.md
```

---

## 3. Pré-requisitos

Instale antes de executar:

- Python 3.11 ou superior
- Node.js 20 ou superior
- npm 10 ou superior

---

## 4. Como executar o backend

A partir da raiz do projeto:

```bash
cd backend
python -m venv .venv
```

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

Execute a API:

```bash
uvicorn app.main:app --reload
```

A API ficará disponível em:

```text
http://localhost:8000
```

Documentação interativa:

```text
http://localhost:8000/docs
```

Teste rápido:

```bash
curl http://localhost:8000/health
```

Resposta esperada:

```json
{"status":"ok","sprint":"2"}
```

---

## 5. Como executar o frontend

Em outro terminal, a partir da raiz:

```bash
cd frontend
npm install
npm run dev
```

A interface ficará disponível em:

```text
http://localhost:5173
```

Se a API estiver em outro endereço, crie `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:8000
```

---

## 6. Como rodar os testes

Backend:

```bash
cd backend
pytest
```

Build do frontend:

```bash
cd frontend
npm run build
```

Validação feita nesta Sprint 2:

```text
Backend: 7 passed
Frontend: build concluído com sucesso
```

O build pode avisar que o bundle JavaScript ficou acima de 500 kB por causa de gráficos e bibliotecas de UI. Isso não impede execução; é apenas um aviso de otimização futura.

---

## 7. Fluxo de demonstração sugerido

1. Abrir a interface em **Modo Produto**.
2. Explicar problema, público-alvo e decisão apoiada.
3. Usar um preset, por exemplo **Quase lotado**.
4. Mostrar tarifa recomendada, multiplicador e justificativa operacional.
5. Alternar para **Modo Apresentação**.
6. Mostrar regras ativadas, funções de pertinência e saída agregada.
7. Rodar simulação e comparação de estratégias.
8. Rodar AG com parâmetros editáveis.
9. Rodar 5 sementes e explicar estabilidade.
10. Abrir Experimentos e mostrar sensibilidade fuzzy e sensibilidade dos parâmetros do AG.

---

## 8. Endpoints principais

```text
GET  /health
GET  /rules
GET  /membership-functions
GET  /scenarios
POST /recommend
POST /simulate
POST /optimize
POST /experiments/run-5-seeds
POST /analysis/fuzzy-sensitivity
POST /analysis/parameter-sensitivity
```

Detalhes em `docs/API.md`.

---

## 9. O que ainda falta para a versão final

- Revisar texto final do relatório PDF.
- Adicionar declaração formal de uso de IA.
- Tirar prints ou gerar evidências visuais para o relatório.
- Definir divisão de fala entre os 5 integrantes.
- Se houver tempo, persistir histórico de experimentos em arquivo ou banco simples.
- Se houver tempo, permitir upload de cenários CSV pela interface.
- Verificar com o professor se a equipe de 5 já tem autorização formal.

---

## 10. Observação acadêmica importante

Os dados de receita, ocupação prevista e rotatividade são **sintéticos controlados**. Eles servem para comparar estratégias sob hipóteses iguais, não para prever receita real de um estacionamento específico.
