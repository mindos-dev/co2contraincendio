import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useSaasAuth } from "@/contexts/SaasAuthContext";
import SaasDashboardLayout from "@/components/SaasDashboardLayout";

// ─── Constantes ──────────────────────────────────────────────────────────────

const CATEGORIES = ["extintor", "hidrante", "sprinkler", "detector", "sinalizacao", "complementar"] as const;
type CategoryType = typeof CATEGORIES[number];

const CATEGORY_LABELS: Record<CategoryType, string> = {
  extintor: "Extintor",
  hidrante: "Hidrante",
  sprinkler: "Sprinkler",
  detector: "Detector",
  sinalizacao: "Sinalização",
  complementar: "Complementar",
};

const CATEGORY_NORMS: Record<CategoryType, string> = {
  extintor: "ABNT NBR 12693 / NBR 15808",
  hidrante: "ABNT NBR 13714 / NBR 10897",
  sprinkler: "ABNT NBR 10897 / NFPA 13",
  detector: "ABNT NBR 17240 / NBR 9441",
  sinalizacao: "ABNT NBR 13434 / NBR 7195",
  complementar: "Verificar norma aplicável",
};

const CATEGORY_DESCRIPTIONS: Record<CategoryType, string> = {
  extintor: "Extintores de incêndio portáteis e sobre rodas (CO₂, Pó ABC, Pó BC, Água, Espuma, Halon)",
  hidrante: "Sistemas de hidrantes e mangotinhos — colunas, registros, mangueiras e esguichos",
  sprinkler: "Chuveiros automáticos (sprinklers) — sistemas de supressão por água nebulizada",
  detector: "Detectores de fumaça, calor, chama e gás — centrais de alarme e acionadores manuais",
  sinalizacao: "Placas fotoluminescentes, mapas de risco, iluminação de emergência e rotas de fuga",
  complementar: "Equipamentos complementares: CO₂ fixo, FM-200, INERGEN, espuma, dilúvio",
};

const AGENT_OPTIONS: Record<CategoryType, string[]> = {
  extintor: ["CO₂", "Pó ABC", "Pó BC", "Água Pressurizada", "Espuma Mecânica", "Halon 1211"],
  hidrante: ["Água", "Espuma"],
  sprinkler: ["Água", "Água Nebulizada", "Espuma AFFF"],
  detector: ["Fumaça Iônico", "Fumaça Óptico", "Calor Fixo", "Calor Diferencial", "Chama UV/IR", "Gás Combustível", "Gás CO", "Acionador Manual"],
  sinalizacao: ["Fotoluminescente", "LED Emergência", "Placa Rígida", "Placa Adesiva"],
  complementar: ["CO₂ Fixo", "FM-200 (HFC-227ea)", "INERGEN (IG-541)", "Espuma AFFF", "Dilúvio", "Névoa d'Água"],
};

const STATUS_LABELS: Record<string, string> = {
  ok: "Em dia",
  proximo_vencimento: "Próx. vencimento",
  vencido: "Vencido",
  inativo: "Inativo",
};

const STATUS_COLORS: Record<string, string> = {
  ok: "#16A34A",
  proximo_vencimento: "#D97706",
  vencido: "#C8102E",
  inativo: "#8A8A8A",
};

// ─── Estilos ─────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  padding: "8px 10px",
  border: "1px solid #D8D8D8",
  background: "#fff",
  fontSize: 13,
  color: "#111111",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: "0.08em",
  color: "#4A4A4A",
  marginBottom: 4,
  textTransform: "uppercase",
};

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', sans-serif",
  fontWeight: 700,
  fontSize: 13,
  letterSpacing: "0.08em",
  color: "#111111",
  textTransform: "uppercase",
  borderBottom: "2px solid #C8102E",
  paddingBottom: 6,
  marginBottom: 14,
  marginTop: 4,
};

