import { useState } from "react";
import { Link } from "wouter";
import Layout from "../components/Layout";
import SEOHead from "../components/SEOHead";
import {
  ArrowRight, Phone, ChevronDown, ChevronUp,
  Flame, Droplets, Zap, Shield, Bell, Wind, Search
} from "lucide-react";

const schemaJson = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Portfólio de Projetos de Proteção Contra Incêndio — CO₂ Contra Incêndio",
  "description": "Portfólio completo de projetos de combate a incêndio: CO₂, Saponificante, Sprinklers, Pré-Engenheirados, Agentes Limpos (Novec 1230, FM-200), Hidrantes e SDAI.",
  "provider": {
    "@type": "LocalBusiness",
    "name": "CO₂ Contra Incêndio",
    "url": "https://co2contra.com",
    "telephone": "+55-31-9-9738-3115",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Belo Horizonte",
      "addressRegion": "MG",
      "addressCountry": "BR"
    }
  },
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Projetos de CO₂" },
    { "@type": "ListItem", "position": 2, "name": "Projetos com Sistema Saponificante (Wet Chemical)" },
    { "@type": "ListItem", "position": 3, "name": "Projetos de Sprinklers (SPK)" },
    { "@type": "ListItem", "position": 4, "name": "Projetos com Sistemas Pré-Engenheirados" },
    { "@type": "ListItem", "position": 5, "name": "Projetos com Agentes Limpos: Novec 1230 e FM-200" },
    { "@type": "ListItem", "position": 6, "name": "Projetos de Hidrantes" },
    { "@type": "ListItem", "position": 7, "name": "Projetos de Detecção e Alarme de Incêndio (SDAI)" },
  ]
};

type ProjectCategory = {
  id: string;
  icon: React.ReactNode;
  label: string;
  norm: string;
  color: string;
  image: string;
  imageAlt: string;
  seoArticle: {
    h2: string;
    paragraphs: string[];
    keywords: string[];
  };
  applications: string[];
  deliverables: string[];
  cta: string;
};

