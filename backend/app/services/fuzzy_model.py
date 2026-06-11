from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
from typing import Dict, List, Sequence

import numpy as np


@dataclass(frozen=True)
class ParkingInputs:
    """Entradas usadas pelo sistema fuzzy do ParkPrice AI."""

    base_rate: float
    occupancy: float
    demand: float
    event_level: float
    avg_stay_minutes: float


OUTPUT_LABELS_PT = {
    "discount": "desconto",
    "normal": "normal",
    "moderate": "moderado",
    "high": "alto",
    "critical": "critico",
}

OUTPUT_CENTERS = {
    "discount": 0.82,
    "normal": 1.00,
    "moderate": 1.22,
    "high": 1.48,
    "critical": 1.70,
}

RULES: List[Dict[str, object]] = [
    {"name": "R01", "if": [("occupancy", "low"), ("demand", "low")], "then": "discount", "rationale": "baixa procura permite incentivo de entrada"},
    {"name": "R02", "if": [("occupancy", "low"), ("event", "strong")], "then": "normal", "rationale": "evento forte aumenta expectativa, mas ainda ha vagas"},
    {"name": "R03", "if": [("occupancy", "medium"), ("demand", "low")], "then": "normal", "rationale": "ocupacao saudavel sem pressao externa"},
    {"name": "R04", "if": [("occupancy", "medium"), ("demand", "medium")], "then": "normal", "rationale": "cenario operacional comum"},
    {"name": "R05", "if": [("occupancy", "medium"), ("demand", "high")], "then": "moderate", "rationale": "demanda alta sugere ajuste preventivo"},
    {"name": "R06", "if": [("occupancy", "high"), ("demand", "medium")], "then": "moderate", "rationale": "ocupacao alta pede controle sem exagero"},
    {"name": "R07", "if": [("occupancy", "high"), ("demand", "high")], "then": "high", "rationale": "alta pressao operacional"},
    {"name": "R08", "if": [("occupancy", "critical"), ("demand", "high")], "then": "critical", "rationale": "risco de lotacao critica"},
    {"name": "R09", "if": [("occupancy", "critical"), ("event", "strong")], "then": "critical", "rationale": "capacidade critica com pico externo"},
    {"name": "R10", "if": [("occupancy", "high"), ("stay", "long")], "then": "high", "rationale": "alta ocupacao com baixa rotatividade"},
    {"name": "R11", "if": [("occupancy", "low"), ("stay", "short")], "then": "discount", "rationale": "vagas livres e rotatividade alta permitem desconto"},
    {"name": "R12", "if": [("occupancy", "medium"), ("stay", "long")], "then": "moderate", "rationale": "permanencia longa reduz disponibilidade futura"},
    {"name": "R13", "if": [("demand", "high"), ("event", "strong")], "then": "high", "rationale": "demanda prevista e evento reforcam pico"},
    {"name": "R14", "if": [("demand", "low"), ("event", "none")], "then": "discount", "rationale": "sem pressao de demanda nem evento"},
    {"name": "R15", "if": [("event", "moderate"), ("demand", "medium")], "then": "moderate", "rationale": "pico moderado justifica ajuste leve"},
    {"name": "R16", "if": [("event", "strong"), ("stay", "long")], "then": "high", "rationale": "evento forte combinado com baixa rotatividade"},
    {"name": "R17", "if": [("occupancy", "critical"), ("stay", "long")], "then": "critical", "rationale": "lotacao critica e vagas presas por muito tempo"},
    {"name": "R18", "if": [("occupancy", "high"), ("event", "none"), ("demand", "low")], "then": "moderate", "rationale": "conflito operacional: alta ocupacao, mas baixa demanda"},
]


def clamp(value: float, minimum: float, maximum: float) -> float:
    return float(max(minimum, min(maximum, value)))


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


