import type { ReactNode } from "react";

interface ScoutBadgeProps {
  icon: ReactNode;
  label?: string;
  size?: number;
  colorClass?: string;
}

export default function ScoutBadge({
  icon,
  label,
  size = 64,
  colorClass = "text-emerald-600",
}: ScoutBadgeProps) {
  return (
    <div className="inline-flex flex-col items-center gap-1">
      <div
        className={`relative flex items-center justify-center ${colorClass}`}
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 64 64"
          className="absolute inset-0 w-full h-full"
          aria-hidden="true"
        >
          <circle
            cx="32"
            cy="32"
            r="30"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray="5 4"
            strokeLinecap="round"
          />
          <circle cx="32" cy="32" r="24" fill="currentColor" opacity="0.12" />
        </svg>
        <span className="relative z-10 flex items-center justify-center">
          {icon}
        </span>
      </div>
      {label && (
        <span className="text-xs font-semibold text-brown">{label}</span>
      )}
    </div>
  );
}
