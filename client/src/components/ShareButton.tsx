/**
 * ShareButton.tsx — Botão de compartilhamento de laudo OPERIS
 * Opções: copiar link, WhatsApp, E-mail (via servidor SMTP)
 */

import { useState } from "react";
import { Copy, Mail, MessageCircle, Check, Share2, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface ShareButtonProps {
  /** Slug público do laudo (ex: "operis-42-1714000000000") */
  slug: string;
  /** URL base da aplicação (window.location.origin) */
  baseUrl: string;
  /** Título do laudo para o e-mail */
  laudoTitle?: string;
  /** Elemento que abre o modal ao ser clicado */
  trigger?: React.ReactNode;
}

export default function ShareButton({ slug, baseUrl, laudoTitle, trigger }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);

  const publicUrl = `${baseUrl}/operis/laudo/${slug}`;

  const sendEmail = trpc.operis.sendLaudoEmail.useMutation({
    onSuccess: () => {
      toast.success(`Laudo enviado para ${emailTo} com sucesso!`);
      setEmailTo("");
      setShowEmailForm(false);
      setOpen(false);
    },
    onError: (e) => {
      // Se SMTP não configurado, cai para mailto: como fallback
      if (e.message.includes("SMTP não configurado")) {
        const subject = encodeURIComponent(laudoTitle ?? "Laudo Técnico OPERIS IA");
        const body = encodeURIComponent(
          `Olá,\n\nSegue o link para acesso ao laudo técnico gerado pelo sistema OPERIS IA:\n\n${publicUrl}\n\nAtenciosamente,\nEquipe CO2 Contra Incêndio`
        );
        window.open(`mailto:${emailTo}?subject=${subject}&body=${body}`, "_self");
        setOpen(false);
      } else {
        toast.error(`Erro ao enviar: ${e.message}`);
      }
    },
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success("Link copiado para a área de transferência.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar. Copie manualmente o link abaixo.");
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Segue o laudo técnico OPERIS IA para sua consulta:\n${publicUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailTo) return;
    sendEmail.mutate({
      to: emailTo,
      slug,
      laudoTitle: laudoTitle ?? "Laudo Técnico OPERIS IA",
      origin: baseUrl,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setShowEmailForm(false); }}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="w-4 h-4" />
            Compartilhar
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-red-600" />
            Compartilhar Laudo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Link público */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Link público do laudo:</p>
            <div className="flex gap-2">
              <Input
                readOnly
                value={publicUrl}
                className="font-mono text-xs"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                title="Copiar link"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Botões de compartilhamento */}
          {!showEmailForm ? (
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleWhatsApp}
                className="gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </Button>

              <Button
                onClick={() => setShowEmailForm(true)}
                variant="outline"
                className="gap-2"
              >
                <Mail className="w-4 h-4" />
                E-mail
              </Button>
            </div>
          ) : (
            /* Formulário de e-mail */
            <form onSubmit={handleSendEmail} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-sm">Endereço de e-mail do destinatário</Label>
                <Input
                  type="email"
                  value={emailTo}
                  onChange={e => setEmailTo(e.target.value)}
                  placeholder="cliente@empresa.com"
                  required
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={sendEmail.isPending || !emailTo}
                  className="flex-1 gap-2 bg-[#C8102E] hover:bg-red-700 text-white"
                >
                  <Send className="w-4 h-4" />
                  {sendEmail.isPending ? "Enviando..." : "Enviar Laudo"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEmailForm(false)}
                >
                  Voltar
                </Button>
              </div>
            </form>
          )}

          <p className="text-xs text-muted-foreground text-center">
            O laudo é público e pode ser acessado por qualquer pessoa com o link.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
