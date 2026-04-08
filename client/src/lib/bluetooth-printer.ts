/**
 * bluetooth-printer.ts
 * Serviço de impressão Bluetooth ESC/POS para OPERIS Field Module.
 * Suporta 3 perfis: Zebra/Leopardo, Generic 58mm, Epson Mobile.
 * Usa Web Bluetooth API (disponível em Chrome/Edge em HTTPS).
 */

// ─── Constantes ESC/POS ───────────────────────────────────────────────────────
const ESC = 0x1b;
const GS  = 0x1d;

const CMD = {
  INIT:           [ESC, 0x40],
  ALIGN_LEFT:     [ESC, 0x61, 0x00],
  ALIGN_CENTER:   [ESC, 0x61, 0x01],
  ALIGN_RIGHT:    [ESC, 0x61, 0x02],
  BOLD_ON:        [ESC, 0x45, 0x01],
  BOLD_OFF:       [ESC, 0x45, 0x00],
  DOUBLE_HEIGHT:  [GS,  0x21, 0x01],  // double height
  DOUBLE_WIDTH:   [GS,  0x21, 0x10],  // double width
  DOUBLE_BOTH:    [GS,  0x21, 0x11],  // double height + width
  NORMAL_SIZE:    [GS,  0x21, 0x00],
  UNDERLINE_ON:   [ESC, 0x2d, 0x01],
  UNDERLINE_OFF:  [ESC, 0x2d, 0x00],
  CUT:            [GS,  0x56, 0x42, 0x00],
  FEED_LINE:      [0x0a],
  FEED_3:         [ESC, 0x64, 0x03],
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

// ─── Persistência do deviceId ─────────────────────────────────────────────────
const STORAGE_KEY = "operis_bt_printer";

export interface SavedPrinter {
  profile: PrinterProfile;
  name: string;
  savedAt: string;
}

export function getSavedPrinter(): SavedPrinter | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function savePrinter(profile: PrinterProfile, name: string): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ profile, name, savedAt: new Date().toISOString() }));
}

export function clearSavedPrinter(): void {
  localStorage.removeItem(STORAGE_KEY);
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

// ─── Dados do selo ────────────────────────────────────────────────────────────
export interface LabelData {
  equipmentId: string;
  equipmentCode: string;
  location: string;
  company: string;
  expirationDate: string;   // "DD/MM/YYYY"
  reportSlug?: string;      // para QR Code público
  auditHash?: string;       // SHA-256 (primeiros 16 chars)
  maintenanceType?: string;
}

// ─── Gerador de conteúdo do selo ─────────────────────────────────────────────
function buildLabelContent(data: LabelData, cols: number): Uint8Array {
  const parts: Array<number[] | Uint8Array> = [];

  const add = (...cmds: Array<number[] | Uint8Array>) => parts.push(...cmds);
  const line = (text: string) => add(textToBytes(text + "\n"));
  const blank = () => add(CMD.FEED_LINE);

  // INIT
  add(CMD.INIT);

  // ─── Cabeçalho: Logo CO2 (texto) ────────────────────────────────────────
  add(CMD.ALIGN_CENTER, CMD.BOLD_ON, CMD.DOUBLE_BOTH);
  line("CO2 CONTRA INCENDIO");
  add(CMD.NORMAL_SIZE, CMD.BOLD_OFF);
  add(CMD.ALIGN_CENTER);
  line(centerText("Sistemas de Supressao", cols));
  blank();

  // ─── Divider ────────────────────────────────────────────────────────────
  add(CMD.ALIGN_LEFT);
  line(divider(cols, "="));

  // ─── Dados do equipamento ────────────────────────────────────────────────
  add(CMD.BOLD_ON);
  line("EQUIPAMENTO:");
  add(CMD.BOLD_OFF);
  line(truncate(`  ${data.equipmentCode}`, cols));
  blank();

  add(CMD.BOLD_ON);
  line("LOCAL:");
  add(CMD.BOLD_OFF);
  line(truncate(`  ${data.location}`, cols));
  blank();

  add(CMD.BOLD_ON);
  line("EMPRESA:");
  add(CMD.BOLD_OFF);
  line(truncate(`  ${data.company}`, cols));
  blank();

  // ─── Data de vencimento em destaque ─────────────────────────────────────
  add(CMD.ALIGN_CENTER, CMD.DOUBLE_HEIGHT, CMD.BOLD_ON);
  line("VALIDADE:");
  add(CMD.DOUBLE_BOTH);
  line(data.expirationDate);
  add(CMD.NORMAL_SIZE, CMD.BOLD_OFF, CMD.ALIGN_LEFT);
  blank();

  // ─── QR Code (texto de fallback — impressoras sem QR nativo) ────────────
  if (data.reportSlug) {
    add(CMD.ALIGN_CENTER);
    line(divider(cols, "-"));
    line(centerText("VERIFICAR AUTENTICIDADE:", cols));
    const url = `${window.location.origin}/equipamento/${data.reportSlug}`;
    // Impressoras com suporte a QR Code nativo (GS ( k)
    // Para compatibilidade máxima, imprimimos o URL em texto pequeno
    line(truncate(url, cols));
    line(divider(cols, "-"));
    blank();
  }

  // ─── Hash SHA-256 ────────────────────────────────────────────────────────
  if (data.auditHash) {
    add(CMD.ALIGN_LEFT);
    add(CMD.BOLD_ON);
    line("AUTENTICADO VIA SHA-256:");
    add(CMD.BOLD_OFF);
    line(truncate(`  ${data.auditHash.slice(0, 16)}...`, cols));
    blank();
  }

  // ─── Rodapé ──────────────────────────────────────────────────────────────
  add(CMD.ALIGN_CENTER);
  line(divider(cols, "="));
  line(centerText("Eng. Judson Aleixo Sampaio", cols));
  line(centerText("CREA/MG 142203671-5", cols));
  line(centerText(new Date().toLocaleDateString("pt-BR"), cols));
  blank();

  // Corte
  add(CMD.FEED_3, CMD.CUT);

  return buildBuffer(...parts);
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
      throw new Error("Web Bluetooth não disponível neste navegador. Use Chrome ou Edge.");
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

    // Enviar em chunks de 512 bytes (limite BLE)
    const CHUNK = 512;
    for (let i = 0; i < content.length; i += CHUNK) {
      const chunk = content.slice(i, i + CHUNK);
      await this.characteristic.writeValue(chunk);
      // Pequeno delay entre chunks para não saturar o buffer
      await new Promise(r => setTimeout(r, 50));
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