const tooltipStyle: React.CSSProperties = {
  fontSize: 10,
  color: "#8A8A8A",
  marginTop: 3,
  lineHeight: 1.4,
};

// ─── Tipo do formulário ───────────────────────────────────────────────────────

interface EquipmentForm {
  // Identificação
  code: string;
  category: CategoryType;
  subType: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  patrimonyTag: string;
  // Localização
  installationLocation: string;
  floor: string;
  sector: string;
  // Dados técnicos comuns
  agentType: string;
  capacity: string;
  pressure: string;
  riskClass: string;
  // Extintor específico
  weightKg: string;
  workingPressureBar: string;
  testPressureBar: string;
  // Sprinkler específico
  flowRate: string;
  activationTemp: string;
  coverageArea: string;
  // Detector específico
  detectorType: string;
  sensitivity: string;
  // Sinalização específico
  signageType: string;
  signageDimensions: string;
  signageColor: string;
  // Normativo
  normReference: string;
  certificationUL: string;
  // Datas
  installationDate: string;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  // Observações
  description: string;
}

const EMPTY_FORM: EquipmentForm = {
  code: "", category: "extintor", subType: "", manufacturer: "", model: "", serialNumber: "", patrimonyTag: "",
  installationLocation: "", floor: "", sector: "",
  agentType: "", capacity: "", pressure: "", riskClass: "",
  weightKg: "", workingPressureBar: "", testPressureBar: "",
  flowRate: "", activationTemp: "", coverageArea: "",
  detectorType: "", sensitivity: "",
  signageType: "", signageDimensions: "", signageColor: "",
  normReference: "", certificationUL: "",
  installationDate: "", lastMaintenanceDate: "", nextMaintenanceDate: "",
  description: "",
};

// ─── Componente principal ─────────────────────────────────────────────────────

