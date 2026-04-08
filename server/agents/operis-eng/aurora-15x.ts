/**
 * OPERIS.Eng — AURORA-15X
 * Agente síntese multimodal com 15 especialidades de engenharia.
 * Metodologia ERC: Estratégia, Rastreabilidade, Controle.
 *
 * 100% agnóstico de IA — qualquer provider pode ser registrado via painel.
 * Suporte nativo para: OpenAI, Gemini, Groq, Together.ai, Ollama, HuggingFace,
 * OpenRouter, LM Studio, Mistral, Cohere e qualquer endpoint OpenAI-compatible.
 */

// ─── Tipos base ───────────────────────────────────────────────────────────────

export type EngineeringDomain =
  | "civil"
  | "producao"
  | "mecanica"
  | "eletrica"
  | "automacao"
  | "ambiental"
  | "seguranca_trabalho"
  | "quimica"
  | "materiais"
  | "software"
  | "arquitetura_ia"
  | "dados_analytics"
  | "custos_orcamentacao"
  | "estrutural_calculista"
  | "projetista_bim_cad";

export type AdjacentProfession =
  | "orcamentista"
  | "designer_grafico_tecnico"
  | "gestor_custos_ia"
  | "marketing_tecnico"
  | "gestor_produto_saas";

export type ERCPhase = "estrategia" | "rastreabilidade" | "controle";

export type ModelTier = "free" | "cheap" | "standard" | "premium" | "local";

export interface ProviderConfig {
  id: string;
  name: string;
  /** Endpoint base — ex: https://api.openai.com/v1 */
  baseUrl: string;
  /** Chave de API — vazia para modelos locais (Ollama, LM Studio) */
  apiKey?: string;
  /** Nome do modelo — ex: gpt-4o-mini, llama3, gemma2 */
  model: string;
  tier: ModelTier;
  /** Custo estimado por 1k tokens de input (USD). 0 para gratuitos. */
  costPer1kInput: number;
  /** Custo estimado por 1k tokens de output (USD). 0 para gratuitos. */
  costPer1kOutput: number;
  /** Máximo de tokens de contexto */
  maxContextTokens: number;
  /** Capacidades declaradas */
  capabilities: string[];
  /** Ativo no momento */
  active: boolean;
  /** Criado em */
  createdAt: Date;
}

export interface ERCTask {
  taskId: string;
  domain: EngineeringDomain | AdjacentProfession;
  phase: ERCPhase;
  prompt: string;
  context?: Record<string, unknown>;
  fileUrl?: string;
  providerId?: string;
  triggeredBy: string;
  companyId?: number;
}

export interface ERCResult {
  taskId: string;
  domain: string;
  phase: ERCPhase;
  providerId: string;
  providerModel: string;
  status: "success" | "error" | "fallback";
  result?: string;
  error?: string;
  tokensInput?: number;
  tokensOutput?: number;
  costUsd?: number;
  durationMs: number;
  timestamp: Date;
  /** Trilha de auditoria ERC */
  auditTrail: AuditEntry[];
}

export interface AuditEntry {
  phase: ERCPhase;
  action: string;
  detail: string;
  timestamp: Date;
}

// ─── Catálogo das 15 especialidades ──────────────────────────────────────────

export const ENGINEERING_DOMAINS: Record<
  EngineeringDomain,
  {
    label: string;
    niche: string;
    systemPrompt: string;
    projectsInDemand: string[];
    ercGuidelines: Record<ERCPhase, string[]>;
  }
