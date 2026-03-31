import { Link } from "wouter";
import { Phone, Mail, MapPin, Instagram, Youtube, Linkedin } from "lucide-react";

const services = [
  { label: "Projetos e Laudos Técnicos", href: "/projetos" },
  { label: "Sistema de Supressão por CO₂", href: "/sistema-supressao-co2" },
  { label: "Recarga de CO₂", href: "/recarga-co2" },
  { label: "Sistema Saponificante", href: "/sistema-saponificante" },
  { label: "Hidrantes", href: "/hidrantes" },
  { label: "Alarme de Incêndio", href: "/alarme-incendio" },
  { label: "Detector de Gás GLP/GN", href: "/detector-gas" },
  { label: "Vistoria e Laudo com ART", href: "/vistoria-laudo-art" },
  { label: "Manutenção Preventiva", href: "/manutencao-preventiva" },
  { label: "Projeto de Exaustão", href: "/projeto-exaustao" },
];

const blog = [
  { label: "Recarga de CO₂: quando é obrigatória?", href: "/blog/recarga-co2-cilindro-quando-fazer" },
  { label: "Sistema saponificante para cozinhas", href: "/blog/sistema-saponificante-cozinha-industrial" },
  { label: "Detector de gás GLP/GN e solenóide", href: "/blog/detector-gas-glp-gn-solenoide" },
  { label: "Vistoria e Laudo com ART para AVCB", href: "/blog/vistoria-laudo-art-avcb" },
  { label: "Manutenção preventiva de incêndio", href: "/blog/manutencao-preventiva-sistemas-incendio" },
];

export default function Footer() {
  return (
    <footer style={{ background: "var(--gray-900)", color: "#fff" }}>
      {/* CTA strip */}
      <div style={{ background: "var(--red)", padding: "2.5rem 0" }}>
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.75rem", fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>
              Proteja seu patrimônio agora.
            </div>
            <div style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.9375rem", marginTop: "0.35rem" }}>
              Atendemos Belo Horizonte, Minas Gerais e todo o Brasil.
            </div>
          </div>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link href="/contato" className="btn-outline-white">Solicitar Orçamento</Link>
            <a href="https://wa.me/5531973581278" target="_blank" rel="noopener noreferrer" className="btn-outline-white">
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container" style={{ padding: "4rem 1.5rem 2.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "3rem" }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "2px solid var(--red)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "var(--red)", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1rem" }}>C2</span>
              </div>
              <div>
                <div style={{ color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1rem", lineHeight: 1.1 }}>CO₂ CONTRA INCÊNDIO</div>
                <div style={{ color: "var(--gray-400)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Engenharia e Automação</div>
              </div>
            </div>
            <p style={{ color: "var(--gray-400)", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>
              Soluções completas em prevenção e combate a incêndios. Projetos conforme ABNT, NFPA e Corpo de Bombeiros.
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              {[
                { icon: <Instagram size={16} />, href: "https://instagram.com/co2contraincendio", label: "Instagram" },
                { icon: <Youtube size={16} />, href: "https://youtube.com/@co2firetech149", label: "YouTube" },
                { icon: <Linkedin size={16} />, href: "#", label: "LinkedIn" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  style={{
                    width: "36px", height: "36px", border: "1px solid var(--gray-700)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--gray-400)", transition: "border-color 0.2s, color 0.2s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--red)"; (e.currentTarget as HTMLElement).style.color = "var(--red)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--gray-700)"; (e.currentTarget as HTMLElement).style.color = "var(--gray-400)"; }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Serviços */}
          <div>
            <div style={{ color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--gray-700)" }}>
              Serviços
            </div>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {services.map((s) => (
                <li key={s.href} style={{ marginBottom: "0.5rem" }}>
                  <Link href={s.href} style={{ color: "var(--gray-400)", fontSize: "0.8125rem", transition: "color 0.18s" }}
                    onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#fff"; }}
                    onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "var(--gray-400)"; }}
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Blog */}
          <div>
            <div style={{ color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--gray-700)" }}>
              Blog Técnico
            </div>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {blog.map((b) => (
                <li key={b.href} style={{ marginBottom: "0.5rem" }}>
                  <Link href={b.href} style={{ color: "var(--gray-400)", fontSize: "0.8125rem", transition: "color 0.18s" }}
                    onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#fff"; }}
                    onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "var(--gray-400)"; }}
                  >
                    {b.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <div style={{ color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--gray-700)" }}>
              Contato
            </div>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <li style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                <MapPin size={15} style={{ color: "var(--red)", marginTop: "0.15rem", flexShrink: 0 }} />
                <span style={{ color: "var(--gray-400)", fontSize: "0.8125rem", lineHeight: 1.6 }}>
                  Belo Horizonte, Minas Gerais<br />Atendemos todo o Brasil
                </span>
              </li>
              <li style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <Phone size={15} style={{ color: "var(--red)", flexShrink: 0 }} />
                <a href="tel:+5531973581278" style={{ color: "var(--gray-400)", fontSize: "0.8125rem", transition: "color 0.18s" }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#fff"; }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "var(--gray-400)"; }}
                >
                  (31) 97358-1278
                </a>
              </li>
              <li style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <Mail size={15} style={{ color: "var(--red)", flexShrink: 0 }} />
                <a href="mailto:contato@co2contra.comm" style={{ color: "var(--gray-400)", fontSize: "0.8125rem", transition: "color 0.18s" }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#fff"; }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "var(--gray-400)"; }}
                >
                  contato@co2contra.comm
                </a>
              </li>
            </ul>

            {/* Normas */}
            <div style={{ marginTop: "1.5rem" }}>
              <div style={{ color: "var(--gray-400)", fontSize: "0.6875rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, marginBottom: "0.75rem" }}>
                Conformidade Técnica
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {["ABNT NBR", "NFPA", "Corpo de Bombeiros", "CREA/MG"].map((n) => (
                  <span key={n} style={{ border: "1px solid var(--gray-700)", padding: "0.25rem 0.625rem", fontSize: "0.6875rem", fontWeight: 600, color: "var(--gray-400)", letterSpacing: "0.04em" }}>
                    {n}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid var(--gray-800)", padding: "1.25rem 0" }}>
        <div className="container flex flex-col md:flex-row justify-between items-center gap-2">
          <span style={{ color: "var(--gray-600)", fontSize: "0.75rem" }}>
            © {new Date().getFullYear()} CO₂ Contra Incêndio — Engenharia e Automação Contra Incêndio. Todos os direitos reservados.
          </span>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            {[
              { label: "Política de Privacidade", href: "#" },
              { label: "Sitemap", href: "/sitemap.xml" },
            ].map((l) => (
              <Link key={l.href} href={l.href} style={{ color: "var(--gray-600)", fontSize: "0.75rem", transition: "color 0.18s" }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#fff"; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "var(--gray-600)"; }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
