import { useState } from "react";
import { Link } from "wouter";
import Layout from "../components/Layout";
import SEOHead from "../components/SEOHead";
import {
  ArrowRight, FileCheck, ClipboardList, Search, Flame,
  Shield, CheckCircle, AlertTriangle, Wrench, FileText,
  ChevronDown, ChevronUp, Phone
} from "lucide-react";

const schemaJson = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Projetos de Combate a Incêndio — Laudos, Vistorias e Testes",
  "provider": {
    "@type": "LocalBusiness",
    "name": "CO₂ Contra Incêndio",
    "url": "https://co2contra.com",
    "telephone": "+55-31-9 9738-3115",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Belo Horizonte",
      "addressRegion": "MG",
      "addressCountry": "BR"
    }
  },
  "description": "Elaboração de projetos técnicos de combate a incêndio, laudos com ART, vistorias, testes de aceitação e avaliação de sistemas conforme ABNT, NFPA e Corpo de Bombeiros.",
  "areaServed": ["Belo Horizonte", "Minas Gerais", "Brasil"],
  "serviceType": [
    "Projeto de Combate a Incêndio",
    "Laudo Técnico com ART",
    "Vistoria de Incêndio",
    "Teste de Aceitação de Sistemas",
    "Avaliação de Sistemas de Incêndio"
  ]
};

