import { useState } from "react";
import { trpc } from "@/lib/trpc";
import SaasDashboardLayout from "@/components/SaasDashboardLayout";
import { useSaasAuth } from "@/contexts/SaasAuthContext";
import { useLocation } from "wouter";
import { toast } from "sonner";

const COMPANY_TYPES = [
  { value: "shopping", label: "Shopping" },
  { value: "industria", label: "Indústria" },
  { value: "comercio", label: "Comércio" },
  { value: "residencial", label: "Residencial" },
  { value: "outro", label: "Outro" },
];

const TYPE_LABELS: Record<string, string> = {
  shopping: "Shopping",
  industria: "Indústria",
  comercio: "Comércio",
  residencial: "Residencial",
  outro: "Outro",
};

export default function Clientes() {
  const { isAuthenticated, isAdmin } = useSaasAuth();
  const [, setLocation] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    cnpj: "",
    type: "comercio" as "shopping" | "industria" | "comercio" | "residencial" | "outro",
    address: "",
    phone: "",
    email: "",
  });

  if (!isAuthenticated) {
    setLocation("/app/login");
    return null;
  }

  if (!isAdmin) {
    return (
      <SaasDashboardLayout>
        <div style={{ padding: 40, textAlign: "center" }}>
          <p style={{ color: "#C0392B", fontFamily: "Barlow Condensed, sans-serif", fontSize: 18 }}>
            ACESSO RESTRITO — Apenas administradores podem gerenciar clientes.
          </p>
        </div>
      </SaasDashboardLayout>
    );
  }

  const utils = trpc.useUtils();
  const { data: companies, isLoading } = trpc.saas.companies.list.useQuery();

  const createMutation = trpc.saas.companies.create.useMutation({
    onSuccess: () => {
      utils.saas.companies.list.invalidate();
      setShowForm(false);
      resetForm();
      toast.success("Cliente cadastrado com sucesso");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.saas.companies.update.useMutation({
    onSuccess: () => {
      utils.saas.companies.list.invalidate();
      setShowForm(false);
      setEditId(null);
      resetForm();
      toast.success("Cliente atualizado");
    },
    onError: (e) => toast.error(e.message),
  });

  function resetForm() {
    setForm({ name: "", cnpj: "", type: "comercio", address: "", phone: "", email: "" });
  }

  function handleEdit(c: NonNullable<typeof companies>[0]) {
    setEditId(c.id);
    setForm({
      name: c.name,
      cnpj: c.cnpj ?? "",
      type: (c.type as typeof form.type) ?? "comercio",
      address: c.address ?? "",
      phone: c.phone ?? "",
      email: c.email ?? "",
    });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editId) {
      updateMutation.mutate({ id: editId, ...form });
    } else {
      createMutation.mutate(form);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid #D0D0D0",
    borderRadius: 2,
    fontFamily: "Inter, sans-serif",
    fontSize: 13,
    color: "#1A1A1A",
    background: "#FAFAFA",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: "Barlow Condensed, sans-serif",
    fontSize: 11,
    fontWeight: 700,
    color: "#555",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: 4,
  };

  return (
    <SaasDashboardLayout>
      <div style={{ padding: "32px 32px 48px", maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 11, fontWeight: 700, color: "#C0392B", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>
              GESTÃO DE CLIENTES
            </div>
            <h1 style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 28, fontWeight: 700, color: "#111", margin: 0, letterSpacing: "0.02em" }}>
              EMPRESAS CADASTRADAS
            </h1>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setEditId(null); resetForm(); }}
            style={{
              background: "#C0392B",
              color: "#fff",
              border: "none",
              borderRadius: 2,
              padding: "10px 20px",
              fontFamily: "Barlow Condensed, sans-serif",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.08em",
              cursor: "pointer",
            }}
          >
            {showForm ? "CANCELAR" : "+ NOVO CLIENTE"}
          </button>
        </div>

        {/* Formulário */}
        {showForm && (
          <div style={{ background: "#fff", border: "1px solid #E0E0E0", borderTop: "3px solid #C0392B", borderRadius: 2, padding: 24, marginBottom: 28 }}>
            <h3 style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 16, fontWeight: 700, color: "#111", margin: "0 0 20px", letterSpacing: "0.06em" }}>
              {editId ? "EDITAR CLIENTE" : "CADASTRAR NOVO CLIENTE"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Razão Social *</label>
                  <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Nome da empresa" />
                </div>
                <div>
                  <label style={labelStyle}>CNPJ</label>
                  <input style={inputStyle} value={form.cnpj} onChange={e => setForm(f => ({ ...f, cnpj: e.target.value }))} placeholder="00.000.000/0001-00" />
                </div>
                <div>
                  <label style={labelStyle}>Tipo</label>
                  <select style={inputStyle} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as typeof form.type }))}>
                    {COMPANY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Endereço</label>
                  <input style={inputStyle} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Rua, número, bairro, cidade" />
                </div>
                <div>
                  <label style={labelStyle}>Telefone</label>
                  <input style={inputStyle} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(31) 9 9999-9999" />
                </div>
                <div>
                  <label style={labelStyle}>E-mail</label>
                  <input style={inputStyle} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="contato@empresa.com.br" />
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditId(null); resetForm(); }}
                  style={{ padding: "8px 20px", border: "1px solid #D0D0D0", background: "#fff", borderRadius: 2, fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#555" }}
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  style={{ padding: "8px 24px", background: "#C0392B", color: "#fff", border: "none", borderRadius: 2, fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em" }}
                >
                  {(createMutation.isPending || updateMutation.isPending) ? "SALVANDO..." : (editId ? "ATUALIZAR" : "CADASTRAR")}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabela */}
        <div style={{ background: "#fff", border: "1px solid #E0E0E0", borderRadius: 2, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#111" }}>
                {["EMPRESA", "CNPJ", "TIPO", "TELEFONE", "E-MAIL", "STATUS", "AÇÕES"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontFamily: "Barlow Condensed, sans-serif", fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: "0.1em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#888", fontFamily: "Inter, sans-serif", fontSize: 13 }}>
                    Carregando...
                  </td>
                </tr>
              ) : !companies?.length ? (
                <tr>
                  <td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#888", fontFamily: "Inter, sans-serif", fontSize: 13 }}>
                    Nenhum cliente cadastrado. Clique em "+ NOVO CLIENTE" para começar.
                  </td>
                </tr>
              ) : companies.map((c, i) => (
                <tr key={c.id} style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA", borderBottom: "1px solid #F0F0F0" }}>
                  <td style={{ padding: "10px 14px", fontFamily: "Barlow Condensed, sans-serif", fontSize: 14, fontWeight: 600, color: "#111" }}>{c.name}</td>
                  <td style={{ padding: "10px 14px", fontFamily: "Inter, sans-serif", fontSize: 12, color: "#555" }}>{c.cnpj ?? "—"}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ background: "#F0F0F0", color: "#333", padding: "2px 8px", borderRadius: 2, fontFamily: "Barlow Condensed, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em" }}>
                      {TYPE_LABELS[c.type ?? "outro"] ?? c.type}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px", fontFamily: "Inter, sans-serif", fontSize: 12, color: "#555" }}>{c.phone ?? "—"}</td>
                  <td style={{ padding: "10px 14px", fontFamily: "Inter, sans-serif", fontSize: 12, color: "#555" }}>{c.email ?? "—"}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{
                      background: c.active ? "#E8F5E9" : "#FFEBEE",
                      color: c.active ? "#2E7D32" : "#C0392B",
                      padding: "2px 8px",
                      borderRadius: 2,
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                    }}>
                      {c.active ? "ATIVO" : "INATIVO"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <button
                      onClick={() => handleEdit(c)}
                      style={{ background: "none", border: "1px solid #C0392B", color: "#C0392B", borderRadius: 2, padding: "4px 12px", fontFamily: "Barlow Condensed, sans-serif", fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em" }}
                    >
                      EDITAR
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {companies && companies.length > 0 && (
          <div style={{ marginTop: 12, fontFamily: "Inter, sans-serif", fontSize: 12, color: "#888" }}>
            {companies.length} cliente{companies.length !== 1 ? "s" : ""} cadastrado{companies.length !== 1 ? "s" : ""} — {companies.filter(c => c.active).length} ativo{companies.filter(c => c.active).length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </SaasDashboardLayout>
  );
}
