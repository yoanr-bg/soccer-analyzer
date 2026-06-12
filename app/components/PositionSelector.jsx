"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Target,
  Zap,
  Crosshair,
  Circle,
  Shield,
  ArrowLeftRight,
  Castle,
  ShieldHalf,
} from "lucide-react";

const mobileLayout = {
  striker:           { top: "5%",   left: "44.5%" },
  right_winger:      { top: "17%",  left: "80%" },
  left_winger:       { top: "17%",  left: "2%" },
  attacking_mid:     { top: "25%",  left: "34.5%" },
  central_mid:       { top: "45%",  left: "15%" },
  defensive_mid:     { top: "45%",  left: "55%" },
  left_back:         { top: "63%",  left: "5%" },
  right_back:        { top: "63%",  left: "77%" },
  left_center_back:  { top: "75%",  left: "20%" },
  right_center_back: { top: "75%",  left: "55%" },
  goalkeeper:        { top: "87%",  left: "42.3%" },
};

const desktopLayout = {
  striker:           { top: "5%",   left: "45%" },
  right_winger:      { top: "20%",  left: "86%" },
  left_winger:       { top: "20%",  left: "2%" },
  attacking_mid:     { top: "30%",  left: "40%" },
  central_mid:       { top: "47%",  left: "20%" },
  defensive_mid:     { top: "47%",  left: "60%" },
  left_back:         { top: "66.5%", left: "5%" },
  right_back:        { top: "66.5%", left: "84%" },
  left_center_back:  { top: "78%",  left: "26%" },
  right_center_back: { top: "78%",  left: "56%" },
  goalkeeper:        { top: "90%",  left: "45.5%" },
};

const positions = [
  { id: "striker",           name: "Striker",              icon: Target,         color: "#ef4444", glow: "rgba(239,68,68,0.6)" },
  { id: "right_winger",      name: "Right Winger",         icon: Zap,            color: "#f59e0b", glow: "rgba(245,158,11,0.6)" },
  { id: "left_winger",       name: "Left Winger",          icon: Zap,            color: "#f59e0b", glow: "rgba(245,158,11,0.6)" },
  { id: "attacking_mid",     name: "Attacking Midfielder", icon: Crosshair,      color: "#a855f7", glow: "rgba(168,85,247,0.6)" },
  { id: "central_mid",       name: "Central Midfielder",   icon: Circle,         color: "#3b82f6", glow: "rgba(59,130,246,0.6)" },
  { id: "defensive_mid",     name: "Defensive Midfielder", icon: Shield,         color: "#64748b", glow: "rgba(100,116,139,0.6)" },
  { id: "left_back",         name: "Left Back",            icon: ArrowLeftRight, color: "#10b981", glow: "rgba(16,185,129,0.6)" },
  { id: "right_back",        name: "Right Back",           icon: ArrowLeftRight, color: "#10b981", glow: "rgba(16,185,129,0.6)" },
  { id: "left_center_back",  name: "Left Center Back",     icon: Castle,     color: "#6366f1", glow: "rgba(99,102,241,0.6)" },
  { id: "right_center_back", name: "Right Center Back",    icon: Castle,         color: "#6366f1", glow: "rgba(99,102,241,0.6)" },
  { id: "goalkeeper",        name: "Goalkeeper",           icon: Shield,         color: "#22c55e", glow: "rgba(34,197,94,0.6)" },
];

function PitchStripes() {
  return (
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      {Array.from({ length: 10 }).map((_, i) => (
        <rect
          key={i}
          x={`${i * 10}%`} y="0"
          width="10%" height="100%"
          fill={i % 2 === 0 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.0)"}
        />
      ))}
    </svg>
  );
}

function useMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isMobile;
}

