import { useState } from "react";
import { Calculator, ChevronRight, AlertCircle, CheckCircle } from "lucide-react";

// ─── Dados técnicos baseados em NFPA 17 / NBR 15808 ──────────────────────────

type RiskType = {
  id: string;
  label: string;
  description: string;
  agents: AgentOption[];
};

type AgentOption = {
  agent: string;
  norm: string;
  densityKgM3: number;
  minKg: number;
  notes: string;
};

const RISK_TYPES: RiskType[] = [
  {
    id: "cnc",
    label: "Máquina CNC / Usinagem",
    description: "Compartimento de usinagem com fluido de corte e cavacos metálicos",
    agents: [
      { agent: "CO₂ (Dióxido de Carbono)", norm: "NFPA 12", densityKgM3: 0.65, minKg: 2.5, notes: "Eficaz para metais em ignição. Não deixa resíduo." },
      { agent: "Dry Chemical ABC", norm: "NFPA 17", densityKgM3: 0.48, minKg: 2.5, notes: "Ação rápida. Deixa resíduo em pó — requer limpeza pós-acionamento." },
      { agent: "FK-5-1-12 (Novec 1230)", norm: "NFPA 2001", densityKgM3: 0.06, minKg: 1.5, notes: "Zero resíduo. Ideal para equipamentos de precisão. GWP ≈ 1." },
    ],
  },
  {
    id: "painel",
    label: "Painel Elétrico / CCM",
    description: "Quadro de distribuição, centro de controle de motores ou UPS",
    agents: [
      { agent: "FK-5-1-12 (Novec 1230)", norm: "NFPA 2001", densityKgM3: 0.06, minKg: 1.0, notes: "Dielétrico até 35 kV. Zero resíduo. Preferencial para equipamentos energizados." },
      { agent: "CO₂ (Dióxido de Carbono)", norm: "NFPA 12", densityKgM3: 0.65, minKg: 2.0, notes: "Eficaz mas exige evacuação prévia. Concentração mínima de 34%." },
      { agent: "FM-200 (HFC-227ea)", norm: "NFPA 2001", densityKgM3: 0.07, minKg: 1.2, notes: "Agente limpo consolidado. GWP = 3220 — em transição regulatória." },
    ],
  },
  {
    id: "veiculo",
    label: "Veículo Off-Road / Mineração",
    description: "Compartimento de motor, transmissão e área de combustível",
    agents: [
      { agent: "Dry Chemical ABC (Purple-K)", norm: "NFPA 17 / ISO 3941", densityKgM3: 0.48, minKg: 4.5, notes: "Padrão para veículos pesados. Resistente a vibração e poeira." },
      { agent: "Dual Agent (ABC + AFFF)", norm: "NFPA 17A", densityKgM3: 0.50, minKg: 5.0, notes: "Combina pó seco com espuma AFFF. Ideal para combustíveis líquidos." },
      { agent: "CO₂ (Dióxido de Carbono)", norm: "NFPA 12", densityKgM3: 0.65, minKg: 3.0, notes: "Usado em compartimentos herméticos. Menos eficaz em espaços abertos." },
    ],
  },
  {
    id: "industrial",
    label: "Máquina Industrial / Prensa",
    description: "Injetoras de plástico, prensas hidráulicas, extrusoras",
    agents: [
      { agent: "Dry Chemical ABC", norm: "NFPA 17", densityKgM3: 0.48, minKg: 5.0, notes: "Aplicação local sobre zona de risco. Ação rápida em óleo mineral." },
      { agent: "CO₂ (Total Flooding)", norm: "NFPA 12", densityKgM3: 0.65, minKg: 6.0, notes: "Total flooding para compartimentos fechados. Concentração mínima 34%." },
      { agent: "AFFF (Espuma Aquosa)", norm: "NFPA 11", densityKgM3: 0.40, minKg: 4.0, notes: "Ideal para grandes superfícies de óleo. Requer sistema de drenagem." },
    ],
  },
  {
    id: "gerador",
    label: "Gerador / Grupo Motogerador",
    description: "Sala de gerador diesel com motor, painel e tanque de combustível",
    agents: [
      { agent: "CO₂ (Total Flooding)", norm: "NFPA 12 / NFPA 110", densityKgM3: 0.65, minKg: 8.0, notes: "Padrão para salas de gerador. Concentração de 34% para hidrocarbonetos." },
      { agent: "FK-5-1-12 (Novec 1230)", norm: "NFPA 2001", densityKgM3: 0.06, minKg: 3.0, notes: "Para zona do painel de controle. Zero resíduo, seguro para eletrônica." },
      { agent: "Water Mist (Névoa d'Água)", norm: "NFPA 750", densityKgM3: 0.35, minKg: 0, notes: "Resfriamento eficaz para motores. Requer pressão de 35-100 bar." },
    ],
  },
  {
    id: "laboratorio",
    label: "Laboratório / Farmácia",
    description: "Capelas de exaustão, armazenamento de solventes e reagentes",
    agents: [
      { agent: "FK-5-1-12 (Novec 1230)", norm: "NFPA 2001 / RDC 50", densityKgM3: 0.06, minKg: 1.5, notes: "Zero resíduo, zero toxicidade. Preferencial para ambientes de pesquisa." },
      { agent: "CO₂ (Dióxido de Carbono)", norm: "NFPA 12", densityKgM3: 0.65, minKg: 2.5, notes: "Eficaz para solventes. Exige evacuação — NFPA 12 §5.1.3." },
    ],
  },
];