const categories = [
  {
    id: "projetos",
    icon: <FileText size={32} />,
    label: "Projetos Técnicos",
    title: "Projetos de Combate a Incêndio",
    subtitle: "Elaboração completa de projetos executivos conforme ABNT e NFPA",
    color: "var(--red)",
    items: [
      {
        title: "Projeto de Sistema de Supressão por CO₂",
        norm: "NBR 12615 / NFPA 12",
        desc: "Projeto executivo para sistemas fixos de extinção por CO₂ em salas técnicas, geradores, painéis elétricos, CPDs, câmaras frigoríficas e ambientes de alto risco. Inclui memorial descritivo, dimensionamento de cilindros, cálculo de descarga, planta baixa, cortes e detalhes construtivos.",
        tags: ["Memorial descritivo", "Cálculo hidráulico", "Planta executiva", "ART CREA/MG"],
      },
      {
        title: "Projeto de Sistema Saponificante",
        norm: "NBR 14095 / NFPA 17A",
        desc: "Projeto para sistemas fixos com agente saponificante em coifas, dutos e equipamentos de cocção. Obrigatório para cozinhas industriais, restaurantes, hotéis e hospitais. Inclui dimensionamento do agente, posicionamento de bicos, acionamento automático e manual.",
        tags: ["Cozinhas industriais", "Coifas e dutos", "Acionamento automático", "ART CREA/MG"],
      },
      {
        title: "Projeto de Hidrantes e Mangotinhos",
        norm: "NBR 13714",
        desc: "Projeto de rede de hidrantes e mangotinhos para edificações comerciais, industriais e residenciais. Cálculo de vazão, pressão, reserva técnica de incêndio (RTI), bomba de incêndio e distribuição da rede.",
        tags: ["Cálculo de RTI", "Rede de tubulação", "Bomba de incêndio", "ART CREA/MG"],
      },
      {
        title: "Projeto de Alarme e Detecção (SDAI)",
        norm: "NBR 17240",
        desc: "Projeto de Sistema de Detecção e Alarme de Incêndio (SDAI) convencional ou endereçável. Posicionamento de detectores de fumaça, calor e chama, acionadores manuais, sirenes, strobes e central de alarme.",
        tags: ["Convencional / Endereçável", "Detectores de fumaça", "Central de alarme", "ART CREA/MG"],
      },
      {
        title: "Projeto de Exaustão Mecânica",
        norm: "IT CBMMG / ABNT",
        desc: "Projeto de exaustão mecânica para cozinhas industriais, integrado ao sistema de incêndio e gás. Dimensionamento de dutos, dampers corta-fogo, ventiladores e integração com o sistema de detecção.",
        tags: ["Dampers corta-fogo", "Dutos e ventiladores", "Integração com gás", "ART CREA/MG"],
      },
      {
        title: "Projeto de Detector de Gás GLP/GN",
        norm: "NBR 15526 / ABNT",
        desc: "Projeto de instalação de detectores de gás combustível (GLP e GN) com solenóide de corte automático. Posicionamento estratégico conforme norma, integração com alarme e sistema de ventilação.",
        tags: ["Detector GLP/GN", "Solenóide de corte", "Integração com alarme", "ART CREA/MG"],
      },
    ],
  },
  {
    id: "laudos",
    icon: <FileCheck size={32} />,
    label: "Laudos Técnicos",
    title: "Laudos com ART",
    subtitle: "Documentação técnica com Anotação de Responsabilidade Técnica para AVCB e regularizações",
    color: "#1a5c2a",
    items: [
      {
        title: "Laudo Técnico para Obtenção do AVCB",
        norm: "IT CBMMG",
        desc: "Elaboração de laudo técnico completo para obtenção do Auto de Vistoria do Corpo de Bombeiros (AVCB). Avaliação de todos os sistemas de proteção contra incêndio, adequações necessárias e protocolo junto ao CBMMG.",
        tags: ["AVCB", "CBMMG", "Engenheiro habilitado", "ART CREA/MG"],
      },
      {
        title: "Laudo para Renovação do AVCB",
        norm: "IT CBMMG",
        desc: "Vistoria técnica e laudo para renovação do AVCB vencido. Verificação do estado de conservação e funcionamento de todos os sistemas, identificação de não-conformidades e plano de adequação.",
        tags: ["Renovação AVCB", "Prazo de validade", "Não-conformidades", "Plano de adequação"],
      },
      {
        title: "Laudo de Conformidade Normativa",
        norm: "ABNT / NFPA",
        desc: "Laudo técnico atestando a conformidade dos sistemas de incêndio instalados com as normas ABNT NBR e NFPA aplicáveis. Utilizado para seguradoras, auditorias internas, due diligence e processos de certificação.",
        tags: ["Seguradoras", "Due diligence", "Auditoria", "Certificação"],
      },
      {
        title: "Laudo de Avaliação Pós-Sinistro",
        norm: "ABNT / NFPA",
        desc: "Análise técnica dos sistemas de incêndio após ocorrência de sinistro. Identificação de falhas, causas de não-acionamento ou acionamento indevido, recomendações de reparo e adequação.",
        tags: ["Pós-sinistro", "Análise de falhas", "Recomendações", "Seguradora"],
      },
    ],
  },
  {
    id: "vistorias",
    icon: <Search size={32} />,
    label: "Vistorias",
    title: "Vistorias Técnicas",
    subtitle: "Inspeção presencial completa de todos os sistemas de proteção contra incêndio",
    color: "#1a3a6b",
    items: [
      {
        title: "Vistoria Preventiva Anual",
        norm: "NBR 14276 / IT CBMMG",
        desc: "Inspeção técnica anual de todos os sistemas de incêndio da edificação: extintores, hidrantes, alarmes, detectores, iluminação de emergência, sinalização e saídas de emergência. Relatório detalhado com registro fotográfico.",
        tags: ["Relatório fotográfico", "Todos os sistemas", "Periodicidade anual", "Registro técnico"],
      },
      {
        title: "Vistoria para Seguradora",
        norm: "ABNT / NFPA",
        desc: "Vistoria técnica especializada para atendimento às exigências de seguradoras. Avaliação do risco de incêndio, estado dos sistemas de proteção, recomendações de melhoria e emissão de relatório técnico com ART.",
        tags: ["Relatório para seguradora", "Avaliação de risco", "ART CREA/MG", "Recomendações"],
      },
      {
        title: "Vistoria de Recebimento de Obra",
        norm: "NBR 13714 / NBR 17240",
        desc: "Inspeção técnica dos sistemas de incêndio ao final de obra, verificando a conformidade da instalação com o projeto aprovado. Essencial antes da emissão do habite-se e obtenção do AVCB.",
        tags: ["Recebimento de obra", "Habite-se", "Conformidade com projeto", "AVCB"],
      },
      {
        title: "Vistoria de Due Diligence",
        norm: "ABNT / NFPA / NFPA 101",
        desc: "Avaliação técnica completa dos sistemas de proteção contra incêndio em processos de compra, venda ou locação de imóveis comerciais e industriais. Identificação de passivos e riscos.",
        tags: ["Compra e venda", "Due diligence", "Passivos", "Risco de incêndio"],
      },
    ],
  },
  {
    id: "testes",
    icon: <Flame size={32} />,
    label: "Testes de Sistemas",
    title: "Testes de Aceitação e Comissionamento",
    subtitle: "Testes funcionais completos para validação dos sistemas instalados",
    color: "#7a2000",
    items: [
      {
        title: "Teste de Aceitação — Sistema CO₂",
        norm: "NBR 12615 / NFPA 12",
        desc: "Testes funcionais do sistema de supressão por CO₂: verificação de pressão dos cilindros, teste de estanqueidade, simulação de acionamento (sem descarga), verificação de válvulas solenóides, alarmes de pré-descarga e sinalização.",
        tags: ["Pressão dos cilindros", "Estanqueidade", "Solenóide", "Alarme de pré-descarga"],
      },
      {
        title: "Teste de Aceitação — Sistema Saponificante",
        norm: "NBR 14095 / NFPA 17A",
        desc: "Testes do sistema saponificante: verificação de pressão, simulação de acionamento, teste de bicos, verificação do agente extintor, integração com sistema de gás e alarme.",
        tags: ["Pressão do sistema", "Teste de bicos", "Integração com gás", "Agente extintor"],
      },
      {
        title: "Teste de Aceitação — Hidrantes",
        norm: "NBR 13714",
        desc: "Testes da rede de hidrantes: medição de pressão e vazão em cada ponto, teste da bomba de incêndio (principal e reserva), verificação de registros, mangueiras e esguichos.",
        tags: ["Pressão e vazão", "Bomba de incêndio", "Registros e mangueiras", "Esguichos"],
      },
      {
        title: "Teste de Aceitação — SDAI",
        norm: "NBR 17240",
        desc: "Testes do Sistema de Detecção e Alarme de Incêndio: acionamento de cada detector e acionador manual, verificação de sirenes e strobes, teste de falha de linha, integração com outros sistemas.",
        tags: ["Teste de detectores", "Sirenes e strobes", "Falha de linha", "Integração de sistemas"],
      },
    ],
  },
  {
    id: "avaliacao",
    icon: <ClipboardList size={32} />,
    label: "Avaliação de Sistemas",
    title: "Avaliação e Diagnóstico de Sistemas",
    subtitle: "Análise técnica aprofundada do estado e desempenho dos sistemas existentes",
    color: "#4a2080",
    items: [
      {
        title: "Diagnóstico Técnico Completo",
        norm: "ABNT / NFPA",
        desc: "Avaliação abrangente de todos os sistemas de proteção contra incêndio da edificação. Identificação de não-conformidades, obsolescências, riscos e oportunidades de melhoria. Entrega de relatório técnico com plano de ação priorizado.",
        tags: ["Não-conformidades", "Obsolescências", "Plano de ação", "Relatório técnico"],
      },
      {
        title: "Avaliação de Risco de Incêndio",
        norm: "NFPA 551 / ISO 31000",
        desc: "Análise qualitativa e quantitativa do risco de incêndio da edificação. Identificação de fontes de ignição, cargas de incêndio, rotas de propagação e vulnerabilidades dos sistemas de proteção.",
        tags: ["Análise de risco", "Carga de incêndio", "Fontes de ignição", "Vulnerabilidades"],
      },
      {
        title: "Avaliação de Desempenho de Sistemas",
        norm: "NBR / NFPA",
        desc: "Análise do desempenho real dos sistemas instalados em relação às normas vigentes e às necessidades da edificação. Verificação de adequação, capacidade de resposta e confiabilidade dos sistemas.",
        tags: ["Desempenho", "Confiabilidade", "Adequação normativa", "Capacidade de resposta"],
      },
      {
        title: "Consultoria Técnica Especializada",
        norm: "ABNT / NFPA / IT CBMMG",
        desc: "Suporte técnico especializado para tomada de decisão em projetos, reformas, ampliações e adequações de sistemas de incêndio. Análise de viabilidade, especificação de sistemas e acompanhamento de obras.",
        tags: ["Tomada de decisão", "Especificação", "Viabilidade", "Acompanhamento"],
      },
    ],
  },
];

