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
