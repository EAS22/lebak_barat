interface CampfireFlameProps {
  size?: number;
  className?: string;
}

export default function CampfireFlame({ size = 48, className = "" }: CampfireFlameProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
    >
      <g className="anim-flicker">
        <path
          d="M32 46 C20 38 22 24 32 10 C31 22 39 24 40 16 C48 26 46 40 32 46 Z"
          fill="#FF7043"
        />
        <path
          d="M32 45 C25 40 26 30 32 21 C31 29 37 30 37 25 C42 32 40 41 32 45 Z"
          fill="#FBC02D"
        />
        <path
          d="M32 44 C28 41 29 36 32 31 C32 35 35 36 35 33 C37 37 36 42 32 44 Z"
          fill="#FFF8E1"
        />
      </g>
      <rect x="12" y="46" width="40" height="7" rx="3.5" fill="#8D6E63" transform="rotate(-10 32 49.5)" />
      <rect x="12" y="48" width="40" height="7" rx="3.5" fill="#6D4C41" transform="rotate(10 32 51.5)" />
    </svg>
  );
}