function calcKg(densityKgM3: number, volumeM3: number, minKg: number): number {
  const calc = densityKgM3 * volumeM3;
  return Math.max(calc, minKg);
}

export default function CalculadoraAgente() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedRisk, setSelectedRisk] = useState<RiskType | null>(null);
  const [volume, setVolume] = useState<string>("");
  const [selectedAgent, setSelectedAgent] = useState<AgentOption | null>(null);

  const volumeNum = parseFloat(volume) || 0;

  const handleRiskSelect = (risk: RiskType) => {
    setSelectedRisk(risk);
    setSelectedAgent(null);
    setStep(2);
  };

  const handleAgentSelect = (agent: AgentOption) => {
    setSelectedAgent(agent);
    setStep(3);
  };

  const reset = () => {
    setStep(1);
    setSelectedRisk(null);
    setSelectedAgent(null);
    setVolume("");
  };

  const qty = selectedAgent ? calcKg(selectedAgent.densityKgM3, volumeNum, selectedAgent.minKg) : 0;

  return (
    <div style={{ background: "#fff", border: "1px solid #E5E7EB", padding: "32px 28px", maxWidth: 720, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, background: "#C8102E", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Calculator size={20} color="#fff" />
        </div>
        <div>
          <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 20, color: "#0a1628", margin: 0 }}>
            Calculadora de Agente Extintor
          </h3>
          <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>
            Estimativa técnica baseada em NFPA 17 / NFPA 2001 / NBR 15808
          </p>
        </div>
      </div>

      {/* Progress */}
      <div style={{ display: "flex", gap: 0, marginBottom: 28 }}>
        {[
          { n: 1, label: "Tipo de Risco" },
          { n: 2, label: "Agente e Volume" },
          { n: 3, label: "Resultado" },
        ].map((s, i) => (
          <div key={s.n} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: step >= s.n ? "#C8102E" : "#E5E7EB", color: step >= s.n ? "#fff" : "#9CA3AF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                {step > s.n ? "✓" : s.n}
              </div>
              <span style={{ fontSize: 10, color: step >= s.n ? "#C8102E" : "#9CA3AF", marginTop: 4, textAlign: "center", fontWeight: step >= s.n ? 700 : 400 }}>{s.label}</span>
            </div>
            {i < 2 && <div style={{ flex: 1, height: 2, background: step > s.n ? "#C8102E" : "#E5E7EB", margin: "0 4px", marginBottom: 16 }} />}
          </div>
        ))}
      </div>

      {/* Step 1 — Tipo de Risco */}
      {step === 1 && (
        <div>
          <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}>
            Selecione o tipo de risco a ser protegido:
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {RISK_TYPES.map((risk) => (
              <button
                key={risk.id}
                onClick={() => handleRiskSelect(risk)}
                style={{ textAlign: "left", padding: "16px 14px", border: "1px solid #E5E7EB", background: "#F9FAFB", cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#C8102E"; e.currentTarget.style.background = "#FFF5F5"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.background = "#F9FAFB"; }}
              >
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, color: "#0a1628", marginBottom: 4 }}>{risk.label}</div>
                <div style={{ fontSize: 11, color: "#9CA3AF", lineHeight: 1.4 }}>{risk.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2 — Agente e Volume */}
      {step === 2 && selectedRisk && (
        <div>
          <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", padding: "10px 14px", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircle size={14} color="#059669" />
            <span style={{ fontSize: 13, color: "#059669", fontWeight: 600 }}>Risco selecionado: {selectedRisk.label}</span>
          </div>

          {/* Volume */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8, letterSpacing: "0.04em" }}>
              VOLUME DO COMPARTIMENTO PROTEGIDO (m³)
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                placeholder="Ex: 2.5"
                style={{ flex: 1, padding: "10px 12px", border: "1px solid #D1D5DB", fontSize: 14, outline: "none", borderRight: "none" }}
              />
              <div style={{ padding: "10px 14px", background: "#F3F4F6", border: "1px solid #D1D5DB", fontSize: 13, color: "#6B7280", fontWeight: 600 }}>m³</div>
            </div>
            <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 6 }}>
              Calcule: Comprimento × Largura × Altura do compartimento
            </p>
          </div>

          {/* Agentes */}
          <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 12 }}>Selecione o agente extintor:</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {selectedRisk.agents.map((agent) => {
              const estKg = volumeNum > 0 ? calcKg(agent.densityKgM3, volumeNum, agent.minKg) : null;
              return (
                <button
                  key={agent.agent}
                  onClick={() => handleAgentSelect(agent)}
                  style={{ textAlign: "left", padding: "16px 16px", border: "1px solid #E5E7EB", background: "#F9FAFB", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#C8102E"; e.currentTarget.style.background = "#FFF5F5"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.background = "#F9FAFB"; }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 15, color: "#0a1628", marginBottom: 4 }}>{agent.agent}</div>
                    <div style={{ fontSize: 11, color: "#9CA3AF" }}>{agent.norm} · {agent.notes}</div>
                  </div>
                  {estKg !== null && (
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 22, color: "#C8102E" }}>{estKg.toFixed(1)} kg</div>
                      <div style={{ fontSize: 10, color: "#9CA3AF" }}>estimado</div>
                    </div>
                  )}
                  <ChevronRight size={16} color="#9CA3AF" />
                </button>
              );
            })}
          </div>

          <button onClick={reset} style={{ marginTop: 16, background: "none", border: "none", color: "#9CA3AF", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>
            ← Voltar ao início
          </button>
        </div>
      )}

      {/* Step 3 — Resultado */}
      {step === 3 && selectedAgent && selectedRisk && (
        <div>
          <div style={{ background: "#0a1628", padding: "28px 24px", marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: "#8899BB", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", marginBottom: 8 }}>
              ESTIMATIVA TÉCNICA — {selectedRisk.label.toUpperCase()}
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 56, color: "#C8102E", lineHeight: 1 }}>
                  {qty.toFixed(1)}
                </div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 20, color: "#fff" }}>kg de {selectedAgent.agent}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { label: "Norma", value: selectedAgent.norm },
                { label: "Volume protegido", value: `${volumeNum.toFixed(1)} m³` },
                { label: "Densidade de projeto", value: `${selectedAgent.densityKgM3} kg/m³` },
                { label: "Mínimo técnico", value: `${selectedAgent.minKg} kg` },
              ].map((item) => (
                <div key={item.label} style={{ background: "#ffffff0D", padding: "10px 12px" }}>
                  <div style={{ fontSize: 10, color: "#8899BB", marginBottom: 3, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em" }}>{item.label.toUpperCase()}</div>
                  <div style={{ fontSize: 14, color: "#fff", fontWeight: 600 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#FEF3C7", border: "1px solid #FDE68A", padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10 }}>
            <AlertCircle size={16} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: "#92400E", margin: 0, lineHeight: 1.6 }}>
              <strong>Atenção:</strong> Esta calculadora fornece uma estimativa preliminar baseada em parâmetros normativos. O dimensionamento definitivo deve ser realizado por engenheiro habilitado CREA, com ART, conforme {selectedAgent.norm} e NBR 15808.
            </p>
          </div>

          <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", padding: "12px 16px", marginBottom: 20 }}>
            <p style={{ fontSize: 12, color: "#065F46", margin: 0, lineHeight: 1.6 }}>
              <strong>Observação técnica:</strong> {selectedAgent.notes}
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a
              href="/contato"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", background: "#C8102E", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", textDecoration: "none" }}
            >
              SOLICITAR PROJETO TÉCNICO
            </a>
            <button
              onClick={reset}
              style={{ padding: "12px 20px", background: "transparent", border: "1px solid #D1D5DB", color: "#6B7280", cursor: "pointer", fontSize: 13 }}
            >
              Nova Calculação
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
