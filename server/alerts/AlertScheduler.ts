/**
 * AlertScheduler
 * Roda o MaintenanceAlertMonitor uma vez por dia (às 08:00 BRT).
 * Iniciado no startup do servidor.
 */

import { MaintenanceAlertMonitor } from "./MaintenanceAlertMonitor";

const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 horas
const INITIAL_DELAY_MS = 5_000; // 5 segundos após startup

class AlertScheduler {
  private timer: NodeJS.Timeout | null = null;
  private monitor = new MaintenanceAlertMonitor();
  private running = false;

  start() {
    if (this.running) return;
    this.running = true;

    // Primeira execução: 5 segundos após o startup
    setTimeout(() => this.runCheck(), INITIAL_DELAY_MS);

    // Execuções subsequentes: a cada 24 horas
    this.timer = setInterval(() => this.runCheck(), CHECK_INTERVAL_MS);

    console.log("[AlertScheduler] Iniciado — verificação de vencimentos a cada 24h");
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.running = false;
    console.log("[AlertScheduler] Parado");
  }

  private async runCheck() {
    try {
      console.log("[AlertScheduler] Verificando vencimentos de manutenção...");
      const count = await this.monitor.run();
      console.log(`[AlertScheduler] ${count} alerta(s) enviado(s)`);
    } catch (err) {
      console.error("[AlertScheduler] Erro ao verificar vencimentos:", err);
    }
  }
}

export const alertScheduler = new AlertScheduler();
