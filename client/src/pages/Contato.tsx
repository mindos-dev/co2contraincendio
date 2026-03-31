import { useState } from "react";
import { Link } from "wouter";
import Layout from "../components/Layout";
import SEOHead from "../components/SEOHead";
import { Phone, Mail, MapPin, Clock, ArrowRight, CheckCircle } from "lucide-react";

export default function Contato() {
  const [form, setForm] = useState({ nome: "", empresa: "", telefone: "", email: "", servico: "", mensagem: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1200);
  };

  const services = [
    "Sistema de Supressão por CO₂",
    "Recarga de CO₂",
    "Sistema Saponificante",
    "Hidrantes e Mangotinhos",
    "Alarme de Incêndio",
    "Detector de Gás GLP/GN",
    "Vistoria e Laudo com ART",
    "Manutenção Preventiva",
    "Projeto de Exaustão",
    "Outro",
  ];

  return (
    <Layout>
      <SEOHead
        title="Contato — Solicite seu Or\u00e7amento"
        description="Entre em contato com a CO\u2082 Contra Inc\u00eandio para or\u00e7amentos de sistemas de preven\u00e7\u00e3o e combate a inc\u00eandios em Belo Horizonte e Minas Gerais. Resposta em at\u00e9 24h."
        keywords="contato sistemas incendio BH, orcamento sistema CO2, orcamento saponificante coifa, engenheiro incendio Belo Horizonte"
        canonical="/contato"
        breadcrumbs={[{ name: "Contato", url: "/contato" }]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "name": "Contato — CO₂ Contra Incêndio",
        "description": "Entre em contato com a CO₂ Contra Incêndio para orçamentos de sistemas de prevenção e combate a incêndios em Belo Horizonte e Minas Gerais.",
        "url": "https://www.co2contraincendio.com/contato",
        "mainEntity": {
          "@type": "LocalBusiness",
          "name": "CO₂ Contra Incêndio",
          "telephone": "+55-31-97358-1278",
          "email": "contato@co2contraincendio.com",
          "address": { "@type": "PostalAddress", "addressLocality": "Belo Horizonte", "addressRegion": "MG", "addressCountry": "BR" }
        }
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
              <span>Contato</span>
            </div>
            <h1 className="text-display" style={{ color: "#fff", marginBottom: "1rem" }}>Entre em Contato</h1>
            <p style={{ color: "rgba(255,255,255,0.82)", lineHeight: 1.75 }}>Solicite um orçamento, agende uma vistoria ou tire suas dúvidas. Nossa equipe técnica responde em até 24 horas.</p>
          </div>
        </div>
      </section>

      {/* CONTACT GRID */}
      <section style={{ padding: "5rem 0", background: "#fff" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "4rem" }}>

            {/* FORM */}
            <div>
              <div className="section-label">Solicitar Orçamento</div>
              <div className="divider-red" />
              <h2 className="text-headline" style={{ marginBottom: "1.5rem" }}>Fale com nossa equipe técnica</h2>

              {sent ? (
                <div style={{ background: "var(--gray-50)", border: "1.5px solid var(--red)", padding: "2.5rem", textAlign: "center" }}>
                  <CheckCircle size={40} style={{ color: "var(--red)", margin: "0 auto 1rem" }} />
                  <h3 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "1.375rem", color: "var(--gray-900)", marginBottom: "0.75rem" }}>Mensagem enviada!</h3>
                  <p style={{ color: "var(--gray-600)", lineHeight: 1.75 }}>Nossa equipe técnica entrará em contato em até 24 horas. Você também pode nos chamar pelo WhatsApp para atendimento imediato.</p>
                  <a href="https://wa.me/5531973581278" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ marginTop: "1.5rem", display: "inline-flex" }}>Chamar no WhatsApp</a>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--gray-700)", marginBottom: "0.35rem" }}>Nome *</label>
                      <input required value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Seu nome" style={{ width: "100%", padding: "0.75rem 1rem", border: "1.5px solid var(--gray-200)", fontSize: "0.9375rem", outline: "none", background: "#fff", boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = "var(--red)"} onBlur={e => e.target.style.borderColor = "var(--gray-200)"} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--gray-700)", marginBottom: "0.35rem" }}>Empresa</label>
                      <input value={form.empresa} onChange={e => setForm({ ...form, empresa: e.target.value })} placeholder="Nome da empresa" style={{ width: "100%", padding: "0.75rem 1rem", border: "1.5px solid var(--gray-200)", fontSize: "0.9375rem", outline: "none", background: "#fff", boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = "var(--red)"} onBlur={e => e.target.style.borderColor = "var(--gray-200)"} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--gray-700)", marginBottom: "0.35rem" }}>Telefone / WhatsApp *</label>
                      <input required value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} placeholder="(31) 97358-1278" style={{ width: "100%", padding: "0.75rem 1rem", border: "1.5px solid var(--gray-200)", fontSize: "0.9375rem", outline: "none", background: "#fff", boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = "var(--red)"} onBlur={e => e.target.style.borderColor = "var(--gray-200)"} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--gray-700)", marginBottom: "0.35rem" }}>E-mail</label>
                      <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="seu@email.com" style={{ width: "100%", padding: "0.75rem 1rem", border: "1.5px solid var(--gray-200)", fontSize: "0.9375rem", outline: "none", background: "#fff", boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = "var(--red)"} onBlur={e => e.target.style.borderColor = "var(--gray-200)"} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--gray-700)", marginBottom: "0.35rem" }}>Serviço de interesse</label>
                    <select value={form.servico} onChange={e => setForm({ ...form, servico: e.target.value })} style={{ width: "100%", padding: "0.75rem 1rem", border: "1.5px solid var(--gray-200)", fontSize: "0.9375rem", outline: "none", background: "#fff", boxSizing: "border-box", appearance: "none" }}>
                      <option value="">Selecione um serviço</option>
                      {services.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--gray-700)", marginBottom: "0.35rem" }}>Mensagem *</label>
                    <textarea required value={form.mensagem} onChange={e => setForm({ ...form, mensagem: e.target.value })} placeholder="Descreva sua necessidade: tipo de estabelecimento, área aproximada, urgência..." rows={5} style={{ width: "100%", padding: "0.75rem 1rem", border: "1.5px solid var(--gray-200)", fontSize: "0.9375rem", outline: "none", background: "#fff", resize: "vertical", boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = "var(--red)"} onBlur={e => e.target.style.borderColor = "var(--gray-200)"} />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary" style={{ justifyContent: "center", opacity: loading ? 0.7 : 1 }}>
                    {loading ? "Enviando..." : <><span>Enviar Mensagem</span> <ArrowRight size={14} /></>}
                  </button>
                  <p style={{ color: "var(--gray-500)", fontSize: "0.75rem", textAlign: "center" }}>Respondemos em até 24 horas. Para urgências, use o WhatsApp.</p>
                </form>
              )}
            </div>

            {/* INFO */}
            <div>
              <div className="section-label">Informações de Contato</div>
              <div className="divider-red" />
              <h2 className="text-headline" style={{ marginBottom: "2rem" }}>Atendimento técnico especializado</h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "2.5rem" }}>
                {[
                  { icon: <Phone size={18} />, title: "Telefone / WhatsApp", lines: ["(31) 97358-1278", "Atendimento imediato via WhatsApp"] },
                  { icon: <Mail size={18} />, title: "E-mail", lines: ["contato@co2contraincendio.com", "Respondemos em até 24 horas"] },
                  { icon: <MapPin size={18} />, title: "Localização", lines: ["Belo Horizonte — MG", "Atendemos todo o Brasil"] },
                  { icon: <Clock size={18} />, title: "Horário de Atendimento", lines: ["Segunda a Sexta: 8h às 18h", "Sábado: 8h às 12h"] },
                ].map(c => (
                  <div key={c.title} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                    <div style={{ width: "40px", height: "40px", background: "var(--red)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{c.icon}</div>
                    <div>
                      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "1rem", color: "var(--gray-900)", marginBottom: "0.2rem" }}>{c.title}</div>
                      {c.lines.map(l => <div key={l} style={{ color: "var(--gray-600)", fontSize: "0.875rem" }}>{l}</div>)}
                    </div>
                  </div>
                ))}
              </div>

              <a href="https://wa.me/5531973581278?text=Olá! Preciso de um orçamento para sistema de incêndio." target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
                Chamar no WhatsApp <ArrowRight size={14} />
              </a>

              <div style={{ background: "var(--gray-50)", padding: "1.5rem", borderLeft: "3px solid var(--red)" }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "1rem", color: "var(--gray-900)", marginBottom: "0.75rem" }}>Área de Atendimento</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {["Belo Horizonte", "Grande BH", "Minas Gerais", "São Paulo", "Rio de Janeiro", "Todo o Brasil"].map(a => (
                    <span key={a} style={{ background: "#fff", border: "1px solid var(--gray-200)", padding: "0.25rem 0.75rem", fontSize: "0.75rem", color: "var(--gray-700)", fontWeight: 500 }}>{a}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
