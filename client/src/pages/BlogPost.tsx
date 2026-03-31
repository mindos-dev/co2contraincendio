import { Link, useParams } from "wouter";
import Layout from "../components/Layout";
import SEOHead from "../components/SEOHead";
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

  "intelbras-sistema-alarme-incendio-nbr-17240": {
    html: `
<h2>Intelbras e a Liderança no Mercado Brasileiro de Alarme de Incêndio</h2>
<p>A <strong>Intelbras S/A</strong> consolidou-se como a principal fabricante brasileira de sistemas de detecção e alarme de incêndio (SDAI), oferecendo um portfólio completo que abrange desde detectores autônomos para residências até centrais endereçáveis para grandes complexos industriais e hospitalares. Um marco histórico da empresa foi ser a <strong>primeira fabricante nacional a obter certificação de conformidade acreditada conforme ABNT NBR 7240</strong>, o que garante que seus produtos atendem aos mais rigorosos critérios de desempenho e confiabilidade do mercado brasileiro.</p>

<h2>Portfólio de Produtos: Convencional vs. Endereçável</h2>
<p>A linha de produtos da Intelbras para proteção contra incêndio é estrategicamente dividida em dois grandes grupos, atendendo diferentes escalas e complexidades de projeto:</p>

<h3>Sistemas Convencionais</h3>
<p>As centrais convencionais (CIC 06L, CIC 12L, CIC 24L) são indicadas para projetos de pequeno e médio porte, onde o custo-benefício é prioritário. Neste modelo, os dispositivos são agrupados por zonas, e o painel indica apenas qual zona foi ativada — não o dispositivo exato. São amplamente utilizadas em condomínios residenciais, pequenos comércios e edificações com até quatro pavimentos.</p>

<h3>Sistemas Endereçáveis</h3>
<p>As centrais endereçáveis (CIE 1060, CIE 1125, CIE 1250, CIE 2500) são a escolha técnica para grandes edificações, como hospitais, shoppings, aeroportos e plantas industriais. Cada dispositivo possui um endereço único no laço, permitindo que o painel identifique com precisão o ponto exato de disparo. Até 16 centrais CIE 1250 podem ser interconectadas, formando uma rede de monitoramento para complexos de grande porte.</p>

<h2>Principais Dispositivos do Portfólio Intelbras</h2>
<table border="1" cellpadding="8" cellspacing="0" style="width:100%;border-collapse:collapse;">
  <thead><tr style="background:#c00;color:#fff;"><th>Dispositivo</th><th>Modelo</th><th>Tecnologia</th><th>Aplicação</th></tr></thead>
  <tbody>
    <tr><td>Detector de Fumaça Óptico Endereçável</td><td>DFE 521</td><td>Câmara óptica de dispersão</td><td>Ambientes com fumaça visível</td></tr>
    <tr><td>Detector de Fumaça Óptico Convencional</td><td>DFC 421</td><td>Câmara óptica</td><td>Residencial e comercial</td></tr>
    <tr><td>Detector Térmico Endereçável</td><td>DTE 521</td><td>Termistor NTC</td><td>Cozinhas, garagens, caldeiras</td></tr>
    <tr><td>Acionador Manual com Sirene</td><td>AME 522</td><td>2 em 1 (acionador + sirene)</td><td>Rotas de fuga e escadas</td></tr>
    <tr><td>Sirene Audiovisual</td><td>SAV 521</td><td>Piezoelétrica + LED estroboscópico</td><td>Ambientes ruidosos</td></tr>
    <tr><td>Detector de Gás</td><td>DGC 423</td><td>Eletroquímico</td><td>Cozinhas e garagens</td></tr>
    <tr><td>Módulo Gateway</td><td>GW 521</td><td>Protocolo aberto (BACnet/Modbus)</td><td>Integração com BMS predial</td></tr>
  </tbody>
</table>

<h2>Diferencial Tecnológico: Integração 2 em 1 e Gateway BMS</h2>
<p>Um dos diferenciais mais relevantes da Intelbras é a integração de funções em um único dispositivo. O <strong>Acionador Manual com Sirene AME 522</strong> combina o acionador manual e a sirene audiovisual em um único ponto de instalação, reduzindo o número de dispositivos, o cabeamento necessário e os custos de infraestrutura. Para projetos de alta complexidade, o <strong>Módulo Gateway GW 521</strong> permite que as centrais de incêndio se comuniquem com sistemas de gerenciamento predial (BMS) via protocolos abertos como BACnet e Modbus, integrando o SDAI ao ecossistema de automação do edifício.</p>

<h2>Normas Técnicas Atendidas</h2>
<p>Os produtos Intelbras para alarme de incêndio são desenvolvidos em conformidade com as seguintes normas:</p>
<ul>
  <li><strong>ABNT NBR 17240:2010</strong> — Sistemas de detecção e alarme de incêndio: projeto, instalação, comissionamento e manutenção</li>
  <li><strong>ABNT NBR 7240</strong> — Sistemas de detecção e alarme de incêndio: requisitos de desempenho dos componentes</li>
  <li><strong>ABNT NBR 9441</strong> — Execução de sistemas de detecção e alarme de incêndio (norma substituída, referência histórica)</li>
  <li><strong>EN 54</strong> — Padrão europeu para componentes de sistemas de detecção de incêndio</li>
</ul>

<blockquote>"A certificação conforme ABNT NBR 7240 garante que o sistema foi testado e aprovado pelos mais rigorosos critérios de desempenho e confiabilidade, sendo a Intelbras a primeira fabricante nacional a atingir esse nível de conformidade acreditada."</blockquote>

<h2>Como a CO₂ Contra Incêndio Integra o SDAI Intelbras</h2>
<p>A <strong>CO₂ Contra Incêndio</strong>, sob responsabilidade técnica do Eng. Judson Aleixo Sampaio (CREA/MG 142203671-5), especifica e instala sistemas de detecção e alarme Intelbras integrados aos demais sistemas de proteção ativa — CO₂, saponificante e hidrantes. A integração entre o SDAI e o sistema de supressão garante que, ao detectar um incêndio, o painel acione automaticamente a supressão, interrompa o fornecimento de gás e acione as sirenes de evacuação, tudo de forma coordenada e conforme as exigências do CBMMG para obtenção do AVCB.
    `,
  },

  "bral-bralarmseg-sistemas-deteccao-industrial": {
    html: `
<h2>Bralarmseg: Referência em Proteção Contra Incêndio para Ambientes Industriais</h2>
<p>A <strong>Bralarmseg Equipamentos Eletrônicos Ltda</strong>, conhecida no mercado como Bral Segurança, é um fabricante brasileiro com sede em Curitiba-PR especializado em sistemas de detecção e alarme de incêndio para ambientes de alta exigência. A empresa se destaca pela robustez de seus produtos industriais, pela fabricação de sirenes de longo alcance com aprovação internacional <strong>EN 54-3</strong> e pelo desenvolvimento de soluções para áreas classificadas — ambientes com risco de explosão onde a maioria dos equipamentos convencionais não pode ser utilizada.</p>

<h2>Tecnologia Microprocessada e Comunicação por Barramento</h2>
<p>As centrais endereçáveis da Bralarmseg utilizam <strong>tecnologia de microprocessamento de última geração</strong> com comunicação binária via barramento de dois fios. Este modelo de comunicação permite o monitoramento individualizado de centenas de dispositivos em um único laço, com identificação precisa do ponto de disparo e monitoramento contínuo do estado de cada sensor — incluindo alertas de sujeira nos detectores antes que atinjam o limiar de falha, o que facilita a manutenção preventiva e reduz alarmes falsos.</p>

<h2>Linha de Sirenes: Diferencial para Ambientes Industriais</h2>
<p>Um dos grandes diferenciais da Bralarmseg é sua linha de <strong>sirenes eletromecânicas e eletrônicas de longo alcance</strong>, projetadas para ambientes industriais com alto nível de ruído de fundo. Esses dispositivos possuem aprovação internacional conforme a norma <strong>EN 54-3</strong> (Equipamentos de alarme sonoro para sistemas de detecção de incêndio), o que os torna aceitos em projetos com exigências internacionais de conformidade. A pressão sonora elevada garante que o alarme seja audível mesmo em fundições, plantas de manufatura e galpões logísticos de grande porte.</p>

<h2>Principais Produtos e Aplicações</h2>
<table border="1" cellpadding="8" cellspacing="0" style="width:100%;border-collapse:collapse;">
  <thead><tr style="background:#c00;color:#fff;"><th>Produto</th><th>Tecnologia</th><th>Aplicação Principal</th></tr></thead>
  <tbody>
    <tr><td>Central Endereçável Microprocessada</td><td>Barramento 2 fios, loop Classe B/A</td><td>Indústrias, hospitais, shoppings</td></tr>
    <tr><td>Detector de Fumaça Óptico</td><td>Câmara de dispersão óptica</td><td>Ambientes com fumaça visível</td></tr>
    <tr><td>Detector de Calor Termovelocimétrico</td><td>Sensor de temperatura + taxa de variação</td><td>Cozinhas, caldeiras, garagens</td></tr>
    <tr><td>Sirene Eletromecânica de Longo Alcance</td><td>Motor eletromecânico, EN 54-3</td><td>Plantas industriais, áreas externas</td></tr>
    <tr><td>Sirene Eletrônica Audiovisual</td><td>Piezoelétrica + LED, EN 54-3</td><td>Ambientes internos com ruído moderado</td></tr>
    <tr><td>Acionador Manual Rearmável</td><td>Contato seco com LED de estado</td><td>Rotas de fuga, escadas</td></tr>
    <tr><td>Painel Repetidor de Indicação</td><td>Display LCD, comunicação RS-485</td><td>Portarias, centrais de segurança</td></tr>
  </tbody>
</table>

<h2>Monitoramento Remoto e Integração com Sistemas de Segurança</h2>
<p>As centrais Bralarmseg suportam protocolos de monitoramento remoto via <strong>TCP/IP e linha telefônica</strong>, permitindo que empresas de monitoramento e equipes de segurança recebam alertas em tempo real. O software gerenciador da empresa permite a visualização dos eventos em plantas baixas digitais, facilitando a localização do foco de incêndio e a coordenação da resposta de emergência. Além disso, a integração nativa com sistemas de iluminação de emergência e sinalização industrial oferece um ecossistema de segurança unificado, reduzindo a complexidade de integração entre diferentes sistemas.</p>

<h2>Normas e Certificações</h2>
<ul>
  <li><strong>ABNT NBR 17240</strong> — Projeto e instalação de sistemas de detecção e alarme de incêndio</li>
  <li><strong>EN 54-3</strong> — Certificação europeia para dispositivos de alarme sonoro</li>
  <li><strong>ABNT NBR 9441</strong> — Referência histórica para execução de sistemas de detecção</li>
</ul>

<h2>Quando Especificar a Bralarmseg</h2>
<p>A Bralarmseg é a escolha técnica recomendada para projetos que envolvem <strong>ambientes industriais severos</strong>, grandes áreas externas, plantas com alto nível de ruído de fundo ou instalações que exigem conformidade com normas internacionais para os dispositivos de sinalização. Sua robustez construtiva e as certificações EN 54-3 tornam seus produtos referência para engenheiros que projetam sistemas de proteção em refinarias, plantas químicas, galpões logísticos e infraestruturas críticas.
    `,
  },

  "segurimax-sistema-sem-fio-max-fi-retrofit": {
    html: `
<h2>Segurimax: Inovação em Sistemas de Alarme de Incêndio com Foco em Custo-Benefício</h2>
<p>A <strong>Segurimax</strong> é um dos principais players no mercado brasileiro de proteção contra incêndio, reconhecida por oferecer um portfólio que equilibra alta tecnologia e custo-benefício. Seus equipamentos são desenvolvidos em conformidade com a <strong>ABNT NBR 17240</strong> e possuem certificação internacional <strong>CE</strong> e gestão de qualidade <strong>ISO 9001</strong>, garantindo conformidade com as exigências do Corpo de Bombeiros em todo o território nacional.</p>

<h2>O Sistema MAX-FI: Alarme de Incêndio Sem Fio para Retrofit</h2>
<p>O grande diferencial tecnológico da Segurimax é o <strong>sistema MAX-FI</strong> — uma solução de alarme de incêndio totalmente sem fio que elimina a necessidade de infraestrutura de cabos. Esta tecnologia é especialmente indicada para <strong>retrofit em edificações prontas</strong>, onde a instalação de eletrodutos e cabos seria invasiva, cara e esteticamente indesejável. O MAX-FI é também a solução ideal para prédios históricos tombados pelo patrimônio, onde intervenções estruturais são proibidas ou muito restritas.</p>

<p>O sistema opera com comunicação por radiofrequência bidirecional, garantindo que cada dispositivo confirme o recebimento dos comandos da central. Em caso de falha de comunicação, o sistema gera um alerta de supervisão, mantendo a integridade do monitoramento mesmo sem cabos físicos.</p>

<h2>Linha Completa de Produtos Segurimax</h2>
<table border="1" cellpadding="8" cellspacing="0" style="width:100%;border-collapse:collapse;">
  <thead><tr style="background:#c00;color:#fff;"><th>Linha</th><th>Modelo</th><th>Característica Principal</th><th>Indicação</th></tr></thead>
  <tbody>
    <tr><td>Convencional</td><td>Central 12V</td><td>Custo-benefício, fácil instalação</td><td>Pequeno e médio porte</td></tr>
    <tr><td>Endereçável</td><td>Compact 80E</td><td>Até 80 endereços, compacta</td><td>Edificações de médio porte</td></tr>
    <tr><td>Endereçável</td><td>Smart</td><td>Alta precisão, múltiplos laços</td><td>Hospitais, shoppings</td></tr>
    <tr><td>Endereçável</td><td>Max Pro</td><td>Alta capacidade, redundância</td><td>Grandes complexos industriais</td></tr>
    <tr><td>Sem Fio</td><td>MAX-FI</td><td>Wireless bidirecional, retrofit</td><td>Prédios prontos, patrimônio histórico</td></tr>
    <tr><td>Detector</td><td>Fumaça Linear</td><td>Feixe óptico, grandes vãos</td><td>Galpões, auditórios, igrejas</td></tr>
    <tr><td>Detector</td><td>Monóxido de Carbono</td><td>Sensor eletroquímico</td><td>Garagens, caldeiras a gás</td></tr>
  </tbody>
</table>

<h2>Detector Linear de Fumaça: Proteção de Grandes Vãos</h2>
<p>Para ambientes com grandes vãos livres — como galpões logísticos, auditórios, igrejas e hangares — a Segurimax oferece o <strong>detector linear de fumaça</strong>, que utiliza um feixe de luz infravermelha projetado entre um emissor e um receptor. Quando a fumaça interrompe ou atenua o feixe acima do limiar configurado, o alarme é acionado. Esta solução é tecnicamente superior aos detectores pontuais nestes ambientes, pois cobre grandes áreas com apenas dois dispositivos, reduzindo custos de instalação e manutenção.</p>

<h2>Conformidade com ABNT NBR 17240</h2>
<p>A <strong>ABNT NBR 17240:2010</strong> — "Sistemas de detecção e alarme de incêndio — Projeto, instalação, comissionamento e manutenção" — é a norma brasileira que rege todos os aspectos do SDAI, desde o dimensionamento dos detectores até os procedimentos de manutenção preventiva. Todos os produtos da Segurimax são desenvolvidos para atender integralmente a esta norma, garantindo que os projetos que os especificam estejam em conformidade com as exigências do Corpo de Bombeiros para emissão e renovação do AVCB.
    `,
  },

  "ascael-40-anos-deteccao-incendio-classe-a": {
    html: `
<h2>Ascael: Quatro Décadas Protegendo Vidas com Tecnologia de Ponta</h2>
<p>A <strong>Ascael — Sistemas de Proteção e Segurança Contra Incêndio</strong> é uma das mais tradicionais fabricantes brasileiras do setor, operando desde 1984 com sede própria em São Bernardo do Campo, SP. Com mais de 40 anos de experiência, a empresa desenvolveu um portfólio robusto de sistemas de detecção e alarme de incêndio que abrange desde centrais convencionais para pequenas edificações até sistemas endereçáveis de alta complexidade com arquitetura de <strong>loop Classe A</strong> — a tecnologia mais confiável disponível para ambientes críticos.</p>

<h2>O que é o Loop Classe A e Por que é Superior</h2>
<p>A arquitetura de loop <strong>Classe A</strong> (também chamada de Estilo D na NFPA 72) é o padrão mais elevado de confiabilidade para sistemas de detecção de incêndio. Diferente do loop Classe B (Estilo B), onde um rompimento do cabo deixa parte dos dispositivos sem comunicação, o loop Classe A utiliza uma topologia em anel: o cabo parte da central, percorre todos os dispositivos e retorna à central por um caminho diferente. Desta forma, mesmo que o cabo seja cortado ou danificado em um ponto, todos os dispositivos continuam se comunicando normalmente pelo caminho alternativo.</p>

<blockquote>"O loop Classe A garante que o sistema de detecção continue operando normalmente mesmo em caso de rompimento da fiação — uma exigência crítica em ambientes onde a continuidade da proteção é inegociável, como hospitais, data centers e plantas industriais."</blockquote>

<h2>Principais Linhas de Produtos Ascael</h2>
<table border="1" cellpadding="8" cellspacing="0" style="width:100%;border-collapse:collapse;">
  <thead><tr style="background:#c00;color:#fff;"><th>Linha</th><th>Modelos</th><th>Arquitetura</th><th>Capacidade</th></tr></thead>
  <tbody>
    <tr><td>Endereçável CAX-i</td><td>CAX-i 500, CAX-i 1000</td><td>Loop Classe A/B</td><td>Até 1.000 dispositivos</td></tr>
    <tr><td>Endereçável HORUS</td><td>HORUS 250, HORUS 500</td><td>Loop Classe A</td><td>Até 500 dispositivos/laço</td></tr>
    <tr><td>Endereçável ACDE</td><td>ACDE 24/300</td><td>Loop Classe A</td><td>Até 300 dispositivos</td></tr>
    <tr><td>Convencional</td><td>ACA 24/12, ASAM, Merak</td><td>Zonal</td><td>Até 24 zonas</td></tr>
    <tr><td>Detectores Ópticos</td><td>ADOC, ADOE</td><td>Câmara óptica</td><td>Endereçável e convencional</td></tr>
    <tr><td>Detectores Térmicos</td><td>DTX-i</td><td>Termistor NTC</td><td>Endereçável</td></tr>
    <tr><td>Sirene Audiovisual</td><td>ASAV</td><td>Piezoelétrica + LED</td><td>Convencional e endereçável</td></tr>
  </tbody>
</table>

<h2>Inovação: Spray Aerossol para Teste Funcional de Detectores</h2>
<p>Um diferencial exclusivo da Ascael é a fabricação de <strong>spray aerossol próprio para testes funcionais de detectores de fumaça</strong>. Durante as inspeções periódicas exigidas pela ABNT NBR 17240, é necessário verificar se cada detector responde corretamente à presença de fumaça. O spray aerossol da Ascael simula a fumaça de forma controlada, sem depositar resíduos oleosos ou contaminantes no interior da câmara óptica do sensor, preservando a calibração e a vida útil do detector. Esta solução otimiza o tempo de inspeção e garante a integridade dos sensores ao longo do ciclo de manutenção.</p>

<h2>Certificação ISO 9001:2015 e Conformidade Normativa</h2>
<p>A Ascael opera sob sistema de gestão da qualidade certificado pela <strong>ISO 9001:2015</strong>, o que garante processos de fabricação padronizados, rastreabilidade de componentes e melhoria contínua. Todos os produtos são desenvolvidos em conformidade com a <strong>ABNT NBR 17240</strong>, sendo frequentemente especificados em projetos que exigem conformidade técnica rigorosa para aprovação no Corpo de Bombeiros e obtenção do AVCB.
    `,
  },

  "skyfire-sistema-hibrido-analogico-incendio": {
    html: `
<h2>SKYFIRE: Pioneirismo Tecnológico no Mercado Brasileiro de Detecção de Incêndio</h2>
<p>A <strong>SKYFIRE Comércio de Equipamentos Contra Incêndio Ltda</strong>, com sede em Ribeirão Preto (SP) e unidade em São Paulo, é uma referência consolidada no mercado brasileiro de segurança contra incêndio. A empresa se destaca pelo pioneirismo tecnológico: foi a primeira fabricante nacional a lançar um <strong>sistema híbrido analógico</strong> de detecção de incêndio, que permite a integração de dispositivos cabeados e wireless em uma única central de alarme. Seus equipamentos seguem os rigorosos padrões internacionais <strong>EN 54</strong> (norma europeia para sistemas de detecção de incêndio) e possuem certificação <strong>CE</strong>.</p>

<h2>O Sistema Híbrido Analógico: Tecnologia Exclusiva da SKYFIRE</h2>
<p>O grande diferencial técnico da SKYFIRE é a <strong>linha CEW de sistemas híbridos analógicos</strong>. Nesta arquitetura inovadora, uma única central de alarme pode gerenciar simultaneamente dispositivos cabeados (conectados por laço convencional ou endereçável) e dispositivos wireless (comunicação por radiofrequência), sem necessidade de conversores ou gateways adicionais. Esta flexibilidade é especialmente valiosa em projetos de retrofit — onde parte da edificação já possui infraestrutura de cabos e outra parte não — e em expansões de sistemas existentes.</p>

<p>A comunicação ponto a ponto utilizada nos dispositivos wireless da SKYFIRE evita interferências e garante a entrega confiável dos sinais de alarme e supervisão, mesmo em ambientes com alta densidade de dispositivos de radiofrequência.</p>

<h2>Portfólio Técnico SKYFIRE</h2>
<table border="1" cellpadding="8" cellspacing="0" style="width:100%;border-collapse:collapse;">
  <thead><tr style="background:#c00;color:#fff;"><th>Produto</th><th>Modelo</th><th>Tecnologia</th><th>Capacidade</th></tr></thead>
  <tbody>
    <tr><td>Central Endereçável</td><td>JB-QB-5Ei</td><td>Analógica endereçável, EN 54</td><td>Até 500 pontos</td></tr>
    <tr><td>Central Endereçável Expandida</td><td>JB-QB-5EiX</td><td>Analógica endereçável, EN 54</td><td>Até 2.500 pontos</td></tr>
    <tr><td>Central Híbrida</td><td>Linha CEW</td><td>Cabeado + wireless, analógica</td><td>Configurável por projeto</td></tr>
    <tr><td>Detector de Fumaça Óptico</td><td>Série endereçável</td><td>Câmara óptica, EN 54-7</td><td>Endereçável e convencional</td></tr>
    <tr><td>Detector de Calor</td><td>Série endereçável</td><td>Termistor + termovelocimétrico</td><td>Endereçável</td></tr>
    <tr><td>Detector de Chama</td><td>Série UV/IR</td><td>Ultravioleta e infravermelho</td><td>Ambientes industriais</td></tr>
    <tr><td>Detector de Gás</td><td>Série catalítica</td><td>Sensor catalítico/eletroquímico</td><td>GLP, GN, CO</td></tr>
    <tr><td>Módulo de E/S</td><td>Série MES</td><td>Entrada/saída endereçável</td><td>Integração com outros sistemas</td></tr>
  </tbody>
</table>

<h2>Certificações Internacionais: EN 54 e CE</h2>
<p>A conformidade com a norma europeia <strong>EN 54</strong> — que abrange desde as centrais de controle (EN 54-2) até os detectores de fumaça (EN 54-7), calor (EN 54-5) e dispositivos de alarme sonoro (EN 54-3) — posiciona a SKYFIRE como uma das poucas fabricantes brasileiras com produtos aprovados pelos padrões internacionais mais exigentes. Esta certificação é especialmente relevante para projetos em empresas multinacionais, instalações com requisitos de seguradoras internacionais e obras que exigem conformidade com especificações técnicas globais.</p>

<h2>Garantia de 3 Anos e Suporte Técnico Especializado</h2>
<p>A SKYFIRE oferece <strong>3 anos de garantia</strong> em seus produtos — prazo superior ao padrão do mercado — e disponibiliza treinamentos técnicos gratuitos para instaladores e capacitadores em suas unidades de Ribeirão Preto e São Paulo. Este compromisso com o suporte pós-venda garante que os sistemas instalados operem dentro dos parâmetros de projeto ao longo de todo o ciclo de vida, atendendo às periodicidades de manutenção exigidas pela <strong>ABNT NBR 17240</strong>.
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
      <SEOHead
        title={post.title}
        description={post.excerpt}
        keywords={post.keywords.join(", ")}
        canonical={`/blog/${slug}`}
        breadcrumbs={[
          { name: "Blog", url: "/blog" },
          { name: post.title, url: `/blog/${slug}` }
        ]}
      />
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
