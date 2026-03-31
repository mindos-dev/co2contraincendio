import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import Layout from "./Layout";
import { ArrowRight, CheckCircle, Phone } from "lucide-react";

const SITE_URL = "https://www.co2contraincendio.com";
const DEFAULT_OG_IMAGE = "https://www.co2contraincendio.com/og-image.jpg";

interface Norm { code: string; title: string; excerpt: string; }
interface FAQ { q: string; a: string; }
interface RelatedService { title: string; href: string; }

interface ServicePageProps {
  meta: { title: string; description: string; keywords: string; };
  hero: { label: string; title: string; sub: string; bg: string; };
  intro: { heading: string; body: string[]; };
  features: { icon: React.ReactNode; title: string; desc: string; }[];
  norms: Norm[];
  process?: { step: string; title: string; desc: string; }[];
  videoId?: string;
  videoTitle?: string;
  faqs: FAQ[];
  related: RelatedService[];
  cta: { heading: string; sub: string; };
}

export default function ServicePageTemplate({
  meta, hero, intro, features, norms, process, videoId, videoTitle, faqs, related, cta
}: ServicePageProps) {
  const pageUrl = typeof window !== "undefined" ? window.location.href : SITE_URL;
  const pageSlug = typeof window !== "undefined" ? window.location.pathname : "/";

  // FAQ Schema
  const faqSchema = faqs && faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a }
    }))
  } : null;

  // BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": `${SITE_URL}/` },
      { "@type": "ListItem", "position": 2, "name": "Serviços", "item": `${SITE_URL}/servicos` },
      { "@type": "ListItem", "position": 3, "name": meta.title, "item": `${SITE_URL}${pageSlug}` }
    ]
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": meta.title,
    "description": meta.description,
    "provider": {
      "@type": "LocalBusiness",
      "name": "CO\u2082 Contra Inc\u00eandio",
      "url": SITE_URL,
      "telephone": "+55-31-97358-1278",
      "address": { "@type": "PostalAddress", "addressLocality": "Belo Horizonte", "addressRegion": "MG", "addressCountry": "BR" }
    },
    "areaServed": [{"@type": "State", "name": "Minas Gerais"}, {"@type": "Country", "name": "Brasil"}]
  };

  return (
    <Layout>
      <Helmet>
        <title>{meta.title} | CO\u2082 Contra Inc\u00eandio — BH</title>
        <meta name="description" content={meta.description} />
        <meta name="keywords" content={meta.keywords} />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={`${meta.title} | CO₂ Contra Incêndio`} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="pt_BR" />
        <meta property="og:site_name" content="CO₂ Contra Incêndio" />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={`${meta.title} — CO₂ Contra Incêndio`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${meta.title} | CO₂ Contra Incêndio`} />
        <meta name="twitter:description" content={meta.description} />
        <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
        <meta name="twitter:image:alt" content={`${meta.title} — CO₂ Contra Incêndio`} />
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        {faqSchema && <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>}
      </Helmet>

      {/* HERO */}
      <section style={{ position: "relative", height: "clamp(380px,55vh,520px)", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${hero.bg})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="hero-overlay" style={{ position: "absolute", inset: 0 }} />
        <div className="container" style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ maxWidth: "620px" }}>
            <div style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", marginBottom: "0.75rem" }}>
              <Link href="/" style={{ color: "rgba(255,255,255,0.55)" }}>Home</Link>
              <span style={{ margin: "0 0.5rem", color: "rgba(255,255,255,0.35)" }}>›</span>
              <Link href="/servicos" style={{ color: "rgba(255,255,255,0.55)" }}>Serviços</Link>
              <span style={{ margin: "0 0.5rem", color: "rgba(255,255,255,0.35)" }}>›</span>
              <span style={{ color: "rgba(255,255,255,0.7)" }}>{hero.label}</span>
            </div>
            <h1 className="text-display" style={{ color: "#fff", marginBottom: "1rem" }}>{hero.title}</h1>
            <p style={{ color: "rgba(255,255,255,0.82)", fontSize: "1rem", lineHeight: 1.75, maxWidth: "520px" }}>{hero.sub}</p>
          </div>
        </div>
      </section>

      {/* QUICK CTA BAR */}
      <div style={{ background: "var(--red)", padding: "1rem 0" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.9375rem" }}>Precisa de um orçamento rápido?</span>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <a href="https://wa.me/5531973581278" target="_blank" rel="noopener noreferrer" className="btn-outline-white" style={{ padding: "0.5rem 1.25rem" }}>WhatsApp</a>
            <Link href="/contato" className="btn-outline-white" style={{ padding: "0.5rem 1.25rem" }}>Solicitar Orçamento</Link>
          </div>
        </div>
      </div>

      {/* INTRO + FEATURES */}
      <section style={{ padding: "5rem 0", background: "#fff" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "4rem", alignItems: "start" }}>
            <div>
              <div className="section-label">Sobre o serviço</div>
              <div className="divider-red" />
              <h2 className="text-headline" style={{ marginBottom: "1.5rem" }}>{intro.heading}</h2>
              {intro.body.map((p, i) => (
                <p key={i} style={{ color: "var(--gray-600)", lineHeight: 1.8, marginBottom: "1.1rem", fontSize: "0.9375rem" }}>{p}</p>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {features.map((f, i) => (
                <div key={i} style={{ display: "flex", gap: "1rem", alignItems: "flex-start", padding: "1.25rem", background: "var(--gray-50)", borderLeft: "3px solid var(--red)" }}>
                  <div style={{ color: "var(--red)", flexShrink: 0, marginTop: "0.1rem" }}>{f.icon}</div>
                  <div>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "1.0625rem", color: "var(--gray-900)", marginBottom: "0.3rem" }}>{f.title}</div>
                    <p style={{ color: "var(--gray-600)", fontSize: "0.875rem", lineHeight: 1.65 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* NORMS */}
      <section className="section-light" style={{ padding: "5rem 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div className="section-label">Base Normativa</div>
            <div className="divider-red" style={{ margin: "0 auto 1.25rem" }} />
            <h2 className="text-headline">Normas Técnicas Aplicáveis</h2>
            <p className="text-subhead" style={{ maxWidth: "560px", margin: "1rem auto 0" }}>
              Todos os projetos são elaborados em conformidade com as normas ABNT, NFPA e Instruções Técnicas do Corpo de Bombeiros.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "1.25rem" }}>
            {norms.map((n) => (
              <div key={n.code} style={{ background: "#fff", borderTop: "3px solid var(--red)", padding: "1.5rem 1.75rem" }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "1.25rem", color: "var(--red)", marginBottom: "0.35rem" }}>{n.code}</div>
                <div style={{ fontWeight: 600, color: "var(--gray-900)", fontSize: "0.9375rem", marginBottom: "0.5rem" }}>{n.title}</div>
                <p style={{ color: "var(--gray-600)", fontSize: "0.8125rem", lineHeight: 1.7, fontStyle: "italic" }}>"{n.excerpt}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      {process && process.length > 0 && (
        <section style={{ padding: "5rem 0", background: "#fff" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <div className="section-label">Como executamos</div>
              <div className="divider-red" style={{ margin: "0 auto 1.25rem" }} />
              <h2 className="text-headline">Etapas da Execução</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "1.5rem" }}>
              {process.map((p) => (
                <div key={p.step} style={{ borderTop: "3px solid var(--red)", paddingTop: "1.25rem" }}>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "2rem", color: "var(--gray-200)", lineHeight: 1, marginBottom: "0.5rem" }}>{p.step}</div>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "1.125rem", color: "var(--gray-900)", marginBottom: "0.5rem" }}>{p.title}</div>
                  <p style={{ color: "var(--gray-600)", fontSize: "0.875rem", lineHeight: 1.7 }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* VIDEO */}
      {videoId && (
        <section className="section-dark" style={{ padding: "4rem 0" }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "3rem", alignItems: "center" }}>
              <div>
                <div className="section-label" style={{ color: "rgba(255,255,255,0.6)" }}>Veja na prática</div>
                <div className="divider-red" />
                <h2 className="text-headline" style={{ color: "#fff", marginBottom: "1rem" }}>Sistema em Operação</h2>
                <p style={{ color: "var(--gray-400)", lineHeight: 1.75 }}>{videoTitle}</p>
              </div>
              <div className="video-wrapper" style={{ maxWidth: "560px" }}>
                <iframe src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`} title={videoTitle} allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowFullScreen loading="lazy" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section style={{ padding: "5rem 0", background: "#fff" }}>
        <div className="container" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div className="section-label">Dúvidas Frequentes</div>
            <div className="divider-red" style={{ margin: "0 auto 1.25rem" }} />
            <h2 className="text-headline">Perguntas sobre este serviço</h2>
          </div>
          {faqs.map((f, i) => (
            <details key={i} className="faq-item">
              <summary style={{ padding: "1.25rem 0", fontWeight: 600, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", listStyle: "none", color: "var(--gray-900)", fontSize: "0.9375rem" }}>
                {f.q}
                <span style={{ color: "var(--red)", fontSize: "1.25rem", lineHeight: 1, flexShrink: 0, marginLeft: "1rem" }}>+</span>
              </summary>
              <p style={{ paddingBottom: "1.25rem", color: "var(--gray-600)", lineHeight: 1.75, fontSize: "0.9375rem" }}>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* RELATED */}
      <section className="section-light" style={{ padding: "4rem 0" }}>
        <div className="container">
          <div style={{ marginBottom: "2rem" }}>
            <div className="section-label">Veja também</div>
            <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "1.5rem", color: "var(--gray-900)" }}>Outros Serviços</h2>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            {related.map((r) => (
              <Link key={r.href} href={r.href} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.25rem", border: "1.5px solid var(--gray-200)", background: "#fff", color: "var(--gray-700)", fontSize: "0.875rem", fontWeight: 500, transition: "border-color 0.2s,color 0.2s" }}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor="var(--red)";(e.currentTarget as HTMLElement).style.color="var(--red)"}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="var(--gray-200)";(e.currentTarget as HTMLElement).style.color="var(--gray-700)"}}>
                {r.title} <ArrowRight size={12} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--red)", padding: "5rem 0" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "3rem", alignItems: "center" }}>
          <div>
            <h2 className="text-headline" style={{ color: "#fff", marginBottom: "1rem" }}>{cta.heading}</h2>
            <p style={{ color: "rgba(255,255,255,0.82)", lineHeight: 1.75 }}>{cta.sub}</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Link href="/contato" className="btn-outline-white" style={{ justifyContent: "center" }}>
              Solicitar Orçamento <ArrowRight size={14} />
            </Link>
            <a href="https://wa.me/5531973581278" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "#fff", fontSize: "0.875rem", fontWeight: 600 }}>
              <Phone size={14} /> (31) 97358-1278
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
