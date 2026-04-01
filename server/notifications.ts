/**
 * notifications.ts
 * Módulo de notificações automáticas — WhatsApp (Evolution API) + E-mail (Nodemailer/SMTP)
 * Funciona com fallback gracioso: se as credenciais não estiverem configuradas,
 * registra o alerta no banco mas não tenta enviar.
 */

import nodemailer from "nodemailer";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface NotificationPayload {
  to: string;           // E-mail ou número WhatsApp (55319XXXXXXXX)
  subject?: string;     // Apenas para e-mail
  message: string;      // Corpo da mensagem (texto plano ou HTML)
  htmlMessage?: string; // HTML opcional para e-mail
}

export interface NotificationResult {
  channel: "email" | "whatsapp";
  success: boolean;
  error?: string;
}

// ─── WhatsApp via Evolution API ───────────────────────────────────────────────

export async function sendWhatsApp(phone: string, message: string): Promise<NotificationResult> {
  const apiUrl = process.env.EVOLUTION_API_URL;
  const apiKey = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE;

  if (!apiUrl || !apiKey || !instance) {
    return { channel: "whatsapp", success: false, error: "Evolution API não configurada (EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE)" };
  }

  // Normalizar número: remover +, espaços, traços; garantir código do país
  const normalized = phone.replace(/\D/g, "");
  const phoneNumber = normalized.startsWith("55") ? normalized : `55${normalized}`;

  try {
    const response = await fetch(`${apiUrl}/message/sendText/${instance}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": apiKey,
      },
      body: JSON.stringify({
        number: phoneNumber,
        text: message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { channel: "whatsapp", success: false, error: `HTTP ${response.status}: ${errorText}` };
    }

    return { channel: "whatsapp", success: true };
  } catch (err) {
    return { channel: "whatsapp", success: false, error: String(err) };
  }
}

// ─── E-mail via Nodemailer/SMTP ───────────────────────────────────────────────

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
}

export async function sendEmail(to: string, subject: string, text: string, html?: string): Promise<NotificationResult> {
  const transporter = createTransporter();
  if (!transporter) {
    return { channel: "email", success: false, error: "SMTP não configurado (SMTP_HOST, SMTP_USER, SMTP_PASS)" };
  }

  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "noreply@co2contra.com";

  try {
    await transporter.sendMail({
      from: `"CO2 Contra Incêndio" <${from}>`,
      to,
      subject,
      text,
      html: html ?? text,
    });
    return { channel: "email", success: true };
  } catch (err) {
    return { channel: "email", success: false, error: String(err) };
  }
}

// ─── Templates de mensagem ────────────────────────────────────────────────────

export function buildAlertMessage(
  type: "proximo_vencimento" | "vencido",
  equipment: { code: string; installationLocation?: string | null; nextMaintenanceDate?: Date | null },
  companyName?: string
): { text: string; html: string; subject: string } {
  const loc = equipment.installationLocation ?? "localização não informada";
  const date = equipment.nextMaintenanceDate
    ? new Date(equipment.nextMaintenanceDate).toLocaleDateString("pt-BR")
    : "data não informada";
  const company = companyName ? ` — ${companyName}` : "";

  if (type === "proximo_vencimento") {
    const subject = `⚠️ Equipamento próximo do vencimento: ${equipment.code}${company}`;
    const text = `CO2 CONTRA INCÊNDIO — ALERTA DE MANUTENÇÃO\n\nEquipamento: ${equipment.code}\nLocalização: ${loc}\nVencimento: ${date}\n\nEste equipamento está próximo da data de manutenção obrigatória.\nAcesse o sistema para agendar o serviço: https://co2contra.com/app/equipamentos\n\nEng. Judson Aleixo Sampaio | CREA 142203671-5`;
    const html = `
      <div style="font-family:'Inter',sans-serif;max-width:600px;margin:0 auto;background:#fff;border-top:4px solid #D97706;">
        <div style="background:#111;padding:20px 24px;">
          <div style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:20px;color:#fff;letter-spacing:0.06em;">CO2 CONTRA INCÊNDIO</div>
          <div style="font-size:11px;color:#8A8A8A;margin-top:4px;">ALERTA AUTOMÁTICO DE MANUTENÇÃO</div>
        </div>
        <div style="padding:24px;background:#FFFBEB;border-bottom:2px solid #D97706;">
          <div style="font-size:16px;font-weight:700;color:#D97706;">⚠️ EQUIPAMENTO PRÓXIMO DO VENCIMENTO</div>
        </div>
        <div style="padding:24px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;font-size:12px;color:#8A8A8A;font-weight:700;letter-spacing:0.06em;">CÓDIGO</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#111;">${equipment.code}</td></tr>
            <tr><td style="padding:8px 0;font-size:12px;color:#8A8A8A;font-weight:700;letter-spacing:0.06em;">LOCALIZAÇÃO</td><td style="padding:8px 0;font-size:14px;color:#111;">${loc}</td></tr>
            <tr><td style="padding:8px 0;font-size:12px;color:#8A8A8A;font-weight:700;letter-spacing:0.06em;">VENCIMENTO</td><td style="padding:8px 0;font-size:14px;font-weight:700;color:#D97706;">${date}</td></tr>
          </table>
          <div style="margin-top:20px;">
            <a href="https://co2contra.com/app/equipamentos" style="background:#111;color:#fff;padding:12px 24px;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:0.04em;display:inline-block;">AGENDAR MANUTENÇÃO →</a>
          </div>
        </div>
        <div style="padding:16px 24px;background:#F8F8F8;border-top:1px solid #E8E8E8;font-size:11px;color:#8A8A8A;">
          Eng. Judson Aleixo Sampaio | CREA 142203671-5 | (31) 99738-3115 | co2contraincendio@gmail.com
        </div>
      </div>`;
    return { text, html, subject };
  } else {
    const subject = `🚨 EQUIPAMENTO VENCIDO: ${equipment.code}${company}`;
    const text = `CO2 CONTRA INCÊNDIO — ALERTA CRÍTICO\n\nEquipamento: ${equipment.code}\nLocalização: ${loc}\nVencimento: ${date} (VENCIDO)\n\nEste equipamento está FORA DO PRAZO de manutenção obrigatória.\nAção imediata necessária!\n\nAcesse: https://co2contra.com/app/equipamentos\n\nEng. Judson Aleixo Sampaio | CREA 142203671-5`;
    const html = `
      <div style="font-family:'Inter',sans-serif;max-width:600px;margin:0 auto;background:#fff;border-top:4px solid #C8102E;">
        <div style="background:#111;padding:20px 24px;">
          <div style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:20px;color:#fff;letter-spacing:0.06em;">CO2 CONTRA INCÊNDIO</div>
          <div style="font-size:11px;color:#8A8A8A;margin-top:4px;">ALERTA CRÍTICO — AÇÃO IMEDIATA NECESSÁRIA</div>
        </div>
        <div style="padding:24px;background:#FFF5F5;border-bottom:2px solid #C8102E;">
          <div style="font-size:16px;font-weight:700;color:#C8102E;">🚨 EQUIPAMENTO VENCIDO — FORA DO PRAZO</div>
        </div>
        <div style="padding:24px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;font-size:12px;color:#8A8A8A;font-weight:700;letter-spacing:0.06em;">CÓDIGO</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#111;">${equipment.code}</td></tr>
            <tr><td style="padding:8px 0;font-size:12px;color:#8A8A8A;font-weight:700;letter-spacing:0.06em;">LOCALIZAÇÃO</td><td style="padding:8px 0;font-size:14px;color:#111;">${loc}</td></tr>
            <tr><td style="padding:8px 0;font-size:12px;color:#8A8A8A;font-weight:700;letter-spacing:0.06em;">VENCIMENTO</td><td style="padding:8px 0;font-size:14px;font-weight:700;color:#C8102E;">${date} ⚠️ VENCIDO</td></tr>
          </table>
          <div style="margin-top:20px;">
            <a href="https://co2contra.com/app/equipamentos" style="background:#C8102E;color:#fff;padding:12px 24px;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:0.04em;display:inline-block;">RESOLVER AGORA →</a>
          </div>
        </div>
        <div style="padding:16px 24px;background:#F8F8F8;border-top:1px solid #E8E8E8;font-size:11px;color:#8A8A8A;">
          Eng. Judson Aleixo Sampaio | CREA 142203671-5 | (31) 99738-3115 | co2contraincendio@gmail.com
        </div>
      </div>`;
    return { text, html, subject };
  }
}

// ─── Envio combinado (WhatsApp + E-mail) ──────────────────────────────────────

export async function sendAlertNotification(opts: {
  whatsappPhone?: string | null;
  email?: string | null;
  type: "proximo_vencimento" | "vencido";
  equipment: { code: string; installationLocation?: string | null; nextMaintenanceDate?: Date | null };
  companyName?: string;
}): Promise<NotificationResult[]> {
  const { text, html, subject } = buildAlertMessage(opts.type, opts.equipment, opts.companyName);
  const results: NotificationResult[] = [];

  if (opts.whatsappPhone) {
    const r = await sendWhatsApp(opts.whatsappPhone, text);
    results.push(r);
    if (!r.success) console.warn(`[Notify] WhatsApp falhou para ${opts.whatsappPhone}: ${r.error}`);
    else console.log(`[Notify] WhatsApp enviado para ${opts.whatsappPhone}`);
  }

  if (opts.email) {
    const r = await sendEmail(opts.email, subject, text, html);
    results.push(r);
    if (!r.success) console.warn(`[Notify] E-mail falhou para ${opts.email}: ${r.error}`);
    else console.log(`[Notify] E-mail enviado para ${opts.email}`);
  }

  return results;
}
