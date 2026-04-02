import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import Layout from "../components/Layout";
import SEOHead from "../components/SEOHead";
import OperisHeroBanner from "../components/OperisHeroBanner";
import {
  ArrowRight, Play, Shield, Wrench, FileCheck, Flame,
  Droplets, Bell, Wind, ChevronLeft, ChevronRight, CheckCircle
} from "lucide-react";

const slides = [
  {
    id: 1, label: "Sistema Fixo de Supressão por CO₂",
    title: "Sistemas Inteligentes de\nPrevenção e Combate\na Incêndios",
    sub: "Projetos personalizados com sistemas de supressão por CO₂, saponificantes, hidrantes e alarmes. Conformidade ABNT, NFPA e Corpo de Bombeiros. Atendemos BH e todo o Brasil.",
    cta1: { label: "Solicitar Orçamento", href: "/contato" },
    cta2: { label: "Ver Sistema CO₂", href: "/sistema-supressao-co2" },
    bg: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029941110/TyJduRRrx582jr9b7ycCdJ/slide-co2-system_be6134a2.jpg",
    badge: "NBR 12615 · NFPA 12 · UL Listed",
  },
  {
    id: 2, label: "Sistema Saponificante para Coifas",
    title: "Proteção Especializada\npara Cozinhas\nIndustriais e Restaurantes",
    sub: "Sistemas fixos com agente saponificante Amerex KP, Defender e Rotarex TRIPLESTAR para coifas, dutos e equipamentos de cocção. Certificação UL 300 e NBR 14095.",
    cta1: { label: "Ver Sistema Saponificante", href: "/sistema-saponificante" },
    cta2: { label: "Agendar Vistoria", href: "/contato" },
    bg: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029941110/TyJduRRrx582jr9b7ycCdJ/slide-kitchen-suppression_dcfa9e35.jpg",
    badge: "UL 300 · EN 17446 · NFPA 17A",
  },
  {
    id: 3, label: "Alarme de Incêndio e Detecção de Gás",
    title: "SDAI Endereçável\ne Detectores de\nFumaça e Gás",
    sub: "Sistemas de detecção e alarme de incêndio convencionais e endereçáveis. Detectores ópticos, iônicos e lineares para indústrias, hospitais, shoppings e restaurantes.",
    cta1: { label: "Ver Alarmes", href: "/alarme-incendio" },
    cta2: { label: "Detector de Gás", href: "/detector-gas" },
    bg: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029941110/TyJduRRrx582jr9b7ycCdJ/slide-fire-alarm_7f1dbdfa.jpg",
    badge: "NBR 17240 · IT CBMMG",
  },
  {
    id: 4, label: "Instalação e Manutenção Profissional",
    title: "Instalação Técnica\nde Sistemas Fixos\nde Supressão",
    sub: "Equipe especializada em instalação, comissionamento e manutenção preventiva de sistemas de supressão por CO₂ e saponificante. Engenheiro responsável com ART.",
    cta1: { label: "Agendar Vistoria", href: "/contato" },
    cta2: { label: "Manutenção Preventiva", href: "/manutencao-preventiva" },
    bg: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029941110/TyJduRRrx582jr9b7ycCdJ/slide-kitchen-install_2169cc97.jpg",
    badge: "CREA/MG 142203671-5 · ART",
  },
];