export default function PositionSelector({ onSelect }) {
  const isMobile = useMobile();
  const formationLayout = isMobile ? mobileLayout : desktopLayout;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: "#111827" }}
    >
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 text-center"
      >
        <h1
          className="text-5xl font-black uppercase tracking-[0.2em] mb-1"
          style={{
            fontFamily: "'Arial Black', sans-serif",
            background: "linear-gradient(90deg, #2dd4bf, #34d399, #2dd4bf)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 20px rgba(45,212,191,0.4))",
          }}
        >
          Select Position
        </h1>
        <p className="text-gray-500 text-sm uppercase tracking-widest font-mono">
          tap your position on the pitch
        </p>
      </motion.div>

      {/* Pitch */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`relative w-full max-w-3xl ${isMobile ? "overflow-hidden" : ""}`}
        style={{ aspectRatio: "4/5", ...(isMobile ? { containerType: "inline-size" } : {}) }}
      >
        {/* Outer glow border */}
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            boxShadow: "0 0 60px rgba(45,212,191,0.15), 0 0 120px rgba(45,212,191,0.05), inset 0 0 60px rgba(0,0,0,0.4)",
            border: "2px solid rgba(45,212,191,0.4)",
            borderRadius: 12,
            zIndex: 10,
          }}
        />

        {/* Pitch surface */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{ background: "linear-gradient(180deg, #1a4a1a 0%, #1e5c1e 40%, #1a4a1a 100%)" }}
        >
          <PitchStripes />

          {/* Field markings SVG */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 125" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="62.5" x2="100" y2="62.5" stroke="rgba(255,255,255,0.18)" strokeWidth="0.5"/>
            <circle cx="50" cy="62.5" r="10" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.5"/>
            <circle cx="50" cy="62.5" r="0.8" fill="rgba(255,255,255,0.3)"/>
            <rect x="22" y="0" width="56" height="16" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.5"/>
            <rect x="35" y="0" width="30" height="7" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.5"/>
            <circle cx="50" cy="11" r="0.8" fill="rgba(255,255,255,0.3)"/>
            <path d="M 40 16 A 12 12 0 0 0 60 16" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.5"/>
            <rect x="22" y="109" width="56" height="16" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.5"/>
            <rect x="35" y="118" width="30" height="7" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.5"/>
            <circle cx="50" cy="114" r="0.8" fill="rgba(255,255,255,0.3)"/>
            <path d="M 40 109 A 12 12 0 0 1 60 109" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.5"/>
            <path d="M 0 2.5 A 2.5 2.5 0 0 1 2.5 0" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.5"/>
            <path d="M 97.5 0 A 2.5 2.5 0 0 1 100 2.5" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.5"/>
            <path d="M 0 122.5 A 2.5 2.5 0 0 0 2.5 125" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.5"/>
            <path d="M 97.5 125 A 2.5 2.5 0 0 0 100 122.5" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.5"/>
          </svg>
        </div>

        {/* Position buttons
            Key fix: the outer div handles the absolute positioning + translate centering.
            The motion.button inside handles scale/hover — keeping them separate prevents
            Framer Motion from overriding the translate and breaking centering. */}
        {positions.map((pos, index) => {
          const Icon = pos.icon;
          const layout = formationLayout[pos.id];

          return (
            <div
              key={pos.id}
              className="absolute z-20"
              style={{
                top: layout.top,
                left: layout.left,
                width: 0,
                height: 0,
              }}
            >
              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 20 }}
                whileHover={{ scale: 1.2, filter: `drop-shadow(0 0 12px ${pos.glow})` }}
                whileTap={{ scale: 0.92 }}
                onClick={() => onSelect(pos)}
                className="flex flex-col items-center cursor-pointer"
                style={{ transform: "translate(-50%, -50%)" }}
              >
                {/* Circle */}
                <div
                  style={{
                    width: "min(58px, 10cqi)",
                    height: "min(58px, 10cqi)",
                    borderRadius: "50%",
                    background: `radial-gradient(circle at 35% 35%, ${pos.color}dd, ${pos.color}88)`,
                    border: `2px solid ${pos.color}99`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 0 12px ${pos.glow}, 0 4px 16px rgba(0,0,0,0.5)`,
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <Icon style={{ color: "white", width: "min(22px, 4.5cqi)", height: "min(22px, 4.5cqi)", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))" }} />
                </div>

                {/* Label */}
                <span
                  className="text-white font-bold tracking-wide whitespace-nowrap mt-1 text-center"
                  style={{
                    fontFamily: "monospace",
                    fontSize: "min(0.75rem, 2.5cqi)",
                    textShadow: `0 1px 4px rgba(0,0,0,0.9), 0 0 8px ${pos.glow}`,
                  }}
                >
                  {pos.name}
                </span>
              </motion.button>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}