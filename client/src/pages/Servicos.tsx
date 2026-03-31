import { Link } from "wouter";
import Layout from "../components/Layout";
import { ArrowRight, Flame, Droplets, Shield, Bell, Wind, FileCheck, Wrench, AlertTriangle, RefreshCw } from "lucide-react";

const services = [
  {
    icon: <Flame size={32} />, title: "Sistema de Supressão por CO₂", href: "/sistema-supressao-co2",
    desc: "Sistemas fixos de extinção por CO₂ para salas técnicas, geradores, painéis elétricos e ambientes de alto risco. Conformidade NBR 12615 e NFPA 12.",
    tags: ["NBR 12615", "NFPA 12", "Alta e Baixa Pressão", "Salas Técnicas"],
  },
  {
    icon: <RefreshCw size={32} />, title: "Recarga de CO₂", href: "/recarga-co2",
    desc: "Recarga técnica de cilindros de CO₂ para sistemas fixos e extintores. Teste hidrostático, certificação e ART incluídos.",
    tags: ["NBR 12615", "Teste Hidrostático", "INMETRO", "Certificação"],
  },
  {
    icon: <Droplets size={32} />, title: "Sistema Saponificante", href: "/sistema-saponificante",
    desc: "Proteção especializada para coifas, dutos e equipamentos de cocção em cozinhas industriais e restaurantes. NBR 14095.",
    tags: ["NBR 14095", "NFPA 17A", "Cozinhas Industriais", "Classe K"],
  },
  {
    icon: <Shield size={32} />, title: "Hidrantes e Mangotinhos", href: "/hidrantes",
    desc: "Projeto, instalação e manutenção de sistemas de hidrantes e mangotinhos para edificações comerciais e industriais. NBR 13714.",
    tags: ["NBR 13714", "AVCB", "Bomba Incêndio", "Reservatório"],
  },
  {
    icon: <Bell size={32} />, title: "Alarme de Incêndio", href: "/alarme-incendio",
    desc: "SDAI convencional e endereçável com detectores de fumaça, acionadores manuais, sirenes e centrais. NBR 17240.",
    tags: ["NBR 17240", "NFPA 72", "Endereçável", "Convencional"],
  },
  {
    icon: <AlertTriangle size={32} />, title: "Detector de Gás GLP/GN", href: "/detector-gas",
    desc: "Instalação de detectores de gás combustível com solenóide de corte automático para cozinhas industriais e centrais de gás.",
    tags: ["GLP", "GN", "Solenóide", "Cozinhas Industriais"],
  },
  {
    icon: <FileCheck size={32} />, title: "Vistoria e Laudo com ART", href: "/vistoria-laudo-art",
    desc: "Laudos técnicos com ART para obtenção e renovação do AVCB. Engenheiros habilitados no CREA/MG.",
    tags: ["AVCB", "ART", "CREA/MG", "CBMMG"],
  },
  {
    icon: <Wrench size={32} />, title: "Manutenção Preventiva", href: "/manutencao-preventiva",
    desc: "Contratos de manutenção preventiva e corretiva para todos os sistemas de incêndio com relatórios técnicos e ARTs.",
    tags: ["Contrato", "Preventiva", "Corretiva", "Relatório Técnico"],
  },
  {
    icon: <Wind size={32} />, title: "Projeto de Exaustão", href: "/projeto-exaustao",
    desc: "Projetos de exaustão mecânica para cozinhas industriais com dampers corta-fogo e integração ao sistema de incêndio.",
    tags: ["Damper", "Exaustão", "Make-up Air", "Cozinhas Industriais"],
  },
];

const sectors = [
  { name: "Indústrias", desc: "Sistemas de CO₂, hidrantes e alarmes para proteção de processos industriais e equipamentos." },
  { name: "Hospitais", desc: "Soluções de detecção precoce e supressão para ambientes hospitalares com alta sensibilidade." },
  { name: "Restaurantes", desc: "Sistemas saponificantes, detectores de gás e exaustão para cozinhas industriais." },
  { name: "Shoppings", desc: "Sistemas integrados de alarme, hidrantes e supressão para grandes áreas comerciais." },
  { name: "Data Centers", desc: "Sistemas de CO₂ e detecção para proteção de equipamentos eletrônicos de alto valor." },
  { name: "Edificações Comerciais", desc: "Soluções completas de segurança contra incêndio para escritórios e comércio." },
];

