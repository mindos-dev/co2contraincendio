/**
 * Traduções PT-BR — CO2 Contra Incêndio + OPERIS.eng
 * Idioma padrão do sistema
 */
export const pt = {
  // ── Navegação global ──────────────────────────────────────────
  nav: {
    home: "Home",
    about: "Quem Somos",
    services: "Serviços",
    projects: "Projetos",
    partners: "Parceiros",
    blog: "Blog",
    contact: "Contato",
    plans: "Planos & Preços",
    requestQuote: "Solicitar Orçamento",
    accessPlatform: "OPERIS IA — Acessar Plataforma",
    chooseLanguage: "Escolha o idioma",
  },

  // ── Homepage ──────────────────────────────────────────────────
  home: {
    hero: {
      badge1: "NBR 12615 · NFPA 12 · UL Listed",
      title1: "Sistemas Inteligentes de\nPrevenção e Combate\na Incêndios",
      sub1: "Projetos personalizados com sistemas de supressão por CO₂, saponificantes, hidrantes e alarmes. Conformidade ABNT, NFPA e Corpo de Bombeiros. Atendemos BH e todo o Brasil.",
      cta1: "Solicitar Orçamento",
      cta2: "Ver Sistema CO₂",
    },
    services: "Nossos Serviços",
    viewAll: "Ver todos os serviços",
    about: "Sobre Nós",
    certifications: "Certificações e Normas",
    contact: "Entre em Contato",
  },

  // ── Plataforma OPERIS ─────────────────────────────────────────
  platform: {
    dashboard: "Painel",
    equipment: "Equipamentos",
    maintenance: "Manutenções",
    reports: "Relatórios",
    alerts: "Alertas",
    documents: "Documentos",
    clients: "Clientes",
    orders: "Ordens de Serviço",
    financial: "Financeiro",
    settings: "Configurações",
    profile: "Perfil",
    notifications: "Notificações",
    qrcodes: "QR Codes",
    scanner: "Scanner",
    inspections: "Vistorias",
    proposals: "Propostas",
    logout: "Sair",
    loading: "Carregando...",
    error: "Erro ao carregar dados",
    noData: "Nenhum dado encontrado",
    save: "Salvar",
    cancel: "Cancelar",
    delete: "Excluir",
    edit: "Editar",
    view: "Visualizar",
    back: "Voltar",
    next: "Próximo",
    previous: "Anterior",
    search: "Buscar",
    filter: "Filtrar",
    export: "Exportar",
    import: "Importar",
    add: "Adicionar",
    new: "Novo",
    submit: "Enviar",
    confirm: "Confirmar",
    close: "Fechar",
    status: {
      active: "Ativo",
      inactive: "Inativo",
      pending: "Pendente",
      completed: "Concluído",
      cancelled: "Cancelado",
      overdue: "Vencido",
    },
  },

  // ── LGPD / Legal ──────────────────────────────────────────────
  legal: {
    privacyPolicy: "Política de Privacidade",
    termsOfService: "Termos de Uso",
    cookiePolicy: "Política de Cookies",
    cookieBanner: "Utilizamos cookies essenciais para o funcionamento da plataforma e, com seu consentimento, cookies de analytics para melhorar sua experiência.",
    acceptAll: "Aceitar tudo",
    configure: "Configurar",
    learnMore: "Saiba mais",
    lgpdCompliant: "Em conformidade com a LGPD",
  },

  // ── Erros ─────────────────────────────────────────────────────
  errors: {
    notFound: "Página não encontrada",
    serverError: "Erro interno do servidor",
    unauthorized: "Acesso não autorizado",
    forbidden: "Acesso negado",
    networkError: "Erro de conexão. Verifique sua internet.",
    tryAgain: "Tentar novamente",
  },
} as const;

// Tipo genérico que aceita qualquer string (necessário para as traduções EN)
export type Translations = {
  nav: {
    home: string; about: string; services: string; projects: string;
    partners: string; blog: string; contact: string; plans: string;
    requestQuote: string; accessPlatform: string; chooseLanguage: string;
  };
  home: {
    hero: { badge1: string; title1: string; sub1: string; cta1: string; cta2: string; };
    services: string; viewAll: string; about: string; certifications: string; contact: string;
  };
  platform: {
    dashboard: string; equipment: string; maintenance: string; reports: string;
    alerts: string; documents: string; clients: string; orders: string;
    financial: string; settings: string; profile: string; notifications: string;
    qrcodes: string; scanner: string; inspections: string; proposals: string;
    logout: string; loading: string; error: string; noData: string;
    save: string; cancel: string; delete: string; edit: string; view: string;
    back: string; next: string; previous: string; search: string; filter: string;
    export: string; import: string; add: string; new: string; submit: string;
    confirm: string; close: string;
    status: { active: string; inactive: string; pending: string; completed: string; cancelled: string; overdue: string; };
  };
  legal: {
    privacyPolicy: string; termsOfService: string; cookiePolicy: string;
    cookieBanner: string; acceptAll: string; configure: string; learnMore: string; lgpdCompliant: string;
  };
  errors: {
    notFound: string; serverError: string; unauthorized: string;
    forbidden: string; networkError: string; tryAgain: string;
  };
};
