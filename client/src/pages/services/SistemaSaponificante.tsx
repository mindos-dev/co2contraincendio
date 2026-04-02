import { useState } from "react";
import { Droplets, Flame, Shield, Settings, CheckCircle, AlertTriangle, ArrowRight, Phone, ExternalLink, Send, Loader2, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import Layout from "../../components/Layout";
import SEOHead from "../../components/SEOHead";
import { trpc } from "@/lib/trpc";

const suppliers = [
  {
    name: "Amerex Fire Systems",
    country: "EUA",
    flag: "🇺🇸",
    product: "Sistema KP — Kitchen Protection",
    cert: "UL 300 · NFPA 17A",
    description:
      "Líder mundial em sistemas de supressão para cozinhas comerciais. O sistema Amerex KP oferece proteção por Zona Defense, permitindo reconfiguração dos equipamentos sem necessidade de reprojeto do sistema. Tecnologia STRIKE com detecção eletrônica elimina cabos e fusíveis mecânicos sujeitos a acúmulo de gordura.",
    highlights: ["Cobertura Zone Defense", "Sistema STRIKE eletrônico", "Detecção linear por tubo pneumático", "Log de eventos para auditoria"],
    url: "https://www.amerex-fire.com/kp",
    color: "#C8102E",
  },
  {
    name: "Defender",
    country: "Turquia / Europa",
    flag: "🇪🇺",
    product: "Séries DC, DM, DP",
    cert: "EN 17446:2021 · UL 300",
    description:
      "Primeiro sistema de supressão para cozinhas aprovado pela norma europeia EN 17446:2021. As séries DC (mecânico) e DP (pneumático) cobrem desde pequenas cozinhas até grandes instalações industriais. Referência em hotéis, restaurantes e cozinhas hospitalares na Europa e Oriente Médio.",
    highlights: ["Primeiro aprovado EN 17446:2021", "Séries mecânica e pneumática", "Catálogo corporativo completo", "Referências em 40+ países"],
    url: "https://www.defender.com.tr/",
    color: "#1A3A6B",
  },
  {
    name: "Rotarex FireDETEC",
    country: "Luxemburgo",
    flag: "🇱🇺",
    product: "TRIPLESTAR — Sistema Pré-Engenheirado",
    cert: "UL 300 · EN 17446 · NFPA 17A",
    description:
      "O sistema TRIPLESTAR da Rotarex é um sistema pré-engenheirado completo em uma única caixa, sem necessidade de cálculo preliminar. A tecnologia FireDETEC utiliza tubo de detecção pneumático pressurizado a nitrogênio seco (16 bar), com detecção direta acima dos equipamentos e acionamento instantâneo sem energia elétrica.",
    highlights: ["Sistema completo em uma caixa", "Tubo pneumático FireDETEC", "Sem energia elétrica para acionamento", "Proteção 24/7 para 3 a 9 zonas"],
    url: "https://rotarexfiretec.com/category/commercial-kitchen-fire-protection",
    color: "#2D6A4F",
  },
];

const features = [
  { icon: <Droplets size={20} />, title: "Agente Saponificante (Wet Chemical)", desc: "Reage quimicamente com a gordura aquecida formando uma camada de sabão que sela a superfície e previne a re-ignição. Única solução aprovada para incêndios Classe K." },
  { icon: <Flame size={20} />, title: "Proteção de Coifas e Dutos", desc: "Bicos difusores posicionados estrategicamente na coifa, nos dutos de exaustão e diretamente sobre cada equipamento de cocção conforme projeto." },
  { icon: <Settings size={20} />, title: "Intertravamento com Gás e Exaustão", desc: "Integração obrigatória com solenóide de corte de gás e dampers de exaustão para desligamento automático no momento do acionamento." },
  { icon: <Shield size={20} />, title: "Detecção Térmica Fusível", desc: "Detectores térmicos posicionados sobre os equipamentos para acionamento automático mecânico, sem dependência de energia elétrica." },
  { icon: <AlertTriangle size={20} />, title: "Acionamento Manual (Pull Station)", desc: "Estação de acionamento manual acessível ao operador para ativação imediata em situação de emergência, conforme NFPA 17A." },
  { icon: <CheckCircle size={20} />, title: "Manutenção Semestral Obrigatória", desc: "Inspeção e manutenção semestral conforme ABNT NBR 14095, incluindo recarga do agente, verificação de pressão e teste de todos os intertravamentos." },
];

const norms = [
  { code: "ABNT NBR 14095", title: "Sistema de supressão por agente saponificante", excerpt: "Estabelece os requisitos mínimos para projeto, instalação, inspeção e manutenção de sistemas fixos de extinção por agente saponificante em equipamentos de cocção." },
  { code: "NFPA 17A", title: "Standard for Wet Chemical Extinguishing Systems", excerpt: "Covers the design, installation, maintenance, and use of wet chemical extinguishing systems for the protection of cooking equipment and associated exhaust systems." },
  { code: "UL 300", title: "Fire Testing of Fire Extinguishing Systems — Cooking Equipment", excerpt: "Standard for fire extinguishing systems for protection of commercial cooking equipment. Required by NFPA guidelines for all certified systems." },
  { code: "IT-21 CBMMG", title: "Instrução Técnica — Sistemas de Supressão", excerpt: "Estabelece os requisitos para aprovação de sistemas fixos de extinção junto ao Corpo de Bombeiros Militar de Minas Gerais." },
];

const process = [
  { step: "01", title: "Levantamento dos Equipamentos", desc: "Mapeamento de todos os equipamentos de cocção, dimensões da coifa e dutos, tipo de combustível e volume de óleo utilizado." },
  { step: "02", title: "Projeto Técnico + ART", desc: "Cálculo do agente saponificante, posicionamento de bicos, tubulação, cilindros e integração com sistemas de gás e exaustão." },
  { step: "03", title: "Aprovação CBMMG", desc: "Protocolo e acompanhamento da aprovação do projeto junto ao Corpo de Bombeiros Militar de Minas Gerais." },
  { step: "04", title: "Instalação Integrada", desc: "Montagem do sistema com bicos difusores, tubulação, cilindros de agente, detectores térmicos, painel e todos os intertravamentos." },
  { step: "05", title: "Testes Operacionais", desc: "Simulação de acionamento, verificação dos intertravamentos de gás e exaustão, e teste funcional de todos os componentes." },
  { step: "06", title: "Treinamento e Documentação", desc: "Treinamento da equipe da cozinha, entrega de manual técnico, certificados de instalação e documentação para o Corpo de Bombeiros." },
];

const faqs = [
  { q: "O sistema saponificante é obrigatório para restaurantes?", a: "Sim. O Corpo de Bombeiros exige sistema fixo de supressão para cozinhas industriais com equipamentos de cocção a óleo (fritadeiras, chapas, grelhadores) acima de determinadas dimensões. A obrigatoriedade varia conforme a Instrução Técnica do CBMMG do estado e a área do estabelecimento." },
  { q: "Qual a diferença entre saponificante e CO₂ para cozinhas?", a: "O agente saponificante é o único aprovado para proteção de equipamentos de cocção a óleo (incêndios Classe K) porque reage quimicamente com a gordura, formando uma camada protetora que previne a re-ignição. O CO₂ extingue o fogo, mas não previne a re-ignição em superfícies com óleo quente." },
  { q: "O sistema precisa ser integrado ao gás e à exaustão?", a: "Sim. As normas exigem o intertravamento do sistema saponificante com a solenóide de corte de gás e com os dampers de exaustão. Quando o sistema é acionado, o gás é cortado automaticamente e os dampers fecham para conter o incêndio no duto." },
  { q: "Com que frequência o sistema precisa de manutenção?", a: "A ABNT NBR 14095 exige inspeção semestral do sistema, incluindo verificação do agente saponificante, pressão dos cilindros, bicos difusores, detectores térmicos e intertravamentos. A recarga é necessária após cada acionamento ou quando a pressão estiver abaixo do especificado." },
  { q: "O sistema funciona sem energia elétrica?", a: "Sim. Os detectores térmicos fusíveis acionam o sistema mecanicamente, sem necessidade de energia elétrica. O acionamento elétrico via painel é adicional e complementar ao acionamento mecânico — garantindo operação mesmo em queda de energia." },
  { q: "Quais equipamentos de cozinha precisam de proteção?", a: "Fritadeiras industriais, chapas, grelhadores, woks, fornos a gás e qualquer equipamento de cocção a óleo ou gordura. A coifa e o duto de exaustão também devem ser protegidos, pois acumulam gordura e são pontos críticos de propagação de incêndio." },
];

export default function SistemaSaponificante() {
  const [form, setForm] = useState({ nome: "", telefone: "", email: "", empresa: "", mensagem: "" });
  const [submitted, setSubmitted] = useState(false);
  const submitMutation = trpc.orcamento.submit.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim() || !form.telefone.trim()) return;
    submitMutation.mutate({
      nome: form.nome,
      telefone: form.telefone,
      email: form.email || undefined,
      empresa: form.empresa || undefined,
      servico: "sistema-saponificante",
      mensagem: form.mensagem || undefined,
    });
  };

  return (
    <Layout>
      <SEOHead
        title="Sistema Saponificante para Cozinhas — UL 300 · NBR 14095"
        description="Sistemas fixos de supress\u00e3o com agente saponificante para coifas e cozinhas industriais. Certificados UL 300 e NFPA 17A. Fornecedores: Amerex KP, Defender, Rotarex TRIPLESTAR. Atendemos BH e todo o Brasil."
        keywords="sistema saponificante coifa, UL 300 cozinha industrial, NBR 14095, NFPA 17A, Amerex KP, Defender saponificante, Rotarex TRIPLESTAR, supressao incendio cozinha"
        canonical="/coifas"
        breadcrumbs={[
          { name: "Servi\u00e7os", url: "/servicos" },
          { name: "Sistema Saponificante", url: "/coifas" }
        ]}
      />
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Sistema Saponificante para Cozinhas Industriais — NBR 14095 · UL 300",
        "description": "Sistemas fixos de supressão com agente saponificante para coifas, dutos e equipamentos de cocção. Obrigatório para cozinhas industriais conforme NBR 14095, NFPA 17A e UL 300.",
        "provider": {
          "@type": "LocalBusiness",
          "name": "CO₂ Contra Incêndio",
          "address": { "@type": "PostalAddress", "addressLocality": "Belo Horizonte", "addressRegion": "MG", "addressCountry": "BR" }
        },
        "areaServed": { "@type": "Country", "name": "Brasil" }
      })}} />

      {/* HERO */}
      <section style={{ position: "relative", height: "clamp(380px,55vh,520px)", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=80)`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="hero-overlay" style={{ position: "absolute", inset: 0 }} />
        <div className="container" style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ maxWidth: "640px" }}>
            <div style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", marginBottom: "0.75rem" }}>
              <Link href="/" style={{ color: "rgba(255,255,255,0.55)" }}>Home</Link>
              <span style={{ margin: "0 0.5rem", color: "rgba(255,255,255,0.35)" }}>›</span>
              <Link href="/servicos" style={{ color: "rgba(255,255,255,0.55)" }}>Serviços</Link>
              <span style={{ margin: "0 0.5rem", color: "rgba(255,255,255,0.35)" }}>›</span>
              <span style={{ color: "rgba(255,255,255,0.7)" }}>Sistema Saponificante</span>
            </div>
            <h1 className="text-display" style={{ color: "#fff", marginBottom: "1rem" }}>Proteção Especializada para Cozinhas Industriais</h1>
            <p style={{ color: "rgba(255,255,255,0.82)", fontSize: "1rem", lineHeight: 1.75, maxWidth: "540px" }}>
              Sistemas fixos com agente saponificante (wet chemical) para coifas, dutos e equipamentos de cocção. Solução obrigatória conforme <strong style={{ color: "#fff" }}>NBR 14095 · NFPA 17A · UL 300</strong>. Atendemos BH, MG e todo o Brasil.
            </p>
          </div>
        </div>
      </section>

      {/* QUICK CTA BAR */}
      <div style={{ background: "var(--red)", padding: "1rem 0" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.9375rem" }}>Precisa de um orçamento rápido?</span>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <a href="https://wa.me/5531997383115" target="_blank" rel="noopener noreferrer" className="btn-outline-white" style={{ padding: "0.5rem 1.25rem" }}>WhatsApp</a>
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
              <h2 className="text-headline" style={{ marginBottom: "1.5rem" }}>O que é o Sistema Saponificante?</h2>
              <p style={{ color: "var(--gray-600)", lineHeight: 1.8, marginBottom: "1.1rem", fontSize: "0.9375rem" }}>
                O sistema de supressão por agente saponificante (<em>wet chemical</em>) é a solução específica para proteção de cozinhas industriais, restaurantes e estabelecimentos com equipamentos de cocção a óleo. O agente reage quimicamente com a gordura aquecida, formando uma camada de sabão que sela a superfície e impede a re-ignição — fenômeno que o CO₂ e o pó químico não conseguem evitar.
              </p>
              <p style={{ color: "var(--gray-600)", lineHeight: 1.8, marginBottom: "1.1rem", fontSize: "0.9375rem" }}>
                A CO₂ Contra Incêndio projeta e instala sistemas saponificantes para coifas, dutos de exaustão, fritadeiras industriais, chapas, grelhadores, fornos e woks. O sistema é acionado automaticamente por detectores térmicos fusíveis ou manualmente pelo operador via <em>pull station</em>.
              </p>
              <p style={{ color: "var(--gray-600)", lineHeight: 1.8, marginBottom: "1.1rem", fontSize: "0.9375rem" }}>
                Todos os projetos incluem o intertravamento obrigatório com o sistema de gás (solenóide de corte) e o sistema de exaustão (dampers), garantindo a segurança completa da cozinha conforme exigência do Corpo de Bombeiros e da norma ABNT NBR 14095.
              </p>
              <p style={{ color: "var(--gray-600)", lineHeight: 1.8, fontSize: "0.9375rem" }}>
                Trabalhamos exclusivamente com equipamentos de fornecedores certificados <strong>UL 300</strong>, garantindo que cada instalação atenda aos mais rigorosos padrões internacionais de desempenho e segurança.
              </p>
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

      {/* FORNECEDORES CERTIFICADOS */}
      <section style={{ padding: "5rem 0", background: "var(--gray-900)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div className="section-label" style={{ color: "rgba(255,255,255,0.5)" }}>Parceiros Técnicos</div>
            <div className="divider-red" style={{ margin: "0 auto 1.25rem" }} />
            <h2 className="text-headline" style={{ color: "#fff", marginBottom: "1rem" }}>Fornecedores Certificados UL 300</h2>
            <p style={{ color: "var(--gray-400)", maxWidth: "600px", margin: "0 auto", lineHeight: 1.75, fontSize: "0.9375rem" }}>
              Trabalhamos com os principais fabricantes mundiais de sistemas saponificantes, todos certificados pelas normas internacionais UL 300, NFPA 17A e EN 17446. Isso garante que cada instalação seja rastreável, auditável e aprovada pelo Corpo de Bombeiros.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "1.5rem" }}>
            {suppliers.map((s) => (
              <div key={s.name} style={{ background: "var(--gray-800)", borderTop: "3px solid var(--red)", padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "1.375rem", color: "#fff", lineHeight: 1.1 }}>{s.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--gray-400)", marginTop: "0.25rem" }}>{s.flag} {s.country}</div>
                  </div>
                  <div style={{ background: "var(--red)", color: "#fff", fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.1em", padding: "0.25rem 0.625rem", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                    {s.cert.split(" · ")[0]}
                  </div>
                </div>

                {/* Product */}
                <div style={{ borderLeft: "2px solid var(--red)", paddingLeft: "0.875rem" }}>
                  <div style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gray-400)", marginBottom: "0.2rem" }}>Produto Principal</div>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "1rem", color: "rgba(255,255,255,0.9)" }}>{s.product}</div>
                </div>

                {/* Description */}
                <p style={{ color: "var(--gray-400)", fontSize: "0.875rem", lineHeight: 1.7 }}>{s.description}</p>

                {/* Highlights */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {s.highlights.map((h, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", color: "rgba(255,255,255,0.7)" }}>
                      <CheckCircle size={13} style={{ color: "var(--red)", flexShrink: 0 }} />
                      {h}
                    </div>
                  ))}
                </div>

                {/* Certifications */}
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "auto", paddingTop: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  {s.cert.split(" · ").map((c) => (
                    <span key={c} style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.08em", padding: "0.2rem 0.5rem", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>{c}</span>
                  ))}
                </div>

                {/* Link */}
                <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8125rem", fontWeight: 600, color: "var(--red)", marginTop: "0.25rem" }}>
                  Conhecer o fabricante <ExternalLink size={12} />
                </a>
              </div>
            ))}
          </div>

          {/* Nota de rodapé */}
          <p style={{ textAlign: "center", marginTop: "2.5rem", color: "var(--gray-400)", fontSize: "0.8125rem", lineHeight: 1.7 }}>
            A seleção do fabricante é definida em projeto conforme disponibilidade de peças, especificações técnicas da cozinha e exigências do Corpo de Bombeiros local.
          </p>
        </div>
      </section>

      {/* FABRICANTES EXPANDIDOS */}
      <section style={{ padding: "5rem 0", background: "#f8f8f8" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div className="section-label">Tecnologia dos Fabricantes</div>
            <div className="divider-red" style={{ margin: "0 auto 1.25rem" }} />
            <h2 className="text-headline">Conheça Cada Sistema em Detalhe</h2>
            <p className="text-subhead" style={{ maxWidth: "600px", margin: "1rem auto 0" }}>
              Cada fabricante possui uma abordagem técnica distinta. Entenda as características de cada sistema para a melhor especificação do seu projeto.
            </p>
          </div>

          {/* AMEREX */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center", marginBottom: "5rem", background: "#fff", padding: "3rem", borderTop: "4px solid #C8102E" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <span style={{ fontSize: "2rem" }}>🇺🇸</span>
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "var(--gray-900)", lineHeight: 1 }}>AMEREX FIRE SYSTEMS</div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", color: "#C8102E", textTransform: "uppercase" }}>EUA · UL 300 · NFPA 17A · LPCB</div>
                </div>
              </div>
              <div style={{ borderLeft: "3px solid #C8102E", paddingLeft: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "1.125rem", color: "var(--gray-900)" }}>Sistema KP — Kitchen Protection</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--gray-500)", marginTop: "0.2rem" }}>Líder mundial em proteção de cozinhas comerciais</div>
              </div>
              <p style={{ color: "var(--gray-600)", lineHeight: 1.8, fontSize: "0.9375rem", marginBottom: "1.5rem" }}>
                O sistema Amerex KP é o mais instalado no mundo para proteção de cozinhas comerciais. Sua tecnologia exclusiva <strong>Zone Defense</strong> permite reconfigurar os equipamentos de cocção sem necessidade de reprojeto do sistema — uma vantagem operacional crítica para restaurantes e hotéis que renovam seus equipamentos periodicamente.
              </p>
              <p style={{ color: "var(--gray-600)", lineHeight: 1.8, fontSize: "0.9375rem", marginBottom: "1.75rem" }}>
                O sistema <strong>STRIKE</strong> (Sistema de Detecção Eletrônica) substitui os tradicionais cabos e fusíveis mecânicos sujeitos ao acúmulo de gordura, garantindo detecção confiável mesmo em ambientes de alta carga de vapores de óleo. Cada evento de acionamento é registrado em log para auditoria e relatórios de conformidade.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                {["Cobertura Zone Defense", "Sistema STRIKE eletrônico", "Detecção por tubo pneumático", "Log de eventos para auditoria", "Aprovado UL 300 e NFPA 17A", "Certificação LPCB (Reino Unido)"].map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.8125rem", color: "var(--gray-700)" }}>
                    <CheckCircle size={13} style={{ color: "#C8102E", flexShrink: 0, marginTop: "0.15rem" }} />
                    {item}
                  </div>
                ))}
              </div>
              <a href="https://www.amerex-fire.com/kp" target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginTop: "2rem", background: "#C8102E", color: "#fff", padding: "0.75rem 1.5rem", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.9375rem", letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "none" }}>
                Ver Catálogo Amerex KP <ExternalLink size={14} />
              </a>
            </div>
            <div style={{ background: "var(--gray-100)", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div style={{ background: "#fff", padding: "1.5rem", borderTop: "3px solid #C8102E" }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "1.125rem", color: "var(--gray-900)", marginBottom: "0.75rem" }}>COMO FUNCIONA O ZONE DEFENSE</div>
                <p style={{ fontSize: "0.875rem", color: "var(--gray-600)", lineHeight: 1.7 }}>O sistema divide a coifa em zonas independentes. Cada zona possui seus próprios bicos difusores e detectores, permitindo que o operador reorganize os equipamentos de cocção sem alterar o projeto hidráulico do sistema.</p>
              </div>
              <div style={{ background: "#fff", padding: "1.5rem", borderTop: "3px solid #C8102E" }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "1.125rem", color: "var(--gray-900)", marginBottom: "0.75rem" }}>TOTALMENTE AUTOMÁTICO</div>
                <p style={{ fontSize: "0.875rem", color: "var(--gray-600)", lineHeight: 1.7 }}>Detecta e suprime incêndios automaticamente. Não requer alimentação elétrica para acionamento — o sistema opera por pressão pneumática, garantindo funcionamento mesmo em falta de energia.</p>
              </div>
              <div style={{ background: "#fff", padding: "1.5rem", borderTop: "3px solid #C8102E" }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "1.125rem", color: "var(--gray-900)", marginBottom: "0.75rem" }}>DETECÇÃO RÁPIDA</div>
                <p style={{ fontSize: "0.875rem", color: "var(--gray-600)", lineHeight: 1.7 }}>Protege zonas de cozimento diretamente acima de onde um incêndio pode ocorrer. Resposta rápida — totalmente operacional 24 horas por dia, 7 dias por semana.</p>
              </div>
            </div>
          </div>

          {/* DEFENDER */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center", marginBottom: "5rem", background: "#fff", padding: "3rem", borderTop: "4px solid #1A3A6B" }}>
            <div style={{ background: "var(--gray-100)", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div style={{ background: "#fff", padding: "1.5rem", borderTop: "3px solid #1A3A6B" }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "1.125rem", color: "var(--gray-900)", marginBottom: "0.75rem" }}>SÉRIE DC — SISTEMA MECÂNICO</div>
                <p style={{ fontSize: "0.875rem", color: "var(--gray-600)", lineHeight: 1.7 }}>Ideal para pequenas e médias cozinhas. Acionamento mecânico por fusível térmico, sem necessidade de painel elétrico. Solução robusta e de baixo custo de manutenção para restaurantes, padarias e lanchonetes.</p>
              </div>
              <div style={{ background: "#fff", padding: "1.5rem", borderTop: "3px solid #1A3A6B" }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "1.125rem", color: "var(--gray-900)", marginBottom: "0.75rem" }}>SÉRIE DP — SISTEMA PNEUMÁTICO</div>
                <p style={{ fontSize: "0.875rem", color: "var(--gray-600)", lineHeight: 1.7 }}>Para grandes instalações industriais, hotéis e cozinhas hospitalares. Tubo de detecção pneumático pressurizado percorre toda a coifa, com detecção direta sobre cada equipamento de cocção.</p>
              </div>
              <div style={{ background: "#fff", padding: "1.5rem", borderTop: "3px solid #1A3A6B" }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "1.125rem", color: "var(--gray-900)", marginBottom: "0.75rem" }}>REFERÊNCIA EM 40+ PAÍSES</div>
                <p style={{ fontSize: "0.875rem", color: "var(--gray-600)", lineHeight: 1.7 }}>Instalado em hotéis, restaurantes e hospitais na Europa, Oriente Médio e Ásia. Primeiro sistema aprovado pela norma europeia EN 17446:2021 — o padrão mais rigoroso do mundo para proteção de cozinhas.</p>
              </div>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <span style={{ fontSize: "2rem" }}>🇪🇺</span>
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "var(--gray-900)", lineHeight: 1 }}>DEFENDER</div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", color: "#1A3A6B", textTransform: "uppercase" }}>Turquia / Europa · EN 17446:2021 · UL 300</div>
                </div>
              </div>
              <div style={{ borderLeft: "3px solid #1A3A6B", paddingLeft: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "1.125rem", color: "var(--gray-900)" }}>Séries DC, DM, DP</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--gray-500)", marginTop: "0.2rem" }}>Primeiro aprovado pela norma europeia EN 17446:2021</div>
              </div>
              <p style={{ color: "var(--gray-600)", lineHeight: 1.8, fontSize: "0.9375rem", marginBottom: "1.5rem" }}>
                A Defender é a fabricante turca que conquistou o mercado europeu ao se tornar a <strong>primeira empresa do mundo a obter aprovação conforme a norma EN 17446:2021</strong> — o novo padrão europeu para sistemas de supressão de incêndio em cozinhas comerciais, mais rigoroso que o UL 300 americano em diversos critérios de desempenho.
              </p>
              <p style={{ color: "var(--gray-600)", lineHeight: 1.8, fontSize: "0.9375rem", marginBottom: "1.75rem" }}>
                Suas três séries de produtos cobrem todo o espectro de aplicações: da pequena cozinha de restaurante (Série DC, mecânica) até grandes instalações industriais com múltiplas linhas de cocção (Série DP, pneumática). A Série DM oferece um modelo intermediário com detecção mista.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                {["Primeiro aprovado EN 17446:2021", "Séries mecânica, mista e pneumática", "Catálogo corporativo completo", "Referências em 40+ países", "Aprovado UL 300 (EUA)", "Hotéis, hospitais e indústrias"].map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.8125rem", color: "var(--gray-700)" }}>
                    <CheckCircle size={13} style={{ color: "#1A3A6B", flexShrink: 0, marginTop: "0.15rem" }} />
                    {item}
                  </div>
                ))}
              </div>
              <a href="https://www.defender.com.tr/" target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginTop: "2rem", background: "#1A3A6B", color: "#fff", padding: "0.75rem 1.5rem", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.9375rem", letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "none" }}>
                Ver Site Defender <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* ROTAREX TRIPLESTAR */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center", background: "#fff", padding: "3rem", borderTop: "4px solid #2D6A4F" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <span style={{ fontSize: "2rem" }}>🇱🇺</span>
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "var(--gray-900)", lineHeight: 1 }}>ROTAREX FIREDETEC</div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", color: "#2D6A4F", textTransform: "uppercase" }}>Luxemburgo · UL 300 · EN 17446 · NFPA 17A</div>
                </div>
              </div>
              <div style={{ borderLeft: "3px solid #2D6A4F", paddingLeft: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "1.125rem", color: "var(--gray-900)" }}>TRIPLESTAR — Sistema Pré-Engenheirado</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--gray-500)", marginTop: "0.2rem" }}>Sistema completo em uma única caixa — sem cálculo preliminar</div>
              </div>
              <p style={{ color: "var(--gray-600)", lineHeight: 1.8, fontSize: "0.9375rem", marginBottom: "1.5rem" }}>
                O <strong>TRIPLESTAR</strong> é a solução mais inovadora da Rotarex FireDETEC para proteção de cozinhas comerciais. Trata-se de um sistema <strong>pré-engenheirado completo fornecido em uma única caixa</strong>, que elimina a necessidade de cálculo hidráulico preliminar — o instalador apenas seleciona o modelo correto para o número de zonas da cozinha (3 a 9 zonas) e instala seguindo o manual.
              </p>
              <p style={{ color: "var(--gray-600)", lineHeight: 1.8, fontSize: "0.9375rem", marginBottom: "1.75rem" }}>
                A tecnologia <strong>FireDETEC</strong> utiliza um tubo de detecção pneumático pressurizado a nitrogênio seco (16 bar) que percorre toda a coifa. Ao detectar calor excessivo, o tubo rompe no ponto mais quente, liberando a pressão que aciona o cilindro de agente saponificante — tudo sem energia elétrica, sem eletrônica e sem manutenção complexa.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                {["Sistema completo em uma caixa", "Tubo FireDETEC pressurizado (16 bar)", "Sem energia elétrica para acionamento", "Proteção de 3 a 9 zonas", "Sem cálculo hidráulico preliminar", "Aprovado UL 300, EN 17446, NFPA 17A"].map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.8125rem", color: "var(--gray-700)" }}>
                    <CheckCircle size={13} style={{ color: "#2D6A4F", flexShrink: 0, marginTop: "0.15rem" }} />
                    {item}
                  </div>
                ))}
              </div>
              <a href="https://rotarexfiretec.com/category/commercial-kitchen-fire-protection" target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginTop: "2rem", background: "#2D6A4F", color: "#fff", padding: "0.75rem 1.5rem", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.9375rem", letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "none" }}>
                Ver TRIPLESTAR <ExternalLink size={14} />
              </a>
            </div>
            <div style={{ background: "var(--gray-100)", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div style={{ background: "#fff", padding: "1.5rem", borderTop: "3px solid #2D6A4F" }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "1.125rem", color: "var(--gray-900)", marginBottom: "0.75rem" }}>UM SISTEMA COMPLETO PRÉ-ENGENHADO E PROJETADO</div>
                <p style={{ fontSize: "0.875rem", color: "var(--gray-600)", lineHeight: 1.7 }}>Projetado para proteger cozinhas comerciais. Tudo o que você precisa em uma caixa.</p>
              </div>
              <div style={{ background: "#fff", padding: "1.5rem", borderTop: "3px solid #2D6A4F" }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "1.125rem", color: "var(--gray-900)", marginBottom: "0.75rem" }}>TOTALMENTE AUTOMÁTICO</div>
                <p style={{ fontSize: "0.875rem", color: "var(--gray-600)", lineHeight: 1.7 }}>Detecta e suprime incêndios automaticamente. Não requer alimentação elétrica.</p>
              </div>
              <div style={{ background: "#fff", padding: "1.5rem", borderTop: "3px solid #2D6A4F" }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "1.125rem", color: "var(--gray-900)", marginBottom: "0.75rem" }}>DETECÇÃO RÁPIDA</div>
                <p style={{ fontSize: "0.875rem", color: "var(--gray-600)", lineHeight: 1.7 }}>Protege zonas de cozimento diretamente acima de onde um incêndio pode ocorrer. Resposta rápida — totalmente operacional 24 horas por dia, 7 dias por semana.</p>
              </div>
              <div style={{ background: "#fff", padding: "1.5rem", borderTop: "3px solid #2D6A4F" }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "1.125rem", color: "var(--gray-900)", marginBottom: "0.75rem" }}>TECNOLOGIA COMPROVADA</div>
                <p style={{ fontSize: "0.875rem", color: "var(--gray-600)", lineHeight: 1.7 }}>Já protegendo milhares de instalações em todo o mundo. Instalação rápida e etapas de manutenção simples.</p>
              </div>
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
              Todos os projetos são elaborados em conformidade com as normas ABNT, NFPA, UL e Instruções Técnicas do Corpo de Bombeiros.
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

      {/* VIDEO SECTION — IMPACTANTE */}
      <section style={{ background: "var(--black)", padding: "0" }}>
        {/* Topo: headline + stats */}
        <div style={{ padding: "4rem 0 3rem", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "3rem", alignItems: "center" }}>
              <div>
                <div className="section-label" style={{ color: "rgba(255,255,255,0.45)" }}>Veja na prática</div>
                <div className="divider-red" />
                <h2 className="text-headline" style={{ color: "#fff", marginBottom: "1rem" }}>O Sistema que Salva Cozinhas</h2>
                <p style={{ color: "var(--gray-400)", lineHeight: 1.8, fontSize: "0.9375rem" }}>
                  Em menos de <strong style={{ color: "#fff" }}>30 segundos</strong>, o agente saponificante detecta, suprime e sela a superfície — impedindo a re-ignição que extintores comuns não conseguem evitar. Assista às demonstrações reais abaixo.
                </p>
              </div>
              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                {[
                  { value: "< 30s", label: "Tempo de acionamento automático" },
                  { value: "100%", label: "Sem energia elétrica para operar" },
                  { value: "Classe K", label: "Única solução aprovada para óleos" },
                  { value: "UL 300", label: "Certificação internacional exigida" },
                ].map((s) => (
                  <div key={s.label} style={{ borderLeft: "3px solid var(--red)", paddingLeft: "1rem" }}>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "1.625rem", color: "#fff", lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--gray-400)", marginTop: "0.3rem", lineHeight: 1.4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Vídeo principal — Amerex KP */}
        <div style={{ padding: "3rem 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "3rem", alignItems: "center" }}>
              <div style={{ order: 0 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "var(--red)", color: "#fff", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.3rem 0.75rem", marginBottom: "1rem" }}>
                  ▶ Demonstração Amerex KP
                </div>
                <h3 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "1.5rem", color: "#fff", marginBottom: "0.75rem", lineHeight: 1.2 }}>
                  Sistema Amerex KP — Proteção Certificada UL 300
                </h3>
                <p style={{ color: "var(--gray-400)", fontSize: "0.875rem", lineHeight: 1.75, marginBottom: "1rem" }}>
                  Demonstração oficial do sistema Amerex KP para cozinhas comerciais. Veja o acionamento automático, a supressão do fogo e o intertravamento com o sistema de gás — tudo em conformidade com NFPA 17A e UL 300.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {["Acionamento mecânico sem energia elétrica", "Intertravamento automático com gás e exaustão", "Agente wet chemical Classe K", "Aprovado NFPA 17A · UL 300 · LPCB"].map((item) => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", color: "rgba(255,255,255,0.65)" }}>
                      <CheckCircle size={13} style={{ color: "var(--red)", flexShrink: 0 }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", background: "#111" }}>
                <iframe
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                  src="https://www.youtube.com/embed/MtnGHk6-Nr0?rel=0&modestbranding=1&color=white"
                  title="Amerex Commercial Kitchen Fire Protection System — UL 300"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Vídeo secundário — Combate real em PT-BR */}
        <div style={{ padding: "3rem 0 4rem" }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "3rem", alignItems: "center" }}>
              <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", background: "#111" }}>
                <iframe
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                  src="https://www.youtube.com/embed/5uAeWrKsluw?rel=0&modestbranding=1&color=white"
                  title="Combate a incêndio em cozinha industrial — Sistema Saponificante"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.3rem 0.75rem", marginBottom: "1rem" }}>
                  ▶ Demonstração em Português
                </div>
                <h3 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "1.5rem", color: "#fff", marginBottom: "0.75rem", lineHeight: 1.2 }}>
                  Combate Real em Cozinha Industrial
                </h3>
                <p style={{ color: "var(--gray-400)", fontSize: "0.875rem", lineHeight: 1.75, marginBottom: "1rem" }}>
                  Vídeo em português mostrando o funcionamento real de um sistema fixo de combate a incêndio com agente saponificante em cozinha industrial. Demonstração do acionamento, descarga do agente e supressão completa do fogo.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {["Demonstração em português", "Cozinha industrial real", "Acionamento e descarga do agente", "Supressão completa sem re-ignição"].map((item) => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", color: "rgba(255,255,255,0.65)" }}>
                      <CheckCircle size={13} style={{ color: "var(--red)", flexShrink: 0 }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FORMULARIO DE ORCAMENTO RAPIDO */}
      <section style={{ background: "var(--gray-50)", padding: "5rem 0", borderTop: "4px solid var(--red)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "4rem", alignItems: "start" }}>

            {/* Lado esquerdo: proposta de valor */}
            <div>
              <div className="section-label">Resposta em até 2 horas</div>
              <div className="divider-red" />
              <h2 className="text-headline" style={{ marginBottom: "1rem" }}>Solicite seu Orçamento Agora</h2>
              <p style={{ color: "var(--gray-600)", lineHeight: 1.8, marginBottom: "2rem", fontSize: "0.9375rem" }}>
                Ficou interessado no que viu nos vídeos? Preencha o formulário ao lado e nossa equipe técnica entrará em contato em até <strong>2 horas úteis</strong> com uma proposta personalizada para a sua cozinha.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {[
                  { icon: <CheckCircle size={18} style={{ color: "var(--red)", flexShrink: 0 }} />, title: "Orçamento sem compromisso", desc: "Visita técnica gratuita para levantamento dos equipamentos e dimensionamento do sistema." },
                  { icon: <CheckCircle size={18} style={{ color: "var(--red)", flexShrink: 0 }} />, title: "Projeto + ART incluídos", desc: "Elaboramos o projeto técnico e a ART do engenheiro responsável sem custo adicional." },
                  { icon: <CheckCircle size={18} style={{ color: "var(--red)", flexShrink: 0 }} />, title: "Aprovado no Corpo de Bombeiros", desc: "Acompanhamos todo o processo de aprovação junto ao CBMMG até a emissão do laudo." },
                  { icon: <CheckCircle size={18} style={{ color: "var(--red)", flexShrink: 0 }} />, title: "Equipamentos certificados UL 300", desc: "Trabalhamos apenas com fabricantes certificados: Amerex, Defender e Rotarex." },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.875rem", alignItems: "flex-start" }}>
                    {item.icon}
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--gray-900)", fontSize: "0.9375rem", marginBottom: "0.2rem" }}>{item.title}</div>
                      <p style={{ color: "var(--gray-600)", fontSize: "0.8125rem", lineHeight: 1.6 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "2rem", padding: "1.25rem", background: "#fff", borderLeft: "3px solid var(--red)" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gray-400)", marginBottom: "0.5rem" }}>Preferência por WhatsApp?</div>
                <a href="https://wa.me/5531997383115" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--red)", fontWeight: 700, fontSize: "1rem" }}>
                  <Phone size={16} /> (31) 9 9738-3115
                </a>
              </div>
            </div>

            {/* Lado direito: formulario */}
            <div style={{ background: "#fff", padding: "2.5rem", borderTop: "3px solid var(--red)" }}>
              {submitted ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", minHeight: "340px", textAlign: "center" }}>
                  <CheckCircle2 size={48} style={{ color: "var(--red)" }} />
                  <h3 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "1.5rem", color: "var(--gray-900)" }}>Solicitação Recebida!</h3>
                  <p style={{ color: "var(--gray-600)", lineHeight: 1.7, maxWidth: "320px" }}>
                    Nossa equipe técnica recebeu seu pedido e entrará em contato em até <strong>2 horas úteis</strong>. Verifique também seu WhatsApp.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ nome: "", telefone: "", email: "", empresa: "", mensagem: "" }); }}
                    style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "var(--red)", fontWeight: 600, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                  >
                    Enviar nova solicitação
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "1.375rem", color: "var(--gray-900)", marginBottom: "0.25rem" }}>Orçamento Rápido</div>
                    <p style={{ color: "var(--gray-400)", fontSize: "0.8125rem" }}>Preencha os campos abaixo. Resposta em até 2 horas úteis.</p>
                  </div>

                  {/* Nome + Telefone */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--gray-700)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Nome *</label>
                      <input
                        required
                        type="text"
                        placeholder="Seu nome"
                        value={form.nome}
                        onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                        style={{ padding: "0.625rem 0.875rem", border: "1.5px solid var(--gray-200)", fontSize: "0.9375rem", outline: "none", background: "var(--gray-50)", color: "var(--gray-900)", width: "100%" }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--gray-700)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Telefone / WhatsApp *</label>
                      <input
                        required
                        type="tel"
                        placeholder="(31) 9 0000-0000"
                        value={form.telefone}
                        onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))}
                        style={{ padding: "0.625rem 0.875rem", border: "1.5px solid var(--gray-200)", fontSize: "0.9375rem", outline: "none", background: "var(--gray-50)", color: "var(--gray-900)", width: "100%" }}
                      />
                    </div>
                  </div>

                  {/* Email + Empresa */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--gray-700)", letterSpacing: "0.05em", textTransform: "uppercase" }}>E-mail</label>
                      <input
                        type="email"
                        placeholder="seu@email.com"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        style={{ padding: "0.625rem 0.875rem", border: "1.5px solid var(--gray-200)", fontSize: "0.9375rem", outline: "none", background: "var(--gray-50)", color: "var(--gray-900)", width: "100%" }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--gray-700)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Empresa / Estabelecimento</label>
                      <input
                        type="text"
                        placeholder="Nome do estabelecimento"
                        value={form.empresa}
                        onChange={e => setForm(f => ({ ...f, empresa: e.target.value }))}
                        style={{ padding: "0.625rem 0.875rem", border: "1.5px solid var(--gray-200)", fontSize: "0.9375rem", outline: "none", background: "var(--gray-50)", color: "var(--gray-900)", width: "100%" }}
                      />
                    </div>
                  </div>

                  {/* Mensagem */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                    <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--gray-700)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Mensagem (opcional)</label>
                    <textarea
                      rows={3}
                      placeholder="Descreva brevemente sua cozinha: quantos equipamentos, tipo de estabelecimento, cidade..."
                      value={form.mensagem}
                      onChange={e => setForm(f => ({ ...f, mensagem: e.target.value }))}
                      style={{ padding: "0.625rem 0.875rem", border: "1.5px solid var(--gray-200)", fontSize: "0.9375rem", outline: "none", background: "var(--gray-50)", color: "var(--gray-900)", resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }}
                    />
                  </div>

                  {/* Erro */}
                  {submitMutation.isError && (
                    <div style={{ padding: "0.75rem 1rem", background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontSize: "0.875rem" }}>
                      Ocorreu um erro ao enviar. Tente novamente ou entre em contato pelo WhatsApp.
                    </div>
                  )}

                  {/* Botao */}
                  <button
                    type="submit"
                    disabled={submitMutation.isPending}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", background: submitMutation.isPending ? "var(--gray-400)" : "var(--red)", color: "#fff", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "1rem", letterSpacing: "0.08em", textTransform: "uppercase", padding: "0.875rem 2rem", border: "none", cursor: submitMutation.isPending ? "not-allowed" : "pointer", transition: "background 0.2s", marginTop: "0.25rem" }}
                  >
                    {submitMutation.isPending ? (
                      <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Enviando...</>
                    ) : (
                      <><Send size={15} /> Solicitar Orçamento Gratuito</>
                    )}
                  </button>

                  <p style={{ fontSize: "0.75rem", color: "var(--gray-400)", textAlign: "center", lineHeight: 1.5 }}>
                    Ao enviar, você concorda com nossa política de privacidade. Seus dados não serão compartilhados com terceiros.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

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

      {/* OPERIS INTEGRATION */}
      <section style={{ padding: "4rem 0", background: "var(--gray-900)" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "3rem", alignItems: "center" }}>
          <div>
            <div className="section-label" style={{ color: "var(--red)" }}>OPERIS</div>
            <div className="divider-red" style={{ marginBottom: "1.25rem" }} />
            <h2 className="text-headline" style={{ color: "#fff", marginBottom: "1rem" }}>Gerencie seu Sistema Saponificante com Tecnologia</h2>
            <p style={{ color: "var(--gray-300)", lineHeight: 1.75, marginBottom: "1.5rem" }}>
              O OPERIS é nossa solução digital de gestão de sistemas de incêndio. Cada equipamento do seu sistema saponificante recebe um QR Code único para rastreamento completo do ciclo de vida: instalação, manutenções, recargas, laudos e alertas automáticos de vencimento.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                "QR Code em cada equipamento para histórico completo",
                "Alertas automáticos de manutenção semestral (ABNT NBR 14095)",
                "Documentação digital: laudos, ARTs e certificados",
                "Relatórios de conformidade para o Corpo de Bombeiros",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <span style={{ color: "var(--red)", fontWeight: 700, marginTop: "0.1rem" }}>✓</span>
                  <span style={{ color: "var(--gray-300)", fontSize: "0.875rem", lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Link href="/app/login" className="btn-primary" style={{ justifyContent: "center" }}>
              Acessar OPERIS
            </Link>
            <Link href="/contato" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "var(--gray-300)", fontSize: "0.875rem", fontWeight: 500, padding: "0.75rem", border: "1px solid var(--gray-700)", transition: "border-color 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--red)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--gray-700)"; }}>
              Solicitar Vistoria Gratuita
            </Link>
          </div>
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
            {[
              { title: "Sistema de Supressão por CO₂", href: "/sistema-supressao-co2" },
              { title: "Detector de Gás GLP/GN", href: "/detector-gas" },
              { title: "Projeto de Exaustão", href: "/projeto-exaustao" },
              { title: "Alarme de Incêndio", href: "/alarme-incendio" },
              { title: "Vistoria e Laudo com ART", href: "/vistoria-laudo-art" },
            ].map((r) => (
              <Link key={r.href} href={r.href} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.25rem", border: "1.5px solid var(--gray-200)", background: "#fff", color: "var(--gray-700)", fontSize: "0.875rem", fontWeight: 500, transition: "border-color 0.2s,color 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--red)"; (e.currentTarget as HTMLElement).style.color = "var(--red)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--gray-200)"; (e.currentTarget as HTMLElement).style.color = "var(--gray-700)"; }}>
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
            <h2 className="text-headline" style={{ color: "#fff", marginBottom: "1rem" }}>Precisa de Sistema Saponificante para sua Cozinha?</h2>
            <p style={{ color: "rgba(255,255,255,0.82)", lineHeight: 1.75 }}>
              Projetamos e instalamos sistemas saponificantes com intertravamento de gás e exaustão, utilizando equipamentos certificados UL 300. Aprovação no Corpo de Bombeiros e ART incluídos. Atendemos BH, MG e todo o Brasil.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Link href="/contato" className="btn-outline-white" style={{ justifyContent: "center" }}>
              Solicitar Orçamento <ArrowRight size={14} />
            </Link>
            <a href="https://wa.me/5531997383115" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "#fff", fontSize: "0.875rem", fontWeight: 600 }}>
              <Phone size={14} /> (31) 9 9738-3115
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
