interface PineDividerProps {
  className?: string;
  color?: string;
  flip?: boolean;
}

const HEIGHTS = [42, 60, 50, 70, 45, 65, 55, 75, 48, 62, 52, 68, 44, 58, 66, 46, 72, 54, 64, 50];

export default function PineDivider({
  className = "",
  color = "#2E7D32",
  flip = false,
}: PineDividerProps) {
  const spacing = 1440 / HEIGHTS.length;
  return (
    <svg
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      className={`block w-full h-10 md:h-16 ${className}`}
      style={flip ? { transform: "scaleY(-1)" } : undefined}
      aria-hidden="true"
    >
      <rect x="0" y="72" width="1440" height="8" fill={color} />
      {HEIGHTS.map((h, i) => {
        const cx = spacing * i + spacing / 2;
        const half = spacing * 0.55;
        return (
          <polygon
            key={i}
            points={`${cx - half},80 ${cx},${80 - h} ${cx + half},80`}
            fill={color}
          />
        );
      })}
    </svg>
  );
}
