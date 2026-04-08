# Arquitetura Técnica — OPERIS IA / CO₂ Contra Incêndio

**Versão:** 1.0 · **Data:** Abril 2026  
**Responsável Técnico:** Eng. Judson Aleixo Sampaio · CREA/MG 142203671-5  
**Empresa:** CO₂ Contra Incêndio LTDA · CNPJ 29.905.123/0001-53 · Belo Horizonte, MG

---

## 1. Visão Geral da Plataforma

A plataforma **OPERIS IA** é um SaaS multi-tenant voltado para empresas de engenharia e manutenção predial, com foco em sistemas de proteção contra incêndio CO₂. A arquitetura foi concebida sobre os princípios de **Soberania Digital** (JULY AI AOG), **Zero Cloud Dependency** e conformidade com a **LGPD (Lei 13.709/2018)**.

A stack tecnológica é composta por:

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + Tailwind CSS 4 + shadcn/ui |
| Backend | Express 4 + tRPC 11 (type-safe RPC) |
| ORM | Drizzle ORM (schema-first, migrations) |
| Banco de Dados | MySQL / TiDB (via `DATABASE_URL`) |
| Autenticação | Manus OAuth 2.0 + JWT (cookie-based) |
| Armazenamento | S3 (via `storagePut` / `storageGet`) |
| IA | LLM via `invokeLLM` (server-side only) |
| PDF | jsPDF (client-side, sem servidor) |
| Pagamentos | Stripe (Checkout Sessions + Webhooks) |

---

## 2. Diagrama de Entidade-Relacionamento (DER) — Módulo Vistorias

O diagrama abaixo representa as relações entre as 7 tabelas centrais do módulo de vistorias de imóveis.

```
┌─────────────────────────────────────────────────────────────────────┐
│                      saas_companies                                  │
│  id PK · name · cnpj · plan · stripeCustomerId                      │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ 1:N
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    property_inspections                              │
│  id PK · companyId FK · createdByUserId FK                          │
│  type · status · contractId · auditHash · reportSlug                │
│  propertyAddress · propertyType · landlordName · tenantName         │
│  inspectorName · inspectorCrea · redutorSocial · clausulaVigencia   │
│  landlordSignedAt · tenantSignedAt · inspectorSignedAt              │
│  inspectedAt · lockedAt · createdAt · updatedAt                     │
└───────┬─────────────────────────────────────────────────────────────┘
        │ 1:N                    │ 1:N                    │ 1:N
        ▼                        ▼                        ▼
┌───────────────┐   ┌─────────────────────────┐   ┌──────────────────────────┐
│inspection_rooms│   │ inspection_pathologies  │   │inspection_comparisons    │
│ id PK         │   │ id PK · inspectionId FK │   │ id PK                    │
│ inspectionId  │   │ category · severity     │   │ entryInspectionId FK     │
│ name · type   │   │ riskScore (1-10)        │   │ exitInspectionId FK      │
│ order · notes │   │ causeAnalysis           │   │ diffSummary (JSON)       │
└───────┬───────┘   │ repairSuggestion        │   │ depreciationEstimate     │
        │ 1:N       │ estimatedRepairCost     │   └──────────────────────────┘
        ▼           │ photoContextUrl         │
┌───────────────┐   │ photoDetailUrl          │
│  room_items   │   └─────────────────────────┘
│ id PK         │
│ roomId FK     │   ┌──────────────────────────────────────────────────┐
│ inspectionId  │   │        inspection_maintenance_tasks              │
│ name · category│  │ id PK · inspectionId FK · pathologyId FK        │
│ condition     │   │ title · description · priority                  │
│ photoUrl      │   │ status · dueDate · assignedTo · estimatedCost   │
└───────────────┘   └──────────────────────────────────────────────────┘
```

---

## 3. Dicionário de Dados — Tabelas do Módulo Vistorias

### 3.1 `property_inspections`

