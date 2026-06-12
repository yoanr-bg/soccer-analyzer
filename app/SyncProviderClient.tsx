"use client";
import SyncProvider from "./components/SyncProvider";

export default function SyncProviderClient({ children }: { children: React.ReactNode }) {
  return <SyncProvider>{children}</SyncProvider>;
}
