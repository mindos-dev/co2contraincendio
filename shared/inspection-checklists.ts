/**
 * OPERIS IA — Checklists Dinâmicos de Vistoria
 * 4 conjuntos de validação por tipo de imóvel:
 * residencial | comercial | galpao | predial
 *
 * Cada item possui:
 * - id: identificador único
 * - label: descrição do item
 * - checks: opções de estado (checkboxes)
 * - mandatory: obrigatório para o tipo
 * - category: grupo visual
 * - fireSafety: se pertence à auditoria de incêndio (CO2 Standard)
 */

export type SeverityLevel = "low" | "medium" | "high";
export type PropertyType = "residencial" | "comercial" | "galpao" | "predial";

export interface ChecklistItem {
  id: string;
  label: string;
  checks: string[];
  mandatory: boolean;
  category: string;
  fireSafety?: boolean;
  accessibilityCheck?: boolean;
}

export interface ChecklistSection {
  id: string;
  title: string;
  icon: string;
  items: ChecklistItem[];
  mandatoryForTypes: PropertyType[];
}

// ─── RESIDENCIAL ─────────────────────────────────────────────────────────────
const residencialSections: ChecklistSection[] = [
  {
    id: "acabamento",
    title: "Acabamento e Estética",
    icon: "🏠",
    mandatoryForTypes: ["residencial"],
    items: [
      { id: "res-piso", label: "Piso", checks: ["Trincado", "Oco", "Manchado", "Desgastado", "Normal"], mandatory: true, category: "Piso" },
      { id: "res-pintura", label: "Pintura das Paredes", checks: ["Suja", "Furos", "Umidade", "Descascando", "Nova"], mandatory: true, category: "Paredes" },
      { id: "res-teto", label: "Teto / Forro", checks: ["Infiltração", "Mofo", "Trinca", "Manchado", "Normal"], mandatory: true, category: "Teto" },
      { id: "res-rodape", label: "Rodapé e Soleiras", checks: ["Quebrado", "Solto", "Manchado", "Normal"], mandatory: false, category: "Acabamento" },
      { id: "res-revestimento", label: "Revestimento Cerâmico", checks: ["Trincado", "Solto", "Rejunte Deteriorado", "Normal"], mandatory: false, category: "Acabamento" },
    ],
  },
  {
    id: "esquadrias",
    title: "Esquadrias e Vidros",
    icon: "🪟",
    mandatoryForTypes: ["residencial", "comercial", "predial"],
    items: [
      { id: "res-janelas", label: "Janelas", checks: ["Travamento com Defeito", "Vidro Trincado", "Vedação Comprometida", "Normal"], mandatory: true, category: "Esquadrias" },
      { id: "res-portas", label: "Portas Internas", checks: ["Empenada", "Fechadura com Defeito", "Arranhada", "Normal"], mandatory: true, category: "Esquadrias" },
      { id: "res-porta-entrada", label: "Porta de Entrada", checks: ["Fechadura com Defeito", "Amassada", "Arranhada", "Normal"], mandatory: true, category: "Esquadrias" },
    ],
  },
  {
    id: "hidraulica",
    title: "Instalações Hidráulicas",
    icon: "🚿",
    mandatoryForTypes: ["residencial", "comercial", "predial"],
    items: [
      { id: "res-torneiras", label: "Torneiras e Registros", checks: ["Vazamento", "Entupimento", "Oxidação", "Normal"], mandatory: true, category: "Hidráulica" },
      { id: "res-vaso", label: "Vaso Sanitário e Caixa Acoplada", checks: ["Vazamento", "Descarga com Defeito", "Trincado", "Normal"], mandatory: true, category: "Hidráulica" },
      { id: "res-chuveiro", label: "Chuveiro / Ducha", checks: ["Sem Pressão", "Vazamento", "Oxidado", "Normal"], mandatory: false, category: "Hidráulica" },
      { id: "res-ralo", label: "Ralos e Sifões", checks: ["Entupido", "Odor", "Normal"], mandatory: false, category: "Hidráulica" },
    ],
  },
  {
    id: "eletrica",
    title: "Instalações Elétricas",
    icon: "⚡",
    mandatoryForTypes: ["residencial", "comercial", "predial", "galpao"],
    items: [
      { id: "res-tomadas", label: "Tomadas e Interruptores", checks: ["Com Defeito", "Sem Tampa", "Oxidado", "Normal"], mandatory: true, category: "Elétrica" },
      { id: "res-quadro", label: "Quadro de Distribuição (QD)", checks: ["Disjuntores Soltos", "Sem Identificação", "Oxidado", "Normal"], mandatory: true, category: "Elétrica" },
      { id: "res-luminarias", label: "Luminárias e Pontos de Luz", checks: ["Com Defeito", "Sem Tampa", "Normal"], mandatory: false, category: "Elétrica" },
    ],
  },
];