Tabela central que armazena todos os dados de uma vistoria de imóvel, desde os dados das partes até o laudo gerado e as assinaturas digitais.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | INT PK | Sim | Auto-incremento |
| `companyId` | INT FK | Sim | Empresa SaaS (multi-tenancy) |
| `createdByUserId` | INT FK | Sim | Usuário criador |
| `type` | ENUM | Sim | `entrada \| saida \| periodica \| devolucao` |
| `status` | ENUM | Sim | `rascunho \| em_andamento \| pending_validation \| aguardando_assinatura \| concluida \| cancelada` |
| `contractId` | VARCHAR(30) | Não | Gerado automaticamente: `CONT-YYYY-NNNN` |
| `auditHash` | VARCHAR(64) | Não | SHA-256 do payload no momento do fechamento |
| `lockedAt` | TIMESTAMP | Não | Momento do LOCK_EDITION |
| `lockedByUserId` | INT | Não | Usuário que fechou o registro |
| `propertyAddress` | TEXT | Sim | Endereço completo do imóvel |
| `propertyType` | ENUM | Sim | `apartamento \| casa \| sala_comercial \| galpao \| outro` |
| `propertyArea` | VARCHAR(20) | Não | Ex: `85m²` |
| `propertyRegistration` | VARCHAR(100) | Não | Número de matrícula |
| `landlordName` | VARCHAR(200) | Sim | Nome completo do locador |
| `landlordCpfCnpj` | VARCHAR(20) | Não | CPF ou CNPJ |
| `landlordPhone` | VARCHAR(30) | Não | |
| `landlordEmail` | VARCHAR(320) | Não | |
| `tenantName` | VARCHAR(200) | Sim | Nome completo do inquilino |
| `tenantCpfCnpj` | VARCHAR(20) | Não | |
| `tenantPhone` | VARCHAR(30) | Não | |
| `tenantEmail` | VARCHAR(320) | Não | |
| `contractNumber` | VARCHAR(100) | Não | Número do contrato de locação |
| `contractStartDate` | TIMESTAMP | Não | Início da vigência |
| `contractEndDate` | TIMESTAMP | Não | Fim da vigência |
| `rentValue` | VARCHAR(30) | Não | Valor do aluguel |
| `inspectorName` | VARCHAR(200) | Não | Nome do vistoriador |
| `inspectorCrea` | VARCHAR(50) | Não | Ex: `CREA/MG 142203671-5` |
| `inspectorCompany` | VARCHAR(200) | Não | Empresa do vistoriador |
| `reportHtml` | TEXT | Não | Laudo gerado por LLM (HTML) |
| `reportSlug` | VARCHAR(100) UNIQUE | Não | Slug público: `nanoid(12)` |
| `landlordSignatureUrl` | TEXT | Não | URL S3 da assinatura do locador |
| `tenantSignatureUrl` | TEXT | Não | URL S3 da assinatura do inquilino |
| `inspectorSignatureUrl` | TEXT | Não | URL S3 da assinatura do vistoriador |
| `landlordSignedAt` | TIMESTAMP | Não | |
| `tenantSignedAt` | TIMESTAMP | Não | |
| `inspectorSignedAt` | TIMESTAMP | Não | |
| `redutorSocial` | BOOLEAN | Não | LC 214/2025 — Redutor Social R$ 600 |
| `clausulaVigencia` | BOOLEAN | Não | Art. 8º Lei 8.245/91 |
| `garantiaType` | ENUM | Não | `caucao \| fiador \| seguro_fianca \| sem_garantia` |
| `propertyCep` | VARCHAR(10) | Não | |
| `propertyStreet` | VARCHAR(200) | Não | |
| `propertyNeighborhood` | VARCHAR(100) | Não | |
| `propertyCity` | VARCHAR(100) | Não | |
| `propertyState` | VARCHAR(2) | Não | |
| `generalNotes` | TEXT | Não | Observações gerais |
| `inspectedAt` | TIMESTAMP | Sim | Default: `NOW()` |
| `createdAt` | TIMESTAMP | Sim | |
| `updatedAt` | TIMESTAMP | Sim | `onUpdateNow()` |

### 3.2 `inspection_rooms`

Cômodos vinculados a uma vistoria, com ordem de exibição e tipo para geração automática de itens padrão.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | INT PK | Sim | |
| `inspectionId` | INT FK | Sim | → `property_inspections.id` |
| `name` | VARCHAR(100) | Sim | Ex: `Sala de Estar`, `Quarto 1` |
| `type` | ENUM | Sim | `sala \| quarto \| cozinha \| banheiro \| area_servico \| garagem \| varanda \| corredor \| outro` |
| `order` | INT | Não | Ordem de exibição |
| `notes` | TEXT | Não | Observações do cômodo |
| `createdAt` | TIMESTAMP | Sim | |

