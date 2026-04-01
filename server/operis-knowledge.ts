/**
 * OPERIS Knowledge Layer
 * ─────────────────────────────────────────────────────────────────────────────
 * Motor de conhecimento estruturado da plataforma OPERIS.
 * Converte o memorial descritivo e metadados do sistema em chunks JSON
 * indexados por módulo, tipo e keywords para busca semântica.
 *
 * Princípios:
 *  - Nenhum dado existente é modificado ou removido
 *  - Cada chunk é autossuficiente (pode ser retornado isolado)
 *  - A busca é determinística (sem dependência de LLM externa)
 *  - Módulos são conectados por referências cruzadas (relatedModules)
 */

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type KnowledgeChunkType =
  | "bug"
  | "feature"
  | "architecture"
  | "procedure"
  | "norm"
  | "config"
  | "module_status";

export type KnowledgeModule =
  | "equipamentos"
  | "manutencoes"
  | "qrcodes"
  | "alertas"
  | "documentos"
  | "relatorios"
  | "clientes"
  | "notificacoes"
  | "autenticacao"
  | "site_institucional"
  | "mobile"
  | "plataforma_geral";

export interface KnowledgeChunk {
  id: string;
  module: KnowledgeModule;
  type: KnowledgeChunkType;
  title: string;
  content: string;
  keywords: string[];
  relatedModules: KnowledgeModule[];
  status: "done" | "pending" | "error" | "partial";
  priority: "critical" | "high" | "medium" | "low";
  suggestedActions?: string[];
  createdAt: string;
}

export interface SearchResult {
  chunk: KnowledgeChunk;
  score: number;
  matchedKeywords: string[];
}

export interface SearchOperisResult {
  query: string;
  results: SearchResult[];
  relatedModules: KnowledgeModule[];
  suggestedActions: string[];
  totalFound: number;
}

// ─── Knowledge Base ───────────────────────────────────────────────────────────
// Fonte: Memorial Descritivo Técnico CO2 Contra Incêndio (Abril 2026)

