"use client";
import { useEffect, useState, useCallback } from "react";
import { processQueue, getQueueSize } from "../lib/sync";

export default function SyncProvider({ children }) {
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  const sync = useCallback(async () => {
    if (syncing) return;
    setSyncing(true);
    const result = await processQueue();
    setPending(getQueueSize());
    setLastSync(new Date());
    setSyncing(false);
    if (result.synced > 0 || result.failed > 0) {
      setTimeout(() => setPending(getQueueSize()), 100);
    }
  }, [syncing]);

  useEffect(() => {
    setPending(getQueueSize());

    const handleOnline = () => {
      sync();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        sync();
      }
    };

    window.addEventListener("online", handleOnline);
    document.addEventListener("visibilitychange", handleVisibility);

    const interval = setInterval(() => {
      if (navigator.onLine) sync();
    }, 30000);

    return () => {
      window.removeEventListener("online", handleOnline);
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(interval);
    };
  }, [sync]);

  return (
    <>
      {pending > 0 && (
        <div
          onClick={sync}
          className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-amber-500 text-gray-900 px-3 py-1.5 rounded-full shadow-lg cursor-pointer hover:bg-amber-400 transition-colors text-xs font-bold font-mono"
        >
          <span className={`inline-block w-2 h-2 rounded-full ${syncing ? "bg-gray-900 animate-pulse" : "bg-gray-900"}`} />
          {syncing ? "Syncing..." : `${pending} pending sync`}
        </div>
      )}
      {children}
    </>
  );
}
