import { Link } from "wouter";
import SEOHead from "../../components/SEOHead";

const schema = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "Proteção contra Incêndio em Laboratórios e Capelas de Exaustão",
  description:
    "Sistema FireDETEC Fume Hood para capelas de laboratório e armários de produtos químicos. CO₂ / HFC-227ea. NFPA 45 / NBR 14276.",
  url: "https://co2contra.com/protecao-laboratorios",
  author: { "@type": "Organization", name: "CO₂ Contra Incêndio" },
};

export default function ProtecaoLaboratorios() {
  return (
    <>
      <SEOHead
        title="Proteção contra Incêndio em Laboratórios | FireDETEC Fume Hood | CO₂ Contra Incêndio"
        description="Sistema FireDETEC para capelas de laboratório e armários de produtos químicos. Detecção e supressão automática em ambientes com vapores inflamáveis. NFPA 45. BH e MG."
        keywords="proteção incêndio laboratório, sistema extinção automática capela, FireDETEC fume hood, supressão incêndio armário químico, proteção laboratório químico incêndio, segurança laboratório"
        schema={schema}
      />

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #1a1f3e 100%)", padding: "6rem 0 4rem", borderBottom: "3px solid #059669" }}>
        <div className="container">
          <div style={{ maxWidth: "800px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(5,150,105,0.15)", border: "1px solid rgba(5,150,105,0.4)", borderRadius: "4px", padding: "0.35rem 0.9rem", marginBottom: "1.5rem" }}>
              <span style={{ color: "#34d399", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                FireDETEC Fume Hood · NFPA 45 · NBR 14276
              </span>
            </div>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: "1.5rem", fontFamily: "'Barlow', sans-serif" }}>
              Proteção contra Incêndio em<br />
              <span style={{ color: "#34d399" }}>Laboratórios e Capelas de Exaustão</span>
            </h1>
            <p style={{ fontSize: "1.1rem", color: "#94a3b8", lineHeight: 1.7, marginBottom: "2rem", maxWidth: "680px" }}>
              Capelas de exaustão e armários de produtos químicos concentram vapores inflamáveis e reagentes voláteis.
              O <strong style={{ color: "#e2e8f0" }}>FireDETEC Fume Hood</strong> detecta e suprime automaticamente
              dentro do volume da capela — sem interferir no fluxo de ar da exaustão.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/contato">
                <button style={{ background: "#059669", color: "#fff", border: "none", borderRadius: "6px", padding: "0.85rem 2rem", fontSize: "1rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Barlow', sans-serif" }}>
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

      {/* RISCOS */}
      <section style={{ padding: "5rem 0", background: "#fff" }}>
        <div className="container" style={{ maxWidth: "900px" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#0f172a", marginBottom: "1.5rem", fontFamily: "'Barlow', sans-serif" }}>
            Por que Laboratórios são Ambientes de Alto Risco
          </h2>
          <p style={{ fontSize: "1rem", color: "#475569", lineHeight: 1.8, marginBottom: "1.5rem" }}>
            Laboratórios de química, farmácia, petroquímica e pesquisa concentram múltiplos fatores de risco simultâneos:
            reagentes inflamáveis, fontes de ignição (bicos de Bunsen, aquecedores, motores elétricos) e ventilação
            forçada que acelera a propagação de vapores. Uma ignição dentro de uma capela de exaustão pode se propagar
            para o duto de exaustão e atingir outras áreas do laboratório em segundos.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
            {[
              { icon: "🧪", label: "Solventes orgânicos", desc: "Etanol, acetona, éter, hexano — vapores inflamáveis em temperatura ambiente" },
              { icon: "🔥", label: "Fontes de ignição", desc: "Bicos de Bunsen, aquecedores, motores, arcos elétricos" },
              { icon: "💨", label: "Ventilação forçada", desc: "Fluxo de ar da exaustão acelera propagação de vapores e chamas" },
              { icon: "⚗️", label: "Reações exotérmicas", desc: "Reações químicas descontroladas podem gerar calor e incêndio" },
            ].map((r) => (
              <div key={r.label} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1.25rem" }}>
                <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>{r.icon}</div>
                <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "0.4rem", fontFamily: "'Barlow', sans-serif" }}>{r.label}</div>
                <div style={{ fontSize: "0.875rem", color: "#64748b", lineHeight: 1.6 }}>{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* APLICAÇÕES */}
      <section style={{ padding: "5rem 0", background: "#f8fafc" }}>
        <div className="container" style={{ maxWidth: "900px" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#0f172a", marginBottom: "1.5rem", fontFamily: "'Barlow', sans-serif" }}>
            Aplicações do FireDETEC em Laboratórios
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
            {[
              { icon: "🏛️", title: "Capelas de Exaustão", items: ["Capelas de fluxo laminar", "Capelas de perclorato", "Capelas de ácidos", "Capelas de solventes"] },
              { icon: "🗄️", title: "Armários de Armazenamento", items: ["Armários de solventes inflamáveis", "Armários de ácidos e bases", "Armários de produtos oxidantes", "Câmaras frias com solventes"] },
              { icon: "🔬", title: "Equipamentos Analíticos", items: ["Cromatógrafos (GC, HPLC)", "Espectrômetros com solventes", "Digestores de micro-ondas", "Fornos de mufla"] },
              { icon: "🏥", title: "Laboratórios Especiais", items: ["Farmácias de manipulação", "Laboratórios de controle de qualidade", "Laboratórios forenses", "Laboratórios de P&D industrial"] },
            ].map((cat) => (
              <div key={cat.title} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1.5rem" }}>
                <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>{cat.icon}</div>
                <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "0.75rem", fontFamily: "'Barlow', sans-serif" }}>{cat.title}</div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {cat.items.map((item) => (
                    <li key={item} style={{ fontSize: "0.875rem", color: "#475569", padding: "0.25rem 0", borderBottom: "1px solid #f1f5f9" }}>
                      → {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "5rem 0", background: "#fff" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#0f172a", marginBottom: "2rem", fontFamily: "'Barlow', sans-serif" }}>
            Perguntas Frequentes
          </h2>
          {[
            { q: "O sistema interfere no fluxo de ar da exaustão da capela?", a: "Não. O FireDETEC Fume Hood é projetado para ser instalado dentro da chapel sem obstruir o fluxo de ar da exaustão. O tubo sensor é fixado nas paredes internas da chapel e o cilindro de agente é instalado externamente, com a mangueira de descarga penetrando na chapel." },
            { q: "Qual agente é recomendado para capelas com solventes orgânicos?", a: "O CO₂ é o agente mais comum para capelas de laboratório por ser eficaz em classe B (líquidos inflamáveis) e não deixar resíduo. Para capelas com equipamentos eletrônicos sensíveis, o HFC-227ea (FM-200) é preferível por não ser letal em concentrações de supressão." },
            { q: "O sistema pode ser instalado em capelas de perclorato?", a: "Sim, com precauções específicas. Capelas de perclorato exigem sistema de supressão por água (sprinkler de resposta rápida) para resfriamento, além do sistema de supressão por gás. A CO₂ Contra Incêndio projeta sistemas combinados para este tipo de aplicação." },
            { q: "Qual norma rege a proteção de laboratórios no Brasil?", a: "A NFPA 45 (Standard on Fire Protection for Laboratories Using Chemicals) é a referência internacional. No Brasil, a NBR 14276 (Brigada de incêndio) e as Instruções Técnicas do CBMMG complementam os requisitos. Laboratórios de farmácias de manipulação também devem atender à RDC 67/2007 da ANVISA." },
            { q: "O sistema pode ser acionado manualmente?", a: "Sim. O FireDETEC possui botão de acionamento manual externo à chapel para acionamento pelo operador em caso de emergência. O sistema também pode ser configurado com retardo de descarga (tipicamente 30 segundos) para permitir a evacuação do laboratório antes da descarga de CO₂." },
          ].map((faq, i) => (
            <div key={i} style={{ borderBottom: "1px solid #e2e8f0", padding: "1.5rem 0" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.75rem", fontFamily: "'Barlow', sans-serif" }}>{faq.q}</h3>
              <p style={{ color: "#475569", lineHeight: 1.7, margin: 0, fontSize: "0.95rem" }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #1a1f3e 100%)", padding: "5rem 0", borderTop: "3px solid #059669" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#fff", marginBottom: "1rem", fontFamily: "'Barlow', sans-serif" }}>
            Proteja seu laboratório
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "1.05rem", maxWidth: "600px", margin: "0 auto 2rem", lineHeight: 1.7 }}>
            Projetamos sistemas específicos para cada tipo de chapel e armário de laboratório, com agentes adequados para cada classe de risco.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contato">
              <button style={{ background: "#059669", color: "#fff", border: "none", borderRadius: "6px", padding: "0.9rem 2.5rem", fontSize: "1rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Barlow', sans-serif" }}>
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
