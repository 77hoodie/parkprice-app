# Guia de execução — Sprint 2

## 1. Backend

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

Instalar dependências:

```bash
pip install -r requirements.txt
```

Rodar API:

```bash
uvicorn app.main:app --reload
```

URLs:

```text
API:  http://localhost:8000
Docs: http://localhost:8000/docs
```

Teste:

```bash
curl http://localhost:8000/health
```

## 2. Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

URL:

```text
http://localhost:5173
```

Caso a API esteja em outro endereço:

```bash
cd frontend
```

Criar `.env.local`:

```env
VITE_API_URL=http://localhost:8000
```

## 3. Testes

Backend:

```bash
cd backend
pytest
```

Frontend:

```bash
cd frontend
npm run build
```

## 4. Fluxo recomendado para testar manualmente

1. Rodar backend.
2. Rodar frontend.
3. Abrir `http://localhost:5173`.
4. Confirmar que o modo inicial é **Produto**.
5. Clicar em preset **Quase lotado**.
6. Conferir tarifa final, multiplicador e justificativa.
7. Alternar para **Modo Apresentação**.
8. Abrir **Modelo fuzzy** e verificar gráficos e regras.
9. Abrir **Simulação** e rodar comparação.
10. Abrir **Evolutivo** e executar AG.
11. Rodar 5 sementes.
12. Abrir **Experimentos** e executar sensibilidade fuzzy e do AG.
13. Testar exportações JSON/CSV.

## 5. Problemas comuns

### Frontend não conecta na API

Verifique se o backend está rodando em `http://localhost:8000`. Se estiver em outra porta, configure `frontend/.env.local`.

### Erro de CORS

A API já permite `http://localhost:5173` e `http://127.0.0.1:5173`. Se usar outra porta, adicione em `backend/app/main.py`.

### `npm run build` mostra aviso de bundle grande

É um aviso do Vite por causa de gráficos e ícones. Não impede execução.

### O AG demora

Reduza população e gerações na interface. Para demonstração rápida, use população 16 e gerações 10.
