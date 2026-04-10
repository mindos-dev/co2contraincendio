/**
 * Swagger / OpenAPI 3.0 — CO2 Contra Incêndio + OPERIS.eng
 *
 * Documentação interativa disponível em: GET /api/docs
 * Spec JSON em: GET /api/docs.json
 *
 * Inclui todos os endpoints REST públicos e protegidos.
 * Endpoints tRPC estão documentados como referência mas são acessados via /api/trpc.
 */
import swaggerUi from "swagger-ui-express";
import type { Express } from "express";

const spec = {
  openapi: "3.0.3",
  info: {
    title: "OPERIS.eng API",
    version: "2.0.0",
    description: `
## CO2 Contra Incêndio — API RESTful + tRPC

Esta documentação cobre todos os endpoints da plataforma **OPERIS.eng**:

- **Autenticação: JWT cookie (HS256, 7 dias)
- **Equipamentos**: CRUD completo com QR Code
- **Manutenções**: Ordens de serviço e histórico
- **Vistorias**: Laudos técnicos com IA generativa
- **Documentos**: Upload S3 + metadados
- **Billing**: Planos, assinaturas e pagamentos (Stripe)
- **OPERIS.eng Motors**: Governança, Autoaprendizagem, Comercial, Operacional, Busca Semântica

### Autenticação
Todos os endpoints protegidos requerem o cookie de sessão \`operis_session\`.
Para obter o cookie, autentique via \`GET /api/oauth/login\`.

### Rate Limiting
- Endpoints públicos: 100 req/min por IP
- Endpoints autenticados: 1000 req/min por usuário
- Endpoints de IA: 20 req/min por usuário (custo computacional)

### Conformidade LGPD
Todos os dados pessoais são processados conforme a LGPD (Lei 13.709/2018).
Consulte \`/legal/privacy\` para a Política de Privacidade completa.
    `.trim(),
    contact: {
      name: "Eng. Judson Aleixo Sampaio",
      email: "co2contraincendio@gmail.com",
      url: "https://co2contra.com",
    },
    license: {
      name: "Proprietário — CO2 Contra Incêndio LTDA",
      url: "https://co2contra.com/legal/terms",
    },
  },
  servers: [
    { url: "/api", description: "API Principal (produção)" },
    { url: "http://localhost:3000/api", description: "Desenvolvimento local" },
  ],
  tags: [
    { name: "Auth", description: "Autenticação OAuth e sessão" },
    { name: "Equipment", description: "Gestão de equipamentos de incêndio" },
    { name: "Maintenance", description: "Ordens de serviço e manutenções" },
    { name: "Inspections", description: "Vistorias e laudos técnicos" },
    { name: "Documents", description: "Documentos técnicos e certificados" },
    { name: "Clients", description: "Gestão de clientes" },
    { name: "QRCode", description: "Geração e leitura de QR Codes" },
    { name: "Billing", description: "Planos, assinaturas e pagamentos" },
    { name: "OPERIS Motors", description: "Motores de IA do OPERIS.eng" },
    { name: "System", description: "Saúde do sistema e notificações" },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "operis_session",
        description: "Cookie de sessão JWT obtido via OAuth",
      },
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Token JWT para APIs programáticas",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: { type: "string", example: "Unauthorized" },
          message: { type: "string", example: "Sessão expirada ou inválida" },
          code: { type: "string", example: "UNAUTHORIZED" },
        },
        required: ["error"],
      },
      User: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          email: { type: "string", format: "email", example: "judson@co2contra.com" },
          name: { type: "string", example: "Judson Aleixo Sampaio" },
          role: { type: "string", enum: ["admin", "user", "technician"], example: "admin" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Equipment: {
        type: "object",
        properties: {
          id: { type: "integer", example: 42 },
          name: { type: "string", example: "Cilindro CO₂ 25kg #A-001" },
          type: { type: "string", example: "CO2_CYLINDER" },
          serialNumber: { type: "string", example: "SN-2024-001" },
          location: { type: "string", example: "Sala de Servidores — 2º Andar" },
          status: { type: "string", enum: ["active", "inactive", "maintenance", "expired"] },
          lastMaintenanceAt: { type: "string", format: "date-time", nullable: true },
          nextMaintenanceAt: { type: "string", format: "date-time", nullable: true },
          qrCode: { type: "string", example: "https://co2contra.com/eq/42" },
          clientId: { type: "integer", example: 7 },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      MaintenanceOrder: {
        type: "object",
        properties: {
          id: { type: "integer", example: 100 },
          equipmentId: { type: "integer", example: 42 },
          technicianId: { type: "integer", example: 3 },
          type: { type: "string", enum: ["preventive", "corrective", "emergency"] },
          status: { type: "string", enum: ["pending", "in_progress", "completed", "cancelled"] },
          scheduledAt: { type: "string", format: "date-time" },
          completedAt: { type: "string", format: "date-time", nullable: true },
          notes: { type: "string", nullable: true },
          reportUrl: { type: "string", format: "uri", nullable: true },
        },
      },
      Inspection: {
        type: "object",
        properties: {
          id: { type: "integer", example: 55 },
          clientId: { type: "integer", example: 7 },
          technicianId: { type: "integer", example: 3 },
          status: { type: "string", enum: ["draft", "in_progress", "completed", "signed"] },
          riskLevel: { type: "string", enum: ["R1", "R2", "R3", "R4", "R5"] },
          norm: { type: "string", example: "NBR 12615" },
          findings: { type: "string", nullable: true },
          recommendations: { type: "string", nullable: true },
          reportUrl: { type: "string", format: "uri", nullable: true },
          artNumber: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      BillingPlan: {
        type: "object",
        properties: {
          id: { type: "string", example: "plan_pro" },
          name: { type: "string", example: "OPERIS Pro" },
          price: { type: "number", example: 297.0 },
          currency: { type: "string", example: "BRL" },
          interval: { type: "string", enum: ["month", "year"] },
          features: { type: "array", items: { type: "string" } },
          maxEquipment: { type: "integer", example: 500 },
          maxUsers: { type: "integer", example: 10 },
        },
      },
      SearchResult: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string", example: "NBR 12615 — Sistemas de Supressão por CO₂" },
          content: { type: "string" },
          source: { type: "string", example: "NBR 12615" },
          sourceType: { type: "string", enum: ["norm", "manual", "report", "custom"] },
          score: { type: "number", minimum: 0, maximum: 1, example: 0.92 },
          section: { type: "string", nullable: true },
          riskLevel: { type: "string", nullable: true },
        },
      },
    },
  },
  security: [{ cookieAuth: [] }],
  paths: {
    // ── Auth ──────────────────────────────────────────────────────
    "/oauth/login": {
      get: {
        tags: ["Auth"],
        summary: "Iniciar fluxo OAuth",
        description: "Redireciona para o portal de login OPERIS. Após autenticação, redireciona para /api/oauth/callback.",
        security: [],
        parameters: [
          { name: "returnPath", in: "query", schema: { type: "string" }, description: "Caminho de retorno após login", example: "/app/dashboard" },
        ],
        responses: {
          "302": { description: "Redirecionamento para portal OAuth" },
        },
      },
    },
    "/oauth/callback": {
      get: {
        tags: ["Auth"],
        summary: "Callback OAuth",
        description: "Endpoint de callback de autenticação OPERIS. Cria sessão e redireciona para o app.",
        security: [],
        parameters: [
          { name: "code", in: "query", required: true, schema: { type: "string" } },
          { name: "state", in: "query", required: true, schema: { type: "string" } },
        ],
        responses: {
          "302": { description: "Redirecionamento para o app após login bem-sucedido" },
          "400": { description: "Parâmetros inválidos", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/trpc/auth.me": {
      get: {
        tags: ["Auth"],
        summary: "Dados do usuário autenticado",
        description: "Retorna os dados do usuário atual. Equivalente tRPC: `trpc.auth.me.useQuery()`",
        responses: {
          "200": {
            description: "Usuário autenticado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } },
          },
          "401": { description: "Não autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/trpc/auth.logout": {
      post: {
        tags: ["Auth"],
        summary: "Encerrar sessão",
        description: "Invalida o cookie de sessão. Equivalente tRPC: `trpc.auth.logout.useMutation()`",
        responses: {
          "200": { description: "Sessão encerrada com sucesso" },
        },
      },
    },
    // ── Equipment ─────────────────────────────────────────────────
    "/trpc/equipment.list": {
      get: {
        tags: ["Equipment"],
        summary: "Listar equipamentos",
        description: "Retorna todos os equipamentos da empresa do usuário autenticado.",
        parameters: [
          { name: "status", in: "query", schema: { type: "string", enum: ["active", "inactive", "maintenance", "expired"] } },
          { name: "clientId", in: "query", schema: { type: "integer" } },
          { name: "limit", in: "query", schema: { type: "integer", default: 50, maximum: 200 } },
          { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
        ],
        responses: {
          "200": {
            description: "Lista de equipamentos",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Equipment" } } } },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/trpc/equipment.create": {
      post: {
        tags: ["Equipment"],
        summary: "Cadastrar equipamento",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "type", "clientId"],
                properties: {
                  name: { type: "string", example: "Cilindro CO₂ 25kg" },
                  type: { type: "string", example: "CO2_CYLINDER" },
                  serialNumber: { type: "string" },
                  location: { type: "string" },
                  clientId: { type: "integer" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Equipamento criado", content: { "application/json": { schema: { $ref: "#/components/schemas/Equipment" } } } },
          "400": { description: "Dados inválidos" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    // ── Inspections ───────────────────────────────────────────────
    "/trpc/vistoria.list": {
      get: {
        tags: ["Inspections"],
        summary: "Listar vistorias",
        parameters: [
          { name: "status", in: "query", schema: { type: "string" } },
          { name: "clientId", in: "query", schema: { type: "integer" } },
        ],
        responses: {
          "200": { description: "Lista de vistorias", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Inspection" } } } } },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    // ── Billing ───────────────────────────────────────────────────
    "/trpc/billing.getPlans": {
      get: {
        tags: ["Billing"],
        summary: "Listar planos disponíveis",
        security: [],
        responses: {
          "200": { description: "Planos OPERIS.eng", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/BillingPlan" } } } } },
        },
      },
    },
    "/trpc/billing.createCheckout": {
      post: {
        tags: ["Billing"],
        summary: "Criar sessão de checkout Stripe",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["planId"],
                properties: {
                  planId: { type: "string", example: "plan_pro" },
                  couponCode: { type: "string", example: "OPERIS10" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "URL do checkout Stripe", content: { "application/json": { schema: { type: "object", properties: { checkoutUrl: { type: "string", format: "uri" } } } } } },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    // ── OPERIS Motors ─────────────────────────────────────────────
    "/trpc/enge.search_query": {
      post: {
        tags: ["OPERIS Motors"],
        summary: "Busca Semântica RAG",
        description: "Busca semântica sobre a base de conhecimento de normas NBR/NFPA usando embeddings e cosine similarity.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["query"],
                properties: {
                  query: { type: "string", example: "pressão de descarga cilindro CO2 NBR 12615" },
                  topK: { type: "integer", default: 5, minimum: 1, maximum: 20 },
                  sourceType: { type: "string", enum: ["norm", "manual", "report", "custom", "all"], default: "all" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Resultados da busca semântica",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    results: { type: "array", items: { $ref: "#/components/schemas/SearchResult" } },
                    totalChunks: { type: "integer" },
                    queryTime: { type: "number", description: "Tempo de busca em ms" },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "429": { description: "Rate limit de IA excedido (20 req/min)" },
        },
      },
    },
    "/trpc/enge.governance_log": {
      post: {
        tags: ["OPERIS Motors"],
        summary: "Registrar evento de governança",
        description: "Motor de Governança — registra ação no log imutável de auditoria.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["action", "context"],
                properties: {
                  action: { type: "string", example: "EQUIPMENT_DELETED" },
                  context: { type: "object" },
                  riskLevel: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Evento registrado" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    // ── System ────────────────────────────────────────────────────
    "/health": {
      get: {
        tags: ["System"],
        summary: "Health check",
        description: "Verifica se o servidor está operacional.",
        security: [],
        responses: {
          "200": {
            description: "Servidor operacional",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    version: { type: "string", example: "2.0.0" },
                    timestamp: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  // Respostas reutilizáveis
  responses: {
    Unauthorized: {
      description: "Não autenticado",
      content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
    },
    Forbidden: {
      description: "Acesso negado — permissão insuficiente",
      content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
    },
  },
};

/**
 * Registra as rotas do Swagger UI no Express
 * - GET /api/docs → Interface Swagger UI interativa
 * - GET /api/docs.json → Spec OpenAPI em JSON
 */
export function setupSwagger(app: Express): void {
  // Spec JSON
  app.get("/api/docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json(spec);
  });

  // Swagger UI
  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(spec, {
      customSiteTitle: "OPERIS.eng API Docs",
      customCss: `
        .swagger-ui .topbar { background: #0a1628; }
        .swagger-ui .topbar-wrapper img { content: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 110"><path d="M50 4 L92 22 L92 58 C92 80 72 98 50 106 C28 98 8 80 8 58 L8 22 Z" fill="%23C8102E"/><text x="50" y="68" text-anchor="middle" font-family="Arial" font-weight="900" font-size="38" fill="white">OP</text></svg>'); height: 40px; }
        .swagger-ui .info .title { color: #0a1628; }
        .swagger-ui .opblock.opblock-post .opblock-summary { border-color: #f97316; }
        .swagger-ui .opblock.opblock-get .opblock-summary { border-color: #3b82f6; }
      `,
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true,
      },
    })
  );

  console.log("[Swagger] API docs available at /api/docs");
}
