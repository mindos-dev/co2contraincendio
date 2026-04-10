/**
 * ─── Project Service — Kanban, Burnup e OPERIS Engines ──────────────────────
 * JULY AOG | OPERIS Command Center
 *
 * Lê o TODO.md do projeto para alimentar o Kanban Board.
 * Calcula métricas de burnup das 45.000 linhas de código.
 * Monitora o status dos 5 Motores do OPERIS.eng.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// ─── Tipos ────────────────────────────────────────────────────────────────────
export type TaskStatus = "backlog" | "todo" | "in_progress" | "review" | "done" | "blocked";
export type TaskPriority = "critical" | "high" | "medium" | "low";
export type TaskCategory = "feature" | "bug" | "infra" | "ai" | "financial" | "nfse" | "docs" | "security";

export interface ProjectTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  engine?: string;          // qual motor OPERIS.eng é responsável
  estimatedLines?: number;  // linhas de código estimadas
  completedLines?: number;  // linhas já implementadas
  tags: string[];
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  completedAt?: string;
}

export interface BurnupDataPoint {
  date: string;
  planned: number;
  actual: number;
  milestone?: string;
}

export interface BurnupMetrics {
  targetLines: number;
  currentLines: number;
  progressPercent: number;
  velocity: number;          // linhas/dia (média últimos 7 dias)
  estimatedCompletionDate: string;
  dataPoints: BurnupDataPoint[];
  milestones: Array<{ name: string; targetLines: number; date: string; completed: boolean }>;
}

export interface OperisEngine {
  id: string;
  name: string;
  description: string;
  status: "active" | "building" | "planned" | "blocked";
  progress: number;          // 0-100
  linesImplemented: number;
  linesTarget: number;
  features: string[];
  lastActivity: string;
  color: string;
  icon: string;
}

// ─── Tarefas padrão do OPERIS (seed inicial) ─────────────────────────────────
const DEFAULT_TASKS: ProjectTask[] = [
  // ── Módulo Financeiro ────────────────────────────────────────────────────
  {
    id: "task-fin-001",
    title: "Dashboard Financeiro MRR/ARR",
    description: "Gráficos de receita recorrente mensal e anual com projeções",
    status: "done",
    priority: "high",
    category: "financial",
    engine: "Comercial",
    estimatedLines: 1200,
    completedLines: 1200,
    tags: ["financeiro", "mrr", "dashboard"],
    createdAt: "2025-01-15T00:00:00Z",
    updatedAt: "2025-03-01T00:00:00Z",
    completedAt: "2025-03-01T00:00:00Z",
  },
  {
    id: "task-fin-002",
    title: "Módulo NFS-e — Emissão de Notas Fiscais",
    description: "Integração com prefeituras para emissão automática de NFS-e",
    status: "in_progress",
    priority: "critical",
    category: "nfse",
    engine: "Comercial",
    estimatedLines: 3500,
    completedLines: 1200,
    tags: ["nfse", "fiscal", "integração"],
    createdAt: "2025-02-01T00:00:00Z",
    updatedAt: "2025-04-01T00:00:00Z",
    dueDate: "2025-06-30T00:00:00Z",
  },
  {
    id: "task-fin-003",
    title: "Controle de Propostas Comerciais",
    description: "Pipeline de vendas com status, valores e conversão",
    status: "done",
    priority: "high",
    category: "financial",
    engine: "Comercial",
    estimatedLines: 900,
    completedLines: 900,
    tags: ["propostas", "vendas", "pipeline"],
    createdAt: "2025-01-20T00:00:00Z",
    updatedAt: "2025-02-15T00:00:00Z",
    completedAt: "2025-02-15T00:00:00Z",
  },
  // ── OPERIS IA ────────────────────────────────────────────────────────────
  {
    id: "task-ai-001",
    title: "D.G.O. — Dashboard de Governança e Operação",
    description: "Dashboard completo com Docker, Ollama, AI Pipeline e Shell Bridge",
    status: "in_progress",
    priority: "critical",
    category: "ai",
    engine: "Governança",
    estimatedLines: 4500,
    completedLines: 2800,
    tags: ["dgo", "docker", "ollama", "governança"],
    createdAt: "2025-04-01T00:00:00Z",
    updatedAt: "2025-04-10T00:00:00Z",
    dueDate: "2025-04-30T00:00:00Z",
  },
  {
    id: "task-ai-002",
    title: "AI Pipeline — Fluxos entre Múltiplas IAs",
    description: "Sistema de pipelines encadeados para testes entre Gemma 2, Llama 3, DeepSeek",
    status: "in_progress",
    priority: "high",
    category: "ai",
    engine: "Busca Semântica",
    estimatedLines: 2000,
    completedLines: 1500,
    tags: ["pipeline", "ollama", "gemma2", "llama3"],
    createdAt: "2025-04-05T00:00:00Z",
    updatedAt: "2025-04-10T00:00:00Z",
  },
  {
    id: "task-ai-003",
    title: "Busca Semântica com RAG",
    description: "Motor de busca com embeddings e retrieval augmented generation",
    status: "todo",
    priority: "high",
    category: "ai",
    engine: "Busca Semântica",
    estimatedLines: 3000,
    completedLines: 0,
    tags: ["rag", "embeddings", "busca", "semantic"],
    createdAt: "2025-03-01T00:00:00Z",
    updatedAt: "2025-03-01T00:00:00Z",
    dueDate: "2025-07-31T00:00:00Z",
  },
  // ── Infraestrutura ───────────────────────────────────────────────────────
  {
    id: "task-infra-001",
    title: "Docker Compose — Ambiente de Produção",
    description: "Configuração completa com socket, volumes e permissões de host",
    status: "in_progress",
    priority: "critical",
    category: "infra",
    engine: "Governança",
    estimatedLines: 200,
    completedLines: 120,
    tags: ["docker", "infra", "produção"],
    createdAt: "2025-04-01T00:00:00Z",
    updatedAt: "2025-04-10T00:00:00Z",
  },
  {
    id: "task-infra-002",
    title: "Backup Automático HD 1TB",
    description: "Script de sincronização ~/sync_operis.sh com monitoramento",
    status: "todo",
    priority: "high",
    category: "infra",
    engine: "Governança",
    estimatedLines: 150,
    completedLines: 0,
    tags: ["backup", "sync", "hd"],
    createdAt: "2025-03-15T00:00:00Z",
    updatedAt: "2025-03-15T00:00:00Z",
  },
  // ── Engenharia ───────────────────────────────────────────────────────────
  {
    id: "task-eng-001",
    title: "Vistoria Técnica Blindada",
    description: "Sistema completo de inspeção predial com laudos e ARTs",
    status: "done",
    priority: "high",
    category: "feature",
    engine: "Operacional",
    estimatedLines: 5000,
    completedLines: 5000,
    tags: ["vistoria", "laudo", "art", "inspeção"],
    createdAt: "2024-11-01T00:00:00Z",
    updatedAt: "2025-01-15T00:00:00Z",
    completedAt: "2025-01-15T00:00:00Z",
  },
  {
    id: "task-eng-002",
    title: "Fire System — Sistemas Fixos de Incêndio",
    description: "Módulo de vistoria e relatório de sistemas de supressão",
    status: "done",
    priority: "high",
    category: "feature",
    engine: "Operacional",
    estimatedLines: 3200,
    completedLines: 3200,
    tags: ["fire", "supressão", "co2", "sprinkler"],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-03-01T00:00:00Z",
    completedAt: "2025-03-01T00:00:00Z",
  },
  {
    id: "task-eng-003",
    title: "Projetos — Arquitetura PROJECT-CENTERED",
    description: "Sistema de gestão de projetos com timeline e entregas",
    status: "done",
    priority: "medium",
    category: "feature",
    engine: "Operacional",
    estimatedLines: 2800,
    completedLines: 2800,
    tags: ["projetos", "gestão", "timeline"],
    createdAt: "2025-02-01T00:00:00Z",
    updatedAt: "2025-03-15T00:00:00Z",
    completedAt: "2025-03-15T00:00:00Z",
  },
  // ── Backlog ──────────────────────────────────────────────────────────────
  {
    id: "task-sec-001",
    title: "Autenticação 2FA / MFA",
    description: "Segundo fator de autenticação para contas admin",
    status: "backlog",
    priority: "high",
    category: "security",
    engine: "Governança",
    estimatedLines: 800,
    completedLines: 0,
    tags: ["segurança", "2fa", "auth"],
    createdAt: "2025-03-01T00:00:00Z",
    updatedAt: "2025-03-01T00:00:00Z",
  },
  {
    id: "task-docs-001",
    title: "Documentação API tRPC",
    description: "Documentação completa de todos os endpoints tRPC",
    status: "backlog",
    priority: "low",
    category: "docs",
    engine: "Aprendizagem",
    estimatedLines: 500,
    completedLines: 0,
    tags: ["docs", "api", "trpc"],
    createdAt: "2025-03-01T00:00:00Z",
    updatedAt: "2025-03-01T00:00:00Z",
  },
];

// ─── Armazenamento em memória (persistir no Drizzle em produção) ──────────────
let tasks: ProjectTask[] = [...DEFAULT_TASKS];

// ─── CRUD de Tarefas ──────────────────────────────────────────────────────────
export function getAllTasks(): ProjectTask[] {
  return tasks;
}

export function getTasksByStatus(status: TaskStatus): ProjectTask[] {
  return tasks.filter(t => t.status === status);
}

export function getKanbanBoard(): Record<TaskStatus, ProjectTask[]> {
  const statuses: TaskStatus[] = ["backlog", "todo", "in_progress", "review", "done", "blocked"];
  return statuses.reduce((acc, status) => {
    acc[status] = tasks.filter(t => t.status === status)
      .sort((a, b) => {
        const prio = { critical: 0, high: 1, medium: 2, low: 3 };
        return prio[a.priority] - prio[b.priority];
      });
    return acc;
  }, {} as Record<TaskStatus, ProjectTask[]>);
}

export function createTask(data: Omit<ProjectTask, "id" | "createdAt" | "updatedAt">): ProjectTask {
  const task: ProjectTask = {
    ...data,
    id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tasks.unshift(task);
  return task;
}

export function updateTask(id: string, data: Partial<ProjectTask>): ProjectTask | null {
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return null;
  tasks[idx] = {
    ...tasks[idx],
    ...data,
    updatedAt: new Date().toISOString(),
    completedAt: data.status === "done" ? new Date().toISOString() : tasks[idx].completedAt,
  };
  return tasks[idx];
}

export function moveTask(id: string, newStatus: TaskStatus): ProjectTask | null {
  return updateTask(id, { status: newStatus });
}

export function deleteTask(id: string): boolean {
  const before = tasks.length;
  tasks = tasks.filter(t => t.id !== id);
  return tasks.length < before;
}

// ─── Burnup Metrics ───────────────────────────────────────────────────────────
export async function getBurnupMetrics(): Promise<BurnupMetrics> {
  const TARGET_LINES = 60_000;  // meta total do projeto
  const CURRENT_LINES = 45_000; // linhas atuais (conforme especificado)

  // Calcular linhas por tarefas concluídas
  const completedLines = tasks
    .filter(t => t.status === "done")
    .reduce((sum, t) => sum + (t.completedLines ?? 0), 0);

  // Tentar contar linhas reais via git (se disponível)
  let realLines = CURRENT_LINES;
  try {
    const { stdout } = await execAsync(
      "git ls-files | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}'",
      { timeout: 10_000, cwd: process.cwd() }
    );
    const parsed = parseInt(stdout.trim());
    if (!isNaN(parsed) && parsed > 1000) realLines = parsed;
  } catch {}

  const progressPercent = Math.round((realLines / TARGET_LINES) * 100 * 10) / 10;

  // Gerar pontos históricos simulados (últimos 90 dias)
  const dataPoints: BurnupDataPoint[] = [];
  const now = new Date();
  const startLines = 15_000; // linhas no início do período

  for (let i = 89; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayFraction = (89 - i) / 89;
    const planned = Math.round(startLines + (TARGET_LINES - startLines) * (dayFraction * 0.7));
    const actual = i > 0
      ? Math.round(startLines + (realLines - startLines) * Math.pow(dayFraction, 0.8))
      : realLines;

    const milestones: Record<number, string> = {
      0: "Início Sprint",
      30: "v1.0 Alpha",
      60: "v1.5 Beta",
      89: "Hoje",
    };

    dataPoints.push({
      date: date.toISOString().split("T")[0],
      planned,
      actual,
      milestone: milestones[89 - i],
    });
  }

  // Velocidade (linhas/dia — últimos 7 dias)
  const last7 = dataPoints.slice(-7);
  const velocity = last7.length > 1
    ? Math.round((last7[last7.length - 1].actual - last7[0].actual) / 7)
    : 150;

  // Data estimada de conclusão
  const remainingLines = TARGET_LINES - realLines;
  const daysToComplete = velocity > 0 ? Math.ceil(remainingLines / velocity) : 999;
  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + daysToComplete);

  return {
    targetLines: TARGET_LINES,
    currentLines: realLines,
    progressPercent,
    velocity,
    estimatedCompletionDate: completionDate.toISOString().split("T")[0],
    dataPoints,
    milestones: [
      { name: "Módulo Financeiro Base", targetLines: 35_000, date: "2025-02-28", completed: realLines >= 35_000 },
      { name: "OPERIS IA v1.0", targetLines: 45_000, date: "2025-04-30", completed: realLines >= 45_000 },
      { name: "NFS-e + Fiscal", targetLines: 50_000, date: "2025-06-30", completed: realLines >= 50_000 },
      { name: "Lançamento Completo", targetLines: 60_000, date: "2025-09-30", completed: realLines >= 60_000 },
    ],
  };
}

// ─── OPERIS Engines Status ────────────────────────────────────────────────────
export function getOperisEngines(): OperisEngine[] {
  const engineTasks = (engineName: string) => tasks.filter(t => t.engine === engineName);
  const engineProgress = (engineName: string) => {
    const et = engineTasks(engineName);
    if (et.length === 0) return 0;
    const done = et.filter(t => t.status === "done").length;
    return Math.round((done / et.length) * 100);
  };
  const engineLines = (engineName: string, field: "completedLines" | "estimatedLines") =>
    engineTasks(engineName).reduce((sum, t) => sum + (t[field] ?? 0), 0);

  return [
    {
      id: "comercial",
      name: "Motor Comercial",
      description: "CRM, Propostas, NFS-e, Financeiro e Pipeline de Vendas",
      status: "building",
      progress: engineProgress("Comercial"),
      linesImplemented: engineLines("Comercial", "completedLines"),
      linesTarget: engineLines("Comercial", "estimatedLines"),
      features: ["Dashboard MRR/ARR", "Propostas Comerciais", "NFS-e (em progresso)", "Controle Financeiro"],
      lastActivity: "2025-04-10T10:00:00Z",
      color: "#6366f1",
      icon: "💼",
    },
    {
      id: "operacional",
      name: "Motor Operacional",
      description: "Vistorias, Inspeções, Fire System e Gestão de Equipamentos",
      status: "active",
      progress: engineProgress("Operacional"),
      linesImplemented: engineLines("Operacional", "completedLines"),
      linesTarget: engineLines("Operacional", "estimatedLines"),
      features: ["Vistoria Blindada", "Fire System", "QR Codes", "Projetos PROJECT-CENTERED"],
      lastActivity: "2025-04-08T14:00:00Z",
      color: "#10b981",
      icon: "⚙️",
    },
    {
      id: "busca",
      name: "Busca Semântica",
      description: "RAG, Embeddings, Busca Inteligente e AI Pipeline",
      status: "building",
      progress: engineProgress("Busca Semântica"),
      linesImplemented: engineLines("Busca Semântica", "completedLines"),
      linesTarget: engineLines("Busca Semântica", "estimatedLines"),
      features: ["AI Pipeline (em progresso)", "Busca RAG (planejado)", "Embeddings Nomic", "Busca Inteligente"],
      lastActivity: "2025-04-10T09:00:00Z",
      color: "#8b5cf6",
      icon: "🔍",
    },
    {
      id: "governanca",
      name: "Motor de Governança",
      description: "D.G.O., Docker Monitor, Shell Bridge, Logs de Auditoria",
      status: "building",
      progress: engineProgress("Governança"),
      linesImplemented: engineLines("Governança", "completedLines"),
      linesTarget: engineLines("Governança", "estimatedLines"),
      features: ["D.G.O. Dashboard (em progresso)", "Docker Monitor", "Shell Bridge", "AI Alerts"],
      lastActivity: "2025-04-10T11:00:00Z",
      color: "#f59e0b",
      icon: "🛡️",
    },
    {
      id: "aprendizagem",
      name: "Motor de Aprendizagem",
      description: "Autoaprendizagem, Knowledge Base, Mentor AI Code e JULY AOG",
      status: "planned",
      progress: engineProgress("Aprendizagem"),
      linesImplemented: engineLines("Aprendizagem", "completedLines"),
      linesTarget: 5000,
      features: ["Mentor AI Code (planejado)", "Knowledge Base", "JULY AOG Integration", "Continuous Learning"],
      lastActivity: "2025-03-01T00:00:00Z",
      color: "#06b6d4",
      icon: "🧠",
    },
  ];
}

// ─── Leitura do TODO.md ───────────────────────────────────────────────────────
export async function parseTodoMd(filePath?: string): Promise<ProjectTask[]> {
  const paths = [
    filePath,
    path.join(process.cwd(), "TODO.md"),
    path.join(process.cwd(), "todo.md"),
    path.join(process.cwd(), "..", "TODO.md"),
    "/home/ubuntu/co2-repo/TODO.md",
  ].filter(Boolean) as string[];

  for (const p of paths) {
    try {
      const content = await fs.readFile(p, "utf8");
      return parseTodoContent(content);
    } catch {}
  }

  return []; // Retorna vazio se não encontrar o arquivo
}

function parseTodoContent(content: string): ProjectTask[] {
  const parsed: ProjectTask[] = [];
  const lines = content.split("\n");
  let currentCategory: TaskCategory = "feature";
  let taskId = 0;

  for (const line of lines) {
    // Detectar categoria por heading
    if (line.startsWith("## ")) {
      const heading = line.slice(3).toLowerCase();
      if (heading.includes("bug")) currentCategory = "bug";
      else if (heading.includes("infra") || heading.includes("docker")) currentCategory = "infra";
      else if (heading.includes("ia") || heading.includes("ai") || heading.includes("ollama")) currentCategory = "ai";
      else if (heading.includes("financ") || heading.includes("nfs")) currentCategory = "financial";
      else if (heading.includes("segur") || heading.includes("auth")) currentCategory = "security";
      else if (heading.includes("doc")) currentCategory = "docs";
      else currentCategory = "feature";
    }

    // Detectar tarefas: - [ ] ou - [x]
    const todoMatch = line.match(/^[-*]\s+\[([ xX])\]\s+(.+)/);
    if (todoMatch) {
      const done = todoMatch[1].toLowerCase() === "x";
      const title = todoMatch[2].trim();
      taskId++;

      parsed.push({
        id: `todo-${taskId}`,
        title,
        status: done ? "done" : "todo",
        priority: title.includes("CRÍTICO") || title.includes("URGENT") ? "critical" : "medium",
        category: currentCategory,
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  return parsed;
}

// ─── Estatísticas do Projeto ──────────────────────────────────────────────────
export function getProjectStats() {
  const total = tasks.length;
  const done = tasks.filter(t => t.status === "done").length;
  const inProgress = tasks.filter(t => t.status === "in_progress").length;
  const blocked = tasks.filter(t => t.status === "blocked").length;
  const critical = tasks.filter(t => t.priority === "critical" && t.status !== "done").length;

  const totalEstimated = tasks.reduce((sum, t) => sum + (t.estimatedLines ?? 0), 0);
  const totalCompleted = tasks.reduce((sum, t) => sum + (t.completedLines ?? 0), 0);

  return {
    total,
    done,
    inProgress,
    blocked,
    critical,
    completionRate: total > 0 ? Math.round((done / total) * 100) : 0,
    totalEstimatedLines: totalEstimated,
    totalCompletedLines: totalCompleted,
    linesProgress: totalEstimated > 0 ? Math.round((totalCompleted / totalEstimated) * 100) : 0,
  };
}
