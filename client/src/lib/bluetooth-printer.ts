/**
 * bluetooth-printer.ts  —  OPERIS IA Field Module
 * Driver ESC/POS Bluetooth para impressão de selos normativos térmicos.
 *
 * Layouts disponíveis:
 *   A — Extintor de Incêndio (NBR 12962 / ABNT)   → validade 365 dias
 *   B — Extintor Classe K / Saponificante (NFPA 10 / UL-300) → validade 1825 dias
 *   C — Mangueiras de Incêndio (NBR 12779)         → validade 365 dias (hidrostático)
 *   D — Casa de Bombas / Sistemas Fixos             → inspeção mensal
 *
 * Autenticidade obrigatória em todos os layouts:
 *   • auditHash SHA-256 (primeiros 16 chars)
 *   • QR Code nativo ESC/POS (GS ( k) — fallback texto para impressoras sem suporte
 *   • Disclaimer de auditoria se lastMaintenanceProvider ≠ "CO2 Contra Incêndio"
 *
 * Compatível com Web Bluetooth API (Chrome/Edge em HTTPS).
 */

// ─── Constantes ESC/POS ───────────────────────────────────────────────────────
const ESC = 0x1b;
const GS  = 0x1d;

const CMD = {
  INIT:          [ESC, 0x40],
  ALIGN_LEFT:    [ESC, 0x61, 0x00],
  ALIGN_CENTER:  [ESC, 0x61, 0x01],
  ALIGN_RIGHT:   [ESC, 0x61, 0x02],
  BOLD_ON:       [ESC, 0x45, 0x01],
  BOLD_OFF:      [ESC, 0x45, 0x00],
  DOUBLE_HEIGHT: [GS,  0x21, 0x01],
  DOUBLE_WIDTH:  [GS,  0x21, 0x10],
  DOUBLE_BOTH:   [GS,  0x21, 0x11],
  NORMAL_SIZE:   [GS,  0x21, 0x00],
  UNDERLINE_ON:  [ESC, 0x2d, 0x01],
  UNDERLINE_OFF: [ESC, 0x2d, 0x00],
  CUT:           [GS,  0x56, 0x42, 0x00],
  FEED_LINE:     [0x0a],
  FEED_3:        [ESC, 0x64, 0x03],
  FEED_5:        [ESC, 0x64, 0x05],
};

// ─── Perfis de impressora ─────────────────────────────────────────────────────
export type PrinterProfile = "generic_58mm" | "epson_mobile" | "zebra";

interface PrinterConfig {
  name: string;
  columns: number;
  serviceUuid: string;
  characteristicUuid: string;
}

const PRINTER_PROFILES: Record<PrinterProfile, PrinterConfig> = {
  generic_58mm: {
    name: "Generic 58mm (ESC/POS)",
    columns: 32,
    serviceUuid: "000018f0-0000-1000-8000-00805f9b34fb",
    characteristicUuid: "00002af1-0000-1000-8000-00805f9b34fb",
  },
  epson_mobile: {
    name: "Epson Mobile (TM-P20/P60)",
    columns: 48,
    serviceUuid: "18f0",
    characteristicUuid: "2af1",
  },
  zebra: {
    name: "Zebra / Leopardo (ZPL/ESC fallback)",
    columns: 48,
    serviceUuid: "38eb4a80-c570-11e3-9507-0002a5d5c51b",
    characteristicUuid: "38eb4a81-c570-11e3-9507-0002a5d5c51b",
  },
};

// ─── Persistência da impressora ───────────────────────────────────────────────
const STORAGE_KEY = "operis_bt_printer";

export interface SavedPrinter {
  profile: PrinterProfile;
  name: string;
  savedAt: string;
}

export function getSavedPrinter(): SavedPrinter | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedPrinter) : null;
  } catch {
    return null;
  }
}

export function savePrinter(profile: PrinterProfile, name: string): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ profile, name, savedAt: new Date().toISOString() })
  );
}

