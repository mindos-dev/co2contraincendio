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

  // Se SMTP configurado, usa nodemailer diretamente
  if (transporter) {
    const from = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "noreply@co2contra.com";
    try {
      await transporter.sendMail({
        from: `"OPERIS IA | CO2 Contra Incêndio" <${from}>`,
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

  // Fallback: notifica o dono do projeto via e-mail (sem SMTP configurado)
  try {
    const forgeUrl = process.env.BUILT_IN_FORGE_API_URL;
    const forgeKey = process.env.BUILT_IN_FORGE_API_KEY;
    if (forgeUrl && forgeKey) {
      const endpoint = `${forgeUrl.replace(/\/$/, "")}/webdevtoken.v1.WebDevService/SendNotification`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${forgeKey}` },
        body: JSON.stringify({
          title: `📧 Laudo OPERIS — Enviar para ${to}`,
          content: `Destinatário: ${to}\nAssunto: ${subject}\n\n${text}\n\n⚠️ Configure SMTP_HOST, SMTP_USER e SMTP_PASS para envio automático.`,
        }),
      });
      if (res.ok) return { channel: "email", success: true };
    }
  } catch (_) { /* ignora */ }

  return { channel: "email", success: false, error: "SMTP não configurado. Configure SMTP_HOST, SMTP_USER e SMTP_PASS." };
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

// ─── Template: E-mail de boas-vindas OPERIS ───────────────────────────────────
export function buildWelcomeEmail(name: string): { subject: string; text: string; html: string } {
  const subject = "Bem-vindo ao OPERIS — Sua conta está ativa";
  const text = `Olá, ${name}.\n\nSua conta no OPERIS foi criada com sucesso.\n\nA plataforma permite controle completo de equipamentos, execução de checklists e emissão de laudos técnicos com rastreabilidade e padronização.\n\nAcesse: https://co2contra.com/app/login\n\nCO₂ Contra Incêndio — Engenharia e Automação`;
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F0F0F0;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F0F0;padding:40px 0;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

      <!-- Cabeçalho OPERIS -->
      <tr>
        <td style="background:#0D0D0D;padding:0;border-left:4px solid #C8102E;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:24px 28px;">
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background:#C8102E;padding:8px 12px;vertical-align:middle;">
                      <span style="color:#FFFFFF;font-weight:900;font-size:13px;letter-spacing:3px;font-family:'Helvetica Neue',Arial,sans-serif;">OP</span>
                    </td>
                    <td style="padding-left:12px;vertical-align:middle;">
                      <div style="color:#FFFFFF;font-weight:800;font-size:16px;letter-spacing:4px;line-height:1;">OPERIS</div>
                      <div style="color:#555555;font-size:8px;letter-spacing:3px;margin-top:3px;">PLATAFORMA DE INSPEÇÃO TÉCNICA</div>
                    </td>
                  </tr>
                </table>
              </td>
              <td align="right" style="padding:24px 28px;vertical-align:middle;">
                <span style="color:#333333;font-size:9px;letter-spacing:2px;">CO₂ CONTRA INCÊNDIO</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Faixa vermelha de acento -->
      <tr><td style="background:#C8102E;height:3px;line-height:3px;font-size:0;">&nbsp;</td></tr>

      <!-- Corpo principal -->
      <tr>
        <td style="background:#FFFFFF;padding:40px 36px;">

          <!-- Saudação -->
          <p style="margin:0 0 6px 0;color:#888888;font-size:10px;letter-spacing:3px;text-transform:uppercase;">Conta ativada</p>
          <h1 style="margin:0 0 24px 0;color:#111111;font-size:22px;font-weight:800;letter-spacing:1px;line-height:1.2;">
            Olá, ${name}.<br>Seu acesso está pronto.
          </h1>

          <!-- Linha divisória -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr>
              <td style="background:#C8102E;width:32px;height:2px;line-height:2px;font-size:0;">&nbsp;</td>
              <td style="background:#E8E8E8;height:2px;line-height:2px;font-size:0;">&nbsp;</td>
            </tr>
          </table>

          <!-- Texto institucional -->
          <p style="margin:0 0 16px 0;color:#444444;font-size:14px;line-height:1.7;">
            Sua conta no <strong>OPERIS</strong> foi criada com sucesso. A plataforma foi desenvolvida para atender operações reais de campo, permitindo controle completo de equipamentos, execução de checklists e emissão de laudos técnicos com rastreabilidade e padronização.
          </p>
          <p style="margin:0 0 32px 0;color:#444444;font-size:14px;line-height:1.7;">
            Todas as inspeções seguem critérios técnicos aplicados por profissionais qualificados, garantindo confiabilidade, conformidade normativa e segurança operacional em cada registro gerado.
          </p>

          <!-- O que está disponível -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;border:1px solid #EEEEEE;">
            <tr><td style="background:#F8F8F8;padding:12px 16px;border-bottom:1px solid #EEEEEE;">
              <span style="color:#888888;font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Recursos disponíveis</span>
            </td></tr>
            <tr><td style="padding:16px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${[
                  ["Ordens de Serviço", "Criação, acompanhamento e encerramento com timeline de estados"],
                  ["Checklists de campo", "Execução guiada com critérios C / NC / NA e barra de progresso"],
                  ["Laudos técnicos", "Emissão com rastreabilidade, assinatura e compartilhamento"],
                  ["Gestão de equipamentos", "QR Code, histórico de manutenções e alertas automáticos"],
                ].map(([titulo, desc]) => `
                <tr>
                  <td style="padding:6px 0;vertical-align:top;width:6px;">
                    <div style="width:4px;height:4px;background:#C8102E;margin-top:6px;"></div>
                  </td>
                  <td style="padding:6px 0 6px 10px;">
                    <strong style="color:#111111;font-size:13px;">${titulo}</strong>
                    <span style="color:#888888;font-size:12px;"> — ${desc}</span>
                  </td>
                </tr>`).join("")}
              </table>
            </td></tr>
          </table>

          <!-- CTA -->
          <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
            <tr>
              <td style="background:#C8102E;padding:0;">
                <a href="https://co2contra.com/app/login"
                   style="display:inline-block;padding:14px 32px;color:#FFFFFF;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:2px;text-transform:uppercase;">
                  ACESSAR O OPERIS →
                </a>
              </td>
            </tr>
          </table>

          <!-- Nota de suporte -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="border-left:3px solid #EEEEEE;padding:10px 14px;">
                <p style="margin:0;color:#AAAAAA;font-size:11px;line-height:1.6;">
                  Em caso de dúvidas, entre em contato pelo site
                  <a href="https://co2contra.com" style="color:#C8102E;text-decoration:none;">co2contra.com</a>
                  ou pelo WhatsApp <strong>(31) 9 9738-3115</strong>.
                </p>
              </td>
            </tr>
          </table>

        </td>
      </tr>

      <!-- Rodapé -->
      <tr>
        <td style="background:#0D0D0D;padding:20px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <span style="color:#444444;font-size:10px;letter-spacing:1px;">OPERIS IA · CO₂ CONTRA INCÊNDIO</span><br>
                <span style="color:#333333;font-size:10px;">Engenharia e Automação · Belo Horizonte, MG</span>
              </td>
              <td align="right" style="vertical-align:top;">
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    ${["NBR 12615", "NFPA 12", "UL 300"].map(n =>
                      `<td style="padding-left:6px;"><span style="border:1px solid #2A2A2A;color:#444444;font-size:8px;font-weight:700;letter-spacing:1px;padding:2px 5px;">${n}</span></td>`
                    ).join("")}
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <p style="margin:12px 0 0 0;color:#2A2A2A;font-size:10px;line-height:1.5;">
            Este e-mail foi enviado automaticamente após a criação da sua conta. Não responda a este endereço.
            Caso não tenha criado esta conta, entre em contato imediatamente.
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
  return { subject, text, html };
}

// ─── E-mail de Confirmação de OS ─────────────────────────────────────────────
export function buildOsEmail(opts: {
  name: string;
  osNumber: string;
  title: string;
  type: string;
  priority: string;
  status: "criada" | "concluida";
  scheduledDate?: string;
}): { subject: string; text: string; html: string } {
  const statusLabel = opts.status === "criada" ? "criada" : "concluída";
  const statusColor = opts.status === "criada" ? "#ef4444" : "#22c55e";
  const priorityMap: Record<string, string> = {
    baixa: "Baixa", media: "Média", alta: "Alta", critica: "Crítica",
  };
  const typeMap: Record<string, string> = {
    preventiva: "Preventiva", corretiva: "Corretiva", inspecao: "Inspeção",
    instalacao: "Instalação", desativacao: "Desativação",
  };
  const subject = `[OPERIS] OS #${opts.osNumber} ${statusLabel} — ${opts.title}`;
  const text = [
    "OPERIS — Plataforma de Inspeção Técnica",
    "",
    `Olá, ${opts.name}.`,
    "",
    `A Ordem de Serviço abaixo foi ${statusLabel}:`,
    "",
    `  OS Nº: ${opts.osNumber}`,
    `  Título: ${opts.title}`,
    `  Tipo: ${typeMap[opts.type] ?? opts.type}`,
    `  Prioridade: ${priorityMap[opts.priority] ?? opts.priority}`,
    opts.scheduledDate ? `  Data prevista: ${opts.scheduledDate}` : "",
    "",
    "Acesse o sistema para acompanhar o andamento:",
    "https://co2contra.com/app/os",
    "",
    "OPERIS — CO₂ Contra Incêndio",
    "NBR 12615 · NFPA 12 · UL 300",
  ].filter(Boolean).join("\n");

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
      <tr><td style="background:#0f172a;padding:28px 40px;">
        <table width="100%"><tr>
          <td><span style="font-size:22px;font-weight:700;color:#fff;letter-spacing:3px;">OPERIS</span><br>
          <span style="font-size:11px;color:#94a3b8;letter-spacing:1px;">PLATAFORMA DE INSPEÇÃO TÉCNICA</span></td>
          <td align="right"><span style="background:${statusColor};color:#fff;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:600;">OS ${statusLabel}</span></td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:36px 40px;">
        <p style="margin:0 0 8px;color:#64748b;font-size:14px;">Olá, <strong>${opts.name}</strong>.</p>
        <p style="margin:0 0 28px;color:#334155;font-size:15px;">A Ordem de Serviço abaixo foi <strong>${statusLabel}</strong>.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;margin-bottom:28px;">
          <tr><td style="padding:20px 24px;">
            <p style="margin:0 0 16px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Detalhes da OS</p>
            <table width="100%">
              <tr><td style="padding:6px 0;color:#64748b;font-size:13px;width:140px;">Número</td><td style="padding:6px 0;color:#0f172a;font-size:13px;font-weight:600;">#${opts.osNumber}</td></tr>
              <tr><td style="padding:6px 0;color:#64748b;font-size:13px;">Título</td><td style="padding:6px 0;color:#0f172a;font-size:13px;">${opts.title}</td></tr>
              <tr><td style="padding:6px 0;color:#64748b;font-size:13px;">Tipo</td><td style="padding:6px 0;color:#0f172a;font-size:13px;">${typeMap[opts.type] ?? opts.type}</td></tr>
              <tr><td style="padding:6px 0;color:#64748b;font-size:13px;">Prioridade</td><td style="padding:6px 0;color:#0f172a;font-size:13px;">${priorityMap[opts.priority] ?? opts.priority}</td></tr>
            </table>
          </td></tr>
        </table>
        <table width="100%"><tr><td align="center">
          <a href="https://co2contra.com/app/os" style="display:inline-block;background:#ef4444;color:#fff;text-decoration:none;padding:12px 32px;border-radius:6px;font-size:14px;font-weight:600;">Acessar o OPERIS</a>
        </td></tr></table>
      </td></tr>
      <tr><td style="background:#0f172a;padding:20px 40px;">
        <table width="100%"><tr>
          <td><span style="color:#94a3b8;font-size:11px;">OPERIS · CO₂ Contra Incêndio</span></td>
          <td align="right"><span style="color:#475569;font-size:10px;letter-spacing:1px;">NBR 12615 · NFPA 12 · UL 300</span></td>
        </tr></table>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  return { subject, text, html };
}
