"use client";

import { useMemo } from "react";

const VW = 1400;
const VH = 280;
const FRAME = 52;        // border width — bulbs sit at FRAME/2 = 26
const BR = 8;            // bulb radius
const BS = 28;           // bulb spacing

function seed(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

interface Bulb { x: number; y: number; k: number }

function row(y: number, xStart: number, xEnd: number, kStart: number): Bulb[] {
  const out: Bulb[] = [];
  for (let x = xStart; x <= xEnd; x += BS)
    out.push({ x, y, k: kStart + out.length });
  return out;
}

function col(x: number, yStart: number, yEnd: number, kStart: number): Bulb[] {
  const out: Bulb[] = [];
  for (let y = yStart; y <= yEnd; y += BS)
    out.push({ x, y, k: kStart + out.length });
  return out;
}

const MID  = FRAME / 2;          // 26 — center of border
const XMIN = MID, XMAX = VW - MID;
const YMIN = MID, YMAX = VH - MID;

export function MarqueeBanner() {
  const bulbs = useMemo<Bulb[]>(() => {
    // Single row, centered in the border on all four sides.
    // Columns start/end one step inside the corners so rows handle them.
    const top   = row(YMIN, XMIN, XMAX, 0);
    const bot   = row(YMAX, XMIN, XMAX, top.length);
    const n0    = top.length + bot.length;
    const left  = col(XMIN, YMIN + BS, YMAX - BS, n0);
    const right = col(XMAX, YMIN + BS, YMAX - BS, n0 + left.length);
    return [...top, ...bot, ...left, ...right];
  }, []);

  const ix = FRAME, iy = FRAME;
  const iw = VW - FRAME * 2, ih = VH - FRAME * 2;

  return (
    <>
      <style>{`
        @keyframes twinkle {
          from { fill: #fff0a0; }
          to   { fill: #7a4808; }
        }
      `}</style>
      <div
        style={{
          padding: "32px 0",
          filter: "drop-shadow(0 0 48px rgba(180,70,0,0.45)) drop-shadow(0 0 96px rgba(120,40,0,0.25))",
        }}
      >
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          width="100%"
          style={{ display: "block" }}
          aria-label="Watch Next marquee sign"
        >
          <defs>
            <pattern id="mgrid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M48 0H0V48" fill="none" stroke="rgba(140,100,40,0.12)" strokeWidth="0.8" />
            </pattern>
          </defs>

          {/* Frame — three layers for depth */}
          <rect x={0}  y={0}  width={VW}    height={VH}    rx={5} fill="#2e0800" />
          <rect x={4}  y={4}  width={VW-8}  height={VH-8}  rx={4} fill="#7a1a00" />
          <rect x={8}  y={8}  width={VW-16} height={VH-16} rx={3} fill="#a82800" />
          <rect x={12} y={12} width={VW-24} height={VH-24} rx={2} fill="#c43800" />

          {/* Inner frame edge */}
          <rect x={ix-4} y={iy-4} width={iw+8} height={ih+8} rx={2} fill="#d84000" />

          {/* Cream interior */}
          <rect x={ix} y={iy} width={iw} height={ih} fill="#f0e6c0" />
          <rect x={ix} y={iy} width={iw} height={ih} fill="url(#mgrid)" />

          {/* Text */}
          <text
            x={VW / 2}
            y={VH / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontFamily: "var(--font-display), serif", fontSize: 92 }}
            fill="#1a0800"
            letterSpacing={6}
          >
            WATCH NEXT
          </text>

          {/* Sockets */}
          {bulbs.map((b) => (
            <circle key={`s${b.k}`} cx={b.x} cy={b.y} r={BR + 3} fill="#1e0600" />
          ))}

          {/* Bulbs — twinkle bright amber ↔ dark amber at original speed */}
          {bulbs.map((b) => {
            const delay = seed(b.k * 7.3) * 3;
            const dur   = 0.6 + seed(b.k * 3.1 + 99) * 1.1;
            return (
              <circle
                key={`b${b.k}`}
                cx={b.x}
                cy={b.y}
                r={BR}
                fill="#fff0a0"
                style={{
                  animationName: "twinkle",
                  animationDuration: `${dur}s`,
                  animationDelay: `${delay}s`,
                  animationTimingFunction: "ease-in-out",
                  animationIterationCount: "infinite",
                  animationDirection: "alternate",
                }}
                suppressHydrationWarning
              />
            );
          })}
        </svg>
      </div>
    </>
  );
}
