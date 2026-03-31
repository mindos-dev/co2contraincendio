import { Link } from "wouter";
import Layout from "../components/Layout";
import SEOHead from "../components/SEOHead";
import { ArrowRight, Shield, CheckCircle, Award, Phone } from "lucide-react";

const schemaJson = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Parceiros Técnicos — CO₂ Contra Incêndio",
  "description": "Parceiros fabricantes de sistemas de combate a incêndio: Amerex, Rotarex FireDETEC, Skyfire, Segurimax, Intelbras. Produtos certificados INMETRO e aprovados pelo Corpo de Bombeiros.",
  "url": "https://www.co2contraincendio.com/parceiros",
  "provider": {
    "@type": "LocalBusiness",
    "name": "CO₂ Contra Incêndio",
    "telephone": "+55-31-97358-1278",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Belo Horizonte",
      "addressRegion": "MG",
      "addressCountry": "BR"
    }
  }
};

const partners = [
  {
    name: "Amerex",
    category: "Extintores e Sistemas Fixos",
    country: "EUA — Fundada em 1971",
    description: "Líder mundial em extintores de incêndio e sistemas fixos de supressão. A Amerex fabrica extintores portáteis, sobre rodas e sistemas fixos de CO₂, pó químico, agente limpo e saponificante. Todos os produtos são certificados UL (Underwriters Laboratories) e aprovados pelo Corpo de Bombeiros no Brasil.",
    products: [
      "Extintores portáteis CO₂, PQS, AP, AFFF",
      "Extintores sobre rodas industriais",
      "Sistemas fixos de saponificante para cozinhas",
      "Sistemas fixos de CO₂ de alta pressão",
      "Extintores de agente limpo (HFC-227ea)",
    ],
    certifications: ["UL Listed", "FM Approved", "INMETRO", "CBMMG"],
    color: "#C8102E",
    website: "https://www.amerex-fire.com",
  },
  {
    name: "Rotarex FireDETEC",
    category: "Detecção Linear e Supressão",
    country: "Luxemburgo — Fundada em 1922",
    description: "Referência mundial em sistemas de detecção linear de incêndio e supressão automática. O sistema FireDETEC da Rotarex utiliza tubo de detecção flexível que atua como detector e agente extintor simultaneamente, ideal para painéis elétricos, geradores, quadros de comando e ambientes de difícil acesso.",
    products: [
      "Sistema FireDETEC — tubo de detecção e extinção",
      "Supressão automática para painéis elétricos",
      "Sistemas para veículos e maquinário pesado",
      "Sistemas para geradores e UPS",
      "Válvulas e acessórios para CO₂ e gases limpos",
    ],
    certifications: ["CE Marking", "VdS Approved", "FM Global", "INMETRO"],
    color: "#003087",
    website: "https://www.rotarex-firesafety.com",
  },
  {
    name: "Skyfire",
    category: "Sistemas de Supressão por Gás",
    country: "Brasil",
    description: "Fabricante nacional especializada em sistemas fixos de supressão por gás para proteção de ambientes críticos. A Skyfire desenvolve sistemas com CO₂, FM-200 (HFC-227ea), Novec 1230, Inergen e outros agentes limpos, com projetos customizados para data centers, salas técnicas, museus e patrimônios históricos.",
    products: [
      "Sistemas de supressão por CO₂ total flooding",
      "Sistemas FM-200 / HFC-227ea",
      "Sistemas Novec 1230 (FK-5-1-12)",
      "Sistemas Inergen (IG-541)",
      "Centrais de alarme e detecção integradas",
    ],
    certifications: ["INMETRO", "CBMMG", "ISO 9001", "ABNT NBR 12615"],
    color: "#1a5c2a",
    website: "#",
  },
  {
    name: "Segurimax",
    category: "Extintores e Equipamentos de Segurança",
    country: "Brasil — Fundada em 1980",
    description: "Uma das maiores fabricantes de extintores de incêndio do Brasil. A Segurimax produz extintores portáteis e sobre rodas com certificação INMETRO, além de equipamentos de sinalização, iluminação de emergência e acessórios para brigada de incêndio. Presente em todo o território nacional.",
    products: [
      "Extintores portáteis CO₂, PQS, AP, AFFF",
      "Extintores sobre rodas",
      "Sinalização de emergência (placas fotoluminescentes)",
      "Iluminação de emergência",
      "Mangueiras e acessórios para hidrantes",
    ],
    certifications: ["INMETRO", "CBMMG", "ISO 9001", "ABNT NBR 12693"],
    color: "#7a2000",
    website: "https://www.segurimax.com.br",
  },
  {
    name: "Intelbras",
    category: "Detecção, Alarme e Automação",
    country: "Brasil — Fundada em 1976",
    description: "Líder brasileira em tecnologia para segurança eletrônica. A Intelbras oferece uma linha completa de centrais de alarme de incêndio convencional e endereçável, detectores de fumaça, calor e CO, acionadores manuais, sirenes e sistemas integrados de automação predial. Produtos com certificação INMETRO e aprovação do CBMMG.",
    products: [
      "Centrais de alarme de incêndio convencional",
      "Centrais endereçáveis com protocolo aberto",
      "Detectores de fumaça iônicos e ópticos",
      "Detectores de calor fixo e termovelocimétrico",
      "Acionadores manuais e sirenes",
      "Detectores de CO (monóxido de carbono)",
    ],
    certifications: ["INMETRO", "CBMMG", "ANATEL", "ISO 9001", "ABNT NBR 17240"],
    color: "#1a3a6b",
    website: "https://www.intelbras.com.br",
  },
];

