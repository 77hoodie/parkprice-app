import type {
  MembershipFunctions,
  MultiSeedResponse,
  OptimizationResponse,
  ParkingInputPayload,
  Recommendation,
  Rule,
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
  health: () => request<{ status: string }>('/health'),
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
  optimize: (population_size: number, generations: number, seed: number) =>
    request<OptimizationResponse>('/optimize', {
      method: 'POST',
      body: JSON.stringify({ population_size, generations, seed })
    }),
  runFiveSeeds: (population_size: number, generations: number, seeds: number[]) =>
    request<MultiSeedResponse>('/experiments/run-5-seeds', {
      method: 'POST',
      body: JSON.stringify({ population_size, generations, seeds })
    }),
  rules: () => request<{ count: number; rules: Rule[] }>('/rules'),
  membershipFunctions: () => request<MembershipFunctions>('/membership-functions')
};