const services = [
  { icon: <Flame size={28} />, title: "Sistema de Supressão por CO₂", desc: "Sistemas fixos de extinção por CO₂ para salas técnicas, geradores, painéis elétricos e ambientes de alto risco. Conformidade NBR 12615.", href: "/sistema-supressao-co2" },
  { icon: <Droplets size={28} />, title: "Sistema Saponificante", desc: "Proteção especializada para coifas, dutos e equipamentos de cocção em cozinhas industriais e restaurantes. Norma NBR 14095.", href: "/sistema-saponificante" },
  { icon: <Shield size={28} />, title: "Hidrantes e Mangotinhos", desc: "Projeto, instalação e manutenção de sistemas de hidrantes e mangotinhos conforme NBR 13714.", href: "/hidrantes" },
  { icon: <Bell size={28} />, title: "Alarme de Incêndio", desc: "SDAI convencional e endereçável com detectores de fumaça, acionadores manuais, sirenes e centrais. NBR 17240.", href: "/alarme-incendio" },
  { icon: <Shield size={28} />, title: "Detector de Gás GLP/GN", desc: "Instalação de detectores de gás combustível com solenóide de corte automático para cozinhas industriais.", href: "/detector-gas" },
  { icon: <FileCheck size={28} />, title: "Vistoria e Laudo com ART", desc: "Laudos técnicos com ART para AVCB, renovações e adequações. Engenheiros habilitados no CREA/MG.", href: "/vistoria-laudo-art" },
  { icon: <Wrench size={28} />, title: "Manutenção Preventiva", desc: "Contratos de manutenção preventiva e corretiva para todos os sistemas de incêndio com relatórios técnicos.", href: "/manutencao-preventiva" },
  { icon: <Wind size={28} />, title: "Projeto de Exaustão", desc: "Projetos de exaustão mecânica para cozinhas industriais com integração ao sistema de incêndio e gás.", href: "/projeto-exaustao" },
];

const norms = [
  { code: "NBR 12615", desc: "Sistema de extinção por CO₂" },
  { code: "NBR 14095", desc: "Sistema saponificante" },
  { code: "NBR 13714", desc: "Hidrantes e mangotinhos" },
  { code: "NBR 17240", desc: "Detecção e alarme de incêndio" },
  { code: "NFPA 12", desc: "CO₂ Extinguishing Systems" },
  { code: "NFPA 17A", desc: "Wet Chemical Systems" },
  { code: "IT CBMMG", desc: "Instruções Técnicas CBMMG" },
  { code: "CREA/MG", desc: "Responsabilidade Técnica — ART" },
];

const partners = [
  { name: "Amerex", desc: "Sistemas CO₂ e saponificante" },
  { name: "Rotarex FireDETEC", desc: "Detecção linear de incêndio" },
  { name: "Skyfire", desc: "Detectores ópticos de fumaça" },
  { name: "Segurimax", desc: "Centrais de alarme endereçável" },
  { name: "Intelbras", desc: "Sistemas de segurança eletrônica" },
  { name: "ValeAr", desc: "Exaustão e ventilação industrial" },
];