const KNOWLEDGE_BASE: KnowledgeChunk[] = [
  // ── BUGS CRÍTICOS ──────────────────────────────────────────────────────────
  {
    id: "bug-001",
    module: "site_institucional",
    type: "bug",
    title: "E-mail incorreto no site (co2contra.comm)",
    content:
      "O e-mail 'contato@co2contra.comm' (com dois 'm') estava presente no Footer.tsx e Contato.tsx, causando falha em todos os links mailto. Corrigido para co2contraincendio@gmail.com em todos os arquivos do frontend.",
    keywords: ["email", "contato", "footer", "mailto", "co2contra.comm", "bug"],
    relatedModules: ["site_institucional"],
    status: "done",
    priority: "critical",
    suggestedActions: ["Verificar se o e-mail está correto em todos os documentos PDF gerados"],
    createdAt: "2026-04-01",
  },
  {
    id: "bug-002",
    module: "site_institucional",
    type: "bug",
    title: "Telefone divergente no site (97358-1278 vs 9 9738-3115)",
    content:
      "O número (31) 97358-1278 estava em Layout.tsx, ServicePageTemplate.tsx, BlogPost.tsx, Home.tsx, Parceiros.tsx e Contato.tsx. Corrigido para (31) 9 9738-3115 em todos os arquivos. WhatsApp atualizado para wa.me/5531997383115.",
    keywords: ["telefone", "whatsapp", "contato", "numero", "bug", "divergencia"],
    relatedModules: ["site_institucional"],
    status: "done",
    priority: "critical",
    suggestedActions: ["Verificar se o número está correto no Google Meu Negócio"],
    createdAt: "2026-04-01",
  },
  {
    id: "bug-003",
    module: "site_institucional",
    type: "bug",
    title: "Formulário de contato não enviava dados (simulação fake)",
    content:
      "O handleSubmit em Contato.tsx usava setTimeout para simular envio sem conectar ao backend. Leads eram perdidos silenciosamente. Corrigido: agora usa trpc.orcamento.submit.useMutation() que persiste no banco, notifica o proprietário via Manus e exibe erro real ao usuário.",
    keywords: ["formulario", "contato", "orcamento", "submit", "trpc", "bug", "leads"],
    relatedModules: ["site_institucional", "plataforma_geral"],
    status: "done",
    priority: "critical",
    suggestedActions: ["Testar o formulário em produção e verificar notificação no painel"],
    createdAt: "2026-04-01",
  },
  {
    id: "bug-004",
    module: "equipamentos",
    type: "bug",
    title: "Colunas faltantes na tabela equipment no banco de dados",
    content:
      "O schema TypeScript definia colunas (model, floor, sector, qrCodeUrl, installationDate) que não existiam no banco MySQL. O AlertJob falhava com 'Unknown column model'. Migração aplicada: ALTER TABLE equipment ADD COLUMN IF NOT EXISTS para as 5 colunas faltantes.",
    keywords: ["equipment", "banco", "schema", "migracao", "model", "floor", "sector", "qrCodeUrl", "bug", "AlertJob"],
    relatedModules: ["equipamentos", "qrcodes", "alertas"],
    status: "done",
    priority: "critical",
    suggestedActions: ["Reiniciar o servidor para o AlertJob reconhecer as novas colunas"],
    createdAt: "2026-04-01",
  },

  // ── ARQUITETURA ────────────────────────────────────────────────────────────
  {
    id: "arch-001",
    module: "plataforma_geral",
    type: "architecture",
    title: "Stack técnico do OPERIS",
    content:
      "Frontend: React 19 + Tailwind 4 + Wouter + shadcn/ui. Backend: Express 4 + tRPC 11 + Drizzle ORM. Banco: MySQL/TiDB. Auth: JWT (HS256, 7d). Storage: S3 (Manus). IA: invokeLLM (server-side). Notificações: Nodemailer (SMTP) + Evolution API (WhatsApp). Scheduler: cron diário às 07:00 BRT.",
    keywords: ["stack", "react", "trpc", "drizzle", "mysql", "jwt", "s3", "arquitetura"],
    relatedModules: ["plataforma_geral", "autenticacao"],
    status: "done",
    priority: "medium",
    createdAt: "2026-04-01",
  },
  {
    id: "arch-002",
    module: "plataforma_geral",
    type: "architecture",
    title: "Estrutura de routers tRPC do OPERIS",
    content:
      "14 sub-routers: auth (login/logout/me), equipment (CRUD + exportCsv), maintenance (CRUD), qr (generate/scan/list), documents (upload/list/delete), alerts (list/resolve/stats), dashboard (stats), scheduler (runNow), notifications (getSettings/saveSettings/test), orcamento (submit), reports (usage/company/exportCsv), importCompanies (fromCsv), knowledge (search/ingest), system (notifyOwner).",
    keywords: ["trpc", "router", "endpoints", "api", "arquitetura"],
    relatedModules: ["plataforma_geral"],
    status: "done",
    priority: "medium",
    createdAt: "2026-04-01",
  },
  {
    id: "arch-003",
    module: "plataforma_geral",
    type: "architecture",
    title: "Schema do banco de dados — 8 tabelas",
    content:
      "saas_companies (empresas clientes), saas_users (técnicos/admins), equipment (equipamentos de proteção), maintenance_records (registros de manutenção), documents (documentos S3), access_logs (logs de acesso QR), alert_events (alertas gerados), qr_code_scans (scans de QR). Tabelas auxiliares: orcamentos, notification_settings.",
    keywords: ["schema", "banco", "tabelas", "drizzle", "mysql", "arquitetura"],
    relatedModules: ["plataforma_geral", "equipamentos", "manutencoes", "qrcodes", "alertas", "documentos"],
    status: "done",
    priority: "medium",
    createdAt: "2026-04-01",
  },

  // ── STATUS DOS MÓDULOS ─────────────────────────────────────────────────────
  {
    id: "mod-001",
    module: "equipamentos",
    type: "module_status",
    title: "Módulo Equipamentos — Status",
    content:
      "PRONTO. CRUD completo com filtros (código, tipo, status, localização, categoria NBR). Exportação CSV. Categorias: extintor, hidrante, sprinkler, detector, sinalização, complementar. Status calculado: ok, próximo_vencimento, vencido, inativo. Conexão com QR Code via qrCodeUrl.",
    keywords: ["equipamentos", "crud", "filtro", "csv", "categoria", "nbr", "status"],
    relatedModules: ["equipamentos", "qrcodes", "manutencoes", "alertas"],
    status: "done",
    priority: "low",
    suggestedActions: ["Adicionar botão 'Gerar QR' individual por equipamento na listagem"],
    createdAt: "2026-04-01",
  },
  {
    id: "mod-002",
    module: "manutencoes",
    type: "module_status",
    title: "Módulo Manutenções — Status",
    content:
      "PRONTO. Registro de manutenções por equipamento com tipo (recarga, inspeção, substituição, instalação, teste, outro), técnico responsável, CREA, RNP, número de OS/NF/laudo, próxima data. Integrado ao scheduler de alertas.",
    keywords: ["manutencao", "recarga", "inspecao", "tecnico", "crea", "os", "nf", "laudo"],
    relatedModules: ["manutencoes", "equipamentos", "alertas"],
    status: "done",
    priority: "low",
    createdAt: "2026-04-01",
  },
  {
    id: "mod-003",
    module: "qrcodes",
    type: "module_status",
    title: "Módulo QR Codes — Status (parcial)",
    content:
      "PARCIALMENTE PRONTO. Geração de QR Code funcional (URL /extintor/:code). Página pública /extintor/:code exibe dados do equipamento. PENDENTE: exibição da imagem PNG do QR Code na página /app/qrcodes (atualmente só exibe texto/URL). Botão 'Gerar QR' individual por equipamento ainda não implementado.",
    keywords: ["qrcode", "qr", "extintor", "imagem", "png", "pendente"],
    relatedModules: ["qrcodes", "equipamentos"],
    status: "partial",
    priority: "high",
    suggestedActions: [
      "Instalar biblioteca qrcode para gerar imagem PNG no backend",
      "Exibir <img> com data URL do QR na página /app/qrcodes",
      "Adicionar botão 'Gerar QR' na listagem de equipamentos",
    ],
    createdAt: "2026-04-01",
  },
  {
    id: "mod-004",
    module: "alertas",
    type: "module_status",
    title: "Módulo Alertas — Status",
    content:
      "PRONTO. Geração automática de alertas por vencimento (30 dias, 7 dias, vencido). Scheduler cron diário às 07:00 BRT. Tabela alert_events com status (pending/sent/resolved). Integrado às notificações WhatsApp e e-mail. CORRIGIDO: migração de colunas faltantes na tabela equipment que impedia o AlertJob de rodar.",
    keywords: ["alertas", "vencimento", "scheduler", "cron", "notificacao", "whatsapp", "email"],
    relatedModules: ["alertas", "equipamentos", "notificacoes"],
    status: "done",
    priority: "low",
    createdAt: "2026-04-01",
  },
  {
    id: "mod-005",
    module: "documentos",
    type: "module_status",
    title: "Módulo Documentos — Status (parcial)",
    content:
      "PARCIALMENTE PRONTO. Upload drag-and-drop múltiplo funcional para imagens. PENDENTE: upload de PDF binário falha porque o FileReader usa readAsText() em vez de readAsDataURL(). Documentos são armazenados no S3 com metadados no banco. IA extrai dados de NF e OS automaticamente.",
    keywords: ["documentos", "upload", "pdf", "s3", "ia", "filereader", "pendente"],
    relatedModules: ["documentos", "plataforma_geral"],
    status: "partial",
    priority: "high",
    suggestedActions: [
      "Corrigir FileReader: usar readAsDataURL() para PDFs",
      "Adicionar validação de tipo MIME no frontend",
      "Testar upload de PDF após correção",
    ],
    createdAt: "2026-04-01",
  },
  {
    id: "mod-006",
    module: "relatorios",
    type: "module_status",
    title: "Módulo Relatórios — Status",
    content:
      "PRONTO. Página /app/relatorios com 10 cards de métricas, 3 gráficos de barras (categoria, status, tipo de manutenção), tabela de alertas recentes, conformidade por empresa com barra de progresso, exportação CSV. Endpoints: saas.reports.usage, saas.reports.company, saas.reports.exportUsageCsv.",
    keywords: ["relatorios", "metricas", "graficos", "csv", "exportacao", "conformidade"],
    relatedModules: ["relatorios", "equipamentos", "manutencoes", "alertas", "clientes"],
    status: "done",
    priority: "low",
    suggestedActions: ["Adicionar exportação PDF com jsPDF ou html2canvas"],
    createdAt: "2026-04-01",
  },
  {
    id: "mod-007",
    module: "clientes",
    type: "module_status",
    title: "Módulo Clientes — Status",
    content:
      "PRONTO. Listagem com busca por nome/CNPJ/e-mail. Painel lateral de detalhes por cliente (stats, categorias, últimas manutenções, alertas). Exportação CSV individual. Importação em lote via CSV (parser RFC 4180). PENDENTE: página de gestão de assinaturas/planos por cliente.",
    keywords: ["clientes", "empresas", "csv", "importacao", "assinatura", "plano"],
    relatedModules: ["clientes", "relatorios"],
    status: "done",
    priority: "low",
    suggestedActions: ["Criar página /app/assinaturas para gestão de planos"],
    createdAt: "2026-04-01",
  },
  {
    id: "mod-008",
    module: "notificacoes",
    type: "module_status",
    title: "Módulo Notificações — Status",
    content:
      "PRONTO (aguardando credenciais). Configuração de WhatsApp (Evolution API) e e-mail (SMTP) por empresa. Toggle ativar/desativar por canal. Botão 'Testar notificação'. PENDENTE: credenciais EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM.",
    keywords: ["notificacoes", "whatsapp", "email", "smtp", "evolution", "credenciais"],
    relatedModules: ["notificacoes", "alertas"],
    status: "partial",
    priority: "high",
    suggestedActions: [
      "Configurar credenciais SMTP no painel de Secrets",
      "Configurar credenciais Evolution API para WhatsApp",
      "Testar notificação após configuração",
    ],
    createdAt: "2026-04-01",
  },

  // ── FEATURES PENDENTES ─────────────────────────────────────────────────────
  {
    id: "feat-001",
    module: "plataforma_geral",
    type: "feature",
    title: "Página /app/usuarios — Gestão de técnicos e usuários",
    content:
      "PENDENTE. Não existe página de gestão de usuários da plataforma. A tabela saas_users existe no banco com campos: name, email, role (admin/user), companyId, phone, crea, rnp. Estimativa: 1 dia de desenvolvimento.",
    keywords: ["usuarios", "tecnicos", "gestao", "admin", "role", "pendente"],
    relatedModules: ["autenticacao", "plataforma_geral"],
    status: "pending",
    priority: "high",
    suggestedActions: [
      "Criar página /app/usuarios com CRUD de usuários",
      "Adicionar item 'Usuários' no menu lateral (adminOnly)",
      "Implementar endpoint saas.users.list/create/update/delete",
    ],
    createdAt: "2026-04-01",
  },
  {
    id: "feat-002",
    module: "clientes",
    type: "feature",
    title: "Página /app/assinaturas — Gestão de planos",
    content:
      "PENDENTE. Não existe página de gestão de assinaturas/planos por cliente. O endpoint saas.subscriptions existe no backend. Estimativa: 1 dia de desenvolvimento.",
    keywords: ["assinaturas", "planos", "basico", "profissional", "enterprise", "pendente"],
    relatedModules: ["clientes"],
    status: "pending",
    priority: "medium",
    suggestedActions: [
      "Criar página /app/assinaturas com gestão de planos",
      "Adicionar item 'Assinaturas' no menu lateral (adminOnly)",
    ],
    createdAt: "2026-04-01",
  },
  {
    id: "feat-003",
    module: "mobile",
    type: "feature",
    title: "App Mobile iOS e Android",
    content:
      "PLANEJADO. Stack: React Native + Expo. Funcionalidades: login JWT, dashboard, equipamentos, scan QR com câmera, manutenções offline, notificações push (Expo Notifications). Publicação: App Store + Google Play via EAS Build. Estimativa: 3-4 semanas.",
    keywords: ["mobile", "ios", "android", "react-native", "expo", "qr", "offline", "push"],
    relatedModules: ["mobile", "qrcodes", "equipamentos", "manutencoes"],
    status: "pending",
    priority: "medium",
    suggestedActions: [
      "Criar conta no Expo Application Services (EAS)",
      "Executar: npx create-expo-app mobile --template",
      "Configurar URL da API: https://co2contra.com/api/trpc",
    ],
    createdAt: "2026-04-01",
  },

  // ── NORMAS TÉCNICAS ────────────────────────────────────────────────────────
  {
    id: "norm-001",
    module: "plataforma_geral",
    type: "norm",
    title: "Normas técnicas aplicáveis ao OPERIS",
    content:
      "ABNT NBR 12693 (extintores), ABNT NBR 13714 (hidrantes), ABNT NBR 17240 (alarmes), ABNT NBR 13786 (sprinklers), ABNT NBR 12615 (CO2), ABNT NBR 14276 (brigada), NFPA 10 (extintores portáteis), NFPA 13 (sprinklers), NFPA 72 (alarmes), UL Listed (supressão automática).",
    keywords: ["norma", "abnt", "nbr", "nfpa", "ul", "extintor", "hidrante", "sprinkler", "alarme", "co2"],
    relatedModules: ["equipamentos", "manutencoes", "documentos"],
    status: "done",
    priority: "low",
    createdAt: "2026-04-01",
  },

  // ── CONFIGURAÇÃO ───────────────────────────────────────────────────────────
  {
    id: "conf-001",
    module: "plataforma_geral",
    type: "config",
    title: "Variáveis de ambiente necessárias",
    content:
      "Sistema: DATABASE_URL, JWT_SECRET, VITE_APP_ID, OAUTH_SERVER_URL, BUILT_IN_FORGE_API_URL, BUILT_IN_FORGE_API_KEY. SMTP: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM. WhatsApp: EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE. Todas gerenciadas pelo painel de Secrets do Manus.",
    keywords: ["env", "secrets", "smtp", "evolution", "jwt", "database", "configuracao"],
    relatedModules: ["plataforma_geral", "notificacoes", "autenticacao"],
    status: "partial",
    priority: "high",
    suggestedActions: [
      "Configurar SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM",
      "Configurar EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE",
    ],
    createdAt: "2026-04-01",
  },
  {
    id: "conf-002",
    module: "site_institucional",
    type: "config",
    title: "Domínios configurados",
    content:
      "co2contra.com (principal), www.co2contra.com (redirect), co2contraincendio.manus.space (Manus CDN), co2firepro-tyjdurrr.manus.space (Manus CDN alternativo). Todos apontam para o mesmo servidor.",
    keywords: ["dominio", "dns", "co2contra.com", "manus.space", "configuracao"],
    relatedModules: ["site_institucional"],
    status: "done",
    priority: "low",
    createdAt: "2026-04-01",
  },

  // ── PROCEDIMENTOS ──────────────────────────────────────────────────────────
  {
    id: "proc-001",
    module: "plataforma_geral",
    type: "procedure",
    title: "Como adicionar um novo cliente (empresa) ao OPERIS",
    content:
      "1. Acesse /app/clientes. 2. Clique em 'Nova Empresa'. 3. Preencha: nome, CNPJ, e-mail, telefone, endereço. 4. Salve. 5. Acesse a empresa e configure notificações em /app/notificacoes. 6. Cadastre equipamentos em /app/equipamentos vinculando ao companyId.",
    keywords: ["cliente", "empresa", "cadastro", "cnpj", "procedimento"],
    relatedModules: ["clientes", "equipamentos", "notificacoes"],
    status: "done",
    priority: "low",
    createdAt: "2026-04-01",
  },
  {
    id: "proc-002",
    module: "qrcodes",
    type: "procedure",
    title: "Como gerar e imprimir QR Code de um equipamento",
    content:
      "1. Acesse /app/equipamentos. 2. Localize o equipamento. 3. Clique em 'Gerar QR' (botão individual — PENDENTE de implementação). 4. Acesse /app/qrcodes para ver todos os QR Codes. 5. Use o botão 'Imprimir' para gerar etiqueta. 6. O QR aponta para /extintor/:code com dados públicos do equipamento.",
    keywords: ["qrcode", "imprimir", "etiqueta", "extintor", "procedimento"],
    relatedModules: ["qrcodes", "equipamentos"],
    status: "partial",
    priority: "high",
    createdAt: "2026-04-01",
  },
];

