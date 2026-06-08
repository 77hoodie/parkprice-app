import type { SimulationRow } from '../types';

export function ScenarioTable({ rows }: { rows: SimulationRow[] }) {
  return (
    <div className="table-wrap compact-table">
      <table>
        <thead>
          <tr>
            <th>Cenário</th>
            <th>Descrição</th>
            <th>Estratégia</th>
            <th>Preço</th>
            <th>Receita estimada</th>
            <th>Ocupação prevista</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.scenario}-${row.strategy}-${index}`}>
              <td>{row.scenario}</td>
              <td>{row.description}</td>
              <td>{row.strategy}</td>
              <td>R$ {row.price.toFixed(2)}</td>
              <td>R$ {row.revenue_estimate.toFixed(2)}</td>
              <td>{row.predicted_occupancy.toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
