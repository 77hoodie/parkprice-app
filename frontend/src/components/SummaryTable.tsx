import type { SimulationSummaryRow } from '../types';

export function SummaryTable({ rows }: { rows: SimulationSummaryRow[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Estratégia</th>
            <th>Preço médio</th>
            <th>Multiplicador médio</th>
            <th>Receita total</th>
            <th>Ocupação prevista média</th>
            <th>Rotatividade média</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.strategy}>
              <td>{row.strategy}</td>
              <td>R$ {row.average_price.toFixed(2)}</td>
              <td>{row.average_multiplier.toFixed(2)}x</td>
              <td>R$ {row.total_revenue.toFixed(2)}</td>
              <td>{row.average_predicted_occupancy.toFixed(2)}%</td>
              <td>{row.average_turnover.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
