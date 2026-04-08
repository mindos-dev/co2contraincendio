/**
 * OPERIS IA — Módulo de Normas Técnicas
 * Entidades, validações e regras de negócio para normas NBR/NFPA/IT
 */
import { z } from "zod";

// ─── Entidades ────────────────────────────────────────────────────────────────

export const NormaSchema = z.object({
  codigo: z.string().min(2),
  titulo: z.string().min(5),
  orgao: z.enum(["ABNT", "NFPA", "CBMMG", "CREA", "INMETRO", "UL"]),
  versao: z.string(),
  anoPublicacao: z.number().int().min(1950).max(2030),
  escopo: z.string(),
  aplicacao: z.array(z.string()),
  periodicidadeInspecaoDias: z.number().int().positive().optional(),
  exigeART: z.boolean().default(false),
  exigeRRT: z.boolean().default(false),
  exigeTestHidrostatico: z.boolean().default(false),
});

export type Norma = z.infer<typeof NormaSchema>;

// ─── Base normativa OPERIS ────────────────────────────────────────────────────

export const BASE_NORMATIVA: Record<string, Norma> = {
  "NBR-12962": {
    codigo: "NBR 12962",
    titulo: "Inspeção, manutenção e recarga em extintores de incêndio",
    orgao: "ABNT",
    versao: "2016",
    anoPublicacao: 2016,
    escopo: "Extintores portáteis e sobre rodas",
    aplicacao: ["extintor", "extintor_co2", "extintor_po", "extintor_agua"],
    periodicidadeInspecaoDias: 365,
    exigeART: true,
    exigeRRT: false,
    exigeTestHidrostatico: true,
  },
  "NFPA-10": {
    codigo: "NFPA 10",
    titulo: "Standard for Portable Fire Extinguishers",
    orgao: "NFPA",
    versao: "2022",
    anoPublicacao: 2022,
    escopo: "Extintores portáteis — padrão internacional",
    aplicacao: ["extintor", "extintor_classe_k", "extintor_saponificante"],
    periodicidadeInspecaoDias: 1825,
    exigeART: false,
    exigeRRT: false,
    exigeTestHidrostatico: true,
  },
  "NBR-12779": {
    codigo: "NBR 12779",
    titulo: "Mangueiras de incêndio — Manutenção, cuidados e inspeção",
    orgao: "ABNT",
    versao: "2009",
    anoPublicacao: 2009,
    escopo: "Mangueiras, hidrantes e sistemas de combate",
    aplicacao: ["mangueira", "hidrante", "sprinkler", "sistema_hidraulico"],
    periodicidadeInspecaoDias: 365,
    exigeART: true,
    exigeRRT: false,
    exigeTestHidrostatico: true,
  },
  "NBR-14518": {
    codigo: "NBR 14518",
    titulo: "Sistemas de ventilação para cozinhas profissionais",
    orgao: "ABNT",
    versao: "2019",
    anoPublicacao: 2019,
    escopo: "Coifas, dutos, filtros e sistemas de exaustão em cozinhas",
    aplicacao: ["coifa", "duto", "filtro_gordura", "exaustor", "sistema_fixo_cozinha"],
    periodicidadeInspecaoDias: 30,
    exigeART: true,
    exigeRRT: false,
    exigeTestHidrostatico: false,
  },
  "IT-16-CBMMG": {
    codigo: "IT-16/CBMMG",
    titulo: "Instrução Técnica 16 — CBMMG: Sistemas de proteção por extintores",
    orgao: "CBMMG",
    versao: "2023",
    anoPublicacao: 2023,
    escopo: "Sistemas de proteção por extintores em Minas Gerais",
    aplicacao: ["extintor", "sistema_extintores", "projeto_preventivo"],
    periodicidadeInspecaoDias: 365,
    exigeART: true,
    exigeRRT: true,
    exigeTestHidrostatico: false,
  },
  "NR-23": {
    codigo: "NR-23",
    titulo: "Proteção Contra Incêndios — Norma Regulamentadora",
    orgao: "CREA",
    versao: "2011",
    anoPublicacao: 2011,
    escopo: "Proteção contra incêndios em estabelecimentos de trabalho",
    aplicacao: ["extintor", "saida_emergencia", "brigada_incendio", "plano_emergencia"],
    periodicidadeInspecaoDias: 365,
    exigeART: false,
    exigeRRT: false,
    exigeTestHidrostatico: false,
  },
};

