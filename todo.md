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
