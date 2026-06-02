# ParkPrice AI

ParkPrice AI é uma aplicação web para recomendação dinâmica de tarifa em estacionamentos. A solução combina um modelo fuzzy interpretável com uma camada inicial de otimização evolutiva para ajustar pesos de regras e comparar estratégias de precificação.

## Recursos iniciais

- Recomendação de tarifa por hora a partir de ocupação, demanda, intensidade de evento e tempo médio de permanência.
- Modelo fuzzy com regras legíveis e multiplicador de tarifa.
- Simulação com cenários sintéticos controlados.
- Comparação entre tarifa fixa, heurística simples e recomendação fuzzy.
- Otimização inicial dos pesos das regras com algoritmo genético.
- Interface web em Streamlit.
- Testes automatizados básicos.

## Tecnologias

- Python
- Streamlit
- NumPy
- pandas
- Plotly
- DEAP
- scikit-fuzzy
- pytest

## Estrutura do repositório

```text
parkprice-ai/
├── app.py
├── requirements.txt
├── README.md
├── src/
│   ├── fuzzy_model.py
│   ├── genetic_optimizer.py
│   ├── simulator.py
│   ├── metrics.py
│   └── utils.py
├── data/
│   └── sample_scenarios.csv
├── results/
├── tests/
├── docs/
└── assets/
```

## Como executar

### 1. Criar ambiente virtual

No Windows:

```bash
python -m venv .venv
.venv\Scripts\activate
```

No Linux ou macOS:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Instalar dependências

```bash
pip install -r requirements.txt
```

### 3. Abrir a aplicação

```bash
streamlit run app.py
```

Depois disso, acesse o endereço local exibido pelo Streamlit no terminal.

## Rodar testes

```bash
pytest
```

## Fluxo principal

1. Informar tarifa-base, ocupação, demanda, intensidade de evento e permanência média.
2. Obter o multiplicador fuzzy e a tarifa recomendada.
3. Visualizar as regras mais ativadas.
4. Comparar estratégias em cenários sintéticos.
5. Executar uma otimização inicial dos pesos das regras.

## Próximos passos técnicos

- Ampliar a base de cenários sintéticos.
- Adicionar persistência de resultados.
- Permitir upload de dados reais ou simulados.
- Exportar tabelas em CSV ou XLSX.
- Refinar a função de aptidão.
- Criar gráficos adicionais para sensibilidade das variáveis.
- Ajustar parâmetros das funções de pertinência via otimização evolutiva.

## Observação

Esta é uma base inicial. A arquitetura foi mantida simples para facilitar manutenção, testes e evolução incremental.