// ─── COMERCIAL ────────────────────────────────────────────────────────────────
const comercialSections: ChecklistSection[] = [
  ...residencialSections,
  {
    id: "acessibilidade",
    title: "Acessibilidade e Conformidade (NBR 9050)",
    icon: "♿",
    mandatoryForTypes: ["comercial"],
    items: [
      { id: "com-rampa", label: "Rampa de Acesso", checks: ["Ausente", "Inclinação Incorreta", "Sem Corrimão", "Conforme"], mandatory: true, category: "Acessibilidade", accessibilityCheck: true },
      { id: "com-banheiro-acess", label: "Banheiro Acessível", checks: ["Ausente", "Barras de Apoio Faltando", "Espaço Insuficiente", "Conforme"], mandatory: true, category: "Acessibilidade", accessibilityCheck: true },
      { id: "com-sinalizacao", label: "Sinalização Tátil e Visual", checks: ["Ausente", "Danificada", "Incompleta", "Conforme"], mandatory: true, category: "Acessibilidade", accessibilityCheck: true },
      { id: "com-elevador", label: "Elevador / Plataforma Elevatória", checks: ["Ausente", "Com Defeito", "Sem Laudo", "Conforme"], mandatory: false, category: "Acessibilidade", accessibilityCheck: true },
    ],
  },
  {
    id: "rede-ti",
    title: "Infraestrutura de Rede e TI",
    icon: "🌐",
    mandatoryForTypes: ["comercial"],
    items: [
      { id: "com-cabeamento", label: "Cabeamento Estruturado", checks: ["Exposto", "Sem Identificação", "Danificado", "Organizado"], mandatory: false, category: "Rede" },
      { id: "com-rack", label: "Rack / Patch Panel", checks: ["Ausente", "Sem Organização", "Sem Aterramento", "Conforme"], mandatory: false, category: "Rede" },
      { id: "com-nobreak", label: "Nobreak / Estabilizador", checks: ["Ausente", "Com Defeito", "Sem Manutenção", "Conforme"], mandatory: false, category: "Rede" },
    ],
  },
];

