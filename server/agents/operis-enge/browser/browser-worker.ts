/**
 * OPERIS.enge — Browser Worker
 *
 * Automação de navegador headless em segundo plano.
 * O cliente NUNCA vê o navegador — tudo acontece no servidor.
 *
 * Requer: playwright (instalar com `pnpm add playwright` e `npx playwright install chromium`)
 * Se playwright não estiver instalado, o worker retorna gracefully com erro descritivo.
 *
 * Casos de uso:
 *   - Capturar screenshots de páginas públicas (CREA, CBMMG, prefeituras)
 *   - Extrair dados de portais de normas técnicas
 *   - Preencher formulários de solicitação de documentos
 *   - Verificar validade de ARTs no portal CONFEA
 *   - Consultar CNPJ/empresa em portais públicos
 *   - Monitorar publicações do Diário Oficial
 */

export interface BrowserTask {
  taskId: string;
  type: "screenshot" | "scrape" | "form-fill" | "pdf-download" | "monitor";
  url: string;
  /** Seletor CSS do elemento a extrair (para scrape) */
  selector?: string;
  /** Dados para preencher formulário (para form-fill) */
  formData?: Record<string, string>;
  /** Aguardar este seletor antes de capturar (opcional) */
  waitForSelector?: string;
  /** Aguardar N ms após carregar (opcional) */
  waitMs?: number;
  /** Cookies de sessão para sites autenticados */
  cookies?: Array<{ name: string; value: string; domain: string }>;
}

export interface BrowserResult {
  taskId: string;
  success: boolean;
  screenshotUrl?: string;
  text?: string;
  html?: string;
  pdfUrl?: string;
  error?: string;
  durationMs: number;
  timestamp: Date;
}

/**
 * BrowserWorker — executa tarefas de navegador em segundo plano.
 * O Playwright é carregado dinamicamente para não quebrar builds sem ele instalado.
 */
export class BrowserWorker {
  private playwrightAvailable = false;
  private checkedAvailability = false;

  /** Verifica se o Playwright está disponível neste ambiente */
  async isAvailable(): Promise<boolean> {
    if (this.checkedAvailability) return this.playwrightAvailable;
    try {
      await import("playwright");
      this.playwrightAvailable = true;
    } catch {
      this.playwrightAvailable = false;
    }
    this.checkedAvailability = true;
    return this.playwrightAvailable;
  }

  /** Executa uma tarefa de navegador */
  async run(task: BrowserTask): Promise<BrowserResult> {
    const start = Date.now();

    if (!(await this.isAvailable())) {
      return {
        taskId: task.taskId,
        success: false,
        error: "Playwright não instalado. Execute: pnpm add playwright && npx playwright install chromium",
        durationMs: Date.now() - start,
        timestamp: new Date(),
      };
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const playwright = await import("playwright") as any;
      const chromium = playwright.chromium;
      const browser = await chromium.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
      });

      const context = await browser.newContext({
        userAgent: "Mozilla/5.0 (compatible; OPERIS-enge/1.0; +https://co2contraincendio.com.br)",
        viewport: { width: 1280, height: 900 },
      });

      // Injetar cookies de sessão se fornecidos
      if (task.cookies && task.cookies.length > 0) {
        await context.addCookies(task.cookies);
      }

      const page = await context.newPage();

      try {
        await page.goto(task.url, { waitUntil: "networkidle", timeout: 30000 });

        if (task.waitForSelector) {
          await page.waitForSelector(task.waitForSelector, { timeout: 10000 });
        }

        if (task.waitMs) {
          await page.waitForTimeout(task.waitMs);
        }

        let result: BrowserResult = {
          taskId: task.taskId,
          success: true,
          durationMs: 0,
          timestamp: new Date(),
        };

        switch (task.type) {
          case "screenshot": {
            const buffer = await page.screenshot({ fullPage: true, type: "png" });
            // Salvar no S3 via storagePut
            try {
              const { storagePut } = await import("../../../storage");
              const key = `enge-screenshots/${task.taskId}-${Date.now()}.png`;
              const { url } = await storagePut(key, buffer, "image/png");
              result.screenshotUrl = url;
            } catch {
              // Se S3 não disponível, retorna base64
              result.screenshotUrl = `data:image/png;base64,${buffer.toString("base64")}`;
            }
            break;
          }

          case "scrape": {
            if (task.selector) {
              const elements = await page.$$(task.selector);
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const texts = await Promise.all(elements.map((el: any) => el.textContent() as Promise<string | null>));
              result.text = texts.filter(Boolean).join("\n").trim();
            } else {
              result.text = await page.innerText("body");
            }
            result.html = await page.content();
            break;
          }

          case "form-fill": {
            if (task.formData) {
              for (const [selector, value] of Object.entries(task.formData)) {
                await page.fill(selector, value);
              }
              // Capturar screenshot após preencher
              const buffer = await page.screenshot({ type: "png" });
              result.screenshotUrl = `data:image/png;base64,${buffer.toString("base64")}`;
            }
            break;
          }

          case "pdf-download": {
            const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
            try {
              const { storagePut } = await import("../../../storage");
              const key = `enge-pdfs/${task.taskId}-${Date.now()}.pdf`;
              const { url } = await storagePut(key, pdfBuffer, "application/pdf");
              result.pdfUrl = url;
            } catch {
              result.pdfUrl = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;
            }
            break;
          }

          case "monitor": {
            result.text = await page.innerText("body");
            const buffer = await page.screenshot({ type: "png" });
            result.screenshotUrl = `data:image/png;base64,${buffer.toString("base64")}`;
            break;
          }
        }

        result.durationMs = Date.now() - start;
        return result;
      } finally {
        await context.close();
        await browser.close();
      }
    } catch (err) {
      return {
        taskId: task.taskId,
        success: false,
        error: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - start,
        timestamp: new Date(),
      };
    }
  }

  /** Executa múltiplas tarefas em paralelo (máx 3 simultâneas) */
  async runBatch(tasks: BrowserTask[], concurrency = 3): Promise<BrowserResult[]> {
    const results: BrowserResult[] = [];
    for (let i = 0; i < tasks.length; i += concurrency) {
      const batch = tasks.slice(i, i + concurrency);
      const batchResults = await Promise.all(batch.map((t) => this.run(t)));
      results.push(...batchResults);
    }
    return results;
  }
}

// Singleton
export const browserWorker = new BrowserWorker();
