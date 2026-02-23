// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ProfileButtonClient from "./ProfileButtonClient";  

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pitch Perfect",
  description: "Analyzes football performance and provides ratings based on stats and video analysis.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        
        {/* 🟦 NAVBAR */}
        <nav className="w-full p-4 flex justify-end fixed top-0 right-0 z-50">
          <ProfileButton />
        </nav>

        <div className="pt-16">
          {children}
        </div>
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
