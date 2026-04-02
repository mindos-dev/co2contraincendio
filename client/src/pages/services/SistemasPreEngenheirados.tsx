import { Link } from "wouter";
import SEOHead from "../../components/SEOHead";

const applications = [
  {
    id: "veiculos-off-road",
    icon: "🚜",
    title: "Veículos Off-Road e Máquinas Pesadas",
    subtitle: "Escavadeiras, colheitadeiras, mineração",
    description:
      "Sistemas Amerex Dry-ICS com agente duplo (pó químico seco + agente líquido ICS) para proteção automática de motores, sistemas hidráulicos e cabines em ambientes de mineração e construção.",
    norm: "NFPA 122 / NBR 15808",
    agent: "Pó Químico Seco + ICS Líquido",
    href: "/protecao-veiculos-off-road",
    color: "#b45309",
  },
  {
    id: "compartimento-motor",
    icon: "🔧",
    title: "Compartimento de Motor",
    subtitle: "Water mist, dry chemical e dual agent",
    description:
      "Proteção específica para compartimentos de motor com sistemas de resfriamento por névoa d'água e supressão por pó químico, prevenindo re-ignição em áreas confinadas de alta temperatura.",
    norm: "NFPA 17 / NBR 12693",
    agent: "Water Mist / Pó Químico / Dual Agent",
    href: "/protecao-compartimento-motor",
    color: "#0369a1",
  },
  {
    id: "maquinas-cnc",
    icon: "⚙️",
    title: "Máquinas CNC e Maquinário Industrial",
    subtitle: "Sistema Rotarex FireDETEC",
    description:
      "O FireDETEC da Rotarex é instalado diretamente dentro da máquina CNC. O tubo sensor linear detecta calor e aciona a descarga automaticamente, sem necessidade de energia elétrica.",
    norm: "NFPA 86 / EN 15004",
    agent: "HFC-227ea / FK-5-1-12 / CO₂",
    href: "/protecao-maquinas-cnc",
    color: "#7c3aed",
  },
  {
    id: "paineis-eletricos",
    icon: "⚡",
    title: "Painéis Elétricos e Quadros de Controle",
    subtitle: "Agentes limpos e CO₂",
    description:
      "Sistemas FireDETEC para painéis elétricos com agentes limpos (FK-5-1-12 / HFC-227ea) que suprimem o incêndio sem danificar componentes eletrônicos e sem deixar resíduo.",
    norm: "NFPA 2001 / IEC 62305",
    agent: "FK-5-1-12 / HFC-227ea / CO₂",
    href: "/protecao-paineis-eletricos",
    color: "#dc2626",
  },
  {
    id: "laboratorios",
    icon: "🧪",
    title: "Capelas de Laboratório e Armazenamento Químico",
    subtitle: "Rotarex FireDETEC Fume Hood",
    description:
      "Sistema pré-engenheirado para capelas de exaustão e armários de produtos químicos. Detecção e supressão automática em ambientes com vapores inflamáveis e reagentes voláteis.",
    norm: "NFPA 45 / NBR 14276",
    agent: "CO₂ / HFC-227ea",
    href: "/protecao-laboratorios",
    color: "#059669",
  },
  {
    id: "maquinas-industriais",
    icon: "🏭",
    title: "Máquinas Industriais (Injeção, Prensas, CNC)",
    subtitle: "Aplicação local vs. inundação total",
    description:
      "Sistemas de aplicação local para proteção pontual de pontos de risco em prensas hidráulicas, injetoras de plástico e centros de usinagem, sem necessidade de inundar o ambiente inteiro.",
    norm: "NFPA 86 / NBR 12615",
    agent: "CO₂ / Pó Químico / Agente Limpo",
    href: "/protecao-maquinas-industriais",
    color: "#0891b2",
  },
  {
    id: "cozinhas-industriais",
    icon: "🍳",
    title: "Cozinhas Industriais",
    subtitle: "Wet chemical e saponificante",
    description:
      "Sistemas de supressão por agente saponificante (Wet Chemical) para proteção de coifas, fritadeiras e equipamentos de cocção. Corte automático de gás e saponificação da gordura.",
    norm: "NBR 16077 / NFPA 17A / UL 300",
    agent: "Wet Chemical (Agente K)",
    href: "/sistema-saponificante",
    color: "#d97706",
  },
  {
    id: "aplicacoes-especiais",
    icon: "🌐",
    title: "Aplicações Especiais",
    subtitle: "Data centers, telecom, hospitais, offshore, turbinas eólicas",
    description:
      "Soluções para ambientes críticos com agentes limpos de última geração: Novec 1230, FM-200, Inergen e CO₂. Proteção sem danos a equipamentos sensíveis e aprovada pelo Corpo de Bombeiros.",
    norm: "NFPA 2001 / NFPA 12 / NBR 16064",
    agent: "Novec 1230 / FM-200 / Inergen / CO₂",
    href: "/aplicacoes-especiais",
    color: "#6b7280",
  },
];

