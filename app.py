from __future__ import annotations

import pandas as pd
import plotly.express as px
import streamlit as st

from src.fuzzy_model import ParkingInputs, RULES, recommend_price
from src.genetic_optimizer import optimize_rule_weights
from src.metrics import summarize_comparison
from src.simulator import load_scenarios, run_comparison


st.set_page_config(page_title="ParkPrice AI", page_icon="P", layout="wide")

st.title("ParkPrice AI")
st.caption("Recomendação dinâmica de tarifa para estacionamentos")

with st.sidebar:
    st.header("Parâmetros")
    base_rate = st.number_input("Tarifa-base por hora", min_value=1.0, max_value=50.0, value=8.0, step=0.5)
    occupancy = st.slider("Ocupação atual (%)", 0, 100, 72)
    demand = st.slider("Demanda prevista", 0.0, 10.0, 6.5, 0.5)
    event_level = st.slider("Intensidade de evento/pico", 0.0, 10.0, 4.0, 0.5)
    avg_stay_minutes = st.slider("Permanência média (min)", 0, 240, 90, 5)

inputs = ParkingInputs(
    base_rate=base_rate,
    occupancy=occupancy,
    demand=demand,
    event_level=event_level,
    avg_stay_minutes=avg_stay_minutes,
)

recommendation = recommend_price(inputs)

tab_recommendation, tab_simulation, tab_optimizer = st.tabs(
    ["Recomendação", "Simulação", "Otimização inicial"]
)

with tab_recommendation:
    col_a, col_b, col_c = st.columns(3)
    col_a.metric("Tarifa recomendada", f"R$ {recommendation['recommended_rate']:.2f}")
    col_b.metric("Multiplicador", f"{recommendation['multiplier']:.2f}x")
    col_c.metric("Classificação", str(recommendation["label"]).title())

    st.subheader("Regras mais ativadas")
    activations = pd.DataFrame(recommendation["activations"])
    st.dataframe(activations.head(8), use_container_width=True, hide_index=True)

    st.subheader("Graus de pertinência")
    membership_rows = []
    for variable, terms in recommendation["memberships"].items():
        for term, value in terms.items():
            membership_rows.append({"variable": variable, "term": term, "degree": round(value, 4)})
    st.dataframe(pd.DataFrame(membership_rows), use_container_width=True, hide_index=True)

with tab_simulation:
    st.subheader("Comparação de estratégias")
    scenarios = load_scenarios()
    comparison = run_comparison(scenarios)
    summary = summarize_comparison(comparison)

    st.dataframe(summary, use_container_width=True, hide_index=True)

    fig = px.bar(summary, x="strategy", y="total_revenue", text="total_revenue")
    fig.update_layout(xaxis_title="Estratégia", yaxis_title="Receita estimada")
    st.plotly_chart(fig, use_container_width=True)

    with st.expander("Ver cenários e resultados detalhados"):
        st.dataframe(comparison, use_container_width=True, hide_index=True)

with tab_optimizer:
    st.subheader("Ajuste evolutivo dos pesos das regras")
    st.write(
        "Esta rotina usa um algoritmo genético para buscar pesos de regras que melhorem "
        "a função de aptidão nos cenários sintéticos disponíveis."
    )

    col_a, col_b, col_c = st.columns(3)
    population_size = col_a.number_input("População", min_value=8, max_value=120, value=24, step=4)
    generations = col_b.number_input("Gerações", min_value=3, max_value=100, value=20, step=1)
    seed = col_c.number_input("Semente", min_value=0, max_value=9999, value=42, step=1)

    if st.button("Executar otimização"):
        with st.spinner("Otimizando pesos das regras..."):
            result = optimize_rule_weights(
                scenarios=load_scenarios(),
                population_size=int(population_size),
                generations=int(generations),
                seed=int(seed),
            )

        st.success("Otimização concluída.")
        st.metric("Melhor aptidão", result["fitness"])

        history = result["history"]
        fig = px.line(history, x="generation", y=["best_fitness", "average_fitness"])
        fig.update_layout(xaxis_title="Geração", yaxis_title="Aptidão")
        st.plotly_chart(fig, use_container_width=True)

        weights_df = pd.DataFrame(
            {
                "rule": [rule["name"] for rule in RULES],
                "weight": result["weights"],
            }
        )
        st.dataframe(weights_df, use_container_width=True, hide_index=True)
