import { Bell, Shield, Zap, Settings, CheckCircle, AlertTriangle } from "lucide-react";
import ServicePageTemplate from "../../components/ServicePageTemplate";

export default function AlarmeIncendio() {
  return (
    <ServicePageTemplate
      meta={{
        title: "Sistema de Alarme de Incêndio SDAI — NBR 17240 | CO₂ Contra Incêndio",
        description: "Instalação de SDAI convencional e endereçável com detectores de fumaça, acionadores manuais, sirenes e centrais de alarme. Conforme ABNT NBR 17240. Atendemos BH e todo o Brasil.",
        keywords: "alarme incêndio, SDAI, detector fumaça, detector óptico, central alarme incêndio, alarme endereçável, acionador manual, sirene incêndio, NBR 17240, Belo Horizonte",
      }}
      hero={{
        label: "Alarme de Incêndio",
        title: "Sistema de Detecção e Alarme de Incêndio",
        sub: "SDAI convencional e endereçável com detectores de fumaça, calor e chama. Acionadores manuais, sirenes e centrais de alarme conforme ABNT NBR 17240.",
        bg: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80",
      }}
      intro={{
        heading: "Sistema de Detecção e Alarme de Incêndio (SDAI)",
        body: [
          "O Sistema de Detecção e Alarme de Incêndio (SDAI) é o primeiro nível de proteção ativa contra incêndio em edificações. Sua função é detectar o incêndio em fase incipiente e alertar os ocupantes para evacuação, acionando automaticamente outros sistemas de proteção.",
          "A CO₂ Contra Incêndio projeta e instala sistemas convencionais e endereçáveis para indústrias, hospitais, shoppings, hotéis, escolas e edificações residenciais em Belo Horizonte, Minas Gerais e todo o Brasil.",
          "Nos sistemas endereçáveis, cada detector possui um endereço único na rede, permitindo identificar com precisão o ponto de detecção na central de alarme. Nos sistemas convencionais, os detectores são agrupados por zonas.",
          "Trabalhamos com as principais marcas do mercado: Segurimax, Intelbras, Bosch e outras. Todos os projetos são elaborados conforme ABNT NBR 17240 por engenheiros habilitados no CREA/MG.",
        ],
      }}
      features={[
        { icon: <Bell size={20} />, title: "Detectores Ópticos de Fumaça", desc: "Detectores ópticos de fumaça por dispersão de luz para detecção precoce de incêndios com combustão lenta e produção de fumaça." },
        { icon: <AlertTriangle size={20} />, title: "Detectores Termovelocimétricos", desc: "Detectores de calor por taxa de variação de temperatura para ambientes com fumaça normal (cozinhas, garagens)." },
        { icon: <Zap size={20} />, title: "Detectores de Chama", desc: "Detectores ultravioleta/infravermelho para detecção de chamas em ambientes industriais com combustíveis líquidos." },
        { icon: <Settings size={20} />, title: "Central de Alarme Endereçável", desc: "Central microprocessada com identificação individual de cada ponto de detecção, histórico de eventos e integração com outros sistemas." },
        { icon: <Shield size={20} />, title: "Acionadores Manuais", desc: "Acionadores manuais (quebra-vidro) posicionados nas rotas de fuga para acionamento manual do alarme." },
        { icon: <CheckCircle size={20} />, title: "Sirenes e Strobes", desc: "Dispositivos de notificação sonora e visual para alerta dos ocupantes em caso de incêndio." },
      ]}
      norms={[
        { code: "ABNT NBR 17240", title: "Sistemas de detecção e alarme de incêndio", excerpt: "Esta norma especifica os requisitos mínimos para projeto, instalação, comissionamento, manutenção e testes de sistemas de detecção e alarme de incêndio em edificações." },
        { code: "ABNT NBR 9441", title: "Execução de sistemas de detecção e alarme de incêndio", excerpt: "Estabelece as condições exigíveis para execução de sistemas de detecção e alarme de incêndio, incluindo os requisitos para detectores, centrais e dispositivos de notificação." },
        { code: "IT-19 CBMMG", title: "Sistema de detecção e alarme de incêndio", excerpt: "Instrução Técnica do CBMMG que estabelece os requisitos para aprovação de sistemas de detecção e alarme de incêndio junto ao Corpo de Bombeiros Militar de Minas Gerais." },
        { code: "NFPA 72", title: "National Fire Alarm and Signaling Code", excerpt: "This code covers the application, installation, location, performance, inspection, testing, and maintenance of fire alarm systems, supervising station alarm systems, and emergency communications systems." },
      ]}
      process={[
        { step: "01", title: "Análise da Edificação", desc: "Levantamento da planta, ocupação, riscos específicos e definição do tipo de sistema (convencional ou endereçável)." },
        { step: "02", title: "Projeto + ART", desc: "Posicionamento de detectores, acionadores, sirenes e central conforme NBR 17240. Plantas executivas e memorial descritivo." },
        { step: "03", title: "Aprovação CBMMG", desc: "Protocolo e aprovação do projeto junto ao Corpo de Bombeiros para obtenção do AVCB." },
        { step: "04", title: "Instalação", desc: "Passagem de cabeamento, instalação de detectores, acionadores, sirenes e central de alarme." },
        { step: "05", title: "Comissionamento", desc: "Programação da central, endereçamento dos dispositivos, testes de todos os pontos e verificação de zonas." },
        { step: "06", title: "Treinamento", desc: "Treinamento da brigada para operação da central de alarme e procedimentos de evacuação." },
      ]}
      videoId="RBRzDIe9LBM"
      videoTitle="Instalação e configuração de alarme de incêndio endereçável COMPACT Segurimax — demonstração completa do sistema."
      faqs={[
        { q: "Qual a diferença entre sistema convencional e endereçável?", a: "No sistema convencional, os detectores são agrupados por zonas e a central indica apenas a zona em alarme. No sistema endereçável, cada detector tem um endereço único e a central indica exatamente qual dispositivo foi acionado, facilitando a localização do incêndio em edificações grandes." },
        { q: "Quais edificações são obrigadas a ter SDAI?", a: "A obrigatoriedade varia conforme a Instrução Técnica do CBMMG. Em geral, edificações de uso coletivo acima de determinada área ou altura, hospitais, hotéis, shoppings, indústrias e edificações com ocupações especiais são obrigadas a ter SDAI." },
        { q: "O detector de fumaça residencial é o mesmo do industrial?", a: "Não. Os detectores residenciais são autônomos com bateria e não fazem parte de um sistema integrado. Os detectores industriais e comerciais são conectados a uma central de alarme, possuem supervisão contínua e atendem às normas técnicas para edificações." },
        { q: "Com que frequência o sistema de alarme precisa de manutenção?", a: "A ABNT NBR 17240 exige inspeção mensal visual, teste semestral de todos os dispositivos e manutenção anual completa. A bateria da central deve ser verificada semestralmente e substituída conforme especificação do fabricante." },
      ]}
      related={[
        { title: "Detector de Gás GLP/GN", href: "/detector-gas" },
        { title: "Sistema de Supressão por CO₂", href: "/sistema-supressao-co2" },
        { title: "Hidrantes e Mangotinhos", href: "/hidrantes" },
        { title: "Vistoria e Laudo com ART", href: "/vistoria-laudo-art" },
        { title: "Manutenção Preventiva", href: "/manutencao-preventiva" },
      ]}
      cta={{
        heading: "Precisa de Sistema de Alarme de Incêndio?",
        sub: "Projetamos e instalamos SDAI convencional e endereçável com aprovação no Corpo de Bombeiros. Atendemos BH, Minas Gerais e todo o Brasil.",
      }}
    />
  );
}
