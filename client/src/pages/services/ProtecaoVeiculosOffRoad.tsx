import { Link } from "wouter";
import SEOHead from "../../components/SEOHead";

const schema = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "Proteção contra Incêndio em Veículos Off-Road e Máquinas Pesadas",
  description:
    "Sistema Amerex Dry-ICS para proteção automática de escavadeiras, colheitadeiras e máquinas de mineração. Pó químico seco + agente líquido ICS. NFPA 122.",
  url: "https://co2contra.com/protecao-veiculos-off-road",
  author: { "@type": "Organization", name: "CO₂ Contra Incêndio" },
};

export default function ProtecaoVeiculosOffRoad() {
  return (
    <>
      <SEOHead
        title="Proteção contra Incêndio em Veículos Off-Road | CO₂ Contra Incêndio"
        description="Sistema Amerex Dry-ICS para escavadeiras, colheitadeiras e máquinas de mineração. Detecção automática, descarga em menos de 10 segundos. NFPA 122 / NBR 15808. BH e MG."
        keywords="sistema supressão incêndio veículos off-road, proteção máquinas pesadas mineração, Amerex Dry-ICS, extinção automática escavadeira, sistema incêndio colheitadeira, combate incêndio industrial"
        schema={schema}
      />

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #1a1f3e 100%)", padding: "6rem 0 4rem", borderBottom: "3px solid #b45309" }}>
        <div className="container">
          <div style={{ maxWidth: "800px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(180,83,9,0.15)", border: "1px solid rgba(180,83,9,0.4)", borderRadius: "4px", padding: "0.35rem 0.9rem", marginBottom: "1.5rem" }}>
              <span style={{ color: "#b45309", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Amerex Dry-ICS · NFPA 122 · NBR 15808
              </span>
            </div>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: "1.5rem", fontFamily: "'Barlow', sans-serif" }}>
              Proteção contra Incêndio em<br />
              <span style={{ color: "#f59e0b" }}>Veículos Off-Road e Máquinas Pesadas</span>
            </h1>
            <p style={{ fontSize: "1.1rem", color: "#94a3b8", lineHeight: 1.7, marginBottom: "2rem", maxWidth: "680px" }}>
              Escavadeiras, colheitadeiras e máquinas de mineração operam em condições extremas — poeira, vibração e
              temperaturas elevadas criam risco permanente de incêndio. O sistema <strong style={{ color: "#e2e8f0" }}>Amerex Dry-ICS</strong> detecta
              e suprime automaticamente em menos de 10 segundos, protegendo motor, sistema hidráulico e cabine do operador.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/contato">
                <button style={{ background: "#b45309", color: "#fff", border: "none", borderRadius: "6px", padding: "0.85rem 2rem", fontSize: "1rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Barlow', sans-serif" }}>
                  Solicitar Projeto Técnico
                </button>
              </Link>
              <Link href="/sistemas-pre-engenheirados">
                <button style={{ background: "transparent", color: "#e2e8f0", border: "1px solid rgba(226,232,240,0.3)", borderRadius: "6px", padding: "0.85rem 2rem", fontSize: "1rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Barlow', sans-serif" }}>
                  ← Todos os Sistemas
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section style={{ padding: "5rem 0", background: "#fff" }}>
        <div className="container" style={{ maxWidth: "900px" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#0f172a", marginBottom: "1.5rem", fontFamily: "'Barlow', sans-serif" }}>
            Como Funciona o Sistema Amerex Dry-ICS
          </h2>
          <p style={{ fontSize: "1rem", color: "#475569", lineHeight: 1.8, marginBottom: "1.5rem" }}>
            O sistema Amerex Dry-ICS (Dual Agent) combina dois agentes extintores em uma única descarga coordenada.
            O <strong>pó químico seco ABC</strong> realiza o knockdown imediato das chamas, interrompendo a reação
            em cadeia da combustão. Em seguida, o <strong>agente líquido ICS</strong> (Inerting Cooling Solution)
            resfria as superfícies metálicas superaquecidas, prevenindo a re-ignição — o principal risco em motores
            diesel e sistemas hidráulicos.
          </p>
          <p style={{ fontSize: "1rem", color: "#475569", lineHeight: 1.8, marginBottom: "2rem" }}>
            A detecção é realizada por <strong>fusíveis térmicos lineares</strong> ou <strong>detectores de temperatura</strong>
            instalados nas zonas de maior risco: compartimento de motor, sistema hidráulico, turbocompressor e
            compartimento de baterias. Ao atingir a temperatura de ativação, o sistema dispara automaticamente
            sem necessidade de intervenção humana — mesmo com o operador ausente da máquina.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.25rem" }}>
            {[
              { step: "01", title: "Detecção Automática", desc: "Fusível térmico ou detector linear monitora temperatura continuamente" },
              { step: "02", title: "Alarme Sonoro e Visual", desc: "Sinal de alerta na cabine do operador antes da descarga" },
              { step: "03", title: "Descarga de Pó Químico", desc: "Knockdown imediato das chamas em < 10 segundos" },
              { step: "04", title: "Descarga de Agente ICS", desc: "Resfriamento de superfícies e prevenção de re-ignição" },
            ].map((s) => (
              <div key={s.step} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1.5rem" }}>
                <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#b45309", marginBottom: "0.5rem", fontFamily: "'Barlow', sans-serif" }}>{s.step}</div>
                <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "0.4rem", fontFamily: "'Barlow', sans-serif" }}>{s.title}</div>
                <div style={{ fontSize: "0.875rem", color: "#64748b", lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
          {/* Sugestão de vídeo: https://www.youtube.com/watch?v=RPwQ8xNcvzk — Amerex Kodiak Mining Fire Suppression */}
          <div style={{ marginTop: "2rem", background: "#0f172a", borderRadius: "10px", padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontSize: "2rem" }}>▶️</span>
            <div>
              <div style={{ fontWeight: 700, color: "#fff", fontFamily: "'Barlow', sans-serif" }}>Vídeo de Referência: Amerex Kodiak Mining</div>
              <a href="https://www.youtube.com/watch?v=RPwQ8xNcvzk" target="_blank" rel="noopener noreferrer" style={{ color: "#f59e0b", fontSize: "0.875rem" }}>
                youtube.com/watch?v=RPwQ8xNcvzk — Demonstração real em máquinas de mineração
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* APLICAÇÕES */}
      <section style={{ padding: "5rem 0", background: "#f8fafc" }}>
        <div className="container" style={{ maxWidth: "900px" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#0f172a", marginBottom: "1.5rem", fontFamily: "'Barlow', sans-serif" }}>
            Aplicações Ideais
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
            {[
              { icon: "⛏️", title: "Mineração", items: ["Escavadeiras hidráulicas", "Carregadeiras frontais", "Caminhões fora-de-estrada", "Perfuratrizes"] },
              { icon: "🌾", title: "Agronegócio", items: ["Colheitadeiras de grãos", "Tratores de grande porte", "Pulverizadores autopropelidos", "Plantadeiras"] },
              { icon: "🏗️", title: "Construção Civil", items: ["Escavadeiras de esteira", "Retroescavadeiras", "Motoniveladoras", "Compactadores"] },
              { icon: "🌲", title: "Florestal", items: ["Harvester (processadoras)", "Forwarder (transportadoras)", "Feller buncher", "Skidder"] },
            ].map((cat) => (
              <div key={cat.title} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1.5rem" }}>
                <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>{cat.icon}</div>
                <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "0.75rem", fontFamily: "'Barlow', sans-serif" }}>{cat.title}</div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {cat.items.map((item) => (
                    <li key={item} style={{ fontSize: "0.875rem", color: "#475569", padding: "0.25rem 0", borderBottom: "1px solid #f1f5f9" }}>
                      → {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VANTAGENS */}
      <section style={{ padding: "5rem 0", background: "#fff" }}>
        <div className="container" style={{ maxWidth: "900px" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#0f172a", marginBottom: "1.5rem", fontFamily: "'Barlow', sans-serif" }}>
            Vantagens do Sistema Amerex Dry-ICS
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
            {[
              { title: "Knockdown em < 10 segundos", desc: "Pó químico seco interrompe a reação em cadeia imediatamente após a detecção." },
              { title: "Prevenção de re-ignição", desc: "Agente ICS resfria superfícies metálicas superaquecidas, eliminando o risco de re-ignição." },
              { title: "Proteção de zonas ocultas", desc: "O pó químico penetra em áreas de difícil acesso como compartimentos de motor e sistemas hidráulicos." },
              { title: "Operação 24/7 sem operador", desc: "Detecção e descarga automáticas funcionam mesmo com a máquina desligada ou sem operador." },
              { title: "Resistência a vibração e poeira", desc: "Componentes projetados para ambientes de mineração e construção civil." },
              { title: "Certificação NFPA 122", desc: "Sistema aprovado pela norma americana para proteção de equipamentos de mineração subterrânea e superficial." },
            ].map((v) => (
              <div key={v.title} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderLeft: "4px solid #b45309", borderRadius: "8px", padding: "1.25rem" }}>
                <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "0.4rem", fontFamily: "'Barlow', sans-serif" }}>✓ {v.title}</div>
                <div style={{ fontSize: "0.875rem", color: "#64748b", lineHeight: 1.6 }}>{v.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RISCOS SEM PROTEÇÃO */}
      <section style={{ padding: "5rem 0", background: "#0f172a" }}>
        <div className="container" style={{ maxWidth: "900px" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#fff", marginBottom: "1.5rem", fontFamily: "'Barlow', sans-serif" }}>
            Riscos sem Sistema de Supressão
          </h2>
          <p style={{ color: "#94a3b8", lineHeight: 1.8, marginBottom: "2rem" }}>
            Incêndios em máquinas pesadas evoluem rapidamente. O óleo hidráulico pressurizado pode se transformar em
            névoa inflamável ao romper uma mangueira próxima a uma superfície quente. Em menos de 2 minutos, o fogo
            pode consumir a cabine e atingir o tanque de combustível. Sem sistema automático, o operador raramente
            tem tempo de reagir com segurança.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
            {[
              { icon: "💀", label: "Risco à vida do operador" },
              { icon: "💰", label: "Perda total da máquina (R$ 500k–5M)" },
              { icon: "⏱️", label: "Parada de produção" },
              { icon: "📋", label: "Responsabilidade civil e criminal" },
            ].map((r) => (
              <div key={r.label} style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: "8px", padding: "1.25rem", textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{r.icon}</div>
                <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: "0.9rem", fontFamily: "'Barlow', sans-serif" }}>{r.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CENÁRIO REAL */}
      <section style={{ padding: "5rem 0", background: "#fff" }}>
        <div className="container" style={{ maxWidth: "900px" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#0f172a", marginBottom: "1.5rem", fontFamily: "'Barlow', sans-serif" }}>
            Cenário Industrial Real
          </h2>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderLeft: "4px solid #b45309", borderRadius: "10px", padding: "2rem" }}>
            <p style={{ fontSize: "1rem", color: "#475569", lineHeight: 1.8, margin: 0 }}>
              Uma mineradora de ferro em Minas Gerais operava uma frota de 12 escavadeiras hidráulicas de grande porte.
              Durante uma operação noturna, a ruptura de uma mangueira de alta pressão no sistema hidráulico de uma
              escavadeira gerou uma névoa de óleo que se inflamou ao contato com o turbocompressor superaquecido.
              O operador acionou o extintor portátil, mas o fogo já havia se espalhado para o compartimento de motor.
              A máquina foi perdida totalmente. Custo: R$ 2,8 milhões. Após o incidente, a empresa instalou o sistema
              Amerex Dry-ICS em toda a frota. Em 18 meses, o sistema atuou automaticamente em 2 ocorrências,
              evitando a perda de ambas as máquinas.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "5rem 0", background: "#f8fafc" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#0f172a", marginBottom: "2rem", fontFamily: "'Barlow', sans-serif" }}>
            Perguntas Frequentes
          </h2>
          {[
            { q: "O sistema Amerex Dry-ICS precisa de energia elétrica para funcionar?", a: "Não. O sistema pode ser configurado com detecção pneumática (fusível térmico) que opera sem energia elétrica. Existe também a versão com detecção elétrica para integração com sistemas de alarme da máquina. A descarga em si é sempre pneumática, acionada pela pressão do cilindro de agente." },
            { q: "Qual o intervalo de manutenção do sistema?", a: "A NFPA 17 e o fabricante Amerex recomendam inspeção semestral e manutenção anual. O pó químico seco deve ser substituído conforme o prazo de validade do fabricante (geralmente 6 anos). O agente ICS tem prazo de 5 anos. A CO₂ Contra Incêndio realiza contratos de manutenção preventiva com emissão de laudo técnico." },
            { q: "O pó químico danifica os componentes eletrônicos da máquina?", a: "O pó químico seco ABC deixa resíduo que pode danificar componentes eletrônicos expostos. Por isso, o sistema é projetado para direcionar a descarga especificamente para as zonas de risco (motor, hidráulico) e não para a cabine do operador, que possui sistema de proteção separado." },
            { q: "O sistema pode ser instalado em máquinas já em operação?", a: "Sim. O sistema Amerex Dry-ICS é retroativo e pode ser instalado em qualquer máquina em operação. A instalação é realizada pela CO₂ Contra Incêndio com emissão de ART e sem necessidade de parada prolongada da máquina." },
            { q: "Qual norma rege a proteção de veículos off-road no Brasil?", a: "A NFPA 122 (Standard for Fire Prevention and Control in Metal/Nonmetal Mining) é a referência internacional. No Brasil, a NBR 15808 (Extintores de incêndio portáteis) e as Instruções Técnicas do CBMMG complementam os requisitos. Para mineração, o Ministério de Minas e Energia também possui regulamentações específicas via ANM." },
          ].map((faq, i) => (
            <div key={i} style={{ borderBottom: "1px solid #e2e8f0", padding: "1.5rem 0" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.75rem", fontFamily: "'Barlow', sans-serif" }}>{faq.q}</h3>
              <p style={{ color: "#475569", lineHeight: 1.7, margin: 0, fontSize: "0.95rem" }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #1a1f3e 100%)", padding: "5rem 0", borderTop: "3px solid #b45309" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#fff", marginBottom: "1rem", fontFamily: "'Barlow', sans-serif" }}>
            Proteja sua frota de máquinas pesadas
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "1.05rem", maxWidth: "600px", margin: "0 auto 2rem", lineHeight: 1.7 }}>
            Nossa equipe técnica visita o local, analisa os riscos e projeta o sistema correto para cada modelo de máquina.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contato">
              <button style={{ background: "#b45309", color: "#fff", border: "none", borderRadius: "6px", padding: "0.9rem 2.5rem", fontSize: "1rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Barlow', sans-serif" }}>
                Solicitar Visita Técnica
              </button>
            </Link>
            <Link href="/sistemas-pre-engenheirados">
              <button style={{ background: "transparent", color: "#e2e8f0", border: "1px solid rgba(226,232,240,0.3)", borderRadius: "6px", padding: "0.9rem 2.5rem", fontSize: "1rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Barlow', sans-serif" }}>
                Ver Outros Sistemas
              </button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
