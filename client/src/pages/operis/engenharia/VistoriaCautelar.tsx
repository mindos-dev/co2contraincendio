import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Shield, Camera, FileText, AlertTriangle,
  MapPin, Clock, CheckCircle2, ArrowRight, Phone, Mail
} from "lucide-react";

const ETAPAS = [
  { num: "01", title: "Vistoria Pré-Obra", desc: "Registro do estado atual do imóvel vizinho antes do início das obras, com documentação fotográfica e medição de fissuras existentes." },
  { num: "02", title: "Monitoramento Durante Obra", desc: "Vistorias periódicas durante a execução para identificar novas manifestações patológicas causadas pelas atividades construtivas." },
  { num: "03", title: "Vistoria Pós-Obra", desc: "Comparativo final entre o estado inicial e o estado após a obra, com laudo conclusivo sobre danos causados." },
];

const DOCUMENTOS = [
  "Laudo fotográfico com georreferenciamento",
  "Mapeamento de fissuras (largura, comprimento, orientação)",
  "Relatório de medições e ensaios",
  "Parecer técnico sobre causalidade",
  "ART — Anotação de Responsabilidade Técnica",
  "Relatório de acompanhamento periódico",
];

const NORMAS = [
  { code: "ABNT NBR 9575:2010", desc: "Impermeabilização — Seleção e projeto" },
  { code: "ABNT NBR 6118:2014", desc: "Projeto de estruturas de concreto" },
  { code: "ABNT NBR 15575:2013", desc: "Edificações habitacionais — Desempenho" },
  { code: "ABNT NBR 16747:2020", desc: "Inspeção predial — Diretrizes e procedimentos" },
];

export default function VistoriaCautelar() {
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
              <Shield size={18} className="text-purple-400" /> Vistoria Cautelar de Vizinhança
            </h1>
            <p className="text-xs text-gray-500">Laudo fotográfico com proteção jurídica para obras</p>
          </div>
          <Badge className="ml-auto bg-purple-500/10 border-purple-500/30 text-purple-400">Engenharia Diagnóstica</Badge>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Hero */}
        <div className="bg-gradient-to-r from-purple-900/30 to-gray-800/30 border border-purple-500/20 rounded-2xl p-8">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-3">Vistoria Cautelar de Vizinhança</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Documentação técnica do estado de conservação dos imóveis vizinhos antes, durante e após obras.
                Protege construtoras, incorporadoras e proprietários de ações judiciais por danos causados por
                vibrações, escavações e movimentação de terra. O laudo tem força probatória em juízo.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Proteção Jurídica", "Laudo Fotográfico", "Mapeamento de Fissuras", "ART Inclusa"].map(tag => (
                  <Badge key={tag} className="bg-gray-700 text-gray-300 text-xs">{tag}</Badge>
                ))}
              </div>
            </div>
            <div className="hidden md:flex flex-col items-center justify-center bg-purple-900/20 border border-purple-500/20 rounded-xl p-6 min-w-[140px]">
              <Shield size={40} className="text-purple-400 mb-2" />
              <span className="text-xs text-gray-400 text-center">Vistoria<br />Cautelar</span>
            </div>
          </div>
        </div>

        {/* Por que é obrigatória */}
        <div className="bg-yellow-900/10 border border-yellow-600/20 rounded-xl p-5 flex items-start gap-4">
          <AlertTriangle size={20} className="text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-300 font-medium mb-1">Por que a Vistoria Cautelar é essencial?</p>
            <p className="text-gray-400 text-sm leading-relaxed">
              Sem documentação prévia, qualquer fissura ou dano encontrado após uma obra pode ser atribuído ao
              construtor — mesmo que já existisse antes. A vistoria cautelar cria uma "fotografia jurídica" do
              imóvel, protegendo todas as partes envolvidas com base em evidências técnicas irrefutáveis.
            </p>
          </div>
        </div>

        {/* Etapas */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
            <Clock size={18} className="text-purple-400" /> Metodologia de Trabalho
          </h3>
          <div className="space-y-4">
            {ETAPAS.map(etapa => (
              <div key={etapa.num} className="flex items-start gap-4 bg-gray-800/40 border border-gray-700 rounded-xl p-5">
                <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg w-10 h-10 flex items-center justify-center shrink-0">
                  <span className="text-purple-400 font-bold text-sm">{etapa.num}</span>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">{etapa.title}</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{etapa.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documentos entregues */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
            <FileText size={18} className="text-purple-400" /> Documentos Entregues
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DOCUMENTOS.map(doc => (
              <div key={doc} className="flex items-center gap-3 bg-gray-800/30 border border-gray-700 rounded-lg p-3">
                <CheckCircle2 size={14} className="text-purple-400 shrink-0" />
                <p className="text-gray-300 text-sm">{doc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Normas */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
            <FileText size={18} className="text-purple-400" /> Normas Aplicáveis
          </h3>
          <div className="space-y-2">
            {NORMAS.map(n => (
              <div key={n.code} className="flex items-start gap-3 bg-gray-800/30 border border-gray-700 rounded-lg p-3">
                <Badge className="bg-purple-900/30 border-purple-500/30 text-purple-300 text-xs shrink-0">{n.code}</Badge>
                <p className="text-gray-400 text-sm">{n.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cobertura geográfica */}
        <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-5 flex items-start gap-4">
          <MapPin size={20} className="text-purple-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-white font-medium mb-1">Cobertura de Atendimento</p>
            <p className="text-gray-400 text-sm">
              Belo Horizonte e Região Metropolitana. Para obras em outras cidades de Minas Gerais,
              consulte disponibilidade e condições de deslocamento.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center">
          <h3 className="text-white font-bold text-xl mb-2">Solicitar Vistoria Cautelar</h3>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto">
            Eng. Judson Aleixo Sampaio — CREA/MG 142203671-5<br />
            Documentação técnica com validade jurídica para sua obra
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="tel:+5531997383115">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
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
