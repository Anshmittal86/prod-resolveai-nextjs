// The ResolveAI mark and wordmark. `inverted` is for ink backgrounds.
export function Logo({ inverted = false }: { inverted?: boolean }) {
  const ink = inverted ? "var(--color-on-ink)" : "var(--color-ink)";
  return (
    <span className="flex items-center gap-2.5">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="1" y="1" width="22" height="22" rx="5" fill={ink} />
        <path d="M7 12.4 10.4 15.6 17.2 8.4" stroke="var(--color-accent)" strokeWidth="2.4" />
      </svg>
      <span className="text-[17px] font-semibold tracking-[-0.02em]" style={{ color: ink }}>
        ResolveAI
      </span>
    </span>
  );
}
