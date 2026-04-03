import LegalLayout, { LegalSection, LegalHighlight } from "./LegalLayout";

export default function TermsOfService() {
  return (
    <LegalLayout
      title="Termos de Uso"
      subtitle="Condições que regem o acesso e uso do OPERIS — plataforma de inspeção técnica e gestão de equipamentos de proteção contra incêndio."
      lastUpdated="03 de abril de 2026"
      badge="CONTRATO DE USO"
    >
      <LegalHighlight type="warning">
        Ao criar uma conta ou utilizar o OPERIS, você declara ter lido, compreendido e concordado integralmente com estes Termos. Caso não concorde, não utilize a plataforma.
      </LegalHighlight>

      <LegalSection title="1. Definições">
        <p>Para fins destes Termos, entende-se por:</p>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li style={{ marginBottom: 8 }}><strong>OPERIS:</strong> plataforma SaaS de inspeção técnica e gestão de ativos, desenvolvida e operada pela CO₂ Contra Incêndio LTDA;</li>
          <li style={{ marginBottom: 8 }}><strong>Usuário:</strong> qualquer pessoa física ou jurídica com acesso à plataforma, incluindo técnicos, administradores e clientes;</li>
          <li style={{ marginBottom: 8 }}><strong>Empresa Contratante:</strong> pessoa jurídica que contratou o acesso ao OPERIS para uso de sua equipe;</li>
          <li style={{ marginBottom: 8 }}><strong>Dados Técnicos:</strong> inspeções, laudos, registros de equipamentos e demais informações geradas no uso da plataforma;</li>
          <li style={{ marginBottom: 8 }}><strong>Conteúdo:</strong> textos, relatórios, imagens, QR Codes e demais materiais gerados ou disponibilizados no OPERIS.</li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Acesso e uso do OPERIS">
        <p>O OPERIS é uma ferramenta profissional destinada exclusivamente a:</p>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li style={{ marginBottom: 6 }}>Registro e acompanhamento de inspeções técnicas de equipamentos de proteção contra incêndio;</li>
          <li style={{ marginBottom: 6 }}>Emissão de laudos técnicos e relatórios de conformidade;</li>
          <li style={{ marginBottom: 6 }}>Gestão de ativos, manutenções preventivas e corretivas;</li>
          <li style={{ marginBottom: 6 }}>Controle de documentação técnica e regulatória;</li>
          <li style={{ marginBottom: 6 }}>Comunicação entre técnicos e clientes via laudos digitais.</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          O acesso é concedido mediante cadastro com e-mail e senha válidos. Cada usuário é responsável pela confidencialidade de suas credenciais.
        </p>
      </LegalSection>

      <LegalSection title="3. Responsabilidades do usuário">
        <p>Ao utilizar o OPERIS, você se compromete a:</p>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li style={{ marginBottom: 8 }}>Fornecer informações verdadeiras, precisas e atualizadas no cadastro e nos registros técnicos;</li>
          <li style={{ marginBottom: 8 }}>Não compartilhar suas credenciais de acesso com terceiros;</li>
          <li style={{ marginBottom: 8 }}>Utilizar a plataforma apenas para fins lícitos e em conformidade com as normas técnicas aplicáveis (ABNT, NFPA, Corpo de Bombeiros);</li>
          <li style={{ marginBottom: 8 }}>Não tentar acessar áreas restritas, realizar engenharia reversa ou comprometer a segurança da plataforma;</li>
          <li style={{ marginBottom: 8 }}>Notificar imediatamente a CO₂ Contra Incêndio sobre qualquer uso não autorizado de sua conta;</li>
          <li style={{ marginBottom: 8 }}>Manter os dados de equipamentos e inspeções atualizados e tecnicamente corretos.</li>
        </ul>
        <LegalHighlight type="warning">
          <strong>Responsabilidade técnica:</strong> O OPERIS é uma ferramenta de apoio à gestão. A responsabilidade técnica pelos laudos emitidos e pelas inspeções realizadas é do profissional habilitado (engenheiro ou técnico com registro no CREA/CFT), não da plataforma.
        </LegalHighlight>
      </LegalSection>

      <LegalSection title="4. Limitações do sistema">
        <p>O OPERIS é fornecido "como está" (as-is) e "conforme disponível". A CO₂ Contra Incêndio não garante:</p>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li style={{ marginBottom: 6 }}>Disponibilidade ininterrupta (SLA de 99,5% em horário comercial, exceto manutenções programadas);</li>
          <li style={{ marginBottom: 6 }}>Que a plataforma atenderá a todos os requisitos específicos de cada cliente;</li>
          <li style={{ marginBottom: 6 }}>Que os laudos gerados automaticamente por IA substituem a revisão de um profissional habilitado;</li>
          <li style={{ marginBottom: 6 }}>Resultados específicos decorrentes do uso das funcionalidades de inteligência artificial.</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          A CO₂ Contra Incêndio não se responsabiliza por danos indiretos, perda de dados por falha do usuário, ou uso indevido da plataforma.
        </p>
      </LegalSection>

      <LegalSection title="5. Propriedade intelectual">
        <p>
          Todo o código-fonte, design, marca OPERIS, logotipos, textos e funcionalidades da plataforma são de propriedade exclusiva da <strong>CO₂ Contra Incêndio LTDA</strong>, protegidos pela Lei de Direitos Autorais (Lei nº 9.610/1998) e pela Lei de Software (Lei nº 9.609/1998).
        </p>
        <p style={{ marginTop: 12 }}>
          Os <strong>dados técnicos inseridos pelo usuário</strong> (inspeções, laudos, cadastros de equipamentos) pertencem ao usuário ou à empresa contratante. A CO₂ Contra Incêndio não reivindica propriedade sobre esses dados.
        </p>
        <p style={{ marginTop: 12 }}>
          É vedada a reprodução, distribuição ou comercialização de qualquer parte do OPERIS sem autorização expressa e por escrito.
        </p>
      </LegalSection>

      <LegalSection title="6. Suspensão e cancelamento">
        <p>A CO₂ Contra Incêndio reserva-se o direito de suspender ou cancelar o acesso ao OPERIS nas seguintes situações:</p>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li style={{ marginBottom: 6 }}>Violação destes Termos de Uso;</li>
          <li style={{ marginBottom: 6 }}>Uso fraudulento ou tentativa de comprometimento da segurança;</li>
          <li style={{ marginBottom: 6 }}>Inadimplência no pagamento da assinatura (quando aplicável);</li>
          <li style={{ marginBottom: 6 }}>Solicitação do próprio usuário.</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          Em caso de cancelamento, os dados do usuário serão retidos por 30 dias para eventual recuperação, após o que serão excluídos permanentemente, exceto os laudos técnicos (retidos por 5 anos conforme obrigação legal).
        </p>
      </LegalSection>

      <LegalSection title="7. Modificações nos termos">
        <p>
          Estes Termos podem ser atualizados a qualquer momento. Alterações significativas serão comunicadas com antecedência mínima de <strong>15 dias</strong> por e-mail e aviso na plataforma. O uso continuado após a vigência das alterações implica aceitação dos novos termos.
        </p>
      </LegalSection>

      <LegalSection title="8. Foro e lei aplicável">
        <p>
          Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de <strong>Belo Horizonte, Minas Gerais</strong>, para dirimir quaisquer controvérsias decorrentes deste instrumento, com renúncia expressa a qualquer outro, por mais privilegiado que seja.
        </p>
      </LegalSection>

      <LegalSection title="9. Contato">
        <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 10, padding: "16px 20px" }}>
          <div style={{ fontWeight: 700, color: "#111", marginBottom: 8 }}>CO₂ Contra Incêndio LTDA</div>
          <div style={{ fontSize: 13, color: "#4B5563", lineHeight: 2 }}>
            📧 co2contraincendio@gmail.com<br />
            📞 (31) 9 9738-3115<br />
            📍 Belo Horizonte, Minas Gerais<br />
            🏛️ CNPJ: 29.905.123/0001-53
          </div>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