> = {
  civil: {
    label: "Engenharia Civil",
    niche: "Infraestrutura, obras públicas, construção civil, PAC, habitação",
    systemPrompt:
      "Você é um engenheiro civil sênior especializado em infraestrutura brasileira. Domina ABNT NBR, DNIT, DEINFRA, normas CREA, dimensionamento estrutural, orçamento SINAPI, cronograma físico-financeiro e gestão de obras. Aplica metodologia ERC: define estratégia antes de calcular, rastreia cada decisão com norma e versão, e controla via KPIs e checklists.",
    projectsInDemand: [
      "Retrofit de pontes e viadutos (PAC)",
      "Habitação social (MCMV 3.0)",
      "Saneamento básico (Marco do Saneamento)",
      "Pavimentação urbana e rural",
      "Contenção de encostas e drenagem",
    ],
    ercGuidelines: {
      estrategia: [
        "Definir escopo e memorial descritivo",
        "Mapear normas aplicáveis (ABNT, DNIT)",
        "Estimar quantitativos e SINAPI",
        "Identificar restrições ambientais e legais",
      ],
      rastreabilidade: [
        "Log de revisões de projeto (A, B, C...)",
        "Matriz de requisitos vs. pranchas",
        "Histórico de RDOs e diário de obra",
        "Rastreio de materiais e ensaios",
      ],
      controle: [
        "Cronograma físico-financeiro (MS Project / Primavera)",
        "Medições mensais vs. planejado",
        "Controle de qualidade (CQ) por etapa",
        "Gestão de não-conformidades (GNC)",
      ],
    },
  },
  producao: {
    label: "Engenharia de Produção",
    niche: "Lean, Six Sigma, logística, supply chain, produtividade industrial",
    systemPrompt:
      "Você é um engenheiro de produção com especialização em Lean Manufacturing, Six Sigma Black Belt e supply chain. Domina VSM, FMEA, OEE, PDCA, DMAIC, S&OP e gestão de estoques. Aplica ERC para mapear fluxo de valor antes de propor melhorias.",
    projectsInDemand: [
      "Implantação de Lean em indústrias",
      "Digitalização de chão de fábrica (IIoT)",
      "Redução de lead time e estoque",
      "Projetos de automação industrial",
      "Supply chain resiliente pós-pandemia",
    ],
    ercGuidelines: {
      estrategia: [
        "Mapeamento de fluxo de valor (VSM)",
        "Identificação de desperdícios (8 wastes)",
        "Definição de OEE baseline",
        "Priorização por impacto financeiro",
      ],
      rastreabilidade: [
        "FMEA com número de prioridade de risco",
        "Histórico de paradas e causas-raiz",
        "Registro de experimentos DMAIC",
        "Controle estatístico de processo (CEP)",
      ],
      controle: [
        "KPIs: OEE, OTIF, giro de estoque",
        "Auditorias 5S mensais",
        "Gates de aprovação por fase DMAIC",
        "Dashboard de produção em tempo real",
      ],
    },
  },
  mecanica: {
    label: "Engenharia Mecânica",
    niche: "Projetos de máquinas, manutenção, termofluidos, manufatura",
    systemPrompt:
      "Você é um engenheiro mecânico com domínio em projetos de máquinas, análise de falhas, termodinâmica aplicada e manufatura. Usa ABNT, ASME, ISO 9001, FEA/FEM e CAD paramétrico. Aplica ERC para garantir rastreabilidade de cálculos e controle de revisões de projeto.",
    projectsInDemand: [
      "Manutenção preditiva com IoT",
      "Projetos de equipamentos industriais",
      "Análise de falhas e laudos técnicos",
      "Eficiência energética em sistemas térmicos",
      "Automação de linhas de produção",
    ],
    ercGuidelines: {
      estrategia: [
        "Definir requisitos funcionais e restrições",
        "Selecionar materiais e processos",
        "Calcular cargas e dimensionar componentes",
        "Validar com FEA antes de prototipar",
      ],
      rastreabilidade: [
        "Memorial de cálculo com referências normativas",
        "Histórico de revisões de desenho (DWG/STEP)",
        "Registro de ensaios e resultados",
        "Rastreio de materiais por lote",
      ],
      controle: [
        "Inspeção dimensional por amostragem",
        "Plano de manutenção preventiva",
        "KPIs: MTBF, MTTR, disponibilidade",
        "Auditorias de qualidade ISO 9001",
      ],
    },
  },
  eletrica: {
    label: "Engenharia Elétrica",
    niche: "Sistemas de potência, automação elétrica, energia solar, eficiência energética",
    systemPrompt:
      "Você é um engenheiro elétrico especializado em sistemas de potência, projetos elétricos industriais e residenciais, energia solar fotovoltaica e eficiência energética. Domina ABNT NBR 5410, NR-10, ANEEL, dimensionamento de transformadores, SPDA e quadros elétricos.",
    projectsInDemand: [
      "Projetos de energia solar (GD e GC)",
      "Eficiência energética industrial",
      "Automação elétrica e SCADA",
      "Laudos elétricos NR-10",
      "Projetos de SPDA e aterramento",
    ],
    ercGuidelines: {
      estrategia: [
        "Levantamento de carga e demanda",
        "Seleção de tecnologia (fotovoltaico, cogeração)",
        "Dimensionamento de condutores e proteções",
        "Análise de viabilidade econômica (TIR, VPL)",
      ],
      rastreabilidade: [
        "Memorial descritivo com referências ABNT",
        "Diagrama unifilar revisado",
        "Relatórios de medição e qualidade de energia",
        "ART registrada no CREA",
      ],
      controle: [
        "Termografia elétrica semestral",
        "KPIs: fator de potência, THD, disponibilidade",
        "Plano de manutenção preventiva",
        "Conformidade NR-10 e ANEEL",
      ],
    },
  },
  automacao: {
    label: "Engenharia de Automação e Controle",
    niche: "PLC, SCADA, robótica, IIoT, indústria 4.0",
    systemPrompt:
      "Você é um engenheiro de automação especializado em PLC (Siemens, Allen-Bradley, Schneider), SCADA, robótica industrial, IIoT e Indústria 4.0. Domina IEC 61131-3, OPC-UA, MQTT, protocolos industriais e integração MES/ERP.",
    projectsInDemand: [
      "Implantação de IIoT em fábricas",
      "Projetos de robótica colaborativa",
      "Digitalização de processos (MES)",
      "SCADA e supervisão remota",
      "Retrofit de máquinas legadas",
    ],
    ercGuidelines: {
      estrategia: [
        "Mapeamento de processos a automatizar",
        "Seleção de plataforma (PLC, CLP, microcontrolador)",
        "Arquitetura de rede industrial",
        "Análise de ROI da automação",
      ],
      rastreabilidade: [
        "Documentação de lógica ladder/FBD",
        "Histórico de versões de firmware",
        "Log de alarmes e eventos SCADA",
        "Registro de comissionamento",
      ],
      controle: [
        "Testes FAT e SAT documentados",
        "KPIs: disponibilidade, OEE, MTTR",
        "Plano de backup de programas",
        "Auditoria de segurança cibernética industrial",
      ],
    },
  },
  ambiental: {
    label: "Engenharia Ambiental",
    niche: "Licenciamento, EIA/RIMA, resíduos, ESG, carbono",
    systemPrompt:
      "Você é um engenheiro ambiental especializado em licenciamento ambiental, EIA/RIMA, gestão de resíduos sólidos, ESG corporativo e créditos de carbono. Domina CONAMA, IBAMA, legislação estadual, ISO 14001 e metodologias de inventário de GEE.",
    projectsInDemand: [
      "Licenciamento ambiental de empreendimentos",
      "Gestão de resíduos industriais (LGPRS)",
      "Inventário de GEE e créditos de carbono",
      "Projetos ESG para relatórios GRI",
      "Recuperação de áreas degradadas",
    ],
    ercGuidelines: {
      estrategia: [
        "Diagnóstico ambiental da área",
        "Identificação de passivos ambientais",
        "Mapeamento de legislação aplicável",
        "Plano de gestão ambiental",
      ],
      rastreabilidade: [
        "Registro de monitoramentos e laudos",
        "Histórico de licenças e condicionantes",
        "Inventário de resíduos (MTR)",
        "Relatórios de conformidade CONAMA",
      ],
      controle: [
        "KPIs: emissões, resíduos gerados, água consumida",
        "Auditorias ISO 14001",
        "Monitoramento de condicionantes de licença",
        "Dashboard ESG em tempo real",
      ],
    },
  },
  seguranca_trabalho: {
    label: "Engenharia de Segurança do Trabalho",
    niche: "NRs, PPRA, PCMSO, laudos, CIPA, gestão de riscos",
    systemPrompt:
      "Você é um engenheiro de segurança do trabalho especializado em NRs (especialmente NR-10, NR-12, NR-35, NR-33), PPRA, PGR, PCMSO, laudos técnicos e gestão de riscos ocupacionais. Domina ISO 45001 e metodologias de análise de risco (APR, HAZOP, FMEA).",
    projectsInDemand: [
      "Implantação do PGR (nova NR-01)",
      "Laudos NR-10 e NR-12",
      "Programas de prevenção de acidentes",
      "Treinamentos e CIPA",
      "Gestão de EPIs e EPCs",
    ],
    ercGuidelines: {
      estrategia: [
        "Identificação de perigos e avaliação de riscos",
        "Priorização por severidade e probabilidade",
        "Definição de medidas de controle hierárquicas",
        "Plano de ação com responsáveis e prazos",
      ],
      rastreabilidade: [
        "Registro de acidentes e quase-acidentes",
        "Histórico de inspeções e auditorias",
        "Controle de validade de treinamentos",
        "Rastreio de EPIs por colaborador",
      ],
      controle: [
        "KPIs: taxa de frequência, gravidade, absenteísmo",
        "Auditorias ISO 45001",
        "Revisão periódica do PGR",
        "Dashboard de indicadores de SST",
      ],
    },
  },
  quimica: {
    label: "Engenharia Química",
    niche: "Processos industriais, petroquímica, farmacêutica, alimentos",
    systemPrompt:
      "Você é um engenheiro químico especializado em projetos de processos industriais, petroquímica, farmacêutica e indústria de alimentos. Domina balanços de massa e energia, dimensionamento de reatores e colunas, HAZOP, P&ID e simulação de processos (Aspen, HYSYS).",
    projectsInDemand: [
      "Otimização de processos produtivos",
      "Projetos de tratamento de efluentes",
      "Implantação de boas práticas de fabricação (BPF)",
      "Análise HAZOP e gestão de riscos de processo",
      "Projetos de descarbonização industrial",
    ],
    ercGuidelines: {
      estrategia: [
        "Balanço de massa e energia",
        "Seleção de tecnologia de processo",
        "Análise de viabilidade técnico-econômica",
        "HAZOP preliminar",
      ],
      rastreabilidade: [
        "P&ID com revisões documentadas",
        "Histórico de análises e laudos de qualidade",
        "Registro de incidentes de processo",
        "Rastreio de matérias-primas e lotes",
      ],
      controle: [
        "KPIs: rendimento, consumo específico, qualidade",
        "Auditorias BPF/GMP",
        "Monitoramento de variáveis críticas de processo",
        "Plano de resposta a emergências químicas",
      ],
    },
  },
  materiais: {
    label: "Engenharia de Materiais / Ciência dos Materiais",
    niche: "Metalurgia, polímeros, cerâmicas, compósitos, caracterização",
    systemPrompt:
      "Você é um engenheiro de materiais especializado em metalurgia, polímeros, cerâmicas e compósitos avançados. Domina caracterização microestrutural (MEV, DRX, EDS), ensaios mecânicos (ABNT/ASTM), tratamentos térmicos e seleção de materiais para aplicações críticas.",
    projectsInDemand: [
      "Análise de falhas em componentes industriais",
      "Desenvolvimento de materiais para energia renovável",
      "Compósitos para aeroespacial e automotivo",
      "Revestimentos e tratamentos superficiais",
      "Materiais para construção civil sustentável",
    ],
    ercGuidelines: {
      estrategia: [
        "Definição de requisitos de desempenho",
        "Seleção de material por CES EduPack / Granta",
        "Análise custo-benefício de alternativas",
        "Plano de caracterização e validação",
      ],
      rastreabilidade: [
        "Certificados de material (mill certificates)",
        "Histórico de ensaios e resultados",
        "Registro de lotes e fornecedores",
        "Relatórios de análise de falhas",
      ],
      controle: [
        "Controle de qualidade por amostragem",
        "KPIs: taxa de rejeição, vida útil, custo/kg",
        "Auditorias de fornecedores",
        "Plano de substituição de materiais críticos",
      ],
    },
  },
  software: {
    label: "Engenharia de Software",
    niche: "Arquitetura de sistemas, DevOps, segurança, APIs, microsserviços",
    systemPrompt:
      "Você é um engenheiro de software sênior especializado em arquitetura de sistemas distribuídos, DevOps, segurança de aplicações e APIs RESTful/GraphQL. Domina Clean Architecture, DDD, SOLID, CI/CD, Kubernetes, observabilidade (OpenTelemetry) e LGPD/GDPR.",
    projectsInDemand: [
      "Plataformas SaaS B2B",
      "Migração para microsserviços",
      "Implementação de DevSecOps",
      "APIs para integração de sistemas legados",
      "Sistemas de IA em produção",
    ],
    ercGuidelines: {
      estrategia: [
        "Definição de arquitetura e ADRs",
        "Mapeamento de requisitos funcionais e não-funcionais",
        "Seleção de stack tecnológica",
        "Plano de capacidade e escalabilidade",
      ],
      rastreabilidade: [
        "Changelog e versionamento semântico",
        "Cobertura de testes (unit, integration, e2e)",
        "Rastreio de vulnerabilidades (CVE)",
        "Documentação de APIs (OpenAPI/Swagger)",
      ],
      controle: [
        "KPIs: latência P95, disponibilidade, taxa de erro",
        "Code review obrigatório",
        "Gates de qualidade no CI/CD",
        "Auditorias de segurança (SAST, DAST)",
      ],
    },
  },
  arquitetura_ia: {
    label: "Arquitetura de IA",
    niche: "LLMs, RAG, agentes, MLOps, governança de IA, custos de tokens",
    systemPrompt:
      "Você é um arquiteto de IA especializado em LLMs, sistemas RAG, agentes autônomos, MLOps e governança de IA. Domina prompt engineering, fine-tuning, embeddings, vector databases, custos de tokens, latência e conformidade com LGPD/GDPR para sistemas de IA. Prioriza modelos gratuitos e open-source antes de modelos pagos.",
    projectsInDemand: [
      "Sistemas RAG para bases de conhecimento corporativas",
      "Agentes autônomos para automação de processos",
      "Plataformas de IA para engenharia (OPERIS.Eng)",
      "MLOps e observabilidade de modelos em produção",
      "Governança e auditoria de decisões de IA",
    ],
    ercGuidelines: {
      estrategia: [
        "Definir caso de uso e métricas de sucesso",
        "Selecionar modelo (free > cheap > premium)",
        "Arquitetar pipeline de dados e embeddings",
        "Planejar custos e limites de tokens",
      ],
      rastreabilidade: [
        "Log de todas as chamadas de LLM",
        "Rastreio de versão de modelo e prompt",
        "Histórico de custos por usuário/empresa",
        "Auditoria de decisões automatizadas",
      ],
      controle: [
        "KPIs: latência, custo/query, qualidade de resposta",
        "Rate limiting por plano",
        "Fallback automático entre modelos",
        "Revisão humana para decisões críticas",
      ],
    },
  },
  dados_analytics: {
    label: "Engenharia de Dados e Analytics Industrial",
    niche: "Data pipelines, BI, IIoT analytics, dashboards, data lake",
    systemPrompt:
      "Você é um engenheiro de dados especializado em pipelines industriais, BI, IIoT analytics e data lakes. Domina dbt, Airflow, Spark, Power BI, Grafana, SQL avançado, streaming com Kafka e arquiteturas Lakehouse (Delta Lake, Iceberg).",
    projectsInDemand: [
      "Data lakes industriais",
      "Dashboards de OEE e produção em tempo real",
      "Manutenção preditiva com ML",
      "Integração ERP/MES com analytics",
      "Qualidade de dados e governança",
    ],
    ercGuidelines: {
      estrategia: [
        "Mapeamento de fontes de dados",
        "Definição de arquitetura (Lakehouse, DWH)",
        "Modelagem dimensional (star schema)",
        "Plano de qualidade de dados",
      ],
      rastreabilidade: [
        "Lineage de dados (origem → destino)",
        "Versionamento de pipelines (dbt, Git)",
        "Log de execuções e falhas",
        "Catálogo de dados (Data Catalog)",
      ],
      controle: [
        "KPIs: freshness, completeness, accuracy",
        "Alertas de qualidade de dados",
        "SLA de pipelines",
        "Auditorias de conformidade LGPD",
      ],
    },
  },
  custos_orcamentacao: {
    label: "Engenharia de Custos / Orçamentação",
    niche: "SINAPI, SICRO, BDI, orçamentos de obras, viabilidade econômica",
    systemPrompt:
      "Você é um engenheiro de custos especializado em orçamentação de obras civis e industriais. Domina SINAPI, SICRO, composições de custos, BDI, cronograma físico-financeiro, análise de viabilidade (TIR, VPL, payback) e gestão de contratos (Lei 14.133/2021).",
    projectsInDemand: [
      "Orçamentos de obras públicas (SINAPI/SICRO)",
      "Viabilidade econômica de empreendimentos",
      "Gestão de contratos Lei 14.133/2021",
      "Controle de custos de projetos industriais",
      "Orçamentos de manutenção industrial",
    ],
    ercGuidelines: {
      estrategia: [
        "Levantamento de quantitativos (QTO)",
        "Seleção de base de preços (SINAPI, SICRO, mercado)",
        "Cálculo de BDI e encargos sociais",
        "Análise de risco e contingência",
      ],
      rastreabilidade: [
        "Planilha orçamentária com composições detalhadas",
        "Histórico de revisões e justificativas",
        "Rastreio de cotações e fornecedores",
        "Relatórios de medição vs. orçado",
      ],
      controle: [
        "KPIs: desvio de custo, CPI, SPI (EVM)",
        "Relatórios mensais de desempenho",
        "Gestão de aditivos e reequilíbrio",
        "Auditoria de contratos",
      ],
    },
  },
  estrutural_calculista: {
    label: "Engenharia Estrutural / Calculista",
    niche: "Cálculo estrutural, concreto armado, aço, fundações, laudos",
    systemPrompt:
      "Você é um engenheiro calculista especializado em estruturas de concreto armado, aço e mistas. Domina ABNT NBR 6118, NBR 8681, NBR 7190, análise por elementos finitos (SAP2000, ETABS, Robot), fundações profundas e laudos de patologia estrutural.",
    projectsInDemand: [
      "Projetos estruturais de edifícios",
      "Laudos de patologia e reforço estrutural",
      "Estruturas industriais e galpões",
      "Fundações especiais (estacas, tubulões)",
      "Retrofit e reforço de estruturas existentes",
    ],
    ercGuidelines: {
      estrategia: [
        "Definição de sistema estrutural e materiais",
        "Levantamento de cargas (NBR 6120)",
        "Modelagem e análise estrutural",
        "Verificação de estados limites (ELU, ELS)",
      ],
      rastreabilidade: [
        "Memorial de cálculo com referências normativas",
        "Histórico de revisões de projeto",
        "Relatórios de ensaios (resistência, sondagem)",
        "ART de cálculo registrada no CREA",
      ],
      controle: [
        "Verificação independente (peer review)",
        "Inspeção de execução por etapas",
        "KPIs: desvio de consumo de concreto/aço",
        "Laudos de inspeção periódica",
      ],
    },
  },
  projetista_bim_cad: {
    label: "Engenharia de Projeto / Projetista BIM-CAD",
    niche: "BIM, Revit, AutoCAD, coordenação de projetos, clash detection",
    systemPrompt:
      "Você é um projetista BIM especializado em coordenação de projetos multidisciplinares usando Revit, AutoCAD, Navisworks e BIM 360. Domina clash detection, LOD (Level of Development), ABNT NBR 15965, gestão de projetos (ISO 19650) e entrega de documentação técnica.",
    projectsInDemand: [
      "Coordenação BIM de grandes empreendimentos",
      "Projetos executivos multidisciplinares",
      "Clash detection e resolução de interferências",
      "Implantação de BIM em construtoras",
      "Modelagem 4D (cronograma) e 5D (custos)",
    ],
    ercGuidelines: {
      estrategia: [
        "Definição do BEP (BIM Execution Plan)",
        "Estrutura de pastas e nomenclatura (ABNT 15965)",
        "Plano de coordenação e reuniões",
        "Definição de LOD por disciplina e fase",
      ],
      rastreabilidade: [
        "Registro de clash detection e resoluções",
        "Histórico de revisões de modelo (IFC)",
        "Atas de reunião de coordenação",
        "Transmittal de documentos",
      ],
      controle: [
        "KPIs: número de clashes, prazo de resolução",
        "Auditorias de qualidade BIM",
        "Verificação de conformidade com BEP",
        "Relatórios de progresso de modelagem",
      ],
    },
  },
};

