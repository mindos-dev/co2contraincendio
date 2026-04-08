import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import jsQR from "jsqr";
import { trpc } from "@/lib/trpc";
import { useSaasAuth } from "@/contexts/SaasAuthContext";
import SaasDashboardLayout from "@/components/SaasDashboardLayout";
import { OPERIS_COLORS } from "@/lib/operis-tokens";
import {
  BluetoothPrinter,
  getSavedPrinter,
  clearSavedPrinter,
  type PrinterProfile,
  type LabelData,
} from "@/lib/bluetooth-printer";
import {
  ScanLine, Camera, CameraOff, Bluetooth, BluetoothOff, Printer,
  CheckCircle2, AlertTriangle, X, Settings, RefreshCw, Package,
  MapPin, Clock, Wrench
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ─── Tipos ────────────────────────────────────────────────────────────────────
type ScanState = "idle" | "scanning" | "found" | "error";
type PrintState = "idle" | "connecting" | "printing" | "done" | "error";

interface ScannedEquipment {
  id: number;
  code: string;
  category: string | null;
  installationLocation: string | null;
  status: string | null;
  nextMaintenanceDate?: Date | null;
  qrCodeUrl?: string | null;
  company?: { name: string } | null;
  auditHash?: string | null;
}

// ─── Componente ───────────────────────────────────────────────────────────────
export default function ScannerEquipamento() {
  const [, setLocation] = useLocation();
  const { user } = useSaasAuth();
  const companyId = user?.companyId ?? undefined;

  // Câmera
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);

  const [scanState, setScanState] = useState<ScanState>("idle");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<ScannedEquipment | null>(null);

  // Bluetooth
  const printerRef = useRef<BluetoothPrinter | null>(null);
  const [printState, setPrintState] = useState<PrintState>("idle");
  const [printError, setPrintError] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<PrinterProfile>("generic_58mm");
  const [connectedPrinterName, setConnectedPrinterName] = useState<string | null>(null);
  const [showPrinterSettings, setShowPrinterSettings] = useState(false);
  const savedPrinter = getSavedPrinter();

  // tRPC
  const utils = trpc.useUtils();
  const { data: equipmentData } = trpc.saas.equipment.list.useQuery(
    { companyId, limit: 1000 },
    { enabled: !!companyId }
  );

  // Inicializar perfil salvo
  useEffect(() => {
    if (savedPrinter) setSelectedProfile(savedPrinter.profile);
  }, []);

  // ─── Câmera: iniciar ────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setScanState("scanning");
    setScannedCode(null);
    setEquipment(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setCameraError("Câmera não disponível. Verifique as permissões do navegador.");
      setScanState("error");
    }
  }, []);

  // ─── Câmera: parar ──────────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setScanState("idle");
  }, []);

  // ─── Loop de decodificação QR ───────────────────────────────────────────────
  const tick = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animFrameRef.current = requestAnimationFrame(tick);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });

    if (code) {
      // QR Code encontrado — extrair código do equipamento da URL
      const url = code.data;
      const match = url.match(/\/equipamento\/([^/?#]+)/);
      const extracted = match ? match[1] : url;
      setScannedCode(extracted);
      setScanState("found");
      stopCamera();

      // Buscar equipamento pelo código
      const found = (equipmentData?.items ?? []).find(
        (e: { code: string }) => e.code === extracted || url.includes(e.code)
      ) as ScannedEquipment | undefined;
      if (found) setEquipment(found);
      return;
    }

    animFrameRef.current = requestAnimationFrame(tick);
  }, [equipmentData, stopCamera]);

  // Iniciar loop quando câmera estiver ativa
  useEffect(() => {
    if (scanState === "scanning") {
      animFrameRef.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [scanState, tick]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      stopCamera();
      printerRef.current?.disconnect();
    };
  }, [stopCamera]);

  // ─── Bluetooth: conectar ────────────────────────────────────────────────────
  const connectPrinter = async () => {
    setPrintState("connecting");
    setPrintError(null);
    try {
      printerRef.current = new BluetoothPrinter(selectedProfile);
      const name = await printerRef.current.connect();
      setConnectedPrinterName(name);
      setPrintState("idle");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao conectar impressora";
      setPrintError(msg);
      setPrintState("error");
      printerRef.current = null;
    }
  };

  const disconnectPrinter = async () => {
    await printerRef.current?.disconnect();
    printerRef.current = null;
    setConnectedPrinterName(null);
    clearSavedPrinter();
    setPrintState("idle");
  };

  // ─── Bluetooth: imprimir ────────────────────────────────────────────────────
  const printLabel = async () => {
    if (!printerRef.current || !equipment) return;
    setPrintState("printing");
    setPrintError(null);
    try {
      const labelData: LabelData = {
        equipmentId: String(equipment.id),
        equipmentCode: equipment.code,
        location: equipment.installationLocation ?? "Não informado",
        company: equipment.company?.name ?? user?.name ?? "CO2 Contra Incêndio",
        expirationDate: equipment.nextMaintenanceDate
          ? new Date(equipment.nextMaintenanceDate).toLocaleDateString("pt-BR")
          : "Verificar",
        reportSlug: equipment.code,
        auditHash: equipment.auditHash ?? undefined,
      };
      await printerRef.current.printLabel(labelData);
      setPrintState("done");
      setTimeout(() => setPrintState("idle"), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao imprimir";
      setPrintError(msg);
      setPrintState("error");
    }
  };

  // ─── Registro rápido de manutenção ─────────────────────────────────────────
  const goToMaintenance = () => {
    if (equipment) setLocation(`/app/manutencoes?equipmentId=${equipment.id}`);
  };

  const goToEquipment = () => {
    if (equipment) setLocation(`/app/equipamentos/${equipment.id}`);
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  const printerProfiles = BluetoothPrinter.getProfiles();
  const isPrinterConnected = printerRef.current?.isConnected ?? false;

  return (
    <SaasDashboardLayout>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <div
              style={{
                width: 36,
                height: 36,
                background: OPERIS_COLORS.primaryMuted,
                border: `1px solid ${OPERIS_COLORS.primaryBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ScanLine size={18} color={OPERIS_COLORS.primary} />
            </div>
            <div>
              <h1
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800,
                  fontSize: "1.375rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: OPERIS_COLORS.textPrimary,
                  margin: 0,
                  lineHeight: 1,
                }}
              >
                Scanner de Equipamento
              </h1>
              <p style={{ fontSize: "0.8125rem", color: OPERIS_COLORS.textMuted, margin: "0.25rem 0 0" }}>
                Leia o QR Code do equipamento para registrar manutenção ou imprimir novo selo
              </p>
            </div>
          </div>
        </div>

        {/* ─── Área da câmera ─────────────────────────────────────────────── */}
        <div
          style={{
            background: OPERIS_COLORS.bgCard,
            border: `1px solid ${OPERIS_COLORS.border}`,
            marginBottom: "1.25rem",
            overflow: "hidden",
          }}
        >
          {/* Viewfinder */}
          <div
            style={{
              position: "relative",
              width: "100%",
              paddingTop: "56.25%", // 16:9
              background: "#000",
              overflow: "hidden",
            }}
          >
            <video
              ref={videoRef}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: scanState === "scanning" ? "block" : "none",
              }}
              playsInline
              muted
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />

            {/* Overlay de mira */}
            {scanState === "scanning" && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    width: 200,
                    height: 200,
                    border: `3px solid ${OPERIS_COLORS.primary}`,
                    boxShadow: `0 0 0 2000px rgba(0,0,0,0.4)`,
                    position: "relative",
                  }}
                >
                  {/* Cantos */}
                  {[
                    { top: -3, left: -3, borderRight: "none", borderBottom: "none" },
                    { top: -3, right: -3, borderLeft: "none", borderBottom: "none" },
                    { bottom: -3, left: -3, borderRight: "none", borderTop: "none" },
                    { bottom: -3, right: -3, borderLeft: "none", borderTop: "none" },
                  ].map((style, i) => (
                    <div
                      key={i}
                      style={{
                        position: "absolute",
                        width: 24,
                        height: 24,
                        border: `4px solid ${OPERIS_COLORS.primary}`,
                        ...style,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Estado idle */}
            {scanState === "idle" && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.75rem",
                  color: OPERIS_COLORS.textMuted,
                }}
              >
                <Camera size={48} strokeWidth={1} />
                <span style={{ fontSize: "0.875rem" }}>Câmera inativa</span>
              </div>
            )}

            {/* Estado found */}
            {scanState === "found" && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.75rem",
                  background: "rgba(34,197,94,0.15)",
                }}
              >
                <CheckCircle2 size={48} color={OPERIS_COLORS.success} />
                <span style={{ fontSize: "0.875rem", color: OPERIS_COLORS.success, fontWeight: 600 }}>
                  QR Code lido com sucesso
                </span>
              </div>
            )}

            {/* Estado error */}
            {scanState === "error" && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.75rem",
                  background: "rgba(200,16,46,0.1)",
                }}
              >
                <CameraOff size={48} color={OPERIS_COLORS.primary} />
                <span style={{ fontSize: "0.875rem", color: OPERIS_COLORS.primary, textAlign: "center", padding: "0 1rem" }}>
                  {cameraError}
                </span>
              </div>
            )}
          </div>

          {/* Controles da câmera */}
          <div
            style={{
              padding: "1rem",
              display: "flex",
              gap: "0.75rem",
              borderTop: `1px solid ${OPERIS_COLORS.border}`,
            }}
          >
            {scanState !== "scanning" ? (
              <Button
                onClick={startCamera}
                style={{
                  flex: 1,
                  background: OPERIS_COLORS.primary,
                  color: "#fff",
                  border: "none",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  justifyContent: "center",
                }}
              >
                <ScanLine size={16} />
                SCAN EQUIPMENT
              </Button>
            ) : (
              <Button
                onClick={stopCamera}
                variant="outline"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  justifyContent: "center",
                }}
              >
                <X size={16} />
                Parar Scanner
              </Button>
            )}
            {scanState === "found" && (
              <Button
                onClick={() => { setScanState("idle"); setScannedCode(null); setEquipment(null); }}
                variant="outline"
                size="icon"
                title="Novo scan"
              >
                <RefreshCw size={16} />
              </Button>
            )}
          </div>
        </div>

        {/* ─── Resultado do scan ──────────────────────────────────────────── */}
        {scannedCode && (
          <div
            style={{
              background: OPERIS_COLORS.bgCard,
              border: `1px solid ${OPERIS_COLORS.border}`,
              marginBottom: "1.25rem",
            }}
          >
            <div
              style={{
                padding: "0.875rem 1rem",
                borderBottom: `1px solid ${OPERIS_COLORS.border}`,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Package size={16} color={OPERIS_COLORS.primary} />
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: OPERIS_COLORS.textPrimary,
                }}
              >
                Equipamento Identificado
              </span>
            </div>

            <div style={{ padding: "1rem" }}>
              {equipment ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div
                        style={{
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontWeight: 700,
                          fontSize: "1.25rem",
                          letterSpacing: "0.04em",
                          color: OPERIS_COLORS.textPrimary,
                        }}
                      >
                        {equipment.code}
                      </div>
                      <div style={{ fontSize: "0.8125rem", color: OPERIS_COLORS.textSecondary }}>
                        {equipment.category ?? "Categoria não informada"}
                      </div>
                    </div>
                    <Badge
                      style={{
                        background: equipment.status === "active" ? "rgba(34,197,94,0.15)" : "rgba(200,16,46,0.1)",
                        color: equipment.status === "active" ? OPERIS_COLORS.success : OPERIS_COLORS.primary,
                        border: `1px solid ${equipment.status === "active" ? OPERIS_COLORS.success : OPERIS_COLORS.primary}`,
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      {equipment.status ?? "N/A"}
                    </Badge>
                  </div>

                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    {equipment.installationLocation && (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", color: OPERIS_COLORS.textMuted }}>
                        <MapPin size={13} />
                        {equipment.installationLocation}
                      </div>
                    )}
                    {equipment.nextMaintenanceDate && (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", color: OPERIS_COLORS.textMuted }}>
                        <Clock size={13} />
                        Próx. manutenção: {new Date(equipment.nextMaintenanceDate).toLocaleDateString("pt-BR")}
                      </div>
                    )}
                  </div>

                  {/* Ações rápidas */}
                  <div style={{ display: "flex", gap: "0.625rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                    <Button
                      onClick={goToEquipment}
                      variant="outline"
                      size="sm"
                      style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem" }}
                    >
                      <Package size={14} />
                      Ver Equipamento
                    </Button>
                    <Button
                      onClick={goToMaintenance}
                      size="sm"
                      style={{
                        background: OPERIS_COLORS.primary,
                        color: "#fff",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.375rem",
                        fontSize: "0.8125rem",
                      }}
                    >
                      <Wrench size={14} />
                      Registrar Manutenção
                    </Button>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: "0.875rem", color: OPERIS_COLORS.textMuted }}>
                  Código lido: <strong style={{ color: OPERIS_COLORS.textPrimary }}>{scannedCode}</strong>
                  <br />
                  <span style={{ fontSize: "0.8125rem" }}>Equipamento não encontrado na base de dados desta empresa.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Impressão Bluetooth ────────────────────────────────────────── */}
        <div
          style={{
            background: OPERIS_COLORS.bgCard,
            border: `1px solid ${OPERIS_COLORS.border}`,
          }}
        >
          <div
            style={{
              padding: "0.875rem 1rem",
              borderBottom: `1px solid ${OPERIS_COLORS.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Bluetooth size={16} color={isPrinterConnected ? OPERIS_COLORS.success : OPERIS_COLORS.textMuted} />
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: OPERIS_COLORS.textPrimary,
                }}
              >
                Impressão Bluetooth (ESC/POS)
              </span>
            </div>
            <button
              onClick={() => setShowPrinterSettings(s => !s)}
              style={{
                background: "transparent",
                border: "none",
                color: OPERIS_COLORS.textMuted,
                cursor: "pointer",
                padding: "0.25rem",
                display: "flex",
                alignItems: "center",
              }}
              title="Configurações da impressora"
            >
              <Settings size={15} />
            </button>
          </div>

          <div style={{ padding: "1rem" }}>
            {/* Status da conexão */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1rem",
                padding: "0.625rem 0.875rem",
                background: isPrinterConnected ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${isPrinterConnected ? OPERIS_COLORS.success : OPERIS_COLORS.border}`,
              }}
            >
              {isPrinterConnected ? (
                <>
                  <CheckCircle2 size={15} color={OPERIS_COLORS.success} />
                  <span style={{ fontSize: "0.8125rem", color: OPERIS_COLORS.success, fontWeight: 600 }}>
                    Conectado: {connectedPrinterName}
                  </span>
                </>
              ) : (
                <>
                  <BluetoothOff size={15} color={OPERIS_COLORS.textDisabled} />
                  <span style={{ fontSize: "0.8125rem", color: OPERIS_COLORS.textMuted }}>
                    {savedPrinter
                      ? `Última impressora: ${savedPrinter.name} (${savedPrinter.profile})`
                      : "Nenhuma impressora conectada"}
                  </span>
                </>
              )}
            </div>

            {/* Configurações de perfil */}
            {showPrinterSettings && (
              <div
                style={{
                  marginBottom: "1rem",
                  padding: "0.875rem",
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid ${OPERIS_COLORS.border}`,
                }}
              >
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: OPERIS_COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.625rem" }}>
                  Perfil da Impressora
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                  {printerProfiles.map((p) => (
                    <label
                      key={p.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.625rem",
                        cursor: "pointer",
                        padding: "0.5rem 0.75rem",
                        background: selectedProfile === p.id ? OPERIS_COLORS.primaryMuted : "transparent",
                        border: `1px solid ${selectedProfile === p.id ? OPERIS_COLORS.primaryBorder : "transparent"}`,
                      }}
                    >
                      <input
                        type="radio"
                        name="printerProfile"
                        value={p.id}
                        checked={selectedProfile === p.id}
                        onChange={() => setSelectedProfile(p.id)}
                        style={{ accentColor: OPERIS_COLORS.primary }}
                      />
                      <div>
                        <div style={{ fontSize: "0.8125rem", color: OPERIS_COLORS.textPrimary, fontWeight: 500 }}>{p.name}</div>
                        <div style={{ fontSize: "0.6875rem", color: OPERIS_COLORS.textMuted }}>{p.columns} colunas</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Erro de impressão */}
            {printError && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.625rem 0.875rem",
                  background: "rgba(200,16,46,0.08)",
                  border: `1px solid ${OPERIS_COLORS.primary}`,
                  marginBottom: "1rem",
                  fontSize: "0.8125rem",
                  color: OPERIS_COLORS.primary,
                }}
              >
                <AlertTriangle size={14} />
                {printError}
              </div>
            )}

            {/* Botões de ação */}
            <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
              {!isPrinterConnected ? (
                <Button
                  onClick={connectPrinter}
                  disabled={printState === "connecting"}
                  style={{
                    flex: 1,
                    background: OPERIS_COLORS.primary,
                    color: "#fff",
                    border: "none",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    justifyContent: "center",
                    opacity: printState === "connecting" ? 0.7 : 1,
                  }}
                >
                  <Bluetooth size={15} />
                  {printState === "connecting" ? "CONECTANDO..." : "CONECTAR IMPRESSORA"}
                </Button>
              ) : (
                <>
                  <Button
                    onClick={printLabel}
                    disabled={!equipment || printState === "printing"}
                    style={{
                      flex: 1,
                      background: equipment ? OPERIS_COLORS.primary : "rgba(255,255,255,0.05)",
                      color: equipment ? "#fff" : OPERIS_COLORS.textDisabled,
                      border: "none",
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      justifyContent: "center",
                    }}
                  >
                    <Printer size={15} />
                    {printState === "printing"
                      ? "IMPRIMINDO..."
                      : printState === "done"
                      ? "✓ IMPRESSO"
                      : "IMPRIMIR SELO"}
                  </Button>
                  <Button
                    onClick={disconnectPrinter}
                    variant="outline"
                    size="icon"
                    title="Desconectar impressora"
                  >
                    <BluetoothOff size={15} />
                  </Button>
                </>
              )}
            </div>

            {!equipment && scanState !== "scanning" && (
              <p style={{ fontSize: "0.75rem", color: OPERIS_COLORS.textDisabled, marginTop: "0.75rem", textAlign: "center" }}>
                Faça o scan de um equipamento para habilitar a impressão do selo
              </p>
            )}

            {/* Nota sobre Web Bluetooth */}
            <p style={{ fontSize: "0.6875rem", color: OPERIS_COLORS.textDisabled, marginTop: "1rem", lineHeight: 1.5 }}>
              Requer Chrome ou Edge em HTTPS. Impressoras ESC/POS Bluetooth (58mm / 80mm).
              Perfis suportados: Generic, Epson Mobile, Zebra/Leopardo.
            </p>
          </div>
        </div>
      </div>
    </SaasDashboardLayout>
  );
}