### 3.3 `room_items`

Itens de cada cômodo com condição, foto e notas. Cada tipo de cômodo possui itens padrão gerados automaticamente.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | INT PK | Sim | |
| `roomId` | INT FK | Sim | → `inspection_rooms.id` |
| `inspectionId` | INT FK | Sim | → `property_inspections.id` (redundância para queries diretas) |
| `name` | VARCHAR(200) | Sim | Ex: `Piso`, `Parede`, `Janela`, `Tomada` |
| `category` | VARCHAR(100) | Não | Ex: `revestimento`, `esquadria`, `elétrica` |
| `condition` | ENUM | Não | `otimo \| bom \| regular \| ruim \| pessimo \| inexistente` |
| `notes` | TEXT | Não | Observações do item |
| `photoUrl` | TEXT | Não | URL S3 da foto do item |
| `order` | INT | Não | Ordem de exibição |
| `createdAt` | TIMESTAMP | Sim | |

### 3.4 `inspection_pathologies`

Patologias identificadas durante a vistoria, com análise de causa, sugestão de reparo, custo estimado e Risk Score individual.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | INT PK | Sim | |
| `companyId` | INT | Sim | Multi-tenancy |
| `inspectionId` | INT FK | Sim | → `property_inspections.id` |
| `roomItemId` | INT | Não | Vínculo opcional com item do cômodo |
| `category` | VARCHAR(50) | Sim | `fissura \| infiltracao \| corrosao \| destacamento \| outro` |
| `severity` | VARCHAR(20) | Sim | `low \| medium \| high` |
| `causeAnalysis` | TEXT | Não | Análise de causa (manual ou IA) |
| `repairSuggestion` | TEXT | Não | Sugestão de reparo (manual ou IA) |
| `estimatedRepairCost` | DECIMAL(10,2) | Não | Custo estimado em R$ |
| `photoContextUrl` | VARCHAR(500) | Não | URL S3 — foto panorâmica |
| `photoDetailUrl` | VARCHAR(500) | Não | URL S3 — foto de detalhe |
| `riskScore` | INT | Não | Score de risco: 1 a 10 |
| `notifiedOwner` | BOOLEAN | Não | Se o proprietário foi notificado |
| `createdAt` | TIMESTAMP | Não | |
| `createdByUserId` | INT | Sim | |

### 3.5 `inspection_comparisons`

Comparação entre vistoria de entrada e saída, com resumo das diferenças por cômodo e estimativa de depreciação.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | INT PK | Sim | |
| `companyId` | INT | Sim | |
| `entryInspectionId` | INT FK | Sim | → `property_inspections.id` |
| `exitInspectionId` | INT FK | Não | → `property_inspections.id` |
| `propertyAddress` | VARCHAR(500) | Não | |
| `contractNumber` | VARCHAR(100) | Não | |
| `diffSummary` | TEXT | Não | JSON com diferenças por cômodo |
| `overallConditionEntry` | VARCHAR(20) | Não | `otimo \| bom \| regular \| ruim` |
| `overallConditionExit` | VARCHAR(20) | Não | |
| `depreciationEstimate` | DECIMAL(10,2) | Não | Estimativa de depreciação em R$ |
| `createdAt` | TIMESTAMP | Não | |
| `createdByUserId` | INT | Sim | |

### 3.6 `inspection_maintenance_tasks`

Tarefas de manutenção geradas a partir de patologias identificadas, com prioridade e controle de status.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | INT PK | Sim | |
| `companyId` | INT | Sim | |
| `inspectionId` | INT FK | Sim | |
| `pathologyId` | INT FK | Não | Patologia de origem |
| `title` | VARCHAR(255) | Sim | |
| `description` | TEXT | Não | |
| `priority` | VARCHAR(20) | Sim | `low \| medium \| high \| critical` |
| `status` | VARCHAR(20) | Sim | `pending \| in_progress \| done \| cancelled` |
| `dueDate` | TIMESTAMP | Não | |
| `assignedTo` | VARCHAR(200) | Não | |
| `estimatedCost` | DECIMAL(10,2) | Não | |
| `createdAt` | TIMESTAMP | Não | |
| `createdByUserId` | INT | Sim | |

---

## 4. Endpoints tRPC — Módulo Vistorias

Todos os endpoints são acessados via `/api/trpc` e tipados de ponta a ponta. Procedimentos marcados como `saasAuth` exigem sessão ativa e filtram automaticamente por `companyId`.