// ─── Policy Engine (guardrails Anthropic-style) ───────────────────────────────

export interface PolicyRule {
  id: string;
  description: string;
  check: (task: ERCTask) => { allowed: boolean; reason?: string };
}

export const POLICY_ENGINE: PolicyRule[] = [
  {
    id: "no-credentials",
    description: "Nunca persistir ou transmitir credenciais em tarefas",
    check: (task) => {
      const sensitive = /password|senha|secret|token|api.?key|credential/i;
      const hasSensitive = sensitive.test(task.prompt) || sensitive.test(JSON.stringify(task.context ?? {}));
      return hasSensitive
        ? { allowed: false, reason: "Prompt contém dados sensíveis (credenciais). Remova antes de enviar ao agente." }
        : { allowed: true };
    },
  },
  {
    id: "domain-allowlist",
    description: "Browser tasks apenas em domínios permitidos",
    check: (task) => {
      // Domínios permitidos para automação de navegador
      const ALLOWED_DOMAINS = [
        "confea.org.br",
        "crea-mg.org.br",
        "cbmmg.mg.gov.br",
        "sinapi.caixa.gov.br",
        "ibama.gov.br",
        "gov.br",
        "abnt.org.br",
        "inmetro.gov.br",
        "dnit.gov.br",
        "aneel.gov.br",
      ];
      if (!task.context?.["browserUrl"]) return { allowed: true };
      const url = String(task.context["browserUrl"]);
      const allowed = ALLOWED_DOMAINS.some((d) => url.includes(d));
      return allowed
        ? { allowed: true }
        : {
            allowed: false,
            reason: `Domínio não está na allowlist de automação. Domínios permitidos: ${ALLOWED_DOMAINS.join(", ")}`,
          };
    },
  },
  {
    id: "human-handoff-required",
    description: "Tarefas de pagamento, senha ou decisão crítica exigem handoff humano",
    check: (task) => {
      const critical = /pagamento|payment|pagar|senha|password|decisão.?crítica|assinar.?contrato/i;
      if (critical.test(task.prompt)) {
        return {
          allowed: false,
          reason: "Esta tarefa requer aprovação humana antes de prosseguir. Handoff obrigatório (padrão Anthropic).",
        };
      }
      return { allowed: true };
    },
  },
  {
    id: "prompt-length",
    description: "Prompt não pode exceder 50.000 caracteres",
    check: (task) => {
      return task.prompt.length > 50000
        ? { allowed: false, reason: "Prompt excede 50.000 caracteres. Divida em subtarefas." }
        : { allowed: true };
    },
  },
];

