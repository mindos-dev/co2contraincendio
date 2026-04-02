import { Link } from "wouter";
import SEOHead from "../../components/SEOHead";

const schema = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "Proteção contra Incêndio em Painéis Elétricos e Quadros de Controle",
  description:
    "Sistema FireDETEC para painéis elétricos com agentes limpos FK-5-1-12 e HFC-227ea. Sem resíduo, sem dano a eletrônicos. NFPA 2001 / NBR 16064.",
  url: "https://co2contra.com/protecao-paineis-eletricos",
  author: { "@type": "Organization", name: "CO₂ Contra Incêndio" },
};

export default function ProtecaoPaineisEletricos() {
  return (
    <>
      <SEOHead
        title="Proteção contra Incêndio em Painéis Elétricos | CO₂ Contra Incêndio"
        description="Sistema FireDETEC para painéis elétricos e quadros de controle. Agentes limpos FK-5-1-12 e HFC-227ea — sem resíduo, sem dano a componentes eletrônicos. NFPA 2001. BH e MG."
        keywords="proteção incêndio painel elétrico, supressão automática quadro controle, agente limpo painel elétrico, FireDETEC painel elétrico, sistema extinção automática subestação, Novec 1230 painel"
        schema={schema}
      />

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #1a1f3e 100%)", padding: "6rem 0 4rem", borderBottom: "3px solid #dc2626" }}>
        <div className="container">
          <div style={{ maxWidth: "800px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.4)", borderRadius: "4px", padding: "0.35rem 0.9rem", marginBottom: "1.5rem" }}>
              <span style={{ color: "#dc2626", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                FireDETEC · NFPA 2001 · NBR 16064
              </span>
            </div>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: "1.5rem", fontFamily: "'Barlow', sans-serif" }}>
              Proteção contra Incêndio em<br />
              <span style={{ color: "#f87171" }}>Painéis Elétricos e Quadros de Controle</span>
            </h1>
            <p style={{ fontSize: "1.1rem", color: "#94a3b8", lineHeight: 1.7, marginBottom: "2rem", maxWidth: "680px" }}>
              Arcos elétricos, superaquecimento e curtos-circuitos iniciam incêndios em painéis em segundos.
              O sistema <strong style={{ color: "#e2e8f0" }}>FireDETEC para painéis elétricos</strong> suprime automaticamente
              com agentes limpos — sem resíduo, sem dano a componentes eletrônicos, sem condutividade elétrica.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/contato">
                <button style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: "6px", padding: "0.85rem 2rem", fontSize: "1rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Barlow', sans-serif" }}>
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

      {/* CONFIGURAÇÕES */}
      <section style={{ padding: "5rem 0", background: "#fff" }}>
        <div className="container" style={{ maxWidth: "900px" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#0f172a", marginBottom: "1.5rem", fontFamily: "'Barlow', sans-serif" }}>
            Duas Configurações de Instalação
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            {[
              {
                title: "Sistema Direto",
                color: "#dc2626",
                desc: "O tubo sensor é instalado diretamente dentro do painel elétrico. Ao detectar calor, o tubo se rompe e o agente é descarregado diretamente no interior do painel. Ideal para painéis compactos e quadros de distribuição.",
                features: ["Tubo sensor dentro do painel", "Descarga direta no foco", "Sem necessidade de bicos distribuidores", "Instalação compacta"],
              },
              {
                title: "Sistema Indireto",
                color: "#7c3aed",
                desc: "O detector (tubo ou eletrônico) fica dentro do painel, mas o agente é descarregado por bicos distribuidores estrategicamente posicionados. Ideal para painéis grandes, salas de controle e subestações.",
                features: ["Detector separado da descarga", "Bicos distribuidores para cobertura uniforme", "Maior volume protegido", "Integração com alarme central"],
              },
            ].map((config) => (
              <div key={config.title} style={{ background: "#f8fafc", border: `1px solid ${config.color}40`, borderTop: `4px solid ${config.color}`, borderRadius: "10px", padding: "1.75rem" }}>
                <h3 style={{ fontWeight: 800, color: "#0f172a", marginBottom: "0.75rem", fontFamily: "'Barlow', sans-serif", fontSize: "1.1rem" }}>{config.title}</h3>
                <p style={{ fontSize: "0.9rem", color: "#475569", lineHeight: 1.7, marginBottom: "1rem" }}>{config.desc}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {config.features.map((f) => (
                    <li key={f} style={{ fontSize: "0.875rem", color: "#475569", padding: "0.25rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ color: config.color, fontWeight: 700 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POR QUE AGENTE LIMPO */}
      <section style={{ padding: "5rem 0", background: "#f8fafc" }}>
        <div className="container" style={{ maxWidth: "900px" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#0f172a", marginBottom: "1.5rem", fontFamily: "'Barlow', sans-serif" }}>
            Por que Usar Agente Limpo em Painéis Elétricos?
          </h2>
          <p style={{ fontSize: "1rem", color: "#475569", lineHeight: 1.8, marginBottom: "2rem" }}>
            Painéis elétricos concentram componentes de alto valor — CLPs, inversores de frequência, contatores,
            relés e cabeamentos. O uso de pó químico seco ou água em um painel elétrico em chamas garante a supressão
            do fogo, mas destrói todos os componentes internos. O custo de substituição pode ser 10 a 50 vezes maior
            que o custo do sistema de supressão.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
            {[
              { icon: "🚫", title: "Sem Resíduo", desc: "FK-5-1-12 e HFC-227ea evaporam completamente sem deixar pó, líquido ou resíduo corrosivo." },
              { icon: "⚡", title: "Não Condutor", desc: "Agentes limpos não conduzem eletricidade — seguros para uso em painéis energizados." },
              { icon: "🔧", title: "Sem Dano a Eletrônicos", desc: "Componentes eletrônicos permanecem intactos após a descarga — apenas limpeza simples necessária." },
              { icon: "⏱️", title: "Retorno Rápido", desc: "Após a descarga, o painel pode ser inspecionado e reativado em horas, não dias." },
            ].map((v) => (
              <div key={v.title} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1.5rem", textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{v.icon}</div>
                <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "0.4rem", fontFamily: "'Barlow', sans-serif" }}>{v.title}</div>
                <div style={{ fontSize: "0.875rem", color: "#64748b", lineHeight: 1.6 }}>{v.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* APLICAÇÕES */}
      <section style={{ padding: "5rem 0", background: "#fff" }}>
        <div className="container" style={{ maxWidth: "900px" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#0f172a", marginBottom: "1.5rem", fontFamily: "'Barlow', sans-serif" }}>
            Aplicações Típicas
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
            {[
              { icon: "🏭", title: "Indústria", items: ["Painéis de CLP e SCADA", "Quadros de distribuição BT/MT", "Salas de controle de processo", "Inversores de frequência"] },
              { icon: "🏢", title: "Comercial e Predial", items: ["Subestações de transformadores", "Quadros gerais de baixa tensão", "Salas de UPS e nobreaks", "Painéis de automação predial"] },
              { icon: "⚡", title: "Energia e Utilities", items: ["Subestações de transmissão", "Painéis de proteção de relés", "Salas de controle de usinas", "Sistemas de geração distribuída"] },
              { icon: "🚇", title: "Infraestrutura", items: ["Painéis de sinalização ferroviária", "Salas de controle de metrô", "Sistemas de controle de túneis", "Painéis de semáforos inteligentes"] },
            ].map((cat) => (
              <div key={cat.title} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1.5rem" }}>
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
      <section style={{ padding: "5rem 0", background: "#f8fafc" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#0f172a", marginBottom: "2rem", fontFamily: "'Barlow', sans-serif" }}>
            Perguntas Frequentes
          </h2>
          {[
            { q: "O sistema pode ser instalado em painéis energizados?", a: "Sim. Os agentes limpos FK-5-1-12 e HFC-227ea não conduzem eletricidade e são seguros para uso em painéis energizados. A instalação do sistema (tubo sensor e cilindro) é realizada com o painel desligado, mas o sistema opera normalmente com o painel em operação." },
            { q: "Qual a diferença entre FK-5-1-12 (Novec 1230) e HFC-227ea (FM-200)?", a: "O FK-5-1-12 (Novec 1230) tem potencial de aquecimento global (GWP) muito menor (1 vs. 3500) e tempo de permanência na atmosfera de apenas 5 dias vs. 36 anos do HFC-227ea. Ambos são igualmente eficazes na supressão. O FK-5-1-12 é a escolha preferida para novos projetos por razões ambientais e regulatórias." },
            { q: "O sistema precisa de manutenção preventiva?", a: "Sim. A NFPA 2001 recomenda inspeção semestral e manutenção anual. O cilindro de agente deve ser pesado anualmente para verificar perda de carga. O tubo sensor deve ser inspecionado visualmente. A CO₂ Contra Incêndio oferece contratos de manutenção preventiva com emissão de laudo técnico." },
            { q: "O sistema pode ser integrado ao SDAI (Sistema de Detecção e Alarme de Incêndio)?", a: "Sim. O FireDETEC possui módulo de sinalização que envia sinal para o painel de alarme do SDAI ao acionar. Também pode integrar com sistemas de automação predial (BMS) para desligar a alimentação do painel e acionar ventilação de emergência." },
            { q: "Qual o prazo de validade do agente extintor?", a: "O FK-5-1-12 (Novec 1230) tem prazo de validade indefinido quando armazenado corretamente em cilindro pressurizado. O HFC-227ea também não tem prazo de validade definido. A verificação anual da pressão do cilindro é suficiente para garantir a integridade do sistema." },
          ].map((faq, i) => (
            <div key={i} style={{ borderBottom: "1px solid #e2e8f0", padding: "1.5rem 0" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.75rem", fontFamily: "'Barlow', sans-serif" }}>{faq.q}</h3>
              <p style={{ color: "#475569", lineHeight: 1.7, margin: 0, fontSize: "0.95rem" }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #1a1f3e 100%)", padding: "5rem 0", borderTop: "3px solid #dc2626" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#fff", marginBottom: "1rem", fontFamily: "'Barlow', sans-serif" }}>
            Proteja seus painéis elétricos
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "1.05rem", maxWidth: "600px", margin: "0 auto 2rem", lineHeight: 1.7 }}>
            Nossa equipe projeta o sistema correto para cada painel — direto ou indireto, com o agente mais adequado para sua aplicação.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contato">
              <button style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: "6px", padding: "0.9rem 2.5rem", fontSize: "1rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Barlow', sans-serif" }}>
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
