function Cloud({ scale = 1 }: { scale?: number }) {
  return (
    <svg
      width={120 * scale}
      height={48 * scale}
      viewBox="0 0 120 48"
      aria-hidden="true"
    >
      <g fill="white" fillOpacity="0.9">
        <ellipse cx="35" cy="32" rx="28" ry="14" />
        <ellipse cx="62" cy="24" rx="24" ry="16" />
        <ellipse cx="88" cy="33" rx="26" ry="12" />
      </g>
    </svg>
  );
}

export default function CloudsSun() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute top-10 right-8 md:right-20 w-24 h-24 md:w-32 md:h-32">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <g className="anim-spin-slow" style={{ transformOrigin: "50% 50%" }}>
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30 * Math.PI) / 180;
              const x1 = 50 + Math.cos(angle) * 34;
              const y1 = 50 + Math.sin(angle) * 34;
              const x2 = 50 + Math.cos(angle) * 44;
              const y2 = 50 + Math.sin(angle) * 44;
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#FBC02D"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              );
            })}
          </g>
          <circle cx="50" cy="50" r="26" fill="#FBC02D" />
          <circle cx="50" cy="50" r="26" fill="#FFF8E1" opacity="0.25" />
        </svg>
      </div>

      <div
        className="absolute left-0 anim-drift"
        style={{ top: "12%", animationDuration: "60s", width: "100%" }}
      >
        <Cloud scale={1} />
      </div>
      <div
        className="absolute left-0 anim-drift"
        style={{ top: "28%", animationDuration: "90s", animationDelay: "-30s", width: "100%" }}
      >
        <Cloud scale={0.7} />
      </div>
      <div
        className="absolute left-0 anim-drift"
        style={{ top: "6%", animationDuration: "75s", animationDelay: "-55s", width: "100%" }}
      >
        <Cloud scale={0.85} />
      </div>
    </div>
  );
}
