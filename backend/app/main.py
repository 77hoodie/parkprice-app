from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .schemas import (
    MultiSeedExperimentRequest,
    OptimizeRequest,
    ParameterSensitivityRequest,
    ParkingInputPayload,
    SensitivityRequest,
    SimulationRequest,
)
from .services.fuzzy_model import ParkingInputs, RULES, membership_function_points, recommend_price
from .services.genetic_optimizer import optimize_rule_weights, run_independent_optimizations, run_parameter_sensitivity
from .services.metrics import dataframe_to_records, summarize_comparison
from .services.sensitivity import run_fuzzy_sensitivity
from .services.simulator import load_scenarios, run_comparison

app = FastAPI(
    title="ParkPrice AI API",
    version="1.0.0",
    description="API Python para recomendacao fuzzy-evolutiva de tarifa dinamica em estacionamentos.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root() -> dict:
    return {
        "project": "ParkPrice AI",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "capabilities": [
            "recomendacao fuzzy Mamdani",
            "comparacao de estrategias de preco",
            "calibracao por Algoritmo Genetico",
            "analises de sensibilidade e estabilidade",
        ],
    }


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "version": "1.0.0"}


@app.get("/rules")
def get_rules() -> dict:
    return {"count": len(RULES), "rules": RULES}


@app.get("/membership-functions")
def get_membership_functions() -> dict:
    return membership_function_points()


@app.get("/scenarios")
def get_scenarios() -> dict:
    scenarios = load_scenarios()
    return {"count": len(scenarios), "rows": dataframe_to_records(scenarios)}


@app.post("/recommend")
def recommend(payload: ParkingInputPayload) -> dict:
    inputs = ParkingInputs(**payload.model_dump())
    return recommend_price(inputs)


@app.post("/simulate")
def simulate(payload: SimulationRequest | None = None) -> dict:
    scenarios = load_scenarios()
    comparison = run_comparison(
        scenarios,
        optimized_rule_weights=payload.optimized_rule_weights if payload else None,
    )
    summary = summarize_comparison(comparison)
    return {
        "summary": dataframe_to_records(summary),
        "rows": dataframe_to_records(comparison),
    }


@app.post("/optimize")
def optimize(payload: OptimizeRequest) -> dict:
    scenarios = load_scenarios()
    return optimize_rule_weights(
        scenarios=scenarios,
        population_size=payload.population_size,
        generations=payload.generations,
        seed=payload.seed,
        crossover_probability=payload.crossover_probability,
        mutation_probability=payload.mutation_probability,
    )


@app.post("/experiments/run-5-seeds")
def run_five_seed_experiment(payload: MultiSeedExperimentRequest) -> dict:
    scenarios = load_scenarios()
    return run_independent_optimizations(
        scenarios=scenarios,
        seeds=payload.seeds,
        population_size=payload.population_size,
        generations=payload.generations,
        crossover_probability=payload.crossover_probability,
        mutation_probability=payload.mutation_probability,
    )


@app.post("/analysis/fuzzy-sensitivity")
def fuzzy_sensitivity(payload: SensitivityRequest) -> dict:
    try:
        return run_fuzzy_sensitivity(
            variable=payload.variable,
            base_input=ParkingInputs(**payload.base_input.model_dump()),
            steps=payload.steps,
            optimized_rule_weights=payload.optimized_rule_weights,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/analysis/parameter-sensitivity")
def parameter_sensitivity(payload: ParameterSensitivityRequest) -> dict:
    scenarios = load_scenarios()
    return run_parameter_sensitivity(
        scenarios=scenarios,
        seed=payload.seed,
        baseline_population_size=payload.baseline_population_size,
        baseline_generations=payload.baseline_generations,
        baseline_crossover_probability=payload.baseline_crossover_probability,
        baseline_mutation_probability=payload.baseline_mutation_probability,
    )
