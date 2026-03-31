import { Droplets, Shield, Settings, CheckCircle, Wrench, FileCheck } from "lucide-react";
import ServicePageTemplate from "../../components/ServicePageTemplate";

export default function Hidrantes() {
  return (
    <ServicePageTemplate
      meta={{
        title: "Sistema de Hidrantes e Mangotinhos — NBR 13714 | CO₂ Contra Incêndio",
        description: "Projeto, instalação e manutenção de sistemas de hidrantes e mangotinhos conforme ABNT NBR 13714. Atendemos edificações comerciais, industriais e hospitalares em BH e todo o Brasil.",
        keywords: "sistema hidrantes, mangotinhos, NBR 13714, hidrante predial, hidrante urbano, bomba incêndio, reservatório incêndio, AVCB hidrante, Belo Horizonte",
      }}
      hero={{
        label: "Hidrantes e Mangotinhos",
        title: "Sistema de Hidrantes e Mangotinhos",
        sub: "Projeto, instalação e manutenção de sistemas de hidrantes e mangotinhos conforme ABNT NBR 13714. Solução para edificações comerciais, industriais e hospitalares.",
        bg: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80",
      }}
      intro={{
        heading: "Sistema de Hidrantes: proteção ativa para edificações",
        body: [
          "O sistema de hidrantes e mangotinhos é um dos principais sistemas de proteção ativa contra incêndio em edificações. Consiste em uma rede hidráulica pressurizada com pontos de tomada d'água estrategicamente posicionados para combate a incêndios pela brigada ou pelo Corpo de Bombeiros.",
          "A CO₂ Contra Incêndio projeta e instala sistemas de hidrantes e mangotinhos para edificações comerciais, industriais, hospitalares, shoppings e condomínios em Belo Horizonte, Minas Gerais e todo o Brasil.",
          "Nossos projetos contemplam o dimensionamento hidráulico completo, incluindo reservatório de incêndio (RI), bomba de incêndio, bomba de pressurização (jockey), tubulação, abrigos, mangueiras, esguichos e sinalização conforme ABNT NBR 13714.",
          "Todos os projetos são elaborados por engenheiros habilitados no CREA/MG com emissão de ART, aprovados pelo Corpo de Bombeiros Militar de Minas Gerais.",
        ],
      }}
      features={[
        { icon: <Droplets size={20} />, title: "Hidrantes de Coluna e de Parede", desc: "Instalação de hidrantes de coluna (externos) e de parede (internos) com mangueiras, esguichos e abrigos conforme NBR 13714." },
        { icon: <Shield size={20} />, title: "Mangotinhos", desc: "Sistemas de mangotinhos com mangueira semi-rígida de 25mm para uso pela brigada de incêndio em edificações de menor porte." },
        { icon: <Settings size={20} />, title: "Bomba de Incêndio", desc: "Dimensionamento e instalação de bomba de incêndio principal, bomba reserva e bomba jockey para manutenção da pressão." },
        { icon: <Wrench size={20} />, title: "Reservatório de Incêndio", desc: "Cálculo do volume do reservatório de incêndio (RI) conforme NBR 13714, separado do reservatório doméstico." },
        { icon: <FileCheck size={20} />, title: "Projeto Executivo + ART", desc: "Projeto hidráulico completo com memorial de cálculo, plantas baixas, isométrico e ART de engenheiro habilitado no CREA/MG." },
        { icon: <CheckCircle size={20} />, title: "Aprovação no CBMMG", desc: "Protocolo e acompanhamento da aprovação do projeto junto ao Corpo de Bombeiros Militar de Minas Gerais para obtenção do AVCB." },
      ]}
      norms={[
        { code: "ABNT NBR 13714", title: "Sistemas de hidrantes e de mangotinhos para combate a incêndio", excerpt: "Esta norma especifica os requisitos mínimos exigíveis para dimensionamento, instalação, manutenção, aceitação e manuseio, bem como as características mínimas dos componentes dos sistemas de hidrantes e de mangotinhos para combate a incêndio." },
        { code: "ABNT NBR 5626", title: "Instalação predial de água fria", excerpt: "Estabelece as condições exigíveis para o projeto e execução de instalações prediais de água fria, incluindo os sistemas de combate a incêndio." },
        { code: "IT-22 CBMMG", title: "Sistemas de hidrantes e mangotinhos", excerpt: "Instrução Técnica do Corpo de Bombeiros Militar de Minas Gerais que estabelece os requisitos para aprovação de sistemas de hidrantes e mangotinhos." },
        { code: "ABNT NBR 14276", title: "Brigada de incêndio — Requisitos", excerpt: "Estabelece os requisitos para a brigada de incêndio, incluindo o treinamento para uso de hidrantes e mangotinhos." },
      ]}
      process={[
        { step: "01", title: "Levantamento Técnico", desc: "Análise da edificação, ocupação, área construída e definição da classe do sistema conforme NBR 13714." },
        { step: "02", title: "Projeto Hidráulico + ART", desc: "Dimensionamento da rede, reservatório, bombas e pontos de hidrante. Memorial de cálculo e plantas executivas." },
        { step: "03", title: "Aprovação CBMMG", desc: "Protocolo e aprovação do projeto junto ao Corpo de Bombeiros para obtenção do AVCB." },
        { step: "04", title: "Instalação", desc: "Execução da rede hidráulica, instalação de bombas, abrigos, mangueiras, esguichos e sinalização." },
        { step: "05", title: "Testes Hidrostáticos", desc: "Testes de pressão e vazão conforme NBR 13714 para verificação da integridade do sistema." },
        { step: "06", title: "Documentação Final", desc: "Entrega de relatório de testes, as-built, manual de operação e certificados." },
      ]}
      faqs={[
        { q: "Qual edificação é obrigada a ter hidrantes?", a: "A obrigatoriedade varia conforme a Instrução Técnica do CBMMG, considerando a ocupação, área construída e altura da edificação. Em geral, edificações comerciais acima de 750m², industriais acima de 2.500m² e edificações com mais de 12m de altura são obrigadas a ter sistema de hidrantes." },
        { q: "Qual a diferença entre hidrante e mangotinho?", a: "O hidrante utiliza mangueira de 38mm ou 63mm acoplada na hora do combate, sendo operado pela brigada ou Bombeiros. O mangotinho utiliza mangueira semi-rígida de 25mm permanentemente acoplada, de operação mais simples, indicado para edificações de menor porte ou como complemento ao sistema de hidrantes." },
        { q: "O reservatório de incêndio pode ser o mesmo da água doméstica?", a: "Não. A ABNT NBR 13714 exige que o volume de reserva técnica de incêndio (RTI) seja separado do volume doméstico, com dispositivo que impeça o uso da RTI para fins domésticos." },
        { q: "Com que frequência o sistema de hidrantes precisa de manutenção?", a: "A NBR 13714 exige inspeção mensal visual, inspeção trimestral com acionamento da bomba e inspeção anual completa com teste de vazão e pressão. As mangueiras devem ser inspecionadas semestralmente e substituídas conforme necessário." },
      ]}
      related={[
        { title: "Sistema de Supressão por CO₂", href: "/sistema-supressao-co2" },
        { title: "Alarme de Incêndio", href: "/alarme-incendio" },
        { title: "Vistoria e Laudo com ART", href: "/vistoria-laudo-art" },
        { title: "Manutenção Preventiva", href: "/manutencao-preventiva" },
      ]}
      cta={{
        heading: "Precisa de Sistema de Hidrantes?",
        sub: "Elaboramos o projeto completo com ART, aprovamos no Corpo de Bombeiros e executamos a instalação. Atendemos Belo Horizonte, Minas Gerais e todo o Brasil.",
      }}
    />
  );
}
