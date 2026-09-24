/** The wordmark's glyph: a 16:9 slide with the laser-pointer dot. */
export function SlideMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 20" aria-hidden="true" focusable="false">
      <rect x="1" y="1" width="30" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="6" y="6" width="12" height="2.5" rx="1" fill="currentColor" />
      <rect x="6" y="11" width="8" height="2" rx="1" fill="currentColor" opacity="0.45" />
      <circle cx="24" cy="12" r="2.6" fill="var(--nc-accent)" />
    </svg>
  );
}
