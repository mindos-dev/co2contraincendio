/**
 * usePushNotifications — Hook para Web Push API no PWA OPERIS
 * Solicita permissão, registra subscription e gerencia estado
 */
import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";

const VAPID_PUBLIC_KEY_FALLBACK = "BME3SjfvQsyGduOieZG5NYzlpxqFCCJadhA0qUHEO_g23zbF9-0dAOtGJsA80kj-kUvtv1BdUEPPouZx2bLFiQI";

function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export type PushPermission = "default" | "granted" | "denied" | "unsupported";

export function usePushNotifications() {
  const [permission, setPermission] = useState<PushPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: vapidData } = trpc.field.getVapidKey.useQuery();
  const subscribeMutation = trpc.field.subscribePush.useMutation();
  const unsubscribeMutation = trpc.field.unsubscribePush.useMutation();

  // Verificar estado inicial
  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as PushPermission);

    // Verificar se já tem subscription ativa
    navigator.serviceWorker.ready.then(reg => {
      reg.pushManager.getSubscription().then(sub => {
        setIsSubscribed(!!sub);
      });
    }).catch(() => {});
  }, []);

  const subscribe = useCallback(async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setError("Push notifications não suportadas neste navegador.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Solicitar permissão
      const perm = await Notification.requestPermission();
      setPermission(perm as PushPermission);

      if (perm !== "granted") {
        setError("Permissão negada. Habilite notificações nas configurações do navegador.");
        return;
      }

      // Registrar service worker e criar subscription
      const reg = await navigator.serviceWorker.ready;
      const vapidKey = vapidData?.publicKey ?? VAPID_PUBLIC_KEY_FALLBACK;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const subJson = sub.toJSON();
      if (!subJson.endpoint || !subJson.keys?.p256dh || !subJson.keys?.auth) {
        throw new Error("Subscription inválida");
      }

      // Salvar no backend
      await subscribeMutation.mutateAsync({
        endpoint: subJson.endpoint,
        p256dh: subJson.keys.p256dh,
        auth: subJson.keys.auth,
      });

      setIsSubscribed(true);
    } catch (err: any) {
      setError(err.message ?? "Erro ao ativar notificações.");
    } finally {
      setIsLoading(false);
    }
  }, [vapidData, subscribeMutation]);

  const unsubscribe = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await unsubscribeMutation.mutateAsync({ endpoint: sub.endpoint });
        await sub.unsubscribe();
      }
      setIsSubscribed(false);
    } catch (err: any) {
      setError(err.message ?? "Erro ao desativar notificações.");
    } finally {
      setIsLoading(false);
    }
  }, [unsubscribeMutation]);

  return {
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    isSupported: permission !== "unsupported",
  };
}