export function clearSavedPrinter(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ─── Mapeamento de layout por tipo de equipamento ────────────────────────────
export type LabelLayout = "A" | "B" | "C" | "D";

/**
 * Determina o layout normativo com base na categoria e no tipo de agente.
 * Regras:
 *   B → extintor com agentType contendo "saponificante", "classe k", "k-class", "k class"
 *   C → hidrante, mangotinho, sprinkler, mangueira
 *   D → detector, alarme, painel, sinalizacao, complementar, bomba, sistema fixo
 *   A → extintor padrão (pó, CO2, água, espuma, halon, etc.)
 */
export function resolveLabelLayout(
  category: string | null | undefined,
  agentType: string | null | undefined,
  subType: string | null | undefined
): LabelLayout {
  const cat   = (category  ?? "").toLowerCase();
  const agent = (agentType ?? "").toLowerCase();
  const sub   = (subType   ?? "").toLowerCase();

  // Classe K / Saponificante → Layout B
  if (
    agent.includes("saponificante") ||
    agent.includes("classe k") ||
    agent.includes("k-class") ||
    agent.includes("k class") ||
    sub.includes("saponificante") ||
    sub.includes("classe k")
  ) return "B";

  // Mangueiras / Hidrante / Sprinkler → Layout C
  if (
    cat === "hidrante" ||
    cat === "sprinkler" ||
    cat === "mangueira" ||
    sub.includes("mangueira") ||
    sub.includes("hidrante") ||
    sub.includes("mangotinho")
  ) return "C";

  // Detectores / Alarmes / Sinalização / Complementar → Layout D
  if (
    cat === "detector" ||
    cat === "sinalizacao" ||
    cat === "complementar" ||
    sub.includes("bomba") ||
    sub.includes("painel") ||
    sub.includes("alarme") ||
    sub.includes("sistema fixo")
  ) return "D";

  // Padrão: extintor → Layout A
  return "A";
}

/**
 * Calcula a data de vencimento normativa se não fornecida.
 * A → 365 dias (NBR 12962)
 * B → 1825 dias / 5 anos (NFPA 10 / UL-300)
 * C → 365 dias (NBR 12779 — teste hidrostático anual)
 * D → 30 dias (inspeção mensal)
 */
export function calcNormativeExpiry(layout: LabelLayout, fromDate?: Date): string {
  const base = fromDate ?? new Date();
  const days = layout === "B" ? 1825 : layout === "D" ? 30 : 365;
  const expiry = new Date(base.getTime() + days * 86_400_000);
  return expiry.toLocaleDateString("pt-BR");
}

// ─── Dados do selo ────────────────────────────────────────────────────────────
export interface LabelData {
  // Identificação
  equipmentId: string;
  equipmentCode: string;
  location: string;
  company: string;

  // Dados técnicos (opcionais — usados conforme o layout)
  agentType?: string;
  capacity?: string;
  serialNumber?: string;
  patrimonyTag?: string;
  weightKg?: string;                // Layout A — CO₂: controle de pesagem
  subType?: string;

  // Datas normativas
  lastMaintenanceDate?: string;     // "DD/MM/YYYY" — data da última manutenção
  expirationDate: string;           // "DD/MM/YYYY" — vencimento calculado ou fornecido
  lastHydrostaticTest?: string;     // Layout A/C — último teste hidrostático
  nextHydrostaticTest?: string;     // Layout A/C — próximo teste hidrostático (5 anos)

  // Layout D — Casa de Bombas
  riskLevel?: string;               // R1 a R5
  lastFunctionalTest?: string;      // data do último acionamento das bombas
  nextMonthlyInspection?: string;   // data da próxima visita mensal

  // Autenticidade (obrigatórios)
  auditHash: string;                // SHA-256 (obrigatório)
  reportSlug: string;               // para QR Code (obrigatório)

  // Responsabilidade
  lastMaintenanceProvider?: string; // se ≠ "CO2 Contra Incêndio" → disclaimer
  technicianName?: string;          // nome do técnico (Layout C)

  // Layout interno (determinado automaticamente se não fornecido)
  layout?: LabelLayout;
}

// ─── Helpers de encoding ──────────────────────────────────────────────────────
function textToBytes(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

function buildBuffer(...parts: Array<number[] | Uint8Array>): Uint8Array {
  const total = parts.reduce((acc, p) => acc + p.length, 0);
  const buf = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) {
    buf.set(p, offset);
    offset += p.length;
  }
  return buf;
}

function centerText(text: string, cols: number): string {
  const pad = Math.max(0, Math.floor((cols - text.length) / 2));
  return " ".repeat(pad) + text;
}

function divider(cols: number, char = "─"): string {
  return char.repeat(cols);
}

function truncate(text: string, maxLen: number): string {
  return text.length > maxLen ? text.slice(0, maxLen - 1) + "…" : text;
}

/**
 * Gera QR Code nativo ESC/POS via comando GS ( k.
 * Compatível com Epson, Bixolon, Sewoo e impressoras genéricas com firmware QR.
 * Fallback automático: se a impressora não suportar, imprime o URL em texto.
 */
function buildQrCode(url: string, cols: number): Array<number[] | Uint8Array> {
  const parts: Array<number[] | Uint8Array> = [];
  const data = new TextEncoder().encode(url);
  const pL = (data.length + 3) & 0xff;
  const pH = ((data.length + 3) >> 8) & 0xff;

  parts.push(
    // QR Code model 2
    [GS, 0x28, 0x6b, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00],
    // QR Code size (módulo 4)
    [GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, 0x04],
    // QR Code error correction level M
    [GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, 0x31],
    // QR Code data
    [GS, 0x28, 0x6b, pL, pH, 0x31, 0x50, 0x30],
    data,
    // QR Code print
    [GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x51, 0x30],
  );

  // Fallback texto abaixo do QR
  parts.push(
    CMD.ALIGN_CENTER,
    textToBytes(truncate(url, cols) + "\n")
  );

  return parts;
}

// ─── Cabeçalho comum ──────────────────────────────────────────────────────────
function buildHeader(
  cols: number,
  layout: LabelLayout,
  normLabel: string
): Array<number[] | Uint8Array> {
  const parts: Array<number[] | Uint8Array> = [];
  const add = (...cmds: Array<number[] | Uint8Array>) => parts.push(...cmds);
  const line = (text: string) => add(textToBytes(text + "\n"));

  add(CMD.INIT, CMD.ALIGN_CENTER, CMD.BOLD_ON, CMD.DOUBLE_BOTH);
  line("CO2 CONTRA INCENDIO");
  add(CMD.NORMAL_SIZE, CMD.BOLD_OFF);
  line(centerText("CNPJ: 29.905.123/0001-53", cols));
  line(centerText("Belo Horizonte / MG", cols));
  add(CMD.BOLD_ON);
  line(centerText(`MODELO ${layout} — ${normLabel}`, cols));
  add(CMD.BOLD_OFF, CMD.ALIGN_LEFT);
  line(divider(cols, "="));

  return parts;
}

// ─── Rodapé comum ─────────────────────────────────────────────────────────────
function buildFooter(
  data: LabelData,
  cols: number
): Array<number[] | Uint8Array> {
  const parts: Array<number[] | Uint8Array> = [];
  const add = (...cmds: Array<number[] | Uint8Array>) => parts.push(...cmds);
  const line = (text: string) => add(textToBytes(text + "\n"));
  const blank = () => add(CMD.FEED_LINE);

  // ─── Disclaimer de auditoria para terceiros ──────────────────────────────
  const provider = (data.lastMaintenanceProvider ?? "").toLowerCase();
  const isThirdParty =
    provider !== "" &&
    !provider.includes("co2 contra incendio") &&
    !provider.includes("co2contraincendio");

  if (isThirdParty) {
    add(CMD.ALIGN_LEFT);
    line(divider(cols, "*"));
    add(CMD.BOLD_ON);
    line("DOCUMENTACAO DE AUDITORIA");
    add(CMD.BOLD_OFF);
    line(truncate("A CO2 Contra Incendio documentou o", cols));
    line(truncate("estado visual do equipamento e nao", cols));
    line(truncate("assume responsabilidade pela execucao", cols));
    line(truncate("do servico realizado por terceiros.", cols));
    line(truncate(`Executor: ${data.lastMaintenanceProvider}`, cols));
    line(divider(cols, "*"));
    blank();
  }

  // ─── auditHash (obrigatório) ─────────────────────────────────────────────
  line(divider(cols, "-"));
  add(CMD.BOLD_ON);
  line("AUTENTICIDADE SHA-256:");
  add(CMD.BOLD_OFF);
  line(truncate(`  ${data.auditHash.slice(0, 16)}...`, cols));
  blank();

  // ─── QR Code (obrigatório) ───────────────────────────────────────────────
  const qrUrl = `${window.location.origin}/equipamento/${data.reportSlug}`;
  add(CMD.ALIGN_CENTER);
  line(centerText("VALIDAR AUTENTICIDADE:", cols));
  const qrParts = buildQrCode(qrUrl, cols);
  parts.push(...qrParts);
  blank();

  // ─── Responsável técnico ─────────────────────────────────────────────────
  add(CMD.ALIGN_CENTER);
  line(divider(cols, "="));
  line(centerText("Eng. Judson Aleixo Sampaio", cols));
  line(centerText("CREA/MG 142203671-5", cols));
  line(centerText("UL Listed | NBR | NFPA", cols));
  line(centerText(new Date().toLocaleDateString("pt-BR"), cols));
  blank();

  add(CMD.FEED_3, CMD.CUT);
  return parts;
}

// ─── Layout A: Extintor de Incêndio (NBR 12962) ───────────────────────────────
function buildLayoutA(data: LabelData, cols: number): Uint8Array {
  const parts: Array<number[] | Uint8Array> = [];
  const add = (...cmds: Array<number[] | Uint8Array>) => parts.push(...cmds);
  const line = (text: string) => add(textToBytes(text + "\n"));
  const blank = () => add(CMD.FEED_LINE);

  parts.push(...buildHeader(cols, "A", "EXTINTOR — NBR 12962"));

  // Dados do casco
  add(CMD.BOLD_ON); line("EQUIPAMENTO / PATRIMONIO:"); add(CMD.BOLD_OFF);
  line(truncate(`  ${data.equipmentCode}${data.patrimonyTag ? " / " + data.patrimonyTag : ""}`, cols));
  blank();

  if (data.agentType) {
    add(CMD.BOLD_ON); line("AGENTE EXTINTOR:"); add(CMD.BOLD_OFF);
    line(truncate(`  ${data.agentType}${data.capacity ? " — " + data.capacity : ""}`, cols));
    blank();
  }

  if (data.serialNumber) {
    add(CMD.BOLD_ON); line("No CILINDRO:"); add(CMD.BOLD_OFF);
    line(truncate(`  ${data.serialNumber}`, cols));
    blank();
  }

  add(CMD.BOLD_ON); line("LOCAL:"); add(CMD.BOLD_OFF);
  line(truncate(`  ${data.location}`, cols));
  blank();

  add(CMD.BOLD_ON); line("EMPRESA:"); add(CMD.BOLD_OFF);
  line(truncate(`  ${data.company}`, cols));
  blank();

  // Datas de controle — destaque
  line(divider(cols, "-"));
  if (data.lastMaintenanceDate) {
    add(CMD.BOLD_ON); line("ULTIMA RECARGA:"); add(CMD.BOLD_OFF);
    line(truncate(`  ${data.lastMaintenanceDate}`, cols));
  }
  add(CMD.ALIGN_CENTER, CMD.DOUBLE_HEIGHT, CMD.BOLD_ON);
  line("VENCIMENTO DA RECARGA:");
  add(CMD.DOUBLE_BOTH);
  line(data.expirationDate);
  add(CMD.NORMAL_SIZE, CMD.BOLD_OFF, CMD.ALIGN_LEFT);
  blank();

  if (data.lastHydrostaticTest) {
    add(CMD.BOLD_ON); line("ULT. TESTE HIDROSTATICO:"); add(CMD.BOLD_OFF);
    line(truncate(`  ${data.lastHydrostaticTest}`, cols));
  }
  if (data.nextHydrostaticTest) {
    add(CMD.BOLD_ON); line("PROX. TESTE HIDROSTATICO:"); add(CMD.BOLD_OFF);
    line(truncate(`  ${data.nextHydrostaticTest}`, cols));
  }
  if (data.lastHydrostaticTest || data.nextHydrostaticTest) blank();

  // Controle de pesagem CO₂
  if (data.weightKg) {
    line(divider(cols, "-"));
    add(CMD.BOLD_ON); line("CONTROLE DE PESAGEM (CO2):"); add(CMD.BOLD_OFF);
    line(truncate(`  Massa atual: ${data.weightKg} kg`, cols));
    line(truncate(`  Limite perda: 10% da carga`, cols));
    blank();
  }

  parts.push(...buildFooter(data, cols));
  return buildBuffer(...parts);
}

// ─── Layout B: Extintor Classe K / Saponificante (NFPA 10 / UL-300) ──────────
function buildLayoutB(data: LabelData, cols: number): Uint8Array {
  const parts: Array<number[] | Uint8Array> = [];
  const add = (...cmds: Array<number[] | Uint8Array>) => parts.push(...cmds);
  const line = (text: string) => add(textToBytes(text + "\n"));
  const blank = () => add(CMD.FEED_LINE);

  parts.push(...buildHeader(cols, "B", "CLASSE K — NFPA 10 / UL-300"));

  // Destaque técnico obrigatório
  add(CMD.ALIGN_CENTER, CMD.BOLD_ON, CMD.DOUBLE_BOTH);
  line("AGENTE SAPONIFICANTE");
  add(CMD.NORMAL_SIZE, CMD.BOLD_OFF, CMD.ALIGN_LEFT);
  add(CMD.ALIGN_CENTER, CMD.BOLD_ON);
  line(centerText("VALIDADE: 5 ANOS", cols));
  add(CMD.BOLD_OFF, CMD.ALIGN_LEFT);
  blank();

  // Dados do equipamento
  add(CMD.BOLD_ON); line("EQUIPAMENTO:"); add(CMD.BOLD_OFF);
  line(truncate(`  ${data.equipmentCode}`, cols));
  blank();

  if (data.capacity) {
    add(CMD.BOLD_ON); line("CAPACIDADE:"); add(CMD.BOLD_OFF);
    line(truncate(`  ${data.capacity}`, cols));
    blank();
  }

  add(CMD.BOLD_ON); line("LOCAL:"); add(CMD.BOLD_OFF);
  line(truncate(`  ${data.location}`, cols));
  blank();

  add(CMD.BOLD_ON); line("EMPRESA:"); add(CMD.BOLD_OFF);
  line(truncate(`  ${data.company}`, cols));
  blank();

  // Identificação do engenheiro
  line(divider(cols, "-"));
  add(CMD.BOLD_ON); line("ENGENHEIRO RESPONSAVEL:"); add(CMD.BOLD_OFF);
  line(truncate("  Eng. Judson Aleixo Sampaio", cols));
  line(truncate("  CREA/MG 142203671-5", cols));
  blank();

  // Grade de validade
  line(divider(cols, "-"));
  if (data.lastMaintenanceDate) {
    add(CMD.BOLD_ON); line("MES/ANO DA MANUTENCAO:"); add(CMD.BOLD_OFF);
    line(truncate(`  ${data.lastMaintenanceDate}`, cols));
  }
  add(CMD.ALIGN_CENTER, CMD.DOUBLE_HEIGHT, CMD.BOLD_ON);
  line("PROXIMO VENCIMENTO:");
  add(CMD.DOUBLE_BOTH);
  line(data.expirationDate);
  add(CMD.NORMAL_SIZE, CMD.BOLD_OFF, CMD.ALIGN_LEFT);
  blank();

  // Termos de garantia
  line(divider(cols, "-"));
  add(CMD.BOLD_ON); line("TERMOS DE GARANTIA:"); add(CMD.BOLD_OFF);
  line(truncate("O uso incorreto, violacao do lacre ou", cols));
  line(truncate("manutencao por nao autorizado suspende", cols));
  line(truncate("a garantia e validade deste selo.", cols));
  blank();

  parts.push(...buildFooter(data, cols));
  return buildBuffer(...parts);
}

// ─── Layout C: Mangueiras de Incêndio (NBR 12779) ────────────────────────────
function buildLayoutC(data: LabelData, cols: number): Uint8Array {
  const parts: Array<number[] | Uint8Array> = [];
  const add = (...cmds: Array<number[] | Uint8Array>) => parts.push(...cmds);
  const line = (text: string) => add(textToBytes(text + "\n"));
  const blank = () => add(CMD.FEED_LINE);

  parts.push(...buildHeader(cols, "C", "MANGUEIRAS — NBR 12779"));

  // Identificação
  add(CMD.BOLD_ON); line("EQUIPAMENTO:"); add(CMD.BOLD_OFF);
  line(truncate(`  ${data.equipmentCode}`, cols));
  blank();

  if (data.subType) {
    add(CMD.BOLD_ON); line("TIPO:"); add(CMD.BOLD_OFF);
    line(truncate(`  ${data.subType}`, cols));
    blank();
  }

  if (data.capacity) {
    add(CMD.BOLD_ON); line("COMPRIMENTO:"); add(CMD.BOLD_OFF);
    line(truncate(`  ${data.capacity}`, cols));
    blank();
  }

  add(CMD.BOLD_ON); line("LOCAL:"); add(CMD.BOLD_OFF);
  line(truncate(`  ${data.location}`, cols));
  blank();

  add(CMD.BOLD_ON); line("EMPRESA:"); add(CMD.BOLD_OFF);
  line(truncate(`  ${data.company}`, cols));
  blank();

  // Histórico hidrostático
  line(divider(cols, "-"));
  add(CMD.BOLD_ON); line("HISTORICO HIDROSTATICO:"); add(CMD.BOLD_OFF);

  if (data.lastHydrostaticTest) {
    line(truncate(`  Ult. Teste: ${data.lastHydrostaticTest}`, cols));
  }
  if (data.nextHydrostaticTest) {
    line(truncate(`  Prox. Teste: ${data.nextHydrostaticTest}`, cols));
  }
  blank();

  add(CMD.ALIGN_CENTER, CMD.DOUBLE_HEIGHT, CMD.BOLD_ON);
  line("VENCIMENTO:");
  add(CMD.DOUBLE_BOTH);
  line(data.expirationDate);
  add(CMD.NORMAL_SIZE, CMD.BOLD_OFF, CMD.ALIGN_LEFT);
  blank();

  // Responsável pelo ensaio
  if (data.technicianName) {
    line(divider(cols, "-"));
    add(CMD.BOLD_ON); line("TECNICO RESPONSAVEL:"); add(CMD.BOLD_OFF);
    line(truncate(`  ${data.technicianName}`, cols));
    blank();
  }

  parts.push(...buildFooter(data, cols));
  return buildBuffer(...parts);
}

// ─── Layout D: Casa de Bombas / Sistemas Fixos ────────────────────────────────
function buildLayoutD(data: LabelData, cols: number): Uint8Array {
  const parts: Array<number[] | Uint8Array> = [];
  const add = (...cmds: Array<number[] | Uint8Array>) => parts.push(...cmds);
  const line = (text: string) => add(textToBytes(text + "\n"));
  const blank = () => add(CMD.FEED_LINE);

  parts.push(...buildHeader(cols, "D", "CASA DE BOMBAS / SISTEMA FIXO"));

  // Identificação
  add(CMD.BOLD_ON); line("EQUIPAMENTO:"); add(CMD.BOLD_OFF);
  line(truncate(`  ${data.equipmentCode}`, cols));
  blank();

  add(CMD.BOLD_ON); line("LOCAL:"); add(CMD.BOLD_OFF);
  line(truncate(`  ${data.location}`, cols));
  blank();

  add(CMD.BOLD_ON); line("EMPRESA:"); add(CMD.BOLD_OFF);
  line(truncate(`  ${data.company}`, cols));
  blank();

  // Status de operação R1–R5
  line(divider(cols, "-"));
  if (data.riskLevel) {
    add(CMD.ALIGN_CENTER, CMD.BOLD_ON, CMD.DOUBLE_BOTH);
    line(`RISCO: ${data.riskLevel}`);
    add(CMD.NORMAL_SIZE, CMD.BOLD_OFF, CMD.ALIGN_LEFT);
    blank();
  }

  // Logbook de operação
  if (data.lastFunctionalTest) {
    add(CMD.BOLD_ON); line("ULT. TESTE FUNCIONAL:"); add(CMD.BOLD_OFF);
    line(truncate(`  ${data.lastFunctionalTest}`, cols));
    blank();
  }

  if (data.lastMaintenanceDate) {
    add(CMD.BOLD_ON); line("ULTIMA INSPECAO:"); add(CMD.BOLD_OFF);
    line(truncate(`  ${data.lastMaintenanceDate}`, cols));
    blank();
  }

  add(CMD.ALIGN_CENTER, CMD.DOUBLE_HEIGHT, CMD.BOLD_ON);
  line("PROX. INSPECAO:");
  add(CMD.DOUBLE_BOTH);
  line(data.nextMonthlyInspection ?? data.expirationDate);
  add(CMD.NORMAL_SIZE, CMD.BOLD_OFF, CMD.ALIGN_LEFT);
  blank();

  parts.push(...buildFooter(data, cols));
  return buildBuffer(...parts);
}

// ─── Dispatcher de layout ─────────────────────────────────────────────────────
function buildLabelContent(data: LabelData, cols: number): Uint8Array {
  const layout = data.layout ?? "A";
  switch (layout) {
    case "B": return buildLayoutB(data, cols);
    case "C": return buildLayoutC(data, cols);
    case "D": return buildLayoutD(data, cols);
    default:  return buildLayoutA(data, cols);
  }
}

// ─── Classe principal do driver ───────────────────────────────────────────────
export class BluetoothPrinter {
  private device: BluetoothDevice | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private profile: PrinterProfile;

  constructor(profile: PrinterProfile = "generic_58mm") {
    this.profile = profile;
  }

  get isConnected(): boolean {
    return !!this.device?.gatt?.connected;
  }

  get connectedName(): string | null {
    return this.device?.name ?? null;
  }

  async connect(): Promise<string> {
    if (!navigator.bluetooth) {
      throw new Error(
        "Web Bluetooth não disponível neste navegador. Use Chrome ou Edge em HTTPS."
      );
    }
    const config = PRINTER_PROFILES[this.profile];
    this.device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [config.serviceUuid] }],
      optionalServices: [config.serviceUuid],
    });
    const server = await this.device.gatt!.connect();
    const service = await server.getPrimaryService(config.serviceUuid);
    this.characteristic = await service.getCharacteristic(config.characteristicUuid);
    const name = this.device.name ?? "Impressora Bluetooth";
    savePrinter(this.profile, name);
    return name;
  }

  async disconnect(): Promise<void> {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    this.device = null;
    this.characteristic = null;
  }

  async printLabel(data: LabelData): Promise<void> {
    if (!this.characteristic) {
      throw new Error("Impressora não conectada. Conecte primeiro.");
    }
    const config = PRINTER_PROFILES[this.profile];
    const content = buildLabelContent(data, config.columns);

    // Enviar em chunks de 512 bytes (limite BLE MTU padrão)
    const CHUNK = 512;
    for (let i = 0; i < content.length; i += CHUNK) {
      const chunk = content.slice(i, i + CHUNK);
      await this.characteristic.writeValue(chunk);
      await new Promise<void>((r) => setTimeout(r, 50));
    }
  }

  static getProfiles(): Array<{ id: PrinterProfile; name: string; columns: number }> {
    return Object.entries(PRINTER_PROFILES).map(([id, cfg]) => ({
      id: id as PrinterProfile,
      name: cfg.name,
      columns: cfg.columns,
    }));
  }
}
