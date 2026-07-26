interface RopeBorderProps {
  className?: string;
}

const KNOTS = [60, 180, 300, 420, 540];

export default function RopeBorder({ className = "" }: RopeBorderProps) {
  return (
    <svg
      viewBox="0 0 600 24"
      preserveAspectRatio="none"
      className={`block w-full h-5 ${className}`}
      aria-hidden="true"
    >
      <path
        d="M0 10 Q 30 4 60 10 T 120 10 T 180 10 T 240 10 T 300 10 T 360 10 T 420 10 T 480 10 T 540 10 T 600 10"
        fill="none"
        stroke="#8D6E63"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M0 15 Q 30 21 60 15 T 120 15 T 180 15 T 240 15 T 300 15 T 360 15 T 420 15 T 480 15 T 540 15 T 600 15"
        fill="none"
        stroke="#8D6E63"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.7"
      />
      {KNOTS.map((x) => (
        <g key={x}>
          <circle cx={x} cy="12.5" r="5.5" fill="#8D6E63" />
          <circle cx={x} cy="12.5" r="2.5" fill="#6D4C41" />
        </g>
      ))}
    </svg>
  );
}
