import { Activity, BarChart3, BrainCircuit, FlaskConical, Gauge, Layers3 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { ConvergenceChart, MembershipChart, RevenueComparisonChart } from './components/Charts';
import { MetricCard } from './components/MetricCard';
import { Panel } from './components/Panel';
import { ParameterPanel } from './components/ParameterPanel';
import { RulesTable } from './components/RulesTable';
import { ScenarioTable } from './components/ScenarioTable';
import { SummaryTable } from './components/SummaryTable';
import { api } from './services/api';
import type {
  MembershipFunctions,
  MultiSeedResponse,
  OptimizationResponse,
  ParkingInputPayload,
  Recommendation,
  Rule,
  SimulationResponse
} from './types';

const initialInputs: ParkingInputPayload = {
  base_rate: 8,
  occupancy: 72,
  demand: 6.5,
  event_level: 4,
  avg_stay_minutes: 90
};

type TabKey = 'recommendation' | 'model' | 'simulation' | 'evolution' | 'study';

function App() {
  const [tab, setTab] = useState<TabKey>('recommendation');
  const [inputs, setInputs] = useState<ParkingInputPayload>(initialInputs);
  const [recommendation, setRecommendation] = useState<Recommendation>();
  const [simulation, setSimulation] = useState<SimulationResponse>();
  const [optimization, setOptimization] = useState<OptimizationResponse>();
  const [multiSeed, setMultiSeed] = useState<MultiSeedResponse>();
  const [rules, setRules] = useState<Rule[]>([]);
  const [membership, setMembership] = useState<MembershipFunctions>();
  const [loading, setLoading] = useState<string>('');
  const [error, setError] = useState<string>('');

  const bestWeights = useMemo(() => optimization?.weights, [optimization]);

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
      const [rulesResponse, membershipResponse, recommendationResponse, simulationResponse] = await Promise.all([
        api.rules(),
        api.membershipFunctions(),
        api.recommend(initialInputs),
        api.simulate()
      ]);
      setRules(rulesResponse.rules);
      setMembership(membershipResponse);
      setRecommendation(recommendationResponse);
      setSimulation(simulationResponse);
    });
  }, []);

  const calculateRecommendation = () =>
    safeAction('Calculando recomendação', async () => {
      setRecommendation(await api.recommend(inputs));
    });

  const runSimulation = () =>
    safeAction('Rodando simulação', async () => {
      setSimulation(await api.simulate(bestWeights));
    });

  const runOptimization = () =>
    safeAction('Otimizando', async () => {
      const result = await api.optimize(32, 30, 42);
      setOptimization(result);
      setSimulation({ summary: result.comparison_summary, rows: result.comparison_rows });
    });

  const runMultiSeed = () =>
    safeAction('Rodando 5 sementes', async () => {
      setMultiSeed(await api.runFiveSeeds(24, 20, [7, 21, 42, 84, 126]));
    });

  return (
    <main>
      <header className="hero">
        <div>
          <p className="eyebrow">Sprint 1 · Protótipo fuzzy-evolutivo</p>
          <h1>ParkPrice AI</h1>
          <p>
            Sistema de apoio à decisão para precificação dinâmica de estacionamentos, com lógica fuzzy
            interpretável e otimização evolutiva de pesos de regras.
          </p>
        </div>
        <div className="hero-card">
          <span>Status da arquitetura</span>
          <strong>React + FastAPI + Python</strong>
          <small>Interface separada do motor de cálculo para facilitar estudo, teste e demonstração.</small>
        </div>
      </header>

      {error && <div className="error-box">{error}</div>}
      {loading && <div className="loading-box">{loading}...</div>}

      <nav className="tabs">
        <button className={tab === 'recommendation' ? 'active' : ''} onClick={() => setTab('recommendation')}>
          <Gauge size={16} /> Recomendação
        </button>
        <button className={tab === 'model' ? 'active' : ''} onClick={() => setTab('model')}>
          <BrainCircuit size={16} /> Modelo fuzzy
        </button>
        <button className={tab === 'simulation' ? 'active' : ''} onClick={() => setTab('simulation')}>
          <BarChart3 size={16} /> Simulação
        </button>
        <button className={tab === 'evolution' ? 'active' : ''} onClick={() => setTab('evolution')}>
          <FlaskConical size={16} /> Evolutivo
        </button>
        <button className={tab === 'study' ? 'active' : ''} onClick={() => setTab('study')}>
          <Layers3 size={16} /> Estudo
        </button>
      </nav>

      {tab === 'recommendation' && (
        <div className="grid two-columns">
          <Panel title="Entrada operacional" subtitle="Dados informados pelo usuário do protótipo.">
            <ParameterPanel
              values={inputs}
              onChange={setInputs}
              onSubmit={calculateRecommendation}
              loading={loading === 'Calculando recomendação'}
            />
          </Panel>

          <Panel title="Saída recomendada" subtitle="Resultado defuzzificado e interpretação linguística.">
            <div className="metrics-grid">
              <MetricCard label="Tarifa final" value={`R$ ${recommendation?.recommended_rate?.toFixed(2) ?? '--'}`} />
              <MetricCard label="Multiplicador" value={`${recommendation?.multiplier?.toFixed(2) ?? '--'}x`} />
              <MetricCard label="Classificação" value={recommendation?.label_pt ?? '--'} />
            </div>
            <div className="explanation-box">{recommendation?.explanation ?? 'Aguardando cálculo.'}</div>
            <h3>Regras mais ativadas</h3>
            <RulesTable rules={rules.slice(0, 18)} activations={recommendation?.activations} />
          </Panel>
        </div>
      )}

      {tab === 'model' && (
        <div className="stack">
          <Panel title="Funções de pertinência" subtitle="Evidência visual exigida para explicar variáveis, termos e universos.">
            <div className="membership-grid">
              <MembershipChart data={membership} variable="occupancy" />
              <MembershipChart data={membership} variable="demand" />
              <MembershipChart data={membership} variable="event" />
              <MembershipChart data={membership} variable="stay" />
              <MembershipChart data={membership} variable="multiplier" />
            </div>
          </Panel>
          <Panel title="Base de regras" subtitle="Sprint 1 já parte de 18 regras para atender a ampliação técnica da equipe de 5 integrantes.">
            <RulesTable rules={rules} activations={recommendation?.activations} />
          </Panel>
        </div>
      )}

      {tab === 'simulation' && (
        <div className="stack">
          <Panel title="Comparação de estratégias" subtitle="Tarifa fixa, heurística simples, fuzzy manual e fuzzy otimizado quando houver pesos otimizados.">
            <button className="secondary-button" onClick={runSimulation} disabled={Boolean(loading)}>
              Rodar simulação com cenários sintéticos
            </button>
            {simulation && <RevenueComparisonChart data={simulation.summary} />}
            {simulation && <SummaryTable rows={simulation.summary} />}
          </Panel>
          {simulation && (
            <Panel title="Cenários detalhados" subtitle="Cenários baixos, médios, críticos e conflitantes para análise de coerência.">
              <ScenarioTable rows={simulation.rows} />
            </Panel>
          )}
        </div>
      )}

      {tab === 'evolution' && (
        <div className="stack">
          <Panel title="Laboratório evolutivo" subtitle="Algoritmo genético otimizando pesos das 18 regras fuzzy.">
            <div className="action-row">
              <button className="primary-button" onClick={runOptimization} disabled={Boolean(loading)}>
                Executar AG
              </button>
              <button className="secondary-button" onClick={runMultiSeed} disabled={Boolean(loading)}>
                Rodar 5 sementes
              </button>
            </div>
            <div className="metrics-grid">
              <MetricCard label="Melhor aptidão" value={optimization?.fitness ?? '--'} />
              <MetricCard label="Quantidade de regras" value={rules.length || '--'} />
              <MetricCard label="Gerações padrão" value="30" />
            </div>
            <ConvergenceChart optimization={optimization} />
          </Panel>
          {multiSeed && (
            <Panel title="Estabilidade em 5 execuções" subtitle="Resumo exigido para métodos estocásticos.">
              <div className="metrics-grid">
                <MetricCard label="Melhor" value={multiSeed.summary.best_fitness} />
                <MetricCard label="Média" value={multiSeed.summary.mean_fitness} />
                <MetricCard label="Desvio-padrão" value={multiSeed.summary.std_fitness} />
              </div>
              <pre className="code-box">{JSON.stringify(multiSeed.summary, null, 2)}</pre>
            </Panel>
          )}
        </div>
      )}

      {tab === 'study' && (
        <Panel title="Roteiro de estudo para defesa" subtitle="Resumo do que a equipe precisa dominar na arguição.">
          <div className="study-grid">
            <article>
              <Activity size={20} />
              <h3>Produto</h3>
              <p>Problema, público-alvo, decisão apoiada, riscos de interpretação e por que não é apenas “cobrar mais caro”.</p>
            </article>
            <article>
              <BrainCircuit size={20} />
              <h3>Fuzzy</h3>
              <p>Variáveis, universos, pertinências, regras, inferência Mamdani, agregação e centroide.</p>
            </article>
            <article>
              <FlaskConical size={20} />
              <h3>Evolutivo</h3>
              <p>Representação como vetor de pesos, fitness, restrições, operadores, parâmetros e curva de convergência.</p>
            </article>
            <article>
              <BarChart3 size={20} />
              <h3>Validação</h3>
              <p>Cenários sintéticos, baselines, 5 sementes, melhor/média/desvio-padrão e limitações.</p>
            </article>
          </div>
        </Panel>
      )}
    </main>
  );
}

export default App;