### 4.1 `vistoria.*`

| Endpoint | Tipo | Auth | Descrição |
|---|---|---|---|
| `vistoria.list` | Query | saasAuth | Lista vistorias da empresa com paginação e filtros |
| `vistoria.get` | Query | saasAuth | Retorna vistoria completa com cômodos e itens |
| `vistoria.create` | Mutation | saasAuth | Cria vistoria + cômodos + itens em uma transação |
| `vistoria.addRoom` | Mutation | saasAuth | Adiciona cômodo com itens padrão por tipo |
| `vistoria.updateItem` | Mutation | saasAuth | Atualiza condição, notas e foto de um item |
| `vistoria.uploadItemPhoto` | Mutation | saasAuth | Upload de foto para S3 e atualização do item |
| `vistoria.sign` | Mutation | saasAuth | Registra assinatura digital (canvas → S3) |
| `vistoria.generateReport` | Mutation | saasAuth | Gera laudo HTML via LLM e define `reportSlug` |
| `vistoria.getPublicReport` | Query | public | Retorna dados completos por slug (sem autenticação) |
| `vistoria.generateContract` | Mutation | saasAuth | Gera contrato com cláusulas 2026 via LLM |
| `vistoria.finalizeAndGenerateContract` | Mutation | saasAuth | Fecha vistoria + gera contrato + define `auditHash` |
| `vistoria.updateStatus` | Mutation | saasAuth | Atualiza status da vistoria |

### 4.2 `pathology.*`

| Endpoint | Tipo | Auth | Descrição |
|---|---|---|---|
| `pathology.pathology.create` | Mutation | saasAuth | Cria patologia com análise de IA |
| `pathology.pathology.list` | Query | saasAuth | Lista patologias de uma vistoria |
| `pathology.pathology.delete` | Mutation | saasAuth | Remove patologia |
| `pathology.maintenance.create` | Mutation | saasAuth | Cria tarefa de manutenção a partir de patologia |
| `pathology.maintenance.list` | Query | saasAuth | Lista tarefas de manutenção |
| `pathology.maintenance.updateStatus` | Mutation | saasAuth | Atualiza status da tarefa |
| `pathology.comparison.create` | Mutation | saasAuth | Cria comparação entrada vs. saída |
| `pathology.comparison.list` | Query | saasAuth | Lista comparações |
| `pathology.comparison.getById` | Query | saasAuth | Retorna comparação com diff detalhado |

---

## 5. Fluxo do Wizard de 5 Passos (NovaVistoria)

O wizard `NovaVistoria.tsx` guia o usuário por 5 etapas sequenciais, com validação em cada passo antes de avançar.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Passo 1: Dados Básicos                                                  │
│  → type, propertyAddress, propertyType, CEP (ViaCEP), partes, contrato  │
│  → Validação: campos obrigatórios (landlordName, tenantName, address)    │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  Passo 2: Cômodos e Itens                                                │
│  → addRoom (tipo → itens padrão automáticos)                             │
│  → updateItem (condição + notas + foto por item)                         │
│  → Validação: ao menos 1 cômodo com ao menos 1 item avaliado             │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  Passo 3: Patologias (IA)                                                │
│  → Cria draftInspectionId via vistoria.create (se ainda não criado)      │
│  → PathologyReport.tsx: upload de fotos → análise LLM → risk score       │
│  → Opcional: pode pular se não houver patologias                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  Passo 4: Contrato 2026                                                  │
│  → finalizeAndGenerateContract                                           │
│  → redutorSocial (LC 214/2025), clausulaVigencia (Art. 8º Lei 8.245/91) │
│  → garantiaType, auditHash gerado, contractId sequencial                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  Passo 5: Assinaturas Digitais                                           │
│  → Canvas-based signature pad para cada parte                            │
│  → sign() → upload para S3 → timestamp registrado                       │
│  → Status final: aguardando_assinatura → concluida                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Página Pública do Laudo (`/operis/vistorias/laudo/:slug`)

A página pública é acessível sem autenticação e renderiza o laudo completo com todas as informações necessárias para validação jurídica.

