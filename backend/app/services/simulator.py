from __future__ import annotations

from pathlib import Path
from typing import Dict, List, Sequence

import pandas as pd

from .fuzzy_model import OUTPUT_CENTERS, RULES, ParkingInputs, build_memberships, clamp, recommend_price

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



def build_scenario_profiles(scenarios: pd.DataFrame) -> List[Dict[str, object]]:
    """Precalcula ativacoes puras das regras para acelerar o Algoritmo Genetico.

    A recomendacao exibida ao usuario continua usando a inferencia Mamdani detalhada.
    Para avaliar milhares de individuos durante a calibracao, o AG usa os mesmos graus
    de ativacao e os centros dos consequentes como aproximacao rapida da saida. O melhor
    individuo encontrado volta a ser comparado pelo fluxo completo do sistema.
    """

    profiles: List[Dict[str, object]] = []
    for _, scenario in scenarios.iterrows():
        inputs = scenario_to_inputs(scenario)
        memberships = build_memberships(inputs)
        rule_activations: List[float] = []
        rule_centers: List[float] = []
        for rule in RULES:
            conditions = rule["if"]
            degrees = [memberships[var][term] for var, term in conditions]  # type: ignore[index]
            activation = min(degrees) if degrees else 0.0
            rule_activations.append(float(activation))
            rule_centers.append(float(OUTPUT_CENTERS[str(rule["then"])]))
        profiles.append(
            {
                "base_rate": inputs.base_rate,
                "occupancy": inputs.occupancy,
                "demand": inputs.demand,
                "event_level": inputs.event_level,
                "avg_stay_minutes": inputs.avg_stay_minutes,
                "rule_activations": rule_activations,
                "rule_centers": rule_centers,
            }
        )
    return profiles


def fast_fitness_for_weights_from_profiles(profiles: Sequence[Dict[str, object]], rule_weights: Sequence[float]) -> float:
    """Avaliacao rapida usada internamente pelo AG.

    Evita reconstruir tabelas e graficos Mamdani para cada individuo. Isso torna a
    demonstracao viavel sem retirar do sistema a comparacao final com o modelo completo.
    """

    revenues: List[float] = []
    multipliers: List[float] = []
    predicted_occupancies: List[float] = []
    prices: List[float] = []
    long_stay_count = 0

    weights = [clamp(float(weight), 0.10, 3.00) for weight in rule_weights]
    for profile in profiles:
        activations = profile["rule_activations"]  # type: ignore[assignment]
        centers = profile["rule_centers"]  # type: ignore[assignment]
        numerator = 0.0
        denominator = 0.0
        for activation, center, weight in zip(activations, centers, weights):  # type: ignore[arg-type]
            weighted_activation = clamp(float(activation) * weight, 0.0, 1.0)
            if weighted_activation > 0:
                numerator += weighted_activation * float(center)
                denominator += weighted_activation

        multiplier = 1.0 if denominator <= 0 else numerator / denominator
        multiplier = clamp(multiplier, 0.70, 1.80)
        base_rate = float(profile["base_rate"])
        price = round(base_rate * multiplier, 2)
        operation = estimate_operation(
            price=price,
            base_rate=base_rate,
            occupancy=float(profile["occupancy"]),
            demand=float(profile["demand"]),
            event_level=float(profile["event_level"]),
            avg_stay_minutes=float(profile["avg_stay_minutes"]),
        )
        revenues.append(float(operation["revenue_estimate"]))
        multipliers.append(float(operation["multiplier"]))
        predicted_occupancies.append(float(operation["predicted_occupancy"]))
        prices.append(price)
        if float(profile["avg_stay_minutes"]) > 170:
            long_stay_count += 1

    avg_revenue = sum(revenues) / len(revenues)
    avg_multiplier = sum(multipliers) / len(multipliers)
    occupancy_penalty = 0.0
    for value in predicted_occupancies:
        if value < 60:
            occupancy_penalty += (60 - value) * 2.0
        elif value > 92:
            occupancy_penalty += (value - 92) * 4.0

    fairness_penalty = max(0.0, avg_multiplier - 1.55) * 180.0
    low_turnover_penalty = long_stay_count * max(0.0, avg_multiplier - 1.35) * 25.0
    if len(prices) > 1:
        mean_price = sum(prices) / len(prices)
        variance = sum((price - mean_price) ** 2 for price in prices) / (len(prices) - 1)
        stability_penalty = (variance ** 0.5) * 1.5
    else:
        stability_penalty = 0.0

    return round(avg_revenue - occupancy_penalty - fairness_penalty - low_turnover_penalty - stability_penalty, 6)


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
