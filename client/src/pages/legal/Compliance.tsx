import LegalLayout, { LegalSection, LegalTable, LegalHighlight } from "./LegalLayout";

export default function Compliance() {
  return (
    <LegalLayout
      title="Compliance & Governança"
      subtitle="Conformidade normativa, auditoria, registro de atividades e transparência operacional do OPERIS."
      lastUpdated="03 de abril de 2026"
      badge="GOVERNANÇA CORPORATIVA"
    >
      <LegalHighlight type="success">
        O OPERIS foi desenvolvido para atender empresas que precisam demonstrar conformidade regulatória perante o Corpo de Bombeiros, seguradoras, auditorias internas e clientes exigentes. Toda a arquitetura da plataforma foi pensada para ser auditável.
      </LegalHighlight>

      <LegalSection title="1. Normas e regulamentos aplicáveis">
        <p>O OPERIS suporta o cumprimento das seguintes normas e regulamentos:</p>
        <LegalTable
          headers={["Norma / Lei", "Escopo", "Como o OPERIS apoia"]}
          rows={[
            ["LGPD — Lei nº 13.709/2018", "Proteção de dados pessoais", "Consentimento, exportação e exclusão de dados, DPO designado"],
            ["ABNT NBR 12615", "Sistemas de extinção por CO₂", "Checklists de inspeção baseados na norma"],
            ["ABNT NBR 14276", "Brigada de incêndio", "Registro de treinamentos e certificações"],
            ["ABNT NBR 17240", "Sistemas de detecção e alarme", "Gestão de equipamentos e manutenções"],
            ["NFPA 12", "CO₂ Extinguishing Systems", "Parâmetros técnicos nos laudos"],
            ["Instrução Técnica CBMMG", "Corpo de Bombeiros MG", "Laudos e ARTs em conformidade"],
            ["Marco Civil da Internet — Lei nº 12.965/2014", "Logs de acesso", "Retenção de logs por 12 meses"],
          ]}
        />
      </LegalSection>

      <LegalSection title="2. Auditoria e rastreabilidade">
        <p>
          Toda ação realizada no OPERIS é registrada com <strong>timestamp UTC</strong>, identificação do usuário e endereço IP. Esses registros formam uma trilha de auditoria completa que pode ser consultada por administradores e apresentada em auditorias externas.
        </p>
        <p style={{ marginTop: 12 }}>
          Os logs de auditoria são armazenados de forma separada dos dados operacionais, com acesso restrito ao nível de administrador e ao DPO. Nenhum log pode ser alterado ou excluído por usuários comuns.
        </p>
        <LegalTable
          headers={["Categoria de log", "Retenção", "Acesso"]}
          rows={[
            ["Autenticação (login/logout)", "12 meses", "Admin, DPO"],
            ["Criação e emissão de laudos", "5 anos", "Admin, DPO, Auditor externo"],
            ["Alterações em equipamentos", "12 meses", "Admin"],
            ["Solicitações LGPD", "5 anos", "DPO"],
            ["Erros de sistema (server logs)", "90 dias", "Admin técnico"],
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Controles de acesso e segregação de funções">
        <p>O OPERIS implementa controle de acesso baseado em papéis (RBAC) com 4 níveis:</p>
        <LegalTable
          headers={["Papel", "Permissões", "Responsabilidade"]}
          rows={[
            ["Superadmin", "Acesso total ao sistema, gestão de empresas", "CO₂ Contra Incêndio LTDA"],
            ["Admin", "Gestão de usuários, equipamentos, relatórios da empresa", "Empresa contratante"],
            ["Técnico", "Inspeções, laudos, manutenções, checklists", "Profissional habilitado"],
            ["Cliente", "Visualização de laudos e equipamentos próprios", "Cliente final"],
          ]}
        />
        <p style={{ marginTop: 12 }}>
          A segregação de funções garante que nenhum usuário tenha acesso a dados de outras empresas, e que operações críticas (como exclusão de laudos) requeiram nível de administrador.
        </p>
      </LegalSection>

      <LegalSection title="4. Transparência operacional">
        <p>A CO₂ Contra Incêndio compromete-se com os seguintes princípios de transparência:</p>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>Status da plataforma:</strong> incidentes e manutenções programadas serão comunicados com antecedência mínima de 24 horas por e-mail;
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Atualizações de funcionalidades:</strong> novas versões serão documentadas em notas de release acessíveis na plataforma;
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Uso de IA:</strong> quando laudos ou análises forem gerados com auxílio de inteligência artificial (Anthropic Claude), isso será claramente indicado no documento, com aviso de que a revisão por profissional habilitado é obrigatória;
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Subprocessadores:</strong> a lista de fornecedores de infraestrutura que processam dados em nome da CO₂ Contra Incêndio está disponível mediante solicitação.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Gestão de riscos e continuidade">
        <p>O OPERIS adota as seguintes práticas de gestão de riscos:</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
          {[
            { title: "Backups diários", desc: "Snapshots automáticos do banco de dados com retenção de 30 dias" },
            { title: "Monitoramento 24/7", desc: "Alertas automáticos para falhas de servidor, erros críticos e latência elevada" },
            { title: "Plano de recuperação", desc: "RTO (Recovery Time Objective) de 4 horas para incidentes críticos" },
            { title: "Testes de restauração", desc: "Backups testados mensalmente para garantir integridade dos dados" },
          ].map(item => (
            <div key={item.title} style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontWeight: 700, color: "#111", fontSize: 13, marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </LegalSection>

      <LegalSection title="6. Responsabilidade técnica e legal">
        <LegalHighlight type="warning">
          <strong>Importante:</strong> O OPERIS é uma ferramenta de apoio à gestão técnica. A responsabilidade civil e técnica pelos laudos emitidos, inspeções realizadas e conformidade com normas recai sobre o <strong>profissional habilitado</strong> (Engenheiro ou Técnico com registro no CREA/CFT) que assina os documentos, não sobre a plataforma ou a CO₂ Contra Incêndio LTDA.
        </LegalHighlight>
        <p>
          A CO₂ Contra Incêndio LTDA é responsável pela <strong>disponibilidade, segurança e integridade da plataforma</strong>. O responsável técnico pelos projetos e laudos emitidos é o <strong>Eng. Judson Aleixo Sampaio</strong>, CREA/MG 142203671-5.
        </p>
      </LegalSection>

      <LegalSection title="7. Canal de denúncias e conformidade">
        <p>
          Para reportar violações de conformidade, uso indevido da plataforma ou preocupações éticas, utilize o canal dedicado:
        </p>
        <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 10, padding: "16px 20px", marginTop: 12 }}>
          <div style={{ fontWeight: 700, color: "#111", marginBottom: 8 }}>Canal de Compliance — CO₂ Contra Incêndio</div>
          <div style={{ fontSize: 13, color: "#4B5563", lineHeight: 2 }}>
            📧 co2contraincendio@gmail.com (assunto: "COMPLIANCE — [descrição]")<br />
            📞 (31) 9 9738-3115<br />
            ⏱️ Resposta em até 5 dias úteis<br />
            🔒 Todas as denúncias são tratadas com confidencialidade
          </div>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
