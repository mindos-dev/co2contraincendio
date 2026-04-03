import { useState } from "react";
import { trpc } from "@/lib/trpc";
import SaasDashboardLayout from "@/components/SaasDashboardLayout";
import { Users, Plus, Search, Shield, UserCheck, AlertCircle, X } from "lucide-react";

const ROLE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  superadmin: { label: "Super Admin", color: "#fff", bg: "#7C3AED" },
  admin: { label: "Administrador", color: "#fff", bg: "#C8102E" },
  tecnico: { label: "Técnico", color: "#fff", bg: "#0369A1" },
  cliente: { label: "Cliente", color: "#1A202C", bg: "#D1FAE5" },
};

type CreateUserForm = {
  name: string;
  email: string;
  password: string;
  role: "superadmin" | "admin" | "tecnico" | "cliente";
  companyId?: number;
};

export default function Usuarios() {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateUserForm>({
    name: "",
    email: "",
    password: "",
    role: "tecnico",
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const { data: users, isLoading, refetch } = trpc.saas.users.list.useQuery();
  const { data: companies } = trpc.saas.companies.list.useQuery();

  const updateRole = trpc.saas.users.updateRole.useMutation({ onSuccess: () => refetch() });
  const toggleActive = trpc.saas.users.toggleActive.useMutation({ onSuccess: () => refetch() });

  const createUser = trpc.saas.users.create.useMutation({
    onSuccess: () => {
      setFormSuccess("Usuário criado com sucesso!");
      setFormError("");
      setForm({ name: "", email: "", password: "", role: "tecnico" });
      refetch();
      setTimeout(() => {
        setShowCreate(false);
        setFormSuccess("");
      }, 1500);
    },
    onError: (err) => {
      setFormError(err.message || "Erro ao criar usuário.");
      setFormSuccess("");
    },
  });

  const filtered = (users ?? []).filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.name || !form.email || !form.password) {
      setFormError("Preencha todos os campos obrigatórios.");
      return;
    }
    createUser.mutate(form);
  };

  const stats = {
    total: (users ?? []).length,
    admins: (users ?? []).filter((u) => u.role === "admin" || u.role === "superadmin").length,
    tecnicos: (users ?? []).filter((u) => u.role === "tecnico").length,
    clientes: (users ?? []).filter((u) => u.role === "cliente").length,
  };

  return (
    <SaasDashboardLayout>
      <div style={{ padding: "32px 0" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 28, color: "#0a1628", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
              <Users size={26} color="#C8102E" /> Usuários da Plataforma
            </h1>
            <p style={{ color: "#6B7280", fontSize: 14, margin: "6px 0 0" }}>
              Gerencie os usuários com acesso ao OPERIS
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#C8102E", color: "#fff", border: "none", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em" }}
          >
            <Plus size={15} /> NOVO USUÁRIO
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Total de Usuários", value: stats.total, icon: Users, color: "#0a1628" },
            { label: "Administradores", value: stats.admins, icon: Shield, color: "#7C3AED" },
            { label: "Técnicos", value: stats.tecnicos, icon: UserCheck, color: "#0369A1" },
            { label: "Clientes", value: stats.clientes, icon: Users, color: "#059669" },
          ].map((stat) => (
            <div key={stat.label} style={{ background: "#fff", border: "1px solid #E5E7EB", padding: "20px 18px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 40, height: 40, background: `${stat.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <stat.icon size={20} color={stat.color} />
              </div>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 26, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 3 }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", marginBottom: 0 }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", gap: 12 }}>
            <Search size={16} color="#9CA3AF" />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou perfil..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: "#374151", background: "transparent" }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Table */}
          {isLoading ? (
            <div style={{ padding: "48px", textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>
              Carregando usuários...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>
              <Users size={32} color="#D1D5DB" style={{ marginBottom: 12, display: "block", margin: "0 auto 12px" }} />
              {search ? "Nenhum usuário encontrado para esta busca." : "Nenhum usuário cadastrado."}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F9FAFB" }}>
                    {["#", "Nome", "E-mail", "Perfil", "Empresa", "Status", "Cadastrado em"].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6B7280", letterSpacing: "0.06em", whiteSpace: "nowrap", borderBottom: "1px solid #E5E7EB" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user, idx) => {
                    const roleInfo = ROLE_LABELS[user.role] ?? { label: user.role, color: "#374151", bg: "#F3F4F6" };
                    const company = (companies ?? []).find((c: { id: number; name: string }) => c.id === user.companyId);
                    return (
                      <tr key={user.id} style={{ borderBottom: "1px solid #F3F4F6" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAFA")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                      >
                        <td style={{ padding: "14px 16px", fontSize: 12, color: "#9CA3AF" }}>{idx + 1}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#0a1628", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>{user.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{user.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 13, color: "#6B7280" }}>{user.email}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ padding: "3px 10px", background: roleInfo.bg, color: roleInfo.color, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", borderRadius: 2 }}>
                            {roleInfo.label}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 13, color: "#6B7280" }}>
                          {company?.name ?? <span style={{ color: "#D1D5DB" }}>—</span>}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: user.active ? "#059669" : "#DC2626" }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: user.active ? "#059669" : "#DC2626", display: "inline-block" }} />
                            {user.active ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 12, color: "#9CA3AF" }}>
                          {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <select
                              value={user.role}
                              onChange={e => updateRole.mutate({ id: user.id, role: e.target.value as "superadmin" | "admin" | "tecnico" | "cliente" })}
                              style={{ fontSize: 11, padding: "3px 6px", border: "1px solid #E5E7EB", borderRadius: 2, background: "#F9FAFB", color: "#374151", cursor: "pointer" }}
                            >
                              <option value="tecnico">Técnico</option>
                              <option value="admin">Admin</option>
                              <option value="cliente">Cliente</option>
                              <option value="superadmin">Super Admin</option>
                            </select>
                            <button
                              onClick={() => toggleActive.mutate({ id: user.id, active: !user.active })}
                              style={{ fontSize: 11, padding: "3px 8px", border: "1px solid", borderRadius: 2, cursor: "pointer", background: user.active ? "#FEF2F2" : "#F0FDF4", color: user.active ? "#DC2626" : "#059669", borderColor: user.active ? "#FCA5A5" : "#86EFAC" }}
                              title={user.active ? "Desativar" : "Ativar"}
                            >
                              {user.active ? "Desativar" : "Ativar"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          {filtered.length > 0 && (
            <div style={{ padding: "12px 20px", borderTop: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#9CA3AF" }}>{filtered.length} usuário{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}</span>
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreate && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ background: "#fff", width: "100%", maxWidth: 480, padding: "32px 28px", position: "relative" }}>
              <button
                onClick={() => { setShowCreate(false); setFormError(""); setFormSuccess(""); }}
                style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}
              >
                <X size={20} />
              </button>

              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 22, color: "#0a1628", margin: "0 0 24px" }}>
                Novo Usuário
              </h2>

              {formError && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FEF2F2", border: "1px solid #FECACA", padding: "10px 14px", marginBottom: 16, color: "#DC2626", fontSize: 13 }}>
                  <AlertCircle size={15} /> {formError}
                </div>
              )}
              {formSuccess && (
                <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", padding: "10px 14px", marginBottom: 16, color: "#059669", fontSize: 13, fontWeight: 600 }}>
                  {formSuccess}
                </div>
              )}

              <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, letterSpacing: "0.04em" }}>NOME COMPLETO *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ex: João da Silva"
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #D1D5DB", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, letterSpacing: "0.04em" }}>E-MAIL *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="usuario@empresa.com.br"
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #D1D5DB", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, letterSpacing: "0.04em" }}>SENHA INICIAL *</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #D1D5DB", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, letterSpacing: "0.04em" }}>PERFIL DE ACESSO</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value as CreateUserForm["role"] })}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #D1D5DB", fontSize: 14, outline: "none", background: "#fff", boxSizing: "border-box" }}
                  >
                    <option value="tecnico">Técnico</option>
                    <option value="admin">Administrador</option>
                    <option value="cliente">Cliente</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, letterSpacing: "0.04em" }}>EMPRESA (OPCIONAL)</label>
                  <select
                    value={form.companyId ?? ""}
                    onChange={(e) => setForm({ ...form, companyId: e.target.value ? Number(e.target.value) : undefined })}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #D1D5DB", fontSize: 14, outline: "none", background: "#fff", boxSizing: "border-box" }}
                  >
                    <option value="">Sem empresa vinculada</option>
                    {(companies ?? []).map((c: { id: number; name: string }) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <button
                    type="submit"
                    disabled={createUser.isPending}
                    style={{ flex: 1, padding: "12px", background: "#C8102E", color: "#fff", border: "none", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", opacity: createUser.isPending ? 0.7 : 1 }}
                  >
                    {createUser.isPending ? "CRIANDO..." : "CRIAR USUÁRIO"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowCreate(false); setFormError(""); setFormSuccess(""); }}
                    style={{ padding: "12px 20px", background: "transparent", border: "1px solid #D1D5DB", color: "#6B7280", cursor: "pointer", fontSize: 13 }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </SaasDashboardLayout>
  );
}
