import { Link } from "wouter";
import Layout from "../components/Layout";
import { ArrowRight, Clock, Tag } from "lucide-react";

export const blogPosts = [
  {
    slug: "o-que-e-sistema-supressao-co2",
    title: "O que é Sistema de Supressão por CO₂? Guia Completo NBR 12615",
    excerpt: "Entenda como funciona o sistema fixo de extinção por CO₂, onde é indicado, quais são as normas aplicáveis (NBR 12615 e NFPA 12) e como funciona a válvula solenóide.",
    date: "2024-03-15",
    readTime: "8 min",
    category: "Sistemas de Supressão",
    keywords: ["sistema CO2", "NBR 12615", "extinção incêndio", "solenóide CO2"],
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80",
  },
  {
    slug: "sistema-saponificante-cozinha-industrial",
    title: "Sistema Saponificante para Cozinha Industrial: NBR 14095 Explicada",
    excerpt: "Tudo sobre o sistema de supressão por agente saponificante para coifas e equipamentos de cocção. Normas, instalação, manutenção e integração com gás e exaustão.",
    date: "2024-03-08",
    readTime: "10 min",
    category: "Cozinhas Industriais",
    keywords: ["saponificante", "NBR 14095", "cozinha industrial", "coifa incêndio"],
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
  },
  {
    slug: "detector-gas-glp-gn-solenoide",
    title: "Detector de Gás GLP e GN com Solenóide: Como Funciona e Onde Instalar",
    excerpt: "Diferença entre detectores de GLP e GN, posicionamento correto, integração com solenóide de corte e sistema saponificante. Segurança completa para cozinhas.",
    date: "2024-02-28",
    readTime: "7 min",
    category: "Detecção de Gás",
    keywords: ["detector gás GLP", "solenóide gás", "detector GN", "cozinha industrial gás"],
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80",
  },
  {
    slug: "detector-fumaca-alarme-incendio-nbr-17240",
    title: "Detector de Fumaça e Alarme de Incêndio: SDAI conforme NBR 17240",
    excerpt: "Tipos de detectores de fumaça (óptico, iônico, linear), diferença entre sistemas convencionais e endereçáveis, e como escolher o SDAI correto para sua edificação.",
    date: "2024-02-20",
    readTime: "9 min",
    category: "Alarme de Incêndio",
    keywords: ["detector fumaça", "alarme incêndio", "SDAI", "NBR 17240", "detector óptico"],
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  },
  {
    slug: "projeto-exaustao-damper-corta-fogo",
    title: "Projeto de Exaustão com Damper Corta-Fogo: Integração com Sistema de Incêndio",
    excerpt: "Como funciona o damper corta-fogo, por que é obrigatório em cozinhas industriais, como integrar ao sistema saponificante e quais são as normas aplicáveis.",
    date: "2024-02-12",
    readTime: "8 min",
    category: "Exaustão",
    keywords: ["damper corta-fogo", "projeto exaustão", "exaustão cozinha industrial", "damper incêndio"],
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
  },
  {
    slug: "manutencao-preventiva-sistemas-incendio",
    title: "Manutenção Preventiva de Sistemas de Incêndio: Periodicidades e Normas",
    excerpt: "Quais são as periodicidades de manutenção exigidas pelas normas ABNT para cada sistema de incêndio. Como manter o AVCB válido e evitar autuações do Corpo de Bombeiros.",
    date: "2024-02-05",
    readTime: "7 min",
    category: "Manutenção",
    keywords: ["manutenção preventiva incêndio", "AVCB", "manutenção sistema CO2", "manutenção hidrante"],
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
  },
  {
    slug: "vistoria-laudo-art-avcb",
    title: "Vistoria e Laudo com ART para AVCB: O que é e Como Obter",
    excerpt: "Entenda o que é o AVCB, quem é obrigado a ter, como funciona o processo de obtenção e renovação, e qual o papel do laudo técnico com ART no processo.",
    date: "2024-01-28",
    readTime: "8 min",
    category: "Regularização",
    keywords: ["AVCB", "laudo técnico incêndio", "ART incêndio", "vistoria Corpo de Bombeiros"],
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
  },
  {
    slug: "recarga-co2-cilindro-quando-fazer",
    title: "Recarga de CO₂: Quando é Obrigatória e Como é Feita",
    excerpt: "Saiba quando os cilindros de CO₂ precisam ser recarregados, o que é o teste hidrostático, qual a vida útil dos cilindros e como é feito o processo de recarga.",
    date: "2024-01-20",
    readTime: "6 min",
    category: "Manutenção",
    keywords: ["recarga CO2", "cilindro CO2", "teste hidrostático CO2", "recarga extintor CO2"],
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80",
  },
];

