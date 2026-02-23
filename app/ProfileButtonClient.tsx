"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfileButtonClient() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user?.image) setImage(user.image);
  }, []);

  return (
    <button
      onClick={() => router.push("/profile")}
      className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow cursor-pointer hover:scale-105 transition"
    >
      {image ? (
        <img src={image} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gray-600 rounded-full" />
      )}
    </button>
  );
}
