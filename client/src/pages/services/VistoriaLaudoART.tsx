import { FileCheck, Shield, CheckCircle, Wrench, AlertTriangle, Settings } from "lucide-react";
import ServicePageTemplate from "../../components/ServicePageTemplate";

export default function VistoriaLaudoART() {
  return (
    <ServicePageTemplate
      meta={{
        title: "Vistoria e Laudo Técnico com ART para AVCB — CO₂ Contra Incêndio",
        description: "Elaboramos laudos técnicos com ART para obtenção e renovação do AVCB (Auto de Vistoria do Corpo de Bombeiros) em Belo Horizonte e Minas Gerais. Engenheiros habilitados no CREA/MG.",
        keywords: "vistoria incêndio, laudo técnico incêndio, ART incêndio, AVCB, Auto de Vistoria Corpo de Bombeiros, renovação AVCB, laudo CREA, vistoria BH, vistoria Minas Gerais",
      }}
      hero={{
        label: "Vistoria e Laudo com ART",
        title: "Vistoria Técnica e Laudo com ART para AVCB",
        sub: "Elaboramos laudos técnicos com Anotação de Responsabilidade Técnica (ART) para obtenção e renovação do Auto de Vistoria do Corpo de Bombeiros em Belo Horizonte e Minas Gerais.",
        bg: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80",
      }}
      intro={{
        heading: "Laudo Técnico com ART: o caminho para o AVCB",
        body: [
          "O Auto de Vistoria do Corpo de Bombeiros (AVCB) é o documento que atesta que uma edificação atende às normas de segurança contra incêndio. Para obtê-lo ou renová-lo, é necessário apresentar projetos técnicos aprovados, laudos de conformidade e Anotações de Responsabilidade Técnica (ART) de engenheiro habilitado.",
          "A CO₂ Contra Incêndio oferece o serviço completo de vistoria técnica, elaboração de laudos e emissão de ARTs para todos os sistemas de prevenção e combate a incêndio. Atendemos edificações comerciais, industriais, hospitalares e residenciais em Belo Horizonte e em todo o estado de Minas Gerais.",
          "Nossa equipe de engenheiros realiza a vistoria completa da edificação, identifica as não-conformidades, elabora o plano de adequação e acompanha todo o processo junto ao Corpo de Bombeiros até a emissão do AVCB.",
          "Também realizamos laudos para renovação de AVCB vencido, laudos de conformidade para seguradoras e laudos para regularização de edificações existentes.",
        ],
      }}
      features={[
        { icon: <FileCheck size={20} />, title: "Laudo Técnico Completo", desc: "Elaboração de laudo técnico descritivo de todos os sistemas de incêndio da edificação com registro fotográfico e identificação de não-conformidades." },
        { icon: <Shield size={20} />, title: "ART no CREA/MG", desc: "Emissão de Anotação de Responsabilidade Técnica (ART) por engenheiro habilitado no CREA/MG para todos os sistemas de incêndio." },
        { icon: <CheckCircle size={20} />, title: "Acompanhamento no CBMMG", desc: "Protocolo, acompanhamento e negociação junto ao Corpo de Bombeiros Militar de Minas Gerais até a emissão do AVCB." },
        { icon: <AlertTriangle size={20} />, title: "Identificação de Não-Conformidades", desc: "Relatório detalhado das não-conformidades encontradas com plano de adequação e cronograma de execução." },
        { icon: <Wrench size={20} />, title: "Adequação dos Sistemas", desc: "Execução das adequações necessárias nos sistemas de incêndio para atendimento às normas e aprovação no CBMMG." },
        { icon: <Settings size={20} />, title: "Laudos para Seguradoras", desc: "Elaboração de laudos técnicos específicos para seguradoras com avaliação do risco de incêndio da edificação." },
      ]}
      norms={[
        { code: "Lei 14.130/2021", title: "Lei Federal de Segurança contra Incêndio", excerpt: "Estabelece normas gerais sobre prevenção e combate a incêndio e a emergências, incluindo a obrigatoriedade do AVCB para edificações de uso coletivo." },
        { code: "Decreto 44.746/2008 MG", title: "Regulamento de Segurança contra Incêndio de MG", excerpt: "Regulamenta a Lei Estadual de Segurança contra Incêndio de Minas Gerais, estabelecendo os requisitos para obtenção e renovação do AVCB." },
        { code: "IT-01 CBMMG", title: "Procedimentos administrativos", excerpt: "Instrução Técnica do CBMMG que estabelece os procedimentos para aprovação de projetos e obtenção do AVCB em Minas Gerais." },
        { code: "Resolução CREA-MG", title: "Responsabilidade Técnica — ART", excerpt: "Regulamenta a emissão de Anotações de Responsabilidade Técnica (ART) para projetos e serviços de engenharia em sistemas de incêndio." },
      ]}
      faqs={[
        { q: "O que é o AVCB e quem precisa ter?", a: "O AVCB (Auto de Vistoria do Corpo de Bombeiros) é o documento que atesta que a edificação atende às normas de segurança contra incêndio. É obrigatório para edificações de uso coletivo como comércio, indústria, hospitais, hotéis, shoppings, escolas e edificações residenciais acima de determinada altura ou área." },
        { q: "O que acontece se meu AVCB vencer?", a: "O AVCB tem validade de 1 a 3 anos dependendo da ocupação. Com o AVCB vencido, a edificação fica irregular perante o Corpo de Bombeiros, podendo ser autuada e interditada. Seguradoras também podem negar cobertura para edificações sem AVCB válido." },
        { q: "Quanto tempo leva para obter o AVCB?", a: "O prazo varia conforme a complexidade da edificação e a demanda do CBMMG. Em geral, após a aprovação de todos os projetos e execução das adequações, o processo de vistoria e emissão do AVCB leva de 30 a 90 dias." },
        { q: "A CO₂ Contra Incêndio pode regularizar uma edificação existente?", a: "Sim. Realizamos a vistoria completa, identificamos as não-conformidades, elaboramos o plano de adequação, executamos as obras necessárias e acompanhamos todo o processo junto ao CBMMG até a emissão do AVCB." },
      ]}
      related={[
        { title: "Manutenção Preventiva", href: "/manutencao-preventiva" },
        { title: "Sistema de Supressão por CO₂", href: "/sistema-supressao-co2" },
        { title: "Alarme de Incêndio", href: "/alarme-incendio" },
        { title: "Hidrantes e Mangotinhos", href: "/hidrantes" },
      ]}
      cta={{
        heading: "Precisa de Laudo Técnico com ART para AVCB?",
        sub: "Nossa equipe realiza a vistoria completa, elabora o laudo, emite a ART e acompanha o processo no CBMMG. Atendemos BH, MG e todo o Brasil.",
      }}
    />
  );
}
