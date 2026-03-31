import { Droplets, Flame, Shield, Settings, CheckCircle, AlertTriangle } from "lucide-react";
import ServicePageTemplate from "../../components/ServicePageTemplate";

export default function SistemaSaponificante() {
  return (
    <ServicePageTemplate
      meta={{
        title: "Sistema Saponificante para Cozinhas Industriais — NBR 14095",
        description: "Sistemas fixos de supressão com agente saponificante para coifas, dutos e equipamentos de cocção. Obrigatório para cozinhas industriais conforme NBR 14095 e NFPA 17A. Atendemos BH e todo o Brasil.",
        keywords: "sistema saponificante, saponificante cozinha industrial, supressão incêndio cozinha, NBR 14095, NFPA 17A, coifa incêndio, duto cozinha incêndio, fritadeira incêndio, chapa incêndio",
      }}
      hero={{
        label: "Sistema Saponificante",
        title: "Proteção Especializada para Cozinhas Industriais",
        sub: "Sistemas fixos com agente saponificante para coifas, dutos e equipamentos de cocção. Solução obrigatória conforme NBR 14095 e NFPA 17A para restaurantes, shoppings e cozinhas industriais.",
        bg: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=80",
      }}
      intro={{
        heading: "O que é o Sistema Saponificante?",
        body: [
          "O sistema de supressão por agente saponificante (wet chemical) é a solução específica para proteção de cozinhas industriais, restaurantes e estabelecimentos com equipamentos de cocção a óleo. O agente saponificante reage quimicamente com a gordura aquecida, formando uma camada de sabão que sela a superfície e impede a re-ignição.",
          "A CO₂ Contra Incêndio projeta e instala sistemas saponificantes para coifas, dutos de exaustão, fritadeiras industriais, chapas, grelhadores, fornos e woks. O sistema é acionado automaticamente por detectores térmicos ou manualmente pelo operador.",
          "Diferentemente do CO₂, o agente saponificante é especialmente eficaz em incêndios classe K (óleos e gorduras vegetais e animais aquecidos), sendo a única solução aprovada pelas normas para proteção de equipamentos de cocção a óleo.",
          "Todos os nossos projetos incluem o intertravamento com o sistema de gás (solenóide de corte) e o sistema de exaustão (dampers), garantindo a segurança completa da cozinha conforme exigência do Corpo de Bombeiros.",
        ],
      }}
      features={[
        { icon: <Droplets size={20} />, title: "Agente Saponificante (Wet Chemical)", desc: "Reage com gordura aquecida formando camada de sabão que sela a superfície e previne re-ignição. Eficaz em incêndios Classe K." },
        { icon: <Flame size={20} />, title: "Proteção de Coifas e Dutos", desc: "Bicos difusores posicionados estrategicamente na coifa, dutos de exaustão e sobre cada equipamento de cocção." },
        { icon: <Settings size={20} />, title: "Intertravamento com Gás e Exaustão", desc: "Integração com solenóide de corte de gás e dampers de exaustão para desligamento automático em caso de acionamento." },
        { icon: <Shield size={20} />, title: "Detecção Térmica", desc: "Detectores térmicos fusíveis posicionados sobre os equipamentos para acionamento automático sem necessidade de energia elétrica." },
        { icon: <AlertTriangle size={20} />, title: "Acionamento Manual", desc: "Estação de acionamento manual (pull station) para ativação pelo operador em caso de emergência." },
        { icon: <CheckCircle size={20} />, title: "Manutenção Semestral", desc: "Inspeção e manutenção semestral obrigatória conforme NBR 14095, com recarga do agente e verificação de todos os componentes." },
      ]}
      norms={[
        { code: "ABNT NBR 14095", title: "Sistema de supressão de incêndio por agente saponificante", excerpt: "Esta norma estabelece os requisitos mínimos para projeto, instalação, inspeção e manutenção de sistemas fixos de extinção de incêndio por agente saponificante em equipamentos de cocção." },
        { code: "NFPA 17A", title: "Standard for Wet Chemical Extinguishing Systems", excerpt: "This standard covers the design, installation, maintenance, and use of wet chemical extinguishing systems for the protection of cooking equipment and associated exhaust systems." },
        { code: "IT-21 CBMMG", title: "Instrução Técnica — Sistemas de Supressão", excerpt: "Estabelece os requisitos para aprovação de sistemas fixos de extinção de incêndio, incluindo sistemas saponificantes para cozinhas industriais, junto ao CBMMG." },
        { code: "ABNT NBR 16250", title: "Cozinhas industriais — Segurança contra incêndio", excerpt: "Requisitos de segurança contra incêndio para cozinhas industriais, incluindo sistemas de supressão, exaustão e detecção integrados." },
      ]}
      process={[
        { step: "01", title: "Levantamento dos Equipamentos", desc: "Mapeamento de todos os equipamentos de cocção, dimensões da coifa e dutos, tipo de combustível e volume de óleo utilizado." },
        { step: "02", title: "Projeto + ART", desc: "Cálculo do agente saponificante, posicionamento de bicos, tubulação, cilindros e integração com sistemas de gás e exaustão." },
        { step: "03", title: "Aprovação CBMMG", desc: "Protocolo e acompanhamento da aprovação do projeto junto ao Corpo de Bombeiros Militar de Minas Gerais." },
        { step: "04", title: "Instalação Integrada", desc: "Montagem do sistema com bicos difusores, tubulação, cilindros de agente, detectores térmicos, painel e intertravamentos." },
        { step: "05", title: "Testes Operacionais", desc: "Simulação de acionamento, verificação dos intertravamentos de gás e exaustão, e teste de todos os componentes." },
        { step: "06", title: "Treinamento e Documentação", desc: "Treinamento da equipe da cozinha para operação e manutenção básica, entrega de manual técnico e certificados." },
      ]}
      videoId="5J0vIP-oec4"
      videoTitle="Sistema Saponificante em Coifa seguindo a atualização da NBR 14095 — Demonstração real de instalação e funcionamento."
      faqs={[
        { q: "O sistema saponificante é obrigatório para restaurantes?", a: "Sim. O Corpo de Bombeiros exige sistema fixo de supressão para cozinhas industriais com equipamentos de cocção a óleo (fritadeiras, chapas, grelhadores) acima de determinadas dimensões. A obrigatoriedade varia conforme a Instrução Técnica do CBMMG do estado e a área do estabelecimento." },
        { q: "Qual a diferença entre saponificante e CO₂ para cozinhas?", a: "O agente saponificante é o único aprovado para proteção de equipamentos de cocção a óleo (incêndios Classe K) porque reage quimicamente com a gordura, formando uma camada protetora que previne a re-ignição. O CO₂ extingue o fogo, mas não previne a re-ignição em superfícies com óleo quente." },
        { q: "O sistema precisa ser integrado ao gás e à exaustão?", a: "Sim. As normas exigem o intertravamento do sistema saponificante com a solenóide de corte de gás e com os dampers de exaustão. Quando o sistema é acionado, o gás é cortado automaticamente e os dampers fecham para conter o incêndio no duto." },
        { q: "Com que frequência o sistema precisa de manutenção?", a: "A ABNT NBR 14095 exige inspeção semestral do sistema, incluindo verificação do agente saponificante, pressão dos cilindros, bicos difusores, detectores térmicos e intertravamentos. A recarga é necessária após cada acionamento ou quando a pressão estiver abaixo do especificado." },
        { q: "O sistema funciona sem energia elétrica?", a: "Sim. Os detectores térmicos fusíveis acionam o sistema mecanicamente, sem necessidade de energia elétrica. O acionamento elétrico (via painel) é adicional e complementar ao acionamento mecânico." },
      ]}
      related={[
        { title: "Sistema de Supressão por CO₂", href: "/sistema-supressao-co2" },
        { title: "Detector de Gás GLP/GN", href: "/detector-gas" },
        { title: "Projeto de Exaustão", href: "/projeto-exaustao" },
        { title: "Alarme de Incêndio", href: "/alarme-incendio" },
        { title: "Vistoria e Laudo com ART", href: "/vistoria-laudo-art" },
      ]}
      cta={{
        heading: "Precisa de Sistema Saponificante para sua Cozinha?",
        sub: "Projetamos e instalamos sistemas saponificantes com intertravamento de gás e exaustão. Aprovação no Corpo de Bombeiros e ART incluídos. Atendemos BH, MG e todo o Brasil.",
      }}
    />
  );
}
