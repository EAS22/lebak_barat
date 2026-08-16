function Star({ x, y, size = 3, twinkle = false, delay = 0 }: { x: number; y: number; size?: number; twinkle?: boolean; delay?: number }) {
  return (
    <div
      className={`absolute rounded-full bg-amber-100 ${twinkle ? "anim-twinkle" : ""}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        boxShadow: twinkle ? `0 0 ${size * 2}px #fde68a, 0 0 ${size * 4}px #fbbf24` : undefined,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

export default function MoonStars() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute top-8 right-6 md:right-20 w-16 h-16 md:w-24 md:h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(253,230,138,0.5)]">
          <defs>
            <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef9c3" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#fde68a" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="48" fill="url(#moonGlow)" />
          <path
            d="M 62 18 A 36 36 0 1 0 62 82 A 28 28 0 1 1 62 18"
            fill="#fef9c3"
          />
          <circle cx="42" cy="38" r="6" fill="#e7c87a" opacity="0.4" />
          <circle cx="52" cy="52" r="4" fill="#e7c87a" opacity="0.35" />
          <circle cx="38" cy="58" r="3" fill="#e7c87a" opacity="0.3" />
        </svg>
      </div>

      <Star x={18} y={8} size={3} twinkle delay={0} />
      <Star x={42} y={16} size={2} twinkle delay={0.8} />
      <Star x={72} y={10} size={2.5} twinkle delay={1.5} />
      <Star x={28} y={28} size={1.5} />
      <Star x={55} y={6} size={2} twinkle delay={0.4} />
      <Star x={80} y={22} size={2} twinkle delay={2.1} />
      <Star x={8} y={18} size={1.5} twinkle delay={1.2} />
      <Star x={62} y={30} size={1.5} />
      <Star x={88} y={14} size={2} />
      <Star x={35} y={5} size={1.2} twinkle delay={0.6} />
      <Star x={50} y={34} size={1} />
      <Star x={92} y={32} size={1.5} twinkle delay={1.8} />

      <div
        className="absolute left-0 anim-drift"
        style={{ top: "12%", animationDuration: "70s", width: "100%", opacity: 0.25 }}
      >
        <div className="w-20 h-6 rounded-full bg-slate-700/40 blur-sm" />
      </div>
      <div
        className="absolute left-0 anim-drift"
        style={{ top: "26%", animationDuration: "100s", animationDelay: "-40s", width: "100%", opacity: 0.18 }}
      >
        <div className="w-16 h-4 rounded-full bg-slate-600/30 blur-sm" />
      </div>
    </div>
  );
}
