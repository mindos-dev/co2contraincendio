import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Hammer, FileText, Link, AlertTriangle,
  CheckCircle2, ArrowRight, Phone, Mail, Wrench
} from "lucide-react";

const ESCOPO = [
  { title: "Diagnóstico Pré-Reforma", items: ["Levantamento do estado atual", "Identificação de interferências", "Análise de viabilidade técnica", "Verificação de instalações existentes"] },
  { title: "Acompanhamento de Obra", items: ["Vistorias periódicas de conformidade", "Verificação de materiais aplicados", "Controle de qualidade de serviços", "Registro fotográfico de etapas"] },
  { title: "Laudo de Conclusão", items: ["Verificação de conformidade final", "Teste de instalações (elétrica, hidráulica)", "Relatório de pendências", "Aceite técnico com ART de conclusão"] },
];

const INTEGRACOES = [
  { icon: "🔴", title: "ART — CREA/MG", desc: "Anotação de Responsabilidade Técnica para engenheiros. Obrigatória para obras com valor acima de R$ 15.000 ou que envolvam estrutura, elétrica ou hidráulica." },
  { icon: "🔵", title: "RRT — CAU", desc: "Registro de Responsabilidade Técnica para arquitetos. Necessário para reformas que alterem a área ou a volumetria da edificação." },
  { icon: "🟠", title: "Alvará de Reforma", desc: "Documentação junto à Prefeitura de BH para reformas que exijam aprovação municipal (ampliações, mudança de uso, demolições parciais)." },
  { icon: "🟢", title: "HABITE-SE", desc: "Documento de conclusão de obra emitido pela Prefeitura após vistoria de conformidade com o projeto aprovado." },
];

const NORMAS = [
  { code: "ABNT NBR 5410:2004", desc: "Instalações elétricas de baixa tensão" },
  { code: "ABNT NBR 5626:2020", desc: "Sistemas prediais de água fria e água quente" },
  { code: "ABNT NBR 7190:1997", desc: "Projeto de estruturas de madeira" },
  { code: "ABNT NBR 6118:2014", desc: "Projeto de estruturas de concreto" },
  { code: "Lei 6.496/1977", desc: "Institui a ART nos contratos de prestação de serviços de engenharia" },
];

export default function LaudoReforma() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-800/80 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/operis/vistorias")} className="text-gray-400 hover:text-white">
            <ArrowLeft size={16} className="mr-1" /> Voltar
          </Button>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Hammer size={18} className="text-amber-400" /> Laudo de Reforma
            </h1>
            <p className="text-xs text-gray-500">Integração com ART/RRT — Conformidade técnica e legal</p>
          </div>
          <Badge className="ml-auto bg-amber-500/10 border-amber-500/30 text-amber-400">Engenharia Diagnóstica</Badge>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Hero */}
        <div className="bg-gradient-to-r from-amber-900/30 to-gray-800/30 border border-amber-500/20 rounded-2xl p-8">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-3">Laudo Técnico de Reforma</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Documentação técnica completa para reformas residenciais, comerciais e industriais.
                Integra o diagnóstico pré-obra, o acompanhamento técnico e o laudo de conclusão com
                emissão de ART/RRT, garantindo conformidade legal e proteção ao proprietário.
              </p>
              <div className="flex flex-wrap gap-2">
                {["ART/RRT Inclusa", "Acompanhamento de Obra", "Laudo de Conclusão", "Conformidade ABNT"].map(tag => (
                  <Badge key={tag} className="bg-gray-700 text-gray-300 text-xs">{tag}</Badge>
                ))}
              </div>
            </div>
            <div className="hidden md:flex flex-col items-center justify-center bg-amber-900/20 border border-amber-500/20 rounded-xl p-6 min-w-[140px]">
              <Hammer size={40} className="text-amber-400 mb-2" />
              <span className="text-xs text-gray-400 text-center">Laudo de<br />Reforma</span>
            </div>
          </div>
        </div>

        {/* Escopo */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
            <Wrench size={18} className="text-amber-400" /> Escopo do Serviço
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ESCOPO.map((fase, i) => (
              <div key={fase.title} className="bg-gray-800/40 border border-gray-700 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-amber-900/30 border border-amber-500/30 rounded-full w-6 h-6 flex items-center justify-center">
                    <span className="text-amber-400 font-bold text-xs">{i + 1}</span>
                  </div>
                  <h4 className="text-white font-medium text-sm">{fase.title}</h4>
                </div>
                <div className="space-y-2">
                  {fase.items.map(item => (
                    <div key={item} className="flex items-center gap-2 text-gray-400 text-xs">
                      <CheckCircle2 size={10} className="text-amber-400 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Integrações ART/RRT */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
            <Link size={18} className="text-amber-400" /> Integrações Legais
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INTEGRACOES.map(integ => (
              <div key={integ.title} className="bg-gray-800/40 border border-gray-700 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{integ.icon}</span>
                  <div>
                    <h4 className="text-white font-medium mb-1">{integ.title}</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{integ.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerta */}
        <div className="bg-red-900/10 border border-red-600/20 rounded-xl p-5 flex items-start gap-4">
          <AlertTriangle size={20} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 font-medium mb-1">Reforma sem ART: risco jurídico e financeiro</p>
            <p className="text-gray-400 text-sm leading-relaxed">
              Reformas executadas sem ART/RRT não têm cobertura de seguro, podem invalidar o IPTU,
              dificultar a venda do imóvel e gerar responsabilidade civil ao proprietário em caso de
              acidentes. A regularização posterior custa até 3x mais do que a emissão preventiva.
            </p>
          </div>
        </div>

        {/* Normas */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
            <FileText size={18} className="text-amber-400" /> Normas Aplicáveis
          </h3>
          <div className="space-y-2">
            {NORMAS.map(n => (
              <div key={n.code} className="flex items-start gap-3 bg-gray-800/30 border border-gray-700 rounded-lg p-3">
                <Badge className="bg-amber-900/30 border-amber-500/30 text-amber-300 text-xs shrink-0">{n.code}</Badge>
                <p className="text-gray-400 text-sm">{n.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé jurídico */}
        <div className="bg-gray-800/20 border border-gray-700 rounded-xl p-4 text-xs text-gray-500 leading-relaxed">
          <strong className="text-gray-400">Resguardo Jurídico:</strong> Os laudos emitidos pela CO₂ Contra Incêndio LTDA (CNPJ 29.905.123/0001-53)
          são assinados pelo Eng. Judson Aleixo Sampaio (CREA/MG 142203671-5) e têm validade técnica e jurídica conforme
          a Lei 6.496/1977, a Resolução CONFEA 1.025/2009 e as normas ABNT aplicáveis. O laudo não substitui
          alvará municipal quando exigido pela legislação local.
        </div>

        {/* CTA */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center">
          <h3 className="text-white font-bold text-xl mb-2">Solicitar Laudo de Reforma</h3>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto">
            Eng. Judson Aleixo Sampaio — CREA/MG 142203671-5<br />
            Conformidade técnica e legal para sua reforma
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="tel:+5531997383115">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
                <Phone size={14} /> (31) 9 9738-3115
              </Button>
            </a>
            <a href="mailto:co2contraincendio@gmail.com">
              <Button variant="outline" className="border-gray-600 text-gray-300 gap-2">
                <Mail size={14} /> co2contraincendio@gmail.com
              </Button>
            </a>
            <Button onClick={() => navigate("/operis/vistorias/nova")} className="bg-orange-600 hover:bg-orange-700 text-white gap-2">
              Iniciar Vistoria <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