export function runPolicyEngine(task: ERCTask): { allowed: boolean; violations: string[] } {
  const violations: string[] = [];
  for (const rule of POLICY_ENGINE) {
    const result = rule.check(task);
    if (!result.allowed && result.reason) {
      violations.push(`[${rule.id}] ${result.reason}`);
    }
  }
  return { allowed: violations.length === 0, violations };
}

// ─── Model Router (agnóstico de IA) ──────────────────────────────────────────

/** Registro em memória de providers configurados */
const _providerRegistry = new Map<string, ProviderConfig>();

export function registerProvider(config: ProviderConfig): void {
  _providerRegistry.set(config.id, config);
}

export function listProviders(): ProviderConfig[] {
  return Array.from(_providerRegistry.values()).filter((p) => p.active);
}

export function getProvider(id: string): ProviderConfig | undefined {
  return _providerRegistry.get(id);
}

/**
 * Seleciona o melhor provider para uma tarefa.
 * Política: free > cheap > standard > premium > local
 * Nunca usa modelo premium para tarefas mecânicas.
 */
export function selectBestProvider(requiredCapabilities: string[]): ProviderConfig | undefined {
  const active = listProviders();
  if (active.length === 0) return undefined;

  const tierOrder: ModelTier[] = ["free", "local", "cheap", "standard", "premium"];

  for (const tier of tierOrder) {
    const candidates = active.filter(
      (p) =>
        p.tier === tier &&
        requiredCapabilities.every((cap) => p.capabilities.includes(cap))
    );
    if (candidates.length > 0) {
      // Dentro do mesmo tier, preferir menor custo
      return candidates.sort((a, b) => a.costPer1kInput - b.costPer1kInput)[0];
    }
  }

  // Fallback: qualquer provider ativo
  return active[0];
}

