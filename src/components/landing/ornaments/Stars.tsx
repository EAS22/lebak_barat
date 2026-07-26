const STARS: { x: number; y: number; r: number; delay: number }[] = [
  { x: 4, y: 12, r: 1.5, delay: 0 },
  { x: 10, y: 34, r: 1, delay: 0.4 },
  { x: 15, y: 8, r: 2, delay: 1.1 },
  { x: 21, y: 26, r: 1, delay: 0.7 },
  { x: 27, y: 15, r: 1.5, delay: 1.6 },
  { x: 33, y: 40, r: 1, delay: 0.2 },
  { x: 38, y: 10, r: 1.5, delay: 1.9 },
  { x: 43, y: 30, r: 2, delay: 0.9 },
  { x: 49, y: 18, r: 1, delay: 1.3 },
  { x: 54, y: 6, r: 1.5, delay: 0.5 },
  { x: 59, y: 36, r: 1, delay: 1.7 },
  { x: 64, y: 22, r: 2, delay: 0.1 },
  { x: 70, y: 12, r: 1, delay: 1.4 },
  { x: 75, y: 32, r: 1.5, delay: 0.8 },
  { x: 80, y: 9, r: 1, delay: 2.0 },
  { x: 85, y: 27, r: 2, delay: 0.3 },
  { x: 90, y: 16, r: 1, delay: 1.2 },
  { x: 95, y: 38, r: 1.5, delay: 0.6 },
  { x: 7, y: 55, r: 1, delay: 1.8 },
  { x: 24, y: 60, r: 1.5, delay: 0.35 },
  { x: 46, y: 52, r: 1, delay: 1.05 },
  { x: 68, y: 58, r: 1.5, delay: 1.55 },
  { x: 88, y: 50, r: 1, delay: 0.25 },
  { x: 97, y: 62, r: 1.5, delay: 1.0 },
];

export default function Stars() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    >
      {STARS.map((s, i) => (
        <circle
          key={i}
          cx={`${s.x}%`}
          cy={`${s.y}%`}
          r={s.r}
          fill="#FFF8E1"
          className="anim-twinkle"
          style={{ animationDelay: `${s.delay}s` }}
        />
      ))}
    </svg>
  );
}
