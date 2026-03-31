import { Flame, Shield, Zap, Settings, AlertTriangle, CheckCircle } from "lucide-react";
import ServicePageTemplate from "../../components/ServicePageTemplate";

export default function SistemaSupressaoCO2() {
  return (
    <ServicePageTemplate
      meta={{
        title: "Sistema de Supressão por CO₂ — Extinção Automática de Incêndio",
        description: "Sistemas fixos de extinção por CO₂ para salas técnicas, geradores, painéis elétricos e ambientes de alto risco. Projetos conforme ABNT NBR 12615 e NFPA 12. Atendemos BH e todo o Brasil.",
        keywords: "sistema supressão CO2, extinção incêndio CO2, sistema fixo CO2, NBR 12615, NFPA 12, cilindro CO2, válvula solenóide CO2, sala técnica incêndio, gerador incêndio",
      }}
      hero={{
        label: "Sistema de Supressão por CO₂",
        title: "Sistema Fixo de Extinção por CO₂",
        sub: "Proteção automática para salas técnicas, geradores, painéis elétricos e ambientes de alto risco. Sistemas projetados conforme ABNT NBR 12615 e NFPA 12.",
        bg: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1600&q=80",
      }}
      intro={{
        heading: "O que é o Sistema de Supressão por CO₂?",
        body: [
          "O sistema de supressão por CO₂ (dióxido de carbono) é uma solução de extinção automática de incêndios amplamente utilizada em ambientes onde a água ou o pó químico causariam danos irreversíveis aos equipamentos. O CO₂ age eliminando o oxigênio da área protegida, extinguindo o fogo sem deixar resíduos.",
          "Na CO₂ Contra Incêndio, projetamos e instalamos sistemas fixos de CO₂ de alta e baixa pressão para proteção total de salas de servidores, geradores, painéis elétricos, transformadores, câmaras frigoríficas e processos industriais.",
          "O agente CO₂ é elétrico e termicamente não condutor, não corrosivo e não deixa resíduos após a descarga — ideal para ambientes com equipamentos eletrônicos de alto valor. Todos os projetos são elaborados por engenheiros habilitados no CREA/MG com emissão de ART.",
          "Atuamos em Belo Horizonte, Minas Gerais e em todo o território nacional, atendendo indústrias, data centers, hospitais, shoppings e restaurantes.",
        ],
      }}
      features={[
        { icon: <Flame size={20} />, title: "Alta e Baixa Pressão", desc: "Sistemas de CO₂ de alta pressão (cilindros individuais) e baixa pressão (tanques refrigerados) para diferentes volumes e aplicações." },
        { icon: <Zap size={20} />, title: "Descarga Total ou Local", desc: "Proteção por inundação total do ambiente (total flooding) ou aplicação localizada (local application) conforme risco e norma." },
        { icon: <Shield size={20} />, title: "Sem Resíduos", desc: "O CO₂ não deixa resíduos após a descarga, eliminando custos de limpeza e danos secundários a equipamentos eletrônicos." },
        { icon: <Settings size={20} />, title: "Válvula Solenóide e Painel", desc: "Acionamento automático via detector de fumaça ou calor integrado ao painel de controle com solenóide de abertura do cilindro." },
        { icon: <AlertTriangle size={20} />, title: "Alarme Pré-descarga", desc: "Sinal sonoro e visual de pré-descarga para evacuação do ambiente antes da liberação do agente extintor." },
        { icon: <CheckCircle size={20} />, title: "Recarga e Manutenção", desc: "Serviço completo de recarga dos cilindros de CO₂ e manutenção preventiva periódica com relatório técnico e ART." },
      ]}
      norms={[
        { code: "ABNT NBR 12615", title: "Sistema de extinção de incêndio por CO₂", excerpt: "Esta norma especifica os requisitos mínimos para projeto, instalação, inspeção e manutenção de sistemas fixos de extinção de incêndio por dióxido de carbono." },
        { code: "NFPA 12", title: "Standard on Carbon Dioxide Extinguishing Systems", excerpt: "This standard provides minimum requirements for the design, installation, testing, inspection, approval, operation, and maintenance of total flooding and local application CO₂ systems." },
        { code: "IT-21 CBMMG", title: "Instrução Técnica — Sistemas de Supressão", excerpt: "Estabelece os requisitos técnicos para aprovação de sistemas fixos de extinção de incêndio junto ao Corpo de Bombeiros Militar de Minas Gerais." },
        { code: "ABNT NBR 14276", title: "Brigada de incêndio — Requisitos", excerpt: "Estabelece os requisitos mínimos para a composição, formação, implantação e reciclagem de brigada de incêndio, incluindo o treinamento para operação de sistemas fixos." },
      ]}
      process={[
        { step: "01", title: "Levantamento Técnico", desc: "Visita ao local para mapeamento do ambiente, identificação de riscos, volume da área protegida e definição do tipo de sistema (alta ou baixa pressão)." },
        { step: "02", title: "Projeto Executivo + ART", desc: "Elaboração do projeto executivo com cálculo de quantidade de CO₂, posicionamento de difusores, tubulação e painel de controle. Emissão de ART no CREA/MG." },
        { step: "03", title: "Aprovação no CBMMG", desc: "Protocolo e acompanhamento da aprovação do projeto junto ao Corpo de Bombeiros Militar de Minas Gerais." },
        { step: "04", title: "Instalação", desc: "Montagem do sistema com cilindros, válvulas solenóides, tubulação, difusores, detectores e painel de controle conforme projeto aprovado." },
        { step: "05", title: "Testes e Comissionamento", desc: "Testes funcionais de todos os componentes, simulação de alarme e verificação da estanqueidade do sistema." },
        { step: "06", title: "Treinamento e Documentação", desc: "Treinamento da brigada de incêndio, entrega do manual técnico, relatório fotográfico e certificados." },
      ]}
      videoId="xfZcwePg6SE"
      videoTitle="Teste de Descarga — Sistema CO₂ Kidde Fire Systems. Demonstração real de sistema fixo de extinção por CO₂ em operação."
      faqs={[
        { q: "Em quais ambientes o sistema de CO₂ é indicado?", a: "O sistema de CO₂ é indicado para salas de servidores, data centers, geradores, painéis elétricos, transformadores, câmaras frigoríficas, processos industriais e qualquer ambiente onde a água cause danos aos equipamentos. É especialmente eficaz em locais com equipamentos eletrônicos de alto valor." },
        { q: "O CO₂ é perigoso para pessoas?", a: "Sim. Em concentrações acima de 9% no ar, o CO₂ pode causar inconsciência e morte por asfixia. Por isso, sistemas de CO₂ por inundação total devem ser instalados apenas em ambientes normalmente desocupados, com alarme de pré-descarga obrigatório para evacuação antes da liberação do agente." },
        { q: "Qual a diferença entre sistema de alta e baixa pressão?", a: "No sistema de alta pressão, o CO₂ é armazenado em cilindros a temperatura ambiente (pressão de 5,8 MPa a 21°C). No sistema de baixa pressão, o CO₂ é armazenado em tanques refrigerados a -18°C (pressão de 2,1 MPa), sendo mais indicado para grandes volumes de proteção." },
        { q: "Com que frequência deve ser feita a manutenção?", a: "A ABNT NBR 12615 estabelece inspeção mensal visual, inspeção semestral detalhada e manutenção anual completa com pesagem dos cilindros. A recarga é necessária quando a perda de peso do agente superar 10% da carga nominal." },
        { q: "O sistema de CO₂ precisa de aprovação no Corpo de Bombeiros?", a: "Sim. Todo sistema fixo de extinção de incêndio deve ser aprovado pelo Corpo de Bombeiros conforme as Instruções Técnicas do CBMMG. A CO₂ Contra Incêndio elabora e protocola todos os projetos com ART de engenheiro habilitado." },
      ]}
      related={[
        { title: "Recarga de CO₂", href: "/recarga-co2" },
        { title: "Sistema Saponificante", href: "/sistema-saponificante" },
        { title: "Alarme de Incêndio", href: "/alarme-incendio" },
        { title: "Vistoria e Laudo com ART", href: "/vistoria-laudo-art" },
        { title: "Manutenção Preventiva", href: "/manutencao-preventiva" },
      ]}
      cta={{
        heading: "Precisa de um Sistema de Supressão por CO₂?",
        sub: "Nossa equipe de engenheiros elabora o projeto completo com ART, aprova no Corpo de Bombeiros e executa a instalação. Atendemos Belo Horizonte, Minas Gerais e todo o Brasil.",
      }}
    />
  );
}
