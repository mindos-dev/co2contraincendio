import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useSaasAuth } from "@/contexts/SaasAuthContext";
import { toast } from "sonner";

export default function Notificacoes() {
  const { user } = useSaasAuth();
  const companyId = user?.companyId ?? 0;

  const { data: settings, refetch } = trpc.saas.notifications.getSettings.useQuery(
    { companyId },
    { enabled: companyId > 0 }
  );

  const saveMutation = trpc.saas.notifications.saveSettings.useMutation({
    onSuccess: () => { toast.success("Configurações salvas com sucesso"); refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const testEmailMutation = trpc.saas.notifications.testEmail.useMutation({
    onSuccess: (d) => {
      const ok = d.results.some(r => r.success);
      ok ? toast.success("E-mail de teste enviado com sucesso") : toast.error("Falha ao enviar e-mail de teste — verifique as credenciais SMTP");
    },
    onError: (e) => toast.error(e.message),
  });
  const testWaMutation = trpc.saas.notifications.testWhatsapp.useMutation({
    onSuccess: (d) => {
      const ok = d.results.some(r => r.success);
      ok ? toast.success("WhatsApp de teste enviado com sucesso") : toast.error("Falha ao enviar WhatsApp — verifique as credenciais da Evolution API");
    },
    onError: (e) => toast.error(e.message),
  });

  const [emailEnabled, setEmailEnabled] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [emailList, setEmailList] = useState("");
  const [phoneList, setPhoneList] = useState("");
  const [daysBeforeAlert, setDaysBeforeAlert] = useState(30);
  const [testEmail, setTestEmail] = useState("");
  const [testPhone, setTestPhone] = useState("");

  useEffect(() => {
    if (settings) {
      setEmailEnabled(settings.emailEnabled);
      setWhatsappEnabled(settings.whatsappEnabled);
      setEmailList(settings.emailRecipients ? JSON.parse(settings.emailRecipients).join("\n") : "");
      setPhoneList(settings.whatsappNumbers ? JSON.parse(settings.whatsappNumbers).join("\n") : "");
      setDaysBeforeAlert(settings.daysBeforeAlert);
    }
  }, [settings]);

  function handleSave() {
    const emails = emailList.split("\n").map(e => e.trim()).filter(Boolean);
    const phones = phoneList.split("\n").map(p => p.trim()).filter(Boolean);
    saveMutation.mutate({ companyId, emailEnabled, whatsappEnabled, emailRecipients: emails, whatsappNumbers: phones, daysBeforeAlert });
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#f5f5f5", minHeight: "100vh", padding: "2rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <div style={{ width: "4px", height: "28px", background: "#c0392b", borderRadius: "2px" }} />
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.75rem", fontWeight: 700, color: "#111", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
            Configurações de Notificações
          </h1>
        </div>
        <p style={{ color: "#666", fontSize: "0.875rem", marginLeft: "1.25rem" }}>
          Configure os canais de alerta automático para vencimento de equipamentos
        </p>
      </div>

      {/* Pipeline visual */}
      <div style={{ background: "#111", borderRadius: "8px", padding: "1.25rem 1.5rem", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0", overflowX: "auto" }}>
        {[
          { icon: "🗄️", label: "Banco de Dados" },
          { icon: "⏰", label: "Scheduler Diário" },
          { icon: "📅", label: "Verifica Datas" },
          { icon: "🔔", label: "Dispara Alertas" },
          { icon: "📧", label: "E-mail / WhatsApp" },
          { icon: "✅", label: "Registra Evento" },
        ].map((step, i, arr) => (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ textAlign: "center", minWidth: "90px" }}>
              <div style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>{step.icon}</div>
              <div style={{ color: "#aaa", fontSize: "0.7rem", fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.05em" }}>{step.label}</div>
            </div>
            {i < arr.length - 1 && (
              <div style={{ color: "#c0392b", fontSize: "1.25rem", margin: "0 0.5rem", paddingBottom: "1rem" }}>→</div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* E-mail */}
        <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderTop: "3px solid #c0392b", borderRadius: "6px", padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "#111", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
              📧 Notificações por E-mail
            </h2>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <div
                onClick={() => setEmailEnabled(!emailEnabled)}
                style={{
                  width: "44px", height: "24px", borderRadius: "12px",
                  background: emailEnabled ? "#c0392b" : "#ccc",
                  position: "relative", cursor: "pointer", transition: "background 0.2s",
                }}
              >
                <div style={{
                  width: "20px", height: "20px", borderRadius: "50%", background: "#fff",
                  position: "absolute", top: "2px", left: emailEnabled ? "22px" : "2px",
                  transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                }} />
              </div>
              <span style={{ fontSize: "0.8rem", color: emailEnabled ? "#c0392b" : "#999", fontWeight: 600 }}>
                {emailEnabled ? "ATIVO" : "INATIVO"}
              </span>
            </label>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>
              Destinatários (um por linha)
            </label>
            <textarea
              value={emailList}
              onChange={e => setEmailList(e.target.value)}
              disabled={!emailEnabled}
              placeholder="responsavel@empresa.com.br&#10;tecnico@empresa.com.br"
              style={{
                width: "100%", minHeight: "100px", padding: "0.6rem 0.75rem",
                border: "1px solid #ddd", borderRadius: "4px", fontSize: "0.875rem",
                fontFamily: "monospace", resize: "vertical", boxSizing: "border-box",
                background: emailEnabled ? "#fff" : "#f9f9f9", color: "#333",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="email"
              value={testEmail}
              onChange={e => setTestEmail(e.target.value)}
              placeholder="Testar com este e-mail"
              style={{ flex: 1, padding: "0.5rem 0.75rem", border: "1px solid #ddd", borderRadius: "4px", fontSize: "0.875rem" }}
            />
            <button
              onClick={() => testEmail && testEmailMutation.mutate({ email: testEmail, companyId })}
              disabled={!testEmail || testEmailMutation.isPending}
              style={{
                padding: "0.5rem 1rem", background: "#111", color: "#fff",
                border: "none", borderRadius: "4px", fontSize: "0.8rem", cursor: "pointer",
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, textTransform: "uppercase",
                opacity: !testEmail ? 0.5 : 1,
              }}
            >
              {testEmailMutation.isPending ? "..." : "Testar"}
            </button>
          </div>

          <div style={{ marginTop: "0.75rem", padding: "0.75rem", background: "#f9f9f9", borderRadius: "4px", fontSize: "0.75rem", color: "#666" }}>
            <strong>Configuração SMTP:</strong> Defina as variáveis de ambiente <code>SMTP_HOST</code>, <code>SMTP_PORT</code>, <code>SMTP_USER</code> e <code>SMTP_PASS</code> no painel de Secrets.
          </div>
        </div>

        {/* WhatsApp */}
        <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderTop: "3px solid #25D366", borderRadius: "6px", padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "#111", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
              💬 Notificações por WhatsApp
            </h2>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <div
                onClick={() => setWhatsappEnabled(!whatsappEnabled)}
                style={{
                  width: "44px", height: "24px", borderRadius: "12px",
                  background: whatsappEnabled ? "#25D366" : "#ccc",
                  position: "relative", cursor: "pointer", transition: "background 0.2s",
                }}
              >
                <div style={{
                  width: "20px", height: "20px", borderRadius: "50%", background: "#fff",
                  position: "absolute", top: "2px", left: whatsappEnabled ? "22px" : "2px",
                  transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                }} />
              </div>
              <span style={{ fontSize: "0.8rem", color: whatsappEnabled ? "#25D366" : "#999", fontWeight: 600 }}>
                {whatsappEnabled ? "ATIVO" : "INATIVO"}
              </span>
            </label>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>
              Números (com DDI, um por linha)
            </label>
            <textarea
              value={phoneList}
              onChange={e => setPhoneList(e.target.value)}
              disabled={!whatsappEnabled}
              placeholder="+5511999999999&#10;+5521988888888"
              style={{
                width: "100%", minHeight: "100px", padding: "0.6rem 0.75rem",
                border: "1px solid #ddd", borderRadius: "4px", fontSize: "0.875rem",
                fontFamily: "monospace", resize: "vertical", boxSizing: "border-box",
                background: whatsappEnabled ? "#fff" : "#f9f9f9", color: "#333",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="text"
              value={testPhone}
              onChange={e => setTestPhone(e.target.value)}
              placeholder="+5511999999999"
              style={{ flex: 1, padding: "0.5rem 0.75rem", border: "1px solid #ddd", borderRadius: "4px", fontSize: "0.875rem" }}
            />
            <button
              onClick={() => testPhone && testWaMutation.mutate({ phone: testPhone, companyId })}
              disabled={!testPhone || testWaMutation.isPending}
              style={{
                padding: "0.5rem 1rem", background: "#25D366", color: "#fff",
                border: "none", borderRadius: "4px", fontSize: "0.8rem", cursor: "pointer",
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, textTransform: "uppercase",
                opacity: !testPhone ? 0.5 : 1,
              }}
            >
              {testWaMutation.isPending ? "..." : "Testar"}
            </button>
          </div>

          <div style={{ marginTop: "0.75rem", padding: "0.75rem", background: "#f9f9f9", borderRadius: "4px", fontSize: "0.75rem", color: "#666" }}>
            <strong>Evolution API:</strong> Defina <code>EVOLUTION_API_URL</code>, <code>EVOLUTION_API_KEY</code> e <code>EVOLUTION_INSTANCE</code> no painel de Secrets.
          </div>
        </div>
      </div>

      {/* Configurações gerais */}
      <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: "6px", padding: "1.5rem", marginTop: "1.5rem" }}>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "#111", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1.25rem" }}>
          ⚙️ Configurações Gerais
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>
              Alertar com antecedência (dias)
            </label>
            <input
              type="number"
              min={1}
              max={365}
              value={daysBeforeAlert}
              onChange={e => setDaysBeforeAlert(Number(e.target.value))}
              style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #ddd", borderRadius: "4px", fontSize: "0.875rem", boxSizing: "border-box" }}
            />
            <p style={{ fontSize: "0.7rem", color: "#999", marginTop: "0.3rem" }}>
              Alertas serão enviados {daysBeforeAlert} dias antes do vencimento
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <div style={{ padding: "0.75rem", background: "#fff8e1", border: "1px solid #ffe082", borderRadius: "4px", fontSize: "0.75rem", color: "#856404" }}>
              <strong>⏰ Scheduler:</strong> O job diário executa automaticamente às <strong>07:00 BRT</strong> todos os dias. Use o botão "Executar Agora" na página de Alertas para testar manualmente.
            </div>
          </div>
        </div>
      </div>

      {/* Botão salvar */}
      <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending || companyId === 0}
          style={{
            padding: "0.75rem 2rem",
            background: saveMutation.isPending ? "#999" : "#c0392b",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            fontSize: "0.9rem",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            cursor: saveMutation.isPending ? "not-allowed" : "pointer",
          }}
        >
          {saveMutation.isPending ? "Salvando..." : "Salvar Configurações"}
        </button>
      </div>
    </div>
  );
}
