# Guia de execução

Este guia descreve como executar o ParkPrice AI localmente.

## Requisitos

- Python 3.10 ou superior.
- Node.js 18 ou superior.
- npm.

## 1. Executar API

Entre na pasta do backend:

```bash
cd backend
```

Crie um ambiente virtual:

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

Endereços úteis:

```text
API: http://localhost:8000
Swagger: http://localhost:8000/docs
Health check: http://localhost:8000/health
```

## 2. Executar interface

Em outro terminal, entre na pasta do frontend:

```bash
cd frontend
```

Instale dependências:

```bash
npm install
```

Rode o servidor de desenvolvimento:

```bash
npm run dev
```

Abra:

```text
http://localhost:5173
```

## 3. Perfis de acesso

A tela inicial oferece dois perfis:

- **Cliente:** fluxo comercial e operacional.
- **Administrador:** recursos avançados de modelo, otimização e análise.

Não há senha real. O objetivo é separar a experiência por ator de uso.

## 4. Roteiro rápido de verificação

1. Abra a interface.
2. Entre como Cliente.
3. Acesse Recomendação.
4. Clique no preset “Quase lotado”.
5. Confira tarifa, multiplicador e justificativa.
6. Acesse Simulação.
7. Atualize a simulação e veja a comparação de estratégias.
8. Acesse Histórico e confira o registro da recomendação.
9. Saia e entre como Administrador.
10. Abra Modelo e confira pertinências e regras.
11. Abra Otimização e execute a calibração.
12. Rode execuções independentes.
13. Abra Análises e execute sensibilidade do modelo e do otimizador.

## 5. Testes

Backend:

```bash
cd backend
python -m pytest -q
```

Frontend:

```bash
cd frontend
npm run build
```

Resultados validados:

```text
Backend: 7 passed
Frontend: build concluído com sucesso
```

## Acesso ao sistema

A aplicação possui uma página de login com duas contas de teste:

| Perfil | E-mail | Senha |
|---|---|---|
| Cliente | `cliente@parkprice.ai` | `cliente123` |
| Administrador | `admin@parkprice.ai` | `admin123` |

Também é possível cadastrar novos clientes pela própria tela de acesso. O cadastro exige e-mail válido, senha com pelo menos 8 caracteres, confirmação de senha e aceite do aviso de tratamento local de dados.

### Observação sobre dados cadastrados

Os clientes cadastrados são salvos somente no `localStorage` do navegador usado na demonstração. A senha informada é convertida em hash SHA-256 antes de ser armazenada. Nenhum cadastro de cliente é enviado para a API Python.

Esse comportamento é intencional para manter o escopo do trabalho: a autenticação organiza os atores e melhora a experiência de produto, sem transformar o sistema em uma plataforma comercial completa.

## Fluxo recomendado para demonstração rápida

1. Iniciar backend com `uvicorn app.main:app --reload`.
2. Iniciar frontend com `npm run dev`.
3. Abrir `http://localhost:5173`.
4. Entrar como cliente usando `cliente@parkprice.ai` e `cliente123`.
5. Abrir **Recomendação** e usar os cenários rápidos.
6. Ler a justificativa e o guia operacional do cliente.
7. Abrir **Simulação**, atualizar o gráfico e ler a análise.
8. Sair e entrar como administrador usando `admin@parkprice.ai` e `admin123`.
9. Abrir **Modelo** para mostrar pertinências e regras.
10. Abrir **Otimização** para executar a calibração e as 5 execuções independentes.
11. Abrir **Análises** para rodar sensibilidade do modelo e sensibilidade dos parâmetros do otimizador.

As rotinas de otimização foram ajustadas para demonstração ao vivo e devem executar rapidamente.
