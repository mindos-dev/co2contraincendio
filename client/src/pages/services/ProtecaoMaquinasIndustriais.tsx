import { Link } from "wouter";
import SEOHead from "../../components/SEOHead";

const schema = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "Proteção contra Incêndio em Máquinas Industriais — Injetoras, Prensas e Centros de Usinagem",
  description:
    "Sistemas de aplicação local e inundação total para proteção de injetoras de plástico, prensas hidráulicas e centros de usinagem. CO₂ / Pó Químico / Agente Limpo. NFPA 86.",
  url: "https://co2contra.com/protecao-maquinas-industriais",
  author: { "@type": "Organization", name: "CO₂ Contra Incêndio" },
};

export default function ProtecaoMaquinasIndustriais() {
  return (
    <>
      <SEOHead
        title="Proteção contra Incêndio em Máquinas Industriais | CO₂ Contra Incêndio"
        description="Sistemas de aplicação local e inundação total para injetoras de plástico, prensas hidráulicas e centros de usinagem. CO₂ / Pó Químico / Agente Limpo. NFPA 86. BH e MG."
        keywords="proteção incêndio injetora plástico, sistema extinção automática prensa hidráulica, supressão incêndio máquina industrial, aplicação local extinção incêndio, proteção incêndio centro usinagem"
        schema={schema}
      />

      <section style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #1a1f3e 100%)", padding: "6rem 0 4rem", borderBottom: "3px solid #0891b2" }}>
        <div className="container">
          <div style={{ maxWidth: "800px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(8,145,178,0.15)", border: "1px solid rgba(8,145,178,0.4)", borderRadius: "4px", padding: "0.35rem 0.9rem", marginBottom: "1.5rem" }}>
              <span style={{ color: "#22d3ee", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Aplicação Local · Inundação Total · NFPA 86 · NBR 12615
              </span>
            </div>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: "1.5rem", fontFamily: "'Barlow', sans-serif" }}>
              Proteção contra Incêndio em<br />
              <span style={{ color: "#22d3ee" }}>Máquinas Industriais</span>
            </h1>
            <p style={{ fontSize: "1.1rem", color: "#94a3b8", lineHeight: 1.7, marginBottom: "2rem", maxWidth: "680px" }}>
              Injetoras de plástico, prensas hidráulicas e centros de usinagem operam com óleos e fluidos inflamáveis
              sob alta pressão e temperatura. Sistemas de <strong style={{ color: "#e2e8f0" }}>aplicação local</strong> protegem
              pontos específicos de risco sem inundar o ambiente — minimizando danos colaterais e tempo de parada.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/contato">
                <button style={{ background: "#0891b2", color: "#fff", border: "none", borderRadius: "6px", padding: "0.85rem 2rem", fontSize: "1rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Barlow', sans-serif" }}>
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
            Aplicação Local vs. Inundação Total
          </h2>
          <p style={{ fontSize: "1rem", color: "#475569", lineHeight: 1.8, marginBottom: "2rem" }}>
            A escolha entre aplicação local e inundação total depende do tipo de risco, do ambiente e da norma aplicável.
            Na maioria das máquinas industriais, a <strong>aplicação local</strong> é a abordagem correta — protege o ponto
            de risco sem desperdiçar agente e sem contaminar o ambiente de produção.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            {[
              { title: "Aplicação Local", color: "#0891b2", when: "Quando usar", desc: "Risco localizado e identificável (ex: cabeçote de injetora, sistema hidráulico de prensa). O agente é direcionado diretamente ao ponto de risco.", pros: ["Menor consumo de agente", "Sem necessidade de selar o ambiente", "Menor impacto na produção", "Custo de instalação menor"] },
              { title: "Inundação Total", color: "#7c3aed", when: "Quando usar", desc: "Risco distribuído em ambiente fechado (ex: cabine de pintura, forno industrial, sala de servidores). O agente preenche todo o volume.", pros: ["Proteção completa do ambiente", "Eficaz para riscos ocultos", "Padrão para data centers e salas técnicas", "Norma NFPA 2001"] },
            ].map((m) => (
              <div key={m.title} style={{ background: "#f8fafc", border: `1px solid ${m.color}40`, borderTop: `4px solid ${m.color}`, borderRadius: "10px", padding: "1.75rem" }}>
                <h3 style={{ fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem", fontFamily: "'Barlow', sans-serif" }}>{m.title}</h3>
                <p style={{ fontSize: "0.9rem", color: "#475569", lineHeight: 1.7, marginBottom: "1rem" }}>{m.desc}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {m.pros.map((p) => (
                    <li key={p} style={{ fontSize: "0.875rem", color: "#475569", padding: "0.25rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ color: m.color, fontWeight: 700 }}>✓</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "5rem 0", background: "#f8fafc" }}>
        <div className="container" style={{ maxWidth: "900px" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#0f172a", marginBottom: "1.5rem", fontFamily: "'Barlow', sans-serif" }}>
            Máquinas e Riscos Típicos
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ background: "#0f172a", color: "#fff" }}>
                  {["Máquina", "Principal Risco", "Agente Recomendado", "Método", "Norma"].map((h) => (
                    <th key={h} style={{ padding: "0.85rem 1rem", textAlign: "left", fontFamily: "'Barlow', sans-serif", fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Injetora de plástico", "Ruptura de mangueira hidráulica", "Pó Químico / CO₂", "Aplicação local", "NFPA 86"],
                  ["Prensa hidráulica", "Óleo hidráulico pressurizado", "Pó Químico / CO₂", "Aplicação local", "NFPA 86"],
                  ["Cabine de pintura", "Vapores de solvente", "CO₂ / Agente Limpo", "Inundação total", "NFPA 33"],
                  ["Forno industrial", "Ignição de produto ou combustível", "CO₂", "Inundação total", "NFPA 86"],
                  ["Compressor de ar", "Óleo lubrificante superaquecido", "CO₂ / Pó Químico", "Aplicação local", "NFPA 86"],
                  ["Sopradoras PET", "Pré-formas e óleo de lubrificação", "CO₂", "Aplicação local", "NFPA 86"],
                ].map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ padding: "0.85rem 1rem", color: j === 0 ? "#0f172a" : "#475569", fontWeight: j === 0 ? 700 : 400 }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section style={{ padding: "5rem 0", background: "#fff" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#0f172a", marginBottom: "2rem", fontFamily: "'Barlow', sans-serif" }}>
            Perguntas Frequentes
          </h2>
          {[
            { q: "O sistema pode ser instalado sem parar a produção?", a: "A instalação do sistema requer uma parada técnica da máquina, geralmente de 4 a 8 horas dependendo da complexidade. A CO₂ Contra Incêndio planeja a instalação para coincidir com paradas de manutenção preventiva ou fins de semana para minimizar o impacto na produção." },
            { q: "Qual agente é melhor para injetoras de plástico?", a: "O CO₂ é o agente mais comum para injetoras de plástico por ser eficaz em classe B (óleo hidráulico) e não deixar resíduo que contamine o produto plástico. O pó químico seco é uma alternativa mais econômica, mas exige limpeza completa da máquina após acionamento." },
            { q: "O sistema pode desligar a máquina automaticamente ao acionar?", a: "Sim. O sistema pode ser integrado ao CLP da máquina para desligar automaticamente a bomba hidráulica e o aquecimento ao detectar incêndio. Isso é altamente recomendado para injetoras e prensas, pois elimina a fonte de combustível (óleo pressurizado) durante a supressão." },
            { q: "Qual a norma aplicável para proteção de máquinas industriais no Brasil?", a: "A NFPA 86 (Standard for Ovens and Furnaces) e a NBR 12615 (Sistemas fixos de combate a incêndio com CO₂) são as principais referências. Para cabines de pintura, a NFPA 33 é a norma específica. A instalação exige ART de engenheiro habilitado pelo CREA." },
            { q: "O sistema precisa de aprovação do Corpo de Bombeiros?", a: "Sim. Sistemas fixos de supressão de incêndio em estabelecimentos industriais devem ser aprovados pelo CBMMG conforme as Instruções Técnicas aplicáveis. A CO₂ Contra Incêndio prepara toda a documentação técnica necessária para aprovação, incluindo memorial descritivo, projeto executivo e ART." },
          ].map((faq, i) => (
            <div key={i} style={{ borderBottom: "1px solid #e2e8f0", padding: "1.5rem 0" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.75rem", fontFamily: "'Barlow', sans-serif" }}>{faq.q}</h3>
              <p style={{ color: "#475569", lineHeight: 1.7, margin: 0, fontSize: "0.95rem" }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #1a1f3e 100%)", padding: "5rem 0", borderTop: "3px solid #0891b2" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#fff", marginBottom: "1rem", fontFamily: "'Barlow', sans-serif" }}>
            Proteja suas máquinas industriais
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "1.05rem", maxWidth: "600px", margin: "0 auto 2rem", lineHeight: 1.7 }}>
            Analisamos cada máquina individualmente e projetamos o sistema mais eficaz para o risco específico.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contato">
              <button style={{ background: "#0891b2", color: "#fff", border: "none", borderRadius: "6px", padding: "0.9rem 2.5rem", fontSize: "1rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Barlow', sans-serif" }}>
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
