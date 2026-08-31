import { useId } from "react";

// The visual signature of the app: a circular progress ring showing a
// career match percentage. Reused on the results page, career detail page,
// dashboard, and comparison page so it becomes a recognizable motif —
// the one place this app spends its visual "boldness."
const TIER = (percent) => {
  if (percent >= 80) return { color: "var(--color-match-high)", glow: "rgba(16, 185, 129, 0.22)" };
  if (percent >= 50) return { color: "var(--color-match-mid)", glow: "rgba(124, 58, 237, 0.22)" };
  return { color: "var(--color-match-low)", glow: "rgba(245, 158, 11, 0.22)" };
};

const MatchCircle = ({ percent, size = 96, strokeWidth = 8, label }) => {
  const gradientId = useId();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const { color, glow } = TIER(percent);

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          animation: "match-circle-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}
      >
        {/* Soft radial glow behind the ring, color-matched to the match tier */}
        <div
          style={{
            position: "absolute",
            inset: -size * 0.18,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
            zIndex: 0,
          }}
          aria-hidden="true"
        />
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={`${percent}% match`}
          style={{ position: "relative", zIndex: 1 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.75" />
              <stop offset="100%" stopColor={color} stopOpacity="1" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(0.16, 1, 0.3, 1)" }}
          />
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="var(--font-mono)"
            fontWeight="600"
            fontSize={size * 0.22}
            fill="var(--color-text)"
          >
            {percent}%
          </text>
        </svg>
      </div>
      {label && (
        <span style={{ fontSize: 13, color: "var(--color-text-muted)", fontWeight: 500, textAlign: "center" }}>
          {label}
        </span>
      )}
    </div>
  );
};

export default MatchCircle;
