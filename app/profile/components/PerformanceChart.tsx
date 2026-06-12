"use client";

function getRatingColor(rating: number): string {
  if (rating < 6) return "#DC0C00";
  if (rating < 6.5) return "#ED7E07";
  if (rating < 7) return "#E4CE6F";
  if (rating < 8) return "#00C424";
  if (rating < 9) return "#00ADC4";
  return "#374DF5";
}

export default function PerformanceChart({
  data,
}: {
  data: { label: string; rating: number }[];
}) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
        No data to display
      </div>
    );
  }

  const w = 600;
  const h = 200;
  const pad = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;

  const minR = 3;
  const maxR = 10;
  const range = maxR - minR;

  const xScale = (i: number) => pad.left + (i / Math.max(data.length - 1, 1)) * chartW;
  const yScale = (v: number) => pad.top + chartH - ((v - minR) / range) * chartH;

  const points = data.map((d, i) => `${xScale(i)},${yScale(d.rating)}`).join(" ");

  const yTicks = [3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto max-h-56" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(45,212,191,0.3)" />
          <stop offset="100%" stopColor="rgba(45,212,191,0.02)" />
        </linearGradient>
      </defs>

      {yTicks.map((v) => (
        <g key={v}>
          <line
            x1={pad.left}
            y1={yScale(v)}
            x2={w - pad.right}
            y2={yScale(v)}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
          <text
            x={pad.left - 6}
            y={yScale(v) + 4}
            textAnchor="end"
            fill="rgba(255,255,255,0.4)"
            fontSize="10"
            fontFamily="monospace"
          >
            {v.toFixed(1)}
          </text>
        </g>
      ))}

      <polyline
        points={points}
        fill="none"
        stroke="#2dd4bf"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {data.map((d, i) => (
        <circle
          key={i}
          cx={xScale(i)}
          cy={yScale(d.rating)}
          r="3"
          fill={getRatingColor(d.rating)}
          stroke="#111827"
          strokeWidth="1.5"
        />
      ))}

      {data.length <= 15 &&
        data.map((d, i) => (
          <text
            key={i}
            x={xScale(i)}
            y={h - 4}
            textAnchor="middle"
            fill="rgba(255,255,255,0.3)"
            fontSize="8"
            fontFamily="monospace"
          >
            {d.label}
          </text>
        ))}
    </svg>
  );
}
