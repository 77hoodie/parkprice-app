import {
  Activity,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  Download,
  FileText,
  FlaskConical,
  Gauge,
  Layers3,
  Play,
  Presentation,
  Route,
  ShieldCheck,
  SlidersHorizontal,
  Store
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import {
  ConvergenceChart,
  FuzzySensitivityChart,
  MembershipChart,
  OutputCurveChart,
  ParameterSensitivityChart,
  RevenueComparisonChart
} from './components/Charts';
import { MetricCard } from './components/MetricCard';
import { Panel } from './components/Panel';
import { ParameterPanel } from './components/ParameterPanel';
import { RulesTable } from './components/RulesTable';
import { ScenarioTable } from './components/ScenarioTable';
import { SummaryTable } from './components/SummaryTable';
import { api } from './services/api';
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
} from './types';

const initialInputs: ParkingInputPayload = {
  base_rate: 8,
  occupancy: 72,
  demand: 6.5,
  event_level: 4,
  avg_stay_minutes: 90
};

const initialGaParams: GeneticParameters = {
  population_size: 32,
  generations: 30,
  seed: 42,
  crossover_probability: 0.72,
  mutation_probability: 0.28
};

const demoPresets: Array<{ key: string; label: string; description: string; input: ParkingInputPayload }> = [
  {
    key: 'weak_day',
    label: 'Dia fraco',
    description: 'Baixa ocupação, baixa demanda e permanência curta.',
    input: { base_rate: 8, occupancy: 20, demand: 2, event_level: 0, avg_stay_minutes: 45 }
  },
  {
    key: 'common_day',
    label: 'Dia comum',
    description: 'Cenário médio usado para demonstrar estabilidade da recomendação.',
    input: { base_rate: 8, occupancy: 55, demand: 5, event_level: 1, avg_stay_minutes: 90 }
  },
  {
    key: 'moderate_peak',
    label: 'Pico moderado',
    description: 'Demanda alta com ocupação ainda administrável.',
    input: { base_rate: 8, occupancy: 75, demand: 7.5, event_level: 4.5, avg_stay_minutes: 100 }
  },
  {
    key: 'early_full',
    label: 'Quase lotado',
    description: 'Alta ocupação, evento forte e permanência longa.',
    input: { base_rate: 8, occupancy: 90, demand: 8.5, event_level: 8, avg_stay_minutes: 150 }
  },
  {
    key: 'event_with_vacancies',
    label: 'Evento com vagas',
    description: 'Evento forte, mas estacionamento ainda pouco ocupado.',
    input: { base_rate: 8, occupancy: 35, demand: 8, event_level: 9, avg_stay_minutes: 55 }
  },
  {
    key: 'operational_conflict',
    label: 'Conflito operacional',
    description: 'Ocupação alta, mas demanda baixa e sem evento.',
    input: { base_rate: 8, occupancy: 85, demand: 2.5, event_level: 0, avg_stay_minutes: 160 }
  }
];

type Mode = 'product' | 'presentation';
type TabKey = 'overview' | 'recommendation' | 'model' | 'simulation' | 'evolution' | 'experiments' | 'study';

type TabItem = {
  key: TabKey;
  label: string;
  icon: ReactNode;
  presentationOnly?: boolean;
};

const allTabs: TabItem[] = [
  { key: 'overview', label: 'Visão geral', icon: <Route size={16} /> },
  { key: 'recommendation', label: 'Recomendação', icon: <Gauge size={16} /> },
  { key: 'model', label: 'Modelo fuzzy', icon: <BrainCircuit size={16} />, presentationOnly: true },
  { key: 'simulation', label: 'Simulação', icon: <BarChart3 size={16} /> },
  { key: 'evolution', label: 'Evolutivo', icon: <FlaskConical size={16} />, presentationOnly: true },
  { key: 'experiments', label: 'Experimentos', icon: <SlidersHorizontal size={16} />, presentationOnly: true },
  { key: 'study', label: 'Defesa', icon: <Layers3 size={16} />, presentationOnly: true }
];

