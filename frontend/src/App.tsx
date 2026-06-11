import {
  Activity,
  BarChart3,
  BrainCircuit,
  Building2,
  CheckCircle2,
  Download,
  FileText,
  Gauge,
  KeyRound,
  Layers3,
  LogIn,
  LogOut,
  Lock,
  Mail,
  ParkingCircle,
  Play,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Store,
  UserPlus,
  UserRoundCog
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

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

type Actor = 'client' | 'admin';

type UserSession = {
  email: string;
  name: string;
  actor: Actor;
};

type StoredAccount = {
  email: string;
  name: string;
  actor: Actor;
  passwordHash: string;
  createdAt: string;
};
type TabKey = 'home' | 'recommendation' | 'simulation' | 'history' | 'model' | 'optimization' | 'analytics' | 'operations';

type TabItem = {
  key: TabKey;
  label: string;
  icon: ReactNode;
  actors: Actor[];
};

type HistoryRow = {
  id: string;
  createdAt: string;
  input: ParkingInputPayload;
  result: Recommendation;
};

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
    description: 'Pouca procura, baixa ocupação e permanência curta.',
    input: { base_rate: 8, occupancy: 20, demand: 2, event_level: 0, avg_stay_minutes: 45 }
  },
  {
    key: 'common_day',
    label: 'Dia comum',
    description: 'Cenário equilibrado para operação cotidiana.',
    input: { base_rate: 8, occupancy: 55, demand: 5, event_level: 1, avg_stay_minutes: 90 }
  },
  {
    key: 'moderate_peak',
    label: 'Pico moderado',
    description: 'Demanda elevada com ocupação ainda administrável.',
    input: { base_rate: 8, occupancy: 75, demand: 7.5, event_level: 4.5, avg_stay_minutes: 100 }
  },
  {
    key: 'early_full',
    label: 'Quase lotado',
    description: 'Ocupação crítica, evento forte e permanência longa.',
    input: { base_rate: 8, occupancy: 90, demand: 8.5, event_level: 8, avg_stay_minutes: 150 }
  },
  {
    key: 'event_with_vacancies',
    label: 'Evento com vagas',
    description: 'Evento forte, mas com boa disponibilidade de vagas.',
    input: { base_rate: 8, occupancy: 35, demand: 8, event_level: 9, avg_stay_minutes: 55 }
  },
  {
    key: 'operational_conflict',
    label: 'Conflito operacional',
    description: 'Ocupação alta, demanda baixa e sem evento próximo.',
    input: { base_rate: 8, occupancy: 85, demand: 2.5, event_level: 0, avg_stay_minutes: 160 }
  }
];

const tabs: TabItem[] = [
  { key: 'home', label: 'Início', icon: <Building2 size={16} />, actors: ['client', 'admin'] },
  { key: 'recommendation', label: 'Recomendação', icon: <Gauge size={16} />, actors: ['client', 'admin'] },
  { key: 'simulation', label: 'Simulação', icon: <BarChart3 size={16} />, actors: ['client', 'admin'] },
  { key: 'history', label: 'Histórico', icon: <FileText size={16} />, actors: ['client', 'admin'] },
  { key: 'model', label: 'Modelo', icon: <BrainCircuit size={16} />, actors: ['admin'] },
  { key: 'optimization', label: 'Otimização', icon: <SlidersHorizontal size={16} />, actors: ['admin'] },
  { key: 'analytics', label: 'Análises', icon: <Activity size={16} />, actors: ['admin'] },
  { key: 'operations', label: 'Operação', icon: <Layers3 size={16} />, actors: ['admin'] }
];

const variableOptions = [
  { key: 'occupancy', label: 'Ocupação' },
  { key: 'demand', label: 'Demanda' },
  { key: 'event_level', label: 'Evento/pico' },
  { key: 'avg_stay_minutes', label: 'Permanência' }
];

const AUTH_ACCOUNTS_KEY = 'parkprice_accounts';
const AUTH_SESSION_KEY = 'parkprice_session';