const schema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Sistemas Pré-Engenheirados de Combate a Incêndio | CO₂ Contra Incêndio",
  description:
    "Sistemas automáticos pré-engenheirados de supressão de incêndio para veículos, máquinas CNC, painéis elétricos, laboratórios e aplicações industriais em BH e MG.",
  url: "https://co2contra.com/sistemas-pre-engenheirados",
  mainEntity: {
    "@type": "Service",
    name: "Sistemas Pré-Engenheirados de Combate a Incêndio",
    provider: {
      "@type": "LocalBusiness",
      name: "CO₂ Contra Incêndio",
      telephone: "+55-31-99738-3115",
      address: { "@type": "PostalAddress", addressLocality: "Belo Horizonte", addressRegion: "MG" },
    },
  },
};

export default function SistemasPreEngenheirados() {
  return (
    <>
      <SEOHead
        title="Sistemas Pré-Engenheirados de Combate a Incêndio | CO₂ Contra Incêndio"
        description="Sistemas automáticos pré-engenheirados de supressão de incêndio para veículos off-road, máquinas CNC, painéis elétricos, laboratórios e aplicações industriais. Amerex, Rotarex FireDETEC. BH e MG."
        keywords="sistema fixo de incêndio, supressão automática incêndio, sistema pré-engenheirado, proteção máquinas industriais, combate incêndio industrial, FireDETEC, Amerex, sistema CO2"
        schema={schema}
      />

      {/* HERO */}
      <section
        style={{
          background: "linear-gradient(135deg, #0a0f1e 0%, #1a1f3e 50%, #0d1117 100%)",
          padding: "6rem 0 4rem",
          borderBottom: "3px solid #dc2626",
        }}
      >
        <div className="container">
          <div style={{ maxWidth: "800px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(220,38,38,0.15)",
                border: "1px solid rgba(220,38,38,0.4)",
                borderRadius: "4px",
                padding: "0.35rem 0.9rem",
                marginBottom: "1.5rem",
              }}
            >
              <span style={{ color: "#dc2626", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Engenharia Industrial de Proteção
              </span>
            </div>
            <h1
              style={{
                fontSize: "clamp(2rem, 5vw, 3.2rem)",
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1.15,
                marginBottom: "1.5rem",
                fontFamily: "'Barlow', sans-serif",
              }}
            >
              Sistemas Pré-Engenheirados<br />
              <span style={{ color: "#dc2626" }}>de Combate a Incêndio</span>
            </h1>
            <p
              style={{
                fontSize: "1.15rem",
                color: "#94a3b8",
                lineHeight: 1.7,
                marginBottom: "2rem",
                maxWidth: "680px",
              }}
            >
              A CO₂ Contra Incêndio não vende uma solução única. Entregamos{" "}
              <strong style={{ color: "#e2e8f0" }}>o sistema certo para cada aplicação</strong>. Cada ambiente industrial
              exige uma tecnologia diferente — gás, agente líquido, pó químico, névoa d'água ou agente limpo.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/contato">
                <button
                  style={{
                    background: "#dc2626",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "0.85rem 2rem",
                    fontSize: "1rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "'Barlow', sans-serif",
                  }}
                >
                  Solicitar Projeto Técnico
                </button>
              </Link>
              <a href="tel:+5531997383115">
                <button
                  style={{
                    background: "transparent",
                    color: "#e2e8f0",
                    border: "1px solid rgba(226,232,240,0.3)",
                    borderRadius: "6px",
                    padding: "0.85rem 2rem",
                    fontSize: "1rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "'Barlow', sans-serif",
                  }}
                >
                  (31) 9 9738-3115
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* O QUE É UM SISTEMA PRÉ-ENGENHEIRADO */}
      <section style={{ background: "#f8fafc", padding: "5rem 0" }}>
        <div className="container">
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <h2
              style={{
                fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: "1.5rem",
                fontFamily: "'Barlow', sans-serif",
              }}
            >
              O que é um Sistema Pré-Engenheirado?
            </h2>
            <p style={{ fontSize: "1.05rem", color: "#475569", lineHeight: 1.8, marginBottom: "1.5rem" }}>
              Um sistema pré-engenheirado de supressão de incêndio é projetado, testado e aprovado em fábrica para
              aplicações específicas. Diferente dos sistemas convencionais que exigem projeto hidráulico individual,
              os sistemas pré-engenheirados chegam ao canteiro prontos para instalação, com detecção automática e
              descarga integradas em um único conjunto compacto.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "1.5rem",
                marginTop: "2rem",
              }}
            >
              {[
                { icon: "🏭", label: "Projetado em fábrica", desc: "Design e testes realizados pelo fabricante" },
                { icon: "✅", label: "Pré-aprovado", desc: "Certificações UL, FM e ABNT já obtidas" },
                { icon: "⚡", label: "Pronto para instalar", desc: "Instalação rápida sem projeto específico" },
                { icon: "🤖", label: "100% automático", desc: "Detecção e descarga sem intervenção humana" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "1.5rem",
                    textAlign: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{item.icon}</div>
                  <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "0.4rem", fontFamily: "'Barlow', sans-serif" }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "#64748b" }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MENSAGEM CENTRAL */}
      <section style={{ background: "#0f172a", padding: "4rem 0" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2
            style={{
              fontSize: "clamp(1.4rem, 3vw, 2rem)",
              fontWeight: 800,
              color: "#fff",
              marginBottom: "1rem",
              fontFamily: "'Barlow', sans-serif",
            }}
          >
            Cada Ambiente Exige uma Tecnologia Diferente
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "1.05rem", maxWidth: "700px", margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
            Não existe sistema universal. Uma máquina CNC exige detecção interna por tubo linear. Um veículo de mineração
            exige pó químico com resfriamento líquido. Um data center exige agente limpo sem resíduo. Conhecemos cada
            tecnologia e aplicamos a correta.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap" }}>
            {[
              { label: "Sistemas a Gás", icon: "💨" },
              { label: "Agentes Líquidos", icon: "💧" },
              { label: "Pó Químico Seco", icon: "🌫️" },
              { label: "Névoa d'Água", icon: "🌊" },
              { label: "Agentes Limpos", icon: "✨" },
            ].map((t) => (
              <div
                key={t.label}
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "8px",
                  padding: "0.75rem 1.5rem",
                  color: "#e2e8f0",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GRID DE APLICAÇÕES */}
      <section style={{ padding: "5rem 0", background: "#fff" }}>
        <div className="container">
          <h2
            style={{
              fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
              fontWeight: 800,
              color: "#0f172a",
              marginBottom: "0.75rem",
              fontFamily: "'Barlow', sans-serif",
            }}
          >
            Aplicações Industriais
          </h2>
          <p style={{ color: "#64748b", fontSize: "1.05rem", marginBottom: "3rem", maxWidth: "600px" }}>
            Selecione a aplicação para ver o sistema recomendado, normas aplicáveis e cenários reais de instalação.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {applications.map((app) => (
              <Link key={app.id} href={app.href}>
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "1.75rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    borderLeft: `4px solid ${app.color}`,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ fontSize: "2rem" }}>{app.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "1.05rem", fontFamily: "'Barlow', sans-serif" }}>
                        {app.title}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>{app.subtitle}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: "0.9rem", color: "#475569", lineHeight: 1.6, margin: 0 }}>
                    {app.description}
                  </p>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "auto" }}>
                    <span
                      style={{
                        background: "#f1f5f9",
                        color: "#475569",
                        fontSize: "0.75rem",
                        padding: "0.25rem 0.6rem",
                        borderRadius: "4px",
                        fontWeight: 600,
                      }}
                    >
                      {app.norm}
                    </span>
                    <span
                      style={{
                        background: `${app.color}15`,
                        color: app.color,
                        fontSize: "0.75rem",
                        padding: "0.25rem 0.6rem",
                        borderRadius: "4px",
                        fontWeight: 600,
                      }}
                    >
                      {app.agent}
                    </span>
                  </div>
                  <div
                    style={{
                      color: app.color,
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    Ver detalhes técnicos →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TABELA COMPARATIVA */}
      <section style={{ background: "#f8fafc", padding: "5rem 0" }}>
        <div className="container">
          <h2
            style={{
              fontSize: "clamp(1.4rem, 3vw, 2rem)",
              fontWeight: 800,
              color: "#0f172a",
              marginBottom: "2rem",
              fontFamily: "'Barlow', sans-serif",
            }}
          >
            Comparativo de Agentes Extintores
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ background: "#0f172a", color: "#fff" }}>
                  {["Agente", "Aplicação Principal", "Resíduo", "Seguro p/ Eletrônica", "Norma", "Re-ignição"].map((h) => (
                    <th key={h} style={{ padding: "0.85rem 1rem", textAlign: "left", fontFamily: "'Barlow', sans-serif", fontWeight: 700 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Pó Químico Seco (ABC)", "Veículos, indústria geral", "Alto", "Não", "NFPA 17 / NBR 12693", "Médio"],
                  ["ICS Líquido (Amerex)", "Veículos off-road, mineração", "Baixo", "Não", "NFPA 122", "Baixo"],
                  ["CO₂", "Painéis, salas técnicas", "Nenhum", "Sim", "NFPA 12 / NBR 12615", "Alto"],
                  ["HFC-227ea (FM-200)", "Eletrônica, data centers", "Nenhum", "Sim", "NFPA 2001 / NBR 16064", "Baixo"],
                  ["FK-5-1-12 (Novec 1230)", "Eletrônica, museus", "Nenhum", "Sim", "NFPA 2001", "Muito Baixo"],
                  ["Wet Chemical (Agente K)", "Cozinhas industriais", "Médio (saponificado)", "Não", "NFPA 17A / NBR 16077", "Muito Baixo"],
                  ["Water Mist", "Motores, turbinas", "Nenhum", "Parcial", "NFPA 750", "Baixo"],
                ].map((row, i) => (
                  <tr
                    key={i}
                    style={{
                      background: i % 2 === 0 ? "#fff" : "#f8fafc",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    {row.map((cell, j) => (
                      <td key={j} style={{ padding: "0.85rem 1rem", color: j === 0 ? "#0f172a" : "#475569", fontWeight: j === 0 ? 700 : 400 }}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "5rem 0", background: "#fff" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          <h2
            style={{
              fontSize: "clamp(1.4rem, 3vw, 2rem)",
              fontWeight: 800,
              color: "#0f172a",
              marginBottom: "2rem",
              fontFamily: "'Barlow', sans-serif",
            }}
          >
            Perguntas Frequentes
          </h2>
          {[
            {
              q: "Sistema pré-engenheirado precisa de ART?",
              a: "Sim. Mesmo sendo um sistema pré-aprovado pelo fabricante, a instalação em território brasileiro exige Anotação de Responsabilidade Técnica (ART) de engenheiro habilitado pelo CREA, conforme a NBR 15808 e as normas do Corpo de Bombeiros Militar de Minas Gerais.",
            },
            {
              q: "Qual a diferença entre aplicação local e inundação total?",
              a: "Na aplicação local, o agente é direcionado diretamente ao ponto de risco (ex: cabeçote de uma fresadora). Na inundação total, o agente preenche completamente o volume do ambiente protegido (ex: sala de servidores). A escolha depende do tipo de risco, do agente extinguidor e da norma aplicável.",
            },
            {
              q: "O sistema FireDETEC da Rotarex funciona sem energia elétrica?",
              a: "Sim. O sistema FireDETEC utiliza um tubo sensor pneumático que detecta calor e aciona a descarga por pressão, sem necessidade de energia elétrica. Isso o torna ideal para máquinas CNC e painéis elétricos onde a falha de energia pode ser justamente a causa do incêndio.",
            },
            {
              q: "Qual sistema é recomendado para veículos de mineração?",
              a: "O sistema Amerex Dry-ICS (Dual Agent) é o padrão da indústria para veículos de mineração. Combina pó químico seco para knockdown rápido do fogo com agente líquido ICS para resfriamento e prevenção de re-ignição em motores e sistemas hidráulicos.",
            },
            {
              q: "Sistemas pré-engenheirados atendem às normas do CBMMG?",
              a: "Sim, desde que instalados por empresa habilitada com ART. A CO₂ Contra Incêndio realiza a instalação conforme as Instruções Técnicas do CBMMG, a NBR 15808 e as normas NFPA aplicáveis a cada sistema.",
            },
          ].map((faq, i) => (
            <div
              key={i}
              style={{
                borderBottom: "1px solid #e2e8f0",
                padding: "1.5rem 0",
              }}
            >
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#0f172a",
                  marginBottom: "0.75rem",
                  fontFamily: "'Barlow', sans-serif",
                }}
              >
                {faq.q}
              </h3>
              <p style={{ color: "#475569", lineHeight: 1.7, margin: 0, fontSize: "0.95rem" }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section
        style={{
          background: "linear-gradient(135deg, #0a0f1e 0%, #1a1f3e 100%)",
          padding: "5rem 0",
          borderTop: "3px solid #dc2626",
        }}
      >
        <div className="container" style={{ textAlign: "center" }}>
          <h2
            style={{
              fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
              fontWeight: 800,
              color: "#fff",
              marginBottom: "1rem",
              fontFamily: "'Barlow', sans-serif",
            }}
          >
            Qual sistema é certo para sua aplicação?
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "1.05rem", maxWidth: "600px", margin: "0 auto 2rem", lineHeight: 1.7 }}>
            Nossa equipe técnica analisa o risco, o ambiente e as normas aplicáveis para recomendar o sistema
            correto. Sem sobrevenda. Sem solução genérica.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contato">
              <button
                style={{
                  background: "#dc2626",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "0.9rem 2.5rem",
                  fontSize: "1rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'Barlow', sans-serif",
                }}
              >
                Solicitar Análise Técnica
              </button>
            </Link>
            <Link href="/app">
              <button
                style={{
                  background: "transparent",
                  color: "#e2e8f0",
                  border: "1px solid rgba(226,232,240,0.3)",
                  borderRadius: "6px",
                  padding: "0.9rem 2.5rem",
                  fontSize: "1rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'Barlow', sans-serif",
                }}
              >
                Acessar Plataforma OPERIS
              </button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
