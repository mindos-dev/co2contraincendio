import { Link } from "wouter";
import SEOHead from "../../components/SEOHead";

const schema = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "Proteção contra Incêndio em Compartimento de Motor",
  description:
    "Sistemas Water Mist, Pó Químico Seco e Dual Agent para proteção de compartimentos de motor em veículos e equipamentos industriais. NFPA 17 / NFPA 750.",
  url: "https://co2contra.com/protecao-compartimento-motor",
  author: { "@type": "Organization", name: "CO₂ Contra Incêndio" },
};

export default function ProtecaoCompartimentoMotor() {
  return (
    <>
      <SEOHead
        title="Proteção contra Incêndio em Compartimento de Motor | CO₂ Contra Incêndio"
        description="Sistemas Water Mist, Pó Químico Seco e Dual Agent para proteção de compartimentos de motor. Detecção automática por tubo linear. NFPA 17 / NFPA 750 / NBR 12693. BH e MG."
        keywords="proteção compartimento motor incêndio, water mist motor diesel, sistema extinção automática motor, névoa água compartimento motor, dual agent fire suppression, Fogmaker"
        schema={schema}
      />

      <section style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #1a1f3e 100%)", padding: "6rem 0 4rem", borderBottom: "3px solid #0369a1" }}>
        <div className="container">
          <div style={{ maxWidth: "800px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(3,105,161,0.15)", border: "1px solid rgba(3,105,161,0.4)", borderRadius: "4px", padding: "0.35rem 0.9rem", marginBottom: "1.5rem" }}>
              <span style={{ color: "#38bdf8", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Water Mist · Dual Agent · NFPA 17 · NFPA 750
              </span>
            </div>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: "1.5rem", fontFamily: "'Barlow', sans-serif" }}>
              Proteção contra Incêndio em<br />
              <span style={{ color: "#38bdf8" }}>Compartimento de Motor</span>
            </h1>
            <p style={{ fontSize: "1.1rem", color: "#94a3b8", lineHeight: 1.7, marginBottom: "2rem", maxWidth: "680px" }}>
              Compartimentos de motor concentram combustível, óleo hidráulico e fontes de ignição em espaço confinado.
              Sistemas de <strong style={{ color: "#e2e8f0" }}>Water Mist</strong> e <strong style={{ color: "#e2e8f0" }}>Dual Agent</strong> resfiam
              superfícies, suprimem vapores e previnem re-ignição — os três vetores do triângulo do fogo em motores diesel.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/contato">
                <button style={{ background: "#0369a1", color: "#fff", border: "none", borderRadius: "6px", padding: "0.85rem 2rem", fontSize: "1rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Barlow', sans-serif" }}>
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
            Tecnologias Disponíveis
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
            {[
              { title: "Water Mist", color: "#0369a1", desc: "Névoa d'água de alta pressão resfria superfícies, suprime vapores e dilui o oxigênio. Eficaz em motores diesel e turbinas. Não deixa resíduo sólido." },
              { title: "Pó Químico Seco ABC", color: "#b45309", desc: "Knockdown imediato de chamas estabelecidas. Penetra em áreas de difícil acesso. Deixa resíduo que exige limpeza após acionamento." },
              { title: "Dual Agent (ICS)", color: "#7c3aed", desc: "Combinação de pó químico para knockdown rápido e agente líquido ICS para resfriamento e prevenção de re-ignição. Máxima eficácia em motores diesel." },
            ].map((t) => (
              <div key={t.title} style={{ background: "#f8fafc", border: `1px solid ${t.color}40`, borderTop: `4px solid ${t.color}`, borderRadius: "10px", padding: "1.75rem" }}>
                <h3 style={{ fontWeight: 800, color: "#0f172a", marginBottom: "0.75rem", fontFamily: "'Barlow', sans-serif" }}>{t.title}</h3>
                <p style={{ fontSize: "0.9rem", color: "#475569", lineHeight: 1.7, margin: 0 }}>{t.desc}</p>
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
            { q: "Water Mist é eficaz em motores a diesel?", a: "Sim. A névoa d'água de alta pressão (acima de 35 bar) é altamente eficaz em motores diesel por três mecanismos: resfriamento de superfícies quentes, supressão de vapores inflamáveis e diluição do oxigênio. O sistema Fogmaker, por exemplo, é certificado para proteção de compartimentos de motor de ônibus e caminhões." },
            { q: "Qual a diferença entre Water Mist e sprinkler convencional?", a: "O Water Mist opera com gotas muito menores (< 1000 μm) e pressão muito maior (35–200 bar) que sprinklers convencionais (< 12 bar). Isso resulta em maior área de superfície de contato, maior eficiência de resfriamento e menor consumo de água — fundamental em veículos com reservatório limitado." },
            { q: "O sistema pode ser instalado em ônibus e caminhões?", a: "Sim. Sistemas Water Mist como o Fogmaker são especificamente projetados para ônibus, caminhões e veículos de transporte público. No Brasil, a Resolução CONTRAN 697/2017 exige sistemas de supressão em ônibus com mais de 20 lugares. A CO₂ Contra Incêndio instala e certifica estes sistemas." },
            { q: "Qual o volume de água necessário para o sistema?", a: "Sistemas Water Mist para compartimentos de motor típicos requerem 10–30 litros de água, dependendo do volume do compartimento e da pressão do sistema. Este volume é armazenado em um reservatório pressurizado instalado no veículo." },
            { q: "O sistema precisa de manutenção periódica?", a: "Sim. A NFPA 750 recomenda inspeção semestral e manutenção anual. O reservatório de água deve ser verificado quanto ao nível e à qualidade da água. Os bicos aspersores devem ser inspecionados quanto a entupimentos. A CO₂ Contra Incêndio oferece contratos de manutenção preventiva." },
          ].map((faq, i) => (
            <div key={i} style={{ borderBottom: "1px solid #e2e8f0", padding: "1.5rem 0" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.75rem", fontFamily: "'Barlow', sans-serif" }}>{faq.q}</h3>
              <p style={{ color: "#475569", lineHeight: 1.7, margin: 0, fontSize: "0.95rem" }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #1a1f3e 100%)", padding: "5rem 0", borderTop: "3px solid #0369a1" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#fff", marginBottom: "1rem", fontFamily: "'Barlow', sans-serif" }}>
            Proteja o compartimento de motor dos seus veículos
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "1.05rem", maxWidth: "600px", margin: "0 auto 2rem", lineHeight: 1.7 }}>
            Analisamos o tipo de motor, combustível e condições de operação para recomendar o sistema mais eficaz.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contato">
              <button style={{ background: "#0369a1", color: "#fff", border: "none", borderRadius: "6px", padding: "0.9rem 2.5rem", fontSize: "1rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Barlow', sans-serif" }}>
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
