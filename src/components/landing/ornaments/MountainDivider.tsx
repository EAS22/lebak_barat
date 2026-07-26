interface MountainDividerProps {
  className?: string;
  colors?: [string, string, string];
  flip?: boolean;
}

export default function MountainDivider({
  className = "",
  colors = ["#A5D6A7", "#66BB6A", "#2E7D32"],
  flip = false,
}: MountainDividerProps) {
  return (
    <svg
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      className={`block w-full h-16 md:h-24 ${className}`}
      style={flip ? { transform: "scaleY(-1)" } : undefined}
      aria-hidden="true"
    >
      <path
        d="M0 120 L0 70 L180 30 L340 80 L520 20 L700 75 L900 25 L1100 70 L1280 35 L1440 65 L1440 120 Z"
        fill={colors[0]}
      />
      <path
        d="M0 120 L0 90 L220 50 L420 95 L620 45 L820 90 L1020 50 L1220 85 L1440 55 L1440 120 Z"
        fill={colors[1]}
      />
      <path
        d="M0 120 L0 105 L260 75 L480 110 L720 70 L960 105 L1180 78 L1440 100 L1440 120 Z"
        fill={colors[2]}
      />
    </svg>
  );
}
