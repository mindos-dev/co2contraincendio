/**
 * OPERIS Offline Sync — IndexedDB + Background Sync
 * Salva vistorias localmente quando offline e sincroniza automaticamente quando online.
 */

import { useEffect, useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";

const DB_NAME = "operis-offline";
const DB_VERSION = 1;
const STORE = "pending-inspections";

export interface OfflineInspection {
  offlineId: string;
  type: "pmoc" | "incendio" | "eletrica" | "outros";
  title: string;
  location?: string;
  notes?: string;
  companyId?: number;
  answers?: Array<{
    questionKey: string;
    questionText: string;
    answer: "conforme" | "nao_conforme" | "nao_aplicavel" | "pendente";
    observation?: string;
  }>;
  createdAt: number;
  synced: boolean;
}

// ─── IndexedDB helpers ────────────────────────────────────────────────────────

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "offlineId" });
        store.createIndex("synced", "synced", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveOffline(inspection: OfflineInspection): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(inspection);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getPending(): Promise<OfflineInspection[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const index = tx.objectStore(STORE).index("synced");
    const req = index.getAll(IDBKeyRange.only(false));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function markSynced(offlineId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const req = store.get(offlineId);
    req.onsuccess = () => {
      const record = req.result;
      if (record) {
        record.synced = true;
        store.put(record);
      }
      resolve();
    };
    req.onerror = () => reject(req.error);
  });
}

async function getAllOffline(): Promise<OfflineInspection[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [allLocal, setAllLocal] = useState<OfflineInspection[]>([]);

  const syncMutation = trpc.field.syncOffline.useMutation();

  const refreshCounts = useCallback(async () => {
    try {
      const pending = await getPending();
      setPendingCount(pending.length);
      const all = await getAllOffline();
      setAllLocal(all);
    } catch {
      // IndexedDB não disponível (Safari privado, etc.)
    }
  }, []);

  // Monitorar online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    refreshCounts();
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [refreshCounts]);

  // Auto-sync quando voltar online
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      syncPending();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  const saveLocally = useCallback(async (inspection: Omit<OfflineInspection, "offlineId" | "createdAt" | "synced">) => {
    const offlineId = `offline-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const record: OfflineInspection = {
      ...inspection,
      offlineId,
      createdAt: Date.now(),
      synced: false,
    };
    await saveOffline(record);
    await refreshCounts();
    return offlineId;
  }, [refreshCounts]);

  const syncPending = useCallback(async () => {
    if (isSyncing) return;
    const pending = await getPending();
    if (pending.length === 0) return;

    setIsSyncing(true);
    try {
      const result = await syncMutation.mutateAsync({ inspections: pending });
      // Marcar como sincronizados
      for (const item of pending) {
        await markSynced(item.offlineId);
      }
      await refreshCounts();
      return result.count;
    } catch {
      // Falha silenciosa — tentará novamente na próxima vez online
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, syncMutation, refreshCounts]);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    allLocal,
    saveLocally,
    syncPending,
    refreshCounts,
  };
}
