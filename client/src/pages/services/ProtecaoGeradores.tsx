import { Link } from "wouter";
import SEOHead from "../../components/SEOHead";

const schema = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "Proteção contra Incêndio em Geradores e Salas de Energia",
  description:
    "Sistemas de supressão automática para geradores diesel, UPS, salas de baterias e subestações. CO₂ / HFC-227ea / FK-5-1-12. NFPA 110 / NBR 16064.",
  url: "https://co2contra.com/protecao-geradores",
  author: { "@type": "Organization", name: "CO₂ Contra Incêndio" },
};

export default function ProtecaoGeradores() {
  return (
    <>
      <SEOHead
        title="Proteção contra Incêndio em Geradores e Salas de Energia | CO₂ Contra Incêndio"
        description="Sistemas de supressão automática para geradores diesel, UPS, salas de baterias e subestações. CO₂ / HFC-227ea / FK-5-1-12. NFPA 110. BH e MG."
        keywords="proteção incêndio gerador diesel, sistema extinção automática sala UPS, supressão incêndio subestação, proteção gerador CO2, sistema extinção automática gerador, sala de baterias incêndio"
        schema={schema}
      />

      <section style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #1a1f3e 100%)", padding: "6rem 0 4rem", borderBottom: "3px solid #d97706" }}>
        <div className="container">
          <div style={{ maxWidth: "800px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(217,119,6,0.15)", border: "1px solid rgba(217,119,6,0.4)", borderRadius: "4px", padding: "0.35rem 0.9rem", marginBottom: "1.5rem" }}>
              <span style={{ color: "#fbbf24", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                CO₂ · HFC-227ea · FK-5-1-12 · NFPA 110 · NBR 16064
              </span>
            </div>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: "1.5rem", fontFamily: "'Barlow', sans-serif" }}>
              Proteção contra Incêndio em<br />
              <span style={{ color: "#fbbf24" }}>Geradores e Salas de Energia</span>
            </h1>
            <p style={{ fontSize: "1.1rem", color: "#94a3b8", lineHeight: 1.7, marginBottom: "2rem", maxWidth: "680px" }}>
              Geradores diesel, UPS e salas de baterias são a espinha dorsal da continuidade operacional.
              Um incêndio nestes ambientes pode paralisar hospitais, data centers e indústrias inteiras.
              Sistemas de supressão automática garantem proteção sem comprometer a disponibilidade do equipamento.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/contato">
                <button style={{ background: "#d97706", color: "#fff", border: "none", borderRadius: "6px", padding: "0.85rem 2rem", fontSize: "1rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Barlow', sans-serif" }}>
                  Solicitar Projeto Técnico
                </button>
              </Link>
              <Link href="/sistemas-pre-engenheirados">
                <button style={{ background: "transparent", color: "#e2e8f0", border: "1px solid rgba(226,232,240,0.3)", borderRadius: "6px", padding: "0.85rem 2rem", fontSize: "1rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Barlow', sans-serif" }}>
                  ← Todos os Sistemas
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "5rem 0", background: "#fff" }}>
        <div className="container" style={{ maxWidth: "900px" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#0f172a", marginBottom: "1.5rem", fontFamily: "'Barlow', sans-serif" }}>
            Ambientes Protegidos
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
            {[
              { icon: "⚡", title: "Geradores Diesel", color: "#d97706", desc: "Proteção do compartimento do motor, tanque de combustível e painel de controle. Sistema de aplicação local com CO₂ ou pó químico.", norma: "NFPA 110" },
              { icon: "🔋", title: "Salas de UPS e Baterias", color: "#7c3aed", desc: "Proteção com agente limpo (FK-5-1-12 ou HFC-227ea) para não danificar os equipamentos eletrônicos e baterias.", norma: "NFPA 111" },
              { icon: "🏗️", title: "Subestações MT/BT", color: "#0891b2", desc: "Proteção de transformadores, painéis de proteção e salas de controle com CO₂ ou agente limpo.", norma: "NFPA 850" },
              { icon: "☀️", title: "Inversores Fotovoltaicos", color: "#059669", desc: "Proteção de inversores e string boxes de sistemas fotovoltaicos com agente limpo sem condutividade elétrica.", norma: "NFPA 2001" },
            ].map((a) => (
              <div key={a.title} style={{ background: "#f8fafc", border: `1px solid ${a.color}40`, borderTop: `4px solid ${a.color}`, borderRadius: "10px", padding: "1.75rem" }}>
                <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>{a.icon}</div>
                <h3 style={{ fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem", fontFamily: "'Barlow', sans-serif" }}>{a.title}</h3>
                <p style={{ fontSize: "0.875rem", color: "#475569", lineHeight: 1.6, marginBottom: "0.75rem" }}>{a.desc}</p>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: a.color, background: `${a.color}15`, padding: "0.2rem 0.6rem", borderRadius: "4px" }}>{a.norma}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "5rem 0", background: "#f8fafc" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#0f172a", marginBottom: "2rem", fontFamily: "'Barlow', sans-serif" }}>
            Perguntas Frequentes
          </h2>
          {[
            { q: "O sistema pode proteger o gerador sem desligá-lo?", a: "Sim. Sistemas de aplicação local com CO₂ ou pó químico podem ser configurados para suprimir incêndio no compartimento do motor sem desligar o gerador. No entanto, para incêndios mais graves, o desligamento automático é recomendado para segurança dos operadores." },
            { q: "Qual agente é recomendado para salas de baterias de lítio?", a: "Baterias de lítio (Li-ion) são particularmente desafiadoras porque podem entrar em thermal runaway e continuar queimando mesmo após a supressão do incêndio. O CO₂ é eficaz para suprimir as chamas, mas sistemas de resfriamento por água ou water mist são necessários para prevenir a re-ignição. A CO₂ Contra Incêndio projeta sistemas combinados para este tipo de aplicação." },
            { q: "O sistema precisa de aprovação da concessionária de energia?", a: "Para subestações conectadas à rede de distribuição, a aprovação da concessionária (CEMIG em MG) pode ser necessária para modificações nas instalações. A CO₂ Contra Incêndio orienta o cliente sobre os requisitos específicos de cada projeto." },
            { q: "Qual a norma aplicável para proteção de geradores no Brasil?", a: "A NFPA 110 (Standard for Emergency and Standby Power Systems) é a referência internacional. No Brasil, a NBR 16064 (Sistemas de supressão de incêndio com agentes limpos) e as Instruções Técnicas do CBMMG complementam os requisitos. A instalação exige ART de engenheiro habilitado." },
          ].map((faq, i) => (
            <div key={i} style={{ borderBottom: "1px solid #e2e8f0", padding: "1.5rem 0" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.75rem", fontFamily: "'Barlow', sans-serif" }}>{faq.q}</h3>
              <p style={{ color: "#475569", lineHeight: 1.7, margin: 0, fontSize: "0.95rem" }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #1a1f3e 100%)", padding: "5rem 0", borderTop: "3px solid #d97706" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#fff", marginBottom: "1rem", fontFamily: "'Barlow', sans-serif" }}>
            Proteja sua infraestrutura de energia
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "1.05rem", maxWidth: "600px", margin: "0 auto 2rem", lineHeight: 1.7 }}>
            Projetamos sistemas específicos para cada tipo de equipamento de energia — geradores, UPS, subestações e inversores fotovoltaicos.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contato">
              <button style={{ background: "#d97706", color: "#fff", border: "none", borderRadius: "6px", padding: "0.9rem 2.5rem", fontSize: "1rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Barlow', sans-serif" }}>
                Solicitar Visita Técnica
              </button>
            </Link>
            <Link href="/sistemas-pre-engenheirados">
              <button style={{ background: "transparent", color: "#e2e8f0", border: "1px solid rgba(226,232,240,0.3)", borderRadius: "6px", padding: "0.9rem 2.5rem", fontSize: "1rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Barlow', sans-serif" }}>
                Ver Outros Sistemas
              </button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
