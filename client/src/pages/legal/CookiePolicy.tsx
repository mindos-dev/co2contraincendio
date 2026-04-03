import LegalLayout, { LegalSection, LegalTable, LegalHighlight } from "./LegalLayout";

export default function CookiePolicy() {
  return (
    <LegalLayout
      title="Política de Cookies"
      subtitle="Como o OPERIS utiliza cookies e tecnologias similares para garantir o funcionamento da plataforma e melhorar sua experiência."
      lastUpdated="03 de abril de 2026"
      badge="COOKIES & RASTREAMENTO"
    >
      <LegalSection title="1. O que são cookies?">
        <p>
          Cookies são pequenos arquivos de texto armazenados no seu navegador quando você acessa uma página web. Eles permitem que a plataforma reconheça seu dispositivo em visitas subsequentes, mantenha sua sessão ativa e lembre suas preferências.
        </p>
        <p style={{ marginTop: 12 }}>
          Além dos cookies tradicionais, o OPERIS pode utilizar tecnologias similares como <strong>localStorage</strong> (armazenamento local no navegador) e <strong>sessionStorage</strong> (armazenamento de sessão), que funcionam de forma análoga mas sem enviar dados ao servidor automaticamente.
        </p>
      </LegalSection>

      <LegalSection title="2. Tipos de cookies que utilizamos">
        <LegalTable
          headers={["Tipo", "Nome / Identificador", "Finalidade", "Duração"]}
          rows={[
            ["Essencial", "operis_session", "Manter a sessão autenticada do usuário logado", "7 dias"],
            ["Essencial", "operis_csrf", "Proteção contra ataques CSRF (Cross-Site Request Forgery)", "Sessão"],
            ["Preferências", "operis_theme", "Lembrar preferência de tema (claro/escuro)", "1 ano"],
            ["Preferências", "operis_sidebar", "Estado de colapso da barra lateral", "1 ano"],
            ["Consentimento", "operis_cookie_consent", "Registrar sua escolha sobre cookies", "1 ano"],
            ["Analytics", "operis_analytics", "Métricas anônimas de uso (sem identificação pessoal)", "12 meses"],
          ]}
        />
        <LegalHighlight type="info">
          <strong>Cookies essenciais</strong> não podem ser desativados, pois são necessários para o funcionamento básico da plataforma. Os demais são opcionais e dependem do seu consentimento.
        </LegalHighlight>
      </LegalSection>

      <LegalSection title="3. Cookies essenciais">
        <p>
          Os cookies essenciais são indispensáveis para que você possa navegar no OPERIS e utilizar suas funcionalidades. Sem eles, serviços como login, manutenção de sessão e segurança não funcionam corretamente.
        </p>
        <p style={{ marginTop: 12 }}>
          Esses cookies <strong>não coletam informações pessoais identificáveis</strong> além do necessário para a autenticação e segurança, e <strong>não requerem consentimento</strong> conforme o Art. 7º, V da LGPD (execução de contrato).
        </p>
      </LegalSection>

      <LegalSection title="4. Cookies de desempenho e analytics">
        <p>
          Utilizamos cookies de analytics para entender como os usuários interagem com o OPERIS — quais páginas são mais acessadas, tempo de sessão e fluxos de navegação. Essas informações são <strong>completamente anonimizadas</strong> e utilizadas exclusivamente para melhorar a plataforma.
        </p>
        <p style={{ marginTop: 12 }}>
          Não compartilhamos dados de analytics com plataformas de publicidade. Os dados são processados internamente e não permitem identificação individual.
        </p>
      </LegalSection>

      <LegalSection title="5. Como gerenciar seus cookies">
        <p>Você tem controle total sobre os cookies não essenciais:</p>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>Pelo banner de consentimento:</strong> ao acessar o OPERIS pela primeira vez, você verá um banner com as opções "Aceitar tudo" ou "Configurar". Suas escolhas são salvas e respeitadas.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Pelas configurações do navegador:</strong> você pode bloquear ou excluir cookies diretamente nas configurações do seu navegador. Atenção: bloquear cookies essenciais pode impedir o uso da plataforma.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Pelo painel de privacidade:</strong> dentro do OPERIS, em Configurações → Privacidade, você pode rever e alterar suas preferências de cookies a qualquer momento.
          </li>
        </ul>
        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { browser: "Google Chrome", url: "https://support.google.com/chrome/answer/95647" },
            { browser: "Mozilla Firefox", url: "https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer" },
            { browser: "Safari", url: "https://support.apple.com/guide/safari/manage-cookies-sfri11471" },
          ].map(b => (
            <a key={b.browser} href={b.url} target="_blank" rel="noopener noreferrer"
              style={{ display: "block", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#374151", textDecoration: "none", textAlign: "center" }}>
              {b.browser} →
            </a>
          ))}
        </div>
      </LegalSection>

      <LegalSection title="6. Cookies de terceiros">
        <p>
          O OPERIS <strong>não utiliza cookies de terceiros para publicidade</strong> (como Google Ads, Facebook Pixel ou similares). Não há rastreamento entre sites para fins comerciais.
        </p>
        <p style={{ marginTop: 12 }}>
          A única tecnologia de terceiro utilizada é o serviço de mapas para geolocalização de equipamentos, que pode definir cookies de sessão. Esses cookies seguem a política de privacidade do respectivo provedor.
        </p>
      </LegalSection>

      <LegalSection title="7. Atualizações desta política">
        <p>
          Esta Política de Cookies pode ser atualizada para refletir mudanças na plataforma ou na legislação. Notificaremos sobre alterações significativas por e-mail e pelo banner de consentimento.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
