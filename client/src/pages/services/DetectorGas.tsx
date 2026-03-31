import { Shield, Zap, Settings, CheckCircle, AlertTriangle, Wrench } from "lucide-react";
import ServicePageTemplate from "../../components/ServicePageTemplate";

export default function DetectorGas() {
  return (
    <ServicePageTemplate
      meta={{
        title: "Detector de Gás GLP e GN com Solenóide — CO₂ Contra Incêndio",
        description: "Instalação de detectores de gás GLP e GN com válvula solenóide de corte automático para cozinhas industriais e centrais de gás. Segurança conforme normas ABNT e Corpo de Bombeiros.",
        keywords: "detector gás GLP, detector gás GN, solenóide corte gás, válvula solenóide gás, detector gás cozinha industrial, central gás segurança, GLP GN detector, Belo Horizonte",
      }}
      hero={{
        label: "Detector de Gás GLP/GN",
        title: "Detectores de Gás com Solenóide de Corte Automático",
        sub: "Instalação de detectores de gás GLP e GN com válvula solenóide de corte automático. Segurança para cozinhas industriais, centrais de gás e ambientes com risco de vazamento.",
        bg: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1600&q=80",
      }}
      intro={{
        heading: "Detectores de Gás: prevenção de explosões e incêndios",
        body: [
          "Os detectores de gás combustível (GLP — Gás Liquefeito de Petróleo e GN — Gás Natural) são dispositivos de segurança essenciais para ambientes com instalações de gás. Ao detectar concentrações de gás acima do limite de segurança, acionam automaticamente a válvula solenóide de corte, interrompendo o fornecimento de gás antes que ocorra uma explosão ou incêndio.",
          "A CO₂ Contra Incêndio instala sistemas de detecção de gás integrados com solenóides de corte para cozinhas industriais, restaurantes, padarias, centrais de GLP e GN, hospitais e indústrias em Belo Horizonte, Minas Gerais e todo o Brasil.",
          "O sistema é composto por detectores de gás posicionados estrategicamente, central de controle e válvula solenóide instalada na entrada da rede de gás. Em caso de detecção, o gás é cortado automaticamente e o alarme é acionado.",
          "O sistema de detecção de gás é frequentemente integrado ao sistema saponificante de cozinhas industriais, garantindo o corte automático do gás quando o sistema de incêndio é acionado.",
        ],
      }}
      features={[
        { icon: <AlertTriangle size={20} />, title: "Detectores de GLP e GN", desc: "Detectores eletroquímicos e catalíticos específicos para GLP (mais pesado que o ar) e GN (mais leve que o ar), com posicionamento correto conforme o tipo de gás." },
        { icon: <Zap size={20} />, title: "Válvula Solenóide de Corte", desc: "Válvula solenóide normalmente aberta instalada na entrada da rede de gás para corte automático em caso de detecção." },
        { icon: <Settings size={20} />, title: "Central de Controle", desc: "Central microprocessada com display, histórico de alarmes, saída para solenóide e integração com sistema de alarme de incêndio." },
        { icon: <Shield size={20} />, title: "Integração com Sistema de Incêndio", desc: "Integração com o sistema saponificante e alarme de incêndio para corte automático do gás quando o sistema de supressão é acionado." },
        { icon: <CheckCircle size={20} />, title: "Alarme Sonoro e Visual", desc: "Sirene e luz estroboscópica para alerta dos ocupantes em caso de detecção de gás." },
        { icon: <Wrench size={20} />, title: "Manutenção e Calibração", desc: "Serviço de manutenção preventiva e calibração periódica dos detectores conforme especificação do fabricante." },
      ]}
      norms={[
        { code: "ABNT NBR 15526", title: "Redes de distribuição interna para gases combustíveis", excerpt: "Esta norma especifica os requisitos para redes de distribuição interna de gases combustíveis em instalações residenciais e comerciais, incluindo sistemas de detecção de vazamento." },
        { code: "ABNT NBR 13523", title: "Central de gás liquefeito de petróleo (GLP)", excerpt: "Estabelece os requisitos para instalação de centrais de GLP, incluindo dispositivos de segurança e detecção de vazamento." },
        { code: "IT-29 CBMMG", title: "Comercialização, distribuição e utilização de GLP", excerpt: "Instrução Técnica do CBMMG que estabelece os requisitos de segurança para instalações com GLP, incluindo sistemas de detecção." },
        { code: "NFPA 72", title: "National Fire Alarm and Signaling Code", excerpt: "Inclui requisitos para sistemas de detecção de gás combustível integrados a sistemas de alarme de incêndio." },
      ]}
      faqs={[
        { q: "Qual a diferença entre detector de GLP e GN?", a: "O GLP (Gás Liquefeito de Petróleo — gás de cozinha) é mais pesado que o ar e se acumula no piso. O detector de GLP deve ser instalado próximo ao piso (30cm de altura). O GN (Gás Natural) é mais leve que o ar e se acumula no teto. O detector de GN deve ser instalado próximo ao teto (30cm abaixo)." },
        { q: "A solenóide de corte é obrigatória?", a: "Sim, para cozinhas industriais com sistema saponificante, o intertravamento com a solenóide de corte de gás é obrigatório conforme as normas do Corpo de Bombeiros. Para outras instalações, a solenóide é altamente recomendada como medida de segurança." },
        { q: "Com que frequência o detector de gás precisa de manutenção?", a: "Os detectores de gás devem ser calibrados anualmente conforme especificação do fabricante. A célula sensora tem vida útil de 2 a 5 anos dependendo do modelo e deve ser substituída periodicamente." },
        { q: "O sistema funciona em caso de queda de energia?", a: "Sim. Os sistemas de detecção de gás possuem bateria de backup que mantém o funcionamento por pelo menos 24 horas em caso de queda de energia. A solenóide normalmente aberta fecha automaticamente em caso de falta de energia, garantindo a segurança." },
      ]}
      related={[
        { title: "Sistema Saponificante", href: "/sistema-saponificante" },
        { title: "Projeto de Exaustão", href: "/projeto-exaustao" },
        { title: "Alarme de Incêndio", href: "/alarme-incendio" },
        { title: "Vistoria e Laudo com ART", href: "/vistoria-laudo-art" },
      ]}
      cta={{
        heading: "Precisa de Detector de Gás com Solenóide?",
        sub: "Instalamos sistemas de detecção de GLP e GN com solenóide de corte automático integrado ao sistema de incêndio. Atendemos BH, MG e todo o Brasil.",
      }}
    />
  );
}