// ─── Motor de Busca ───────────────────────────────────────────────────────────

/**
 * Calcula score de relevância entre query e chunk.
 * Algoritmo: TF (term frequency) ponderado por campo.
 * Pesos: title=3, keywords=2, content=1
 */
function scoreChunk(query: string, chunk: KnowledgeChunk): { score: number; matched: string[] } {
  const terms = query
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/\s+/)
    .filter((t) => t.length > 2);

  if (terms.length === 0) return { score: 0, matched: [] };

  const matched: string[] = [];
  let score = 0;

  const titleNorm = chunk.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const contentNorm = chunk.content.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const keywordsNorm = chunk.keywords.map((k) =>
    k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  );

  for (const term of terms) {
    if (titleNorm.includes(term)) {
      score += 3;
      if (!matched.includes(term)) matched.push(term);
    }
    if (keywordsNorm.some((k) => k.includes(term))) {
      score += 2;
      if (!matched.includes(term)) matched.push(term);
    }
    if (contentNorm.includes(term)) {
      score += 1;
      if (!matched.includes(term)) matched.push(term);
    }
    // Boost por módulo na query
    if (chunk.module.includes(term)) {
      score += 2;
    }
    // Boost por tipo na query
    if (chunk.type.includes(term)) {
      score += 1;
    }
    // Boost por status crítico
    if (chunk.status === "error" || chunk.priority === "critical") {
      score += 0.5;
    }
  }

  return { score, matched };
}

