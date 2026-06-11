import type {
  FuzzySensitivityResponse,
  GeneticParameters,
  MembershipFunctions,
  MultiSeedResponse,
  OptimizationResponse,
  ParameterSensitivityResponse,
  ParkingInputPayload,
  Recommendation,
  Rule,
  Scenario,
  SimulationResponse
} from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {})
    },
    ...options
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Erro ${response.status}: ${body}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  health: () => request<{ status: string; version: string }>('/health'),
  recommend: (payload: ParkingInputPayload) =>
    request<Recommendation>('/recommend', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  simulate: (weights?: number[]) =>
    request<SimulationResponse>('/simulate', {
      method: 'POST',
      body: JSON.stringify({ optimized_rule_weights: weights ?? null })
    }),
  optimize: (params: GeneticParameters) =>
    request<OptimizationResponse>('/optimize', {
      method: 'POST',
      body: JSON.stringify(params)
    }),
  runFiveSeeds: (params: GeneticParameters, seeds: number[]) =>
    request<MultiSeedResponse>('/experiments/run-5-seeds', {
      method: 'POST',
      body: JSON.stringify({ ...params, seeds })
    }),
  fuzzySensitivity: (variable: string, base_input: ParkingInputPayload, weights?: number[]) =>
    request<FuzzySensitivityResponse>('/analysis/fuzzy-sensitivity', {
      method: 'POST',
      body: JSON.stringify({ variable, base_input, steps: 31, optimized_rule_weights: weights ?? null })
    }),
  parameterSensitivity: (params: GeneticParameters) =>
    request<ParameterSensitivityResponse>('/analysis/parameter-sensitivity', {
      method: 'POST',
      body: JSON.stringify({
        seed: params.seed,
        baseline_population_size: params.population_size,
        baseline_generations: params.generations,
        baseline_crossover_probability: params.crossover_probability,
        baseline_mutation_probability: params.mutation_probability
      })
    }),
  rules: () => request<{ count: number; rules: Rule[] }>('/rules'),
  scenarios: () => request<{ count: number; rows: Scenario[] }>('/scenarios'),
  membershipFunctions: () => request<MembershipFunctions>('/membership-functions')
};
