import { useState, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  ArrowLeft,
  Camera,
  ImagePlus,
  Trash2,
  Upload,
  CheckCircle2,
  X,
} from "lucide-react";

interface LocalImage {
  id: string;
  preview: string;
  base64: string;
  mimeType: string;
  caption: string;
  status: "pending" | "uploading" | "done" | "error";
  remoteId?: number;
  remoteUrl?: string;
}

export default function UploadImagens() {
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const inspectionId = parseInt(params.id ?? "0");

  const [images, setImages] = useState<LocalImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const { data: inspection } = trpc.field.getInspection.useQuery(
    { id: inspectionId },
    { enabled: inspectionId > 0 }
  );

  const { data: existingImages } = trpc.field.getImages.useQuery(
    { inspectionId },
    { enabled: inspectionId > 0 }
  );

  const uploadMutation = trpc.field.uploadImage.useMutation();

  const compressImage = (file: File, maxWidth = 1200): Promise<{ base64: string; mimeType: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ratio = Math.min(1, maxWidth / img.width);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL("image/jpeg", 0.82).split(",")[1];
          resolve({ base64, mimeType: "image/jpeg" });
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const MAX_SIZE = 15 * 1024 * 1024; // 15MB original

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} não é uma imagem.`);
        continue;
      }
      if (file.size > MAX_SIZE) {
        toast.error(`${file.name} é muito grande (máx 15MB).`);
        continue;
      }

      const preview = URL.createObjectURL(file);
      const { base64, mimeType } = await compressImage(file);

      const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setImages(prev => [...prev, {
        id: localId,
        preview,
        base64,
        mimeType,
        caption: "",
        status: "pending",
      }]);
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const setCaption = (id: string, caption: string) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, caption } : img));
  };

  const uploadAll = async () => {
    const pending = images.filter(img => img.status === "pending");
    if (pending.length === 0) {
      navigate(`/mobile/laudo/${inspectionId}`);
      return;
    }

    setUploading(true);
    let success = 0;

    for (const img of pending) {
      setImages(prev => prev.map(i => i.id === img.id ? { ...i, status: "uploading" } : i));
      try {
        const result = await uploadMutation.mutateAsync({
          inspectionId,
          base64: img.base64,
          mimeType: img.mimeType,
          caption: img.caption || undefined,
        });
        setImages(prev => prev.map(i => i.id === img.id
          ? { ...i, status: "done", remoteId: result.id, remoteUrl: result.url }
          : i
        ));
        success++;
      } catch {
        setImages(prev => prev.map(i => i.id === img.id ? { ...i, status: "error" } : i));
        toast.error(`Falha no upload de uma imagem.`);
      }
    }

    setUploading(false);
    if (success > 0) {
      toast.success(`${success} foto(s) enviada(s)!`);
      navigate(`/mobile/laudo/${inspectionId}`);
    }
  };

  const totalUploaded = (existingImages?.length ?? 0) + images.filter(i => i.status === "done").length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#0a1628] text-white px-4 pt-safe-top pb-4">
        <div className="flex items-center gap-3 pt-4">
          <button
            onClick={() => navigate(`/mobile/checklist/${inspectionId}`)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold">Fotos da Vistoria</h1>
            <p className="text-xs text-white/60">{inspection?.title}</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">{totalUploaded}</div>
            <div className="text-xs text-white/60">foto(s)</div>
          </div>
        </div>
      </div>

      {/* Upload Buttons */}
      <div className="px-4 py-4 flex gap-3">
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="flex-1 flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border-2 border-dashed border-[#C8102E] text-[#C8102E] active:scale-95 transition-all"
        >
          <Camera className="w-8 h-8" />
          <span className="text-sm font-semibold">Câmera</span>
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border-2 border-dashed border-blue-400 text-blue-500 active:scale-95 transition-all"
        >
          <ImagePlus className="w-8 h-8" />
          <span className="text-sm font-semibold">Galeria</span>
        </button>
      </div>

      {/* Hidden inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />

      {/* Existing images */}
      {existingImages && existingImages.length > 0 && (
        <div className="px-4 mb-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Já enviadas ({existingImages.length})
          </p>
          <div className="grid grid-cols-3 gap-2">
            {existingImages.map(img => (
              <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                <img src={img.url} alt={img.caption ?? ""} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New images */}
      {images.length > 0 && (
        <div className="px-4 flex-1 space-y-3 pb-32">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Novas ({images.length})
          </p>
          {images.map(img => (
            <div key={img.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <div className="relative">
                <img
                  src={img.preview}
                  alt={img.caption || "Pré-visualização da imagem"}
                  className="w-full h-48 object-cover"
                />
                {/* Status overlay */}
                {img.status === "uploading" && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {img.status === "done" && (
                  <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                )}
                {img.status === "error" && (
                  <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
                    <X className="w-10 h-10 text-white" />
                  </div>
                )}
                {/* Remove button */}
                {img.status === "pending" && (
                  <button
                    onClick={() => removeImage(img.id)}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              {img.status === "pending" && (
                <div className="p-3">
                  <Input
                    value={img.caption}
                    onChange={e => setCaption(img.id, e.target.value)}
                    placeholder="Legenda (opcional)"
                    className="h-9 text-sm rounded-lg border-gray-200"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {images.length === 0 && (!existingImages || existingImages.length === 0) && (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8 pb-32">
          <Camera className="w-16 h-16 text-gray-200 mb-4" />
          <p className="text-gray-500 font-medium">Nenhuma foto ainda</p>
          <p className="text-gray-400 text-sm mt-1">
            Use os botões acima para fotografar equipamentos ou selecionar da galeria
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 pb-safe-bottom pb-6 pt-3">
        <Button
          onClick={uploadAll}
          disabled={uploading}
          className="w-full h-14 text-base font-bold rounded-2xl bg-[#C8102E] hover:bg-[#a50d25] text-white"
        >
          {uploading ? (
            <span className="flex items-center gap-2">
              <Upload className="w-5 h-5 animate-bounce" />
              Enviando...
            </span>
          ) : images.filter(i => i.status === "pending").length > 0 ? (
            `Enviar ${images.filter(i => i.status === "pending").length} foto(s) e Gerar Laudo →`
          ) : (
            "Gerar Laudo →"
          )}
        </Button>
      </div>
    </div>
  );
}