const whyPartners = [
  {
    icon: <Shield size={22} />,
    title: "Produtos Certificados",
    desc: "Todos os fabricantes parceiros possuem certificação INMETRO e aprovação do Corpo de Bombeiros para comercialização no Brasil.",
  },
  {
    icon: <CheckCircle size={22} />,
    title: "Conformidade Normativa",
    desc: "Equipamentos desenvolvidos em conformidade com as normas ABNT NBR, NFPA e padrões internacionais UL, FM e CE.",
  },
  {
    icon: <Award size={22} />,
    title: "Assistência Técnica",
    desc: "Suporte técnico especializado, peças de reposição originais e garantia de fabricante para todos os equipamentos fornecidos.",
  },
];

export default function Parceiros() {
  return (
    <Layout>
      <SEOHead
        title="Parceiros T\u00e9cnicos — Fabricantes Certificados"
        description="Parceiros fabricantes de sistemas de combate a inc\u00eandio: Amerex, Rotarex FireDETEC, Skyfire, Segurimax, Intelbras. Produtos certificados INMETRO e aprovados pelo Corpo de Bombeiros."
        keywords="parceiros fabricantes incendio, Amerex UL 300, Rotarex FireDETEC, Intelbras alarme, Segurimax detector, Skyfire CO2"
        canonical="/parceiros"
        breadcrumbs={[{ name: "Parceiros", url: "/parceiros" }]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />

      {/* HERO */}
      <section style={{
        background: "linear-gradient(135deg, var(--gray-900) 0%, #1a0a0a 100%)",
        padding: "5rem 0 4rem",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url(https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1600&q=60)",
          backgroundSize: "cover", backgroundPosition: "center",
          opacity: 0.10,
        }} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
            <Link href="/" style={{ color: "var(--gray-400)", fontSize: "0.8125rem" }}>Home</Link>
            <span style={{ color: "var(--gray-600)" }}>/</span>
            <span style={{ color: "#fff", fontSize: "0.8125rem" }}>Parceiros</span>
          </div>
          <div className="section-label" style={{ color: "rgba(255,255,255,0.6)" }}>Fabricantes Homologados</div>
          <div className="divider-red" />
          <h1 className="text-display" style={{ color: "#fff", marginBottom: "1.25rem", maxWidth: "720px" }}>
            Parceiros Técnicos e Fabricantes
          </h1>
          <p style={{ color: "rgba(255,255,255,0.78)", fontSize: "1.0625rem", lineHeight: 1.75, maxWidth: "620px", marginBottom: "2.5rem" }}>
            Trabalhamos exclusivamente com fabricantes líderes de mercado, cujos equipamentos possuem certificação INMETRO, aprovação do Corpo de Bombeiros e conformidade com as normas ABNT e NFPA.
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link href="/contato" className="btn-primary">Solicitar Orçamento <ArrowRight size={14} /></Link>
            <a href="https://wa.me/5531973581278?text=Olá! Gostaria de informações sobre os equipamentos." target="_blank" rel="noopener noreferrer" className="btn-outline-white">WhatsApp</a>
          </div>
        </div>
      </section>

      {/* QUICK CTA BAR */}
      <div style={{ background: "var(--red)", padding: "1rem 0" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <span style={{ color: "#fff", fontSize: "0.9375rem", fontWeight: 600 }}>
            Equipamentos originais com garantia de fabricante — Atendemos BH e todo o Brasil
          </span>
          <a href="tel:+5531973581278" style={{ color: "#fff", fontSize: "0.875rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Phone size={14} /> (31) 97358-1278
          </a>
        </div>
      </div>

      {/* POR QUE NOSSOS PARCEIROS */}
      <section style={{ padding: "4rem 0", background: "var(--gray-50)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div className="section-label">Critérios de Seleção</div>
            <div className="divider-red" style={{ margin: "0 auto 1.25rem" }} />
            <h2 className="text-headline">Por que escolhemos estes fabricantes</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
            {whyPartners.map(w => (
              <div key={w.title} style={{
                background: "#fff", padding: "2rem 1.75rem",
                borderTop: "3px solid var(--red)",
                display: "flex", flexDirection: "column", gap: "0.75rem",
              }}>
                <div style={{ color: "var(--red)" }}>{w.icon}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1.125rem", color: "var(--gray-900)" }}>{w.title}</div>
                <p style={{ color: "var(--gray-600)", fontSize: "0.875rem", lineHeight: 1.75 }}>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARCEIROS — CARDS DETALHADOS */}
      <section style={{ padding: "5rem 0", background: "#fff" }}>
        <div className="container">
          <div style={{ marginBottom: "3.5rem" }}>
            <div className="section-label">Nossos Parceiros</div>
            <div className="divider-red" />
            <h2 className="text-headline">Fabricantes e fornecedores homologados</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            {partners.map((p, i) => (
              <div
                key={p.name}
                style={{
                  display: "grid",
                  gridTemplateColumns: i % 2 === 0 ? "280px 1fr" : "1fr 280px",
                  gap: "0",
                  border: "1.5px solid var(--gray-200)",
                  overflow: "hidden",
                  transition: "box-shadow 0.22s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.10)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
              >
                {/* Coluna colorida */}
                <div
                  style={{
                    background: p.color,
                    padding: "2.5rem 2rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    order: i % 2 === 0 ? 0 : 1,
                  }}
                >
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 900,
                    fontSize: "2.5rem",
                    color: "#fff",
                    lineHeight: 1,
                    marginBottom: "0.5rem",
                    letterSpacing: "-0.01em",
                  }}>
                    {p.name}
                  </div>
                  <div style={{
                    color: "rgba(255,255,255,0.75)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: "1rem",
                  }}>
                    {p.category}
                  </div>
                  <div style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: "0.75rem",
                    marginBottom: "1.5rem",
                  }}>
                    {p.country}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                    {p.certifications.map(cert => (
                      <span key={cert} style={{
                        background: "rgba(255,255,255,0.15)",
                        color: "#fff",
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        padding: "0.2rem 0.6rem",
                        letterSpacing: "0.06em",
                        border: "1px solid rgba(255,255,255,0.25)",
                      }}>
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Coluna de conteúdo */}
                <div style={{
                  padding: "2.5rem 2.5rem",
                  background: "#fff",
                  order: i % 2 === 0 ? 1 : 0,
                }}>
                  <p style={{ color: "var(--gray-600)", lineHeight: 1.8, marginBottom: "1.5rem", fontSize: "0.9375rem" }}>
                    {p.description}
                  </p>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <div style={{
                      fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.1em",
                      textTransform: "uppercase", color: "var(--gray-500)", marginBottom: "0.75rem",
                    }}>
                      Principais produtos
                    </div>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      {p.products.map(prod => (
                        <li key={prod} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.875rem", color: "var(--gray-700)" }}>
                          <span style={{ color: "var(--red)", fontWeight: 900, flexShrink: 0, marginTop: "1px" }}>—</span>
                          {prod}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    <Link href="/contato" style={{
                      display: "inline-flex", alignItems: "center", gap: "0.4rem",
                      color: "var(--red)", fontSize: "0.8125rem", fontWeight: 700,
                      letterSpacing: "0.06em", textTransform: "uppercase",
                    }}>
                      Solicitar produto <ArrowRight size={13} />
                    </Link>
                    {p.website !== "#" && (
                      <a href={p.website} target="_blank" rel="noopener noreferrer" style={{
                        display: "inline-flex", alignItems: "center", gap: "0.4rem",
                        color: "var(--gray-500)", fontSize: "0.8125rem", fontWeight: 600,
                        letterSpacing: "0.04em",
                      }}>
                        Site do fabricante ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NORMAS DOS EQUIPAMENTOS */}
      <section style={{ padding: "5rem 0", background: "var(--gray-50)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "4rem", alignItems: "start" }}>
            <div>
              <div className="section-label">Certificações e Normas</div>
              <div className="divider-red" />
              <h2 className="text-headline" style={{ marginBottom: "1.25rem" }}>Equipamentos certificados e aprovados</h2>
              <p style={{ color: "var(--gray-600)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                Todos os equipamentos fornecidos pela CO₂ Contra Incêndio possuem certificação INMETRO e são aprovados pelo Corpo de Bombeiros Militar de Minas Gerais (CBMMG) para uso em edificações no Brasil.
              </p>
              <blockquote style={{
                borderLeft: "3px solid var(--red)", paddingLeft: "1.25rem",
                color: "var(--gray-700)", fontStyle: "italic", lineHeight: 1.75, marginBottom: "2rem",
              }}>
                "Usar equipamentos sem certificação INMETRO pode invalidar o AVCB e comprometer a cobertura do seguro em caso de sinistro."
              </blockquote>
              <Link href="/contato" className="btn-primary">Solicitar especificação técnica <ArrowRight size={14} /></Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {[
                { code: "INMETRO", desc: "Certificação obrigatória para extintores no Brasil" },
                { code: "UL Listed", desc: "Underwriters Laboratories — padrão americano" },
                { code: "FM Approved", desc: "Factory Mutual — seguradoras internacionais" },
                { code: "CE Marking", desc: "Conformidade europeia" },
                { code: "VdS Approved", desc: "Padrão alemão de segurança contra incêndio" },
                { code: "ISO 9001", desc: "Sistema de gestão da qualidade" },
                { code: "ABNT NBR 12693", desc: "Sistemas de extinção por extintores" },
                { code: "ABNT NBR 17240", desc: "Sistemas de detecção e alarme" },
                { code: "ABNT NBR 12615", desc: "Sistemas de extinção por CO₂" },
                { code: "NFPA 10", desc: "Standard for Portable Fire Extinguishers" },
                { code: "NFPA 12", desc: "CO₂ Extinguishing Systems" },
                { code: "CBMMG", desc: "Aprovação Corpo de Bombeiros MG" },
              ].map(n => (
                <div key={n.code} style={{
                  border: "1.5px solid var(--gray-200)", padding: "0.875rem 1rem",
                  background: "#fff", transition: "border-color 0.2s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--red)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--gray-200)"; }}
                >
                  <div style={{ color: "var(--red)", fontWeight: 800, fontSize: "0.875rem", fontFamily: "'Barlow Condensed', sans-serif", marginBottom: "0.2rem" }}>{n.code}</div>
                  <div style={{ color: "var(--gray-600)", fontSize: "0.6875rem", lineHeight: 1.4 }}>{n.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="section-dark" style={{ padding: "5rem 0" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: "0.75rem" }}>
            Equipamentos originais com garantia
          </div>
          <h2 className="text-headline" style={{ color: "#fff", marginBottom: "1.25rem" }}>
            Solicite especificação técnica ou orçamento
          </h2>
          <p style={{ color: "var(--gray-400)", maxWidth: "520px", margin: "0 auto 2.5rem", lineHeight: 1.75 }}>
            Nossa equipe técnica indica o equipamento mais adequado para cada aplicação, com base nas normas vigentes e nas características da sua edificação.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contato" className="btn-primary">Solicitar Orçamento <ArrowRight size={14} /></Link>
            <a href="https://wa.me/5531973581278?text=Olá! Gostaria de informações sobre equipamentos de incêndio." target="_blank" rel="noopener noreferrer" className="btn-outline-white">
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
