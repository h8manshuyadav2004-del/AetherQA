export enum AgentType {
  UI = 'UI',
  Functional = 'Functional',
  DB = 'DB',
  Orchestrator = 'Orchestrator',
}

export enum AgentStatus {
  Idle = 'Idle',
  Running = 'Running',
  Completed = 'Completed',
  Error = 'Error',
}

export enum ModalType {
  Support = 'Support',
  Research = 'Research',
  CodeReview = 'CodeReview',
  Maintenance = 'Maintenance',
  YourIdea = 'YourIdea',
}

export interface AgentState {
  status: AgentStatus;
  logs: string[];
}

export interface Evidence {
  type: 'Screenshot' | 'Trace Log' | 'DB Query' | 'HAR File';
  link: string;
}

export interface Issue {
  id: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  agent: AgentType;
  description: string;
  recommendation: string;
  causalTrace: string;
  confidence: number;
  evidence: Evidence[];
  persona?: string;
}

export interface KpiMetrics {
  efficiency: number; // Bugs per 1k compute seconds
  meanTimeToDetect: number; // in hours
  flakinessScore: number; // percentage
  agentROI: {
    ui: number;
    functional: number;
    db: number;
  };
}

export interface TestResult {
  summary: {
    testsPassed: number;
    testsFailed: number;
    bugsFound: number;
    coveragePercent: number;
  };
  kpis: KpiMetrics;
  issues: Issue[];
}

export enum AdvancedModule {
  ShadowRunner = 'Shadow Runner & Replay',
  CausalTraceback = 'Cross-Layer Causal Provenance',
  PDATO = 'Persona-Driven Testing',
  LocatorGenie = 'Self-Healing Locators',
  DBContract = 'DB Contract Testing',
  TemporalFuzzing = 'Temporal & Fuzz Testing',
  AutoTicketing = 'AI-Narrated Bug Reports',
  ProvableCoverage = 'Provable Coverage Tokens',
}

export enum A11yAgentType {
    Scanner = 'Scanner',
    Simulator = 'Simulator',
    Fixer = 'Fixer',
    Validator = 'Validator',
    Integrator = 'Integrator'
}

export interface A11yAgentState {
  status: AgentStatus;
  logs: string[];
}

export interface A11yIssue {
  id: string;
  wcag: string;
  severity: 'Critical' | 'Serious' | 'Moderate' | 'Minor';
  description: string;
  element: string;
  fix: {
    recommendation: string;
    codeDiff: string;
  };
  prLink: string;
}

export interface A11yReport {
  summary: {
    url: string;
    issuesFound: number;
    issuesFixed: number;
    accessibilityScore: number;
  };
  issues: A11yIssue[];
}
