import { useState, useRef, useCallback, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import SaasDashboardLayout from "@/components/SaasDashboardLayout";
import { OPERIS_COLORS } from "@/lib/operis-tokens";
import { SectionHeader } from "@/components/operis";
import { User, Camera, Save, Loader2, CheckCircle, AlertCircle, Shield, Phone, Briefcase, FileText, Mail } from "lucide-react";

// ─── Role labels ──────────────────────────────────────────────────────────────
const ROLE_LABELS: Record<string, string> = {
  superadmin: "Super Administrador",
  admin: "Administrador",
  tecnico: "Técnico",
  cliente: "Cliente",
};

// ─── Inline field component ───────────────────────────────────────────────────
function FieldGroup({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.375rem",
          fontSize: "0.6875rem",
          fontWeight: 700,
          color: OPERIS_COLORS.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: "0.5rem",
        }}
      >
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: OPERIS_COLORS.bg,
  border: `1px solid ${OPERIS_COLORS.border}`,
  borderRadius: 6,
  color: OPERIS_COLORS.textPrimary,
  fontSize: "0.875rem",
  padding: "0.625rem 0.875rem",
  outline: "none",
  transition: "border-color 0.15s",
  boxSizing: "border-box",
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Perfil() {
  const utils = trpc.useUtils();
  const { data: profile, isLoading } = trpc.saas.perfil.get.useQuery();
  const updateMutation = trpc.saas.perfil.update.useMutation({
    onSuccess: () => {
      utils.saas.perfil.get.invalidate();
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    },
    onError: (err) => {
      setSaveError(err.message);
      setSaveStatus("error");
    },
  });
  const uploadAvatarMutation = trpc.saas.perfil.uploadAvatar.useMutation({
    onSuccess: (data) => {
      utils.saas.perfil.get.invalidate();
      setAvatarPreview(data.avatarUrl);
    },
  });

  const [form, setForm] = useState({
    name: "",
    cargo: "",
    crea: "",
    telefone: "",
    bio: "",
  });
  const [formInitialized, setFormInitialized] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [saveError, setSaveError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form when profile loads — using useEffect to avoid setState in render
  useEffect(() => {
    if (profile && !formInitialized) {
      setForm({
        name: profile.name ?? "",
        cargo: profile.cargo ?? "",
        crea: profile.crea ?? "",
        telefone: profile.telefone ?? "",
        bio: profile.bio ?? "",
      });
      if (profile.avatarUrl) setAvatarPreview(profile.avatarUrl);
      setFormInitialized(true);
    }
  }, [profile, formInitialized]);

  const handleChange = useCallback(
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    },
    []
  );

  const handleSave = () => {
    setSaveStatus("idle");
    setSaveError("");
    updateMutation.mutate({
      name: form.name || undefined,
      cargo: form.cargo || undefined,
      crea: form.crea || undefined,
      telefone: form.telefone || undefined,
      bio: form.bio || undefined,
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Imagem muito grande. Máximo: 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = (ev.target?.result as string).split(",")[1];
      setAvatarPreview(ev.target?.result as string);
      const allowedAvatarMimes = ["image/jpeg", "image/png", "image/webp"] as const;
      const safeMime = (allowedAvatarMimes as readonly string[]).includes(file.type)
        ? file.type as "image/jpeg" | "image/png" | "image/webp"
        : "image/jpeg" as const;
      uploadAvatarMutation.mutate({ fileBase64: base64, mimeType: safeMime });
    };
    reader.readAsDataURL(file);
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  if (isLoading) {
    return (
      <SaasDashboardLayout>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "60vh",
            color: OPERIS_COLORS.textMuted,
            gap: "0.75rem",
          }}
        >
          <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
          Carregando perfil...
        </div>
      </SaasDashboardLayout>
    );
  }

  return (
    <SaasDashboardLayout>
      <div
        style={{
          maxWidth: 860,
          margin: "0 auto",
          padding: "1.5rem 1.25rem 3rem",
        }}
      >
        <SectionHeader
          title="Meu Perfil"
          subtitle="Gerencie suas informações profissionais e dados de acesso"
          badge="OPERIS · Perfil"
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "260px 1fr",
            gap: "1.5rem",
            marginTop: "1.5rem",
          }}
          className="profile-grid"
        >
          {/* ─── Left: Avatar + Role Card ─────────────────────────────────── */}
          <div>
            {/* Avatar Card */}
            <div
              style={{
                background: OPERIS_COLORS.bgCard,
                border: `1px solid ${OPERIS_COLORS.border}`,
                borderRadius: 10,
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              {/* Avatar */}
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: "50%",
                    background: avatarPreview
                      ? "transparent"
                      : OPERIS_COLORS.primaryMuted,
                    border: `2px solid ${OPERIS_COLORS.primaryBorder}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    color: OPERIS_COLORS.primary,
                  }}
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    getInitials(form.name || profile?.name || "U")
                  )}
                </div>
                {/* Camera button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadAvatarMutation.isPending}
                  title="Alterar foto"
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: OPERIS_COLORS.primary,
                    border: `2px solid ${OPERIS_COLORS.bgCard}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#fff",
                  }}
                >
                  {uploadAvatarMutation.isPending ? (
                    <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
                  ) : (
                    <Camera size={12} />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: "none" }}
                  onChange={handleAvatarChange}
                />
              </div>

              {/* Name */}
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: OPERIS_COLORS.textPrimary,
                    marginBottom: "0.25rem",
                  }}
                >
                  {form.name || profile?.name || "—"}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: OPERIS_COLORS.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {ROLE_LABELS[profile?.role ?? ""] ?? profile?.role ?? "—"}
                </div>
              </div>

              {/* Email (read-only) */}
              <div
                style={{
                  width: "100%",
                  background: OPERIS_COLORS.bg,
                  border: `1px solid ${OPERIS_COLORS.border}`,
                  borderRadius: 6,
                  padding: "0.5rem 0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Mail size={13} color={OPERIS_COLORS.textMuted} />
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: OPERIS_COLORS.textSecondary,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {profile?.email ?? "—"}
                </span>
              </div>
            </div>

            {/* Security Info */}
            <div
              style={{
                background: OPERIS_COLORS.bgCard,
                border: `1px solid ${OPERIS_COLORS.border}`,
                borderRadius: 10,
                padding: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.75rem",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  color: OPERIS_COLORS.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                <Shield size={13} />
                Segurança
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: OPERIS_COLORS.textSecondary,
                  lineHeight: 1.6,
                }}
              >
                Para alterar sua senha, acesse{" "}
                <a
                  href="/app/esqueci-senha"
                  style={{ color: OPERIS_COLORS.primary, textDecoration: "none" }}
                >
                  Esqueci minha senha
                </a>
                .
              </div>
              {profile?.createdAt && (
                <div
                  style={{
                    marginTop: "0.625rem",
                    fontSize: "0.6875rem",
                    color: OPERIS_COLORS.textMuted,
                  }}
                >
                  Membro desde{" "}
                  {new Date(profile.createdAt).toLocaleDateString("pt-BR", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ─── Right: Form ──────────────────────────────────────────────── */}
          <div
            style={{
              background: OPERIS_COLORS.bgCard,
              border: `1px solid ${OPERIS_COLORS.border}`,
              borderRadius: 10,
              padding: "1.5rem",
            }}
          >
            <div
              style={{
                fontSize: "0.875rem",
                fontWeight: 700,
                color: OPERIS_COLORS.textPrimary,
                marginBottom: "1.5rem",
                paddingBottom: "0.75rem",
                borderBottom: `1px solid ${OPERIS_COLORS.border}`,
              }}
            >
              Informações Profissionais
            </div>

            {/* Name */}
            <FieldGroup label="Nome Completo" icon={<User size={11} />}>
              <input
                type="text"
                value={form.name}
                onChange={handleChange("name")}
                placeholder="Seu nome completo"
                maxLength={200}
                style={{
                  ...inputStyle,
                  borderColor:
                    focusedField === "name"
                      ? OPERIS_COLORS.borderFocus
                      : OPERIS_COLORS.border,
                }}
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField(null)}
              />
            </FieldGroup>

            {/* Cargo */}
            <FieldGroup label="Cargo / Função" icon={<Briefcase size={11} />}>
              <input
                type="text"
                value={form.cargo}
                onChange={handleChange("cargo")}
                placeholder="Ex: Engenheiro de Segurança, Técnico de Manutenção"
                maxLength={100}
                style={{
                  ...inputStyle,
                  borderColor:
                    focusedField === "cargo"
                      ? OPERIS_COLORS.borderFocus
                      : OPERIS_COLORS.border,
                }}
                onFocus={() => setFocusedField("cargo")}
                onBlur={() => setFocusedField(null)}
              />
            </FieldGroup>

            {/* CREA + Telefone side by side */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <FieldGroup label="CREA / RNP" icon={<FileText size={11} />}>
                <input
                  type="text"
                  value={form.crea}
                  onChange={handleChange("crea")}
                  placeholder="Ex: 142203671-5"
                  maxLength={30}
                  style={{
                    ...inputStyle,
                    borderColor:
                      focusedField === "crea"
                        ? OPERIS_COLORS.borderFocus
                        : OPERIS_COLORS.border,
                  }}
                  onFocus={() => setFocusedField("crea")}
                  onBlur={() => setFocusedField(null)}
                />
              </FieldGroup>

              <FieldGroup label="Telefone / WhatsApp" icon={<Phone size={11} />}>
                <input
                  type="tel"
                  value={form.telefone}
                  onChange={handleChange("telefone")}
                  placeholder="(31) 9 9999-9999"
                  maxLength={30}
                  style={{
                    ...inputStyle,
                    borderColor:
                      focusedField === "telefone"
                        ? OPERIS_COLORS.borderFocus
                        : OPERIS_COLORS.border,
                  }}
                  onFocus={() => setFocusedField("telefone")}
                  onBlur={() => setFocusedField(null)}
                />
              </FieldGroup>
            </div>

            {/* Bio */}
            <FieldGroup label="Resumo Profissional" icon={<FileText size={11} />}>
              <textarea
                value={form.bio}
                onChange={handleChange("bio")}
                placeholder="Descreva sua experiência técnica, especialidades e certificações..."
                maxLength={500}
                rows={4}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  minHeight: 90,
                  borderColor:
                    focusedField === "bio"
                      ? OPERIS_COLORS.borderFocus
                      : OPERIS_COLORS.border,
                  fontFamily: "inherit",
                }}
                onFocus={() => setFocusedField("bio")}
                onBlur={() => setFocusedField(null)}
              />
              <div
                style={{
                  fontSize: "0.6875rem",
                  color: OPERIS_COLORS.textMuted,
                  textAlign: "right",
                  marginTop: "0.25rem",
                }}
              >
                {form.bio.length}/500
              </div>
            </FieldGroup>

            {/* Save button + status */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "1.5rem",
                paddingTop: "1rem",
                borderTop: `1px solid ${OPERIS_COLORS.border}`,
              }}
            >
              {/* Status message */}
              <div style={{ fontSize: "0.8125rem" }}>
                {saveStatus === "success" && (
                  <span
                    style={{
                      color: OPERIS_COLORS.success,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.375rem",
                    }}
                  >
                    <CheckCircle size={14} />
                    Perfil atualizado com sucesso
                  </span>
                )}
                {saveStatus === "error" && (
                  <span
                    style={{
                      color: OPERIS_COLORS.danger,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.375rem",
                    }}
                  >
                    <AlertCircle size={14} />
                    {saveError || "Erro ao salvar"}
                  </span>
                )}
              </div>

              <button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: updateMutation.isPending
                    ? OPERIS_COLORS.bgSurface
                    : OPERIS_COLORS.primary,
                  color: updateMutation.isPending
                    ? OPERIS_COLORS.textMuted
                    : "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "0.625rem 1.25rem",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: updateMutation.isPending ? "not-allowed" : "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!updateMutation.isPending)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      OPERIS_COLORS.primaryHover;
                }}
                onMouseLeave={(e) => {
                  if (!updateMutation.isPending)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      OPERIS_COLORS.primary;
                }}
              >
                {updateMutation.isPending ? (
                  <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  <Save size={15} />
                )}
                {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive CSS */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .profile-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </SaasDashboardLayout>
  );
}
