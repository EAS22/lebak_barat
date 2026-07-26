import { useId } from "react";

interface TopoPatternProps {
  color?: string;
  className?: string;
}

export default function TopoPattern({
  color = "#2E7D32",
  className = "",
}: TopoPatternProps) {
  const patternId = useId();
  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ opacity: 0.06 }}
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={patternId}
          width="240"
          height="240"
          patternUnits="userSpaceOnUse"
        >
          <g fill="none" stroke={color} strokeWidth="1.5">
            <path d="M20 60 C50 30 100 35 120 60 C140 85 110 110 80 105 C50 100 0 90 20 60 Z" />
            <path d="M35 62 C55 42 95 46 110 62 C125 78 105 96 82 92 C60 88 22 80 35 62 Z" />
            <path d="M50 63 C62 52 90 55 98 64 C106 74 96 84 82 81 C68 78 42 71 50 63 Z" />
            <path d="M160 170 C185 145 225 150 235 175 C245 200 215 220 190 212 C165 205 138 192 160 170 Z" />
            <path d="M172 172 C190 154 218 158 226 176 C234 194 212 206 194 200 C176 195 158 186 172 172 Z" />
            <path d="M184 175 C194 165 210 168 215 178 C220 188 208 194 198 191 C188 188 176 183 184 175 Z" />
            <path d="M-20 190 C10 165 50 175 55 195 C60 220 20 235 0 225" />
            <path d="M190 20 C215 5 245 15 250 35" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
