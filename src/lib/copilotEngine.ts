import type { RiskLevel } from "@/lib/utils";

/* ============================================================
   Motor mock do Argus (agente de QA).
   Gera "turnos" do agente com blocos ricos, roteirizados por
   intenção. Depois trocamos por Claude (Anthropic SDK) real.
   ============================================================ */

export interface RiskFactor {
  label: string;
  impact: RiskLevel;
}

export interface PlanScenario {
  type: "Positivo" | "Negativo" | "Borda" | "Regressão";
  name: string;
}

export interface SuggestedTest {
  id: string;
  name: string;
  type: "Unitário" | "Integração" | "API" | "E2E" | "Regressão";
  priority: RiskLevel;
  confidence: number;
}

export interface GateItem {
  label: string;
  ok: boolean;
}

export type Block =
  | { kind: "text"; text: string }
  | { kind: "steps"; steps: string[]; revealed?: number; done?: boolean }
  | {
      kind: "risk";
      pr: string;
      title: string;
      score: number;
      level: RiskLevel;
      module: string;
      coverage: number;
      factors: RiskFactor[];
    }
  | { kind: "plan"; title: string; scenarios: PlanScenario[] }
  | { kind: "tests"; tests: SuggestedTest[] }
  | {
      kind: "verdict";
      decision: string;
      level: RiskLevel;
      confidence: number;
      justification: string;
      gates: GateItem[];
    };

export interface Intent {
  key: string;
  label: string;
}

const riskBlock: Block = {
  kind: "risk",
  pr: "#482",
  title: "Refatora fluxo de refresh token e expiração de sessão",
  score: 78,
  level: "high",
  module: "core/auth",
  coverage: 61,
  factors: [
    { label: "Altera autenticação (módulo crítico)", impact: "high" },
    { label: "Cobertura abaixo do gate (61% < 80%)", impact: "high" },
    { label: "Sem testes para expiração de refresh token", impact: "high" },
    { label: "2 incidentes em core/auth nos últimos 90 dias", impact: "med" },
    { label: "18 arquivos alterados · +640 / −212", impact: "med" },
  ],
};

const planBlock: Block = {
  kind: "plan",
  title: "Plano de testes sugerido — PR #482",
  scenarios: [
    { type: "Positivo", name: "Login emite access + refresh token válidos" },
    { type: "Negativo", name: "Refresh token expirado retorna 401 e encerra a sessão" },
    { type: "Negativo", name: "Refresh token adulterado/ inválido é rejeitado" },
    { type: "Borda", name: "Refresh simultâneo em múltiplas abas mantém a sessão consistente" },
    { type: "Borda", name: "Relógio dessincronizado não invalida token ainda válido" },
    { type: "Regressão", name: "Login social continua funcionando após a refatoração" },
  ],
};

const testsBlock: Block = {
  kind: "tests",
  tests: [
    {
      id: "t1",
      name: "Refresh token expirado retorna 401 e limpa a sessão",
      type: "Integração",
      priority: "high",
      confidence: 92,
    },
    { id: "t2", name: "Rotação de refresh token invalida o token anterior", type: "API", priority: "high", confidence: 88 },
    { id: "t3", name: "Logout simultâneo em múltiplas sessões", type: "E2E", priority: "med", confidence: 76 },
  ],
};

function analysisTurn(): Block[] {
  return [
    {
      kind: "steps",
      steps: [
        "Lendo o diff do PR #482 (18 arquivos)",
        "Mapeando dependências e módulos afetados",
        "Cruzando com a suíte de testes e a cobertura",
        "Consultando o histórico de incidentes de core/auth",
        "Calculando o score de risco",
      ],
    },
    {
      kind: "text",
      text: "Analisei o PR #482 — Refatora fluxo de refresh token e expiração de sessão. Ele altera core/auth, um módulo crítico, e a cobertura da área está em 61%, abaixo do gate. Classifiquei como alto risco. Veja os fatores e o que eu sugiro testar:",
    },
    riskBlock,
    planBlock,
    testsBlock,
    {
      kind: "text",
      text: "Posso adicionar esses testes ao plano de validação, gerar o código dos casos de maior prioridade ou avaliar se a release está liberada. É só pedir.",
    },
  ];
}

