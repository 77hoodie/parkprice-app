from __future__ import annotations

import random
import time
from statistics import mean, stdev
from typing import Dict, List, Sequence

import pandas as pd

from .fuzzy_model import RULES
from .metrics import dataframe_to_records, summarize_comparison
from .simulator import fitness_for_weights, run_comparison

MIN_WEIGHT = 0.45
MAX_WEIGHT = 1.75


def _clamp_weight(value: float) -> float:
    return max(MIN_WEIGHT, min(MAX_WEIGHT, float(value)))


def _new_individual(rule_count: int) -> List[float]:
    return [random.uniform(0.75, 1.25) for _ in range(rule_count)]


def _evaluate_population(scenarios: pd.DataFrame, population: List[List[float]]) -> List[float]:
    return [fitness_for_weights(scenarios, individual) for individual in population]


def _tournament_select(population: List[List[float]], fitnesses: List[float], tournament_size: int = 3) -> List[float]:
    candidate_indexes = random.sample(range(len(population)), k=min(tournament_size, len(population)))
    best_index = max(candidate_indexes, key=lambda index: fitnesses[index])
    return population[best_index][:]


def _blend_crossover(parent_a: List[float], parent_b: List[float], alpha: float = 0.35) -> tuple[List[float], List[float]]:
    child_a: List[float] = []
    child_b: List[float] = []
    for gene_a, gene_b in zip(parent_a, parent_b):
        low = min(gene_a, gene_b)
        high = max(gene_a, gene_b)
        span = high - low
        min_value = low - alpha * span
        max_value = high + alpha * span
        child_a.append(_clamp_weight(random.uniform(min_value, max_value)))
        child_b.append(_clamp_weight(random.uniform(min_value, max_value)))
    return child_a, child_b


def _mutate(individual: List[float], sigma: float = 0.12, gene_probability: float = 0.25) -> List[float]:
    return [
        _clamp_weight(gene + random.gauss(0.0, sigma)) if random.random() < gene_probability else _clamp_weight(gene)
        for gene in individual
    ]


def optimize_rule_weights(
    scenarios: pd.DataFrame,
    population_size: int = 32,
    generations: int = 30,
    seed: int | None = 42,
    crossover_probability: float = 0.72,
    mutation_probability: float = 0.28,
) -> Dict[str, object]:
    """Executa um Algoritmo Genetico simples e autocontido.

    Cada individuo representa uma solucao candidata como vetor de pesos das regras fuzzy:
    [peso_R01, peso_R02, ..., peso_R18]. A aptidao combina receita estimada e penalidades
    operacionais para evitar ocupacao extrema, preco injusto e baixa rotatividade.
    """

    start = time.perf_counter()
    random.seed(seed)
    rule_count = len(RULES)
    population_size = max(8, int(population_size))
    generations = max(1, int(generations))
    crossover_probability = max(0.0, min(1.0, float(crossover_probability)))
    mutation_probability = max(0.0, min(1.0, float(mutation_probability)))

    population = [_new_individual(rule_count) for _ in range(population_size)]
    history: List[Dict[str, float]] = []
    fitnesses = _evaluate_population(scenarios, population)
    evaluation_count = population_size

    for generation in range(generations + 1):
        best_fitness = max(fitnesses)
        average_fitness = sum(fitnesses) / len(fitnesses)
        worst_fitness = min(fitnesses)
        history.append(
            {
                "generation": generation,
                "best_fitness": round(best_fitness, 4),
                "average_fitness": round(average_fitness, 4),
                "worst_fitness": round(worst_fitness, 4),
            }
        )

        if generation == generations:
            break

        elite_index = max(range(len(population)), key=lambda index: fitnesses[index])
        next_population: List[List[float]] = [population[elite_index][:]]

        while len(next_population) < population_size:
            parent_a = _tournament_select(population, fitnesses)
            parent_b = _tournament_select(population, fitnesses)

            if random.random() < crossover_probability:
                child_a, child_b = _blend_crossover(parent_a, parent_b)
            else:
                child_a, child_b = parent_a[:], parent_b[:]

            if random.random() < mutation_probability:
                child_a = _mutate(child_a)
            if random.random() < mutation_probability:
                child_b = _mutate(child_b)

            next_population.append(child_a)
            if len(next_population) < population_size:
                next_population.append(child_b)

        population = next_population
        fitnesses = _evaluate_population(scenarios, population)
        evaluation_count += population_size

    best_index = max(range(len(population)), key=lambda index: fitnesses[index])
    best_weights = [round(_clamp_weight(value), 4) for value in population[best_index]]
    best_fitness = float(fitnesses[best_index])
    comparison = run_comparison(scenarios, optimized_rule_weights=best_weights)
    summary = summarize_comparison(comparison)
    runtime_ms = (time.perf_counter() - start) * 1000

    return {
        "weights": best_weights,
        "fitness": round(best_fitness, 4),
        "history": history,
        "comparison_summary": dataframe_to_records(summary),
        "comparison_rows": dataframe_to_records(comparison),
        "parameters": {
            "population_size": int(population_size),
            "generations": int(generations),
            "seed": seed,
            "crossover_probability": crossover_probability,
            "mutation_probability": mutation_probability,
            "selection": "torneio",
            "crossover": "blend",
            "mutation": "gaussiana",
            "elitism": "1 melhor individuo preservado",
            "weight_bounds": [MIN_WEIGHT, MAX_WEIGHT],
        },
        "performance": {
            "runtime_ms": round(runtime_ms, 2),
            "evaluations": int(evaluation_count),
            "rule_count": int(rule_count),
        },
    }


