import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";

const aplicacoes = [
  {
    icon: "🖥️",
    title: "Data Centers e Salas de TI",
    norma: "NFPA 75 / NFPA 76 / TIA-942",
    agente: "FM-200 (HFC-227ea) · FK-5-1-12 (Novec 1230) · CO₂ (salas sem presença humana)",
    descricao:
      "Ambientes com alta densidade de equipamentos eletrônicos exigem agentes limpos que não danifiquem servidores, storages e switches. O sistema deve garantir concentração de projeto em menos de 10 segundos e não deixar resíduos condutivos.",
    detalhe: [
      "Concentração de projeto: 6,25% (FM-200) ou 5,9% (FK-5-1-12)",
      "Tempo de descarga: ≤ 10 s conforme NFPA 2001",
      "Detecção por fumaça muito cedo (VESDA) para alarme antecipado",
      "Intertravamento com CRAC/CRAH e UPS para desligamento seguro",
      "Pressurização positiva da sala para evitar reentrada de fumaça",
    ],
  },
  {
    icon: "📡",
    title: "Salas de Telecomunicações e NOC",
    norma: "NFPA 76 / ANSI/TIA-942",
    agente: "FK-5-1-12 · FM-200 · Inertgas (IG-55 / IG-541)",
    descricao:
      "Centrais de comutação, NOC (Network Operations Centers) e salas de roteadores operam 24/7 sem possibilidade de interrupção. O agente deve ser seguro para ocupação humana e compatível com equipamentos energizados.",
    detalhe: [
      "Inertgas (IG-55) reduz O₂ para 12,5% — sufocamento sem danos a equipamentos",
      "Tempo de retenção mínimo: 10 minutos conforme NFPA 2001",
      "Alarme sonoro e visual antes da descarga (pré-descarga de 30 s)",
      "Painel de controle com supressão manual e automática",
      "Monitoramento de concentração pós-descarga",
    ],
  },
  {
    icon: "🏥",
    title: "Hospitais e Laboratórios Farmacêuticos",
    norma: "NFPA 99 / RDC 50 ANVISA / NBR 13714",
    agente: "FK-5-1-12 · FM-200 · Sprinkler ESFR (áreas de armazenamento)",
    descricao:
      "Ambientes hospitalares exigem proteção sem geração de fumaça tóxica, resíduos ou danos a equipamentos médicos. Salas de cirurgia, UTI e farmácias têm requisitos específicos de segurança para ocupantes.",
    detalhe: [
      "NOAEL: 10% (FK-5-1-12) — seguro para ocupação humana",
      "Compatibilidade com equipamentos de imagem (RM, TC, raio-X)",
      "Proteção de câmaras frias e almoxarifados de medicamentos",
      "Integração com sistema de alarme hospitalar (código vermelho)",
      "Conformidade com RDC 50 ANVISA para projetos hospitalares",
    ],
  },
  {
    icon: "⚓",
    title: "Aplicações Offshore e Marítimas",
    norma: "SOLAS / IMO MSC.1/Circ.1432 / NFPA 11",
    agente: "CO₂ (espaços fechados) · Espuma AFFF/AR-AFFF · Water Mist",
    descricao:
      "Plataformas de petróleo, navios e embarcações de apoio têm requisitos rigorosos da IMO (International Maritime Organization). Sistemas de CO₂ total flooding protegem casas de máquinas, praças de máquinas e porões de carga.",
    detalhe: [
      "CO₂ total flooding: concentração de 34% para supressão de incêndio Classe B",
      "Alarme de evacuação obrigatório antes da descarga (SOLAS)",
      "Espuma de alta expansão para porões de carga (razão 200:1 a 1000:1)",
      "Water mist para proteção de turbinas a gás em plataformas",
      "Certificação DNV, Bureau Veritas ou Lloyd's Register",
    ],
  },
  {
    icon: "🌬️",
    title: "Turbinas Eólicas",
    norma: "IEC 61400-1 / NFPA 850 / FM Global DS 5-4",
    agente: "CO₂ · FK-5-1-12 · Dry Chemical",
    descricao:
      "A nacele de uma turbina eólica concentra transformador, gerador, caixa de engrenagens e painéis elétricos em espaço confinado a 80–120 m de altura. O incêndio é de difícil combate por brigadas — o sistema automático é a única proteção eficaz.",
    detalhe: [
      "Detecção por tubo linear (FireDETEC) ou detector de chama UV/IR",
      "CO₂ ou FK-5-1-12 para supressão do gerador e transformador",
      "Dry chemical para proteção da caixa de engrenagens (óleo mineral)",
      "Sistema autônomo com bateria de backup (sem rede elétrica disponível)",
      "Conformidade com IEC 61400-1 e recomendações FM Global",
    ],
  },
  {
    icon: "🏭",
    title: "Câmaras Frigoríficas e Armazéns Refrigerados",
    norma: "NBR 12615 / NFPA 13 / FM Global DS 8-29",
    agente: "CO₂ · Sprinkler ESFR · Water Mist",
    descricao:
      "Câmaras com temperatura de –30°C a +10°C apresentam desafios específicos: sprinklers convencionais podem congelar, e o isolamento de poliuretano é altamente combustível. O CO₂ é o agente preferido para câmaras negativas.",
    detalhe: [
      "CO₂ líquido: não congela em temperaturas negativas (ponto de fusão –56,6°C)",
      "Sprinkler ESFR com aquecimento elétrico das tubulações para câmaras positivas",
      "Proteção do painel de amônia (NH₃) com detector de gás e ventilação forçada",
      "Isolamento de poliuretano: risco de incêndio oculto — detecção por aspiração",
      "Conformidade com NFPA 13 e FM Global DS 8-29 para armazéns frigorificados",
    ],
  },
  {
    icon: "⚡",
    title: "Subestações Elétricas e Transformadores",
    norma: "NBR 14039 / NFPA 850 / IEC 61936-1",
    agente: "CO₂ (salas de controle) · Espuma AFFF (bacias de contenção) · Water Mist",
    descricao:
      "Transformadores de potência contêm óleo mineral dielétrico altamente inflamável. O incêndio em uma subestação pode causar interrupção de fornecimento para milhares de consumidores. A proteção deve ser rápida e eficaz.",
    detalhe: [
      "Espuma AFFF de baixa expansão para bacias de contenção de óleo",
      "CO₂ para salas de controle e painéis de proteção e medição",
      "Detector de temperatura linear (LHD) ao longo dos cabos de potência",
      "Water mist para transformadores internos (menor consumo de água)",
      "Conformidade com NBR 14039 e recomendações do fabricante do transformador",
    ],
  },
  {
    icon: "🚂",
    title: "Ferroviário e Metroviário",
    norma: "NFPA 130 / EN 45545-2 / NBR 15808",
    agente: "Water Mist · Dry Chemical · CO₂",
    descricao:
      "Trens, metrôs e VLTs têm compartimentos de motor, quadros elétricos e baterias de tração que exigem proteção automática. O sistema deve ser compacto, leve e resistente a vibrações.",
    detalhe: [
      "Water mist para compartimento de motor (baixo volume de água, alta eficiência)",
      "CO₂ ou FK-5-1-12 para quadros elétricos e inversores de frequência",
      "Dry chemical para baterias de tração (lítio-íon) — supressão de incêndio térmico",
      "Conformidade com EN 45545-2 para materiais e sistemas em veículos ferroviários",
      "Integração com sistema de controle do veículo (TCMS)",
    ],
  },
];

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Proteção contra Incêndio em Aplicações Especiais",
  "provider": {
    "@type": "LocalBusiness",
    "name": "CO2 Contra Incêndio",
    "url": "https://co2contra.com",
  },
  "description":
    "Sistemas de supressão de incêndio para data centers, hospitais, offshore, turbinas eólicas, câmaras frigoríficas, subestações e ferroviário.",
  "areaServed": "Brasil",
};

