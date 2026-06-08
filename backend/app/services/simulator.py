from __future__ import annotations

from pathlib import Path
from typing import Dict, Sequence

import pandas as pd

from .fuzzy_model import ParkingInputs, recommend_price

PROJECT_BACKEND_DIR = Path(__file__).resolve().parents[2]
DEFAULT_SCENARIOS_PATH = PROJECT_BACKEND_DIR / "data" / "sample_scenarios.csv"
DEFAULT_CAPACITY = 100


def load_scenarios(path: str | Path = DEFAULT_SCENARIOS_PATH) -> pd.DataFrame:
    return pd.read_csv(path)


def simple_heuristic_rate(base_rate: float, occupancy: float) -> float:
    """Baseline simples para comparacao exigida na lauda."""
    if occupancy >= 80:
        return round(base_rate * 1.20, 2)
    if occupancy <= 40:
        return round(base_rate * 0.90, 2)
    return round(base_rate, 2)


def estimate_operation(price: float, base_rate: float, occupancy: float, demand: float, event_level: float, avg_stay_minutes: float) -> Dict[str, float]:
    """Simula de forma controlada receita, ocupacao prevista e rotatividade.

    Estes dados sao sinteticos e servem para validacao academica. O objetivo e comparar
    estrategias de precificacao sob as mesmas hipoteses, nao prever receita real.
    """

    multiplier = price / base_rate if base_rate else 1.0
    price_pressure = max(0.50, 1.0 - max(multiplier - 1.0, 0) * 0.28 + max(1.0 - multiplier, 0) * 0.10)
    demand_factor = 0.72 + (demand / 10) * 0.28 + (event_level / 10) * 0.12
    predicted_occupancy = max(0.0, min(100.0, occupancy * demand_factor * price_pressure))
    turnover_index = max(0.40, min(1.60, 120.0 / max(avg_stay_minutes, 30.0)))
    occupied_spaces = DEFAULT_CAPACITY * predicted_occupancy / 100.0
    revenue_estimate = occupied_spaces * price * turnover_index

    return {
        "multiplier": round(multiplier, 4),
        "predicted_occupancy": round(predicted_occupancy, 2),
        "turnover_index": round(turnover_index, 4),
        "revenue_estimate": round(revenue_estimate, 2),
    }


def scenario_to_inputs(scenario: pd.Series) -> ParkingInputs:
    return ParkingInputs(
        base_rate=float(scenario.get("base_rate", 8.0)),
        occupancy=float(scenario["occupancy"]),
        demand=float(scenario["demand"]),
        event_level=float(scenario["event_level"]),
        avg_stay_minutes=float(scenario["avg_stay_minutes"]),
    )


def run_comparison(scenarios: pd.DataFrame, optimized_rule_weights: Sequence[float] | None = None) -> pd.DataFrame:
    rows = []

    for _, scenario in scenarios.iterrows():
        inputs = scenario_to_inputs(scenario)
        fuzzy_manual = recommend_price(inputs)

        strategies = {
            "tarifa_fixa": inputs.base_rate,
            "heuristica_simples": simple_heuristic_rate(inputs.base_rate, inputs.occupancy),
            "fuzzy_manual": float(fuzzy_manual["recommended_rate"]),
        }

        if optimized_rule_weights is not None:
            fuzzy_optimized = recommend_price(inputs, rule_weights=optimized_rule_weights)
            strategies["fuzzy_otimizado"] = float(fuzzy_optimized["recommended_rate"])

        for strategy, price in strategies.items():
            operation = estimate_operation(
                price=price,
                base_rate=inputs.base_rate,
                occupancy=inputs.occupancy,
                demand=inputs.demand,
                event_level=inputs.event_level,
                avg_stay_minutes=inputs.avg_stay_minutes,
            )
            rows.append(
                {
                    "scenario": scenario.get("scenario", "unnamed"),
                    "description": scenario.get("description", ""),
                    "expected_behavior": scenario.get("expected_behavior", ""),
                    "strategy": strategy,
                    "price": round(float(price), 2),
                    "base_rate": round(inputs.base_rate, 2),
                    "occupancy": inputs.occupancy,
                    "demand": inputs.demand,
                    "event_level": inputs.event_level,
                    "avg_stay_minutes": inputs.avg_stay_minutes,
                    **operation,
                }
            )

    return pd.DataFrame(rows)


def evaluate_fuzzy_weights(scenarios: pd.DataFrame, rule_weights: Sequence[float]) -> pd.DataFrame:
    return run_comparison(scenarios, optimized_rule_weights=rule_weights).query("strategy == 'fuzzy_otimizado'").copy()


def fitness_for_weights(scenarios: pd.DataFrame, rule_weights: Sequence[float]) -> float:
    rows = evaluate_fuzzy_weights(scenarios, rule_weights)
    avg_revenue = float(rows["revenue_estimate"].mean())
    avg_multiplier = float(rows["multiplier"].mean())
    avg_occupancy = float(rows["predicted_occupancy"].mean())

    occupancy_penalty = 0.0
    for value in rows["predicted_occupancy"]:
        if value < 60:
            occupancy_penalty += (60 - value) * 2.0
        elif value > 92:
            occupancy_penalty += (value - 92) * 4.0

    fairness_penalty = max(0.0, avg_multiplier - 1.55) * 180.0
    low_turnover_penalty = float((rows["avg_stay_minutes"] > 170).sum()) * max(0.0, avg_multiplier - 1.35) * 25.0
    stability_penalty = float(rows["price"].std() or 0.0) * 1.5

    return round(avg_revenue - occupancy_penalty - fairness_penalty - low_turnover_penalty - stability_penalty, 6)
