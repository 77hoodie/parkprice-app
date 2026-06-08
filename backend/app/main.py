from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .schemas import MultiSeedExperimentRequest, OptimizeRequest, ParkingInputPayload, SimulationRequest
from .services.fuzzy_model import ParkingInputs, RULES, membership_function_points, recommend_price
from .services.genetic_optimizer import optimize_rule_weights, run_independent_optimizations
from .services.metrics import dataframe_to_records, summarize_comparison
from .services.simulator import load_scenarios, run_comparison

app = FastAPI(
    title="ParkPrice AI API",
    version="0.1.0-sprint1",
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
        "sprint": "Sprint 1",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


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
    )


@app.post("/experiments/run-5-seeds")
def run_five_seed_experiment(payload: MultiSeedExperimentRequest) -> dict:
    scenarios = load_scenarios()
    return run_independent_optimizations(
        scenarios=scenarios,
        seeds=payload.seeds,
        population_size=payload.population_size,
        generations=payload.generations,
    )
