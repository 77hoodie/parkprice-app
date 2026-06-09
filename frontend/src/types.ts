export type ParkingInputPayload = {
  base_rate: number;
  occupancy: number;
  demand: number;
  event_level: number;
  avg_stay_minutes: number;
};

export type Activation = {
  rule: string;
  condition: string;
  output: string;
  output_pt: string;
  activation: number;
  weighted_activation: number;
  weight: number;
  rationale: string;
};

export type Recommendation = {
  multiplier: number;
  label: string;
  label_pt: string;
  base_rate: number;
  recommended_rate: number;
  explanation: string;
  memberships: Record<string, Record<string, number>>;
  activations: Activation[];
  output_curve: Array<{ x: number; degree: number }>;
};

export type Rule = {
  name: string;
  if: Array<[string, string]>;
  then: string;
  rationale: string;
};

export type Scenario = {
  scenario: string;
  description: string;
  base_rate: number;
  occupancy: number;
  demand: number;
  event_level: number;
  avg_stay_minutes: number;
  expected_behavior: string;
};

export type SimulationSummaryRow = {
  strategy: string;
  average_price: number;
  average_multiplier: number;
  total_revenue: number;
  average_revenue: number;
  average_predicted_occupancy: number;
  average_turnover: number;
};

export type SimulationRow = {
  scenario: string;
  description: string;
  expected_behavior: string;
  strategy: string;
  price: number;
  base_rate: number;
  multiplier: number;
  revenue_estimate: number;
  predicted_occupancy: number;
  avg_stay_minutes: number;
  demand: number;
  event_level: number;
  occupancy: number;
};

export type SimulationResponse = {
  summary: SimulationSummaryRow[];
  rows: SimulationRow[];
};

export type GeneticParameters = {
  population_size: number;
  generations: number;
  seed: number;
  crossover_probability: number;
  mutation_probability: number;
};

export type OptimizationResponse = {
  weights: number[];
  fitness: number;
  history: Array<{ generation: number; best_fitness: number; average_fitness: number; worst_fitness: number }>;
  comparison_summary: SimulationSummaryRow[];
  comparison_rows: SimulationRow[];
  parameters: Record<string, unknown>;
  performance: {
    runtime_ms: number;
    evaluations: number;
    rule_count: number;
  };
};

export type MultiSeedResponse = {
  summary: {
    executions: number;
    best_fitness: number;
    mean_fitness: number;
    std_fitness: number;
    worst_fitness: number;
    mean_runtime_ms: number;
    mean_evaluations: number;
    seeds: number[];
    population_size: number;
    generations: number;
    crossover_probability: number;
    mutation_probability: number;
  };
  runs: Array<{ seed: number; fitness: number; weights: number[]; performance: { runtime_ms: number; evaluations: number } }>;
  best_run: { seed: number; fitness: number; weights: number[] };
};

export type MembershipFunctions = Record<
  string,
  {
    universe: [number, number];
    terms: string[];
    label: string;
    points: Array<Record<string, number>>;
  }
>;

export type FuzzySensitivityResponse = {
  variable: string;
  variable_label: string;
  interpretation: string;
  rows: Array<{
    x: number;
    variable: string;
    variable_label: string;
    multiplier: number;
    recommended_rate: number;
    label_pt: string;
  }>;
};

export type ParameterSensitivityResponse = {
  baseline: GeneticParameters;
  seed: number;
  rows: Array<{
    parameter: string;
    value: number;
    fitness: number;
    runtime_ms: number;
    evaluations: number;
    population_size: number;
    generations: number;
    crossover_probability: number;
    mutation_probability: number;
  }>;
  summary: {
    count: number;
    best_parameter: string;
    best_value: number;
    best_fitness: number;
    note: string;
  };
};
