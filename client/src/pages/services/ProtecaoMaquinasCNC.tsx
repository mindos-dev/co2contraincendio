import { Link } from "wouter";
import SEOHead from "../../components/SEOHead";

const schema = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "Proteção contra Incêndio em Máquinas CNC — Sistema Rotarex FireDETEC",
  description:
    "Sistema FireDETEC instalado diretamente dentro da máquina CNC. Detecção por tubo linear sem energia elétrica. HFC-227ea / FK-5-1-12. NFPA 86 / EN 15004.",
  url: "https://co2contra.com/protecao-maquinas-cnc",
  author: { "@type": "Organization", name: "CO₂ Contra Incêndio" },
};

export default function ProtecaoMaquinasCNC() {
  return (
    <>
      <SEOHead
        title="Proteção contra Incêndio em Máquinas CNC | Rotarex FireDETEC | CO₂ Contra Incêndio"
        description="Sistema FireDETEC instalado diretamente dentro da máquina CNC. Detecção por tubo sensor linear sem energia elétrica. HFC-227ea / FK-5-1-12 / CO₂. NFPA 86. BH e MG."
        keywords="proteção incêndio máquina CNC, FireDETEC Rotarex, sistema automático extinção CNC, supressão incêndio centro usinagem, proteção maquinário industrial incêndio, tubo sensor linear"
        schema={schema}
      />

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #1a1f3e 100%)", padding: "6rem 0 4rem", borderBottom: "3px solid #7c3aed" }}>
        <div className="container">
          <div style={{ maxWidth: "800px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.4)", borderRadius: "4px", padding: "0.35rem 0.9rem", marginBottom: "1.5rem" }}>
              <span style={{ color: "#a78bfa", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Rotarex FireDETEC · NFPA 86 · EN 15004
              </span>
            </div>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: "1.5rem", fontFamily: "'Barlow', sans-serif" }}>
              Proteção contra Incêndio em<br />
              <span style={{ color: "#a78bfa" }}>Máquinas CNC e Centros de Usinagem</span>
            </h1>
            <p style={{ fontSize: "1.1rem", color: "#94a3b8", lineHeight: 1.7, marginBottom: "2rem", maxWidth: "680px" }}>
              O <strong style={{ color: "#e2e8f0" }}>Rotarex FireDETEC</strong> é instalado diretamente dentro da máquina CNC.
              O tubo sensor linear detecta calor e aciona a descarga automaticamente por pressão — sem energia elétrica,
              sem central de alarme, sem intervenção humana. Protege fluidos de corte, óleos de usinagem e componentes eletrônicos.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/contato">
                <button style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: "6px", padding: "0.85rem 2rem", fontSize: "1rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Barlow', sans-serif" }}>
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

      {/* COMO FUNCIONA */}
      <section style={{ padding: "5rem 0", background: "#fff" }}>
        <div className="container" style={{ maxWidth: "900px" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#0f172a", marginBottom: "1.5rem", fontFamily: "'Barlow', sans-serif" }}>
            Como Funciona o Rotarex FireDETEC
          </h2>
          <p style={{ fontSize: "1rem", color: "#475569", lineHeight: 1.8, marginBottom: "1.5rem" }}>
            O sistema FireDETEC utiliza um <strong>tubo sensor linear contínuo</strong> instalado dentro da zona de risco
            da máquina CNC. Este tubo é pressurizado internamente com nitrogênio. Quando a temperatura em qualquer ponto
            do tubo atinge o limiar de ativação (tipicamente 110°C–180°C), o tubo se rompe localmente, liberando a pressão.
            Esta queda de pressão aciona mecanicamente a válvula do cilindro de agente extintor — sem necessidade de
            energia elétrica, controlador eletrônico ou central de alarme.
          </p>
          <p style={{ fontSize: "1rem", color: "#475569", lineHeight: 1.8, marginBottom: "2rem" }}>
            O agente extintor (HFC-227ea, FK-5-1-12 ou CO₂) é então descarregado diretamente no ponto de incêndio,
            suprimindo o fogo antes que ele se propague para o restante da máquina ou para o ambiente da fábrica.
            O sistema é compacto o suficiente para ser instalado em qualquer máquina CNC — fresadoras, tornos, centros
            de usinagem, EDM e retificadoras.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.25rem" }}>
            {[
              { step: "01", title: "Tubo Sensor Pressurizado", desc: "Tubo linear instalado dentro da máquina monitora temperatura continuamente" },
              { step: "02", title: "Ruptura por Temperatura", desc: "Ao atingir o limiar, o tubo se rompe e libera pressão interna" },
              { step: "03", title: "Acionamento Mecânico", desc: "Queda de pressão aciona a válvula do cilindro sem eletricidade" },
              { step: "04", title: "Descarga Direta", desc: "Agente extintor suprime o fogo no ponto exato de origem" },
            ].map((s) => (
              <div key={s.step} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1.5rem" }}>
                <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#7c3aed", marginBottom: "0.5rem", fontFamily: "'Barlow', sans-serif" }}>{s.step}</div>
                <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "0.4rem", fontFamily: "'Barlow', sans-serif" }}>{s.title}</div>
                <div style={{ fontSize: "0.875rem", color: "#64748b", lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIPOS DE MÁQUINAS */}
      <section style={{ padding: "5rem 0", background: "#f8fafc" }}>
        <div className="container" style={{ maxWidth: "900px" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#0f172a", marginBottom: "1.5rem", fontFamily: "'Barlow', sans-serif" }}>
            Máquinas Compatíveis
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
            {[
              { icon: "⚙️", title: "Centros de Usinagem", items: ["Fresadoras CNC 3/4/5 eixos", "Tornos CNC", "Centros de torneamento", "Usinagem de alta velocidade (HSM)"] },
              { icon: "🔩", title: "Máquinas Especiais", items: ["EDM (eletro-erosão a fio)", "EDM por penetração", "Retificadoras CNC", "Honradoras"] },
              { icon: "🏭", title: "Automação Industrial", items: ["Células robotizadas de usinagem", "Sistemas de paletização", "Linhas transfer", "Máquinas de medição (CMM)"] },
              { icon: "💉", title: "Injetoras e Prensas", items: ["Injetoras de plástico", "Prensas hidráulicas", "Sopradoras", "Extrusoras"] },
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

      {/* AGENTES DISPONÍVEIS */}
      <section style={{ padding: "5rem 0", background: "#fff" }}>
        <div className="container" style={{ maxWidth: "900px" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#0f172a", marginBottom: "1.5rem", fontFamily: "'Barlow', sans-serif" }}>
            Agentes Extintores Disponíveis
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ background: "#0f172a", color: "#fff" }}>
                  {["Agente", "Nome Comercial", "Resíduo", "Seguro p/ Eletrônica", "Ideal Para"].map((h) => (
                    <th key={h} style={{ padding: "0.85rem 1rem", textAlign: "left", fontFamily: "'Barlow', sans-serif", fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["HFC-227ea", "FM-200", "Nenhum", "Sim", "Máquinas CNC, painéis, salas técnicas"],
                  ["FK-5-1-12", "Novec 1230", "Nenhum", "Sim", "Eletrônica sensível, museus, data centers"],
                  ["CO₂", "Dióxido de Carbono", "Nenhum", "Sim*", "Máquinas sem presença humana"],
                ].map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ padding: "0.85rem 1rem", color: j === 0 ? "#0f172a" : "#475569", fontWeight: j === 0 ? 700 : 400 }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "0.5rem" }}>
              * CO₂ é letal em concentrações de supressão. Uso restrito a áreas sem presença humana ou com travamento de acesso.
            </p>
          </div>
        </div>
      </section>

      {/* CENÁRIO REAL */}
      <section style={{ padding: "5rem 0", background: "#0f172a" }}>
        <div className="container" style={{ maxWidth: "900px" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#fff", marginBottom: "1.5rem", fontFamily: "'Barlow', sans-serif" }}>
            Cenário Industrial Real
          </h2>
          <div style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "10px", padding: "2rem" }}>
            <p style={{ color: "#e2e8f0", lineHeight: 1.8, margin: 0 }}>
              Uma indústria automotiva em Betim (MG) operava um centro de usinagem de 5 eixos para usinagem de blocos
              de motor. Durante a usinagem de alumínio com fluido de corte sintético, um acúmulo de névoa de fluido
              inflamável se formou no interior da máquina. Uma faísca gerada pelo contato da ferramenta com a peça
              iniciou um incêndio dentro do envelope da máquina. O sistema FireDETEC detectou o calor em 4 segundos e
              descarregou FM-200 diretamente no foco. O fogo foi suprimido antes de atingir o CLP e os servomotores.
              Dano total: substituição do tubo sensor (R$ 800). Sem sistema: perda estimada da máquina em R$ 1,2 milhão.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "5rem 0", background: "#f8fafc" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#0f172a", marginBottom: "2rem", fontFamily: "'Barlow', sans-serif" }}>
            Perguntas Frequentes
          </h2>
          {[
            { q: "O FireDETEC interfere no funcionamento normal da máquina CNC?", a: "Não. O sistema é instalado de forma passiva dentro da máquina e não interfere em nenhuma função de usinagem. O tubo sensor é flexível e pode ser roteado em qualquer configuração de máquina. A única interação é o desligamento automático da máquina ao acionar o sistema, que pode ser integrado ao CLP." },
            { q: "O sistema pode ser integrado ao sistema de alarme da fábrica?", a: "Sim. O FireDETEC possui módulo de sinalização elétrica opcional que envia sinal para o painel de alarme da fábrica ao acionar. Também pode integrar com o CLP da máquina para desligar o spindle e o avanço de eixos automaticamente." },
            { q: "Qual o prazo de recarga após acionamento?", a: "O cilindro de agente deve ser recarregado ou substituído após cada acionamento. O tubo sensor também deve ser substituído. A CO₂ Contra Incêndio realiza a recarga e substituição com prazo de 24-48 horas para minimizar a parada da produção." },
            { q: "O sistema funciona com qualquer fluido de corte?", a: "Sim. O FireDETEC é aprovado para uso com fluidos de corte sintéticos, semi-sintéticos e óleos integrais. O agente HFC-227ea ou FK-5-1-12 suprime tanto incêndios de classe B (líquidos inflamáveis) quanto classe C (elétrico)." },
            { q: "Qual norma rege a proteção de máquinas CNC no Brasil?", a: "A NFPA 86 (Standard for Ovens and Furnaces) e a EN 15004 são as referências internacionais. No Brasil, a NBR 12615 (Sistemas fixos de combate a incêndio) e as Instruções Técnicas do CBMMG complementam os requisitos. A instalação exige ART de engenheiro habilitado." },
          ].map((faq, i) => (
            <div key={i} style={{ borderBottom: "1px solid #e2e8f0", padding: "1.5rem 0" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.75rem", fontFamily: "'Barlow', sans-serif" }}>{faq.q}</h3>
              <p style={{ color: "#475569", lineHeight: 1.7, margin: 0, fontSize: "0.95rem" }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #1a1f3e 100%)", padding: "5rem 0", borderTop: "3px solid #7c3aed" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#fff", marginBottom: "1rem", fontFamily: "'Barlow', sans-serif" }}>
            Proteja suas máquinas CNC
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "1.05rem", maxWidth: "600px", margin: "0 auto 2rem", lineHeight: 1.7 }}>
            Instalamos o FireDETEC em qualquer modelo de máquina CNC com ART e sem parada prolongada da produção.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contato">
              <button style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: "6px", padding: "0.9rem 2.5rem", fontSize: "1rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Barlow', sans-serif" }}>
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
