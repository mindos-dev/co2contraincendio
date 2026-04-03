import LegalLayout, { LegalSection, LegalTable, LegalHighlight } from "./LegalLayout";
import { Shield, Lock, Server, Eye, RefreshCw, AlertTriangle } from "lucide-react";

export default function Security() {
  const pillars = [
    { icon: <Lock size={20} color="#C8102E" />, title: "Autenticação Segura", desc: "Senhas com bcrypt, JWT com expiração, tokens de reset com TTL de 1 hora" },
    { icon: <Server size={20} color="#C8102E" />, title: "Infraestrutura Isolada", desc: "Banco de dados MySQL/TiDB com acesso restrito por variáveis de ambiente" },
    { icon: <Eye size={20} color="#C8102E" />, title: "Auditoria Completa", desc: "Logs de todas as ações críticas com timestamp, IP e usuário" },
    { icon: <RefreshCw size={20} color="#C8102E" />, title: "Backups Automáticos", desc: "Snapshots diários com retenção de 30 dias e restore testado mensalmente" },
    { icon: <Shield size={20} color="#C8102E" />, title: "Transmissão Criptografada", desc: "HTTPS/TLS 1.3 em todas as comunicações entre cliente e servidor" },
    { icon: <AlertTriangle size={20} color="#C8102E" />, title: "Resposta a Incidentes", desc: "Protocolo de notificação em até 72h conforme LGPD Art. 48" },
  ];

  return (
    <LegalLayout
      title="Segurança & Dados"
      subtitle="Como o OPERIS protege seus dados e garante a integridade das informações técnicas armazenadas na plataforma."
      lastUpdated="03 de abril de 2026"
      badge="SEGURANÇA DA INFORMAÇÃO"
    >
      <LegalHighlight type="success">
        O OPERIS foi desenvolvido seguindo as melhores práticas de segurança da informação (OWASP Top 10) e em conformidade com a LGPD. A segurança dos dados dos nossos clientes é uma prioridade não negociável.
      </LegalHighlight>

      <LegalSection title="1. Pilares de segurança">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
          {pillars.map(p => (
            <div key={p.title} style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 10, padding: "14px 16px", display: "flex", gap: 12 }}>
              <div style={{ flexShrink: 0, marginTop: 2 }}>{p.icon}</div>
              <div>
                <div style={{ fontWeight: 700, color: "#111", fontSize: 13, marginBottom: 4 }}>{p.title}</div>
                <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.6 }}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </LegalSection>

      <LegalSection title="2. Autenticação e controle de acesso">
        <LegalTable
          headers={["Mecanismo", "Implementação", "Padrão"]}
          rows={[
            ["Hash de senha", "bcrypt com fator de custo 10", "OWASP ASVS 2.1"],
            ["Sessão", "JWT assinado com HS256, expiração 7 dias", "RFC 7519"],
            ["Reset de senha", "Token hexadecimal de 32 bytes, TTL 1 hora", "OWASP ASVS 2.5"],
            ["Controle de acesso", "RBAC (superadmin, admin, técnico, cliente)", "OWASP ASVS 4.1"],
            ["Proteção CSRF", "Tokens de sessão validados por requisição", "OWASP ASVS 4.2"],
            ["Rate limiting", "Limitação de tentativas de login por IP", "OWASP ASVS 2.2"],
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Infraestrutura e armazenamento">
        <p>O OPERIS opera sobre infraestrutura gerenciada com as seguintes características:</p>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>Banco de dados:</strong> MySQL/TiDB com conexão via SSL obrigatória. Credenciais nunca expostas no código-fonte — gerenciadas via variáveis de ambiente seguras.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Armazenamento de arquivos:</strong> documentos, laudos e imagens armazenados em S3 com chaves aleatórias não enumeráveis. Acesso via URLs pré-assinadas com expiração.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Servidor de aplicação:</strong> Node.js com Express, executando em ambiente isolado com variáveis de ambiente injetadas pela plataforma de hospedagem.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>CDN e assets:</strong> arquivos estáticos servidos via CDN com headers de segurança (CSP, X-Frame-Options, HSTS).
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Proteção de dados em trânsito e em repouso">
        <LegalTable
          headers={["Camada", "Proteção", "Detalhe"]}
          rows={[
            ["Em trânsito (cliente → servidor)", "TLS 1.3", "HTTPS obrigatório em todas as rotas"],
            ["Em trânsito (servidor → banco)", "SSL/TLS", "Conexão criptografada com certificado verificado"],
            ["Em repouso (banco de dados)", "Criptografia AES-256", "Dados criptografados no disco pelo provedor"],
            ["Em repouso (arquivos S3)", "AES-256-GCM", "Criptografia server-side pelo provedor de storage"],
            ["Senhas", "bcrypt hash", "Nunca armazenadas em texto claro"],
            ["Tokens de API", "Variáveis de ambiente", "Nunca no código-fonte ou logs"],
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Logs e auditoria">
        <p>
          O OPERIS mantém registros de auditoria para todas as operações críticas. Esses logs são utilizados para detectar acessos não autorizados, investigar incidentes e garantir a rastreabilidade das ações.
        </p>
        <LegalTable
          headers={["Evento auditado", "Dados registrados", "Retenção"]}
          rows={[
            ["Login / Logout", "Usuário, IP, timestamp, resultado", "12 meses"],
            ["Criação de laudo", "Usuário, ID do laudo, timestamp", "5 anos"],
            ["Alteração de dados de equipamento", "Usuário, campo alterado, valor anterior, timestamp", "12 meses"],
            ["Solicitação LGPD (exclusão/exportação)", "Usuário, tipo de solicitação, timestamp, status", "5 anos"],
            ["Tentativas de login falhas", "IP, timestamp, motivo", "90 dias"],
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Resposta a incidentes">
        <p>Em caso de incidente de segurança que possa afetar dados pessoais, a CO₂ Contra Incêndio seguirá o protocolo:</p>
        <div style={{ marginTop: 12, position: "relative", paddingLeft: 24 }}>
          {[
            { time: "0–2h", action: "Detecção e contenção do incidente" },
            { time: "2–24h", action: "Avaliação do impacto e identificação dos titulares afetados" },
            { time: "24–48h", action: "Notificação interna e acionamento do DPO" },
            { time: "Até 72h", action: "Notificação à ANPD (conforme LGPD Art. 48) e aos titulares afetados" },
            { time: "Pós-incidente", action: "Relatório de causa raiz e medidas corretivas implementadas" },
          ].map((step, i) => (
            <div key={i} style={{ display: "flex", gap: 16, marginBottom: 16, position: "relative" }}>
              <div style={{ width: 80, flexShrink: 0, fontWeight: 700, color: "#C8102E", fontSize: 12 }}>{step.time}</div>
              <div style={{ fontSize: 13, color: "#374151" }}>{step.action}</div>
            </div>
          ))}
        </div>
      </LegalSection>

      <LegalSection title="7. Boas práticas recomendadas ao usuário">
        <LegalHighlight type="warning">
          A segurança é uma responsabilidade compartilhada. Recomendamos que todos os usuários do OPERIS adotem as seguintes práticas:
        </LegalHighlight>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li style={{ marginBottom: 6 }}>Use senhas fortes (mínimo 8 caracteres, letras, números e símbolos);</li>
          <li style={{ marginBottom: 6 }}>Não compartilhe suas credenciais com colegas — cada técnico deve ter seu próprio acesso;</li>
          <li style={{ marginBottom: 6 }}>Faça logout ao usar dispositivos compartilhados;</li>
          <li style={{ marginBottom: 6 }}>Reporte imediatamente qualquer atividade suspeita para co2contraincendio@gmail.com;</li>
          <li style={{ marginBottom: 6 }}>Mantenha o navegador atualizado para garantir suporte a TLS 1.3.</li>
        </ul>
      </LegalSection>

      <LegalSection title="8. Contato de segurança">
        <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 10, padding: "16px 20px" }}>
          <div style={{ fontWeight: 700, color: "#111", marginBottom: 8 }}>Reportar vulnerabilidade ou incidente</div>
          <div style={{ fontSize: 13, color: "#4B5563", lineHeight: 2 }}>
            📧 co2contraincendio@gmail.com (assunto: "SEGURANÇA — [descrição breve]")<br />
            📞 (31) 9 9738-3115<br />
            ⏱️ Resposta em até 24 horas úteis
          </div>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