/**
 * search_operis(query) — Busca semântica no knowledge base do OPERIS.
 *
 * Retorna chunks relevantes, módulos relacionados e ações sugeridas.
 * Determinístico, sem dependência de LLM externa.
 */
export function searchOperis(query: string, limit = 8): SearchOperisResult {
  if (!query || query.trim().length < 2) {
    return {
      query,
      results: [],
      relatedModules: [],
      suggestedActions: [],
      totalFound: 0,
    };
  }

  const scored: SearchResult[] = KNOWLEDGE_BASE.map((chunk) => {
    const { score, matched } = scoreChunk(query, chunk);
    return { chunk, score, matchedKeywords: matched };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // Coletar módulos relacionados únicos
  const relatedModulesSet = new Set<KnowledgeModule>();
  scored.forEach((r) => {
    r.chunk.relatedModules.forEach((m) => relatedModulesSet.add(m));
  });

  // Coletar ações sugeridas únicas
  const actionsSet = new Set<string>();
  scored.forEach((r) => {
    (r.chunk.suggestedActions || []).forEach((a) => actionsSet.add(a));
  });

  return {
    query,
    results: scored,
    relatedModules: Array.from(relatedModulesSet),
    suggestedActions: Array.from(actionsSet).slice(0, 5),
    totalFound: scored.length,
  };
}

/**
 * getChunksByModule — Retorna todos os chunks de um módulo específico.
 */
export function getChunksByModule(module: KnowledgeModule): KnowledgeChunk[] {
  return KNOWLEDGE_BASE.filter((c) => c.module === module || c.relatedModules.includes(module));
}

/**
 * getChunksByType — Retorna todos os chunks de um tipo específico.
 */
export function getChunksByType(type: KnowledgeChunkType): KnowledgeChunk[] {
  return KNOWLEDGE_BASE.filter((c) => c.type === type);
}

/**
 * getPendingItems — Retorna todos os itens pendentes ou com erro.
 */
export function getPendingItems(): KnowledgeChunk[] {
  return KNOWLEDGE_BASE.filter((c) => c.status === "pending" || c.status === "error" || c.status === "partial")
    .sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
}

/**
 * getSystemStatus — Retorna um resumo do status geral do sistema.
 */
export function getSystemStatus() {
  const total = KNOWLEDGE_BASE.length;
  const done = KNOWLEDGE_BASE.filter((c) => c.status === "done").length;
  const partial = KNOWLEDGE_BASE.filter((c) => c.status === "partial").length;
  const pending = KNOWLEDGE_BASE.filter((c) => c.status === "pending").length;
  const errors = KNOWLEDGE_BASE.filter((c) => c.status === "error").length;
  const critical = KNOWLEDGE_BASE.filter((c) => c.priority === "critical").length;

  return {
    total,
    done,
    partial,
    pending,
    errors,
    critical,
    healthScore: Math.round((done / total) * 100),
  };
}

/**
 * ingestChunk — Adiciona um novo chunk ao knowledge base em runtime.
 * Útil para ingestão de novos documentos ou erros detectados automaticamente.
 */
export function ingestChunk(chunk: Omit<KnowledgeChunk, "createdAt">): KnowledgeChunk {
  const newChunk: KnowledgeChunk = {
    ...chunk,
    createdAt: new Date().toISOString().split("T")[0],
  };
  // Em produção, persistir no banco. Por ora, adiciona ao array em memória.
  KNOWLEDGE_BASE.push(newChunk);
  return newChunk;
}

export { KNOWLEDGE_BASE };