| Seção | Conteúdo |
|---|---|
| Cabeçalho | QR Code (api.qrserver.com) + Hash de Auditoria SHA-256 |
| Risk Score | Gauge colorido com total e classificação (Sem Risco → Crítico) |
| Partes | Grid 3 colunas: Locador, Inquilino, Vistoriador com timestamps de assinatura |
| Assinaturas | Imagens das assinaturas digitais (URLs S3) |
| Laudo HTML | Conteúdo gerado por LLM renderizado como HTML |
| Checklist | Tabela por cômodo com fotos e condições coloridas |
| Galeria | Fotos com timestamp e badge de condição |
| Patologias | Cards com severidade, Risk Score individual, custo estimado |
| Cláusulas 2026 | Redutor Social e Cláusula de Vigência com texto legal |
| Rodapé | LGPD + Lei 8.245/91 + CREA + CNPJ |

---

## 7. Exportação PDF (`exportVistoriaPdf.ts`)

O PDF é gerado inteiramente no cliente usando **jsPDF**, sem necessidade de servidor. O arquivo segue a paleta OPERIS (DARK `#0A1628` + RED `#C8102E`).

| Seção PDF | Descrição |
|---|---|
| Cabeçalho | Fundo escuro com tipo de vistoria e endereço |
| Partes | Grid 3 colunas com timestamps de assinatura |
| Risk Score | Caixa colorida + barra de progresso proporcional |
| Checklist | Tabela por cômodo com cores por condição |
| Patologias | Cards com badge de severidade, score e custo |
| Cláusulas 2026 | Caixas azul (Redutor Social) e verde (Vigência) |
| Hash SHA-256 | Caixa verde de autenticidade |
| Rodapé | Fundo escuro em todas as páginas: LGPD + Lei 8.245/91 + CREA + CNPJ |

---

## 8. Lógica de Risk Score

O Risk Score é um indicador quantitativo do estado estrutural do imóvel, calculado a partir das patologias identificadas.

```
Score Individual (por patologia): 1 a 10 (definido pelo usuário ou sugerido pela IA)

Score Total: soma de todos os riskScore das patologias

Classificação:
  0          → Sem Risco       (verde escuro)
  1 a 3      → Risco Baixo     (verde)
  4 a 5      → Risco Moderado  (âmbar)
  6 a 7      → Risco Alto      (laranja)
  8 a 10     → Risco Crítico   (vermelho)
```

---

## 9. Conformidade Legal e LGPD

A plataforma foi projetada para conformidade com as seguintes legislações:

| Norma | Aplicação |
|---|---|
| **Lei 13.709/2018 (LGPD)** | Consentimento de cookies, solicitações de exclusão de dados, logs de acesso |
| **Lei 8.245/1991 (Lei do Inquilinato)** | Cláusula de Vigência (Art. 8º), garantias locatícias |
| **LC 214/2025 (Reforma Tributária)** | Redutor Social R$ 600 sobre IBS/CBS para imóveis residenciais |
| **NBR 5674** | Manutenção de edificações (referência para tarefas de manutenção) |
| **CREA/MG** | Responsabilidade técnica do Eng. Judson Aleixo Sampaio (CREA/MG 142203671-5) |

O `auditHash` (SHA-256) gerado no fechamento da vistoria garante a **imutabilidade** do registro, permitindo verificação posterior de integridade.

---

## 10. Inventário de Arquivos — Módulo Vistorias

| Arquivo | Tipo | Descrição |
|---|---|---|
| `drizzle/schema.ts` | Schema | Definição das 46 tabelas (linhas 511–975 para vistorias) |
| `server/vistoria-router.ts` | Backend | 12 procedures tRPC para vistorias |
| `server/pathology-router.ts` | Backend | 9 procedures tRPC para patologias, manutenção e comparações |
| `client/src/pages/operis/vistorias/NovaVistoria.tsx` | Frontend | Wizard de 5 passos |
| `client/src/pages/operis/vistorias/ListaVistorias.tsx` | Frontend | Lista com filtros |
| `client/src/pages/operis/vistorias/DetalhesVistoria.tsx` | Frontend | Detalhes com abas |
| `client/src/pages/operis/vistorias/LaudoPublico.tsx` | Frontend | Página pública (sem auth) |
| `client/src/components/operis/PathologyReport.tsx` | Componente | Análise de patologias com IA |
| `client/src/lib/exportVistoriaPdf.ts` | Lib | Exportação PDF com jsPDF |

---

*Documento gerado automaticamente pela plataforma OPERIS IA. Versão controlada — não modificar manualmente.*
