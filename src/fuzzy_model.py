from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Sequence

import numpy as np


@dataclass(frozen=True)
class ParkingInputs:
    base_rate: float
    occupancy: float
    demand: float
    event_level: float
    avg_stay_minutes: float


OUTPUT_VALUES = {
    "discount": 0.85,
    "normal": 1.00,
    "moderate": 1.20,
    "high": 1.45,
    "critical": 1.70,
}

RULES = [
    {"name": "R01", "if": [("occupancy", "low"), ("demand", "low")], "then": "discount"},
    {"name": "R02", "if": [("occupancy", "low"), ("event", "strong")], "then": "normal"},
    {"name": "R03", "if": [("occupancy", "medium"), ("demand", "low")], "then": "normal"},
    {"name": "R04", "if": [("occupancy", "medium"), ("demand", "medium")], "then": "normal"},
    {"name": "R05", "if": [("occupancy", "medium"), ("demand", "high")], "then": "moderate"},
    {"name": "R06", "if": [("occupancy", "high"), ("demand", "medium")], "then": "moderate"},
    {"name": "R07", "if": [("occupancy", "high"), ("demand", "high")], "then": "high"},
    {"name": "R08", "if": [("occupancy", "critical"), ("demand", "high")], "then": "critical"},
    {"name": "R09", "if": [("occupancy", "critical"), ("event", "strong")], "then": "critical"},
    {"name": "R10", "if": [("occupancy", "high"), ("stay", "long")], "then": "high"},
    {"name": "R11", "if": [("occupancy", "low"), ("stay", "short")], "then": "discount"},
    {"name": "R12", "if": [("occupancy", "medium"), ("stay", "long")], "then": "moderate"},
    {"name": "R13", "if": [("demand", "high"), ("event", "strong")], "then": "high"},
    {"name": "R14", "if": [("demand", "low"), ("event", "none")], "then": "discount"},
    {"name": "R15", "if": [("event", "moderate"), ("demand", "medium")], "then": "moderate"},
    {"name": "R16", "if": [("event", "strong"), ("stay", "long")], "then": "high"},
    {"name": "R17", "if": [("occupancy", "critical"), ("stay", "long")], "then": "critical"},
    {"name": "R18", "if": [("occupancy", "high"), ("event", "none"), ("demand", "low")], "then": "moderate"},
]


def triangular(x: float, a: float, b: float, c: float) -> float:
    if x <= a or x >= c:
        return 0.0
    if x == b:
        return 1.0
    if x < b:
        return (x - a) / (b - a)
    return (c - x) / (c - b)


def trapezoidal(x: float, a: float, b: float, c: float, d: float) -> float:
    if x <= a or x >= d:
        return 0.0
    if b <= x <= c:
        return 1.0
    if x < b:
        return (x - a) / (b - a)
    return (d - x) / (d - c)


def clamp(value: float, minimum: float, maximum: float) -> float:
    return float(max(minimum, min(maximum, value)))


def build_memberships(inputs: ParkingInputs) -> Dict[str, Dict[str, float]]:
    occupancy = clamp(inputs.occupancy, 0, 100)
    demand = clamp(inputs.demand, 0, 10)
    event = clamp(inputs.event_level, 0, 10)
    stay = clamp(inputs.avg_stay_minutes, 0, 240)

    return {
        "occupancy": {
            "low": trapezoidal(occupancy, 0, 0, 25, 45),
            "medium": triangular(occupancy, 30, 55, 75),
            "high": triangular(occupancy, 60, 80, 95),
            "critical": trapezoidal(occupancy, 85, 95, 100, 100.1),
        },
        "demand": {
            "low": trapezoidal(demand, 0, 0, 2.5, 4.5),
            "medium": triangular(demand, 3, 5.5, 8),
            "high": trapezoidal(demand, 6.5, 8.5, 10, 10.1),
        },
        "event": {
            "none": trapezoidal(event, 0, 0, 2, 4),
            "moderate": triangular(event, 3, 5.5, 8),
            "strong": trapezoidal(event, 6.5, 8.5, 10, 10.1),
        },
        "stay": {
            "short": trapezoidal(stay, 0, 0, 45, 75),
            "medium": triangular(stay, 60, 105, 150),
            "long": trapezoidal(stay, 130, 170, 240, 240.1),
        },
    }


def infer_multiplier(inputs: ParkingInputs, rule_weights: Sequence[float] | None = None) -> Dict[str, object]:
    memberships = build_memberships(inputs)
    weights = list(rule_weights) if rule_weights is not None else [1.0] * len(RULES)

    if len(weights) != len(RULES):
        raise ValueError(f"Expected {len(RULES)} rule weights, received {len(weights)}.")

    numerator = 0.0
    denominator = 0.0
    activations: List[Dict[str, object]] = []

    for rule, weight in zip(RULES, weights):
        degrees = [memberships[var][term] for var, term in rule["if"]]
        activation = min(degrees)
        weighted_activation = activation * clamp(float(weight), 0.1, 3.0)
        output_value = OUTPUT_VALUES[rule["then"]]

        numerator += weighted_activation * output_value
        denominator += weighted_activation

        activations.append(
            {
                "rule": rule["name"],
                "condition": " AND ".join(f"{var}={term}" for var, term in rule["if"]),
                "output": rule["then"],
                "activation": round(float(activation), 4),
                "weight": round(float(weight), 4),
            }
        )

    multiplier = numerator / denominator if denominator else OUTPUT_VALUES["normal"]
    multiplier = clamp(multiplier, 0.70, 1.80)

    return {
        "multiplier": round(multiplier, 4),
        "label": classify_multiplier(multiplier),
        "memberships": memberships,
        "activations": sorted(activations, key=lambda item: item["activation"], reverse=True),
    }


def classify_multiplier(multiplier: float) -> str:
    labels = {
        "discount": 0.85,
        "normal": 1.00,
        "moderate": 1.20,
        "high": 1.45,
        "critical": 1.70,
    }
    return min(labels, key=lambda label: abs(labels[label] - multiplier))


def recommend_price(inputs: ParkingInputs, rule_weights: Sequence[float] | None = None) -> Dict[str, object]:
    result = infer_multiplier(inputs, rule_weights=rule_weights)
    final_price = inputs.base_rate * float(result["multiplier"])

    return {
        **result,
        "base_rate": round(float(inputs.base_rate), 2),
        "recommended_rate": round(final_price, 2),
    }


def default_rule_weights() -> List[float]:
    return [1.0] * len(RULES)