const categories: ProjectCategory[] = [
  {
    id: "co2",
    icon: <Flame size={28} />,
    label: "Sistemas de CO₂",
    norm: "NBR 12615 / NFPA 12",
    color: "#C8102E",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029941110/TyJduRRrx582jr9b7ycCdJ/data-center-co2_accd1666.jpg",
    imageAlt: "Sistema de supressão por CO₂ em sala de servidores",
    seoArticle: {
      h2: "Projetos de Sistemas de Combate a Incêndio por CO₂",
      paragraphs: [
        "Os projetos de sistemas de combate a incêndio por CO₂ são amplamente utilizados em ambientes industriais, salas de servidores, CPDs, geradores, painéis elétricos de alta tensão, câmaras frigoríficas e instalações petroquímicas. O dióxido de carbono (CO₂) é um agente extintor gasoso que age por abafamento e resfriamento, sem deixar resíduos e sem danificar equipamentos eletrônicos sensíveis — característica fundamental para ambientes de missão crítica.",
        "A CO₂ Contra Incêndio elabora projetos executivos completos conforme a ABNT NBR 12615 e a norma americana NFPA 12, incluindo memorial descritivo, cálculo de descarga total ou local, dimensionamento de cilindros, tubulações e difusores, planta baixa, cortes e detalhes construtivos, além da ART do engenheiro responsável. Todos os projetos são desenvolvidos para atender às exigências do Corpo de Bombeiros de Minas Gerais (CBMMG) e às Instruções Técnicas vigentes, garantindo a aprovação do AVCB e a conformidade com as normas ABNT e NFPA.",
      ],
      keywords: ["projeto de combate a incêndio por CO₂", "sistema de supressão por CO₂", "NBR 12615", "NFPA 12", "proteção contra incêndio industrial", "AVCB", "engenharia de incêndio"],
    },
    applications: ["Salas de servidores e CPDs", "Geradores e painéis elétricos", "Câmaras frigoríficas", "Indústrias petroquímicas", "Arquivos e museus", "Subestações de energia"],
    deliverables: ["Memorial descritivo completo", "Cálculo de descarga (total/local)", "Planta baixa e cortes executivos", "Dimensionamento de cilindros e tubulação", "ART CREA/MG", "Aprovação no CBMMG"],
    cta: "Solicitar Projeto de CO₂",
  },
  {
    id: "saponificante",
    icon: <Droplets size={28} />,
    label: "Sistema Saponificante",
    norm: "NBR 14095 / NFPA 17A / UL 300",
    color: "#0891B2",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029941110/TyJduRRrx582jr9b7ycCdJ/kitchen-suppression-install_a58b0779.jpg",
    imageAlt: "Instalação de sistema saponificante Ansul R-102 em cozinha industrial",
    seoArticle: {
      h2: "Projetos com Sistema Saponificante (Wet Chemical) para Cozinhas Industriais",
      paragraphs: [
        "O sistema saponificante, também conhecido como Wet Chemical ou sistema de supressão por agente saponificante, é a solução técnica obrigatória para proteção de coifas, dutos de exaustão e equipamentos de cocção em cozinhas industriais, restaurantes, hotéis, hospitais e shoppings. O agente saponificante reage quimicamente com a gordura em chamas, formando uma camada de sabão que abafa o fogo e impede a re-ignição — mecanismo único que nenhum outro agente extintor oferece para esse tipo de risco.",
        "A CO₂ Contra Incêndio possui certificação UL 300 para projetos e instalação de sistemas saponificantes, atendendo às exigências mais rigorosas do mercado. Elaboramos projetos executivos conforme a ABNT NBR 14095 e a NFPA 17A, com dimensionamento do agente, posicionamento de bicos difusores, acionamento automático por detectores térmicos e manual por cabo de aço, integração com o sistema de gás (corte automático) e com o sistema de exaustão. O projeto inclui memorial descritivo, planta executiva, ART e toda a documentação para aprovação no CBMMG e obtenção do AVCB.",
      ],
      keywords: ["sistema saponificante", "wet chemical", "proteção de coifas", "cozinha industrial", "NBR 14095", "NFPA 17A", "UL 300", "projeto de incêndio para restaurante"],
    },
    applications: ["Restaurantes e bares", "Cozinhas de hotéis e hospitais", "Praças de alimentação em shoppings", "Cozinhas industriais e refeitórios", "Food trucks e trailers", "Padarias e confeitarias industriais"],
    deliverables: ["Dimensionamento do agente saponificante", "Posicionamento de bicos e detectores", "Integração com corte de gás", "Planta executiva e isométrico", "ART CREA/MG (certificação UL 300)", "Aprovação CBMMG e AVCB"],
    cta: "Solicitar Projeto Saponificante",
  },
  {
    id: "sprinklers",
    icon: <Zap size={28} />,
    label: "Sprinklers e Dilúvio",
    norm: "NBR 10897 / NFPA 13",
    color: "#16A34A",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029941110/TyJduRRrx582jr9b7ycCdJ/sprinkler-warehouse_e70796ec.jpg",
    imageAlt: "Sistema de sprinklers instalado em galpão industrial",
    seoArticle: {
      h2: "Projetos de Sprinklers (SPK) — Proteção Automática Contra Incêndio",
      paragraphs: [
        "Os projetos de sistemas de sprinklers (SPK) representam a forma mais eficaz de proteção automática contra incêndio em edificações comerciais, industriais, residenciais de alto padrão e de uso misto. O sistema de chuveiros automáticos atua diretamente no foco do incêndio, controlando ou extinguindo o fogo antes que se propague, protegendo vidas e patrimônio com máxima eficiência. Conforme a ABNT NBR 10897 e a NFPA 13, o projeto de sprinklers deve ser elaborado por engenheiro habilitado, com cálculo hidráulico detalhado, dimensionamento da rede de tubulação, reserva técnica de incêndio (RTI) e bomba de incêndio.",
        "A CO₂ Contra Incêndio desenvolve projetos executivos de sprinklers para os mais diversos tipos de ocupação: escritórios, shoppings, hotéis, hospitais, galpões logísticos, indústrias e edifícios residenciais. O projeto inclui a seleção do tipo de sprinkler adequado (pendente, upright, lateral, ESFR), o cálculo da área de operação, a densidade de descarga, o dimensionamento das prumadas e ramais, a especificação da bomba de incêndio e da RTI, e toda a documentação técnica para aprovação no CBMMG e obtenção do AVCB.",
      ],
      keywords: ["projeto de sprinklers", "sistema de chuveiros automáticos", "SPK", "NBR 10897", "NFPA 13", "proteção automática contra incêndio", "engenharia de incêndio", "AVCB"],
    },
    applications: ["Edifícios comerciais e corporativos", "Shoppings e centros comerciais", "Hotéis e hospitais", "Galpões logísticos e industriais", "Edifícios residenciais de alto padrão", "Data centers e salas técnicas"],
    deliverables: ["Cálculo hidráulico completo", "Dimensionamento de rede e prumadas", "Seleção de sprinklers e RTI", "Especificação de bomba de incêndio", "Planta executiva e isométrico", "ART CREA/MG e aprovação CBMMG"],
    cta: "Solicitar Projeto de Sprinklers",
  },
  {
    id: "pre-engenheirados",
    icon: <Shield size={28} />,
    label: "Sistemas Pré-Engenheirados",
    norm: "NBR 15808 / NFPA 17 / UL Listed",
    color: "#7C3AED",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029941110/TyJduRRrx582jr9b7ycCdJ/amerex-vehicle-system_68b84808.jpg",
    imageAlt: "Sistema pré-engenheirado Amerex instalado em veículo off-road",
    seoArticle: {
      h2: "Projetos com Sistemas Pré-Engenheirados de Supressão",
      paragraphs: [
        "Os sistemas pré-engenheirados de supressão por CO₂ são soluções compactas e certificadas para proteção de riscos específicos e de menor porte, como mesas de corte a laser, cabines de pintura, máquinas CNC, transformadores, quadros elétricos e equipamentos industriais isolados. Diferentemente dos sistemas projetados sob medida, os sistemas pré-engenheirados são desenvolvidos e certificados pelo fabricante para uma faixa específica de aplicações, com componentes padronizados e instalação simplificada.",
        "A CO₂ Contra Incêndio é certificada UL Listed para fornecimento e instalação de sistemas pré-engenheirados de CO₂, garantindo que cada solução atende rigorosamente às especificações do fabricante e às normas ABNT NBR 12615 e NFPA 12. Elaboramos o projeto de aplicação, o memorial descritivo, a ART e toda a documentação necessária para a aprovação no CBMMG. A certificação UL Listed é reconhecida internacionalmente e exigida por seguradoras e grandes grupos empresariais.",
      ],
      keywords: ["sistema pré-engenheirado de CO₂", "supressão automática", "UL Listed", "proteção de máquinas CNC", "proteção de quadros elétricos", "NBR 12615", "NFPA 12"],
    },
    applications: ["Mesas de corte a laser", "Cabines de pintura industrial", "Máquinas CNC e centros de usinagem", "Transformadores e quadros elétricos", "Equipamentos de impressão de grande porte", "Geradores e UPS"],
    deliverables: ["Projeto de aplicação certificado UL", "Memorial descritivo", "Dimensionamento de cilindros e difusores", "Planta de instalação", "ART CREA/MG", "Certificado UL Listed"],
    cta: "Solicitar Projeto Pré-Engenheirado",
  },
  {
    id: "agentes-limpos",
    icon: <Wind size={28} />,
    label: "Agentes Limpos",
    norm: "NFPA 2001 / ISO 14520",
    color: "#D97706",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029941110/TyJduRRrx582jr9b7ycCdJ/clean-agent-cylinders_5333fe12.jpg",
    imageAlt: "Cilindros de agente limpo FM-200 e Novec 1230 para proteção de data center",
    seoArticle: {
      h2: "Projetos com Agentes Limpos: Novec 1230 e FM-200 para Ambientes Críticos",
      paragraphs: [
        "Os agentes limpos Novec 1230 (FK-5-1-12) e FM-200 (HFC-227ea) são a solução técnica de excelência para proteção de ambientes onde a presença humana é frequente e onde os equipamentos protegidos não podem ser danificados por água, pó ou CO₂. Salas de controle, data centers, salas de operação, museus, arquivos históricos, salas-cofre e ambientes com equipamentos eletrônicos de alto valor são as aplicações típicas desses agentes. Ambos atuam por inibição química da reação de combustão, extinguindo o fogo em segundos sem reduzir o oxigênio a níveis perigosos para ocupantes.",
        "A CO₂ Contra Incêndio elabora projetos executivos com Novec 1230 e FM-200 conforme a NFPA 2001 e a ISO 14520, com cálculo de concentração de projeto, dimensionamento de cilindros e tubulação, análise de integridade do recinto (door fan test), painel de controle e acionamento, e toda a documentação para aprovação. O Novec 1230 possui potencial de aquecimento global (GWP) de apenas 1, sendo a alternativa ambientalmente responsável ao FM-200 (GWP 3.220), e é exigido por clientes com compromissos de sustentabilidade.",
      ],
      keywords: ["Novec 1230", "FM-200", "agente limpo", "NFPA 2001", "ISO 14520", "proteção de data center", "supressão sem resíduos", "proteção de sala de controle"],
    },
    applications: ["Data centers e salas de servidores", "Salas de controle e operação", "Museus e arquivos históricos", "Salas-cofre e cofres de banco", "Centros de telecomunicações", "Salas de cirurgia e UTI"],
    deliverables: ["Cálculo de concentração de projeto", "Análise de integridade do recinto", "Dimensionamento de cilindros e rede", "Painel de controle e acionamento", "ART CREA/MG", "Relatório de door fan test"],
    cta: "Solicitar Projeto com Agente Limpo",
  },
  {
    id: "hidrantes",
    icon: <Droplets size={28} />,
    label: "Hidrantes",
    norm: "NBR 13714",
    color: "#DC2626",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029941110/TyJduRRrx582jr9b7ycCdJ/hidrante-industrial_738aa004.jpg",
    imageAlt: "Sistema de hidrantes instalado em galpão industrial",
    seoArticle: {
      h2: "Projetos de Hidrantes — Sistema de Combate a Incêndio por Água",
      paragraphs: [
        "O sistema de hidrantes e mangotinhos é o sistema de combate a incêndio por água mais utilizado em edificações comerciais, industriais e residenciais no Brasil. Obrigatório pela legislação do Corpo de Bombeiros para a maioria das ocupações, o projeto de hidrantes deve ser elaborado conforme a ABNT NBR 13714, com cálculo de vazão e pressão, dimensionamento da reserva técnica de incêndio (RTI), especificação da bomba de incêndio, distribuição da rede de tubulação e posicionamento dos hidrantes de modo a garantir cobertura total da edificação.",
        "A CO₂ Contra Incêndio desenvolve projetos de hidrantes para todos os tipos de ocupação e porte, desde pequenos estabelecimentos comerciais até grandes complexos industriais e edifícios de múltiplos pavimentos. O projeto inclui o cálculo hidráulico completo, a especificação de todos os componentes (bombas, válvulas, tubulação, mangueiras, esguichos), o dimensionamento da RTI e da casa de bombas, e toda a documentação técnica para aprovação no CBMMG e obtenção do AVCB. Atendemos Belo Horizonte, Minas Gerais e todo o Brasil.",
      ],
      keywords: ["projeto de hidrantes", "sistema de hidrantes", "NBR 13714", "reserva técnica de incêndio", "bomba de incêndio", "AVCB", "proteção contra incêndio"],
    },
    applications: ["Edifícios comerciais e corporativos", "Galpões industriais e logísticos", "Shoppings e centros comerciais", "Hospitais e clínicas", "Condomínios residenciais", "Indústrias e plantas de processo"],
    deliverables: ["Cálculo hidráulico completo", "Dimensionamento de RTI e bomba", "Planta de distribuição da rede", "Especificação de todos os componentes", "ART CREA/MG", "Aprovação CBMMG e AVCB"],
    cta: "Solicitar Projeto de Hidrantes",
  },
  {
    id: "sdai",
    icon: <Bell size={28} />,
    label: "Detecção e Alarme (SDAI)",
    norm: "NBR 17240",
    color: "#0284C7",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029941110/TyJduRRrx582jr9b7ycCdJ/rotarex-cnc-machine_08ec0905.png",
    imageAlt: "Sistema de detecção e alarme de incêndio instalado em ambiente industrial",
    seoArticle: {
      h2: "Projetos de Detecção e Alarme de Incêndio (SDAI) — Convencional e Endereçável",
      paragraphs: [
        "O Sistema de Detecção e Alarme de Incêndio (SDAI) é o primeiro elo da cadeia de proteção contra incêndio: detecta o fogo em sua fase incipiente, alerta os ocupantes e aciona os sistemas de supressão antes que o sinistro se propague. A ABNT NBR 17240 estabelece os requisitos para projeto, instalação e manutenção de SDAIs, exigindo a elaboração de projeto técnico com ART para todas as edificações sujeitas ao licenciamento do Corpo de Bombeiros.",
        "A CO₂ Contra Incêndio elabora projetos de SDAI convencional e endereçável para todos os tipos de ocupação. O projeto inclui o posicionamento estratégico de detectores de fumaça iônicos e fotoelétricos, detectores de calor, detectores de chama, acionadores manuais (botoeiras), sirenes, strobes e a central de alarme de incêndio. Para sistemas endereçáveis, cada dispositivo possui endereço único, permitindo a identificação precisa do ponto de alarme e a integração com outros sistemas prediais (CFTV, controle de acesso, elevadores, ar-condicionado). Todos os projetos são desenvolvidos para aprovação no CBMMG e obtenção do AVCB.",
      ],
      keywords: ["SDAI", "sistema de detecção e alarme de incêndio", "NBR 17240", "detector de fumaça", "central de alarme", "AVCB", "proteção contra incêndio"],
    },
    applications: ["Edifícios corporativos e comerciais", "Hospitais e clínicas", "Hotéis e apart-hotéis", "Shoppings e centros de convenções", "Indústrias e plantas de processo", "Escolas e universidades"],
    deliverables: ["Posicionamento de detectores e acionadores", "Especificação da central de alarme", "Diagrama de blocos e cabeamento", "Integração com outros sistemas prediais", "ART CREA/MG", "Aprovação CBMMG e AVCB"],
    cta: "Solicitar Projeto de SDAI",
  },
];

