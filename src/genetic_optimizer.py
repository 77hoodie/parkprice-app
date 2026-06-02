from __future__ import annotations

import random
from typing import Dict, Sequence

import pandas as pd

from .fuzzy_model import RULES
from .simulator import fitness_from_comparison, run_comparison


def optimize_rule_weights(
    scenarios: pd.DataFrame,
    population_size: int = 24,
    generations: int = 20,
    seed: int | None = 42,
) -> Dict[str, object]:
    try:
        from deap import base, creator, tools
    except ImportError as exc:
        raise ImportError("Install dependencies with: pip install -r requirements.txt") from exc

    random.seed(seed)
    rule_count = len(RULES)

    if not hasattr(creator, "FitnessMax"):
        creator.create("FitnessMax", base.Fitness, weights=(1.0,))
    if not hasattr(creator, "Individual"):
        creator.create("Individual", list, fitness=creator.FitnessMax)

    toolbox = base.Toolbox()
    toolbox.register("attr_weight", random.uniform, 0.55, 1.60)
    toolbox.register("individual", tools.initRepeat, creator.Individual, toolbox.attr_weight, n=rule_count)
    toolbox.register("population", tools.initRepeat, list, toolbox.individual)

    def evaluate(individual: Sequence[float]) -> tuple[float]:
        comparison = run_comparison(scenarios, rule_weights=individual)
        return (fitness_from_comparison(comparison),)

    toolbox.register("evaluate", evaluate)
    toolbox.register("mate", tools.cxBlend, alpha=0.35)
    toolbox.register("mutate", tools.mutGaussian, mu=0, sigma=0.12, indpb=0.20)
    toolbox.register("select", tools.selTournament, tournsize=3)

    population = toolbox.population(n=population_size)
    history = []

    for generation in range(generations + 1):
        invalid = [individual for individual in population if not individual.fitness.valid]
        fitnesses = map(toolbox.evaluate, invalid)
        for individual, fitness in zip(invalid, fitnesses):
            individual.fitness.values = fitness

        best = tools.selBest(population, k=1)[0]
        scores = [individual.fitness.values[0] for individual in population]
        history.append(
            {
                "generation": generation,
                "best_fitness": round(max(scores), 4),
                "average_fitness": round(sum(scores) / len(scores), 4),
            }
        )

        if generation == generations:
            break

        offspring = toolbox.select(population, len(population))
        offspring = list(map(toolbox.clone, offspring))

        for child_a, child_b in zip(offspring[::2], offspring[1::2]):
            if random.random() < 0.70:
                toolbox.mate(child_a, child_b)
                del child_a.fitness.values
                del child_b.fitness.values

        for mutant in offspring:
            if random.random() < 0.25:
                toolbox.mutate(mutant)
                for index, value in enumerate(mutant):
                    mutant[index] = max(0.10, min(3.00, value))
                del mutant.fitness.values

        population[:] = offspring

    best = tools.selBest(population, k=1)[0]

    return {
        "weights": [round(float(value), 4) for value in best],
        "fitness": round(float(best.fitness.values[0]), 4),
        "history": pd.DataFrame(history),
    }
