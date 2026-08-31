import FloatingCard from "./FloatingCard";

// The right-hand hero visual: a pulsing gradient orb with rotating orbital
// rings, a few drifting particles, and three floating cards that echo the
// app's real features (skill parsing, career match %, personalized roadmap).
// Everything is CSS-driven (no video/gif asset, no extra deps) and is
// disabled automatically under prefers-reduced-motion via index.css.
const AICareerOrb = () => {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 380,
        aspectRatio: "1 / 1",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* soft ambient glow behind everything */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "6%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.28) 0%, transparent 68%)",
          filter: "blur(2px)",
        }}
      />

      {/* orbital rings */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "2%",
          borderRadius: "50%",
          border: "1px solid rgba(124, 58, 237, 0.22)",
          animation: "orbit-spin 22s linear infinite",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "12%",
          borderRadius: "50%",
          border: "1px dashed rgba(124, 58, 237, 0.28)",
          animation: "orbit-spin-reverse 30s linear infinite",
        }}
      />

      {/* particles drifting near the rings */}
      {[
        { top: "8%", left: "50%", delay: 0 },
        { top: "50%", left: "94%", delay: 0.8 },
        { top: "88%", left: "46%", delay: 1.6 },
        { top: "46%", left: "4%", delay: 2.4 },
      ].map((p, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            position: "absolute",
            top: p.top,
            left: p.left,
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--color-accent-light)",
            animation: `particle-drift 3.4s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}

      {/* central orb */}
      <div
        style={{
          position: "relative",
          width: "44%",
          height: "44%",
          borderRadius: "50%",
          background: "var(--color-gradient-vivid)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 60px rgba(124, 58, 237, 0.45)",
          animation: "orb-pulse 4.5s ease-in-out infinite",
        }}
      >
        <svg width="34%" height="34%" viewBox="0 0 24 24" fill="white" style={{ opacity: 0.95 }}>
          <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" />
        </svg>
      </div>

      <FloatingCard
        icon="🧠"
        title="Skills"
        subtitle="Analyzed"
        delay={0}
        duration={4.2}
        style={{ top: "6%", left: "-6%" }}
      />
      <FloatingCard
        icon="🎯"
        title="Career Match"
        subtitle="94% compatible"
        delay={0.6}
        duration={4.6}
        style={{ top: "18%", right: "-14%" }}
      />
      <FloatingCard
        icon="📚"
        title="Learning Path"
        subtitle="Personalized"
        delay={1.2}
        duration={4}
        style={{ bottom: "4%", left: "-4%" }}
      />
    </div>
  );
};

export default AICareerOrb;
