import { Link } from "wouter";
import Layout from "../components/Layout";
import { ArrowRight, Shield, CheckCircle, Target, Eye, Heart } from "lucide-react";

const timeline = [
  { year: "2008", title: "Fundação", desc: "Fundada em Belo Horizonte com foco em sistemas de supressão por CO₂ para indústrias e data centers." },
  { year: "2012", title: "Expansão de Portfólio", desc: "Incorporação dos sistemas saponificantes para cozinhas industriais e expansão para restaurantes e shoppings." },
  { year: "2016", title: "Certificação Técnica", desc: "Credenciamento de engenheiros no CREA/MG e ampliação da equipe técnica especializada." },
  { year: "2019", title: "Cobertura Nacional", desc: "Início do atendimento em todo o território nacional com projetos em São Paulo, Rio de Janeiro e Nordeste." },
  { year: "2023", title: "500+ Projetos", desc: "Marco de 500 projetos executados com 100% de conformidade normativa e zero rejeições no CBMMG." },
];

const team = [
  { name: "Equipe de Engenharia", role: "Engenheiros habilitados CREA/MG", desc: "Especialistas em sistemas de supressão, alarme, hidrantes e exaustão com emissão de ART." },
  { name: "Equipe Técnica", role: "Técnicos certificados", desc: "Instaladores e manutentores certificados pelos principais fabricantes do setor." },
  { name: "Equipe Comercial", role: "Consultores técnicos", desc: "Consultores especializados para orientação técnica e elaboração de propostas personalizadas." },
];

