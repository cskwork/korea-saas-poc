/** The product mark: a delivery line ending at a station on the maintenance loop. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="7" fill="#ffffff" />
      <path d="M6 11v10" stroke="#0052a4" strokeWidth="3" strokeLinecap="round" />
      <path d="M6 16h10" stroke="#0052a4" strokeWidth="4" />
      <circle cx="21" cy="16" r="6.5" fill="none" stroke="#00a84d" strokeWidth="3.5" />
      <circle cx="14.5" cy="16" r="3.4" fill="#ffffff" stroke="#25282d" strokeWidth="2" />
    </svg>
  );
}