// ─── GALPÃO / INDUSTRIAL ──────────────────────────────────────────────────────
const galpaoSections: ChecklistSection[] = [
  {
    id: "estrutura-industrial",
    title: "Estrutura Industrial",
    icon: "🏭",
    mandatoryForTypes: ["galpao"],
    items: [
      { id: "gal-piso", label: "Piso Industrial", checks: ["Fissurado", "Desnivelado", "Carga Excedida", "Nivelado OK"], mandatory: true, category: "Estrutura" },
      { id: "gal-cobertura", label: "Cobertura Metálica / Telhas", checks: ["Infiltração", "Telha Quebrada", "Calha Entupida", "Normal"], mandatory: true, category: "Estrutura" },
      { id: "gal-pilares", label: "Pilares e Vigas Metálicas", checks: ["Corrosão", "Deformação", "Sem Pintura Anticorrosiva", "Normal"], mandatory: true, category: "Estrutura" },
      { id: "gal-docas", label: "Docas e Portões de Acesso", checks: ["Travamento com Defeito", "Vedação Comprometida", "Sem Nivelador", "Normal"], mandatory: false, category: "Estrutura" },
    ],
  },
  {
    id: "incendio-co2",
    title: "🔴 Auditoria de Segurança Contra Incêndio (CO2 Fire Protection Standard)",
    icon: "🔥",
    mandatoryForTypes: ["galpao"],
    items: [
      { id: "gal-extintores", label: "Extintores (NBR 12693)", checks: ["Vencidos", "Ausentes", "Sem Sinalização", "Testados e OK"], mandatory: true, category: "Incêndio", fireSafety: true },
      { id: "gal-hidrantes", label: "Hidrantes e Mangotinhos (NBR 13714)", checks: ["Sem Pressão", "Mangueira Danificada", "Sem Teste", "Testados e OK"], mandatory: true, category: "Incêndio", fireSafety: true },
      { id: "gal-sinalizacao-incendio", label: "Sinalização de Emergência (NBR 13434)", checks: ["Ausente", "Danificada", "Sem Fotoluminescência", "Conforme"], mandatory: true, category: "Incêndio", fireSafety: true },
      { id: "gal-saidas", label: "Saídas de Emergência e Rotas de Fuga", checks: ["Bloqueadas", "Sem Iluminação de Emergência", "Sem Sinalização", "Conformes"], mandatory: true, category: "Incêndio", fireSafety: true },
      { id: "gal-deteccao", label: "Sistema de Detecção e Alarme (NBR 17240)", checks: ["Ausente", "Com Defeito", "Sem Laudo", "Testado e OK"], mandatory: true, category: "Incêndio", fireSafety: true },
      { id: "gal-sprinklers", label: "Sprinklers / Supressão Automática", checks: ["Ausente", "Cabeças Danificadas", "Sem Laudo Anual", "Testado e OK"], mandatory: false, category: "Incêndio", fireSafety: true },
      { id: "gal-co2-sistema", label: "Sistema CO₂ / Agente Especial (NFPA 12)", checks: ["Ausente", "Cilindros Vencidos", "Sem Laudo", "Testado e OK"], mandatory: false, category: "Incêndio", fireSafety: true },
    ],
  },
  {
    id: "eletrica-industrial",
    title: "Elétrica Industrial",
    icon: "⚡",
    mandatoryForTypes: ["galpao"],
    items: [
      { id: "gal-qgbt", label: "QGBT / Quadro Geral de Baixa Tensão", checks: ["Sem Identificação", "Disjuntores Soltos", "Sem Aterramento", "Conforme"], mandatory: true, category: "Elétrica" },
      { id: "gal-spda", label: "SPDA / Para-raios (NBR 5419)", checks: ["Ausente", "Sem Laudo", "Com Defeito", "Conforme"], mandatory: true, category: "Elétrica" },
      { id: "gal-iluminacao", label: "Iluminação de Emergência", checks: ["Ausente", "Com Defeito", "Sem Teste", "Testada e OK"], mandatory: true, category: "Elétrica" },
    ],
  },
];

// ─── PREDIAL ──────────────────────────────────────────────────────────────────
const predialSections: ChecklistSection[] = [
  ...residencialSections,
  {
    id: "fachada",
    title: "Fachada e Áreas Externas",
    icon: "🏢",
    mandatoryForTypes: ["predial"],
    items: [
      { id: "pred-fachada", label: "Revestimento de Fachada", checks: ["Destacamento", "Fissuras", "Infiltração", "Normal"], mandatory: true, category: "Fachada" },
      { id: "pred-impermeabilizacao", label: "Impermeabilização de Lajes e Terraços", checks: ["Falha", "Bolhas", "Infiltração Ativa", "Normal"], mandatory: true, category: "Fachada" },
      { id: "pred-calçada", label: "Calçada e Área de Circulação", checks: ["Trincada", "Desnivelada", "Sem Acessibilidade", "Normal"], mandatory: false, category: "Externo" },
    ],
  },
  {
    id: "areas-comuns",
    title: "Áreas Comuns e Sistemas Prediais",
    icon: "🏗️",
    mandatoryForTypes: ["predial"],
    items: [
      { id: "pred-elevador", label: "Elevadores (NR-12 / NBR 16042)", checks: ["Sem Laudo Anual", "Com Defeito", "Sem Manutenção", "Conforme"], mandatory: true, category: "Sistemas" },
      { id: "pred-bomba", label: "Casa de Bombas / Reservatório", checks: ["Sem Limpeza", "Vazamento", "Sem Laudo", "Conforme"], mandatory: true, category: "Sistemas" },
      { id: "pred-para-raios", label: "Para-raios (NBR 5419)", checks: ["Ausente", "Sem Laudo", "Com Defeito", "Conforme"], mandatory: true, category: "Sistemas" },
    ],
  },
  {
    id: "incendio-predial",
    title: "Segurança Contra Incêndio Predial",
    icon: "🔥",
    mandatoryForTypes: ["predial"],
    items: [
      { id: "pred-extintores", label: "Extintores por Pavimento (NBR 12693)", checks: ["Vencidos", "Ausentes", "Sem Sinalização", "OK"], mandatory: true, category: "Incêndio", fireSafety: true },
      { id: "pred-hidrantes", label: "Sistema de Hidrantes (NBR 13714)", checks: ["Sem Pressão", "Mangueira Danificada", "Sem Teste", "OK"], mandatory: true, category: "Incêndio", fireSafety: true },
      { id: "pred-alarme", label: "Central de Alarme e Detecção (NBR 17240)", checks: ["Ausente", "Com Defeito", "Sem Laudo", "OK"], mandatory: true, category: "Incêndio", fireSafety: true },
      { id: "pred-saidas", label: "Escadas Pressurizadas e Saídas de Emergência", checks: ["Bloqueadas", "Sem Iluminação", "Sem Sinalização", "Conformes"], mandatory: true, category: "Incêndio", fireSafety: true },
    ],
  },
];