const presetAccounts: StoredAccount[] = [
  {
    email: 'cliente@parkprice.ai',
    name: 'Cliente Demonstração',
    actor: 'client',
    passwordHash: 'preset:cliente123',
    createdAt: 'preset'
  },
  {
    email: 'admin@parkprice.ai',
    name: 'Administrador Demonstração',
    actor: 'admin',
    passwordHash: 'preset:admin123',
    createdAt: 'preset'
  }
];

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sha256(value: string) {
  const encoded = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function getStoredAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(AUTH_ACCOUNTS_KEY);
    const stored = raw ? (JSON.parse(raw) as StoredAccount[]) : [];
    return [...presetAccounts, ...stored];
  } catch {
    return presetAccounts;
  }
}

function saveClientAccount(account: StoredAccount) {
  const raw = localStorage.getItem(AUTH_ACCOUNTS_KEY);
  const stored = raw ? (JSON.parse(raw) as StoredAccount[]) : [];
  const filtered = stored.filter((item) => normalizeEmail(item.email) !== normalizeEmail(account.email));
  localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify([...filtered, account]));
}

function readStoredSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserSession;
    if ((parsed.actor === 'client' || parsed.actor === 'admin') && parsed.email) return parsed;
  } catch {
    return null;
  }
  return null;
}

function toCurrency(value?: number) {
  if (value === undefined || Number.isNaN(value)) return '--';
  return `R$ ${value.toFixed(2)}`;
}

