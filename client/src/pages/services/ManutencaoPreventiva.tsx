import { Wrench, Shield, CheckCircle, FileCheck, Settings, Bell, AlertTriangle, Calendar, ClipboardList } from "lucide-react";
import ServicePageTemplate from "../../components/ServicePageTemplate";

export default function ManutencaoPreventiva() {
  return (
    <ServicePageTemplate
      meta={{
        title: "Manutenção Preventiva de Sistemas de Incêndio — CO₂ Contra Incêndio | BH e MG",
        description: "Contratos de manutenção preventiva e corretiva para sistemas de incêndio: CO₂, saponificante (wet chemical), hidrantes, SDAI, detectores de gás e extintores. Relatórios técnicos, laudos e ART. Belo Horizonte e todo o Brasil.",
        keywords: "manutenção preventiva incêndio, manutenção sistema CO2, manutenção sistema saponificante, manutenção hidrante, manutenção SDAI, contrato manutenção incêndio, AVCB, NBR 12615, NBR 13714, NBR 17240, Belo Horizonte, Minas Gerais",
      }}
      hero={{
        label: "Manutenção Preventiva",
        title: "Manutenção Preventiva de Sistemas de Incêndio",
        sub: "Contratos de manutenção preventiva e corretiva para todos os sistemas de proteção contra incêndio. Relatórios técnicos, laudos e ARTs incluídos. Atendemos BH, MG e todo o Brasil.",
        bg: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1600&q=80",
      }}
      intro={{
        heading: "Manutenção Preventiva: obrigação legal e proteção real",
        body: [
          "A manutenção preventiva dos sistemas de proteção contra incêndio não é apenas uma boa prática de gestão — é uma obrigação legal estabelecida pelas normas ABNT NBR e pelas Instruções Técnicas do Corpo de Bombeiros de Minas Gerais (CBMMG). Sistemas sem manutenção regular perdem a eficácia, colocam vidas em risco e expõem a empresa a autuações, invalidação do AVCB e responsabilização civil e criminal em caso de sinistro.",
          "A CO₂ Contra Incêndio oferece contratos de manutenção preventiva e corretiva para todos os sistemas de proteção contra incêndio: supressão por CO₂, sistema saponificante (wet chemical), hidrantes e mangotinhos, Sistema de Detecção e Alarme de Incêndio (SDAI), detectores de gás GLP/GN e extintores portáteis e sobre-rodas. Cada visita gera um relatório técnico detalhado com registro fotográfico, recomendações e, quando exigido, ART de manutenção por engenheiro habilitado no CREA/MG.",
          "Com um contrato de manutenção, sua empresa garante que os sistemas estarão 100% operacionais quando necessário, mantém a validade do AVCB, atende às exigências de seguradoras e elimina o risco de falhas em emergências. Atendemos indústrias, hospitais, shoppings, restaurantes, hotéis, condomínios e edificações comerciais em Belo Horizonte, Minas Gerais e todo o Brasil.",
        ],
      }}
      features={[
        {
          icon: <Wrench size={20} />,
          title: "Manutenção de Sistemas CO₂",
          desc: "Inspeção mensal visual, inspeção semestral detalhada com pesagem dos cilindros, verificação de válvulas solenóides, tubulação, difusores e painel de controle conforme ABNT NBR 12615. Manutenção anual completa com emissão de ART.",
        },
        {
          icon: <Shield size={20} />,
          title: "Manutenção de Sistema Saponificante",
          desc: "Inspeção semestral obrigatória do sistema saponificante (wet chemical) com verificação do nível e qualidade do agente, bicos difusores, detectores térmicos, acionamento automático e manual, integração com corte de gás. Conforme ABNT NBR 14095 e UL 300.",
        },
        {
          icon: <Settings size={20} />,
          title: "Manutenção de Hidrantes",
          desc: "Inspeção mensal visual, teste trimestral de bomba de incêndio (principal e reserva), inspeção anual completa com teste de vazão e pressão em todos os pontos, verificação de mangueiras, esguichos e registros. Conforme ABNT NBR 13714.",
        },
        {
          icon: <Bell size={20} />,
          title: "Manutenção de SDAI",
          desc: "Inspeção mensal visual, teste semestral de todos os dispositivos (detectores, acionadores manuais, sirenes, strobes), verificação de bateria de backup, limpeza de detectores e atualização de programação da central. Conforme ABNT NBR 17240.",
        },
        {
          icon: <AlertTriangle size={20} />,
          title: "Manutenção de Detectores de Gás",
          desc: "Calibração e teste semestral de detectores de gás GLP e GN, verificação de solenóide de corte automático, teste de alarme e integração com o sistema de ventilação. Conforme ABNT NBR 15526.",
        },
        {
          icon: <FileCheck size={20} />,
          title: "Manutenção de Extintores",
          desc: "Inspeção mensal visual, manutenção anual completa com recarga, teste hidrostático quinquenal e substituição de componentes conforme ABNT NBR 12962. Etiqueta de identificação com data da próxima manutenção.",
        },
        {
          icon: <Calendar size={20} />,
          title: "Gestão de Periodicidades",
          desc: "Controle automatizado de todas as periodicidades de manutenção via OPERIS: alertas automáticos de vencimento, agendamento de visitas e histórico completo de todas as manutenções realizadas.",
        },
        {
          icon: <ClipboardList size={20} />,
          title: "Relatórios e ARTs",
          desc: "Relatório técnico detalhado após cada visita com registro fotográfico, checklist de verificação, não-conformidades identificadas e recomendações. ART de manutenção por engenheiro habilitado quando exigido.",
        },
        {
          icon: <CheckCircle size={20} />,
          title: "Suporte Corretivo",
          desc: "Atendimento corretivo prioritário para clientes com contrato de manutenção preventiva. Diagnóstico e reparo de falhas com reposição de componentes e emissão de relatório técnico.",
        },
      ]}
      norms={[
        {
          code: "ABNT NBR 12615",
          title: "Sistema de extinção de incêndio por CO₂",
          excerpt: "Estabelece inspeção mensal visual dos cilindros e componentes, inspeção semestral detalhada com pesagem dos cilindros (descarte se perda > 10%), e manutenção anual completa com verificação de todos os componentes do sistema.",
        },
        {
          code: "ABNT NBR 14095",
          title: "Sistema de extinção de incêndio por agente saponificante",
          excerpt: "Exige inspeção semestral obrigatória do sistema saponificante, incluindo verificação do nível e qualidade do agente extintor, bicos difusores, detectores térmicos, acionamento automático e manual, e integração com o sistema de corte de gás.",
        },
        {
          code: "ABNT NBR 13714",
          title: "Sistemas de hidrantes e de mangotinhos para combate a incêndio",
          excerpt: "Estabelece inspeção mensal visual, teste trimestral da bomba de incêndio (principal e reserva), e inspeção anual completa com teste de vazão e pressão em todos os pontos de hidrante e mangotinho da edificação.",
        },
        {
          code: "ABNT NBR 17240",
          title: "Sistemas de detecção e alarme de incêndio",
          excerpt: "Exige inspeção mensal visual de todos os dispositivos, teste semestral funcional completo (detectores, acionadores manuais, sirenes, strobes, central de alarme), e manutenção anual com limpeza, calibração e atualização de programação.",
        },
        {
          code: "ABNT NBR 12962",
          title: "Extintores de incêndio — Inspeção e manutenção",
          excerpt: "Estabelece inspeção mensal visual, manutenção anual completa com recarga e substituição de componentes, e teste hidrostático obrigatório a cada 5 anos para cilindros de aço e a cada 3 anos para cilindros de alumínio.",
        },
        {
          code: "IT CBMMG",
          title: "Instruções Técnicas do Corpo de Bombeiros de Minas Gerais",
          excerpt: "As Instruções Técnicas do CBMMG estabelecem os requisitos mínimos de manutenção para cada tipo de sistema de proteção contra incêndio, exigindo documentação técnica (relatórios e ARTs) para renovação do AVCB.",
        },
      ]}
      process={[
        { step: "01", title: "Vistoria Diagnóstica", desc: "Realizamos uma vistoria técnica inicial para mapear todos os sistemas existentes, identificar não-conformidades e elaborar o plano de manutenção personalizado." },
        { step: "02", title: "Proposta de Contrato", desc: "Apresentamos proposta de contrato com escopo detalhado, periodicidades, entregáveis (relatórios, ARTs) e investimento mensal ou anual." },
        { step: "03", title: "Execução das Visitas", desc: "Realizamos as visitas de manutenção conforme o cronograma contratado, com equipe técnica especializada e equipamentos calibrados." },
        { step: "04", title: "Relatório Técnico", desc: "Após cada visita, entregamos relatório técnico detalhado com checklist, registro fotográfico, não-conformidades e recomendações." },
        { step: "05", title: "Gestão via OPERIS", desc: "Todos os dados de manutenção são registrados na OPERIS, com alertas automáticos de vencimento e histórico completo acessível a qualquer momento." },
      ]}
      faqs={[
        {
          q: "Com que frequência devo fazer a manutenção dos sistemas de incêndio?",
          a: "A periodicidade varia por sistema. Sistema CO₂: inspeção mensal visual, semestral detalhada e anual completa. Sistema saponificante: inspeção semestral. Hidrantes: inspeção mensal, teste trimestral de bomba e inspeção anual completa. SDAI: inspeção mensal e teste semestral. Extintores: inspeção mensal e manutenção anual. Um contrato de manutenção preventiva garante que todas as periodicidades sejam cumpridas automaticamente.",
        },
        {
          q: "A manutenção preventiva é obrigatória para renovar o AVCB?",
          a: "Sim. O Corpo de Bombeiros de Minas Gerais exige comprovação de manutenção dos sistemas de incêndio para renovação do AVCB. Relatórios técnicos e ARTs de manutenção são documentos obrigatórios neste processo. A falta de manutenção pode resultar na não-renovação do AVCB e na interdição do estabelecimento.",
        },
        {
          q: "O que acontece se o sistema de incêndio não for mantido?",
          a: "Além do risco de falha em situação de emergência — o que pode custar vidas —, a falta de manutenção pode resultar em: autuação e multa pelo Corpo de Bombeiros, invalidação do AVCB, negativa de cobertura por seguradoras em caso de sinistro, e responsabilização civil e criminal do proprietário e do responsável técnico.",
        },
        {
          q: "A CO₂ Contra Incêndio faz manutenção de sistemas instalados por outras empresas?",
          a: "Sim. Realizamos manutenção preventiva e corretiva em sistemas de qualquer fabricante e instalados por qualquer empresa. Realizamos a vistoria diagnóstica inicial para mapear o estado atual dos sistemas e elaboramos o plano de manutenção adequado.",
        },
        {
          q: "Vocês emitem ART de manutenção?",
          a: "Sim. Emitimos ART de manutenção por engenheiro habilitado no CREA/MG para todos os serviços que exigem documentação técnica formal, como manutenção anual de sistemas CO₂, saponificante e hidrantes. A ART é exigida pelo CBMMG para renovação do AVCB.",
        },
        {
          q: "Como funciona o contrato de manutenção preventiva?",
          a: "O contrato é elaborado após a vistoria diagnóstica inicial. Ele define o escopo dos sistemas a serem mantidos, as periodicidades de cada visita, os entregáveis (relatórios, ARTs), o prazo de atendimento corretivo e o investimento mensal ou anual. O contrato pode ser rescindido com aviso prévio de 30 dias.",
        },
      ]}
      related={[
        { title: "Vistoria e Laudo com ART", href: "/vistoria-laudo-art" },
        { title: "Recarga de CO₂", href: "/recarga-co2" },
        { title: "Sistema de Supressão por CO₂", href: "/sistema-supressao-co2" },
        { title: "Sistema Saponificante (Wet Chemical)", href: "/sistema-saponificante" },
        { title: "Projetos de Proteção Contra Incêndio", href: "/projetos" },
      ]}
      cta={{
        heading: "Precisa de Contrato de Manutenção Preventiva?",
        sub: "Elaboramos planos de manutenção personalizados para todos os sistemas de incêndio com relatórios técnicos e ARTs. Atendemos BH, MG e todo o Brasil.",
      }}
    />
  );
}
