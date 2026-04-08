import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Building2, ClipboardCheck, FileText, Camera,
  AlertTriangle, CheckCircle2, ArrowRight, Phone, Mail
} from "lucide-react";

const CHECKLIST_ITEMS = [
  { category: "Estrutura", items: ["Fundações e recalques", "Pilares e vigas", "Lajes e coberturas", "Fissuras estruturais", "Deformações visíveis"] },
  { category: "Vedações", items: ["Alvenarias e paredes", "Esquadrias e vidros", "Impermeabilização", "Fachadas e revestimentos", "Juntas de dilatação"] },
  { category: "Instalações", items: ["Rede elétrica (ABNT NBR 5410)", "Rede hidrossanitária", "SPDA (para-raios)", "Ar condicionado", "Elevadores e escadas rolantes"] },
  { category: "Segurança Contra Incêndio", items: ["Extintores (NBR 12693)", "Hidrantes e sprinklers (NBR 13714)", "Sinalização de emergência", "Saídas de emergência", "Detecção e alarme"] },
  { category: "Acessibilidade", items: ["Rampas (NBR 9050)", "Sanitários adaptados", "Sinalização tátil", "Vagas de estacionamento PCD", "Elevadores acessíveis"] },
];

const NORMAS = [
  { code: "ABNT NBR 5674:2012", desc: "Manutenção de edificações — Requisitos para o sistema de gestão" },
  { code: "ABNT NBR 16747:2020", desc: "Inspeção predial — Diretrizes, conceitos, terminologia e procedimento" },
  { code: "ABNT NBR 15575:2013", desc: "Edificações habitacionais — Desempenho" },
  { code: "ABNT NBR 9050:2020", desc: "Acessibilidade a edificações, mobiliário, espaços e equipamentos urbanos" },
  { code: "ABNT NBR 12693:2013", desc: "Sistemas de proteção por extintores de incêndio" },
];

export default function InspecaoPredial() {
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
              <Building2 size={18} className="text-blue-400" /> Inspeção Predial
            </h1>
            <p className="text-xs text-gray-500">Checklist normativo completo — ABNT NBR 16747:2020</p>
          </div>
          <Badge className="ml-auto bg-blue-500/10 border-blue-500/30 text-blue-400">Engenharia Diagnóstica</Badge>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Hero */}
        <div className="bg-gradient-to-r from-blue-900/30 to-gray-800/30 border border-blue-500/20 rounded-2xl p-8">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-3">Inspeção Predial Normativa</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Avaliação técnica completa da edificação conforme ABNT NBR 16747:2020, identificando anomalias,
                falhas de manutenção e riscos à segurança dos usuários. O laudo gerado tem validade legal e
                resguarda proprietários e síndicos de responsabilidades civis.
              </p>
              <div className="flex flex-wrap gap-2">
                {["NBR 16747:2020", "NBR 5674:2012", "NBR 15575:2013", "Laudo com ART"].map(tag => (
                  <Badge key={tag} className="bg-gray-700 text-gray-300 text-xs">{tag}</Badge>
                ))}
              </div>
            </div>
            <div className="hidden md:flex flex-col items-center justify-center bg-blue-900/20 border border-blue-500/20 rounded-xl p-6 min-w-[140px]">
              <Building2 size={40} className="text-blue-400 mb-2" />
              <span className="text-xs text-gray-400 text-center">Inspeção<br />Predial</span>
            </div>
          </div>
        </div>

        {/* Checklist por categoria */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
            <ClipboardCheck size={18} className="text-blue-400" /> Checklist Normativo
          </h3>
          <div className="space-y-4">
            {CHECKLIST_ITEMS.map(cat => (
              <div key={cat.category} className="bg-gray-800/40 border border-gray-700 rounded-xl p-5">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-400" /> {cat.category}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {cat.items.map(item => (
                    <div key={item} className="flex items-center gap-2 text-gray-400 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-600 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Normas */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
            <FileText size={18} className="text-blue-400" /> Normas Aplicáveis
          </h3>
          <div className="space-y-2">
            {NORMAS.map(n => (
              <div key={n.code} className="flex items-start gap-3 bg-gray-800/30 border border-gray-700 rounded-lg p-3">
                <Badge className="bg-blue-900/30 border-blue-500/30 text-blue-300 text-xs shrink-0">{n.code}</Badge>
                <p className="text-gray-400 text-sm">{n.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Metodologia */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: <ClipboardCheck size={20} />, title: "Vistoria Técnica", desc: "Inspeção presencial com checklist normativo, medições e ensaios não destrutivos quando necessário." },
            { icon: <Camera size={20} />, title: "Registro Fotográfico", desc: "Documentação fotográfica georreferenciada de todas as anomalias encontradas, com timestamp verificado." },
            { icon: <FileText size={20} />, title: "Laudo com ART", desc: "Emissão de laudo técnico com Anotação de Responsabilidade Técnica (ART) pelo Eng. Judson Aleixo Sampaio." },
          ].map(step => (
            <div key={step.title} className="bg-gray-800/40 border border-gray-700 rounded-xl p-5">
              <div className="text-blue-400 mb-3">{step.icon}</div>
              <h4 className="text-white font-medium mb-2">{step.title}</h4>
              <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Alerta incêndio */}
        <div className="bg-orange-900/10 border border-orange-600/20 rounded-xl p-5 flex items-start gap-4">
          <AlertTriangle size={20} className="text-orange-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-orange-300 font-medium mb-1">Auditoria de Segurança Contra Incêndio Incluída</p>
            <p className="text-gray-400 text-sm">
              Toda inspeção predial inclui auditoria completa dos sistemas de proteção contra incêndio
              (extintores, hidrantes, sprinklers, detecção e alarme) conforme NBR 12693, NBR 13714 e IT CBMMG.
              Irregularidades são notificadas diretamente à equipe CO₂ Contra Incêndio para proposta de regularização.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center">
          <h3 className="text-white font-bold text-xl mb-2">Solicitar Inspeção Predial</h3>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto">
            Eng. Judson Aleixo Sampaio — CREA/MG 142203671-5<br />
            Especialista em Engenharia de Produção e Segurança do Trabalho
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="tel:+5531997383115">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
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
