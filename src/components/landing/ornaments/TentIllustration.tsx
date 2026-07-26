interface TentIllustrationProps {
  className?: string;
}

export default function TentIllustration({ className = "" }: TentIllustrationProps) {
  return (
    <svg
      viewBox="0 0 400 300"
      className={`w-full h-auto ${className}`}
      aria-hidden="true"
    >
      <ellipse cx="200" cy="268" rx="180" ry="20" fill="#A5D6A7" opacity="0.6" />

      <polygon points="40,262 70,180 100,262" fill="#2E7D32" />
      <rect x="66" y="262" width="8" height="10" fill="#5D4037" />
      <polygon points="320,265 345,195 370,265" fill="#388E3C" />
      <rect x="341" y="265" width="7" height="8" fill="#5D4037" />

      <polygon
        points="120,265 195,110 270,265"
        fill="#FBC02D"
        stroke="#3E2723"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <polygon points="195,110 195,265 165,265" fill="#F9A825" />
      <polygon
        points="195,175 175,265 215,265"
        fill="#3E2723"
      />
      <line x1="195" y1="110" x2="195" y2="92" stroke="#3E2723" strokeWidth="5" strokeLinecap="round" />
      <polygon points="195,92 222,100 195,108" fill="#FF7043" />

      <g className="anim-flicker">
        <path
          d="M305 250 C298 238 300 226 308 218 C306 228 312 230 313 224 C319 232 318 244 311 250 Z"
          fill="#FF7043"
        />
        <path
          d="M309 249 C305 242 306 234 311 229 C310 236 314 237 314 233 C318 239 316 246 312 249 Z"
          fill="#FBC02D"
        />
        <path
          d="M311 248 C309 244 310 240 312 237 C312 241 314 241 314 239 C316 243 315 246 313 248 Z"
          fill="#FFF8E1"
        />
      </g>
      <rect x="292" y="250" width="34" height="6" rx="3" fill="#8D6E63" transform="rotate(-8 309 253)" />
      <rect x="292" y="252" width="34" height="6" rx="3" fill="#6D4C41" transform="rotate(8 309 255)" />
    </svg>
  );
}
