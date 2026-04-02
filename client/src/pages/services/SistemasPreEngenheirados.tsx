import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";

// ─── CDN Assets ──────────────────────────────────────────────────────────────
const CDN = {
  amerexVehicle: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029941110/TyJduRRrx582jr9b7ycCdJ/amerex-vehicle-cat_6b824102.jpg",
  amerexIndustrial: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029941110/TyJduRRrx582jr9b7ycCdJ/amerex-industrial-system_f02413fc.jpg",
  rotarexCnc: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029941110/TyJduRRrx582jr9b7ycCdJ/rotarex-firedtec-cnc_9fed23c5.jpg",
  rotarexPanel: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029941110/TyJduRRrx582jr9b7ycCdJ/rotarex-firedtec-panel_246fa755.jpg",
  logoAmerex: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029941110/TyJduRRrx582jr9b7ycCdJ/logo-amerex_9540f89b.png",
  logoRotarex: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029941110/TyJduRRrx582jr9b7ycCdJ/logo-rotarex-firetec_81a16483.png",
  logoKidde: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029941110/TyJduRRrx582jr9b7ycCdJ/logo-kidde_f8f9aab2.png",
};

const manufacturers = [
  { name: "Amerex Fire Systems", logo: CDN.logoAmerex, url: "https://www.amerex-fire.com", desc: "Líder mundial em sistemas de supressão para veículos industriais e aplicações especiais. Certificação UL Listed e FM Approved." },
  { name: "Rotarex Firetec", logo: CDN.logoRotarex, url: "https://www.rotarex-firetec.com", desc: "Fabricante do sistema FireDETEC® — tubo de detecção linear com atuação automática. Certificação CE, VdS e UL." },
  { name: "Kidde Fire Systems", logo: CDN.logoKidde, url: "https://www.kidde-fire.com", desc: "Divisão industrial da Carrier Global. Sistemas de CO₂, agentes limpos e supressão para data centers e ambientes críticos." },
];