const variableOptions = [
  { key: 'occupancy', label: 'Ocupação' },
  { key: 'demand', label: 'Demanda' },
  { key: 'event_level', label: 'Evento/pico' },
  { key: 'avg_stay_minutes', label: 'Permanência' }
];

function toCurrency(value?: number) {
  if (value === undefined || Number.isNaN(value)) return '--';
  return `R$ ${value.toFixed(2)}`;
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadCsv(filename: string, rows: Array<Record<string, unknown>>) {
  if (!rows.length) return;
  const columns = Object.keys(rows[0]);
  const escape = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const csv = [columns.join(','), ...rows.map((row) => columns.map((column) => escape(row[column])).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function EvidenceBadges({ items }: { items: string[] }) {
  return (
    <div className="badge-row">
      {items.map((item) => (
        <span className="evidence-badge" key={item}>
          <CheckCircle2 size={14} /> {item}
        </span>
      ))}
    </div>
  );
}

function ModeSwitch({ mode, onChange }: { mode: Mode; onChange: (mode: Mode) => void }) {
  return (
    <div className="mode-switch" role="group" aria-label="Alternar modo de uso">
      <button className={mode === 'product' ? 'active' : ''} onClick={() => onChange('product')}>
        <Store size={16} /> Produto
      </button>
      <button className={mode === 'presentation' ? 'active' : ''} onClick={() => onChange('presentation')}>
        <Presentation size={16} /> Apresentação
      </button>
    </div>
  );
}

function App() {
  const [mode, setMode] = useState<Mode>('product');
  const [tab, setTab] = useState<TabKey>('overview');
  const [inputs, setInputs] = useState<ParkingInputPayload>(initialInputs);
  const [gaParams, setGaParams] = useState<GeneticParameters>(initialGaParams);
  const [recommendation, setRecommendation] = useState<Recommendation>();
  const [simulation, setSimulation] = useState<SimulationResponse>();
  const [optimization, setOptimization] = useState<OptimizationResponse>();
  const [multiSeed, setMultiSeed] = useState<MultiSeedResponse>();
  const [fuzzySensitivity, setFuzzySensitivity] = useState<FuzzySensitivityResponse>();
  const [parameterSensitivity, setParameterSensitivity] = useState<ParameterSensitivityResponse>();
  const [rules, setRules] = useState<Rule[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [membership, setMembership] = useState<MembershipFunctions>();
  const [loading, setLoading] = useState<string>('');
  const [error, setError] = useState<string>('');

  const bestWeights = useMemo(() => optimization?.weights, [optimization]);
  const visibleTabs = allTabs.filter((item) => mode === 'presentation' || !item.presentationOnly);
  const activeRuleCount = recommendation?.activations.filter((item) => item.weighted_activation > 0).length ?? 0;

  async function safeAction(label: string, action: () => Promise<void>) {
    setLoading(label);
    setError('');
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.');
    } finally {
      setLoading('');
    }
  }

  useEffect(() => {
    safeAction('Inicializando', async () => {
      const [rulesResponse, membershipResponse, recommendationResponse, simulationResponse, scenariosResponse] =
        await Promise.all([
          api.rules(),
          api.membershipFunctions(),
          api.recommend(initialInputs),
          api.simulate(),
          api.scenarios()
        ]);
      setRules(rulesResponse.rules);
      setMembership(membershipResponse);
      setRecommendation(recommendationResponse);
      setSimulation(simulationResponse);
      setScenarios(scenariosResponse.rows);
    });
  }, []);

  useEffect(() => {
    if (mode === 'product' && allTabs.find((item) => item.key === tab)?.presentationOnly) {
      setTab('overview');
    }
  }, [mode, tab]);

  const calculateRecommendationFor = (payload: ParkingInputPayload) =>
    safeAction('Calculando recomendação', async () => {
      setRecommendation(await api.recommend(payload));
    });

  const calculateRecommendation = () => calculateRecommendationFor(inputs);

  const applyPreset = (payload: ParkingInputPayload) => {
    setInputs(payload);
    void calculateRecommendationFor(payload);
  };

  const runSimulation = () =>
    safeAction('Rodando simulação', async () => {
      setSimulation(await api.simulate(bestWeights));
    });

  const runOptimization = () =>
    safeAction('Otimizando', async () => {
      const result = await api.optimize(gaParams);
      setOptimization(result);
      setSimulation({ summary: result.comparison_summary, rows: result.comparison_rows });
    });

  const runMultiSeed = () =>
    safeAction('Rodando 5 sementes', async () => {
      setMultiSeed(await api.runFiveSeeds(gaParams, [7, 21, 42, 84, 126]));
    });

  const runFuzzySensitivity = (variable: string) =>
    safeAction('Analisando sensibilidade fuzzy', async () => {
      setFuzzySensitivity(await api.fuzzySensitivity(variable, inputs, bestWeights));
    });

  const runParameterSensitivity = () =>
    safeAction('Analisando parâmetros evolutivos', async () => {
      setParameterSensitivity(await api.parameterSensitivity(gaParams));
    });

  return (
    <main className={`app-shell mode-${mode}`}>
      <header className="hero">
        <div>
          <p className="eyebrow">Sprint 2 · Produto demonstrável + defesa técnica</p>
          <div className="hero-title-row">
            <h1>ParkPrice AI</h1>
            <ModeSwitch mode={mode} onChange={setMode} />
          </div>
          <p>
            Sistema de apoio à decisão para precificação dinâmica de estacionamentos, com lógica fuzzy
            interpretável e otimização evolutiva de pesos de regras.
          </p>
          <EvidenceBadges
            items={
              mode === 'product'
                ? ['Fluxo de uso limpo', 'Linguagem de cliente', 'Tarifa explicável']
                : ['18 regras fuzzy', '12 cenários', 'AG parametrizável', '5 sementes', 'Sensibilidade']
            }
          />
        </div>
        <div className="hero-card">
          <span>{mode === 'product' ? 'Modo Produto' : 'Modo Apresentação'}</span>
          <strong>{mode === 'product' ? 'Operação para cliente final' : 'Camada técnica para arguição'}</strong>
          <small>
            {mode === 'product'
              ? 'Mostra a recomendação e a justificativa sem sobrecarregar o usuário com detalhes técnicos.'
              : 'Exibe regras, pertinências, fitness, convergência, baselines e evidências exigidas nas laudas.'}
          </small>
        </div>
      </header>

      {error && <div className="error-box">{error}</div>}
      {loading && <div className="loading-box">{loading}...</div>}

      <nav className="tabs">
        {visibleTabs.map((item) => (
          <button key={item.key} className={tab === item.key ? 'active' : ''} onClick={() => setTab(item.key)}>
            {item.icon} {item.label}
          </button>
        ))}
      </nav>

      {tab === 'overview' && (
        <div className="stack">
          <Panel
            title={mode === 'product' ? 'Painel executivo' : 'Mapa de aderência técnica'}
            subtitle={
              mode === 'product'
                ? 'Resumo do valor do produto para administradores de estacionamentos.'
                : 'Resumo do que precisa aparecer na demonstração, no relatório e na defesa.'
            }
          >
            <div className="metrics-grid four">
              <MetricCard label="Entradas fuzzy" value="4" hint="ocupação, demanda, evento e permanência" />
              <MetricCard label="Base de regras" value={rules.length || 18} hint="cobre casos normais, críticos e conflitos" />
              <MetricCard label="Cenários" value={scenarios.length || 12} hint="sintéticos controlados" />
              <MetricCard label="Estratégias" value="4" hint="fixa, heurística, fuzzy manual, fuzzy otimizado" />
            </div>
            <div className="feature-grid">
              <article>
                <ShieldCheck size={22} />
                <h3>Decisão apoiada</h3>
                <p>Recomendar multiplicador sobre a tarifa-base, preservando receita, ocupação saudável, rotatividade e justiça tarifária.</p>
              </article>
              <article>
                <BrainCircuit size={22} />
                <h3>Modelo interpretável</h3>
                <p>As regras linguísticas ajudam a explicar por que a tarifa foi classificada como desconto, normal, moderada, alta ou crítica.</p>
              </article>
              <article>
                <FlaskConical size={22} />
                <h3>Otimização evolutiva</h3>
                <p>O AG ajusta pesos das regras e permite comparar fuzzy manual com fuzzy otimizado sob as mesmas hipóteses de simulação.</p>
              </article>
            </div>
          </Panel>

          {mode === 'presentation' && (
            <Panel title="Checklist visual para a apresentação" subtitle="Use esta seção como roteiro rápido antes da defesa oral.">
              <div className="checklist-grid">
                {[
                  'Problema e público-alvo definidos',
                  'Requisitos e fluxo de uso explicáveis',
                  'Universos e funções de pertinência com gráficos',
                  'Tabela completa com 18 regras',
                  'Mamdani: fuzzificação, min, max e centroide',
                  'Baselines: tarifa fixa e heurística simples',
                  'AG com representação, operadores e fitness',
                  '5 execuções independentes com sementes distintas',
                  'Estudo de sensibilidade de fuzzy e parâmetros do AG',
                  'GitHub, README, execução e declaração de IA'
                ].map((item) => (
                  <span key={item}>
                    <CheckCircle2 size={16} /> {item}
                  </span>
                ))}
              </div>
            </Panel>
          )}
        </div>
      )}

      {tab === 'recommendation' && (
        <div className="grid two-columns">
          <div className="stack">
            <Panel title="Entrada operacional" subtitle="Dados informados pelo usuário do protótipo.">
              <ParameterPanel
                values={inputs}
                onChange={setInputs}
                onSubmit={calculateRecommendation}
                loading={loading === 'Calculando recomendação'}
              />
            </Panel>
            <Panel title="Presets de demonstração" subtitle="Atalhos para apresentar casos baixos, médios, críticos e conflitantes.">
              <div className="preset-grid">
                {demoPresets.map((preset) => (
                  <button key={preset.key} className="preset-card" onClick={() => applyPreset(preset.input)}>
                    <strong>{preset.label}</strong>
                    <span>{preset.description}</span>
                  </button>
                ))}
              </div>
            </Panel>
          </div>

          <Panel title="Saída recomendada" subtitle="Resultado defuzzificado e interpretação linguística.">
            <div className="metrics-grid">
              <MetricCard label="Tarifa final" value={toCurrency(recommendation?.recommended_rate)} />
              <MetricCard label="Multiplicador" value={`${recommendation?.multiplier?.toFixed(2) ?? '--'}x`} />
              <MetricCard label="Classificação" value={recommendation?.label_pt ?? '--'} />
            </div>
            <div className="explanation-box">{recommendation?.explanation ?? 'Aguardando cálculo.'}</div>
            {mode === 'presentation' && (
              <>
                <EvidenceBadges items={[`${activeRuleCount} regras ativadas`, 'AND por mínimo', 'agregação por máximo', 'centroide']} />
                <OutputCurveChart recommendation={recommendation} />
                <h3>Regras mais ativadas</h3>
                <RulesTable rules={rules.slice(0, 18)} activations={recommendation?.activations} />
              </>
            )}
          </Panel>
        </div>
      )}

      {tab === 'model' && (
        <div className="stack">
          <Panel title="Funções de pertinência" subtitle="Evidência visual para explicar variáveis, termos linguísticos e universos de discurso.">
            <EvidenceBadges items={['4 entradas', '1 saída', 'termos linguísticos', 'gráficos por variável']} />
            <div className="membership-grid">
              <MembershipChart data={membership} variable="occupancy" />
              <MembershipChart data={membership} variable="demand" />
              <MembershipChart data={membership} variable="event" />
              <MembershipChart data={membership} variable="stay" />
              <MembershipChart data={membership} variable="multiplier" />
            </div>
          </Panel>
          <Panel title="Base de regras" subtitle="18 regras para atender a ampliação técnica da equipe com 5 integrantes.">
            <RulesTable rules={rules} activations={recommendation?.activations} />
          </Panel>
        </div>
      )}

      {tab === 'simulation' && (
        <div className="stack">
          <Panel title="Comparação de estratégias" subtitle="Tarifa fixa, heurística simples, fuzzy manual e fuzzy otimizado quando houver pesos otimizados.">
            <div className="action-row">
              <button className="secondary-button" onClick={runSimulation} disabled={Boolean(loading)}>
                <Play size={16} /> Rodar simulação
              </button>
              {simulation && (
                <>
                  <button className="secondary-button" onClick={() => downloadJson('parkprice-simulacao.json', simulation)}>
                    <Download size={16} /> Exportar JSON
                  </button>
                  <button className="secondary-button" onClick={() => downloadCsv('parkprice-simulacao.csv', simulation.rows as unknown as Array<Record<string, unknown>>)}>
                    <Download size={16} /> Exportar CSV
                  </button>
                </>
              )}
            </div>
            {simulation && <RevenueComparisonChart data={simulation.summary} />}
            {simulation && <SummaryTable rows={simulation.summary} />}
          </Panel>
          {simulation && mode === 'presentation' && (
            <Panel title="Cenários detalhados" subtitle="Cenários baixos, médios, críticos e conflitantes para análise de coerência.">
              <ScenarioTable rows={simulation.rows} />
            </Panel>
          )}
        </div>
      )}

      {tab === 'evolution' && (
        <div className="stack">
          <Panel title="Parâmetros do Algoritmo Genético" subtitle="Controle editável para demonstrar parametrização e custo computacional.">
            <div className="ga-grid">
              <label>
                População
                <input type="number" min={8} max={200} value={gaParams.population_size} onChange={(event) => setGaParams({ ...gaParams, population_size: Number(event.target.value) })} />
              </label>
              <label>
                Gerações
                <input type="number" min={1} max={250} value={gaParams.generations} onChange={(event) => setGaParams({ ...gaParams, generations: Number(event.target.value) })} />
              </label>
              <label>
                Seed
                <input type="number" min={0} value={gaParams.seed} onChange={(event) => setGaParams({ ...gaParams, seed: Number(event.target.value) })} />
              </label>
              <label>
                Crossover
                <input type="number" min={0} max={1} step={0.01} value={gaParams.crossover_probability} onChange={(event) => setGaParams({ ...gaParams, crossover_probability: Number(event.target.value) })} />
              </label>
              <label>
                Mutação
                <input type="number" min={0} max={1} step={0.01} value={gaParams.mutation_probability} onChange={(event) => setGaParams({ ...gaParams, mutation_probability: Number(event.target.value) })} />
              </label>
            </div>
          </Panel>

          <Panel title="Laboratório evolutivo" subtitle="AG otimizando pesos das 18 regras fuzzy.">
            <div className="action-row">
              <button className="primary-button" onClick={runOptimization} disabled={Boolean(loading)}>
                <Play size={16} /> Executar AG
              </button>
              <button className="secondary-button" onClick={runMultiSeed} disabled={Boolean(loading)}>
                Rodar 5 sementes
              </button>
              {optimization && (
                <button className="secondary-button" onClick={() => downloadJson('parkprice-otimizacao.json', optimization)}>
                  <Download size={16} /> Exportar otimização
                </button>
              )}
            </div>
            <div className="metrics-grid four">
              <MetricCard label="Melhor aptidão" value={optimization?.fitness ?? '--'} />
              <MetricCard label="Avaliações" value={optimization?.performance.evaluations ?? '--'} />
              <MetricCard label="Tempo" value={optimization ? `${optimization.performance.runtime_ms} ms` : '--'} />
              <MetricCard label="Regras" value={rules.length || '--'} />
            </div>
            <ConvergenceChart optimization={optimization} />
          </Panel>
          {multiSeed && (
            <Panel title="Estabilidade em 5 execuções" subtitle="Resumo exigido para métodos estocásticos.">
              <div className="metrics-grid four">
                <MetricCard label="Melhor" value={multiSeed.summary.best_fitness} />
                <MetricCard label="Média" value={multiSeed.summary.mean_fitness} />
                <MetricCard label="Desvio-padrão" value={multiSeed.summary.std_fitness} />
                <MetricCard label="Tempo médio" value={`${multiSeed.summary.mean_runtime_ms} ms`} />
              </div>
              <div className="table-wrap compact-table">
                <table>
                  <thead>
                    <tr>
                      <th>Seed</th>
                      <th>Fitness</th>
                      <th>Tempo</th>
                      <th>Avaliações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {multiSeed.runs.map((run) => (
                      <tr key={run.seed}>
                        <td>{run.seed}</td>
                        <td>{run.fitness}</td>
                        <td>{run.performance.runtime_ms} ms</td>
                        <td>{run.performance.evaluations}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}
        </div>
      )}

      {tab === 'experiments' && (
        <div className="stack">
          <Panel title="Análise de sensibilidade fuzzy" subtitle="Varia uma entrada por vez mantendo as demais fixas.">
            <div className="action-row">
              {variableOptions.map((variable) => (
                <button key={variable.key} className="secondary-button" onClick={() => runFuzzySensitivity(variable.key)} disabled={Boolean(loading)}>
                  {variable.label}
                </button>
              ))}
              {fuzzySensitivity && (
                <button className="secondary-button" onClick={() => downloadCsv('parkprice-sensibilidade-fuzzy.csv', fuzzySensitivity.rows as unknown as Array<Record<string, unknown>>)}>
                  <Download size={16} /> Exportar CSV
                </button>
              )}
            </div>
            {fuzzySensitivity && <p className="note-text">{fuzzySensitivity.interpretation}</p>}
            <FuzzySensitivityChart data={fuzzySensitivity} />
          </Panel>

          <Panel title="Análise experimental ampliada" subtitle="Varia quatro parâmetros do AG: população, gerações, crossover e mutação.">
            <div className="action-row">
              <button className="primary-button" onClick={runParameterSensitivity} disabled={Boolean(loading)}>
                <Play size={16} /> Executar estudo de parâmetros
              </button>
              {parameterSensitivity && (
                <button className="secondary-button" onClick={() => downloadJson('parkprice-sensibilidade-ag.json', parameterSensitivity)}>
                  <Download size={16} /> Exportar JSON
                </button>
              )}
            </div>
            {parameterSensitivity && (
              <>
                <div className="metrics-grid">
                  <MetricCard label="Experimentos" value={parameterSensitivity.summary.count} />
                  <MetricCard label="Melhor parâmetro" value={parameterSensitivity.summary.best_parameter} />
                  <MetricCard label="Melhor fitness" value={parameterSensitivity.summary.best_fitness} />
                </div>
                <p className="note-text">{parameterSensitivity.summary.note}</p>
                <ParameterSensitivityChart data={parameterSensitivity} />
                <div className="table-wrap compact-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Parâmetro</th>
                        <th>Valor</th>
                        <th>Fitness</th>
                        <th>Tempo</th>
                        <th>Avaliações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parameterSensitivity.rows.map((row, index) => (
                        <tr key={`${row.parameter}-${row.value}-${index}`}>
                          <td>{row.parameter}</td>
                          <td>{row.value}</td>
                          <td>{row.fitness}</td>
                          <td>{row.runtime_ms} ms</td>
                          <td>{row.evaluations}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </Panel>
        </div>
      )}

      {tab === 'study' && (
        <Panel title="Roteiro de estudo para defesa" subtitle="Resumo do que cada integrante precisa dominar na arguição.">
          <div className="study-grid">
            <article>
              <Activity size={20} />
              <h3>Produto</h3>
              <p>Problema, público-alvo, decisão apoiada, requisitos, riscos de interpretação e limites do uso.</p>
            </article>
            <article>
              <BrainCircuit size={20} />
              <h3>Fuzzy</h3>
              <p>Variáveis, universos, pertinências, regras, Mamdani, agregação e defuzzificação por centroide.</p>
            </article>
            <article>
              <FlaskConical size={20} />
              <h3>Evolutivo</h3>
              <p>Representação por vetor de pesos, fitness, restrições, seleção, crossover, mutação e elitismo.</p>
            </article>
            <article>
              <BarChart3 size={20} />
              <h3>Validação</h3>
              <p>Cenários sintéticos, baselines, 5 sementes, sensibilidade, melhor/média/desvio-padrão e limitações.</p>
            </article>
            <article>
              <FileText size={20} />
              <h3>Documentação</h3>
              <p>README, execução, API, decisões técnicas, alinhamento com laudas e declaração de uso de IA.</p>
            </article>
          </div>
        </Panel>
      )}
    </main>
  );
}

export default App;