export default function Servicos() {
  return (
    <Layout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Serviços de Combate a Incêndio — CO₂ Contra Incêndio",
        "description": "Soluções completas em prevenção e combate a incêndios para indústrias, hospitais, restaurantes e edificações em todo o Brasil.",
        "url": "https://www.co2contraincendio.com/servicos",
        "itemListElement": services.map((s, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "name": s.title,
          "url": `https://www.co2contraincendio.com${s.href}`,
        }))
      })}} />

      {/* HERO */}
      <section style={{ position: "relative", height: "clamp(300px,42vh,420px)", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url(https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1600&q=80)", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="hero-overlay" style={{ position: "absolute", inset: 0 }} />
        <div className="container" style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ maxWidth: "580px" }}>
            <div style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", marginBottom: "0.75rem" }}>
              <Link href="/" style={{ color: "rgba(255,255,255,0.55)" }}>Home</Link>
              <span style={{ margin: "0 0.5rem", color: "rgba(255,255,255,0.35)" }}>›</span>
              <span>Serviços</span>
            </div>
            <h1 className="text-display" style={{ color: "#fff", marginBottom: "1rem" }}>Soluções Completas em Combate a Incêndio</h1>
            <p style={{ color: "rgba(255,255,255,0.82)", lineHeight: 1.75 }}>Do projeto à manutenção, oferecemos todas as soluções em prevenção e combate a incêndios com conformidade ABNT, NFPA e Corpo de Bombeiros.</p>
          </div>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section style={{ padding: "5rem 0", background: "#fff" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div className="section-label">Portfólio completo</div>
            <div className="divider-red" style={{ margin: "0 auto 1.25rem" }} />
            <h2 className="text-headline">Todos os Nossos Serviços</h2>
            <p className="text-subhead" style={{ maxWidth: "560px", margin: "1rem auto 0" }}>Atendemos indústrias, hospitais, restaurantes, shoppings e edificações em Belo Horizonte, Minas Gerais e todo o Brasil.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: "1.5rem" }}>
            {services.map(s => (
              <Link key={s.href} href={s.href} style={{ textDecoration: "none" }}>
                <div className="ul-card" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <div style={{ color: "var(--red)", marginBottom: "1.25rem" }}>{s.icon}</div>
                  <h3 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "1.25rem", color: "var(--gray-900)", marginBottom: "0.75rem" }}>{s.title}</h3>
                  <p style={{ color: "var(--gray-600)", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: "1.25rem", flex: 1 }}>{s.desc}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1.25rem" }}>
                    {s.tags.map(t => (
                      <span key={t} style={{ background: "var(--gray-100)", color: "var(--gray-600)", fontSize: "0.6875rem", fontWeight: 600, padding: "0.2rem 0.6rem", letterSpacing: "0.04em" }}>{t}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--red)", fontSize: "0.8125rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Saiba mais <ArrowRight size={13} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTORS */}
      <section className="section-light" style={{ padding: "5rem 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div className="section-label">Setores atendidos</div>
            <div className="divider-red" style={{ margin: "0 auto 1.25rem" }} />
            <h2 className="text-headline">Soluções para cada setor</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "1rem" }}>
            {sectors.map(s => (
              <div key={s.name} style={{ background: "#fff", padding: "1.5rem", borderTop: "3px solid var(--red)" }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "1.125rem", color: "var(--gray-900)", marginBottom: "0.5rem" }}>{s.name}</div>
                <p style={{ color: "var(--gray-600)", fontSize: "0.875rem", lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--red)", padding: "5rem 0" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 className="text-headline" style={{ color: "#fff", marginBottom: "1rem" }}>Não encontrou o que precisa?</h2>
          <p style={{ color: "rgba(255,255,255,0.82)", maxWidth: "520px", margin: "0 auto 2rem", lineHeight: 1.75 }}>Entre em contato com nossa equipe técnica. Analisamos seu caso e apresentamos a solução mais adequada para sua necessidade.</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contato" className="btn-outline-white">Solicitar Orçamento <ArrowRight size={14} /></Link>
            <a href="https://wa.me/5531973581278" target="_blank" rel="noopener noreferrer" className="btn-outline-white">WhatsApp</a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
