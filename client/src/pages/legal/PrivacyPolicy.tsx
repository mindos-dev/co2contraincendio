import LegalLayout, { LegalSection, LegalTable, LegalHighlight } from "./LegalLayout";

export default function PrivacyPolicy() {
  return (
    <LegalLayout
      title="Política de Privacidade"
      subtitle="Como o OPERIS coleta, usa e protege os seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)."
      lastUpdated="03 de abril de 2026"
      badge="LGPD CONFORME"
    >
      <LegalHighlight type="info">
        <strong>Controlador de Dados:</strong> CO₂ Contra Incêndio LTDA, CNPJ 29.905.123/0001-53, com sede em Belo Horizonte/MG. Contato do encarregado (DPO): <a href="mailto:co2contraincendio@gmail.com" style={{ color: "#1D4ED8" }}>co2contraincendio@gmail.com</a>
      </LegalHighlight>

      <LegalSection title="1. Quem somos e o que é o OPERIS">
        <p>
          O <strong>OPERIS</strong> é um sistema SaaS de inspeção técnica e gestão de equipamentos de proteção contra incêndio, desenvolvido e operado pela <strong>CO₂ Contra Incêndio LTDA</strong>. A plataforma é utilizada por empresas e profissionais técnicos para registrar inspeções, emitir laudos, gerenciar ativos e garantir conformidade com normas da ABNT, NFPA e Corpo de Bombeiros.
        </p>
        <p style={{ marginTop: 12 }}>
          Esta Política de Privacidade descreve como tratamos os dados pessoais de todos os usuários do OPERIS — incluindo técnicos, administradores e clientes finais — em estrita observância à LGPD.
        </p>
      </LegalSection>

      <LegalSection title="2. Dados que coletamos">
        <p>Coletamos apenas os dados estritamente necessários para a prestação do serviço:</p>
        <LegalTable
          headers={["Categoria", "Dados Coletados", "Origem"]}
          rows={[
            ["Identificação", "Nome completo, e-mail, telefone", "Cadastro do usuário"],
            ["Acesso", "Senha (hash bcrypt), token JWT, IP de acesso", "Login na plataforma"],
            ["Empresa", "Razão social, CNPJ, endereço, contato", "Cadastro de cliente"],
            ["Equipamentos", "Código, tipo, localização, datas de manutenção", "Registro técnico"],
            ["Inspeções", "Dados de vistoria, fotos, laudos, assinaturas", "Atividade técnica"],
            ["Uso da plataforma", "Logs de acesso, ações realizadas, timestamps", "Sistema automático"],
            ["Cookies", "Preferências de sessão, analytics anonimizados", "Navegador do usuário"],
          ]}
        />
        <p style={{ marginTop: 12 }}>
          <strong>Não coletamos</strong> dados sensíveis (saúde, biometria, origem racial, convicção religiosa ou política) nem dados de menores de 18 anos.
        </p>
      </LegalSection>

      <LegalSection title="3. Finalidade e base legal">
        <LegalTable
          headers={["Finalidade", "Base Legal (LGPD)", "Art."]}
          rows={[
            ["Autenticação e controle de acesso", "Execução de contrato", "Art. 7º, V"],
            ["Emissão de laudos e relatórios técnicos", "Execução de contrato", "Art. 7º, V"],
            ["Envio de alertas de vencimento de equipamentos", "Legítimo interesse", "Art. 7º, IX"],
            ["Cumprimento de obrigações regulatórias (ABNT, Bombeiros)", "Obrigação legal", "Art. 7º, II"],
            ["Melhoria contínua da plataforma", "Legítimo interesse", "Art. 7º, IX"],
            ["Comunicações de suporte e atualizações", "Consentimento", "Art. 7º, I"],
            ["Analytics de uso (anonimizados)", "Consentimento", "Art. 7º, I"],
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Compartilhamento de dados">
        <p>Os seus dados <strong>não são vendidos</strong> a terceiros. O compartilhamento ocorre apenas nas seguintes situações:</p>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li style={{ marginBottom: 8 }}><strong>Prestadores de infraestrutura:</strong> servidores em nuvem (Manus Platform) com cláusulas contratuais de proteção de dados;</li>
          <li style={{ marginBottom: 8 }}><strong>Serviço de e-mail:</strong> para envio de alertas e notificações operacionais;</li>
          <li style={{ marginBottom: 8 }}><strong>Autoridades competentes:</strong> quando exigido por lei, ordem judicial ou solicitação do Corpo de Bombeiros;</li>
          <li style={{ marginBottom: 8 }}><strong>Empresa contratante:</strong> dados de inspeções são compartilhados com o cliente que contratou o serviço técnico.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Retenção de dados">
        <LegalTable
          headers={["Tipo de dado", "Período de retenção", "Motivo"]}
          rows={[
            ["Dados de conta (usuário ativo)", "Enquanto a conta estiver ativa", "Prestação do serviço"],
            ["Laudos e inspeções técnicas", "5 anos após emissão", "Obrigação legal / NBR"],
            ["Logs de acesso", "12 meses", "Segurança e auditoria"],
            ["Dados de cookies", "12 meses ou até revogação", "Consentimento"],
            ["Dados após exclusão de conta", "30 dias (backup) + exclusão definitiva", "LGPD Art. 16"],
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Seus direitos como titular (LGPD Art. 18)">
        <p>Você tem os seguintes direitos em relação aos seus dados pessoais:</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
          {[
            { right: "Acesso", desc: "Solicitar confirmação e cópia dos seus dados" },
            { right: "Correção", desc: "Corrigir dados incompletos ou desatualizados" },
            { right: "Exclusão", desc: "Solicitar a exclusão dos seus dados pessoais" },
            { right: "Portabilidade", desc: "Exportar seus dados em formato legível" },
            { right: "Revogação", desc: "Revogar consentimentos dados anteriormente" },
            { right: "Oposição", desc: "Opor-se ao tratamento com base em legítimo interesse" },
          ].map(r => (
            <div key={r.right} style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontWeight: 700, color: "#111", fontSize: 13, marginBottom: 4 }}>{r.right}</div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>{r.desc}</div>
            </div>
          ))}
        </div>
        <LegalHighlight type="success">
          Para exercer qualquer um desses direitos, acesse <strong>Configurações → Privacidade</strong> dentro do OPERIS, ou envie um e-mail para <strong>co2contraincendio@gmail.com</strong> com o assunto "LGPD — [Seu Direito]". Respondemos em até <strong>15 dias úteis</strong>.
        </LegalHighlight>
      </LegalSection>

      <LegalSection title="7. Segurança dos dados">
        <p>Adotamos medidas técnicas e organizacionais para proteger seus dados:</p>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li style={{ marginBottom: 6 }}>Senhas armazenadas com hash <strong>bcrypt</strong> (fator 10)</li>
          <li style={{ marginBottom: 6 }}>Autenticação via <strong>JWT</strong> com expiração de 7 dias</li>
          <li style={{ marginBottom: 6 }}>Comunicações via <strong>HTTPS/TLS 1.3</strong></li>
          <li style={{ marginBottom: 6 }}>Banco de dados com acesso restrito e criptografado em repouso</li>
          <li style={{ marginBottom: 6 }}>Logs de auditoria para todas as operações críticas</li>
          <li style={{ marginBottom: 6 }}>Backups automáticos com retenção de 30 dias</li>
        </ul>
      </LegalSection>

      <LegalSection title="8. Cookies">
        <p>
          Utilizamos cookies para garantir o funcionamento da plataforma e melhorar a experiência do usuário. Para detalhes completos, consulte nossa <a href="/legal/cookies" style={{ color: "#C8102E", textDecoration: "none", fontWeight: 600 }}>Política de Cookies</a>.
        </p>
      </LegalSection>

      <LegalSection title="9. Alterações nesta política">
        <p>
          Esta política pode ser atualizada periodicamente para refletir mudanças legais, tecnológicas ou operacionais. Notificaremos os usuários por e-mail e por aviso na plataforma com antecedência mínima de <strong>15 dias</strong> antes de alterações significativas.
        </p>
      </LegalSection>

      <LegalSection title="10. Contato e DPO">
        <p>Para dúvidas, solicitações ou reclamações relacionadas à privacidade de dados:</p>
        <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 10, padding: "16px 20px", marginTop: 12 }}>
          <div style={{ fontWeight: 700, color: "#111", marginBottom: 8 }}>CO₂ Contra Incêndio LTDA — Encarregado de Dados (DPO)</div>
          <div style={{ fontSize: 13, color: "#4B5563", lineHeight: 2 }}>
            📧 co2contraincendio@gmail.com<br />
            📞 (31) 9 9738-3115<br />
            📍 Belo Horizonte, Minas Gerais<br />
            🏛️ Autoridade Nacional de Proteção de Dados (ANPD): <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" style={{ color: "#C8102E" }}>www.gov.br/anpd</a>
          </div>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