// ─── MAPA PRINCIPAL ───────────────────────────────────────────────────────────
export const CHECKLISTS_BY_TYPE: Record<PropertyType, ChecklistSection[]> = {
  residencial: residencialSections,
  comercial: comercialSections,
  galpao: galpaoSections,
  predial: predialSections,
};

// ─── UTILITÁRIOS ──────────────────────────────────────────────────────────────
export function getChecklistForType(type: PropertyType): ChecklistSection[] {
  return CHECKLISTS_BY_TYPE[type] ?? residencialSections;
}

export function getMandatorySections(type: PropertyType): ChecklistSection[] {
  return getChecklistForType(type).filter(s => s.mandatoryForTypes.includes(type));
}

export function hasFireSafetySection(type: PropertyType): boolean {
  return getChecklistForType(type).some(s => s.items.some(i => i.fireSafety));
}

export function calculateRiskScore(severity: SeverityLevel): number {
  const scores: Record<SeverityLevel, number> = { low: 2, medium: 5, high: 9 };
  return scores[severity] ?? 0;
}

export function getRepairEstimate(category: string, severity: SeverityLevel): { min: number; max: number; currency: string } {
  const estimates: Record<string, Record<SeverityLevel, { min: number; max: number }>> = {
    fissura: { low: { min: 200, max: 800 }, medium: { min: 800, max: 3000 }, high: { min: 3000, max: 15000 } },
    infiltracao: { low: { min: 500, max: 2000 }, medium: { min: 2000, max: 8000 }, high: { min: 8000, max: 30000 } },
    corrosao: { low: { min: 300, max: 1200 }, medium: { min: 1200, max: 5000 }, high: { min: 5000, max: 20000 } },
    destacamento: { low: { min: 400, max: 1500 }, medium: { min: 1500, max: 6000 }, high: { min: 6000, max: 25000 } },
    outro: { low: { min: 200, max: 1000 }, medium: { min: 1000, max: 4000 }, high: { min: 4000, max: 15000 } },
  };
  const cat = estimates[category] ?? estimates.outro;
  const range = cat[severity];
  return { ...range, currency: "BRL" };
}

export const SEVERITY_LABELS: Record<SeverityLevel, { label: string; color: string; bg: string }> = {
  low: { label: "Baixa", color: "text-green-700", bg: "bg-green-100" },
  medium: { label: "Média", color: "text-yellow-700", bg: "bg-yellow-100" },
  high: { label: "Alta", color: "text-red-700", bg: "bg-red-100" },
};

export const PATHOLOGY_CATEGORIES = [
  { value: "fissura", label: "Fissura / Trinca" },
  { value: "infiltracao", label: "Infiltração / Umidade" },
  { value: "corrosao", label: "Corrosão / Oxidação" },
  { value: "destacamento", label: "Destacamento / Descolamento" },
  { value: "outro", label: "Outro" },
];
