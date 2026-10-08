// The ResolveAI mark and wordmark. `inverted` is for ink backgrounds.
export function Logo({ inverted = false }: { inverted?: boolean }) {
  const ink = inverted ? "var(--color-on-ink)" : "var(--color-ink)";
  const glyph = inverted ? "var(--color-ink)" : "var(--color-on-ink)";
  return (
    <span className="flex items-center gap-2.5">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        {/* Same proportions as the favicon: corner radius 27% and a glyph
            at 57% of the tile, centred. */}
        <rect width="24" height="24" rx="6.4" fill={ink} />
        <svg
          x="5.14"
          y="5.14"
          width="13.72"
          height="13.72"
          viewBox="0 0 24 24"
          stroke={glyph}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m8 11 2 2 4-4" />
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </svg>
      <span className="text-[17px] font-semibold tracking-[-0.02em]" style={{ color: ink }}>
        ResolveAI
      </span>
    </span>
  );
}
