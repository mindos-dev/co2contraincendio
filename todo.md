# CO2 Contra Incêndio - TODO

- [x] Página inicial (Home) com apresentação da empresa e serviços principais
- [x] Página Quem Somos com informações institucionais
- [x] Página Serviços listando todos os serviços
- [x] Página serviço: Sistema Supressão CO2
- [x] Página serviço: Recarga CO2
- [x] Página serviço: Sistema Saponificante
- [x] Página serviço: Hidrantes
- [x] Página serviço: Alarme Incêndio
- [x] Página serviço: Detector de Gás
- [x] Página serviço: Vistoria/Laudo/ART
- [x] Página serviço: Manutenção Preventiva
- [x] Página serviço: Projeto Exaustão
- [x] Página de Contato com formulário
- [x] Seção Blog com listagem de posts
- [x] Página individual de post do blog
- [x] Página Projetos com portfólio
- [x] Página Parceiros
- [x] Navbar responsivo com menu
- [x] Footer com informações da empresa
- [x] Layout wrapper com Navbar e Footer
- [x] ServicePageTemplate para páginas de serviços
- [x] Configurar App.tsx com todas as rotas
- [x] Copiar index.css com estilos globais
- [x] Carrossel na página inicial com as mesmas imagens e estilo do site co2contraincendio.com
- [x] Página /coifas: lapidar ou criar no padrão UL do projeto
- [x] Seção de vídeo impactante na página /coifas
- [x] Formulário de orçamento rápido em /coifas
- [x] Inserir seções Defender e Rotarex na página SistemaSaponificante
- [x] Seções expandidas imagem+texto lateral para Amerex, Defender e Rotarex
- [x] Pesquisar fabricantes: Intelbras, Bral, Seguri Max, Ascavel, Sky Fire
- [x] Gerar artigos de blog sobre detecção de fumaça e alarme de incêndio
- [x] Inserir artigos no banco de dados e exibir na página de blog
- [x] Implementar carrossel de imagens na página inicial
- [x] SEO: meta tags title/description/keywords
- [x] SEO: Open Graph e Twitter Cards
- [x] SEO: canonical URL por página via react-helmet-async
- [x] SEO: Schema.org JSON-LD por página
- [x] SEO: sitemap.xml e robots.txt
- [x] SEO: meta tags dinâmicas por página
- [x] SEO: performance (preload fonts, headers de segurança)
- [x] Adicionar /coifas ao menu de navegação
- [x] Atualizar domínio para co2contra.com em todo o projeto
- [x] Criar imagem Open Graph 1200x630px
- [x] Adicionar meta tag de verificação do Google Search Console
- [x] Adicionar arquivo HTML de verificação do Google Search Console

## Plataforma SaaS — Sprint 1 (Reconstrução Completa)
- [x] Schema do banco de dados com 8 tabelas (saas_companies, saas_users, equipment, maintenanceRecords, documents, accessLogs, alerts, qrCodeScans)
- [x] Migração SQL aplicada com sucesso
- [x] Backend saas-db.ts com todos os helpers de banco de dados
- [x] Backend saas-routers.ts com endpoints completos (auth, equipment, maintenance, QR, documents, alerts, dashboard, scheduler)
- [x] Contexto de autenticação SaaS (SaasAuthContext)
- [x] SaasDashboardLayout com visual industrial nativo do site (navy/vermelho/Barlow)
- [x] Página de login /app/login com visual industrial
- [x] Dashboard /app/dashboard com estatísticas e exportação CSV
- [x] Página de Equipamentos /app/equipamentos com filtro de busca avançado e paginação
- [x] Página de Manutenções /app/manutencoes
- [x] Página de QR Codes /app/qrcodes com geração e impressão
- [x] Página de Alertas /app/alertas com tabelas por status
- [x] Página de Documentos /app/documentos com upload múltiplo drag-and-drop
- [x] Página pública /extintor/:code com visual industrial
- [x] Todas as rotas registradas no App.tsx com SaasAuthProvider
- [x] Usuário admin criado no banco de dados

## Novos Recursos (Sprint 2)
- [x] Filtro de busca avançado em Equipamentos (código, tipo, status, localização, categoria NBR)
- [x] Upload múltiplo de documentos em uma só operação (drag-and-drop multi-arquivo)
- [x] Exportação CSV da lista de equipamentos com status no Dashboard
- [x] Scheduler diário: verificar datas → disparar alertas → registrar evento no banco (backend)
- [x] Backend: procedure equipment.exportCsv (todos os campos + status calculado)
- [x] Backend: procedure documents.uploadMultiple (S3 + banco em lote)
- [x] Backend: job de alertas agendado (cron diário)

## Notificações Automáticas (Sprint 3)
- [x] Backend: módulo notifications.ts (WhatsApp via Evolution API + e-mail via Nodemailer)
- [x] Backend: tabela notification_settings no banco (destinatários, canais, templates)
- [x] Backend: integrar notificações ao runDailyAlertJob
- [x] Backend: procedure saas.notifications.getSettings / saveSettings
- [x] Frontend: página /app/notificacoes com configuração de destinatários e canais
- [x] Frontend: toggle ativar/desativar WhatsApp e e-mail por empresa
- [x] Frontend: campo de número WhatsApp e e-mail do responsável
- [x] Frontend: botão "Testar notificação" para validar configuração
- [x] Secrets: EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE (aguardando credenciais do usuário)
- [x] Secrets: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM (aguardando credenciais do usuário)

