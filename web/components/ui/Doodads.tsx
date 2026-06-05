// Decorative ink doodads for the maximalist look. Purely ornamental (aria-hidden).

export function Star({ className = "", fill = "#F7E6A0" }: { className?: string; fill?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} width="1em" height="1em">
      <path
        d="M12 1l3 7 7 .5-5.5 4.5 2 7-6.5-4-6.5 4 2-7L2 8.5 9 8z"
        fill={fill}
        stroke="#3B322C"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Sparkle({
  className = "",
  fill = "#F6AE96",
}: { className?: string; fill?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} width="1em" height="1em">
      <path
        d="M12 2c1 5 4 8 9 9-5 1-8 4-9 9-1-5-4-8-9-9 5-1 8-4 9-9z"
        fill={fill}
        stroke="#3B322C"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Squiggle({
  className = "",
  stroke = "#3B322C",
}: { className?: string; stroke?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 80 16" className={className} width="80" height="16">
      <path
        d="M2 8c6-8 12 8 18 0s12-8 18 0 12 8 18 0 12-8 18 0"
        fill="none"
        stroke={stroke}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Burst({ className = "", fill = "#C2E6CD" }: { className?: string; fill?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className={className} width="1em" height="1em">
      <path
        d="M24 2l4 8 8-5-2 9 9 1-7 6 7 6-9 1 2 9-8-5-4 8-4-8-8 5 2-9-9-1 7-6-7-6 9-1-2-9 8 5z"
        fill={fill}
        stroke="#3B322C"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
