import { Link, useParams } from "wouter";
import Layout from "../components/Layout";
import { ArrowRight, Clock, Tag, ArrowLeft } from "lucide-react";
import { blogPosts } from "./Blog";

const articleContent: Record<string, { html: string }> = {
  "o-que-e-sistema-supressao-co2": {
    html: `
<h2>O que é o Sistema de Supressão por CO₂?</h2>
<p>O sistema de supressão por CO₂ (dióxido de carbono) é uma solução de extinção automática de incêndios amplamente utilizada em ambientes onde a água ou o pó químico causariam danos irreversíveis aos equipamentos. O CO₂ age eliminando o oxigênio da área protegida, extinguindo o fogo sem deixar resíduos.</p>

<h2>Como funciona o sistema de CO₂?</h2>
<p>O sistema funciona pelo princípio da inundação total: ao detectar um incêndio (via detector de fumaça ou calor), o painel de controle aciona a <strong>válvula solenóide</strong> do cilindro de CO₂, liberando o agente extintor pelos difusores instalados no ambiente. O CO₂ reduz a concentração de oxigênio abaixo de 15%, extinguindo o fogo.</p>

<p>O processo ocorre em etapas:</p>
<ol>
  <li><strong>Detecção:</strong> Detector de fumaça ou calor identifica o incêndio</li>
  <li><strong>Pré-alarme:</strong> Sirene e luz estroboscópica alertam para evacuação (30 segundos)</li>
  <li><strong>Acionamento da solenóide:</strong> Válvula solenóide abre o cilindro de CO₂</li>
  <li><strong>Descarga:</strong> CO₂ é liberado pelos difusores, inundando o ambiente</li>
  <li><strong>Extinção:</strong> Concentração de O₂ cai abaixo de 15%, extinguindo o fogo</li>
</ol>

<h2>O que é a válvula solenóide no sistema de CO₂?</h2>
<p>A <strong>válvula solenóide</strong> é o componente eletromecânico que controla a abertura do cilindro de CO₂. Quando o painel de controle envia o sinal de acionamento, a solenóide é energizada, abrindo a válvula e liberando o agente extintor. Em caso de falta de energia, a solenóide pode ser acionada manualmente.</p>

<h2>Onde o sistema de CO₂ é indicado?</h2>
<p>O sistema de CO₂ é indicado para ambientes onde a água causaria danos irreversíveis:</p>
<ul>
  <li>Salas de servidores e data centers</li>
  <li>Geradores e UPS</li>
  <li>Painéis elétricos e transformadores</li>
  <li>Câmaras frigoríficas</li>
  <li>Processos industriais com combustíveis líquidos</li>
  <li>Arquivos e museus</li>
</ul>

<h2>ABNT NBR 12615: o que diz a norma?</h2>
<p>A <strong>ABNT NBR 12615</strong> — "Sistema de extinção de incêndio por CO₂" — é a norma brasileira que especifica os requisitos mínimos para projeto, instalação, inspeção e manutenção de sistemas fixos de extinção por dióxido de carbono.</p>

<blockquote>"Esta norma especifica os requisitos mínimos para projeto, instalação, inspeção e manutenção de sistemas fixos de extinção de incêndio por dióxido de carbono." — ABNT NBR 12615</blockquote>

<p>A norma estabelece:</p>
<ul>
  <li>Cálculo da quantidade de CO₂ necessária por volume do ambiente</li>
  <li>Tempo de descarga máximo (1 minuto para sistemas de alta pressão)</li>
  <li>Concentração mínima de projeto (34% para riscos de superfície)</li>
  <li>Requisitos de alarme de pré-descarga obrigatório</li>
  <li>Periodicidades de inspeção e manutenção</li>
</ul>

<h2>NFPA 12: padrão internacional</h2>
<p>A <strong>NFPA 12</strong> — "Standard on Carbon Dioxide Extinguishing Systems" — é o padrão americano que complementa a NBR 12615 e é frequentemente referenciado em projetos de maior complexidade, especialmente em indústrias multinacionais.</p>

<h2>Alta pressão vs. baixa pressão: qual escolher?</h2>
<p>A escolha entre sistema de alta pressão (cilindros a temperatura ambiente) e baixa pressão (tanque refrigerado a -18°C) depende do volume a ser protegido:</p>
<ul>
  <li><strong>Alta pressão:</strong> Indicado para volumes menores (até ~500m³). Cilindros individuais de 25 a 70kg.</li>
  <li><strong>Baixa pressão:</strong> Indicado para grandes volumes (acima de 500m³). Tanque refrigerado com maior quantidade de agente.</li>
</ul>

<h2>Manutenção do sistema de CO₂</h2>
<p>A NBR 12615 estabelece as seguintes periodicidades de manutenção:</p>
<ul>
  <li><strong>Mensal:</strong> Inspeção visual dos cilindros, válvulas e tubulação</li>
  <li><strong>Semestral:</strong> Pesagem dos cilindros, verificação de válvulas e detectores</li>
  <li><strong>Anual:</strong> Manutenção completa com teste funcional do sistema</li>
  <li><strong>A cada 5 anos:</strong> Teste hidrostático dos cilindros</li>
</ul>
    `,
  },
  "sistema-saponificante-cozinha-industrial": {
    html: `
<h2>O que é o Sistema Saponificante?</h2>
<p>O sistema de supressão por <strong>agente saponificante</strong> (wet chemical) é a solução específica para proteção de cozinhas industriais contra incêndios em equipamentos de cocção a óleo. O agente reage quimicamente com a gordura aquecida, formando uma camada de sabão que sela a superfície e impede a re-ignição.</p>

<h2>Por que o saponificante é obrigatório em cozinhas industriais?</h2>
<p>O Corpo de Bombeiros exige sistema fixo de supressão para cozinhas industriais com equipamentos de cocção a óleo acima de determinadas dimensões. A obrigatoriedade está prevista nas Instruções Técnicas do CBMMG e é condição para obtenção do AVCB.</p>

<h2>Como funciona o sistema saponificante?</h2>
<p>O sistema é composto por:</p>
<ul>
  <li><strong>Cilindros de agente saponificante</strong> pressurizados com nitrogênio</li>
  <li><strong>Bicos difusores</strong> posicionados sobre os equipamentos e na coifa</li>
  <li><strong>Detectores térmicos fusíveis</strong> sobre cada equipamento</li>
  <li><strong>Solenóide de corte de gás</strong> para interrupção automática do combustível</li>
  <li><strong>Dampers de exaustão</strong> para fechamento dos dutos em caso de acionamento</li>
</ul>

<h2>ABNT NBR 14095: o que diz a norma?</h2>
<blockquote>"Esta norma estabelece os requisitos mínimos para projeto, instalação, inspeção e manutenção de sistemas fixos de extinção de incêndio por agente saponificante em equipamentos de cocção." — ABNT NBR 14095</blockquote>

<h2>Integração com gás e exaustão</h2>
<p>A norma exige o <strong>intertravamento</strong> do sistema saponificante com:</p>
<ul>
  <li><strong>Solenóide de corte de gás:</strong> Interrompe o fornecimento de GLP ou GN automaticamente</li>
  <li><strong>Dampers de exaustão:</strong> Fecham os dutos para conter o incêndio</li>
  <li><strong>Sistema de alarme:</strong> Aciona sirenes e notifica os ocupantes</li>
</ul>

<h2>Manutenção semestral obrigatória</h2>
<p>A NBR 14095 exige inspeção semestral obrigatória incluindo verificação do agente saponificante, pressão dos cilindros, bicos difusores, detectores térmicos e todos os intertravamentos.</p>
    `,
  },
  "detector-gas-glp-gn-solenoide": {
    html: `
<h2>Detector de Gás GLP vs. GN: qual a diferença?</h2>
<p>A principal diferença está na densidade do gás em relação ao ar:</p>
<ul>
  <li><strong>GLP (Gás Liquefeito de Petróleo):</strong> Mais pesado que o ar. Acumula-se no piso. O detector deve ser instalado a <strong>30cm do piso</strong>.</li>
  <li><strong>GN (Gás Natural):</strong> Mais leve que o ar. Acumula-se no teto. O detector deve ser instalado a <strong>30cm do teto</strong>.</li>
</ul>

<h2>O que é a válvula solenóide de corte de gás?</h2>
<p>A <strong>válvula solenóide</strong> é um dispositivo eletromecânico instalado na entrada da rede de gás que fecha automaticamente quando o detector identifica concentrações perigosas de gás. É normalmente aberta (NA) — permanece aberta com energia e fecha em caso de alarme ou falta de energia.</p>

<h2>Integração com o sistema saponificante</h2>
<p>Em cozinhas industriais com sistema saponificante, a solenóide de corte de gás deve ser integrada ao sistema de supressão: quando o saponificante é acionado, a solenóide fecha automaticamente, interrompendo o fornecimento de gás e evitando a re-ignição.</p>

<h2>Onde instalar o detector de gás?</h2>
<p>O posicionamento correto é fundamental para a eficácia do sistema:</p>
<ul>
  <li>Próximo a conexões, válvulas e equipamentos de gás</li>
  <li>Em locais com boa circulação de ar</li>
  <li>Longe de fontes de calor e umidade excessiva</li>
  <li>Conforme a densidade do gás (piso para GLP, teto para GN)</li>
</ul>
    `,
  },
  "detector-fumaca-alarme-incendio-nbr-17240": {
    html: `
<h2>Tipos de Detectores de Fumaça</h2>
<p>Existem três tipos principais de detectores de fumaça utilizados em sistemas de alarme de incêndio:</p>
<ul>
  <li><strong>Detector óptico (fotoelétrico):</strong> Detecta partículas de fumaça por dispersão de luz. Ideal para incêndios com combustão lenta e muita fumaça.</li>
  <li><strong>Detector iônico:</strong> Utiliza câmara de ionização para detectar partículas invisíveis de combustão. Mais sensível a incêndios rápidos com chamas.</li>
  <li><strong>Detector linear de feixe:</strong> Utiliza feixe de luz infravermelho entre emissor e receptor. Indicado para grandes vãos como galpões e armazéns.</li>
</ul>

<h2>Sistema Convencional vs. Endereçável</h2>
<p>A escolha entre sistema convencional e endereçável depende do porte e complexidade da edificação:</p>
<ul>
  <li><strong>Convencional:</strong> Detectores agrupados por zonas. A central indica a zona em alarme. Indicado para edificações menores e mais simples.</li>
  <li><strong>Endereçável:</strong> Cada detector tem um endereço único. A central indica exatamente qual dispositivo foi acionado. Indicado para edificações grandes e complexas.</li>
</ul>

<h2>ABNT NBR 17240: requisitos da norma</h2>
<blockquote>"Esta norma especifica os requisitos mínimos para projeto, instalação, comissionamento, manutenção e testes de sistemas de detecção e alarme de incêndio em edificações." — ABNT NBR 17240</blockquote>

<p>A norma estabelece os critérios para:</p>
<ul>
  <li>Seleção e posicionamento de detectores</li>
  <li>Cobertura de área por detector</li>
  <li>Requisitos de cabeamento e alimentação</li>
  <li>Testes e comissionamento</li>
  <li>Manutenção periódica</li>
</ul>
    `,
  },
  "projeto-exaustao-damper-corta-fogo": {
    html: `
<h2>O que é o Damper Corta-Fogo?</h2>
<p>O <strong>damper corta-fogo</strong> é um dispositivo instalado nos dutos de exaustão que fecha automaticamente em caso de incêndio, impedindo a propagação do fogo e da fumaça pelo duto para outras áreas da edificação. É acionado por fusível térmico ou por sinal elétrico do sistema de incêndio.</p>

<h2>Por que o damper é obrigatório?</h2>
<p>O Corpo de Bombeiros exige dampers corta-fogo nos dutos de exaustão que atravessam paredes ou lajes corta-fogo. Em cozinhas industriais com sistema saponificante, os dampers devem ser intertravados com o sistema para fechamento automático em caso de acionamento.</p>

<h2>Integração com o sistema saponificante</h2>
<p>O intertravamento entre o sistema de exaustão e o sistema saponificante é obrigatório conforme a NBR 14095:</p>
<ol>
  <li>Sistema saponificante é acionado (manual ou automático)</li>
  <li>Sinal elétrico fecha os dampers de exaustão</li>
  <li>Solenóide de gás fecha o fornecimento de combustível</li>
  <li>Agente saponificante é liberado sobre os equipamentos</li>
</ol>

<h2>Make-up Air: o ar de reposição</h2>
<p>O sistema de make-up air (ar de reposição) é essencial para compensar o ar extraído pela exaustão. Sem ele, a cozinha fica com pressão negativa, dificultando a abertura de portas e comprometendo o funcionamento do ar-condicionado.</p>
    `,
  },
  "manutencao-preventiva-sistemas-incendio": {
    html: `
<h2>Por que a manutenção preventiva é obrigatória?</h2>
<p>As normas ABNT e as Instruções Técnicas do Corpo de Bombeiros estabelecem periodicidades mínimas de inspeção e manutenção para cada tipo de sistema de incêndio. O descumprimento pode resultar em autuação, interdição e responsabilização civil e criminal em caso de sinistro.</p>

<h2>Periodicidades por sistema</h2>
<p><strong>Sistema de CO₂ (NBR 12615):</strong></p>
<ul>
  <li>Mensal: Inspeção visual de cilindros, válvulas e tubulação</li>
  <li>Semestral: Pesagem dos cilindros, verificação de válvulas e detectores</li>
  <li>Anual: Manutenção completa com teste funcional</li>
  <li>A cada 5 anos: Teste hidrostático dos cilindros</li>
</ul>

<p><strong>Sistema Saponificante (NBR 14095):</strong></p>
<ul>
  <li>Semestral: Inspeção completa obrigatória</li>
  <li>Após cada acionamento: Recarga e verificação completa</li>
</ul>

<p><strong>Hidrantes (NBR 13714):</strong></p>
<ul>
  <li>Mensal: Inspeção visual</li>
  <li>Trimestral: Acionamento da bomba de incêndio</li>
  <li>Anual: Teste de vazão e pressão</li>
</ul>

<p><strong>Alarme de Incêndio (NBR 17240):</strong></p>
<ul>
  <li>Mensal: Inspeção visual</li>
  <li>Semestral: Teste de todos os dispositivos</li>
  <li>Anual: Manutenção completa</li>
</ul>

<h2>Como manter o AVCB válido</h2>
<p>Para renovar o AVCB, o Corpo de Bombeiros pode exigir comprovação de manutenção dos sistemas de incêndio. Relatórios técnicos e ARTs de manutenção são documentos fundamentais para este processo.</p>
    `,
  },
  "vistoria-laudo-art-avcb": {
    html: `
<h2>O que é o AVCB?</h2>
<p>O <strong>AVCB (Auto de Vistoria do Corpo de Bombeiros)</strong> é o documento que atesta que uma edificação atende às normas de segurança contra incêndio estabelecidas pelo Corpo de Bombeiros. É obrigatório para edificações de uso coletivo e tem validade de 1 a 3 anos dependendo da ocupação.</p>

<h2>Quem é obrigado a ter AVCB?</h2>
<p>A obrigatoriedade varia conforme a Instrução Técnica do CBMMG, considerando ocupação, área e altura. Em geral:</p>
<ul>
  <li>Edificações comerciais acima de 750m²</li>
  <li>Edificações industriais acima de 2.500m²</li>
  <li>Edificações com mais de 12m de altura</li>
  <li>Hospitais, hotéis, shoppings e escolas</li>
  <li>Restaurantes e cozinhas industriais com sistema saponificante</li>
</ul>

<h2>O que é a ART e por que é necessária?</h2>
<p>A <strong>ART (Anotação de Responsabilidade Técnica)</strong> é o documento emitido pelo CREA que atesta a responsabilidade técnica de um engenheiro sobre um projeto ou serviço. Para o AVCB, são necessárias ARTs de todos os sistemas de incêndio instalados.</p>

<h2>Processo de obtenção do AVCB</h2>
<ol>
  <li>Levantamento técnico da edificação</li>
  <li>Elaboração dos projetos executivos com ARTs</li>
  <li>Protocolo dos projetos no CBMMG</li>
  <li>Execução das adequações necessárias</li>
  <li>Solicitação de vistoria ao CBMMG</li>
  <li>Vistoria e emissão do AVCB</li>
</ol>
    `,
  },
  "recarga-co2-cilindro-quando-fazer": {
    html: `
<h2>Quando os cilindros de CO₂ precisam ser recarregados?</h2>
<p>A recarga dos cilindros de CO₂ é obrigatória nas seguintes situações:</p>
<ul>
  <li>Após qualquer descarga do sistema (incêndio real ou teste)</li>
  <li>Quando a inspeção semestral detectar perda de peso superior a <strong>10% da carga nominal</strong></li>
  <li>Quando o cilindro apresentar danos físicos ou corrosão</li>
</ul>

<h2>O que é o teste hidrostático?</h2>
<p>O <strong>teste hidrostático</strong> é um ensaio de pressão que verifica a integridade estrutural do cilindro. É obrigatório a cada 5 anos conforme regulamentação do INMETRO. O cilindro é pressurizado com água a 5/3 da pressão de serviço e verificado quanto a deformações permanentes.</p>

<blockquote>"Cilindros que apresentarem deformação permanente superior a 10% do volume de expansão total devem ser retirados de serviço." — INMETRO</blockquote>

<h2>Processo de recarga</h2>
<ol>
  <li>Retirada dos cilindros do sistema</li>
  <li>Pesagem para verificação da carga residual</li>
  <li>Inspeção visual e verificação de válvulas</li>
  <li>Teste hidrostático (quando necessário)</li>
  <li>Recarga com CO₂ de alta pureza</li>
  <li>Pesagem final e certificação</li>
  <li>Reinstalação e teste funcional</li>
</ol>

<h2>Vida útil dos cilindros de CO₂</h2>
<p>Não há uma vida útil definida para cilindros de CO₂, desde que aprovados nos testes hidrostáticos periódicos. Cilindros reprovados no teste hidrostático devem ser descartados e substituídos.</p>
    `,
  },
};

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const post = blogPosts.find(p => p.slug === slug);
  const content = articleContent[slug || ""];

  if (!post || !content) {
    return (
      <Layout>
        <div className="container" style={{ padding: "5rem 0", textAlign: "center" }}>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "2rem", color: "var(--gray-900)", marginBottom: "1rem" }}>Artigo não encontrado</h1>
          <Link href="/blog" className="btn-primary">Ver todos os artigos <ArrowRight size={14} /></Link>
        </div>
      </Layout>
    );
  }

  const related = blogPosts.filter(p => p.slug !== slug && p.category === post.category).slice(0, 3);

  return (
    <Layout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.title,
        "description": post.excerpt,
        "datePublished": post.date,
        "author": { "@type": "Organization", "name": "CO₂ Contra Incêndio" },
        "publisher": { "@type": "Organization", "name": "CO₂ Contra Incêndio", "url": "https://www.co2contraincendio.com" },
        "url": `https://www.co2contraincendio.com/blog/${slug}`,
        "keywords": post.keywords.join(", "),
      })}} />

      {/* HERO */}
      <section style={{ position: "relative", height: "clamp(280px,38vh,380px)", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${post.image})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="hero-overlay" style={{ position: "absolute", inset: 0 }} />
        <div className="container" style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ maxWidth: "700px" }}>
            <div style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", marginBottom: "0.75rem" }}>
              <Link href="/" style={{ color: "rgba(255,255,255,0.55)" }}>Home</Link>
              <span style={{ margin: "0 0.5rem", color: "rgba(255,255,255,0.35)" }}>›</span>
              <Link href="/blog" style={{ color: "rgba(255,255,255,0.55)" }}>Blog</Link>
              <span style={{ margin: "0 0.5rem", color: "rgba(255,255,255,0.35)" }}>›</span>
              <span style={{ color: "rgba(255,255,255,0.7)" }}>{post.category}</span>
            </div>
            <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: "clamp(1.5rem,4vw,2.25rem)", color: "#fff", lineHeight: 1.2, marginBottom: "1rem" }}>{post.title}</h1>
            <div style={{ display: "flex", gap: "1.25rem", color: "rgba(255,255,255,0.7)", fontSize: "0.8125rem" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}><Clock size={12} /> {post.readTime} de leitura</span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}><Tag size={12} /> {post.category}</span>
              <span>{post.date}</span>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section style={{ padding: "5rem 0", background: "#fff" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr min(680px,100%) 1fr", gap: "0" }}>
            <div />
            <div>
              <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--gray-500)", fontSize: "0.875rem", marginBottom: "2.5rem" }}>
                <ArrowLeft size={14} /> Voltar ao Blog
              </Link>

              <div className="article-content" dangerouslySetInnerHTML={{ __html: content.html }} />

              {/* KEYWORDS */}
              <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--gray-200)" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--gray-500)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Palavras-chave</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {post.keywords.map(k => (
                    <span key={k} style={{ background: "var(--gray-100)", color: "var(--gray-600)", fontSize: "0.75rem", padding: "0.25rem 0.75rem" }}>{k}</span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div style={{ marginTop: "3rem", background: "var(--red)", padding: "2.5rem" }}>
                <h3 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "1.5rem", color: "#fff", marginBottom: "0.75rem" }}>Precisa de um especialista?</h3>
                <p style={{ color: "rgba(255,255,255,0.82)", lineHeight: 1.75, marginBottom: "1.5rem" }}>Nossa equipe técnica está pronta para avaliar sua necessidade e apresentar a solução mais adequada.</p>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  <Link href="/contato" className="btn-outline-white">Solicitar Orçamento <ArrowRight size={14} /></Link>
                  <a href="https://wa.me/5531973581278" target="_blank" rel="noopener noreferrer" className="btn-outline-white">WhatsApp</a>
                </div>
              </div>
            </div>
            <div />
          </div>
        </div>
      </section>

      {/* RELATED */}
      {related.length > 0 && (
        <section className="section-light" style={{ padding: "4rem 0" }}>
          <div className="container">
            <div style={{ marginBottom: "2rem" }}>
              <div className="section-label">Leia também</div>
              <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "1.5rem", color: "var(--gray-900)" }}>Artigos Relacionados</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "1.5rem" }}>
              {related.map(r => (
                <Link key={r.slug} href={`/blog/${r.slug}`} style={{ textDecoration: "none" }}>
                  <div style={{ border: "1.5px solid var(--gray-200)", overflow: "hidden", transition: "border-color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--red)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--gray-200)"}>
                    <div style={{ backgroundImage: `url(${r.image})`, backgroundSize: "cover", backgroundPosition: "center", height: "160px" }} />
                    <div style={{ padding: "1.25rem" }}>
                      <h3 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "1.0625rem", color: "var(--gray-900)", lineHeight: 1.3, marginBottom: "0.5rem" }}>{r.title}</h3>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--red)", fontSize: "0.75rem", fontWeight: 700 }}>Ler artigo <ArrowRight size={11} /></div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}
