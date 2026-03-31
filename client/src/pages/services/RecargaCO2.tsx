import { Flame, Shield, CheckCircle, Wrench, Settings, FileCheck } from "lucide-react";
import ServicePageTemplate from "../../components/ServicePageTemplate";

export default function RecargaCO2() {
  return (
    <ServicePageTemplate
      meta={{
        title: "Recarga de CO₂ para Sistemas Fixos e Extintores — CO₂ Contra Incêndio",
        description: "Recarga de cilindros de CO₂ para sistemas fixos de supressão e extintores. Serviço técnico especializado com certificação e ART. Atendemos BH, Minas Gerais e todo o Brasil.",
        keywords: "recarga CO2, recarga cilindro CO2, recarga extintor CO2, recarga sistema fixo CO2, cilindro CO2 recarga BH, recarga CO2 Belo Horizonte, manutenção CO2",
      }}
      hero={{
        label: "Recarga de CO₂",
        title: "Recarga de Cilindros de CO₂",
        sub: "Recarga técnica especializada de cilindros de CO₂ para sistemas fixos de supressão e extintores. Certificação, teste hidrostático e ART incluídos.",
        bg: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1600&q=80",
      }}
      intro={{
        heading: "Recarga de CO₂: quando e como fazer",
        body: [
          "A recarga dos cilindros de CO₂ é obrigatória após qualquer descarga do sistema, seja em situação de incêndio real ou em teste. Também é necessária quando a inspeção periódica detectar perda de carga superior a 10% do peso nominal do agente.",
          "A CO₂ Contra Incêndio realiza a recarga técnica de cilindros de CO₂ para sistemas fixos de supressão (alta e baixa pressão) e extintores portáteis e sobre-rodas. Atendemos Belo Horizonte, Minas Gerais e todo o Brasil.",
          "O serviço inclui a retirada dos cilindros, transporte, recarga com CO₂ de alta pureza, teste hidrostático quando necessário (a cada 5 anos), pintura e identificação, e reinstalação com relatório técnico.",
          "Todos os cilindros recarregados recebem etiqueta de identificação com data da recarga, próxima inspeção e responsável técnico, conforme exigência da ABNT NBR 12615.",
        ],
      }}
      features={[
        { icon: <Flame size={20} />, title: "Recarga com CO₂ de Alta Pureza", desc: "Utilizamos CO₂ de alta pureza (grau alimentício) para garantir a eficácia do sistema e evitar contaminação dos equipamentos protegidos." },
        { icon: <Wrench size={20} />, title: "Teste Hidrostático", desc: "Realização de teste hidrostático obrigatório a cada 5 anos para verificação da integridade estrutural dos cilindros." },
        { icon: <Shield size={20} />, title: "Verificação de Válvulas", desc: "Inspeção e substituição de vedações, O-rings e válvulas solenóides durante o processo de recarga." },
        { icon: <Settings size={20} />, title: "Pesagem e Certificação", desc: "Pesagem dos cilindros antes e após a recarga com emissão de certificado de recarga e etiqueta de identificação." },
        { icon: <FileCheck size={20} />, title: "Relatório Técnico + ART", desc: "Emissão de relatório técnico de recarga e ART de engenheiro habilitado no CREA/MG para documentação do sistema." },
        { icon: <CheckCircle size={20} />, title: "Reinstalação e Teste", desc: "Reinstalação dos cilindros recarregados com verificação de todos os componentes do sistema e teste funcional." },
      ]}
      norms={[
        { code: "ABNT NBR 12615", title: "Sistema de extinção de incêndio por CO₂", excerpt: "Estabelece que a recarga é necessária quando a perda de peso do agente superar 10% da carga nominal, e que o teste hidrostático deve ser realizado a cada 5 anos." },
        { code: "ABNT NBR 12962", title: "Inspeção, manutenção e recarga em extintores de incêndio", excerpt: "Especifica os requisitos para inspeção, manutenção e recarga de extintores de incêndio, incluindo extintores de CO₂." },
        { code: "NR-20 MTE", title: "Segurança e Saúde no Trabalho com Inflamáveis e Combustíveis", excerpt: "Estabelece os requisitos de segurança para manuseio de gases comprimidos, incluindo cilindros de CO₂." },
        { code: "INMETRO", title: "Certificação de Cilindros de Gás", excerpt: "Regulamenta a certificação e recertificação de cilindros de gás comprimido, incluindo os cilindros de CO₂ para sistemas de incêndio." },
      ]}
      faqs={[
        { q: "Com que frequência os cilindros de CO₂ precisam ser recarregados?", a: "A recarga é obrigatória após qualquer descarga do sistema (incêndio real ou teste) e quando a inspeção semestral detectar perda de peso superior a 10% da carga nominal. Mesmo sem descarga, recomenda-se a verificação anual do peso dos cilindros." },
        { q: "O que é o teste hidrostático e quando é obrigatório?", a: "O teste hidrostático é um ensaio de pressão que verifica a integridade estrutural do cilindro. É obrigatório a cada 5 anos conforme regulamentação do INMETRO. Cilindros reprovados no teste devem ser descartados e substituídos." },
        { q: "Posso reaproveitar o CO₂ descarregado em um teste?", a: "Não. O CO₂ liberado durante uma descarga se dispersa no ambiente e não pode ser recuperado para recarga. Após cada descarga, os cilindros devem ser recarregados com CO₂ novo de alta pureza." },
        { q: "A CO₂ Contra Incêndio faz a retirada e reinstalação dos cilindros?", a: "Sim. Realizamos o serviço completo: retirada dos cilindros, transporte até nossa oficina, recarga, teste hidrostático quando necessário, reinstalação e teste funcional do sistema. Emitimos relatório técnico e ART." },
      ]}
      related={[
        { title: "Sistema de Supressão por CO₂", href: "/sistema-supressao-co2" },
        { title: "Manutenção Preventiva", href: "/manutencao-preventiva" },
        { title: "Vistoria e Laudo com ART", href: "/vistoria-laudo-art" },
      ]}
      cta={{
        heading: "Precisa Recarregar seus Cilindros de CO₂?",
        sub: "Realizamos a recarga técnica completa com teste hidrostático, certificação e ART. Atendemos BH, Minas Gerais e todo o Brasil.",
      }}
    />
  );
}
