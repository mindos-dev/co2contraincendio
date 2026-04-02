import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ChevronDown, Phone } from "lucide-react";

const servicesMain = [
  { label: "Sistema de Supressão por CO₂", href: "/sistema-supressao-co2" },
  { label: "Sistema Saponificante (Wet Chemical)", href: "/sistema-saponificante" },
  { label: "Hidrantes", href: "/hidrantes" },
  { label: "Alarme de Incêndio", href: "/alarme-incendio" },
  { label: "Detector de Gás GLP/GN", href: "/detector-gas" },
  { label: "Vistoria e Laudo com ART", href: "/vistoria-laudo-art" },
  { label: "Projeto de Exaustão", href: "/projeto-exaustao" },
];

const servicesContratos = [
  { label: "Manutenção Preventiva", href: "/manutencao-preventiva" },
  { label: "Recarga de CO₂", href: "/recarga-co2" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); setServicesOpen(false); }, [location]);

  const isActive = (href: string) => location === href;

  return (
    <>
      {/* Top bar */}
      <div style={{ background: "var(--red)" }} className="hidden md:block">
        <div className="container flex justify-between items-center py-1.5">
          <span style={{ color: "#fff", fontSize: "0.75rem", letterSpacing: "0.04em" }}>
            Atendemos Belo Horizonte, Minas Gerais e todo o Brasil
          </span>
          <a
            href="tel:+5531997383115"
            style={{ color: "#fff", fontSize: "0.75rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.35rem" }}
          >
            <Phone size={12} /> (31) 9 9738-3115
          </a>
        </div>
      </div>

      {/* Main nav */}
      <nav
        style={{
          background: "var(--gray-900)",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.35)" : "none",
          transition: "box-shadow 0.25s",
        }}
      >
        <div className="container flex items-center justify-between" style={{ height: "68px" }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "50%",
              border: "2px solid var(--red)",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "transparent",
            }}>
              <span style={{ color: "var(--red)", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.1rem", lineHeight: 1 }}>C2</span>
            </div>
            <div>
              <div style={{ color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.125rem", lineHeight: 1.1, letterSpacing: "0.02em" }}>
                CO₂ CONTRA INCÊNDIO
              </div>
              <div style={{ color: "var(--gray-400)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500 }}>
                Engenharia e Automação
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center" style={{ gap: "0.25rem" }}>
            {[
              { label: "Home", href: "/" },
              { label: "Quem Somos", href: "/quem-somos" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${isActive(item.href) ? "active" : ""}`}
                style={{ padding: "0 1rem", height: "68px", display: "flex", alignItems: "center" }}
              >
                {item.label}
              </Link>
            ))}

            {/* Serviços dropdown */}
            <div
              style={{ position: "relative" }}
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button
                className="nav-link"
                style={{
                  padding: "0 1rem", height: "68px",
                  display: "flex", alignItems: "center", gap: "0.3rem",
                  background: "none", border: "none", cursor: "pointer",
                }}
              >
                Serviços <ChevronDown size={13} style={{ transition: "transform 0.2s", transform: servicesOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
              </button>
              {servicesOpen && (
                <div style={{
                  position: "absolute", top: "100%", left: 0,
                  background: "#fff", minWidth: "290px",
                  boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
                  borderTop: "3px solid var(--red)",
                  zIndex: 200,
                }}>
                  {servicesMain.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      style={{
                        display: "block", padding: "0.75rem 1.25rem",
                        fontSize: "0.8125rem", fontWeight: 500, color: "var(--gray-800)",
                        borderBottom: "1px solid var(--gray-100)",
                        transition: "background 0.15s, color 0.15s",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--gray-50)"; (e.currentTarget as HTMLElement).style.color = "var(--red)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.color = "var(--gray-800)"; }}
                    >
                      {s.label}
                    </Link>
                  ))}
                  <div style={{ padding: "0.4rem 1.25rem", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--red)", background: "var(--gray-50)", borderTop: "2px solid var(--gray-200)", borderBottom: "1px solid var(--gray-100)" }}>
                    Contratos de Manutenção
                  </div>
                  {servicesContratos.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      style={{
                        display: "block", padding: "0.75rem 1.25rem",
                        fontSize: "0.8125rem", fontWeight: 600, color: "var(--red)",
                        borderBottom: "1px solid var(--gray-100)",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--gray-50)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}
                    >
                      ✔ {s.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {[
              { label: "Projetos", href: "/projetos" },
              { label: "Parceiros", href: "/parceiros" },
              { label: "Blog", href: "/blog" },
              { label: "Contato", href: "/contato" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${isActive(item.href) ? "active" : ""}`}
                style={{ padding: "0 1rem", height: "68px", display: "flex", alignItems: "center" }}
              >
                {item.label}
              </Link>
            ))}

            <Link href="/contato" className="btn-primary" style={{ marginLeft: "1rem", height: "40px", padding: "0 1.5rem" }}>
              Solicitar Orçamento
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden"
            onClick={() => setOpen(!open)}
            style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: "0.5rem" }}
            aria-label="Menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div style={{ background: "var(--gray-800)", borderTop: "1px solid var(--gray-700)" }}>
            <div className="container" style={{ paddingTop: "1rem", paddingBottom: "1.5rem" }}>
              {[
                { label: "Home", href: "/" },
                { label: "Quem Somos", href: "/quem-somos" },
                { label: "Projetos", href: "/projetos" },
                { label: "Parceiros", href: "/parceiros" },
                { label: "Blog", href: "/blog" },
                { label: "Contato", href: "/contato" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{ display: "block", padding: "0.75rem 0", color: "#fff", fontSize: "0.9375rem", fontWeight: 600, borderBottom: "1px solid var(--gray-700)" }}
                >
                  {item.label}
                </Link>
              ))}
              <div style={{ paddingTop: "0.5rem" }}>
                <div style={{ color: "var(--gray-400)", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.75rem 0 0.5rem" }}>
                  Serviços
                </div>
                {servicesMain.map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    style={{ display: "block", padding: "0.6rem 0.75rem", color: "var(--gray-200)", fontSize: "0.875rem", borderBottom: "1px solid var(--gray-700)" }}
                  >
                    {s.label}
                  </Link>
                ))}
                <div style={{ padding: "0.5rem 0.75rem", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--red)", borderBottom: "1px solid var(--gray-700)", marginTop: "0.25rem" }}>
                  Contratos de Manutenção
                </div>
                {servicesContratos.map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    style={{ display: "block", padding: "0.6rem 0.75rem", color: "var(--red)", fontSize: "0.875rem", fontWeight: 600, borderBottom: "1px solid var(--gray-700)" }}
                  >
                    ✔ {s.label}
                  </Link>
                ))}
              </div>
              <Link href="/contato" className="btn-primary" style={{ marginTop: "1.25rem", width: "100%", justifyContent: "center" }}>
                Solicitar Orçamento
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
