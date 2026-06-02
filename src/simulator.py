from __future__ import annotations

from pathlib import Path
from typing import Iterable, Sequence

import pandas as pd

from .fuzzy_model import ParkingInputs, recommend_price


DEFAULT_BASE_RATE = 8.0


def load_scenarios(path: str | Path = "data/sample_scenarios.csv") -> pd.DataFrame:
    return pd.read_csv(path)


def simple_heuristic_rate(base_rate: float, occupancy: float) -> float:
    if occupancy >= 85:
        return round(base_rate * 1.30, 2)
    if occupancy <= 35:
        return round(base_rate * 0.90, 2)
    return round(base_rate, 2)


def estimate_revenue(price: float, occupancy: float, demand: float, event_level: float, capacity: int = 100) -> float:
    price_pressure = max(0.55, 1.0 - max(price - DEFAULT_BASE_RATE, 0) * 0.035)
    demand_factor = 0.70 + (demand / 10) * 0.30 + (event_level / 10) * 0.15
    occupied_spaces = min(capacity, max(0, capacity * (occupancy / 100) * demand_factor * price_pressure))
    return round(occupied_spaces * price, 2)


def run_comparison(scenarios: pd.DataFrame, rule_weights: Sequence[float] | None = None) -> pd.DataFrame:
    rows = []

    for _, scenario in scenarios.iterrows():
        base_rate = float(scenario.get("base_rate", DEFAULT_BASE_RATE))
        occupancy = float(scenario["occupancy"])
        demand = float(scenario["demand"])
        event_level = float(scenario["event_level"])
        avg_stay_minutes = float(scenario["avg_stay_minutes"])

        fuzzy = recommend_price(
            ParkingInputs(
                base_rate=base_rate,
                occupancy=occupancy,
                demand=demand,
                event_level=event_level,
                avg_stay_minutes=avg_stay_minutes,
            ),
            rule_weights=rule_weights,
        )

        strategies = {
            "fixed": base_rate,
            "heuristic": simple_heuristic_rate(base_rate, occupancy),
            "fuzzy": float(fuzzy["recommended_rate"]),
        }

        for strategy, price in strategies.items():
            rows.append(
                {
                    "scenario": scenario.get("scenario", "unnamed"),
                    "strategy": strategy,
                    "price": round(price, 2),
                    "revenue_estimate": estimate_revenue(price, occupancy, demand, event_level),
                    "occupancy": occupancy,
                    "demand": demand,
                    "event_level": event_level,
                    "avg_stay_minutes": avg_stay_minutes,
                }
            )

    return pd.DataFrame(rows)


def fitness_from_comparison(comparison: pd.DataFrame) -> float:
    fuzzy_rows = comparison[comparison["strategy"] == "fuzzy"]
    average_revenue = fuzzy_rows["revenue_estimate"].mean()
    average_price = fuzzy_rows["price"].mean()

    fairness_penalty = max(0, average_price - 13.0) * 80
    low_price_penalty = max(0, 7.0 - average_price) * 40

    return float(average_revenue - fairness_penalty - low_price_penalty)
