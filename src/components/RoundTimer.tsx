import { useState, useEffect } from "react";
import { timeAgoMinutes } from "../utils/format";
import type { RoundData } from "../hooks/useLotteryProgram";

interface RoundTimerProps {
  round: RoundData;
}

export default function RoundTimer({ round }: RoundTimerProps) {
  const [timeText, setTimeText] = useState("");

  useEffect(() => {
    const update = () => {
      if (round.startedAt && round.startedAt > 0) {
        setTimeText(timeAgoMinutes(round.startedAt));
      } else {
        setTimeText("Active");
      }
    };

    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [round.startedAt]);

  const statusColors = {
    Open: {
      text: "#10b981",
      bg: "rgba(16, 185, 129, 0.15)",
      border: "rgba(16, 185, 129, 0.3)",
      dot: "#10b981",
    },
    Full: {
      text: "#f59e0b",
      bg: "rgba(245, 158, 11, 0.15)",
      border: "rgba(245, 158, 11, 0.3)",
      dot: "#f59e0b",
    },
    Settled: {
      text: "#7C3AED",
      bg: "rgba(124, 58, 237, 0.15)",
      border: "rgba(124, 58, 237, 0.3)",
      dot: "#7C3AED",
    },
  };

  const colors = statusColors[round.status];
  const filledPercent = (round.slotsFilled / round.slots) * 100;

  return (
    <div
      className="rounded-xl p-4 sm:p-5"
      style={{
        background: "linear-gradient(135deg, #0d0d1a 0%, #0a0a15 100%)",
        border: "1px solid rgba(124, 58, 237, 0.25)",
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* Round number */}
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
            Current Round
          </div>
          <div
            className="text-3xl font-bold"
            style={{
              fontFamily: "var(--font-family)",
              background: "linear-gradient(135deg, #FFD700, #FFA500)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 6px rgba(255, 215, 0, 0.5))",
            }}
          >
            #{round.roundNumber}
          </div>
        </div>

        {/* Status badge */}
        <div className="flex flex-col items-end gap-1">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
            style={{
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              color: colors.text,
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: colors.dot,
                boxShadow: `0 0 6px ${colors.dot}`,
                animation:
                  round.status === "Open"
                    ? "pulse 2s ease-in-out infinite"
                    : "none",
              }}
            />
            {round.status === "Open"
              ? "LIVE"
              : round.status === "Full"
                ? "DRAWING SOON"
                : "SETTLED"}
          </div>
          {timeText && <div className="text-xs text-slate-500">{timeText}</div>}
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs mb-2">
          <span
            className="text-slate-500 tracking-widest uppercase"
            style={{ fontFamily: "var(--font-family)" }}
          >
            Slots Filled
          </span>
          <span
            className="font-bold tracking-widest"
            style={{
              fontFamily: "var(--font-family)",
              color: round.slotsFilled === round.slots ? "#f59e0b" : "#a78bfa",
            }}
          >
            {round.slotsFilled}
            <span className="text-slate-600 mx-1">/</span>
            {round.slots}
          </span>
        </div>

        {/* Main bar */}
        <div
          className="relative h-3 overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {/* Filled portion */}
          <div
            className="absolute inset-y-0 left-0 transition-all duration-700"
            style={{
              width: `${filledPercent}%`,
              background:
                round.slotsFilled === round.slots
                  ? "linear-gradient(90deg, #b45309, #f59e0b, #FFD700)"
                  : "linear-gradient(90deg, #4c1d95, #7C3AED, #a78bfa)",
              boxShadow:
                round.slotsFilled === round.slots
                  ? "0 0 12px rgba(245,158,11,0.6), 0 0 4px rgba(255,215,0,0.8)"
                  : "0 0 12px rgba(124,58,237,0.6), 0 0 4px rgba(167,139,250,0.5)",
            }}
          />
          {/* Shimmer sweep */}
          <div
            className="absolute inset-y-0 left-0 transition-all duration-700"
            style={{
              width: `${filledPercent}%`,
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)",
              backgroundSize: "60% 100%",
              animation: "shimmerSweep 2s linear infinite",
            }}
          />
          {/* Tick marks */}
          {Array.from({ length: round.slots - 1 }).map((_, i) => (
            <div
              key={i}
              className="absolute inset-y-0 w-px"
              style={{
                left: `${((i + 1) / round.slots) * 100}%`,
                background: "rgba(0,0,0,0.4)",
              }}
            />
          ))}
        </div>

        {/* Dot indicators */}
        <div className="flex gap-1 mt-2">
          {Array.from({ length: round.slots }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-0.5 transition-all duration-300"
              style={{
                background:
                  i < round.slotsFilled
                    ? round.slotsFilled === round.slots
                      ? "linear-gradient(90deg, #f59e0b, #FFD700)"
                      : "#7C3AED"
                    : "rgba(255,255,255,0.08)",
                boxShadow:
                  i < round.slotsFilled
                    ? `0 0 4px ${round.slotsFilled === round.slots ? "#f59e0b" : "#7C3AED"}`
                    : "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* Pool info */}
      <div
        className="mt-3 pt-3"
        style={{ borderTop: "1px solid rgba(124, 58, 237, 0.1)" }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Prize Pool</span>
          <span
            className="text-lg font-bold"
            style={{
              color: "#FFD700",
              textShadow: "0 0 8px rgba(255,215,0,0.5)",
            }}
          >
            {(Number(round.pool) / 1_000_000_000).toFixed(4)} SOL
          </span>
        </div>
        <div className="flex gap-4 mt-1.5">
          <div className="text-xs text-slate-500">
            <span className="text-yellow-500 font-medium">1st:</span>{" "}
            {((Number(round.pool) * 0.94 * 0.2) / 1_000_000_000).toFixed(3)} SOL
          </div>
          <div className="text-xs text-slate-500">
            <span className="text-slate-300 font-medium">2nd:</span>{" "}
            {((Number(round.pool) * 0.94 * 0.15) / 1_000_000_000).toFixed(3)}{" "}
            SOL
          </div>
          <div className="text-xs text-slate-500">
            <span className="text-amber-700 font-medium">3rd:</span>{" "}
            {((Number(round.pool) * 0.94 * 0.125) / 1_000_000_000).toFixed(3)}{" "}
            SOL
          </div>
        </div>
      </div>
    </div>
  );
}
