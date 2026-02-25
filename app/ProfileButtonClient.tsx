"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfileButtonClient() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user") || "null");
    if (stored) setUser(stored);
  }, []);

  const avatarUrl = user?.image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "?")}&background=0f766e&color=fff&size=128`;

  return (
    <button
      onClick={() => router.push("/profile")}
      className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow cursor-pointer hover:scale-105 transition"
    >
      <img src={avatarUrl} className="w-full h-full object-cover" />
    </button>
  );
}