def membership_value(variable: str, term: str, value: float) -> float:
    if variable == "occupancy":
        value = clamp(value, 0, 100)
        definitions = {
            "low": lambda x: trapezoidal(x, 0, 0, 25, 45),
            "medium": lambda x: triangular(x, 30, 55, 75),
            "high": lambda x: triangular(x, 60, 80, 95),
            "critical": lambda x: trapezoidal(x, 85, 95, 100, 100.1),
        }
    elif variable == "demand":
        value = clamp(value, 0, 10)
        definitions = {
            "low": lambda x: trapezoidal(x, 0, 0, 2.5, 4.5),
            "medium": lambda x: triangular(x, 3, 5.5, 8),
            "high": lambda x: trapezoidal(x, 6.5, 8.5, 10, 10.1),
        }
    elif variable == "event":
        value = clamp(value, 0, 10)
        definitions = {
            "none": lambda x: trapezoidal(x, 0, 0, 2, 4),
            "moderate": lambda x: triangular(x, 3, 5.5, 8),
            "strong": lambda x: trapezoidal(x, 6.5, 8.5, 10, 10.1),
        }
    elif variable == "stay":
        value = clamp(value, 0, 240)
        definitions = {
            "short": lambda x: trapezoidal(x, 0, 0, 45, 75),
            "medium": lambda x: triangular(x, 60, 105, 150),
            "long": lambda x: trapezoidal(x, 130, 170, 240, 240.1),
        }
    elif variable == "multiplier":
        value = clamp(value, 0.70, 1.80)
        definitions = {
            "discount": lambda x: trapezoidal(x, 0.70, 0.70, 0.82, 0.95),
            "normal": lambda x: triangular(x, 0.85, 1.00, 1.15),
            "moderate": lambda x: triangular(x, 1.05, 1.22, 1.38),
            "high": lambda x: triangular(x, 1.30, 1.48, 1.65),
            "critical": lambda x: trapezoidal(x, 1.55, 1.70, 1.80, 1.801),
        }
    else:
        raise KeyError(f"Unknown fuzzy variable: {variable}")

    if term not in definitions:
        raise KeyError(f"Unknown term '{term}' for variable '{variable}'")
    return round(float(definitions[term](value)), 6)


def build_memberships(inputs: ParkingInputs) -> Dict[str, Dict[str, float]]:
    return {
        "occupancy": {
            "low": membership_value("occupancy", "low", inputs.occupancy),
            "medium": membership_value("occupancy", "medium", inputs.occupancy),
            "high": membership_value("occupancy", "high", inputs.occupancy),
            "critical": membership_value("occupancy", "critical", inputs.occupancy),
        },
        "demand": {
            "low": membership_value("demand", "low", inputs.demand),
            "medium": membership_value("demand", "medium", inputs.demand),
            "high": membership_value("demand", "high", inputs.demand),
        },
        "event": {
            "none": membership_value("event", "none", inputs.event_level),
            "moderate": membership_value("event", "moderate", inputs.event_level),
            "strong": membership_value("event", "strong", inputs.event_level),
        },
        "stay": {
            "short": membership_value("stay", "short", inputs.avg_stay_minutes),
            "medium": membership_value("stay", "medium", inputs.avg_stay_minutes),
            "long": membership_value("stay", "long", inputs.avg_stay_minutes),
        },
    }


def output_membership(term: str, multiplier: float) -> float:
    return membership_value("multiplier", term, multiplier)


@lru_cache(maxsize=1)
def output_universe_and_curves() -> tuple[np.ndarray, Dict[str, np.ndarray]]:
    """Precalcula as curvas de saida para acelerar recomendacoes e otimizacoes."""
    universe = np.linspace(0.70, 1.80, 221)
    curves = {
        label: np.array([output_membership(label, float(x)) for x in universe])
        for label in OUTPUT_CENTERS
    }
    return universe, curves


def classify_multiplier(multiplier: float) -> str:
    return min(OUTPUT_CENTERS, key=lambda label: abs(OUTPUT_CENTERS[label] - multiplier))