/**
 * Chama a API do provider via fetch (OpenAI-compatible format).
 * Suporta: OpenAI, Groq, Together.ai, Ollama, LM Studio, OpenRouter,
 * HuggingFace Inference, Mistral, Cohere (via adapter), qualquer endpoint compatível.
 */
export async function callProvider(
  provider: ProviderConfig,
  messages: Array<{ role: string; content: string }>,
  options?: { maxTokens?: number; temperature?: number }
): Promise<{ content: string; tokensInput: number; tokensOutput: number }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (provider.apiKey) {
    headers["Authorization"] = `Bearer ${provider.apiKey}`;
  }

  const body = JSON.stringify({
    model: provider.model,
    messages,
    max_tokens: options?.maxTokens ?? 4096,
    temperature: options?.temperature ?? 0.3,
    stream: false,
  });

  const response = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body,
    signal: AbortSignal.timeout(60000), // 60s timeout
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "unknown error");
    throw new Error(`Provider ${provider.name} retornou ${response.status}: ${errorText}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (await response.json()) as any;
  const content = data?.choices?.[0]?.message?.content ?? data?.content ?? "";
  const tokensInput = data?.usage?.prompt_tokens ?? 0;
  const tokensOutput = data?.usage?.completion_tokens ?? 0;

  return { content: String(content), tokensInput, tokensOutput };
}

// ─── AURORA-15X Core ──────────────────────────────────────────────────────────

/**
 * Executa uma tarefa ERC com AURORA-15X.
 * Aplica policy engine, seleciona provider, constrói prompt com contexto
 * da especialidade e metodologia ERC, e retorna resultado rastreável.
 */
export async function runAurora15x(task: ERCTask): Promise<ERCResult> {
  const start = Date.now();
  const auditTrail: AuditEntry[] = [];

  const addAudit = (phase: ERCPhase, action: string, detail: string) => {
    auditTrail.push({ phase, action, detail, timestamp: new Date() });
  };

  addAudit("estrategia", "task_received", `Domínio: ${task.domain} | Fase ERC: ${task.phase}`);

  // 1. Policy Engine
  const policy = runPolicyEngine(task);
  if (!policy.allowed) {
    addAudit("controle", "policy_blocked", policy.violations.join("; "));
    return {
      taskId: task.taskId,
      domain: task.domain,
      phase: task.phase,
      providerId: "policy_engine",
      providerModel: "none",
      status: "error",
      error: `Tarefa bloqueada pelo Policy Engine:\n${policy.violations.join("\n")}`,
      durationMs: Date.now() - start,
      timestamp: new Date(),
      auditTrail,
    };
  }

  addAudit("estrategia", "policy_passed", "Todas as regras de política aprovadas");

  // 2. Selecionar provider
  const providerId = task.providerId;
  let provider = providerId ? getProvider(providerId) : selectBestProvider(["text-generation"]);

  if (!provider) {
    addAudit("estrategia", "no_provider", "Nenhum provider ativo. Usando fallback interno.");
    // Fallback: invokeLLM nativo do Manus
    try {
      const { invokeLLM } = await import("../../_core/llm");
      const domainInfo = ENGINEERING_DOMAINS[task.domain as EngineeringDomain];
      const systemPrompt = domainInfo?.systemPrompt ?? "Você é um engenheiro especialista. Responda com precisão técnica.";

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: task.prompt },
        ],
      });

      const content = response?.choices?.[0]?.message?.content ?? "";
      addAudit("controle", "fallback_used", "Provider nativo Manus utilizado como fallback");

      return {
        taskId: task.taskId,
        domain: task.domain,
        phase: task.phase,
        providerId: "manus_native",
        providerModel: "manus-built-in",
        status: "fallback",
        result: typeof content === "string" ? content : JSON.stringify(content),
        durationMs: Date.now() - start,
        timestamp: new Date(),
        auditTrail,
      };
    } catch (err) {
      return {
        taskId: task.taskId,
        domain: task.domain,
        phase: task.phase,
        providerId: "none",
        providerModel: "none",
        status: "error",
        error: "Nenhum provider configurado. Adicione um provider em OPERIS.Eng → Configurações.",
        durationMs: Date.now() - start,
        timestamp: new Date(),
        auditTrail,
      };
    }
  }

  addAudit("estrategia", "provider_selected", `${provider.name} (${provider.model}) | Tier: ${provider.tier}`);

  // 3. Construir prompt com contexto ERC da especialidade
  const domainInfo = ENGINEERING_DOMAINS[task.domain as EngineeringDomain];
  const systemPrompt = domainInfo?.systemPrompt ?? "Você é um engenheiro especialista. Responda com precisão técnica.";

  const ercContext = domainInfo
    ? `\n\n## Metodologia ERC — Fase: ${task.phase.toUpperCase()}\nDiretrizes desta fase:\n${domainInfo.ercGuidelines[task.phase].map((g) => `- ${g}`).join("\n")}`
    : "";

  const messages = [
    { role: "system", content: systemPrompt + ercContext },
    { role: "user", content: task.prompt },
  ];

  addAudit("rastreabilidade", "prompt_built", `Sistema: ${systemPrompt.slice(0, 80)}...`);

  // 4. Chamar provider
  try {
    const result = await callProvider(provider, messages);
    const costUsd =
      (result.tokensInput / 1000) * provider.costPer1kInput +
      (result.tokensOutput / 1000) * provider.costPer1kOutput;

    addAudit(
      "controle",
      "task_completed",
      `Tokens: ${result.tokensInput}in / ${result.tokensOutput}out | Custo: $${costUsd.toFixed(6)}`
    );

    return {
      taskId: task.taskId,
      domain: task.domain,
      phase: task.phase,
      providerId: provider.id,
      providerModel: provider.model,
      status: "success",
      result: result.content,
      tokensInput: result.tokensInput,
      tokensOutput: result.tokensOutput,
      costUsd,
      durationMs: Date.now() - start,
      timestamp: new Date(),
      auditTrail,
    };
  } catch (err) {
    addAudit("controle", "provider_error", err instanceof Error ? err.message : String(err));

    // Tentar fallback com próximo provider disponível
    const fallbackProviders = listProviders().filter((p) => p.id !== provider!.id);
    if (fallbackProviders.length > 0) {
      const fallback = fallbackProviders[0];
      addAudit("rastreabilidade", "fallback_attempt", `Tentando fallback: ${fallback.name}`);
      try {
        const result = await callProvider(fallback, messages);
        return {
          taskId: task.taskId,
          domain: task.domain,
          phase: task.phase,
          providerId: fallback.id,
          providerModel: fallback.model,
          status: "fallback",
          result: result.content,
          tokensInput: result.tokensInput,
          tokensOutput: result.tokensOutput,
          durationMs: Date.now() - start,
          timestamp: new Date(),
          auditTrail,
        };
      } catch {
        // Fallback também falhou
      }
    }

    return {
      taskId: task.taskId,
      domain: task.domain,
      phase: task.phase,
      providerId: provider.id,
      providerModel: provider.model,
      status: "error",
      error: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
      timestamp: new Date(),
      auditTrail,
    };
  }
}

