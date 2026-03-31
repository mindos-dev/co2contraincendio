import { Wrench, Shield, CheckCircle, FileCheck, Settings, Bell } from "lucide-react";
import ServicePageTemplate from "../../components/ServicePageTemplate";

export default function ManutencaoPreventiva() {
  return (
    <ServicePageTemplate
      meta={{
        title: "Manutenção Preventiva de Sistemas de Incêndio — CO₂ Contra Incêndio",
        description: "Contratos de manutenção preventiva e corretiva para sistemas de incêndio: CO₂, saponificante, hidrantes, alarmes e extintores. Relatórios técnicos e ART. Atendemos BH e todo o Brasil.",
        keywords: "manutenção preventiva incêndio, manutenção sistema incêndio, manutenção hidrante, manutenção alarme incêndio, manutenção CO2, contrato manutenção incêndio, Belo Horizonte",
      }}
      hero={{
        label: "Manutenção Preventiva",
        title: "Manutenção Preventiva de Sistemas de Incêndio",
        sub: "Contratos de manutenção preventiva e corretiva para todos os sistemas de proteção contra incêndio. Relatórios técnicos, laudos e ARTs incluídos. Atendemos BH e todo o Brasil.",
        bg: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1600&q=80",
      }}
      intro={{
        heading: "Por que a manutenção preventiva é obrigatória?",
        body: [
          "A manutenção preventiva dos sistemas de proteção contra incêndio não é apenas uma boa prática — é uma obrigação legal. As normas ABNT e as Instruções Técnicas do Corpo de Bombeiros estabelecem periodicidades mínimas de inspeção e manutenção para cada tipo de sistema.",
          "A CO₂ Contra Incêndio oferece contratos de manutenção preventiva e corretiva para sistemas de CO₂, saponificante, hidrantes, alarmes de incêndio, detectores de gás e extintores. Todos os serviços são documentados com relatórios técnicos e ARTs.",
          "Com um contrato de manutenção, sua empresa garante que os sistemas estarão operacionais quando necessário, evita autuações do Corpo de Bombeiros, mantém a validade do AVCB e reduz o risco de falhas em situações de emergência.",
          "Atendemos indústrias, hospitais, shoppings, restaurantes, hotéis e edificações comerciais em Belo Horizonte, Minas Gerais e todo o Brasil.",
        ],
      }}
      features={[
        { icon: <Wrench size={20} />, title: "Manutenção de Sistemas CO₂", desc: "Inspeção e pesagem de cilindros, verificação de válvulas solenóides, tubulação, difusores e painel de controle conforme NBR 12615." },
        { icon: <Shield size={20} />, title: "Manutenção de Sistema Saponificante", desc: "Inspeção semestral obrigatória do sistema saponificante com verificação do agente, bicos, detectores térmicos e intertravamentos." },
        { icon: <Settings size={20} />, title: "Manutenção de Hidrantes", desc: "Inspeção mensal, trimestral e anual do sistema de hidrantes conforme NBR 13714, incluindo teste de bomba e vazão." },
        { icon: <Bell size={20} />, title: "Manutenção de Alarmes", desc: "Teste semestral de todos os dispositivos do SDAI, verificação de bateria, limpeza de detectores e atualização de programação." },
        { icon: <FileCheck size={20} />, title: "Relatórios Técnicos", desc: "Relatórios técnicos detalhados após cada visita de manutenção com registro fotográfico e recomendações." },
        { icon: <CheckCircle size={20} />, title: "ART de Manutenção", desc: "Emissão de ART de manutenção por engenheiro habilitado no CREA/MG para atendimento às exigências do CBMMG." },
      ]}
      norms={[
        { code: "ABNT NBR 12615", title: "Manutenção — Sistema CO₂", excerpt: "Estabelece inspeção mensal visual, inspeção semestral detalhada e manutenção anual completa com pesagem dos cilindros de CO₂." },
        { code: "ABNT NBR 14095", title: "Manutenção — Sistema Saponificante", excerpt: "Exige inspeção semestral obrigatória do sistema saponificante, incluindo verificação do agente, bicos difusores e detectores térmicos." },
        { code: "ABNT NBR 13714", title: "Manutenção — Hidrantes", excerpt: "Estabelece inspeção mensal visual, teste trimestral de bomba e inspeção anual completa com teste de vazão e pressão." },
        { code: "ABNT NBR 17240", title: "Manutenção — Alarme de Incêndio", excerpt: "Exige inspeção mensal visual, teste semestral de todos os dispositivos e manutenção anual completa do SDAI." },
      ]}
      faqs={[
        { q: "Com que frequência devo fazer a manutenção dos sistemas de incêndio?", a: "A periodicidade varia por sistema: CO₂ (mensal/semestral/anual), saponificante (semestral), hidrantes (mensal/trimestral/anual), alarme (mensal/semestral/anual). Um contrato de manutenção preventiva garante que todas as periodicidades sejam cumpridas automaticamente." },
        { q: "A manutenção preventiva é obrigatória para renovar o AVCB?", a: "Sim. O Corpo de Bombeiros pode exigir comprovação de manutenção dos sistemas de incêndio para renovação do AVCB. Relatórios técnicos e ARTs de manutenção são documentos importantes para este processo." },
        { q: "O que acontece se o sistema de incêndio não for mantido?", a: "Além do risco de falha em situação de emergência, a falta de manutenção pode resultar em autuação pelo Corpo de Bombeiros, invalidação do AVCB, negativa de cobertura por seguradoras e responsabilização civil e criminal em caso de sinistro." },
        { q: "A CO₂ Contra Incêndio faz manutenção de sistemas instalados por outras empresas?", a: "Sim. Realizamos manutenção preventiva e corretiva em sistemas de qualquer fabricante e instalados por qualquer empresa. Fazemos a vistoria inicial para diagnóstico e elaboramos o plano de manutenção adequado." },
      ]}
      related={[
        { title: "Vistoria e Laudo com ART", href: "/vistoria-laudo-art" },
        { title: "Recarga de CO₂", href: "/recarga-co2" },
        { title: "Sistema de Supressão por CO₂", href: "/sistema-supressao-co2" },
        { title: "Sistema Saponificante", href: "/sistema-saponificante" },
      ]}
      cta={{
        heading: "Precisa de Contrato de Manutenção Preventiva?",
        sub: "Elaboramos planos de manutenção personalizados para todos os sistemas de incêndio com relatórios técnicos e ARTs. Atendemos BH, MG e todo o Brasil.",
      }}
    />
  );
}