const videos = [
  { id: "xfZcwePg6SE", title: "Teste de Descarga — Sistema CO₂ Kidde", label: "Sistema CO₂" },
  { id: "5J0vIP-oec4", title: "Sistema Saponificante em Coifa — NBR", label: "Saponificante" },
  { id: "RBRzDIe9LBM", title: "Alarme de Incêndio Endereçável Segurimax", label: "Alarme" },
];

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5500);
  };

  useEffect(() => {
    if (!paused) startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused]);

  const go = (n: number) => { setCurrent((c) => (c + n + slides.length) % slides.length); startTimer(); };
  const slide = slides[current];

  const homeSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://co2contra.com/#business",
    "name": "CO\u2082 Contra Inc\u00eandio",
    "description": "Especialistas em sistemas fixos de combate a inc\u00eandio: supress\u00e3o por CO\u2082, saponificante para coifas, hidrantes, alarmes e detectores em Belo Horizonte e todo o Brasil.",
    "url": "https://co2contra.com",
    "telephone": "+55-31-9 9738-3115",
    "email": "co2contraincendio@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Belo Horizonte",
      "addressRegion": "MG",
      "addressCountry": "BR"
    },
    "geo": { "@type": "GeoCoordinates", "latitude": -19.9167, "longitude": -43.9345 },
    "openingHours": "Mo-Fr 08:00-18:00",
    "priceRange": "$$",
    "image": "https://co2contra.com/favicon.svg",
    "sameAs": ["https://co2contra.com"]
  };

  return (
    <Layout>
      <SEOHead
        title="Sistemas Fixos de Combate a Inc\u00eandio — BH"
        description="Especialistas em sistemas fixos de combate a inc\u00eandio: supress\u00e3o por CO\u2082, saponificante para coifas, hidrantes, alarmes e detectores. Projetos ABNT \u00b7 NFPA \u00b7 Corpo de Bombeiros. Atendemos BH e todo o Brasil."
        keywords="sistema CO2 incendio, supressao CO2 BH, saponificante coifa, hidrante incendio, alarme incendio Belo Horizonte, detector fumaca, NFPA 12, NBR 12615"
        canonical="/"
        schema={homeSchema}
      />
      {/* HERO CAROUSEL */}
      <section style={{ position: "relative", height: "clamp(520px,80vh,760px)", overflow: "hidden" }}
        onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        {slides.map((s, i) => (
          <div key={s.id} style={{ position: "absolute", inset: 0, backgroundImage: `url(${s.bg})`, backgroundSize: "cover", backgroundPosition: "center", opacity: i === current ? 1 : 0, transition: "opacity 0.8s ease-in-out", zIndex: i === current ? 1 : 0 }} />
        ))}
        <div className="hero-overlay" style={{ position: "absolute", inset: 0, zIndex: 2 }} />
        <div className="container" style={{ position: "relative", zIndex: 3, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ maxWidth: "660px" }}>
            {slide.badge && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "var(--red)", color: "#fff", fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "0.3rem 0.75rem", marginBottom: "1rem" }}>
                <Shield size={10} />{slide.badge}
              </div>
            )}
            <div style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", marginBottom: "0.75rem", display: "block" }}>{slide.label}</div>
            <h1 className="text-display" style={{ color: "#fff", marginBottom: "1.25rem", whiteSpace: "pre-line" }}>{slide.title}</h1>
            <p style={{ color: "rgba(255,255,255,0.82)", fontSize: "1rem", lineHeight: 1.75, marginBottom: "2rem", maxWidth: "520px" }}>{slide.sub}</p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href={slide.cta1.href} className="btn-primary">{slide.cta1.label} <ArrowRight size={14} /></Link>
              <Link href={slide.cta2.href} className="btn-outline-white">{slide.cta2.label}</Link>
            </div>
          </div>
        </div>
        <button onClick={() => go(-1)} aria-label="Anterior" style={{ position: "absolute", left: "1.5rem", top: "50%", transform: "translateY(-50%)", zIndex: 4, background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><ChevronLeft size={20} /></button>
        <button onClick={() => go(1)} aria-label="Próximo" style={{ position: "absolute", right: "1.5rem", top: "50%", transform: "translateY(-50%)", zIndex: 4, background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><ChevronRight size={20} /></button>
        <div style={{ position: "absolute", bottom: "1.75rem", left: "50%", transform: "translateX(-50%)", zIndex: 4, display: "flex", gap: "0.5rem" }}>
          {slides.map((_, i) => <button key={i} className={`carousel-dot${i === current ? " active" : ""}`} onClick={() => { setCurrent(i); startTimer(); }} aria-label={`Slide ${i+1}`} />)}
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", background: "rgba(255,255,255,0.15)", zIndex: 4 }}>
          <div key={current} style={{ height: "100%", background: "var(--red)", animation: paused ? "none" : "progress 5.5s linear forwards" }} />
        </div>
        <style>{`@keyframes progress{from{width:0%}to{width:100%}}`}</style>
      </section>

      {/* STATS */}
      <section style={{ background: "var(--gray-900)", padding: "2.5rem 0" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "2rem" }}>
          {[{n:"15+",l:"Anos de experiência"},{n:"500+",l:"Projetos executados"},{n:"100%",l:"Conformidade normativa"},{n:"BH + Brasil",l:"Área de atendimento"}].map(s=>(
            <div key={s.n} className="stat-block">
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:"2.25rem", fontWeight:800, color:"#fff", lineHeight:1 }}>{s.n}</div>
              <div style={{ color:"var(--gray-400)", fontSize:"0.875rem", marginTop:"0.35rem" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section style={{ padding: "5rem 0", background: "#fff" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "4rem", alignItems: "center" }}>
            <div>
              <div className="section-label">Quem Somos</div>
              <div className="divider-red" />
              <h2 className="text-headline" style={{ marginBottom: "1.25rem" }}>CO₂ Contra Incêndio — Engenharia e Automação Contra Incêndio</h2>
              <p className="text-subhead" style={{ marginBottom: "1rem" }}>A CO₂ Contra Incêndio se dedica a garantir a segurança de indústrias, hospitais e restaurantes. Oferecemos soluções personalizadas que atendem às necessidades de cada setor, focando na proteção de ambientes e na segurança do seu maior patrimônio: vidas.</p>
              <p style={{ color:"var(--gray-600)", fontSize:"0.9375rem", lineHeight:1.75, marginBottom:"2rem" }}>Nossa especialidade principal são os sistemas fixos de incêndio por CO₂, voltados à proteção de ambientes de alto risco. Atuamos com sistemas fixos com agente saponificante, extinção por CO₂, instalação de alarmes, hidrantes e elaboração de projetos conforme normas NFPA e NBR.</p>
              <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap" }}>
                <Link href="/quem-somos" className="btn-primary">Conheça a empresa <ArrowRight size={14} /></Link>
                <Link href="/contato" className="btn-outline-red">Falar com especialista</Link>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
              {[
                {icon:<Shield size={22}/>,title:"Missão",text:"Assegurar a proteção de vidas e bens com soluções inovadoras e confiáveis em prevenção e combate a incêndios."},
                {icon:<CheckCircle size={22}/>,title:"Visão",text:"Ser a principal referência nacional em soluções de segurança contra incêndios."},
                {icon:<Flame size={22}/>,title:"Especialidade",text:"Sistemas fixos de incêndio CO₂ para proteção de ambientes de alto risco."},
                {icon:<FileCheck size={22}/>,title:"Conformidade",text:"Projetos com engenheiros especialistas conforme normas NFPA, ABNT e Corpo de Bombeiros."},
              ].map(c=>(
                <div key={c.title} style={{ padding:"1.5rem", background:"var(--gray-50)", borderTop:"3px solid var(--red)" }}>
                  <div style={{ color:"var(--red)", marginBottom:"0.75rem" }}>{c.icon}</div>
                  <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:"1.0625rem", color:"var(--gray-900)", marginBottom:"0.4rem" }}>{c.title}</div>
                  <p style={{ color:"var(--gray-600)", fontSize:"0.8125rem", lineHeight:1.65 }}>{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="section-light" style={{ padding: "5rem 0" }}>
        <div className="container">
          <div style={{ textAlign:"center", marginBottom:"3.5rem" }}>
            <div className="section-label">O que fazemos</div>
            <div className="divider-red" style={{ margin:"0 auto 1.25rem" }} />
            <h2 className="text-headline">Soluções Completas em Combate a Incêndio</h2>
            <p className="text-subhead" style={{ maxWidth:"580px", margin:"1rem auto 0" }}>Atendemos indústrias, hospitais, restaurantes, shoppings e edificações em Belo Horizonte, Minas Gerais e todo o Brasil.</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"1.5rem" }}>
            {services.map(s=>(
              <Link key={s.href} href={s.href} style={{ textDecoration:"none" }}>
                <div className="ul-card" style={{ height:"100%" }}>
                  <div style={{ color:"var(--red)", marginBottom:"1rem" }}>{s.icon}</div>
                  <h3 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:"1.25rem", color:"var(--gray-900)", marginBottom:"0.625rem" }}>{s.title}</h3>
                  <p style={{ color:"var(--gray-600)", fontSize:"0.875rem", lineHeight:1.7, marginBottom:"1.25rem" }}>{s.desc}</p>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.4rem", color:"var(--red)", fontSize:"0.8125rem", fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase" }}>Saiba mais <ArrowRight size={13} /></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section style={{ padding:"5rem 0", background:"#fff" }}>
        <div className="container">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:"4rem", alignItems:"start" }}>
            <div>
              <div className="section-label">Como trabalhamos</div>
              <div className="divider-red" />
              <h2 className="text-headline" style={{ marginBottom:"1.5rem" }}>Processo Integrado de Execução Técnica</h2>
              <p style={{ color:"var(--gray-600)", lineHeight:1.75, marginBottom:"2rem" }}>Solução integrada para sistemas de coifas, dutos, gás e incêndio, com 6 fases para garantir conformidade e segurança em estabelecimentos comerciais e industriais.</p>
              <Link href="/projetos" className="btn-outline-red">Ver processo completo <ArrowRight size={14} /></Link>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
              {[
                {n:"01",title:"Levantamento Técnico",desc:"Avaliação presencial com engenheiros de gás, incêndio e exaustão. Mapeamento das rotas técnicas e pontos críticos."},
                {n:"02",title:"Aprovação Técnica",desc:"Elaboração e protocolo de todos os projetos executivos com ARTs e memoriais técnicos."},
                {n:"03",title:"Execução e Instalação",desc:"Montagem certificada conforme projeto aprovado, integrando sensores, dampers e rotas de combate."},
                {n:"04",title:"Testes e Liberação",desc:"Testes funcionais, treinamento da brigada e entrega da documentação completa com ARTs e relatórios."},
              ].map(p=>(
                <div key={p.n} style={{ display:"flex", gap:"1.25rem", alignItems:"flex-start" }}>
                  <div style={{ width:"40px", height:"40px", background:"var(--red)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:"1rem", flexShrink:0 }}>{p.n}</div>
                  <div>
                    <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:"1.0625rem", color:"var(--gray-900)", marginBottom:"0.25rem" }}>{p.title}</div>
                    <p style={{ color:"var(--gray-600)", fontSize:"0.875rem", lineHeight:1.65 }}>{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* VIDEOS */}
      <section className="section-dark" style={{ padding:"5rem 0" }}>
        <div className="container">
          <div style={{ textAlign:"center", marginBottom:"3.5rem" }}>
            <div className="section-label" style={{ color:"rgba(255,255,255,0.6)" }}>Veja na prática</div>
            <div className="divider-red" style={{ margin:"0 auto 1.25rem" }} />
            <h2 className="text-headline" style={{ color:"#fff" }}>Sistemas em Operação</h2>
            <p style={{ color:"var(--gray-400)", maxWidth:"520px", margin:"1rem auto 0", lineHeight:1.75 }}>Demonstrações reais de sistemas de supressão por CO₂, saponificante e alarmes de incêndio.</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:"1.5rem" }}>
            {videos.map(v=>(
              <div key={v.id}>
                <div style={{ background:"var(--gray-800)", padding:"0.5rem 1rem", display:"flex", alignItems:"center", gap:"0.5rem" }}>
                  <Play size={12} style={{ color:"var(--red)" }} />
                  <span style={{ color:"var(--gray-400)", fontSize:"0.6875rem", fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase" }}>{v.label}</span>
                </div>
                <div className="video-wrapper">
                  <iframe src={`https://www.youtube.com/embed/${v.id}?rel=0&modestbranding=1`} title={v.title} allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowFullScreen loading="lazy" />
                </div>
                <div style={{ background:"var(--gray-800)", padding:"0.875rem 1rem" }}>
                  <p style={{ color:"#fff", fontSize:"0.875rem", fontWeight:500 }}>{v.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NORMS */}
      <section style={{ padding:"5rem 0", background:"#fff" }}>
        <div className="container">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:"4rem", alignItems:"center" }}>
            <div>
              <div className="section-label">Conformidade Técnica</div>
              <div className="divider-red" />
              <h2 className="text-headline" style={{ marginBottom:"1.25rem" }}>Projetos conforme ABNT, NFPA e Corpo de Bombeiros</h2>
              <p style={{ color:"var(--gray-600)", lineHeight:1.75, marginBottom:"1.5rem" }}>Todos os nossos projetos são elaborados por engenheiros habilitados no CREA/MG, com rigorosa conformidade às normas técnicas brasileiras e internacionais. Atendemos as Instruções Técnicas do Corpo de Bombeiros Militar de Minas Gerais (CBMMG).</p>
              <blockquote style={{ borderLeft:"3px solid var(--red)", paddingLeft:"1.25rem", color:"var(--gray-700)", fontStyle:"italic", lineHeight:1.75, marginBottom:"2rem" }}>
                "A conformidade normativa não é um diferencial — é o mínimo que cada vida protegida exige."
              </blockquote>
              <Link href="/contato" className="btn-primary">Solicitar Orçamento <ArrowRight size={14} /></Link>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem" }}>
              {norms.map(n=>(
                <div key={n.code} style={{ border:"1.5px solid var(--gray-200)", padding:"1rem 1.25rem", background:"#fff", transition:"border-color 0.2s" }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor="var(--red)"}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="var(--gray-200)"}}>
                  <div style={{ color:"var(--red)", fontWeight:800, fontSize:"0.9375rem", fontFamily:"'Barlow Condensed',sans-serif", marginBottom:"0.25rem" }}>{n.code}</div>
                  <div style={{ color:"var(--gray-600)", fontSize:"0.75rem", lineHeight:1.5 }}>{n.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <section className="section-light" style={{ padding:"4rem 0" }}>
        <div className="container">
          <div style={{ textAlign:"center", marginBottom:"2.5rem" }}>
            <div className="section-label">Parceiros Técnicos</div>
            <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:"1.5rem", fontWeight:700, color:"var(--gray-900)" }}>Trabalhamos com os principais fabricantes do setor</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:"1rem" }}>
            {partners.map(p=>(
              <div key={p.name} style={{ background:"#fff", border:"1px solid var(--gray-200)", padding:"1.5rem 1rem", textAlign:"center", transition:"border-color 0.2s,box-shadow 0.2s" }}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor="var(--red)";(e.currentTarget as HTMLElement).style.boxShadow="0 4px 16px rgba(0,0,0,0.08)"}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="var(--gray-200)";(e.currentTarget as HTMLElement).style.boxShadow="none"}}>
                <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:"1.125rem", color:"var(--gray-900)", marginBottom:"0.35rem" }}>{p.name}</div>
                <div style={{ color:"var(--gray-500)", fontSize:"0.75rem" }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OPERIS IA Banner */}
      <OperisHeroBanner />

      {/* CTA */}
      <section style={{ background:"var(--red)", padding:"5rem 0" }}>
        <div className="container" style={{ textAlign:"center" }}>
          <div style={{ fontSize:"0.6875rem", fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(255,255,255,0.7)", marginBottom:"0.75rem" }}>Pronto para começar?</div>
          <h2 className="text-headline" style={{ color:"#fff", marginBottom:"1.25rem" }}>Protegendo seu maior patrimônio: vidas.</h2>
          <p style={{ color:"rgba(255,255,255,0.82)", maxWidth:"560px", margin:"0 auto 2.5rem", lineHeight:1.75 }}>Entre em contato com nossa equipe técnica. Atendemos Belo Horizonte, Minas Gerais e todo o Brasil com rigor técnico, rapidez e conformidade normativa.</p>
          <div style={{ display:"flex", gap:"1rem", justifyContent:"center", flexWrap:"wrap" }}>
            <Link href="/contato" className="btn-outline-white">Solicitar Orçamento <ArrowRight size={14} /></Link>
            <a href="https://wa.me/5531997383115" target="_blank" rel="noopener noreferrer" className="btn-outline-white">WhatsApp</a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
