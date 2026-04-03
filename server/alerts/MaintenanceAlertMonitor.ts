/**
 * MaintenanceAlertMonitor
 * Verifica equipamentos com manutenção próxima do vencimento (30, 15, 7 dias)
 * ou já vencida, e envia alertas por e-mail + notificação Manus Forge.
 *
 * Debounce: 1 alerta por equipamento por tipo por dia (evita spam).
 */

import { getDb } from "../db";
import { equipment, alertEvents, notificationSettings } from "../../drizzle/schema";
import { and, eq, gte, isNotNull } from "drizzle-orm";
import { sendEmail } from "../notifications";
import { notifyOwner } from "../_core/notification";

// Limiares em dias
const THRESHOLDS = [
  { days: 30, alertType: "proximo_vencimento" as const, label: "30 dias" },
  { days: 15, alertType: "proximo_vencimento" as const, label: "15 dias" },
  { days: 7,  alertType: "proximo_vencimento" as const, label: "7 dias" },
];

function daysFromNow(dateStr: string | Date | null): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86_400_000);
}

export class MaintenanceAlertMonitor {
  // Debounce: chave = `${equipmentId}-${alertType}-${daysLabel}`
  private sentToday = new Set<string>();

  async run(): Promise<number> {
    const db = await getDb();
    if (!db) return 0;
    let alertsSent = 0;

    // Buscar todos os equipamentos com nextMaintenanceDate definido
    const equipmentList = await db
      .select()
      .from(equipment)
      .where(isNotNull(equipment.nextMaintenanceDate));

    for (const eq_ of equipmentList) {
      const days = daysFromNow(eq_.nextMaintenanceDate);
      if (days === null) continue;

      // Vencido
      if (days < 0) {
        const sent = await this.sendAlert(eq_, "vencido", days);
        if (sent) alertsSent++;
        continue;
      }

      // Próximo do vencimento — verificar cada limiar
      for (const threshold of THRESHOLDS) {
        if (days <= threshold.days) {
          const sent = await this.sendAlert(eq_, "proximo_vencimento", days, threshold.label);
          if (sent) alertsSent++;
          break; // Enviar apenas o alerta mais urgente
        }
      }
    }

    return alertsSent;
  }

