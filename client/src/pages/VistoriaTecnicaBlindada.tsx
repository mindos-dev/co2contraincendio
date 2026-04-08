import { useEffect } from "react";
import { Link } from "wouter";
import {
  Shield, CheckCircle2, FileText, Camera, Hash, Award,
  MapPin, Phone, ArrowRight, Star, Lock, Scale, Zap, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── SEO Head ─────────────────────────────────────────────────────────────────

function SEOHead() {
  useEffect(() => {
    document.title = "Vistoria Técnica Blindada em BH e Contagem | CO₂ Contra Incêndio";
    const desc = document.querySelector("meta[name='description']");
    if (desc) {
      desc.setAttribute("content",
        "Laudos técnicos com força jurídica total, rastreabilidade SHA-256, fotos com GPS e assinatura digital nativa. Engenheiros especialistas habilitados em Belo Horizonte e Contagem/MG."
      );
    }
    const canonical = document.querySelector("link[rel='canonical']");
    if (canonical) canonical.setAttribute("href", "https://co2contraincendio.com.br/vistoria-tecnica-blindada");
  }, []);
  return null;
}

// ─── Constantes de identidade visual ──────────────────────────────────────────

const DARK  = "#0A1628";
const RED   = "#C8102E";
const LIGHT = "#F0F4F8";

// ─── Dados ────────────────────────────────────────────────────────────────────

const DIFERENCIAIS = [
  {
    icon: <Hash size={28} className="text-red-500" />,
    title: "Rastreabilidade SHA-256",
    desc: "Cada laudo recebe um hash criptográfico único. Qualquer alteração posterior é detectada imediatamente — evidência inatacável em juízo.",
    badge: "Segurança Máxima",
  },
  {
    icon: <Camera size={28} className="text-red-500" />,
    title: "Fotos com GPS e Timestamp",
    desc: "Cada fotografia é carimbada com coordenadas GPS, data/hora exata e ID do contrato. Elimina alegações de adulteração ou substituição de imagens.",
    badge: "Prova Pericial",
  },
  {
    icon: <Lock size={28} className="text-red-500" />,
    title: "Assinatura Digital Nativa",
    desc: "Válida pela MP 2.200-2/2001. O log de assinatura registra IP, timestamp, nome completo e hash do documento no momento da firma.",
    badge: "MP 2.200-2/2001",
  },
  {
    icon: <Scale size={28} className="text-red-500" />,
    title: "Cláusulas 2026 Automáticas",
    desc: "Redutor Social (LC 214/2025), Cláusula de Vigência (Art. 8º Lei 8.245/91) e Garantia Única (Art. 37 Lei 8.245/91) injetadas automaticamente em contratos residenciais.",
    badge: "LC 214/2025",
  },
  {
    icon: <Zap size={28} className="text-red-500" />,
    title: "Risk Score de Engenharia",
    desc: "Motor de risco proprietário classifica cada patologia de R1 a R5 com causa provável e sugestão de reparo gerada por IA. Laudo técnico com embasamento diagnóstico.",
    badge: "OPERIS IA",
  },
  {
    icon: <Users size={28} className="text-red-500" />,
    title: "Curadoria Técnica CO₂",
    desc: "Todos os laudos são emitidos por Engenheiros Especialistas Habilitados, selecionados e auditados pela CO₂ Contra Incêndio. Responsabilidade técnica com CREA/MG registrado.",
    badge: "CREA/MG",
  },
];

const SERVICOS = [
  { title: "Vistoria de Entrada",    desc: "Documentação completa do estado do imóvel antes da locação." },
  { title: "Vistoria de Saída",      desc: "Comparativo automático com a vistoria de entrada e cálculo de depreciação." },
  { title: "Vistoria Periódica",     desc: "Monitoramento contínuo do estado do imóvel durante a locação." },
  { title: "Vistoria Cautelar",      desc: "Laudo de engenharia para imóveis com patologias estruturais." },
  { title: "Inspeção Predial",       desc: "Avaliação técnica completa conforme ABNT NBR 16747:2020." },
  { title: "Laudo de Reforma",       desc: "Documentação técnica de obras com ART/RRT e responsabilidade civil." },
];

const DEPOIMENTOS = [
  {
    nome: "Imobiliária Horizonte",
    cargo: "Gerente de Locações",
    texto: "Desde que adotamos a Vistoria Blindada, zeramos as disputas judiciais com inquilinos. O hash SHA-256 encerrou qualquer questionamento sobre adulteração.",
    estrelas: 5,
  },
  {
    nome: "Construtora Vale Verde",
    cargo: "Diretor Técnico",
    texto: "O Risk Score de engenharia nos salvou de aceitar um imóvel com infiltração estrutural disfarçada. A IA identificou o que o olho nu não veria.",
    estrelas: 5,
  },
  {
    nome: "Condomínio Residencial BH",
    cargo: "Síndico",
    texto: "As cláusulas 2026 foram inseridas automaticamente. Não precisei contratar um advogado para atualizar os contratos com a reforma tributária.",
    estrelas: 5,
  },
];

// ─── Componentes ──────────────────────────────────────────────────────────────

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={14} fill="#C8102E" className="text-red-500" />
      ))}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function VistoriaTecnicaBlindada() {
  return (
    <div className="min-h-screen" style={{ background: DARK, color: "#E8EDF2" }}>
      <SEOHead />

      {/* ── Navbar mínima ─────────────────────────────────────────────────────── */}
      <nav className="border-b sticky top-0 z-50" style={{ background: DARK, borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <span className="font-bold text-white text-lg tracking-tight cursor-pointer">
              CO₂ <span style={{ color: RED }}>Contra Incêndio</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/contato">
              <span className="text-gray-400 hover:text-white text-sm cursor-pointer transition-colors">Contato</span>
            </Link>
            <Link href="/app/login">
              <Button size="sm" style={{ background: RED }} className="hover:opacity-90 text-white">
                Acessar Plataforma
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Gradiente decorativo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-10"
            style={{ background: `radial-gradient(ellipse, ${RED}, transparent)` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-20 pb-24 relative z-10">
          <div className="max-w-3xl">
            {/* Badge de localização */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
              style={{ background: "rgba(200,16,46,0.15)", border: `1px solid rgba(200,16,46,0.4)`, color: "#F87171" }}>
              <MapPin size={12} /> Belo Horizonte e Contagem / MG
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
              Vistoria Técnica{" "}
              <span style={{ color: RED }}>Blindada</span>
              <br />
              em BH e Contagem
            </h1>

            <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-2xl">
              Elimine prejuízos com provas inquestionáveis. Laudos técnicos com{" "}
              <strong className="text-white">rastreabilidade SHA-256</strong>,{" "}
              <strong className="text-white">fotos com GPS</strong> e{" "}
              <strong className="text-white">assinatura digital nativa</strong> — válida pela MP 2.200-2/2001.
              Emitidos por Engenheiros Especialistas Habilitados com CREA/MG registrado.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/contato">
                <Button size="lg" style={{ background: RED }} className="hover:opacity-90 text-white gap-2">
                  Solicitar Vistoria <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/app/login">
                <Button size="lg" variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white gap-2">
                  <FileText size={18} /> Ver Exemplo de Laudo
                </Button>
              </Link>
            </div>

            {/* Selos de confiança */}
            <div className="flex flex-wrap gap-6 mt-10">
              {[
                { icon: <Shield size={16} />, text: "SHA-256 Certificado" },
                { icon: <Award size={16} />, text: "CREA/MG Habilitado" },
                { icon: <Scale size={16} />, text: "Lei 8.245/91 + LC 214/2025" },
              ].map(s => (
                <div key={s.text} className="flex items-center gap-2 text-sm text-gray-400">
                  <span style={{ color: RED }}>{s.icon}</span>
                  {s.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Faixa de autoridade ───────────────────────────────────────────────── */}
      <section className="border-y py-8" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(200,16,46,0.05)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "100%", label: "Laudos com Hash SHA-256" },
              { value: "0",    label: "Disputas Judiciais Perdidas" },
              { value: "2026", label: "Cláusulas Tributárias Atualizadas" },
              { value: "CREA", label: "Todos os Engenheiros Habilitados" },
            ].map(stat => (
              <div key={stat.label}>
                <p className="text-2xl font-bold" style={{ color: RED }}>{stat.value}</p>
                <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Diferenciais ─────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-4">
              Por que a Vistoria Blindada é{" "}
              <span style={{ color: RED }}>inatacável em juízo?</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Seis camadas de proteção técnica e jurídica que transformam uma simples vistoria em
              perícia de engenharia com validade probatória completa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DIFERENCIAIS.map(d => (
              <div key={d.title} className="rounded-2xl p-6 border transition-all hover:border-red-500/40"
                style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 rounded-xl" style={{ background: "rgba(200,16,46,0.12)" }}>
                    {d.icon}
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: "rgba(200,16,46,0.15)", color: "#F87171", border: "1px solid rgba(200,16,46,0.3)" }}>
                    {d.badge}
                  </span>
                </div>
                <h3 className="text-white font-semibold text-base mb-2">{d.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Serviços ─────────────────────────────────────────────────────────── */}
      <section className="py-16 border-t" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-10 text-center">
            Modalidades de <span style={{ color: RED }}>Vistoria Técnica</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICOS.map(s => (
              <div key={s.title} className="flex items-start gap-3 p-4 rounded-xl border"
                style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}>
                <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" style={{ color: RED }} />
                <div>
                  <p className="text-white font-medium text-sm">{s.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Depoimentos ──────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-10 text-center">
            O que dizem nossos <span style={{ color: RED }}>clientes</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DEPOIMENTOS.map(d => (
              <div key={d.nome} className="rounded-2xl p-6 border"
                style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
                <StarRating count={d.estrelas} />
                <p className="text-gray-300 text-sm leading-relaxed mt-4 mb-5">"{d.texto}"</p>
                <div>
                  <p className="text-white font-semibold text-sm">{d.nome}</p>
                  <p className="text-gray-500 text-xs">{d.cargo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cláusulas 2026 ───────────────────────────────────────────────────── */}
      <section className="py-16 border-t" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(200,16,46,0.04)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
                style={{ background: "rgba(200,16,46,0.15)", border: "1px solid rgba(200,16,46,0.4)", color: "#F87171" }}>
                Diferencial 2026
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Reforma Tributária já está nos seus contratos?
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                A LC 214/2025 criou o <strong className="text-white">Redutor Social de R$ 600,00</strong> sobre a
                base de cálculo do IBS/CBS para imóveis residenciais. Contratos sem essa cláusula podem gerar
                cobrança indevida ao inquilino — e responsabilidade civil ao locador.
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                A Plataforma OPERIS injeta automaticamente as cláusulas do{" "}
                <strong className="text-white">Art. 8º (Vigência)</strong> e{" "}
                <strong className="text-white">Art. 37 (Garantia Única)</strong> da Lei 8.245/91,
                eliminando a necessidade de revisão jurídica manual.
              </p>
            </div>
            <div className="space-y-3">
              {[
                { lei: "LC 214/2025", desc: "Redutor Social R$ 600 — IBS/CBS residencial" },
                { lei: "Art. 8º Lei 8.245/91", desc: "Cláusula de Vigência — proteção contra alienação" },
                { lei: "Art. 37 Lei 8.245/91", desc: "Garantia Única — trava contra duplicidade" },
                { lei: "MP 2.200-2/2001", desc: "Assinatura Digital com validade jurídica plena" },
              ].map(c => (
                <div key={c.lei} className="flex items-start gap-3 p-4 rounded-xl border"
                  style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
                  <Scale size={16} className="mt-0.5 flex-shrink-0" style={{ color: RED }} />
                  <div>
                    <p className="text-white text-sm font-medium">{c.lei}</p>
                    <p className="text-gray-500 text-xs">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Final ────────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto para blindar seus laudos?
          </h2>
          <p className="text-gray-400 mb-8">
            Entre em contato agora e receba um orçamento para Vistoria Técnica Blindada
            em Belo Horizonte ou Contagem/MG.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contato">
              <Button size="lg" style={{ background: RED }} className="hover:opacity-90 text-white gap-2">
                Solicitar Orçamento <ArrowRight size={18} />
              </Button>
            </Link>
            <a href="tel:+5531997383115">
              <Button size="lg" variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white gap-2">
                <Phone size={18} /> (31) 9 9738-3115
              </Button>
            </a>
          </div>
          <p className="text-gray-600 text-xs mt-6">
            CO₂ Contra Incêndio LTDA · CNPJ 29.905.123/0001-53 · Belo Horizonte, MG
          </p>
        </div>
      </section>

      {/* ── Rodapé ───────────────────────────────────────────────────────────── */}
      <footer className="border-t py-8" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)" }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-xs">
            © 2026 CO₂ Contra Incêndio LTDA. Todos os direitos reservados.
          </p>
          <div className="flex gap-4 text-xs text-gray-600">
            <Link href="/legal/privacy"><span className="hover:text-gray-400 cursor-pointer">Privacidade</span></Link>
            <Link href="/legal/terms"><span className="hover:text-gray-400 cursor-pointer">Termos</span></Link>
            <Link href="/legal/compliance"><span className="hover:text-gray-400 cursor-pointer">Compliance</span></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
