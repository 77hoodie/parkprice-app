from __future__ import annotations

from typing import Dict, Sequence

import numpy as np

from .fuzzy_model import ParkingInputs, recommend_price

VARIABLE_RANGES = {
    "occupancy": (0.0, 100.0, "Ocupacao atual (%)"),
    "demand": (0.0, 10.0, "Demanda prevista (0 a 10)"),
    "event_level": (0.0, 10.0, "Evento/pico (0 a 10)"),
    "avg_stay_minutes": (0.0, 240.0, "Permanencia media (min)"),
}


def run_fuzzy_sensitivity(
    variable: str,
    base_input: ParkingInputs,
    steps: int = 25,
    optimized_rule_weights: Sequence[float] | None = None,
) -> Dict[str, object]:
    if variable not in VARIABLE_RANGES:
        allowed = ", ".join(VARIABLE_RANGES)
        raise ValueError(f"Variavel de sensibilidade invalida. Use uma destas: {allowed}.")

    start, end, label = VARIABLE_RANGES[variable]
    rows = []
    for value in np.linspace(start, end, int(steps)):
        payload = {
            "base_rate": base_input.base_rate,
            "occupancy": base_input.occupancy,
            "demand": base_input.demand,
            "event_level": base_input.event_level,
            "avg_stay_minutes": base_input.avg_stay_minutes,
        }
        payload[variable] = float(value)
        result = recommend_price(ParkingInputs(**payload), rule_weights=optimized_rule_weights)
        rows.append(
            {
                "x": round(float(value), 4),
                "variable": variable,
                "variable_label": label,
                "multiplier": result["multiplier"],
                "recommended_rate": result["recommended_rate"],
                "label_pt": result["label_pt"],
            }
        )

    return {
        "variable": variable,
        "variable_label": label,
        "base_input": base_input.__dict__,
        "rows": rows,
        "interpretation": (
            "A analise varia uma entrada por vez mantendo as demais fixas. "
            "Isso ajuda a demonstrar sensibilidade, coerencia e possiveis limites do modelo fuzzy."
        ),
    }