def infer_multiplier(inputs: ParkingInputs, rule_weights: Sequence[float] | None = None) -> Dict[str, object]:
    """Executa inferencia Mamdani simplificada com min, max e centroide.

    - Fuzzificacao: calcula graus de pertinencia das entradas.
    - Ativacao de regra: operador AND por minimo.
    - Peso evolutivo: multiplica a ativacao da regra e limita a 1.
    - Implicacao: recorta a funcao de saida pelo grau ativado.
    - Agregacao: maximo entre regras.
    - Defuzzificacao: centroide no universo de multiplicadores.
    """

    memberships = build_memberships(inputs)
    weights = list(rule_weights) if rule_weights is not None else [1.0] * len(RULES)
    if len(weights) != len(RULES):
        raise ValueError(f"Expected {len(RULES)} rule weights, received {len(weights)}.")

    universe, output_curves = output_universe_and_curves()
    aggregated = np.zeros_like(universe)
    activations: List[Dict[str, object]] = []

    for rule, weight in zip(RULES, weights):
        conditions = rule["if"]
        degrees = [memberships[var][term] for var, term in conditions]  # type: ignore[index]
        raw_activation = min(degrees) if degrees else 0.0
        weighted_activation = clamp(raw_activation * clamp(float(weight), 0.10, 3.00), 0.0, 1.0)
        output_label = str(rule["then"])

        if weighted_activation > 0:
            output_curve = output_curves[output_label]
            aggregated = np.maximum(aggregated, np.minimum(weighted_activation, output_curve))

        activations.append(
            {
                "rule": rule["name"],
                "condition": " AND ".join(f"{var}={term}" for var, term in conditions),  # type: ignore[union-attr]
                "output": output_label,
                "output_pt": OUTPUT_LABELS_PT[output_label],
                "activation": round(float(raw_activation), 4),
                "weighted_activation": round(float(weighted_activation), 4),
                "weight": round(float(weight), 4),
                "rationale": rule.get("rationale", ""),
            }
        )

    denominator = float(np.sum(aggregated))
    if denominator <= 0:
        multiplier = OUTPUT_CENTERS["normal"]
    else:
        multiplier = float(np.sum(universe * aggregated) / denominator)

    multiplier = clamp(multiplier, 0.70, 1.80)
    label = classify_multiplier(multiplier)

    return {
        "multiplier": round(multiplier, 4),
        "label": label,
        "label_pt": OUTPUT_LABELS_PT[label],
        "memberships": memberships,
        "activations": sorted(activations, key=lambda item: item["weighted_activation"], reverse=True),
        "output_curve": [
            {"x": round(float(x), 4), "degree": round(float(y), 5)}
            for x, y in zip(universe, aggregated)
        ],
    }


def build_explanation(result: Dict[str, object]) -> str:
    active_rules = [rule for rule in result["activations"] if rule["weighted_activation"] > 0]  # type: ignore[index]
    label = str(result["label_pt"])
    multiplier = float(result["multiplier"])
    if not active_rules:
        return "Nenhuma regra teve ativacao relevante; o sistema manteve recomendacao normal por seguranca."

    top = active_rules[0]
    return (
        f"A recomendacao ficou em nivel {label}, com multiplicador {multiplier:.2f}. "
        f"A regra mais influente foi {top['rule']} ({top['condition']} -> {top['output_pt']}), "
        "considerando simultaneamente ocupacao, demanda, evento/pico e permanencia media."
    )


def recommend_price(inputs: ParkingInputs, rule_weights: Sequence[float] | None = None) -> Dict[str, object]:
    result = infer_multiplier(inputs, rule_weights=rule_weights)
    final_price = inputs.base_rate * float(result["multiplier"])
    return {
        **result,
        "base_rate": round(float(inputs.base_rate), 2),
        "recommended_rate": round(final_price, 2),
        "explanation": build_explanation(result),
    }


def default_rule_weights() -> List[float]:
    return [1.0] * len(RULES)


def membership_function_points(points_per_variable: int = 101) -> Dict[str, object]:
    """Gera pontos para graficos das funcoes de pertinencia."""

    specs = {
        "occupancy": {"universe": [0, 100], "terms": ["low", "medium", "high", "critical"], "label": "Ocupacao atual (%)"},
        "demand": {"universe": [0, 10], "terms": ["low", "medium", "high"], "label": "Demanda prevista (0 a 10)"},
        "event": {"universe": [0, 10], "terms": ["none", "moderate", "strong"], "label": "Evento/pico (0 a 10)"},
        "stay": {"universe": [0, 240], "terms": ["short", "medium", "long"], "label": "Permanencia media (min)"},
        "multiplier": {"universe": [0.70, 1.80], "terms": ["discount", "normal", "moderate", "high", "critical"], "label": "Multiplicador da tarifa"},
    }

    response: Dict[str, object] = {}
    for variable, spec in specs.items():
        start, end = spec["universe"]  # type: ignore[index]
        xs = np.linspace(float(start), float(end), points_per_variable)
        rows = []
        for x in xs:
            row = {"x": round(float(x), 4)}
            for term in spec["terms"]:  # type: ignore[index]
                row[str(term)] = membership_value(variable, str(term), float(x))
            rows.append(row)
        response[variable] = {**spec, "points": rows}
    return response
