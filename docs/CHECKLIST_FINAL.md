# Checklist final

## Código

- [ ] API inicia com `uvicorn app.main:app --reload`.
- [ ] Frontend inicia com `npm run dev`.
- [ ] Backend passa em `python -m pytest -q`.
- [ ] Frontend compila com `npm run build`.
- [ ] Não há `node_modules`, `.venv` ou `dist` no pacote final.
- [ ] README contém comandos de execução.
- [ ] GitHub está acessível ao professor.

## Interface

- [ ] Tela de acesso aparece corretamente.
- [ ] Cliente acessa Início, Recomendação, Simulação e Histórico.
- [ ] Administrador acessa Modelo, Otimização, Análises e Operação.
- [ ] Cenários rápidos funcionam.
- [ ] Exportações funcionam.
- [ ] Histórico registra recomendações da sessão.

## Modelo fuzzy

- [ ] 4 entradas documentadas.
- [ ] 1 saída documentada.
- [ ] Funções de pertinência visíveis.
- [ ] 18 regras disponíveis.
- [ ] Defuzzificação por centroide explicada.
- [ ] Cenários de teste analisados.

## Algoritmo Genético

- [ ] Representação por pesos de regras explicada.
- [ ] População explicada.
- [ ] Seleção explicada.
- [ ] Crossover explicado.
- [ ] Mutação explicada.
- [ ] Elitismo explicado.
- [ ] Função de aptidão explicada.
- [ ] Execuções independentes demonstradas.
- [ ] Sensibilidade de quatro parâmetros demonstrada.

## Documentação

- [ ] Relatório técnico pronto.
- [ ] Guia de apresentação pronto.
- [ ] Slides prontos.
- [ ] Declaração de uso de IA pronta.
- [ ] Referências revisadas.
- [ ] Contribuição dos integrantes documentada.

## Verificações adicionadas na versão final do web app

- [ ] Login abre antes do painel principal.
- [ ] Conta Cliente funciona: `cliente@parkprice.ai` / `cliente123`.
- [ ] Conta Administrador funciona: `admin@parkprice.ai` / `admin123`.
- [ ] Cadastro de novo cliente valida e-mail, senha, confirmação e aceite de dados.
- [ ] Cliente cadastrado consegue acessar apenas visão operacional.
- [ ] Cliente visualiza guias de interpretação na recomendação e na simulação.
- [ ] Administrador acessa modelo, otimização e análises.
- [ ] Calibração por Algoritmo Genético executa rapidamente.
- [ ] 5 execuções independentes executam rapidamente.
- [ ] Análise de parâmetros executa rapidamente e varia população, gerações, crossover e mutação.
- [ ] Backend continua passando nos testes automatizados.
- [ ] Frontend continua gerando build de produção.
