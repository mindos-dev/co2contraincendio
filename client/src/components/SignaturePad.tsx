/**
 * SignaturePad — Componente de assinatura digital por toque/mouse
 * Suporta touch (iOS/Android) e mouse (desktop)
 */
import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Eraser, Check } from "lucide-react";

interface SignaturePadProps {
  onSave: (base64: string) => void;
  onCancel?: () => void;
  width?: number;
  height?: number;
  label?: string;
}

export default function SignaturePad({
  onSave,
  onCancel,
  width = 340,
  height = 180,
  label = "Assine aqui",
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // Inicializar canvas com fundo branco
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDrawing(true);
    setIsEmpty(false);
    lastPos.current = getPos(e, canvas);
  }, []);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e, canvas);
    if (lastPos.current) {
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
    lastPos.current = pos;
  }, [isDrawing]);

  const stopDraw = useCallback(() => {
    setIsDrawing(false);
    lastPos.current = null;
  }, []);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  }, []);

  const save = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;
    const base64 = canvas.toDataURL("image/png");
    onSave(base64);
  }, [isEmpty, onSave]);

  return (
    <div className="flex flex-col gap-3">
      <div className="text-sm font-semibold text-gray-700">{label}</div>

      {/* Canvas de assinatura */}
      <div
        className="relative border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white"
        style={{ touchAction: "none" }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full cursor-crosshair"
          style={{ display: "block" }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-gray-300 text-sm select-none">✍️ Toque para assinar</span>
          </div>
        )}
        {/* Linha de base */}
        <div className="absolute bottom-8 left-6 right-6 border-b border-gray-200 pointer-events-none" />
      </div>

      {/* Ações */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={clear}
          className="flex-1 gap-1.5 text-gray-600"
        >
          <Eraser className="w-4 h-4" />
          Limpar
        </Button>
        {onCancel && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="flex-1 text-gray-500"
          >
            Cancelar
          </Button>
        )}
        <Button
          size="sm"
          onClick={save}
          disabled={isEmpty}
          className="flex-1 gap-1.5 bg-[#C8102E] hover:bg-[#a00d24] text-white"
        >
          <Check className="w-4 h-4" />
          Confirmar
        </Button>
      </div>
    </div>
  );
}
