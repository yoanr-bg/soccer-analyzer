// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ProfileButtonClient from "./ProfileButtonClient";
import SyncProviderClient from "./SyncProviderClient";  



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Pitch-Perfect",
  description: "Track your football match stats and performance",
  manifest: "/manifest.json",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        
        {/* 🟦 NAVBAR */}
        <nav className="w-full p-4 flex justify-end fixed top-0 right-0 z-50">
          <ProfileButton />
        </nav>

        <SyncProviderClient>
          <div className="pt-16">
            {children}
          </div>
        </SyncProviderClient>
      </body>
    </html>
  );
}

/* 🟩 Profile button component */
function ProfileButton() {
  // Client Component Needed
  return (
    <div suppressHydrationWarning>
      <ProfileButtonClient />
    </div>
  );
}