const processSteps = [
  { n: "01", title: "Contato Inicial", desc: "Recebemos sua demanda por WhatsApp, telefone ou formulário. Agendamos visita técnica sem compromisso." },
  { n: "02", title: "Visita Técnica", desc: "Engenheiro especialista realiza levantamento in loco da edificação e dos sistemas existentes." },
  { n: "03", title: "Proposta Técnica", desc: "Elaboramos proposta detalhada com escopo, prazo, normas aplicáveis e investimento necessário." },
  { n: "04", title: "Execução", desc: "Desenvolvimento do projeto, laudo, vistoria ou teste conforme escopo aprovado, com acompanhamento técnico." },
  { n: "05", title: "Entrega e ART", desc: "Entrega da documentação completa com ART registrada no CREA/MG e suporte pós-entrega." },
];

const faqs = [
  {
    q: "Quais edificações precisam de projeto de combate a incêndio?",
    a: "Todas as edificações com área superior a 750 m², altura acima de 6 metros, ou com ocupações de risco elevado (indústrias, hospitais, shoppings, restaurantes industriais) precisam de projeto aprovado pelo Corpo de Bombeiros conforme as Instruções Técnicas do CBMMG.",
  },
  {
    q: "O que é ART e por que é obrigatória?",
    a: "A Anotação de Responsabilidade Técnica (ART) é o documento que registra a responsabilidade de um engenheiro habilitado pelo projeto, laudo ou serviço técnico executado. É obrigatória pelo CONFEA/CREA e exigida pelo Corpo de Bombeiros para aprovação de projetos e emissão do AVCB.",
  },
  {
    q: "Com que frequência deve ser feita a vistoria dos sistemas de incêndio?",
    a: "A NBR 14276 e as Instruções Técnicas do CBMMG recomendam vistoria anual de todos os sistemas. Extintores devem ser inspecionados mensalmente e recarregados anualmente ou após uso. O AVCB tem validade variável conforme o tipo de edificação (geralmente 1 a 5 anos).",
  },
  {
    q: "Qual a diferença entre vistoria e laudo técnico?",
    a: "A vistoria é a inspeção presencial dos sistemas, enquanto o laudo técnico é o documento formal que registra os resultados da vistoria, as condições encontradas, as não-conformidades identificadas e as recomendações do engenheiro responsável, com ART registrada.",
  },
  {
    q: "Vocês atendem fora de Belo Horizonte?",
    a: "Sim. Atendemos todo o estado de Minas Gerais e, para projetos de maior porte, atendemos todo o Brasil. Entre em contato para verificar disponibilidade e condições para sua região.",
  },
  {
    q: "Quanto tempo leva para elaborar um projeto de incêndio?",
    a: "O prazo varia conforme a complexidade da edificação. Projetos residenciais simples podem ser concluídos em 5 a 10 dias úteis. Projetos industriais ou de grande porte podem levar de 15 a 30 dias úteis. Laudos e vistorias geralmente são entregues em 3 a 7 dias úteis após a visita técnica.",
  },
];

