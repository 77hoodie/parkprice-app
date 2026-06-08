# Passo a passo de instalação e execução

Este documento descreve como executar a Sprint 1 do ParkPrice AI em ambiente local.

## 1. Baixar e extrair

Extraia o arquivo ZIP em uma pasta de trabalho. Entre na pasta raiz:

```bash
cd parkprice-ai-sprint1
```

## 2. Executar o backend Python

```bash
cd backend
python -m venv .venv
```

Ativar ambiente virtual:

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

Subir servidor:

```bash
uvicorn app.main:app --reload
```

Acesse:

```text
http://localhost:8000/docs
```

## 3. Executar frontend React

Abra outro terminal na raiz do projeto:

```bash
cd frontend
npm install
npm run dev
```

Acesse:

```text
http://localhost:5173
```

## 4. Verificar se tudo está conectado

1. Backend aberto em `http://localhost:8000`.
2. Frontend aberto em `http://localhost:5173`.
3. Na interface, clique em `Calcular recomendação`.
4. Depois entre em `Simulação` e rode os cenários.
5. Depois entre em `Evolutivo` e rode o AG.
6. Por fim, rode `5 sementes` para gerar estatísticas de estabilidade.

## 5. Rodar testes

No terminal do backend, com ambiente virtual ativado:

```bash
pytest
```

## 6. Problemas comuns

### Erro de CORS

Confirme se o frontend está em `http://localhost:5173`. Esse endereço já está liberado no backend.

### Frontend não acha a API

Crie `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:8000
```

Reinicie o frontend.

### Erro no DEAP

Instale novamente as dependências no ambiente virtual:

```bash
pip install -r requirements.txt
```

### Porta ocupada

Backend em outra porta:

```bash
uvicorn app.main:app --reload --port 8001
```

Depois ajuste `VITE_API_URL` no frontend.