  private async sendAlert(
    eq_: typeof equipment.$inferSelect,
    alertType: "proximo_vencimento" | "vencido" | "sem_manutencao",
    days: number,
    label?: string
  ): Promise<boolean> {
    const debounceKey = `${eq_.id}-${alertType}-${label ?? "overdue"}`;
    if (this.sentToday.has(debounceKey)) return false;

    const db = await getDb();
    if (!db) return false;

    // Verificar se já enviamos este alerta hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existing = await db
      .select({ id: alertEvents.id })
      .from(alertEvents)
      .where(
        and(
          eq(alertEvents.equipmentId, eq_.id),
          eq(alertEvents.alertType, alertType),
          gte(alertEvents.sentAt, today)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      this.sentToday.add(debounceKey);
      return false;
    }

    // Montar mensagem
    const isOverdue = days < 0;
    const urgency = isOverdue ? "VENCIDO" : `Vence em ${label}`;
    const message = isOverdue
      ? `Equipamento ${eq_.code} (${eq_.category}) está com manutenção VENCIDA há ${Math.abs(days)} dia(s). Localização: ${eq_.installationLocation ?? "não informada"}.`
      : `Equipamento ${eq_.code} (${eq_.category}) vence a manutenção em ${days} dia(s) (${eq_.nextMaintenanceDate}). Localização: ${eq_.installationLocation ?? "não informada"}.`;

    // Salvar no banco
    const db2 = await getDb();
    if (!db2) return false;
    await db2.insert(alertEvents).values({
      equipmentId: eq_.id,
      companyId: eq_.companyId ?? undefined,
      alertType,
      message,
      acknowledged: false,
    });

    this.sentToday.add(debounceKey);

    // Buscar configurações de notificação da empresa
    let emailRecipients: string[] = [];
    if (eq_.companyId) {
      const settings = await db2
        .select()
        .from(notificationSettings)
        .where(eq(notificationSettings.companyId, eq_.companyId))
        .limit(1);

      if (settings[0]?.emailEnabled && settings[0]?.emailRecipients) {
        try {
          emailRecipients = JSON.parse(settings[0].emailRecipients);
        } catch {}
      }
    }

    // Enviar e-mail para os destinatários configurados
    const subject = `[OPERIS] ${urgency} — ${eq_.code} (${eq_.category})`;
    const html = buildEmailHtml(eq_, days, message, urgency);

    if (emailRecipients.length > 0) {
      for (const recipient of emailRecipients) {
        await sendEmail(recipient, subject, message, html).catch(console.error);
      }
    }

    // Sempre notificar o owner via Manus Forge como fallback
    try {
      await notifyOwner({
        title: `[OPERIS] Alerta de Manutenção — ${urgency}`,
        content: message,
      });
    } catch { /* Forge pode estar indisponível */ }

    return true;
  }
}

function buildEmailHtml(
  eq_: typeof equipment.$inferSelect,
  days: number,
  message: string,
  urgency: string
): string {
  const isOverdue = days < 0;
  const color = isOverdue ? "#C8102E" : days <= 7 ? "#e67e22" : "#2980b9";
  const statusBg = isOverdue ? "#C8102E" : days <= 7 ? "#e67e22" : "#2980b9";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1)">
        <!-- Header -->
        <tr><td style="background:#0a1628;padding:24px 32px;text-align:center">
          <span style="display:inline-block;background:#C8102E;color:#fff;font-weight:900;font-size:22px;letter-spacing:2px;padding:6px 16px;border-radius:2px">OP</span>
          <span style="color:#fff;font-size:22px;font-weight:700;letter-spacing:3px;margin-left:8px">ERIS</span>
          <p style="color:#aaa;font-size:11px;margin:4px 0 0;letter-spacing:2px">INSPEÇÃO E LAUDOS INTELIGENTES</p>
        </td></tr>
        <!-- Status badge -->
        <tr><td style="background:${statusBg};padding:16px 32px;text-align:center">
          <span style="color:#fff;font-size:16px;font-weight:700;letter-spacing:1px">⚠ ALERTA DE MANUTENÇÃO — ${urgency}</span>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px">
          <p style="color:#333;font-size:15px;line-height:1.6">${message}</p>
          <table width="100%" style="border-collapse:collapse;margin:24px 0">
            <tr style="background:#f9f9f9">
              <td style="padding:10px 14px;border:1px solid #e0e0e0;font-weight:700;color:#555;width:40%">Código</td>
              <td style="padding:10px 14px;border:1px solid #e0e0e0;color:#333">${eq_.code}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;border:1px solid #e0e0e0;font-weight:700;color:#555">Categoria</td>
              <td style="padding:10px 14px;border:1px solid #e0e0e0;color:#333;text-transform:capitalize">${eq_.category}</td>
            </tr>
            <tr style="background:#f9f9f9">
              <td style="padding:10px 14px;border:1px solid #e0e0e0;font-weight:700;color:#555">Localização</td>
              <td style="padding:10px 14px;border:1px solid #e0e0e0;color:#333">${eq_.installationLocation ?? "Não informada"}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;border:1px solid #e0e0e0;font-weight:700;color:#555">Próx. Manutenção</td>
              <td style="padding:10px 14px;border:1px solid #e0e0e0;color:${color};font-weight:700">${eq_.nextMaintenanceDate ?? "—"}</td>
            </tr>
            <tr style="background:#f9f9f9">
              <td style="padding:10px 14px;border:1px solid #e0e0e0;font-weight:700;color:#555">Status</td>
              <td style="padding:10px 14px;border:1px solid #e0e0e0">
                <span style="background:${statusBg};color:#fff;padding:3px 10px;border-radius:3px;font-size:12px;font-weight:700">${isOverdue ? "VENCIDO" : "PRÓXIMO DO VENCIMENTO"}</span>
              </td>
            </tr>
          </table>
          <div style="text-align:center;margin:24px 0">
            <a href="${process.env.VITE_APP_ID ? `https://${process.env.VITE_APP_ID}.manus.space/app/equipamentos` : "#"}"
               style="background:#C8102E;color:#fff;padding:12px 28px;border-radius:4px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:1px">
              VER EQUIPAMENTO NO OPERIS
            </a>
          </div>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f9f9f9;padding:16px 32px;text-align:center;border-top:1px solid #e0e0e0">
          <p style="color:#999;font-size:11px;margin:0">CO2 Contra Incêndio · OPERIS IA · Eng. Judson Aleixo Sampaio · CREA/MG 142203671-5</p>
          <p style="color:#bbb;font-size:10px;margin:4px 0 0">Este é um alerta automático gerado pelo sistema OPERIS. Não responda este e-mail.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
