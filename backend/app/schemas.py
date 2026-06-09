from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class ParkingInputPayload(BaseModel):
    base_rate: float = Field(default=8.0, gt=0, le=100, description="Tarifa-base por hora")
    occupancy: float = Field(default=72.0, ge=0, le=100, description="Ocupacao atual em percentual")
    demand: float = Field(default=6.5, ge=0, le=10, description="Demanda prevista de 0 a 10")
    event_level: float = Field(default=4.0, ge=0, le=10, description="Intensidade de evento ou pico de 0 a 10")
    avg_stay_minutes: float = Field(default=90.0, ge=0, le=240, description="Permanencia media em minutos")


class SimulationRequest(BaseModel):
    optimized_rule_weights: Optional[List[float]] = Field(default=None, description="Pesos otimizados para comparar fuzzy manual e fuzzy otimizado")


class OptimizeRequest(BaseModel):
    population_size: int = Field(default=32, ge=8, le=200)
    generations: int = Field(default=30, ge=1, le=250)
    seed: int = Field(default=42, ge=0, le=999999)
    crossover_probability: float = Field(default=0.72, ge=0.0, le=1.0)
    mutation_probability: float = Field(default=0.28, ge=0.0, le=1.0)


class MultiSeedExperimentRequest(BaseModel):
    population_size: int = Field(default=32, ge=8, le=200)
    generations: int = Field(default=30, ge=1, le=250)
    seeds: List[int] = Field(default=[7, 21, 42, 84, 126], min_length=5)
    crossover_probability: float = Field(default=0.72, ge=0.0, le=1.0)
    mutation_probability: float = Field(default=0.28, ge=0.0, le=1.0)


class SensitivityRequest(BaseModel):
    variable: str = Field(default="occupancy", description="Variavel analisada: occupancy, demand, event_level ou avg_stay_minutes")
    base_input: ParkingInputPayload = Field(default_factory=ParkingInputPayload)
    steps: int = Field(default=25, ge=5, le=101)
    optimized_rule_weights: Optional[List[float]] = Field(default=None)


class ParameterSensitivityRequest(BaseModel):
    seed: int = Field(default=42, ge=0, le=999999)
    baseline_population_size: int = Field(default=24, ge=8, le=120)
    baseline_generations: int = Field(default=18, ge=1, le=120)
    baseline_crossover_probability: float = Field(default=0.72, ge=0.0, le=1.0)
    baseline_mutation_probability: float = Field(default=0.28, ge=0.0, le=1.0)