export default function AplicacoesEspeciais() {
  return (
    <>
      <SEOHead
        title="Proteção contra Incêndio em Aplicações Especiais | CO2 Contra Incêndio"
        description="Sistemas de supressão automática para data centers, hospitais, offshore, turbinas eólicas, câmaras frigoríficas, subestações e ferroviário. Normas NFPA, IEC, SOLAS e ABNT."
        keywords="proteção incêndio data center, supressão incêndio hospital, sistema incêndio offshore, turbina eólica incêndio, câmara frigorífica incêndio, subestação elétrica incêndio, ferroviário incêndio"
        schema={schema}
      />

      {/* Hero */}
      <section className="bg-[#0a1628] text-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-600/30 rounded-full px-4 py-1.5 mb-6">
            <span className="text-red-400 text-sm font-semibold tracking-wider uppercase">Aplicações Especiais</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
            Proteção para Ambientes<br />
            <span className="text-red-500">de Alta Criticidade</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mb-8">
            Data centers, hospitais, plataformas offshore, turbinas eólicas e instalações industriais críticas exigem
            soluções de supressão de incêndio especializadas, com agentes e normas específicas para cada aplicação.
          </p>
          <div className="flex flex-wrap gap-3">
            {["NFPA 75 / 76", "NFPA 99", "SOLAS / IMO", "IEC 61400-1", "NBR 14039", "EN 45545-2"].map((n) => (
              <span key={n} className="bg-white/10 border border-white/20 rounded px-3 py-1 text-sm font-mono text-gray-300">
                {n}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Aplicações */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid gap-8">
            {aplicacoes.map((app, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="text-4xl">{app.icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-[#0a1628] mb-1">{app.title}</h2>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded">
                          {app.norma}
                        </span>
                        <span className="bg-red-50 text-red-700 text-xs font-semibold px-2 py-0.5 rounded">
                          {app.agente}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-5 leading-relaxed">{app.descricao}</p>
                  <ul className="space-y-2">
                    {app.detalhe.map((d, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-red-500 mt-0.5 shrink-0">▸</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OPERIS CTA */}
      <section className="py-16 bg-[#0a1628]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            OPERIS — Gestão Integrada de Sistemas
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            Controle de equipamentos, manutenções, alertas e documentação técnica em um único sistema,
            com rastreamento por QR Code e relatórios automáticos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contato">
              <a className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-lg transition-colors">
                Solicitar Projeto Especializado
              </a>
            </Link>
            <Link href="/app/login">
              <a className="border border-white/30 hover:border-white text-white font-semibold px-8 py-4 rounded-lg transition-colors">
                Acessar OPERIS
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* Breadcrumb back */}
      <section className="py-8 bg-white border-t">
        <div className="max-w-6xl mx-auto px-6">
          <Link href="/sistemas-pre-engenheirados">
            <a className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-2">
              ← Voltar para Sistemas Pré-Engenheirados
            </a>
          </Link>
        </div>
      </section>
    </>
  );
}
