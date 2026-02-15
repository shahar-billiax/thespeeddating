/* ------------------------------------------------------------------ */
/*  SVG flag components — 4:3 aspect ratio (viewBox 60x45)            */
/* ------------------------------------------------------------------ */

export function FlagGB({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 45"
      className={className}
      role="img"
      aria-label="UK flag"
    >
      <clipPath id="gb-clip">
        <rect width="60" height="45" rx="3" />
      </clipPath>
      <g clipPath="url(#gb-clip)">
        <rect width="60" height="45" fill="#012169" />
        <path d="M0,0 L60,45 M60,0 L0,45" stroke="#fff" strokeWidth="9" />
        <path d="M0,0 L60,45 M60,0 L0,45" stroke="#C8102E" strokeWidth="3" />
        <path d="M30,0 V45 M0,22.5 H60" stroke="#fff" strokeWidth="15" />
        <path d="M30,0 V45 M0,22.5 H60" stroke="#C8102E" strokeWidth="9" />
      </g>
    </svg>
  );
}

export function FlagIL({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 45"
      className={className}
      role="img"
      aria-label="Israel flag"
    >
      <clipPath id="il-clip">
        <rect width="60" height="45" rx="3" />
      </clipPath>
      <g clipPath="url(#il-clip)">
        <rect width="60" height="45" fill="#fff" />
        <rect y="5" width="60" height="7" fill="#0038b8" />
        <rect y="33" width="60" height="7" fill="#0038b8" />
        <g
          fill="none"
          stroke="#0038b8"
          strokeWidth="1.6"
          transform="translate(30,22.5)"
        >
          <polygon points="0,-10 8.66,5 -8.66,5" />
          <polygon points="0,10 8.66,-5 -8.66,-5" />
        </g>
      </g>
    </svg>
  );
}

const FLAG_COMPONENTS: Record<string, React.FC<{ className?: string }>> = {
  gb: FlagGB,
  il: FlagIL,
};

export function CountryFlag({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  const Flag = FLAG_COMPONENTS[code];
  if (!Flag) return null;
  return <Flag className={className} />;
}