export default function Projetos() {
  const [activeCategory, setActiveCategory] = useState("projetos");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const active = categories.find(c => c.id === activeCategory)!;

  return (
    <Layout>
      <SEOHead
        title="Projetos de Combate a Inc\u00eandio — Laudos e Vistorias"
        description="Portf\u00f3lio de projetos executados: sistemas de CO\u2082, saponificante, hidrantes, alarmes e detectores. Laudos t\u00e9cnicos, vistorias e emiss\u00e3o de ART para o Corpo de Bombeiros MG."
        keywords="projetos sistemas incendio, portfolio CO2, laudo tecnico incendio, vistoria CBMMG, ART engenheiro incendio"
        canonical="/projetos"
        breadcrumbs={[{ name: "Projetos", url: "/projetos" }]}
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
          backgroundImage: "url(https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1600&q=60)",
          backgroundSize: "cover", backgroundPosition: "center",
          opacity: 0.12,
        }} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
            <Link href="/" style={{ color: "var(--gray-400)", fontSize: "0.8125rem" }}>Home</Link>
            <span style={{ color: "var(--gray-600)" }}>/</span>
            <span style={{ color: "#fff", fontSize: "0.8125rem" }}>Projetos</span>
          </div>
          <div className="section-label" style={{ color: "rgba(255,255,255,0.6)" }}>Engenharia Especializada</div>
          <div className="divider-red" />
          <h1 className="text-display" style={{ color: "#fff", marginBottom: "1.25rem", maxWidth: "800px" }}>
            Projetos, Laudos, Vistorias,<br />Testes e Avaliação de Sistemas
          </h1>
          <p style={{ color: "rgba(255,255,255,0.78)", fontSize: "1.0625rem", lineHeight: 1.75, maxWidth: "640px", marginBottom: "2.5rem" }}>
            Soluções completas de engenharia para proteção contra incêndio. Projetos executivos, laudos com ART, vistorias técnicas, testes de aceitação e avaliação de sistemas — tudo conforme ABNT, NFPA e Corpo de Bombeiros.
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link href="/contato" className="btn-primary">Solicitar Orçamento <ArrowRight size={14} /></Link>
            <a href="https://wa.me/5531997383115?text=Olá! Preciso de um projeto/laudo/vistoria de incêndio." target="_blank" rel="noopener noreferrer" className="btn-outline-white">WhatsApp</a>
          </div>
        </div>
      </section>

      {/* QUICK CTA BAR */}
      <div style={{ background: "var(--red)", padding: "1rem 0" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <span style={{ color: "#fff", fontSize: "0.9375rem", fontWeight: 600 }}>
            Engenheiros habilitados no CREA/MG — Atendemos BH e todo o Brasil
          </span>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <a href="tel:+5531997383115" style={{ color: "#fff", fontSize: "0.875rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Phone size={14} /> (31) 9 9738-3115
            </a>
          </div>
        </div>
      </div>

      {/* CATEGORY TABS */}
      <section style={{ background: "#fff", borderBottom: "1px solid var(--gray-200)", position: "sticky", top: "64px", zIndex: 100 }}>
        <div className="container">
          <div style={{ display: "flex", gap: 0, overflowX: "auto", scrollbarWidth: "none" }}>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: "1.125rem 1.5rem",
                  background: "none",
                  border: "none",
                  borderBottom: activeCategory === cat.id ? "3px solid var(--red)" : "3px solid transparent",
                  color: activeCategory === cat.id ? "var(--red)" : "var(--gray-600)",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "color 0.18s, border-color 0.18s",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", opacity: activeCategory === cat.id ? 1 : 0.5 }}>
                  {cat.icon && <span style={{ transform: "scale(0.55)", display: "inline-flex" }}>{cat.icon}</span>}
                </span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ACTIVE CATEGORY CONTENT */}
      <section style={{ padding: "5rem 0", background: "var(--gray-50)" }}>
        <div className="container">
          <div style={{ marginBottom: "3rem" }}>
            <div className="section-label">{active.label}</div>
            <div className="divider-red" />
            <h2 className="text-headline" style={{ marginBottom: "0.75rem" }}>{active.title}</h2>
            <p className="text-subhead" style={{ maxWidth: "640px" }}>{active.subtitle}</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
            {active.items.map((item, i) => (
              <div key={i} className="ul-card" style={{ background: "#fff" }}>
                <div style={{
                  display: "inline-block",
                  background: "var(--red)",
                  color: "#fff",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "0.25rem 0.75rem",
                  marginBottom: "1rem",
                }}>
                  {item.norm}
                </div>
                <h3 style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "1.25rem",
                  color: "var(--gray-900)",
                  marginBottom: "0.75rem",
                  lineHeight: 1.2,
                }}>
                  {item.title}
                </h3>
                <p style={{ color: "var(--gray-600)", fontSize: "0.875rem", lineHeight: 1.75, marginBottom: "1.25rem" }}>
                  {item.desc}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1.5rem" }}>
                  {item.tags.map(tag => (
                    <span key={tag} style={{
                      background: "var(--gray-100)",
                      color: "var(--gray-700)",
                      fontSize: "0.6875rem",
                      fontWeight: 600,
                      padding: "0.25rem 0.625rem",
                      letterSpacing: "0.04em",
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
                <Link href="/contato" style={{
                  display: "inline-flex", alignItems: "center", gap: "0.4rem",
                  color: "var(--red)", fontSize: "0.8125rem", fontWeight: 700,
                  letterSpacing: "0.06em", textTransform: "uppercase",
                }}>
                  Solicitar este serviço <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NORMAS */}
      <section style={{ padding: "5rem 0", background: "#fff" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "4rem", alignItems: "start" }}>
            <div>
              <div className="section-label">Conformidade Técnica</div>
              <div className="divider-red" />
              <h2 className="text-headline" style={{ marginBottom: "1.25rem" }}>Normas que regem nossos projetos e laudos</h2>
              <p style={{ color: "var(--gray-600)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                Todos os projetos, laudos e vistorias são elaborados por engenheiros habilitados no CREA/MG, com rigorosa observância às normas técnicas brasileiras e internacionais vigentes.
              </p>
              <blockquote style={{
                borderLeft: "3px solid var(--red)", paddingLeft: "1.25rem",
                color: "var(--gray-700)", fontStyle: "italic", lineHeight: 1.75, marginBottom: "2rem",
              }}>
                "A conformidade normativa não é burocracia — é a garantia de que o sistema vai funcionar quando mais importa."
              </blockquote>
              <Link href="/contato" className="btn-primary">Falar com engenheiro <ArrowRight size={14} /></Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {[
                { code: "NBR 12615", desc: "Sistema de extinção por CO₂" },
                { code: "NBR 14095", desc: "Sistema saponificante" },
                { code: "NBR 13714", desc: "Hidrantes e mangotinhos" },
                { code: "NBR 17240", desc: "Detecção e alarme de incêndio" },
                { code: "NBR 14276", desc: "Brigada de incêndio" },
                { code: "NBR 15526", desc: "Redes de distribuição de gás" },
                { code: "NFPA 12", desc: "CO₂ Extinguishing Systems" },
                { code: "NFPA 17A", desc: "Wet Chemical Systems" },
                { code: "NFPA 72", desc: "National Fire Alarm Code" },
                { code: "NFPA 101", desc: "Life Safety Code" },
                { code: "IT CBMMG", desc: "Instruções Técnicas CBMMG" },
                { code: "CREA/MG", desc: "Responsabilidade Técnica — ART" },
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

      {/* PROCESS */}
      <section className="section-dark" style={{ padding: "5rem 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div className="section-label" style={{ color: "rgba(255,255,255,0.6)" }}>Como trabalhamos</div>
            <div className="divider-red" style={{ margin: "0 auto 1.25rem" }} />
            <h2 className="text-headline" style={{ color: "#fff" }}>Do contato à entrega da documentação</h2>
            <p style={{ color: "var(--gray-400)", maxWidth: "520px", margin: "1rem auto 0", lineHeight: 1.75 }}>
              Processo estruturado para garantir qualidade técnica, conformidade normativa e agilidade na entrega.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
            {processSteps.map((step, i) => (
              <div key={step.n} style={{ position: "relative" }}>
                {i < processSteps.length - 1 && (
                  <div className="timeline-line" style={{
                    position: "absolute", top: "20px", right: "-0.75rem",
                    width: "1.5rem", height: "2px",
                    background: "var(--red)", zIndex: 1,
                    display: "none",
                  }} />
                )}
                <div style={{
                  background: "var(--gray-800)", padding: "2rem 1.5rem",
                  borderTop: "3px solid var(--red)", height: "100%",
                }}>
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "2.5rem", fontWeight: 900,
                    color: "var(--red)", lineHeight: 1, marginBottom: "0.75rem",
                    opacity: 0.4,
                  }}>{step.n}</div>
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700, fontSize: "1.125rem",
                    color: "#fff", marginBottom: "0.5rem",
                  }}>{step.title}</div>
                  <p style={{ color: "var(--gray-400)", fontSize: "0.875rem", lineHeight: 1.7 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section style={{ padding: "5rem 0", background: "var(--gray-50)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div className="section-label">Por que a CO₂ Contra Incêndio</div>
            <div className="divider-red" style={{ margin: "0 auto 1.25rem" }} />
            <h2 className="text-headline">Diferenciais técnicos que fazem a diferença</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.5rem" }}>
            {[
              { icon: <Shield size={24} />, title: "Engenheiros Habilitados CREA/MG", desc: "Toda documentação assinada por engenheiro com registro ativo no CREA/MG e ART registrada." },
              { icon: <CheckCircle size={24} />, title: "Conformidade 100% Normativa", desc: "Projetos e laudos elaborados com rigorosa observância às normas ABNT, NFPA e IT CBMMG vigentes." },
              { icon: <AlertTriangle size={24} />, title: "Experiência em Edificações Complexas", desc: "Hospitais, indústrias, shoppings, restaurantes industriais e edificações de alto risco." },
              { icon: <Wrench size={24} />, title: "Suporte Pós-Entrega", desc: "Acompanhamento durante o processo de aprovação no CBMMG e suporte técnico pós-entrega." },
              { icon: <FileCheck size={24} />, title: "Documentação Completa", desc: "Entrega de projeto executivo, memorial descritivo, ART, relatórios e toda documentação exigida." },
              { icon: <Search size={24} />, title: "Atendimento em BH e Minas Gerais", desc: "Equipe técnica com atendimento presencial em Belo Horizonte e todo o estado de Minas Gerais." },
            ].map(d => (
              <div key={d.title} style={{
                background: "#fff", padding: "2rem 1.75rem",
                borderTop: "3px solid var(--red)",
                transition: "box-shadow 0.22s, transform 0.22s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.10)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.transform = "none"; }}
              >
                <div style={{ color: "var(--red)", marginBottom: "1rem" }}>{d.icon}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1.125rem", color: "var(--gray-900)", marginBottom: "0.5rem" }}>{d.title}</div>
                <p style={{ color: "var(--gray-600)", fontSize: "0.875rem", lineHeight: 1.7 }}>{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "5rem 0", background: "#fff" }}>
        <div className="container" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div className="section-label">Dúvidas Frequentes</div>
            <div className="divider-red" style={{ margin: "0 auto 1.25rem" }} />
            <h2 className="text-headline">Perguntas sobre projetos e laudos</h2>
          </div>
          <div>
            {faqs.map((faq, i) => (
              <div key={i} className="faq-item">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: "100%", background: "none", border: "none",
                    padding: "1.25rem 0", cursor: "pointer",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    textAlign: "left",
                  }}
                >
                  <span style={{ fontWeight: 600, color: "var(--gray-900)", fontSize: "0.9375rem", paddingRight: "1rem" }}>
                    {faq.q}
                  </span>
                  {openFaq === i
                    ? <ChevronUp size={18} style={{ color: "var(--red)", flexShrink: 0 }} />
                    : <ChevronDown size={18} style={{ color: "var(--gray-400)", flexShrink: 0 }} />
                  }
                </button>
                {openFaq === i && (
                  <p style={{ paddingBottom: "1.25rem", color: "var(--gray-600)", lineHeight: 1.8, fontSize: "0.9375rem" }}>
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ background: "var(--red)", padding: "5rem 0" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: "0.75rem" }}>
            Pronto para regularizar sua edificação?
          </div>
          <h2 className="text-headline" style={{ color: "#fff", marginBottom: "1.25rem" }}>
            Solicite seu projeto, laudo ou vistoria agora.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.82)", maxWidth: "560px", margin: "0 auto 2.5rem", lineHeight: 1.75 }}>
            Atendemos Belo Horizonte, Minas Gerais e todo o Brasil. Engenheiros habilitados no CREA/MG, documentação completa e conformidade garantida.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contato" className="btn-outline-white">Solicitar Orçamento <ArrowRight size={14} /></Link>
            <a href="https://wa.me/5531997383115?text=Olá! Preciso de um projeto/laudo/vistoria de incêndio." target="_blank" rel="noopener noreferrer" className="btn-outline-white">
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