export default function Equipamentos() {
  const { user } = useSaasAuth();
  const companyId = user?.companyId ?? undefined;

  // Filtros
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [wizardStep, setWizardStep] = useState(1); // 1=Tipo, 2=Identificação, 3=Técnico, 4=Normativo
  const [form, setForm] = useState<EquipmentForm>({ ...EMPTY_FORM });
  const [formError, setFormError] = useState("");

  const { data, isLoading, refetch } = trpc.saas.equipment.list.useQuery({
    companyId,
    search: search || undefined,
    category: category || undefined,
    status: status || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const createMutation = trpc.saas.equipment.create.useMutation({
    onSuccess: () => {
      setShowModal(false);
      setForm({ ...EMPTY_FORM });
      setWizardStep(1);
      void refetch();
    },
    onError: (e: { message: string }) => setFormError(e.message),
  });

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

  const openModal = () => {
    setForm({ ...EMPTY_FORM });
    setWizardStep(1);
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = () => {
    setFormError("");
    if (!form.code.trim()) { setFormError("Código é obrigatório."); return; }
    createMutation.mutate({
      ...form,
      companyId: companyId ?? 0,
      installationDate: form.installationDate || undefined,
      lastMaintenanceDate: form.lastMaintenanceDate || undefined,
      nextMaintenanceDate: form.nextMaintenanceDate || undefined,
    });
  };

  // Agentes disponíveis para a categoria selecionada
  const agentOptions = useMemo(() => AGENT_OPTIONS[form.category] ?? [], [form.category]);

  // ─── Wizard Steps ───────────────────────────────────────────────────────────

  const WizardStep1 = () => (
    <div>
      <div style={sectionTitleStyle}>Etapa 1 — Selecione o Tipo de Equipamento</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setForm(f => ({ ...f, category: cat, agentType: "", subType: "" }))}
            style={{
              padding: "14px 16px",
              border: `2px solid ${form.category === cat ? "#C8102E" : "#D8D8D8"}`,
              background: form.category === cat ? "#FFF0F0" : "#fff",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.15s",
            }}
          >
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: "0.06em", color: form.category === cat ? "#C8102E" : "#111111" }}>
              {CATEGORY_LABELS[cat]}
            </div>
            <div style={{ fontSize: 10, color: "#8A8A8A", marginTop: 3, lineHeight: 1.4 }}>
              {CATEGORY_DESCRIPTIONS[cat]}
            </div>
            <div style={{ fontSize: 9, color: "#C8102E", marginTop: 4, fontWeight: 600, letterSpacing: "0.05em" }}>
              {CATEGORY_NORMS[cat]}
            </div>
          </button>
        ))}
      </div>
      <div style={{ marginTop: 16, padding: "10px 14px", background: "#F8F8F8", border: "1px solid #D8D8D8", fontSize: 11, color: "#4A4A4A", lineHeight: 1.5 }}>
        <strong>Dica:</strong> A seleção do tipo determina quais campos técnicos serão exibidos nas etapas seguintes, conforme as normas ABNT NBR aplicáveis.
      </div>
    </div>
  );

  const WizardStep2 = () => (
    <div>
      <div style={sectionTitleStyle}>Etapa 2 — Identificação e Localização</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={labelStyle}>Código de Identificação *</label>
          <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} required style={inputStyle} placeholder="EXT-001, HID-002..." />
          <p style={tooltipStyle}>Código único do equipamento no sistema. Ex: EXT-001, SPK-B2-003</p>
        </div>
        <div>
          <label style={labelStyle}>Tag Patrimonial</label>
          <input value={form.patrimonyTag} onChange={e => setForm(f => ({ ...f, patrimonyTag: e.target.value }))} style={inputStyle} placeholder="PAT-2024-001" />
          <p style={tooltipStyle}>Número de patrimônio interno da empresa</p>
        </div>
        <div>
          <label style={labelStyle}>Fabricante</label>
          <input value={form.manufacturer} onChange={e => setForm(f => ({ ...f, manufacturer: e.target.value }))} style={inputStyle} placeholder="Amerex, Kidde, Tyco..." />
        </div>
        <div>
          <label style={labelStyle}>Modelo</label>
          <input value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} style={inputStyle} placeholder="Modelo comercial" />
        </div>
        <div>
          <label style={labelStyle}>Número de Série</label>
          <input value={form.serialNumber} onChange={e => setForm(f => ({ ...f, serialNumber: e.target.value }))} style={inputStyle} />
          <p style={tooltipStyle}>Gravado no corpo do equipamento</p>
        </div>
        <div>
          <label style={labelStyle}>Subtipo</label>
          <input value={form.subType} onChange={e => setForm(f => ({ ...f, subType: e.target.value }))} style={inputStyle} placeholder="Portátil, Sobre Rodas, Fixo..." />
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ ...sectionTitleStyle, borderColor: "#111111", marginTop: 0 }}>Localização Física</div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelStyle}>Localização Detalhada *</label>
            <input value={form.installationLocation} onChange={e => setForm(f => ({ ...f, installationLocation: e.target.value }))} style={inputStyle} placeholder="Corredor A, próximo à saída de emergência" />
            <p style={tooltipStyle}>Descrição precisa para localização rápida em emergências</p>
          </div>
          <div>
            <label style={labelStyle}>Andar / Pavimento</label>
            <input value={form.floor} onChange={e => setForm(f => ({ ...f, floor: e.target.value }))} style={inputStyle} placeholder="Térreo, 1º Andar..." />
          </div>
          <div>
            <label style={labelStyle}>Setor / Área</label>
            <input value={form.sector} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))} style={inputStyle} placeholder="Cozinha, Almoxarifado..." />
          </div>
        </div>
      </div>
    </div>
  );

  const WizardStep3 = () => (
    <div>
      <div style={sectionTitleStyle}>Etapa 3 — Dados Técnicos ({CATEGORY_LABELS[form.category]})</div>
      <div style={{ marginBottom: 12, padding: "8px 12px", background: "#F0F4FF", border: "1px solid #C8D8FF", fontSize: 11, color: "#1A3A8A" }}>
        <strong>Norma aplicável:</strong> {CATEGORY_NORMS[form.category]}
      </div>

      {/* Campos comuns a todas as categorias */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={labelStyle}>Agente / Tipo</label>
          <select value={form.agentType} onChange={e => setForm(f => ({ ...f, agentType: e.target.value }))} style={inputStyle}>
            <option value="">Selecione...</option>
            {agentOptions.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Capacidade</label>
          <input value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} style={inputStyle} placeholder={form.category === "extintor" ? "6 kg, 4 kg, 12 kg..." : form.category === "hidrante" ? "2½\", 1½\"..." : "..."} />
        </div>
        <div>
          <label style={labelStyle}>Classe de Risco</label>
          <select value={form.riskClass} onChange={e => setForm(f => ({ ...f, riskClass: e.target.value }))} style={inputStyle}>
            <option value="">Selecione...</option>
            <option value="A">Classe A — Sólidos combustíveis</option>
            <option value="B">Classe B — Líquidos inflamáveis</option>
            <option value="C">Classe C — Equipamentos elétricos</option>
            <option value="D">Classe D — Metais combustíveis</option>
            <option value="K">Classe K — Óleos de cozinha</option>
            <option value="ABC">Classe ABC — Múltipla</option>
            <option value="BC">Classe BC — Múltipla</option>
          </select>
          <p style={tooltipStyle}>Conforme ABNT NBR 12693 — Classe de incêndio para o qual o equipamento é indicado</p>
        </div>
        <div>
          <label style={labelStyle}>Pressão de Trabalho</label>
          <input value={form.pressure} onChange={e => setForm(f => ({ ...f, pressure: e.target.value }))} style={inputStyle} placeholder="14 kgf/cm², 10 bar..." />
        </div>
      </div>

      {/* Campos específicos por categoria */}
      {form.category === "extintor" && (
        <div style={{ marginTop: 14 }}>
          <div style={{ ...sectionTitleStyle, borderColor: "#D97706", marginTop: 0 }}>Dados Específicos — Extintor (NBR 12693)</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Peso Total (kg)</label>
              <input value={form.weightKg} onChange={e => setForm(f => ({ ...f, weightKg: e.target.value }))} style={inputStyle} placeholder="8,5 kg" />
              <p style={tooltipStyle}>Peso total com carga (agente + recipiente)</p>
            </div>
            <div>
              <label style={labelStyle}>Pressão de Trabalho (bar)</label>
              <input value={form.workingPressureBar} onChange={e => setForm(f => ({ ...f, workingPressureBar: e.target.value }))} style={inputStyle} placeholder="14 bar" />
            </div>
            <div>
              <label style={labelStyle}>Pressão de Teste (bar)</label>
              <input value={form.testPressureBar} onChange={e => setForm(f => ({ ...f, testPressureBar: e.target.value }))} style={inputStyle} placeholder="25 bar" />
              <p style={tooltipStyle}>Pressão de ensaio hidrostático (NBR 12962)</p>
            </div>
          </div>
        </div>
      )}

      {form.category === "sprinkler" && (
        <div style={{ marginTop: 14 }}>
          <div style={{ ...sectionTitleStyle, borderColor: "#0284C7", marginTop: 0 }}>Dados Específicos — Sprinkler (NBR 10897 / NFPA 13)</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Vazão (L/min)</label>
              <input value={form.flowRate} onChange={e => setForm(f => ({ ...f, flowRate: e.target.value }))} style={inputStyle} placeholder="80 L/min" />
            </div>
            <div>
              <label style={labelStyle}>Temperatura de Ativação (°C)</label>
              <input value={form.activationTemp} onChange={e => setForm(f => ({ ...f, activationTemp: e.target.value }))} style={inputStyle} placeholder="68°C, 79°C, 93°C..." />
              <p style={tooltipStyle}>Temperatura nominal do bulbo de vidro (cor indicativa)</p>
            </div>
            <div>
              <label style={labelStyle}>Área de Cobertura (m²)</label>
              <input value={form.coverageArea} onChange={e => setForm(f => ({ ...f, coverageArea: e.target.value }))} style={inputStyle} placeholder="9 m², 12 m²..." />
            </div>
          </div>
        </div>
      )}

      {form.category === "detector" && (
        <div style={{ marginTop: 14 }}>
          <div style={{ ...sectionTitleStyle, borderColor: "#7C3AED", marginTop: 0 }}>Dados Específicos — Detector (NBR 17240 / NBR 9441)</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Tipo de Detector</label>
              <input value={form.detectorType} onChange={e => setForm(f => ({ ...f, detectorType: e.target.value }))} style={inputStyle} placeholder="Iônico, Óptico, Termovelocimétrico..." />
            </div>
            <div>
              <label style={labelStyle}>Sensibilidade</label>
              <input value={form.sensitivity} onChange={e => setForm(f => ({ ...f, sensitivity: e.target.value }))} style={inputStyle} placeholder="Alta, Média, Baixa / %obs/m" />
            </div>
          </div>
        </div>
      )}

      {form.category === "sinalizacao" && (
        <div style={{ marginTop: 14 }}>
          <div style={{ ...sectionTitleStyle, borderColor: "#16A34A", marginTop: 0 }}>Dados Específicos — Sinalização (NBR 13434)</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Tipo de Placa</label>
              <input value={form.signageType} onChange={e => setForm(f => ({ ...f, signageType: e.target.value }))} style={inputStyle} placeholder="Saída de Emergência, Extintor..." />
            </div>
            <div>
              <label style={labelStyle}>Dimensões (cm)</label>
              <input value={form.signageDimensions} onChange={e => setForm(f => ({ ...f, signageDimensions: e.target.value }))} style={inputStyle} placeholder="20x30 cm" />
            </div>
            <div>
              <label style={labelStyle}>Cor / Padrão</label>
              <input value={form.signageColor} onChange={e => setForm(f => ({ ...f, signageColor: e.target.value }))} style={inputStyle} placeholder="Verde, Vermelho, Amarelo" />
            </div>
          </div>
        </div>
      )}

      {/* Datas */}
      <div style={{ marginTop: 14 }}>
        <div style={{ ...sectionTitleStyle, borderColor: "#111111", marginTop: 0 }}>Datas de Controle</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelStyle}>Data de Instalação</label>
            <input type="date" value={form.installationDate} onChange={e => setForm(f => ({ ...f, installationDate: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Última Manutenção</label>
            <input type="date" value={form.lastMaintenanceDate} onChange={e => setForm(f => ({ ...f, lastMaintenanceDate: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Próxima Manutenção *</label>
            <input type="date" value={form.nextMaintenanceDate} onChange={e => setForm(f => ({ ...f, nextMaintenanceDate: e.target.value }))} style={inputStyle} />
            <p style={tooltipStyle}>Prazo máximo conforme norma aplicável</p>
          </div>
        </div>
      </div>
    </div>
  );

  const WizardStep4 = () => (
    <div>
      <div style={sectionTitleStyle}>Etapa 4 — Dados Normativos e Certificações</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={labelStyle}>Norma de Referência</label>
          <input value={form.normReference} onChange={e => setForm(f => ({ ...f, normReference: e.target.value }))} style={inputStyle} placeholder={CATEGORY_NORMS[form.category]} />
          <p style={tooltipStyle}>Norma ABNT NBR ou NFPA que rege este equipamento</p>
        </div>
        <div>
          <label style={labelStyle}>Certificação UL / FM / INMETRO</label>
          <input value={form.certificationUL} onChange={e => setForm(f => ({ ...f, certificationUL: e.target.value }))} style={inputStyle} placeholder="UL Listed, FM Approved, INMETRO..." />
          <p style={tooltipStyle}>Certificações internacionais e nacionais do equipamento</p>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <label style={labelStyle}>Observações Técnicas</label>
        <textarea
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          rows={4}
          style={{ ...inputStyle, resize: "vertical" }}
          placeholder="Condições especiais de instalação, histórico relevante, observações de inspeção..."
        />
      </div>

      {/* Resumo do cadastro */}
      <div style={{ marginTop: 16, padding: "14px 16px", background: "#F8F8F8", border: "1px solid #D8D8D8" }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", color: "#111111", marginBottom: 10 }}>RESUMO DO CADASTRO</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 12 }}>
          <div><span style={{ color: "#8A8A8A" }}>Código:</span> <strong>{form.code || "—"}</strong></div>
          <div><span style={{ color: "#8A8A8A" }}>Tipo:</span> <strong>{CATEGORY_LABELS[form.category]}</strong></div>
          <div><span style={{ color: "#8A8A8A" }}>Agente:</span> <strong>{form.agentType || "—"}</strong></div>
          <div><span style={{ color: "#8A8A8A" }}>Capacidade:</span> <strong>{form.capacity || "—"}</strong></div>
          <div><span style={{ color: "#8A8A8A" }}>Localização:</span> <strong>{form.installationLocation || "—"}</strong></div>
          <div><span style={{ color: "#8A8A8A" }}>Próx. Manutenção:</span> <strong>{form.nextMaintenanceDate || "—"}</strong></div>
          <div><span style={{ color: "#8A8A8A" }}>Norma:</span> <strong>{form.normReference || CATEGORY_NORMS[form.category]}</strong></div>
          <div><span style={{ color: "#8A8A8A" }}>Fabricante:</span> <strong>{form.manufacturer || "—"}</strong></div>
        </div>
      </div>
    </div>
  );

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <SaasDashboardLayout>
      <div style={{ maxWidth: 1200 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div style={{ width: 24, height: 3, background: "#C8102E", marginBottom: 10 }} />
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 24, letterSpacing: "0.04em", color: "#111111", margin: 0 }}>
              EQUIPAMENTOS
            </h1>
            <p style={{ color: "#8A8A8A", fontSize: 13, marginTop: 4 }}>
              Cadastro e controle conforme ABNT NBR 12693, NBR 13714, NBR 10897, NBR 17240
            </p>
          </div>
          <button
            onClick={openModal}
            style={{ padding: "9px 18px", background: "#C8102E", color: "#fff", border: "none", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", cursor: "pointer" }}
          >
            + NOVO EQUIPAMENTO
          </button>
        </div>

        {/* Filtros */}
        <div style={{ background: "#fff", border: "1px solid #D8D8D8", borderTop: "3px solid #111111", padding: "16px 20px", marginBottom: 20 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", color: "#111111", marginBottom: 12 }}>
            FILTROS DE BUSCA
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 12, alignItems: "end" }}>
            <div>
              <label style={labelStyle}>Busca Rápida</label>
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Código, localização, fabricante, nº série..." style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Categoria</label>
              <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} style={inputStyle}>
                <option value="">Todas</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} style={inputStyle}>
                <option value="">Todos</option>
                <option value="ok">Em dia</option>
                <option value="proximo_vencimento">Próx. vencimento</option>
                <option value="vencido">Vencido</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
            <button onClick={() => { setSearch(""); setCategory(""); setStatus(""); setPage(1); }} style={{ padding: "8px 14px", background: "transparent", border: "1px solid #D8D8D8", color: "#4A4A4A", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", cursor: "pointer", whiteSpace: "nowrap" }}>
              LIMPAR
            </button>
          </div>
          {(search || category || status) && (
            <div style={{ marginTop: 10, fontSize: 12, color: "#8A8A8A" }}>
              {data?.total ?? 0} resultado(s)
              {search && <span style={{ marginLeft: 8, background: "#F2F2F2", padding: "2px 8px", fontSize: 11 }}>"{search}"</span>}
              {category && <span style={{ marginLeft: 6, background: "#F2F2F2", padding: "2px 8px", fontSize: 11 }}>{CATEGORY_LABELS[category as CategoryType] ?? category}</span>}
              {status && <span style={{ marginLeft: 6, background: "#F2F2F2", padding: "2px 8px", fontSize: 11, color: STATUS_COLORS[status] }}>{STATUS_LABELS[status]}</span>}
            </div>
          )}
        </div>

        {/* Tabela */}
        <div style={{ background: "#fff", border: "1px solid #D8D8D8" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#111111" }}>
                {["CÓDIGO", "TIPO", "AGENTE / CAPACIDADE", "LOCALIZAÇÃO", "NORMA", "PRÓX. MANUTENÇÃO", "STATUS", ""].map(h => (
                  <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", color: "#D8D8D8" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} style={{ padding: "32px", textAlign: "center", color: "#8A8A8A", fontSize: 13 }}>Carregando equipamentos...</td></tr>
              ) : !data?.items?.length ? (
                <tr>
                  <td colSpan={8} style={{ padding: "40px", textAlign: "center" }}>
                    <div style={{ color: "#8A8A8A", fontSize: 13, marginBottom: 8 }}>Nenhum equipamento cadastrado.</div>
                    <button onClick={openModal} style={{ padding: "8px 16px", background: "#C8102E", color: "#fff", border: "none", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.06em", cursor: "pointer" }}>
                      + CADASTRAR PRIMEIRO EQUIPAMENTO
                    </button>
                  </td>
                </tr>
              ) : (data as { items: Array<{ id: number; code: string; category: string | null; installationLocation: string | null; agentType: string | null; capacity: string | null; nextMaintenanceDate: Date | null; status: string | null; normReference: string | null }> }).items.map((eq, i: number) => (
                <tr key={eq.id} style={{ background: i % 2 === 0 ? "#fff" : "#F8F8F8", borderBottom: "1px solid #F2F2F2" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 700, fontSize: 13, color: "#111111", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.04em" }}>{eq.code}</td>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: "#4A4A4A" }}>{CATEGORY_LABELS[eq.category as CategoryType] ?? eq.category}</td>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: "#4A4A4A" }}>{[eq.agentType, eq.capacity].filter(Boolean).join(" / ") || "—"}</td>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: "#4A4A4A" }}>{eq.installationLocation ?? "—"}</td>
                  <td style={{ padding: "10px 14px", fontSize: 10, color: "#8A8A8A" }}>{eq.normReference ?? CATEGORY_NORMS[eq.category as CategoryType] ?? "—"}</td>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: "#4A4A4A" }}>{eq.nextMaintenanceDate ? String(eq.nextMaintenanceDate).split("T")[0] : "—"}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ display: "inline-block", padding: "3px 10px", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", background: `${STATUS_COLORS[eq.status ?? "ok"]}18`, color: STATUS_COLORS[eq.status ?? "ok"], border: `1px solid ${STATUS_COLORS[eq.status ?? "ok"]}40` }}>
                      {STATUS_LABELS[eq.status ?? "ok"] ?? eq.status}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px", display: "flex", gap: 10, alignItems: "center" }}>
                    <a href={`/app/equipamentos/${eq.id}`} style={{ fontSize: 11, color: "#0a1628", textDecoration: "none", fontWeight: 700, padding: "3px 10px", border: "1px solid #0a1628", letterSpacing: "0.04em" }}>FICHA</a>
                    <a href={`/equipamento/${eq.code}`} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#C8102E", textDecoration: "none", fontWeight: 600 }}>QR ▦</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 16 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: "6px 14px", background: "transparent", border: "1px solid #D8D8D8", cursor: "pointer", fontSize: 12 }}>‹ ANT</button>
            <span style={{ fontSize: 12, color: "#4A4A4A" }}>Página {page} de {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: "6px 14px", background: "transparent", border: "1px solid #D8D8D8", cursor: "pointer", fontSize: 12 }}>PRÓX ›</button>
          </div>
        )}

        {/* Modal Wizard */}
        {showModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
            <div style={{ background: "#fff", width: "100%", maxWidth: 680, maxHeight: "92vh", overflowY: "auto", display: "flex", flexDirection: "column" }}>
              {/* Header do modal */}
              <div style={{ background: "#111111", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                <div>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "0.06em", color: "#fff" }}>
                    NOVO EQUIPAMENTO — {CATEGORY_LABELS[form.category]}
                  </span>
                  <div style={{ fontSize: 10, color: "#8A8A8A", marginTop: 2 }}>{CATEGORY_NORMS[form.category]}</div>
                </div>
                <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "#8A8A8A", cursor: "pointer", fontSize: 18 }}>✕</button>
              </div>

              {/* Progress bar */}
              <div style={{ display: "flex", background: "#F2F2F2", borderBottom: "1px solid #D8D8D8", flexShrink: 0 }}>
                {[
                  { step: 1, label: "Tipo" },
                  { step: 2, label: "Identificação" },
                  { step: 3, label: "Técnico" },
                  { step: 4, label: "Normativo" },
                ].map(({ step, label }) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setWizardStep(step)}
                    style={{
                      flex: 1,
                      padding: "10px 8px",
                      background: wizardStep === step ? "#C8102E" : wizardStep > step ? "#111111" : "transparent",
                      color: wizardStep >= step ? "#fff" : "#8A8A8A",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 700,
                      fontSize: 11,
                      letterSpacing: "0.06em",
                      borderRight: step < 4 ? "1px solid #D8D8D8" : "none",
                      transition: "all 0.15s",
                    }}
                  >
                    {step}. {label}
                  </button>
                ))}
              </div>

              {/* Conteúdo do wizard */}
              <div style={{ padding: "20px 24px", flex: 1 }}>
                {wizardStep === 1 && <WizardStep1 />}
                {wizardStep === 2 && <WizardStep2 />}
                {wizardStep === 3 && <WizardStep3 />}
                {wizardStep === 4 && <WizardStep4 />}

                {formError && (
                  <div style={{ marginTop: 12, background: "#FFF0F0", border: "1px solid #C8102E", padding: "9px 11px", color: "#C8102E", fontSize: 12 }}>
                    {formError}
                  </div>
                )}
              </div>

              {/* Footer do modal */}
              <div style={{ padding: "14px 24px", borderTop: "1px solid #D8D8D8", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, background: "#F8F8F8" }}>
                <div style={{ display: "flex", gap: 8 }}>
                  {wizardStep > 1 && (
                    <button type="button" onClick={() => setWizardStep(s => s - 1)} style={{ padding: "9px 18px", background: "transparent", border: "1px solid #D8D8D8", color: "#4A4A4A", fontSize: 12, cursor: "pointer" }}>
                      ‹ VOLTAR
                    </button>
                  )}
                  <button type="button" onClick={() => setShowModal(false)} style={{ padding: "9px 18px", background: "transparent", border: "1px solid #D8D8D8", color: "#4A4A4A", fontSize: 12, cursor: "pointer" }}>
                    CANCELAR
                  </button>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {wizardStep < 4 ? (
                    <button
                      type="button"
                      onClick={() => setWizardStep(s => s + 1)}
                      style={{ padding: "9px 18px", background: "#111111", color: "#fff", border: "none", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", cursor: "pointer" }}
                    >
                      PRÓXIMO ›
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={createMutation.isPending}
                      style={{ padding: "9px 22px", background: "#C8102E", color: "#fff", border: "none", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", cursor: "pointer" }}
                    >
                      {createMutation.isPending ? "SALVANDO..." : "SALVAR EQUIPAMENTO"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SaasDashboardLayout>
  );
}