## Sprint 4 — Relatório de Uso + Módulo de Clientes Expandido

- [x] Backend: endpoint saas.reports.usage — estatísticas gerais da plataforma
- [x] Backend: endpoint saas.reports.company — relatório detalhado por empresa
- [x] Backend: endpoint saas.reports.exportUsageCsv — exportação CSV da plataforma
- [x] Backend: endpoint saas.importCompanies.fromCsv — importação em lote via CSV
- [x] Frontend: página /app/relatorios com estatísticas, gráficos de barras e exportação CSV
- [x] Frontend: Clientes.tsx expandido com painel de detalhes, relatório por cliente, importação CSV e busca
- [x] Rota /app/relatorios registrada no App.tsx e no menu lateral (adminOnly)

## OPERIS Intelligence Layer — Transformação da Plataforma

### Priority Zero — Correções Críticas
- [x] Corrigir e-mail co2contra.comm → co2contraincendio@gmail.com (Footer.tsx, Contato.tsx)
- [x] Corrigir telefone 97358-1278 → 9 9738-3115 (Contato.tsx, Footer.tsx, Navbar.tsx)
- [x] Conectar formulário de Contato ao endpoint trpc.orcamento.submit

### Knowledge Layer
- [x] Criar módulo server/operis-knowledge.ts com chunks JSON do memorial
- [x] Criar índice semântico com tags por módulo/tipo/keywords
- [x] Criar endpoint tRPC saas.knowledge.search (search_operis)
- [x] Criar endpoint tRPC saas.knowledge.ingest (ingeção de novos documentos)

### Module Connections
- [x] Conectar Equipamentos → QR system (link direto para /extintor/:code)
- [x] Conectar Manutenção → alert system (trigger manual de alerta)
- [x] Corrigir FileReader para readAsDataURL() em PDFs binários
- [x] Adicionar suporte a imagens (.jpg, .png) no upload de documentos

### QR Code Fix
- [x] Exibir imagem PNG do QR Code na página /app/qrcodes
- [x] Adicionar botão "Gerar QR" individual por equipamento

### Intelligent Search UI
- [x] Criar página /app/busca com busca semântica sobre o knowledge base
- [x] Adicionar item "🧠 Busca Inteligente" no menu lateral do SaasDashboardLayout

## OPERIS Comercial — Motor de Vendas e SEO

- [x] Reescrever Projetos.tsx com 7 categorias de portfólio + artigos SEO técnicos
- [x] Expandir ManutencaoPreventiva.tsx com conteúdo robusto e SEO
- [x] Expandir SistemaSaponificante.tsx com seção de projetos e integração OPERIS
- [x] Corrigir navegação: substituir "Projeto de Exaustão" por "PROJETOS" no menu (já estava correto; reorganizado dropdown)
- [x] Adicionar Manutenção e Recarga como destaques no menu de Serviços (seção Contratos em vermelho)
- [x] Integrar links de "Solicitar Vistoria" nas páginas de projeto para o módulo OPERIS (ServicePageTemplate + SistemaSaponificante)

## Sistema de Conteúdo Industrial — Sistemas Pré-Engenheirados

- [x] Pesquisa técnica: Amerex, Rotarex Firetec, Steel Fire, normas ABNT/NFPA
- [x] Página principal: /sistemas-pre-engenheirados (visão geral + 8 categorias)
- [x] Subpágina: /protecao-veiculos-off-road (escavadeiras, colheitadeiras, mineração)
- [x] Subpágina: /protecao-compartimento-motor (water mist + dry chemical + dual agent)
- [x] Subpágina: /protecao-maquinas-cnc (Rotarex FireDETEC)
- [x] Subpágina: /protecao-paineis-eletricos (agentes limpos + CO2)
- [x] Subpágina: /protecao-laboratorios (capelas, armazenamento químico)
- [x] Subpágina: /protecao-maquinas-industriais (injeção, prensas — local vs total flooding)
- [x] Subpágina: /protecao-cozinhas-industriais (wet chemical / saponificante) — já coberto por SistemaSaponificante.tsx
- [x] Subpágina: /aplicacoes-especiais (data centers, telecom, hospitais, offshore, turbinas eólicas, ferroviário, câmaras frias, subestações)
- [x] Artigos de blog técnicos para cada sistema (6 artigos adicionados ao Blog.tsx)
- [x] Integrar rotas no App.tsx e links no Navbar/Footer
- [x] SEO: keywords, H1/H2/H3, FAQ por página (todas as subpáginas têm SEOHead completo)

## Correção UL-Level — Sistemas Pré-Engenheirados + Navegação PROJETOS