function riskTurn(): Block[] {
  return [
    { kind: "steps", steps: ["Recuperando o diff", "Avaliando fatores de risco", "Calculando o score"] },
    {
      kind: "text",
      text: "O PR #482 ficou com score 78/100 (alto risco). Os fatores que mais pesaram:",
    },
    riskBlock,
  ];
}

function planTurn(): Block[] {
  return [
    { kind: "steps", steps: ["Interpretando a alteração", "Derivando cenários de teste", "Priorizando por risco"] },
    {
      kind: "text",
      text: "Montei um plano cobrindo cenários positivos, negativos, de borda e regressão para a mudança no fluxo de sessão:",
    },
    planBlock,
    testsBlock,
  ];
}

function verdictTurn(): Block[] {
  return [
    {
      kind: "steps",
      steps: [
        "Reunindo os PRs da release v4.2",
        "Checando os quality gates",
        "Avaliando risco agregado e cobertura",
        "Consolidando a recomendação",
      ],
    },
    {
      kind: "text",
      text: "Avaliei a release v4.2. Ainda não recomendo liberar — há gates não atendidos e um PR de alto risco sem cobertura suficiente:",
    },
    {
      kind: "verdict",
      decision: "Corrigir antes de liberar",
      level: "high",
      confidence: 88,
      justification:
        "A cobertura de core/auth (61%) está abaixo do gate mínimo de 80% e o PR #482 introduz mudança em autenticação sem testes de expiração de token. Recomendo adicionar os testes sugeridos e revalidar antes de liberar.",
      gates: [
        { label: "Nenhum problema crítico", ok: true },
        { label: "Cobertura ≥ 80%", ok: false },
        { label: "Testes de regressão concluídos", ok: true },
        { label: "Nenhum PR de alto risco", ok: false },
        { label: "Aprovação obrigatória de QA", ok: false },
      ],
    },
  ];
}

function coverageTurn(): Block[] {
  return [
    { kind: "steps", steps: ["Lendo o relatório de cobertura", "Localizando lacunas críticas"] },
    {
      kind: "text",
      text: "A cobertura global está em 82%, mas há lacunas críticas: core/auth está em 61% (fluxo de refresh token sem testes) e services/billing em 74% (webhook de pagamento). Sugiro priorizar core/auth, que é módulo crítico e tem PR aberto de alto risco.",
    },
    testsBlock,
  ];
}

/** Decide a resposta do agente a partir do texto do usuário. */
export function buildTurn(prompt: string): Block[] {
  const p = prompt.toLowerCase();
  // "analisar/revisar um PR" tem precedência: entrega a análise completa (risco + plano + testes)
  if (/(analis|revis|examin|o que testar|o que precisa testar)/.test(p)) return analysisTurn();
  if (/(libera|liberar|release|deploy|produ|go\/no)/.test(p)) return verdictTurn();
  if (/(cobertura|coverage|lacuna)/.test(p)) return coverageTurn();
  if (/(plano|casos de teste|cen[aá]rio)/.test(p)) return planTurn();
  if (/(risco|risk|perigo)/.test(p)) return riskTurn();
  return analysisTurn();
}

export const promptStarters: { icon: string; title: string; prompt: string }[] = [
  { icon: "scan", title: "Analisar o PR #482", prompt: "Analise o PR #482 e me diga o risco e o que testar" },
  { icon: "flask", title: "Gerar plano de testes", prompt: "Gere um plano de testes para a alteração do PR #482" },
  { icon: "shield", title: "Explicar o risco", prompt: "Por que o PR #482 é de alto risco?" },
  { icon: "rocket", title: "Posso liberar a v4.2?", prompt: "Posso liberar a release v4.2 para produção?" },
];

export const quickActions: { label: string; prompt: string }[] = [
  { label: "Analisar PR #482", prompt: "Analise o PR #482 e me diga o risco e o que testar" },
  { label: "Gerar plano de testes", prompt: "Gere um plano de testes para o PR #482" },
  { label: "Lacunas de cobertura", prompt: "Quais são as lacunas de cobertura?" },
  { label: "Posso liberar a v4.2?", prompt: "Posso liberar a release v4.2?" },
];