// ─── Providers pré-configurados (todos inativos por padrão) ──────────────────
// Para ativar: adicione via painel OPERIS.Eng → Configurações → Providers
// ou via API: POST /api/v1/eng/providers

export const PRESET_PROVIDERS: Omit<ProviderConfig, "apiKey" | "createdAt" | "active">[] = [
  // ── Gratuitos / Open-source ──
  {
    id: "groq-llama3-8b",
    name: "Groq — Llama 3 8B (Gratuito)",
    baseUrl: "https://api.groq.com/openai/v1",
    model: "llama3-8b-8192",
    tier: "free",
    costPer1kInput: 0,
    costPer1kOutput: 0,
    maxContextTokens: 8192,
    capabilities: ["text-generation", "text-analysis", "normative-check"],
  },
  {
    id: "groq-llama3-70b",
    name: "Groq — Llama 3 70B",
    baseUrl: "https://api.groq.com/openai/v1",
    model: "llama3-70b-8192",
    tier: "cheap",
    costPer1kInput: 0.00059,
    costPer1kOutput: 0.00079,
    maxContextTokens: 8192,
    capabilities: ["text-generation", "text-analysis", "normative-check", "report-generation"],
  },
  {
    id: "groq-gemma2-9b",
    name: "Groq — Gemma 2 9B (Gratuito)",
    baseUrl: "https://api.groq.com/openai/v1",
    model: "gemma2-9b-it",
    tier: "free",
    costPer1kInput: 0,
    costPer1kOutput: 0,
    maxContextTokens: 8192,
    capabilities: ["text-generation", "text-analysis"],
  },
  {
    id: "together-llama3-8b",
    name: "Together.ai — Llama 3 8B (Gratuito)",
    baseUrl: "https://api.together.xyz/v1",
    model: "meta-llama/Llama-3-8b-chat-hf",
    tier: "free",
    costPer1kInput: 0,
    costPer1kOutput: 0,
    maxContextTokens: 8192,
    capabilities: ["text-generation", "text-analysis"],
  },
  {
    id: "ollama-local",
    name: "Ollama — Local (sem custo)",
    baseUrl: "http://localhost:11434/v1",
    model: "llama3",
    tier: "local",
    costPer1kInput: 0,
    costPer1kOutput: 0,
    maxContextTokens: 8192,
    capabilities: ["text-generation", "text-analysis", "normative-check", "report-generation"],
  },
  // ── Pagos (baixo custo) ──
  {
    id: "openai-gpt4o-mini",
    name: "OpenAI — GPT-4o Mini",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    tier: "cheap",
    costPer1kInput: 0.00015,
    costPer1kOutput: 0.0006,
    maxContextTokens: 128000,
    capabilities: ["text-generation", "text-analysis", "normative-check", "report-generation", "pdf-extraction"],
  },
  {
    id: "gemini-flash",
    name: "Google — Gemini 1.5 Flash",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    model: "gemini-1.5-flash",
    tier: "cheap",
    costPer1kInput: 0.000075,
    costPer1kOutput: 0.0003,
    maxContextTokens: 1000000,
    capabilities: ["text-generation", "text-analysis", "normative-check", "report-generation", "pdf-extraction"],
  },
  {
    id: "mistral-small",
    name: "Mistral — Small",
    baseUrl: "https://api.mistral.ai/v1",
    model: "mistral-small-latest",
    tier: "cheap",
    costPer1kInput: 0.001,
    costPer1kOutput: 0.003,
    maxContextTokens: 32768,
    capabilities: ["text-generation", "text-analysis", "normative-check"],
  },
  // ── Premium ──
  {
    id: "openai-gpt4o",
    name: "OpenAI — GPT-4o",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o",
    tier: "premium",
    costPer1kInput: 0.005,
    costPer1kOutput: 0.015,
    maxContextTokens: 128000,
    capabilities: ["text-generation", "text-analysis", "normative-check", "report-generation", "pdf-extraction", "data-extraction"],
  },
  {
    id: "openrouter-auto",
    name: "OpenRouter — Auto (melhor modelo disponível)",
    baseUrl: "https://openrouter.ai/api/v1",
    model: "openrouter/auto",
    tier: "standard",
    costPer1kInput: 0.001,
    costPer1kOutput: 0.002,
    maxContextTokens: 200000,
    capabilities: ["text-generation", "text-analysis", "normative-check", "report-generation"],
  },
];