- [x] Coletar imagens reais de equipamentos industriais (Amerex, Rotarex, FireDETEC) via CDN
- [x] Coletar logos reais dos fabricantes (Amerex, Rotarex Firetec, FireDETEC, Kidde)
- [x] Reescrever SistemasPreEngenheirados.tsx com padrão visual UL Solutions
- [x] Substituir paleta genérica pela paleta oficial CO2 Contra Incêndio (#0a1628 + vermelho)
- [x] Adicionar seção de logos de fabricantes com imagens reais
- [x] Adicionar imagens reais de instalações industriais em cada card de sistema
- [x] Substituir texto genérico por linguagem técnica nível documentação de fabricante
- [x] Corrigir navegação PROJETOS: convertido para link direto /projetos (sem dropdown)
- [x] Remover item "Exaustão" incorreto do dropdown de PROJETOS

## Sprint UL-Level Concluído — 2 de Abril de 2026

✅ **7 imagens CDN** (logos Amerex, Rotarex, Kidde + fotos industriais)
✅ **SistemasPreEngenheirados.tsx** reescrito com paleta #0a1628 + vermelho
✅ **Navbar limpo**: código morto `projectsMenu` removido, PROJETOS é link direto 100%
✅ **TypeScript 0 erros**
✅ **Servidor rodando** sem warnings

**Próximos passos sugeridos**:
- [x] Criar página /app/usuarios para gestão de usuários (backend já existe)
- [x] Adicionar calculadora interativa de agente extintor em sistemas pré-engenheirados
- [x] Implementar exportação PDF de relatórios (html2canvas + jsPDF)
- [x] Desenvolver apps mobile iOS/Android (React Native + Expo) → substituído por PWA mobile-first
- [x] Criar manifest.json com ícones e configuração PWA
- [x] Adicionar service worker para suporte offline básico
- [x] Ajustar layout responsivo mobile-first no dashboard OPERIS
- [x] Adicionar meta tags Apple/Android para instalação na tela inicial

## Módulo Mobile de Campo — OPERIS Field PWA

- [x] Schema DB: tabelas field_inspections, checklist_answers, inspection_images, field_reports
- [x] Backend tRPC: field-router.ts com createInspection, saveChecklist, uploadImage, generateReport, listReports, syncOffline
- [x] Tela /mobile/nova-vistoria — seleção de tipo (PMOC, Incêndio, Elétrica, Outros)
- [x] Tela /mobile/checklist/:id — checklist dinâmico por tipo com respostas e observações
- [x] Tela /mobile/upload/:id — câmera + galeria + compressão + upload S3
- [x] Tela /mobile/laudo/:id — geração via IA + preview HTML + download PDF (print)
- [x] Tela /mobile/historico — histórico de laudos com filtros por tipo
- [x] Modo offline: hook useOfflineSync.ts com IndexedDB + auto-sync quando online
- [x] Atualizar bottom nav mobile com atalho para Vistoria Mobile (/mobile)
- [x] MobileDashboard /mobile com stats, atalhos rápidos e badge de pendentes offline

## Sprint Push + Assinatura + Histórico Expandido

- [x] Instalar web-push no backend para gerar chaves VAPID e enviar notificações
- [x] Criar tabela push_subscriptions no banco de dados
- [x] Backend: procedure field.subscribePush e field.unsubscribePush
- [x] Backend: integrar push notifications no job de alertas de manutenção vencida
- [x] Service worker: handler para push events e notificações clicáveis
- [x] Frontend: hook usePushNotifications para solicitar permissão e registrar subscription
- [x] Frontend: toggle de push notifications no HistoricoLaudos (Bell/BellOff)
- [x] Assinatura digital: componente SignaturePad.tsx com canvas touch/mouse
- [x] Integrar SignaturePad na tela GerarLaudo.tsx (salvar base64 no banco via S3)
- [x] Backend: campo signature_url na tabela field_reports + procedure saveSignature
- [x] Histórico expandido: filtros por data início/fim e tipo de vistoria
- [x] Backend: atualizar procedure listReports com startDate/endDate
- [x] Frontend: HistoricoLaudos.tsx com filtros de data, tipo e toggle de push

## Integração OPERIS IA — Plataforma Unificada

### Fase 1: Análise e Arquitetura
- [x] Extrair e analisar código FastAPI do OPERIS IA (backend/) — 6.169 linhas Python
- [x] Extrair e analisar telas React do OPERIS IA (frontend/src/)
- [x] Mapear endpoints FastAPI vs procedures tRPC existentes (evitar duplicação)
- [x] Definir arquitetura de integração: portar lógica IA para tRPC TypeScript (arquitetura unificada)
- [x] Planejar estrutura de pastas: server/operis/ para lógica portada

### Fase 2: Backend — Portar Lógica IA para tRPC (Arquitetura Unificada)
- [x] Criar server/operis/ para lógica de IA portada do OPERIS (TypeScript)
- [x] Portar AIRouter (Claude Vision) para server/operis/ai-service.ts usando invokeLLM
- [x] Portar motor de risco híbrido para server/operis/risk-engine.ts (regras + IA)
- [x] Portar geração de laudos para server/operis/report-generator.ts
- [x] Criar server/operis-router.ts com procedures tRPC (getSystems, getChecklist, createInspection, analyzeItem, generateReport, listInspections, getInspection, getReport, saveReportSignature, getPublicReport)
- [x] Adicionar tabelas OPERIS no schema Drizzle (operis_inspections, operis_inspection_items, operis_reports)

### Fase 3: Frontend — Telas React Integradas
- [x] Criar telas React do OPERIS em client/src/pages/operis/
- [x] Adaptar estilos para paleta UL Solutions (#0a1628 + vermelho)
- [x] Usar trpc.operis.* para todas as chamadas (sem FastAPI separado)
- [x] Criar rotas /operis, /operis/nova, /operis/inspecao/:id no App.tsx
- [x] Adicionar link OPERIS IA no menu lateral do SaasDashboardLayout (adminOnly)

### Fase 4: Autenticação Unificada
- [x] JWT SaaS compartilhado nativamente (saasAuthProcedure em todas as procedures OPERIS)
- [x] ctx.saasUser injetado em todas as procedures OPERIS (userId + companyId + role)
- [x] Fluxo: login SaaS → JWT → acesso OPERIS sem re-autenticação

### Fase 5: Multi-tenant
- [x] Campo companyId em todas as tabelas OPERIS (operis_inspections, operis_reports)
- [x] Todas as queries filtram por ctx.saasUser.companyId automaticamente
- [x] Isolamento garantido: empresa A não vê dados da empresa B

### Fase 6: Testes E2E e Entrega
- [x] TypeScript 0 erros em todo o projeto
- [x] Procedure getPublicReport (publicProcedure) para URLs pública de laudos
- [x] Telas OPERIS responsivas (mobile-first)
- [x] Checkpoint salvo e entregue

## Bug: OPERIS não aparece no site
- [x] Diagnosticar por que o módulo OPERIS não estava visível no site (adminOnly: true bloqueava usuários não-admin)
- [x] Corrigir visibilidade do OPERIS: removido adminOnly, agora visível para todos os usuários autenticados

## Sprint Finalização OPERIS — 7 Passos

- [x] Step 1: Tornar getPublicReport PUBLIC (publicProcedure)
- [x] Step 1: Criar tela /operis/laudo/:slug sem autenticação (DOMPurify + print)
- [x] Step 2: Upload de imagem por item no checklist com análise IA automática
- [x] Step 4: KPIs no OperisHome (total inspeções, distribuição risco R1-R5, não-conformidades)
- [x] Step 5: Injetar dados do técnico (nome, empresa) no prompt de geração de laudo
- [x] Step 6: Assinatura digital injetada no HTML do laudo antes do print
- [x] Step 7: Registrar /operis e /operis/laudo no sitemap.xml para SEO

## Painel Admin OPERIS + Compartilhamento de Laudos

- [x] Backend: procedure operis.adminStats (total inspeções, laudos, técnicos, distribuição de risco)
- [x] Backend: procedure operis.adminListInspections (todas as empresas, filtros por status/técnico, paginação)
- [x] Backend: procedure operis.adminListReports (todos os laudos com técnico e empresa)
- [x] Backend: saasAdminProcedure exportada do saas-routers.ts para uso no operis-router.ts
- [x] Frontend: tela /operis/admin com 3 tabs (Inspeções, Laudos, Técnicos) + KPIs
- [x] Frontend: componente ShareButton com modal (copiar link, WhatsApp deep link, e-mail mailto)
- [x] Frontend: botão Compartilhar na tela /operis/laudo/:slug
- [x] Frontend: botão Compartilhar na tela /operis/inspecao/:id após gerar laudo
- [x] Registrar rota /operis/admin no App.tsx e no menu lateral (adminOnly)

## Banner OPERIS IA na Home

- [x] Criar componente OperisHeroBanner.tsx com imagem gerada por IA, texto de destaque e CTA
- [x] Integrar o banner na Home.tsx em posição de destaque (antes do CTA final)

## Logo OPERIS IA — Tipográfica Futurista

- [x] Criar componente OperisLogo.tsx com logo CSS pura (sem imagens), tipografia Barlow Condensed, subtexto persuasivo
- [x] Atualizar OperisHeroBanner para usar a nova logo em destaque
- [x] Integrar OperisLogo no SaasDashboardLayout (sidebar desktop + header mobile)

## Logo OPERIS — Redesign Criativo + Distribuição Estratégica

- [x] Redesenhar OperisLogo.tsx: criativa, institucional, padrão UL, sem futurismo
- [x] Inserir logo OPERIS no rodapé (Footer.tsx) — seção dedicada
- [x] Inserir logo OPERIS no Navbar público — link para plataforma
- [x] Inserir logo OPERIS na página de Serviços (se existir)
- [x] Confirmar logo no banner (OperisHeroBanner) e no SaasDashboardLayout

## Integração Anthropic claude-3-haiku no OPERIS

- [x] Configurar ANTHROPIC_API_KEY via secrets
- [x] Instalar @anthropic-ai/sdk
- [x] Criar server/operis/anthropic-client.ts com cliente Anthropic
- [x] Atualizar ai-service.ts para usar claude-3-haiku diretamente
- [x] Testar fluxo analyzeItem e generateReport com Anthropic

## Padronização de Branding OPERIS (Enforcement Global)

- [x] Substituir "Plataforma" por "OPERIS" em Navbar (desktop + mobile)
- [x] Substituir "Plataforma OPERIS" por "OPERIS" em ServicePageTemplate
- [x] Substituir "Acessar Plataforma" por "Acessar OPERIS" em OperisHeroBanner
- [x] Substituir em SistemaSaponificante, SistemasPreEngenheirados, AplicacoesEspeciais, ManutencaoPreventiva
- [x] Substituir em Projetos.tsx e AdminOperis.tsx
- [x] Validação final: 0 termos proibidos, 7 CTAs "Acessar OPERIS" ativos, 0 erros TypeScript

## FAQ OPERIS — Perguntas Frequentes na OperisHome

- [x] Criar seção FAQ com accordion na OperisHome (/operis)
- [x] 8 perguntas cobrindo: o que é OPERIS, como criar inspeção, como gerar laudo, como compartilhar, normas suportadas, como adicionar técnicos, como acessar laudos anteriores
- [x] Integrar FAQ após a lista de inspeções recentes na OperisHome

## Sprint: Sugestões de Próximos Passos (02/04/2026)

- [x] Página /app/usuarios — listar, cadastrar e editar usuários com role (admin/tecnico/user)
- [x] Backend: procedures saas.listUsers, saas.createUser, saas.updateUserRole
- [x] Envio de e-mail SMTP pelo servidor para compartilhamento de laudos
- [x] Backend: procedure operis.sendLaudoEmail (nodemailer + SMTP)
- [x] Frontend: botão "Enviar por E-mail" no ShareButton chama procedure em vez de mailto

## Página de Detalhes do Equipamento com QR Code

- [x] Procedure saas.equipment.getWithHistory (equipamento + manutenções + documentos)
- [x] Página /app/equipamentos/:id com QR Code, dados técnicos e timeline de manutenções
- [x] Página pública /equipamento/:code acessível via QR Code (sem login)
- [x] Link "Ver Detalhes" na tabela de equipamentos
- [x] Botão "Imprimir QR Code" na página de detalhes

## Sprint: Cadastro, Login e Recuperação de Senha OPERIS

- [x] Adicionar coluna `resetToken` e `resetTokenExpiry` na tabela `saas_users` (schema + migration)
- [x] Backend: procedure `saas.auth.register` (cadastro público com nome, e-mail, senha)
- [x] Backend: procedure `saas.auth.forgotPassword` (gera token e envia e-mail)
- [x] Backend: procedure `saas.auth.resetPassword` (valida token e redefine senha)
- [x] Frontend: página `/app/cadastro` (SaasCadastro.tsx)
- [x] Frontend: página `/app/esqueci-senha` (SaasEsqueciSenha.tsx)
- [x] Frontend: página `/app/redefinir-senha` (SaasRedefinirSenha.tsx)
- [x] Atualizar SaasLogin.tsx com links para cadastro e esqueci senha
- [x] Registrar novas rotas no App.tsx
- [x] Testes vitest para register, forgotPassword e resetPassword

## Sprint: OPERIS Enterprise Transformation

- [x] Design system industrial dark: CSS vars (#0B0F19, #111827, #2563EB) no index.css
- [x] Componentes base: OperisCard, StatusBadge, KPIWidget, ChartContainer, DataTable, EmptyState
- [x] Refatorar SaasDashboardLayout: sidebar Procore-style com grupos (Operations, Engineering, Financial, Intelligence, Settings)
- [x] Dashboard enterprise: KPIs (OS, Riscos, Receita), gráficos Recharts (bar, line, pie), heatmap de risco, timeline de atividades
- [x] Página OS (/app/os): timeline de estados Open→InProgress→Waiting→Completed→Billed
- [x] Checklist mobile-first (/app/checklist): botões C/NC/NA, barra de progresso, footer sticky
- [x] Atualizar App.tsx com novas rotas /app/os e /app/checklist

## Sprint: OPERIS Enterprise Transformation

- [x] Design system industrial dark: CSS vars (#0B0F19, #111827, #2563EB) no index.css
- [x] Componentes base: OperisCard, StatusBadge, KPIWidget, ChartContainer, DataTable, EmptyState
- [x] Refatorar SaasDashboardLayout: sidebar Procore-style com grupos (Operations, Engineering, Financial, Intelligence, Settings)
- [x] Dashboard enterprise: KPIs (OS, Riscos, Receita), graficos Recharts (bar, line, pie), heatmap de risco, timeline de atividades
- [x] Pagina OS (/app/os): timeline de estados Open->InProgress->Waiting->Completed->Billed
- [x] Checklist mobile-first (/app/checklist): botoes C/NC/NA, barra de progresso, footer sticky
- [x] Atualizar App.tsx com novas rotas /app/os e /app/checklist

## Sprint: Camada Legal LGPD + Compliance (Big Tech Level)

- [x] Página /legal/privacy — Política de Privacidade LGPD completa
- [x] Página /legal/terms — Termos de Uso do OPERIS
- [x] Página /legal/cookies — Política de Cookies (essenciais, desempenho, analytics)
- [x] Página /legal/security — Segurança & Dados (infraestrutura, boas práticas)
- [x] Página /legal/compliance — Compliance / Governança (normas, auditoria, logs)
- [x] CookieBanner — banner fixo inferior com aceitar/configurar, localStorage, responsivo
- [x] Backend: procedure lgpd.exportData (exportar dados do usuário)
- [x] Backend: procedure lgpd.deleteRequest (solicitar exclusão de dados)
- [x] Backend: procedure lgpd.saveConsent (registrar aceite de cookies com timestamp)
- [x] Footer: adicionar links legais (Privacidade, Termos, Cookies, Segurança, Compliance)
- [x] App.tsx: registrar rotas /legal/* e integrar CookieBanner

## Sprint: Camada Legal LGPD + Compliance (Big Tech Level)

- [x] Pagina /legal/privacy - Politica de Privacidade LGPD completa
- [x] Pagina /legal/terms - Termos de Uso do OPERIS
- [x] Pagina /legal/cookies - Politica de Cookies
- [x] Pagina /legal/security - Seguranca e Dados
- [x] Pagina /legal/compliance - Compliance / Governanca
- [x] CookieBanner - banner fixo inferior com aceitar/configurar, localStorage, responsivo
- [x] Backend: procedure lgpd.exportData
- [x] Backend: procedure lgpd.deleteRequest
- [x] Backend: procedure lgpd.saveConsent
- [x] Footer: adicionar links legais
- [x] App.tsx: registrar rotas /legal/* e integrar CookieBanner

## Sprint: Redesign Login + Cadastro (Posicionamento Institucional OPERIS)
- [x] Redesenhar SaasLogin.tsx com painel institucional expandido (texto técnico, credenciais normativas, selo)
- [x] Redesenhar SaasCadastro.tsx com mesmo padrão visual do login

## Sprint: SMTP Real + E-mail OS + Perfil do Técnico

- [x] Configurar SMTP real via secrets (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM) — já implementado em notifications.ts
- [x] Atualizar helper sendEmail para usar variáveis de ambiente SMTP — já implementado
- [x] Template HTML de e-mail de confirmação de OS (criação e conclusão) — buildOsEmail() em notifications.ts
- [x] Procedure saas.workOrders.create dispara e-mail de confirmação — linha 807 saas-routers.ts
- [x] Procedure saas.workOrders.updateStatus dispara e-mail ao concluir OS — linha 846 saas-routers.ts
- [x] Tabela saas_user_profiles (cargo, crea, bio, avatarUrl) — campos adicionados em saas_users
- [x] Migration e aplicação da tabela de perfis
- [x] Procedure saas.perfil.get, saas.perfil.update e saas.perfil.uploadAvatar
- [x] Página /app/perfil com formulário de edição (nome, cargo, CREA, telefone, bio)
- [x] Upload de foto de perfil via S3
- [x] Link "Meu Perfil" no footer do SaasDashboardLayout (botão UserCircle)
- [x] Rota /app/perfil registrada no App.tsx
- [x] Testes vitest para e-mail de OS e perfil (perfil-vistoria.test.ts — 4 testes buildOsEmail)

## REGRA INEGOCIÁVEL — OPERIS visível em todas as páginas do site

- [x] Criar componente OperisFloatingCTA.tsx — botão flutuante fixo (bottom-left) com escudo OPERIS + texto em todas as páginas públicas
- [x] Adicionar strip OPERIS no top bar do Navbar (link "OPERIS IA — Acessar Plataforma" destacado em vermelho)
- [x] Melhorar link OPERIS no desktop nav com fundo vermelho sutil
- [x] Melhorar link OPERIS no menu mobile com card destacado
- [x] OperisFloatingCTA visível em TODAS as rotas públicas via Layout.tsx

## FASE ESTRATÉGICA — Monetização + Receita Recorrente (MRR)

- [x] Configurar Stripe no projeto (webdev_add_feature stripe)
- [x] Criar produtos e preços: Basic R$29/mês, Pro R$59/mês, Industrial R$99/mês (billing-plans.ts)
- [x] Schema: tabela subscriptions e subscription_invoices no Drizzle
- [x] Migração SQL aplicada no banco
- [x] Backend: billing-router.ts com procedures listPlans, getSubscription, createCheckout, cancelSubscription, getInvoices, getFinancialDashboard, startTrial
- [x] Backend: webhook /api/stripe/webhook (billing-webhook.ts) com checkout.session.completed, invoice.paid, customer.subscription.updated, customer.subscription.deleted
- [x] Backend: billingRouter registrado no routers.ts principal
- [x] Frontend: página pública /planos com cards dos 3 planos, CTA checkout + trial 7 dias
- [x] Frontend: página /app/assinatura com status, upgrade, histórico de faturas
- [x] Frontend: dashboard financeiro /app/financeiro-mrr com MRR, clientes ativos, inadimplentes, ticket médio
- [x] Link "Planos & Preços" no top bar do Navbar público
- [x] Links "Assinatura" e "MRR Dashboard" no grupo Financial do sidebar OPERIS
- [x] Testes vitest para webhook e lógica de paywall (billing.test.ts — 16 testes)

## Sprint: Todas as Sugestões — Implementação Completa

### Módulo de Vistorias de Imóveis (dentro do OPERIS)
- [x] Schema: tabelas property_inspections, inspection_rooms, room_items, inspection_signatures
- [x] Migração SQL aplicada no banco
- [x] Backend: vistoriaRouter com procedures create, addRoom, updateItem, uploadPhoto, sign, generateReport, list, get
- [x] Frontend: página /operis/vistorias — listagem de vistorias com status (VistoriasList.tsx)
- [x] Frontend: página /operis/vistorias/nova — wizard 4 passos (NovaVistoria.tsx)
- [x] Frontend: página /operis/vistorias/:id — detalhes, checklist por cômodo, fotos, assinatura (VistoriaDetalhes.tsx)
- [x] Frontend: página /operis/vistorias/:id/laudo — laudo público (LaudoPublico.tsx)
- [x] Link "Vistorias de Imóveis" no menu lateral do OPERIS (SaasDashboardLayout)
- [x] Rota /operis/vistorias registrada no App.tsx

### Cadastro de Equipamentos Expandido (ABNT NBR Completo)
- [x] Schema: campos norma_abnt, peso_kg, capacidade_agente, tag_patrimonio, certificacao_inmetro, fabricante, modelo, numero_serie, data_fabricacao, pressao_operacao, temperatura_operacao, classe_fogo, area_cobertura_m2, instrucoes_manutencao adicionados
- [x] Migração SQL aplicada
- [x] Backend: procedure equipment.create e equipment.update expandidos com novos campos
- [x] Frontend: wizard de cadastro por tipo (Extintor CO2 / Hidrante / Sprinkler / Detector / Painel / CO2 Fixo)
- [x] Frontend: campos específicos por tipo com tooltips explicando a norma ABNT
- [x] Frontend: ficha técnica completa na página /app/equipamentos/:id

### SMTP Real + E-mails Automáticos de OS
- [x] Configurar SMTP real via secrets (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM) — já implementado
- [x] Atualizar helper sendEmail para usar variáveis de ambiente SMTP reais — já implementado
- [x] Template HTML de e-mail de confirmação de abertura de OS — buildOsEmail() com status 'criada'
- [x] Template HTML de e-mail de conclusão de OS — buildOsEmail() com status 'concluida'
- [x] Procedure saas.workOrders.create dispara e-mail de confirmação ao criar OS — linha 807
- [x] Procedure saas.workOrders.updateStatus dispara e-mail ao concluir OS — linha 846

### Paywall — Controle de Acesso por Plano
- [x] Frontend: componente PaywallGuard.tsx integrado no SaasDashboardLayout (desktop + mobile)
- [x] PaywallGuard verifica assinatura ativa (active/trialing) e exibe tela de bloqueio com CTA para /planos
- [x] Rotas livres sem paywall: /app/assinatura, /app/perfil, /app/dashboard
- [x] Admins têm acesso total sem verificação de assinatura

### Testes Vitest
- [x] Teste: billing.test.ts — 16 testes cobrindo planos, isSubscriptionActive, webhook e paywall
- [x] Teste: saas.perfil.update — verifica atualização de perfil (perfil-vistoria.test.ts)
- [x] Teste: vistoria.create e vistoria.sign — verifica fluxo de vistoria (perfil-vistoria.test.ts)

## Melhorias Pós-Auditoria Big Tech (Abril 2026)

### Paginação cursor-based
- [x] Atualizar `getEquipmentFiltered` no `saas-db.ts` para suportar cursor + limit
- [x] Atualizar `getAllMaintenance` no `saas-db.ts` para suportar cursor + limit
- [x] Atualizar `getWorkOrders` no `saas-db.ts` para suportar cursor + limit
- [x] Atualizar procedure `saas.equipment.list` com parâmetros `cursor` e `limit`
- [x] Atualizar procedure `saas.maintenance.list` com parâmetros `cursor` e `limit`
- [x] Atualizar `Equipamentos.tsx` com botão "Carregar mais" e estado de paginação
- [x] Atualizar `Manutencoes.tsx` com botão "Carregar mais" e estado de paginação

### Índices de banco de dados
- [x] Adicionar índice composto `(companyId, createdAt)` na tabela `equipment`
- [x] Adicionar índice composto `(companyId, serviceDate)` na tabela `maintenanceRecords`
- [x] Adicionar índice composto `(companyId, createdAt)` na tabela `workOrders`
- [x] Adicionar índice `(companyId, status)` na tabela `equipment`
- [x] Gerar migration e aplicar via SQL

### Rate limiter e resiliência
- [x] Ajustar rate limiter para 500 req/min em rotas de leitura (aumentado de 300)
- [x] Adicionar header `Retry-After` nas respostas 429
- [x] Criar script de teste de carga `scripts/load-test.mjs`

## Melhorias Pós-Auditoria Big Tech (Abril 2026)

### Fase 1 — Paginação Cursor-Based
- [x] Paginação cursor-based em getAllMaintenance (saas-db.ts)
- [x] Paginação cursor-based em getWorkOrders (saas-db.ts)
- [x] Procedure maintenance.listAll atualizada com cursor/limit
- [x] Procedure workOrders.list atualizada com cursor/limit
- [x] Manutencoes.tsx adaptado para useEffect + botão "Carregar mais"
- [x] OrdemServico.tsx adaptado para useEffect + botão "Carregar mais"

### Fase 2 — Índices de Banco de Dados
- [x] Índices compostos adicionados no schema.ts (equipment, maintenanceRecords, workOrders)
- [x] Migration SQL gerada (0013_chilly_swordsman.sql)
- [x] 7 índices aplicados no banco de dados (idx_equipment_company_created, idx_equipment_company_status, idx_equipment_company_next_maint, idx_maint_equipment_date, idx_maint_created, idx_wo_company_status, idx_wo_company_created)

### Fase 3 — Rate Limiter e Teste de Carga
- [x] Rate limiter melhorado: Retry-After header em todos os limiters
- [x] Upload limiter separado (30 req/min) para endpoints de upload
- [x] Limite geral aumentado de 300 para 500 req/min
- [x] Script de teste de carga criado (scripts/load-test.mjs)
- [x] Teste de carga executado: 100 usuários × 3 req = 100% sucesso, P50=503ms, zero rate limiting

## Auditoria E2E Completa — Correções (Abril 2026)

- [x] Corrigir: createSaasUser (saas-routers.ts:320) retorna resultado bruto do INSERT — retornar apenas campos seguros
- [x] Corrigir: banner "Modo demonstração" no Checklist.tsx quando DEMO_ITEMS é usado
- [x] Corrigir: índices adicionais em tabelas secundárias (documents, checklist_executions) — 5 índices criados
- [x] Migrar tabela documents para schema atual (companyId, equipmentId, documentNumber, extractedData, processingStatus)
- [x] Aplicar todas as migrations pendentes (0001-0014)

## Módulo ART OPERIS — Responsabilidade Técnica Digital

### Fase 1 — Schema DB
- [x] Tabela art_services (cadastro de serviço técnico)
- [x] Tabela art_evidences (fotos, vídeos, NF-e com hash SHA256)
- [x] Tabela art_approvals (fluxo técnico → engenheiro)
- [x] Tabela art_payments (pagamento por ART ou plano premium)
- [x] Migration SQL aplicada no banco (0015)

### Fase 2 — Backend (server/art-router.ts)
- [x] Procedure art.create (cadastrar serviço + declaração do técnico)
- [x] Procedure art.uploadEvidence (upload S3 + hash SHA256 + geolocalização)
- [x] Procedure art.submit (enviar para aprovação)
- [x] Procedure art.approve / art.reject (engenheiro aprova/reprova)
- [x] Procedure art.generatePdf (gerar PDF após aprovação via LLM + S3)
- [x] Procedure art.checkAccess (verificar plano premium ou pagamento)
- [x] Procedure art.ocrInvoice (IA: OCR de nota fiscal via invokeLLM)
- [x] Procedure art.validateAntifraud (IA: validação antifraude)
- [x] Integrar art-router no server/routers.ts

### Fase 3 — Frontend
- [x] Página /app/art (listagem de ARTs — ArtOperis.tsx)
- [x] Página /app/art/nova (cadastro de serviço + upload de evidências — ArtDetalhe.tsx)
- [x] Página /app/art/:id (detalhes + fluxo de aprovação — ArtDetalhe.tsx)
- [x] Item "ART OPERIS" no menu lateral do SaasDashboardLayout
- [x] Paywall para plano não-premium (banner + checkout Stripe)

### Fase 4 — PDF + Stripe
- [x] Geração de PDF da ART com jsPDF (client-side, exportArtPdf.ts)
- [x] Botão "Baixar PDF" na página de detalhes (apenas ARTs aprovadas)
- [x] Checkout Stripe para pagamento por ART (R$ 49,00)
- [x] Webhook Stripe para liberar ART após pagamento
- [x] 12 testes unitários: antifraude SHA256, monetização, fluxo de status

## Sugestões Pós-ART OPERIS (Abril 2026)

### Painel do Engenheiro Aprovador
- [x] Backend: procedure art.listPendingApprovals (todas as ARTs aguardando de todas as empresas)
- [x] Frontend: página /app/art/aprovacoes (adminOnly) com listagem em lote
- [x] Frontend: botões aprovar/reprovar em lote com campo de comentário
- [x] Menu lateral: item "Aprovações ART" visível apenas para admin

### Notificações Automáticas de ART
- [x] Backend: notificar engenheiro (WhatsApp/e-mail) quando ART é submetida (via notifyOwner)
- [x] Backend: notificar técnico (WhatsApp/e-mail) quando ART é aprovada/reprovada (via notifyOwner)
- [x] Integrar com módulo notifications.ts existente

### Numeração Sequencial ART-YYYY-NNNN
- [x] Schema: coluna artNumber (VARCHAR 20) na tabela art_services
- [x] Migration SQL aplicada no banco (0016)
- [x] Backend: gerar número sequencial por ano (ART-2026-0001, ART-2026-0002...)
- [x] PDF: exibir número oficial no cabeçalho do PDF gerado

### Skill Reutilizável art-operis-module
- [x] Inicializar skill com init_skill.py
- [x] Escrever SKILL.md com processo completo (5 fases + pitfalls + testing checklist)
- [x] Criar references/schema.md com schema das tabelas
- [x] Criar references/pdf-structure.md com guia completo de PDF jsPDF
- [x] Validar com quick_validate.py (Skill is valid!)
- [x] Entregar ao usuário

## Implementação Final — Módulo ART + Skill Completa (Abril 2026)

### Backend — Procedures faltantes
- [x] Procedure art.ocrInvoice (OCR de NF-e via LLM — extração de dados estruturados)
- [x] Procedure art.checkAccess (verificar plano premium ou pagamento antes de criar ART)
- [x] Procedure art.deleteEvidence (remover evidência antes da submissão)

### Skill art-operis-module — Enriquecimento
- [x] Script scripts/migrate-art-tables.sql (migração reutilizável das 3 tabelas)
- [x] Template templates/art-test-template.ts (template de testes reutilizável)
- [x] Reference references/procedures.md (lista completa das 14 procedures com inputs/outputs)
- [x] Validar skill com quick_validate.py
- [x] Entregar skill ao usuário

## Correções de Bug (Abril 2026)
- [x] Corrigir tagline duplicado na seção OPERIS da página Home
- [x] Auditar todas as páginas e componentes em busca de conteúdo duplicado
- [x] Corrigir todos os problemas de duplicação encontrados (ExtintorPublico.tsx + arquivo .bak residual removido) ("Conformidade que protege. Tecnologia que comprova." aparece duas vezes)
- [x] Corrigir erro de inserção na tabela property_inspections (/operis/vistorias/nova) — usuário sem companyId vinculado + middleware de refresh de companyId

## Sprint OPERIS Vistorias 2026 (Abril 2026)
- [x] Layout full-width com stepper (passo a passo) no formulário /operis/vistorias/nova
- [x] Auto-preenchimento de endereço via ViaCEP (CEP → Rua, Bairro, Cidade)
- [x] Validação de CPF/CNPJ em tempo real com máscara e indicador visual (verde/vermelho)
- [x] Upload de fotos por cômodo com timestamp e geolocalização (Drag & Drop + legenda)
- [x] Backend: procedure vistoria.uploadItemPhoto com storagePut + metadata timestamp/geo- [x] Checklist da Reforma Tributária: Redutor Social R$600 (LC 214/2025) + Cláusula de Vigência
- [x] Widget "Radar Jurídico" no dashboard de vistorias (alertas da Lei 2026)
- [x] Geração de contrato inteligente com cláusulas da Lei 8.245/91 atualizada 2026
- [x] Schema: adicionar campos redutorSocial, clausulaVigencia, garantiaType na tabela property_inspections