export default function Blog() {
  return (
    <Layout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "Blog Técnico — CO₂ Contra Incêndio",
        "description": "Artigos técnicos sobre sistemas de prevenção e combate a incêndios: CO₂, saponificante, alarmes, detectores, normas ABNT e NFPA.",
        "url": "https://www.co2contraincendio.com/blog",
        "publisher": { "@type": "Organization", "name": "CO₂ Contra Incêndio", "url": "https://www.co2contraincendio.com" }
      })}} />

      {/* HERO */}
      <section style={{ position: "relative", height: "clamp(280px,38vh,380px)", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80)", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="hero-overlay" style={{ position: "absolute", inset: 0 }} />
        <div className="container" style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ maxWidth: "560px" }}>
            <div style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", marginBottom: "0.75rem" }}>
              <Link href="/" style={{ color: "rgba(255,255,255,0.55)" }}>Home</Link>
              <span style={{ margin: "0 0.5rem", color: "rgba(255,255,255,0.35)" }}>›</span>
              <span>Blog</span>
            </div>
            <h1 className="text-display" style={{ color: "#fff", marginBottom: "1rem" }}>Blog Técnico</h1>
            <p style={{ color: "rgba(255,255,255,0.82)", lineHeight: 1.75 }}>Artigos técnicos sobre sistemas de prevenção e combate a incêndios, normas ABNT, NFPA e boas práticas do setor.</p>
          </div>
        </div>
      </section>

      {/* POSTS */}
      <section style={{ padding: "5rem 0", background: "#fff" }}>
        <div className="container">
          {/* FEATURED */}
          <div style={{ marginBottom: "3rem" }}>
            <Link href={`/blog/${blogPosts[0].slug}`} style={{ textDecoration: "none" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "0", overflow: "hidden", border: "1.5px solid var(--gray-200)", transition: "border-color 0.2s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--red)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--gray-200)"}>
                <div style={{ backgroundImage: `url(${blogPosts[0].image})`, backgroundSize: "cover", backgroundPosition: "center", minHeight: "280px" }} />
                <div style={{ padding: "2.5rem" }}>
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1rem" }}>
                    <span style={{ background: "var(--red)", color: "#fff", fontSize: "0.6875rem", fontWeight: 700, padding: "0.2rem 0.75rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>Destaque</span>
                    <span style={{ color: "var(--gray-500)", fontSize: "0.75rem" }}>{blogPosts[0].category}</span>
                  </div>
                  <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "1.625rem", color: "var(--gray-900)", lineHeight: 1.25, marginBottom: "1rem" }}>{blogPosts[0].title}</h2>
                  <p style={{ color: "var(--gray-600)", fontSize: "0.9375rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>{blogPosts[0].excerpt}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "1rem", color: "var(--gray-400)", fontSize: "0.75rem" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}><Clock size={12} /> {blogPosts[0].readTime}</span>
                      <span>{blogPosts[0].date}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--red)", fontSize: "0.8125rem", fontWeight: 700 }}>Ler artigo <ArrowRight size={13} /></div>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* GRID */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1.5rem" }}>
            {blogPosts.slice(1).map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
                <div style={{ border: "1.5px solid var(--gray-200)", overflow: "hidden", height: "100%", display: "flex", flexDirection: "column", transition: "border-color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--red)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--gray-200)"}>
                  <div style={{ backgroundImage: `url(${post.image})`, backgroundSize: "cover", backgroundPosition: "center", height: "180px" }} />
                  <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.75rem" }}>
                      <Tag size={11} style={{ color: "var(--red)" }} />
                      <span style={{ color: "var(--gray-500)", fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{post.category}</span>
                    </div>
                    <h3 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "1.1875rem", color: "var(--gray-900)", lineHeight: 1.3, marginBottom: "0.75rem", flex: 1 }}>{post.title}</h3>
                    <p style={{ color: "var(--gray-600)", fontSize: "0.8125rem", lineHeight: 1.65, marginBottom: "1.25rem" }}>{post.excerpt}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--gray-100)", paddingTop: "1rem" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--gray-400)", fontSize: "0.75rem" }}><Clock size={11} /> {post.readTime}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--red)", fontSize: "0.75rem", fontWeight: 700 }}>Ler <ArrowRight size={11} /></div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
