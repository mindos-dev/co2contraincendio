import { trpc } from "@/lib/trpc";
import { HelmetProvider } from "react-helmet-async";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import { SaasAuthProvider } from "./contexts/SaasAuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { getSaasToken } from "./hooks/useSaasToken";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Dados ficam "frescos" por 30s — reduz re-fetches desnecessários em navegação
      staleTime: 30_000,
      // Mantém dados em cache por 5 minutos após o componente desmontar
      gcTime: 5 * 60_000,
      // Não re-fetcha ao focar na janela (evita requests excessivos em mobile)
      refetchOnWindowFocus: false,
      // Retry apenas 1 vez em erros de rede
      retry: 1,
    },
  },
});

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      headers() {
        const t = getSaasToken();
        return t ? { "x-saas-token": t } : {};
      },
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

// Registrar Service Worker para PWA
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("[PWA] Service Worker registrado:", reg.scope))
      .catch((err) => console.error("[PWA] Erro ao registrar Service Worker:", err));
  });
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <SaasAuthProvider>
          <LanguageProvider>
            <App />
          </LanguageProvider>
        </SaasAuthProvider>
      </QueryClientProvider>
    </trpc.Provider>
  </HelmetProvider>
);