export default function Projetos() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (id: string) => setExpanded(prev => prev === id ? null : id);

  return (
    <Layout>
      <SEOHead
        title="Portfólio de Projetos de Proteção Contra Incêndio | CO₂ Contra Incêndio"
        description="Portfólio completo de projetos de combate a incêndio: CO₂, Saponificante (Wet Chemical), Sprinklers, Pré-Engenheirados, Agentes Limpos (Novec 1230, FM-200), Hidrantes e SDAI. Belo Horizonte, MG e todo o Brasil."
        keywords="projeto de combate a incêndio, sistema de CO₂, sistema saponificante, sprinkler SPK, hidrantes, detecção e alarme de incêndio, Novec 1230, FM-200, AVCB, normas ABNT, engenharia de incêndio"
        canonical="https://co2contra.com/projetos"
        schema={schemaJson}
      />

      {/* Hero */}
      <section style={{ background: "#111111", padding: "72px 0 56px" }}>
        <div className="container" style={{ maxWidth: 1100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 32, height: 3, background: "#C8102E" }} />
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.12em", color: "#C8102E", textTransform: "uppercase" }}>Portfólio Técnico</span>
          </div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "clamp(2.2rem, 5vw, 3.5rem)", letterSpacing: "0.02em", color: "#FFFFFF", margin: "0 0 16px", lineHeight: 1.05 }}>
            PROJETOS DE PROTEÇÃO<br />CONTRA INCÊNDIO
          </h1>
          <p style={{ color: "#A0A0A0", fontSize: 16, maxWidth: 640, lineHeight: 1.7, margin: "0 0 32px" }}>
            Elaboramos projetos executivos completos para todos os sistemas de proteção contra incêndio, com ART de engenheiro habilitado, aprovação no CBMMG e conformidade com as normas ABNT e NFPA.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/contato" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", background: "#C8102E", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", textDecoration: "none" }}>
              SOLICITAR PROJETO <ArrowRight size={14} />
            </Link>
            <a href="tel:+5531997383115" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", background: "transparent", border: "1px solid #444", color: "#D8D8D8", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", textDecoration: "none" }}>
              <Phone size={14} /> (31) 9 9738-3115
            </a>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ background: "#C8102E", padding: "20px 0" }}>
        <div className="container" style={{ maxWidth: 1100 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 0 }}>
            {[
              { n: "7", label: "Tipos de Sistema" },
              { n: "14+", label: "Anos de Experiência" },
              { n: "NBR/NFPA", label: "Conformidade Total" },
              { n: "UL Listed", label: "Certificação Internacional" },
              { n: "ART", label: "Engenheiro Habilitado" },
            ].map(s => (
              <div key={s.n} style={{ textAlign: "center", padding: "8px 16px", borderRight: "1px solid rgba(255,255,255,0.2)" }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 22, color: "#fff", letterSpacing: "0.04em" }}>{s.n}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project categories */}
      <section style={{ background: "#F5F5F5", padding: "64px 0" }}>
        <div className="container" style={{ maxWidth: 1100 }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ width: 32, height: 3, background: "#C8102E", margin: "0 auto 16px" }} />
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "clamp(1.6rem, 3vw, 2.4rem)", letterSpacing: "0.04em", color: "#111111", margin: "0 0 12px" }}>
              CATEGORIAS DE PROJETOS
            </h2>
            <p style={{ color: "#6A6A6A", fontSize: 15, maxWidth: 560, margin: "0 auto" }}>
              Selecione uma categoria para ver detalhes técnicos, aplicações e artigo de referência.
            </p>
          </div>

          {/* Category buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 2, marginBottom: 2 }}>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => toggle(cat.id)}
                style={{
                  background: expanded === cat.id ? cat.color : "#fff",
                  border: `2px solid ${expanded === cat.id ? cat.color : "#E0E0E0"}`,
                  padding: "20px 24px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.18s",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div style={{ color: expanded === cat.id ? "#fff" : cat.color, flexShrink: 0 }}>{cat.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 15, letterSpacing: "0.06em", color: expanded === cat.id ? "#fff" : "#111111", textTransform: "uppercase" }}>{cat.label}</div>
                  <div style={{ fontSize: 11, color: expanded === cat.id ? "rgba(255,255,255,0.75)" : "#8A8A8A", marginTop: 2 }}>{cat.norm}</div>
                </div>
                <div style={{ color: expanded === cat.id ? "#fff" : "#8A8A8A", flexShrink: 0 }}>
                  {expanded === cat.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </button>
            ))}
          </div>

          {/* Expanded detail panel */}
          {categories.map(cat => expanded === cat.id && (
            <div key={`detail-${cat.id}`} style={{ background: "#fff", border: `2px solid ${cat.color}`, borderTop: "none", padding: "40px 40px 48px" }}>
              {/* Project image */}
              <div style={{ marginBottom: 32, borderRadius: 0, overflow: "hidden", maxHeight: 280, position: "relative" }}>
                <img
                  src={cat.image}
                  alt={cat.imageAlt}
                  style={{ width: "100%", height: 280, objectFit: "cover", display: "block" }}
                  loading="lazy"
                />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: `linear-gradient(transparent, ${cat.color}CC)`, padding: "24px 20px 14px" }}>
                  <span style={{ color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif" }}>
                    {cat.norm}
                  </span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>

                {/* Left: SEO Article */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                    <div style={{ width: 4, height: 32, background: cat.color }} />
                    <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: "0.04em", color: "#111111", margin: 0 }}>
                      {cat.seoArticle.h2}
                    </h2>
                  </div>
                  {cat.seoArticle.paragraphs.map((p, i) => (
                    <p key={i} style={{ color: "#3A3A3A", fontSize: 14, lineHeight: 1.75, marginBottom: 16 }}>{p}</p>
                  ))}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 20 }}>
                    {cat.seoArticle.keywords.map(kw => (
                      <span key={kw} style={{ padding: "3px 10px", background: `${cat.color}12`, border: `1px solid ${cat.color}30`, color: cat.color, fontSize: 11, fontWeight: 600, letterSpacing: "0.04em" }}>
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: Applications + Deliverables + CTA */}
                <div>
                  <div style={{ marginBottom: 28 }}>
                    <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", color: "#8A8A8A", textTransform: "uppercase", margin: "0 0 12px" }}>APLICAÇÕES TÍPICAS</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {cat.applications.map(a => (
                        <div key={a} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#3A3A3A" }}>
                          <div style={{ width: 6, height: 6, background: cat.color, borderRadius: "50%", flexShrink: 0 }} />
                          {a}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: 28 }}>
                    <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", color: "#8A8A8A", textTransform: "uppercase", margin: "0 0 12px" }}>ENTREGÁVEIS DO PROJETO</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {cat.deliverables.map(d => (
                        <div key={d} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#3A3A3A" }}>
                          <div style={{ width: 14, height: 14, background: `${cat.color}15`, border: `1px solid ${cat.color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <div style={{ width: 6, height: 6, background: cat.color }} />
                          </div>
                          {d}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <Link
                      href="/contato"
                      style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 20px", background: cat.color, color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textDecoration: "none" }}
                    >
                      {cat.cta} <ArrowRight size={13} />
                    </Link>
                    <a
                      href="tel:+5531997383115"
                      style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 20px", background: "transparent", border: `1px solid ${cat.color}`, color: cat.color, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textDecoration: "none" }}
                    >
                      <Phone size={13} /> LIGAR
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* OPERIS Integration Banner */}
      <section style={{ background: "#111111", padding: "56px 0" }}>
        <div className="container" style={{ maxWidth: 1100 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 24, height: 3, background: "#C8102E" }} />
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.12em", color: "#C8102E", textTransform: "uppercase" }}>OPERIS</span>
              </div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "clamp(1.4rem, 2.5vw, 2rem)", letterSpacing: "0.04em", color: "#FFFFFF", margin: "0 0 16px" }}>
                GESTÃO INTELIGENTE DOS<br />SEUS PROJETOS E EQUIPAMENTOS
              </h2>
              <p style={{ color: "#A0A0A0", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
                Todos os equipamentos instalados nos projetos são rastreados pelo OPERIS: QR Code em cada extintor, histórico de manutenções, alertas automáticos de vencimento e relatórios técnicos com ART. Seus clientes acessam o painel de controle em tempo real.
              </p>
              <Link href="/app" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 20px", background: "#C8102E", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textDecoration: "none" }}>
                ACESSAR PLATAFORMA <ArrowRight size={13} />
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { icon: <Search size={20} />, title: "QR Code por Equipamento", desc: "Rastreamento individual com histórico completo" },
                { icon: <Shield size={20} />, title: "Alertas Automáticos", desc: "Notificações de vencimento por e-mail e WhatsApp" },
                { icon: <Flame size={20} />, title: "Relatórios com ART", desc: "Documentação técnica gerada automaticamente" },
                { icon: <Bell size={20} />, title: "Painel do Cliente", desc: "Acesso em tempo real ao status dos sistemas" },
              ].map(f => (
                <div key={f.title} style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", padding: "16px" }}>
                  <div style={{ color: "#C8102E", marginBottom: 8 }}>{f.icon}</div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.04em", color: "#fff", marginBottom: 4 }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: "#6A6A6A" }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section style={{ background: "#C8102E", padding: "56px 0" }}>
        <div className="container" style={{ maxWidth: 1100, textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "clamp(1.6rem, 3vw, 2.4rem)", letterSpacing: "0.04em", color: "#fff", margin: "0 0 12px" }}>
            PRECISA DE UM PROJETO DE PROTEÇÃO CONTRA INCÊNDIO?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 15, marginBottom: 28 }}>
            Elaboramos projetos executivos completos com ART, aprovação no CBMMG e conformidade com ABNT e NFPA.<br />
            Atendemos Belo Horizonte, Minas Gerais e todo o Brasil.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contato" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", background: "#fff", color: "#C8102E", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 14, letterSpacing: "0.08em", textDecoration: "none" }}>
              SOLICITAR PROJETO <ArrowRight size={15} />
            </Link>
            <a href="tel:+5531997383115" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", background: "transparent", border: "2px solid rgba(255,255,255,0.6)", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: "0.08em", textDecoration: "none" }}>
              <Phone size={15} /> (31) 9 9738-3115
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
