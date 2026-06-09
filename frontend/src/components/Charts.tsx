import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import type {
  FuzzySensitivityResponse,
  MembershipFunctions,
  OptimizationResponse,
  ParameterSensitivityResponse,
  Recommendation,
  SimulationSummaryRow
} from '../types';

export function RevenueComparisonChart({ data }: { data: SimulationSummaryRow[] }) {
  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="strategy" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total_revenue" name="Receita total estimada" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ConvergenceChart({ optimization }: { optimization?: OptimizationResponse }) {
  if (!optimization) return null;
  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={optimization.history}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="generation" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="best_fitness" name="Melhor aptidão" dot={false} />
          <Line type="monotone" dataKey="average_fitness" name="Aptidão média" dot={false} />
          <Line type="monotone" dataKey="worst_fitness" name="Pior aptidão" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MembershipChart({ data, variable }: { data?: MembershipFunctions; variable: string }) {
  const item = data?.[variable];
  if (!item) return null;

  return (
    <div className="chart-box">
      <h3>{item.label}</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={item.points}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" />
          <YAxis domain={[0, 1]} />
          <Tooltip />
          <Legend />
          {item.terms.map((term) => (
            <Line key={term} type="monotone" dataKey={term} name={term} dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OutputCurveChart({ recommendation }: { recommendation?: Recommendation }) {
  if (!recommendation) return null;
  return (
    <div className="chart-box">
      <h3>Agregação da saída fuzzy</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={recommendation.output_curve}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" />
          <YAxis domain={[0, 1]} />
          <Tooltip />
          <Line type="monotone" dataKey="degree" name="Grau agregado" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FuzzySensitivityChart({ data }: { data?: FuzzySensitivityResponse }) {
  if (!data) return null;
  return (
    <div className="chart-box">
      <h3>{data.variable_label}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data.rows}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="multiplier" name="Multiplicador" dot={false} />
          <Line type="monotone" dataKey="recommended_rate" name="Tarifa recomendada" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ParameterSensitivityChart({ data }: { data?: ParameterSensitivityResponse }) {
  if (!data) return null;
  const chartRows = data.rows.map((row) => ({
    ...row,
    label: `${row.parameter}=${row.value}`
  }));

  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartRows}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" interval={0} angle={-20} textAnchor="end" height={90} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="fitness" name="Aptidão" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
