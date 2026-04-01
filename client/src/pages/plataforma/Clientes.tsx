import { useState, useRef, useEffect } from "react";
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

export default function Clientes() {
  const { isAuthenticated, isAdmin } = useSaasAuth();
  const [, setLocation] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importCsv, setImportCsv] = useState("");
  const [importParsed, setImportParsed] = useState<Array<{ name: string; cnpj?: string; email?: string; phone?: string; address?: string; type?: string }>>([]);
  const [importResults, setImportResults] = useState<Array<{ name: string; status: string }> | null>(null);
  const [search, setSearch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    cnpj: "",
    type: "comercio" as "shopping" | "industria" | "comercio" | "residencial" | "outro",
    address: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    if (!isAuthenticated) setLocation("/app/login");
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) return null;

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
  const { data: selectedReport, isLoading: reportLoading } = trpc.saas.reports.company.useQuery(
    { companyId: selectedId! },
    { enabled: !!selectedId }
  );

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

  const importMutation = trpc.saas.importCompanies.fromCsv.useMutation({
    onSuccess: (results) => {
      utils.saas.companies.list.invalidate();
      setImportResults(results as Array<{ name: string; status: string }>);
      const created = results.filter((r: { status: string }) => r.status === "created").length;
      toast.success(`${created} cliente(s) importado(s) com sucesso`);
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
    setSelectedId(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editId) {
      updateMutation.mutate({ id: editId, ...form });
    } else {
      createMutation.mutate(form);
    }
  }

  function handleExportCsv() {
    if (!companies?.length) return;
    const headers = ["ID", "Razão Social", "CNPJ", "Tipo", "Endereço", "Telefone", "E-mail", "Status", "Cadastrado em"];
    const escape = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = companies.map(c => [
      c.id, c.name, c.cnpj ?? "", TYPE_LABELS[c.type ?? "outro"] ?? c.type, c.address ?? "", c.phone ?? "", c.email ?? "",
      c.active ? "Ativo" : "Inativo",
      c.createdAt ? new Date(c.createdAt).toLocaleDateString("pt-BR") : "",
    ].map(escape).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clientes-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleExportClientReport() {
    if (!selectedReport) return;
    const { company, equipment } = selectedReport;
    if (!company) return;
    const headers = ["Código", "Categoria", "Localização", "Agente", "Capacidade", "Próx. Manutenção", "Status"];
    const escape = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = equipment.all.map(e => [
      e.code, e.category ?? "", e.installationLocation ?? "", e.agentType ?? "", e.capacity ?? "",
      e.nextMaintenanceDate ? new Date(e.nextMaintenanceDate).toLocaleDateString("pt-BR") : "",
      e.status ?? "",
    ].map(escape).join(","));
    const csv = [
      `# Relatório: ${company.name}`,
      `# Gerado em: ${new Date().toLocaleString("pt-BR")}`,
      `# Total: ${equipment.total} | Em dia: ${equipment.ok} | Vencendo: ${equipment.expiring} | Vencidos: ${equipment.expired}`,
      "",
      headers.join(","),
      ...rows,
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-${company.name.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function parseCsvText(text: string) {
    // RFC 4180-compliant CSV parser
    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let cur = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inQuotes) {
          if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
          else if (ch === '"') { inQuotes = false; }
          else { cur += ch; }
        } else {
          if (ch === '"') { inQuotes = true; }
          else if (ch === ',') { result.push(cur.trim()); cur = ""; }
          else { cur += ch; }
        }
      }
      result.push(cur.trim());
      return result;
    };
    const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return [];
    const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/[\uFEFF]/g, ""));
    const nameKey = headers.find(h => ["raz\u00e3o social","razao social","nome","name"].includes(h));
    if (!nameKey) return [];
    return lines.slice(1).map(line => {
      const vals = parseLine(line);
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => { obj[h] = vals[i] ?? ""; });
      return {
        name: obj[nameKey] ?? "",
        cnpj: obj["cnpj"] ?? "",
        email: obj["email"] ?? obj["e-mail"] ?? "",
        phone: obj["telefone"] ?? obj["phone"] ?? "",
        address: obj["endere\u00e7o"] ?? obj["endereco"] ?? obj["address"] ?? "",
        type: obj["tipo"] ?? obj["type"] ?? "",
      };
    }).filter(r => r.name);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setImportCsv(text);
      setImportParsed(parseCsvText(text));
      setImportResults(null);
    };
    reader.readAsText(file, "utf-8");
  }

  function handleImport() {
    if (!importParsed.length) return;
    importMutation.mutate({ rows: importParsed });
  }

  const filtered = companies?.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.cnpj ?? "").includes(search) ||
    (c.email ?? "").toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <SaasDashboardLayout>
      <div style={{ padding: "32px 32px 48px", maxWidth: 1200, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 11, fontWeight: 700, color: "#C0392B", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>
              GESTÃO DE CLIENTES
            </div>
            <h1 style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 28, fontWeight: 700, color: "#111", margin: 0, letterSpacing: "0.02em" }}>
              EMPRESAS CADASTRADAS
            </h1>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={handleExportCsv}
              style={{ background: "#1a3a5c", color: "#fff", border: "none", borderRadius: 2, padding: "10px 16px", fontFamily: "Barlow Condensed, sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", cursor: "pointer" }}
            >
              ⬇ EXPORTAR CSV
            </button>
            <button
              onClick={() => { setShowImport(!showImport); setImportResults(null); setImportParsed([]); setImportCsv(""); }}
              style={{ background: "#4a7fb5", color: "#fff", border: "none", borderRadius: 2, padding: "10px 16px", fontFamily: "Barlow Condensed, sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", cursor: "pointer" }}
            >
              ⬆ IMPORTAR CSV
            </button>
            <button
              onClick={() => { setShowForm(!showForm); setEditId(null); resetForm(); setSelectedId(null); }}
              style={{ background: "#C0392B", color: "#fff", border: "none", borderRadius: 2, padding: "10px 16px", fontFamily: "Barlow Condensed, sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", cursor: "pointer" }}
            >
              {showForm ? "CANCELAR" : "+ NOVO CLIENTE"}
            </button>
          </div>
        </div>

        {/* Importação CSV */}
        {showImport && (
          <div style={{ background: "#fff", border: "1px solid #E0E0E0", borderTop: "3px solid #4a7fb5", borderRadius: 2, padding: 24, marginBottom: 24 }}>
            <h3 style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 15, fontWeight: 700, color: "#111", margin: "0 0 12px", letterSpacing: "0.06em" }}>
              IMPORTAR CLIENTES VIA CSV
            </h3>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#666", marginBottom: 12 }}>
              O CSV deve ter cabeçalho com colunas: <strong>Razão Social</strong>, CNPJ, E-mail, Telefone, Endereço, Tipo (opcional).
              Empresas com nome já existente serão ignoradas.
            </p>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
              <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFileChange} style={{ display: "none" }} />
              <button
                onClick={() => fileRef.current?.click()}
                style={{ background: "#F0F0F0", border: "1px solid #D0D0D0", borderRadius: 2, padding: "8px 16px", fontFamily: "Barlow Condensed, sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#333", letterSpacing: "0.06em" }}
              >
                SELECIONAR ARQUIVO
              </button>
              {importParsed.length > 0 && (
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#555" }}>
                  {importParsed.length} linha(s) detectada(s)
                </span>
              )}
            </div>

            {importParsed.length > 0 && !importResults && (
              <>
                <div style={{ maxHeight: 200, overflowY: "auto", border: "1px solid #E0E0E0", borderRadius: 2, marginBottom: 12 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: "#F5F5F5" }}>
                        {["Razão Social", "CNPJ", "E-mail", "Telefone", "Tipo"].map(h => (
                          <th key={h} style={{ padding: "6px 10px", textAlign: "left", fontFamily: "Barlow Condensed, sans-serif", fontSize: 10, fontWeight: 700, color: "#555", letterSpacing: "0.08em" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {importParsed.slice(0, 20).map((r, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #F0F0F0" }}>
                          <td style={{ padding: "5px 10px", fontFamily: "Inter, sans-serif", color: "#111" }}>{r.name}</td>
                          <td style={{ padding: "5px 10px", fontFamily: "Inter, sans-serif", color: "#555" }}>{r.cnpj || "—"}</td>
                          <td style={{ padding: "5px 10px", fontFamily: "Inter, sans-serif", color: "#555" }}>{r.email || "—"}</td>
                          <td style={{ padding: "5px 10px", fontFamily: "Inter, sans-serif", color: "#555" }}>{r.phone || "—"}</td>
                          <td style={{ padding: "5px 10px", fontFamily: "Inter, sans-serif", color: "#555" }}>{r.type || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {importParsed.length > 20 && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#888" }}>... e mais {importParsed.length - 20} linha(s)</p>}
                <button
                  onClick={handleImport}
                  disabled={importMutation.isPending}
                  style={{ background: "#4a7fb5", color: "#fff", border: "none", borderRadius: 2, padding: "9px 20px", fontFamily: "Barlow Condensed, sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: "0.08em" }}
                >
                  {importMutation.isPending ? "IMPORTANDO..." : `IMPORTAR ${importParsed.length} CLIENTE(S)`}
                </button>
              </>
            )}

            {importResults && (
              <div>
                <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                  <span style={{ background: "#E8F5E9", color: "#2E7D32", padding: "4px 12px", borderRadius: 2, fontFamily: "Barlow Condensed, sans-serif", fontSize: 12, fontWeight: 700 }}>
                    ✓ {importResults.filter(r => r.status === "created").length} criados
                  </span>
                  <span style={{ background: "#F5F5F5", color: "#555", padding: "4px 12px", borderRadius: 2, fontFamily: "Barlow Condensed, sans-serif", fontSize: 12, fontWeight: 700 }}>
                    ↷ {importResults.filter(r => r.status === "skipped").length} ignorados
                  </span>
                </div>
                <button
                  onClick={() => { setShowImport(false); setImportResults(null); setImportParsed([]); }}
                  style={{ background: "#F0F0F0", border: "1px solid #D0D0D0", borderRadius: 2, padding: "7px 16px", fontFamily: "Barlow Condensed, sans-serif", fontSize: 11, fontWeight: 700, cursor: "pointer", color: "#333" }}
                >
                  FECHAR
                </button>
              </div>
            )}
          </div>
        )}

        {/* Formulário */}
        {showForm && (
          <div style={{ background: "#fff", border: "1px solid #E0E0E0", borderTop: "3px solid #C0392B", borderRadius: 2, padding: 24, marginBottom: 24 }}>
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
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); resetForm(); }}
                  style={{ padding: "8px 20px", border: "1px solid #D0D0D0", background: "#fff", borderRadius: 2, fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#555" }}>
                  CANCELAR
                </button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
                  style={{ padding: "8px 24px", background: "#C0392B", color: "#fff", border: "none", borderRadius: 2, fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em" }}>
                  {(createMutation.isPending || updateMutation.isPending) ? "SALVANDO..." : (editId ? "ATUALIZAR" : "CADASTRAR")}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Busca */}
        <div style={{ marginBottom: 16 }}>
          <input
            style={{ ...inputStyle, maxWidth: 360 }}
            placeholder="Buscar por nome, CNPJ ou e-mail..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          {/* Tabela de clientes */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ background: "#fff", border: "1px solid #E0E0E0", borderRadius: 2, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#111" }}>
                    {["EMPRESA", "CNPJ", "TIPO", "TELEFONE", "STATUS", "AÇÕES"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontFamily: "Barlow Condensed, sans-serif", fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: "0.1em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#888", fontFamily: "Inter, sans-serif", fontSize: 13 }}>Carregando...</td></tr>
                  ) : !filtered.length ? (
                    <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#888", fontFamily: "Inter, sans-serif", fontSize: 13 }}>
                      {search ? "Nenhum cliente encontrado para esta busca." : "Nenhum cliente cadastrado. Clique em \"+ NOVO CLIENTE\" para começar."}
                    </td></tr>
                  ) : filtered.map((c, i) => (
                    <tr
                      key={c.id}
                      style={{ background: selectedId === c.id ? "#FFF8F8" : (i % 2 === 0 ? "#fff" : "#FAFAFA"), borderBottom: "1px solid #F0F0F0", cursor: "pointer" }}
                      onClick={() => setSelectedId(selectedId === c.id ? null : c.id)}
                    >
                      <td style={{ padding: "10px 14px", fontFamily: "Barlow Condensed, sans-serif", fontSize: 14, fontWeight: 600, color: selectedId === c.id ? "#C0392B" : "#111" }}>{c.name}</td>
                      <td style={{ padding: "10px 14px", fontFamily: "Inter, sans-serif", fontSize: 12, color: "#555" }}>{c.cnpj ?? "—"}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ background: "#F0F0F0", color: "#333", padding: "2px 8px", borderRadius: 2, fontFamily: "Barlow Condensed, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em" }}>
                          {TYPE_LABELS[c.type ?? "outro"] ?? c.type}
                        </span>
                      </td>
                      <td style={{ padding: "10px 14px", fontFamily: "Inter, sans-serif", fontSize: 12, color: "#555" }}>{c.phone ?? "—"}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ background: c.active ? "#E8F5E9" : "#FFEBEE", color: c.active ? "#2E7D32" : "#C0392B", padding: "2px 8px", borderRadius: 2, fontFamily: "Barlow Condensed, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em" }}>
                          {c.active ? "ATIVO" : "INATIVO"}
                        </span>
                      </td>
                      <td style={{ padding: "10px 14px" }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => handleEdit(c)}
                            style={{ background: "none", border: "1px solid #C0392B", color: "#C0392B", borderRadius: 2, padding: "4px 10px", fontFamily: "Barlow Condensed, sans-serif", fontSize: 10, fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em" }}>
                            EDITAR
                          </button>
                          <button onClick={() => setSelectedId(selectedId === c.id ? null : c.id)}
                            style={{ background: "none", border: "1px solid #1a3a5c", color: "#1a3a5c", borderRadius: 2, padding: "4px 10px", fontFamily: "Barlow Condensed, sans-serif", fontSize: 10, fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em" }}>
                            {selectedId === c.id ? "FECHAR" : "DETALHES"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {companies && companies.length > 0 && (
              <div style={{ marginTop: 10, fontFamily: "Inter, sans-serif", fontSize: 12, color: "#888" }}>
                {filtered.length} de {companies.length} cliente{companies.length !== 1 ? "s" : ""} — {companies.filter(c => c.active).length} ativo{companies.filter(c => c.active).length !== 1 ? "s" : ""}
              </div>
            )}
          </div>

          {/* Painel de detalhes */}
          {selectedId && (
            <div style={{ width: 380, flexShrink: 0, background: "#fff", border: "1px solid #E0E0E0", borderTop: "3px solid #1a3a5c", borderRadius: 2, padding: 20 }}>
              {reportLoading ? (
                <div style={{ textAlign: "center", padding: 40, color: "#888", fontFamily: "Inter, sans-serif", fontSize: 13 }}>Carregando...</div>
              ) : selectedReport ? (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div>
                      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 11, fontWeight: 700, color: "#1a3a5c", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>RELATÓRIO DO CLIENTE</div>
                      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 18, fontWeight: 700, color: "#111" }}>{selectedReport.company?.name}</div>
                    </div>
                    <button onClick={handleExportClientReport}
                      style={{ background: "#1a3a5c", color: "#fff", border: "none", borderRadius: 2, padding: "6px 12px", fontFamily: "Barlow Condensed, sans-serif", fontSize: 10, fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em" }}>
                      ⬇ CSV
                    </button>
                  </div>

                  {/* Stats */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                    {[
                      { label: "Total Equip.", value: selectedReport.equipment.total, color: "#1a3a5c" },
                      { label: "Em Dia", value: selectedReport.equipment.ok, color: "#22c55e" },
                      { label: "Vencendo", value: selectedReport.equipment.expiring, color: "#f59e0b" },
                      { label: "Vencidos", value: selectedReport.equipment.expired, color: "#C8102E" },
                    ].map(s => (
                      <div key={s.label} style={{ background: "#F8F8F8", border: `2px solid ${s.color}20`, borderLeft: `3px solid ${s.color}`, borderRadius: 2, padding: "8px 12px" }}>
                        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 10, color: "#666", letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Categorias */}
                  {Object.keys(selectedReport.equipment.byCategory).length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 11, fontWeight: 700, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Por Categoria</div>
                      {Object.entries(selectedReport.equipment.byCategory).map(([cat, count]) => (
                        <div key={cat} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #F0F0F0" }}>
                          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#555" }}>{cat}</span>
                          <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, fontWeight: 700, color: "#111" }}>{count}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Últimas manutenções */}
                  {selectedReport.recentMaintenance.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 11, fontWeight: 700, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Últimas Manutenções</div>
                      {selectedReport.recentMaintenance.slice(0, 5).map((m, i) => {
                        const mr = "mr" in m ? m.mr : m;
                        return (
                          <div key={i} style={{ padding: "6px 0", borderBottom: "1px solid #F0F0F0" }}>
                            <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 12, fontWeight: 600, color: "#111" }}>{(mr as { serviceType?: string }).serviceType ?? "—"}</div>
                            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#888" }}>
                              {(mr as { serviceDate?: unknown }).serviceDate ? new Date((mr as { serviceDate: unknown }).serviceDate as string).toLocaleDateString("pt-BR") : "—"}
                              {(mr as { technicianName?: string }).technicianName ? ` · ${(mr as { technicianName: string }).technicianName}` : ""}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Alertas recentes */}
                  {selectedReport.recentAlerts.length > 0 && (
                    <div>
                      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 11, fontWeight: 700, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Alertas Recentes</div>
                      {selectedReport.recentAlerts.slice(0, 5).map((a) => (
                        <div key={a.id} style={{ padding: "5px 0", borderBottom: "1px solid #F0F0F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: a.alertType === "vencido" ? "#C0392B" : "#f59e0b", fontWeight: 600 }}>
                            {a.alertType === "vencido" ? "⚠ Vencido" : "⏰ Próx. Venc."}
                          </span>
                          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: "#888" }}>
                            {a.sentAt ? new Date(a.sentAt).toLocaleDateString("pt-BR") : "—"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: 12, fontFamily: "Inter, sans-serif", fontSize: 10, color: "#aaa" }}>
                    Gerado em {new Date(selectedReport.generatedAt).toLocaleString("pt-BR")}
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </SaasDashboardLayout>
  );
}