export default function QuemSomos() {
  return (
    <Layout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "CO₂ Contra Incêndio",
        "description": "Empresa especializada em sistemas de prevenção e combate a incêndios em Belo Horizonte e Minas Gerais.",
        "url": "https://www.co2contraincendio.com",
        "telephone": "+55-31-97358-1278",
        "address": { "@type": "PostalAddress", "addressLocality": "Belo Horizonte", "addressRegion": "MG", "addressCountry": "BR" },
        "foundingDate": "2008",
        "areaServed": { "@type": "Country", "name": "Brasil" },
        "hasCredential": [
          { "@type": "EducationalOccupationalCredential", "name": "CREA/MG" },
          { "@type": "EducationalOccupationalCredential", "name": "Corpo de Bombeiros MG" }
        ]
      })}} />

      {/* HERO */}
      <section style={{ position: "relative", height: "clamp(340px,45vh,460px)", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80)", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="hero-overlay" style={{ position: "absolute", inset: 0 }} />
        <div className="container" style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ maxWidth: "560px" }}>
            <div style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", marginBottom: "0.75rem" }}>
              <Link href="/" style={{ color: "rgba(255,255,255,0.55)" }}>Home</Link>
              <span style={{ margin: "0 0.5rem", color: "rgba(255,255,255,0.35)" }}>›</span>
              <span>Quem Somos</span>
            </div>
            <h1 className="text-display" style={{ color: "#fff", marginBottom: "1rem" }}>Quem Somos</h1>
            <p style={{ color: "rgba(255,255,255,0.82)", fontSize: "1rem", lineHeight: 1.75 }}>Engenharia especializada em sistemas de prevenção e combate a incêndios. Mais de 15 anos protegendo vidas em Belo Horizonte, Minas Gerais e todo o Brasil.</p>
          </div>
        </div>
      </section>

      {/* MISSION VISION VALUES */}
      <section style={{ padding: "5rem 0", background: "#fff" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "2rem", marginBottom: "5rem" }}>
            {[
              { icon: <Target size={28} />, title: "Missão", text: "Assegurar a proteção de vidas e bens com soluções inovadoras e confiáveis em prevenção e combate a incêndios, garantindo a conformidade normativa e a excelência técnica em cada projeto." },
              { icon: <Eye size={28} />, title: "Visão", text: "Ser a principal referência nacional em soluções de segurança contra incêndios, reconhecida pela excelência técnica, inovação e compromisso com a proteção de vidas." },
              { icon: <Heart size={28} />, title: "Valores", text: "Segurança em primeiro lugar. Conformidade normativa rigorosa. Responsabilidade técnica com ART. Atendimento personalizado. Transparência e ética em todos os projetos." },
            ].map(v => (
              <div key={v.title} style={{ borderTop: "3px solid var(--red)", paddingTop: "1.5rem" }}>
                <div style={{ color: "var(--red)", marginBottom: "1rem" }}>{v.icon}</div>
                <h3 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "1.375rem", color: "var(--gray-900)", marginBottom: "0.75rem" }}>{v.title}</h3>
                <p style={{ color: "var(--gray-600)", lineHeight: 1.75, fontSize: "0.9375rem" }}>{v.text}</p>
              </div>
            ))}
          </div>

          {/* ABOUT TEXT */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "4rem", alignItems: "start" }}>
            <div>
              <div className="section-label">Nossa História</div>
              <div className="divider-red" />
              <h2 className="text-headline" style={{ marginBottom: "1.5rem" }}>15 anos protegendo o que mais importa: vidas</h2>
              <p style={{ color: "var(--gray-600)", lineHeight: 1.8, marginBottom: "1rem", fontSize: "0.9375rem" }}>
                A CO₂ Contra Incêndio foi fundada em Belo Horizonte com o propósito de oferecer soluções técnicas de excelência em sistemas de prevenção e combate a incêndios. Desde o início, nossa especialidade são os sistemas fixos de extinção por CO₂, voltados à proteção de ambientes de alto risco como salas de servidores, geradores e painéis elétricos.
              </p>
              <p style={{ color: "var(--gray-600)", lineHeight: 1.8, marginBottom: "1rem", fontSize: "0.9375rem" }}>
                Ao longo dos anos, expandimos nosso portfólio para incluir sistemas saponificantes para cozinhas industriais, hidrantes e mangotinhos, alarmes de incêndio, detectores de gás, projetos de exaustão e serviços de vistoria com ART. Hoje, atendemos indústrias, hospitais, restaurantes, shoppings e edificações comerciais em todo o Brasil.
              </p>
              <p style={{ color: "var(--gray-600)", lineHeight: 1.8, marginBottom: "2rem", fontSize: "0.9375rem" }}>
                Nossa equipe é formada por engenheiros habilitados no CREA/MG e técnicos certificados pelos principais fabricantes do setor. Todos os projetos são elaborados com rigorosa conformidade às normas ABNT, NFPA e Instruções Técnicas do Corpo de Bombeiros Militar de Minas Gerais.
              </p>
              <Link href="/contato" className="btn-primary">Falar com nossa equipe <ArrowRight size={14} /></Link>
            </div>
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
                {[
                  { n: "15+", l: "Anos de experiência" },
                  { n: "500+", l: "Projetos executados" },
                  { n: "100%", l: "Conformidade normativa" },
                  { n: "BH + Brasil", l: "Área de atendimento" },
                ].map(s => (
                  <div key={s.n} style={{ background: "var(--gray-50)", padding: "1.5rem", borderTop: "3px solid var(--red)" }}>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "2rem", fontWeight: 800, color: "var(--red)", lineHeight: 1 }}>{s.n}</div>
                    <div style={{ color: "var(--gray-600)", fontSize: "0.8125rem", marginTop: "0.35rem" }}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "var(--gray-900)", padding: "1.75rem", borderLeft: "4px solid var(--red)" }}>
                <blockquote style={{ color: "rgba(255,255,255,0.9)", fontStyle: "italic", lineHeight: 1.75, fontSize: "0.9375rem", margin: 0 }}>
                  "Protegemos seu maior patrimônio: vidas. Cada projeto é uma responsabilidade que levamos a sério, com rigor técnico e conformidade normativa em cada detalhe."
                </blockquote>
                <div style={{ color: "var(--gray-400)", fontSize: "0.8125rem", marginTop: "1rem", fontWeight: 600 }}>— Equipe CO₂ Contra Incêndio</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="section-light" style={{ padding: "5rem 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div className="section-label">Trajetória</div>
            <div className="divider-red" style={{ margin: "0 auto 1.25rem" }} />
            <h2 className="text-headline">Nossa Linha do Tempo</h2>
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: "2px", background: "var(--gray-200)", transform: "translateX(-50%)" }} className="timeline-line" />
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              {timeline.map((t, i) => (
                <div key={t.year} style={{ display: "grid", gridTemplateColumns: "1fr 40px 1fr", gap: "1.5rem", alignItems: "center" }}>
                  <div style={{ textAlign: i % 2 === 0 ? "right" : "left", gridColumn: i % 2 === 0 ? "1" : "3", gridRow: 1 }}>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "var(--red)" }}>{t.year}</div>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "1.125rem", color: "var(--gray-900)", marginBottom: "0.35rem" }}>{t.title}</div>
                    <p style={{ color: "var(--gray-600)", fontSize: "0.875rem", lineHeight: 1.65 }}>{t.desc}</p>
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", gridColumn: 2, gridRow: 1 }}>
                    <div style={{ width: "16px", height: "16px", background: "var(--red)", borderRadius: "50%", border: "3px solid #fff", boxShadow: "0 0 0 2px var(--red)" }} />
                  </div>
                  <div style={{ gridColumn: i % 2 === 0 ? "3" : "1", gridRow: 1 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section style={{ padding: "5rem 0", background: "#fff" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div className="section-label">Equipe</div>
            <div className="divider-red" style={{ margin: "0 auto 1.25rem" }} />
            <h2 className="text-headline">Especialistas em Segurança contra Incêndio</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "1.5rem" }}>
            {team.map(t => (
              <div key={t.name} className="ul-card">
                <div style={{ width: "48px", height: "48px", background: "var(--red)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                  <Shield size={22} color="#fff" />
                </div>
                <h3 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "1.25rem", color: "var(--gray-900)", marginBottom: "0.25rem" }}>{t.name}</h3>
                <div style={{ color: "var(--red)", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.75rem" }}>{t.role}</div>
                <p style={{ color: "var(--gray-600)", fontSize: "0.875rem", lineHeight: 1.7 }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CERTIFICATIONS */}
      <section className="section-dark" style={{ padding: "4rem 0" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "3rem", alignItems: "center" }}>
            <div>
              <div className="section-label" style={{ color: "rgba(255,255,255,0.6)" }}>Credenciais</div>
              <div className="divider-red" />
              <h2 className="text-headline" style={{ color: "#fff", marginBottom: "1rem" }}>Habilitações e Certificações</h2>
              <p style={{ color: "var(--gray-400)", lineHeight: 1.75 }}>Nossa equipe possui todas as habilitações necessárias para elaboração de projetos, execução de instalações e emissão de laudos técnicos com ART.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              {[
                { code: "CREA/MG", desc: "Engenheiros habilitados" },
                { code: "CBMMG", desc: "Projetos aprovados" },
                { code: "ABNT", desc: "Conformidade NBR" },
                { code: "NFPA", desc: "Padrões internacionais" },
                { code: "ART", desc: "Responsabilidade técnica" },
                { code: "INMETRO", desc: "Equipamentos certificados" },
              ].map(c => (
                <div key={c.code} style={{ background: "var(--gray-800)", padding: "1rem", borderLeft: "3px solid var(--red)" }}>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, color: "#fff", fontSize: "1rem" }}>{c.code}</div>
                  <div style={{ color: "var(--gray-400)", fontSize: "0.75rem" }}>{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--red)", padding: "5rem 0" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 className="text-headline" style={{ color: "#fff", marginBottom: "1rem" }}>Pronto para proteger sua empresa?</h2>
          <p style={{ color: "rgba(255,255,255,0.82)", maxWidth: "520px", margin: "0 auto 2rem", lineHeight: 1.75 }}>Entre em contato com nossa equipe técnica para uma avaliação personalizada. Atendemos BH, Minas Gerais e todo o Brasil.</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contato" className="btn-outline-white">Solicitar Orçamento <ArrowRight size={14} /></Link>
            <Link href="/servicos" className="btn-outline-white">Ver Serviços</Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