def run_independent_optimizations(
    scenarios: pd.DataFrame,
    seeds: Sequence[int],
    population_size: int = 32,
    generations: int = 30,
    crossover_probability: float = 0.72,
    mutation_probability: float = 0.28,
) -> Dict[str, object]:
    runs = []
    for seed in seeds:
        result = optimize_rule_weights(
            scenarios=scenarios,
            population_size=population_size,
            generations=generations,
            seed=int(seed),
            crossover_probability=crossover_probability,
            mutation_probability=mutation_probability,
        )
        runs.append(
            {
                "seed": int(seed),
                "fitness": result["fitness"],
                "weights": result["weights"],
                "history": result["history"],
                "performance": result["performance"],
            }
        )

    fitness_values = [float(run["fitness"]) for run in runs]
    runtime_values = [float(run["performance"]["runtime_ms"]) for run in runs]
    best_run = max(runs, key=lambda item: float(item["fitness"]))
    return {
        "runs": runs,
        "summary": {
            "executions": len(runs),
            "best_fitness": round(max(fitness_values), 4),
            "mean_fitness": round(mean(fitness_values), 4),
            "std_fitness": round(stdev(fitness_values), 4) if len(fitness_values) > 1 else 0.0,
            "worst_fitness": round(min(fitness_values), 4),
            "mean_runtime_ms": round(mean(runtime_values), 2),
            "mean_evaluations": round(mean([float(run["performance"]["evaluations"]) for run in runs]), 2),
            "seeds": [int(seed) for seed in seeds],
            "population_size": int(population_size),
            "generations": int(generations),
            "crossover_probability": float(crossover_probability),
            "mutation_probability": float(mutation_probability),
        },
        "best_run": best_run,
    }


def run_parameter_sensitivity(
    scenarios: pd.DataFrame,
    seed: int = 42,
    baseline_population_size: int = 24,
    baseline_generations: int = 18,
    baseline_crossover_probability: float = 0.72,
    baseline_mutation_probability: float = 0.28,
) -> Dict[str, object]:
    """Executa uma analise experimental curta variando 4 parametros do AG.

    A rotina foi desenhada para demonstracao: varia um parametro por vez mantendo os demais
    no baseline. Para o relatorio final, a equipe pode aumentar as repeticoes e sementes.
    """

    baseline = {
        "population_size": int(baseline_population_size),
        "generations": int(baseline_generations),
        "crossover_probability": float(baseline_crossover_probability),
        "mutation_probability": float(baseline_mutation_probability),
    }

    experiments = []
    variations = {
        "population_size": sorted(set([16, baseline["population_size"], 40])),
        "generations": sorted(set([10, baseline["generations"], 30])),
        "crossover_probability": sorted(set([0.55, baseline["crossover_probability"], 0.85])),
        "mutation_probability": sorted(set([0.12, baseline["mutation_probability"], 0.42])),
    }

    for parameter, values in variations.items():
        for value in values:
            params = baseline.copy()
            params[parameter] = value
            result = optimize_rule_weights(
                scenarios=scenarios,
                seed=seed,
                population_size=int(params["population_size"]),
                generations=int(params["generations"]),
                crossover_probability=float(params["crossover_probability"]),
                mutation_probability=float(params["mutation_probability"]),
            )
            experiments.append(
                {
                    "parameter": parameter,
                    "value": value,
                    "fitness": result["fitness"],
                    "runtime_ms": result["performance"]["runtime_ms"],
                    "evaluations": result["performance"]["evaluations"],
                    "population_size": params["population_size"],
                    "generations": params["generations"],
                    "crossover_probability": params["crossover_probability"],
                    "mutation_probability": params["mutation_probability"],
                }
            )

    best = max(experiments, key=lambda item: float(item["fitness"]))
    return {
        "baseline": baseline,
        "seed": int(seed),
        "rows": experiments,
        "summary": {
            "count": len(experiments),
            "best_parameter": best["parameter"],
            "best_value": best["value"],
            "best_fitness": best["fitness"],
            "note": "Estudo de sensibilidade inicial: um parametro variado por vez. Expandir no relatorio final se houver tempo.",
        },
    }
