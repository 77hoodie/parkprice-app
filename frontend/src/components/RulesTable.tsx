import type { Activation, Rule } from '../types';

type RulesTableProps = {
  rules?: Rule[];
  activations?: Activation[];
};

export function RulesTable({ rules, activations }: RulesTableProps) {
  const activationByRule = new Map((activations ?? []).map((item) => [item.rule, item]));

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Regra</th>
            <th>Condição</th>
            <th>Saída</th>
            <th>Ativação</th>
            <th>Justificativa</th>
          </tr>
        </thead>
        <tbody>
          {(rules ?? []).map((rule) => {
            const activation = activationByRule.get(rule.name);
            return (
              <tr key={rule.name}>
                <td>{rule.name}</td>
                <td>{rule.if.map(([variable, term]) => `${variable}=${term}`).join(' AND ')}</td>
                <td>{rule.then}</td>
                <td>{activation ? activation.weighted_activation.toFixed(3) : '-'}</td>
                <td>{rule.rationale}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