const systems = [
  {
    id: "veiculos",
    href: "/protecao-veiculos-off-road",
    image: CDN.amerexVehicle,
    tag: "NFPA 122 · ISO 3941",
    agent: "Dry Chemical ABC · Dual Agent",
    manufacturer: "Amerex",
    title: "Veículos Off-Road e Mineração",
    subtitle: "Escavadeiras, Carregadeiras, Colheitadeiras",
    description:
      "Sistemas automáticos instalados no compartimento de motor, transmissão e área de combustível. Detecção linear por tubo pressurizado — sem eletrônica exposta a vibração e poeira.",
    specs: [
      { label: "Tempo de resposta", value: "< 5 s" },
      { label: "Agente", value: "Purple-K (PKP) ou ABC" },
      { label: "Certificação", value: "UL Listed · FM Approved" },
      { label: "Norma", value: "NFPA 122 · ISO 3941:2021" },
    ],
  },
  {
    id: "cnc",
    href: "/protecao-maquinas-cnc",
    image: CDN.rotarexCnc,
    tag: "EN 15004-1 · NFPA 2001",
    agent: "FireDETEC® R107 · CO₂",
    manufacturer: "Rotarex Firetec",
    title: "Máquinas CNC e Usinagem",
    subtitle: "Torneamento, Fresamento, EDM, Retificação",
    description:
      "O tubo linear FireDETEC® atua como sensor e condutor do agente. Ao atingir a temperatura de ruptura (110°C), o tubo se rompe no ponto mais quente e descarrega o agente diretamente sobre a origem — sem painel de controle, sem fiação.",
    specs: [
      { label: "Temperatura de atuação", value: "110°C ou 182°C" },
      { label: "Agente", value: "Dry Chemical R107 ou CO₂" },
      { label: "Volume máximo", value: "Até 3,0 m³ por cilindro" },
      { label: "Certificação", value: "CE · VdS · UL" },
    ],
  },
  {
    id: "paineis",
    href: "/protecao-paineis-eletricos",
    image: CDN.rotarexPanel,
    tag: "IEC 62305 · NFPA 70E",
    agent: "FireDETEC® · FK-5-1-12 · CO₂",
    manufacturer: "Rotarex Firetec",
    title: "Painéis Elétricos e CCMs",
    subtitle: "Quadros de Distribuição, CCM, UPS, Inversores",
    description:
      "Sistema FireDETEC® indireto com tubo de detecção dentro do gabinete e cilindro externo com agente limpo — sem resíduos condutivos, sem dano a equipamentos energizados.",
    specs: [
      { label: "Agente preferencial", value: "FK-5-1-12 — zero ODP" },
      { label: "Tempo de descarga", value: "≤ 10 s (NFPA 2001)" },
      { label: "Segurança elétrica", value: "Dielétrico até 35 kV" },
      { label: "Norma", value: "IEC 62305 · NFPA 70E · NBR 5410" },
    ],
  },
  {
    id: "industrial",
    href: "/protecao-maquinas-industriais",
    image: CDN.amerexIndustrial,
    tag: "NFPA 86 · NBR 14276",
    agent: "CO₂ Total Flooding · Dry Chemical",
    manufacturer: "Amerex · Kidde",
    title: "Máquinas Industriais",
    subtitle: "Injetoras de Plástico, Prensas Hidráulicas, Extrusoras",
    description:
      "Injetoras e prensas operam com óleo mineral sob alta pressão — risco de incêndio Classe B de ignição rápida. Supressão local aplica o agente diretamente sobre a zona de risco.",
    specs: [
      { label: "Modo de aplicação", value: "Local ou Total flooding" },
      { label: "Agente", value: "CO₂ · Dry Chemical · AFFF" },
      { label: "Detecção", value: "Termovelocimétrico · Tubo linear" },
      { label: "Norma", value: "NFPA 86 · NBR 14276" },
    ],
  },
  {
    id: "geradores",
    href: "/protecao-geradores",
    image: CDN.amerexIndustrial,
    tag: "NFPA 110 · NBR 13231",
    agent: "CO₂ · FM-200 · Water Mist",
    manufacturer: "Kidde · Amerex",
    title: "Geradores e Grupos Motogeradores",
    subtitle: "Grupos Geradores Diesel, UPS de Grande Porte",
    description:
      "Salas de geradores concentram combustível diesel, óleo lubrificante e alta temperatura. Proteção por zonas distintas: motor, painel de controle e tanque de combustível.",
    specs: [
      { label: "Zona Motor", value: "CO₂ ou Water Mist" },
      { label: "Zona Painel", value: "FK-5-1-12 ou FM-200" },
      { label: "Zona Tanque", value: "AFFF ou Dry Chemical" },
      { label: "Norma", value: "NFPA 110 · NBR 13231" },
    ],
  },
  {
    id: "laboratorios",
    href: "/protecao-laboratorios",
    image: CDN.rotarexPanel,
    tag: "NFPA 45 · RDC 50 ANVISA",
    agent: "FK-5-1-12 · CO₂",
    manufacturer: "Kidde · Rotarex",
    title: "Laboratórios e Farmácias",
    subtitle: "Capelas Químicas, Armazenamento de Reagentes",
    description:
      "Laboratórios armazenam solventes inflamáveis em capelas de exaustão. O sistema suprime sem gerar produtos tóxicos e sem danificar equipamentos analíticos de alto valor.",
    specs: [
      { label: "Agente preferencial", value: "FK-5-1-12 — zero resíduo" },
      { label: "Detecção", value: "VESDA (aspiração)" },
      { label: "Conformidade", value: "RDC 50 ANVISA · NFPA 45" },
      { label: "Tempo de resposta", value: "< 30 s" },
    ],
  },
];

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Sistemas Pré-Engenheirados de Supressão de Incêndio",
  provider: {
    "@type": "LocalBusiness",
    name: "CO2 Contra Incêndio",
    url: "https://co2contra.com",
    telephone: "+55-31-99738-3115",
  },
  description:
    "Sistemas automáticos de supressão de incêndio para veículos off-road, máquinas CNC, painéis elétricos, geradores e laboratórios. Amerex, Rotarex FireDETEC, Kidde. Normas NFPA e ABNT.",
  areaServed: "Brasil",
};

