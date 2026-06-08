import type { ParkingInputPayload } from '../types';

type ParameterPanelProps = {
  values: ParkingInputPayload;
  onChange: (next: ParkingInputPayload) => void;
  onSubmit: () => void;
  loading?: boolean;
};

const fields = [
  { key: 'base_rate', label: 'Tarifa-base (R$/h)', min: 1, max: 100, step: 0.5 },
  { key: 'occupancy', label: 'Ocupação atual (%)', min: 0, max: 100, step: 1 },
  { key: 'demand', label: 'Demanda prevista (0 a 10)', min: 0, max: 10, step: 0.5 },
  { key: 'event_level', label: 'Evento/pico (0 a 10)', min: 0, max: 10, step: 0.5 },
  { key: 'avg_stay_minutes', label: 'Permanência média (min)', min: 0, max: 240, step: 5 }
] as const;

export function ParameterPanel({ values, onChange, onSubmit, loading }: ParameterPanelProps) {
  return (
    <div className="parameter-panel">
      {fields.map((field) => (
        <label key={field.key}>
          <span>{field.label}</span>
          <div className="input-row">
            <input
              type="range"
              min={field.min}
              max={field.max}
              step={field.step}
              value={values[field.key]}
              onChange={(event) => onChange({ ...values, [field.key]: Number(event.target.value) })}
            />
            <input
              type="number"
              min={field.min}
              max={field.max}
              step={field.step}
              value={values[field.key]}
              onChange={(event) => onChange({ ...values, [field.key]: Number(event.target.value) })}
            />
          </div>
        </label>
      ))}
      <button className="primary-button" onClick={onSubmit} disabled={loading}>
        {loading ? 'Calculando...' : 'Calcular recomendação'}
      </button>
    </div>
  );
}
