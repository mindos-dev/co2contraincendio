import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useSaasAuth } from "@/contexts/SaasAuthContext";
import SaasDashboardLayout from "@/components/SaasDashboardLayout";

type DocFile = { name: string; text: string; base64: string; mimeType: string; status: "pending" | "processing" | "done" | "error"; result?: Record<string, unknown>; error?: string };

export default function Documentos() {
  const { user } = useSaasAuth();
  const companyId = user?.companyId ?? undefined;
  const [files, setFiles] = useState<DocFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: docs, isLoading: docsLoading, refetch } = trpc.saas.documents.listByCompany.useQuery({ companyId: companyId ?? 0 }, { enabled: !!companyId });
  const uploadMutation = trpc.saas.documents.uploadMultiple.useMutation();
  const processLlmMutation = trpc.saas.documents.processWithLlm.useMutation();

  /** Lê qualquer arquivo como DataURL (base64) — suporta PDF, imagens e texto */
  const readFileAsDataUrl = (file: File): Promise<{ base64: string; text: string; mimeType: string }> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        const dataUrl = e.target?.result as string ?? "";
        const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
        const mimeType = file.type || (file.name.endsWith(".pdf") ? "application/pdf" : "application/octet-stream");
        // Para texto puro decodifica; para PDF/binário usa placeholder para o LLM
        let text = "";
        try { text = mimeType.startsWith("text/") ? atob(base64) : `[Arquivo: ${file.name} (${mimeType})]`; } catch { text = `[${file.name}]`; }
        resolve({ base64, text, mimeType });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const addFiles = async (fileList: FileList) => {
    const newFiles: DocFile[] = [];
    for (const f of Array.from(fileList)) {
      try {
        const { base64, text, mimeType } = await readFileAsDataUrl(f);
        newFiles.push({ name: f.name, text, base64, mimeType, status: "pending" });
      } catch {
        newFiles.push({ name: f.name, text: "", base64: "", mimeType: "application/octet-stream", status: "error", error: "Erro ao ler arquivo" });
      }
    }
    setFiles(prev => [...prev, ...newFiles]);
  };

  const processAll = async () => {
    const pending = files.filter(f => f.status === "pending");
    for (const file of pending) {
      setFiles(prev => prev.map(f => f.name === file.name ? { ...f, status: "processing" as const } : f));
      try {
        const docType = file.mimeType === "application/pdf" ? "laudo"
          : file.name.toLowerCase().includes("nf") || file.name.toLowerCase().includes("nota") ? "nota_fiscal"
          : file.name.toLowerCase().includes("os") || file.name.toLowerCase().includes("ordem") ? "ordem_servico"
          : "outro";
        const uploaded = await uploadMutation.mutateAsync({
          companyId: companyId ?? 0,
          files: [{ name: file.name, base64: file.base64, mimeType: file.mimeType, type: docType }],
        });
        const docId = (uploaded.results[0] as { documentId?: number })?.documentId;
        let result: Record<string, unknown> = { uploaded: true };
        if (docId) {
          const llmRes = await processLlmMutation.mutateAsync({ documentId: docId, rawText: file.text });
          result = llmRes.extracted as Record<string, unknown>;
        }
        setFiles(prev => prev.map(f => f.name === file.name ? { ...f, status: "done" as const, result } : f));
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Erro no processamento";
        setFiles(prev => prev.map(f => f.name === file.name ? { ...f, status: "error" as const, error: msg } : f));
      }
    }
    void refetch();
  };

  const pendingCount = files.filter(f => f.status === "pending").length;
  const isProcessing = uploadMutation.isPending || processLlmMutation.isPending;
  const statusIcon: Record<string, string> = { pending: "⏳", processing: "⚙️", done: "✅", error: "❌" };
  const statusColor: Record<string, string> = { pending: "#D97706", processing: "#2563EB", done: "#16A34A", error: "#C8102E" };

  return (
    <SaasDashboardLayout>
      <div style={{ maxWidth: 1100 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ width: 24, height: 3, background: "#C8102E", marginBottom: 10 }} />
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 24, letterSpacing: "0.04em", color: "#111111", margin: 0 }}>DOCUMENTOS</h1>
          <p style={{ color: "#8A8A8A", fontSize: 13, marginTop: 4 }}>Upload e processamento automático de Notas Fiscais, Ordens de Serviço e Relatórios Técnicos</p>
        </div>

        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files.length) void addFiles(e.dataTransfer.files); }}
          onClick={() => fileInputRef.current?.click()}
          style={{ border: `2px dashed ${dragging ? "#C8102E" : "#D8D8D8"}`, background: dragging ? "#FFF5F5" : "#FAFAFA", padding: "32px", textAlign: "center", cursor: "pointer", marginBottom: 20, transition: "all 0.15s" }}
        >
          <input ref={fileInputRef} type="file" multiple accept=".txt,.pdf,.csv" style={{ display: "none" }} onChange={e => { if (e.target.files) void addFiles(e.target.files); e.target.value = ""; }} />
          <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "0.04em", color: "#111111" }}>ARRASTE MÚLTIPLOS ARQUIVOS AQUI</div>
          <div style={{ fontSize: 12, color: "#8A8A8A", marginTop: 6 }}>ou clique para selecionar — TXT, PDF, CSV — múltiplos arquivos de uma só vez</div>
        </div>

        {files.length > 0 && (
          <div style={{ background: "#fff", border: "1px solid #D8D8D8", borderTop: "3px solid #111111", marginBottom: 20 }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #F2F2F2", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", color: "#111111" }}>FILA — {files.length} arquivo(s)</span>
              <div style={{ display: "flex", gap: 8 }}>
                {pendingCount > 0 && (
                  <button onClick={() => void processAll()} disabled={isProcessing} style={{ padding: "7px 16px", background: "#C8102E", color: "#fff", border: "none", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.06em", cursor: "pointer" }}>
                    {isProcessing ? "PROCESSANDO..." : `▶ PROCESSAR ${pendingCount} ARQUIVO(S)`}
                  </button>
                )}
                <button onClick={() => setFiles(prev => prev.filter(f => f.status !== "done"))} style={{ padding: "7px 14px", background: "transparent", border: "1px solid #D8D8D8", color: "#4A4A4A", fontSize: 11, cursor: "pointer" }}>LIMPAR CONCLUÍDOS</button>
              </div>
            </div>
            {files.map((f, i) => (
              <div key={i} style={{ padding: "12px 16px", borderBottom: "1px solid #F8F8F8", display: "flex", alignItems: "flex-start", gap: 12 }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{statusIcon[f.status]}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#111111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                  <div style={{ fontSize: 11, color: statusColor[f.status], marginTop: 2, fontWeight: 600 }}>
                    {f.status === "pending" && "Aguardando processamento"}
                    {f.status === "processing" && "Processando via IA..."}
                    {f.status === "done" && "Processado com sucesso"}
                    {f.status === "error" && (f.error ?? "Erro")}
                  </div>
                  {f.status === "done" && f.result && (
                    <div style={{ marginTop: 8, background: "#F8F8F8", border: "1px solid #E8E8E8", padding: "8px 10px", fontSize: 11, color: "#4A4A4A" }}>
                      {Object.entries(f.result).filter(([, v]) => v != null && v !== "").slice(0, 6).map(([k, v]) => (
                        <span key={k} style={{ marginRight: 12 }}><strong>{k}:</strong> {String(v)}</span>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#8A8A8A", cursor: "pointer", fontSize: 16, flexShrink: 0 }}>✕</button>
              </div>
            ))}
          </div>
        )}

        <div style={{ background: "#fff", border: "1px solid #D8D8D8" }}>
          <div style={{ background: "#111111", padding: "10px 16px" }}>
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", color: "#D8D8D8" }}>HISTÓRICO DE DOCUMENTOS PROCESSADOS</span>
          </div>
          {docsLoading ? (
            <div style={{ padding: "24px", textAlign: "center", color: "#8A8A8A", fontSize: 13 }}>Carregando...</div>
          ) : !(docs as unknown[])?.length ? (
            <div style={{ padding: "24px", textAlign: "center", color: "#8A8A8A", fontSize: 13 }}>Nenhum documento processado ainda.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F8F8F8", borderBottom: "1px solid #E8E8E8" }}>
                  {["TIPO", "ARQUIVO", "EQUIPAMENTO", "STATUS PROCESSAMENTO", "DATA"].map(h => (
                    <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.08em", color: "#4A4A4A" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(docs as Array<{ id: number; type: string; fileName: string | null; processingStatus: string | null; equipmentId: number | null; createdAt: Date }>).map((d, i) => (
                  <tr key={d.id} style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA", borderBottom: "1px solid #F2F2F2" }}>
                    <td style={{ padding: "9px 14px", fontSize: 12, color: "#4A4A4A" }}>{d.type ?? "—"}</td>
                    <td style={{ padding: "9px 14px", fontSize: 12, color: "#111111", fontWeight: 600 }}>{d.fileName ?? "—"}</td>
                    <td style={{ padding: "9px 14px", fontSize: 12, color: "#4A4A4A" }}>{d.equipmentId ? `#${d.equipmentId}` : "—"}</td>
                    <td style={{ padding: "9px 14px" }}>
                      <span style={{ padding: "2px 8px", fontSize: 10, fontWeight: 700, background: d.processingStatus === "processed" ? "#16A34A18" : "#D9770618", color: d.processingStatus === "processed" ? "#16A34A" : "#D97706", border: `1px solid ${d.processingStatus === "processed" ? "#16A34A40" : "#D9770640"}` }}>{d.processingStatus ?? "pending"}</span>
                    </td>
                    <td style={{ padding: "9px 14px", fontSize: 12, color: "#4A4A4A" }}>{d.createdAt ? String(d.createdAt).split("T")[0] : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </SaasDashboardLayout>
  );
}