// ─── Validações ───────────────────────────────────────────────────────────────

export function getNormaByEquipamento(
  categoria: string,
  agentType?: string
): Norma | null {
  const cat = categoria.toLowerCase();
  const agent = (agentType ?? "").toLowerCase();

  if (agent.includes("saponificante") || agent.includes("classe k")) {
    return BASE_NORMATIVA["NFPA-10"] ?? null;
  }
  if (cat.includes("mangueira") || cat.includes("hidrante") || cat.includes("sprinkler")) {
    return BASE_NORMATIVA["NBR-12779"] ?? null;
  }
  if (cat.includes("coifa") || cat.includes("duto") || cat.includes("cozinha")) {
    return BASE_NORMATIVA["NBR-14518"] ?? null;
  }
  if (cat.includes("extintor")) {
    return BASE_NORMATIVA["NBR-12962"] ?? null;
  }
  return null;
}

export function calcProximaInspecao(
  norma: Norma,
  ultimaInspecao?: Date
): Date {
  const base = ultimaInspecao ?? new Date();
  const dias = norma.periodicidadeInspecaoDias ?? 365;
  const proxima = new Date(base);
  proxima.setDate(proxima.getDate() + dias);
  return proxima;
}

export function isVencido(proximaInspecao: Date): boolean {
  return new Date() > proximaInspecao;
}

export function diasParaVencer(proximaInspecao: Date): number {
  const diff = proximaInspecao.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getStatusNormativo(
  proximaInspecao: Date
): "ok" | "atencao" | "vencido" {
  const dias = diasParaVencer(proximaInspecao);
  if (dias < 0) return "vencido";
  if (dias <= 30) return "atencao";
  return "ok";
}

// ─── Regras de negócio ────────────────────────────────────────────────────────

export interface ValidacaoNormativa {
  conforme: boolean;
  norma: string;
  irregularidades: string[];
  recomendacoes: string[];
  proximaInspecao: Date;
}

export function validarConformidade(params: {
  categoria: string;
  agentType?: string;
  ultimaInspecao?: Date;
  temART: boolean;
  temTestHidrostatico: boolean;
}): ValidacaoNormativa {
  const norma = getNormaByEquipamento(params.categoria, params.agentType);
  const irregularidades: string[] = [];
  const recomendacoes: string[] = [];

  if (!norma) {
    return {
      conforme: false,
      norma: "Norma não identificada",
      irregularidades: ["Tipo de equipamento não mapeado para norma técnica"],
      recomendacoes: ["Consultar engenheiro responsável para classificação normativa"],
      proximaInspecao: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    };
  }

  const proximaInspecao = calcProximaInspecao(norma, params.ultimaInspecao);
  const status = getStatusNormativo(proximaInspecao);

  if (status === "vencido") {
    irregularidades.push(
      `Inspeção vencida conforme ${norma.codigo}. Última: ${params.ultimaInspecao?.toLocaleDateString("pt-BR") ?? "não registrada"}`
    );
  } else if (status === "atencao") {
    recomendacoes.push(
      `Inspeção vence em ${diasParaVencer(proximaInspecao)} dias (${norma.codigo})`
    );
  }

  if (norma.exigeART && !params.temART) {
    irregularidades.push(`ART obrigatória conforme ${norma.codigo} — não registrada`);
  }

  if (norma.exigeTestHidrostatico && !params.temTestHidrostatico) {
    irregularidades.push(
      `Teste hidrostático obrigatório conforme ${norma.codigo} — não registrado`
    );
  }

  return {
    conforme: irregularidades.length === 0,
    norma: norma.codigo,
    irregularidades,
    recomendacoes,
    proximaInspecao,
  };
}
