/** The one-color outline pint (docs/design/mark-mono.svg). Takes the text color; decorative. */
export default function MarkMono({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <path
        d="M31 32 H69 L64 86 Q64 91 59 91 H41 Q36 91 36 86 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path
        d="M31 32 a7 7 0 0 1 8-10 a10 10 0 0 1 22 0 a7 7 0 0 1 8 10"
        fill="none"
        stroke="currentColor"
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {[35, 40, 45, 50, 55, 60].map((x, i) => (
        <rect
          key={x}
          x={x}
          y={i % 2 ? 57 : 52}
          width={5}
          height={5}
          fill="currentColor"
        />
      ))}
    </svg>
  );
}