function toNumber(value?: number) {
  if (value === undefined || Number.isNaN(value)) return '--';
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
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

function BadgeRow({ items }: { items: string[] }) {
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


function classifyOccupancy(value: number) {
  if (value < 40) return 'há folga de vagas e a tarifa pode funcionar como incentivo de entrada';
  if (value < 70) return 'a ocupação está em faixa saudável para operação comum';
  if (value < 88) return 'a ocupação está alta e exige atenção para evitar falta de vagas';
  return 'a ocupação está crítica e a prioridade passa a ser controlar lotação e rotatividade';
}

function classifyDemand(value: number) {
  if (value < 4) return 'a procura prevista é baixa';
  if (value < 7) return 'a procura prevista é moderada';
  return 'a procura prevista é alta';
}

function classifyStay(value: number) {
  if (value < 75) return 'a permanência média é curta, favorecendo rotatividade';
  if (value < 140) return 'a permanência média está em nível comum';
  return 'a permanência média é longa, reduzindo a disponibilidade de vagas ao longo do dia';
}

function actionAdvice(label?: string) {
  if (label === 'desconto') return 'A recomendação indica oportunidade de atrair mais veículos sem pressionar a ocupação.';
  if (label === 'normal') return 'A recomendação indica manter uma tarifa estável, pois o cenário não exige ajuste agressivo.';
  if (label === 'moderado') return 'A recomendação indica ajuste controlado para equilibrar demanda e disponibilidade.';
  if (label === 'alto') return 'A recomendação indica aumento relevante para preservar vagas e melhorar a rotatividade.';
  if (label === 'critico') return 'A recomendação indica cenário crítico: valide a operação antes de aplicar e acompanhe a reação da demanda.';
  return 'Calcule uma recomendação para receber uma orientação operacional.';
}

function ClientRecommendationGuide({ inputs, recommendation }: { inputs: ParkingInputPayload; recommendation?: Recommendation }) {
  return (
    <div className="guide-panel">
      <h3>Como interpretar esta recomendação</h3>
      <div className="guide-grid">
        <article>
          <strong>Ocupação</strong>
          <span>{classifyOccupancy(inputs.occupancy)}.</span>
        </article>
        <article>
          <strong>Demanda</strong>
          <span>{classifyDemand(inputs.demand)}.</span>
        </article>
        <article>
          <strong>Permanência</strong>
          <span>{classifyStay(inputs.avg_stay_minutes)}.</span>
        </article>
      </div>
      <div className="guide-callout">
        <strong>Orientação prática</strong>
        <p>{actionAdvice(recommendation?.label_pt)}</p>
      </div>
    </div>
  );
}

function ClientSimulationGuide({ simulation }: { simulation?: SimulationResponse }) {
  const bestStrategy = simulation?.summary.reduce((best, current) =>
    current.total_revenue > best.total_revenue ? current : best
  );
  const optimized = simulation?.summary.find((row) => row.strategy.toLowerCase().includes('otimizado'));
  const manual = simulation?.summary.find((row) => row.strategy.toLowerCase().includes('manual'));
  const delta = optimized && manual ? optimized.total_revenue - manual.total_revenue : undefined;

  return (
    <div className="guide-panel">
      <h3>Leitura do gráfico de comparação</h3>
      <p>
        O gráfico compara estratégias usando os mesmos cenários operacionais. Ele não promete receita real: serve para indicar qual
        política se comporta melhor sob as hipóteses cadastradas.
      </p>
      <div className="guide-grid">
        <article>
          <strong>Maior receita estimada</strong>
          <span>{bestStrategy ? bestStrategy.strategy.replaceAll('_', ' ') : 'Atualize a simulação para visualizar.'}</span>
        </article>
        <article>
          <strong>Ocupação média</strong>
          <span>
            O ideal é evitar tanto vagas vazias demais quanto lotação constante. Por isso a maior tarifa nem sempre é a melhor decisão.
          </span>
        </article>
        <article>
          <strong>Comparação com configuração manual</strong>
          <span>{delta !== undefined ? `Diferença estimada: ${toCurrency(delta)}.` : 'Execute a calibração para comparar com a versão otimizada.'}</span>
        </article>
      </div>
    </div>
  );
}

function DataNotice() {
  return (
    <div className="data-notice">
      <ShieldCheck size={18} />
      <div>
        <strong>Tratamento de dados neste ambiente</strong>
        <p>
          O cadastro de cliente é salvo somente no navegador usado na demonstração. A senha é convertida em hash SHA-256 antes de
          ser armazenada localmente. Não envie senhas reais nem dados pessoais sensíveis.
        </p>
      </div>
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: (session: UserSession) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('cliente@parkprice.ai');
  const [password, setPassword] = useState('cliente123');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedDataNotice, setAcceptedDataNotice] = useState(false);
  const [message, setMessage] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  function fillPreset(nextActor: Actor) {
    if (nextActor === 'admin') {
      setEmail('admin@parkprice.ai');
      setPassword('admin123');
    } else {
      setEmail('cliente@parkprice.ai');
      setPassword('cliente123');
    }
    setMode('login');
    setMessage('');
  }

  async function resolvePasswordHash(account: StoredAccount, plainPassword: string) {
    if (account.passwordHash.startsWith('preset:')) {
      return account.passwordHash === `preset:${plainPassword}`;
    }
    return account.passwordHash === (await sha256(plainPassword));
  }

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    const normalized = normalizeEmail(email);
    if (!isValidEmail(normalized)) {
      setMessage('Informe um e-mail válido.');
      return;
    }
    if (!password) {
      setMessage('Informe a senha.');
      return;
    }

    setFormLoading(true);
    try {
      const account = getStoredAccounts().find((item) => normalizeEmail(item.email) === normalized);
      if (!account || !(await resolvePasswordHash(account, password))) {
        setMessage('E-mail ou senha inválidos. Use uma conta de teste ou cadastre um novo cliente.');
        return;
      }
      onLogin({ email: account.email, name: account.name, actor: account.actor });
    } finally {
      setFormLoading(false);
    }
  }

  async function submitRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    const normalized = normalizeEmail(email);
    if (!isValidEmail(normalized)) {
      setMessage('Informe um e-mail válido para cadastro.');
      return;
    }
    if (getStoredAccounts().some((item) => normalizeEmail(item.email) === normalized)) {
      setMessage('Este e-mail já possui acesso. Faça login ou use outro e-mail.');
      return;
    }
    if (password.length < 8) {
      setMessage('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('A confirmação da senha não confere.');
      return;
    }
    if (!acceptedDataNotice) {
      setMessage('Confirme a ciência sobre o tratamento local dos dados para continuar.');
      return;
    }

    setFormLoading(true);
    try {
      const account: StoredAccount = {
        email: normalized,
        name: name.trim() || 'Cliente ParkPrice',
        actor: 'client',
        passwordHash: await sha256(password),
        createdAt: new Date().toISOString()
      };
      saveClientAccount(account);
      onLogin({ email: account.email, name: account.name, actor: account.actor });
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-hero">
        <div>
          <p className="eyebrow">ParkPrice AI</p>
          <h1>Precificação inteligente para estacionamentos.</h1>
          <p>
            Recomende tarifas por contexto operacional, acompanhe cenários e mantenha uma decisão explicável para gestores e
            clientes corporativos.
          </p>
          <BadgeRow items={['tarifa explicável', 'controle de lotação', 'rotatividade', 'análise operacional']} />
        </div>
        <div className="login-panel auth-panel">
          <span className="login-kicker"><KeyRound size={16} /> Acesso ao painel</span>
          <h2>{mode === 'login' ? 'Entrar no ParkPrice AI' : 'Cadastrar cliente'}</h2>
          <p>
            Use uma conta de teste ou cadastre um novo cliente. Contas administrativas não são criadas pela tela pública.
          </p>

          <div className="demo-credentials">
            <button type="button" onClick={() => fillPreset('client')}>
              <Store size={16} /> Cliente teste
              <span>cliente@parkprice.ai / cliente123</span>
            </button>
            <button type="button" onClick={() => fillPreset('admin')}>
              <UserRoundCog size={16} /> Admin teste
              <span>admin@parkprice.ai / admin123</span>
            </button>
          </div>

          <div className="auth-toggle" role="tablist" aria-label="Alternar acesso">
            <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')} type="button">
              <LogIn size={16} /> Login
            </button>
            <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')} type="button">
              <UserPlus size={16} /> Novo cliente
            </button>
          </div>

          <form className="auth-form" onSubmit={mode === 'login' ? submitLogin : submitRegister}>
            {mode === 'register' && (
              <label>
                Nome do cliente
                <div className="input-with-icon">
                  <UserPlus size={16} />
                  <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Estacionamento Centro" />
                </div>
              </label>
            )}
            <label>
              E-mail
              <div className="input-with-icon">
                <Mail size={16} />
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="email@empresa.com" />
              </div>
            </label>
            <label>
              Senha
              <div className="input-with-icon">
                <Lock size={16} />
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Senha" />
              </div>
            </label>
            {mode === 'register' && (
              <>
                <label>
                  Confirmar senha
                  <div className="input-with-icon">
                    <Lock size={16} />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Repita a senha"
                    />
                  </div>
                </label>
                <DataNotice />
                <label className="consent-row">
                  <input
                    type="checkbox"
                    checked={acceptedDataNotice}
                    onChange={(event) => setAcceptedDataNotice(event.target.checked)}
                  />
                  Li e aceito o tratamento local dos dados informados neste ambiente.
                </label>
              </>
            )}
            {message && <div className="auth-message">{message}</div>}
            <button className="primary-button" disabled={formLoading} type="submit">
              {formLoading ? 'Validando...' : mode === 'login' ? 'Entrar' : 'Criar acesso de cliente'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function App() {
  const [session, setSession] = useState<UserSession | null>(() => readStoredSession());
  const [tab, setTab] = useState<TabKey>('home');
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
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState<string>('');
  const [error, setError] = useState<string>('');

  const actor = session?.actor ?? null;
  const bestWeights = useMemo(() => optimization?.weights, [optimization]);
  const visibleTabs = tabs.filter((item) => actor && item.actors.includes(actor));
  const activeRuleCount = recommendation?.activations.filter((item) => item.weighted_activation > 0).length ?? 0;
  const optimizedSummary = simulation?.summary.find((row) => row.strategy.toLowerCase().includes('otimizado'));
  const manualSummary = simulation?.summary.find((row) => row.strategy.toLowerCase().includes('manual'));
  const revenueDelta = optimizedSummary && manualSummary ? optimizedSummary.total_revenue - manualSummary.total_revenue : undefined;

  async function safeAction(label: string, action: () => Promise<void>) {
    setLoading(label);
    setError('');
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível concluir a operação.');
    } finally {
      setLoading('');
    }
  }

  useEffect(() => {
    if (!actor) return;
    safeAction('Carregando ambiente', async () => {
      const [rulesResponse, membershipResponse, recommendationResponse, simulationResponse, scenariosResponse] = await Promise.all([
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
  }, [actor]);

  useEffect(() => {
    if (!actor) return;
    const currentTab = tabs.find((item) => item.key === tab);
    if (!currentTab || !currentTab.actors.includes(actor)) {
      setTab('home');
    }
  }, [actor, tab]);

  function login(nextSession: UserSession) {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
    setTab('home');
  }

  function logout() {
    localStorage.removeItem(AUTH_SESSION_KEY);
    setSession(null);
    setTab('home');
  }

  function saveHistory(payload: ParkingInputPayload, result: Recommendation) {
    const row: HistoryRow = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      createdAt: new Date().toLocaleString('pt-BR'),
      input: payload,
      result
    };
    setHistory((current) => [row, ...current].slice(0, 12));
  }

  const calculateRecommendationFor = (payload: ParkingInputPayload) =>
    safeAction('Calculando recomendação', async () => {
      const result = await api.recommend(payload);
      setRecommendation(result);
      saveHistory(payload, result);
    });

  const calculateRecommendation = () => calculateRecommendationFor(inputs);

  const applyPreset = (payload: ParkingInputPayload) => {
    setInputs(payload);
    void calculateRecommendationFor(payload);
  };

  const runSimulation = () =>
    safeAction('Atualizando simulação', async () => {
      setSimulation(await api.simulate(bestWeights));
    });

  const runOptimization = () =>
    safeAction('Otimizando regras', async () => {
      const result = await api.optimize(gaParams);
      setOptimization(result);
      setSimulation({ summary: result.comparison_summary, rows: result.comparison_rows });
    });

  const runMultiSeed = () =>
    safeAction('Executando rodadas independentes', async () => {
      setMultiSeed(await api.runFiveSeeds(gaParams, [7, 21, 42, 84, 126]));
    });

  const runFuzzySensitivity = (variable: string) =>
    safeAction('Analisando comportamento do modelo', async () => {
      setFuzzySensitivity(await api.fuzzySensitivity(variable, inputs, bestWeights));
    });

  const runParameterSensitivity = () =>
    safeAction('Comparando configurações do otimizador', async () => {
      setParameterSensitivity(await api.parameterSensitivity(gaParams));
    });

  if (!actor) {
    return <LoginScreen onLogin={login} />;
  }

  return (
    <main className={`app-shell actor-${actor}`}>
      <header className="hero product-hero">
        <div>
          <p className="eyebrow">ParkPrice AI</p>
          <div className="hero-title-row">
            <h1>{actor === 'client' ? 'Painel do Cliente' : 'Console Administrativo'}</h1>
            <div className="account-pill">
              {actor === 'client' ? <Store size={16} /> : <UserRoundCog size={16} />}
              <span>{session?.name ?? (actor === 'client' ? 'Cliente' : 'Administrador')}</span>
              <button onClick={logout} aria-label="Sair">
                <LogOut size={16} />
              </button>
            </div>
          </div>
          <p>
            {actor === 'client'
              ? 'Acompanhe cenários de ocupação e receba recomendações de tarifa com justificativas claras para a operação.'
              : 'Gerencie regras, simulações, otimização evolutiva e análises de desempenho do motor de precificação.'}
          </p>
          <BadgeRow
            items={
              actor === 'client'
                ? ['recomendação por cenário', 'justificativa operacional', 'exportação de resultados']
                : ['18 regras', '12 cenários', 'AG parametrizável', 'análise de sensibilidade']
            }
          />
        </div>
        <div className="hero-card">
          <span>{actor === 'client' ? 'Operação comercial' : 'Inteligência operacional'}</span>
          <strong>{recommendation ? toCurrency(recommendation.recommended_rate) : '--'}</strong>
          <small>
            {recommendation
              ? `Recomendação atual: ${recommendation.label_pt} · multiplicador ${recommendation.multiplier.toFixed(2)}x`
              : 'Calcule uma recomendação para visualizar a tarifa sugerida.'}
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

      {tab === 'home' && (
        <div className="stack">
          <Panel
            title={actor === 'client' ? 'Resumo operacional' : 'Resumo do sistema'}
            subtitle={
              actor === 'client'
                ? 'Indicadores principais para tomada de decisão no dia a dia.'
                : 'Visão consolidada do motor fuzzy-evolutivo e dos recursos administrativos.'
            }
          >
            <div className="metrics-grid four">
              <MetricCard label="Tarifa recomendada" value={toCurrency(recommendation?.recommended_rate)} hint="resultado atual" />
              <MetricCard label="Multiplicador" value={`${recommendation?.multiplier?.toFixed(2) ?? '--'}x`} hint="sobre a tarifa-base" />
              <MetricCard label="Classificação" value={recommendation?.label_pt ?? '--'} hint="interpretação operacional" />
              <MetricCard label="Cenários cadastrados" value={scenarios.length || 12} hint="base de simulação" />
            </div>
            <div className="feature-grid">
              <article>
                <ParkingCircle size={22} />
                <h3>Controle de ocupação</h3>
                <p>O sistema ajusta a recomendação conforme lotação, demanda, eventos e permanência média.</p>
              </article>
              <article>
                <ShieldCheck size={22} />
                <h3>Tarifa explicável</h3>
                <p>A saída acompanha uma justificativa para evitar decisões opacas e facilitar a conferência do gestor.</p>
              </article>
              <article>
                <Sparkles size={22} />
                <h3>Otimização inteligente</h3>
                <p>O console administrativo permite calibrar pesos das regras e comparar a operação antes e depois.</p>
              </article>
            </div>
          </Panel>

          {actor === 'admin' && (
            <Panel title="Itens críticos monitorados" subtitle="Pontos que mantêm a solução organizada, explicável e reprodutível.">
              <div className="checklist-grid">
                {[
                  'Variáveis e universos de discurso definidos',
                  'Funções de pertinência visíveis',
                  'Base com 18 regras rastreáveis',
                  'Inferência Mamdani e centroide',
                  'Comparação com tarifa fixa e heurística',
                  'Algoritmo Genético com parâmetros editáveis',
                  'Rodadas independentes com sementes distintas',
                  'Exportação de simulações e análises',
                  'Tratamento de entradas inválidas pela API',
                  'Documentação e comandos de execução'
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
            <Panel title="Dados da operação" subtitle="Ajuste o cenário atual do estacionamento.">
              <ParameterPanel
                values={inputs}
                onChange={setInputs}
                onSubmit={calculateRecommendation}
                loading={loading === 'Calculando recomendação'}
              />
            </Panel>
            <Panel title="Cenários rápidos" subtitle="Atalhos para simular situações comuns da operação.">
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

          <Panel title="Recomendação de tarifa" subtitle="Resultado calculado a partir do cenário informado.">
            <div className="metrics-grid">
              <MetricCard label="Tarifa final" value={toCurrency(recommendation?.recommended_rate)} />
              <MetricCard label="Multiplicador" value={`${recommendation?.multiplier?.toFixed(2) ?? '--'}x`} />
              <MetricCard label="Classificação" value={recommendation?.label_pt ?? '--'} />
            </div>
            <div className="explanation-box">{recommendation?.explanation ?? 'Informe um cenário para calcular a recomendação.'}</div>
            {actor === 'client' && <ClientRecommendationGuide inputs={inputs} recommendation={recommendation} />}
            <div className="action-row">
              {recommendation && (
                <button
                  className="secondary-button"
                  onClick={() => downloadJson('parkprice-recomendacao.json', { input: inputs, recommendation })}
                >
                  <Download size={16} /> Exportar recomendação
                </button>
              )}
            </div>
            {actor === 'admin' && (
              <>
                <BadgeRow items={[`${activeRuleCount} regras acionadas`, 'método interpretável', 'saída defuzzificada']} />
                <OutputCurveChart recommendation={recommendation} />
              </>
            )}
          </Panel>
        </div>
      )}

      {tab === 'simulation' && (
        <div className="stack">
          <Panel title="Comparação de estratégias" subtitle="Compara tarifa fixa, heurística, regra manual e configuração otimizada.">
            <div className="action-row">
              <button className="primary-button" onClick={runSimulation} disabled={Boolean(loading)}>
                <Play size={16} /> Atualizar simulação
              </button>
              {simulation && (
                <>
                  <button className="secondary-button" onClick={() => downloadJson('parkprice-simulacao.json', simulation)}>
                    <Download size={16} /> Exportar JSON
                  </button>
                  <button
                    className="secondary-button"
                    onClick={() => downloadCsv('parkprice-simulacao.csv', simulation.rows as unknown as Array<Record<string, unknown>>)}
                  >
                    <Download size={16} /> Exportar CSV
                  </button>
                </>
              )}
            </div>
            {simulation && <RevenueComparisonChart data={simulation.summary} />}
            {actor === 'client' && <ClientSimulationGuide simulation={simulation} />}
            {simulation && <SummaryTable rows={simulation.summary} />}
            {actor === 'admin' && revenueDelta !== undefined && (
              <p className="note-text">
                Diferença estimada entre configuração otimizada e manual: {toCurrency(revenueDelta)} na base de cenários cadastrada.
              </p>
            )}
          </Panel>
          {actor === 'admin' && simulation && (
            <Panel title="Cenários detalhados" subtitle="Entradas, expectativa operacional e saída calculada para cada estratégia.">
              <ScenarioTable rows={simulation.rows} />
            </Panel>
          )}
        </div>
      )}

      {tab === 'history' && (
        <Panel title="Histórico de recomendações" subtitle="Últimas recomendações calculadas nesta sessão.">
          {history.length === 0 ? (
            <div className="empty-state">Nenhuma recomendação foi registrada nesta sessão.</div>
          ) : (
            <div className="table-wrap compact-table">
              <table>
                <thead>
                  <tr>
                    <th>Horário</th>
                    <th>Ocupação</th>
                    <th>Demanda</th>
                    <th>Evento</th>
                    <th>Permanência</th>
                    <th>Tarifa</th>
                    <th>Classe</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row) => (
                    <tr key={row.id}>
                      <td>{row.createdAt}</td>
                      <td>{row.input.occupancy}%</td>
                      <td>{row.input.demand}</td>
                      <td>{row.input.event_level}</td>
                      <td>{row.input.avg_stay_minutes} min</td>
                      <td>{toCurrency(row.result.recommended_rate)}</td>
                      <td>{row.result.label_pt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {history.length > 0 && (
            <div className="action-row">
              <button className="secondary-button" onClick={() => downloadJson('parkprice-historico.json', history)}>
                <Download size={16} /> Exportar histórico
              </button>
            </div>
          )}
        </Panel>
      )}

      {tab === 'model' && (
        <div className="stack">
          <Panel title="Transparência do modelo" subtitle="Funções de pertinência usadas para interpretar as entradas e a saída.">
            <BadgeRow items={['4 entradas', '1 saída', 'termos linguísticos', 'gráficos por variável']} />
            <div className="membership-grid">
              <MembershipChart data={membership} variable="occupancy" />
              <MembershipChart data={membership} variable="demand" />
              <MembershipChart data={membership} variable="event" />
              <MembershipChart data={membership} variable="stay" />
              <MembershipChart data={membership} variable="multiplier" />
            </div>
          </Panel>
          <Panel title="Base de regras" subtitle="Regras linguísticas que conectam contexto operacional e multiplicador de tarifa.">
            <RulesTable rules={rules} activations={recommendation?.activations} />
          </Panel>
        </div>
      )}

      {tab === 'optimization' && (
        <div className="stack">
          <Panel title="Configuração do otimizador" subtitle="Ajuste parâmetros do Algoritmo Genético antes de executar a calibração.">
            <div className="ga-grid">
              <label>
                População
                <input
                  type="number"
                  min={8}
                  max={200}
                  value={gaParams.population_size}
                  onChange={(event) => setGaParams({ ...gaParams, population_size: Number(event.target.value) })}
                />
              </label>
              <label>
                Gerações
                <input
                  type="number"
                  min={1}
                  max={250}
                  value={gaParams.generations}
                  onChange={(event) => setGaParams({ ...gaParams, generations: Number(event.target.value) })}
                />
              </label>
              <label>
                Seed
                <input
                  type="number"
                  min={0}
                  value={gaParams.seed}
                  onChange={(event) => setGaParams({ ...gaParams, seed: Number(event.target.value) })}
                />
              </label>
              <label>
                Crossover
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  value={gaParams.crossover_probability}
                  onChange={(event) => setGaParams({ ...gaParams, crossover_probability: Number(event.target.value) })}
                />
              </label>
              <label>
                Mutação
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  value={gaParams.mutation_probability}
                  onChange={(event) => setGaParams({ ...gaParams, mutation_probability: Number(event.target.value) })}
                />
              </label>
            </div>
          </Panel>

          <Panel title="Calibração evolutiva" subtitle="O Algoritmo Genético ajusta pesos das regras para melhorar a função de aptidão.">
            <div className="action-row">
              <button className="primary-button" onClick={runOptimization} disabled={Boolean(loading)}>
                <Play size={16} /> Executar calibração
              </button>
              <button className="secondary-button" onClick={runMultiSeed} disabled={Boolean(loading)}>
                Rodar execuções independentes
              </button>
              {optimization && (
                <button className="secondary-button" onClick={() => downloadJson('parkprice-otimizacao.json', optimization)}>
                  <Download size={16} /> Exportar calibração
                </button>
              )}
            </div>
            <div className="metrics-grid four">
              <MetricCard label="Melhor aptidão" value={toNumber(optimization?.fitness)} />
              <MetricCard label="Avaliações" value={optimization?.performance.evaluations ?? '--'} />
              <MetricCard label="Tempo" value={optimization ? `${optimization.performance.runtime_ms} ms` : '--'} />
              <MetricCard label="Regras calibradas" value={rules.length || '--'} />
            </div>
            <ConvergenceChart optimization={optimization} />
          </Panel>

          {multiSeed && (
            <Panel title="Estabilidade das execuções" subtitle="Resumo de rodadas independentes para observar variação estatística.">
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
                      <th>Aptidão</th>
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

      {tab === 'analytics' && (
        <div className="stack">
          <Panel title="Sensibilidade do modelo" subtitle="Varia uma entrada por vez mantendo as demais fixas.">
            <div className="action-row">
              {variableOptions.map((variable) => (
                <button key={variable.key} className="secondary-button" onClick={() => runFuzzySensitivity(variable.key)} disabled={Boolean(loading)}>
                  {variable.label}
                </button>
              ))}
              {fuzzySensitivity && (
                <button
                  className="secondary-button"
                  onClick={() => downloadCsv('parkprice-sensibilidade-modelo.csv', fuzzySensitivity.rows as unknown as Array<Record<string, unknown>>)}
                >
                  <Download size={16} /> Exportar CSV
                </button>
              )}
            </div>
            {fuzzySensitivity && <p className="note-text">{fuzzySensitivity.interpretation}</p>}
            <FuzzySensitivityChart data={fuzzySensitivity} />
          </Panel>

          <Panel title="Sensibilidade do otimizador" subtitle="Compara configurações de população, gerações, crossover e mutação.">
            <div className="action-row">
              <button className="primary-button" onClick={runParameterSensitivity} disabled={Boolean(loading)}>
                <Play size={16} /> Executar análise
              </button>
              {parameterSensitivity && (
                <button className="secondary-button" onClick={() => downloadJson('parkprice-sensibilidade-otimizador.json', parameterSensitivity)}>
                  <Download size={16} /> Exportar JSON
                </button>
              )}
            </div>
            {parameterSensitivity && (
              <>
                <div className="metrics-grid">
                  <MetricCard label="Configurações" value={parameterSensitivity.summary.count} />
                  <MetricCard label="Melhor parâmetro" value={parameterSensitivity.summary.best_parameter} />
                  <MetricCard label="Melhor aptidão" value={parameterSensitivity.summary.best_fitness} />
                </div>
                <p className="note-text">{parameterSensitivity.summary.note}</p>
                <ParameterSensitivityChart data={parameterSensitivity} />
                <div className="table-wrap compact-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Parâmetro</th>
                        <th>Valor</th>
                        <th>Aptidão</th>
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

      {tab === 'operations' && (
        <Panel title="Mapa operacional" subtitle="Resumo interno para explicar a arquitetura e manter a equipe alinhada.">
          <div className="study-grid">
            <article>
              <Building2 size={20} />
              <h3>Produto</h3>
              <p>Administrador informa cenário; o sistema recomenda tarifa e apresenta justificativa operacional.</p>
            </article>
            <article>
              <BrainCircuit size={20} />
              <h3>Modelo fuzzy</h3>
              <p>Entradas graduais são convertidas em termos linguísticos, regras são acionadas e a saída é defuzzificada.</p>
            </article>
            <article>
              <SlidersHorizontal size={20} />
              <h3>Algoritmo Genético</h3>
              <p>Cada solução é um vetor de pesos das regras. Seleção, crossover, mutação e elitismo buscam melhor aptidão.</p>
            </article>
            <article>
              <BarChart3 size={20} />
              <h3>Validação</h3>
              <p>Cenários, baselines, execuções independentes, convergência e sensibilidade sustentam a análise.</p>
            </article>
            <article>
              <FileText size={20} />
              <h3>Reprodutibilidade</h3>
              <p>API, frontend, dados de exemplo, testes e documentação mantêm a execução conferível por outra pessoa.</p>
            </article>
          </div>
        </Panel>
      )}
    </main>
  );
}

export default App;
