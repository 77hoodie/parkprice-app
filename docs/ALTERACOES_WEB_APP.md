# Alterações finais do web app

## 1. Página de login

A aplicação agora abre em uma página de login, não mais em seleção direta de perfil. Foram adicionadas duas contas de teste:

| Perfil | E-mail | Senha | Acesso |
|---|---|---|---|
| Cliente | `cliente@parkprice.ai` | `cliente123` | Recomendação, simulação, histórico e guias operacionais |
| Administrador | `admin@parkprice.ai` | `admin123` | Recursos do cliente + modelo, regras, otimização e análises |

A tela mantém botões para preencher rapidamente as credenciais de teste, mas o acesso acontece pelo formulário de login.

## 2. Cadastro de novos clientes

Foi criado um fluxo de cadastro para novos clientes. Esse cadastro é restrito ao perfil Cliente; contas administrativas não podem ser criadas pela tela pública.

Tratamentos implementados:

- validação de formato de e-mail;
- bloqueio de e-mail já cadastrado;
- senha mínima de 8 caracteres;
- confirmação de senha;
- aceite explícito do aviso de tratamento local dos dados;
- armazenamento apenas no navegador usado na demonstração;
- conversão da senha em hash SHA-256 antes de salvar localmente;
- aviso para não usar senhas reais nem dados sensíveis.

Esse recurso não pretende substituir autenticação empresarial completa. Ele existe para melhorar o fluxo de produto, organizar os atores e demonstrar controle básico de acesso de forma coerente com o escopo solicitado.

## 3. Separação por atores

### Cliente

O cliente visualiza apenas o necessário para operação:

- início;
- recomendação;
- simulação;
- histórico.

Foram adicionados textos de orientação para explicar os resultados sem exigir conhecimento técnico. A recomendação agora traz uma leitura prática sobre ocupação, demanda, permanência e ação sugerida. A simulação também explica como ler o gráfico de comparação.

### Administrador

O administrador visualiza:

- início;
- recomendação;
- simulação;
- histórico;
- modelo;
- otimização;
- análises;
- operação.

Essa área preserva os elementos técnicos necessários para auditoria e defesa: funções de pertinência, base de regras, Algoritmo Genético, curva de convergência, execuções independentes e sensibilidade.

## 4. Otimização e análises aceleradas

As rotinas de otimização estavam lentas para uma demonstração ao vivo. O backend foi revisado para acelerar a avaliação interna do Algoritmo Genético.

Mudanças realizadas:

- pré-cálculo das curvas de saída do modelo fuzzy;
- pré-cálculo das ativações das regras para os cenários fixos;
- uso de uma avaliação rápida da função de aptidão durante a busca evolutiva;
- manutenção da comparação final pelo fluxo completo de recomendação e simulação;
- preservação das métricas exigidas: aptidão, gerações, avaliações, tempo, curva de convergência, múltiplas sementes e comparação com baseline.

Resultado validado no ambiente de desenvolvimento:

- calibração padrão: execução em fração de segundo;
- 5 execuções independentes: execução em fração de segundo;
- análise de parâmetros do otimizador: execução em fração de segundo.

## 5. Guias para cliente

Foram adicionados blocos de interpretação no perfil Cliente:

- leitura de ocupação;
- leitura de demanda;
- leitura de permanência;
- orientação prática conforme a classe da tarifa;
- explicação do gráfico de comparação;
- aviso de que as simulações são estimativas sob hipóteses controladas, não promessa de receita real.

Isso melhora a usabilidade e evita que o usuário precise entender lógica fuzzy ou Algoritmo Genético para tomar uma decisão operacional.

## 6. Alinhamento com as laudas

As mudanças não removem os requisitos técnicos. O produto continua mantendo:

- Parte 1, Opção B: aplicação/produto baseado em controle fuzzy;
- modelo Mamdani;
- 4 entradas, 1 saída, 18 regras e 12 cenários;
- funções de pertinência visualizáveis;
- inferência, defuzzificação e análise de sensibilidade;
- Parte 2, Opção 2: protótipo de programa com Algoritmo Genético;
- representação por pesos das regras;
- função de aptidão;
- parâmetros, operadores e critério de parada;
- comparação com tarifa fixa, heurística simples e fuzzy manual;
- 5 execuções independentes com sementes distintas;
- métricas de tempo, avaliações, convergência, melhor, média e desvio-padrão.
