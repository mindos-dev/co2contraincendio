import { Wind, Settings, Shield, CheckCircle, Wrench, FileCheck } from "lucide-react";
import ServicePageTemplate from "../../components/ServicePageTemplate";

export default function ProjetoExaustao() {
  return (
    <ServicePageTemplate
      meta={{
        title: "Projeto de Exaustão para Cozinhas Industriais — Damper e Ventilação",
        description: "Projetos de exaustão mecânica para cozinhas industriais com dampers corta-fogo, integração ao sistema de incêndio e gás. Conforme ABNT NBR e normas do Corpo de Bombeiros. BH e Brasil.",
        keywords: "projeto exaustão cozinha industrial, damper corta-fogo, exaustão mecânica, ventilação cozinha, duto exaustão, damper incêndio, exaustor cozinha industrial, Belo Horizonte",
      }}
      hero={{
        label: "Projeto de Exaustão",
        title: "Projeto de Exaustão para Cozinhas Industriais",
        sub: "Projetos de exaustão mecânica com dampers corta-fogo integrados ao sistema de incêndio e gás. Solução completa para cozinhas industriais, restaurantes e shoppings.",
        bg: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=80",
      }}
      intro={{
        heading: "Exaustão integrada ao sistema de segurança contra incêndio",
        body: [
          "O projeto de exaustão mecânica para cozinhas industriais vai muito além da ventilação. Ele deve ser integrado ao sistema de proteção contra incêndio, incluindo dampers corta-fogo nos dutos, intertravamento com o sistema saponificante e com a solenóide de corte de gás.",
          "A CO₂ Contra Incêndio elabora projetos de exaustão mecânica para cozinhas industriais, restaurantes, shoppings e indústrias, com foco na integração com os sistemas de segurança contra incêndio. Atendemos Belo Horizonte, Minas Gerais e todo o Brasil.",
          "O damper corta-fogo é um componente crítico do sistema: instalado nos dutos de exaustão, ele fecha automaticamente quando o sistema saponificante é acionado, impedindo a propagação do incêndio pelo duto para outras áreas da edificação.",
          "Nossos projetos incluem o dimensionamento do exaustor, dutos, coifa, dampers, make-up air (ar de reposição) e toda a integração com os sistemas de incêndio e gás, com elaboração de projeto executivo e ART.",
        ],
      }}
      features={[
        { icon: <Wind size={20} />, title: "Dimensionamento de Exaustão", desc: "Cálculo da vazão de ar necessária conforme o tipo e quantidade de equipamentos de cocção, área da coifa e características do ambiente." },
        { icon: <Settings size={20} />, title: "Dampers Corta-Fogo", desc: "Especificação e instalação de dampers corta-fogo nos dutos de exaustão para contenção do incêndio conforme normas do CBMMG." },
        { icon: <Shield size={20} />, title: "Integração com Sistema de Incêndio", desc: "Intertravamento do sistema de exaustão com o sistema saponificante: fechamento automático dos dampers quando o sistema é acionado." },
        { icon: <Wrench size={20} />, title: "Make-up Air (Ar de Reposição)", desc: "Projeto do sistema de ar de reposição para compensar o ar extraído pela exaustão, garantindo o equilíbrio de pressão da cozinha." },
        { icon: <FileCheck size={20} />, title: "Projeto Executivo + ART", desc: "Projeto executivo completo com plantas, cortes, especificações técnicas e ART de engenheiro habilitado no CREA/MG." },
        { icon: <CheckCircle size={20} />, title: "Aprovação no CBMMG", desc: "Protocolo e acompanhamento da aprovação do projeto de exaustão junto ao Corpo de Bombeiros Militar de Minas Gerais." },
      ]}
      norms={[
        { code: "ABNT NBR 16401", title: "Instalações de ar-condicionado — Sistemas centrais e unitários", excerpt: "Estabelece os requisitos para projetos de sistemas de ar-condicionado e ventilação, incluindo dutos e exaustão em edificações." },
        { code: "IT-21 CBMMG", title: "Controle de fumaça em edificações", excerpt: "Instrução Técnica do CBMMG que estabelece os requisitos para sistemas de controle de fumaça, incluindo dampers e exaustão em cozinhas industriais." },
        { code: "ABNT NBR 14095", title: "Sistema saponificante — Intertravamento", excerpt: "Exige o intertravamento do sistema saponificante com o sistema de exaustão (dampers) para fechamento automático dos dutos em caso de acionamento." },
        { code: "ANVISA RDC 216/2004", title: "Boas Práticas para Serviços de Alimentação", excerpt: "Estabelece os requisitos de ventilação e exaustão para cozinhas de serviços de alimentação, incluindo a necessidade de sistema de exaustão adequado." },
      ]}
      process={[
        { step: "01", title: "Levantamento dos Equipamentos", desc: "Mapeamento de todos os equipamentos de cocção, dimensões da cozinha, coifa existente e características do duto de exaustão." },
        { step: "02", title: "Cálculo de Exaustão", desc: "Dimensionamento da vazão de ar, seleção do exaustor, dimensionamento dos dutos e especificação dos dampers corta-fogo." },
        { step: "03", title: "Projeto Integrado + ART", desc: "Elaboração do projeto executivo integrando exaustão, sistema saponificante e detector de gás com intertravamentos." },
        { step: "04", title: "Aprovação CBMMG", desc: "Protocolo e aprovação do projeto junto ao Corpo de Bombeiros Militar de Minas Gerais." },
        { step: "05", title: "Instalação", desc: "Execução da rede de dutos, instalação do exaustor, dampers, make-up air e conexões com os sistemas de incêndio e gás." },
        { step: "06", title: "Testes e Comissionamento", desc: "Medição de vazão, verificação dos intertravamentos e entrega da documentação técnica completa." },
      ]}
      faqs={[
        { q: "O damper corta-fogo é obrigatório em cozinhas industriais?", a: "Sim. O Corpo de Bombeiros exige dampers corta-fogo nos dutos de exaustão que atravessam paredes ou lajes corta-fogo. Em cozinhas industriais com sistema saponificante, os dampers devem ser intertravados com o sistema para fechamento automático em caso de acionamento." },
        { q: "Qual a diferença entre exaustor e damper?", a: "O exaustor é o equipamento que promove a circulação do ar, extraindo o ar quente e gorduroso da cozinha. O damper é um dispositivo instalado no duto que fecha automaticamente em caso de incêndio, impedindo a propagação do fogo e da fumaça pelo duto." },
        { q: "O projeto de exaustão precisa de ART?", a: "Sim. O projeto de exaustão para cozinhas industriais é um projeto de engenharia que exige ART de engenheiro habilitado no CREA/MG. A ART é necessária para aprovação no Corpo de Bombeiros e para obtenção do AVCB." },
        { q: "A exaustão da cozinha afeta o sistema de ar-condicionado?", a: "Sim. O sistema de exaustão extrai ar da cozinha, criando pressão negativa que pode afetar o funcionamento do ar-condicionado e das portas. Por isso, o projeto deve incluir o sistema de make-up air (ar de reposição) para compensar o ar extraído." },
      ]}
      related={[
        { title: "Sistema Saponificante", href: "/sistema-saponificante" },
        { title: "Detector de Gás GLP/GN", href: "/detector-gas" },
        { title: "Vistoria e Laudo com ART", href: "/vistoria-laudo-art" },
        { title: "Manutenção Preventiva", href: "/manutencao-preventiva" },
      ]}
      cta={{
        heading: "Precisa de Projeto de Exaustão para Cozinha Industrial?",
        sub: "Elaboramos projetos de exaustão integrados ao sistema de incêndio e gás com aprovação no Corpo de Bombeiros. Atendemos BH, MG e todo o Brasil.",
      }}
    />
  );
}
