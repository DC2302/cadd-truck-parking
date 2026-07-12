"use client";

import { SPACES, MAP, STATUS_COLORS, SpaceStatus } from "@/lib/lot-map";

/**
 * Interactive recreation of the CADD lot sitemap. Renders every space
 * colored by live status; click a space to select it (admin).
 */
export default function LotMap({
  statuses,
  selected,
  onSelect,
  selectableOnly = false,
}: {
  statuses: Record<string, SpaceStatus>;
  selected?: string | string[] | null;
  onSelect?: (id: string) => void;
  /** customer mode: only available (non-RV) spaces are clickable */
  selectableOnly?: boolean;
}) {
  const selectedIds = Array.isArray(selected)
    ? selected
    : selected
      ? [selected]
      : [];
  return (
    <svg
      viewBox={MAP.viewBox}
      className="h-auto w-full select-none rounded-xl bg-white"
      role="img"
      aria-label="CADD Truck Parking lot map"
    >
      {/* road labels */}
      <text
        x={MAP.roads.top.x}
        y={MAP.roads.top.y}
        textAnchor="middle"
        fontSize="42"
        fill="#333"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {MAP.roads.top.label}
      </text>
      <text
        x={MAP.roads.right.x}
        y={MAP.roads.right.y}
        fontSize="40"
        fill="#333"
        style={{ fontFamily: "var(--font-display)" }}
        transform={`rotate(90 ${MAP.roads.right.x} ${MAP.roads.right.y})`}
      >
        {MAP.roads.right.label}
      </text>

      {/* lot boundary (gaps at the three gates) */}
      <g stroke="#222" strokeWidth="5" fill="none" strokeLinecap="square">
        <path d="M 395 265 L 135 265 L 135 1546 L 660 1546" />
        <path d="M 465 265 L 718 265 L 718 930 L 655 985 L 655 1255" />
        <path d="M 655 1340 L 690 1360 L 690 1505" />
      </g>

      {/* exit gate */}
      <text
        x={MAP.gates.exit.x}
        y={MAP.gates.exit.y}
        textAnchor="middle"
        fontSize="38"
        fill="#111"
        style={{ fontFamily: "var(--font-display)" }}
      >
        <tspan x={MAP.gates.exit.x} dy="0">EXIT</tspan>
        <tspan x={MAP.gates.exit.x} dy="44">GATE</tspan>
      </text>

      {/* east gate */}
      <rect x={627} y={1015} width={22} height={46} fill="#9aa0a8" />
      <text
        x={MAP.gates.east.x}
        y={MAP.gates.east.y}
        textAnchor="middle"
        fontSize="34"
        fill="#111"
        style={{ fontFamily: "var(--font-display)" }}
      >
        <tspan x={MAP.gates.east.x} dy="0">EAST</tspan>
        <tspan x={MAP.gates.east.x} dy="38">GATE</tspan>
      </text>
      <text x={MAP.gates.east.x} y={MAP.gates.east.y + 62} textAnchor="middle" fontSize="13" fill="#333">
        {MAP.gates.east.note}
      </text>

      {/* south gate */}
      <text
        x={MAP.gates.south.x}
        y={MAP.gates.south.y}
        textAnchor="middle"
        fontSize="34"
        fill="#111"
        style={{ fontFamily: "var(--font-display)" }}
      >
        <tspan x={MAP.gates.south.x} dy="0">SOUTH</tspan>
        <tspan x={MAP.gates.south.x} dy="38">GATE</tspan>
      </text>

      {/* tan visitor parking strips */}
      {MAP.tanStrips.map((s, i) => (
        <g key={i}>
          <rect x={s.x} y={s.y} width={s.w} height={s.h} fill="#e8dcae" stroke="#c9b97b" />
          <text
            x={s.x + s.w / 2}
            y={s.y + s.h / 2 + 5}
            textAnchor="middle"
            fontSize="15"
            fill="#5a4f2a"
          >
            {s.label}
          </text>
        </g>
      ))}

      {/* unnumbered green overflow strips */}
      {MAP.greenStrips.map((s, i) => (
        <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} fill={STATUS_COLORS.available} opacity={0.85} />
      ))}

      {/* pre-trip stations */}
      <text x={438} y={972} textAnchor="middle" fontSize="15" fill="#333">
        {MAP.pretrip.label}
      </text>
      {MAP.pretrip.squares.map((s, i) => (
        <rect key={i} x={s.x} y={s.y} width={16} height={22} fill={STATUS_COLORS.available} />
      ))}

      {/* buildings */}
      {MAP.buildings.map((b) => (
        <g key={b.label}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="#2c4468" />
          <text
            x={b.x + b.w / 2}
            y={b.y + b.h / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={b.h > 60 ? 13 : 11}
            fill="#fff"
            transform={b.h > 90 ? `rotate(-90 ${b.x + b.w / 2} ${b.y + b.h / 2})` : undefined}
          >
            {b.label}
          </text>
        </g>
      ))}

      {/* expansion area */}
      <rect
        x={MAP.expansion.x}
        y={MAP.expansion.y}
        width={MAP.expansion.w}
        height={MAP.expansion.h}
        fill="#8bc34a"
        stroke="#222"
        strokeWidth="3"
      />
      {MAP.expansion.label.map((line, i) => (
        <text
          key={line}
          x={MAP.expansion.x + MAP.expansion.w / 2}
          y={MAP.expansion.y + 55 + i * 34}
          textAnchor="middle"
          fontSize="26"
          fontWeight="700"
          fill="#111"
        >
          {line}
        </text>
      ))}

      {/* ── the spaces ── */}
      {SPACES.map((s) => {
        const status = statuses[s.id] ?? "reserved";
        const isSel = selectedIds.includes(s.id);
        const clickable =
          !!onSelect &&
          (!selectableOnly || (status === "available" && s.zone !== "rv"));
        return (
          <g
            key={s.id}
            onClick={clickable ? () => onSelect!(s.id) : undefined}
            style={clickable ? { cursor: "pointer" } : undefined}
          >
            <rect
              x={s.x}
              y={s.y}
              width={s.w}
              height={s.h}
              fill={STATUS_COLORS[status]}
              stroke={isSel ? "#111" : "#ffffff"}
              strokeWidth={isSel ? 4 : 1.5}
              rx={2}
            />
            <text
              x={s.x + s.w / 2}
              y={s.y + s.h / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={s.vertical ? 13 : 17}
              fontWeight="600"
              fill="#fff"
              transform={
                s.vertical
                  ? `rotate(-90 ${s.x + s.w / 2} ${s.y + s.h / 2})`
                  : undefined
              }
              pointerEvents="none"
            >
              {s.id}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
