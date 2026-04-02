/**
 * OperisFA — Perguntas Frequentes do OPERIS
 * Accordion com 8 perguntas para novos usuários
 * Segue o padrão visual dark do SaasDashboard (bg-[#0d1f35], slate-*)
 */

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const faqs = [
  {
    q: "O que é o OPERIS?",
    a: "O OPERIS é o módulo de inspeção técnica com Inteligência Artificial da CO₂ Contra Incêndio. Ele permite criar inspeções digitais de sistemas de combate a incêndio, analisar itens com IA, gerar laudos técnicos completos e compartilhá-los com clientes via WhatsApp ou e-mail — tudo em conformidade com NBR 12615 e NFPA 12.",
  },
  {
    q: "Como criar uma nova inspeção?",
    a: "Clique no botão 'Nova Inspeção' no canto superior direito desta tela. Selecione o tipo de sistema (CO₂, saponificante, hidrante etc.), informe o cliente, local e data. O OPERIS carregará automaticamente o checklist técnico correspondente com os itens de verificação.",
  },
  {
    q: "Como a IA analisa os itens da inspeção?",
    a: "Ao preencher um item do checklist e clicar em 'Analisar com IA', o OPERIS envia os dados para o motor de IA (Claude), que retorna uma nota técnica estruturada com observações, nível de risco (R1 a R5) e recomendações de ação corretiva. Você pode aceitar, editar ou rejeitar a análise.",
  },
  {
    q: "Como gerar um laudo técnico?",
    a: "Com a inspeção concluída, acesse os detalhes da inspeção e clique em 'Gerar Laudo com IA'. O sistema compilará todos os itens, análises e fotos em um laudo técnico completo, com nível de risco global (R1–R5), resumo executivo e recomendações. O laudo recebe um link público único para compartilhamento.",
  },
  {
    q: "Como compartilhar um laudo com o cliente?",
    a: "Após gerar o laudo, clique no botão 'Compartilhar' que aparece na tela da inspeção ou na página do laudo. Você pode copiar o link direto, enviar via WhatsApp (abre o app com a mensagem pronta) ou enviar por e-mail (abre o cliente de e-mail com o link no corpo da mensagem).",
  },
  {
    q: "Quais normas técnicas o OPERIS suporta?",
    a: "O OPERIS foi desenvolvido com base nas principais normas de sistemas fixos de combate a incêndio: ABNT NBR 12615 (CO₂), NFPA 12 (CO₂), UL 300 (saponificante para coifas), ABNT NBR 13714 (hidrantes) e ABNT NBR 17240 (alarmes). Os checklists de inspeção são estruturados conforme os requisitos dessas normas.",
  },
  {
    q: "Como adicionar técnicos ao sistema?",
    a: "Acesse o painel de administração em 'Admin OPERIS' (visível apenas para administradores). Na aba 'Técnicos', você verá todos os usuários cadastrados e a quantidade de inspeções de cada um. Para cadastrar novos técnicos, acesse 'Usuários' no menu lateral e crie um novo usuário com o perfil desejado.",
  },
  {
    q: "Como acessar inspeções e laudos anteriores?",
    a: "Todas as inspeções aparecem na lista desta tela, ordenadas por data. Clique em qualquer inspeção para ver os detalhes, itens inspecionados e o laudo gerado. Administradores podem ver inspeções de todos os técnicos no painel 'Admin OPERIS', com filtros por status, técnico e período.",
  },
];

export default function OperisFA() {
  const [open, setOpen] = useState<number | null>(null);

  const toggle = (idx: number) => setOpen(open === idx ? null : idx);

  return (
    <Card className="bg-[#0d1f35] border-slate-700/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#e63946]" />
          Perguntas Frequentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 p-4 pt-0">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="border border-slate-700/40 rounded-lg overflow-hidden"
          >
            {/* Pergunta */}
            <button
              onClick={() => toggle(idx)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-800/50 focus:outline-none"
              aria-expanded={open === idx}
            >
              <span className="text-sm font-medium text-slate-200 leading-snug">
                {faq.q}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[#e63946] shrink-0 transition-transform duration-200 ${
                  open === idx ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Resposta */}
            {open === idx && (
              <div className="px-4 pb-4 pt-0">
                <div className="h-px bg-slate-700/50 mb-3" />
                <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        ))}

        {/* Rodapé de suporte */}
        <div className="mt-4 pt-3 border-t border-slate-700/40 text-center">
          <p className="text-xs text-slate-500">
            Ainda tem dúvidas?{" "}
            <a
              href="https://wa.me/5531997383115"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#e63946] hover:underline font-medium"
            >
              Fale com o suporte via WhatsApp
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