export default function SistemasPreEngenheirados() {
  return (
    <>
      <SEOHead
        title="Sistemas Pré-Engenheirados de Supressão de Incêndio | CO2 Contra Incêndio"
        description="Sistemas automáticos de supressão para veículos off-road, máquinas CNC, painéis elétricos, geradores e laboratórios. Amerex, Rotarex FireDETEC, Kidde. Normas NFPA e ABNT."
        keywords="sistemas pré-engenheirados incêndio, Amerex supressão veículos, Rotarex FireDETEC CNC, proteção painéis elétricos incêndio, supressão automática industrial, NFPA 122, NFPA 2001"
        schema={schema}
      />

      {/* HERO */}
      <section className="bg-[#0a1628] text-white">
        <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-red-500 text-xs font-bold tracking-[0.2em] uppercase mb-4">
              Engenharia de Proteção Contra Incêndio
            </p>
            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">
              Sistemas<br />
              <span className="text-red-500">Pré-Engenheirados</span><br />
              de Supressão
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-lg">
              Soluções automáticas de detecção e supressão para ambientes industriais de alta criticidade.
              Atuação em menos de 5 segundos, sem intervenção humana, sem dano a equipamentos.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              {["UL Listed", "FM Approved", "CE Marked", "NFPA Compliant", "NBR 12693"].map((cert) => (
                <span key={cert} className="border border-white/20 text-gray-300 text-xs font-semibold px-3 py-1.5 rounded">
                  {cert}
                </span>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/contato">
                <a className="bg-red-600 hover:bg-red-700 text-white font-bold px-7 py-3.5 rounded transition-colors text-sm">
                  Solicitar Projeto Técnico
                </a>
              </Link>
              <Link href="/app/login">
                <a className="border border-white/30 hover:border-white text-white font-semibold px-7 py-3.5 rounded transition-colors text-sm">
                  Plataforma OPERIS
                </a>
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <img
              src={CDN.amerexIndustrial}
              alt="Sistema Amerex de supressão automática instalado em ambiente industrial"
              className="rounded-lg w-full object-cover h-80"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* NORMAS BAR */}
      <div className="bg-[#111f38] border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap gap-x-8 gap-y-2 items-center">
          <span className="text-gray-500 text-xs font-bold tracking-widest uppercase">Normas aplicáveis</span>
          {["NFPA 122 — Mineração", "NFPA 2001 — Agentes Limpos", "NFPA 86 — Fornos", "NFPA 110 — Geradores", "NFPA 45 — Laboratórios", "NBR 12693 — Extintores", "ISO 3941 — Veículos"].map((n) => (
            <span key={n} className="text-gray-400 text-xs font-mono">
              {n}
            </span>
          ))}
        </div>
      </div>

      {/* DEFINIÇÃO TÉCNICA */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-black text-[#0a1628] mb-4">O que é um Sistema Pré-Engenheirado?</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Um sistema pré-engenheirado de supressão de incêndio é uma solução de proteção localizada, projetada e testada pelo fabricante para aplicações específicas — sem necessidade de cálculo hidráulico ou elétrico customizado em campo. O instalador segue um manual de instalação aprovado pelo órgão certificador (UL, FM, VdS) e o sistema opera dentro dos parâmetros validados em laboratório.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Diferente dos sistemas projetados sob medida (sprinklers, CO₂ total flooding), os sistemas pré-engenheirados são dimensionados pelo fabricante para volumes e aplicações específicas. Isso garante previsibilidade de desempenho, redução de custo de projeto e instalação mais rápida — sem comprometer a eficácia.
              </p>
              <p className="text-gray-600 leading-relaxed">
                A CO2 Contra Incêndio é distribuidora e instaladora autorizada dos sistemas Amerex, Rotarex Firetec e Kidde Fire Systems em Minas Gerais, com equipe técnica certificada pelos fabricantes.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { icon: "⚡", title: "Atuação Automática", desc: "Sem intervenção humana. Detecção e supressão em menos de 5 segundos." },
                { icon: "🔬", title: "Testado em Laboratório", desc: "Cada sistema é certificado UL, FM ou VdS antes de chegar ao campo." },
                { icon: "🎯", title: "Proteção Localizada", desc: "O agente é aplicado diretamente na origem do incêndio, sem contaminar o ambiente." },
              ].map((item) => (
                <div key={item.title} className="flex gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-2xl shrink-0">{item.icon}</span>
                  <div>
                    <p className="font-bold text-[#0a1628] text-sm mb-1">{item.title}</p>
                    <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SISTEMAS */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10">
            <p className="text-red-600 text-xs font-bold tracking-[0.2em] uppercase mb-2">Aplicações</p>
            <h2 className="text-3xl font-black text-[#0a1628]">Sistemas por Aplicação Industrial</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {systems.map((sys) => (
              <Link key={sys.id} href={sys.href}>
                <a className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-red-200 hover:shadow-lg transition-all duration-200 flex flex-col">
                  <div className="relative overflow-hidden h-48">
                    <img
                      src={sys.image}
                      alt={`${sys.title} — sistema de supressão de incêndio`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/80 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                      <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">{sys.manufacturer}</span>
                      <span className="bg-black/50 text-gray-300 text-[10px] font-mono px-2 py-0.5 rounded">{sys.agent}</span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <p className="text-gray-400 text-[10px] font-mono mb-1">{sys.tag}</p>
                    <h3 className="text-[#0a1628] font-black text-base mb-1 leading-tight">{sys.title}</h3>
                    <p className="text-gray-500 text-xs mb-3">{sys.subtitle}</p>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1">{sys.description}</p>
                    <div className="border-t border-gray-100 pt-3 space-y-1.5">
                      {sys.specs.map((spec) => (
                        <div key={spec.label} className="flex justify-between text-xs">
                          <span className="text-gray-400 font-medium">{spec.label}</span>
                          <span className="text-[#0a1628] font-semibold text-right ml-2">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-red-600 text-xs font-bold group-hover:gap-2 transition-all">
                      Ver especificações completas <span>→</span>
                    </div>
                  </div>
                </a>
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/aplicacoes-especiais">
              <a className="inline-flex items-center gap-2 border border-[#0a1628] text-[#0a1628] hover:bg-[#0a1628] hover:text-white font-bold px-6 py-3 rounded-lg transition-colors text-sm">
                Ver Aplicações Especiais (Data Centers, Offshore, Hospitais) →
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* FABRICANTES */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10">
            <p className="text-red-600 text-xs font-bold tracking-[0.2em] uppercase mb-2">Parceiros Técnicos</p>
            <h2 className="text-2xl font-black text-[#0a1628]">Fabricantes Certificados</h2>
            <p className="text-gray-500 text-sm mt-2 max-w-xl">
              Trabalhamos exclusivamente com fabricantes que possuem certificação UL, FM ou VdS — os três principais organismos de certificação de sistemas de supressão de incêndio no mundo.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {manufacturers.map((mfr) => (
              <a
                key={mfr.name}
                href={mfr.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group border border-gray-100 rounded-xl p-6 hover:border-red-200 hover:shadow-md transition-all"
              >
                <div className="h-12 flex items-center mb-4">
                  <img src={mfr.logo} alt={`Logo ${mfr.name}`} className="max-h-10 max-w-[160px] object-contain grayscale group-hover:grayscale-0 transition-all" />
                </div>
                <h3 className="font-bold text-[#0a1628] text-sm mb-2">{mfr.name}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{mfr.desc}</p>
                <span className="inline-flex items-center gap-1 text-red-600 text-xs font-semibold mt-3 group-hover:gap-2 transition-all">
                  Site oficial →
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARATIVO DE AGENTES */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <p className="text-red-600 text-xs font-bold tracking-[0.2em] uppercase mb-2">Referência Técnica</p>
            <h2 className="text-2xl font-black text-[#0a1628]">Comparativo de Agentes Extintores</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#0a1628] text-white">
                  <th className="text-left px-4 py-3 font-bold text-xs">Agente</th>
                  <th className="text-left px-4 py-3 font-bold text-xs">Classes</th>
                  <th className="text-left px-4 py-3 font-bold text-xs">Resíduo</th>
                  <th className="text-left px-4 py-3 font-bold text-xs">Segurança Elétrica</th>
                  <th className="text-left px-4 py-3 font-bold text-xs">Aplicação Típica</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { agent: "Dry Chemical ABC (PKP)", classes: "A · B · C", residue: "Pó branco — limpeza necessária", electric: "Dielétrico (cautela)", app: "Veículos off-road, mineração" },
                  { agent: "CO₂ (Dióxido de Carbono)", classes: "B · C", residue: "Zero — gás inerte", electric: "Dielétrico total", app: "Salas de máquinas, geradores" },
                  { agent: "FK-5-1-12 (Novec 1230)", classes: "A · B · C", residue: "Zero — evapora completamente", electric: "Dielétrico até 35 kV", app: "Data centers, painéis, laboratórios" },
                  { agent: "FM-200 (HFC-227ea)", classes: "A · B · C", residue: "Zero — gás", electric: "Dielétrico", app: "Salas de TI, telecomunicações" },
                  { agent: "FireDETEC® R107", classes: "B · C", residue: "Pó fino — limpeza simples", electric: "Não recomendado em tensão", app: "CNC, máquinas industriais" },
                  { agent: "Water Mist (Névoa d'Água)", classes: "A · B · C", residue: "Água — dano mínimo", electric: "Até 1.000 V (certificado)", app: "Turbinas, compartimento de motor" },
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3 font-semibold text-[#0a1628]">{row.agent}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{row.classes}</td>
                    <td className="px-4 py-3 text-gray-600">{row.residue}</td>
                    <td className="px-4 py-3 text-gray-600">{row.electric}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{row.app}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* OPERIS CTA */}
      <section className="py-16 bg-[#0a1628]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-red-500 text-xs font-bold tracking-[0.2em] uppercase mb-3">Plataforma OPERIS</p>
              <h2 className="text-3xl font-black text-white mb-4">Gerencie Todos os Sistemas com Rastreamento por QR Code</h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                Cada equipamento instalado recebe um QR Code único. Técnicos registram inspeções, manutenções e recargas diretamente pelo celular. Alertas automáticos notificam o responsável antes do vencimento.
              </p>
              <ul className="space-y-2 mb-6">
                {[
                  "Histórico completo de manutenções por equipamento",
                  "Alertas automáticos por WhatsApp e e-mail",
                  "Relatórios de conformidade para o Corpo de Bombeiros",
                  "Acesso via celular — sem instalação de app",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-red-500 mt-0.5 shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/contato">
                  <a className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded transition-colors text-sm">
                    Solicitar Demonstração
                  </a>
                </Link>
                <Link href="/app/login">
                  <a className="border border-white/30 hover:border-white text-white font-semibold px-6 py-3 rounded transition-colors text-sm">
                    Acessar Plataforma
                  </a>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img src={CDN.rotarexPanel} alt="Painel de controle de sistema de supressão" className="rounded-lg w-full object-cover h-72" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-black text-[#0a1628] mb-8">Perguntas Técnicas Frequentes</h2>
          <div className="space-y-4">
            {[
              {
                q: "Qual a diferença entre sistema pré-engenheirado e sistema projetado sob medida?",
                a: "O sistema pré-engenheirado é dimensionado e testado pelo fabricante para volumes e aplicações específicas — o instalador segue um manual aprovado pela UL ou FM. O sistema projetado sob medida (ex: sprinklers, CO₂ total flooding) requer cálculo hidráulico ou de concentração específico para cada ambiente, com ART de engenheiro.",
              },
              {
                q: "O sistema Amerex para veículos funciona em máquinas com cabine pressurizada?",
                a: "Sim. O sistema Amerex Dry-ICS utiliza tubo de detecção linear e bicos de descarga posicionados no compartimento de motor, transmissão e área de combustível — fora da cabine. A descarga não afeta o operador. O sistema pode ser integrado ao painel da cabine para alarme visual e sonoro.",
              },
              {
                q: "O FireDETEC® precisa de energia elétrica para funcionar?",
                a: "Não. O sistema FireDETEC® é totalmente mecânico — o tubo pressurizado atua como sensor e condutor do agente. Ao atingir a temperatura de ruptura, o tubo se rompe e a pressão interna empurra o agente para os bicos de descarga. Não há painel de controle, não há fiação, não há dependência de energia.",
              },
              {
                q: "Qual agente usar em painéis elétricos energizados?",
                a: "Para painéis que não podem ser desligados antes da supressão, o agente recomendado é o FK-5-1-12 (Novec 1230) ou o FM-200 (HFC-227ea) — ambos dielétricos e sem resíduos condutivos. O CO₂ também é dielétrico, mas requer evacuação do ambiente e não é adequado para painéis em áreas ocupadas.",
              },
            ].map((faq, i) => (
              <details key={i} className="group border border-gray-100 rounded-lg">
                <summary className="flex justify-between items-center p-5 cursor-pointer font-semibold text-[#0a1628] text-sm list-none">
                  {faq.q}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform shrink-0 ml-4">▼</span>
                </summary>
                <p className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-50 pt-4">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
